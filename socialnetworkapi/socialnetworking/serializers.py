from rest_framework import serializers
from .models import Tag, Post, Media, Comment, User, Action, SurveyPost, EventPost, SurveyResponse


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
        fields = ['id', 'username', 'password', 'last_name', 'first_name', 'avatar', 'role', 'email', 'student_id',
                  'gender', 'birth', 'introduce', 'cover_image']
        extra_kwargs = {
            'password': {
                'write_only': True
            }
        }


# class UserBaseInfoSerializer(serializers.ModelSerializer):
#     def to_representation(self, instance):
#         data = super().to_representation(instance)
#         data['avatar'] = instance.avatar.url if instance.avatar else ''
#         return data
#
#     class Meta:
#         model = User
#         fields = ['id', 'username', 'last_name', 'first_name', 'avatar', 'role']


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']


class MediaSerializer(serializers.ModelSerializer):
    # file = serializers.SerializerMethodField(source='file')
    #
    # def get_file(self, media):
    #     if media.file:
    #         # Nếu đường dẫn bắt đầu bằng http ( đã đẩy lên cloud )
    #         if media.file.name.startswith('http'):
    #             return media.file.name
    #
    #         # Nếu đường dẫn ảnh lưu cục bộ
    #         request = self.context.get('request')
    #         if request:
    #             return request.build_absolute_uri('/static/%s' % media.file.name)
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['file'] = instance.file.url if instance.file else ''
        return data

    class Meta:
        model = Media
        # fields = ['id', 'media_type', 'file', 'created_date', 'active', 'post']
        fields = ['id', 'media_type', 'file', 'created_date', 'active']


class PostSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Post
        fields = ['id', 'caption', 'created_date', 'updated_date', 'active', 'user']


class PostDetailsSerializer(PostSerializer):
    tags = TagSerializer(many=True)
    # user = UserSerializer()

    def create(self, validated_data):
        user = self.context['request'].user
        return Post.objects.create(user=user, **validated_data)

    class Meta:
        model = PostSerializer.Meta.model
        # fields = PostSerializer.Meta.fields + ['user', 'tags']
        fields = PostSerializer.Meta.fields + ['tags']


class SurveyPostSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = SurveyPost
        fields = '__all__'


class SurveyResponseSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = SurveyResponse
        fields = '__all__'


class EventPostSerializer(serializers.ModelSerializer):
    # lấy danh sách user_id
    attendees = serializers.PrimaryKeyRelatedField(many=True, queryset=User.objects.all())
    user = UserSerializer(read_only=True)

    class Meta:
        model = EventPost
        fields = '__all__'


class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'content', 'created_date', 'updated_date', 'active', 'user', 'post']


class ActionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Action
        fields = ['id', 'type', 'created_date', 'updated_date', 'active', 'user', 'post']
