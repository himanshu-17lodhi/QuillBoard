"""
Settings module initialization.
Import the appropriate settings based on the environment.
"""
import os
from .development import *  # noqa

if os.environ.get('DJANGO_ENV') == 'production':
    from .production import *  
elif os.environ.get('DJANGO_ENV') == 'development':
    from .development import * 