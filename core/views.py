from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.contrib.auth import get_user_model
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.views.generic import TemplateView
from django.conf import settings
import os
import json

from workspaces.models import Workspace
from .forms import CustomUserCreationForm, UserUpdateForm

User = get_user_model()


class ReactAppView(TemplateView):
    """
    Serve React SPA for all non-API routes
    """
    def get(self, request, *args, **kwargs):
        # Try to open React build index.html
        try:
            with open(os.path.join(settings.REACT_BUILD_DIR, 'index.html'), 'r') as f:
                html = f.read()
            return HttpResponse(html)
        except FileNotFoundError:
            # Fallback if React app is not built
            return HttpResponse(
                "<h1>React App Not Built</h1>"
                "<p>Please run 'npm run build' in the frontend directory</p>"
                "<p>For development, run 'npm run dev' in the frontend directory</p>"
            )


def home(request):
    """Home page - redirect to workspaces if authenticated"""
    if request.user.is_authenticated:
        workspaces = Workspace.objects.filter(
            members__user=request.user,
            members__is_active=True
        ).distinct()
        return render(request, 'core/dashboard.html', {'workspaces': workspaces})
    return render(request, 'core/landing.html')


def register(request):
    """User registration"""
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, 'Account created successfully!')
            return redirect('core:home')
    else:
        form = CustomUserCreationForm()
    return render(request, 'core/register.html', {'form': form})


@login_required
def profile(request):
    """Current user's profile"""
    if request.method == 'POST':
        form = UserUpdateForm(request.POST, request.FILES, instance=request.user)
        if form.is_valid():
            form.save()
            messages.success(request, 'Profile updated successfully!')
            return redirect('core:profile')
    else:
        form = UserUpdateForm(instance=request.user)
    
    return render(request, 'core/profile.html', {'form': form})


@login_required
def profile_detail(request, pk):
    """View another user's profile"""
    user = get_object_or_404(User, pk=pk)
    return render(request, 'core/profile_detail.html', {'profile_user': user})


# API endpoints for React frontend
@csrf_exempt
@require_http_methods(["POST"])
def api_login(request):
    """API endpoint for React login"""
    try:
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            return JsonResponse({
                'success': True,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                }
            })
        else:
            return JsonResponse({
                'success': False,
                'error': 'Invalid credentials'
            }, status=401)
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON'
        }, status=400)


@csrf_exempt
@require_http_methods(["POST"])
def api_logout(request):
    """API endpoint for React logout"""
    logout(request)
    return JsonResponse({'success': True})


@csrf_exempt
@require_http_methods(["POST"])
def api_register(request):
    """API endpoint for React registration"""
    try:
        data = json.loads(request.body)
        form = CustomUserCreationForm(data)
        
        if form.is_valid():
            user = form.save()
            login(request, user)  # Auto-login after registration
            return JsonResponse({
                'success': True,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                }
            })
        else:
            return JsonResponse({
                'success': False,
                'errors': form.errors
            }, status=400)
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON'
        }, status=400)


@require_http_methods(["GET"])
def api_user_info(request):
    """API endpoint to get current user info"""
    if request.user.is_authenticated:
        return JsonResponse({
            'authenticated': True,
            'user': {
                'id': request.user.id,
                'username': request.user.username,
                'email': request.user.email,
                'avatar': request.user.avatar.url if request.user.avatar else None,
            }
        })
    else:
        return JsonResponse({'authenticated': False})
