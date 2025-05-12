# app/utils/auth_helpers_psycopg.py
# -*- coding: utf-8 -*-
from flask import request, jsonify, current_app, Response as FlaskResponse
from functools import wraps
from typing import Callable, Optional, Union, Dict, Any 
# Use absolute import from 'app' package
from app.db_utils import fetch_one_as_dict 

def check_user_credentials_psycopg(username_or_email: str, password_plaintext: str) -> Optional[Dict[str, Any]]:
    """
    Authenticates a shop user by checking username/email and plaintext password.
    """
    sql = "SELECT id, username, email, password_plaintext FROM users WHERE username = %s OR email = %s;"
    user_data: Optional[Dict[str, Any]] = fetch_one_as_dict(sql, (username_or_email, username_or_email)) 
    
    if user_data and user_data.get('password_plaintext') == password_plaintext:
        return {"id": user_data["id"], "username": user_data["username"], "email": user_data["email"]}
    current_app.logger.debug(f"User credential check failed for: {username_or_email} using psycopg.")
    return None

def check_operator_credentials_psycopg(username: str, password_plaintext: str) -> Optional[Dict[str, Any]]:
    """
    Authenticates an operator by checking username and plaintext password.
    """
    sql = "SELECT id, username, password_plaintext FROM operators WHERE username = %s;"
    op_data: Optional[Dict[str, Any]] = fetch_one_as_dict(sql, (username,)) 

    if op_data and op_data.get('password_plaintext') == password_plaintext:
        return {"id": op_data["id"], "username": op_data["username"]}
    current_app.logger.debug(f"Operator credential check failed for: {username} using psycopg.")
    return None

RouteResponse = Union[FlaskResponse, tuple[FlaskResponse, int]]
DecoratedRoute = Callable[..., RouteResponse]

def user_basic_auth_required_psycopg(f: DecoratedRoute) -> DecoratedRoute:
    """
    Decorator for routes requiring shop user login via Basic Authentication (psycopg version).
    """
    @wraps(f)
    def decorated_function(*args: Any, **kwargs: Any) -> RouteResponse:
        auth = request.authorization
        if not auth or not auth.username or not auth.password:
            current_app.logger.warning("User auth (psycopg) failed: Missing Basic Auth credentials.")
            return jsonify({"error": "Authentication required. Please provide username and password."}), 401
        
        user_dict = check_user_credentials_psycopg(auth.username, auth.password)
        if user_dict is None:
            current_app.logger.warning(f"User auth (psycopg) failed: Invalid credentials for user '{auth.username}'.")
            return jsonify({"error": "Invalid credentials."}), 401
        
        kwargs['current_user_data'] = user_dict
        return f(*args, **kwargs)
    return decorated_function

def operator_basic_auth_required_psycopg(f: DecoratedRoute) -> DecoratedRoute:
    """
    Decorator for routes requiring operator login via Basic Authentication (psycopg version).
    """
    @wraps(f)
    def decorated_function(*args: Any, **kwargs: Any) -> RouteResponse:
        auth = request.authorization
        if not auth or not auth.username or not auth.password:
            current_app.logger.warning("Operator auth (psycopg) failed: Missing Basic Auth credentials.")
            return jsonify({"error": "Operator authentication required. Please provide username and password."}), 401
        
        operator_dict = check_operator_credentials_psycopg(auth.username, auth.password)
        if operator_dict is None:
            current_app.logger.warning(f"Operator auth (psycopg) failed: Invalid credentials for operator '{auth.username}'.")
            return jsonify({"error": "Invalid operator credentials."}), 401

        kwargs['current_operator_data'] = operator_dict
        return f(*args, **kwargs)
    return decorated_function
