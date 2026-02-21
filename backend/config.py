"""
Backend configuration
"""

import os

# Flask Configuration
FLASK_APP = os.getenv('FLASK_APP', 'app.py')
FLASK_ENV = os.getenv('FLASK_ENV', 'development')
FLASK_DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
FLASK_PORT = int(os.getenv('FLASK_PORT', 5000))
SECRET_KEY = os.getenv('SECRET_KEY', 'tars-secret-key-development')

# Database Configuration
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///tars.db')
SQL_ECHO = os.getenv('SQL_ECHO', 'False').lower() == 'true'

# XMPP Server Configuration
XMPP_SERVER = os.getenv('XMPP_SERVER', 'localhost')
XMPP_PORT = int(os.getenv('XMPP_PORT', 5222))

# OpenAI Configuration
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')

# News API Configuration
NEWS_API_KEY = os.getenv('NEWS_API_KEY', '')

# Simulation Configuration
SIMULATION_ENABLED = os.getenv('SIMULATION_ENABLED', 'True').lower() == 'true'
MISSILE_SPAWN_INTERVAL = int(os.getenv('MISSILE_SPAWN_INTERVAL', 30))
