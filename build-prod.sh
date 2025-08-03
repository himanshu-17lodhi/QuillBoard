#!/bin/bash

# QuillBoard Production Build Script
# This script builds the React app and prepares Django for production

set -e

echo "🏗️  Building QuillBoard for Production"
echo "===================================="

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

print_status "Installing Node.js dependencies..."
cd frontend
npm ci --only=production

print_status "Building React application..."
npm run build

print_status "React build completed successfully!"
echo ""
echo -e "${GREEN}✅ Production build ready!${NC}"
echo ""
echo -e "${BLUE}📁 Built files are in:${NC} frontend/dist/"
echo -e "${BLUE}🚀 Deploy with:${NC} gunicorn quillboard.wsgi:application"
echo -e "${BLUE}🔌 WebSockets with:${NC} daphne quillboard.asgi:application"
echo ""
echo -e "${YELLOW}💡 Make sure to:${NC}"
echo -e "${YELLOW}   1. Set DEBUG=False in production${NC}"
echo -e "${YELLOW}   2. Configure your database${NC}"
echo -e "${YELLOW}   3. Set up Redis for WebSockets${NC}"
echo -e "${YELLOW}   4. Configure static file serving${NC}"

cd ..