"""
Database Integration Module for Data Provider API

Provides functions to fetch tenant data from database instead of static dictionaries.
"""

import logging
import sys
from typing import Dict, Any, Optional, List
import psycopg2
import psycopg2.extras
import os

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
    Fetch tenant ACL data from database - RAW SOURCE DATA for OPA policies
    
    Returns raw data structures that OPA policies will process:
    - RBAC: applications, roles, permissions 
    - ASSIGNMENTS: user_roles assignments
    - ReBAC: teams, team memberships, team-company relations
    
    Args:
        tenant_id: Tenant identifier
        
    Returns:
        Dict containing raw ACL data or None if not found
    """
    if not DATABASE_AVAILABLE:
        return None
        
    try:
        # Initialize database connection using direct psycopg2 (same pattern as other endpoints)
        conn = psycopg2.connect(
            host=os.environ.get("DB_HOST", "postgres-db"),
            port=os.environ.get("DB_PORT", 5432),
            user=os.environ.get("DB_USER", "opa_user"),
            password=os.environ.get("DB_PASSWORD", "opa_password"),
            database=os.environ.get("DB_NAME", "opa_zero_poll")
        )
        
        if not conn:
            logger.error("Failed to connect to database")
            return None
            
        # Get tenant data
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute("SELECT tenant_id, tenant_name FROM tenants WHERE tenant_id = %s", (tenant_id,))
            tenant_row = cursor.fetchone()
            
            if not tenant_row:
                logger.warning(f"Tenant {tenant_id} not found")
                return None
        
        # Build ACL structure with RAW data
        acl_data = {
            "tenant_id": tenant_id,
            "data": {
                # RBAC Structure - Applications, Roles, Permissions
                "applications": _get_applications_data(conn),
                "roles": _get_roles_data(conn),
                "permissions": _get_permissions_data(conn),
                "role_permissions": _get_role_permissions_mapping(conn),
                
                # ASSIGNMENTS - User role assignments  
                "users": _get_users_rbac_data(conn, tenant_id),
                
                # Companies data
                "companies": _get_companies_data(conn, tenant_id),
                
                # ReBAC Structure - Teams and relationships
                "teams": _get_teams_data(conn, tenant_id),
                "team_memberships": _get_team_memberships_data(conn, tenant_id),
                "team_companies": _get_team_companies_data(conn, tenant_id),
                "team_roles": _get_team_roles_data(conn, tenant_id),
                
                # User direct company access (non-team based)
                "user_companies": _get_user_companies_data(conn, tenant_id)
            }
        }
        
        logger.info(f"Successfully generated RAW ACL data for tenant {tenant_id}")
        conn.close()
        return acl_data
        
    except Exception as e:
        logger.error(f"Error generating ACL data for tenant {tenant_id}: {str(e)}")
        if 'conn' in locals():
            conn.close()
        return None

def _get_applications_data(conn) -> Dict[str, Any]:
    """Get all applications"""
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute("""
                SELECT app_id, app_name, description, status
                FROM applications 
                ORDER BY app_name
            """)
            
            applications = {}
            for row in cursor.fetchall():
                applications[row['app_id']] = {
                    "app_id": row['app_id'],
                    "app_name": row['app_name'], 
                    "description": row['description'],
                    "status": row['status']
                }
            
            return applications
    except Exception as e:
        logger.error(f"Error fetching applications: {str(e)}")
        return {}

def _get_roles_data(conn) -> Dict[str, Any]:
    """Get all roles"""
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute("""
                SELECT r.role_id, r.role_name, r.description, r.app_id, a.app_name
                FROM roles r
                JOIN applications a ON r.app_id = a.app_id
                ORDER BY a.app_name, r.role_name
            """)
            
            roles = {}
            for row in cursor.fetchall():
                roles[row['role_id']] = {
                    "role_id": row['role_id'],
                    "role_name": row['role_name'],
                    "description": row['description'], 
                    "app_id": row['app_id'],
                    "app_name": row['app_name']
                }
            
            return roles
    except Exception as e:
        logger.error(f"Error fetching roles: {str(e)}")
        return {}

def _get_permissions_data(conn) -> Dict[str, Any]:
    """Get all permissions"""
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute("""
                SELECT p.permission_id, p.permission_name, p.description, p.app_id, a.app_name
                FROM permissions p  
                JOIN applications a ON p.app_id = a.app_id
                ORDER BY a.app_name, p.permission_name
            """)
            
            permissions = {}
            for row in cursor.fetchall():
                permissions[row['permission_id']] = {
                    "permission_id": row['permission_id'],
                    "permission_name": row['permission_name'],
                    "description": row['description'],
                    "app_id": row['app_id'], 
                    "app_name": row['app_name']
                }
            
            return permissions
    except Exception as e:
        logger.error(f"Error fetching permissions: {str(e)}")
        return {}

def _get_role_permissions_mapping(conn) -> List[Dict[str, str]]:
    """Get role-permission mappings"""
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute("""
                SELECT rp.role_id, rp.permission_id, r.role_name, p.permission_name, r.app_id
                FROM role_permissions rp
                JOIN roles r ON rp.role_id = r.role_id
                JOIN permissions p ON rp.permission_id = p.permission_id
                ORDER BY r.app_id, r.role_name, p.permission_name
            """)
            
            mappings = []
            for row in cursor.fetchall():
                mappings.append({
                    "role_id": row['role_id'],
                    "permission_id": row['permission_id'],
                    "role_name": row['role_name'],
                    "permission_name": row['permission_name'],
                    "app_id": row['app_id']
                })
            
            return mappings
    except Exception as e:
        logger.error(f"Error fetching role-permission mappings: {str(e)}")
        return []

def _get_users_rbac_data(conn, tenant_id: str) -> Dict[str, Any]:
    """Get user RBAC assignments - who has which roles"""
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute("""
                SELECT ur.user_id, ur.role_id, r.role_name, r.app_id, a.app_name,
                       u.username, u.full_name, u.email
                FROM user_roles ur
                JOIN roles r ON ur.role_id = r.role_id  
                JOIN applications a ON r.app_id = a.app_id
                JOIN users u ON ur.user_id = u.user_id
                WHERE ur.tenant_id = %s
                ORDER BY ur.user_id, a.app_name, r.role_name
            """, (tenant_id,))
            
            users = {}
            for row in cursor.fetchall():
                user_id = row['user_id']
                if user_id not in users:
                    users[user_id] = {
                        "user_id": user_id,
                        "username": row['username'],
                        "full_name": row['full_name'], 
                        "email": row['email'],
                        "role_assignments": []
                    }
                
                users[user_id]["role_assignments"].append({
                    "role_id": row['role_id'],
                    "role_name": row['role_name'],
                    "app_id": row['app_id'],
                    "app_name": row['app_name']
                })
            
            return users
    except Exception as e:
        logger.error(f"Error fetching user RBAC data: {str(e)}")
        return {}

def _get_companies_data(conn, tenant_id: str) -> Dict[str, Any]:
    """Get companies for tenant"""
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute("""
                SELECT company_id, company_name, nip, status
                FROM companies 
                WHERE tenant_id = %s
                ORDER BY company_name
            """, (tenant_id,))
            
            companies = {}
            for row in cursor.fetchall():
                companies[row['company_id']] = {
                    "company_id": row['company_id'],
                    "company_name": row['company_name'],
                    "nip": row['nip'],
                    "status": row['status']
                }
            
            return companies
    except Exception as e:
        logger.error(f"Error fetching companies: {str(e)}")
        return {}

def _get_teams_data(conn, tenant_id: str) -> Dict[str, Any]:
    """Get teams for tenant"""
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute("""
                SELECT team_id, team_name, description, parent_team_id, team_type, status, created_at
                FROM teams 
                WHERE tenant_id = %s
                ORDER BY team_name
            """, (tenant_id,))
            
            teams = {}
            for row in cursor.fetchall():
                teams[row['team_id']] = {
                    "team_id": str(row['team_id']),
                    "team_name": row['team_name'],
                    "description": row['description'],
                    "parent_team_id": str(row['parent_team_id']) if row['parent_team_id'] else None,
                    "team_type": row['team_type'],
                    "status": row['status'],
                    "created_at": row['created_at'].isoformat() if row['created_at'] else None
                }
            
            return teams
    except Exception as e:
        logger.error(f"Error fetching teams: {str(e)}")
        return {}

def _get_team_memberships_data(conn, tenant_id: str) -> List[Dict[str, Any]]:
    """Get team memberships for tenant"""
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute("""
                SELECT tm.team_id, tm.user_id, tm.role_in_team, u.username, u.full_name, t.team_name
                FROM team_memberships tm
                JOIN teams t ON tm.team_id = t.team_id
                JOIN users u ON tm.user_id = u.user_id
                WHERE t.tenant_id = %s
                ORDER BY t.team_name, u.username
            """, (tenant_id,))
            
            memberships = []
            for row in cursor.fetchall():
                memberships.append({
                    "team_id": str(row['team_id']),
                    "user_id": row['user_id'],
                    "role_in_team": row['role_in_team'],
                    "username": row['username'],
                    "full_name": row['full_name'],
                    "team_name": row['team_name']
                })
            
            return memberships
    except Exception as e:
        logger.error(f"Error fetching team memberships: {str(e)}")
        return []

def _get_team_companies_data(conn, tenant_id: str) -> List[Dict[str, Any]]:
    """Get team-company relations for tenant"""
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute("""
                SELECT tc.team_id, tc.company_id, t.team_name, c.company_name
                FROM team_companies tc
                JOIN teams t ON tc.team_id = t.team_id
                JOIN companies c ON tc.company_id = c.company_id
                WHERE t.tenant_id = %s AND c.tenant_id = %s
                ORDER BY t.team_name, c.company_name
            """, (tenant_id, tenant_id))
            
            team_companies = []
            for row in cursor.fetchall():
                team_companies.append({
                    "team_id": str(row['team_id']),
                    "company_id": row['company_id'],
                    "team_name": row['team_name'],
                    "company_name": row['company_name']
                })
            
            return team_companies
    except Exception as e:
        logger.error(f"Error fetching team companies: {str(e)}")
        return []

def _get_user_companies_data(conn, tenant_id: str) -> List[Dict[str, Any]]:
    """Get user-company direct access for tenant"""
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute("""
                SELECT ua.user_id, ua.company_id, ua.access_type, u.username, u.full_name, c.company_name
                FROM user_access ua
                JOIN users u ON ua.user_id = u.user_id
                JOIN companies c ON ua.company_id = c.company_id
                WHERE c.tenant_id = %s
                ORDER BY u.username, c.company_name
            """, (tenant_id,))
            
            user_companies = []
            for row in cursor.fetchall():
                user_companies.append({
                    "user_id": row['user_id'],
                    "company_id": row['company_id'],
                    "access_type": row['access_type'],
                    "username": row['username'],
                    "full_name": row['full_name'],
                    "company_name": row['company_name']
                })
            
            return user_companies
    except Exception as e:
        logger.error(f"Error fetching user companies: {str(e)}")
        return []

def _get_team_roles_data(conn, tenant_id: str) -> List[Dict[str, Any]]:
    """Get team role assignments for tenant - KLUCZOWE dla ReBAC"""
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute("""
                SELECT tr.team_id, tr.role_id, t.team_name, r.role_name, r.app_id, a.app_name
                FROM team_roles tr
                JOIN teams t ON tr.team_id = t.team_id
                JOIN roles r ON tr.role_id = r.role_id
                JOIN applications a ON r.app_id = a.app_id
                WHERE t.tenant_id = %s
                ORDER BY t.team_name, a.app_name, r.role_name
            """, (tenant_id,))
            
            team_roles = []
            for row in cursor.fetchall():
                team_roles.append({
                    "team_id": str(row['team_id']),
                    "role_id": str(row['role_id']),
                    "team_name": row['team_name'],
                    "role_name": row['role_name'],
                    "app_id": row['app_id'],
                    "app_name": row['app_name']
                })
            
            return team_roles
    except Exception as e:
        logger.error(f"Error fetching team roles: {str(e)}")
        return []

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