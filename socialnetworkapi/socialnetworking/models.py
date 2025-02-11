from django.core.mail import send_mail
from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from cloudinary.models import CloudinaryField
from ckeditor.fields import RichTextField
from datetime import timedelta
from django.utils.timezone import now


class BaseModel(models.Model):
    active = models.BooleanField(default=True)
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class CustomUserManager(BaseUserManager):
    def create_user(self, username, email=None, password=None, **extra_fields):
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email=None, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'ADMIN')
        return self.create_user(username, email, password, **extra_fields)


class User(AbstractUser):
    ROLE_CHOICES = [
        ('ALUMNI', 'Alumni'),
        ('TEACHER', 'Teacher'),
        ('ADMIN', 'Admin'),
    ]

    GENDER_CHOICES = [
        (0, 'Male'),
        (1, 'Female'),
        (2, 'Other'),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='ALUMNI')
    email = models.EmailField(unique=True)
    avatar = CloudinaryField(null=False)
    cover_image = CloudinaryField(null=True, blank=True)
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, null=True, blank=True)
    birth = models.DateField(null=True, blank=True)
    introduce = models.TextField(null=True, blank=True)

    student_id = models.CharField(max_length=20, null=True, blank=True, unique=True)
    is_verify = models.BooleanField(default=False)
    updated_date = models.DateTimeField(auto_now=True)
    password_changed = models.BooleanField(default=False)
    password_change_time = models.DateTimeField(null=True, blank=True)

    objects = CustomUserManager()

    # ưu điểm so với perfomrm_create trong views: sử dụng được mọi nơi ( api hoặc amdin site )
    def save(self, *args, **kwargs):
        if self.role == 'ADMIN':
            self.is_staff = True
            self.is_superuser = True
            self.is_verify = True
        if self.pk is None and self.role == 'TEACHER':  # pk = None khi tạo user mới
            self.is_verify = True
            self.set_password('Ou@12345')
            self.password_change_time = now()
            send_mail(
                subject='Welcome to Alumni Network',
                message=f'Xin chào {self.username},\n\n'
                        f'Tài khoản của bạn đã được cấp bởi quản trị viên, thông tin tài khoản \n'
                        f'Username: {self.username}\n'
                        f'Password: Ou@12345\n\n'
                        f'Vui lòng đổi mật khẩu khi đăng nhập trong lần đầu tiên\n'
                        f'Lưu ý: Tài khoản của bạn sẽ bị khoá sau 24h nếu không đổi mật khẩu\n',
                from_email='admin@alumninetwork.com',
                recipient_list=[self.email],
                fail_silently=False,
            )
        if self.pk is None and self.role == "ALUMNI":
            pass
            # if not self.student_id:
            #     raise ValueError("Student ID is required")
            # valid_student_ids = ["SV001", "SV002", "SV003"]
            # if self.student_id in valid_student_ids and not User.objects.filter(student_id=self.student_id).exists():
            #     raise ValueError("Invalid or already used Student ID")

        super().save(*args, **kwargs)

    def __str__(self):
        return self.username


class Follows(BaseModel):
    following = models.ForeignKey(User, on_delete=models.CASCADE, related_name='followers')
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name='following')

    class Meta:
        unique_together = ('following', 'follower')


class Tag(BaseModel):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name


class BasePost(BaseModel):
    caption = models.TextField(null=False, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta:
        abstract = True

    def __str__(self):
        return self.caption


class Post(BasePost):
    tags = models.ManyToManyField(Tag)

    def __str__(self):
        return self.caption

    def get_tags(self):
        return ", ".join([tag.name for tag in self.tags.all()])
    get_tags.short_description = "Tags"  # Đổi title hiển thị trong trang admin


class SurveyPost(BasePost):
    choices = models.JSONField()

    def __str__(self):
        return self.caption


class SurveyResponse(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    survey = models.ForeignKey(SurveyPost, on_delete=models.CASCADE, related_name='responses')
    choice = models.CharField(max_length=255)

    class Meta:
        unique_together = ('user', 'survey')

    def __str__(self):
        return self.choice


class EventPost(BasePost):
    name = models.CharField(null=False, max_length=100)
    date = models.DateTimeField(null=True)
    location = models.CharField(max_length=255, null=True)
    attendees = models.ManyToManyField("User", related_name="attendees", blank=True)

    def __str__(self):
        return self.name


class Media(BaseModel):
    MEDIA_TYPE_CHOICES = [
        ('image', 'Image'),
        ('video', 'Video'),
    ]

    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    media_type = models.CharField(max_length=10, choices=MEDIA_TYPE_CHOICES)
    file = CloudinaryField(resource_type='auto', null=False)

    def __str__(self):
        return str(self.file)


class Interaction(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE)

    class Meta:
        abstract = True


class Comment(Interaction):
    content = models.CharField(max_length=255, null=False)

    def __str__(self):
        return self.content


class Action(Interaction):
    LIKE, HAHA, HEART, SAD = range(4)
    ACTIONS = [
        (LIKE, 'like'),
        (HAHA, 'haha'),
        (HEART, 'heart'),
        (SAD, 'sad')
    ]
    type = models.SmallIntegerField(choices=ACTIONS, default=LIKE)

    def __str__(self):
        k, v = self.ACTIONS[self.type]
        return v




