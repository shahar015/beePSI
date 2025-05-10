# backend/run.py
import os
from app import create_app # Import the application factory

# Determine the configuration name (e.g., 'development', 'production')
# This defaults to 'development' if the FLASK_CONFIG environment variable is not set.
config_name = os.getenv('FLASK_CONFIG', 'development')

# Create the Flask app instance using the factory with the chosen configuration
app = create_app(config_name)

if __name__ == '__main__':
    # The seed_initial_data_if_empty function is now called within create_app
    # after tables are potentially created, so no explicit call needed here
    # unless you want to make it a separate CLI command.

    # Get port from environment or default to 5001
    # Ensure the port is an integer.
    try:
        port = int(os.environ.get("FLASK_RUN_PORT", 5001))
    except ValueError:
        app.logger.warning("Invalid FLASK_RUN_PORT value, defaulting to 5001.")
        port = 5001
    
    # Get host from environment or default to '0.0.0.0' to be accessible externally
    # (e.g., from other devices on the same network or Docker containers).
    # For purely local development, '127.0.0.1' can also be used.
    host = os.environ.get("FLASK_RUN_HOST", "0.0.0.0")
    
    # The debug mode is now controlled by the configuration object loaded in create_app
    # (e.g., app.config['DEBUG'] which is True for DevelopmentConfig)
    app.logger.info(f"Starting Strategic Beeper backend on http://{host}:{port} in '{config_name}' mode (Debug: {app.debug})")
    
    # Run the Flask development server
    # use_reloader=True is default when debug=True, helps with development by auto-restarting on code changes.
    app.run(host=host, port=port) 
