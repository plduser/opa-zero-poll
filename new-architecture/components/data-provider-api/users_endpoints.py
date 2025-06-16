"""
Users Management Endpoints for Data Provider API
"""
from flask import jsonify, request
import datetime
import logging
import psycopg2
from psycopg2.extras import RealDictCursor
import os

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

def register_users_endpoints(app):
    """Rejestruje endpointy zarządzania użytkownikami"""
    
    @app.route("/api/users", methods=["GET"])
    def get_users():
        """Zwraca listę użytkowników"""
        logger.info("Users list requested")
        
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 503
        
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                    SELECT 
                        u.user_id,
                        u.username,
                        u.email,
                        u.full_name,
                        u.status,
                        u.created_at,
                        COUNT(DISTINCT ua.company_id) as companies_count
                    FROM users u
                    LEFT JOIN user_access ua ON u.user_id = ua.user_id
                    WHERE u.status = %s
                    GROUP BY u.user_id, u.username, u.email, u.full_name, u.status, u.created_at
                    ORDER BY u.created_at DESC
                """, ("active",))
                
                users = cur.fetchall()
                
                return jsonify({
                    "users": [dict(user) for user in users],
                    "total_count": len(users),
                    "timestamp": datetime.datetime.utcnow().isoformat()
                }), 200
                
        except Exception as e:
            logger.error(f"Error fetching users: {e}")
            return jsonify({"error": "Failed to fetch users"}), 500
        finally:
            conn.close()
    
    @app.route("/api/users/<user_id>", methods=["GET"])
    def get_user(user_id):
        """Zwraca szczegóły użytkownika"""
        logger.info(f"User details requested for: {user_id}")
        
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 503
        
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Pobierz podstawowe dane użytkownika
                cur.execute("""
                    SELECT user_id, username, email, full_name, status, created_at, updated_at
                    FROM users WHERE user_id = %s
                """, (user_id,))
                
                user = cur.fetchone()
                if not user:
                    return jsonify({"error": "User not found"}), 404
                
                user_data = dict(user)
                
                # Pobierz profile aplikacji użytkownika
                cur.execute("""
                    SELECT 
                        ap.app_id,
                        a.app_name,
                        ap.profile_name
                    FROM user_application_profiles uap
                    JOIN application_profiles ap ON uap.profile_id = ap.profile_id
                    JOIN applications a ON ap.app_id = a.app_id
                    WHERE uap.user_id = %s
                """, (user_id,))
                
                profiles = cur.fetchall()
                user_data["profiles"] = [{"app": profile["app_name"], "name": profile["profile_name"]} for profile in profiles]
                
                return jsonify({
                    "user": user_data,
                    "timestamp": datetime.datetime.utcnow().isoformat()
                }), 200
                
        except Exception as e:
            logger.error(f"Error fetching user {user_id}: {e}")
            return jsonify({"error": "Failed to fetch user"}), 500
        finally:
            conn.close()
    
    @app.route("/api/users", methods=["POST"])
    def create_user():
        """Tworzy nowego użytkownika"""
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "Request body is required"}), 400
        
        required_fields = ["username", "email", "full_name"]
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if missing_fields:
            return jsonify({
                "error": "Missing required fields",
                "missing_fields": missing_fields
            }), 400
        
        logger.info(f"Creating new user: {data.get('username')}")
        
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 503
        
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                user_id = f"user_{int(datetime.datetime.utcnow().timestamp())}"
                
                cur.execute("""
                    INSERT INTO users (user_id, username, email, full_name, status)
                    VALUES (%s, %s, %s, %s, %s)
                    RETURNING user_id, username, email, full_name, status, created_at
                """, (
                    user_id,
                    data["username"],
                    data["email"], 
                    data["full_name"],
                    data.get("status", "active")
                ))
                
                new_user = cur.fetchone()
                conn.commit()
                
                logger.info(f"User created successfully: {user_id}")
                
                return jsonify({
                    "user": dict(new_user),
                    "message": "User created successfully",
                    "timestamp": datetime.datetime.utcnow().isoformat()
                }), 201
                
        except psycopg2.IntegrityError as e:
            conn.rollback()
            logger.error(f"User creation failed - integrity error: {e}")
            return jsonify({"error": "User with this username or email already exists"}), 409
        except Exception as e:
            conn.rollback()
            logger.error(f"Error creating user: {e}")
            return jsonify({"error": "Failed to create user"}), 500
        finally:
            conn.close()
    
    @app.route("/api/applications", methods=["GET"])
    def get_applications():
        """Zwraca listę aplikacji z profilami"""
        logger.info("Applications list requested")
        
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 503
        
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Pobierz aplikacje z bazy
                cur.execute("""
                    SELECT app_id, app_name, description, status, created_at
                    FROM applications 
                    WHERE status = %s
                    ORDER BY app_name
                """, ("active",))
                
                applications = cur.fetchall()
                
                # Pobierz profile dla każdej aplikacji
                for app in applications:
                    cur.execute("""
                        SELECT profile_id, profile_name, description, is_default
                        FROM application_profiles
                        WHERE app_id = %s
                        ORDER BY is_default DESC, profile_name
                    """, (app["app_id"],))
                    
                    app["profiles"] = [dict(profile) for profile in cur.fetchall()]
                
                # Dodaj dane aplikacji Portal Symfonia (dla kompatybilności z UI)
                portal_apps = [
                    {
                        "id": "ebiuro",
                        "name": "eBiuro",
                        "profiles": ["Administrator", "Kierownik", "Pracownik", "Przeglądający"],
                    },
                    {
                        "id": "ksef",
                        "name": "KSEF",
                        "profiles": ["Księgowa", "Handlowiec", "Zakupowiec", "Administrator", "Właściciel"],
                    },
                    {
                        "id": "edokumenty",
                        "name": "eDokumenty",
                        "profiles": ["Administrator", "Zarząd", "Księgowa", "Główna Księgowa", "Sekretariat", "Użytkownik", "Przeglądający"],
                    },
                    {
                        "id": "edeklaracje",
                        "name": "eDeklaracje",
                        "profiles": ["Administrator", "Księgowa", "Główna Księgowa", "Kadrowy", "Przeglądający"],
                    }
                ]
                
                return jsonify({
                    "applications": portal_apps,  # Zwracam dane kompatybilne z Portal UI
                    "database_applications": [dict(app) for app in applications],  # Dane z bazy dla referencji
                    "timestamp": datetime.datetime.utcnow().isoformat()
                }), 200
                
        except Exception as e:
            logger.error(f"Error fetching applications: {e}")
            return jsonify({"error": "Failed to fetch applications"}), 500
        finally:
            conn.close()
