#!/usr/bin/env python3
"""
Interoperacyjny skrypt inicjalizacji bazy danych
Działa z różnymi środowiskami: Railway, lokalny PostgreSQL, Docker, itp.

Użycie:
    python init-database.py --help
    python init-database.py --url postgresql://user:pass@host:port/db
    python init-database.py --host host --port 5432 --user user --password pass --database db
"""

import os
import sys
import argparse
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import time
from urllib.parse import urlparse

class DatabaseInitializer:
    def __init__(self, connection_params):
        self.connection_params = connection_params
        self.schema_file = "new-architecture/database/schema.sql"
        self.seed_file = "new-architecture/database/seed_data.sql"
        
    def connect_with_retry(self, max_retries=5, retry_delay=2):
        """Nawiązuje połączenie z bazą danych z retry logic"""
        for attempt in range(max_retries):
            try:
                print(f"🔌 Próba połączenia z bazą danych (próba {attempt + 1}/{max_retries})...")
                conn = psycopg2.connect(**self.connection_params)
                conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
                print("✅ Połączenie z bazą danych nawiązane pomyślnie")
                return conn
            except psycopg2.Error as e:
                print(f"❌ Błąd połączenia (próba {attempt + 1}): {e}")
                if attempt < max_retries - 1:
                    print(f"⏳ Oczekiwanie {retry_delay}s przed następną próbą...")
                    time.sleep(retry_delay)
                    retry_delay *= 1.5  # Exponential backoff
                else:
                    print("💥 Nie udało się nawiązać połączenia po wszystkich próbach")
                    raise

    def check_table_exists(self, conn, table_name):
        """Sprawdza czy tabela istnieje w bazie danych"""
        try:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = %s
                );
            """, (table_name,))
            return cursor.fetchone()[0]
        except psycopg2.Error as e:
            print(f"❌ Błąd sprawdzania tabeli {table_name}: {e}")
            return False

    def execute_sql_file(self, conn, file_path, description):
        """Wykonuje plik SQL"""
        try:
            print(f"📄 Wczytywanie {description} z pliku: {file_path}")
            
            if not os.path.exists(file_path):
                print(f"❌ Plik {file_path} nie istnieje!")
                return False
                
            with open(file_path, 'r', encoding='utf-8') as file:
                sql_content = file.read()
            
            print(f"🚀 Wykonywanie {description}...")
            cursor = conn.cursor()
            cursor.execute(sql_content)
            
            print(f"✅ {description} wykonany pomyślnie")
            return True
            
        except psycopg2.Error as e:
            print(f"❌ Błąd wykonywania {description}: {e}")
            return False
        except Exception as e:
            print(f"💥 Ogólny błąd przy {description}: {e}")
            return False

    def initialize_database(self, force=False):
        """Główna funkcja inicjalizacji bazy danych"""
        print("🚀 Rozpoczynanie inicjalizacji bazy danych...")
        
        try:
            # Nawiąż połączenie
            conn = self.connect_with_retry()
            
            # Sprawdź czy tabele już istnieją
            tables_exist = self.check_table_exists(conn, 'tenants')
            
            if tables_exist and not force:
                print("⚠️  Tabele już istnieją w bazie danych!")
                print("💡 Użyj parametru --force aby wymusić reinicjalizację")
                return False
            
            if tables_exist and force:
                print("🔄 Wymuszenie reinicjalizacji - tabele zostaną odtworzone")
            
            # Wykonaj schema.sql
            if not self.execute_sql_file(conn, self.schema_file, "schemat bazy danych"):
                return False
            
            # Wykonaj seed_data.sql
            if not self.execute_sql_file(conn, self.seed_file, "dane testowe"):
                return False
            
            # Sprawdź rezultat
            if self.check_table_exists(conn, 'tenants'):
                print("🎉 Baza danych została pomyślnie zainicjalizowana!")
                
                # Pokaż statystyki
                cursor = conn.cursor()
                cursor.execute("SELECT COUNT(*) FROM tenants")
                tenant_count = cursor.fetchone()[0]
                cursor.execute("SELECT COUNT(*) FROM users")
                user_count = cursor.fetchone()[0]
                cursor.execute("SELECT COUNT(*) FROM applications")
                app_count = cursor.fetchone()[0]
                
                print(f"📊 Statystyki:")
                print(f"   • Tenants: {tenant_count}")
                print(f"   • Użytkownicy: {user_count}")
                print(f"   • Aplikacje: {app_count}")
                
                return True
            else:
                print("❌ Błąd: Tabele nie zostały utworzone")
                return False
                
        except Exception as e:
            print(f"💥 Ogólny błąd inicjalizacji: {e}")
            return False
        finally:
            if 'conn' in locals():
                conn.close()
                print("🔌 Połączenie z bazą danych zamknięte")

def parse_database_url(url):
    """Parsuje URL bazy danych do parametrów połączenia"""
    parsed = urlparse(url)
    return {
        'host': parsed.hostname,
        'port': parsed.port or 5432,
        'user': parsed.username,
        'password': parsed.password,
        'database': parsed.path.lstrip('/')
    }

def get_connection_params_from_env():
    """Pobiera parametry połączenia ze zmiennych środowiskowych"""
    # Sprawdź czy jest DATABASE_URL (Railway, Heroku)
    database_url = os.getenv('DATABASE_URL')
    if database_url:
        print("🔗 Używanie DATABASE_URL ze zmiennych środowiskowych")
        return parse_database_url(database_url)
    
    # Sprawdź Railway-specific variables
    if os.getenv('PGHOST'):
        print("🚂 Wykryto zmienne Railway PostgreSQL")
        return {
            'host': os.getenv('PGHOST'),
            'port': int(os.getenv('PGPORT', 5432)),
            'user': os.getenv('PGUSER'),
            'password': os.getenv('PGPASSWORD'),
            'database': os.getenv('PGDATABASE')
        }
    
    # Sprawdź standardowe zmienne
    if os.getenv('DB_HOST'):
        print("🔧 Używanie standardowych zmiennych DB_*")
        return {
            'host': os.getenv('DB_HOST'),
            'port': int(os.getenv('DB_PORT', 5432)),
            'user': os.getenv('DB_USER'),
            'password': os.getenv('DB_PASSWORD'),
            'database': os.getenv('DB_NAME')
        }
    
    # Fallback do lokalnych wartości
    print("🏠 Używanie lokalnych domyślnych wartości")
    return {
        'host': 'localhost',
        'port': 5432,
        'user': 'opa_user',
        'password': 'opa_password',
        'database': 'opa_zero_poll'
    }

def main():
    parser = argparse.ArgumentParser(
        description='Interoperacyjny skrypt inicjalizacji bazy danych OPA Zero Poll'
    )
    
    # URL connection string
    parser.add_argument('--url', 
                       help='Connection URL (postgresql://user:pass@host:port/db)')
    
    # Individual parameters
    parser.add_argument('--host', help='Database host')
    parser.add_argument('--port', type=int, default=5432, help='Database port')
    parser.add_argument('--user', help='Database user')
    parser.add_argument('--password', help='Database password')
    parser.add_argument('--database', help='Database name')
    
    # Options
    parser.add_argument('--force', action='store_true',
                       help='Force reinitialization even if tables exist')
    parser.add_argument('--dry-run', action='store_true',
                       help='Show what would be done without executing')
    
    args = parser.parse_args()
    
    print("🎯 OPA Zero Poll - Inicjalizacja Bazy Danych")
    print("=" * 50)
    
    # Determine connection parameters
    if args.url:
        print(f"🔗 Używanie podanego URL: {args.url}")
        connection_params = parse_database_url(args.url)
    elif args.host:
        print("🔧 Używanie podanych parametrów")
        connection_params = {
            'host': args.host,
            'port': args.port,
            'user': args.user,
            'password': args.password,
            'database': args.database
        }
    else:
        print("🌍 Automatyczne wykrywanie parametrów ze zmiennych środowiskowych")
        connection_params = get_connection_params_from_env()
    
    # Validate parameters
    required_params = ['host', 'user', 'password', 'database']
    missing_params = [p for p in required_params if not connection_params.get(p)]
    
    if missing_params:
        print(f"❌ Brakujące parametry połączenia: {', '.join(missing_params)}")
        print("💡 Podaj --url lub ustaw zmienne środowiskowe, lub podaj parametry ręcznie")
        sys.exit(1)
    
    print(f"📍 Połączenie z: {connection_params['host']}:{connection_params['port']}/{connection_params['database']}")
    print(f"👤 Użytkownik: {connection_params['user']}")
    
    if args.dry_run:
        print("🏃‍♂️ Tryb DRY-RUN - nie będę wykonywać żadnych zmian")
        return
    
    # Initialize database
    initializer = DatabaseInitializer(connection_params)
    success = initializer.initialize_database(force=args.force)
    
    if success:
        print("\n🎉 Inicjalizacja zakończona pomyślnie!")
        sys.exit(0)
    else:
        print("\n💥 Inicjalizacja nie powiodła się!")
        sys.exit(1)

if __name__ == "__main__":
    main() 