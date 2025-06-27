#!/bin/bash

echo "🚀 Starting Rental Management System..."

# Set environment variables
export PYTHONPATH="/opt/render/project/src/backend:$PYTHONPATH"
export DJANGO_SETTINGS_MODULE="rental_backend.settings"

# Navigate to backend directory
cd /opt/render/project/src/backend

echo "🔄 Installing Python dependencies..."
pip install -r ../requirements.txt

echo "🔄 Setting up database..."
python manage.py makemigrations --noinput
python manage.py migrate --noinput

echo "🔄 Collecting static files..."
python manage.py collectstatic --noinput

echo "🔄 Creating sample data..."
python ../scripts/create_simple_database.py

# Start Django backend
echo "📡 Starting Django backend on port 8000..."
python manage.py runserver 0.0.0.0:8000 &
DJANGO_PID=$!

# Wait a moment for Django to start
sleep 5

# Start Next.js frontend
echo "🌐 Starting Next.js frontend on port 3000..."
cd ..
npm start &
NEXTJS_PID=$!

# Function to handle shutdown
cleanup() {
    echo "🛑 Shutting down services..."
    kill $DJANGO_PID 2>/dev/null
    kill $NEXTJS_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGTERM SIGINT

# Wait for both processes
wait $DJANGO_PID
wait $NEXTJS_PID
