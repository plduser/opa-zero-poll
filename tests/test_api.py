"""
Testy dla Policy Management Service API
"""
import pytest
import httpx
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch

from app.main import app
from app.models import PolicyCreate, PolicyType, PolicyStatus

@pytest.fixture
def client():
    """Test client dla FastAPI"""
    return TestClient(app)

@pytest.fixture
def sample_policy_data():
    """Przykładowe dane polityki"""
    return {
        "name": "test-policy",
        "description": "Test policy for unit tests",
        "type": "rbac",
        "status": "active",
        "content": "package test\n\nallow { input.user.role == \"admin\" }",
        "metadata": {
            "test": True,
            "author": "pytest"
        }
    }

class TestHealthEndpoints:
    """Testy health check endpoints"""
    
    def test_root_endpoint(self, client):
        """Test root endpoint"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["service"] == "Policy Management Service"
        assert data["status"] == "ok"
    
    def test_health_endpoint(self, client):
        """Test health check endpoint"""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert "version" in data
        assert "uptime" in data

class TestPolicyAPI:
    """Testy API zarządzania politykami"""
    
    def test_list_policies_empty(self, client):
        """Test listy polityk gdy baza jest pusta"""
        response = client.get("/api/policies")
        assert response.status_code == 200
        assert response.json() == []
    
    @patch('app.services.event_emitter.EventEmitter.emit_policy_created')
    def test_create_policy(self, mock_emit, client, sample_policy_data):
        """Test tworzenia nowej polityki"""
        mock_emit.return_value = True
        
        response = client.post("/api/policies", json=sample_policy_data)
        assert response.status_code == 201
        
        data = response.json()
        assert data["name"] == sample_policy_data["name"]
        assert data["type"] == sample_policy_data["type"]
        assert data["status"] == sample_policy_data["status"]
        assert "id" in data
        assert "created_at" in data
        assert data["version"] == 1
        
        # Sprawdź czy event został wysłany
        mock_emit.assert_called_once()
    
    @patch('app.services.event_emitter.EventEmitter.emit_policy_created')
    def test_create_duplicate_policy(self, mock_emit, client, sample_policy_data):
        """Test tworzenia polityki z duplikowaną nazwą"""
        mock_emit.return_value = True
        
        # Utwórz pierwszą politykę
        response = client.post("/api/policies", json=sample_policy_data)
        assert response.status_code == 201
        
        # Spróbuj utworzyć drugą z tą samą nazwą
        response = client.post("/api/policies", json=sample_policy_data)
        assert response.status_code == 409
        assert "już istnieje" in response.json()["detail"]
    
    @patch('app.services.event_emitter.EventEmitter.emit_policy_created')
    def test_get_policy(self, mock_emit, client, sample_policy_data):
        """Test pobierania polityki po ID"""
        mock_emit.return_value = True
        
        # Utwórz politykę
        create_response = client.post("/api/policies", json=sample_policy_data)
        policy_id = create_response.json()["id"]
        
        # Pobierz politykę
        response = client.get(f"/api/policies/{policy_id}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["id"] == policy_id
        assert data["name"] == sample_policy_data["name"]
    
    def test_get_nonexistent_policy(self, client):
        """Test pobierania nieistniejącej polityki"""
        response = client.get("/api/policies/nonexistent-id")
        assert response.status_code == 404
        assert "nie została znaleziona" in response.json()["detail"]
    
    @patch('app.services.event_emitter.EventEmitter.emit_policy_created')
    @patch('app.services.event_emitter.EventEmitter.emit_policy_update')
    def test_update_policy(self, mock_emit_update, mock_emit_create, client, sample_policy_data):
        """Test aktualizacji polityki"""
        mock_emit_create.return_value = True
        mock_emit_update.return_value = True
        
        # Utwórz politykę
        create_response = client.post("/api/policies", json=sample_policy_data)
        policy_id = create_response.json()["id"]
        
        # Aktualizuj politykę
        update_data = {
            "description": "Updated description",
            "status": "inactive"
        }
        response = client.put(f"/api/policies/{policy_id}", json=update_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["description"] == update_data["description"]
        assert data["status"] == update_data["status"]
        assert data["version"] == 2
        
        # Sprawdź czy event został wysłany
        mock_emit_update.assert_called_once()
    
    @patch('app.services.event_emitter.EventEmitter.emit_policy_created')
    @patch('app.services.event_emitter.EventEmitter.emit_policy_deleted')
    def test_delete_policy(self, mock_emit_delete, mock_emit_create, client, sample_policy_data):
        """Test usuwania polityki"""
        mock_emit_create.return_value = True
        mock_emit_delete.return_value = True
        
        # Utwórz politykę
        create_response = client.post("/api/policies", json=sample_policy_data)
        policy_id = create_response.json()["id"]
        
        # Usuń politykę
        response = client.delete(f"/api/policies/{policy_id}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert "usunięta" in data["message"]
        
        # Sprawdź czy polityka została usunięta
        get_response = client.get(f"/api/policies/{policy_id}")
        assert get_response.status_code == 404
        
        # Sprawdź czy event został wysłany
        mock_emit_delete.assert_called_once()

class TestPolicySearch:
    """Testy wyszukiwania polityk"""
    
    @patch('app.services.event_emitter.EventEmitter.emit_policy_created')
    def test_search_policies(self, mock_emit, client):
        """Test wyszukiwania polityk"""
        mock_emit.return_value = True
        
        # Utwórz kilka polityk
        policies = [
            {
                "name": "rbac-policy",
                "type": "rbac",
                "status": "active",
                "content": "package rbac\nallow { true }"
            },
            {
                "name": "abac-policy", 
                "type": "abac",
                "status": "active",
                "content": "package abac\nallow { false }"
            },
            {
                "name": "admin-policy",
                "type": "rbac", 
                "status": "active",
                "content": "package admin\nallow { input.user.role == \"admin\" }"
            }
        ]
        
        for policy_data in policies:
            client.post("/api/policies", json=policy_data)
        
        # Wyszukaj po nazwie
        response = client.get("/api/policies/search?q=rbac")
        assert response.status_code == 200
        results = response.json()
        assert len(results) == 2  # rbac-policy i admin-policy (zawiera "admin")
        
        # Wyszukaj po zawartości
        response = client.get("/api/policies/search?q=admin")
        assert response.status_code == 200
        results = response.json()
        assert len(results) >= 1
    
    def test_search_min_length(self, client):
        """Test minimalnej długości zapytania"""
        response = client.get("/api/policies/search?q=a")
        assert response.status_code == 422  # Validation error

class TestPolicyStatistics:
    """Testy statystyk polityk"""
    
    @patch('app.services.event_emitter.EventEmitter.emit_policy_created')
    def test_statistics(self, mock_emit, client):
        """Test statystyk polityk"""
        mock_emit.return_value = True
        
        # Utwórz polityki różnych typów i statusów
        policies = [
            {"name": "policy1", "type": "rbac", "status": "active", "content": "test"},
            {"name": "policy2", "type": "rbac", "status": "inactive", "content": "test"},
            {"name": "policy3", "type": "abac", "status": "active", "content": "test"},
            {"name": "policy4", "type": "custom", "status": "draft", "content": "test"}
        ]
        
        for policy_data in policies:
            client.post("/api/policies", json=policy_data)
        
        # Pobierz statystyki
        response = client.get("/api/policies/statistics")
        assert response.status_code == 200
        
        stats = response.json()
        assert stats["total"] == 4
        assert stats["by_status"]["active"] == 2
        assert stats["by_status"]["inactive"] == 1
        assert stats["by_status"]["draft"] == 1
        assert stats["by_type"]["rbac"] == 2
        assert stats["by_type"]["abac"] == 1
        assert stats["by_type"]["custom"] == 1

class TestWebhookEndpoints:
    """Testy GitHub webhook endpoints"""
    
    def test_webhook_test_endpoint(self, client):
        """Test endpoint testowego webhook"""
        response = client.get("/webhook/github/test")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "ok"
        assert "webhook_url" in data
        assert "signature_verification" in data
    
    @patch('app.services.event_emitter.EventEmitter.emit_policy_update')
    def test_github_webhook_push(self, mock_emit, client):
        """Test GitHub push webhook"""
        mock_emit.return_value = True
        
        # Przykładowy payload push event
        payload = {
            "ref": "refs/heads/main",
            "before": "abc123",
            "after": "def456",
            "repository": {
                "full_name": "test/repo"
            },
            "commits": [
                {
                    "id": "def456",
                    "message": "Update policy",
                    "author": {"name": "test-user"},
                    "added": ["policies/test.rego"],
                    "modified": [],
                    "removed": []
                }
            ],
            "pusher": {"name": "test-user"}
        }
        
        headers = {
            "X-GitHub-Event": "push",
            "X-GitHub-Delivery": "test-delivery-id",
            "Content-Type": "application/json"
        }
        
        response = client.post("/webhook/github", json=payload, headers=headers)
        assert response.status_code == 200
        
        data = response.json()
        assert data["received"] is True
        assert data["processed"] is True
        assert "1 policy files" in data["message"]

# Test fixtures dla async mock
@pytest.fixture(autouse=True)
def mock_app_state():
    """Mock app state z serwisami"""
    with patch('app.main.event_emitter') as mock_emitter, \
         patch('app.main.policy_storage') as mock_storage:
        
        # Konfiguruj mocks
        mock_emitter.emit_policy_created = AsyncMock(return_value=True)
        mock_emitter.emit_policy_update = AsyncMock(return_value=True) 
        mock_emitter.emit_policy_deleted = AsyncMock(return_value=True)
        mock_emitter.test_connection = AsyncMock(return_value=True)
        
        app.state.event_emitter = mock_emitter
        app.state.policy_storage = mock_storage
        
        yield

if __name__ == "__main__":
    pytest.main([__file__, "-v"]) 