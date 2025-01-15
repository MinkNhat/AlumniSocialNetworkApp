from django.db import models
from django.contrib.auth.models import AbstractUser
from cloudinary.models import CloudinaryField
from ckeditor.fields import RichTextField


GENDER_CHOICES = [
    (0, 'Male'),
    (1, 'Female'),
    (2, 'Other'),
]


class BaseModel(models.Model):
    active = models.BooleanField(default=True)
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class User(AbstractUser):
    avatar = CloudinaryField(null=True)

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


class Post(BaseModel):
    caption = models.TextField()
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    tags = models.ManyToManyField(Tag)

    def __str__(self):
        return self.caption

    def get_tags(self):
        return ", ".join([tag.name for tag in self.tags.all()])

    get_tags.short_description = "Tags"  # Đổi title hiển thị trong trang admin


class Media(BaseModel):
    MEDIA_TYPE_CHOICES = [
        ('image', 'Image'),
        ('video', 'Video'),
    ]

    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    media_type = models.CharField(max_length=10, choices=MEDIA_TYPE_CHOICES)
    file = models.FileField(upload_to='posts/media/%Y/%m/')

    def __str__(self):
        return self.file.name


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




