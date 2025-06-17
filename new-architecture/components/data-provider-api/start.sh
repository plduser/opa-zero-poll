#!/bin/bash

echo "🚀 Uruchamianie Data Provider API na Railway..."

# Sprawdź czy zmienne środowiskowe są ustawione
if [ -z "$DB_HOST" ] || [ -z "$DB_USER" ] || [ -z "$DB_NAME" ]; then
    echo "❌ Brakuje zmiennych środowiskowych bazy danych!"
    echo "Wymagane: DB_HOST, DB_USER, DB_NAME, DB_PASSWORD"
    exit 1
fi

echo "✅ Zmienne środowiskowe skonfigurowane poprawnie"
echo "   DB_HOST: $DB_HOST"
echo "   DB_USER: $DB_USER" 
echo "   DB_NAME: $DB_NAME"

# Poczekaj na dostępność bazy danych (max 60 sekund)
echo "⏳ Oczekiwanie na dostępność bazy danych..."
timeout=60
while [ $timeout -gt 0 ]; do
    if python3 -c "
import psycopg2
import os
try:
    conn = psycopg2.connect(
        host=os.getenv('DB_HOST'),
        port=int(os.getenv('DB_PORT', 5432)),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        database=os.getenv('DB_NAME')
    )
    conn.close()
    print('✅ Połączenie z bazą danych udane')
    exit(0)
except Exception as e:
    print(f'❌ Błąd połączenia: {e}')
    exit(1)
"; then
        echo "✅ Baza danych jest dostępna!"
        break
    fi
    
    echo "⏳ Próba połączenia z bazą danych... ($timeout sekund pozostało)"
    sleep 2
    timeout=$((timeout-2))
done

if [ $timeout -le 0 ]; then
    echo "❌ Nie udało się połączyć z bazą danych w ciągu 60 sekund"
    exit 1
fi

# Uruchom inicjalizację bazy danych
echo "🔧 Inicjalizacja bazy danych..."
python3 init_db.py

if [ $? -eq 0 ]; then
    echo "✅ Inicjalizacja bazy danych zakończona pomyślnie"
else
    echo "⚠️  Inicjalizacja bazy danych nie powiodła się lub tabele już istnieją"
    echo "   Kontynuujemy uruchomienie aplikacji..."
fi

# Uruchom aplikację Flask
echo "🚀 Uruchamianie aplikacji Flask..."
exec python3 app.py 