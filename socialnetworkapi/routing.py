from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from django.urls import re_path
from .consumers import PostActivityConsumer

# websocket_urlpatterns = [
#     re_path(r"ws/posts/(?P<post_id>\d+)/$", PostActivityConsumer.as_asgi()),
# ]
#
# application = ProtocolTypeRouter({
#     "http": get_asgi_application(),
#     "websocket": AuthMiddlewareStack(
#         URLRouter(websocket_urlpatterns)
#     ),
# })
