# backend/app/utils/auth_helpers.py
# -*- coding: utf-8 -*-
from flask import request, jsonify, current_app, Response as FlaskResponse # Explicitly import Response
from functools import wraps
from typing import Callable, Optional, Union # For type hinting
from ..models import User, Operator # Import User and Operator models

# --- Credential Checking Functions ---
def check_user_credentials(username_or_email: str, password_plaintext: str) -> Optional[User]:
    """
    Authenticates a shop user by checking username/email and password against the database.
    Returns the User object if successful, None otherwise.
    """
    user: Optional[User] = User.query.filter(
        (User.username == username_or_email) | (User.email == username_or_email)
    ).first()
    if user and user.check_password(password_plaintext): # check_password handles hashed password
        return user
    current_app.logger.debug(f"User credential check failed for: {username_or_email}")
    return None

def check_operator_credentials(username: str, password_plaintext: str) -> Optional[Operator]:
    """
    Authenticates an operator by checking username and password against the database.
    Returns the Operator object if successful, None otherwise.
    """
    op: Optional[Operator] = Operator.query.filter_by(username=username).first()
    if op and op.check_password(password_plaintext): # check_password handles hashed password
        return op
    current_app.logger.debug(f"Operator credential check failed for: {username}")
    return None

# --- Decorators for Protected Routes (Using Basic Auth from request) ---
# Type alias for the decorated function's expected return type
RouteResponse = Union[FlaskResponse, tuple[FlaskResponse, int]]
DecoratedRoute = Callable[..., RouteResponse]


def user_basic_auth_required(f: DecoratedRoute) -> DecoratedRoute:
    """
    Decorator for routes requiring shop user login via Basic Authentication.
    Injects `current_user_obj: User` into the decorated function's kwargs.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs) -> RouteResponse: # Use Any for args/kwargs in decorator
        auth = request.authorization
        if not auth or not auth.username or not auth.password:
            current_app.logger.warning("User auth failed: Missing Basic Auth credentials.")
            return jsonify({"error": "Authentication required. Please provide username and password."}), 401
        
        user = check_user_credentials(auth.username, auth.password)
        if user is None:
            current_app.logger.warning(f"User auth failed: Invalid credentials for user '{auth.username}'.")
            return jsonify({"error": "Invalid credentials."}), 401
        
        kwargs['current_user_obj'] = user # Inject user object into the route
        return f(*args, **kwargs)
    return decorated_function

def operator_basic_auth_required(f: DecoratedRoute) -> DecoratedRoute:
    """
    Decorator for routes requiring operator login via Basic Authentication.
    Injects `current_operator_obj: Operator` into the decorated function's kwargs.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs) -> RouteResponse: # Use Any for args/kwargs in decorator
        auth = request.authorization
        if not auth or not auth.username or not auth.password:
            current_app.logger.warning("Operator auth failed: Missing Basic Auth credentials.")
            return jsonify({"error": "Operator authentication required. Please provide username and password."}), 401
        
        operator = check_operator_credentials(auth.username, auth.password)
        if operator is None:
            current_app.logger.warning(f"Operator auth failed: Invalid credentials for operator '{auth.username}'.")
            return jsonify({"error": "Invalid operator credentials."}), 401

        kwargs['current_operator_obj'] = operator # Inject operator object
        return f(*args, **kwargs)
    return decorated_function

