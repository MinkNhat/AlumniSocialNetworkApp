from rest_framework import viewsets, generics
from socialnetworking.models import Tag, Post
from socialnetworking import serializers, paginators


class TagViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Tag.objects.filter(active=True).all()
    serializer_class = serializers.TagSerializer


class PostViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Post.objects.filter(active=True).all()
    serializer_class = serializers.PostSerializer
    pagination_class = paginators.ItemPaginator

    def get_queryset(self):
        query = self.queryset

        kw = self.request.query_params.get('q')
        if kw:
            query = query.filter(caption__icontains=kw)
        
        return query


