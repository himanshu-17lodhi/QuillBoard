from django import template

register = template.Library()


@register.filter
def get_item(dictionary, key):
    """Get item from dictionary using key"""
    if isinstance(dictionary, dict):
        return dictionary.get(key, '')
    return ''


@register.filter
def multiply(value, arg):
    """Multiply value by arg"""
    try:
        return float(value) * float(arg)
    except (ValueError, TypeError):
        return 0


@register.filter
def percentage(value, total):
    """Calculate percentage"""
    try:
        return round((float(value) / float(total)) * 100, 1)
    except (ValueError, TypeError, ZeroDivisionError):
        return 0