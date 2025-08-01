from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm
from django.contrib import messages
from django.contrib.auth import get_user_model
from workspaces.models import Workspace

User = get_user_model()


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
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, 'Account created successfully!')
            return redirect('core:home')
    else:
        form = UserCreationForm()
    return render(request, 'core/register.html', {'form': form})


@login_required
def profile(request):
    """Current user's profile"""
    return render(request, 'core/profile.html', {'user': request.user})


@login_required
def profile_detail(request, pk):
    """View another user's profile"""
    user = get_object_or_404(User, pk=pk)
    return render(request, 'core/profile_detail.html', {'profile_user': user})
