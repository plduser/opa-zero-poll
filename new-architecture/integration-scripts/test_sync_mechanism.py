#!/usr/bin/env python3
"""
Test Data Synchronization Mechanism

Tests the communication between Data Provider API and Integration Scripts API.
"""

import requests
import json
import time
import logging
from typing import Dict, Any

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Configuration
DATA_PROVIDER_URL = "http://localhost:8110"
INTEGRATION_SCRIPTS_URL = "http://localhost:8000"

def test_service_health(service_name: str, url: str) -> bool:
    """Test if a service is healthy"""
    try:
        logger.info(f"Testing {service_name} health at {url}")
        response = requests.get(f"{url}/health", timeout=5)
        
        if response.status_code == 200:
            logger.info(f"✅ {service_name} is healthy")
            return True
        else:
            logger.error(f"❌ {service_name} health check failed: {response.status_code}")
            return False
            
    except requests.RequestException as e:
        logger.error(f"❌ {service_name} is not accessible: {e}")
        return False

def test_integration_scripts_direct() -> bool:
    """Test Integration Scripts API directly"""
    logger.info("Testing Integration Scripts API directly...")
    
    try:
        # Test health check action
        payload = {"action": "health_check"}
        response = requests.post(
            f"{INTEGRATION_SCRIPTS_URL}/api/execute",
            json=payload,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            logger.info(f"✅ Integration Scripts health check: {result}")
            return True
        else:
            logger.error(f"❌ Integration Scripts health check failed: {response.status_code}")
            return False
            
    except requests.RequestException as e:
        logger.error(f"❌ Integration Scripts direct test failed: {e}")
        return False

def test_data_provider_sync_endpoints() -> bool:
    """Test Data Provider API sync endpoints"""
    logger.info("Testing Data Provider API sync endpoints...")
    
    try:
        # Test sync health endpoint
        response = requests.get(f"{DATA_PROVIDER_URL}/sync/health", timeout=10)
        
        if response.status_code in [200, 503]:  # 503 is acceptable if Integration Scripts are down
            result = response.json()
            logger.info(f"✅ Data Provider sync health: {result}")
            
            # Test sync status endpoint
            response = requests.get(f"{DATA_PROVIDER_URL}/sync/status", timeout=5)
            if response.status_code == 200:
                status = response.json()
                logger.info(f"✅ Data Provider sync status: {status}")
                return True
            else:
                logger.error(f"❌ Data Provider sync status failed: {response.status_code}")
                return False
        else:
            logger.error(f"❌ Data Provider sync health failed: {response.status_code}")
            return False
            
    except requests.RequestException as e:
        logger.error(f"❌ Data Provider sync endpoints test failed: {e}")
        return False

def test_end_to_end_sync() -> bool:
    """Test end-to-end synchronization"""
    logger.info("Testing end-to-end synchronization...")
    
    try:
        # Trigger full sync through Data Provider API
        response = requests.post(
            f"{DATA_PROVIDER_URL}/sync/trigger",
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            logger.info(f"✅ End-to-end sync successful: {result}")
            return True
        elif response.status_code == 500:
            result = response.json()
            logger.warning(f"⚠️ End-to-end sync failed (expected if services are down): {result}")
            return False
        else:
            logger.error(f"❌ End-to-end sync failed: {response.status_code}")
            return False
            
    except requests.RequestException as e:
        logger.error(f"❌ End-to-end sync test failed: {e}")
        return False

def test_tenant_specific_sync() -> bool:
    """Test tenant-specific synchronization"""
    logger.info("Testing tenant-specific synchronization...")
    
    try:
        # Test sync for tenant1
        tenant_id = "tenant1"
        response = requests.post(
            f"{DATA_PROVIDER_URL}/sync/tenant/{tenant_id}",
            headers={'Content-Type': 'application/json'},
            timeout=20
        )
        
        if response.status_code == 200:
            result = response.json()
            logger.info(f"✅ Tenant {tenant_id} sync successful: {result}")
            return True
        elif response.status_code == 500:
            result = response.json()
            logger.warning(f"⚠️ Tenant {tenant_id} sync failed (expected if services are down): {result}")
            return False
        else:
            logger.error(f"❌ Tenant {tenant_id} sync failed: {response.status_code}")
            return False
            
    except requests.RequestException as e:
        logger.error(f"❌ Tenant sync test failed: {e}")
        return False

def main():
    """Run all tests"""
    logger.info("🚀 Starting Data Synchronization Mechanism Tests")
    
    tests = [
        ("Data Provider API Health", lambda: test_service_health("Data Provider API", DATA_PROVIDER_URL)),
        ("Integration Scripts API Health", lambda: test_service_health("Integration Scripts API", INTEGRATION_SCRIPTS_URL)),
        ("Integration Scripts Direct Test", test_integration_scripts_direct),
        ("Data Provider Sync Endpoints", test_data_provider_sync_endpoints),
        ("End-to-End Synchronization", test_end_to_end_sync),
        ("Tenant-Specific Synchronization", test_tenant_specific_sync)
    ]
    
    results = {}
    
    for test_name, test_func in tests:
        logger.info(f"\n📋 Running test: {test_name}")
        try:
            success = test_func()
            results[test_name] = success
            if success:
                logger.info(f"✅ {test_name} PASSED")
            else:
                logger.error(f"❌ {test_name} FAILED")
        except Exception as e:
            logger.error(f"💥 {test_name} ERROR: {e}")
            results[test_name] = False
    
    # Summary
    logger.info("\n📊 TEST SUMMARY:")
    passed = sum(1 for success in results.values() if success)
    total = len(results)
    
    for test_name, success in results.items():
        status = "✅ PASS" if success else "❌ FAIL"
        logger.info(f"  {status}: {test_name}")
    
    logger.info(f"\n🎯 OVERALL: {passed}/{total} tests passed")
    
    if passed == total:
        logger.info("🎉 All tests passed! Data Synchronization Mechanism is working correctly.")
        return True
    else:
        logger.warning("⚠️ Some tests failed. Check the logs above for details.")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1) 