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
        "timestamp": datetime.datetime.utcnow().isoformat()
    })

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

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8110))
    debug = os.environ.get("DEBUG", "false").lower() == "true"
    
    logger.info(f"🚀 Starting Data Provider API on port {port}")
    logger.info(f"🔧 Debug mode: {debug}")
    logger.info(f"💾 Database integration: {DATABASE_INTEGRATION_AVAILABLE}")
    
    app.run(host="0.0.0.0", port=port, debug=debug) 