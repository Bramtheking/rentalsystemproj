#!/bin/bash

# Start Django backend
cd backend
python manage.py migrate
python manage.py collectstatic --noinput
gunicorn rental_backend.wsgi:application --bind 0.0.0.0:8000 &

# Start Next.js frontend
cd ..
npm run build
npm start
