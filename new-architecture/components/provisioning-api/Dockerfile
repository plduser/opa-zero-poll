# Używamy lekkiego obrazu Python 3.11
FROM python:3.11-slim

# Ustawiamy zmienne środowiskowe
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8010

# Tworzymy grupę i użytkownika bez uprawnień root
RUN groupadd -r provisioning && useradd -r -g provisioning provisioning

# Tworzymy katalog roboczych i ustawiamy właściciela
WORKDIR /app
RUN chown provisioning:provisioning /app

# Instalujemy zależności systemowe i narzędzia
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Kopiujemy requirements.txt i instalujemy zależności Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Kopiujemy kod aplikacji
COPY app.py .

# Tworzymy katalog dla bazy danych
RUN mkdir -p /app/data && chown provisioning:provisioning /app/data

# Zmieniamy na użytkownika bez uprawnień root
USER provisioning

# Ustawiamy zmienne środowiskowe dla aplikacji
ENV DATABASE_PATH=/app/data/tenants.db

# Eksponujemy port
EXPOSE $PORT

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:$PORT/health || exit 1

# Uruchamiamy aplikację
CMD ["python", "app.py"] 