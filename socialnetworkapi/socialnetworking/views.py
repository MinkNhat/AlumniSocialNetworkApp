import json
from datetime import timedelta

from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.http import JsonResponse
from django.utils.timezone import now
from rest_framework import viewsets, generics, status, permissions, parsers
from rest_framework.exceptions import ValidationError
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import IsAuthenticated

from socialnetworkapi import settings
from socialnetworking.models import Tag, Post, Media, User, Comment, Action, EventPost, SurveyPost, SurveyResponse
from socialnetworking import serializers, paginators, perms
from rest_framework.decorators import action
from rest_framework.response import Response
import mimetypes
from oauth2_provider.views import TokenView

from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from socialnetworkapi.firebase_config import db
import datetime

from socialnetworking.serializers import EventPostSerializer, SurveyPostSerializer, SurveyResponseSerializer


class TagViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Tag.objects.filter(active=True).all()
    serializer_class = serializers.TagSerializer


class PostViewSet(viewsets.ViewSet, generics.ListAPIView, generics.RetrieveAPIView, generics.CreateAPIView, generics.UpdateAPIView, generics.DestroyAPIView):
    # select_related dùng cho 1-1 hoặc 1-n chiều thuận
    # prefetch_related dùng cho n-n hoặc 1-n chiều ngược
    queryset = Post.objects.select_related('user').filter(active=True).order_by('-created_date')
    pagination_class = paginators.ItemPaginator

    def get_queryset(self):
        query = self.queryset
        kw = self.request.query_params.get('q')
        if kw:
            query = query.filter(caption__icontains=kw)
        if self.action == 'retrieve':
            query = query.prefetch_related('tags')
        return query

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return serializers.PostDetailsSerializer
        return serializers.PostSerializer

    def get_permissions(self):
        if self.action in ['get_comments', 'get_media', 'get_tags', 'get_action', 'create'] and self.request.method in ['POST']:
            return [permissions.IsAuthenticated()]
        if self.action in ['update', 'partial_update']:
            return [perms.OwnerPerms()]
        if self.action in ['destroy']:
            return [perms.AdminPerms() if self.request.user.role == "ADMIN" else perms.OwnerPerms()]
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
            comments = self.get_object().comment_set.select_related('user').filter(active=True).order_by('-created_date')
            paginator = paginators.ItemPaginator()
            paginated_comments = paginator.paginate_queryset(comments, request)
            return paginator.get_paginated_response(serializers.CommentSerializer(paginated_comments, many=True).data)

    @action(methods=['get', 'post'], url_path='action', detail=True)
    def get_action(self, request, pk):
        if request.method.__eq__('POST'):
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
        else:
            actions = self.get_object().action_set.select_related('user').filter(active=True)
            return Response(serializers.ActionSerializer(actions, many=True).data)

    @action(methods=['post'], url_path='tags', detail=True)
    def assign_tags(self, request, pk):
        post = self.get_object()
        tags = request.data['tags']
        for t in tags:
            tag, _ = Tag.objects.get_or_create(name=t)
            post.tags.add(tag)
        post.save()


class UserViewSet(viewsets.ViewSet, generics.CreateAPIView, generics.ListAPIView):
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

    @action(methods=['get'], url_path='user-posts', detail=True)
    def get_user_posts(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        posts = Post.objects.filter(user=user, active=True)
        return Response(serializers.PostSerializer(posts, many=True, context={'request': request}).data)

    # Khi tạo user mới là alumni, xác thực thông tin qua student_id
    # sử dụng perform create do sinh viên tự tạo, kh tạo qua trang admin
    # def perform_create(self, serializer):
    #     role = self.request.data.get('role')
    #     # print(role)
    #     if role.__eq__('ALUMNI'):
    #         student_id = self.request.data.get('student_id')
    #
    #         if not self.is_valid_student(student_id):
    #             raise ValidationError({"error": "Invalid student ID."})
    #         serializer.save(student_id=student_id, is_active=True, is_verify=False)
    #     else:
    #         serializer.save(is_active=True, is_verify=False)
    #
    # def is_valid_student(self, student_id):
    #     valid_student_ids = ["SV001", "SV002", "SV003"]
    #     return student_id in valid_student_ids and not User.objects.filter(student_id=student_id).exists()


class CommentViewSet(viewsets.ViewSet, generics.DestroyAPIView, generics.UpdateAPIView):
    queryset = Comment.objects.filter(active=True)
    serializer_class = serializers.CommentSerializer

    def get_permissions(self):
        if self.action in ['update', 'partial_update']:
            return [perms.OwnerPerms()]
        if self.action in ['destroy']:
            return [perms.CommentPerms()]
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

        if user is None:
            return JsonResponse({
                "error": "invalid_grant",
                "error_description": "Tên đăng nhập hoặc mật khẩu không chính xác!"
            }, status=400)

        if user.role == 'TEACHER':
            if not user.password_changed and now() > user.password_change_time + timedelta(hours=1):
                # user.is_active = False
                user.save()
                return JsonResponse({
                    "error": "invalid_grant",
                    "error_description": "Tài khoản của bạn đang bị khoá, vui lòng liên hệ quản trị viên!"
                }, status=400)
        if user.role == 'ALUMNI':
            if not user.is_verify:
                return JsonResponse({
                    "error": "invalid_grant",
                    "error_description": "Tài khoản của bạn đang được xác thực, vui lòng liên hệ quản trị viên!"
                }, status=400)

        return super().post(request, *args, **kwargs)


class MessageViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]  # Chỉ cho phép user đã đăng nhập

    @action(detail=False, methods=["post"])
    def send_message(self, request):
        sender_id = request.user.id
        receiver_id = request.data.get("receiver_id")
        content = request.data.get("content")

        if not receiver_id or not content:
            return Response({"error": "Missing required fields"}, status=400)

        message_data = {
            "sender_id": sender_id,
            "receiver_id": receiver_id,
            "content": content,
            "timestamp": datetime.datetime.utcnow()
        }

        db.collection("messages").add(message_data)  # Lưu tin nhắn vào Firestore
        return Response({"message": "Message sent successfully!"}, status=201)

    @action(detail=False, methods=["get"])
    def get_messages(self, request):
        sender_id = request.user.id
        receiver_id = request.query_params.get("receiver_id")

        if not receiver_id:
            return Response({"error": "Missing receiver_id"}, status=400)

        try:
            messages_query = (
                db.collection("messages")
                .where("sender_id", "==", receiver_id)
                .order_by("timestamp")
                .stream()
            )

            messages_data = []
            for msg in messages_query:
                msg_data = msg.to_dict()

                messages_data.append({
                    "sender_id": msg_data.get("sender_id"),
                    "receiver_id": msg_data.get("receiver_id"),
                    "content": msg_data.get("content"),
                    "timestamp": msg_data.get("timestamp")
                })

            return Response(messages_data, status=200)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

    @action(detail=False, methods=["get"], url_path="list")
    def list_chats(self, request):
        user_id = request.user.id

        # Lấy tất cả tin nhắn từ Firestore
        messages = db.collection("messages").order_by("timestamp").stream()

        chat_map = {}

        for msg in messages:
            msg_data = msg.to_dict()
            sender_id = msg_data.get("sender_id")
            receiver_id = msg_data.get("receiver_id")

            # Kiểm tra nếu user là một trong hai người trong cuộc trò chuyện
            if user_id in [sender_id, receiver_id]:
                chat_id = "-".join(sorted([str(sender_id), str(receiver_id)]))
                if chat_id not in chat_map or msg_data["timestamp"] > chat_map[chat_id]["timestamp"]:
                    chat_map[chat_id] = {
                        "chat_partner_id": receiver_id if sender_id == user_id else sender_id,
                        "last_message": msg_data["content"],
                        "timestamp": msg_data["timestamp"],
                    }

        return Response(list(chat_map.values()), status=200)


class EventPostViewSet(viewsets.ViewSet, generics.CreateAPIView, generics.ListAPIView):
    queryset = EventPost.objects.select_related('user').filter(active=True).order_by('-created_date')
    serializer_class = EventPostSerializer
    pagination_class = paginators.ItemPaginator
    # permission_classes = [perms.AdminPerms]

    def get_permissions(self):
        if self.action in ['create'] and self.request.method in ['POST']:
            return [perms.AdminPerms()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        event = serializer.save(user=self.request.user)
        attendees = event.attendees.all()
        recipients = attendees.values_list('email', flat=True)

        if recipients:
            location = date = 'Đang cập nhật...'
            subject = f"Lời mời tham gia sự kiện: {event.name}"
            message = f"Xin chào,\n\nBạn được mời tham gia sự kiện: {event.name}\n\n" \
                      f"Thời gian: {event.date.strftime('%d-%m-%Y') if event.date else date}\n" \
                      f"Địa điểm: {event.location if event.location else location}\n\n" \
                      f"Trân trọng,\nBan tổ chức"
            send_mail(subject, message, settings.EMAIL_HOST_USER, list(recipients), fail_silently=False)


class SurveyPostViewSet(viewsets.ViewSet, generics.CreateAPIView, generics.ListAPIView):
    queryset = SurveyPost.objects.select_related('user').filter(active=True).order_by('-created_date')
    serializer_class = SurveyPostSerializer
    pagination_class = paginators.ItemPaginator

    def get_permissions(self):
        if self.action in ['create'] and self.request.method in ['POST']:
            return [perms.AdminPerms()]
        if self.action in ['responses'] and self.request.method in ['POST']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['get', 'post'], url_path='responses')
    def responses(self, request, pk):
        if request.method.__eq__('POST'):
            choice = request.data.get('choice')

            if SurveyResponse.objects.filter(user=request.user, survey=self.get_object()):
                return JsonResponse({
                    "error": "invalid_grant",
                    "error_description": "Bạn đã phản hồi cho bài khảo sát này, không thể thay đổi lựa chọn"
                }, status=400)

            response = SurveyResponse.objects.create(choice=choice, user=request.user, survey=self.get_object())
            return Response(serializers.SurveyResponseSerializer(response).data)
        else:
            responses = self.get_object().responses.select_related('user').filter(active=True)
            return Response(serializers.SurveyResponseSerializer(responses, many=True).data)

