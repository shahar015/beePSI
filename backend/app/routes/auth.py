# backend/app/routes/auth.py
# -*- coding: utf-8 -*-
from flask import Blueprint, request, jsonify, current_app
from ..models import User, Operator # Import User and Operator models
from .. import db # Import the db instance from app package
from ..utils.auth_helpers import check_user_credentials, check_operator_credentials # Simplified credential checkers

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

# --- User Registration ---
@auth_bp.route('/register', methods=['POST'])
def register_user_route():
    """Registers a new shop user."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body must be JSON."}), 400
        
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({"error": "Username, email, and password are required."}), 400

    if User.query.filter((User.username == username) | (User.email == email)).first():
        current_app.logger.info(f"Registration attempt failed: Username '{username}' or email '{email}' already exists.")
        return jsonify({"error": "Username or email already exists."}), 409 # Conflict

    try:
        new_user = User(username=username, email=email)
        new_user.set_password(password) # Password is hashed here
        db.session.add(new_user)
        db.session.commit()
        current_app.logger.info(f"New user registered: {username}")
        return jsonify({"message": "User registered successfully.", "user": new_user.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error during user registration for {username}: {str(e)}")
        return jsonify({"error": "Registration failed due to an internal error."}), 500

# --- User Login ---
@auth_bp.route('/login/user', methods=['POST'])
def login_user_route():
    """Logs in a shop user. Expects 'identifier' (username or email) and 'password' in JSON body."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body must be JSON."}), 400

    identifier = data.get('identifier')
    password = data.get('password')

    if not identifier or not password:
        return jsonify({"error": "Identifier (username/email) and password are required."}), 400

    user = check_user_credentials(identifier, password) # Checks hashed password

    if user:
        current_app.logger.info(f"User '{user.username}' logged in successfully.")
        # For this simplified auth, frontend will store credentials if needed for subsequent Basic Auth.
        # Backend just confirms success and returns user info.
        return jsonify({
            "message": "User login successful.",
            "user": user.to_dict(), # Contains id, username, email
            "role": "user"
        }), 200
    else:
        current_app.logger.warning(f"Failed user login attempt for: {identifier}")
        return jsonify({"error": "Invalid credentials."}), 401

# --- Operator Login ---
@auth_bp.route('/login/operator', methods=['POST'])
def login_operator_route():
    """Logs in an Ops Center operator. Expects 'username' and 'password' in JSON body."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body must be JSON."}), 400
        
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Username and password are required."}), 400

    operator = check_operator_credentials(username, password) # Checks hashed password

    if operator:
        current_app.logger.info(f"Operator '{operator.username}' logged in successfully.")
        return jsonify({
            "message": "Operator login successful.",
            "operator": operator.to_dict(), # Contains id, username
            "role": "operator"
        }), 200
    else:
        current_app.logger.warning(f"Failed operator login attempt for username: {username}")
        return jsonify({"error": "Invalid operator credentials."}), 401
