# workspaces/signals.py

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from .models import WorkspaceMember

@receiver(post_save, sender=WorkspaceMember)
def send_invite_email(sender, instance, created, **kwargs):
    if created:
        subject = f"You're invited to join the workspace: {instance.workspace.name}"
        message = f"Hi {instance.user.get_full_name() or instance.user.username},\n\n" \
                  f"You've been added to the workspace '{instance.workspace.name}' as a {instance.role}.\n" \
                  f"Login to QuillBoard to start collaborating.\n\n" \
                  f"- QuillBoard Team"

        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [instance.user.email],
            fail_silently=False,
        )

@receiver(post_save, sender=WorkspaceMember)
def send_workspace_invite_email(sender, instance, created, **kwargs):
    if created and instance.user.email:
        subject = f"You've been added to workspace: {instance.workspace.name}"
        message = f"""
        Hi {instance.user.get_full_name() or instance.user.username},

        You've been added to the workspace '{instance.workspace.name}' as a {instance.role}.
        Visit QuillBoard to start collaborating!

        - The QuillBoard Team
        """
        send_mail(subject, message, 'no-reply@quillboard.com', [instance.user.email])