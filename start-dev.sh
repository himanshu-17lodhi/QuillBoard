#!/bin/bash

# QuillBoard Development Server Script
# This script starts both Django backend and React frontend for development

set -e

echo "🚀 Starting QuillBoard Development Servers"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Python is available
if ! command -v python &> /dev/null; then
    print_error "Python is not installed or not in PATH"
    exit 1
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed or not in PATH"
    exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed or not in PATH"
    exit 1
fi

# Check if Redis is running (optional)
if ! command -v redis-cli &> /dev/null; then
    print_warning "Redis CLI not found. WebSocket features may not work."
else
    if ! redis-cli ping &> /dev/null; then
        print_warning "Redis server is not running. WebSocket features may not work."
        print_warning "Start Redis with: redis-server"
    else
        print_status "Redis server is running"
    fi
fi

# Install Python dependencies if needed
print_status "Checking Python dependencies..."
if [ ! -f "requirements.txt" ]; then
    print_error "requirements.txt not found. Are you in the QuillBoard root directory?"
    exit 1
fi

# Install or update Python packages
python -m pip install -r requirements.txt --quiet

# Run Django migrations
print_status "Running Django migrations..."
python manage.py migrate --no-input

# Install Node.js dependencies if needed
print_status "Checking Node.js dependencies..."
cd frontend
if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
    print_status "Installing Node.js dependencies..."
    npm install --silent
fi

# Build React app for production serving
print_status "Building React app..."
npm run build --silent

cd ..

print_status "Starting servers..."
echo ""

# Function to cleanup background processes
cleanup() {
    print_status "Shutting down servers..."
    kill $DJANGO_PID $REACT_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Start Django development server in background
print_status "Starting Django backend on http://localhost:8000"
python manage.py runserver 8000 &
DJANGO_PID=$!

# Wait a moment for Django to start
sleep 3

# Start React development server in background
print_status "Starting React frontend on http://localhost:5173"
cd frontend
npm run dev &
REACT_PID=$!

cd ..

echo ""
echo -e "${GREEN}✅ Both servers are now running!${NC}"
echo ""
echo -e "${BLUE}📱 Frontend (React):${NC} http://localhost:5173"
echo -e "${BLUE}🔧 Backend (Django):${NC} http://localhost:8000"
echo -e "${BLUE}🛠️  API Endpoints:${NC} http://localhost:8000/api/"
echo -e "${BLUE}👨‍💼 Admin Panel:${NC} http://localhost:8000/admin/"
echo ""
echo -e "${YELLOW}💡 The React dev server will proxy API requests to Django${NC}"
echo -e "${YELLOW}💡 Changes to React code will hot-reload automatically${NC}"
echo -e "${YELLOW}💡 Changes to Django code will restart the server${NC}"
echo ""
echo -e "${RED}Press Ctrl+C to stop both servers${NC}"
echo ""

# Wait for background processes
wait $DJANGO_PID $REACT_PID