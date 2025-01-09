from rest_framework import serializers
from socialnetworking.models import Tag, Post


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'active']


class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['id', 'caption', 'created_date', 'updated_date', 'active']