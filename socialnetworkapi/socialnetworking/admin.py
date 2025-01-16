from datetime import timedelta

from django.contrib import admin
from django.db.models import Count
from django.template.response import TemplateResponse
from django.utils.timezone import now, localtime

from socialnetworking.models import Post, Tag, Media, Comment, User, Action
from socialnetworking.val_form import MediaAdminForm
from django.utils.html import mark_safe
from django.urls import path
from django.contrib.auth.models import Group, Permission
from django.contrib.auth.admin import GroupAdmin, UserAdmin
from django.contrib.auth.forms import UserCreationForm, UserChangeForm


class MySocialNetworkAdmin(admin.AdminSite):
    site_header = 'Alumni Social Network'

    def get_urls(self):
        return [path('stats/', self.stats)] + super().get_urls()

    def stats(self, request):
        stats = Tag.objects.annotate(count=Count('post__id')).values('id', 'name', 'count')
        return TemplateResponse(request, 'admin/stats.html', {
            'stats': stats
        })


class PostAdmin(admin.ModelAdmin):
    list_display = ['id', 'caption', 'user', 'get_tags', 'created_date']
    search_fields = ['id', 'caption']
    list_filter = ['caption', 'created_date']

    readonly_fields = ['media_preview']

    def media_preview(self, obj):
        media_html = ""
        for media in obj.media_set.all():
            if media.media_type == 'image':
                media_html += f"<img src='/static/{media.file.url}' width='160' style='margin: 5px; vertical-align: baseline;' />"
            elif media.media_type == 'video':
                media_html += f"<video width='160' controls style='margin: 5px;'>"
                media_html += f"<source src='/static/{media.file.url}' type='video/mp4'>"
                media_html += "</video>"
        return mark_safe(media_html) if media_html else "No Media Available"


class MediaAdmin(admin.ModelAdmin):
    form = MediaAdminForm
    list_display = ['id', 'post', 'media_type', 'file', 'created_date']
    readonly_fields = ['media_preview']

    def media_preview(self, media):
        media_html = ""
        if media.media_type == 'image':
            media_html += f"<img src='/static/{media.file.url}' width='160' />"
        elif media.media_type == 'video':
            media_html += f"<video width='160' controls >"
            media_html += f"<source src='/static/{media.file.url}' type='video/mp4'>"
            media_html += "</video>"
        return mark_safe(media_html) if media_html else "No Media Available"

    class Media:
        css = {
            'all': ('/static/css/style.css',)
        }


class CustomUserAdmin(UserAdmin):
    add_form = UserCreationForm
    form = UserChangeForm
    model = User
    list_display = ('username', 'email', 'role', 'created_date')
    readonly_fields = ['reset_expiration_action']

    def reset_expiration_action(self, obj):
        if obj.role == 'TEACHER':
            expiration_time = ""
            if obj.password_change_time:
                expiration = localtime(obj.password_change_time + timedelta(hours=24))
                expiration_time = expiration.strftime("%d-%m-%Y %H:%M:%S")

            html = f"""
                        <div>
                            <div><strong>Expiration Time:</strong> {expiration_time}</div><br>
                            <a class="button" href="?reset_expiration_time={obj.id}" style="margin-top: 5px;">Reset Expiration Time</a>
                        </div>
                    """
            return mark_safe(html)
        return ""
    reset_expiration_action.short_description = "Reset Expiration Time"

    def save_model(self, request, obj, form, change):
        reset_expiration_time = request.GET.get('reset_expiration_time')
        if reset_expiration_time and str(obj.id) == reset_expiration_time:
            obj.password_change_time = now()
            obj.password_changed = False
            self.message_user(request, "Expiration time has been reset.")
        super().save_model(request, obj, form, change)

    fieldsets = (
        (None, {'fields': ('username', 'password', 'reset_expiration_action')}),
        ('Thông tin cá nhân', {'fields': ('email', 'role')}),
        ('Quyền hạn', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Ngày quan trọng', {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'role'),
        }),
    )


admin_site = MySocialNetworkAdmin(name='alumniSocialNetwork')

admin_site.register(Post, PostAdmin)
admin_site.register(Tag)
admin_site.register(Action)
admin_site.register(Comment)
admin_site.register(User, CustomUserAdmin)
admin_site.register(Media, MediaAdmin)
admin_site.register(Group, GroupAdmin)
admin_site.register(Permission)


