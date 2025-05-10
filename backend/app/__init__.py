# backend/app/__init__.py
# -*- coding: utf-8 -*-
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
# Corrected import for config: Use direct import as config.py is a sibling to the 'app' package directory
# when run.py (also a sibling) is the entry point.
from config import config_by_name, get_current_config, get_config_name, Config
import os
import logging
from logging.handlers import RotatingFileHandler  # Optional: for better file logging

# Initialize extensions without app instance, they will be initialized in create_app
db = SQLAlchemy()


# CORS will be initialized in create_app to allow for app-specific configurations

def create_app(config_name_override: str = None) -> Flask:
    """
    Application Factory Function.
    Creates and configures the Flask application instance.

    Args:
        config_name_override (str, optional): Specific configuration name to use
                                             (e.g., 'testing'). Defaults to None,
                                             which then uses FLASK_CONFIG or 'default'.
    Returns:
        Flask: The configured Flask application instance.
    """
    # Use the override if provided, otherwise get from env/default
    effective_config_name = config_name_override if config_name_override else get_config_name()
    # Ensure current_config_obj is an instance of Config or its subclasses
    current_config_obj: Config = config_by_name[effective_config_name]()

    app = Flask(__name__)
    app.config.from_object(current_config_obj)

    # Initialize extensions with the app instance
    db.init_app(app)

    # Configure CORS: Allow all origins from your frontend's development server
    # For production, restrict this to your actual frontend domain.
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # --- Logging Configuration ---
    if not app.debug and not app.testing:
        # Production logging
        if not os.path.exists('logs'):
            try:
                os.mkdir('logs')
            except OSError as e:
                app.logger.error(f"Could not create logs directory: {e}")

        log_file_path = 'logs/strategic_beeper.log'
        try:
            file_handler = RotatingFileHandler(log_file_path, maxBytes=10240, backupCount=10)
            file_handler.setFormatter(logging.Formatter(
                '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
            ))
            file_handler.setLevel(logging.INFO)
            app.logger.addHandler(file_handler)
        except Exception as e:
            app.logger.error(f"Could not set up file logging to {log_file_path}: {e}. Logging to stdout.")

        app.logger.setLevel(logging.INFO)
        app.logger.info(f'Strategic Beeper backend starting in {effective_config_name} mode')
    else:  # Development or Testing
        app.logger.setLevel(logging.DEBUG)
        app.logger.info(f'Strategic Beeper backend starting in {effective_config_name} (DEBUG) mode')

    # --- Import and Register Blueprints ---
    from .routes.auth import auth_bp
    from .routes.shop import shop_bp
    from .routes.ops import ops_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(shop_bp)
    app.register_blueprint(ops_bp)

    # --- Database Initialization ---
    with app.app_context():
        from . import models
        try:
            inspector = db.inspect(db.engine)
            if not inspector.has_table(models.User.__tablename__):
                app.logger.info("Database tables not found or schema is incomplete. Attempting to create all tables...")
                db.create_all()
                app.logger.info("Database tables created/verified.")
                seed_initial_data(app)
            else:
                app.logger.info("Database tables appear to exist. Skipping create_all.")
        except Exception as e:
            app.logger.error(f"CRITICAL: Error during database table check/creation: {str(e)}")
            app.logger.error(
                "Please ensure your database server is running, accessible, and credentials in .env are correct.")
            app.logger.error(f"Attempted Database URI was: {app.config.get('SQLALCHEMY_DATABASE_URI', 'Not Set')}")

    return app


def seed_initial_data(app_instance: Flask) -> None:
    """
    Seeds initial data (Default Operator, BeeperModels) if the database is empty.
    This function should be called within an active Flask application context.

    Args:
        app_instance (Flask): The current Flask application instance.
    """
    from .models import Operator, BeeperModel

    try:
        if Operator.query.count() == 0:
            app_instance.logger.info("Seeding default operator...")
            default_op = Operator(username='admin')
            default_op.set_password('op_password123')
            db.session.add(default_op)
            app_instance.logger.info("Default operator 'admin' (password: 'op_password123') created.")
        else:
            app_instance.logger.info("Operators already exist, skipping default operator seed.")

        if BeeperModel.query.count() == 0:
            app_instance.logger.info("Seeding dummy beeper models...")
            models_data = [
                {'name': 'PagerOne Basic',
                 'description': 'The reliable classic for everyday use. Features basic alphanumeric display and vibration alerts.',
                 'price': 49.99, 'image_url': 'https://placehold.co/400x300/A0522D/FFFFFF?text=PagerOne&font=roboto'},
                {'name': 'PagerX Pro',
                 'description': 'Advanced features, robust encryption, and extended signal range. Ideal for professionals.',
                 'price': 99.99, 'image_url': 'https://placehold.co/400x300/1E90FF/FFFFFF?text=PagerX+Pro&font=roboto'},
                {'name': 'StealthPager Mini',
                 'description': 'Compact and discreet design with silent mode and subtle notifications. Perfect for covert operations.',
                 'price': 75.50,
                 'image_url': 'https://placehold.co/400x300/2F4F4F/FFFFFF?text=StealthMini&font=roboto'},
                {'name': 'RuggedPager 5000',
                 'description': 'Waterproof (IP68), shock-resistant, and built for extreme field conditions. Long battery life.',
                 'price': 120.00,
                 'image_url': 'https://placehold.co/400x300/FF8C00/000000?text=Rugged5000&font=roboto'},
                {'name': 'MediPager Alert+',
                 'description': 'Specifically designed for medical emergency notifications with priority channels and easy-to-use interface.',
                 'price': 85.00, 'image_url': 'https://placehold.co/400x300/DC143C/FFFFFF?text=MediAlert+&font=roboto'},
                {'name': 'CommandoBeep Tactical',
                 'description': 'Military-grade beeper with encrypted comms and GPS location ping (simulated).',
                 'price': 150.00,
                 'image_url': 'https://placehold.co/400x300/006400/FFFFFF?text=CommandoBeep&font=roboto'}
            ]
            for data in models_data:
                model = BeeperModel(**data)
                db.session.add(model)
            app_instance.logger.info(f"{len(models_data)} dummy beeper models created.")
        else:
            app_instance.logger.info("Beeper models already exist, skipping dummy model seed.")

        db.session.commit()
        app_instance.logger.info("Initial data seeding process completed successfully (if data was missing).")

    except Exception as e:
        db.session.rollback()
        app_instance.logger.error(f"Error during initial data seeding: {str(e)}")

