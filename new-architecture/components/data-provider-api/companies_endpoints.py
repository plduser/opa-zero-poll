# Companies Management API Endpoints
# Zarządzanie firmami w data-provider-api

import datetime
import logging
import os
from flask import request, jsonify
import psycopg2
from psycopg2.extras import RealDictCursor

logger = logging.getLogger(__name__)

def get_db_connection():
    """Utworz połączenie z bazą danych PostgreSQL"""
    try:
        conn = psycopg2.connect(
            host=os.environ.get("DB_HOST", "postgres-db"),
            port=os.environ.get("DB_PORT", 5432),
            user=os.environ.get("DB_USER", "opa_user"),
            password=os.environ.get("DB_PASSWORD", "opa_password"),
            database=os.environ.get("DB_NAME", "opa_zero_poll")
        )
        return conn
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        return None

def register_companies_endpoints(app):
    """Rejestruje endpointy zarządzania firmami"""
    
    @app.route("/api/companies", methods=["GET"])
    def get_companies():
        """Zwraca listę firm z opcjonalnym filtrowaniem po tenant_id"""
        logger.info("Companies list requested")
        
        tenant_id = request.args.get('tenant_id')
        status = request.args.get('status', 'active')
        
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 503
        
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                if tenant_id:
                    cur.execute("""
                        SELECT 
                            c.company_id,
                            c.tenant_id,
                            c.company_name,
                            c.company_code,
                            c.nip,
                            c.description,
                            c.parent_company_id,
                            c.status,
                            c.created_at,
                            c.updated_at,
                            COUNT(DISTINCT ua.user_id) as users_count
                        FROM companies c
                        LEFT JOIN user_access ua ON c.company_id = ua.company_id
                        WHERE c.tenant_id = %s AND c.status = %s
                        GROUP BY c.company_id, c.tenant_id, c.company_name, c.company_code, c.nip, c.description, 
                                c.parent_company_id, c.status, c.created_at, c.updated_at
                        ORDER BY c.created_at DESC
                    """, (tenant_id, status))
                else:
                    cur.execute("""
                        SELECT 
                            c.company_id,
                            c.tenant_id,
                            c.company_name,
                            c.company_code,
                            c.nip,
                            c.description,
                            c.parent_company_id,
                            c.status,
                            c.created_at,
                            c.updated_at,
                            COUNT(DISTINCT ua.user_id) as users_count
                        FROM companies c
                        LEFT JOIN user_access ua ON c.company_id = ua.company_id
                        WHERE c.status = %s
                        GROUP BY c.company_id, c.tenant_id, c.company_name, c.company_code, c.nip, c.description, 
                                c.parent_company_id, c.status, c.created_at, c.updated_at
                        ORDER BY c.created_at DESC
                    """, (status,))
                
                companies = cur.fetchall()
                
                return jsonify({
                    "companies": [dict(company) for company in companies],
                    "total_count": len(companies),
                    "filters": {
                        "tenant_id": tenant_id,
                        "status": status
                    },
                    "timestamp": datetime.datetime.utcnow().isoformat()
                }), 200
                
        except Exception as e:
            logger.error(f"Error fetching companies: {e}")
            return jsonify({"error": "Failed to fetch companies"}), 500
        finally:
            conn.close()

    @app.route("/api/companies/<company_id>", methods=["GET"])
    def get_company(company_id):
        """Zwraca szczegóły firmy wraz z użytkownikami"""
        logger.info(f"Company details requested: {company_id}")
        
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 503
        
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Pobierz dane firmy
                cur.execute("""
                    SELECT * FROM companies WHERE company_id = %s
                """, (company_id,))
                
                company = cur.fetchone()
                if not company:
                    return jsonify({"error": "Company not found"}), 404
                
                # Pobierz użytkowników z dostępem do firmy
                cur.execute("""
                    SELECT 
                        u.user_id,
                        u.username,
                        u.email,
                        u.full_name,
                        u.status,
                        ua.access_type,
                        ua.granted_at,
                        ua.granted_by
                    FROM users u
                    JOIN user_access ua ON u.user_id = ua.user_id
                    WHERE ua.company_id = %s
                    ORDER BY ua.granted_at DESC
                """, (company_id,))
                
                users = cur.fetchall()
                
                return jsonify({
                    "company": dict(company),
                    "users": [dict(user) for user in users],
                    "users_count": len(users),
                    "timestamp": datetime.datetime.utcnow().isoformat()
                }), 200
                
        except Exception as e:
            logger.error(f"Error fetching company {company_id}: {e}")
            return jsonify({"error": "Failed to fetch company details"}), 500
        finally:
            conn.close()

    @app.route("/api/companies", methods=["POST"])
    def create_company():
        """Tworzy nową firmę"""
        logger.info("Company creation requested")
        
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        required_fields = ["tenant_id", "company_name"]
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({
                "error": "Missing required fields",
                "missing": missing_fields
            }), 400
        
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 503
        
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                company_id = f"company_{int(datetime.datetime.utcnow().timestamp())}"
                
                cur.execute("""
                    INSERT INTO companies (
                        company_id, tenant_id, company_name, company_code, 
                        nip, description, parent_company_id, status
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING company_id, tenant_id, company_name, company_code, 
                             nip, description, parent_company_id, status, created_at
                """, (
                    company_id,
                    data["tenant_id"],
                    data["company_name"],
                    data.get("company_code"),
                    data.get("nip"),
                    data.get("description"),
                    data.get("parent_company_id"),
                    data.get("status", "active")
                ))
                
                new_company = cur.fetchone()
                conn.commit()
                
                logger.info(f"Company created successfully: {company_id}")
                
                return jsonify({
                    "company": dict(new_company),
                    "message": "Company created successfully",
                    "timestamp": datetime.datetime.utcnow().isoformat()
                }), 201
                
        except psycopg2.IntegrityError as e:
            conn.rollback()
            logger.error(f"Company creation failed - integrity error: {e}")
            return jsonify({"error": "Company with this code already exists in tenant"}), 409
        except Exception as e:
            conn.rollback()
            logger.error(f"Error creating company: {e}")
            return jsonify({"error": "Failed to create company"}), 500
        finally:
            conn.close()

    @app.route("/api/companies/<company_id>", methods=["PUT"])
    def update_company(company_id):
        """Aktualizuje dane firmy"""
        logger.info(f"Company update requested: {company_id}")
        
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 503
        
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Sprawdź czy firma istnieje
                cur.execute("SELECT company_id FROM companies WHERE company_id = %s", (company_id,))
                if not cur.fetchone():
                    return jsonify({"error": "Company not found"}), 404
                
                # Przygotuj pola do aktualizacji
                update_fields = []
                update_values = []
                
                if "company_name" in data:
                    update_fields.append("company_name = %s")
                    update_values.append(data["company_name"])
                
                if "company_code" in data:
                    update_fields.append("company_code = %s")
                    update_values.append(data["company_code"])
                
                if "description" in data:
                    update_fields.append("description = %s")
                    update_values.append(data["description"])
                
                if "parent_company_id" in data:
                    update_fields.append("parent_company_id = %s")
                    update_values.append(data["parent_company_id"])
                
                if "status" in data:
                    update_fields.append("status = %s")
                    update_values.append(data["status"])
                
                if "nip" in data:
                    update_fields.append("nip = %s")
                    update_values.append(data["nip"])
                
                if not update_fields:
                    return jsonify({"error": "No fields to update"}), 400
                
                update_fields.append("updated_at = CURRENT_TIMESTAMP")
                update_values.append(company_id)
                
                query = f"""
                    UPDATE companies 
                    SET {', '.join(update_fields)}
                    WHERE company_id = %s
                    RETURNING company_id, tenant_id, company_name, company_code, 
                             nip, description, parent_company_id, status, created_at, updated_at
                """
                
                cur.execute(query, update_values)
                updated_company = cur.fetchone()
                conn.commit()
                
                logger.info(f"Company updated successfully: {company_id}")
                
                return jsonify({
                    "company": dict(updated_company),
                    "message": "Company updated successfully",
                    "timestamp": datetime.datetime.utcnow().isoformat()
                }), 200
                
        except psycopg2.IntegrityError as e:
            conn.rollback()
            logger.error(f"Company update failed - integrity error: {e}")
            return jsonify({"error": "Company code conflict or invalid parent reference"}), 409
        except Exception as e:
            conn.rollback()
            logger.error(f"Error updating company: {e}")
            return jsonify({"error": "Failed to update company"}), 500
        finally:
            conn.close()

    @app.route("/api/companies/<company_id>", methods=["DELETE"])
    def delete_company(company_id):
        """Usuwa firmę (soft delete - zmiana status na 'archived')"""
        logger.info(f"Company deletion requested: {company_id}")
        
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 503
        
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Sprawdź czy firma istnieje
                cur.execute("SELECT company_id, status FROM companies WHERE company_id = %s", (company_id,))
                company = cur.fetchone()
                if not company:
                    return jsonify({"error": "Company not found"}), 404
                
                if company['status'] == 'archived':
                    return jsonify({"error": "Company is already archived"}), 400
                
                # Policz użytkowników przed archiwizacją
                cur.execute("""
                    SELECT COUNT(*) as users_count 
                    FROM user_access 
                    WHERE company_id = %s
                """, (company_id,))
                users_count = cur.fetchone()['users_count']
                
                # Soft delete - zmiana status na 'archived'
                cur.execute("""
                    UPDATE companies 
                    SET status = 'archived', updated_at = CURRENT_TIMESTAMP
                    WHERE company_id = %s
                    RETURNING company_id, company_name, status, updated_at
                """, (company_id,))
                
                archived_company = cur.fetchone()
                conn.commit()
                
                logger.info(f"Company archived successfully: {company_id}")
                
                return jsonify({
                    "company": dict(archived_company),
                    "message": "Company archived successfully",
                    "affected_users": users_count,
                    "timestamp": datetime.datetime.utcnow().isoformat()
                }), 200
                
        except Exception as e:
            conn.rollback()
            logger.error(f"Error archiving company: {e}")
            return jsonify({"error": "Failed to archive company"}), 500
        finally:
            conn.close()

    @app.route("/api/companies/<company_id>/users", methods=["GET"])
    def get_company_users(company_id):
        """Zwraca użytkowników z dostępem do firmy"""
        logger.info(f"Company users requested: {company_id}")
        
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 503
        
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Sprawdź czy firma istnieje
                cur.execute("SELECT company_id FROM companies WHERE company_id = %s", (company_id,))
                if not cur.fetchone():
                    return jsonify({"error": "Company not found"}), 404
                
                cur.execute("""
                    SELECT 
                        u.user_id,
                        u.username,
                        u.email,
                        u.full_name,
                        u.status as user_status,
                        ua.access_type,
                        ua.granted_at,
                        ua.granted_by,
                        ua.expires_at
                    FROM users u
                    JOIN user_access ua ON u.user_id = ua.user_id
                    WHERE ua.company_id = %s
                    ORDER BY ua.granted_at DESC
                """, (company_id,))
                
                users = cur.fetchall()
                
                return jsonify({
                    "company_id": company_id,
                    "users": [dict(user) for user in users],
                    "users_count": len(users),
                    "timestamp": datetime.datetime.utcnow().isoformat()
                }), 200
                
        except Exception as e:
            logger.error(f"Error fetching company users: {e}")
            return jsonify({"error": "Failed to fetch company users"}), 500
        finally:
            conn.close()

    @app.route("/api/companies/<company_id>/users/<user_id>", methods=["POST"])
    def grant_user_access(company_id, user_id):
        """Przyznaje użytkownikowi dostęp do firmy"""
        logger.info(f"User access grant requested: {user_id} -> {company_id}")
        
        data = request.get_json() or {}
        access_type = data.get('access_type', 'direct')
        granted_by = data.get('granted_by', 'system')
        expires_at = data.get('expires_at')
        
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 503
        
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Sprawdź czy firma i użytkownik istnieją
                cur.execute("SELECT company_id, tenant_id FROM companies WHERE company_id = %s", (company_id,))
                company = cur.fetchone()
                if not company:
                    return jsonify({"error": "Company not found"}), 404
                
                cur.execute("SELECT user_id FROM users WHERE user_id = %s", (user_id,))
                if not cur.fetchone():
                    return jsonify({"error": "User not found"}), 404
                
                # Przyznaj dostęp
                cur.execute("""
                    INSERT INTO user_access (user_id, company_id, tenant_id, access_type, granted_by, expires_at)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    ON CONFLICT (user_id, company_id, tenant_id) 
                    DO UPDATE SET 
                        access_type = EXCLUDED.access_type,
                        granted_by = EXCLUDED.granted_by,
                        expires_at = EXCLUDED.expires_at,
                        granted_at = CURRENT_TIMESTAMP
                    RETURNING user_id, company_id, tenant_id, access_type, granted_at, granted_by
                """, (user_id, company_id, company['tenant_id'], access_type, granted_by, expires_at))
                
                access_record = cur.fetchone()
                conn.commit()
                
                logger.info(f"User access granted: {user_id} -> {company_id}")
                
                return jsonify({
                    "access": dict(access_record),
                    "message": "User access granted successfully",
                    "timestamp": datetime.datetime.utcnow().isoformat()
                }), 201
                
        except Exception as e:
            conn.rollback()
            logger.error(f"Error granting user access: {e}")
            return jsonify({"error": "Failed to grant user access"}), 500
        finally:
            conn.close()

    @app.route("/api/companies/<company_id>/users/<user_id>", methods=["DELETE"])
    def revoke_user_access(company_id, user_id):
        """Odbiera użytkownikowi dostęp do firmy"""
        logger.info(f"User access revoke requested: {user_id} -> {company_id}")
        
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 503
        
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Sprawdź czy dostęp istnieje
                cur.execute("""
                    SELECT user_id, company_id, tenant_id, access_type, granted_at
                    FROM user_access 
                    WHERE user_id = %s AND company_id = %s
                """, (user_id, company_id))
                
                access_record = cur.fetchone()
                if not access_record:
                    return jsonify({"error": "User access not found"}), 404
                
                # Usuń dostęp
                cur.execute("""
                    DELETE FROM user_access 
                    WHERE user_id = %s AND company_id = %s
                """, (user_id, company_id))
                
                conn.commit()
                
                logger.info(f"User access revoked: {user_id} -> {company_id}")
                
                return jsonify({
                    "revoked_access": dict(access_record),
                    "message": "User access revoked successfully",
                    "timestamp": datetime.datetime.utcnow().isoformat()
                }), 200
                
        except Exception as e:
            conn.rollback()
            logger.error(f"Error revoking user access: {e}")
            return jsonify({"error": "Failed to revoke user access"}), 500
        finally:
            conn.close()

    logger.info("✅ Companies management endpoints registered") 