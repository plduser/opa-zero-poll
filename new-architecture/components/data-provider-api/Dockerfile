FROM python:3.11-slim

# Ustaw katalog roboczy
WORKDIR /app

# Zainstaluj curl dla health checków
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Skopiuj plik requirements
COPY requirements.txt .

# Zainstaluj zależności
RUN pip install --no-cache-dir -r requirements.txt

# Skopiuj kod aplikacji
COPY app.py .
COPY init_db.py .
COPY start.sh .
COPY opal_endpoints.py .
COPY database_integration.py .
COPY users_endpoints.py .
COPY companies_endpoints.py .
COPY profiles_endpoints.py .
COPY user_profiles_endpoints.py .
COPY user_data_sync.py .
COPY profile_role_mapper.py .
COPY shared/ ./shared/

# Skopiuj pliki Model 2
COPY model2*.py ./
COPY model2-sample-data.json ./

# Skopiuj dokumentację OpenAPI
COPY openapi.json ./

# Utwórz użytkownika bez uprawnień root
RUN adduser --disabled-password --gecos '' appuser && \
    chown -R appuser:appuser /app
USER appuser

# Ustaw zmienne środowiskowe
ENV PORT=8110
ENV DEBUG=false

# Ustaw uprawnienia wykonywalne dla skryptu startowego
RUN chmod +x start.sh

# Odsłoń port
EXPOSE 8110

# Domyślna komenda startowa - Railway może to nadpisać
CMD ["./start.sh"] 