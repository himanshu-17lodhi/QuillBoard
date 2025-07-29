from .base import *

DEBUG = True
ALLOWED_HOSTS = ['localhost', '127.0.0.1']

# Use default SQLite DB unless overridden
DATABASES = {
    'default': {
        'ENGINE': config('DB_ENGINE', default='django.db.backends.sqlite3'),
        'NAME': config('DB_NAME', default=os.path.join(BASE_DIR, 'db.sqlite3')),
    }
}

EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Use local storage for static/media files in development
if "DEFAULT_FILE_STORAGE" in globals():
    del DEFAULT_FILE_STORAGE

# Log to local file
LOGGING['handlers']['file']['filename'] = os.path.join(BASE_DIR, 'logs/debug.log')