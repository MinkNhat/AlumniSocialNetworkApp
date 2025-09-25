"""
ASGI config for socialnetworkapi project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os

import django
# from socialnetworkapi.routing import application
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from django.urls import re_path

from socialnetworkapi.consumers import PostActivityConsumer

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'socialnetworkapi.settings')
django.setup()

websocket_urlpatterns = [
    re_path(r"ws/posts/(?P<post_id>\d+)/$", PostActivityConsumer.as_asgi()),
]

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(websocket_urlpatterns)
    ),
})
