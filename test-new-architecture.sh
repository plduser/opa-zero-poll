#!/bin/bash

# Test Script for OPA Zero Poll New Architecture
# Tests all 3 main components: Data Provider API, Provisioning API, OPA Standalone

set -e

echo "🚀 Testing OPA Zero Poll New Architecture"
echo "========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_service() {
    local service_name="$1"
    local url="$2"
    echo -n "Testing $service_name... "
    if curl -s "$url" > /dev/null; then
        echo -e "${GREEN}✓ OK${NC}"
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        return 1
    fi
}

test_api_response() {
    local description="$1"
    local url="$2"
    local expected_field="$3"
    echo -n "  $description... "
    
    response=$(curl -s "$url")
    if echo "$response" | jq -e ".$expected_field" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ OK${NC}"
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        echo "    Response: $response"
        return 1
    fi
}

echo ""
echo "🔍 Checking if services are running..."

# Check all services
check_service "Data Provider API (8110)" "http://localhost:8110/health"
check_service "Provisioning API (8010)" "http://localhost:8010/health"  
check_service "OPA Standalone (8181)" "http://localhost:8181/health"

echo ""
echo "🧪 Testing API functionality..."

# Test Data Provider API
echo -e "${YELLOW}Data Provider API:${NC}"
test_api_response "Health check" "http://localhost:8110/health" "status"
test_api_response "All tenants" "http://localhost:8110/tenants" "tenants"
test_api_response "Tenant1 ACL" "http://localhost:8110/tenants/tenant1/acl" "users"
test_api_response "Tenant2 ACL" "http://localhost:8110/tenants/tenant2/acl" "users"

# Test Provisioning API 
echo -e "${YELLOW}Provisioning API:${NC}"
test_api_response "Health check" "http://localhost:8010/health" "status"
test_api_response "Tenants list" "http://localhost:8010/tenants" "tenants"

# Test OPA Standalone
echo -e "${YELLOW}OPA Standalone:${NC}"
check_service "Health check" "http://localhost:8181/health"

# Test OPA policy decisions
echo -n "  Admin access test... "
admin_response=$(curl -s -X POST http://localhost:8181/v1/data/rbac/allow \
  -H "Content-Type: application/json" \
  -d '{"input": {"user": "admin1", "role": "admin", "action": "read", "resource": "data"}}')

if echo "$admin_response" | jq -e '.result == true' > /dev/null; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ FAILED${NC}"
fi

echo -n "  User access test... "
user_response=$(curl -s -X POST http://localhost:8181/v1/data/rbac/allow \
  -H "Content-Type: application/json" \
  -d '{"input": {"user": "user1", "role": "user", "action": "read", "resource": "data", "owner": "user2"}}')

if echo "$user_response" | jq -e '.result == false' > /dev/null; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ FAILED${NC}"
fi

echo ""
echo "🎯 Integration test: Full workflow"

# Test adding a tenant via Provisioning API
echo -n "Adding test tenant... "
add_response=$(curl -s -X POST http://localhost:8010/provision-tenant \
  -H "Content-Type: application/json" \
  -d '{"tenant_id": "test-tenant-integration", "tenant_name": "Integration Test Tenant"}')

if echo "$add_response" | jq -e '.tenant.tenant_id' > /dev/null; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ FAILED${NC}"
fi

# Test retrieving the tenant
echo -n "Retrieving test tenant... "
get_response=$(curl -s "http://localhost:8010/tenants/test-tenant-integration")

if echo "$get_response" | jq -e '.tenant_id == "test-tenant-integration"' > /dev/null; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ FAILED${NC}"
fi

echo ""
echo "✅ New Architecture Testing Complete!"
echo ""
echo "🔗 Service URLs:"
echo "  - Data Provider API: http://localhost:8110"
echo "  - Provisioning API:  http://localhost:8010" 
echo "  - OPA Standalone:    http://localhost:8181"
echo ""
echo "📋 Next steps: Run integration scripts (Task 20)" 