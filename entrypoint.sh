#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "Waiting for MySQL to be ready..."
# Wait for MySQL to be ready
while ! nc -z mysql 3306; do
  sleep 1
done
echo "MySQL is ready!"

echo "Waiting for Redis to be ready..."
# Wait for Redis to be ready
while ! nc -z redis 6379; do
  sleep 1
done
echo "Redis is ready!"

echo "Running migrations..."
ls
python socialnetworkapi/manage.py migrate --noinput

echo "Collecting static files..."
python socialnetworkapi/manage.py collectstatic --noinput

echo "Starting Daphne server..."
# Start Daphne ASGI server for Django Channels support
daphne -b 0.0.0.0 -p 8000 socialnetworkapi.asgi:application
