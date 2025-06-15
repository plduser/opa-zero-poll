#!/usr/bin/env python3
"""
OPAL External Data Sources Endpoints

Implementuje endpoints zgodne z OPAL External Data Sources specification
dla Data Provider API.

Task 36 - Subtask 1: External Data Source endpoints w Data Provider API
"""

import os
import logging
from typing import Dict, Any, Optional
from flask import request, jsonify
import datetime

# Import OPAL JWT components
try:
    import jwt
    from cryptography.hazmat.primitives import serialization
    OPAL_JWT_AVAILABLE = True
except ImportError:
    OPAL_JWT_AVAILABLE = False

logger = logging.getLogger(__name__)

# OPAL Configuration
OPAL_PUBLIC_KEY = os.environ.get("OPAL_PUBLIC_KEY", None)
OPAL_JWT_ALGORITHM = os.environ.get("OPAL_JWT_ALGORITHM", "RS256")
OPAL_JWT_AUDIENCE = os.environ.get("OPAL_JWT_AUDIENCE", "https://api.opal.ac/")
OPAL_JWT_ISSUER = os.environ.get("OPAL_JWT_ISSUER", "https://opal.ac/")

# Opcja wyłączenia JWT validation dla testów/dev
DISABLE_JWT_VALIDATION = os.environ.get("DISABLE_JWT_VALIDATION", "false").lower() == "true"

def validate_opal_jwt(token: str) -> Optional[Dict[str, Any]]:
    """
    Waliduje OPAL JWT token i zwraca claims
    
    Args:
        token: JWT token z OPAL Client
        
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

def get_data_source_config_for_client(client_claims: Dict[str, Any], model2_available: bool = False) -> Dict[str, Any]:
    """
    Generuje DataSourceConfig dla konkretnego OPAL Client na podstawie claims
    
    Args:
        client_claims: Claims z JWT tokenu OPAL Client
        model2_available: Czy Model 2 jest dostępny
        
    Returns:
        DataSourceConfig zgodny z OPAL schema
    """
    # Wyciągnij identyfikator klienta z claims
    client_id = client_claims.get('client_id', 'unknown')
    tenant_id = client_claims.get('tenant_id', client_id)  # Fallback do client_id
    
    logger.info(f"Generating DataSourceConfig for client_id: {client_id}, tenant_id: {tenant_id}")
    
    # Bazowy URL dla tego Data Provider API
    base_url = os.environ.get("DATA_PROVIDER_BASE_URL", "http://data-provider-api:8110")
    
    # Konfiguracja dla Model 1 (legacy ACL) - JEDEN TOPIC dla wszystkich tenantów
    model1_entries = [
        {
            "url": f"{base_url}/tenants/{tenant_id}/acl",
            "dst_path": f"/acl/{tenant_id}",
            "topics": ["multi_tenant_data"],  # JEDEN TOPIC dla wszystkich tenantów
            "config": {
                "headers": {
                    "Accept": "application/json",
                    "User-Agent": "OPAL-Client"
                }
            }
        }
    ]
    
    # Konfiguracja dla Model 2 (jeśli dostępne) - również JEDEN TOPIC
    model2_entries = []
    if model2_available:
        model2_entries = [
            {
                "url": f"{base_url}/v2/authorization",
                "dst_path": "/authorization",
                "topics": ["multi_tenant_data"],  # JEDEN TOPIC dla wszystkich tenantów
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

def register_opal_endpoints(app, model2_available: bool = False):
    """
    Rejestruje OPAL External Data Sources endpoints w Flask app
    
    Args:
        app: Flask application instance
        model2_available: Czy Model 2 jest dostępny
    """
    
    @app.route("/data/config", methods=["GET"])
    def opal_external_data_sources():
        """
        OPAL External Data Sources endpoint
        
        Zwraca DataSourceConfig dla OPAL Client na podstawie JWT token w query param.
        Zgodny z OPAL External Data Sources specification.
        
        Query Parameters:
            token (str): OPAL Client JWT token
            
        Returns:
            JSON: DataSourceConfig z entries dla tego klienta
        """
        logger.info("🔗 OPAL External Data Sources request received")
        
        # Sprawdź czy JWT validation jest wyłączone
        if DISABLE_JWT_VALIDATION:
            logger.info("🔓 JWT validation disabled - generating default config")
            # Generuj domyślną konfigurację bez JWT validation
            default_claims = {
                "client_id": "opal-no-jwt-client",
                "tenant_id": "tenant1",  # Domyślny tenant dla no-JWT mode
                "sub": "opal-no-jwt-client",
                "iss": "opal-no-jwt",
                "aud": "opal-no-jwt"
            }
            
            try:
                data_source_config = get_data_source_config_for_client(default_claims, model2_available)
                logger.info("✅ Returning DataSourceConfig without JWT validation")
                return jsonify(data_source_config), 200
                
            except Exception as e:
                logger.error(f"❌ Error generating no-JWT DataSourceConfig: {e}")
                return jsonify({
                    "error": "Internal server error",
                    "details": "Failed to generate data source configuration"
                }), 500
        
        # Sprawdź czy OPAL JWT jest dostępne (tylko jeśli JWT validation włączone)
        if not OPAL_JWT_AVAILABLE:
            logger.error("❌ OPAL JWT dependencies not available")
            return jsonify({
                "error": "OPAL JWT validation not available",
                "details": "Missing jwt or cryptography dependencies"
            }), 500
        
        # Wyciągnij token z query parameters
        token = request.args.get('token')
        if not token:
            logger.error("❌ Missing OPAL JWT token in query parameters")
            return jsonify({
                "error": "Missing token parameter",
                "details": "OPAL Client JWT token required in 'token' query parameter"
            }), 401
        
        # Sprawdź czy to dev token OPAL
        if token == "THIS_IS_A_DEV_SECRET":
            logger.info("🔧 Using OPAL dev token - generating default config")
            # Generuj domyślną konfigurację dla dev mode
            default_claims = {
                "client_id": "opal-dev-client",
                "tenant_id": "tenant1",  # Domyślny tenant dla dev mode (zmienione z acme na tenant1)
                "sub": "opal-dev-client",
                "iss": "opal-dev",
                "aud": "opal-dev"
            }
            
            try:
                data_source_config = get_data_source_config_for_client(default_claims, model2_available)
                logger.info("✅ Returning dev DataSourceConfig for OPAL dev token")
                return jsonify(data_source_config), 200
                
            except Exception as e:
                logger.error(f"❌ Error generating dev DataSourceConfig: {e}")
                return jsonify({
                    "error": "Internal server error",
                    "details": "Failed to generate dev data source configuration"
                }), 500
        
        # Waliduj JWT token (dla prawdziwych tokenów)
        client_claims = validate_opal_jwt(token)
        if not client_claims:
            logger.error("❌ OPAL JWT token validation failed")
            return jsonify({
                "error": "Invalid or expired token",
                "details": "OPAL Client JWT token validation failed"
            }), 401
        
        # Generuj DataSourceConfig dla tego klienta
        try:
            data_source_config = get_data_source_config_for_client(client_claims, model2_available)
            
            logger.info(f"✅ Returning DataSourceConfig for client: {client_claims.get('client_id', 'unknown')}")
            return jsonify(data_source_config), 200
            
        except Exception as e:
            logger.error(f"❌ Error generating DataSourceConfig: {e}")
            return jsonify({
                "error": "Internal server error",
                "details": "Failed to generate data source configuration"
            }), 500

    @app.route("/opal/health", methods=["GET"])
    def opal_health_check():
        """
        Health check endpoint specyficzny dla OPAL integration
        
        Returns:
            JSON: Status OPAL External Data Sources readiness
        """
        logger.info("🔗 OPAL health check requested")
        
        opal_status = {
            "opal_external_data_sources": True,
            "jwt_validation_enabled": not DISABLE_JWT_VALIDATION,
            "jwt_validation_available": OPAL_JWT_AVAILABLE,
            "public_key_configured": bool(OPAL_PUBLIC_KEY),
            "model1_support": True,
            "model2_support": model2_available,
            "timestamp": datetime.datetime.utcnow().isoformat()
        }
        
        # Sprawdź czy wszystkie wymagane komponenty są dostępne
        if DISABLE_JWT_VALIDATION:
            # Jeśli JWT wyłączone, wszystko jest ready
            all_ready = True
        else:
            # Jeśli JWT włączone, sprawdź czy wszystko jest skonfigurowane
            all_ready = (
                OPAL_JWT_AVAILABLE and 
                bool(OPAL_PUBLIC_KEY) and 
                True  # Model 1 zawsze dostępny
            )
        
        status_code = 200 if all_ready else 503
        opal_status["status"] = "ready" if all_ready else "not_ready"
        
        if all_ready:
            logger.info("✅ OPAL External Data Sources ready")
        else:
            logger.warning("⚠️ OPAL External Data Sources not fully ready")
        
        return jsonify(opal_status), status_code

    logger.info("✅ OPAL External Data Sources endpoints registered") 