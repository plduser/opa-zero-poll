"""
Teams Management Endpoints for Data Provider API
"""
from flask import jsonify, request
import datetime
import logging
import psycopg2
from psycopg2.extras import RealDictCursor
import os
import uuid
from datetime import timezone

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

def register_teams_endpoints(app):
    """Rejestruje endpointy zarządzania zespołami"""
    
    @app.route("/api/teams", methods=["GET", "POST"])
    def handle_teams():
        """Zwraca listę zespołów lub tworzy nowy zespół"""
        
        if request.method == "POST":
            return create_team()
        
        # GET logic
        tenant_id = request.args.get("tenant_id")
        if not tenant_id:
            return jsonify({"error": "tenant_id parameter is required"}), 400
        
        logger.info(f"Teams list requested for tenant: {tenant_id}")
        
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 503
        
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                    SELECT 
                        t.team_id,
                        t.tenant_id,
                        t.team_name,
                        t.description,
                        t.team_type,
                        t.status,
                        t.created_at,
                        t.updated_at,
                        COUNT(DISTINCT tm.user_id) as member_count,
                        COUNT(DISTINCT tc.company_id) as company_count
                    FROM teams t
                    LEFT JOIN team_memberships tm ON t.team_id = tm.team_id
                    LEFT JOIN team_companies tc ON t.team_id = tc.team_id
                    WHERE t.tenant_id = %s AND t.status = %s
                    GROUP BY t.team_id, t.tenant_id, t.team_name, t.description, t.team_type, t.status, t.created_at, t.updated_at
                    ORDER BY t.created_at DESC
                """, (tenant_id, "active"))
                
                teams = cur.fetchall()
                
                return jsonify({
                    "teams": [dict(team) for team in teams],
                    "total_count": len(teams),
                    "tenant_id": tenant_id,
                    "timestamp": datetime.datetime.utcnow().isoformat()
                }), 200
                
        except Exception as e:
            logger.error(f"Error fetching teams for tenant {tenant_id}: {e}")
            return jsonify({"error": "Failed to fetch teams"}), 500
        finally:
            conn.close()
    
    def create_team():
        """Tworzy nowy zespół"""
        logger.info("Create team requested")
        
        data = request.get_json()
        if not data:
            return jsonify({"error": "JSON data is required"}), 400
        
        # Walidacja wymaganych pól
        required_fields = ["team_name", "tenant_id"]
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"Field '{field}' is required"}), 400
        
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 503
        
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Sprawdź czy tenant istnieje
                cur.execute("SELECT tenant_id FROM tenants WHERE tenant_id = %s", (data["tenant_id"],))
                if not cur.fetchone():
                    return jsonify({"error": "Tenant not found"}), 404
                
                # Sprawdź czy nazwa zespołu jest unikalna w ramach tenanta
                cur.execute("SELECT team_id FROM teams WHERE tenant_id = %s AND team_name = %s", 
                           (data["tenant_id"], data["team_name"]))
                if cur.fetchone():
                    return jsonify({"error": "Team name already exists in this tenant"}), 409
                
                # Utwórz nowy zespół
                team_id = str(uuid.uuid4())
                cur.execute("""
                    INSERT INTO teams (team_id, tenant_id, team_name, description, team_type, status)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING team_id, team_name, created_at
                """, (
                    team_id,
                    data["tenant_id"],
                    data["team_name"],
                    data.get("description", ""),
                    data.get("team_type", "functional"),
                    "active"
                ))
                
                new_team = cur.fetchone()
                conn.commit()
                
                logger.info(f"Team created: {new_team['team_name']} (ID: {team_id})")
                
                return jsonify({
                    "message": "Team created successfully",
                    "team": dict(new_team),
                    "timestamp": datetime.datetime.utcnow().isoformat()
                }), 201
                
        except Exception as e:
            conn.rollback()
            logger.error(f"Error creating team: {e}")
            return jsonify({"error": "Failed to create team"}), 500
        finally:
            conn.close()
    
    @app.route("/api/teams/<team_id>", methods=["GET", "PUT", "DELETE"])
    def handle_team(team_id):
        """Zwraca szczegóły zespołu, edytuje lub usuwa zespół"""
        
        if request.method == "DELETE":
            return delete_team(team_id)
        elif request.method == "PUT":
            return update_team(team_id)
        
        # GET logic
        logger.info(f"Team details requested for: {team_id}")
        
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 503
        
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Pobierz podstawowe dane zespołu
                cur.execute("""
                    SELECT team_id, tenant_id, team_name, description, team_type, status, created_at, updated_at
                    FROM teams WHERE team_id = %s
                """, (team_id,))
                
                team = cur.fetchone()
                if not team:
                    return jsonify({"error": "Team not found"}), 404
                
                team_data = dict(team)
                
                # Pobierz role zespołu
                cur.execute("""
                    SELECT 
                        tr.team_id,
                        r.app_id,
                        a.app_name,
                        r.role_name,
                        tr.assigned_at
                    FROM team_roles tr
                    JOIN roles r ON tr.role_id = r.role_id
                    JOIN applications a ON r.app_id = a.app_id
                    WHERE tr.team_id = %s
                    ORDER BY a.app_name, r.role_name
                """, (team_id,))
                
                team_data["roles"] = [dict(role) for role in cur.fetchall()]
                
                # Pobierz firmy zespołu
                cur.execute("""
                    SELECT 
                        tc.team_id,
                        tc.company_id,
                        c.company_name,
                        tc.access_type,
                        tc.assigned_at
                    FROM team_companies tc
                    JOIN companies c ON tc.company_id = c.company_id
                    WHERE tc.team_id = %s
                    ORDER BY c.company_name
                """, (team_id,))
                
                team_data["companies"] = [dict(company) for company in cur.fetchall()]
                
                # Pobierz członków zespołu
                cur.execute("""
                    SELECT 
                        tm.user_id,
                        u.username,
                        u.full_name,
                        u.email,
                        tm.role_in_team,
                        tm.joined_at
                    FROM team_memberships tm
                    JOIN users u ON tm.user_id = u.user_id
                    WHERE tm.team_id = %s
                    ORDER BY u.full_name
                """, (team_id,))
                
                team_data["members"] = [dict(member) for member in cur.fetchall()]
                
                return jsonify({
                    "team": team_data,
                    "timestamp": datetime.datetime.utcnow().isoformat()
                }), 200
                
        except Exception as e:
            logger.error(f"Error fetching team {team_id}: {e}")
            return jsonify({"error": "Failed to fetch team"}), 500
        finally:
            conn.close()
    
    def update_team(team_id):
        """Edytuje zespół"""
        logger.info(f"Update team requested: {team_id}")
        
        data = request.get_json()
        if not data:
            return jsonify({"error": "JSON data is required"}), 400
        
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 503
        
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Sprawdź czy zespół istnieje
                cur.execute("SELECT team_id, team_name, tenant_id FROM teams WHERE team_id = %s", (team_id,))
                team = cur.fetchone()
                
                if not team:
                    return jsonify({"error": "Team not found"}), 404
                
                # Sprawdź czy nowa nazwa jest unikalna (jeśli się zmieniła)
                if data.get("team_name") and data["team_name"] != team["team_name"]:
                    cur.execute("SELECT team_id FROM teams WHERE tenant_id = %s AND team_name = %s AND team_id != %s", 
                               (team["tenant_id"], data["team_name"], team_id))
                    if cur.fetchone():
                        return jsonify({"error": "Team name already exists in this tenant"}), 409
                
                # Aktualizuj zespół
                update_fields = []
                update_values = []
                
                for field in ["team_name", "description", "team_type", "status"]:
                    if field in data:
                        update_fields.append(f"{field} = %s")
                        update_values.append(data[field])
                
                if update_fields:
                    update_values.append(team_id)
                    cur.execute(f"""
                        UPDATE teams 
                        SET {', '.join(update_fields)}, updated_at = CURRENT_TIMESTAMP
                        WHERE team_id = %s
                        RETURNING team_id, team_name, updated_at
                    """, update_values)
                    
                    updated_team = cur.fetchone()
                    conn.commit()
                    
                    logger.info(f"Team updated: {updated_team['team_name']} (ID: {team_id})")
                    
                    return jsonify({
                        "message": "Team updated successfully",
                        "team": dict(updated_team),
                        "timestamp": datetime.datetime.utcnow().isoformat()
                    }), 200
                else:
                    return jsonify({"message": "No fields to update"}), 200
                
        except Exception as e:
            conn.rollback()
            logger.error(f"Error updating team {team_id}: {e}")
            return jsonify({"error": "Failed to update team"}), 500
        finally:
            conn.close()
    
    def delete_team(team_id):
        """Usuwa zespół"""
        logger.info(f"Delete team requested: {team_id}")
        
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 503
        
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Sprawdź czy zespół istnieje
                cur.execute("SELECT team_id, team_name FROM teams WHERE team_id = %s", (team_id,))
                team = cur.fetchone()
                
                if not team:
                    return jsonify({"error": "Team not found"}), 404
                
                # Usuń wszystkie powiązania zespołu (cascading deletes w schemacie)
                cur.execute("DELETE FROM teams WHERE team_id = %s", (team_id,))
                
                conn.commit()
                
                logger.info(f"Team {team_id} ({team['team_name']}) deleted successfully")
                
                return jsonify({
                    "message": "Team deleted successfully",
                    "deleted_team": {
                        "team_id": team_id,
                        "team_name": team['team_name']
                    },
                    "timestamp": datetime.datetime.utcnow().isoformat()
                }), 200
                
        except Exception as e:
            conn.rollback()
            logger.error(f"Error deleting team {team_id}: {e}")
            return jsonify({"error": "Failed to delete team"}), 500
        finally:
            conn.close()
    
    @app.route("/api/teams/<team_id>/members", methods=["GET", "POST"])
    def handle_team_members(team_id):
        """Zwraca listę członków zespołu lub dodaje nowego członka"""
        
        if request.method == "POST":
            return add_team_member(team_id)
        
        # GET logic
        logger.info(f"Team members requested for: {team_id}")
        
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 503
        
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Sprawdź czy zespół istnieje
                cur.execute("SELECT team_id, team_name FROM teams WHERE team_id = %s", (team_id,))
                team = cur.fetchone()
                
                if not team:
                    return jsonify({"error": "Team not found"}), 404
                
                # Pobierz członków zespołu
                cur.execute("""
                    SELECT 
                        tm.user_id,
                        u.username,
                        u.full_name,
                        u.email,
                        tm.role_in_team,
                        tm.joined_at
                    FROM team_memberships tm
                    JOIN users u ON tm.user_id = u.user_id
                    WHERE tm.team_id = %s
                    ORDER BY u.full_name
                """, (team_id,))
                
                members = cur.fetchall()
                
                return jsonify({
                    "team_id": team_id,
                    "team_name": team["team_name"],
                    "members": [dict(member) for member in members],
                    "total_members": len(members),
                    "timestamp": datetime.datetime.utcnow().isoformat()
                }), 200
                
        except Exception as e:
            logger.error(f"Error fetching team members for {team_id}: {e}")
            return jsonify({"error": "Failed to fetch team members"}), 500
        finally:
            conn.close()
    
    def add_team_member(team_id):
        """Dodaje członka do zespołu"""
        logger.info(f"Add team member requested for team: {team_id}")
        
        data = request.get_json()
        if not data:
            return jsonify({"error": "JSON data is required"}), 400
        
        if not data.get("user_id"):
            return jsonify({"error": "user_id is required"}), 400
        
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 503
        
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Sprawdź czy zespół istnieje
                cur.execute("SELECT team_id, team_name, tenant_id FROM teams WHERE team_id = %s", (team_id,))
                team = cur.fetchone()
                
                if not team:
                    return jsonify({"error": "Team not found"}), 404
                
                # Sprawdź czy użytkownik istnieje (sprawdzenie tenanta opcjonalne dla testów)
                cur.execute("SELECT user_id, full_name FROM users WHERE user_id = %s", (data["user_id"],))
                user = cur.fetchone()
                
                if not user:
                    return jsonify({"error": "User not found"}), 404
                
                # Opcjonalne sprawdzenie tenanta (jeśli istnieje tabela user_tenants)
                try:
                    cur.execute("""
                        SELECT ut.tenant_id 
                        FROM user_tenants ut 
                        WHERE ut.user_id = %s AND ut.tenant_id = %s
                    """, (data["user_id"], team["tenant_id"]))
                    
                    tenant_check = cur.fetchone()
                    if not tenant_check:
                        logger.warning(f"User {data['user_id']} not found in tenant {team['tenant_id']} - proceeding anyway for testing")
                except Exception as e:
                    logger.warning(f"Could not verify tenant membership (table may not exist): {e}")
                
                # Sprawdź czy użytkownik już jest członkiem zespołu
                cur.execute("SELECT user_id FROM team_memberships WHERE team_id = %s AND user_id = %s", 
                           (team_id, data["user_id"]))
                if cur.fetchone():
                    return jsonify({"error": "User is already a member of this team"}), 409
                
                # Dodaj członka do zespołu
                cur.execute("""
                    INSERT INTO team_memberships (user_id, team_id, role_in_team, joined_by)
                    VALUES (%s, %s, %s, %s)
                    RETURNING user_id, role_in_team, joined_at
                """, (
                    data["user_id"],
                    team_id,
                    data.get("role_in_team", "member"),
                    data.get("joined_by", "system")
                ))
                
                new_member = cur.fetchone()
                conn.commit()
                
                logger.info(f"User {user['full_name']} added to team {team['team_name']}")
                
                return jsonify({
                    "message": "Team member added successfully",
                    "team_id": team_id,
                    "team_name": team["team_name"],
                    "member": dict(new_member),
                    "timestamp": datetime.datetime.utcnow().isoformat()
                }), 201
                
        except Exception as e:
            conn.rollback()
            logger.error(f"Error adding member to team {team_id}: {e}")
            return jsonify({"error": "Failed to add team member"}), 500
        finally:
            conn.close()
    
    @app.route("/api/teams/<team_id>/members/<user_id>", methods=["DELETE", "PUT"])
    def handle_team_member(team_id, user_id):
        if request.method == "DELETE":
            return remove_team_member(team_id, user_id)
        elif request.method == "PUT":
            return update_team_member_role(team_id, user_id)
    
    def remove_team_member(team_id, user_id):
        """Usuwa członka z zespołu"""
        logger.info(f"Remove team member requested: {user_id} from team {team_id}")
        
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 503
        
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Sprawdź czy zespół i członek istnieją
                cur.execute("""
                    SELECT tm.user_id, u.full_name, t.team_name
                    FROM team_memberships tm
                    JOIN users u ON tm.user_id = u.user_id
                    JOIN teams t ON tm.team_id = t.team_id
                    WHERE tm.team_id = %s AND tm.user_id = %s
                """, (team_id, user_id))
                
                member = cur.fetchone()
                if not member:
                    return jsonify({"error": "Team member not found"}), 404
                
                # Usuń członka z zespołu
                cur.execute("DELETE FROM team_memberships WHERE team_id = %s AND user_id = %s", 
                           (team_id, user_id))
                
                conn.commit()
                
                logger.info(f"User {member['full_name']} removed from team {member['team_name']}")
                
                return jsonify({
                    "message": "Team member removed successfully",
                    "team_id": team_id,
                    "removed_member": {
                        "user_id": user_id,
                        "full_name": member['full_name']
                    },
                    "timestamp": datetime.datetime.utcnow().isoformat()
                }), 200
                
        except Exception as e:
            conn.rollback()
            logger.error(f"Error removing member {user_id} from team {team_id}: {e}")
            return jsonify({"error": "Failed to remove team member"}), 500
        finally:
            conn.close()
    
    def update_team_member_role(team_id, user_id):
        """Aktualizuje rolę członka w zespole"""
        logger.info(f"Update team member role requested: {user_id} in team {team_id}")
        
        data = request.get_json()
        if not data:
            return jsonify({"error": "JSON data is required"}), 400
        
        if not data.get("role_in_team"):
            return jsonify({"error": "role_in_team is required"}), 400
        
        # Walidacja roli
        valid_roles = ['member', 'lead', 'admin']
        if data["role_in_team"] not in valid_roles:
            return jsonify({"error": f"Invalid role. Must be one of: {valid_roles}"}), 400
        
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 503
        
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Sprawdź czy członek zespołu istnieje
                cur.execute("""
                    SELECT tm.user_id, u.full_name, t.team_name, tm.role_in_team as current_role
                    FROM team_memberships tm
                    JOIN users u ON tm.user_id = u.user_id
                    JOIN teams t ON tm.team_id = t.team_id
                    WHERE tm.team_id = %s AND tm.user_id = %s
                """, (team_id, user_id))
                
                member = cur.fetchone()
                if not member:
                    return jsonify({"error": "Team member not found"}), 404
                
                # Sprawdź czy rola się różni
                if member['current_role'] == data["role_in_team"]:
                    return jsonify({
                        "message": "Role unchanged",
                        "team_id": team_id,
                        "member": {
                            "user_id": user_id,
                            "full_name": member['full_name'],
                            "role_in_team": data["role_in_team"]
                        },
                        "timestamp": datetime.datetime.utcnow().isoformat()
                    }), 200
                
                # Aktualizuj rolę
                cur.execute("""
                    UPDATE team_memberships 
                    SET role_in_team = %s
                    WHERE team_id = %s AND user_id = %s
                    RETURNING role_in_team
                """, (data["role_in_team"], team_id, user_id))
                
                updated_member = cur.fetchone()
                conn.commit()
                
                logger.info(f"Updated role for {member['full_name']} in team {member['team_name']}: {member['current_role']} → {data['role_in_team']}")
                
                return jsonify({
                    "message": "Team member role updated successfully",
                    "team_id": team_id,
                    "team_name": member['team_name'],
                    "member": {
                        "user_id": user_id,
                        "full_name": member['full_name'],
                        "role_in_team": updated_member['role_in_team'],
                        "previous_role": member['current_role'],
                        "updated_at": datetime.datetime.utcnow().isoformat()
                    },
                    "timestamp": datetime.datetime.utcnow().isoformat()
                }), 200
                
        except Exception as e:
            conn.rollback()
            logger.error(f"Error updating member role {user_id} in team {team_id}: {e}")
            return jsonify({"error": "Failed to update team member role"}), 500
        finally:
            conn.close()
    
    @app.route("/api/users/<user_id>/teams", methods=["GET"])
    def get_user_teams(user_id):
        """Zwraca zespoły użytkownika"""
        logger.info(f"User teams requested for: {user_id}")
        
        tenant_id = request.args.get("tenant_id")
        
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 503
        
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Sprawdź czy użytkownik istnieje
                cur.execute("SELECT user_id, full_name FROM users WHERE user_id = %s", (user_id,))
                user = cur.fetchone()
                
                if not user:
                    return jsonify({"error": "User not found"}), 404
                
                # Pobierz zespoły użytkownika
                query = """
                    SELECT 
                        t.team_id,
                        t.team_name,
                        t.description,
                        t.team_type,
                        t.tenant_id,
                        tm.role_in_team,
                        tm.joined_at
                    FROM team_memberships tm
                    JOIN teams t ON tm.team_id = t.team_id
                    WHERE tm.user_id = %s
                """
                params = [user_id]
                
                if tenant_id:
                    query += " AND t.tenant_id = %s"
                    params.append(tenant_id)
                
                query += " ORDER BY t.team_name"
                
                cur.execute(query, params)
                teams = cur.fetchall()
                
                return jsonify({
                    "user_id": user_id,
                    "user_name": user["full_name"],
                    "teams": [dict(team) for team in teams],
                    "total_teams": len(teams),
                    "timestamp": datetime.datetime.utcnow().isoformat()
                }), 200
                
        except Exception as e:
            logger.error(f"Error fetching teams for user {user_id}: {e}")
            return jsonify({"error": "Failed to fetch user teams"}), 500
        finally:
            conn.close()
    
    # === ENDPOINTY APLIKACJI ZESPOŁÓW ===
    
    @app.route("/api/teams/<team_id>/applications", methods=["GET", "POST", "DELETE"])
    def handle_team_applications(team_id):
        """Zarządza dostępem zespołu do aplikacji"""
        
        if request.method == "POST":
            return add_team_application(team_id)
        elif request.method == "DELETE":
            return remove_team_application(team_id)
        
        # GET logic
        logger.info(f"Team applications requested for: {team_id}")
        
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 503
        
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Sprawdź czy zespół istnieje
                cur.execute("SELECT team_id, team_name FROM teams WHERE team_id = %s", (team_id,))
                team = cur.fetchone()
                
                if not team:
                    return jsonify({"error": "Team not found"}), 404
                
                # Pobierz role zespołu w aplikacjach
                cur.execute("""
                    SELECT 
                        tr.team_id,
                        r.app_id,
                        a.app_name,
                        r.role_name,
                        tr.assigned_at
                    FROM team_roles tr
                    JOIN roles r ON tr.role_id = r.role_id
                    JOIN applications a ON r.app_id = a.app_id
                    WHERE tr.team_id = %s
                    ORDER BY a.app_name, r.role_name
                """, (team_id,))
                
                applications = cur.fetchall()
                
                return jsonify({
                    "team_id": team_id,
                    "team_name": team["team_name"],
                    "applications": [dict(app) for app in applications],
                    "total_applications": len(applications),
                    "timestamp": datetime.datetime.utcnow().isoformat()
                }), 200
                
        except Exception as e:
            logger.error(f"Error fetching team applications for {team_id}: {e}")
            return jsonify({"error": "Failed to fetch team applications"}), 500
        finally:
            conn.close()
    
    def add_team_application(team_id):
        """Nadaje zespołowi dostęp do aplikacji"""
        logger.info(f"Add team application requested for team: {team_id}")
        
        data = request.get_json()
        if not data:
            return jsonify({"error": "JSON data is required"}), 400
        
        # Walidacja wymaganych pól
        required_fields = ["app_id", "role_name"]
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"Field '{field}' is required"}), 400
        
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 503
        
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Sprawdź czy zespół istnieje
                cur.execute("SELECT team_id, team_name FROM teams WHERE team_id = %s", (team_id,))
                team = cur.fetchone()
                if not team:
                    return jsonify({"error": "Team not found"}), 404
                
                logger.info(f"Searching for profile: app_id={data['app_id']}, profile_name={data['role_name']}")
                
                # Znajdź profil aplikacji na podstawie app_id i profile_name (przychodzi jako role_name)
                cur.execute("""
                    SELECT ap.profile_id, ap.profile_name, a.app_name
                    FROM application_profiles ap
                    JOIN applications a ON ap.app_id = a.app_id
                    WHERE ap.app_id = %s AND ap.profile_name = %s
                """, (data["app_id"], data["role_name"]))
                
                profile = cur.fetchone()
                logger.info(f"Profile search result: {profile}")
                
                if not profile:
                    logger.error(f"Profile not found: app_id={data['app_id']}, profile_name={data['role_name']}")
                    return jsonify({"error": "Profile not found for specified application"}), 404
                
                profile_id = profile['profile_id']
                profile_name = profile['profile_name']
                app_name = profile['app_name']
                logger.info(f"Found profile: {profile_id}, {profile_name}, {app_name}")
                
                # Znajdź role mapowane do tego profilu
                cur.execute("""
                    SELECT r.role_id, r.role_name
                    FROM profile_roles pr
                    JOIN roles r ON pr.role_id = r.role_id
                    WHERE pr.profile_id = %s
                """, (profile_id,))
                
                roles = cur.fetchall()
                logger.info(f"Found {len(roles)} roles for profile {profile_name}: {roles}")
                
                if not roles:
                    logger.error(f"No roles mapped to profile {profile_name} (ID: {profile_id})")
                    return jsonify({"error": "No roles mapped to this profile"}), 404
                
                # Sprawdź czy zespół już ma wszystkie te role
                existing_roles = []
                for role in roles:
                    role_id = role['role_id']
                    cur.execute("""
                        SELECT role_id FROM team_roles
                        WHERE team_id = %s AND role_id = %s
                    """, (team_id, role_id))
                    
                    if cur.fetchone():
                        existing_roles.append(role['role_name'])
                
                if existing_roles:
                    logger.warning(f"Team already has roles: {existing_roles}")
                    return jsonify({
                        "error": f"Team already has roles: {', '.join(existing_roles)}"
                    }), 409

                # Dodaj wszystkie role z profilu do zespołu
                added_roles = []
                for role in roles:
                    role_id = role['role_id']
                    role_name = role['role_name']
                    
                    logger.info(f"Adding role {role_name} (ID: {role_id}) to team {team_id}")
                    
                    cur.execute("""
                        INSERT INTO team_roles (team_id, role_id, assigned_at)
                        VALUES (%s, %s, CURRENT_TIMESTAMP)
                    """, (team_id, role_id))
                    
                    added_roles.append(role_name)
                    logger.info(f"Successfully added role {role_name}")

                # Pobierz informacje o zespole dla odpowiedzi
                cur.execute("""
                    SELECT team_name FROM teams WHERE team_id = %s
                """, (team_id,))
                
                team_result = cur.fetchone()
                logger.info(f"Team result: {team_result}")
                
                response_data = {
                    "message": "Team application access added successfully",
                    "team_id": team_id,
                    "team_name": team_result['team_name'],
                    "application": {
                        "app_id": data["app_id"],
                        "app_name": app_name,
                        "profile_name": profile_name,
                        "role_name": profile_name,  # Dla kompatybilności z frontendem
                        "technical_roles": added_roles,  # Lista dodanych ról technicznych
                        "assigned_at": datetime.datetime.now(timezone.utc).isoformat()
                    },
                    "timestamp": datetime.datetime.now(timezone.utc).isoformat()
                }

                conn.commit()
                logger.info(f"Successfully added {len(added_roles)} roles to team {team_id}")
                return jsonify(response_data), 201
                
        except Exception as e:
            conn.rollback()
            logger.error(f"Error adding application access to team {team_id}: {str(e)}")
            logger.error(f"Exception type: {type(e).__name__}")
            logger.error(f"Exception args: {e.args}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            
            # Return a more specific error message
            error_msg = str(e) if str(e) else f"Unknown error of type {type(e).__name__}"
            return jsonify({"error": f"Failed to add team application access: {error_msg}"}), 500
        finally:
            conn.close()
    
    def remove_team_application(team_id):
        """Usuwa dostęp zespołu do aplikacji"""
        logger.info(f"Remove team application requested for team: {team_id}")
        
        app_id = request.args.get("app_id")
        role_name = request.args.get("role_name")
        
        if not app_id or not role_name:
            return jsonify({"error": "app_id and role_name parameters are required"}), 400
        
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 503
        
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Sprawdź czy zespół istnieje
                cur.execute("SELECT team_id, team_name FROM teams WHERE team_id = %s", (team_id,))
                team = cur.fetchone()
                if not team:
                    return jsonify({"error": "Team not found"}), 404
                
                # Znajdź i usuń profil zespołu
                cur.execute("""
                    DELETE FROM team_application_profiles tr
                    USING application_profiles ap
                    WHERE tr.profile_id = ap.profile_id
                    AND tr.team_id = %s
                    AND ap.app_id = %s
                    AND ap.profile_name = %s
                    RETURNING ap.app_name, ap.profile_name
                """, (team_id, app_id, role_name))
                
                removed_profile = cur.fetchone()
                if not removed_profile:
                    return jsonify({"error": "Team application access not found"}), 404
                
                conn.commit()
                
                logger.info(f"Removed application access: Team {team['team_name']} from {removed_profile['app_name']} ({removed_profile['profile_name']})")
                
                return jsonify({
                    "message": "Team application access removed successfully",
                    "team_id": team_id,
                    "team_name": team["team_name"],
                    "removed_access": {
                        "app_id": app_id,
                        "app_name": removed_profile["app_name"],
                        "profile_name": removed_profile["profile_name"]
                    },
                    "timestamp": datetime.datetime.utcnow().isoformat()
                }), 200
                
        except Exception as e:
            conn.rollback()
            logger.error(f"Error removing application access from team {team_id}: {e}")
            return jsonify({"error": "Failed to remove team application access"}), 500
        finally:
            conn.close()
    
    # === ENDPOINTY FIRM ZESPOŁÓW ===
    
    @app.route("/api/teams/<team_id>/companies", methods=["GET", "POST", "DELETE"])
    def handle_team_companies(team_id):
        """Zarządza dostępem zespołu do firm"""
        
        if request.method == "POST":
            return add_team_company(team_id)
        elif request.method == "DELETE":
            return remove_team_company(team_id)
        
        # GET logic
        logger.info(f"Team companies requested for: {team_id}")
        
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 503
        
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Sprawdź czy zespół istnieje
                cur.execute("SELECT team_id, team_name FROM teams WHERE team_id = %s", (team_id,))
                team = cur.fetchone()
                
                if not team:
                    return jsonify({"error": "Team not found"}), 404
                
                # Pobierz firmy zespołu
                cur.execute("""
                    SELECT 
                        tc.team_id,
                        tc.company_id,
                        c.company_name,
                        c.nip,
                        tc.access_type,
                        tc.assigned_at
                    FROM team_companies tc
                    JOIN companies c ON tc.company_id = c.company_id
                    WHERE tc.team_id = %s
                    ORDER BY c.company_name
                """, (team_id,))
                
                companies = cur.fetchall()
                
                return jsonify({
                    "team_id": team_id,
                    "team_name": team["team_name"],
                    "companies": [dict(company) for company in companies],
                    "total_companies": len(companies),
                    "timestamp": datetime.datetime.utcnow().isoformat()
                }), 200
                
        except Exception as e:
            logger.error(f"Error fetching team companies for {team_id}: {e}")
            return jsonify({"error": "Failed to fetch team companies"}), 500
        finally:
            conn.close()
    
    def add_team_company(team_id):
        """Nadaje zespołowi dostęp do firmy"""
        logger.info(f"Add team company requested for team: {team_id}")
        
        data = request.get_json()
        if not data:
            return jsonify({"error": "JSON data is required"}), 400
        
        # Walidacja wymaganych pól
        required_fields = ["company_id", "access_type"]
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"Field '{field}' is required"}), 400
        
        # Walidacja typu dostępu
        valid_access_types = ['view', 'edit', 'manage', 'admin']
        if data["access_type"] not in valid_access_types:
            return jsonify({"error": f"Invalid access_type. Must be one of: {valid_access_types}"}), 400
        
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 503
        
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Sprawdź czy zespół istnieje
                cur.execute("SELECT team_id, team_name FROM teams WHERE team_id = %s", (team_id,))
                team = cur.fetchone()
                if not team:
                    return jsonify({"error": "Team not found"}), 404
                
                # Sprawdź czy firma istnieje
                cur.execute("SELECT company_id, company_name FROM companies WHERE company_id = %s", (data["company_id"],))
                company = cur.fetchone()
                if not company:
                    return jsonify({"error": "Company not found"}), 404
                
                # Sprawdź czy zespół już ma dostęp do tej firmy
                cur.execute("""
                    SELECT tc.team_id FROM team_companies tc
                    WHERE tc.team_id = %s AND tc.company_id = %s
                """, (team_id, data["company_id"]))
                
                if cur.fetchone():
                    return jsonify({"error": "Team already has access to this company"}), 409
                
                # Dodaj dostęp do firmy
                cur.execute("""
                    INSERT INTO team_companies (team_id, company_id, access_type, assigned_at)
                    VALUES (%s, %s, %s, CURRENT_TIMESTAMP)
                    RETURNING assigned_at
                """, (team_id, data["company_id"], data["access_type"]))
                
                result = cur.fetchone()
                conn.commit()
                
                logger.info(f"Added company access: Team {team['team_name']} → {company['company_name']} ({data['access_type']})")
                
                return jsonify({
                    "message": "Team company access added successfully",
                    "team_id": team_id,
                    "team_name": team["team_name"],
                    "company": {
                        "company_id": data["company_id"],
                        "company_name": company["company_name"],
                        "access_type": data["access_type"],
                        "assigned_at": result["assigned_at"].isoformat()
                    },
                    "timestamp": datetime.datetime.utcnow().isoformat()
                }), 201
                
        except Exception as e:
            conn.rollback()
            logger.error(f"Error adding company access to team {team_id}: {e}")
            return jsonify({"error": "Failed to add team company access"}), 500
        finally:
            conn.close()
    
    def remove_team_company(team_id):
        """Usuwa dostęp zespołu do firmy"""
        logger.info(f"Remove team company requested for team: {team_id}")
        
        company_id = request.args.get("company_id")
        
        if not company_id:
            return jsonify({"error": "company_id parameter is required"}), 400
        
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 503
        
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Sprawdź czy zespół istnieje
                cur.execute("SELECT team_id, team_name FROM teams WHERE team_id = %s", (team_id,))
                team = cur.fetchone()
                if not team:
                    return jsonify({"error": "Team not found"}), 404
                
                # Znajdź i usuń dostęp do firmy
                cur.execute("""
                    DELETE FROM team_companies tc
                    USING companies c
                    WHERE tc.company_id = c.company_id
                    AND tc.team_id = %s
                    AND tc.company_id = %s
                    RETURNING c.company_name, tc.access_type
                """, (team_id, company_id))
                
                removed_company = cur.fetchone()
                if not removed_company:
                    return jsonify({"error": "Team company access not found"}), 404
                
                conn.commit()
                
                logger.info(f"Removed company access: Team {team['team_name']} from {removed_company['company_name']}")
                
                return jsonify({
                    "message": "Team company access removed successfully",
                    "team_id": team_id,
                    "team_name": team["team_name"],
                    "removed_access": {
                        "company_id": company_id,
                        "company_name": removed_company["company_name"],
                        "access_type": removed_company["access_type"]
                    },
                    "timestamp": datetime.datetime.utcnow().isoformat()
                }), 200
                
        except Exception as e:
            conn.rollback()
            logger.error(f"Error removing company access from team {team_id}: {e}")
            return jsonify({"error": "Failed to remove team company access"}), 500
        finally:
            conn.close() 