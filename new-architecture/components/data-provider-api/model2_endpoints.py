"""
Model 2 Endpoints for Data Provider API
Zawiera wszystkie endpointy obsługujące strukturę autoryzacyjną Model 2 (RBAC + REBAC)
"""
from flask import jsonify, request
import datetime
import logging

logger = logging.getLogger(__name__)

def register_model2_endpoints(app, MODEL2_DATA, MODEL2_AVAILABLE):
    """
    Rejestruje wszystkie endpointy Model 2 w aplikacji Flask
    
    Args:
        app: Instancja aplikacji Flask
        MODEL2_DATA: Dane Model 2
        MODEL2_AVAILABLE: Flaga dostępności Model 2
    """
    from model2_validator import Model2AuthorizationEngine
    
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
                from model2_validator import Model2Validator
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