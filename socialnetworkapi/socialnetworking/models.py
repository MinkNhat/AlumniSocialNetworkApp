from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    pass


class BaseModel(models.Model):
    active = models.BooleanField(default=True)
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Post(BaseModel):
    title = models.CharField(max_length=255, null=False)
    content = models.TextField(null=True)
    user = models.ForeignKey(User, on_delete=models.PROTECT)

    def __str__(self):
        return self.title




