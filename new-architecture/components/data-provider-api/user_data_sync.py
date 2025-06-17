"""
User Data Sync Service - Synchronizacja zmian uprawnień użytkowników z OPAL

Komponent wykorzystujący wspólny topic ale różne data-config dla powiadamiania
OPAL Server o zmianach w kontekście danego tenanta.
"""

import os
import json
import logging
import requests
import datetime
import time
from typing import Dict, Any, Optional, List
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# Import Permission Event Translator
try:
    from permission_event_translator import translate_permission_event
    TRANSLATOR_AVAILABLE = True
except ImportError:
    TRANSLATOR_AVAILABLE = False

logger = logging.getLogger(__name__)

# Konfiguracja OPAL Server URL
OPAL_SERVER_URL = os.environ.get("OPAL_SERVER_URL", "http://opal-server:7002")
DATA_PROVIDER_API_URL = os.environ.get("DATA_PROVIDER_API_URL", "http://data-provider-api:8110")

logger.info(f"🔗 User Data Sync Service configured with OPAL Server: {OPAL_SERVER_URL}")
logger.info(f"🔗 Data Provider API URL: {DATA_PROVIDER_API_URL}")

class UserDataSyncService:
    """
    Serwis do synchronizacji zmian uprawnień użytkowników z OPAL Server/Client
    z obsługą retry logic, monitoring i zaawansowanym error handlingiem
    """
    
    def __init__(self):
        self.logger = logger
        self.session = requests.Session()
        
        # Konfiguracja retry strategy zgodnie z best practices OPAL
        retry_strategy = Retry(
            total=3,  # maksymalnie 3 próby
            backoff_factor=1,  # exponential backoff: 1s, 2s, 4s
            status_forcelist=[408, 429, 500, 502, 503, 504],  # HTTP status codes do retry
            allowed_methods=["POST"]  # tylko POST requests
        )
        
        adapter = HTTPAdapter(max_retries=retry_strategy)
        self.session.mount("http://", adapter)
        self.session.mount("https://", adapter)
        
        # Timeout konfiguracja
        self.timeout = (5, 15)  # (connect_timeout, read_timeout)
        
        # Metryki dla monitoring
        self.metrics = {
            "total_notifications": 0,
            "successful_notifications": 0,
            "failed_notifications": 0,
            "last_notification_time": None,
            "last_error": None
        }
    
    def _send_opal_notification(self, data: Dict[str, Any], operation_type: str, tenant_id: str, user_id: str = None) -> bool:
        """
        Bezpieczne wysyłanie powiadomień do OPAL Server z retry logic i monitoring
        
        Args:
            data: Payload do wysłania
            operation_type: Typ operacji (user_update, role_update, permission_update, full_sync)
            tenant_id: ID tenanta
            user_id: ID użytkownika (opcjonalne)
            
        Returns:
            bool: True jeśli powiadomienie zostało wysłane pomyślnie
        """
        start_time = time.time()
        self.metrics["total_notifications"] += 1
        
        try:
            response = self.session.post(
                f"{OPAL_SERVER_URL}/data/config",
                json=data,
                timeout=self.timeout,
                headers={
                    "Content-Type": "application/json",
                    "User-Agent": "DataProviderAPI-UserDataSync/1.0"
                }
            )
            
            duration = time.time() - start_time
            
            if response.status_code == 200:
                self.metrics["successful_notifications"] += 1
                self.metrics["last_notification_time"] = datetime.datetime.utcnow()
                self.metrics["last_error"] = None
                
                user_info = f" for user {user_id}" if user_id else ""
                self.logger.info(
                    f"✅ OPAL {operation_type} notification sent successfully{user_info} "
                    f"in tenant {tenant_id} (duration: {duration:.3f}s)"
                )
                return True
            else:
                self.metrics["failed_notifications"] += 1
                error_msg = f"HTTP {response.status_code}: {response.text[:200]}"
                self.metrics["last_error"] = error_msg
                
                self.logger.warning(
                    f"⚠️ OPAL {operation_type} notification failed{user_info} "
                    f"in tenant {tenant_id}: {error_msg} (duration: {duration:.3f}s)"
                )
                return False
                
        except requests.exceptions.Timeout as e:
            duration = time.time() - start_time
            self.metrics["failed_notifications"] += 1
            error_msg = f"Timeout after {duration:.3f}s: {str(e)}"
            self.metrics["last_error"] = error_msg
            
            self.logger.error(
                f"❌ OPAL {operation_type} notification timeout{user_info} "
                f"in tenant {tenant_id}: {error_msg}"
            )
            return False
            
        except requests.exceptions.ConnectionError as e:
            duration = time.time() - start_time
            self.metrics["failed_notifications"] += 1
            error_msg = f"Connection error: {str(e)}"
            self.metrics["last_error"] = error_msg
            
            self.logger.error(
                f"❌ OPAL {operation_type} connection failed{user_info} "
                f"in tenant {tenant_id}: {error_msg}"
            )
            return False
            
        except Exception as e:
            duration = time.time() - start_time
            self.metrics["failed_notifications"] += 1
            error_msg = f"Unexpected error: {str(e)}"
            self.metrics["last_error"] = error_msg
            
            self.logger.error(
                f"❌ OPAL {operation_type} unexpected error{user_info} "
                f"in tenant {tenant_id}: {error_msg}"
            )
            return False
    
    def get_metrics(self) -> Dict[str, Any]:
        """
        Zwraca metryki synchronizacji dla monitoring
        
        Returns:
            Dict: Metryki serwisu
        """
        success_rate = 0.0
        if self.metrics["total_notifications"] > 0:
            success_rate = (self.metrics["successful_notifications"] / self.metrics["total_notifications"]) * 100
        
        return {
            **self.metrics,
            "success_rate_percent": round(success_rate, 2),
            "opal_server_url": OPAL_SERVER_URL,
            "timestamp": datetime.datetime.utcnow().isoformat()
        }
    
    def publish_user_update(self, tenant_id: str, user_id: str, action: str = "update") -> bool:
        """
        Publikuje aktualizację danych użytkownika do OPAL Server
        
        Args:
            tenant_id: ID tenanta
            user_id: ID użytkownika
            action: Typ akcji (add, update, delete)
            
        Returns:
            bool: True jeśli publikacja powiodła się
        """
        # Wspólny topic ale różne data-config dla różnych tenantów
        data = {
            "entries": [
                {
                    "url": f"{DATA_PROVIDER_API_URL}/tenants/{tenant_id}/acl",
                    "topics": ["multi_tenant_data"],  # Wspólny topic dla użytkowników/ról/uprawnień
                    "dst_path": f"/acl/{tenant_id}",  # Hierarchiczne oddzielenie tenantów
                    "config": {
                        "tenant_id": tenant_id,
                        "user_id": user_id,
                        "action": action,
                        "change_type": "user",
                        "timestamp": datetime.datetime.utcnow().isoformat()
                    }
                }
            ],
            "reason": f"User {action}: {user_id} in tenant {tenant_id}"
        }
        
        return self._send_opal_notification(data, "user_update", tenant_id, user_id)
    
    def publish_role_update(self, tenant_id: str, user_id: str, role_changes: Dict[str, Any], action: str = "update") -> bool:
        """
        Publikuje aktualizację ról użytkownika do OPAL Server
        
        Args:
            tenant_id: ID tenanta
            user_id: ID użytkownika
            role_changes: Słownik ze zmianami ról
            action: Typ akcji (add_role, remove_role, update_roles)
            
        Returns:
            bool: True jeśli publikacja powiodła się
        """
        data = {
            "entries": [
                {
                    "url": f"{DATA_PROVIDER_API_URL}/tenants/{tenant_id}/acl",
                    "topics": ["multi_tenant_data"],  # Wspólny topic dla użytkowników/ról/uprawnień
                    "dst_path": f"/acl/{tenant_id}",
                    "config": {
                        "tenant_id": tenant_id,
                        "user_id": user_id,
                        "action": action,
                        "change_type": "role",
                        "role_changes": role_changes,
                        "timestamp": datetime.datetime.utcnow().isoformat()
                    }
                }
            ],
            "reason": f"Role {action}: {user_id} in tenant {tenant_id} - {json.dumps(role_changes)}"
        }
        
        return self._send_opal_notification(data, "role_update", tenant_id, user_id)
    
    def publish_permission_update(self, tenant_id: str, user_id: str, permission_changes: Dict[str, Any], action: str = "update") -> bool:
        """
        Publikuje aktualizację uprawnień użytkownika do OPAL Server
        
        Args:
            tenant_id: ID tenanta
            user_id: ID użytkownika
            permission_changes: Słownik ze zmianami uprawnień
            action: Typ akcji (add_permission, remove_permission, update_permissions)
            
        Returns:
            bool: True jeśli publikacja powiodła się
        """
        data = {
            "entries": [
                {
                    "url": f"{DATA_PROVIDER_API_URL}/tenants/{tenant_id}/acl",
                    "topics": ["multi_tenant_data"],  # Wspólny topic dla użytkowników/ról/uprawnień
                    "dst_path": f"/acl/{tenant_id}",
                    "config": {
                        "tenant_id": tenant_id,
                        "user_id": user_id,
                        "action": action,
                        "change_type": "permission",
                        "permission_changes": permission_changes,
                        "timestamp": datetime.datetime.utcnow().isoformat()
                    }
                }
            ],
            "reason": f"Permission {action}: {user_id} in tenant {tenant_id} - {json.dumps(permission_changes)}"
        }
        
        return self._send_opal_notification(data, "permission_update", tenant_id, user_id)
    
    def sync_tenant_data(self, tenant_id: str) -> bool:
        """
        Synchronizuje wszystkie dane tenanta z OPAL (pełna synchronizacja)
        
        Args:
            tenant_id: ID tenanta
            
        Returns:
            bool: True jeśli synchronizacja powiodła się
        """
        data = {
            "entries": [
                {
                    "url": f"{DATA_PROVIDER_API_URL}/tenants/{tenant_id}/acl",
                    "topics": ["multi_tenant_full_sync"],  # Topic dla pełnej synchronizacji
                    "dst_path": f"/acl/{tenant_id}",
                    "config": {
                        "tenant_id": tenant_id,
                        "action": "full_sync",
                        "change_type": "full_sync",
                        "timestamp": datetime.datetime.utcnow().isoformat()
                    }
                }
            ],
            "reason": f"Full tenant sync: {tenant_id}"
        }
        
        return self._send_opal_notification(data, "full_sync", tenant_id)
    
    def publish_translated_permission_event(self, event_data: Dict[str, Any]) -> bool:
        """
        Publikuje przetłumaczony event uprawnień do OPAL Server używając Permission Event Translator
        
        Args:
            event_data: Dane eventu z Portal Symfonia
            
        Returns:
            bool: True jeśli publikacja powiodła się
        """
        if not TRANSLATOR_AVAILABLE:
            self.logger.warning("⚠️ Permission Event Translator not available")
            return False
        
        try:
            # Transluj event na Model 1
            model1_update = translate_permission_event(event_data)
            
            if not model1_update:
                self.logger.warning(f"⚠️ Translation failed for event: {event_data}")
                return False
            
            tenant_id = event_data.get("tenant_id")
            user_id = event_data.get("user_id")
            event_type = event_data.get("event_type")
            
            # Wysyłamy przetłumaczone dane jako incremental update
            data = {
                "entries": [
                    {
                        "url": f"{DATA_PROVIDER_API_URL}/tenants/{tenant_id}/acl/incremental",
                        "topics": ["multi_tenant_permission_events"],  # Specjalny topic dla przetłumaczonych eventów
                        "dst_path": f"/acl/{tenant_id}/incremental",
                        "config": {
                            "tenant_id": tenant_id,
                            "user_id": user_id,
                            "event_type": event_type,
                            "model1_update": model1_update,  # Przetłumaczone dane Model 1
                            "original_event": event_data,    # Zachowujemy oryginalny event dla auditingu
                            "timestamp": datetime.datetime.utcnow().isoformat()
                        }
                    }
                ],
                "reason": f"Translated permission event {event_type}: {user_id} in tenant {tenant_id}"
            }
            
            success = self._send_opal_notification(data, "translated_permission_event", tenant_id, user_id)
            
            if success:
                self.logger.info(f"✅ Translated permission event sent: {event_type} for {user_id}")
            else:
                self.logger.warning(f"⚠️ Failed to send translated permission event: {event_type} for {user_id}")
            
            return success
            
        except Exception as e:
            self.logger.error(f"❌ Error publishing translated permission event: {e}")
            return False

# Globalna instancja serwisu
user_data_sync = UserDataSyncService()

def notify_user_change(tenant_id: str, user_id: str, action: str = "update"):
    """
    Pomocnicza funkcja do powiadamiania o zmianach użytkownika
    """
    return user_data_sync.publish_user_update(tenant_id, user_id, action)

def notify_role_change(tenant_id: str, user_id: str, role_changes: Dict[str, Any], action: str = "update"):
    """
    Pomocnicza funkcja do powiadamiania o zmianach ról
    """
    return user_data_sync.publish_role_update(tenant_id, user_id, role_changes, action)

def notify_permission_change(tenant_id: str, user_id: str, permission_changes: Dict[str, Any], action: str = "update"):
    """
    Pomocnicza funkcja do powiadamiania o zmianach uprawnień
    """
    return user_data_sync.publish_permission_update(tenant_id, user_id, permission_changes, action)

def sync_full_tenant(tenant_id: str):
    """
    Pomocnicza funkcja do pełnej synchronizacji tenanta
    """
    return user_data_sync.sync_tenant_data(tenant_id)

def get_sync_metrics():
    """
    Pomocnicza funkcja do pobierania metryk synchronizacji
    """
    return user_data_sync.get_metrics()

def publish_translated_event(event_data: Dict[str, Any]):
    """
    Pomocnicza funkcja do publikowania przetłumaczonego eventu uprawnień
    """
    return user_data_sync.publish_translated_permission_event(event_data)