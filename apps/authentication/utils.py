import jwt
from datetime import datetime, timedelta
from django.conf import settings
from .models import EmailVerification

def generate_verification_token():
    """Generate a unique verification token"""
    return EmailVerification.objects.make_random_token()

def generate_jwt_token(user):
    """Generate JWT token for user"""
    token_expiry = datetime.utcnow() + timedelta(days=1)
    
    token = jwt.encode({
        'user_id': str(user.id),
        'email': user.email,
        'exp': token_expiry
    }, settings.SECRET_KEY, algorithm='HS256')
    
    return token

def verify_jwt_token(token):
    """Verify JWT token"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def get_client_ip(request):
    """Get client IP address"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip