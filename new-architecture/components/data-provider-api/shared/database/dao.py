"""
Concrete DAO implementations for all database entities
"""

import logging
from typing import List, Optional, Dict, Any
from uuid import UUID
from .base_dao import BaseDAO
from .models import (
    Tenant, User, Application, Company, Role, Permission, Team,
    UserRole, UserAccess, TeamMembership, TeamRole, TeamCompany,
    UserEffectivePermission, UserEffectiveAccess, UserProfile,
    dict_to_tenant, dict_to_user, dict_to_application, dict_to_company,
    dict_to_role, dict_to_permission, dict_to_team
)
from .connection import execute_query, get_db_cursor

logger = logging.getLogger(__name__)

class TenantDAO(BaseDAO[Tenant]):
    """DAO for Tenant entities"""
    
    def __init__(self):
        super().__init__('tenants', Tenant, 'tenant_id')
    
    def dict_to_model(self, data: Dict[str, Any]) -> Tenant:
        return dict_to_tenant(data)
    
    def model_to_dict(self, model: Tenant) -> Dict[str, Any]:
        return {
            'tenant_id': model.tenant_id,
            'tenant_name': model.tenant_name,
            'description': model.description,
            'status': model.status,
            'metadata': model.metadata
        }
    
    def find_by_status(self, status: str) -> List[Tenant]:
        """Find tenants by status"""
        return self.find_by_criteria({'status': status})

class UserDAO(BaseDAO[User]):
    """DAO for User entities"""
    
    def __init__(self):
        super().__init__('users', User, 'user_id')
    
    def dict_to_model(self, data: Dict[str, Any]) -> User:
        return dict_to_user(data)
    
    def model_to_dict(self, model: User) -> Dict[str, Any]:
        return {
            'user_id': model.user_id,
            'username': model.username,
            'email': model.email,
            'full_name': model.full_name,
            'status': model.status,
            'metadata': model.metadata
        }
    
    def find_by_username(self, username: str) -> Optional[User]:
        """Find user by username"""
        results = self.find_by_criteria({'username': username})
        return results[0] if results else None
    
    def find_by_email(self, email: str) -> Optional[User]:
        """Find user by email"""
        results = self.find_by_criteria({'email': email})
        return results[0] if results else None

class ApplicationDAO(BaseDAO[Application]):
    """DAO for Application entities"""
    
    def __init__(self):
        super().__init__('applications', Application, 'app_id')
    
    def dict_to_model(self, data: Dict[str, Any]) -> Application:
        return dict_to_application(data)
    
    def model_to_dict(self, model: Application) -> Dict[str, Any]:
        return {
            'app_id': model.app_id,
            'app_name': model.app_name,
            'description': model.description,
            'status': model.status,
            'metadata': model.metadata
        }

class CompanyDAO(BaseDAO[Company]):
    """DAO for Company entities"""
    
    def __init__(self):
        super().__init__('companies', Company, 'company_id')
    
    def dict_to_model(self, data: Dict[str, Any]) -> Company:
        return dict_to_company(data)
    
    def model_to_dict(self, model: Company) -> Dict[str, Any]:
        return {
            'company_id': model.company_id,
            'tenant_id': model.tenant_id,
            'company_name': model.company_name,
            'company_code': model.company_code,
            'description': model.description,
            'parent_company_id': model.parent_company_id,
            'status': model.status,
            'metadata': model.metadata
        }
    
    def find_by_tenant(self, tenant_id: str) -> List[Company]:
        """Find companies by tenant"""
        return self.find_by_criteria({'tenant_id': tenant_id})
    
    def find_by_tenant_and_status(self, tenant_id: str, status: str) -> List[Company]:
        """Find companies by tenant and status"""
        return self.find_by_criteria({'tenant_id': tenant_id, 'status': status})

class RoleDAO(BaseDAO[Role]):
    """DAO for Role entities"""
    
    def __init__(self):
        super().__init__('roles', Role, 'role_id')
    
    def dict_to_model(self, data: Dict[str, Any]) -> Role:
        return dict_to_role(data)
    
    def model_to_dict(self, model: Role) -> Dict[str, Any]:
        return {
            'app_id': model.app_id,
            'role_name': model.role_name,
            'description': model.description,
            'is_system_role': model.is_system_role,
            'metadata': model.metadata
        }
    
    def find_by_application(self, app_id: str) -> List[Role]:
        """Find roles by application"""
        return self.find_by_criteria({'app_id': app_id})
    
    def find_by_app_and_name(self, app_id: str, role_name: str) -> Optional[Role]:
        """Find role by application and name"""
        results = self.find_by_criteria({'app_id': app_id, 'role_name': role_name})
        return results[0] if results else None

class PermissionDAO(BaseDAO[Permission]):
    """DAO for Permission entities"""
    
    def __init__(self):
        super().__init__('permissions', Permission, 'permission_id')
    
    def dict_to_model(self, data: Dict[str, Any]) -> Permission:
        return dict_to_permission(data)
    
    def model_to_dict(self, model: Permission) -> Dict[str, Any]:
        return {
            'app_id': model.app_id,
            'permission_name': model.permission_name,
            'description': model.description,
            'resource_type': model.resource_type,
            'action': model.action,
            'metadata': model.metadata
        }
    
    def find_by_application(self, app_id: str) -> List[Permission]:
        """Find permissions by application"""
        return self.find_by_criteria({'app_id': app_id})
    
    def find_by_role(self, role_id: UUID) -> List[Permission]:
        """Find permissions assigned to a role"""
        query = """
            SELECT p.* FROM permissions p
            JOIN role_permissions rp ON p.permission_id = rp.permission_id
            WHERE rp.role_id = %s
            ORDER BY p.app_id, p.permission_name
        """
        results = execute_query(query, (role_id,))
        return [self.dict_to_model(dict(row)) for row in results]

class TeamDAO(BaseDAO[Team]):
    """DAO for Team entities"""
    
    def __init__(self):
        super().__init__('teams', Team, 'team_id')
    
    def dict_to_model(self, data: Dict[str, Any]) -> Team:
        return dict_to_team(data)
    
    def model_to_dict(self, model: Team) -> Dict[str, Any]:
        return {
            'tenant_id': model.tenant_id,
            'team_name': model.team_name,
            'description': model.description,
            'parent_team_id': model.parent_team_id,
            'team_type': model.team_type,
            'status': model.status,
            'metadata': model.metadata
        }
    
    def find_by_tenant(self, tenant_id: str) -> List[Team]:
        """Find teams by tenant"""
        return self.find_by_criteria({'tenant_id': tenant_id})
    
    def find_by_user(self, user_id: str) -> List[Team]:
        """Find teams that user belongs to"""
        query = """
            SELECT t.* FROM teams t
            JOIN team_memberships tm ON t.team_id = tm.team_id
            WHERE tm.user_id = %s
            ORDER BY t.team_name
        """
        results = execute_query(query, (user_id,))
        return [self.dict_to_model(dict(row)) for row in results]

class UserRoleDAO(BaseDAO[UserRole]):
    """DAO for UserRole assignments"""
    
    def __init__(self):
        super().__init__('user_roles', UserRole, 'user_id')
    
    def dict_to_model(self, data: Dict[str, Any]) -> UserRole:
        return UserRole(
            user_id=data['user_id'],
            role_id=data['role_id'],
            tenant_id=data['tenant_id'],
            assigned_at=data.get('assigned_at'),
            assigned_by=data.get('assigned_by'),
            expires_at=data.get('expires_at')
        )
    
    def model_to_dict(self, model: UserRole) -> Dict[str, Any]:
        return {
            'user_id': model.user_id,
            'role_id': model.role_id,
            'tenant_id': model.tenant_id,
            'assigned_by': model.assigned_by,
            'expires_at': model.expires_at
        }
    
    def find_by_user_and_tenant(self, user_id: str, tenant_id: str) -> List[UserRole]:
        """Find user roles by user and tenant"""
        return self.find_by_criteria({'user_id': user_id, 'tenant_id': tenant_id})
    
    def find_roles_for_user(self, user_id: str, tenant_id: str) -> Dict[str, List[str]]:
        """Get user roles grouped by application"""
        query = """
            SELECT r.app_id, r.role_name
            FROM user_roles ur
            JOIN roles r ON ur.role_id = r.role_id
            WHERE ur.user_id = %s AND ur.tenant_id = %s
            ORDER BY r.app_id, r.role_name
        """
        results = execute_query(query, (user_id, tenant_id))
        
        roles_by_app = {}
        for row in results:
            app_id = row['app_id']
            role_name = row['role_name']
            
            if app_id not in roles_by_app:
                roles_by_app[app_id] = []
            roles_by_app[app_id].append(role_name)
        
        return roles_by_app

class UserAccessDAO(BaseDAO[UserAccess]):
    """DAO for UserAccess assignments"""
    
    def __init__(self):
        super().__init__('user_access', UserAccess, 'user_id')
    
    def dict_to_model(self, data: Dict[str, Any]) -> UserAccess:
        return UserAccess(
            user_id=data['user_id'],
            company_id=data['company_id'],
            tenant_id=data['tenant_id'],
            access_type=data.get('access_type', 'direct'),
            granted_at=data.get('granted_at'),
            granted_by=data.get('granted_by'),
            expires_at=data.get('expires_at')
        )
    
    def model_to_dict(self, model: UserAccess) -> Dict[str, Any]:
        return {
            'user_id': model.user_id,
            'company_id': model.company_id,
            'tenant_id': model.tenant_id,
            'access_type': model.access_type,
            'granted_by': model.granted_by,
            'expires_at': model.expires_at
        }
    
    def find_by_user_and_tenant(self, user_id: str, tenant_id: str) -> List[UserAccess]:
        """Find user access by user and tenant"""
        return self.find_by_criteria({'user_id': user_id, 'tenant_id': tenant_id})
    
    def get_user_companies(self, user_id: str, tenant_id: str) -> List[str]:
        """Get list of company IDs user has access to"""
        query = """
            SELECT company_id FROM user_access
            WHERE user_id = %s AND tenant_id = %s
            ORDER BY company_id
        """
        results = execute_query(query, (user_id, tenant_id))
        return [row['company_id'] for row in results]

class TeamMembershipDAO(BaseDAO[TeamMembership]):
    """DAO for TeamMembership assignments"""
    
    def __init__(self):
        super().__init__('team_memberships', TeamMembership, 'user_id')
    
    def dict_to_model(self, data: Dict[str, Any]) -> TeamMembership:
        return TeamMembership(
            user_id=data['user_id'],
            team_id=data['team_id'],
            role_in_team=data.get('role_in_team', 'member'),
            joined_at=data.get('joined_at'),
            joined_by=data.get('joined_by')
        )
    
    def model_to_dict(self, model: TeamMembership) -> Dict[str, Any]:
        return {
            'user_id': model.user_id,
            'team_id': model.team_id,
            'role_in_team': model.role_in_team,
            'joined_by': model.joined_by
        }
    
    def find_by_user(self, user_id: str) -> List[TeamMembership]:
        """Find team memberships by user"""
        return self.find_by_criteria({'user_id': user_id})
    
    def find_by_team(self, team_id: UUID) -> List[TeamMembership]:
        """Find team memberships by team"""
        return self.find_by_criteria({'team_id': team_id})

# Composite DAO for complex queries

class UserProfileDAO:
    """DAO for complex user profile queries"""
    
    def __init__(self):
        self.user_dao = UserDAO()
        self.user_role_dao = UserRoleDAO()
        self.user_access_dao = UserAccessDAO()
        self.team_dao = TeamDAO()
        self.team_membership_dao = TeamMembershipDAO()
    
    def get_user_effective_permissions(self, user_id: str, tenant_id: str) -> List[UserEffectivePermission]:
        """Get all effective permissions for user (direct + team-based)"""
        query = """
            SELECT * FROM user_effective_permissions
            WHERE user_id = %s AND tenant_id = %s
            ORDER BY app_id, permission_name
        """
        results = execute_query(query, (user_id, tenant_id))
        
        return [
            UserEffectivePermission(
                user_id=row['user_id'],
                tenant_id=row['tenant_id'],
                app_id=row['app_id'],
                role_name=row['role_name'],
                permission_name=row['permission_name'],
                source_type=row['source_type'],
                source_id=row['source_id']
            )
            for row in results
        ]
    
    def get_user_effective_access(self, user_id: str, tenant_id: str) -> List[UserEffectiveAccess]:
        """Get all effective company access for user (direct + team-based)"""
        query = """
            SELECT * FROM user_effective_access
            WHERE user_id = %s AND tenant_id = %s
            ORDER BY company_name
        """
        results = execute_query(query, (user_id, tenant_id))
        
        return [
            UserEffectiveAccess(
                user_id=row['user_id'],
                tenant_id=row['tenant_id'],
                company_id=row['company_id'],
                company_name=row['company_name'],
                source_type=row['source_type'],
                source_id=row['source_id']
            )
            for row in results
        ]
    
    def get_complete_user_profile(self, user_id: str, tenant_id: str) -> Optional[UserProfile]:
        """Get complete user profile with all roles, permissions, and access"""
        user = self.user_dao.find_by_id(user_id)
        if not user:
            return None
        
        # Get roles by application
        roles = self.user_role_dao.find_roles_for_user(user_id, tenant_id)
        
        # Get permissions by application
        permissions_data = self.get_user_effective_permissions(user_id, tenant_id)
        permissions = {}
        for perm in permissions_data:
            if perm.app_id not in permissions:
                permissions[perm.app_id] = []
            if perm.permission_name not in permissions[perm.app_id]:
                permissions[perm.app_id].append(perm.permission_name)
        
        # Get company access
        companies = self.user_access_dao.get_user_companies(user_id, tenant_id)
        
        # Get team memberships
        teams = [team.team_name for team in self.team_dao.find_by_user(user_id)]
        
        return UserProfile(
            user=user,
            roles=roles,
            permissions=permissions,
            companies=companies,
            teams=teams,
            tenant_id=tenant_id
        ) 