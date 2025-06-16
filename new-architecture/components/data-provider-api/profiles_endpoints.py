#!/usr/bin/env python3
"""
Profiles Management Endpoints

API endpoints dla zarządzania Application Profiles w Portal Symfonia.
Profile to warstwa abstrakcji między Portalem a szczegółowymi rolami aplikacji.

Endpoints:
- GET /api/profiles - pobierz wszystkie profile 
- POST /api/profiles - dodaj nowy profil
- GET /api/profiles/{profile_id} - pobierz szczegóły profilu
- PUT /api/profiles/{profile_id} - zaktualizuj profil
- DELETE /api/profiles/{profile_id} - usuń profil
"""

import os
import json
import logging
import datetime
from typing import Dict, Any, Optional, List
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

def get_profile_with_mappings(profile_id):
    """Pobierz profil wraz z mapowaniami ról z bazy danych"""
    conn = get_db_connection()
    if not conn:
        return None
        
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Pobierz podstawowe dane profilu
            cur.execute("""
                SELECT 
                    ap.profile_id,
                    ap.app_id,
                    ap.profile_name,
                    ap.description,
                    ap.is_default,
                    ap.created_at,
                    a.app_name
                FROM application_profiles ap
                JOIN applications a ON ap.app_id = a.app_id
                WHERE ap.profile_id = %s
            """, (profile_id,))
            
            profile = cur.fetchone()
            if not profile:
                return None
            
            # Pobierz mapowane role
            cur.execute("""
                SELECT 
                    r.role_id,
                    r.role_name,
                    r.description,
                    r.is_system_role
                FROM profile_roles pr
                JOIN roles r ON pr.role_id = r.role_id
                WHERE pr.profile_id = %s
            """, (profile_id,))
            
            roles = cur.fetchall()
            
            # Formatuj odpowiedź zgodnie z oczekiwanym API
            formatted_profile = {
                "profile_id": str(profile['profile_id']),
                "profile_name": profile['profile_name'],
                "description": profile['description'],
                "applications": [profile['app_id']],
                "companies": [],  # TODO: Implementować gdy będzie potrzebne
                "role_mappings": {
                    profile['app_id']: [role['role_name'] for role in roles]
                },
                "metadata": {
                    "created_at": profile['created_at'].isoformat() if profile['created_at'] else None,
                    "created_by": "system",  # TODO: Implementować gdy będzie potrzebne 
                    "updated_at": profile['created_at'].isoformat() if profile['created_at'] else None,
                    "is_default": profile['is_default']
                }
            }
            
            return formatted_profile
            
    except Exception as e:
        logger.error(f"Error fetching profile {profile_id}: {e}")
        return None
    finally:
        conn.close()

def register_profiles_endpoints(app):
    """Rejestruje wszystkie endpoints dla profili"""
    
    @app.route("/api/profiles", methods=["GET"])
    def get_profiles():
        """Pobierz wszystkie profile z opcjonalnym filtrowaniem"""
        try:
            # Opcjonalne filtry z query parameters
            application_filter = request.args.get('application')
            company_filter = request.args.get('company')  # TODO: Implementować gdy będzie potrzebne
            
            conn = get_db_connection()
            if not conn:
                return jsonify({
                    "success": False,
                    "error": "Database connection failed"
                }), 503
            
            try:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    # Buduj zapytanie z opcjonalnymi filtrami
                    query = """
                        SELECT 
                            ap.profile_id,
                            ap.app_id,
                            ap.profile_name,
                            ap.description,
                            ap.is_default,
                            ap.created_at,
                            a.app_name
                        FROM application_profiles ap
                        JOIN applications a ON ap.app_id = a.app_id
                    """
                    params = []
                    
                    if application_filter:
                        query += " WHERE ap.app_id = %s"
                        params.append(application_filter)
                    
                    query += " ORDER BY ap.created_at DESC"
                    
                    cur.execute(query, params)
                    profiles_data = cur.fetchall()
                    
                    # Dla każdego profilu pobierz mapowania ról
                    profiles = []
                    for profile_data in profiles_data:
                        profile_id = profile_data['profile_id']
                        
                        # Pobierz role dla tego profilu
                        cur.execute("""
                            SELECT 
                                r.role_id,
                                r.role_name,
                                r.description,
                                r.is_system_role
                            FROM profile_roles pr
                            JOIN roles r ON pr.role_id = r.role_id
                            WHERE pr.profile_id = %s
                        """, (profile_id,))
                        
                        roles = cur.fetchall()
                        
                        # Formatuj profil
                        formatted_profile = {
                            "profile_id": str(profile_data['profile_id']),
                            "profile_name": profile_data['profile_name'],
                            "description": profile_data['description'],
                            "applications": [profile_data['app_id']],
                            "companies": [],  # TODO: Implementować gdy będzie potrzebne
                            "role_mappings": {
                                profile_data['app_id']: [role['role_name'] for role in roles]
                            },
                            "metadata": {
                                "created_at": profile_data['created_at'].isoformat() if profile_data['created_at'] else None,
                                "created_by": "system",
                                "updated_at": profile_data['created_at'].isoformat() if profile_data['created_at'] else None,
                                "is_default": profile_data['is_default']
                            }
                        }
                        
                        profiles.append(formatted_profile)
                
                logger.info(f"Retrieved {len(profiles)} profiles from database")
                
                return jsonify({
                    "success": True,
                    "profiles": profiles,
                    "total_count": len(profiles),
                    "filters": {
                        "application": application_filter,
                        "company": company_filter
                    },
                    "timestamp": datetime.datetime.utcnow().isoformat()
                })
                
            finally:
                conn.close()
            
        except Exception as e:
            logger.error(f"Error retrieving profiles: {str(e)}")
            return jsonify({
                "success": False,
                "error": f"Failed to retrieve profiles: {str(e)}"
            }), 500

    @app.route("/api/profiles/<profile_id>", methods=["GET"])
    def get_profile(profile_id):
        """Pobierz szczegóły konkretnego profilu"""
        try:
            profile_data = get_profile_with_mappings(profile_id)
            
            if not profile_data:
                return jsonify({
                    "success": False,
                    "error": "Profile not found"
                }), 404
                
            logger.info(f"Retrieved profile from database: {profile_id}")
            
            return jsonify({
                "success": True,
                "profile": profile_data,
                "timestamp": datetime.datetime.utcnow().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Error retrieving profile {profile_id}: {str(e)}")
            return jsonify({
                "success": False,
                "error": f"Failed to retrieve profile: {str(e)}"
            }), 500

    @app.route("/api/profiles", methods=["POST"])
    def create_profile():
        """Dodaj nowy profil"""
        try:
            data = request.get_json()
            
            # Walidacja podstawowych pól
            required_fields = ['profile_name', 'description', 'app_id']
            for field in required_fields:
                if field not in data:
                    return jsonify({
                        "success": False,
                        "error": f"Missing required field: {field}"
                    }), 400
            
            conn = get_db_connection()
            if not conn:
                return jsonify({
                    "success": False,
                    "error": "Database connection failed"
                }), 503
            
            try:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    # Sprawdź czy aplikacja istnieje
                    cur.execute("SELECT app_id FROM applications WHERE app_id = %s", (data['app_id'],))
                    if not cur.fetchone():
                        return jsonify({
                            "success": False,
                            "error": f"Application '{data['app_id']}' not found"
                        }), 400
                    
                    # Sprawdź czy profil o tej nazwie już istnieje dla tej aplikacji
                    cur.execute("""
                        SELECT profile_id FROM application_profiles 
                        WHERE app_id = %s AND profile_name = %s
                    """, (data['app_id'], data['profile_name']))
                    
                    if cur.fetchone():
                        return jsonify({
                            "success": False,
                            "error": "Profile with this name already exists for this application"
                        }), 409
                    
                    # Utworz nowy profil
                    cur.execute("""
                        INSERT INTO application_profiles (app_id, profile_name, description, is_default)
                        VALUES (%s, %s, %s, %s)
                        RETURNING profile_id, created_at
                    """, (
                        data['app_id'],
                        data['profile_name'],
                        data['description'],
                        data.get('is_default', False)
                    ))
                    
                    result = cur.fetchone()
                    profile_id = result['profile_id']
                    
                    # Mapuj role jeśli podano
                    role_names = data.get('role_mappings', {}).get(data['app_id'], [])
                    if role_names:
                        for role_name in role_names:
                            # Znajdź role_id na podstawie nazwy
                            cur.execute("""
                                SELECT role_id FROM roles 
                                WHERE app_id = %s AND role_name = %s
                            """, (data['app_id'], role_name))
                            
                            role_result = cur.fetchone()
                            if role_result:
                                # Dodaj mapowanie profil -> rola
                                cur.execute("""
                                    INSERT INTO profile_roles (profile_id, role_id)
                                    VALUES (%s, %s)
                                    ON CONFLICT (profile_id, role_id) DO NOTHING
                                """, (profile_id, role_result['role_id']))
                    
                    conn.commit()
                    
                    # Pobierz utworzony profil
                    created_profile = get_profile_with_mappings(profile_id)
                    
                    logger.info(f"Created new profile: {profile_id}")
                    
                    return jsonify({
                        "success": True,
                        "profile": created_profile,
                        "message": "Profile created successfully"
                    }), 201
                    
            finally:
                conn.close()
                
        except Exception as e:
            logger.error(f"Error creating profile: {str(e)}")
            return jsonify({
                "success": False,
                "error": f"Failed to create profile: {str(e)}"
            }), 500

    @app.route("/api/profiles/<profile_id>", methods=["PUT"])
    def update_profile(profile_id):
        """Zaktualizuj profil"""
        try:
            data = request.get_json()
            
            conn = get_db_connection()
            if not conn:
                return jsonify({
                    "success": False,
                    "error": "Database connection failed"
                }), 503
            
            try:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    # Sprawdź czy profil istnieje
                    cur.execute("SELECT profile_id, app_id FROM application_profiles WHERE profile_id = %s", (profile_id,))
                    existing_profile = cur.fetchone()
                    
                    if not existing_profile:
                        return jsonify({
                            "success": False,
                            "error": "Profile not found"
                        }), 404
                    
                    app_id = existing_profile['app_id']
                    
                    # Aktualizuj podstawowe dane profilu
                    update_fields = []
                    update_values = []
                    
                    if 'profile_name' in data:
                        update_fields.append("profile_name = %s")
                        update_values.append(data['profile_name'])
                    
                    if 'description' in data:
                        update_fields.append("description = %s")
                        update_values.append(data['description'])
                    
                    if 'is_default' in data:
                        update_fields.append("is_default = %s")
                        update_values.append(data['is_default'])
                    
                    if update_fields:
                        update_values.append(profile_id)
                        update_query = f"""
                            UPDATE application_profiles 
                            SET {', '.join(update_fields)}
                            WHERE profile_id = %s
                        """
                        cur.execute(update_query, update_values)
                    
                    # Aktualizuj mapowania ról jeśli podano
                    if 'role_mappings' in data:
                        role_names = data['role_mappings'].get(app_id, [])
                        
                        # Usuń istniejące mapowania
                        cur.execute("DELETE FROM profile_roles WHERE profile_id = %s", (profile_id,))
                        
                        # Dodaj nowe mapowania
                        for role_name in role_names:
                            cur.execute("""
                                SELECT role_id FROM roles 
                                WHERE app_id = %s AND role_name = %s
                            """, (app_id, role_name))
                            
                            role_result = cur.fetchone()
                            if role_result:
                                cur.execute("""
                                    INSERT INTO profile_roles (profile_id, role_id)
                                    VALUES (%s, %s)
                                """, (profile_id, role_result['role_id']))
                    
                    conn.commit()
                    
                    # Pobierz zaktualizowany profil
                    updated_profile = get_profile_with_mappings(profile_id)
                    
                    logger.info(f"Updated profile: {profile_id}")
                    
                    return jsonify({
                        "success": True,
                        "profile": updated_profile,
                        "message": "Profile updated successfully"
                    })
                    
            finally:
                conn.close()
                
        except Exception as e:
            logger.error(f"Error updating profile {profile_id}: {str(e)}")
            return jsonify({
                "success": False,
                "error": f"Failed to update profile: {str(e)}"
            }), 500

    @app.route("/api/profiles/<profile_id>", methods=["DELETE"])
    def delete_profile(profile_id):
        """Usuń profil"""
        try:
            conn = get_db_connection()
            if not conn:
                return jsonify({
                    "success": False,
                    "error": "Database connection failed"
                }), 503
            
            try:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    # Sprawdź czy profil istnieje
                    cur.execute("SELECT profile_id FROM application_profiles WHERE profile_id = %s", (profile_id,))
                    
                    if not cur.fetchone():
                        return jsonify({
                            "success": False,
                            "error": "Profile not found"
                        }), 404
                    
                    # Sprawdź czy profil nie jest używany przez użytkowników
                    cur.execute("""
                        SELECT COUNT(*) as usage_count 
                        FROM user_application_profiles 
                        WHERE profile_id = %s
                    """, (profile_id,))
                    
                    usage_result = cur.fetchone()
                    if usage_result['usage_count'] > 0:
                        return jsonify({
                            "success": False,
                            "error": f"Cannot delete profile: {usage_result['usage_count']} users are using this profile",
                            "usage_count": usage_result['usage_count']
                        }), 409
                    
                    # Usuń mapowania ról (CASCADE powinno to zrobić automatycznie)
                    cur.execute("DELETE FROM profile_roles WHERE profile_id = %s", (profile_id,))
                    
                    # Usuń profil
                    cur.execute("DELETE FROM application_profiles WHERE profile_id = %s", (profile_id,))
                    
                    conn.commit()
                    
                    logger.info(f"Deleted profile: {profile_id}")
                    
                    return jsonify({
                        "success": True,
                        "message": "Profile deleted successfully",
                        "profile_id": profile_id
                    })
                    
            finally:
                conn.close()
                
        except Exception as e:
            logger.error(f"Error deleting profile {profile_id}: {str(e)}")
            return jsonify({
                "success": False,
                "error": f"Failed to delete profile: {str(e)}"
            }), 500

    @app.route("/api/profiles/<profile_id>/role-mappings", methods=["GET"])
    def get_profile_role_mappings(profile_id):
        """Pobierz mapowania ról dla profilu"""
        try:
            conn = get_db_connection()
            if not conn:
                return jsonify({
                    "success": False,
                    "error": "Database connection failed"
                }), 503
            
            try:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    # Sprawdź czy profil istnieje
                    cur.execute("""
                        SELECT ap.profile_id, ap.app_id, ap.profile_name
                        FROM application_profiles ap
                        WHERE ap.profile_id = %s
                    """, (profile_id,))
                    
                    profile = cur.fetchone()
                    if not profile:
                        return jsonify({
                            "success": False,
                            "error": "Profile not found"
                        }), 404
                    
                    # Pobierz mapowania ról z szczegółami uprawnień
                    cur.execute("""
                        SELECT 
                            r.role_id,
                            r.role_name,
                            r.description as role_description,
                            r.is_system_role,
                            array_agg(
                                json_build_object(
                                    'permission_id', p.permission_id,
                                    'permission_name', p.permission_name,
                                    'description', p.description,
                                    'resource_type', p.resource_type,
                                    'action', p.action
                                )
                            ) FILTER (WHERE p.permission_id IS NOT NULL) as permissions
                        FROM profile_roles pr
                        JOIN roles r ON pr.role_id = r.role_id
                        LEFT JOIN role_permissions rp ON r.role_id = rp.role_id
                        LEFT JOIN permissions p ON rp.permission_id = p.permission_id
                        WHERE pr.profile_id = %s
                        GROUP BY r.role_id, r.role_name, r.description, r.is_system_role
                        ORDER BY r.role_name
                    """, (profile_id,))
                    
                    roles_with_permissions = cur.fetchall()
                    
                    # Formatuj odpowiedź
                    role_mappings = {
                        profile['app_id']: [
                            {
                                "role_name": role['role_name'],
                                "role_description": role['role_description'],
                                "is_system_role": role['is_system_role'],
                                "permissions": role['permissions'] or []
                            }
                            for role in roles_with_permissions
                        ]
                    }
                    
                    logger.info(f"Retrieved role mappings for profile: {profile_id}")
                    
                    return jsonify({
                        "success": True,
                        "profile_id": str(profile_id),
                        "profile_name": profile['profile_name'],
                        "app_id": profile['app_id'],
                        "role_mappings": role_mappings,
                        "roles_count": len(roles_with_permissions),
                        "timestamp": datetime.datetime.utcnow().isoformat()
                    })
                    
            finally:
                conn.close()
                
        except Exception as e:
            logger.error(f"Error retrieving role mappings for profile {profile_id}: {str(e)}")
            return jsonify({
                "success": False,
                "error": f"Failed to retrieve role mappings: {str(e)}"
            }), 500

    logger.info("✅ Profiles management endpoints registered") 