#!/usr/bin/env python3
"""
Integration Scripts REST API Server

Provides REST API endpoints for Data Provider API to trigger synchronization operations.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import datetime
import os
import sys
from typing import Dict, Any
import threading
import time

# Import our data integration module
from data_integration import OPADataIntegrator, Config, DataIntegrationError

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Global integrator instance
config = Config()
integrator = OPADataIntegrator(config)

# Track operation status
operation_status = {
    "last_operation": None,
    "status": "idle",  # idle, running, success, error
    "message": "",
    "start_time": None,
    "end_time": None,
    "results": {}
}

def update_operation_status(status: str, message: str, results: Dict[str, Any] = None):
    """Update global operation status"""
    global operation_status
    
    operation_status.update({
        "status": status,
        "message": message,
        "last_operation": datetime.datetime.utcnow().isoformat()
    })
    
    if status == "running":
        operation_status["start_time"] = datetime.datetime.utcnow().isoformat()
        operation_status["end_time"] = None
    elif status in ["success", "error"]:
        operation_status["end_time"] = datetime.datetime.utcnow().isoformat()
        
    if results:
        operation_status["results"] = results

def run_sync_operation(action: str, tenant_id: str = None) -> Dict[str, Any]:
    """
    Run synchronization operation in background
    
    Args:
        action: Type of operation ('sync_all', 'sync_tenant', 'health_check')
        tenant_id: Tenant ID for single tenant sync
        
    Returns:
        Dict with operation results
    """
    try:
        logger.info(f"Starting {action} operation for tenant: {tenant_id or 'all'}")
        update_operation_status("running", f"Executing {action}")
        
        if action == "health_check":
            success = integrator.health_check_services()
            result = {
                "action": action,
                "success": success,
                "message": "Health check completed",
                "services_healthy": success
            }
            
        elif action == "sync_all":
            results = integrator.sync_all_tenants()
            success = any(results.values()) if results else False
            result = {
                "action": action,
                "success": success,
                "message": f"Synchronized {len(results)} tenants",
                "tenant_count": len(results),
                "tenant_results": results,
                "successful_tenants": [tid for tid, success in results.items() if success],
                "failed_tenants": [tid for tid, success in results.items() if not success]
            }
            
        elif action == "sync_tenant":
            if not tenant_id:
                raise DataIntegrationError("tenant_id is required for sync_tenant action")
                
            success = integrator.sync_tenant_data(tenant_id)
            result = {
                "action": action,
                "success": success,
                "message": f"Tenant {tenant_id} synchronization {'completed' if success else 'failed'}",
                "tenant_id": tenant_id
            }
            
        else:
            raise DataIntegrationError(f"Unknown action: {action}")
        
        # Update status based on success
        if result["success"]:
            update_operation_status("success", result["message"], result)
            logger.info(f"✅ {action} operation completed successfully")
        else:
            update_operation_status("error", result["message"], result)
            logger.error(f"❌ {action} operation failed")
            
        return result
        
    except Exception as e:
        error_msg = f"Error executing {action}: {str(e)}"
        logger.error(error_msg)
        
        result = {
            "action": action,
            "success": False,
            "message": error_msg,
            "error": str(e)
        }
        
        update_operation_status("error", error_msg, result)
        return result

@app.route("/", methods=["GET"])
def root():
    """Root endpoint"""
    return jsonify({
        "service": "integration-scripts-api",
        "version": "1.0.0",
        "status": "running",
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "endpoints": [
            "GET /health - Service health check",
            "POST /api/execute - Execute integration operations",
            "GET /api/status - Get operation status"
        ]
    }), 200

@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    try:
        # Check if integrator services are healthy
        services_healthy = integrator.health_check_services()
        
        return jsonify({
            "status": "healthy" if services_healthy else "degraded",
            "service": "integration-scripts-api",
            "version": "1.0.0",
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "services_healthy": services_healthy,
            "operation_status": operation_status
        }), 200 if services_healthy else 503
        
    except Exception as e:
        logger.error(f"Health check error: {e}")
        return jsonify({
            "status": "unhealthy",
            "service": "integration-scripts-api",
            "version": "1.0.0",
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "error": str(e)
        }), 500

@app.route("/api/execute", methods=["POST"])
def execute_operation():
    """
    Execute integration operation
    
    Expected JSON:
    {
        "action": "sync_all|sync_tenant|health_check",
        "tenant_id": "tenant123" (optional, required for sync_tenant)
    }
    """
    logger.info("Integration operation requested")
    
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 400
    
    data = request.json
    action = data.get("action")
    tenant_id = data.get("tenant_id")
    
    # Validate action
    valid_actions = ["sync_all", "sync_tenant", "health_check"]
    if not action or action not in valid_actions:
        return jsonify({
            "error": "Invalid action",
            "valid_actions": valid_actions
        }), 400
    
    # Validate tenant_id for sync_tenant
    if action == "sync_tenant" and not tenant_id:
        return jsonify({
            "error": "tenant_id is required for sync_tenant action"
        }), 400
    
    # Check if operation is already running
    if operation_status["status"] == "running":
        return jsonify({
            "error": "Operation already in progress",
            "current_operation": operation_status
        }), 409
    
    try:
        # Execute operation synchronously (for now)
        result = run_sync_operation(action, tenant_id)
        
        return jsonify({
            "message": "Operation completed",
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "result": result
        }), 200 if result["success"] else 500
        
    except Exception as e:
        logger.error(f"Unexpected error executing operation: {e}")
        return jsonify({
            "error": "Operation failed",
            "message": str(e),
            "timestamp": datetime.datetime.utcnow().isoformat()
        }), 500

@app.route("/api/status", methods=["GET"])
def get_operation_status():
    """Get current operation status"""
    return jsonify({
        "operation_status": operation_status,
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "service": "integration-scripts-api"
    }), 200

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        "error": "Not Found",
        "message": "The requested endpoint does not exist",
        "timestamp": datetime.datetime.utcnow().isoformat()
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    logger.error(f"Internal server error: {error}")
    return jsonify({
        "error": "Internal Server Error",
        "message": "An unexpected error occurred",
        "timestamp": datetime.datetime.utcnow().isoformat()
    }), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    debug = os.environ.get("DEBUG", "false").lower() == "true"
    
    logger.info(f"Starting Integration Scripts API on port {port}")
    logger.info(f"Data Provider URL: {config.data_provider_url}")
    logger.info(f"OPA URL: {config.opa_url}")
    logger.info(f"Provisioning URL: {config.provisioning_url}")
    
    app.run(host="0.0.0.0", port=port, debug=debug) 