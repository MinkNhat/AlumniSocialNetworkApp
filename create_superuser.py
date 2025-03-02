import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'socialnetworkapi.settings')

import django
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Lấy thông tin từ biến môi trường
username = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'admin')
email = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@.com')
password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', '123')

# Tạo superuser
try:
    if not User.objects.filter(username=username).exists():
        User.objects.create_superuser(username=username, email=email, password=password)
        print(f"Superuser '{username}' created successfully with email {email}")
    else:
        print(f"Superuser '{username}' already exists, skipping creation")
except Exception as e:
    print(f"Error creating superuser: {e}")