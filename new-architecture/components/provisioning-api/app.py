"""
Provisioning API - PostgreSQL Service
Zarządza kompletną rejestracją tenantów w systemie OPA Zero Poll z automatycznym tworzeniem
administratora i uprawień Portal.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
import psycopg2.extras
import logging
import datetime
import os
import json
import requests
from contextlib import contextmanager

# Konfiguracja logowania
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Konfiguracja PostgreSQL (używając zmiennych z docker-compose)
DB_CONFIG = {
    'host': os.environ.get('DB_HOST', 'postgres-db'),
    'port': int(os.environ.get('DB_PORT', 5432)),
    'database': os.environ.get('DB_NAME', 'opa_zero_poll'),
    'user': os.environ.get('DB_USER', 'opa_user'),
    'password': os.environ.get('DB_PASSWORD', 'opa_password')
}

# Konfiguracja OPAL Server
OPAL_SERVER_URL = os.environ.get("OPAL_SERVER_URL", "http://opal-server:7002")
DATA_PROVIDER_API_URL = os.environ.get("DATA_PROVIDER_API_URL", "http://data-provider-api:8110")

@contextmanager
def get_db_connection():
    """Context manager dla połączeń z PostgreSQL"""
    conn = None
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        conn.autocommit = False
        yield conn
    except Exception as e:
        if conn:
            conn.rollback()
        raise e
    finally:
        if conn:
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
    
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM tenants")
            tenant_count = cursor.fetchone()[0]
        
        return jsonify({
            "status": "healthy",
            "service": "provisioning-api",
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "version": "2.0.0-postgresql",
            "database": "PostgreSQL connected",
            "tenant_count": tenant_count
        }), 200
        
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({
            "status": "unhealthy",
            "service": "provisioning-api",
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "version": "2.0.0-postgresql",
            "database": "PostgreSQL error",
            "error": str(e)
        }), 500

@app.route("/provision-tenant", methods=["POST"])
def provision_tenant():
    """
    Tworzy kompletną strukturę tenanta w systemie z automatycznymi uprawnieniami administratora
    
    Expected JSON:
    {
        "tenant_id": "tenant123",
        "tenant_name": "Company Name",
        "admin_email": "admin@company.com",
        "admin_name": "Jan Kowalski",
        "metadata": {"key": "value"} (optional)
    }
    """
    logger.info("Complete tenant provisioning requested")
    
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 400
    
    data = request.json
    
    # Walidacja danych wejściowych
    required_fields = ["tenant_id", "tenant_name", "admin_email", "admin_name"]
    for field in required_fields:
        if not data.get(field):
            return jsonify({"error": f"{field} is required"}), 400
    
    tenant_id = data["tenant_id"]
    tenant_name = data["tenant_name"]
    admin_email = data["admin_email"]
    admin_name = data["admin_name"]
    metadata = data.get("metadata", {})
    
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            
            # Sprawdź czy tenant już istnieje
            cursor.execute("SELECT tenant_id FROM tenants WHERE tenant_id = %s", (tenant_id,))
            if cursor.fetchone():
                logger.warning(f"Tenant {tenant_id} already exists")
                return jsonify({
                    "error": "Tenant already exists",
                    "tenant_id": tenant_id
                }), 409
            
            # Wywołaj funkcję tworzenia kompletnej struktury
            result = create_complete_tenant_structure(cursor, tenant_id, tenant_name, admin_email, admin_name, metadata)
            
            if not result["success"]:
                return jsonify({
                    "error": "Failed to create complete tenant structure",
                    "details": result["error"]
                }), 500
            
            conn.commit()
            logger.info(f"Complete tenant structure created for {tenant_id}")
            
            # Publikuj aktualizację do OPAL Server
            publish_tenant_update(tenant_id)
            
            return jsonify({
                "message": "Complete tenant structure provisioned successfully",
                "tenant": {
                    "tenant_id": tenant_id,
                    "tenant_name": tenant_name,
                    "admin_email": admin_email,
                    "admin_name": admin_name,
                    "created_at": datetime.datetime.utcnow().isoformat(),
                    "status": "active",
                    "metadata": metadata
                },
                "structure": result["structure"]
            }), 201
            
    except Exception as e:
        logger.error(f"Error provisioning tenant {tenant_id}: {str(e)}")
        return jsonify({
            "error": "Failed to provision tenant",
            "details": str(e)
        }), 500

def create_complete_tenant_structure(cursor, tenant_id, tenant_name, admin_email, admin_name, metadata=None):
    """
    Tworzy kompletną strukturę tenanta w PostgreSQL:
    - Tenant
    - Pierwsza firma
    - Użytkownik administrator
    - Aplikacja Portal (jeśli nie istnieje)
    - Rola Portal Administrator z automatycznymi uprawnieniami
    - Przypisanie roli do administratora
    """
    try:
        if metadata is None:
            metadata = {}
        
        # 1. Dodaj tenant do głównej tabeli
        cursor.execute("""
            INSERT INTO tenants (tenant_id, tenant_name, description, status, metadata, created_at, updated_at)
            VALUES (%s, %s, %s, 'active', %s, NOW(), NOW())
        """, (tenant_id, tenant_name, f"Tenant utworzony automatycznie dla {admin_name}", json.dumps(metadata)))
        
        # 2. Dodaj pierwszą firmę
        company_id = f"company_{tenant_id}"
        cursor.execute("""
            INSERT INTO companies (company_id, tenant_id, company_name, company_code, description, status, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, 'active', NOW(), NOW())
        """, (company_id, tenant_id, tenant_name, tenant_id.upper(), f"Główna firma dla {tenant_name}"))
        
        # 3. Dodaj użytkownika administratora
        user_id = f"admin_{tenant_id}"
        username = admin_email  # Użyj pełnego email jako username
        cursor.execute("""
            INSERT INTO users (user_id, username, email, full_name, status, created_at, updated_at)
            VALUES (%s, %s, %s, %s, 'active', NOW(), NOW())
        """, (user_id, username, admin_email, admin_name))
        
        # 4. Dodaj dostęp użytkownika do firmy
        cursor.execute("""
            INSERT INTO user_access (user_id, company_id, tenant_id, access_type, granted_at, granted_by)
            VALUES (%s, %s, %s, 'direct', NOW(), 'system')
        """, (user_id, company_id, tenant_id))
        
        # 5. Sprawdź czy aplikacja Portal istnieje
        cursor.execute("SELECT app_id FROM applications WHERE app_id = 'portal'")
        if not cursor.fetchone():
            cursor.execute("""
                INSERT INTO applications (app_id, app_name, description, status, created_at)
                VALUES ('portal', 'Portal', 'Główna aplikacja portalu zarządzania', 'active', NOW())
            """)
        
        # 6. Sprawdź czy rola Portal Administrator istnieje
        cursor.execute("SELECT role_id FROM roles WHERE role_name = 'Portal Administrator' AND app_id = 'portal'")
        portal_admin_role = cursor.fetchone()
        if not portal_admin_role:
            cursor.execute("""
                INSERT INTO roles (role_id, role_name, app_id, description, created_at)
                VALUES (uuid_generate_v4(), 'Portal Administrator', 'portal', 'Administrator portalu z pełnymi uprawnieniami', NOW())
                RETURNING role_id
            """)
            portal_admin_role = cursor.fetchone()
        
        role_id = portal_admin_role[0]
        
        # 7. Dodaj rolę administratora do użytkownika
        cursor.execute("""
            INSERT INTO user_roles (user_id, role_id, tenant_id, assigned_at, assigned_by)
            VALUES (%s, %s, %s, NOW(), 'system')
        """, (user_id, role_id, tenant_id))
        
        # 8. Sprawdź czy uprawnienia Portal Administrator istnieją i przypisz je
        portal_permissions = [
            ('manage_users', 'Zarządzanie użytkownikami'),
            ('manage_companies', 'Zarządzanie firmami'),
            ('manage_roles', 'Zarządzanie rolami'),
            ('manage_permissions', 'Zarządzanie uprawnieniami'),
            ('view_analytics', 'Przeglądanie analityki'),
            ('system_admin', 'Administracja systemu')
        ]
        
        created_permissions = []
        for perm_name, perm_desc in portal_permissions:
            # Dodaj uprawnienie jeśli nie istnieje
            cursor.execute("""
                INSERT INTO permissions (permission_id, permission_name, app_id, description, created_at)
                VALUES (uuid_generate_v4(), %s, 'portal', %s, NOW())
                ON CONFLICT (permission_name, app_id) DO NOTHING
            """, (perm_name, perm_desc))
            
            # Pobierz ID uprawnienia
            cursor.execute("""
                SELECT permission_id FROM permissions 
                WHERE permission_name = %s AND app_id = 'portal'
            """, (perm_name,))
            permission_id = cursor.fetchone()[0]
            
            # Przypisz uprawnienie do roli
            cursor.execute("""
                INSERT INTO role_permissions (role_id, permission_id)
                VALUES (%s, %s)
                ON CONFLICT (role_id, permission_id) DO NOTHING
            """, (role_id, permission_id))
            
            created_permissions.append(perm_name)
        
        # Zwróć informacje o utworzonej strukturze
        structure = {
            "tenant_id": tenant_id,
            "tenant_name": tenant_name,
            "company_id": company_id,
            "admin_user_id": user_id,
            "admin_username": username,
            "admin_email": admin_email,
            "admin_name": admin_name,
            "role_id": str(role_id),
            "role_name": "Portal Administrator",
            "permissions_count": len(created_permissions),
            "permissions": created_permissions
        }
        
        logger.info(f"✅ Complete tenant structure created:")
        logger.info(f"   - Tenant: {tenant_name} ({tenant_id})")
        logger.info(f"   - Company: {company_id}")
        logger.info(f"   - Administrator: {admin_name} ({admin_email})")
        logger.info(f"   - Role: Portal Administrator with {len(created_permissions)} permissions")
        
        return {"success": True, "structure": structure}
        
    except Exception as e:
        logger.error(f"❌ Error creating complete tenant structure: {e}")
        return {"success": False, "error": str(e)}

@app.route("/tenants", methods=["GET"])
def list_tenants():
    """Zwraca listę wszystkich tenantów z PostgreSQL"""
    logger.info("Tenants list requested")
    
    status_filter = request.args.get('status')
    
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            
            if status_filter:
                cursor.execute("""
                    SELECT t.*, 
                           COUNT(c.company_id) as company_count,
                           COUNT(u.user_id) as user_count
                    FROM tenants t
                    LEFT JOIN companies c ON t.tenant_id = c.tenant_id
                    LEFT JOIN user_access ua ON t.tenant_id = ua.tenant_id
                    LEFT JOIN users u ON ua.user_id = u.user_id
                    WHERE t.status = %s
                    GROUP BY t.tenant_id, t.tenant_name, t.description, t.status, t.metadata, t.created_at, t.updated_at
                    ORDER BY t.created_at DESC
                """, (status_filter,))
            else:
                cursor.execute("""
                    SELECT t.*, 
                           COUNT(c.company_id) as company_count,
                           COUNT(u.user_id) as user_count
                    FROM tenants t
                    LEFT JOIN companies c ON t.tenant_id = c.tenant_id
                    LEFT JOIN user_access ua ON t.tenant_id = ua.tenant_id
                    LEFT JOIN users u ON ua.user_id = u.user_id
                    GROUP BY t.tenant_id, t.tenant_name, t.description, t.status, t.metadata, t.created_at, t.updated_at
                    ORDER BY t.created_at DESC
                """)
            
            rows = cursor.fetchall()
            
            tenants = []
            for row in rows:
                tenant = dict(row)
                # Konwertuj metadata z JSON string na dict jeśli jest string
                if isinstance(tenant.get('metadata'), str):
                    try:
                        tenant['metadata'] = json.loads(tenant['metadata'])
                    except:
                        tenant['metadata'] = {}
                # Konwertuj daty na ISO format
                for date_field in ['created_at', 'updated_at']:
                    if tenant.get(date_field):
                        tenant[date_field] = tenant[date_field].isoformat()
                tenants.append(tenant)
            
            return jsonify({
                "tenants": tenants,
                "count": len(tenants),
                "database": "PostgreSQL"
            }), 200
            
    except Exception as e:
        logger.error(f"Error listing tenants: {str(e)}")
        return jsonify({
            "error": "Failed to list tenants",
            "details": str(e)
        }), 500

@app.route("/tenants/<tenant_id>", methods=["GET"])
def get_tenant(tenant_id):
    """Zwraca szczegóły tenanta z PostgreSQL wraz z powiązanymi danymi"""
    logger.info(f"Tenant details requested for: {tenant_id}")
    
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            
            # Pobierz dane tenanta
            cursor.execute("SELECT * FROM tenants WHERE tenant_id = %s", (tenant_id,))
            tenant_row = cursor.fetchone()
            
            if not tenant_row:
                return jsonify({"error": "Tenant not found"}), 404
            
            tenant = dict(tenant_row)
            # Konwertuj metadata z JSON
            if isinstance(tenant.get('metadata'), str):
                try:
                    tenant['metadata'] = json.loads(tenant['metadata'])
                except:
                    tenant['metadata'] = {}
            
            # Pobierz firmy tenanta
            cursor.execute("SELECT * FROM companies WHERE tenant_id = %s ORDER BY created_at", (tenant_id,))
            companies = [dict(row) for row in cursor.fetchall()]
            
            # Pobierz użytkowników tenanta (przez user_access)
            cursor.execute("""
                SELECT DISTINCT u.*, ua.access_type, ua.granted_at
                FROM users u
                JOIN user_access ua ON u.user_id = ua.user_id
                WHERE ua.tenant_id = %s
                ORDER BY u.created_at
            """, (tenant_id,))
            users = [dict(row) for row in cursor.fetchall()]
            
            # Konwertuj daty na ISO format
            for date_field in ['created_at', 'updated_at']:
                if tenant.get(date_field):
                    tenant[date_field] = tenant[date_field].isoformat()
            
            for company in companies:
                for date_field in ['created_at', 'updated_at']:
                    if company.get(date_field):
                        company[date_field] = company[date_field].isoformat()
                if isinstance(company.get('metadata'), str):
                    try:
                        company['metadata'] = json.loads(company['metadata'])
                    except:
                        company['metadata'] = {}
            
            for user in users:
                for date_field in ['created_at', 'updated_at', 'granted_at']:
                    if user.get(date_field):
                        user[date_field] = user[date_field].isoformat()
                if isinstance(user.get('metadata'), str):
                    try:
                        user['metadata'] = json.loads(user['metadata'])
                    except:
                        user['metadata'] = {}
            
            return jsonify({
                "tenant": tenant,
                "companies": companies,
                "users": users,
                "database": "PostgreSQL"
            }), 200
            
    except Exception as e:
        logger.error(f"Error getting tenant {tenant_id}: {str(e)}")
        return jsonify({
            "error": "Failed to get tenant",
            "details": str(e)
        }), 500

@app.route("/tenants/<tenant_id>", methods=["DELETE"])
def delete_tenant(tenant_id):
    """Usuwa tenanta i wszystkie powiązane dane z PostgreSQL"""
    logger.info(f"Tenant deletion requested for: {tenant_id}")
    
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            
            # Sprawdź czy tenant istnieje
            cursor.execute("SELECT tenant_id FROM tenants WHERE tenant_id = %s", (tenant_id,))
            if not cursor.fetchone():
                return jsonify({"error": "Tenant not found"}), 404
            
            # Usuń powiązane dane (kaskadowo dzięki foreign keys)
            # Najpierw policz co usuniemy
            cursor.execute("SELECT COUNT(*) FROM companies WHERE tenant_id = %s", (tenant_id,))
            company_count = cursor.fetchone()[0]
            
            cursor.execute("""
                SELECT COUNT(DISTINCT u.user_id) FROM users u
                JOIN user_access ua ON u.user_id = ua.user_id
                WHERE ua.tenant_id = %s
            """, (tenant_id,))
            user_count = cursor.fetchone()[0]
            
            # Usuń tenanta (kaskadowo usuwa companies, user_access, user_roles)
            cursor.execute("DELETE FROM tenants WHERE tenant_id = %s", (tenant_id,))
            
            conn.commit()
            logger.info(f"Tenant {tenant_id} deleted successfully with {company_count} companies and {user_count} users")
            
            return jsonify({
                "message": "Tenant deleted successfully",
                "tenant_id": tenant_id,
                "deleted_companies": company_count,
                "affected_users": user_count
            }), 200
            
    except Exception as e:
        logger.error(f"Error deleting tenant {tenant_id}: {str(e)}")
        return jsonify({
            "error": "Failed to delete tenant",
            "details": str(e)
        }), 500

@app.route("/tenants/<tenant_id>/status", methods=["PUT"])
def update_tenant_status(tenant_id):
    """Aktualizuje status tenanta w PostgreSQL"""
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
            cursor.execute("SELECT status FROM tenants WHERE tenant_id = %s", (tenant_id,))
            result = cursor.fetchone()
            if not result:
                return jsonify({"error": "Tenant not found"}), 404
            
            old_status = result[0]
            
            if old_status == new_status:
                return jsonify({
                    "message": "Status unchanged",
                    "tenant_id": tenant_id,
                    "status": new_status
                }), 200
            
            # Aktualizuj status
            cursor.execute("""
                UPDATE tenants 
                SET status = %s, updated_at = NOW() 
                WHERE tenant_id = %s
            """, (new_status, tenant_id))
            
            conn.commit()
            logger.info(f"Tenant {tenant_id} status updated from {old_status} to {new_status}")
            
            return jsonify({
                "message": "Tenant status updated successfully",
                "tenant_id": tenant_id,
                "old_status": old_status,
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
    """Root endpoint z informacjami o serwisie"""
    return jsonify({
        "service": "provisioning-api",
        "version": "2.0.0-postgresql",
        "description": "Complete tenant provisioning with PostgreSQL backend",
        "endpoints": {
            "health": "GET /health",
            "provision": "POST /provision-tenant",
            "list": "GET /tenants",
            "get": "GET /tenants/{tenant_id}",
            "delete": "DELETE /tenants/{tenant_id}",
            "update_status": "PUT /tenants/{tenant_id}/status"
        },
        "database": "PostgreSQL",
        "features": [
            "Complete tenant structure creation",
            "Automatic Portal Administrator setup",
            "Full permissions management",
            "OPAL integration"
        ]
    }), 200

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal server error: {str(error)}")
    return jsonify({"error": "Internal server error"}), 500

def publish_tenant_update(tenant_id, action="add"):
    """
    Publikuje aktualizację danych tenanta do OPAL Server
    używając rewolucyjnego single topic multi-tenant
    """
    try:
        data = {
            "entries": [
                {
                    "url": f"{DATA_PROVIDER_API_URL}/tenants/{tenant_id}/acl",
                    "topics": ["multi_tenant_data"],  # Single topic for all tenants
                    "dst_path": f"/acl/{tenant_id}"   # Hierarchical isolation
                }
            ],
            "reason": f"Tenant {action}: {tenant_id} provisioning complete"
        }
        
        response = requests.post(
            f"{OPAL_SERVER_URL}/data/config",
            json=data,
            timeout=10
        )
        
        if response.status_code == 200:
            logger.info(f"✅ OPAL update published for tenant {tenant_id} (action: {action})")
        else:
            logger.warning(f"⚠️ OPAL update failed for tenant {tenant_id}: {response.status_code}")
            
    except Exception as e:
        logger.error(f"❌ Error publishing OPAL update for tenant {tenant_id}: {e}")

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 8010))
    app.run(host="0.0.0.0", port=port, debug=False) 