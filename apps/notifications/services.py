from django.conf import settings
from django.template import Template, Context
from django.core.mail import send_mail
from django.utils import timezone
from .models import (
    NotificationTemplate,
    Notification,
    NotificationPreference,
    EmailNotification
)
from django.contrib.contenttypes.models import ContentType

class NotificationService:
    @staticmethod
    def create_notification(
        recipient,
        notification_type,
        title,
        message,
        related_object,
        data=None
    ):
        """Create a new notification"""
        try:
            # Get user's notification preference
            preference = NotificationPreference.objects.get(
                user=recipient,
                notification_type=notification_type
            )
            
            if preference.channel == 'none':
                return None
            
            # Get template if exists
            template = NotificationTemplate.objects.filter(
                type__in=['in_app', 'both'],
                name=notification_type,
                is_active=True
            ).first()
            
            # Create notification
            notification = Notification.objects.create(
                recipient=recipient,
                template=template,
                type=notification_type,
                title=title,
                message=message,
                data=data or {},
                content_type=ContentType.objects.get_for_model(related_object),
                object_id=related_object.id
            )
            
            # Send email if preferred
            if preference.channel in ['email', 'both']:
                NotificationService.send_email_notification(notification)
            
            return notification
            
        except NotificationPreference.DoesNotExist:
            # Default to 'both' if no preference is set
            return NotificationService.create_notification_with_default_preference(
                recipient,
                notification_type,
                title,
                message,
                related_object,
                data
            )

    @staticmethod
    def create_notification_with_default_preference(
        recipient,
        notification_type,
        title,
        message,
        related_object,
        data=None
    ):
        """Create notification with default preference"""
        preference = NotificationPreference.objects.create(
            user=recipient,
            notification_type=notification_type,
            channel='both'
        )
        
        return NotificationService.create_notification(
            recipient,
            notification_type,
            title,
            message,
            related_object,
            data
        )

    @staticmethod
    def send_email_notification(notification):
        """Send email notification"""
        try:
            template = notification.template
            if not template or template.type == 'in_app':
                return
            
            context = {
                'notification': notification,
                'recipient': notification.recipient,
                'data': notification.data,
                'site_url': settings.SITE_URL,
            }
            
            # Process template
            subject_template = Template(template.subject)
            body_template = Template(template.body)
            html_body_template = Template(template.html_body) if template.html_body else None
            
            rendered_subject = subject_template.render(Context(context))
            rendered_body = body_template.render(Context(context))
            rendered_html = html_body_template.render(Context(context)) if html_body_template else None
            
            # Create email notification record
            email_notification = EmailNotification.objects.create(
                notification=notification,
                recipient_email=notification.recipient.email,
                subject=rendered_subject,
                body=rendered_body,
                html_body=rendered_html
            )
            
            # Send email
            send_mail(
                subject=rendered_subject,
                message=rendered_body,
                html_message=rendered_html,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[notification.recipient.email],
                fail_silently=False
            )
            
            # Update email notification status
            email_notification.status = 'sent'
            email_notification.sent_at = timezone.now()
            email_notification.save()
            
        except Exception as e:
            if email_notification:
                email_notification.status = 'failed'
                email_notification.error_message = str(e)
                email_notification.save()
            raise

    @staticmethod
    def mark_as_read(notification_ids, user):
        """Mark notifications as read"""
        now = timezone.now()
        return Notification.objects.filter(
            id__in=notification_ids,
            recipient=user,
            is_read=False
        ).update(is_read=True, read_at=now)

    @staticmethod
    def mark_as_unread(notification_ids, user):
        """Mark notifications as unread"""
        return Notification.objects.filter(
            id__in=notification_ids,
            recipient=user,
            is_read=True
        ).update(is_read=False, read_at=None)