# OPA Standalone - Basic RBAC Service

A containerized Open Policy Agent (OPA) implementation with basic Role-Based Access Control (RBAC) policies for the OPA Zero Poll system.

## 🎯 Overview

This component provides a standalone OPA decision engine with predefined RBAC policies. It serves as a simple authorization service that can be queried for access control decisions without requiring external policy synchronization like OPAL.

## 🏗️ Architecture

### Components

- **OPA Server**: Open Policy Agent running in server mode on port 8181
- **RBAC Policies**: Rego-based policies defining role permissions
- **Docker Container**: Lightweight, secure containerized deployment
- **Test Suite**: Comprehensive policy validation

### Supported Roles

- **Admin** (`admin`): Full access to all resources and actions
- **User** (`user`): Can read/update their own data only
- **Viewer** (`viewer`): Read-only access to data
- **Public Access**: Anyone can read public resources

## 📋 Policy Rules

### Admin Role
- ✅ All actions on all resources
- ✅ Read, write, update, delete permissions

### User Role  
- ✅ Read own data (when `input.user == input.owner`)
- ✅ Update own data (when `input.user == input.owner`)
- ❌ Access to other users' data
- ❌ Delete operations

### Viewer Role
- ✅ Read data (any data marked as viewable)
- ❌ Write, update, or delete operations

### Public Access
- ✅ Read public resources (when `resource == "public"`)
- ❌ All other operations

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- OPA CLI (for local testing)
- `curl` and `jq` (for API testing)

### 1. Build and Run with Docker

```bash
# Build and start the container
docker-compose up --build -d

# Check health
curl http://localhost:8181/health
```

### 2. Load Policies (if needed)

```bash
# Load policies manually (usually automatic in Docker)
./scripts/load_policies.sh
```

### 3. Test Policies

```bash
# Run comprehensive policy tests
./scripts/test_policies.sh
```

## 🔧 Local Development

### Run OPA Locally

```bash
# Start OPA server with policies
opa run --server --addr localhost:8181 --log-level info policies/

# Load policies manually if needed
curl -X PUT http://localhost:8181/v1/policies/rbac \
  --data-binary @policies/rbac.rego
```

### Run Policy Tests

```bash
# Run unit tests with OPA test
opa test policies/ tests/

# Expected output: PASS: 16/16
```

## 📡 API Usage

### Decision Endpoint

Query the authorization decision:

```bash
curl -X POST http://localhost:8181/v1/data/rbac/allow \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "user": "user1", 
      "role": "admin", 
      "action": "read", 
      "resource": "data"
    }
  }'

# Response: {"result": true}
```

### Get Decision Reason

```bash
curl -X POST http://localhost:8181/v1/data/rbac/reason \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "user": "user1", 
      "role": "user", 
      "action": "delete", 
      "resource": "data",
      "owner": "user2"
    }
  }'

# Response: {"result": "Role 'user' cannot perform action 'delete' on resource 'data'"}
```

### Get Context Information

```bash
curl -X POST http://localhost:8181/v1/data/rbac/context \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "user": "user1", 
      "role": "admin", 
      "action": "read", 
      "resource": "data"
    }
  }'
```

## 🧪 Testing Examples

### Admin Access
```bash
# Admin can do everything
curl -X POST http://localhost:8181/v1/data/rbac/allow \
  -H "Content-Type: application/json" \
  -d '{"input": {"user": "admin1", "role": "admin", "action": "delete", "resource": "sensitive"}}'
# → {"result": true}
```

### User Self-Access
```bash
# User can read own data
curl -X POST http://localhost:8181/v1/data/rbac/allow \
  -H "Content-Type: application/json" \
  -d '{"input": {"user": "user1", "role": "user", "action": "read", "resource": "data", "owner": "user1"}}'
# → {"result": true}

# User cannot read others' data
curl -X POST http://localhost:8181/v1/data/rbac/allow \
  -H "Content-Type: application/json" \
  -d '{"input": {"user": "user1", "role": "user", "action": "read", "resource": "data", "owner": "user2"}}'
# → {"result": false}
```

### Viewer Limitations
```bash
# Viewer can read
curl -X POST http://localhost:8181/v1/data/rbac/allow \
  -H "Content-Type: application/json" \
  -d '{"input": {"user": "viewer1", "role": "viewer", "action": "read", "resource": "data"}}'
# → {"result": true}

# Viewer cannot write
curl -X POST http://localhost:8181/v1/data/rbac/allow \
  -H "Content-Type: application/json" \
  -d '{"input": {"user": "viewer1", "role": "viewer", "action": "write", "resource": "data"}}'
# → {"result": false}
```

## 📁 Project Structure

```
opa-standalone/
├── policies/
│   └── rbac.rego              # Main RBAC policy definitions
├── tests/
│   └── rbac_test.rego         # Policy unit tests
├── scripts/
│   ├── load_policies.sh       # Policy loading script
│   └── test_policies.sh       # Policy testing script
├── Dockerfile                 # Container definition
├── docker-compose.yml         # Container orchestration
└── README.md                  # This documentation
```

## 🔒 Security Features

- **Default Deny**: All access denied unless explicitly allowed
- **Non-Root Container**: Runs as unprivileged user
- **Input Validation**: Comprehensive input checking
- **Minimal Image**: Based on official OPA image
- **Health Checks**: Container health monitoring

## 🐛 Troubleshooting

### OPA Server Not Starting
```bash
# Check container logs
docker logs opa-standalone

# Verify policy syntax
opa fmt policies/rbac.rego
```

### Policies Not Loading
```bash
# Check if policies directory is mounted correctly
docker exec opa-standalone ls -la /opt/opa/policies/

# Manually load policies
./scripts/load_policies.sh
```

### Decision Unexpected Results
```bash
# Run policy tests
opa test policies/ tests/

# Check decision reasoning
curl -X POST http://localhost:8181/v1/data/rbac/reason \
  -H "Content-Type: application/json" \
  -d '{"input": {...}}'
```

## 🔄 Integration

This OPA Standalone service is designed to integrate with:

- **Data Provider API** (port 8110) - Provides user and resource data
- **Provisioning API** (port 8010) - Manages tenant registrations
- **Integration Scripts** - Coordinates data flow between services

## 📊 Monitoring

### Health Check
```bash
curl http://localhost:8181/health
# → {}
```

### Metrics (if enabled)
```bash
curl http://localhost:8181/metrics
```

### Policy Status
```bash
curl http://localhost:8181/v1/policies | jq '.result[] | .id'
```

## 🔧 Configuration

### Environment Variables

- `OPA_LOG_LEVEL`: Logging level (debug, info, warn, error)
- `OPA_URL`: OPA server URL (default: http://localhost:8181)
- `POLICIES_DIR`: Policy directory path (default: ./policies)

### Docker Compose Override

```yaml
# docker-compose.override.yml
version: '3.8'
services:
  opa-standalone:
    environment:
      - OPA_LOG_LEVEL=debug
    ports:
      - "8182:8181"  # Different port
```

## 📚 References

- [Open Policy Agent Documentation](https://www.openpolicyagent.org/docs/)
- [Rego Language Reference](https://www.openpolicyagent.org/docs/latest/policy-language/)
- [OPA HTTP API Reference](https://www.openpolicyagent.org/docs/latest/rest-api/)

---

**Part of the OPA Zero Poll New Architecture**  
**Task 19: Implement Basic OPA Standalone with Simple Policies** 