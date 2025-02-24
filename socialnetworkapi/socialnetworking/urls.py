from django.urls import path, include
from rest_framework.routers import DefaultRouter
from socialnetworkapi.socialnetworking import views

r = DefaultRouter()
r.register('posts', views.PostViewSet, basename='post')
r.register('users', views.UserViewSet, basename='user')
r.register('comments', views.CommentViewSet, basename='comment')
r.register('media', views.MediaViewSet, basename='media')
r.register('messages', views.MessageViewSet, basename='message')
r.register('surveys', views.SurveyPostViewSet, basename='survey')
# r.register('responeses', views.SurveyResponeseViewSet, basename='responese')
r.register('events', views.EventPostViewSet, basename='event')


urlpatterns = [
    path('', include(r.urls)),
]
