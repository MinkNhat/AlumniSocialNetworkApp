"""
Django settings for socialnetworkapi project.

Generated by 'django-admin startproject' using Django 5.1.4.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.1/ref/settings/
"""

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/
import os
from pathlib import Path

import dj_database_url
import pymysql
import cloudinary
import ssl
import certifi

# setup cloudinary
cloudinary.config(
    cloud_name="dbmwgavqz",
    api_key="747824214758252",
    api_secret="IjgCUhqhoxQhoiG1dcq-vWJk5wA",
    secure=True
)

# pymsql setting
pymysql.install_as_MySQLdb()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# change auth user default
AUTH_USER_MODEL = 'socialnetworking.User'

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-!e8g^ff2j3g(2kgbjic)tk!iwzs4uu%4m!4(^)otr_yg)06vhx'

# SECURITY WARNING: don't run with debug turned on in production!
# DEBUG = True
DEBUG = False

# media root
MEDIA_ROOT = '%s/socialnetworking/static/' % BASE_DIR

CKEDITOR_UPLOAD_PATH = "images/ckeditor/"

ALLOWED_HOSTS = [
    # '192.168.2.6',
    # '172.20.10.3',
    # '172.16.3.192',
    # '172.16.40.10',
    # '172.16.139.160',
    # '192.168.1.91',
    '*'
]


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'socialnetworkapi.socialnetworking.apps.SocialnetworkingConfig',
    'ckeditor',
    'ckeditor_uploader',
    'rest_framework',
    'drf_yasg',
    'debug_toolbar',
    'oauth2_provider',
    'channels'
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'debug_toolbar.middleware.DebugToolbarMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'socialnetworkapi.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# WSGI_APPLICATION = 'socialnetworkapi.wsgi.application'
ASGI_APPLICATION = "socialnetworkapi.socialnetworkapi.asgi.application"

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels.layers.InMemoryChannelLayer",
    },
}

# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases

# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.mysql',
#         'NAME': 'socialnetworkdb',
#         'USER': 'root',
#         'PASSWORD': 'Admin@123',
#         'HOST': ''
#     }
# }

DATABASES = {
    'default': dj_database_url.config(conn_max_age=600, ssl_require=False)
}


# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'oauth2_provider.contrib.rest_framework.OAuth2Authentication',
    )
}

# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

# TIME_ZONE = 'UTC'
TIME_ZONE = 'Asia/Ho_Chi_Minh'

USE_I18N = True

USE_TZ = False


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/

# STATIC_URL = 'static/'

# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

INTERNAL_IPS = [
    '127.0.0.1',
]

OAUTH2_PROVIDER = {
    'OAUTH2_BACKEND_CLASS': 'oauth2_provider.oauth2_backends.JSONOAuthLibCore'
}

# Mail setting
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'aluminsocialnetwork@gmail.com'
EMAIL_HOST_PASSWORD = 'sopg qfme htmp zanp'
EMAIL_SSL_CONTEXT = ssl.create_default_context(cafile=certifi.where())

DATA_UPLOAD_MAX_MEMORY_SIZE = 104857600  # 100MB
