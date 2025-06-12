#!/usr/bin/env python3
"""
Kompleksowy test całego systemu OPA_ZERO_POLL z wszystkimi kontenerami

Testuje:
1. Health check wszystkich serwisów
2. Mechanizm synchronizacji danych
3. Autoryzację w OPA
4. Komunikację między serwisami
"""

import requests
import json
import time
import logging
from typing import Dict, Any, List

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Configuration
SERVICES = {
    "data-provider-api": "http://localhost:8110",
    "provisioning-api": "http://localhost:8010", 
    "opa-standalone": "http://localhost:8181",
    "integration-scripts": "http://localhost:8000"
}

def test_service_health(service_name: str, url: str) -> bool:
    """Test if a service is healthy"""
    try:
        logger.info(f"🔍 Testing {service_name} health at {url}")
        response = requests.get(f"{url}/health", timeout=10)
        
        if response.status_code == 200:
            logger.info(f"✅ {service_name} is healthy")
            return True
        else:
            logger.error(f"❌ {service_name} health check failed: {response.status_code}")
            return False
            
    except Exception as e:
        logger.error(f"❌ {service_name} health check error: {e}")
        return False

def test_sync_mechanism() -> bool:
    """Test data synchronization mechanism"""
    try:
        logger.info("🔄 Testing data synchronization mechanism...")
        
        # Test sync health
        response = requests.get(f"{SERVICES['data-provider-api']}/sync/health", timeout=10)
        if response.status_code != 200:
            logger.error(f"❌ Sync health check failed: {response.status_code}")
            return False
        
        sync_health = response.json()
        logger.info(f"✅ Sync health: {sync_health['status']}")
        
        # Test full synchronization
        logger.info("🔄 Triggering full synchronization...")
        response = requests.post(f"{SERVICES['data-provider-api']}/sync/trigger", 
                               headers={"Content-Type": "application/json"}, 
                               timeout=30)
        
        if response.status_code != 200:
            logger.error(f"❌ Full sync failed: {response.status_code}")
            return False
            
        sync_result = response.json()
        logger.info(f"✅ Full sync completed: {sync_result['message']}")
        
        # Test tenant-specific synchronization
        logger.info("🔄 Testing tenant-specific synchronization...")
        response = requests.post(f"{SERVICES['data-provider-api']}/sync/tenant/tenant1",
                               headers={"Content-Type": "application/json"},
                               timeout=30)
        
        if response.status_code != 200:
            logger.error(f"❌ Tenant sync failed: {response.status_code}")
            return False
            
        tenant_result = response.json()
        logger.info(f"✅ Tenant sync completed: {tenant_result['message']}")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Sync mechanism test error: {e}")
        return False

def test_opa_authorization() -> bool:
    """Test OPA authorization with different scenarios"""
    try:
        logger.info("🔐 Testing OPA authorization...")
        
        # Test cases
        test_cases = [
            {
                "name": "Admin can read",
                "input": {"user": "user1", "role": "admin", "action": "read", "resource": "data", "tenant": "tenant1"},
                "expected": True
            },
            {
                "name": "Admin can write", 
                "input": {"user": "user1", "role": "admin", "action": "write", "resource": "data", "tenant": "tenant1"},
                "expected": True
            },
            {
                "name": "User can read own data",
                "input": {"user": "user2", "role": "user", "action": "read", "resource": "data", "tenant": "tenant1", "owner": "user2"},
                "expected": True
            },
            {
                "name": "Viewer can read",
                "input": {"user": "user3", "role": "viewer", "action": "read", "resource": "data", "tenant": "tenant2"},
                "expected": True
            },
            {
                "name": "Viewer cannot write",
                "input": {"user": "user3", "role": "viewer", "action": "write", "resource": "data", "tenant": "tenant2"},
                "expected": False
            },
            {
                "name": "User cannot delete",
                "input": {"user": "user2", "role": "user", "action": "delete", "resource": "data", "tenant": "tenant1"},
                "expected": False
            }
        ]
        
        passed = 0
        total = len(test_cases)
        
        for test_case in test_cases:
            logger.info(f"🧪 Testing: {test_case['name']}")
            
            response = requests.post(f"{SERVICES['opa-standalone']}/v1/data/rbac/allow",
                                   headers={"Content-Type": "application/json"},
                                   json={"input": test_case["input"]},
                                   timeout=10)
            
            if response.status_code != 200:
                logger.error(f"❌ OPA request failed: {response.status_code}")
                continue
                
            result = response.json()["result"]
            
            if result == test_case["expected"]:
                logger.info(f"✅ {test_case['name']}: PASSED (result: {result})")
                passed += 1
            else:
                logger.error(f"❌ {test_case['name']}: FAILED (expected: {test_case['expected']}, got: {result})")
        
        logger.info(f"🔐 Authorization tests: {passed}/{total} passed")
        return passed == total
        
    except Exception as e:
        logger.error(f"❌ OPA authorization test error: {e}")
        return False

def test_data_in_opa() -> bool:
    """Test if data was properly loaded into OPA"""
    try:
        logger.info("📊 Testing data loaded in OPA...")
        
        # Check if tenant data exists
        response = requests.get(f"{SERVICES['opa-standalone']}/v1/data/tenant_data", timeout=10)
        
        if response.status_code != 200:
            logger.error(f"❌ Failed to get OPA data: {response.status_code}")
            return False
            
        data = response.json()["result"]
        
        # Check tenant1
        if "tenant1" in data:
            tenant1_data = data["tenant1"]["tenant_data"]["tenant1"]
            logger.info(f"✅ Tenant1 data loaded: {tenant1_data['tenant_name']}")
            logger.info(f"   Users: {list(tenant1_data['users'].keys())}")
            logger.info(f"   Roles: {list(tenant1_data['roles'].keys())}")
        else:
            logger.error("❌ Tenant1 data not found in OPA")
            return False
            
        # Check tenant2
        if "tenant2" in data:
            tenant2_data = data["tenant2"]["tenant_data"]["tenant2"]
            logger.info(f"✅ Tenant2 data loaded: {tenant2_data['tenant_name']}")
            logger.info(f"   Users: {list(tenant2_data['users'].keys())}")
            logger.info(f"   Roles: {list(tenant2_data['roles'].keys())}")
        else:
            logger.error("❌ Tenant2 data not found in OPA")
            return False
            
        return True
        
    except Exception as e:
        logger.error(f"❌ OPA data test error: {e}")
        return False

def main():
    """Run comprehensive system test"""
    logger.info("🚀 Starting comprehensive system test...")
    logger.info("=" * 60)
    
    # Test 1: Service Health Checks
    logger.info("📋 PHASE 1: Service Health Checks")
    health_results = {}
    for service_name, url in SERVICES.items():
        health_results[service_name] = test_service_health(service_name, url)
    
    healthy_services = sum(health_results.values())
    total_services = len(SERVICES)
    logger.info(f"📊 Health Check Results: {healthy_services}/{total_services} services healthy")
    
    if healthy_services != total_services:
        logger.error("❌ Not all services are healthy. Stopping tests.")
        return False
    
    logger.info("=" * 60)
    
    # Test 2: Data Synchronization
    logger.info("📋 PHASE 2: Data Synchronization Mechanism")
    sync_success = test_sync_mechanism()
    
    if not sync_success:
        logger.error("❌ Synchronization tests failed. Stopping tests.")
        return False
        
    logger.info("=" * 60)
    
    # Test 3: Data Verification in OPA
    logger.info("📋 PHASE 3: Data Verification in OPA")
    data_success = test_data_in_opa()
    
    if not data_success:
        logger.error("❌ Data verification failed. Stopping tests.")
        return False
        
    logger.info("=" * 60)
    
    # Test 4: Authorization Testing
    logger.info("📋 PHASE 4: Authorization Testing")
    auth_success = test_opa_authorization()
    
    logger.info("=" * 60)
    
    # Final Results
    if health_results and sync_success and data_success and auth_success:
        logger.info("🎉 ALL TESTS PASSED! System is working correctly!")
        logger.info("✅ Services: All healthy")
        logger.info("✅ Synchronization: Working")
        logger.info("✅ Data Loading: Working") 
        logger.info("✅ Authorization: Working")
        return True
    else:
        logger.error("❌ Some tests failed. Check logs above.")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1) 