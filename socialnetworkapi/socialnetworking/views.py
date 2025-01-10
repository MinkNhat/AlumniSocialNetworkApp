from rest_framework import viewsets, generics, status, permissions
from socialnetworking.models import Tag, Post, Media, User, Comment
from socialnetworking import serializers, paginators, perms
from rest_framework.decorators import action
from rest_framework.response import Response



class TagViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Tag.objects.filter(active=True).all()
    serializer_class = serializers.TagSerializer


# class MediaViewSet(viewsets.ViewSet, generics.ListAPIView):
#     queryset = Media.objects.filter(active=True).all()
#     serializer_class = serializers.MediaSerializer


class PostViewSet(viewsets.ViewSet, generics.ListAPIView, generics.RetrieveAPIView):
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
        if self.action in ['get_comments'] and self.request.method in ['POST']:
            return [permissions.IsAuthenticated()]

        return [permissions.AllowAny()]

    @action(methods=['get'], url_path='media', detail=True)
    def get_media(self, request, pk):
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
            return Response(serializers.CommentSerializer(comments, many=True).data)


class UserViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = serializers.UserSerializer

    @action(methods=['get'], url_path='current-user', detail=False, permission_classes=[permissions.IsAuthenticated])
    def get_user(self, request):
        return Response(serializers.UserSerializer(request.user).data)


class CommentViewSet(viewsets.ViewSet, generics.DestroyAPIView):
    queryset = Comment.objects.filter(active=True)
    serializer_class = serializers.CommentSerializer
    permission_classes = [perms.OwnerPerms]
