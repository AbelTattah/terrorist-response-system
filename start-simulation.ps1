# TARS Simulation Startup Script
# Installs dependencies and starts the Flask-SocketIO backend

Write-Host "--- TARS Simulation Startup ---" -ForegroundColor Cyan

# Check if Python is installed
try {
    $pythonVersion = python --version
    Write-Host "Using $pythonVersion" -ForegroundColor Green
} catch {
    Write-Error "Python not found. Please install Python 3.8+ from python.org"
    exit 1
}

# Install dependencies
Write-Host "Checking/Installing Dependencies..." -ForegroundColor Yellow
python -m pip install -r backend/requirements.txt

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to install dependencies."
    exit $LASTEXITCODE
}

# Set environment variables for development
$env:FLASK_PORT = "5000"
$env:FLASK_DEBUG = "True"
$env:DATABASE_URL = "sqlite:///tars.db"

# Start the Flask-SocketIO server
Write-Host "Starting Flask Backend on port 5000..." -ForegroundColor Cyan
cd backend
python app.py
