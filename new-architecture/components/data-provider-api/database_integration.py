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
        
        # Get users for this tenant through user_access table
        user_access_dao = UserAccessDAO()
        user_accesses = user_access_dao.find_by_criteria({'tenant_id': tenant_id})
        
        # Get unique user IDs
        user_ids = list(set([access.user_id for access in user_accesses]))
        
        # Get user details
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
            profile = profile_dao.get_complete_user_profile(user_id, tenant_id)
            
            acl_data["users"][user_id] = {
                "email": user.email if hasattr(user, 'email') else '',
                "full_name": user.full_name if hasattr(user, 'full_name') else '',
                "roles": profile.roles if profile and hasattr(profile, 'roles') else {},
                "permissions": profile.permissions if profile and hasattr(profile, 'permissions') else {},
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