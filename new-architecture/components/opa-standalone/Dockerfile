FROM openpolicyagent/opa:latest

# Expose OPA default port
EXPOSE 8181

# Health check - sprawdza czy OPA server działa
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8181/health || exit 1

# Run OPA server bez automatycznego ładowania polityk - OPAL Client będzie zarządzał politykami
CMD ["run", "--server", "--addr", "0.0.0.0:8181", "--log-level", "info"] 