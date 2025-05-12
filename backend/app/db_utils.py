# app/db_utils.py
# -*- coding: utf-8 -*-
import psycopg2
import psycopg2.extras 
from flask import current_app, g 
from typing import List, Dict, Any, Optional, Tuple, Union

def get_db_connection_string() -> str:
    """
    Constructs database connection string from the current app config.
    """
    config = current_app.config
    required_keys = ['DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_HOST', 'DB_PORT']
    for key in required_keys:
        if key not in config:
            current_app.logger.error(f"Missing database configuration key: {key}")
            raise ValueError(f"Missing database configuration key: {key}")
        if key == 'DB_PASSWORD' and config[key] is None:
             current_app.logger.warning(f"DB_PASSWORD is not set in configuration. Connection might fail.")

    return f"dbname='{config['DB_NAME']}' user='{config['DB_USER']}' password='{config['DB_PASSWORD'] or ''}' host='{config['DB_HOST']}' port='{config['DB_PORT']}'"

def get_db() -> psycopg2.extensions.connection:
    """
    Opens a new database connection if one is not already present for the
    current application context. Stores the connection in Flask's `g` object.
    """
    if 'db_conn' not in g or g.db_conn.closed:
        try:
            conn_string = get_db_connection_string()
            g.db_conn = psycopg2.connect(conn_string)
            current_app.logger.debug("Database connection established.")
        except psycopg2.Error as e:
            current_app.logger.error(f"Error connecting to PostgreSQL database: {e}")
            current_app.logger.error(f"Connection string used (password redacted): dbname='{current_app.config.get('DB_NAME')}' user='{current_app.config.get('DB_USER')}' password='*****' host='{current_app.config.get('DB_HOST')}' port='{current_app.config.get('DB_PORT')}'")
            raise 
    return g.db_conn

def close_db(e: Optional[BaseException] = None) -> None:
    """Closes the database connection at the end of the request if it exists."""
    db_conn = g.pop('db_conn', None)
    if db_conn is not None and not db_conn.closed:
        db_conn.close()
        current_app.logger.debug("Database connection closed.")

def init_app_db(app: Any) -> None:
    """
    Registers database closing function with the Flask app.
    Called by the application factory.
    """
    app.teardown_appcontext(close_db)

def query_db(
    query: str, 
    params: Optional[Union[Tuple[Any, ...], Dict[str, Any]]] = None, 
    fetch_one: bool = False, 
    fetch_all: bool = True, 
    as_dict: bool = True, 
    commit: bool = False,
    fetch_returning_data: bool = False # Renamed from returning_id for clarity
) -> Optional[Union[Dict[str, Any], List[Dict[str, Any]], int, Any]]:
    """
    Executes a SQL query using psycopg2.
    """
    conn = None
    cur = None
    result: Optional[Union[Dict[str, Any], List[Dict[str, Any]], int, Any]] = None
    try:
        conn = get_db()
        cursor_factory = psycopg2.extras.RealDictCursor if as_dict else None
        cur = conn.cursor(cursor_factory=cursor_factory)
        
        current_app.logger.debug(f"Executing query: {query} with params: {params}")
        cur.execute(query, params)

        if commit:
            if fetch_returning_data: # If we want the data from RETURNING clause
                result = cur.fetchone() # Fetch the entire row (or first row) returned
            else: # Standard commit, return rowcount
                result = cur.rowcount 
            conn.commit()
            current_app.logger.debug(f"Transaction committed. Result/RowCount: {result}")
        elif fetch_one:
            result = cur.fetchone()
        elif fetch_all:
            result = cur.fetchall()
        else:
            # Default to rowcount if no fetch type and not committing (e.g., for SELECTs without explicit fetch)
            # However, this branch is less common for SELECTs.
            result = cur.rowcount 
            
        return result

    except psycopg2.Error as e:
        if conn:
            conn.rollback() 
        current_app.logger.error(f"Database query error: {e}\nQuery: {query}\nParams: {params}")
        raise 
    except Exception as e:
        if conn:
            conn.rollback()
        current_app.logger.error(f"An unexpected error occurred during DB operation: {e}\nQuery: {query}\nParams: {params}")
        raise
    finally:
        if cur:
            cur.close()

def fetch_all_as_dict(query: str, params: Optional[Union[Tuple[Any, ...], Dict[str, Any]]] = None) -> List[Dict[str, Any]]:
    """Convenience function to fetch all rows as a list of dictionaries."""
    results = query_db(query, params, fetch_all=True, as_dict=True, fetch_one=False, commit=False)
    return results if isinstance(results, list) else []

def fetch_one_as_dict(query: str, params: Optional[Union[Tuple[Any, ...], Dict[str, Any]]] = None) -> Optional[Dict[str, Any]]:
    """Convenience function to fetch a single row as a dictionary."""
    result = query_db(query, params, fetch_one=True, as_dict=True, fetch_all=False, commit=False)
    return result if isinstance(result, dict) else None


def execute_commit(query: str, params: Optional[Union[Tuple[Any, ...], Dict[str, Any]]] = None) -> int:
    """
    Executes a query and commits it (for INSERT, UPDATE, DELETE without RETURNING data).
    Returns the number of affected rows.
    """
    rowcount = query_db(query, params, commit=True, fetch_one=False, fetch_all=False, fetch_returning_data=False)
    return rowcount if isinstance(rowcount, int) else 0

def execute_commit_returning(query: str, params: Optional[Union[Tuple[Any, ...], Dict[str, Any]]] = None, as_dict: bool = True) -> Optional[Union[Dict[str, Any], Any]]:
    """
    Executes a query with a RETURNING clause and commits it.
    Fetches and returns the first row of RETURNING values.
    """
    returned_data = query_db(query, params, commit=True, fetch_returning_data=True, as_dict=as_dict, fetch_one=False, fetch_all=False)
    return returned_data
