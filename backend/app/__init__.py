# backend/app/__init__.py
# -*- coding: utf-8 -*-
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from config import config_by_name, get_current_config, get_config_name, Config
import os
import logging
from logging.handlers import RotatingFileHandler

db = SQLAlchemy()


def create_app(config_name_override: str = None) -> Flask:
    """
    Application Factory Function.
    Creates and configures the Flask application instance.
    """
    effective_config_name = config_name_override if config_name_override else get_config_name()
    current_config_obj: Config = config_by_name[effective_config_name]()

    app = Flask(__name__)
    app.config.from_object(current_config_obj)

    db.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    if not app.debug and not app.testing:
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
    else:
        app.logger.setLevel(logging.DEBUG)
        app.logger.info(f'Strategic Beeper backend starting in {effective_config_name} (DEBUG) mode')

    from .routes.auth import auth_bp
    from .routes.shop import shop_bp
    from .routes.ops import ops_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(shop_bp)
    app.register_blueprint(ops_bp)

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
            # Updated descriptions to Hebrew
            models_data = [
                {'name': 'PagerOne Basic',
                 'description': 'הקלאסיקה האמינה לשימוש יומיומי. כולל תצוגה אלפאנומרית בסיסית והתראות רטט.',
                 'price': 49.99, 'image_url': 'https://csecrosscom.co.uk/wp-content/uploads/2020/06/GEO28V2-tilted.png'},
                {'name': 'PagerX Pro',
                 'description': 'תכונות מתקדמות, הצפנה חזקה וטווח קליטה מורחב. אידיאלי לאנשי מקצוע.', 'price': 99.99,
                 'image_url': 'https://gov.spok.com/wp-content/uploads/2022/05/02.png'},
                {'name': 'StealthPager Mini',
                 'description': 'עיצוב קומפקטי ודיסקרטי עם מצב שקט והתראות עדינות. מושלם למבצעים חשאיים.',
                 'price': 75.50,
                 'image_url': 'https://www.call-systems.com/fileadmin/uploads/cst/Products/Pagers/Staff/CST_W2028-Pager_300px.png'},
                {'name': 'RuggedPager 5000',
                 'description': 'עמיד למים (IP68), עמיד בזעזועים ומיועד לתנאי שטח קיצוניים. חיי סוללה ארוכים.',
                 'price': 120.00,
                 'image_url': 'https://pngimg.com/d/pager_PNG23.png'},
                {'name': 'MediPager Alert+',
                 'description': 'תוכנן במיוחד להתראות חירום רפואיות עם ערוצים בעדיפות גבוהה וממשק קל לשימוש.',
                 'price': 85.00, 'image_url': 'https://www.pwservice.com/images/minitor_7_front-550x550h.png'},
                {'name': 'CommandoBeep Tactical',
                 'description': 'ביפר בדרגה צבאית עם תקשורת מוצפנת ויכולת איתור GPS (מדומיינת). מיועד לכוחות מיוחדים.',
                 'price': 150.00,
                 'image_url': 'https://iplp.com/wp-content/uploads/2019/07/Gold-Alphanumeric-Pager-2871-3-400.png'}
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
