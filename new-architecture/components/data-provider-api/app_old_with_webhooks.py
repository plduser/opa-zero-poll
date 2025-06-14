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
import json
from typing import Dict, List, Optional, Any
import hashlib
import hmac
from model2_validator import Model2Validator, Model2AuthorizationEngine
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
import atexit

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
INTEGRATION_SCRIPTS_URL = os.environ.get("INTEGRATION_SCRIPTS_URL", "http://integration-scripts-api:8000")
OPA_URL = os.environ.get("OPA_URL", "http://opa-standalone-new:8181")  
PROVISIONING_API_URL = os.environ.get("PROVISIONING_API_URL", "http://provisioning-api-new:8010")

# GitHub webhook configuration
WEBHOOK_SECRET = os.environ.get("WEBHOOK_SECRET", "default-secret-key-change-in-production")

# Wczytaj dane Model 2 jeśli dostępne
MODEL2_DATA = None
MODEL2_AVAILABLE = True
try:
    with open("model2-sample-data.json", "r", encoding="utf-8") as f:
        MODEL2_DATA = json.load(f)
    logger.info("✅ Model 2 data loaded successfully")
    
    # Walidacja danych Model 2
    validator = Model2Validator()
    if validator.validate(MODEL2_DATA):
        logger.info("✅ Model 2 data validation passed")
    else:
        logger.error("❌ Model 2 data validation failed")
        MODEL2_AVAILABLE = False
        
except (FileNotFoundError, ImportError):
    logger.warning("⚠️ Model 2 data file or validator not found - using only Model 1")
    MODEL2_AVAILABLE = False
except json.JSONDecodeError as e:
    logger.error(f"❌ Error parsing Model 2 data: {e}")
    MODEL2_AVAILABLE = False
except Exception as e:
    logger.error(f"❌ Error loading Model 2: {e}")
    MODEL2_AVAILABLE = False

# Statyczne dane testowe ACL (Model 1)
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

# Synchronization status tracking
sync_status = {
    "last_sync": None,
    "status": "idle",  # idle, running, success, error
    "message": "",
    "tenant_count": 0,
    "errors": []
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

# ============ MODEL 2 ENDPOINTS ============

@app.route("/v2/authorization", methods=["GET"])
def get_model2_data():
    """
    Zwraca kompletne dane autoryzacyjne w formacie Model 2
    
    Returns:
        JSON: Kompletne dane Model 2 zawierające użytkowników, role, access, teams, członkostwa i uprawnienia
    """
    logger.info("Model 2 authorization data requested")
    
    if not MODEL2_AVAILABLE or MODEL2_DATA is None:
        logger.warning("Model 2 data not available")
        return jsonify({
            "error": "Model 2 not available",
            "message": "Model 2 data not loaded or validation failed",
            "fallback": {
                "available_endpoints": ["/tenants/{tenant_id}/acl", "/tenants"],
                "model1_data": "Use legacy endpoints for Model 1 data"
            }
        }), 503
    
    # Dodaj metadane do odpowiedzi
    response_data = MODEL2_DATA.copy()
    response_data["metadata"] = {
        "retrieved_at": datetime.datetime.utcnow().isoformat(),
        "model_version": "2.0",
        "data_source": "model2-sample-data.json",
        "validation_status": "passed"
    }
    
    logger.info("Model 2 authorization data successfully retrieved")
    return jsonify(response_data), 200

@app.route("/v2/users/<user_id>/authorization", methods=["GET"])
def get_user_authorization(user_id):
    """
    Zwraca dane autoryzacyjne dla konkretnego użytkownika
    
    Args:
        user_id (str): Identyfikator użytkownika
        
    Returns:
        JSON: Dane autoryzacyjne użytkownika zawierające role, dostęp do firm i efektywne uprawnienia
    """
    logger.info(f"User authorization data requested for user: {user_id}")
    
    if not MODEL2_AVAILABLE or MODEL2_DATA is None:
        logger.warning("Model 2 data not available")
        return jsonify({
            "error": "Model 2 not available"
        }), 503
    
    # Sprawdź czy użytkownik istnieje
    if user_id not in MODEL2_DATA.get("users", {}):
        logger.warning(f"User {user_id} not found")
        return jsonify({
            "error": "User not found",
            "user_id": user_id,
            "available_users": list(MODEL2_DATA.get("users", {}).keys())
        }), 404
    
    try:
        # Użyj autoryzacyjnego engine'a do obliczenia efektywnych uprawnień
        auth_engine = Model2AuthorizationEngine(MODEL2_DATA)
        
        # Pobierz podstawowe dane użytkownika
        user_data = MODEL2_DATA["users"][user_id].copy()
        
        # Dodaj efektywne role dla każdej aplikacji
        effective_roles = {}
        for app in MODEL2_DATA.get("applications", {}):
            roles = auth_engine.get_effective_roles(user_id, app)
            if roles:
                effective_roles[app] = roles
        
        # Dodaj dostęp do firm
        company_access = auth_engine.get_company_access(user_id)
        
        # Dodaj efektywne uprawnienia dla każdej aplikacji i firmy
        effective_permissions = {}
        for app in MODEL2_DATA.get("applications", {}):
            effective_permissions[app] = {}
            for company_id in company_access:
                permissions = auth_engine.get_effective_permissions(user_id, app, company_id)
                if permissions:
                    effective_permissions[app][company_id] = permissions
        
        response_data = {
            "user_id": user_id,
            "user_data": user_data,
            "effective_roles": effective_roles,
            "company_access": company_access,
            "effective_permissions": effective_permissions,
            "retrieved_at": datetime.datetime.utcnow().isoformat()
        }
        
        logger.info(f"User authorization data successfully retrieved for user: {user_id}")
        return jsonify(response_data), 200
        
    except Exception as e:
        logger.error(f"Error processing user authorization: {e}")
        return jsonify({
            "error": "Internal server error",
            "message": "Failed to process user authorization"
        }), 500

@app.route("/v2/users/<user_id>/permissions", methods=["GET"])
def check_user_permissions(user_id):
    """
    Sprawdza konkretne uprawnienia użytkownika dla określonej aplikacji i firmy
    
    Query parameters:
        app (str): Identyfikator aplikacji (wymagany)
        company_id (str): Identyfikator firmy (wymagany)
        permission (str): Konkretne uprawnienie do sprawdzenia (opcjonalne)
        
    Returns:
        JSON: Informacje o uprawnieniach użytkownika
    """
    app = request.args.get('app')
    company_id = request.args.get('company_id')
    permission = request.args.get('permission')
    
    logger.info(f"Permission check requested for user: {user_id}, app: {app}, company: {company_id}")
    
    if not app or not company_id:
        return jsonify({
            "error": "Missing required parameters",
            "required": ["app", "company_id"],
            "provided": {
                "app": app,
                "company_id": company_id
            }
        }), 400
    
    if not MODEL2_AVAILABLE or MODEL2_DATA is None:
        return jsonify({
            "error": "Model 2 not available"
        }), 503
    
    # Sprawdź czy użytkownik istnieje
    if user_id not in MODEL2_DATA.get("users", {}):
        return jsonify({
            "error": "User not found",
            "user_id": user_id
        }), 404
    
    try:
        auth_engine = Model2AuthorizationEngine(MODEL2_DATA)
        
        # Sprawdź czy użytkownik ma dostęp do firmy
        has_company_access = auth_engine.has_company_access(user_id, company_id)
        if not has_company_access:
            return jsonify({
                "user_id": user_id,
                "app": app,
                "company_id": company_id,
                "has_access": False,
                "reason": "No access to company",
                "checked_at": datetime.datetime.utcnow().isoformat()
            }), 200
        
        # Pobierz wszystkie efektywne uprawnienia
        all_permissions = auth_engine.get_effective_permissions(user_id, app, company_id)
        
        response_data = {
            "user_id": user_id,
            "app": app,
            "company_id": company_id,
            "has_access": True,
            "all_permissions": all_permissions,
            "checked_at": datetime.datetime.utcnow().isoformat()
        }
        
        # Jeśli sprawdzane jest konkretne uprawnienie
        if permission:
            has_permission = auth_engine.has_permission(user_id, app, company_id, permission)
            response_data["specific_permission"] = {
                "permission": permission,
                "granted": has_permission
            }
        
        logger.info(f"Permission check completed for user: {user_id}")
        return jsonify(response_data), 200
        
    except Exception as e:
        logger.error(f"Error checking permissions: {e}")
        return jsonify({
            "error": "Internal server error",
            "message": "Failed to check permissions"
        }), 500

@app.route("/v2/health", methods=["GET"])
def model2_health_check():
    """
    Sprawdza status Model 2 i walidację danych
    
    Returns:
        JSON: Status Model 2, dostępność danych i wyniki walidacji
    """
    logger.info("Model 2 health check requested")
    
    health_data = {
        "model2_available": MODEL2_AVAILABLE,
        "timestamp": datetime.datetime.utcnow().isoformat()
    }
    
    if MODEL2_AVAILABLE and MODEL2_DATA:
        try:
            validator = Model2Validator()
            validation_result = validator.validate(MODEL2_DATA)
            
            # Statystyki danych
            stats = {
                "users_count": len(MODEL2_DATA.get("users", {})),
                "teams_count": len(MODEL2_DATA.get("teams", {})),
                "applications_count": len(MODEL2_DATA.get("applications", {})),
                "roles_count": len(MODEL2_DATA.get("roles", {})),
                "permissions_count": len(MODEL2_DATA.get("permissions", {}))
            }
            
            health_data.update({
                "validation_status": "passed" if validation_result else "failed",
                "data_stats": stats,
                "status": "healthy"
            })
            
        except Exception as e:
            health_data.update({
                "validation_status": "error",
                "validation_error": str(e),
                "status": "unhealthy"
            })
    else:
        health_data.update({
            "status": "unavailable",
            "reason": "Model 2 data not loaded or failed validation"
        })
    
    status_code = 200 if MODEL2_AVAILABLE else 503
    logger.info(f"Model 2 health check completed - status: {health_data['status']}")
    
    return jsonify(health_data), status_code

@app.route("/", methods=["GET"])
def root():
    """Endpoint główny z informacjami o API"""
    endpoints = {
        "health": "/health",
        "tenant_acl": "/tenants/{tenant_id}/acl", 
        "list_tenants": "/tenants"
    }
    
    # Dodaj endpointy Model 2 jeśli dostępne
    if MODEL2_AVAILABLE:
        endpoints.update({
            "model2_authorization": "/v2/authorization",
            "model2_user_auth": "/v2/users/{user_id}/authorization",
            "model2_user_permissions": "/v2/users/{user_id}/permissions?app={app}&company_id={company_id}",
            "model2_health": "/v2/health"
        })
    
    return jsonify({
        "service": "Data Provider API",
        "version": "2.0.0",
        "description": "Standalone ACL data provider for OPA Zero Poll system",
        "supported_models": ["Model 1 (Legacy)"] + (["Model 2 (RBAC+REBAC)"] if MODEL2_AVAILABLE else []),
        "endpoints": endpoints,
        "available_tenants": list(ACL_DATA.keys()),
        "model2_status": "available" if MODEL2_AVAILABLE else "unavailable"
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
    
    # Weryfikuj sygnaturę GitHub (tymczasowo wyłączone dla testów OPAL)
    # TODO: Przywrócić weryfikację po skonfigurowaniu OPAL
    # if not verify_github_signature(payload_body, signature_header):
    #     logger.error("GitHub webhook signature verification failed")
    #     return jsonify({
    #         "error": "Unauthorized",
    #         "message": "Invalid signature"
    #     }), 401
    logger.info("GitHub signature verification temporarily disabled for OPAL testing")
    
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
    
    # Przetwórz event lokalnie
    try:
        processing_result = process_policy_changes(webhook_data)
        
        # Log wyniki lokalnego przetwarzania
        if processing_result.get("policy_changes_detected"):
            logger.info(f"Policy changes detected: {len(processing_result['processed_files'])} files affected")
            for file_info in processing_result["processed_files"]:
                logger.info(f"  {file_info['action']}: {file_info['file']} (commit: {file_info['commit']})")
        else:
            logger.info("No policy changes detected in webhook")
        
        # NOWE: Przekieruj webhook do OPAL Server
        opal_webhook_result = forward_webhook_to_opal(webhook_data, event_type, delivery_id)
        
        # Przygotuj response
        response_data = {
            "status": "success",
            "message": "Webhook processed and forwarded to OPAL Server",
            "event_type": event_type,
            "delivery_id": delivery_id,
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "processing_result": processing_result,
            "opal_forwarding": opal_webhook_result
        }
        
        # Oznacz czy potrzebna akcja (synchronizacja z OPA)
        if processing_result.get("action_required"):
            response_data["action_required"] = True
            response_data["next_step"] = "Policy synchronization handled by OPAL Server"
            
        logger.info("GitHub webhook processed and forwarded to OPAL Server successfully")
        return jsonify(response_data), 200
        
    except Exception as e:
        logger.error(f"Error processing webhook: {e}")
        return jsonify({
            "error": "Internal Server Error",
            "message": "Failed to process webhook",
            "delivery_id": delivery_id
        }), 500

def forward_webhook_to_opal(webhook_data: Dict[str, Any], event_type: str, delivery_id: str) -> Dict[str, Any]:
    """
    Przekierowuje GitHub webhook do OPAL Server
    
    Args:
        webhook_data: Dane webhook z GitHub
        event_type: Typ eventu GitHub
        delivery_id: ID dostawy webhook
        
    Returns:
        Dict z wynikiem przekierowania
    """
    try:
        # URL OPAL Server webhook endpoint
        opal_webhook_url = "http://opal-server:7002/webhook"
        
        # Przygotuj headers dla OPAL Server
        headers = {
            'Content-Type': 'application/json',
            'X-GitHub-Event': event_type,
            'X-GitHub-Delivery': delivery_id,
            'User-Agent': 'Data-Provider-API-Forwarder/1.0'
        }
        
        logger.info(f"Forwarding webhook to OPAL Server: {event_type} (delivery: {delivery_id})")
        
        # Wyślij webhook do OPAL Server
        response = requests.post(
            opal_webhook_url,
            json=webhook_data,
            headers=headers,
            timeout=10  # Krótszy timeout dla webhook forwarding
        )
        
        if response.status_code == 200:
            logger.info(f"Webhook successfully forwarded to OPAL Server: {delivery_id}")
            return {
                "success": True,
                "status_code": response.status_code,
                "message": "Webhook forwarded to OPAL Server successfully",
                "opal_response": response.json() if response.content else None
            }
        else:
            logger.warning(f"OPAL Server returned non-200 status: {response.status_code}")
            return {
                "success": False,
                "status_code": response.status_code,
                "message": f"OPAL Server returned HTTP {response.status_code}",
                "error": response.text[:200] if response.text else "No response body"
            }
            
    except requests.exceptions.Timeout:
        logger.error(f"Timeout forwarding webhook to OPAL Server: {delivery_id}")
        return {
            "success": False,
            "error": "timeout",
            "message": "Timeout forwarding webhook to OPAL Server"
        }
    except requests.exceptions.ConnectionError:
        logger.error(f"Connection error forwarding webhook to OPAL Server: {delivery_id}")
        return {
            "success": False,
            "error": "connection_error",
            "message": "Cannot connect to OPAL Server"
        }
    except Exception as e:
        logger.error(f"Error forwarding webhook to OPAL Server: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": "Unexpected error forwarding webhook to OPAL Server"
        }

def call_integration_script(action: str, tenant_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Wywołuje Integration Script przez HTTP request
    
    Args:
        action: Akcja do wykonania ('sync_all', 'sync_tenant', 'health_check')
        tenant_id: ID tenanta (wymagane dla 'sync_tenant')
        
    Returns:
        Dict z wynikiem operacji
    """
    try:
        # URL Integration Scripts API (zakładamy że ma REST endpoint)
        integration_url = f"{INTEGRATION_SCRIPTS_URL}/api"
        
        payload = {
            "action": action,
            "timestamp": datetime.datetime.utcnow().isoformat()
        }
        
        if tenant_id:
            payload["tenant_id"] = tenant_id
            
        logger.info(f"Calling Integration Script: {action} for tenant: {tenant_id or 'all'}")
        
        response = requests.post(
            f"{integration_url}/execute",
            json=payload,
            headers={'Content-Type': 'application/json'},
            timeout=30  # Longer timeout for sync operations
        )
        
        if response.status_code == 200:
            result = response.json()
            logger.info(f"Integration Script call successful: {action}")
            return {
                "success": True,
                "result": result,
                "message": f"Successfully executed {action}"
            }
        else:
            logger.error(f"Integration Script call failed: {response.status_code}")
            return {
                "success": False,
                "error": f"HTTP {response.status_code}",
                "message": f"Failed to execute {action}"
            }
            
    except requests.exceptions.Timeout:
        logger.error(f"Integration Script call timeout: {action}")
        return {
            "success": False,
            "error": "timeout",
            "message": f"Timeout executing {action}"
        }
    except requests.exceptions.ConnectionError:
        logger.error(f"Integration Script connection error: {action}")
        return {
            "success": False,
            "error": "connection_error", 
            "message": f"Cannot connect to Integration Scripts"
        }
    except Exception as e:
        logger.error(f"Integration Script call error: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": f"Unexpected error executing {action}"
        }

@app.route("/sync/trigger", methods=["POST"])
def trigger_full_sync():
    """
    Ręcznie uruchamia pełną synchronizację wszystkich tenantów
    """
    global sync_status
    
    logger.info("Manual full synchronization triggered")
    
    # Sprawdź czy synchronizacja już trwa
    if sync_status["status"] == "running":
        return jsonify({
            "error": "Synchronization already in progress",
            "current_status": sync_status
        }), 409
    
    # Ustaw status na running
    sync_status.update({
        "status": "running",
        "message": "Full synchronization in progress",
        "last_sync": datetime.datetime.utcnow().isoformat(),
        "errors": []
    })
    
    try:
        # Wywołaj Integration Script
        result = call_integration_script("sync_all")
        
        if result["success"]:
            sync_status.update({
                "status": "success",
                "message": "Full synchronization completed successfully",
                "tenant_count": result.get("result", {}).get("tenant_count", 0)
            })
            
            return jsonify({
                "message": "Full synchronization completed successfully",
                "status": sync_status,
                "result": result["result"]
            }), 200
        else:
            sync_status.update({
                "status": "error",
                "message": result["message"],
                "errors": [result.get("error", "Unknown error")]
            })
            
            return jsonify({
                "error": "Synchronization failed",
                "status": sync_status,
                "details": result
            }), 500
            
    except Exception as e:
        logger.error(f"Unexpected error during full sync: {e}")
        sync_status.update({
            "status": "error",
            "message": f"Unexpected error: {str(e)}",
            "errors": [str(e)]
        })
        
        return jsonify({
            "error": "Synchronization failed",
            "status": sync_status
        }), 500

@app.route("/sync/tenant/<tenant_id>", methods=["POST"])
def trigger_tenant_sync(tenant_id):
    """
    Uruchamia synchronizację dla konkretnego tenanta
    
    Args:
        tenant_id (str): ID tenanta do synchronizacji
    """
    logger.info(f"Manual tenant synchronization triggered for: {tenant_id}")
    
    if not tenant_id:
        return jsonify({
            "error": "tenant_id is required"
        }), 400
    
    try:
        # Wywołaj Integration Script dla konkretnego tenanta
        result = call_integration_script("sync_tenant", tenant_id)
        
        if result["success"]:
            return jsonify({
                "message": f"Tenant {tenant_id} synchronization completed successfully",
                "tenant_id": tenant_id,
                "timestamp": datetime.datetime.utcnow().isoformat(),
                "result": result["result"]
            }), 200
        else:
            return jsonify({
                "error": f"Tenant {tenant_id} synchronization failed",
                "tenant_id": tenant_id,
                "timestamp": datetime.datetime.utcnow().isoformat(),
                "details": result
            }), 500
            
    except Exception as e:
        logger.error(f"Unexpected error during tenant sync for {tenant_id}: {e}")
        return jsonify({
            "error": f"Tenant {tenant_id} synchronization failed",
            "tenant_id": tenant_id,
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "details": str(e)
        }), 500

@app.route("/sync/status", methods=["GET"])
def get_sync_status():
    """
    Zwraca status ostatniej synchronizacji
    """
    logger.info("Sync status requested")
    
    return jsonify({
        "sync_status": sync_status,
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "service": "data-provider-api"
    }), 200

@app.route("/sync/health", methods=["GET"])
def sync_health_check():
    """
    Sprawdza czy Integration Scripts są dostępne
    """
    logger.info("Sync health check requested")
    
    try:
        result = call_integration_script("health_check")
        
        if result["success"]:
            return jsonify({
                "status": "healthy",
                "integration_scripts": "available",
                "message": "Integration Scripts are responding",
                "timestamp": datetime.datetime.utcnow().isoformat(),
                "details": result["result"]
            }), 200
        else:
            return jsonify({
                "status": "unhealthy",
                "integration_scripts": "unavailable", 
                "message": "Integration Scripts are not responding",
                "timestamp": datetime.datetime.utcnow().isoformat(),
                "error": result.get("error", "Unknown error")
            }), 503
            
    except Exception as e:
        logger.error(f"Sync health check error: {e}")
        return jsonify({
            "status": "unhealthy",
            "integration_scripts": "error",
            "message": "Error checking Integration Scripts",
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "error": str(e)
        }), 503

from scheduler import DataSyncScheduler

# Globalna instancja schedulera
data_scheduler = None

@app.route("/sync/schedule", methods=["GET"])
def get_schedule_info():
    """Zwraca informacje o harmonogramie automatycznej synchronizacji"""
    global data_scheduler
    
    if data_scheduler is None:
        return jsonify({"enabled": False, "message": "Scheduler not initialized"}), 503
    
    return jsonify(data_scheduler.get_status()), 200

@app.route("/sync/schedule", methods=["POST"])
def control_schedule():
    """Kontroluje harmonogram automatycznej synchronizacji (start/stop/restart)"""
    global data_scheduler
    
    if data_scheduler is None:
        return jsonify({"error": "Scheduler not initialized"}), 503
    
    data = request.get_json() or {}
    action = data.get("action", "").lower()
    
    if action == "start":
        if data_scheduler.is_running():
            return jsonify({"message": "Scheduler is already running"}), 200
        
        if data_scheduler.start():
            return jsonify({
                "message": "Scheduler started successfully",
                "interval_minutes": data_scheduler.sync_interval_minutes
            }), 200
        else:
            return jsonify({"error": "Failed to start scheduler"}), 500
    
    elif action == "stop":
        if data_scheduler.stop():
            return jsonify({"message": "Scheduler stopped successfully"}), 200
        else:
            return jsonify({"message": "Scheduler is not running"}), 200
    
    elif action == "restart":
        if data_scheduler.restart():
            return jsonify({
                "message": "Scheduler restarted successfully",
                "interval_minutes": data_scheduler.sync_interval_minutes
            }), 200
        else:
            return jsonify({"error": "Failed to restart scheduler"}), 500
    
    else:
        return jsonify({"error": "Invalid action. Use 'start', 'stop', or 'restart'"}), 400

# Modyfikacja sekcji if __name__ == "__main__":
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8110))
    debug = os.environ.get("DEBUG", "false").lower() == "true"
    
    logger.info(f"Starting Data Provider API on port {port}")
    
    # Inicjalizuj scheduler
    data_scheduler = DataSyncScheduler(call_integration_script, sync_status)
    data_scheduler.start()
    
    app.run(host="0.0.0.0", port=port, debug=debug) 