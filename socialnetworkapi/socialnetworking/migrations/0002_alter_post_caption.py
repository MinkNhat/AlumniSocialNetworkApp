# Generated by Django 5.1.4 on 2025-01-07 16:42

import ckeditor.fields
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('socialnetworking', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='post',
            name='caption',
            field=ckeditor.fields.RichTextField(),
        ),
    ]
