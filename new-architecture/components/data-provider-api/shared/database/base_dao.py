"""
Base DAO class with common CRUD operations
"""

import logging
from typing import List, Optional, Dict, Any, Type, TypeVar, Generic
from abc import ABC, abstractmethod
from .connection import get_db_cursor, get_db_transaction, execute_query

logger = logging.getLogger(__name__)

T = TypeVar('T')

class BaseDAO(Generic[T], ABC):
    """Base Data Access Object with common CRUD operations"""
    
    def __init__(self, table_name: str, model_class: Type[T], id_column: str = 'id'):
        self.table_name = table_name
        self.model_class = model_class
        self.id_column = id_column
    
    @abstractmethod
    def dict_to_model(self, data: Dict[str, Any]) -> T:
        """Convert dictionary to model instance"""
        pass
    
    @abstractmethod
    def model_to_dict(self, model: T) -> Dict[str, Any]:
        """Convert model instance to dictionary"""
        pass
    
    def find_by_id(self, id_value: Any) -> Optional[T]:
        """Find record by ID"""
        try:
            query = f"SELECT * FROM {self.table_name} WHERE {self.id_column} = %s"
            result = execute_query(query, (id_value,), fetch_one=True)
            
            if result:
                return self.dict_to_model(dict(result))
            return None
            
        except Exception as e:
            logger.error(f"Error finding {self.table_name} by {self.id_column}={id_value}: {e}")
            raise
    
    def find_all(self, limit: Optional[int] = None, offset: int = 0) -> List[T]:
        """Find all records with optional pagination"""
        try:
            query = f"SELECT * FROM {self.table_name} ORDER BY {self.id_column}"
            
            if limit:
                query += f" LIMIT {limit} OFFSET {offset}"
            
            results = execute_query(query)
            return [self.dict_to_model(dict(row)) for row in results]
            
        except Exception as e:
            logger.error(f"Error finding all {self.table_name}: {e}")
            raise
    
    def find_by_criteria(self, criteria: Dict[str, Any], limit: Optional[int] = None) -> List[T]:
        """Find records by criteria"""
        try:
            if not criteria:
                return self.find_all(limit=limit)
            
            where_clauses = []
            params = []
            
            for key, value in criteria.items():
                if value is None:
                    where_clauses.append(f"{key} IS NULL")
                elif isinstance(value, list):
                    placeholders = ','.join(['%s'] * len(value))
                    where_clauses.append(f"{key} IN ({placeholders})")
                    params.extend(value)
                else:
                    where_clauses.append(f"{key} = %s")
                    params.append(value)
            
            where_clause = " AND ".join(where_clauses)
            query = f"SELECT * FROM {self.table_name} WHERE {where_clause} ORDER BY {self.id_column}"
            
            if limit:
                query += f" LIMIT {limit}"
            
            results = execute_query(query, tuple(params))
            return [self.dict_to_model(dict(row)) for row in results]
            
        except Exception as e:
            logger.error(f"Error finding {self.table_name} by criteria {criteria}: {e}")
            raise
    
    def create(self, model: T) -> T:
        """Create new record"""
        try:
            data = self.model_to_dict(model)
            
            # Remove None values and auto-generated fields
            data = {k: v for k, v in data.items() if v is not None}
            
            columns = list(data.keys())
            placeholders = ['%s'] * len(columns)
            values = list(data.values())
            
            query = f"""
                INSERT INTO {self.table_name} ({', '.join(columns)})
                VALUES ({', '.join(placeholders)})
                RETURNING *
            """
            
            result = execute_query(query, tuple(values), fetch_one=True)
            return self.dict_to_model(dict(result))
            
        except Exception as e:
            logger.error(f"Error creating {self.table_name}: {e}")
            raise
    
    def update(self, id_value: Any, updates: Dict[str, Any]) -> Optional[T]:
        """Update record by ID"""
        try:
            if not updates:
                return self.find_by_id(id_value)
            
            # Remove None values
            updates = {k: v for k, v in updates.items() if v is not None}
            
            set_clauses = [f"{key} = %s" for key in updates.keys()]
            values = list(updates.values())
            values.append(id_value)
            
            query = f"""
                UPDATE {self.table_name} 
                SET {', '.join(set_clauses)}
                WHERE {self.id_column} = %s
                RETURNING *
            """
            
            result = execute_query(query, tuple(values), fetch_one=True)
            
            if result:
                return self.dict_to_model(dict(result))
            return None
            
        except Exception as e:
            logger.error(f"Error updating {self.table_name} {self.id_column}={id_value}: {e}")
            raise
    
    def delete(self, id_value: Any) -> bool:
        """Delete record by ID"""
        try:
            query = f"DELETE FROM {self.table_name} WHERE {self.id_column} = %s"
            rowcount = execute_query(query, (id_value,), fetch_all=False)
            return rowcount > 0
            
        except Exception as e:
            logger.error(f"Error deleting {self.table_name} {self.id_column}={id_value}: {e}")
            raise
    
    def exists(self, id_value: Any) -> bool:
        """Check if record exists by ID"""
        try:
            query = f"SELECT 1 FROM {self.table_name} WHERE {self.id_column} = %s LIMIT 1"
            result = execute_query(query, (id_value,), fetch_one=True)
            return result is not None
            
        except Exception as e:
            logger.error(f"Error checking existence of {self.table_name} {self.id_column}={id_value}: {e}")
            raise
    
    def count(self, criteria: Optional[Dict[str, Any]] = None) -> int:
        """Count records with optional criteria"""
        try:
            if not criteria:
                query = f"SELECT COUNT(*) as count FROM {self.table_name}"
                result = execute_query(query, fetch_one=True)
                return result['count']
            
            where_clauses = []
            params = []
            
            for key, value in criteria.items():
                if value is None:
                    where_clauses.append(f"{key} IS NULL")
                elif isinstance(value, list):
                    placeholders = ','.join(['%s'] * len(value))
                    where_clauses.append(f"{key} IN ({placeholders})")
                    params.extend(value)
                else:
                    where_clauses.append(f"{key} = %s")
                    params.append(value)
            
            where_clause = " AND ".join(where_clauses)
            query = f"SELECT COUNT(*) as count FROM {self.table_name} WHERE {where_clause}"
            
            result = execute_query(query, tuple(params), fetch_one=True)
            return result['count']
            
        except Exception as e:
            logger.error(f"Error counting {self.table_name} with criteria {criteria}: {e}")
            raise
    
    def bulk_create(self, models: List[T]) -> List[T]:
        """Create multiple records in a transaction"""
        if not models:
            return []
        
        try:
            with get_db_transaction() as conn:
                with conn.cursor() as cursor:
                    created_models = []
                    
                    for model in models:
                        data = self.model_to_dict(model)
                        data = {k: v for k, v in data.items() if v is not None}
                        
                        columns = list(data.keys())
                        placeholders = ['%s'] * len(columns)
                        values = list(data.values())
                        
                        query = f"""
                            INSERT INTO {self.table_name} ({', '.join(columns)})
                            VALUES ({', '.join(placeholders)})
                            RETURNING *
                        """
                        
                        cursor.execute(query, tuple(values))
                        result = cursor.fetchone()
                        created_models.append(self.dict_to_model(dict(result)))
                    
                    return created_models
                    
        except Exception as e:
            logger.error(f"Error bulk creating {self.table_name}: {e}")
            raise
    
    def bulk_delete(self, id_values: List[Any]) -> int:
        """Delete multiple records by IDs"""
        if not id_values:
            return 0
        
        try:
            placeholders = ','.join(['%s'] * len(id_values))
            query = f"DELETE FROM {self.table_name} WHERE {self.id_column} IN ({placeholders})"
            rowcount = execute_query(query, tuple(id_values), fetch_all=False)
            return rowcount
            
        except Exception as e:
            logger.error(f"Error bulk deleting {self.table_name}: {e}")
            raise
    
    def execute_custom_query(self, query: str, params: tuple = None, fetch_one: bool = False) -> Any:
        """Execute custom query"""
        try:
            return execute_query(query, params, fetch_one=fetch_one)
        except Exception as e:
            logger.error(f"Error executing custom query on {self.table_name}: {e}")
            raise 