from datetime import timedelta

from django.contrib import admin
from django.core.mail import send_mail
from django.db.models import Count
from django.db.models.functions import TruncYear, TruncMonth, ExtractYear, ExtractMonth
from django.template.response import TemplateResponse
from django.utils.timezone import now, localtime

from socialnetworkapi.socialnetworking.models import Post, Tag, Media, Comment, User, Action, EventPost
from socialnetworkapi.socialnetworking.val_form import MediaAdminForm
from django.utils.html import mark_safe
from django.urls import path
from django.contrib.auth.models import Group, Permission
from django.contrib.auth.admin import GroupAdmin, UserAdmin
from django.contrib.auth.forms import UserCreationForm, UserChangeForm


class MySocialNetworkAdmin(admin.AdminSite):
    site_header = 'Alumni Social Network'

    def get_urls(self):
        return [path('stats/users', self.stats_users), path('stats/posts', self.stats_posts)] + super().get_urls()

    def stats_users(self, request):
        stats = (
            User.objects
            .annotate(year=TruncYear('date_joined'), month=TruncMonth('date_joined'))
            .values('year', 'month')
            .annotate(count=Count('id'))
            .order_by('year', 'month')
        )

        stats_list = [
            {
                'year_month': f"{s['year'].year}-{s['month'].month:02d}",
                'count': s['count']
            }
            for s in stats
        ]

        return TemplateResponse(request, 'admin/stats-users.html', {'stats': stats_list})

    def stats_posts(self, request):
        stats = (
            Post.objects
            .annotate(year=TruncYear('created_date'), month=TruncMonth('created_date'))
            .values('year', 'month')
            .annotate(count=Count('id'))
            .order_by('year', 'month')
        )

        stats_list = [
            {
                'year_month': f"{s['year'].year}-{s['month'].month:02d}",
                'count': s['count']
            }
            for s in stats
        ]

        return TemplateResponse(request, 'admin/stats-posts.html', {'stats': stats_list})


class PostAdmin(admin.ModelAdmin):
    list_display = ['id', 'caption', 'user', 'get_tags', 'created_date']
    search_fields = ['id', 'caption']
    list_filter = ['caption', 'created_date']

    readonly_fields = ['media_preview']

    def media_preview(self, obj):
        media_html = ""
        for media in obj.media_set.all():
            if media.media_type == 'image':
                media_html += f"<img src='{media.file.url}' width='160' style='margin: 5px; vertical-align: baseline;' />"
            elif media.media_type == 'video':
                media_html += f"<video width='160' controls style='margin: 5px;'>"
                media_html += f"<source src='{media.file.url}' type='video/mp4'>"
                media_html += "</video>"
        return mark_safe(media_html) if media_html else "No Media Available"


class MediaAdmin(admin.ModelAdmin):
    form = MediaAdminForm
    list_display = ['id', 'post', 'media_type', 'file', 'created_date']
    readonly_fields = ['media_preview']

    def media_preview(self, media):
        print(media)
        media_html = ""
        if media.media_type == 'image':
            media_html += f"<img src='{media.file.url}' width='160' />"
        elif media.media_type == 'video':
            media_html += f"<video width='160' controls >"
            media_html += f"<source src='{media.file.url}' type='video/mp4'>"
            media_html += "</video>"
        return mark_safe(media_html) if media_html else "No Media Available"

    class Media:
        css = {
            'all': ('/static/css/style.css',)
        }


class CommentAdmin(admin.ModelAdmin):
    list_display = ['id', 'content', 'post', 'created_date']


class CustomUserAdmin(UserAdmin):
    add_form = UserCreationForm
    form = UserChangeForm
    model = User
    list_display = ('id', 'username', 'email', 'role', 'date_joined', 'is_active', 'student_id', 'is_verify')
    list_filter = ['role', 'is_verify']
    readonly_fields = ['reset_expiration_action']
    actions = ['approve_selected_users']

    def approve_selected_users(self, request, queryset):
        queryset.update(is_active=True, is_verify=True)
        for user in queryset:
            send_mail(
                subject='Alumni Social Network Here we go!!!!!!!',
                message=f'Xin chào {user.username},\n\n'
                        f'Tài khoản của bạn đã được quản trị viên xác nhận, bạn có thể đăng nhập ngay bây giờ.\n'
                        f'Chúc bạn có trải nghiệm vui vẻ khi sử dụng ứng dụng!\n',
                from_email='aluminsocialnetwork@gmail.com',
                recipient_list=[user.email],
                fail_silently=False,
            )
        self.message_user(request, "Selected users have been approved.")
    approve_selected_users.short_description = "Approve selected users"

    def reset_expiration_action(self, obj):
        if obj.role == 'TEACHER':
            expiration_time = ""
            if obj.password_change_time and not obj.password_changed:
                expiration = localtime(obj.password_change_time + timedelta(hours=1))
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
        ('Thông tin cá nhân', {'fields': ('email', 'role', 'first_name', 'last_name', 'avatar')}),
        ('Quyền', {'fields': ('is_verify', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Ngày tham gia', {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'role', 'email', 'password1', 'password2'),
        }),
    )


class EventPostAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'date', 'location', 'created_date', 'user']


admin_site = MySocialNetworkAdmin(name='alumniSocialNetwork')

admin_site.register(Post, PostAdmin)
admin_site.register(Tag)
admin_site.register(Action)
admin_site.register(Comment, CommentAdmin)
admin_site.register(User, CustomUserAdmin)
admin_site.register(Media, MediaAdmin)
admin_site.register(Group, GroupAdmin)
admin_site.register(EventPost, EventPostAdmin)
admin_site.register(Permission)
