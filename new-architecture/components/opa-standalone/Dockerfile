FROM openpolicyagent/opa:latest

# Copy policies to container
COPY policies/ /policies/

# Expose OPA default port
EXPOSE 8181

# Health check (simplified without wget)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD test /policies/ || exit 1

# Run OPA server with policies loaded
CMD ["run", "--server", "--addr", "0.0.0.0:8181", "--log-level", "info", "/policies/"] 