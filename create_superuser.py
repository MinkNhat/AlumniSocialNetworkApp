import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'socialnetworkapi.settings')

import django
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()
username = input("Enter username: ")
email = input("Enter email: ")
password = input("Enter password: ")

user = User.objects.create_superuser(username=username, email=email, password=password)
print(f"Superuser {username} created successfully!")