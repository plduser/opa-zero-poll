#!/usr/bin/env python3
"""
Uproszczone testy jednostkowe dla Provisioning API
"""

import unittest
import json
import os
import tempfile
import sqlite3
from datetime import datetime
import sys

# Import aplikacji
import app as app_module
from app import app as flask_app

class SimpleProvisioningAPITest(unittest.TestCase):
    """Uproszczone testy dla Provisioning API"""
    
    def setUp(self):
        """Przygotowuje środowisko testowe"""
        # Tworzymy tymczasowy plik bazy danych
        self.test_db_fd, self.test_db_path = tempfile.mkstemp(suffix='.db')
        
        # Konfigurujemy Flask dla testów
        flask_app.config['TESTING'] = True
        flask_app.config['WTF_CSRF_ENABLED'] = False
        
        # Zapisujemy oryginalne wartości
        self.original_db_path = getattr(app_module, 'DATABASE_PATH', 'tenants.db')
        self.original_env_path = os.environ.get('DATABASE_PATH')
        
        # Ustawiamy ścieżkę testowej bazy danych
        app_module.DATABASE_PATH = self.test_db_path
        os.environ['DATABASE_PATH'] = self.test_db_path
        
        # Tworzymy klienta testowego
        self.client = flask_app.test_client()
        
        # Inicjalizujemy testową bazę danych
        with sqlite3.connect(self.test_db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS tenants (
                    tenant_id TEXT PRIMARY KEY,
                    tenant_name TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    status TEXT NOT NULL DEFAULT 'active',
                    metadata TEXT
                )
            """)
            conn.commit()
    
    def tearDown(self):
        """Czyści środowisko testowe"""
        # Przywracamy oryginalne wartości
        app_module.DATABASE_PATH = self.original_db_path
        if self.original_env_path:
            os.environ['DATABASE_PATH'] = self.original_env_path
        else:
            os.environ.pop('DATABASE_PATH', None)
        
        # Usuwamy testową bazę danych
        os.close(self.test_db_fd)
        os.unlink(self.test_db_path)
    
    def test_health_check(self):
        """Test endpointu zdrowia"""
        response = self.client.get('/health')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertEqual(data['status'], 'healthy')
        self.assertEqual(data['service'], 'provisioning-api')
        self.assertIn('tenant_count', data)
    
    def test_root_endpoint(self):
        """Test endpointu głównego"""
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertEqual(data['service'], 'Provisioning API')
        self.assertIn('endpoints', data)
    
    def test_add_tenant_success(self):
        """Test udanego dodawania tenanta"""
        tenant_data = {
            "tenant_id": "test_tenant",
            "tenant_name": "Test Company",
            "metadata": {"type": "test"}
        }
        
        response = self.client.post('/provision-tenant',
                                  data=json.dumps(tenant_data),
                                  content_type='application/json')
        
        self.assertEqual(response.status_code, 201)
        
        data = json.loads(response.data)
        self.assertEqual(data['message'], 'Tenant provisioned successfully')
        self.assertEqual(data['tenant']['tenant_id'], 'test_tenant')
    
    def test_add_tenant_missing_id(self):
        """Test błędu przy braku tenant_id"""
        tenant_data = {"tenant_name": "Test Company"}
        
        response = self.client.post('/provision-tenant',
                                  data=json.dumps(tenant_data),
                                  content_type='application/json')
        
        self.assertEqual(response.status_code, 400)
        
        data = json.loads(response.data)
        self.assertEqual(data['error'], 'tenant_id is required')
    
    def test_add_tenant_duplicate(self):
        """Test błędu przy duplikacie tenant_id"""
        tenant_data = {
            "tenant_id": "duplicate_tenant",
            "tenant_name": "Test Company"
        }
        
        # Pierwszy request - powinien się udać
        response1 = self.client.post('/provision-tenant',
                                   data=json.dumps(tenant_data),
                                   content_type='application/json')
        self.assertEqual(response1.status_code, 201)
        
        # Drugi request - powinien zwrócić błąd
        response2 = self.client.post('/provision-tenant',
                                   data=json.dumps(tenant_data),
                                   content_type='application/json')
        self.assertEqual(response2.status_code, 409)
        
        data = json.loads(response2.data)
        self.assertEqual(data['error'], 'Tenant already exists')
    
    def test_list_tenants_empty(self):
        """Test listowania pustej bazy tenantów"""
        response = self.client.get('/tenants')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertEqual(len(data['tenants']), 0)
        self.assertEqual(data['total_count'], 0)
    
    def test_list_tenants_with_data(self):
        """Test listowania tenantów z danymi"""
        # Dodajemy dwóch tenantów
        for i in range(1, 3):
            tenant_data = {
                "tenant_id": f"tenant{i}",
                "tenant_name": f"Company {i}"
            }
            response = self.client.post('/provision-tenant',
                                      data=json.dumps(tenant_data),
                                      content_type='application/json')
            self.assertEqual(response.status_code, 201)
        
        # Sprawdzamy listę
        response = self.client.get('/tenants')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertEqual(len(data['tenants']), 2)
        self.assertEqual(data['total_count'], 2)
    
    def test_get_tenant(self):
        """Test pobierania szczegółów tenanta"""
        # Dodajemy tenanta
        tenant_data = {
            "tenant_id": "get_tenant",
            "tenant_name": "Get Company",
            "metadata": {"type": "test"}
        }
        
        add_response = self.client.post('/provision-tenant',
                                      data=json.dumps(tenant_data),
                                      content_type='application/json')
        self.assertEqual(add_response.status_code, 201)
        
        # Pobieramy szczegóły
        get_response = self.client.get('/tenants/get_tenant')
        self.assertEqual(get_response.status_code, 200)
        
        data = json.loads(get_response.data)
        self.assertEqual(data['tenant_id'], 'get_tenant')
        self.assertEqual(data['tenant_name'], 'Get Company')
    
    def test_get_tenant_not_found(self):
        """Test pobierania nieistniejącego tenanta"""
        response = self.client.get('/tenants/nonexistent')
        self.assertEqual(response.status_code, 404)
        
        data = json.loads(response.data)
        self.assertEqual(data['error'], 'Tenant not found')
    
    def test_delete_tenant(self):
        """Test usuwania tenanta"""
        # Dodajemy tenanta
        tenant_data = {
            "tenant_id": "delete_tenant",
            "tenant_name": "Delete Company"
        }
        
        add_response = self.client.post('/provision-tenant',
                                      data=json.dumps(tenant_data),
                                      content_type='application/json')
        self.assertEqual(add_response.status_code, 201)
        
        # Usuwamy tenanta
        delete_response = self.client.delete('/tenants/delete_tenant')
        self.assertEqual(delete_response.status_code, 200)
        
        data = json.loads(delete_response.data)
        self.assertEqual(data['message'], 'Tenant deleted successfully')
        
        # Sprawdzamy czy tenant został usunięty
        get_response = self.client.get('/tenants/delete_tenant')
        self.assertEqual(get_response.status_code, 404)
    
    def test_update_tenant_status(self):
        """Test aktualizacji statusu tenanta"""
        # Dodajemy tenanta
        tenant_data = {
            "tenant_id": "status_tenant",
            "tenant_name": "Status Company"
        }
        
        add_response = self.client.post('/provision-tenant',
                                      data=json.dumps(tenant_data),
                                      content_type='application/json')
        self.assertEqual(add_response.status_code, 201)
        
        # Aktualizujemy status
        status_data = {"status": "inactive"}
        update_response = self.client.put('/tenants/status_tenant/status',
                                        data=json.dumps(status_data),
                                        content_type='application/json')
        self.assertEqual(update_response.status_code, 200)
        
        data = json.loads(update_response.data)
        self.assertEqual(data['new_status'], 'inactive')
        
        # Sprawdzamy czy status został zaktualizowany
        get_response = self.client.get('/tenants/status_tenant')
        get_data = json.loads(get_response.data)
        self.assertEqual(get_data['status'], 'inactive')

def run_simple_tests():
    """Uruchamia uproszczone testy"""
    print("🧪 Uruchamianie prostych testów Provisioning API...\n")
    
    suite = unittest.TestLoader().loadTestsFromTestCase(SimpleProvisioningAPITest)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    if result.wasSuccessful():
        print(f"\n✅ Wszystkie {result.testsRun} testów przeszły pomyślnie!")
        return True
    else:
        print(f"\n❌ {len(result.failures)} testów nie powiodło się, {len(result.errors)} błędów")
        return False

if __name__ == '__main__':
    success = run_simple_tests()
    sys.exit(0 if success else 1) 