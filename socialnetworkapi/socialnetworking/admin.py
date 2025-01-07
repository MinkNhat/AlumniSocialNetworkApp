from django.contrib import admin
from socialnetworking.models import Post, Tag, Media
from socialnetworking.val_form import MediaAdminForm
from django.utils.html import mark_safe


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


admin.site.register(Post, PostAdmin)
admin.site.register(Tag)
admin.site.register(Media, MediaAdmin)




