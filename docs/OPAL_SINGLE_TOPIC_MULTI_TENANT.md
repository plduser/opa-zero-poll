# Single Topic Multi-Tenant Configuration for OPAL

## Overview

This guide demonstrates an **undocumented but powerful OPAL configuration pattern** that enables **multi-tenant data management without requiring OPAL Client restarts** when adding new tenants.

### The Discovery

Traditional OPAL documentation suggests using separate topics for each tenant:
```bash
# Traditional approach (requires restart for new tenants)
OPAL_DATA_TOPICS=tenant_1_data,tenant_2_data,tenant_3_data
```

However, through extensive testing, we discovered that **a single topic can handle multiple tenants** with data isolation achieved through different `dst_path` values:

```bash
# Revolutionary approach (NO restart needed for new tenants)
OPAL_DATA_TOPICS=tenant_data
```

## How It Works

### Architecture
1. **OPAL Server** receives data update events via `POST /data/config`
2. **OPAL Server** publishes events to the single topic `tenant_data`
3. **OPAL Client** (subscribed to `tenant_data`) receives ALL tenant events
4. **OPAL Client** fetches data from the specified URL
5. **OPAL Client** stores data in OPA under the specified `dst_path`
6. **Data isolation** is achieved through hierarchical paths in OPA

### Key Benefits
- ✅ **No restart required** when adding new tenants
- ✅ **Dynamic tenant addition** in real-time
- ✅ **Data isolation** through OPA path hierarchy
- ✅ **Simplified configuration** - one topic for all tenants
- ✅ **Unlimited scalability** - no need to pre-configure topics

## Configuration

### OPAL Client Configuration
```yaml
environment:
  - OPAL_DATA_UPDATER_ENABLED=true
  - OPAL_DATA_TOPICS=tenant_data  # Single topic for all tenants
```

### Data Update Events
Send tenant-specific data updates using the single topic:

```bash
# Add tenant1 data
curl -X POST http://localhost:7002/data/config \
  -H "Content-Type: application/json" \
  -d '{
    "entries": [{
      "url": "http://your-api:8090/acl/tenant1",
      "topics": ["tenant_data"],
      "dst_path": "/acl/tenant1"
    }],
    "reason": "Load tenant1 data"
  }'

# Add tenant2 data (NO RESTART NEEDED)
curl -X POST http://localhost:7002/data/config \
  -H "Content-Type: application/json" \
  -d '{
    "entries": [{
      "url": "http://your-api:8090/acl/tenant2", 
      "topics": ["tenant_data"],
      "dst_path": "/acl/tenant2"
    }],
    "reason": "Load tenant2 data"
  }'
```

### Data Isolation in OPA
Data is stored in OPA under hierarchical paths:
```
/acl/tenant1/users/[...]
/acl/tenant2/users/[...]
/acl/tenant3/users/[...]
```

## Complete Example

### Docker Compose Configuration
```yaml
version: '3.8'
services:
  opal-server:
    image: permitio/opal-server:latest
    environment:
      - OPAL_POLICY_REPO_URL=https://github.com/your-org/policies.git
    ports:
      - "7002:7002"

  opal-client:
    image: permitio/opal-client:latest
    environment:
      - OPAL_SERVER_URL=http://opal-server:7002
      - OPAL_DATA_UPDATER_ENABLED=true
      - OPAL_DATA_TOPICS=tenant_data  # Single topic
    ports:
      - "7001:7001"
    depends_on:
      - opal-server

  opa:
    image: openpolicyagent/opa:latest-envoy
    ports:
      - "8181:8181"
    command:
      - "run"
      - "--server"
      - "--addr=0.0.0.0:8181"
      - "--diagnostic-addr=0.0.0.0:8282"
      - "--set=plugins.envoy_ext_authz_grpc.addr=:9191"
      - "--set=plugins.envoy_ext_authz_grpc.enable_reflection=true"
```

### Testing the Configuration

1. **Start the services:**
```bash
docker-compose up -d
```

2. **Add tenant1 data:**
```bash
curl -X POST http://localhost:7002/data/config \
  -H "Content-Type: application/json" \
  -d '{
    "entries": [{
      "url": "http://your-data-api:8090/acl/tenant1",
      "topics": ["tenant_data"],
      "dst_path": "/acl/tenant1"
    }],
    "reason": "Load tenant1 data"
  }'
```

3. **Add tenant2 data (without restart):**
```bash
curl -X POST http://localhost:7002/data/config \
  -H "Content-Type: application/json" \
  -d '{
    "entries": [{
      "url": "http://your-data-api:8090/acl/tenant2",
      "topics": ["tenant_data"], 
      "dst_path": "/acl/tenant2"
    }],
    "reason": "Load tenant2 data"
  }'
```

4. **Verify data isolation:**
```bash
# Check tenant1 data
curl http://localhost:8181/v1/data/acl/tenant1

# Check tenant2 data  
curl http://localhost:8181/v1/data/acl/tenant2
```

## Verification Logs

When working correctly, you should see logs like:
```
OPAL Client:
INFO | Received notification of event: tenant_data
INFO | Updating policy data, reason: Load tenant1 data
INFO | Fetching data from url: http://your-data-api:8090/acl/tenant1
INFO | Saving fetched data to policy-store: destination path='/acl/tenant1'
DEBUG | processing store transaction: {'success': True, 'actions': ['set_policy_data']}
```

## Comparison with Traditional Approach

| Aspect | Traditional Multi-Topic | Single Topic (This Guide) |
|--------|------------------------|---------------------------|
| **Configuration** | `OPAL_DATA_TOPICS=tenant_1_data,tenant_2_data,tenant_3_data` | `OPAL_DATA_TOPICS=tenant_data` |
| **Adding New Tenant** | Requires OPAL Client restart | No restart needed |
| **Scalability** | Limited by pre-configured topics | Unlimited |
| **Data Isolation** | Topic-based | Path-based in OPA |
| **Complexity** | High (topic management) | Low (single topic) |
| **Real-time Addition** | ❌ No | ✅ Yes |

## Important Notes

### Topic Subscription is Static
- OPAL Client topic subscription (`OPAL_DATA_TOPICS`) is set at startup
- Cannot dynamically add new topics without restart
- This is why the single-topic approach is revolutionary

### Data Provider Requirements
- Your data provider API must have endpoints for each tenant
- Example: `/acl/tenant1`, `/acl/tenant2`, `/acl/tenant3`
- Each endpoint should return tenant-specific data

### Security Considerations
- All OPAL Clients subscribed to `tenant_data` will receive all events
- Data isolation relies on OPA path hierarchy
- Ensure your data provider implements proper tenant isolation

## Troubleshooting

### OPAL Client Not Receiving Events
1. Check topic subscription: `docker exec opal-client env | grep OPAL_DATA_TOPICS`
2. Verify OPAL Server logs for event publishing
3. Ensure WebSocket connection between client and server

### Data Not Loading
1. Verify data provider endpoint exists and returns valid JSON
2. Check OPAL Client logs for fetch errors
3. Confirm `dst_path` is correctly specified

### Data Conflicts
1. Ensure different tenants use different `dst_path` values
2. Verify data provider returns tenant-specific data
3. Check OPA data structure: `curl http://localhost:8181/v1/data`

## Why This Isn't Documented

This pattern works because:
1. **OPAL Server** publishes events to topics without client validation
2. **OPAL Client** processes all events for subscribed topics
3. **Data isolation** happens at the OPA storage level, not the topic level
4. **Topic filtering** is only for subscription, not for data isolation

The OPAL documentation focuses on the traditional multi-topic approach, but doesn't explore this more flexible single-topic pattern.

## Conclusion

The single-topic multi-tenant configuration is a **game-changing approach** for OPAL deployments that need:
- Dynamic tenant addition without downtime
- Simplified configuration management  
- Unlimited scalability
- Real-time multi-tenant data updates

This pattern is production-ready and has been successfully tested with multiple tenants and real-time data updates.

## Contributing

This configuration pattern was discovered through extensive testing and research. If you find this useful, consider:
1. ⭐ Starring the OPAL repository
2. 💬 Sharing your experience in OPAL discussions
3. 📝 Contributing improvements to this documentation

---

*This guide represents a community discovery that enhances OPAL's multi-tenant capabilities beyond what's currently documented.* 