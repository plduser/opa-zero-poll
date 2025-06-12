#!/usr/bin/env python3
"""
OPA Zero Poll - Data Integration Script

Integrates Data Provider API with OPA by:
1. Fetching ACL data from Data Provider API
2. Transforming data to OPA format
3. Loading data into OPA via REST API
4. Providing periodic refresh mechanism
5. Comprehensive logging and error handling

Author: OPA Zero Poll Team
"""

import json
import time
import logging
import requests
import schedule
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
import sys
import os

# Configuration
@dataclass
class Config:
    data_provider_url: str = os.environ.get("DATA_PROVIDER_URL", "http://localhost:8110")
    opa_url: str = os.environ.get("OPA_URL", "http://localhost:8181")
    provisioning_url: str = os.environ.get("PROVISIONING_URL", "http://localhost:8010")
    refresh_interval_minutes: int = 5
    log_level: str = "INFO"
    max_retries: int = 3
    retry_delay: int = 2

class DataIntegrationError(Exception):
    """Custom exception for data integration errors"""
    pass

class OPADataIntegrator:
    """Main class for integrating Data Provider API with OPA"""
    
    def __init__(self, config: Config):
        self.config = config
        self.logger = self._setup_logging()
        self.session = requests.Session()
        
    def _setup_logging(self) -> logging.Logger:
        """Setup comprehensive logging"""
        logging.basicConfig(
            level=getattr(logging, self.config.log_level),
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('data_integration.log'),
                logging.StreamHandler(sys.stdout)
            ]
        )
        return logging.getLogger(__name__)
    
    def health_check_services(self) -> bool:
        """Check if all required services are healthy"""
        services = [
            ("Data Provider API", f"{self.config.data_provider_url}/health"),
            ("OPA", f"{self.config.opa_url}/health"),
            ("Provisioning API", f"{self.config.provisioning_url}/health")
        ]
        
        all_healthy = True
        for service_name, health_url in services:
            try:
                response = self.session.get(health_url, timeout=5)
                if response.status_code == 200:
                    self.logger.info(f"✅ {service_name} is healthy")
                else:
                    self.logger.error(f"❌ {service_name} health check failed: {response.status_code}")
                    all_healthy = False
            except requests.RequestException as e:
                self.logger.error(f"❌ {service_name} is not accessible: {e}")
                all_healthy = False
        
        return all_healthy
    
    def fetch_tenant_list(self) -> List[str]:
        """Fetch list of all tenants from Provisioning API"""
        try:
            self.logger.info("Fetching tenant list from Provisioning API...")
            response = self.session.get(f"{self.config.provisioning_url}/tenants", timeout=10)
            response.raise_for_status()
            
            data = response.json()
            tenant_ids = [tenant['tenant_id'] for tenant in data.get('tenants', [])]
            
            self.logger.info(f"Found {len(tenant_ids)} tenants: {tenant_ids}")
            return tenant_ids
            
        except requests.RequestException as e:
            raise DataIntegrationError(f"Failed to fetch tenant list: {e}")
    
    def fetch_acl_data(self, tenant_id: str) -> Dict[str, Any]:
        """Fetch ACL data for a specific tenant from Data Provider API"""
        try:
            self.logger.info(f"Fetching ACL data for tenant: {tenant_id}")
            response = self.session.get(
                f"{self.config.data_provider_url}/tenants/{tenant_id}/acl", 
                timeout=10
            )
            response.raise_for_status()
            
            acl_data = response.json()
            self.logger.info(f"Successfully fetched ACL data for {tenant_id}")
            self.logger.debug(f"ACL data: {json.dumps(acl_data, indent=2)}")
            
            return acl_data
            
        except requests.RequestException as e:
            raise DataIntegrationError(f"Failed to fetch ACL data for {tenant_id}: {e}")
    
    def transform_acl_to_opa_format(self, tenant_id: str, acl_data: Dict[str, Any]) -> Dict[str, Any]:
        """Transform ACL data to OPA-compatible format"""
        try:
            self.logger.info(f"Transforming ACL data for tenant {tenant_id} to OPA format")
            
            # Extract users and their permissions
            users = {}
            roles = acl_data.get('roles', {})
            
            for user in acl_data.get('users', []):
                user_id = user['user_id']
                user_roles = user.get('roles', [])
                user_permissions = user.get('permissions', [])
                
                users[user_id] = {
                    "username": user.get('username', user_id),
                    "roles": user_roles,
                    "permissions": user_permissions
                }
            
            # Create OPA data structure
            opa_data = {
                "tenant_data": {
                    tenant_id: {
                        "tenant_id": tenant_id,
                        "tenant_name": acl_data.get('tenant_name', tenant_id),
                        "users": users,
                        "roles": roles,
                        "updated_at": datetime.now().isoformat()
                    }
                }
            }
            
            self.logger.info(f"Successfully transformed ACL data for {tenant_id}")
            self.logger.debug(f"OPA data: {json.dumps(opa_data, indent=2)}")
            
            return opa_data
            
        except Exception as e:
            raise DataIntegrationError(f"Failed to transform ACL data for {tenant_id}: {e}")
    
    def load_data_to_opa(self, data_path: str, data: Dict[str, Any]) -> bool:
        """Load data into OPA via REST API"""
        try:
            self.logger.info(f"Loading data to OPA at path: {data_path}")
            
            url = f"{self.config.opa_url}/v1/data/{data_path}"
            response = self.session.put(
                url,
                json=data,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            response.raise_for_status()
            
            self.logger.info(f"Successfully loaded data to OPA at {data_path}")
            return True
            
        except requests.RequestException as e:
            raise DataIntegrationError(f"Failed to load data to OPA: {e}")
    
    def verify_opa_data(self, tenant_id: str) -> bool:
        """Verify that data was correctly loaded into OPA"""
        try:
            self.logger.info(f"Verifying OPA data for tenant {tenant_id}")
            
            # Query OPA for the loaded data
            url = f"{self.config.opa_url}/v1/data/tenant_data/{tenant_id}"
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            
            result = response.json()
            if 'result' in result and result['result']:
                self.logger.info(f"✅ Data verification successful for tenant {tenant_id}")
                return True
            else:
                self.logger.error(f"❌ Data verification failed for tenant {tenant_id}: No data found")
                return False
                
        except requests.RequestException as e:
            self.logger.error(f"❌ Data verification failed for tenant {tenant_id}: {e}")
            return False
    
    def test_authorization_decision(self, tenant_id: str, test_cases: List[Dict[str, Any]]) -> bool:
        """Test OPA authorization decisions with real ACL data"""
        self.logger.info(f"Testing authorization decisions for tenant {tenant_id}")
        
        all_tests_passed = True
        
        for i, test_case in enumerate(test_cases, 1):
            try:
                self.logger.info(f"Running test case {i}: {test_case.get('description', 'No description')}")
                
                # Create input for OPA policy
                input_data = {
                    "input": {
                        "tenant_id": tenant_id,
                        **test_case['input']
                    }
                }
                
                # Query OPA policy
                response = self.session.post(
                    f"{self.config.opa_url}/v1/data/rbac/allow",
                    json=input_data,
                    headers={'Content-Type': 'application/json'},
                    timeout=10
                )
                response.raise_for_status()
                
                result = response.json()
                actual_result = result.get('result', False)
                expected_result = test_case['expected']
                
                if actual_result == expected_result:
                    self.logger.info(f"✅ Test case {i} PASSED: {actual_result}")
                else:
                    self.logger.error(f"❌ Test case {i} FAILED: Expected {expected_result}, got {actual_result}")
                    all_tests_passed = False
                    
            except Exception as e:
                self.logger.error(f"❌ Test case {i} ERROR: {e}")
                all_tests_passed = False
        
        return all_tests_passed
    
    def sync_tenant_data(self, tenant_id: str) -> bool:
        """Synchronize data for a specific tenant"""
        try:
            acl_data = self.fetch_acl_data(tenant_id)
            opa_data = self.transform_acl_to_opa_format(tenant_id, acl_data)
            self.load_data_to_opa(f"tenant_data/{tenant_id}", opa_data)
            return self.verify_opa_data(tenant_id)
        except DataIntegrationError as e:
            self.logger.error(f"Synchronization failed for tenant {tenant_id}: {e}")
            return False

    def sync_all_tenants(self) -> Dict[str, bool]:
        """Synchronize data for all tenants"""
        results = {}
        tenant_list = self.fetch_tenant_list()
        for tenant_id in tenant_list:
            results[tenant_id] = self.sync_tenant_data(tenant_id)
        return results

    def run_periodic_sync(self):
        """Run periodic synchronization based on the configured interval"""
        schedule.every(self.config.refresh_interval_minutes).minutes.do(self.sync_all_tenants)
        while True:
            schedule.run_pending()
            time.sleep(1)

    def run_end_to_end_test(self) -> bool:
        """Run an end-to-end test of the synchronization process"""
        if not self.health_check_services():
            self.logger.error("Service health check failed. Aborting test.")
            return False
        results = self.sync_all_tenants()
        return all(results.values())

def main():
    """Main entry point"""
    config = Config()
    integrator = OPADataIntegrator(config)
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "health":
            success = integrator.health_check_services()
            sys.exit(0 if success else 1)
            
        elif command == "sync":
            results = integrator.sync_all_tenants()
            success = any(results.values())
            sys.exit(0 if success else 1)
            
        elif command == "test":
            success = integrator.run_end_to_end_test()
            sys.exit(0 if success else 1)
            
        elif command == "watch":
            integrator.run_periodic_sync()
            
        else:
            print(f"Unknown command: {command}")
            print("Usage: python data_integration.py [health|sync|test|watch]")
            sys.exit(1)
    else:
        # Default: run end-to-end test
        success = integrator.run_end_to_end_test()
        sys.exit(0 if success else 1)

if __name__ == "__main__":
    main() 