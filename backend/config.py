# backend/config.py
import os
from dotenv import load_dotenv

# Determine the base directory of the backend package
# This assumes config.py is in the root of the 'backend' directory,
# and .env is in the parent directory of 'backend' (i.e., the project root)
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
dotenv_path = os.path.join(project_root, '.env')

if os.path.exists(dotenv_path):
    print(f"Loading .env file from: {dotenv_path}")
    load_dotenv(dotenv_path)
else:
    print(f".env file not found at: {dotenv_path}. Using default or environment-set variables.")

class Config:
    """Base configuration class."""
    # It's crucial to set a strong, random SECRET_KEY in your environment for production.
    # This default is only for convenience in development and should NOT be used in production.
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev_default_super_secret_key_123!')
    SQLALCHEMY_TRACK_MODIFICATIONS = False # Suppress SQLAlchemy warning
    DEBUG = False
    TESTING = False

    # Database Configuration - values are fetched from environment variables
    # with sensible defaults for local development.
    DB_USER = os.environ.get('DB_USER', 'postgres')
    DB_PASSWORD = os.environ.get('DB_PASSWORD') # No default for password for security
    DB_HOST = os.environ.get('DB_HOST', 'localhost')
    DB_PORT = os.environ.get('DB_PORT', '5432')
    DB_NAME = os.environ.get('DB_NAME', 'strategic_beep_db')

    if not DB_PASSWORD:
        print("WARNING: DB_PASSWORD environment variable is not set. Database connection might fail.")
        # For a local dev setup without a password (not recommended for pg):
        # SQLALCHEMY_DATABASE_URI = f'postgresql://{DB_USER}@{DB_HOST}:{DB_PORT}/{DB_NAME}'
        # However, it's better to require it or have a placeholder that will clearly fail if not set.
        # For this example, we'll construct it and let it fail if password is truly needed and missing.
    
    SQLALCHEMY_DATABASE_URI = f'postgresql://{DB_USER}:{DB_PASSWORD if DB_PASSWORD else ""}@{DB_HOST}:{DB_PORT}/{DB_NAME}'


class DevelopmentConfig(Config):
    """Development-specific configuration."""
    DEBUG = True
    # SQLALCHEMY_ECHO = True # Uncomment to log SQL queries to the console, useful for debugging

class TestingConfig(Config):
    """Testing-specific configuration."""
    TESTING = True
    # Use a separate database for tests to avoid data corruption
    DB_NAME_TEST = os.environ.get('DB_NAME_TEST', 'strategic_beep_test_db')
    SQLALCHEMY_DATABASE_URI = f'postgresql://{Config.DB_USER}:{Config.DB_PASSWORD if Config.DB_PASSWORD else ""}@{Config.DB_HOST}:{Config.DB_PORT}/{DB_NAME_TEST}'
    SECRET_KEY = 'test_secret_key_for_testing_only_123!' # Fixed key for predictable test behavior

class ProductionConfig(Config):
    """Production-specific configuration."""
    # In production, SECRET_KEY MUST be set via an environment variable
    # and should be a strong, randomly generated string.
    SECRET_KEY = os.environ.get('SECRET_KEY')
    if not SECRET_KEY or SECRET_KEY == 'dev_default_super_secret_key_123!':
        raise ValueError("CRITICAL: Insecure or missing SECRET_KEY for production environment.")
    
    # Example: Use DATABASE_URL from environment if provided (e.g., by Heroku, Render)
    # SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', Config.SQLALCHEMY_DATABASE_URI)
    # Ensure DATABASE_URL is properly formatted if used, e.g., by replacing 'postgres://' with 'postgresql://'
    # if 'DATABASE_URL' in os.environ:
    #     SQLALCHEMY_DATABASE_URI = os.environ['DATABASE_URL'].replace("postgres://", "postgresql://", 1)


# Dictionary to access configuration classes by their string names
config_by_name = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig # Fallback to development if FLASK_CONFIG is not set
}

def get_config_name() -> str:
    """Gets the configuration name from the FLASK_CONFIG environment variable."""
    return os.getenv('FLASK_CONFIG', 'default')

def get_current_config() -> Config:
    """Returns the current configuration instance."""
    return config_by_name[get_config_name()]()

