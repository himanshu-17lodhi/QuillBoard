from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Workspace, WorkspaceMember, WorkspaceInvite
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings

@receiver(post_save, sender=WorkspaceInvite)
def send_workspace_invite(sender, instance, created, **kwargs):
    if created and instance.status == 'pending':
        context = {
            'invite': instance,
            'workspace': instance.workspace,
            'invited_by': instance.invited_by,
        }
        
        html_message = render_to_string('workspaces/email/invite.html', context)
        text_message = render_to_string('workspaces/email/invite.txt', context)
        
        send_mail(
            subject=f'Invitation to join {instance.workspace.name}',
            message=text_message,
            html_message=html_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[instance.email],
            fail_silently=False,
        )

@receiver(post_delete, sender=WorkspaceMember)
def handle_member_removal(sender, instance, **kwargs):
    # If the owner is removed, transfer ownership to another admin
    if instance.user == instance.workspace.owner:
        new_owner = WorkspaceMember.objects.filter(
            workspace=instance.workspace,
            role='admin'
        ).exclude(user=instance.user).first()
        
        if new_owner:
            instance.workspace.owner = new_owner.user
            instance.workspace.save()