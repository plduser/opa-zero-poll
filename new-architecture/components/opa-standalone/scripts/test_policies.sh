#!/bin/bash

# OPA Standalone - Policy Testing Script
# This script tests RBAC policies against various scenarios

set -e

OPA_URL="${OPA_URL:-http://localhost:8181}"

echo "Testing OPA RBAC policies at $OPA_URL"
echo "========================================"

# Check if OPA is running
if ! curl -s "$OPA_URL/health" > /dev/null; then
    echo "Error: OPA server is not running at $OPA_URL"
    exit 1
fi

# Test function
test_policy() {
    local description="$1"
    local input="$2"
    local expected="$3"
    
    echo -n "Testing: $description... "
    
    response=$(curl -s -X POST "$OPA_URL/v1/data/rbac/allow" \
        -H "Content-Type: application/json" \
        -d "{\"input\": $input}")
    
    result=$(echo "$response" | jq -r '.result')
    
    if [ "$result" = "$expected" ]; then
        echo "✓ PASS"
    else
        echo "✗ FAIL (expected: $expected, got: $result)"
        echo "   Response: $response"
    fi
}

# Test admin privileges
test_policy "Admin can read data" \
    '{"user": "admin1", "role": "admin", "action": "read", "resource": "data"}' \
    "true"

test_policy "Admin can write data" \
    '{"user": "admin1", "role": "admin", "action": "write", "resource": "sensitive"}' \
    "true"

test_policy "Admin can delete anything" \
    '{"user": "admin1", "role": "admin", "action": "delete", "resource": "anything"}' \
    "true"

# Test user privileges
test_policy "User can read own data" \
    '{"user": "user1", "role": "user", "action": "read", "resource": "data", "owner": "user1"}' \
    "true"

test_policy "User can update own data" \
    '{"user": "user1", "role": "user", "action": "update", "resource": "data", "owner": "user1"}' \
    "true"

test_policy "User cannot read others data" \
    '{"user": "user1", "role": "user", "action": "read", "resource": "data", "owner": "user2"}' \
    "false"

test_policy "User cannot delete own data" \
    '{"user": "user1", "role": "user", "action": "delete", "resource": "data", "owner": "user1"}' \
    "false"

# Test viewer privileges
test_policy "Viewer can read data" \
    '{"user": "viewer1", "role": "viewer", "action": "read", "resource": "data"}' \
    "true"

test_policy "Viewer cannot write data" \
    '{"user": "viewer1", "role": "viewer", "action": "write", "resource": "data"}' \
    "false"

test_policy "Viewer cannot update data" \
    '{"user": "viewer1", "role": "viewer", "action": "update", "resource": "data"}' \
    "false"

# Test public access
test_policy "Anyone can read public resources" \
    '{"user": "guest", "role": "guest", "action": "read", "resource": "public"}' \
    "true"

# Test default deny
test_policy "Unknown role is denied" \
    '{"user": "user1", "role": "unknown", "action": "read", "resource": "data"}' \
    "false"

test_policy "Missing role is denied" \
    '{"user": "user1", "action": "read", "resource": "data"}' \
    "false"

echo ""
echo "Policy testing completed!"

# Show a reason example
echo ""
echo "Example decision reason:"
curl -s -X POST "$OPA_URL/v1/data/rbac/reason" \
    -H "Content-Type: application/json" \
    -d '{"input": {"user": "user1", "role": "user", "action": "delete", "resource": "data", "owner": "user2"}}' | \
    jq -r '.result' 