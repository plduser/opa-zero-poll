"""
Data Provider API - Standalone Service
Symuluje zewnętrzny system ACL dostarczający dane uprawnień dla różnych tenantów.
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import logging
import datetime
import os

# Konfiguracja logowania
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Statyczne dane testowe ACL
ACL_DATA = {
    "tenant1": {
        "tenant_id": "tenant1",
        "tenant_name": "Test Company 1", 
        "users": [
            {
                "user_id": "user1",
                "username": "admin_user",
                "roles": ["admin"],
                "permissions": ["read", "write", "delete", "manage_users"]
            },
            {
                "user_id": "user2", 
                "username": "regular_user",
                "roles": ["user"],
                "permissions": ["read", "write"]
            }
        ],
        "roles": {
            "admin": ["read", "write", "delete", "manage_users", "manage_tenant"],
            "user": ["read", "write"]
        }
    },
    "tenant2": {
        "tenant_id": "tenant2",
        "tenant_name": "Test Company 2",
        "users": [
            {
                "user_id": "user3",
                "username": "viewer_user", 
                "roles": ["viewer"],
                "permissions": ["read"]
            }
        ],
        "roles": {
            "viewer": ["read"]
        }
    }
}

@app.before_request
def log_request_info():
    """Loguje wszystkie przychodzące żądania"""
    logger.info(f'Request: {request.method} {request.url} from {request.remote_addr}')

@app.route("/health", methods=["GET"])
def health_check():
    """Endpoint zdrowia serwisu"""
    logger.info("Health check requested")
    return jsonify({
        "status": "healthy",
        "service": "data-provider-api",
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "version": "1.0.0"
    }), 200

@app.route("/tenants/<tenant_id>/acl", methods=["GET"])
def get_tenant_acl(tenant_id):
    """
    Zwraca dane ACL (Access Control List) dla określonego tenanta
    
    Args:
        tenant_id (str): Identyfikator tenanta
        
    Returns:
        JSON: Dane ACL zawierające użytkowników, role i uprawnienia
    """
    logger.info(f"ACL data requested for tenant: {tenant_id}")
    
    if tenant_id not in ACL_DATA:
        logger.warning(f"Tenant {tenant_id} not found")
        return jsonify({
            "error": "Tenant not found",
            "tenant_id": tenant_id,
            "available_tenants": list(ACL_DATA.keys())
        }), 404
    
    acl_data = ACL_DATA[tenant_id].copy()
    acl_data["retrieved_at"] = datetime.datetime.utcnow().isoformat()
    
    logger.info(f"ACL data successfully retrieved for tenant: {tenant_id}")
    return jsonify(acl_data), 200

@app.route("/tenants", methods=["GET"])
def list_tenants():
    """Zwraca listę dostępnych tenantów"""
    logger.info("Tenants list requested")
    
    tenant_list = []
    for tenant_id, data in ACL_DATA.items():
        tenant_list.append({
            "tenant_id": tenant_id,
            "tenant_name": data["tenant_name"],
            "users_count": len(data["users"]),
            "roles_count": len(data["roles"])
        })
    
    return jsonify({
        "tenants": tenant_list,
        "total_count": len(tenant_list),
        "retrieved_at": datetime.datetime.utcnow().isoformat()
    }), 200

@app.route("/", methods=["GET"])
def root():
    """Endpoint główny z informacjami o API"""
    return jsonify({
        "service": "Data Provider API",
        "version": "1.0.0",
        "description": "Standalone ACL data provider for OPA Zero Poll system",
        "endpoints": {
            "health": "/health",
            "tenant_acl": "/tenants/{tenant_id}/acl",
            "list_tenants": "/tenants"
        },
        "available_tenants": list(ACL_DATA.keys())
    }), 200

@app.errorhandler(404)
def not_found(error):
    """Handler dla błędów 404"""
    logger.warning(f"404 error: {request.url}")
    return jsonify({
        "error": "Endpoint not found",
        "url": request.url,
        "available_endpoints": ["/health", "/tenants/{tenant_id}/acl", "/tenants", "/"]
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """Handler dla błędów 500"""
    logger.error(f"500 error: {str(error)}")
    return jsonify({
        "error": "Internal server error",
        "message": "Something went wrong"
    }), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8110))
    debug = os.environ.get("DEBUG", "false").lower() == "true"
    
    logger.info(f"Starting Data Provider API on port {port}")
    app.run(host="0.0.0.0", port=port, debug=debug) 