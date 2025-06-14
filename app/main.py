"""
Policy Management Service - Główna aplikacja FastAPI
"""
import asyncio
import structlog
from contextlib import asynccontextmanager
from datetime import datetime, timedelta
from fastapi import FastAPI, Request, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from .config import settings
from .models import HealthResponse
from .routers import policies, webhooks
from .services.event_emitter import EventEmitter
from .services.policy_storage import PolicyStorage

# Konfiguracja loggera
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.dev.ConsoleRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

# Zmienne globalne dla serwisów
event_emitter: EventEmitter = None
policy_storage: PolicyStorage = None
app_start_time = datetime.utcnow()

# Security
security = HTTPBearer(auto_error=False)

async def verify_api_key(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Weryfikacja klucza API"""
    if not settings.api_key:
        return True  # Brak konfiguracji - dozwolony dostęp
    
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key required"
        )
    
    if credentials.credentials != settings.api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key"
        )
    
    return True

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager aplikacji"""
    global event_emitter, policy_storage
    
    logger.info("🚀 Uruchamianie Policy Management Service", version=settings.app_version)
    
    # Inicjalizacja serwisów
    event_emitter = EventEmitter(settings.opal_server_url)
    policy_storage = PolicyStorage()
    
    # Test połączenia z OPAL Server
    try:
        await event_emitter.test_connection()
        logger.info("✅ Połączenie z OPAL Server OK")
    except Exception as e:
        logger.warning("⚠️ Nie można połączyć się z OPAL Server", error=str(e))
    
    # Udostępnij serwisy w app state
    app.state.event_emitter = event_emitter
    app.state.policy_storage = policy_storage
    
    yield
    
    # Cleanup
    logger.info("🛑 Zamykanie Policy Management Service")
    if event_emitter:
        await event_emitter.close()

# Tworzenie aplikacji FastAPI
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Hybrydowy serwis zarządzania politykami z obsługą GitHub webhook i REST API",
    lifespan=lifespan,
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware dla logowania requestów
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Middleware do logowania requestów"""
    start_time = datetime.utcnow()
    
    logger.info(
        "📥 Request otrzymany",
        method=request.method,
        url=str(request.url),
        client=request.client.host if request.client else "unknown"
    )
    
    response = await call_next(request)
    
    process_time = (datetime.utcnow() - start_time).total_seconds()
    
    logger.info(
        "📤 Response wysłany",
        method=request.method,
        url=str(request.url),
        status_code=response.status_code,
        process_time=f"{process_time:.3f}s"
    )
    
    return response

# Podstawowe endpointy
@app.get("/", include_in_schema=False)
async def root():
    """Root endpoint"""
    return {
        "service": settings.app_name,
        "version": settings.app_version,
        "status": "ok",
        "docs_url": "/docs" if settings.debug else None
    }

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    uptime = datetime.utcnow() - app_start_time
    
    return HealthResponse(
        version=settings.app_version,
        uptime=f"{uptime.total_seconds():.0f}s"
    )

# Dołączenie routerów
app.include_router(
    policies.router,
    prefix="/api",
    tags=["Policies"],
    dependencies=[Depends(verify_api_key)]
)

app.include_router(
    webhooks.router,
    prefix="/webhook",
    tags=["Webhooks"]
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level=settings.log_level.lower()
    ) 