from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from .models import User, EmailVerification

@receiver(post_save, sender=User)
def create_user_verification(sender, instance, created, **kwargs):
    """
    Create email verification token when a new user is created
    """
    if created and not instance.is_verified:
        verification = EmailVerification.objects.create(
            user=instance,
            type='verification'
        )
        
        # Send verification email
        context = {
            'user': instance,
            'verification_url': f"{settings.SITE_URL}/verify-email/{verification.token}/"
        }
        
        html_message = render_to_string('auth/email/verify_email.html', context)
        plain_message = render_to_string('auth/email/verify_email.txt', context)
        
        send_mail(
            subject="Verify your email address",
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[instance.email],
            html_message=html_message
        )