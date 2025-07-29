"""
Settings module initialization.
Import the appropriate settings based on the environment.
"""
import os
from .testing import *  # noqa

if os.environ.get('DJANGO_ENV') == 'production':
    from .production import *  # noqa
elif os.environ.get('DJANGO_ENV') == 'testing':
    from .testing import *  # noqa