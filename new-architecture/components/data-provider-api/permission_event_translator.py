"""
Permission Event Translator - Subtask 40.3

Translates permission change events from Portal Symfonia into OPA-compatible Model 1 structure.
Focuses only on roles + access (not teams/resources/memberships which are not implemented yet).

Model 1 Structure:
{
  "roles": {
    "user123": {
      "fk": ["fk_admin", "fk_editor"],
      "hr": ["hr_viewer"]
    }
  },
  "access": {
    "user123": {
      "tenant125": ["company1", "company2"]
    }
  }
}
"""

import logging
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from typing import Dict, Any, Optional, List

logger = logging.getLogger(__name__)

def get_db_connection():
    """Utworz połączenie z bazą danych PostgreSQL"""
    try:
        conn = psycopg2.connect(
            host=os.environ.get("DB_HOST", "postgres-db"),
            port=os.environ.get("DB_PORT", 5432),
            user=os.environ.get("DB_USER", "opa_user"),
            password=os.environ.get("DB_PASSWORD", "opa_password"),
            database=os.environ.get("DB_NAME", "opa_zero_poll")
        )
        return conn
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        return None

class PermissionEventTranslator:
    """
    Translates permission change events into Model 1 structure for OPA
    """
    
    def __init__(self):
        self.logger = logger
    
    def translate_user_create(self, user_id: str, tenant_id: str, user_data: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Transluje event utworzenia użytkownika na Model 1 incremental update
        
        Args:
            user_id: ID użytkownika
            tenant_id: ID tenanta
            user_data: Dodatkowe dane użytkownika
            
        Returns:
            Dict: Model 1 incremental update structure
        """
        try:
            self.logger.info(f"🔄 Translating user create event: {user_id} in tenant {tenant_id}")
            
            # Inicjalizacja pustych struktur dla nowego użytkownika
            model1_update = {
                "roles": {
                    user_id: {}  # Pusty - nowy użytkownik nie ma jeszcze ról
                },
                "access": {
                    user_id: {
                        tenant_id: []  # Pusty - dostęp do firm będzie dodany później
                    }
                }
            }
            
            self.logger.info(f"✅ User create translation completed for {user_id}")
            return model1_update
            
        except Exception as e:
            self.logger.error(f"❌ Error translating user create event: {e}")
            return {}
    
    def translate_user_delete(self, user_id: str, tenant_id: str) -> Dict[str, Any]:
        """
        Transluje event usunięcia użytkownika na Model 1 cleanup
        
        Args:
            user_id: ID użytkownika
            tenant_id: ID tenanta
            
        Returns:
            Dict: Model 1 structure indicating user removal
        """
        try:
            self.logger.info(f"🔄 Translating user delete event: {user_id} in tenant {tenant_id}")
            
            # Oznaczenie do usunięcia - OPAL Client będzie musiał usunąć te sekcje
            model1_update = {
                "roles": {
                    user_id: None  # null oznacza usunięcie
                },
                "access": {
                    user_id: None  # null oznacza usunięcie
                },
                "_action": "delete_user",
                "_user_id": user_id,
                "_tenant_id": tenant_id
            }
            
            self.logger.info(f"✅ User delete translation completed for {user_id}")
            return model1_update
            
        except Exception as e:
            self.logger.error(f"❌ Error translating user delete event: {e}")
            return {}
    
    def translate_role_assignment(self, user_id: str, tenant_id: str, role_changes: Dict[str, Any]) -> Dict[str, Any]:
        """
        Transluje event przypisania roli na Model 1 roles update
        
        Args:
            user_id: ID użytkownika
            tenant_id: ID tenanta
            role_changes: Informacje o zmianach ról (app_id, profile_name, action)
            
        Returns:
            Dict: Model 1 incremental update for roles
        """
        try:
            self.logger.info(f"🔄 Translating role assignment event: {user_id} in tenant {tenant_id}")
            self.logger.info(f"🔄 Role changes: {role_changes}")
            
            # Pobierz aktualne role użytkownika z bazy danych
            current_user_roles = self._get_user_roles_from_database(user_id, tenant_id)
            
            app_id = role_changes.get("app_id")
            profile_name = role_changes.get("profile_name")
            action = role_changes.get("action")
            
            if not app_id or not profile_name:
                self.logger.warning(f"⚠️ Missing app_id or profile_name in role_changes")
                return {}
            
            # Pobierz role z profilu (używamy istniejącego profile_role_mapper)
            mapped_roles = self._get_roles_from_profile(app_id, profile_name)
            
            if action == "assigned":
                # Dodaj role do aplikacji
                if app_id not in current_user_roles:
                    current_user_roles[app_id] = []
                
                # Dodaj nowe role (unikamy duplikatów)
                for role in mapped_roles:
                    if role not in current_user_roles[app_id]:
                        current_user_roles[app_id].append(role)
                        
            elif action == "removed":
                # Usuń role z aplikacji
                if app_id in current_user_roles:
                    for role in mapped_roles:
                        if role in current_user_roles[app_id]:
                            current_user_roles[app_id].remove(role)
                    
                    # Usuń aplikację jeśli nie ma już ról
                    if not current_user_roles[app_id]:
                        del current_user_roles[app_id]
            
            model1_update = {
                "roles": {
                    user_id: current_user_roles
                }
            }
            
            self.logger.info(f"✅ Role assignment translation completed for {user_id}: {current_user_roles}")
            return model1_update
            
        except Exception as e:
            self.logger.error(f"❌ Error translating role assignment event: {e}")
            return {}
    
    def translate_company_access(self, user_id: str, tenant_id: str, company_changes: Dict[str, Any]) -> Dict[str, Any]:
        """
        Transluje event zmiany dostępu do firm na Model 1 access update
        
        Args:
            user_id: ID użytkownika
            tenant_id: ID tenanta
            company_changes: Informacje o zmianach dostępu (company_id, action)
            
        Returns:
            Dict: Model 1 incremental update for access
        """
        try:
            self.logger.info(f"🔄 Translating company access event: {user_id} in tenant {tenant_id}")
            self.logger.info(f"🔄 Company changes: {company_changes}")
            
            # Pobierz aktualny dostęp użytkownika z bazy danych
            current_user_access = self._get_user_access_from_database(user_id, tenant_id)
            
            company_id = company_changes.get("company_id")
            action = company_changes.get("action")
            
            if not company_id:
                self.logger.warning(f"⚠️ Missing company_id in company_changes")
                return {}
            
            if action == "granted":
                # Dodaj dostęp do firmy
                if tenant_id not in current_user_access:
                    current_user_access[tenant_id] = []
                
                if company_id not in current_user_access[tenant_id]:
                    current_user_access[tenant_id].append(company_id)
                    
            elif action == "revoked":
                # Usuń dostęp do firmy
                if tenant_id in current_user_access and company_id in current_user_access[tenant_id]:
                    current_user_access[tenant_id].remove(company_id)
                    
                    # Usuń tenant jeśli nie ma już dostępu do żadnej firmy
                    if not current_user_access[tenant_id]:
                        del current_user_access[tenant_id]
            
            model1_update = {
                "access": {
                    user_id: current_user_access
                }
            }
            
            self.logger.info(f"✅ Company access translation completed for {user_id}: {current_user_access}")
            return model1_update
            
        except Exception as e:
            self.logger.error(f"❌ Error translating company access event: {e}")
            return {}
    
    def translate_to_model1(self, event_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Główna metoda translacji - deleguje do odpowiednich metod na podstawie typu eventu
        
        Args:
            event_data: Dane eventu z Portal Symfonia
            
        Returns:
            Dict: Model 1 incremental update
        """
        if not event_data:
            return {}
        
        event_type = event_data.get("event_type")
        user_id = event_data.get("user_id")
        tenant_id = event_data.get("tenant_id")
        
        if not user_id or not tenant_id:
            self.logger.warning(f"⚠️ Missing user_id or tenant_id in event_data: {event_data}")
            return {}
        
        if event_type == "user_create":
            return self.translate_user_create(user_id, tenant_id, event_data.get("user_data", {}))
        
        elif event_type == "user_delete":
            return self.translate_user_delete(user_id, tenant_id)
        
        elif event_type == "role_assignment":
            return self.translate_role_assignment(user_id, tenant_id, event_data.get("role_changes", {}))
        
        elif event_type == "company_access":
            return self.translate_company_access(user_id, tenant_id, event_data.get("company_changes", {}))
        
        else:
            self.logger.warning(f"⚠️ Unknown event type: {event_type}")
            return {}
    
    def _get_user_roles_from_database(self, user_id: str, tenant_id: str) -> Dict[str, List[str]]:
        """
        Pobiera aktualne role użytkownika z bazy danych
        
        Returns:
            Dict: Role per aplikacja {"app_id": ["role1", "role2"]}
        """
        conn = get_db_connection()
        if not conn:
            return {}
        
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                    SELECT r.app_id, r.role_name
                    FROM user_roles ur
                    JOIN roles r ON ur.role_id = r.role_id
                    WHERE ur.user_id = %s AND ur.tenant_id = %s
                """, (user_id, tenant_id))
                
                roles_data = cur.fetchall()
                
                user_roles = {}
                for row in roles_data:
                    app_id = row["app_id"]
                    role_name = row["role_name"]
                    
                    if app_id not in user_roles:
                        user_roles[app_id] = []
                    
                    if role_name not in user_roles[app_id]:
                        user_roles[app_id].append(role_name)
                
                return user_roles
                
        except Exception as e:
            self.logger.error(f"❌ Error fetching user roles from database: {e}")
            return {}
        finally:
            conn.close()
    
    def _get_user_access_from_database(self, user_id: str, tenant_id: str) -> Dict[str, List[str]]:
        """
        Pobiera aktualny dostęp użytkownika do firm z bazy danych
        
        Returns:
            Dict: Dostęp per tenant {"tenant_id": ["company1", "company2"]}
        """
        conn = get_db_connection()
        if not conn:
            return {}
        
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                    SELECT tenant_id, company_id
                    FROM user_access
                    WHERE user_id = %s AND tenant_id = %s
                """, (user_id, tenant_id))
                
                access_data = cur.fetchall()
                
                user_access = {}
                for row in access_data:
                    tenant = row["tenant_id"]
                    company = row["company_id"]
                    
                    if tenant not in user_access:
                        user_access[tenant] = []
                    
                    if company not in user_access[tenant]:
                        user_access[tenant].append(company)
                
                return user_access
                
        except Exception as e:
            self.logger.error(f"❌ Error fetching user access from database: {e}")
            return {}
        finally:
            conn.close()
    
    def _get_roles_from_profile(self, app_id: str, profile_name: str) -> List[str]:
        """
        Pobiera role przypisane do profilu aplikacyjnego z bazy danych
        
        Args:
            app_id: ID aplikacji
            profile_name: Nazwa profilu
            
        Returns:
            List: Lista ról przypisanych do profilu
        """
        conn = get_db_connection()
        if not conn:
            return []
        
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                    SELECT r.role_name
                    FROM application_profiles ap
                    JOIN profile_role_mappings prm ON ap.profile_id = prm.profile_id
                    JOIN roles r ON prm.role_id = r.role_id
                    WHERE ap.app_id = %s AND ap.profile_name = %s
                """, (app_id, profile_name))
                
                role_data = cur.fetchall()
                return [row["role_name"] for row in role_data]
                
        except Exception as e:
            self.logger.error(f"❌ Error fetching roles from profile: {e}")
            return []
        finally:
            conn.close()

# Globalna instancja translatora
translator = PermissionEventTranslator()

def translate_permission_event(event_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Helper function dla łatwego importu i użycia
    
    Args:
        event_data: Event data z Portal Symfonia
        
    Returns:
        Dict: Model 1 incremental update
    """
    return translator.translate_to_model1(event_data) 