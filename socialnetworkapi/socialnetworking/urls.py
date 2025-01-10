from django.urls import path, include
from rest_framework.routers import DefaultRouter
from socialnetworking import views

r = DefaultRouter()
r.register('posts', views.PostViewSet, basename='post')
r.register('users', views.UserViewSet, basename='user')
r.register('comments', views.CommentViewSet, basename='comment')

urlpatterns = [
    path('', include(r.urls)),
]
