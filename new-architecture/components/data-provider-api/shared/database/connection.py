"""
Database connection management for PostgreSQL
"""

import os
import logging
import psycopg2
import psycopg2.extras
from contextlib import contextmanager
from typing import Optional, Dict, Any
import threading
from psycopg2.pool import ThreadedConnectionPool

logger = logging.getLogger(__name__)

class DatabaseConnection:
    """Singleton class for managing PostgreSQL connections"""
    
    _instance = None
    _lock = threading.Lock()
    _pool = None
    
    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super(DatabaseConnection, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not hasattr(self, 'initialized'):
            self.initialized = True
            self._initialize_pool()
    
    def _initialize_pool(self):
        """Initialize connection pool"""
        try:
            # Get database configuration from environment
            db_config = {
                'host': os.environ.get('DB_HOST', 'localhost'),
                'port': int(os.environ.get('DB_PORT', 5432)),
                'database': os.environ.get('DB_NAME', 'opa_zero_poll'),
                'user': os.environ.get('DB_USER', 'opa_user'),
                'password': os.environ.get('DB_PASSWORD', 'opa_password'),
            }
            
            # Create connection pool
            self._pool = ThreadedConnectionPool(
                minconn=1,
                maxconn=20,
                **db_config
            )
            
            logger.info(f"Database connection pool initialized: {db_config['host']}:{db_config['port']}/{db_config['database']}")
            
        except Exception as e:
            logger.error(f"Failed to initialize database connection pool: {e}")
            raise
    
    def get_connection(self):
        """Get connection from pool"""
        if self._pool is None:
            raise RuntimeError("Database connection pool not initialized")
        
        try:
            conn = self._pool.getconn()
            # Set autocommit to False for transaction control
            conn.autocommit = False
            return conn
        except Exception as e:
            logger.error(f"Failed to get database connection: {e}")
            raise
    
    def return_connection(self, conn):
        """Return connection to pool"""
        if self._pool and conn:
            try:
                self._pool.putconn(conn)
            except Exception as e:
                logger.error(f"Failed to return connection to pool: {e}")
    
    def close_all_connections(self):
        """Close all connections in pool"""
        if self._pool:
            try:
                self._pool.closeall()
                logger.info("All database connections closed")
            except Exception as e:
                logger.error(f"Failed to close database connections: {e}")
    
    def test_connection(self) -> bool:
        """Test database connectivity"""
        try:
            with self.get_connection_context() as conn:
                with conn.cursor() as cursor:
                    cursor.execute("SELECT 1")
                    result = cursor.fetchone()
                    return result[0] == 1
        except Exception as e:
            logger.error(f"Database connection test failed: {e}")
            return False
    
    @contextmanager
    def get_connection_context(self):
        """Context manager for database connections"""
        conn = None
        try:
            conn = self.get_connection()
            yield conn
        except Exception as e:
            if conn:
                conn.rollback()
            logger.error(f"Database operation failed: {e}")
            raise
        finally:
            if conn:
                self.return_connection(conn)

# Global instance
_db_instance = None

def get_db_connection():
    """Get global database connection instance"""
    global _db_instance
    if _db_instance is None:
        _db_instance = DatabaseConnection()
    return _db_instance

@contextmanager
def get_db_cursor(dict_cursor=True):
    """Context manager for database cursor with automatic connection management"""
    db = get_db_connection()
    conn = None
    cursor = None
    
    try:
        conn = db.get_connection()
        
        if dict_cursor:
            cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        else:
            cursor = conn.cursor()
            
        yield cursor
        conn.commit()
        
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Database cursor operation failed: {e}")
        raise
    finally:
        if cursor:
            cursor.close()
        if conn:
            db.return_connection(conn)

@contextmanager 
def get_db_transaction():
    """Context manager for database transactions"""
    db = get_db_connection()
    conn = None
    
    try:
        conn = db.get_connection()
        yield conn
        conn.commit()
        
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Database transaction failed: {e}")
        raise
    finally:
        if conn:
            db.return_connection(conn)

def execute_query(query: str, params: tuple = None, fetch_one: bool = False, fetch_all: bool = True) -> Optional[Any]:
    """Execute a query and return results"""
    with get_db_cursor() as cursor:
        cursor.execute(query, params)
        
        if fetch_one:
            return cursor.fetchone()
        elif fetch_all:
            return cursor.fetchall()
        else:
            return cursor.rowcount

def execute_many(query: str, params_list: list) -> int:
    """Execute query with multiple parameter sets"""
    with get_db_cursor() as cursor:
        cursor.executemany(query, params_list)
        return cursor.rowcount

def check_database_health() -> Dict[str, Any]:
    """Check database health and return status"""
    try:
        db = get_db_connection()
        
        if not db.test_connection():
            return {
                'status': 'unhealthy',
                'error': 'Connection test failed'
            }
        
        # Get database stats
        with get_db_cursor() as cursor:
            # Check database size
            cursor.execute("""
                SELECT pg_size_pretty(pg_database_size(current_database())) as db_size
            """)
            db_size = cursor.fetchone()['db_size']
            
            # Check active connections
            cursor.execute("""
                SELECT count(*) as active_connections 
                FROM pg_stat_activity 
                WHERE state = 'active'
            """)
            active_connections = cursor.fetchone()['active_connections']
            
            # Check table counts
            cursor.execute("""
                SELECT 
                    schemaname,
                    tablename,
                    n_tup_ins as inserts,
                    n_tup_upd as updates,
                    n_tup_del as deletes
                FROM pg_stat_user_tables 
                ORDER BY schemaname, tablename
            """)
            table_stats = cursor.fetchall()
        
        return {
            'status': 'healthy',
            'database_size': db_size,
            'active_connections': active_connections,
            'table_stats': table_stats
        }
        
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return {
            'status': 'unhealthy',
            'error': str(e)
        } 