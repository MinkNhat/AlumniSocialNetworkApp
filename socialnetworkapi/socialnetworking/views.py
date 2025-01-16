import json
from datetime import timedelta

from django.contrib.auth import authenticate
from django.http import JsonResponse
from django.utils.timezone import now
from rest_framework import viewsets, generics, status, permissions, parsers
from rest_framework.exceptions import ValidationError

from socialnetworking.models import Tag, Post, Media, User, Comment, Action
from socialnetworking import serializers, paginators, perms
from rest_framework.decorators import action
from rest_framework.response import Response
import mimetypes
from oauth2_provider.views import TokenView


class TagViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Tag.objects.filter(active=True).all()
    serializer_class = serializers.TagSerializer


class PostViewSet(viewsets.ViewSet, generics.ListAPIView, generics.RetrieveAPIView, generics.CreateAPIView):
    queryset = Post.objects.filter(active=True)
    pagination_class = paginators.ItemPaginator

    def get_queryset(self):
        query = self.queryset
        kw = self.request.query_params.get('q')
        if kw:
            query = query.filter(caption__icontains=kw)
        if self.action == 'retrieve':
            query = query.prefetch_related('tags').select_related('user')
        return query

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return serializers.PostDetailsSerializer
        return serializers.PostSerializer

    def get_permissions(self):
        if self.action in ['get_comments', 'get_media', 'get_tags', 'get_action', 'create'] and self.request.method in ['POST']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(methods=['get', 'post'], url_path='media', detail=True)
    def get_media(self, request, pk):
        if request.method.__eq__('POST'):
            file = request.data.get('file')
            file_type, _ = mimetypes.guess_type(file.name)
            if file_type.startswith('image'):
                media_type = 'image'
            else:
                media_type = 'video'

            m = Media.objects.create(file=file, media_type=media_type, post=self.get_object())
            return Response(serializers.MediaSerializer(m, context={'request': request}).data)
        else:
            media = self.get_object().media_set.filter(active=True)
            return Response(serializers.MediaSerializer(media, many=True, context={'request': request}).data)

    @action(methods=['get', 'post'], url_path='comments', detail=True)
    def get_comments(self, request, pk):
        if request.method.__eq__('POST'):
            content = request.data.get('content')
            comment = Comment.objects.create(content=content, user=request.user, post=self.get_object())
            return Response(serializers.CommentSerializer(comment).data)
        else:
            comments = self.get_object().comment_set.select_related('user').filter(active=True)

            paginator = paginators.ItemPaginator()
            paginated_comments = paginator.paginate_queryset(comments, request)

            return paginator.get_paginated_response(serializers.CommentSerializer(paginated_comments, many=True).data)

    @action(methods=['post'], url_path='action', detail=True)
    def get_action(self, request, pk):
        action_type = int(request.data.get('type', Action.LIKE))
        if action_type not in dict(Action.ACTIONS):
            return Response({"error": "Invalid"}, status=status.HTTP_400_BAD_REQUEST)
        act, created = Action.objects.get_or_create(post=self.get_object(), user=request.user)

        if not created:
            if act.type == action_type:
                # Nếu cảm xúc trùng
                act.active = not act.active
            else:
                # Nếu kiểu cảm xúc khác
                act.type = action_type
                act.active = True
        else:
            act.type = action_type
            act.active = True
        act.save()
        return Response(serializers.ActionSerializer(act).data)

    @action(methods=['post'], url_path='tags', detail=True)
    def assign_tags(self, request, pk):
        post = self.get_object()
        tags = request.data['tags']
        for t in tags:
            tag, _ = Tag.objects.get_or_create(name=t)
            post.tags.add(tag)
        post.save()


class UserViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = serializers.UserSerializer
    parser_classes = [parsers.MultiPartParser, parsers.JSONParser]

    @action(methods=['get', 'patch'], url_path='current-user', detail=False, permission_classes=[permissions.IsAuthenticated])
    def get_user(self, request):
        u = request.user
        if request.method.__eq__('PATCH'):
            for key, value in request.data.items():
                if key.__eq__('password'):
                    u.set_password(value)
                    u.password_changed = True
                else:
                    setattr(u, key, value)
            u.save()

        return Response(serializers.UserSerializer(u, context={'request': request}).data)


class CommentViewSet(viewsets.ViewSet, generics.DestroyAPIView, generics.UpdateAPIView):
    queryset = Comment.objects.filter(active=True)
    serializer_class = serializers.CommentSerializer

    def get_permissions(self):
        if self.action in ['destroy', 'update', 'partial_update']:
            return [perms.OwnerPerms()]
        return [permissions.AllowAny()]


class MediaViewSet(viewsets.ViewSet, generics.DestroyAPIView, generics.UpdateAPIView):
    queryset = Media.objects.filter(active=True)
    serializer_class = serializers.MediaSerializer

    def get_permissions(self):
        if self.action in ['destroy', 'update', 'partial_update']:
            return [perms.MediaPerms()]
        return [permissions.AllowAny()]


class CustomTokenView(TokenView):
    def post(self, request, *args, **kwargs):
        body_data = json.loads(request.body)
        username = body_data.get('username')
        password = body_data.get('password')

        user = authenticate(request, username=username, password=password)
        if user:
            if user.role == 'TEACHER':
                if not user.password_changed and now() > user.password_change_time + timedelta(minutes=1):
                    return JsonResponse({
                        "error": "invalid_grant",
                        "error_description": "Your account is locked, please contact admin to support!"
                    }, status=400)

        return super().post(request, *args, **kwargs)
