from rest_framework import permissions


class OwnerPerms(permissions.IsAuthenticated):
    def has_object_permission(self, request, view, instance):
        return super().has_permission(request, view) and request.user == instance.user


class MediaPerms(permissions.IsAuthenticated):
    def has_object_permission(self, request, view, media):
        return super().has_permission(request, view) and request.user == media.post.user


class CommentPerms(permissions.IsAuthenticated):
    def has_object_permission(self, request, view, comment):
        return super().has_permission(request, view) and (request.user == comment.user or request.user == comment.post.user)


class AdminPerms(permissions.IsAuthenticated):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role.__eq__("ADMIN")

    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)
