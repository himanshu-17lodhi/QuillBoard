#!/bin/bash

# Start the database
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
sleep 5

# Run database migrations
cd backend
npx prisma migrate dev
cd ..

# Start the backend
cd backend
npm run start:dev &
BACKEND_PID=$!
cd ..

# Start the frontend
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Function to cleanup on exit
cleanup() {
    echo "Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID
    docker-compose down
    exit
}

# Trap SIGINT (Ctrl+C) and call cleanup
trap cleanup INT

# Wait for processes
wait
