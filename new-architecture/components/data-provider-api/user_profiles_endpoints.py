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
- POST /api/users/{user_id}/sync-profiles - synchronizuj profile użytkownika z rolami
"""

import os
import json
import logging
import datetime
from typing import Dict, Any, Optional, List
from flask import request, jsonify
import psycopg2
from psycopg2.extras import RealDictCursor
from flask import Blueprint
# DAO imports removed - this module uses direct SQL queries
from shared.database.connection import get_db_cursor
from profile_role_mapper import apply_profile_to_user_roles, remove_profile_from_user_roles, sync_user_profiles_to_roles

logger = logging.getLogger(__name__)

def register_user_profiles_endpoints(app):
    """Rejestruje endpointy do zarządzania profilami użytkowników"""
    
    @app.route('/api/users/<user_id>/application-access', methods=['GET'])
    def get_user_application_access(user_id):
        """Pobierz dostępy użytkownika do aplikacji (profile)"""
        try:
            logger.info(f"Pobieranie dostępów aplikacji dla użytkownika {user_id}")
            
            with get_db_cursor() as cursor:
                # Pobierz przypisane profile aplikacji użytkownika
                cursor.execute("""
                    SELECT 
                        uap.profile_id,
                        ap.profile_name,
                        ap.app_id,
                        a.app_name,
                        ap.description as profile_description,
                        uap.assigned_at,
                        uap.assigned_by
                    FROM user_application_profiles uap
                    JOIN application_profiles ap ON uap.profile_id = ap.profile_id
                    JOIN applications a ON ap.app_id = a.app_id
                    WHERE uap.user_id = %s
                    ORDER BY a.app_name, ap.profile_name
                """, (user_id,))
                
                profiles = cursor.fetchall()
                
                # Przekształć wyniki do formatu JSON
                applications = {}
                for row in profiles:
                    app_id = row['app_id']
                    app_name = row['app_name']
                    
                    if app_id not in applications:
                        applications[app_id] = {
                            "app_id": app_id,
                            "app_name": app_name,
                            "profiles": []
                        }
                    
                    applications[app_id]["profiles"].append({
                        "profile_id": row['profile_id'],
                        "profile_name": row['profile_name'],
                        "description": row['profile_description'],
                        "assigned_at": row['assigned_at'].isoformat() if row['assigned_at'] else None,
                        "assigned_by": row['assigned_by']
                    })
                
                result = {
                    "user_id": user_id,
                    "applications": list(applications.values()),
                    "total_profiles": len(profiles)
                }
                
                logger.info(f"✅ Znaleziono {len(profiles)} profili dla użytkownika {user_id}")
                return jsonify(result)
                
        except Exception as e:
            logger.error(f"❌ Błąd pobierania dostępów dla użytkownika {user_id}: {e}")
            return jsonify({"error": "Błąd pobierania dostępów aplikacji"}), 500

    @app.route('/api/users/<user_id>/application-access', methods=['POST'])
    def assign_user_application_access(user_id):
        """Przypisz profil aplikacji użytkownikowi"""
        try:
            data = request.get_json()
            profile_id = data.get('profile_id')
            assigned_by = data.get('assigned_by', 'api_user')
            
            if not profile_id:
                return jsonify({"error": "profile_id jest wymagane"}), 400
            
            logger.info(f"Przypisywanie profilu {profile_id} użytkownikowi {user_id}")
            
            with get_db_cursor() as cursor:
                # Sprawdź czy profil istnieje i pobierz dane
                cursor.execute("""
                    SELECT ap.profile_id, ap.profile_name, ap.app_id, a.app_name
                    FROM application_profiles ap
                    JOIN applications a ON ap.app_id = a.app_id
                    WHERE ap.profile_id = %s
                """, (profile_id,))
                
                profile_data = cursor.fetchone()
                if not profile_data:
                    return jsonify({"error": "Profil nie istnieje"}), 404
                
                # Sprawdź czy przypisanie już istnieje
                cursor.execute("""
                    SELECT COUNT(*) as count FROM user_application_profiles
                    WHERE user_id = %s AND profile_id = %s
                """, (user_id, profile_id))
                
                count_result = cursor.fetchone()
                exists = count_result['count'] > 0 if isinstance(count_result, dict) else count_result[0] > 0
                
                if exists:
                    return jsonify({"error": "Profil już przypisany do użytkownika"}), 409
                
                # Utwórz przypisanie profilu
                cursor.execute("""
                    INSERT INTO user_application_profiles (user_id, profile_id, assigned_at, assigned_by)
                    VALUES (%s, %s, NOW(), %s)
                """, (user_id, profile_id, assigned_by))
                
                # Automatyczne mapowanie profilu na role (nasz nowy system)
                from profile_role_mapper import apply_profile_to_user_roles
                
                # Pobierz domyślny tenant użytkownika
                cursor.execute("SELECT tenant_id FROM users WHERE user_id = %s LIMIT 1", (user_id,))
                tenant_result = cursor.fetchone()
                if tenant_result:
                    tenant_id = tenant_result['tenant_id'] if isinstance(tenant_result, dict) else tenant_result[0]
                    
                    # Zastosuj mapowanie profilu do ról
                    mapping_result = apply_profile_to_user_roles(
                        user_id, 
                        profile_id, 
                        profile_data['app_id'], 
                        tenant_id
                    )
                    
                    result = {
                        "success": True,
                        "message": f"Profil {profile_data['profile_name']} przypisany użytkownikowi {user_id}",
                        "profile": {
                            "profile_id": profile_id,
                            "profile_name": profile_data['profile_name'],
                            "app_id": profile_data['app_id'],
                            "app_name": profile_data['app_name']
                        },
                        "role_mapping": mapping_result
                    }
                    
                    logger.info(f"✅ Profil {profile_id} przypisany i zmapowany na role dla użytkownika {user_id}")
                    return jsonify(result), 201
                else:
                    logger.warning(f"⚠️ Nie znaleziono tenant_id dla użytkownika {user_id}")
                    return jsonify({"error": "Nie można określić tenant_id użytkownika"}), 400
                
        except Exception as e:
            logger.error(f"❌ Błąd przypisywania profilu użytkownikowi {user_id}: {e}")
            return jsonify({"error": "Błąd przypisywania profilu"}), 500

    @app.route('/api/users/<user_id>/application-access/<profile_id>', methods=['DELETE'])
    def remove_user_application_access(user_id, profile_id):
        """Usuń profil aplikacji od użytkownika"""
        try:
            logger.info(f"Usuwanie profilu {profile_id} od użytkownika {user_id}")
            
            with get_db_cursor() as cursor:
                # Sprawdź czy przypisanie istnieje i pobierz dane profilu
                cursor.execute("""
                    SELECT ap.profile_name, ap.app_id, a.app_name
                    FROM user_application_profiles uap
                    JOIN application_profiles ap ON uap.profile_id = ap.profile_id
                    JOIN applications a ON ap.app_id = a.app_id
                    WHERE uap.user_id = %s AND uap.profile_id = %s
                """, (user_id, profile_id))
                
                profile_data = cursor.fetchone()
                if not profile_data:
                    return jsonify({"error": "Przypisanie profilu nie istnieje"}), 404
                
                # Usuń przypisanie profilu
                cursor.execute("""
                    DELETE FROM user_application_profiles
                    WHERE user_id = %s AND profile_id = %s
                """, (user_id, profile_id))
                
                if cursor.rowcount == 0:
                    return jsonify({"error": "Nie udało się usunąć przypisania"}), 500
                
                # Automatyczne usuwanie ról pochodzących z profilu
                from profile_role_mapper import remove_profile_from_user_roles
                
                # Pobierz domyślny tenant użytkownika z tabeli user_tenants
                cursor.execute("""
                    SELECT tenant_id FROM user_tenants 
                    WHERE user_id = %s AND is_default = true AND is_active = true
                    LIMIT 1
                """, (user_id,))
                tenant_result = cursor.fetchone()
                if tenant_result:
                    tenant_id = tenant_result['tenant_id'] if isinstance(tenant_result, dict) else tenant_result[0]
                    
                    # Usuń role pochodzące z profilu
                    removal_result = remove_profile_from_user_roles(
                        user_id, 
                        profile_id, 
                        profile_data['app_id'], 
                        tenant_id
                    )
                    
                    result = {
                        "success": True,
                        "message": f"Profil {profile_data['profile_name']} usunięty od użytkownika {user_id}",
                        "removed_profile": {
                            "profile_id": profile_id,
                            "profile_name": profile_data['profile_name'],
                            "app_id": profile_data['app_id'],
                            "app_name": profile_data['app_name']
                        },
                        "role_removal": removal_result
                    }
                    
                    logger.info(f"✅ Profil {profile_id} i role usunięte dla użytkownika {user_id}")
                    return jsonify(result)
                else:
                    logger.warning(f"⚠️ Nie znaleziono tenant_id dla użytkownika {user_id}")
                    return jsonify({"error": "Nie można określić tenant_id użytkownika"}), 400
                
        except Exception as e:
            logger.error(f"❌ Błąd usuwania profilu od użytkownika {user_id}: {e}")
            return jsonify({"error": "Błąd usuwania profilu"}), 500

    @app.route('/api/users/<user_id>/companies', methods=['GET'])
    def get_user_companies(user_id):
        """Pobierz firmy przypisane do użytkownika"""
        try:
            logger.info(f"Pobieranie firm dla użytkownika {user_id}")
            
            with get_db_cursor() as cursor:
                # Pobierz firmy przypisane do użytkownika
                cursor.execute("""
                    SELECT 
                        uc.company_id,
                        c.company_name,
                        c.tax_number,
                        c.tenant_id,
                        uc.assigned_at,
                        uc.assigned_by
                    FROM user_companies uc
                    JOIN companies c ON uc.company_id = c.company_id
                    WHERE uc.user_id = %s
                    ORDER BY c.company_name
                """, (user_id,))
                
                companies = cursor.fetchall()
                
                # Przekształć wyniki do formatu JSON
                result_companies = []
                for row in companies:
                    result_companies.append({
                        "company_id": row['company_id'],
                        "company_name": row['company_name'],
                        "tax_number": row['tax_number'],
                        "tenant_id": row['tenant_id'],
                        "assigned_at": row['assigned_at'].isoformat() if row['assigned_at'] else None,
                        "assigned_by": row['assigned_by']
                    })
                
                result = {
                    "user_id": user_id,
                    "companies": result_companies,
                    "total_companies": len(companies)
                }
                
                logger.info(f"✅ Znaleziono {len(companies)} firm dla użytkownika {user_id}")
                return jsonify(result)
                
        except Exception as e:
            logger.error(f"❌ Błąd pobierania firm dla użytkownika {user_id}: {e}")
            return jsonify({"error": "Błąd pobierania firm"}), 500

    @app.route('/api/users/<user_id>/companies', methods=['POST'])
    def assign_user_company(user_id):
        """Przypisz firmę użytkownikowi"""
        try:
            data = request.get_json()
            company_id = data.get('company_id')
            assigned_by = data.get('assigned_by', 'api_user')
            
            if not company_id:
                return jsonify({"error": "company_id jest wymagane"}), 400
            
            logger.info(f"Przypisywanie firmy {company_id} użytkownikowi {user_id}")
            
            with get_db_cursor() as cursor:
                # Sprawdź czy firma istnieje
                cursor.execute("""
                    SELECT company_id, company_name, tax_number
                    FROM companies WHERE company_id = %s
                """, (company_id,))
                
                company_data = cursor.fetchone()
                if not company_data:
                    return jsonify({"error": "Firma nie istnieje"}), 404
                
                # Sprawdź czy przypisanie już istnieje
                cursor.execute("""
                    SELECT COUNT(*) as count FROM user_companies
                    WHERE user_id = %s AND company_id = %s
                """, (user_id, company_id))
                
                count_result = cursor.fetchone()
                exists = count_result['count'] > 0 if isinstance(count_result, dict) else count_result[0] > 0
                
                if exists:
                    return jsonify({"error": "Firma już przypisana do użytkownika"}), 409
                
                # Utwórz przypisanie firmy
                cursor.execute("""
                    INSERT INTO user_companies (user_id, company_id, assigned_at, assigned_by)
                    VALUES (%s, %s, NOW(), %s)
                """, (user_id, company_id, assigned_by))
                
                result = {
                    "success": True,
                    "message": f"Firma {company_data['company_name']} przypisana użytkownikowi {user_id}",
                    "company": {
                        "company_id": company_id,
                        "company_name": company_data['company_name'],
                        "tax_number": company_data['tax_number']
                    }
                }
                
                logger.info(f"✅ Firma {company_id} przypisana użytkownikowi {user_id}")
                return jsonify(result), 201
                
        except Exception as e:
            logger.error(f"❌ Błąd przypisywania firmy użytkownikowi {user_id}: {e}")
            return jsonify({"error": "Błąd przypisywania firmy"}), 500

    @app.route('/api/users/<user_id>/companies/<company_id>', methods=['DELETE'])
    def remove_user_company(user_id, company_id):
        """Usuń firmę od użytkownika"""
        try:
            logger.info(f"Usuwanie firmy {company_id} od użytkownika {user_id}")
            
            with get_db_cursor() as cursor:
                # Sprawdź czy przypisanie istnieje i pobierz dane firmy
                cursor.execute("""
                    SELECT c.company_name, c.tax_number
                    FROM user_companies uc
                    JOIN companies c ON uc.company_id = c.company_id
                    WHERE uc.user_id = %s AND uc.company_id = %s
                """, (user_id, company_id))
                
                company_data = cursor.fetchone()
                if not company_data:
                    return jsonify({"error": "Przypisanie firmy nie istnieje"}), 404
                
                # Usuń przypisanie firmy
                cursor.execute("""
                    DELETE FROM user_companies
                    WHERE user_id = %s AND company_id = %s
                """, (user_id, company_id))
                
                if cursor.rowcount == 0:
                    return jsonify({"error": "Nie udało się usunąć przypisania"}), 500
                
                result = {
                    "success": True,
                    "message": f"Firma {company_data['company_name']} usunięta od użytkownika {user_id}",
                    "removed_company": {
                        "company_id": company_id,
                        "company_name": company_data['company_name'],
                        "tax_number": company_data['tax_number']
                    }
                }
                
                logger.info(f"✅ Firma {company_id} usunięta dla użytkownika {user_id}")
                return jsonify(result)
                
        except Exception as e:
            logger.error(f"❌ Błąd usuwania firmy od użytkownika {user_id}: {e}")
            return jsonify({"error": "Błąd usuwania firmy"}), 500

    @app.route('/api/users/<user_id>/sync-profiles', methods=['POST'])
    def sync_user_profiles_to_roles_endpoint(user_id):
        """Synchronizuj profile użytkownika z jego rolami - endpoint dla pojedynczego użytkownika"""
        try:
            logger.info(f"Rozpoczynam synchronizację profili dla użytkownika {user_id}")
            
            # Pobierz domyślny tenant użytkownika z tabeli user_tenants
            with get_db_cursor() as cursor:
                cursor.execute("""
                    SELECT tenant_id FROM user_tenants 
                    WHERE user_id = %s AND is_default = true AND is_active = true
                    LIMIT 1
                """, (user_id,))
                tenant_result = cursor.fetchone()
                
                if not tenant_result:
                    return jsonify({"error": "Użytkownik nie ma przypisanego domyślnego tenanta"}), 404
                
                tenant_id = tenant_result['tenant_id'] if isinstance(tenant_result, dict) else tenant_result[0]
            
            # Wywołaj funkcję synchronizującą profile do ról
            result = sync_user_profiles_to_roles(user_id, tenant_id)
            
            if result.get("success"):
                logger.info(f"✅ Synchronizacja profili zakończona dla użytkownika {user_id}")
                return jsonify(result), 200
            else:
                logger.error(f"❌ Błąd synchronizacji profili dla użytkownika {user_id}: {result.get('message')}")
                return jsonify(result), 500
                
        except Exception as e:
            logger.error(f"❌ Błąd endpoint synchronizacji dla użytkownika {user_id}: {e}")
            return jsonify({
                "success": False,
                "message": f"Błąd synchronizacji profili: {e}",
                "error": str(e)
            }), 500

    logger.info("✅ User profiles endpoints registered")

