"""
Data models for OPA Zero Poll database entities
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, List, Dict, Any
from uuid import UUID

@dataclass
class Tenant:
    """Tenant model"""
    tenant_id: str
    tenant_name: str
    description: Optional[str] = None
    status: str = 'active'
    metadata: Dict[str, Any] = field(default_factory=dict)
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

@dataclass
class User:
    """User model"""
    user_id: str
    username: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    status: str = 'active'
    metadata: Dict[str, Any] = field(default_factory=dict)
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

@dataclass
class Application:
    """Application model"""
    app_id: str
    app_name: str
    description: Optional[str] = None
    status: str = 'active'
    metadata: Dict[str, Any] = field(default_factory=dict)
    created_at: Optional[datetime] = None

@dataclass
class Company:
    """Company model"""
    company_id: str
    tenant_id: str
    company_name: str
    company_code: Optional[str] = None
    description: Optional[str] = None
    parent_company_id: Optional[str] = None
    status: str = 'active'
    metadata: Dict[str, Any] = field(default_factory=dict)
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

@dataclass
class Role:
    """Role model"""
    role_id: UUID
    app_id: str
    role_name: str
    description: Optional[str] = None
    is_system_role: bool = False
    metadata: Dict[str, Any] = field(default_factory=dict)
    created_at: Optional[datetime] = None

@dataclass
class Permission:
    """Permission model"""
    permission_id: UUID
    app_id: str
    permission_name: str
    description: Optional[str] = None
    resource_type: Optional[str] = None
    action: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    created_at: Optional[datetime] = None

@dataclass
class RolePermission:
    """Role-Permission assignment model"""
    role_id: UUID
    permission_id: UUID
    granted_at: Optional[datetime] = None
    granted_by: Optional[str] = None

@dataclass
class UserRole:
    """User-Role assignment model"""
    user_id: str
    role_id: UUID
    tenant_id: str
    assigned_at: Optional[datetime] = None
    assigned_by: Optional[str] = None
    expires_at: Optional[datetime] = None

@dataclass
class UserAccess:
    """User-Company access model"""
    user_id: str
    company_id: str
    tenant_id: str
    access_type: str = 'direct'
    granted_at: Optional[datetime] = None
    granted_by: Optional[str] = None
    expires_at: Optional[datetime] = None

@dataclass
class Team:
    """Team model"""
    team_id: UUID
    tenant_id: str
    team_name: str
    description: Optional[str] = None
    parent_team_id: Optional[UUID] = None
    team_type: str = 'functional'
    status: str = 'active'
    metadata: Dict[str, Any] = field(default_factory=dict)
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

@dataclass
class TeamMembership:
    """Team membership model"""
    user_id: str
    team_id: UUID
    role_in_team: str = 'member'
    joined_at: Optional[datetime] = None
    joined_by: Optional[str] = None

@dataclass
class TeamRole:
    """Team-Role assignment model"""
    team_id: UUID
    role_id: UUID
    assigned_at: Optional[datetime] = None
    assigned_by: Optional[str] = None

@dataclass
class TeamCompany:
    """Team-Company assignment model"""
    team_id: UUID
    company_id: str
    access_type: str = 'manage'
    assigned_at: Optional[datetime] = None
    assigned_by: Optional[str] = None

# Composite models for complex queries

@dataclass
class UserEffectivePermission:
    """User effective permission (from direct roles and team memberships)"""
    user_id: str
    tenant_id: str
    app_id: str
    role_name: str
    permission_name: str
    source_type: str  # 'direct' or 'team'
    source_id: Optional[str] = None  # team_id if source_type is 'team'

@dataclass
class UserEffectiveAccess:
    """User effective company access (from direct assignments and team memberships)"""
    user_id: str
    tenant_id: str
    company_id: str
    company_name: str
    source_type: str  # 'direct' or 'team'
    source_id: Optional[str] = None  # team_id if source_type is 'team'

@dataclass
class UserProfile:
    """Complete user profile with roles, permissions, and access"""
    user: User
    roles: Dict[str, List[str]]  # app_id -> list of role names
    permissions: Dict[str, List[str]]  # app_id -> list of permission names
    companies: List[str]  # list of company_ids
    teams: List[str]  # list of team names
    tenant_id: str

@dataclass
class TenantSummary:
    """Tenant summary with counts"""
    tenant: Tenant
    user_count: int
    company_count: int
    team_count: int
    role_assignment_count: int

# Helper functions for model conversion

def dict_to_tenant(data: Dict[str, Any]) -> Tenant:
    """Convert dictionary to Tenant model"""
    return Tenant(
        tenant_id=data['tenant_id'],
        tenant_name=data['tenant_name'],
        description=data.get('description'),
        status=data.get('status', 'active'),
        metadata=data.get('metadata', {}),
        created_at=data.get('created_at'),
        updated_at=data.get('updated_at')
    )

def dict_to_user(data: Dict[str, Any]) -> User:
    """Convert dictionary to User model"""
    return User(
        user_id=data['user_id'],
        username=data['username'],
        email=data.get('email'),
        full_name=data.get('full_name'),
        status=data.get('status', 'active'),
        metadata=data.get('metadata', {}),
        created_at=data.get('created_at'),
        updated_at=data.get('updated_at')
    )

def dict_to_application(data: Dict[str, Any]) -> Application:
    """Convert dictionary to Application model"""
    return Application(
        app_id=data['app_id'],
        app_name=data['app_name'],
        description=data.get('description'),
        status=data.get('status', 'active'),
        metadata=data.get('metadata', {}),
        created_at=data.get('created_at')
    )

def dict_to_company(data: Dict[str, Any]) -> Company:
    """Convert dictionary to Company model"""
    return Company(
        company_id=data['company_id'],
        tenant_id=data['tenant_id'],
        company_name=data['company_name'],
        company_code=data.get('company_code'),
        description=data.get('description'),
        parent_company_id=data.get('parent_company_id'),
        status=data.get('status', 'active'),
        metadata=data.get('metadata', {}),
        created_at=data.get('created_at'),
        updated_at=data.get('updated_at')
    )

def dict_to_role(data: Dict[str, Any]) -> Role:
    """Convert dictionary to Role model"""
    return Role(
        role_id=data['role_id'],
        app_id=data['app_id'],
        role_name=data['role_name'],
        description=data.get('description'),
        is_system_role=data.get('is_system_role', False),
        metadata=data.get('metadata', {}),
        created_at=data.get('created_at')
    )

def dict_to_permission(data: Dict[str, Any]) -> Permission:
    """Convert dictionary to Permission model"""
    return Permission(
        permission_id=data['permission_id'],
        app_id=data['app_id'],
        permission_name=data['permission_name'],
        description=data.get('description'),
        resource_type=data.get('resource_type'),
        action=data.get('action'),
        metadata=data.get('metadata', {}),
        created_at=data.get('created_at')
    )

def dict_to_team(data: Dict[str, Any]) -> Team:
    """Convert dictionary to Team model"""
    return Team(
        team_id=data['team_id'],
        tenant_id=data['tenant_id'],
        team_name=data['team_name'],
        description=data.get('description'),
        parent_team_id=data.get('parent_team_id'),
        team_type=data.get('team_type', 'functional'),
        status=data.get('status', 'active'),
        metadata=data.get('metadata', {}),
        created_at=data.get('created_at'),
        updated_at=data.get('updated_at')
    ) 