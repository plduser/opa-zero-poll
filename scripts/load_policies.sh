#!/bin/bash

# OPA Standalone - Policy Loading Script
# This script loads RBAC policies into a running OPA instance

set -e

OPA_URL="${OPA_URL:-http://localhost:8181}"
POLICIES_DIR="${POLICIES_DIR:-./policies}"

echo "Loading policies from $POLICIES_DIR to OPA at $OPA_URL"

# Check if OPA is running
if ! curl -s "$OPA_URL/health" > /dev/null; then
    echo "Error: OPA server is not running at $OPA_URL"
    echo "Start OPA with: opa run --server --addr localhost:8181 policies/"
    exit 1
fi

# Load each .rego file in the policies directory
for policy_file in "$POLICIES_DIR"/*.rego; do
    if [ -f "$policy_file" ]; then
        policy_name=$(basename "$policy_file" .rego)
        echo "Loading policy: $policy_name from $policy_file"
        
        if curl -X PUT "$OPA_URL/v1/policies/$policy_name" \
           --data-binary "@$policy_file" \
           --silent --show-error; then
            echo "✓ Successfully loaded policy: $policy_name"
        else
            echo "✗ Failed to load policy: $policy_name"
            exit 1
        fi
    fi
done

echo ""
echo "All policies loaded successfully!"
echo ""
echo "Available policies:"
curl -s "$OPA_URL/v1/policies" | jq -r '.result[] | .id' 