"""
Konfiguracja dla Policy Management Service
"""
import os
from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """Ustawienia aplikacji"""
    
    # Podstawowe ustawienia aplikacji
    app_name: str = "Policy Management Service"
    app_version: str = "1.0.0"
    debug: bool = False
    host: str = "0.0.0.0"
    port: int = 8120
    
    # GitHub Webhook
    github_webhook_secret: Optional[str] = None
    github_webhook_path: str = "/webhook/github"
    
    # OPAL Server
    opal_server_url: str = "http://opal-server:7002"
    opal_client_token: Optional[str] = None
    
    # Autoryzacja API
    api_key: Optional[str] = None
    jwt_secret: Optional[str] = None
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Logowanie
    log_level: str = "INFO"
    
    # Retry logic
    max_retries: int = 3
    retry_delay: float = 1.0
    backoff_factor: float = 2.0
    
    class Config:
        env_file = ".env"
        env_prefix = "PMS_"

settings = Settings() 