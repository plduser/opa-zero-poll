from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum


class PolicyStatus(str, Enum):
    """Policy status enumeration"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    DRAFT = "draft"
    DEPRECATED = "deprecated"


class ValidationSeverity(str, Enum):
    """Validation error severity levels"""
    ERROR = "error"
    WARNING = "warning"
    INFO = "info"


class ValidationError(BaseModel):
    """OPA validation error details"""
    message: str
    line: Optional[int] = None
    column: Optional[int] = None
    severity: ValidationSeverity = ValidationSeverity.ERROR
    code: Optional[str] = None


class PolicyValidationRequest(BaseModel):
    """Request to validate a Rego policy"""
    policy_content: str = Field(..., description="Rego policy content to validate")
    input_data: Optional[Dict[str, Any]] = Field(None, description="Test input data")
    policy_name: Optional[str] = Field(None, description="Policy name for context")


class PolicyValidationResponse(BaseModel):
    """Response from policy validation"""
    valid: bool
    errors: List[ValidationError] = []
    warnings: List[ValidationError] = []
    compilation_time_ms: Optional[int] = None
    result: Optional[Dict[str, Any]] = None


class PolicyTestRequest(BaseModel):
    """Request to test a policy against input data"""
    policy_content: str
    input_data: Dict[str, Any]
    query: Optional[str] = Field("data", description="OPA query to execute")


class PolicyTestResponse(BaseModel):
    """Response from policy testing"""
    success: bool
    result: Dict[str, Any]
    execution_time_ms: int
    errors: List[ValidationError] = []


class Policy(BaseModel):
    """Policy metadata model"""
    id: str
    name: str
    description: Optional[str] = None
    content: str
    status: PolicyStatus = PolicyStatus.DRAFT
    version: str = "1.0.0"
    created_at: datetime
    updated_at: datetime
    author: Optional[str] = None
    tags: List[str] = []


class PolicyCreate(BaseModel):
    """Schema for creating a new policy"""
    name: str
    description: Optional[str] = None
    content: str
    tags: List[str] = []


class PolicyUpdate(BaseModel):
    """Schema for updating a policy"""
    name: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None
    status: Optional[PolicyStatus] = None
    tags: Optional[List[str]] = None 