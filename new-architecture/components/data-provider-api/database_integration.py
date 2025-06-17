"""
Database Integration Module for Data Provider API

Provides functions to fetch tenant data from database instead of static dictionaries.
"""

import logging
import sys
from typing import Dict, Any, Optional, List

# Add shared modules to path
sys.path.append('/app/shared')

try:
    from database.dao import TenantDAO, UserDAO, UserProfileDAO, UserAccessDAO
    from database.connection import get_db_connection
    DATABASE_AVAILABLE = True
except ImportError as e:
    DATABASE_AVAILABLE = False
    print(f"Database DAO not available: {e}")

logger = logging.getLogger(__name__)

def get_tenant_acl_from_database(tenant_id: str) -> Optional[Dict[str, Any]]:
    """
    Fetch tenant ACL data from database
    
    Args:
        tenant_id: Tenant identifier
        
    Returns:
        Dict containing ACL data or None if not found
    """
    if not DATABASE_AVAILABLE:
        return None
        
    try:
        # Initialize database connection
        db = get_db_connection()
        if not db.test_connection():
            logger.error("Database connection test failed")
            return None
            
        # Get tenant data using DAO
        tenant_dao = TenantDAO()
        tenants = tenant_dao.find_by_criteria({'tenant_id': tenant_id})
        
        if not tenants:
            logger.warning(f"Tenant {tenant_id} not found in database")
            return None
            
        tenant = tenants[0]  # Get first match
        
        # Get users for this tenant from BOTH user_access and user_roles tables
        from shared.database.connection import get_db_cursor
        
        user_ids = set()
        
        # Get users from user_access table
        try:
            user_access_dao = UserAccessDAO()
            user_accesses = user_access_dao.find_by_criteria({'tenant_id': tenant_id})
            for access in user_accesses:
                user_ids.add(access.user_id)
        except Exception as e:
            logger.warning(f"Could not fetch from user_access table: {e}")
        
        # Get users from user_roles table (our new mapping system)
        try:
            with get_db_cursor() as cursor:
                cursor.execute("""
                    SELECT DISTINCT user_id 
                    FROM user_roles 
                    WHERE tenant_id = %s
                """, (tenant_id,))
                
                role_users = cursor.fetchall()
                for row in role_users:
                    user_id = row['user_id'] if isinstance(row, dict) else row[0]
                    user_ids.add(user_id)
        except Exception as e:
            logger.warning(f"Could not fetch from user_roles table: {e}")
        
        # Get user details for all unique user IDs
        user_dao = UserDAO()
        users = []
        for user_id in user_ids:
            user = user_dao.find_by_id(user_id)
            if user:
                users.append(user)
        
        # Get user profiles
        profile_dao = UserProfileDAO()
        
        # Build ACL structure
        acl_data = {
            "tenant_id": tenant_id,
            "tenant_name": tenant.tenant_name if hasattr(tenant, 'tenant_name') else tenant_id,
            "users": {},
            "roles": {},
            "permissions": {}
        }
        
        # Process users and their profiles
        for user in users:
            user_id = user.user_id if hasattr(user, 'user_id') else str(user)
            
            # Get user profile from UserProfileDAO
            profile = profile_dao.get_complete_user_profile(user_id, tenant_id)
            
            # Get additional roles from user_roles table (our mapping system)
            user_roles = {}
            user_permissions = {}
            
            try:
                with get_db_cursor() as cursor:
                    # Get roles with their permissions for this user from user_roles table
                    cursor.execute("""
                        SELECT r.app_id, r.role_name, array_agg(p.permission_name) as permissions
                        FROM user_roles ur
                        JOIN roles r ON ur.role_id = r.role_id
                        LEFT JOIN role_permissions rp ON r.role_id = rp.role_id
                        LEFT JOIN permissions p ON rp.permission_id = p.permission_id
                        WHERE ur.user_id = %s AND ur.tenant_id = %s
                        GROUP BY r.app_id, r.role_name
                    """, (user_id, tenant_id))
                    
                    role_data = cursor.fetchall()
                    
                    for row in role_data:
                        app_id = row['app_id'] if isinstance(row, dict) else row[0]
                        role_name = row['role_name'] if isinstance(row, dict) else row[1] 
                        permissions = row['permissions'] if isinstance(row, dict) else row[2]
                        
                        # Add to roles structure
                        if app_id not in user_roles:
                            user_roles[app_id] = []
                        user_roles[app_id].append(role_name)
                        
                        # Add to permissions structure
                        if permissions and permissions[0] is not None:  # Check if permissions exist
                            if app_id not in user_permissions:
                                user_permissions[app_id] = []
                            user_permissions[app_id].extend([p for p in permissions if p is not None])
                            
            except Exception as e:
                logger.warning(f"Could not fetch roles from user_roles table for user {user_id}: {e}")
            
            # Merge roles and permissions from both sources
            combined_roles = profile.roles if profile and hasattr(profile, 'roles') else {}
            combined_permissions = profile.permissions if profile and hasattr(profile, 'permissions') else {}
            
            # Add roles from user_roles table
            for app_id, roles in user_roles.items():
                if app_id not in combined_roles:
                    combined_roles[app_id] = []
                combined_roles[app_id].extend(roles)
                combined_roles[app_id] = list(set(combined_roles[app_id]))  # Remove duplicates
            
            # Add permissions from user_roles table
            for app_id, permissions in user_permissions.items():
                if app_id not in combined_permissions:
                    combined_permissions[app_id] = []
                combined_permissions[app_id].extend(permissions)
                combined_permissions[app_id] = list(set(combined_permissions[app_id]))  # Remove duplicates
            
            acl_data["users"][user_id] = {
                "email": user.email if hasattr(user, 'email') else '',
                "full_name": user.full_name if hasattr(user, 'full_name') else '',
                "roles": combined_roles,
                "permissions": combined_permissions,
                "companies": profile.companies if profile and hasattr(profile, 'companies') else [],
                "teams": profile.teams if profile and hasattr(profile, 'teams') else []
            }
            
        logger.info(f"Successfully fetched ACL data for tenant {tenant_id} from database")
        return acl_data
        
    except Exception as e:
        logger.error(f"Failed to fetch tenant ACL from database: {e}")
        return None

def get_all_tenants_from_database() -> List[str]:
    """
    Get list of all tenant IDs from database
    
    Returns:
        List of tenant IDs
    """
    if not DATABASE_AVAILABLE:
        return []
        
    try:
        tenant_dao = TenantDAO()
        tenants = tenant_dao.find_all()
        return [tenant.tenant_id if hasattr(tenant, 'tenant_id') else str(tenant) for tenant in tenants]
        
    except Exception as e:
        logger.error(f"Failed to fetch tenants from database: {e}")
        return []

def is_database_available() -> bool:
    """
    Check if database integration is available and working
    
    Returns:
        True if database is available and accessible
    """
    if not DATABASE_AVAILABLE:
        return False
        
    try:
        db = get_db_connection()
        return db.test_connection()
    except Exception as e:
        logger.error(f"Database availability check failed: {e}")
        return False 