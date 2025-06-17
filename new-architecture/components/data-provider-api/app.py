#!/usr/bin/env python3
"""
Data Provider API - Wersja z integracją bazy danych

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

# Import database integration
try:
    from database_integration import get_tenant_acl_from_database, get_all_tenants_from_database, is_database_available
    DATABASE_INTEGRATION_AVAILABLE = True
except ImportError as e:
    DATABASE_INTEGRATION_AVAILABLE = False

# Import Users Management endpoints
try:
    from users_endpoints import register_users_endpoints
    USERS_ENDPOINTS_AVAILABLE = True
except ImportError:
    USERS_ENDPOINTS_AVAILABLE = False

# Import Companies Management endpoints
try:
    from companies_endpoints import register_companies_endpoints
    COMPANIES_ENDPOINTS_AVAILABLE = True
except ImportError:
    COMPANIES_ENDPOINTS_AVAILABLE = False

# Import Profiles Management endpoints
try:
    from profiles_endpoints import register_profiles_endpoints
    PROFILES_ENDPOINTS_AVAILABLE = True
except ImportError as e:
    PROFILES_ENDPOINTS_AVAILABLE = False

# Import User Profiles Management endpoints
try:
    from user_profiles_endpoints import register_user_profiles_endpoints
    USER_PROFILES_ENDPOINTS_AVAILABLE = True
except ImportError as e:
    USER_PROFILES_ENDPOINTS_AVAILABLE = False

# Import User Data Sync Service
try:
    from user_data_sync import UserDataSyncService, notify_user_change, sync_full_tenant, get_sync_metrics
    USER_DATA_SYNC_AVAILABLE = True
except ImportError as e:
    USER_DATA_SYNC_AVAILABLE = False

# Import Profile Role Mapper
try:
    from profile_role_mapper import apply_profile_to_user_roles, remove_profile_from_user_roles, sync_user_profiles_to_roles
    PROFILE_ROLE_MAPPER_AVAILABLE = True
except ImportError as e:
    PROFILE_ROLE_MAPPER_AVAILABLE = False

# Import database initialization
try:
    from init_db import init_database
    INIT_DB_AVAILABLE = True
except ImportError as e:
    INIT_DB_AVAILABLE = False
    logger.warning(f"Database initialization not available: {e}")

# Konfiguracja bazy danych będzie dostępna przez DATABASE_INTEGRATION_AVAILABLE

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

# Statyczne dane testowe ACL (Enhanced Model 1) - fallback
ACL_DATA = {
    "tenant1": {
        "tenant_id": "tenant1",
        "tenant_name": "Test Company 1",
        "users": []
    }
}

@app.route("/tenants/<tenant_id>/acl", methods=["GET"])
def get_tenant_acl(tenant_id):
    """Zwraca dane ACL dla określonego tenanta"""
    logger.info(f"ACL data requested for tenant: {tenant_id}")
    
    # Try database integration first
    if DATABASE_INTEGRATION_AVAILABLE and is_database_available():
        logger.info(f"Using database integration for tenant {tenant_id}")
        tenant_data = get_tenant_acl_from_database(tenant_id)
        
        if tenant_data:
            logger.info(f"Returning database ACL data for tenant {tenant_id}: {len(tenant_data.get('users', {}))} users")
            return jsonify({
                "tenant_id": tenant_id,
                "data": tenant_data,
                "timestamp": datetime.datetime.utcnow().isoformat(),
                "model": "1",
                "source": "database"
            })
        else:
            logger.warning(f"Tenant {tenant_id} not found in database")
            return jsonify({
                "error": "Tenant not found",
                "tenant_id": tenant_id,
                "source": "database"
            }), 404
    else:
        logger.error("Database integration not available")
        return jsonify({
            "error": "Database not available",
            "tenant_id": tenant_id
        }), 503

@app.route("/tenants", methods=["GET"])
def list_tenants():
    """Zwraca listę wszystkich dostępnych tenantów"""
    logger.info("Tenants list requested")
    
    if DATABASE_INTEGRATION_AVAILABLE and is_database_available():
        logger.info("Using database integration for tenants list")
        tenant_ids = get_all_tenants_from_database()
        
        tenants_info = []
        for tenant_id in tenant_ids:
            tenant_data = get_tenant_acl_from_database(tenant_id)
            if tenant_data:
                tenants_info.append({
                    "tenant_id": tenant_id,
                    "tenant_name": tenant_data.get("tenant_name", "Unknown"),
                    "user_count": len(tenant_data.get("users", {})),
                    "source": "database"
                })
        
        return jsonify({
            "tenants": tenants_info,
            "total_count": len(tenants_info),
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "source": "database"
        })
    else:
        logger.error("Database integration not available")
        return jsonify({
            "error": "Database not available"
        }), 503

@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    db_available = DATABASE_INTEGRATION_AVAILABLE and is_database_available() if DATABASE_INTEGRATION_AVAILABLE else False
    return jsonify({
        "status": "healthy" if db_available else "degraded",
        "database_available": db_available,
        "timestamp": datetime.datetime.utcnow().isoformat()
    })

@app.route("/", methods=["GET"])
def root():
    """Endpoint główny - informacje o API"""
    return jsonify({
        "service": "Data Provider API",
        "version": "3.1.0",
        "description": "Multi-tenant ACL data provider for OPA with database integration",
        "database_integration": DATABASE_INTEGRATION_AVAILABLE,
        "openapi_docs": "/openapi.json",
        "swagger_ui": "/docs",
        "timestamp": datetime.datetime.utcnow().isoformat()
    })

@app.route("/openapi.json", methods=["GET"])
def get_openapi_spec():
    """Zwraca specyfikację OpenAPI"""
    try:
        with open('openapi.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return jsonify({
            "error": "OpenAPI specification not found",
            "message": "Please ensure openapi.json file exists"
        }), 404

@app.route("/docs")
def swagger_ui():
    """Swagger UI dla dokumentacji API"""
    return '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Data Provider API Documentation</title>
        <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui.css" />
        <style>
            html {
                box-sizing: border-box;
                overflow: -moz-scrollbars-vertical;
                overflow-y: scroll;
            }
            *, *:before, *:after {
                box-sizing: inherit;
            }
            body {
                margin:0;
                background: #fafafa;
            }
        </style>
    </head>
    <body>
        <div id="swagger-ui"></div>
        <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-bundle.js"></script>
        <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-standalone-preset.js"></script>
        <script>
            window.onload = function() {
                const ui = SwaggerUIBundle({
                    url: '/openapi.json',
                    dom_id: '#swagger-ui',
                    deepLinking: true,
                    presets: [
                        SwaggerUIBundle.presets.apis,
                        SwaggerUIStandalonePreset
                    ],
                    plugins: [
                        SwaggerUIBundle.plugins.DownloadUrl
                    ],
                    layout: "StandaloneLayout"
                });
            };
        </script>
    </body>
    </html>
    '''

@app.route("/sync/metrics", methods=["GET"])
def get_user_data_sync_metrics():
    """Endpoint do monitoringu stanu User Data Sync Service"""
    if not USER_DATA_SYNC_AVAILABLE:
        return jsonify({
            "error": "User Data Sync Service is not available",
            "available": False,
            "timestamp": datetime.datetime.utcnow().isoformat()
        }), 503
    
    try:
        metrics = get_sync_metrics()
        return jsonify({
            "user_data_sync_metrics": metrics,
            "available": True,
            "service_status": "healthy" if metrics["success_rate_percent"] >= 90 else "degraded",
            "timestamp": datetime.datetime.utcnow().isoformat()
        })
    except Exception as e:
        logger.error(f"Error getting sync metrics: {e}")
        return jsonify({
            "error": "Failed to get sync metrics",
            "details": str(e),
            "available": USER_DATA_SYNC_AVAILABLE,
            "timestamp": datetime.datetime.utcnow().isoformat()
        }), 500

# Rejestracja endpointów
if USERS_ENDPOINTS_AVAILABLE:
    try:
        register_users_endpoints(app)
        logger.info("✅ Users management endpoints registered")
    except Exception as e:
        logger.error(f"❌ Failed to register users endpoints: {e}")
        USERS_ENDPOINTS_AVAILABLE = False

if COMPANIES_ENDPOINTS_AVAILABLE:
    try:
        register_companies_endpoints(app)
        logger.info("✅ Companies management endpoints registered")
    except Exception as e:
        logger.error(f"❌ Failed to register companies endpoints: {e}")
        COMPANIES_ENDPOINTS_AVAILABLE = False

if PROFILES_ENDPOINTS_AVAILABLE:
    try:
        register_profiles_endpoints(app)
        logger.info("✅ Profiles management endpoints registered")
    except Exception as e:
        logger.error(f"❌ Failed to register profiles endpoints: {e}")
        PROFILES_ENDPOINTS_AVAILABLE = False

if USER_PROFILES_ENDPOINTS_AVAILABLE:
    try:
        register_user_profiles_endpoints(app)
        logger.info("✅ User profiles management endpoints registered")
    except Exception as e:
        logger.error(f"❌ Failed to register user profiles endpoints: {e}")
        USER_PROFILES_ENDPOINTS_AVAILABLE = False

# Rejestracja OPAL External Data Sources endpoints
if OPAL_ENDPOINTS_AVAILABLE:
    try:
        # Model 2 support check (optional)
        model2_available = Model2Validator is not None and Model2Endpoints is not None
        register_opal_endpoints(app, model2_available=model2_available)
        logger.info("✅ OPAL External Data Sources endpoints registered")
        logger.info(f"🔧 Model 2 support: {model2_available}")
    except Exception as e:
        logger.error(f"❌ Failed to register OPAL endpoints: {e}")
        OPAL_ENDPOINTS_AVAILABLE = False

@app.route("/debug/user_access/<user_id>/<tenant_id>", methods=["GET"])
def debug_user_access(user_id, tenant_id):
    """Endpoint diagnostyczny do sprawdzenia user_access dla użytkownika"""
    if not DATABASE_INTEGRATION_AVAILABLE:
        return jsonify({"error": "Database not available"}), 503
    
    try:
        from database.dao import UserAccessDAO, UserRoleDAO
        
        # Sprawdź user_access
        user_access_dao = UserAccessDAO()
        user_accesses = user_access_dao.find_by_criteria({'user_id': user_id, 'tenant_id': tenant_id})
        
        # Sprawdź user_roles
        user_role_dao = UserRoleDAO()
        user_roles = user_role_dao.find_by_user_and_tenant(user_id, tenant_id)
        roles_by_app = user_role_dao.find_roles_for_user(user_id, tenant_id)
        
        return jsonify({
            "user_id": user_id,
            "tenant_id": tenant_id,
            "user_access_records": len(user_accesses),
            "user_access_details": [
                {
                    "company_id": access.company_id,
                    "access_type": access.access_type,
                    "granted_at": str(access.granted_at) if access.granted_at else None
                } for access in user_accesses
            ],
            "user_role_records": len(user_roles),
            "roles_by_app": roles_by_app,
            "timestamp": datetime.datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Debug user_access failed: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/opal/full-snapshot", methods=["GET"])
def get_opal_full_snapshot():
    """
    Endpoint dla OPAL_ALL_DATA_URL - zwraca pełną strukturę danych dla wszystkich tenantów.
    Dane są już w gotowym formacie JSON do załadowania bezpośrednio do OPA data document.
    """
    logger.info("OPAL Full Snapshot requested")
    
    if not (DATABASE_INTEGRATION_AVAILABLE and is_database_available()):
        logger.error("Database integration not available for OPAL full snapshot")
        return jsonify({
            "error": "Database not available"
        }), 503
    
    try:
        # Pobierz wszystkich tenantów z bazy danych
        tenant_ids = get_all_tenants_from_database()
        logger.info(f"Found {len(tenant_ids)} tenants: {tenant_ids}")
        
        # Buduj pełną strukturę danych dla OPA
        full_data = {
            "acl": {},  # Struktura ACL dla wszystkich tenantów
            "metadata": {
                "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat().replace('+00:00', 'Z'),
                "source": "data-provider-api",
                "tenants_count": len(tenant_ids)
            }
        }
        
        # Dla każdego tenanta pobierz ACL dane
        for tenant_id in tenant_ids:
            try:
                logger.info(f"Processing tenant: {tenant_id}")
                
                # Pobierz ACL dla tego tenanta z Model 2
                acl_data = get_tenant_acl_from_database(tenant_id)
                
                if acl_data:
                    # Dodaj dane ACL do struktury pod ścieżką /acl/{tenant_id}
                    full_data["acl"][tenant_id] = acl_data
                    logger.info(f"Added ACL data for tenant {tenant_id}")
                else:
                    logger.warning(f"No ACL data found for tenant {tenant_id}")
                    # Nawet jeśli brak danych, dodaj pustą strukturę
                    full_data["acl"][tenant_id] = {
                        "tenant_id": tenant_id,
                        "users": {},
                        "roles": {},
                        "permissions": {}
                    }
                    
            except Exception as e:
                logger.error(f"Error processing tenant {tenant_id}: {str(e)}")
                # W przypadku błędu, dodaj placeholder
                full_data["acl"][tenant_id] = {
                    "tenant_id": tenant_id,
                    "error": f"Failed to load data: {str(e)}",
                    "users": {},
                    "roles": {},
                    "permissions": {}
                }
        
        logger.info(f"OPAL Full Snapshot generated with {len(full_data['acl'])} tenants")
        
        # Zwróć gotowe dane JSON - format OPAL_ALL_DATA_URL
        return jsonify(full_data)
        
    except Exception as e:
        logger.error(f"Error generating OPAL full snapshot: {str(e)}")
        return jsonify({
            "error": f"Failed to generate snapshot: {str(e)}"
        }), 500

# Endpoint inicjalizacji bazy danych
@app.route("/init-db", methods=["POST"])
def initialize_database():
    """
    Inicjalizuje bazę danych schema i seed data
    Endpoint dostępny dla administratorów Railway
    """
    try:
        logger.info("🚀 Rozpoczęcie inicjalizacji bazy danych przez API endpoint")
        
        if not INIT_DB_AVAILABLE:
            return jsonify({
                "status": "error",
                "message": "Moduł inicjalizacji bazy danych nie jest dostępny"
            }), 500
        
        # Uruchom inicjalizację
        success = init_database()
        
        if success:
            return jsonify({
                "status": "success",
                "message": "Baza danych została zainicjalizowana pomyślnie",
                "timestamp": datetime.datetime.utcnow().isoformat()
            })
        else:
            return jsonify({
                "status": "error",
                "message": "Inicjalizacja bazy danych nie powiodła się"
            }), 500
            
    except Exception as e:
        logger.error(f"Błąd inicjalizacji bazy danych: {e}")
        return jsonify({
            "status": "error",
            "message": f"Błąd podczas inicjalizacji: {str(e)}"
        }), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8110))
    debug = os.environ.get("DEBUG", "false").lower() == "true"
    
    logger.info(f"🚀 Starting Data Provider API on port {port}")
    logger.info(f"🔧 Debug mode: {debug}")
    logger.info(f"💾 Database integration: {DATABASE_INTEGRATION_AVAILABLE}")
    logger.info(f"🔗 OPAL External Data Sources: {OPAL_ENDPOINTS_AVAILABLE}")
    
    app.run(host="0.0.0.0", port=port, debug=debug) 