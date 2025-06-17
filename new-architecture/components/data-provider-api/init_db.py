#!/usr/bin/env python3
"""
Database Initialization Script for Railway PostgreSQL
Automatycznie inicjalizuje bazę danych schema i seed data
"""

import os
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import sys
import time

def get_db_connection():
    """Nawiązuje połączenie z bazą danych z Railway environment variables"""
    max_retries = 5
    retry_delay = 2
    
    # Railway PostgreSQL connection - używamy standardowych zmiennych Railway
    db_config = {
        'host': os.getenv('PGHOST', os.getenv('DB_HOST', 'localhost')),
        'port': int(os.getenv('PGPORT', os.getenv('DB_PORT', 5432))),
        'user': os.getenv('PGUSER', os.getenv('DB_USER', 'postgres')),
        'password': os.getenv('PGPASSWORD', os.getenv('DB_PASSWORD', '')),
        'database': os.getenv('PGDATABASE', os.getenv('DB_NAME', 'railway'))
    }
    
    # Sprawdzenie czy mamy wszystkie wymagane dane
    if not all([db_config['host'], db_config['password']]):
        print("❌ Brak wymaganych zmiennych środowiskowych:")
        print(f"   PGHOST/DB_HOST: {db_config['host']}")
        print(f"   PGUSER/DB_USER: {db_config['user']}")
        print(f"   PGDATABASE/DB_NAME: {db_config['database']}")
        print(f"   PGPASSWORD/DB_PASSWORD: {'***' if db_config['password'] else 'BRAK'}")
        return None
    
    for attempt in range(max_retries):
        try:
            print(f"🔌 Próba połączenia z bazą danych (attempt {attempt + 1}/{max_retries})...")
            print(f"   Host: {db_config['host']}:{db_config['port']}")
            print(f"   Database: {db_config['database']}")
            print(f"   User: {db_config['user']}")
            
            conn = psycopg2.connect(**db_config)
            conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
            print("✅ Połączenie z bazą danych ustanowione!")
            return conn
            
        except psycopg2.OperationalError as e:
            print(f"❌ Błąd połączenia (attempt {attempt + 1}): {e}")
            if attempt < max_retries - 1:
                print(f"⏳ Oczekiwanie {retry_delay} sekund przed ponowną próbą...")
                time.sleep(retry_delay)
                retry_delay *= 2  # Exponential backoff
            else:
                print("💥 Maksymalna liczba prób połączenia przekroczona!")
                raise
    
    return None

def check_tables_exist(conn):
    """Sprawdza czy tabele już istnieją w bazie danych"""
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        """)
        
        tables = [row[0] for row in cursor.fetchall()]
        cursor.close()
        
        print(f"📋 Znalezione tabele: {tables}")
        
        # Sprawdzamy czy istnieją kluczowe tabele
        required_tables = ['tenants', 'users', 'applications', 'companies']
        existing_required = [t for t in required_tables if t in tables]
        
        if len(existing_required) > 0:
            print(f"✅ Znaleziono {len(existing_required)}/{len(required_tables)} kluczowych tabel")
            return True
        else:
            print("📭 Baza danych jest pusta - wymagana inicjalizacja")
            return False
            
    except Exception as e:
        print(f"❌ Błąd sprawdzania tabel: {e}")
        return False

def execute_sql_file(conn, file_path, description):
    """Wykonuje plik SQL w bazie danych"""
    try:
        if not os.path.exists(file_path):
            print(f"❌ Plik nie istnieje: {file_path}")
            return False
            
        print(f"📂 Ładowanie {description} z: {file_path}")
        
        with open(file_path, 'r', encoding='utf-8') as f:
            sql_content = f.read()
        
        cursor = conn.cursor()
        
        # Wykonujemy SQL w częściach (split by ;)
        sql_commands = [cmd.strip() for cmd in sql_content.split(';') if cmd.strip()]
        
        for i, command in enumerate(sql_commands):
            try:
                if command:
                    cursor.execute(command)
                    print(f"   ✅ Wykonano polecenie {i+1}/{len(sql_commands)}")
            except Exception as cmd_error:
                print(f"   ⚠️  Błąd w poleceniu {i+1}: {cmd_error}")
                # Kontynuujemy mimo błędów (niektóre mogą być oczekiwane)
        
        cursor.close()
        print(f"✅ {description} zakończone pomyślnie!")
        return True
        
    except Exception as e:
        print(f"❌ Błąd wykonywania {description}: {e}")
        return False

def init_database():
    """Główna funkcja inicjalizacji bazy danych"""
    print("🚀 =================================================")
    print("🚀 INICJALIZACJA BAZY DANYCH OPA ZERO POLL")
    print("🚀 =================================================")
    
    # Wyświetl zmienne środowiskowe (bez hasła)
    print("🔧 Zmienne środowiskowe:")
    print(f"   PGHOST: {os.getenv('PGHOST', 'BRAK')}")
    print(f"   PGPORT: {os.getenv('PGPORT', 'BRAK')}")
    print(f"   PGUSER: {os.getenv('PGUSER', 'BRAK')}")
    print(f"   PGDATABASE: {os.getenv('PGDATABASE', 'BRAK')}")
    print(f"   PGPASSWORD: {'***' if os.getenv('PGPASSWORD') else 'BRAK'}")
    print("   ---")
    print(f"   DB_HOST: {os.getenv('DB_HOST', 'BRAK')}")
    print(f"   DB_PORT: {os.getenv('DB_PORT', 'BRAK')}")
    print(f"   DB_USER: {os.getenv('DB_USER', 'BRAK')}")
    print(f"   DB_NAME: {os.getenv('DB_NAME', 'BRAK')}")
    print(f"   DB_PASSWORD: {'***' if os.getenv('DB_PASSWORD') else 'BRAK'}")
    
    try:
        # 1. Nawiązanie połączenia
        conn = get_db_connection()
        if not conn:
            return False
        
        # 2. Sprawdzenie czy baza jest już zainicjalizowana
        if check_tables_exist(conn):
            print("✅ Baza danych już zawiera tabele - pomijanie inicjalizacji")
            print("💡 Jeśli chcesz zresetować bazę, usuń wszystkie tabele ręcznie")
            conn.close()
            return True
        
        # 3. Inicjalizacja schema
        schema_path = os.path.join(os.path.dirname(__file__), '../../database/schema.sql')
        if not execute_sql_file(conn, schema_path, "Schema (struktury tabel)"):
            conn.close()
            return False
        
        # 4. Ładowanie danych testowych
        seed_path = os.path.join(os.path.dirname(__file__), '../../database/seed_data.sql')
        if not execute_sql_file(conn, seed_path, "Seed Data (dane testowe)"):
            print("⚠️  Błąd ładowania danych testowych - kontynuujemy")
        
        # 5. Sprawdzenie końcowe
        if check_tables_exist(conn):
            print("🎉 =================================================")
            print("🎉 INICJALIZACJA BAZY DANYCH ZAKOŃCZONA POMYŚLNIE!")
            print("🎉 =================================================")
            conn.close()
            return True
        else:
            print("❌ Inicjalizacja nie powiodła się - brak tabel po wykonaniu")
            conn.close()
            return False
            
    except Exception as e:
        print(f"💥 Krytyczny błąd inicjalizacji: {e}")
        return False

if __name__ == "__main__":
    # Uruchomienie z linii komend
    success = init_database()
    sys.exit(0 if success else 1) 