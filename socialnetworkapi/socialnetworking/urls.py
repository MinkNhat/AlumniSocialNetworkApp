from django.urls import path, include
from rest_framework.routers import DefaultRouter
from socialnetworking import views

r = DefaultRouter()
r.register('tags', views.TagViewSet, basename='tag')
r.register('posts', views.PostViewSet, basename='post')

urlpatterns = [
    path('', include(r.urls)),
]
