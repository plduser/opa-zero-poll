"""
Data Provider API - Standalone Service
Symuluje zewnętrzny system ACL dostarczający dane uprawnień dla różnych tenantów.
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import logging
import datetime
import os
import requests
import time
from typing import Dict, List, Optional, Any
import hashlib
import hmac

# Konfiguracja logowania
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Metryki aplikacji
class AppMetrics:
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
INTEGRATION_SCRIPTS_URL = os.environ.get("INTEGRATION_SCRIPTS_URL", "http://localhost:8000")
OPA_URL = os.environ.get("OPA_URL", "http://opa-standalone-new:8181")  
PROVISIONING_API_URL = os.environ.get("PROVISIONING_API_URL", "http://provisioning-api-new:8010")

# GitHub webhook configuration
WEBHOOK_SECRET = os.environ.get("WEBHOOK_SECRET", "default-secret-key-change-in-production")

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
        "opa": check_service_health("OPA", f"{OPA_URL}"),  # OPA nie ma /health, używamy root endpoint
        "provisioning_api": check_service_health("Provisioning API", f"{PROVISIONING_API_URL}/health"),
        # Integration Scripts nie mają standardowego health endpoint, więc sprawdzamy tylko dostępność
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
        "version": "2.0.0",
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "uptime_seconds": round(metrics.get_uptime(), 2),
        "request_count": metrics.request_count,
        "last_health_check": metrics.last_health_check.isoformat() if metrics.last_health_check else None,
        "dependencies": dependencies,
        "environment": {
            "integration_scripts_url": INTEGRATION_SCRIPTS_URL,
            "opa_url": OPA_URL,
            "provisioning_api_url": PROVISIONING_API_URL
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

def verify_github_signature(payload_body: bytes, signature_header: str) -> bool:
    """
    Weryfikuje sygnaturę GitHub webhook używając HMAC-SHA256
    
    Args:
        payload_body: Raw bytes payload from GitHub
        signature_header: X-Hub-Signature-256 header value
        
    Returns:
        bool: True jeśli sygnatura jest poprawna, False w przeciwnym razie
    """
    if not signature_header:
        logger.warning("Missing GitHub signature header")
        return False
    
    # Signature header format: "sha256=<signature>"
    try:
        algorithm, signature = signature_header.split("=", 1)
        if algorithm != "sha256":
            logger.warning(f"Unsupported signature algorithm: {algorithm}")
            return False
    except ValueError:
        logger.warning("Invalid signature header format")
        return False
    
    # Oblicz HMAC-SHA256 z secret key
    expected_signature = hmac.new(
        WEBHOOK_SECRET.encode(),
        payload_body,
        hashlib.sha256
    ).hexdigest()
    
    # Porównaj sygnatury (secure comparison)
    is_valid = hmac.compare_digest(signature, expected_signature)
    
    if not is_valid:
        logger.warning("GitHub webhook signature verification failed")
    
    return is_valid

def process_policy_changes(event_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Przetwarza zmiany w politykach z GitHub webhook
    
    Args:
        event_data: Parsed GitHub webhook payload
        
    Returns:
        Dict z informacjami o przetworzonych zmianach
    """
    result = {
        "processed_files": [],
        "policy_changes_detected": False,
        "action_required": False
    }
    
    # Sprawdź czy to push event
    if event_data.get("zen"):  # ping event
        result["event_type"] = "ping"
        return result
        
    commits = event_data.get("commits", [])
    ref = event_data.get("ref", "")
    repository = event_data.get("repository", {}).get("name", "unknown")
    
    result["event_type"] = "push"
    result["repository"] = repository
    result["ref"] = ref
    result["commits_count"] = len(commits)
    
    # Filtruj tylko główne branche (main, master)
    main_branches = ["refs/heads/main", "refs/heads/master"]
    if ref not in main_branches:
        logger.info(f"Ignoring push to branch {ref} (not main branch)")
        result["ignored_branch"] = True
        return result
    
    # Sprawdź pliki polityk w commit-ach
    policy_extensions = [".rego", ".policy"]
    policy_paths = ["policies/", "policy/", "opa/"]
    
    for commit in commits:
        commit_id = commit.get("id", "unknown")[:8]
        added_files = commit.get("added", [])
        modified_files = commit.get("modified", []) 
        removed_files = commit.get("removed", [])
        
        all_files = added_files + modified_files + removed_files
        
        for file_path in all_files:
            # Sprawdź czy to plik polityki
            is_policy_file = (
                any(file_path.endswith(ext) for ext in policy_extensions) or
                any(path in file_path for path in policy_paths)
            )
            
            if is_policy_file:
                result["processed_files"].append({
                    "file": file_path,
                    "commit": commit_id,
                    "action": "added" if file_path in added_files else 
                             "modified" if file_path in modified_files else "removed"
                })
                result["policy_changes_detected"] = True
                result["action_required"] = True
    
    return result

@app.route("/webhook/policy-update", methods=["POST"])
def github_webhook():
    """
    Endpoint do odbierania GitHub webhook events dla aktualizacji polityk
    
    Obsługuje:
    - Weryfikację sygnatur GitHub
    - Push events z zmianami w politykach  
    - Logging wszystkich event-ów
    - Filtering main branch changes only
    """
    logger.info("GitHub webhook received")
    
    # Pobierz raw payload i headers
    payload_body = request.get_data()
    signature_header = request.headers.get("X-Hub-Signature-256", "")
    event_type = request.headers.get("X-GitHub-Event", "unknown")
    delivery_id = request.headers.get("X-GitHub-Delivery", "unknown")
    
    logger.info(f"Webhook event: {event_type}, delivery: {delivery_id}")
    
    # Weryfikuj sygnaturę GitHub
    if not verify_github_signature(payload_body, signature_header):
        logger.error("GitHub webhook signature verification failed")
        return jsonify({
            "error": "Unauthorized",
            "message": "Invalid signature"
        }), 401
    
    # Parse JSON payload
    try:
        webhook_data = request.get_json()
        if not webhook_data:
            logger.error("Empty or invalid JSON payload")
            return jsonify({
                "error": "Bad Request", 
                "message": "Invalid JSON payload"
            }), 400
    except Exception as e:
        logger.error(f"Failed to parse webhook payload: {e}")
        return jsonify({
            "error": "Bad Request",
            "message": "Failed to parse JSON"
        }), 400
    
    # Przetwórz event
    try:
        processing_result = process_policy_changes(webhook_data)
        
        # Log wyniki
        if processing_result.get("policy_changes_detected"):
            logger.info(f"Policy changes detected: {len(processing_result['processed_files'])} files affected")
            for file_info in processing_result["processed_files"]:
                logger.info(f"  {file_info['action']}: {file_info['file']} (commit: {file_info['commit']})")
        else:
            logger.info("No policy changes detected in webhook")
        
        # Przygotuj response
        response_data = {
            "status": "success",
            "message": "Webhook processed successfully",
            "event_type": event_type,
            "delivery_id": delivery_id,
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "processing_result": processing_result
        }
        
        # Oznacz czy potrzebna akcja (synchronizacja z OPA)
        if processing_result.get("action_required"):
            response_data["action_required"] = True
            response_data["next_step"] = "Policy synchronization with OPA recommended"
            
        logger.info("GitHub webhook processed successfully")
        return jsonify(response_data), 200
        
    except Exception as e:
        logger.error(f"Error processing webhook: {e}")
        return jsonify({
            "error": "Internal Server Error",
            "message": "Failed to process webhook",
            "delivery_id": delivery_id
        }), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8110))
    debug = os.environ.get("DEBUG", "false").lower() == "true"
    
    logger.info(f"Starting Data Provider API on port {port}")
    app.run(host="0.0.0.0", port=port, debug=debug) 