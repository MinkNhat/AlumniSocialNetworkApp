web: python socialnetworkapi/manage.py migrate --noinput && python socialnetworkapi/manage.py collectstatic --noinput && daphne socialnetworkapi.asgi:application --port $PORT --bind 0.0.0.0