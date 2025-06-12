"""
Testy jednostkowe dla Provisioning API
"""

import unittest
import json
import os
import tempfile
import sqlite3
from datetime import datetime

# Import aplikacji
from app import app, init_database, DATABASE_PATH

class ProvisioningAPITestCase(unittest.TestCase):
    """Klasa testowa dla Provisioning API"""
    
    def setUp(self):
        """Przygotowuje środowisko testowe przed każdym testem"""
        # Tworzymy tymczasowy plik bazy danych
        self.test_db_fd, self.test_db_path = tempfile.mkstemp()
        app.config['TESTING'] = True
        
        # Ustawiamy ścieżkę do testowej bazy danych
        os.environ['DATABASE_PATH'] = self.test_db_path
        
        # Tworzymy klienta testowego
        self.client = app.test_client()
        
        # Inicjalizujemy bazę danych
        with app.app_context():
            init_database()
    
    def tearDown(self):
        """Czyści środowisko testowe po każdym teście"""
        os.close(self.test_db_fd)
        os.unlink(self.test_db_path)
    
    def test_health_check_healthy(self):
        """Test 1: Sprawdza endpoint zdrowia - aplikacja zdrowa"""
        response = self.client.get('/health')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertEqual(data['status'], 'healthy')
        self.assertEqual(data['service'], 'provisioning-api')
        self.assertEqual(data['version'], '1.0.0')
        self.assertEqual(data['database'], 'connected')
        self.assertIn('tenant_count', data)
        self.assertIn('timestamp', data)
    
    def test_root_endpoint(self):
        """Test 2: Sprawdza endpoint główny"""
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertEqual(data['service'], 'Provisioning API')
        self.assertEqual(data['version'], '1.0.0')
        self.assertIn('endpoints', data)
        self.assertIn('health', data['endpoints'])
    
    def test_provision_tenant_success(self):
        """Test 3: Udane dodawanie tenanta"""
        tenant_data = {
            "tenant_id": "test_tenant_1",
            "tenant_name": "Test Company 1",
            "metadata": {"type": "test", "region": "EU"}
        }
        
        response = self.client.post('/provision-tenant',
                                  data=json.dumps(tenant_data),
                                  content_type='application/json')
        
        self.assertEqual(response.status_code, 201)
        
        data = json.loads(response.data)
        self.assertEqual(data['message'], 'Tenant provisioned successfully')
        self.assertEqual(data['tenant']['tenant_id'], 'test_tenant_1')
        self.assertEqual(data['tenant']['tenant_name'], 'Test Company 1')
        self.assertEqual(data['tenant']['status'], 'active')
        self.assertEqual(data['tenant']['metadata']['type'], 'test')
    
    def test_provision_tenant_missing_tenant_id(self):
        """Test 4: Błąd przy braku tenant_id"""
        tenant_data = {
            "tenant_name": "Test Company"
        }
        
        response = self.client.post('/provision-tenant',
                                  data=json.dumps(tenant_data),
                                  content_type='application/json')
        
        self.assertEqual(response.status_code, 400)
        
        data = json.loads(response.data)
        self.assertEqual(data['error'], 'tenant_id is required')
    
    def test_provision_tenant_missing_tenant_name(self):
        """Test 5: Błąd przy braku tenant_name"""
        tenant_data = {
            "tenant_id": "test_tenant"
        }
        
        response = self.client.post('/provision-tenant',
                                  data=json.dumps(tenant_data),
                                  content_type='application/json')
        
        self.assertEqual(response.status_code, 400)
        
        data = json.loads(response.data)
        self.assertEqual(data['error'], 'tenant_name is required')
    
    def test_provision_tenant_duplicate(self):
        """Test 6: Błąd przy duplikacie tenant_id"""
        tenant_data = {
            "tenant_id": "duplicate_tenant",
            "tenant_name": "Duplicate Company"
        }
        
        # Pierwszy tenant - powinien się udać
        response1 = self.client.post('/provision-tenant',
                                   data=json.dumps(tenant_data),
                                   content_type='application/json')
        self.assertEqual(response1.status_code, 201)
        
        # Drugi tenant z tym samym ID - powinien zwrócić błąd
        response2 = self.client.post('/provision-tenant',
                                   data=json.dumps(tenant_data),
                                   content_type='application/json')
        self.assertEqual(response2.status_code, 409)
        
        data = json.loads(response2.data)
        self.assertEqual(data['error'], 'Tenant already exists')
    
    def test_list_tenants_empty(self):
        """Test 7: Lista tenantów - baza pusta"""
        response = self.client.get('/tenants')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertEqual(len(data['tenants']), 0)
        self.assertEqual(data['total_count'], 0)
        self.assertEqual(data['filter'], 'all')
    
    def test_list_tenants_with_data(self):
        """Test 8: Lista tenantów - z danymi"""
        # Dodajemy dwóch tenantów
        tenant1 = {"tenant_id": "tenant1", "tenant_name": "Company 1"}
        tenant2 = {"tenant_id": "tenant2", "tenant_name": "Company 2"}
        
        self.client.post('/provision-tenant',
                        data=json.dumps(tenant1),
                        content_type='application/json')
        self.client.post('/provision-tenant',
                        data=json.dumps(tenant2),
                        content_type='application/json')
        
        # Sprawdzamy listę
        response = self.client.get('/tenants')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertEqual(len(data['tenants']), 2)
        self.assertEqual(data['total_count'], 2)
        
        # Sprawdzamy czy tenanci są na liście
        tenant_ids = [t['tenant_id'] for t in data['tenants']]
        self.assertIn('tenant1', tenant_ids)
        self.assertIn('tenant2', tenant_ids)
    
    def test_get_tenant_success(self):
        """Test 9: Pobieranie szczegółów tenanta - sukces"""
        # Dodajemy tenanta
        tenant_data = {
            "tenant_id": "get_test_tenant",
            "tenant_name": "Get Test Company",
            "metadata": {"test": "value"}
        }
        
        self.client.post('/provision-tenant',
                        data=json.dumps(tenant_data),
                        content_type='application/json')
        
        # Pobieramy szczegóły
        response = self.client.get('/tenants/get_test_tenant')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertEqual(data['tenant_id'], 'get_test_tenant')
        self.assertEqual(data['tenant_name'], 'Get Test Company')
        self.assertEqual(data['status'], 'active')
        self.assertEqual(data['metadata']['test'], 'value')
    
    def test_get_tenant_not_found(self):
        """Test 10: Pobieranie szczegółów tenanta - nie znaleziono"""
        response = self.client.get('/tenants/nonexistent_tenant')
        self.assertEqual(response.status_code, 404)
        
        data = json.loads(response.data)
        self.assertEqual(data['error'], 'Tenant not found')
        self.assertEqual(data['tenant_id'], 'nonexistent_tenant')
    
    def test_delete_tenant_success(self):
        """Test 11: Usuwanie tenanta - sukces"""
        # Dodajemy tenanta
        tenant_data = {
            "tenant_id": "delete_test_tenant",
            "tenant_name": "Delete Test Company"
        }
        
        self.client.post('/provision-tenant',
                        data=json.dumps(tenant_data),
                        content_type='application/json')
        
        # Usuwamy tenanta
        response = self.client.delete('/tenants/delete_test_tenant')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertEqual(data['message'], 'Tenant deleted successfully')
        self.assertEqual(data['tenant_id'], 'delete_test_tenant')
        
        # Sprawdzamy czy tenant został usunięty
        get_response = self.client.get('/tenants/delete_test_tenant')
        self.assertEqual(get_response.status_code, 404)
    
    def test_delete_tenant_not_found(self):
        """Test 12: Usuwanie tenanta - nie znaleziono"""
        response = self.client.delete('/tenants/nonexistent_tenant')
        self.assertEqual(response.status_code, 404)
        
        data = json.loads(response.data)
        self.assertEqual(data['error'], 'Tenant not found')
    
    def test_update_tenant_status_success(self):
        """Test 13: Aktualizacja statusu tenanta - sukces"""
        # Dodajemy tenanta
        tenant_data = {
            "tenant_id": "status_test_tenant",
            "tenant_name": "Status Test Company"
        }
        
        self.client.post('/provision-tenant',
                        data=json.dumps(tenant_data),
                        content_type='application/json')
        
        # Aktualizujemy status
        status_data = {"status": "inactive"}
        response = self.client.put('/tenants/status_test_tenant/status',
                                 data=json.dumps(status_data),
                                 content_type='application/json')
        
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertEqual(data['message'], 'Tenant status updated successfully')
        self.assertEqual(data['new_status'], 'inactive')
        
        # Sprawdzamy czy status został zaktualizowany
        get_response = self.client.get('/tenants/status_test_tenant')
        get_data = json.loads(get_response.data)
        self.assertEqual(get_data['status'], 'inactive')
    
    def test_update_tenant_status_invalid(self):
        """Test 14: Aktualizacja statusu tenanta - nieprawidłowy status"""
        # Dodajemy tenanta
        tenant_data = {
            "tenant_id": "invalid_status_tenant",
            "tenant_name": "Invalid Status Company"
        }
        
        self.client.post('/provision-tenant',
                        data=json.dumps(tenant_data),
                        content_type='application/json')
        
        # Próbujemy ustawić nieprawidłowy status
        status_data = {"status": "invalid_status"}
        response = self.client.put('/tenants/invalid_status_tenant/status',
                                 data=json.dumps(status_data),
                                 content_type='application/json')
        
        self.assertEqual(response.status_code, 400)
        
        data = json.loads(response.data)
        self.assertIn('status must be one of', data['error'])
    
    def test_404_error_handler(self):
        """Test 15: Test obsługi błędu 404"""
        response = self.client.get('/nonexistent-endpoint')
        self.assertEqual(response.status_code, 404)
        
        data = json.loads(response.data)
        self.assertEqual(data['error'], 'Endpoint not found')
        self.assertIn('available_endpoints', data)

def run_tests():
    """Uruchamia wszystkie testy"""
    unittest.main(verbosity=2)

if __name__ == '__main__':
    run_tests() 