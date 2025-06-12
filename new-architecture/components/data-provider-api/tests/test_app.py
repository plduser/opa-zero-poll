"""
Testy jednostkowe dla Data Provider API
"""

import pytest
import json
from app import app, ACL_DATA

@pytest.fixture
def client():
    """Tworzy testowego klienta Flask"""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

class TestHealthEndpoint:
    """Testy dla endpoint'u zdrowia"""
    
    def test_health_check(self, client):
        """Test sprawdza czy endpoint /health działa poprawnie"""
        response = client.get('/health')
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert data['status'] == 'healthy'
        assert data['service'] == 'data-provider-api'
        assert 'timestamp' in data
        assert data['version'] == '1.0.0'

class TestACLEndpoint:
    """Testy dla endpoint'u ACL"""
    
    def test_get_tenant1_acl(self, client):
        """Test pobierania ACL dla tenant1"""
        response = client.get('/tenants/tenant1/acl')
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert data['tenant_id'] == 'tenant1'
        assert data['tenant_name'] == 'Test Company 1'
        assert len(data['users']) == 2
        assert 'retrieved_at' in data
        
        # Sprawdź użytkowników
        user1 = next(user for user in data['users'] if user['user_id'] == 'user1')
        assert user1['username'] == 'admin_user'
        assert 'admin' in user1['roles']
        
        user2 = next(user for user in data['users'] if user['user_id'] == 'user2')
        assert user2['username'] == 'regular_user'
        assert 'user' in user2['roles']
    
    def test_get_tenant2_acl(self, client):
        """Test pobierania ACL dla tenant2"""
        response = client.get('/tenants/tenant2/acl')
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert data['tenant_id'] == 'tenant2'
        assert data['tenant_name'] == 'Test Company 2'
        assert len(data['users']) == 1
        
        # Sprawdź użytkownika
        user3 = data['users'][0]
        assert user3['user_id'] == 'user3'
        assert user3['username'] == 'viewer_user'
        assert 'viewer' in user3['roles']
    
    def test_get_nonexistent_tenant_acl(self, client):
        """Test pobierania ACL dla nieistniejącego tenanta"""
        response = client.get('/tenants/nonexistent/acl')
        assert response.status_code == 404
        
        data = json.loads(response.data)
        assert data['error'] == 'Tenant not found'
        assert data['tenant_id'] == 'nonexistent'
        assert 'available_tenants' in data

class TestTenantsListEndpoint:
    """Testy dla endpoint'u listy tenantów"""
    
    def test_list_tenants(self, client):
        """Test pobierania listy tenantów"""
        response = client.get('/tenants')
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert 'tenants' in data
        assert data['total_count'] == 2
        assert 'retrieved_at' in data
        
        # Sprawdź zawartość listy
        tenant_ids = [tenant['tenant_id'] for tenant in data['tenants']]
        assert 'tenant1' in tenant_ids
        assert 'tenant2' in tenant_ids

class TestRootEndpoint:
    """Testy dla głównego endpoint'u"""
    
    def test_root_endpoint(self, client):
        """Test głównego endpoint'u"""
        response = client.get('/')
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert data['service'] == 'Data Provider API'
        assert data['version'] == '1.0.0'
        assert 'endpoints' in data
        assert 'available_tenants' in data

class TestErrorHandling:
    """Testy obsługi błędów"""
    
    def test_404_error(self, client):
        """Test obsługi błędu 404"""
        response = client.get('/nonexistent-endpoint')
        assert response.status_code == 404
        
        data = json.loads(response.data)
        assert data['error'] == 'Endpoint not found'
        assert 'available_endpoints' in data

class TestDataIntegrity:
    """Testy integralności danych"""
    
    def test_acl_data_structure(self):
        """Test struktury danych ACL"""
        for tenant_id, tenant_data in ACL_DATA.items():
            assert 'tenant_id' in tenant_data
            assert 'tenant_name' in tenant_data
            assert 'users' in tenant_data
            assert 'roles' in tenant_data
            
            # Sprawdź strukturę użytkowników
            for user in tenant_data['users']:
                assert 'user_id' in user
                assert 'username' in user
                assert 'roles' in user
                assert 'permissions' in user
    
    def test_tenant1_specific_data(self):
        """Test specyficznych danych dla tenant1"""
        tenant1 = ACL_DATA['tenant1']
        
        # Sprawdź użytkownika admin
        admin_user = next(user for user in tenant1['users'] if user['user_id'] == 'user1')
        assert 'admin' in admin_user['roles']
        assert 'manage_users' in admin_user['permissions']
        
        # Sprawdź użytkownika zwykłego
        regular_user = next(user for user in tenant1['users'] if user['user_id'] == 'user2')
        assert 'user' in regular_user['roles']
        assert 'manage_users' not in regular_user['permissions']
    
    def test_tenant2_specific_data(self):
        """Test specyficznych danych dla tenant2"""
        tenant2 = ACL_DATA['tenant2']
        
        # Sprawdź użytkownika viewer
        viewer_user = tenant2['users'][0]
        assert viewer_user['user_id'] == 'user3'
        assert 'viewer' in viewer_user['roles']
        assert viewer_user['permissions'] == ['read'] 