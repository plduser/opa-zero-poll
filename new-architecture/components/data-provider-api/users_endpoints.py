"""
Users Management Endpoints for Data Provider API
"""
from flask import jsonify, request
import datetime
import logging
import psycopg2
from psycopg2.extras import RealDictCursor
import os

# Import User Data Sync Service
try:
    from user_data_sync import notify_user_change, notify_role_change, notify_permission_change, sync_full_tenant
    USER_DATA_SYNC_AVAILABLE = True
except ImportError:
    USER_DATA_SYNC_AVAILABLE = False

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
    
    @app.route("/api/users/<user_id>", methods=["GET", "DELETE"])
    def get_user(user_id):
        """Zwraca szczegóły użytkownika lub usuwa użytkownika"""
        
        if request.method == "DELETE":
            logger.info(f"Delete user requested: {user_id}")
            
            conn = get_db_connection()
            if not conn:
                return jsonify({"error": "Database connection failed"}), 503
            
            try:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    # Sprawdź czy użytkownik istnieje
                    cur.execute("SELECT user_id, full_name, email FROM users WHERE user_id = %s", (user_id,))
                    user = cur.fetchone()
                    
                    if not user:
                        return jsonify({"error": "User not found"}), 404
                    
                    # Usuń wszystkie powiązania użytkownika
                    # 1. Usuń przypisania do aplikacji
                    cur.execute("DELETE FROM user_application_profiles WHERE user_id = %s", (user_id,))
                    
                    # 2. Usuń przypisania do tenantów
                    cur.execute("DELETE FROM user_tenants WHERE user_id = %s", (user_id,))
                    
                    # 3. Usuń samego użytkownika
                    cur.execute("DELETE FROM users WHERE user_id = %s", (user_id,))
                    
                    conn.commit()
                    
                    logger.info(f"User {user_id} ({user['full_name']}) deleted successfully")
                    
                    return jsonify({
                        "message": "User deleted successfully",
                        "deleted_user": {
                            "user_id": user_id,
                            "full_name": user['full_name'],
                            "email": user['email']
                        },
                        "timestamp": datetime.datetime.utcnow().isoformat()
                    }), 200
                    
            except Exception as e:
                conn.rollback()
                logger.error(f"Error deleting user {user_id}: {e}")
                return jsonify({"error": "Failed to delete user"}), 500
            finally:
                conn.close()
        
        # GET logic
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
                
                # DODAJ WPIS DO user_tenants (KLUCZOWY BRAKUJĄCY KROK!)
                tenant_id = data.get("tenant_id", "tenant1")  # Default lub z request
                logger.info(f"🔥 DEBUG: Dodaję wpis do user_tenants - user_id={user_id}, tenant_id={tenant_id}")
                
                cur.execute("""
                    INSERT INTO user_tenants (user_id, tenant_id, is_default, assigned_by, notes)
                    VALUES (%s, %s, TRUE, 'api', %s)
                """, (user_id, tenant_id, f"Automatyczny wpis dla użytkownika {data['full_name']}"))
                
                logger.info(f"🔥 DEBUG: Wpis do user_tenants dodany pomyślnie!")
                
                conn.commit()
                
                logger.info(f"User created successfully: {user_id}")
                
                # Powiadom OPAL o nowym użytkowniku
                if USER_DATA_SYNC_AVAILABLE:
                    notify_user_change(tenant_id, user_id, "add")
                
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
    
    @app.route("/api/users/<user_id>/roles", methods=["POST"])
    def assign_user_role(user_id):
        """Przypisuje rolę użytkownikowi"""
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "Request body is required"}), 400
        
        required_fields = ["tenant_id", "app_id", "profile_name"]
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if missing_fields:
            return jsonify({
                "error": "Missing required fields",
                "missing_fields": missing_fields
            }), 400
        
        tenant_id = data["tenant_id"]
        app_id = data["app_id"]
        profile_name = data["profile_name"]
        
        logger.info(f"Assigning role {profile_name} in app {app_id} to user {user_id} in tenant {tenant_id}")
        
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 503
        
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Sprawdź czy użytkownik istnieje
                cur.execute("SELECT user_id FROM users WHERE user_id = %s", (user_id,))
                if not cur.fetchone():
                    return jsonify({"error": "User not found"}), 404
                
                # Sprawdź czy profile istnieje
                cur.execute("""
                    SELECT profile_id FROM application_profiles 
                    WHERE app_id = %s AND profile_name = %s
                """, (app_id, profile_name))
                
                profile = cur.fetchone()
                if not profile:
                    return jsonify({"error": "Profile not found"}), 404
                
                profile_id = profile["profile_id"]
                
                # Sprawdź czy przypisanie już istnieje
                cur.execute("""
                    SELECT uap_id FROM user_application_profiles 
                    WHERE user_id = %s AND profile_id = %s
                """, (user_id, profile_id))
                
                if cur.fetchone():
                    return jsonify({"error": "Role already assigned to user"}), 409
                
                # Przypisz rolę
                cur.execute("""
                    INSERT INTO user_application_profiles (user_id, profile_id, granted_at, granted_by)
                    VALUES (%s, %s, NOW(), %s)
                    RETURNING uap_id, granted_at
                """, (user_id, profile_id, "system"))
                
                assignment = cur.fetchone()
                conn.commit()
                
                logger.info(f"Role {profile_name} assigned successfully to user {user_id}")
                
                # Powiadom OPAL o zmianie ról
                if USER_DATA_SYNC_AVAILABLE:
                    role_changes = {
                        "app_id": app_id,
                        "profile_name": profile_name,
                        "action": "assigned"
                    }
                    notify_role_change(tenant_id, user_id, role_changes, "add_role")
                
                return jsonify({
                    "message": "Role assigned successfully",
                    "assignment": {
                        "user_id": user_id,
                        "app_id": app_id,
                        "profile_name": profile_name,
                        "assigned_at": assignment["granted_at"].isoformat(),
                        "assignment_id": assignment["uap_id"]
                    },
                    "timestamp": datetime.datetime.utcnow().isoformat()
                }), 201
                
        except Exception as e:
            conn.rollback()
            logger.error(f"Error assigning role to user {user_id}: {e}")
            return jsonify({"error": "Failed to assign role"}), 500
        finally:
            conn.close()
    
    @app.route("/api/users/<user_id>/roles/<profile_id>", methods=["DELETE"])
    def remove_user_role(user_id, profile_id):
        """Usuwa rolę użytkownikowi"""
        tenant_id = request.args.get("tenant_id", "tenant1")
        
        logger.info(f"Removing role profile {profile_id} from user {user_id} in tenant {tenant_id}")
        
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 503
        
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Pobierz szczegóły roli przed usunięciem
                cur.execute("""
                    SELECT 
                        uap.uap_id,
                        ap.app_id,
                        ap.profile_name,
                        a.app_name
                    FROM user_application_profiles uap
                    JOIN application_profiles ap ON uap.profile_id = ap.profile_id
                    JOIN applications a ON ap.app_id = a.app_id
                    WHERE uap.user_id = %s AND uap.profile_id = %s
                """, (user_id, profile_id))
                
                role_info = cur.fetchone()
                if not role_info:
                    return jsonify({"error": "Role assignment not found"}), 404
                
                # Usuń przypisanie roli
                cur.execute("""
                    DELETE FROM user_application_profiles 
                    WHERE user_id = %s AND profile_id = %s
                """, (user_id, profile_id))
                
                conn.commit()
                
                logger.info(f"Role {role_info['profile_name']} removed successfully from user {user_id}")
                
                # Powiadom OPAL o zmianie ról
                if USER_DATA_SYNC_AVAILABLE:
                    role_changes = {
                        "app_id": role_info["app_id"],
                        "profile_name": role_info["profile_name"],
                        "action": "removed"
                    }
                    notify_role_change(tenant_id, user_id, role_changes, "remove_role")
                
                return jsonify({
                    "message": "Role removed successfully",
                    "removed_role": {
                        "user_id": user_id,
                        "app_id": role_info["app_id"],
                        "app_name": role_info["app_name"],
                        "profile_name": role_info["profile_name"]
                    },
                    "timestamp": datetime.datetime.utcnow().isoformat()
                }), 200
                
        except Exception as e:
            conn.rollback()
            logger.error(f"Error removing role from user {user_id}: {e}")
            return jsonify({"error": "Failed to remove role"}), 500
        finally:
            conn.close()
    
    @app.route("/api/users/for-portal", methods=["GET"])
    def get_users_for_portal():
        """Pobierz listę użytkowników dla Portal Symfonia przełącznika"""
        logger.info("Portal users list requested")
        
        # Parametr do filtrowania użytkowników bez tenantów (domyślnie true)
        hide_users_without_tenants = request.args.get('hide_users_without_tenants', 'true').lower() == 'true'
        
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 503
        
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Pobierz użytkowników z ich tenantami i podstawowymi rolami
                cur.execute("""
                    SELECT DISTINCT
                        u.user_id,
                        u.username,
                        u.email,
                        u.full_name,
                        u.status,
                        ut.tenant_id,
                        ut.is_default,
                        t.tenant_name
                    FROM users u
                    LEFT JOIN user_tenants ut ON u.user_id = ut.user_id AND ut.is_active = true
                    LEFT JOIN tenants t ON ut.tenant_id = t.tenant_id
                    WHERE u.status = 'active'
                    ORDER BY u.full_name, ut.is_default DESC
                """)
                
                users_data = cur.fetchall()
                
                # Grupuj użytkowników z ich tenantami
                users_dict = {}
                for user_data in users_data:
                    user_id = user_data['user_id']
                    if user_id not in users_dict:
                        # Generuj inicjały z imienia i nazwiska
                        full_name = user_data['full_name'] or user_data['username']
                        name_parts = full_name.split()
                        initials = ''.join([part[0].upper() for part in name_parts if part])[:2]
                        
                        users_dict[user_id] = {
                            'id': user_id,
                            'username': user_data['username'],
                            'email': user_data['email'],
                            'full_name': full_name,
                            'initials': initials,
                            'status': user_data['status'],
                            'tenants': []
                        }
                    
                    # Dodaj tenant jeśli istnieje
                    if user_data['tenant_id']:
                        tenant_info = {
                            'tenant_id': user_data['tenant_id'],
                            'tenant_name': user_data['tenant_name'],
                            'is_default': user_data['is_default']
                        }
                        users_dict[user_id]['tenants'].append(tenant_info)
                
                # Przekonwertuj na listę
                users_list = list(users_dict.values())
                
                # Filtruj użytkowników bez tenantów jeśli włączone
                if hide_users_without_tenants:
                    users_list = [user for user in users_list if len(user['tenants']) > 0]
                    logger.info(f"🔥 Filtrowanie włączone: pozostało {len(users_list)} użytkowników z tenantami")
                else:
                    logger.info(f"🔥 Filtrowanie wyłączone: zwracam wszystkich {len(users_list)} użytkowników")
                
                return jsonify({
                    "users": users_list,
                    "total_count": len(users_list),
                    "filtered": hide_users_without_tenants,
                    "timestamp": datetime.datetime.utcnow().isoformat()
                }), 200
                
        except Exception as e:
            logger.error(f"Error fetching portal users: {e}")
            return jsonify({"error": "Failed to fetch portal users"}), 500
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


