#!/bin/bash

# Start Django backend on port 8000
cd backend
python manage.py migrate
python manage.py collectstatic --noinput
gunicorn rental_backend.wsgi:application --bind 0.0.0.0:8000 &

# Wait a moment for backend to start
sleep 5

# Start Next.js frontend on the main port
cd ..
npm start -- -p $PORT

# Keep the script running
wait
