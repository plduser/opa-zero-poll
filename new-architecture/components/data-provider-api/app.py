#!/usr/bin/env python3
"""
Data Provider API - Oczyszczona wersja bez webhook i Integration Scripts

Serwis Flask dostarczający dane ACL dla OPA w architekturze multi-tenant.
Obsługuje Model 1 (legacy) i Model 2 (RBAC + REBAC-like).

Przygotowany do integracji z OPAL External Data Sources (Task 36).
"""

import os
import json
import time
import datetime
import logging
from typing import Dict, Any, Optional, List
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
import jwt
from cryptography.hazmat.primitives import serialization

# Import Model 2 components
try:
    from model2_validator import Model2Validator
    from model2_endpoints import Model2Endpoints
except ImportError:
    Model2Validator = None
    Model2Endpoints = None

# Import OPAL External Data Sources
try:
    from opal_endpoints import register_opal_endpoints
    OPAL_ENDPOINTS_AVAILABLE = True
except ImportError:
    OPAL_ENDPOINTS_AVAILABLE = False


# Import Unified Model
try:
    from unified_model import get_unified_tenant_data
    UNIFIED_MODEL_AVAILABLE = True
except ImportError:
    UNIFIED_MODEL_AVAILABLE = False
# Konfiguracja logowania
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

class AppMetrics:
    """Klasa do śledzenia metryk aplikacji"""
    def __init__(self):
        self.start_time = time.time()
        self.request_count = 0
        self.last_health_check = None

    def increment_requests(self):
        self.request_count += 1

    def get_uptime(self):
        return time.time() - self.start_time
    
    def update_health_check(self):
        self.last_health_check = datetime.datetime.utcnow()

metrics = AppMetrics()

# Konfiguracja URL-i serwisów
OPA_URL = os.environ.get("OPA_URL", "http://opa-standalone-new:8181")  
PROVISIONING_API_URL = os.environ.get("PROVISIONING_API_URL", "http://provisioning-api-new:8010")

# Wczytaj dane Model 2 jeśli dostępne
MODEL2_DATA = None
MODEL2_AVAILABLE = True
try:
    with open("model2-sample-data.json", "r", encoding="utf-8") as f:
        MODEL2_DATA = json.load(f)
    logger.info("✅ Model 2 data loaded successfully")
    
    # Walidacja danych Model 2
    if Model2Validator:
        validator = Model2Validator()
        if validator.validate(MODEL2_DATA):
            logger.info("✅ Model 2 data validation passed")
        else:
            logger.error("❌ Model 2 data validation failed")
            MODEL2_AVAILABLE = False
    else:
        logger.warning("⚠️ Model 2 validator not available")
        
except (FileNotFoundError, ImportError):
    logger.warning("⚠️ Model 2 data file or validator not found - using only Model 1")
    MODEL2_AVAILABLE = False
except json.JSONDecodeError as e:
    logger.error(f"❌ Error parsing Model 2 data: {e}")
    MODEL2_AVAILABLE = False
except Exception as e:
    logger.error(f"❌ Error loading Model 2: {e}")
    MODEL2_AVAILABLE = False

# Statyczne dane testowe ACL (Enhanced Model 1)
ACL_DATA = {
    "tenant1": {
        "tenant_id": "tenant1",
        "tenant_name": "Test Company 1",
        "users": [
            {
                "user_id": "user1",
                "username": "admin_user",
                "roles": {
                    "fk": [
                        "fk_admin"
                    ],
                    "hr": [
                        "hr_admin"
                    ],
                    "crm": [
                        "crm_admin"
                    ]
                },
                "permissions": {
                    "fk": [
                        "view_entry",
                        "edit_entry",
                        "delete_entry",
                        "manage_accounts",
                        "generate_reports",
                        "approve_entries"
                    ],
                    "hr": [
                        "view_profile",
                        "edit_profile",
                        "delete_profile",
                        "manage_contracts",
                        "manage_salaries",
                        "generate_hr_reports"
                    ],
                    "crm": [
                        "view_client",
                        "edit_client",
                        "delete_client",
                        "manage_deals",
                        "generate_crm_reports",
                        "manage_pipelines"
                    ]
                },
                "companies": [
                    "company1",
                    "company2"
                ]
            },
            {
                "user_id": "user2",
                "username": "regular_user",
                "roles": {
                    "fk": [
                        "fk_editor"
                    ],
                    "hr": [
                        "hr_viewer"
                    ]
                },
                "permissions": {
                    "fk": [
                        "view_entry",
                        "edit_entry",
                        "generate_reports"
                    ],
                    "hr": [
                        "view_profile",
                        "view_contract"
                    ]
                },
                "companies": [
                    "company1"
                ]
            },
            {
                "user_id": "user3",
                "username": "viewer_user",
                "roles": {
                    "fk": [
                        "fk_viewer"
                    ]
                },
                "permissions": {
                    "fk": [
                        "view_entry",
                        "generate_basic_reports"
                    ]
                },
                "companies": [
                    "company2"
                ]
            }
        ],
        "roles": {
            "fk": {
                "fk_admin": [
                    "view_entry",
                    "edit_entry",
                    "delete_entry",
                    "manage_accounts",
                    "generate_reports",
                    "approve_entries",
                    "manage_chart_of_accounts"
                ],
                "fk_editor": [
                    "view_entry",
                    "edit_entry",
                    "generate_reports",
                    "create_invoices",
                    "edit_invoices"
                ],
                "fk_viewer": [
                    "view_entry",
                    "generate_basic_reports",
                    "view_invoices"
                ]
            },
            "hr": {
                "hr_admin": [
                    "view_profile",
                    "edit_profile",
                    "delete_profile",
                    "manage_contracts",
                    "manage_salaries",
                    "generate_hr_reports",
                    "manage_vacation_requests"
                ],
                "hr_editor": [
                    "view_profile",
                    "edit_profile",
                    "edit_contract",
                    "generate_hr_reports",
                    "manage_vacation_requests"
                ],
                "hr_viewer": [
                    "view_profile",
                    "view_contract",
                    "view_organizational_structure"
                ]
            },
            "crm": {
                "crm_admin": [
                    "view_client",
                    "edit_client",
                    "delete_client",
                    "manage_deals",
                    "generate_crm_reports",
                    "manage_pipelines",
                    "access_analytics"
                ],
                "crm_editor": [
                    "view_client",
                    "edit_client",
                    "manage_deals",
                    "generate_crm_reports",
                    "manage_activities"
                ],
                "crm_viewer": [
                    "view_client",
                    "view_deals",
                    "view_activities",
                    "generate_basic_crm_reports"
                ]
            }
        },
        "companies": [
            "company1",
            "company2"
        ]
    },
    "tenant2": {
        "tenant_id": "tenant2",
        "tenant_name": "Test Company 2",
        "users": [
            {
                "user_id": "user4",
                "username": "hr_specialist",
                "roles": {
                    "hr": [
                        "hr_editor"
                    ]
                },
                "permissions": {
                    "hr": [
                        "view_profile",
                        "edit_profile",
                        "edit_contract",
                        "generate_hr_reports"
                    ]
                },
                "companies": [
                    "company3"
                ]
            }
        ],
        "roles": {
            "hr": {
                "hr_editor": [
                    "view_profile",
                    "edit_profile",
                    "edit_contract",
                    "generate_hr_reports",
                    "manage_vacation_requests"
                ],
                "hr_viewer": [
                    "view_profile",
                    "view_contract"
                ]
            }
        },
        "companies": [
            "company3"
        ]
    }
}

@app.before_request
def log_request_info():
    """Loguje wszystkie przychodzące żądania i aktualizuje metryki"""
    logger.info(f'Request: {request.method} {request.url} from {request.remote_addr}')
    metrics.increment_requests()

def check_service_health(service_name: str, url: str, timeout: int = 5) -> Dict[str, Any]:
    """
    Sprawdza zdrowość zewnętrznego serwisu
    
    Args:
        service_name: Nazwa serwisu
        url: URL endpoint health check
        timeout: Timeout w sekundach
        
    Returns:
        Dict z informacjami o statusie serwisu
    """
    try:
        start_time = time.time()
        response = requests.get(url, timeout=timeout)
        response_time = time.time() - start_time
        
        if response.status_code == 200:
            return {
                "status": "healthy",
                "response_time_ms": round(response_time * 1000, 2),
                "status_code": response.status_code,
                "last_checked": datetime.datetime.utcnow().isoformat()
            }
        else:
            return {
                "status": "unhealthy", 
                "response_time_ms": round(response_time * 1000, 2),
                "status_code": response.status_code,
                "error": f"HTTP {response.status_code}",
                "last_checked": datetime.datetime.utcnow().isoformat()
            }
    except requests.exceptions.Timeout:
        return {
            "status": "unhealthy",
            "error": "Connection timeout",
            "timeout_seconds": timeout,
            "last_checked": datetime.datetime.utcnow().isoformat()
        }
    except requests.exceptions.ConnectionError:
        return {
            "status": "unhealthy", 
            "error": "Connection refused",
            "last_checked": datetime.datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "last_checked": datetime.datetime.utcnow().isoformat()
        }

@app.route("/health", methods=["GET"])
def health_check():
    """Endpoint zdrowia serwisu z sprawdzaniem zależności"""
    logger.info("Health check requested")
    metrics.update_health_check()
    
    # Sprawdzanie zdrowia zależnych serwisów
    dependencies = {
        "opa": check_service_health("OPA", f"{OPA_URL}"),
        "provisioning_api": check_service_health("Provisioning API", f"{PROVISIONING_API_URL}/health"),
    }
    
    # Sprawdzenie czy wszystkie zależności są zdrowe
    all_dependencies_healthy = all(
        dep["status"] == "healthy" for dep in dependencies.values()
    )
    
    # Status głównego serwisu
    service_status = "healthy" if all_dependencies_healthy else "degraded"
    status_code = 200 if all_dependencies_healthy else 503
    
    health_response = {
        "status": service_status,
        "service": "data-provider-api",
        "version": "3.0.0",  # Bumped version after cleanup
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "uptime_seconds": round(metrics.get_uptime(), 2),
        "request_count": metrics.request_count,
        "last_health_check": metrics.last_health_check.isoformat() if metrics.last_health_check else None,
        "dependencies": dependencies,
        "environment": {
            "opa_url": OPA_URL,
            "provisioning_api_url": PROVISIONING_API_URL
        },
        "features": {
            "model1_support": True,
            "model2_support": MODEL2_AVAILABLE,
            "opal_external_data_sources_ready": True
        }
    }
    
    if service_status == "healthy":
        logger.info("✅ Health check passed - all dependencies healthy")
    else:
        logger.warning("⚠️ Health check degraded - some dependencies unhealthy")
    
    return jsonify(health_response), status_code

@app.route("/tenants/<tenant_id>/acl", methods=["GET"])
def get_tenant_acl(tenant_id):
    """
    Zwraca dane ACL (Access Control List) dla określonego tenanta (Model 1)
    
    Args:
        tenant_id (str): Identyfikator tenanta
        
    Returns:
        JSON: Dane ACL zawierające użytkowników, role i uprawnienia
    """
    logger.info(f"ACL data requested for tenant: {tenant_id}")
    
    if tenant_id not in ACL_DATA:
        logger.warning(f"Tenant not found: {tenant_id}")
        return jsonify({
            "error": "Tenant not found",
            "tenant_id": tenant_id,
            "available_tenants": list(ACL_DATA.keys())
        }), 404
    
    tenant_data = ACL_DATA[tenant_id]
    logger.info(f"Returning ACL data for tenant {tenant_id}: {len(tenant_data.get('users', []))} users")
    
    return jsonify({
        "tenant_id": tenant_id,
        "data": tenant_data,
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "model": "1"
    })

@app.route("/tenants", methods=["GET"])
def list_tenants():
    """
    Zwraca listę wszystkich dostępnych tenantów
    
    Returns:
        JSON: Lista tenantów z podstawowymi informacjami
    """
    logger.info("Tenants list requested")
    
    tenants_info = []
    for tenant_id, tenant_data in ACL_DATA.items():
        tenants_info.append({
            "tenant_id": tenant_id,
            "tenant_name": tenant_data.get("tenant_name", "Unknown"),
            "user_count": len(tenant_data.get("users", [])),
            "role_count": len(tenant_data.get("roles", {}))
        })
    
    return jsonify({
        "tenants": tenants_info,
        "total_count": len(tenants_info),
        "timestamp": datetime.datetime.utcnow().isoformat()
    })

# Model 2 Endpoints
if MODEL2_AVAILABLE and Model2Endpoints:
    model2_endpoints = Model2Endpoints(MODEL2_DATA)
    
    @app.route("/v2/authorization", methods=["GET"])
    def get_model2_data():
        """Zwraca pełne dane autoryzacji Model 2"""
        return model2_endpoints.get_authorization_data()
    
    @app.route("/v2/users/<user_id>/authorization", methods=["GET"])
    def get_user_authorization(user_id):
        """Zwraca dane autoryzacji dla konkretnego użytkownika"""
        return model2_endpoints.get_user_authorization(user_id)
    
    @app.route("/v2/users/<user_id>/permissions", methods=["GET"])
    def check_user_permissions(user_id):
        """Sprawdza uprawnienia użytkownika z query parameters"""
        return model2_endpoints.check_user_permissions(user_id, request.args)
    
    @app.route("/v2/health", methods=["GET"])
    def model2_health_check():
        """Health check specyficzny dla Model 2"""
        return model2_endpoints.health_check()

# ============================================================================
# OPAL External Data Sources Integration
# ============================================================================

# Rejestruj OPAL endpoints z opal_endpoints.py
if OPAL_ENDPOINTS_AVAILABLE:
    register_opal_endpoints(app, MODEL2_AVAILABLE)
    logger.info("✅ OPAL External Data Sources endpoints registered")
else:
    logger.warning("⚠️ OPAL endpoints not available - missing dependencies")

# ============================================================================

@app.route("/", methods=["GET"])
def root():
    """
    Endpoint główny - informacje o API
    """
    logger.info("Root endpoint accessed")
    
    return jsonify({
        "service": "Data Provider API",
        "version": "3.0.0",
        "description": "Multi-tenant ACL data provider for OPA",
        "architecture": "OPAL External Data Sources ready",
        "endpoints": {
            "health": "/health",
            "tenants": "/tenants",
            "tenant_acl": "/tenants/{tenant_id}/acl",
            "model2_authorization": "/v2/authorization" if MODEL2_AVAILABLE else None,
            "model2_user_auth": "/v2/users/{user_id}/authorization" if MODEL2_AVAILABLE else None,
            "model2_permissions": "/v2/users/{user_id}/permissions" if MODEL2_AVAILABLE else None,
            "model2_health": "/v2/health" if MODEL2_AVAILABLE else None,
            "opal_data_config": "/data/config",
            "opal_health": "/opal/health"
        },
        "features": {
            "model1_support": True,
            "model2_support": MODEL2_AVAILABLE,
            "opal_external_data_sources": True,
            "webhook_support": False,  # Removed
            "integration_scripts": False  # Removed
        },
        "timestamp": datetime.datetime.utcnow().isoformat()
    })

@app.errorhandler(404)
def not_found(error):
    """Handler dla błędów 404"""
    logger.warning(f"404 error: {request.url}")
    return jsonify({
        "error": "Endpoint not found",
        "url": request.url,
        "available_endpoints": ["/", "/health", "/tenants", "/tenants/{tenant_id}/acl"]
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """Handler dla błędów 500"""
    logger.error(f"500 error: {error}")
    return jsonify({
        "error": "Internal server error",
        "message": "Please check server logs for details"
    }), 500

# ============================================================================
# OPAL External Data Sources Integration
def validate_opal_jwt(token: str) -> Optional[Dict[str, Any]]:
    """
    Waliduje OPAL JWT token
    
    Args:
        token: JWT token string
        
    Returns:
        Dict z claims lub None jeśli token nieprawidłowy
    """
    if not OPAL_JWT_AVAILABLE:
        logger.error("OPAL JWT validation not available - missing dependencies")
        return None
        
    if not OPAL_PUBLIC_KEY:
        logger.error("OPAL_PUBLIC_KEY not configured")
        return None
    
    try:
        # Sprawdź czy to dev token OPAL
        if token == "THIS_IS_A_DEV_SECRET":
            logger.info("🔧 Using OPAL dev token - generating default config")
            # Generuj domyślną konfigurację dla dev mode
            default_claims = {
                "client_id": "opal-dev-client",
                "tenant_id": "acme",  # Domyślny tenant dla dev mode
                "sub": "opal-dev-client",
                "iss": "opal-dev",
                "aud": "opal-dev"
            }
            
            try:
                data_source_config = get_data_source_config_for_client(default_claims)
                logger.info("✅ Returning dev DataSourceConfig for OPAL dev token")
                return jsonify(data_source_config), 200
                
            except Exception as e:
                logger.error(f"❌ Error generating dev DataSourceConfig: {e}")
                return jsonify({
                    "error": "Internal server error",
                    "details": "Failed to generate dev data source configuration"
                }), 500
        
        # Dekoduj public key
        public_key = serialization.load_pem_public_key(
            OPAL_PUBLIC_KEY.encode('utf-8')
        )
        
        # Waliduj JWT
        payload = jwt.decode(
            token,
            public_key,
            algorithms=[OPAL_JWT_ALGORITHM],
            audience=OPAL_JWT_AUDIENCE,
            issuer=OPAL_JWT_ISSUER
        )
        
        logger.info(f"✅ OPAL JWT validated successfully for client: {payload.get('client_id', 'unknown')}")
        return payload
        
    except jwt.ExpiredSignatureError:
        logger.error("❌ OPAL JWT token expired")
        return None
    except jwt.InvalidTokenError as e:
        logger.error(f"❌ OPAL JWT token invalid: {e}")
        return None
    except Exception as e:
        logger.error(f"❌ OPAL JWT validation error: {e}")
        return None

def get_data_source_config_for_client(client_claims: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generuje DataSourceConfig dla konkretnego OPAL Client na podstawie claims
    
    Args:
        client_claims: Claims z JWT tokenu OPAL Client
        
    Returns:
        DataSourceConfig zgodny z OPAL schema
    """
    # Wyciągnij identyfikator klienta z claims
    client_id = client_claims.get('client_id', 'unknown')
    tenant_id = client_claims.get('tenant_id', client_id)  # Fallback do client_id
    
    logger.info(f"Generating DataSourceConfig for client_id: {client_id}, tenant_id: {tenant_id}")
    
    # Bazowy URL dla tego Data Provider API
    base_url = os.environ.get("DATA_PROVIDER_BASE_URL", "http://data-provider-api:8110")
    
    # Konfiguracja dla Model 1 (legacy ACL)
    model1_entries = [
        {
            "url": f"{base_url}/tenants/{tenant_id}/acl",
            "dst_path": f"/acl/{tenant_id}",
            "topics": [f"acl_data/{tenant_id}"],
            "config": {
                "headers": {
                    "Accept": "application/json",
                    "User-Agent": "OPAL-Client"
                }
            }
        }
    ]
    
    # Konfiguracja dla Model 2 (jeśli dostępne)
    model2_entries = []
    if MODEL2_AVAILABLE:
        model2_entries = [
            {
                "url": f"{base_url}/v2/authorization",
                "dst_path": "/authorization",
                "topics": [f"authorization_data/{tenant_id}"],
                "config": {
                    "headers": {
                        "Accept": "application/json",
                        "User-Agent": "OPAL-Client",
                        "X-Tenant-ID": tenant_id
                    }
                }
            }
        ]
    
    # Połącz wszystkie entries
    all_entries = model1_entries + model2_entries
    
    data_source_config = {
        "entries": all_entries
    }
    
    logger.info(f"Generated {len(all_entries)} data source entries for client {client_id}")
    return data_source_config

if __name__ == "__main__":
    logger.info("🚀 Starting Data Provider API...")
    logger.info(f"Model 2 support: {MODEL2_AVAILABLE}")
    app.run(host="0.0.0.0", port=8110, debug=False)
