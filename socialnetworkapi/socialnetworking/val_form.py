from django import forms
from .models import Media


class MediaAdminForm(forms.ModelForm):
    class Meta:
        model = Media
        fields = '__all__'

    def clean_file(self):
        file = self.cleaned_data.get('file')
        media_type = self.cleaned_data.get('media_type')

        if media_type == 'image' and not file.name.lower().endswith(('jpg', 'jpeg', 'png', 'gif')):
            raise forms.ValidationError("File được tải lên không phải là hình ảnh hợp lệ.")
        elif media_type == 'video' and not file.name.lower().endswith(('mp4', 'avi', 'mov', 'mkv')):
            raise forms.ValidationError("File được tải lên không phải là video hợp lệ.")

        return file
