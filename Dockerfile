FROM python:3.11-slim as builder

# Ustawienia środowiska
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Kopiuj pliki wymagań
COPY requirements.txt /tmp/requirements.txt

# Zainstaluj zależności
RUN pip install --no-cache-dir -r /tmp/requirements.txt

# Etap produkcyjny
FROM python:3.11-slim

# Ustawienia środowiska
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PMS_HOST=0.0.0.0 \
    PMS_PORT=8120

# Zainstaluj niezbędne pakiety systemowe
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Kopiuj zainstalowane pakiety z poprzedniego etapu
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Utwórz użytkownika non-root
RUN useradd --create-home --shell /bin/bash pms

# Utwórz katalogi robocze
WORKDIR /app
RUN chown pms:pms /app

# Przełącz na użytkownika non-root
USER pms

# Kopiuj kod aplikacji
COPY --chown=pms:pms app/ ./app/

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PMS_PORT}/health || exit 1

# Expose port
EXPOSE ${PMS_PORT}

# Domyślne polecenie
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8120"] 