#!/usr/bin/env python3
"""
User Application Access & Companies Management Endpoints

API endpoints dla zarządzania dostępami użytkowników do aplikacji i firm.
Endpointy umożliwiają:
- Pobieranie dostępów użytkownika do aplikacji (z profilami) 
- Przypisywanie/usuwanie dostępów do aplikacji
- Pobieranie firm przypisanych do użytkownika (wspólny słownik)
- Przypisywanie/usuwanie firm użytkownikom

Endpoints:
- GET /api/users/{user_id}/application-access - pobierz dostępy użytkownika do aplikacji
- POST /api/users/{user_id}/application-access - przypisz dostęp do aplikacji
- DELETE /api/users/{user_id}/application-access/{profile_id} - usuń dostęp do aplikacji
- GET /api/users/{user_id}/companies - pobierz firmy użytkownika
- POST /api/users/{user_id}/companies - przypisz firmę użytkownikowi
- DELETE /api/users/{user_id}/companies/{company_id} - usuń firmę od użytkownika
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
            host=os.environ.get('DB_HOST', 'postgres-db'),
            port=os.environ.get('DB_PORT', '5432'),
            database=os.environ.get('DB_NAME', 'opa_zero_poll'),
            user=os.environ.get('DB_USER', 'opa_user'),
            password=os.environ.get('DB_PASSWORD', 'opa_password')
        )
        return conn
    except Exception as e:
        logger.error(f"Błąd połączenia z bazą danych: {e}")
        return None

def register_user_profiles_endpoints(app):
    """Zarejestruj endpointy zarządzania dostępami użytkowników do aplikacji i firm"""
    
    @app.route('/api/users/<user_id>/application-access', methods=['GET'])
    def get_user_application_access(user_id):
        """Pobierz wszystkie dostępy użytkownika do aplikacji (z profilami)"""
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500
            
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Pobierz dostępy użytkownika do aplikacji z pełnymi danymi
                cur.execute("""
                    SELECT 
                        ap.profile_id,
                        ap.app_id,
                        ap.profile_name,
                        ap.description,
                        ap.is_default,
                        ap.created_at,
                        a.app_name,
                        uap.assigned_at,
                        uap.assigned_by
                    FROM user_application_profiles uap
                    JOIN application_profiles ap ON uap.profile_id = ap.profile_id
                    JOIN applications a ON ap.app_id = a.app_id
                    WHERE uap.user_id = %s
                    ORDER BY a.app_name, ap.profile_name
                """, (user_id,))
                
                access_data = cur.fetchall()
                
                # Dla każdego dostępu pobierz mapowania ról
                access_with_mappings = []
                for access in access_data:
                    # Pobierz role i uprawnienia dla profilu
                    cur.execute("""
                        SELECT 
                            r.role_id,
                            r.role_name,
                            r.description as role_description,
                            pr.permission_id,
                            pr.permission_name,
                            pr.description as permission_description
                        FROM profile_roles proles
                        JOIN roles r ON proles.role_id = r.role_id
                        LEFT JOIN role_permissions rp ON r.role_id = rp.role_id
                        LEFT JOIN permissions pr ON rp.permission_id = pr.permission_id
                        WHERE proles.profile_id = %s
                        ORDER BY r.role_name, pr.permission_name
                    """, (access['profile_id'],))
                    
                    role_data = cur.fetchall()
                    
                    # Grupuj uprawnienia według ról
                    role_mappings = {}
                    for role_row in role_data:
                        role_id = role_row['role_id']
                        if role_id not in role_mappings:
                            role_mappings[role_id] = {
                                'role_id': role_id,
                                'role_name': role_row['role_name'],
                                'description': role_row['role_description'],
                                'permissions': []
                            }
                        
                        if role_row['permission_id']:
                            role_mappings[role_id]['permissions'].append({
                                'permission_id': role_row['permission_id'],
                                'permission_name': role_row['permission_name'],
                                'description': role_row['permission_description']
                            })
                    
                    access_dict = dict(access)
                    access_dict['role_mappings'] = list(role_mappings.values())
                    access_with_mappings.append(access_dict)
                
                return jsonify({
                    "user_id": user_id,
                    "application_access": access_with_mappings,
                    "total_count": len(access_with_mappings),
                    "timestamp": datetime.datetime.utcnow().isoformat()
                })
                
        except Exception as e:
            logger.error(f"Błąd pobierania dostępów użytkownika {user_id}: {e}")
            return jsonify({"error": str(e)}), 500
        finally:
            conn.close()

    @app.route('/api/users/<user_id>/application-access', methods=['POST'])
    def assign_application_access_to_user(user_id):
        """Przypisz dostęp do aplikacji użytkownikowi"""
        data = request.get_json()
        if not data or 'profile_id' not in data:
            return jsonify({"error": "profile_id is required"}), 400
            
        profile_id = data['profile_id']
        assigned_by = data.get('assigned_by', 'system')
        tenant_id = data.get('tenant_id')  # Opcjonalny - jeśli nie podano, użyj domyślnego
        
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500
            
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Sprawdź czy użytkownik istnieje
                cur.execute("SELECT user_id FROM users WHERE user_id = %s", (user_id,))
                if not cur.fetchone():
                    return jsonify({"error": "User not found"}), 404
                
                # Sprawdź czy profil istnieje
                cur.execute("SELECT profile_id FROM application_profiles WHERE profile_id = %s", (profile_id,))
                if not cur.fetchone():
                    return jsonify({"error": "Profile not found"}), 404
                
                # Jeśli tenant_id nie podano, pobierz domyślny tenant użytkownika
                if not tenant_id:
                    cur.execute("""
                        SELECT tenant_id 
                        FROM user_tenants 
                        WHERE user_id = %s AND is_default = TRUE AND is_active = TRUE
                        LIMIT 1
                    """, (user_id,))
                    
                    tenant_result = cur.fetchone()
                    if not tenant_result:
                        return jsonify({"error": "User has no default tenant assigned"}), 400
                    
                    tenant_id = tenant_result['tenant_id']
                
                # Sprawdź czy użytkownik ma dostęp do podanego tenanta
                cur.execute("""
                    SELECT * FROM user_tenants 
                    WHERE user_id = %s AND tenant_id = %s AND is_active = TRUE
                """, (user_id, tenant_id))
                
                if not cur.fetchone():
                    return jsonify({"error": f"User does not have access to tenant {tenant_id}"}), 403
                
                # Sprawdź czy przypisanie już istnieje
                cur.execute("""
                    SELECT * FROM user_application_profiles 
                    WHERE user_id = %s AND profile_id = %s AND tenant_id = %s
                """, (user_id, profile_id, tenant_id))
                
                if cur.fetchone():
                    return jsonify({"error": "Application access already assigned to user"}), 409
                
                # Dodaj przypisanie z tenant_id
                cur.execute("""
                    INSERT INTO user_application_profiles (user_id, profile_id, tenant_id, assigned_by)
                    VALUES (%s, %s, %s, %s)
                    RETURNING assigned_at
                """, (user_id, profile_id, tenant_id, assigned_by))
                
                result = cur.fetchone()
                conn.commit()
                
                logger.info(f"Przypisano dostęp do aplikacji (profil {profile_id}) użytkownikowi {user_id} w tenant {tenant_id}")
                
                return jsonify({
                    "message": "Application access assigned successfully",
                    "user_id": user_id,
                    "profile_id": profile_id,
                    "tenant_id": tenant_id,
                    "assigned_at": result['assigned_at'].isoformat(),
                    "assigned_by": assigned_by
                }), 201
                
        except Exception as e:
            logger.error(f"Błąd przypisywania dostępu aplikacji {profile_id} do użytkownika {user_id}: {e}")
            conn.rollback()
            return jsonify({"error": str(e)}), 500
        finally:
            conn.close()

    @app.route('/api/users/<user_id>/application-access/<profile_id>', methods=['DELETE'])
    def remove_application_access_from_user(user_id, profile_id):
        """Usuń dostęp do aplikacji od użytkownika"""
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500
            
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Sprawdź czy przypisanie istnieje
                cur.execute("""
                    SELECT * FROM user_application_profiles 
                    WHERE user_id = %s AND profile_id = %s
                """, (user_id, profile_id))
                
                access_record = cur.fetchone()
                if not access_record:
                    return jsonify({"error": "Application access not found"}), 404
                
                # Usuń przypisanie
                cur.execute("""
                    DELETE FROM user_application_profiles 
                    WHERE user_id = %s AND profile_id = %s
                """, (user_id, profile_id))
                
                conn.commit()
                
                logger.info(f"Usunięto dostęp do aplikacji (profil {profile_id}) od użytkownika {user_id}")
                
                return jsonify({
                    "message": "Application access removed successfully",
                    "user_id": user_id,
                    "profile_id": profile_id
                }), 200
                
        except Exception as e:
            logger.error(f"Błąd usuwania dostępu aplikacji {profile_id} od użytkownika {user_id}: {e}")
            conn.rollback()
            return jsonify({"error": str(e)}), 500
        finally:
            conn.close()

    @app.route('/api/users/<user_id>/companies', methods=['GET'])
    def get_user_companies(user_id):
        """Pobierz wszystkie firmy przypisane do użytkownika (wspólny słownik)"""
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500
            
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Pobierz firmy użytkownika z pełnymi danymi
                cur.execute("""
                    SELECT 
                        uc.id as assignment_id,
                        uc.user_id,
                        uc.company_id,
                        uc.assigned_by,
                        uc.assigned_at,
                        uc.notes,
                        uc.is_active,
                        c.company_name,
                        c.company_code,
                        c.description as company_description,
                        c.nip,
                        c.status as company_status,
                        c.tenant_id,
                        c.created_at as company_created_at,
                        c.updated_at as company_updated_at
                    FROM user_companies uc
                    JOIN companies c ON uc.company_id = c.company_id
                    WHERE uc.user_id = %s AND uc.is_active = TRUE
                    ORDER BY c.company_name
                """, (user_id,))
                
                companies_data = cur.fetchall()
                
                return jsonify({
                    "user_id": user_id,
                    "companies": [dict(company) for company in companies_data],
                    "total_count": len(companies_data),
                    "timestamp": datetime.datetime.utcnow().isoformat()
                })
                
        except Exception as e:
            logger.error(f"Błąd pobierania firm użytkownika {user_id}: {e}")
            return jsonify({"error": str(e)}), 500
        finally:
            conn.close()

    @app.route('/api/users/<user_id>/companies', methods=['POST'])
    def assign_company_to_user(user_id):
        """Przypisz firmę do użytkownika"""
        data = request.get_json()
        if not data or 'company_id' not in data:
            return jsonify({"error": "company_id is required"}), 400
            
        company_id = data['company_id']
        assigned_by = data.get('assigned_by', 'system')
        notes = data.get('notes', '')
        
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500
            
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Sprawdź czy użytkownik istnieje
                cur.execute("SELECT user_id FROM users WHERE user_id = %s", (user_id,))
                if not cur.fetchone():
                    return jsonify({"error": "User not found"}), 404
                
                # Sprawdź czy firma istnieje
                cur.execute("SELECT company_id FROM companies WHERE company_id = %s", (company_id,))
                if not cur.fetchone():
                    return jsonify({"error": "Company not found"}), 404
                
                # Sprawdź czy przypisanie już istnieje (aktywne)
                cur.execute("""
                    SELECT * FROM user_companies 
                    WHERE user_id = %s AND company_id = %s AND is_active = TRUE
                """, (user_id, company_id))
                
                if cur.fetchone():
                    return jsonify({"error": "Company already assigned to user"}), 409
                
                # Dodaj przypisanie
                cur.execute("""
                    INSERT INTO user_companies (user_id, company_id, assigned_by, notes)
                    VALUES (%s, %s, %s, %s)
                    RETURNING id, assigned_at
                """, (user_id, company_id, assigned_by, notes))
                
                result = cur.fetchone()
                conn.commit()
                
                logger.info(f"Przypisano firmę {company_id} do użytkownika {user_id}")
                
                return jsonify({
                    "message": "Company assigned successfully",
                    "assignment_id": str(result['id']),
                    "user_id": user_id,
                    "company_id": company_id,
                    "assigned_at": result['assigned_at'].isoformat(),
                    "assigned_by": assigned_by,
                    "notes": notes
                }), 201
                
        except Exception as e:
            logger.error(f"Błąd przypisywania firmy {company_id} do użytkownika {user_id}: {e}")
            conn.rollback()
            return jsonify({"error": str(e)}), 500
        finally:
            conn.close()

    @app.route('/api/users/<user_id>/companies/<company_id>', methods=['DELETE'])
    def remove_company_from_user(user_id, company_id):
        """Usuń firmę od użytkownika (soft delete - ustawia is_active = FALSE)"""
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500
            
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Sprawdź czy przypisanie istnieje
                cur.execute("""
                    SELECT * FROM user_companies 
                    WHERE user_id = %s AND company_id = %s AND is_active = TRUE
                """, (user_id, company_id))
                
                company_record = cur.fetchone()
                if not company_record:
                    return jsonify({"error": "Company assignment not found"}), 404
                
                # Soft delete - ustaw is_active = FALSE
                cur.execute("""
                    UPDATE user_companies 
                    SET is_active = FALSE 
                    WHERE user_id = %s AND company_id = %s
                """, (user_id, company_id))
                
                conn.commit()
                
                logger.info(f"Usunięto firmę {company_id} od użytkownika {user_id}")
                
                return jsonify({
                    "message": "Company removed successfully",
                    "user_id": user_id,
                    "company_id": company_id
                }), 200
                
        except Exception as e:
            logger.error(f"Błąd usuwania firmy {company_id} od użytkownika {user_id}: {e}")
            conn.rollback()
            return jsonify({"error": str(e)}), 500
        finally:
            conn.close()

    logger.info("✅ User profiles management endpoints registered") 