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

# Utwórz użytkownika bez uprawnień root
RUN adduser --disabled-password --gecos '' appuser && \
    chown -R appuser:appuser /app
USER appuser

# Ustaw zmienne środowiskowe
ENV PORT=8110
ENV DEBUG=false

# Odsłoń port
EXPOSE 8110

# Uruchom aplikację
CMD ["python", "app.py"] 