"""
Provisioning API - Standalone Service
Zarządza rejestracją, listowaniem i usuwaniem tenantów w systemie OPA Zero Poll.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import logging
import datetime
import os
import json
from contextlib import contextmanager

# Konfiguracja logowania
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Konfiguracja bazy danych
DATABASE_PATH = os.environ.get("DATABASE_PATH", "tenants.db")

def init_database():
    """Inicjalizuje bazę danych SQLite z tabelą tenantów"""
    current_db_path = os.environ.get("DATABASE_PATH", DATABASE_PATH)
    with sqlite3.connect(current_db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS tenants (
                tenant_id TEXT PRIMARY KEY,
                tenant_name TEXT NOT NULL,
                created_at TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'active',
                metadata TEXT
            )
        """)
        conn.commit()
        logger.info("Database initialized successfully")

@contextmanager
def get_db_connection():
    """Context manager dla połączeń z bazą danych"""
    # Używamy aktualnej wartości DATABASE_PATH
    current_db_path = os.environ.get("DATABASE_PATH", DATABASE_PATH)
    conn = sqlite3.connect(current_db_path)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

@app.before_request
def log_request_info():
    """Loguje wszystkie przychodzące żądania"""
    logger.info(f'Request: {request.method} {request.url} from {request.remote_addr}')
    if request.is_json and request.json:
        logger.info(f'Request data: {request.json}')

@app.route("/health", methods=["GET"])
def health_check():
    """Endpoint zdrowia serwisu"""
    logger.info("Health check requested")
    
    # Sprawdź połączenie z bazą danych
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM tenants")
            tenant_count = cursor.fetchone()[0]
        
        return jsonify({
            "status": "healthy",
            "service": "provisioning-api",
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "version": "1.0.0",
            "database": "connected",
            "tenant_count": tenant_count
        }), 200
        
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({
            "status": "unhealthy",
            "service": "provisioning-api",
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "version": "1.0.0",
            "database": "error",
            "error": str(e)
        }), 500

@app.route("/provision-tenant", methods=["POST"])
def provision_tenant():
    """
    Rejestruje nowego tenanta w systemie
    
    Expected JSON:
    {
        "tenant_id": "tenant123",
        "tenant_name": "Company Name",
        "metadata": {"key": "value"} (optional)
    }
    """
    logger.info("Tenant provisioning requested")
    
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 400
    
    data = request.json
    
    # Walidacja danych wejściowych
    if not data.get("tenant_id"):
        return jsonify({"error": "tenant_id is required"}), 400
    
    if not data.get("tenant_name"):
        return jsonify({"error": "tenant_name is required"}), 400
    
    tenant_id = data["tenant_id"]
    tenant_name = data["tenant_name"]
    metadata = data.get("metadata", {})
    created_at = datetime.datetime.utcnow().isoformat()
    
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            
            # Sprawdź czy tenant już istnieje
            cursor.execute("SELECT tenant_id FROM tenants WHERE tenant_id = ?", (tenant_id,))
            if cursor.fetchone():
                logger.warning(f"Tenant {tenant_id} already exists")
                return jsonify({
                    "error": "Tenant already exists",
                    "tenant_id": tenant_id
                }), 409
            
            # Dodaj nowego tenanta
            cursor.execute("""
                INSERT INTO tenants (tenant_id, tenant_name, created_at, status, metadata)
                VALUES (?, ?, ?, ?, ?)
            """, (tenant_id, tenant_name, created_at, "active", json.dumps(metadata)))
            
            conn.commit()
            
            logger.info(f"Tenant {tenant_id} provisioned successfully")
            
            return jsonify({
                "message": "Tenant provisioned successfully",
                "tenant": {
                    "tenant_id": tenant_id,
                    "tenant_name": tenant_name,
                    "created_at": created_at,
                    "status": "active",
                    "metadata": metadata
                }
            }), 201
            
    except Exception as e:
        logger.error(f"Error provisioning tenant {tenant_id}: {str(e)}")
        return jsonify({
            "error": "Failed to provision tenant",
            "details": str(e)
        }), 500

@app.route("/tenants", methods=["GET"])
def list_tenants():
    """Zwraca listę wszystkich tenantów"""
    logger.info("Tenants list requested")
    
    status_filter = request.args.get('status')
    
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            
            if status_filter:
                cursor.execute("SELECT * FROM tenants WHERE status = ? ORDER BY created_at DESC", (status_filter,))
            else:
                cursor.execute("SELECT * FROM tenants ORDER BY created_at DESC")
            
            rows = cursor.fetchall()
            
            tenants = []
            for row in rows:
                tenant = {
                    "tenant_id": row["tenant_id"],
                    "tenant_name": row["tenant_name"],
                    "created_at": row["created_at"],
                    "status": row["status"],
                    "metadata": json.loads(row["metadata"]) if row["metadata"] else {}
                }
                tenants.append(tenant)
            
            return jsonify({
                "tenants": tenants,
                "total_count": len(tenants),
                "filter": status_filter or "all",
                "retrieved_at": datetime.datetime.utcnow().isoformat()
            }), 200
            
    except Exception as e:
        logger.error(f"Error listing tenants: {str(e)}")
        return jsonify({
            "error": "Failed to list tenants",
            "details": str(e)
        }), 500

@app.route("/tenants/<tenant_id>", methods=["GET"])
def get_tenant(tenant_id):
    """Zwraca szczegóły określonego tenanta"""
    logger.info(f"Tenant details requested for: {tenant_id}")
    
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM tenants WHERE tenant_id = ?", (tenant_id,))
            row = cursor.fetchone()
            
            if not row:
                return jsonify({
                    "error": "Tenant not found",
                    "tenant_id": tenant_id
                }), 404
            
            tenant = {
                "tenant_id": row["tenant_id"],
                "tenant_name": row["tenant_name"],
                "created_at": row["created_at"],
                "status": row["status"],
                "metadata": json.loads(row["metadata"]) if row["metadata"] else {}
            }
            
            return jsonify(tenant), 200
            
    except Exception as e:
        logger.error(f"Error getting tenant {tenant_id}: {str(e)}")
        return jsonify({
            "error": "Failed to get tenant",
            "details": str(e)
        }), 500

@app.route("/tenants/<tenant_id>", methods=["DELETE"])
def delete_tenant(tenant_id):
    """Usuwa tenanta z systemu"""
    logger.info(f"Tenant deletion requested for: {tenant_id}")
    
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            
            # Sprawdź czy tenant istnieje
            cursor.execute("SELECT tenant_id FROM tenants WHERE tenant_id = ?", (tenant_id,))
            if not cursor.fetchone():
                return jsonify({
                    "error": "Tenant not found",
                    "tenant_id": tenant_id
                }), 404
            
            # Usuń tenanta
            cursor.execute("DELETE FROM tenants WHERE tenant_id = ?", (tenant_id,))
            conn.commit()
            
            logger.info(f"Tenant {tenant_id} deleted successfully")
            
            return jsonify({
                "message": "Tenant deleted successfully",
                "tenant_id": tenant_id,
                "deleted_at": datetime.datetime.utcnow().isoformat()
            }), 200
            
    except Exception as e:
        logger.error(f"Error deleting tenant {tenant_id}: {str(e)}")
        return jsonify({
            "error": "Failed to delete tenant",
            "details": str(e)
        }), 500

@app.route("/tenants/<tenant_id>/status", methods=["PUT"])
def update_tenant_status(tenant_id):
    """Aktualizuje status tenanta"""
    logger.info(f"Tenant status update requested for: {tenant_id}")
    
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 400
    
    data = request.json
    new_status = data.get("status")
    
    if not new_status:
        return jsonify({"error": "status is required"}), 400
    
    if new_status not in ["active", "inactive", "suspended"]:
        return jsonify({"error": "status must be one of: active, inactive, suspended"}), 400
    
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            
            # Sprawdź czy tenant istnieje
            cursor.execute("SELECT tenant_id FROM tenants WHERE tenant_id = ?", (tenant_id,))
            if not cursor.fetchone():
                return jsonify({
                    "error": "Tenant not found",
                    "tenant_id": tenant_id
                }), 404
            
            # Zaktualizuj status
            cursor.execute("UPDATE tenants SET status = ? WHERE tenant_id = ?", (new_status, tenant_id))
            conn.commit()
            
            logger.info(f"Tenant {tenant_id} status updated to {new_status}")
            
            return jsonify({
                "message": "Tenant status updated successfully",
                "tenant_id": tenant_id,
                "new_status": new_status,
                "updated_at": datetime.datetime.utcnow().isoformat()
            }), 200
            
    except Exception as e:
        logger.error(f"Error updating tenant {tenant_id} status: {str(e)}")
        return jsonify({
            "error": "Failed to update tenant status",
            "details": str(e)
        }), 500

@app.route("/", methods=["GET"])
def root():
    """Endpoint główny z informacjami o API"""
    return jsonify({
        "service": "Provisioning API",
        "version": "1.0.0",
        "description": "Standalone tenant provisioning service for OPA Zero Poll system",
        "endpoints": {
            "health": "/health",
            "provision_tenant": "POST /provision-tenant",
            "list_tenants": "GET /tenants",
            "get_tenant": "GET /tenants/{tenant_id}",
            "delete_tenant": "DELETE /tenants/{tenant_id}",
            "update_status": "PUT /tenants/{tenant_id}/status"
        }
    }), 200

@app.errorhandler(404)
def not_found(error):
    """Handler dla błędów 404"""
    logger.warning(f"404 error: {request.url}")
    return jsonify({
        "error": "Endpoint not found",
        "url": request.url,
        "available_endpoints": ["/health", "/provision-tenant", "/tenants", "/tenants/{id}", "/"]
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
    # Inicjalizuj bazę danych
    init_database()
    
    port = int(os.environ.get("PORT", 8010))
    debug = os.environ.get("DEBUG", "false").lower() == "true"
    
    logger.info(f"Starting Provisioning API on port {port}")
    app.run(host="0.0.0.0", port=port, debug=debug) 