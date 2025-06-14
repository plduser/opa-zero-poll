from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings"""
    
    # API Configuration
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Policy Dashboard API"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "FastAPI backend for OPA Policy Dashboard"
    
    # CORS
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:3000",  # React dev server
        "http://localhost:8000",  # FastAPI docs (original)
        "http://localhost:8001",  # FastAPI docs (current)
    ]
    
    # OPA Configuration
    OPA_BINARY_PATH: str = "opa"  # Assumes OPA is in PATH
    OPA_TIMEOUT: int = 30  # seconds
    
    # OPAL Configuration
    OPAL_SERVER_URL: str = "http://localhost:7002"
    OPAL_CLIENT_URL: str = "http://localhost:7000"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    DEBUG: bool = False
    
    # Git Configuration (for audit history)
    POLICIES_REPO_PATH: str = "./policies"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings() 