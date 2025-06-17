"""
Modele danych dla Policy Management Service
"""
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum

class PolicyType(str, Enum):
    """Typ polityki"""
    RBAC = "rbac"
    ABAC = "abac"
    CUSTOM = "custom"

class PolicyStatus(str, Enum):
    """Status polityki"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    DRAFT = "draft"

class EventType(str, Enum):
    """Typ eventu"""
    POLICY_CREATED = "policy_created"
    POLICY_UPDATED = "policy_updated"
    POLICY_DELETED = "policy_deleted"
    WEBHOOK_RECEIVED = "webhook_received"

# Modele policy
class PolicyBase(BaseModel):
    """Bazowy model polityki"""
    name: str = Field(..., description="Nazwa polityki")
    description: Optional[str] = Field(None, description="Opis polityki")
    type: PolicyType = Field(PolicyType.RBAC, description="Typ polityki")
    status: PolicyStatus = Field(PolicyStatus.ACTIVE, description="Status polityki")
    content: str = Field(..., description="Zawartość polityki (Rego)")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Dodatkowe metadane")

class PolicyCreate(PolicyBase):
    """Model do tworzenia polityki"""
    pass

class PolicyUpdate(BaseModel):
    """Model do aktualizacji polityki"""
    name: Optional[str] = None
    description: Optional[str] = None
    type: Optional[PolicyType] = None
    status: Optional[PolicyStatus] = None
    content: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class Policy(PolicyBase):
    """Pełny model polityki"""
    id: str = Field(..., description="ID polityki")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Data utworzenia")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Data ostatniej aktualizacji")
    version: int = Field(1, description="Wersja polityki")

# Modele GitHub webhook
class GitHubCommit(BaseModel):
    """Model commita GitHub"""
    id: str
    message: str
    author: Dict[str, Any]
    modified: List[str] = Field(default_factory=list)
    added: List[str] = Field(default_factory=list)
    removed: List[str] = Field(default_factory=list)

class GitHubPushEvent(BaseModel):
    """Model eventu push z GitHub"""
    ref: str
    before: str
    after: str
    repository: Dict[str, Any]
    commits: List[GitHubCommit] = Field(default_factory=list)
    pusher: Dict[str, Any]

class GitHubPullRequestEvent(BaseModel):
    """Model eventu pull request z GitHub"""
    action: str
    number: int
    pull_request: Dict[str, Any]
    repository: Dict[str, Any]

# Modele event emission
class PolicyUpdateEvent(BaseModel):
    """Event o aktualizacji polityki"""
    event_type: EventType
    policy_id: str
    policy_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    source: str = Field(..., description="Źródło eventu (api, webhook)")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)

class OPALEvent(BaseModel):
    """Event wysyłany do OPAL Server"""
    type: str = "policy_updated"
    policy_updated: bool = True
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    data: Optional[Dict[str, Any]] = Field(default_factory=dict)

# Modele response
class HealthResponse(BaseModel):
    """Response dla health check"""
    status: str = "ok"
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    version: str
    uptime: Optional[str] = None

class APIResponse(BaseModel):
    """Standardowy response API"""
    success: bool
    message: str
    data: Optional[Any] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class WebhookResponse(BaseModel):
    """Response dla webhook"""
    received: bool = True
    processed: bool
    message: str
    event_id: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow) 