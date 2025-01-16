from rest_framework import serializers
from socialnetworking.models import Tag, Post, Media, Comment, User, Action


class UserSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        data = validated_data.copy()
        u = User(**data)
        u.set_password(u.password)
        u.save()

        return u

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['avatar'] = instance.avatar.url if instance.avatar else ''
        return data

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'last_name', 'first_name', 'avatar', 'role', 'email', 'created_date']
        extra_kwargs = {
            'password': {
                'write_only': True
            }
        }


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']


class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['id', 'caption', 'created_date', 'updated_date', 'active']


class PostDetailsSerializer(PostSerializer):
    tags = TagSerializer(many=True)
    user = UserSerializer()

    def create(self, validated_data):
        user = self.context['request'].user
        return Post.objects.create(user=user, **validated_data)

    class Meta:
        model = PostSerializer.Meta.model
        fields = PostSerializer.Meta.fields + ['user', 'tags']


class MediaSerializer(serializers.ModelSerializer):
    file = serializers.SerializerMethodField(source='file')

    def get_file(self, media):
        if media.file:
            # Nếu đường dẫn bắt đầu bằng http ( đã đẩy lên cloud )
            if media.file.name.startswith('http'):
                return media.file.name

            # Nếu đường dẫn ảnh lưu cục bộ
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri('/static/%s' % media.file.name)

    class Meta:
        model = Media
        fields = ['id', 'media_type', 'file', 'created_date', 'active', 'post']


class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = '__all__'


class ActionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Action
        fields = ['id', 'type', 'created_date', 'updated_date', 'active']
