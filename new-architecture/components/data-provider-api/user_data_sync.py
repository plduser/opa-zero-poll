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
from typing import Dict, Any, Optional, List

logger = logging.getLogger(__name__)

# Konfiguracja OPAL Server
OPAL_SERVER_URL = os.environ.get("OPAL_SERVER_URL", "http://opal-server:7002")
DATA_PROVIDER_API_URL = os.environ.get("DATA_PROVIDER_API_URL", "http://data-provider-api:8110")

class UserDataSyncService:
    """
    Serwis do synchronizacji zmian uprawnień użytkowników z OPAL Server/Client
    """
    
    def __init__(self):
        self.logger = logger
    
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
        try:
            # Wspólny topic ale różne data-config dla różnych tenantów
            data = {
                "entries": [
                    {
                        "url": f"{DATA_PROVIDER_API_URL}/tenants/{tenant_id}/acl",
                        "topics": ["multi_tenant_user_data"],  # Wspólny topic dla użytkowników/ról/uprawnień
                        "dst_path": f"/acl/{tenant_id}",  # Hierarchiczne oddzielenie tenantów
                        "config": {
                            "tenant_id": tenant_id,
                            "user_id": user_id,
                            "action": action,
                            "timestamp": datetime.datetime.utcnow().isoformat()
                        }
                    }
                ],
                "reason": f"User {action}: {user_id} in tenant {tenant_id}"
            }
            
            response = requests.post(
                f"{OPAL_SERVER_URL}/data/config",
                json=data,
                timeout=10
            )
            
            if response.status_code == 200:
                self.logger.info(f"✅ OPAL user update published for {user_id} in tenant {tenant_id} (action: {action})")
                return True
            else:
                self.logger.warning(f"⚠️ OPAL user update failed for {user_id} in tenant {tenant_id}: {response.status_code}")
                return False
                
        except Exception as e:
            self.logger.error(f"❌ Error publishing OPAL user update for {user_id} in tenant {tenant_id}: {e}")
            return False
    
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
        try:
            data = {
                "entries": [
                    {
                        "url": f"{DATA_PROVIDER_API_URL}/tenants/{tenant_id}/acl",
                        "topics": ["multi_tenant_user_data"],  # Wspólny topic dla użytkowników/ról/uprawnień
                        "dst_path": f"/acl/{tenant_id}",
                        "config": {
                            "tenant_id": tenant_id,
                            "user_id": user_id,
                            "action": action,
                            "role_changes": role_changes,
                            "timestamp": datetime.datetime.utcnow().isoformat()
                        }
                    }
                ],
                "reason": f"Role {action}: {user_id} in tenant {tenant_id} - {json.dumps(role_changes)}"
            }
            
            response = requests.post(
                f"{OPAL_SERVER_URL}/data/config",
                json=data,
                timeout=10
            )
            
            if response.status_code == 200:
                self.logger.info(f"✅ OPAL role update published for {user_id} in tenant {tenant_id} (action: {action})")
                return True
            else:
                self.logger.warning(f"⚠️ OPAL role update failed for {user_id} in tenant {tenant_id}: {response.status_code}")
                return False
                
        except Exception as e:
            self.logger.error(f"❌ Error publishing OPAL role update for {user_id} in tenant {tenant_id}: {e}")
            return False
    
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
        try:
            data = {
                "entries": [
                    {
                        "url": f"{DATA_PROVIDER_API_URL}/tenants/{tenant_id}/acl",
                        "topics": ["multi_tenant_user_data"],  # Wspólny topic dla użytkowników/ról/uprawnień
                        "dst_path": f"/acl/{tenant_id}",
                        "config": {
                            "tenant_id": tenant_id,
                            "user_id": user_id,
                            "action": action,
                            "permission_changes": permission_changes,
                            "timestamp": datetime.datetime.utcnow().isoformat()
                        }
                    }
                ],
                "reason": f"Permission {action}: {user_id} in tenant {tenant_id} - {json.dumps(permission_changes)}"
            }
            
            response = requests.post(
                f"{OPAL_SERVER_URL}/data/config",
                json=data,
                timeout=10
            )
            
            if response.status_code == 200:
                self.logger.info(f"✅ OPAL permission update published for {user_id} in tenant {tenant_id} (action: {action})")
                return True
            else:
                self.logger.warning(f"⚠️ OPAL permission update failed for {user_id} in tenant {tenant_id}: {response.status_code}")
                return False
                
        except Exception as e:
            self.logger.error(f"❌ Error publishing OPAL permission update for {user_id} in tenant {tenant_id}: {e}")
            return False
    
    def sync_tenant_data(self, tenant_id: str) -> bool:
        """
        Synchronizuje wszystkie dane tenanta z OPAL (pełna synchronizacja)
        
        Args:
            tenant_id: ID tenanta
            
        Returns:
            bool: True jeśli synchronizacja powiodła się
        """
        try:
            data = {
                "entries": [
                    {
                        "url": f"{DATA_PROVIDER_API_URL}/tenants/{tenant_id}/acl",
                        "topics": ["multi_tenant_full_sync"],  # Topic dla pełnej synchronizacji
                        "dst_path": f"/acl/{tenant_id}",
                        "config": {
                            "tenant_id": tenant_id,
                            "action": "full_sync",
                            "timestamp": datetime.datetime.utcnow().isoformat()
                        }
                    }
                ],
                "reason": f"Full tenant sync: {tenant_id}"
            }
            
            response = requests.post(
                f"{OPAL_SERVER_URL}/data/config",
                json=data,
                timeout=15
            )
            
            if response.status_code == 200:
                self.logger.info(f"✅ OPAL full sync published for tenant {tenant_id}")
                return True
            else:
                self.logger.warning(f"⚠️ OPAL full sync failed for tenant {tenant_id}: {response.status_code}")
                return False
                
        except Exception as e:
            self.logger.error(f"❌ Error publishing OPAL full sync for tenant {tenant_id}: {e}")
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