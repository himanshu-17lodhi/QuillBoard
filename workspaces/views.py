from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from django.utils import timezone
from datetime import timedelta
from .models import Workspace, WorkspaceMember, WorkspaceInvite


@login_required
def workspace_list(request):
    """List user's workspaces"""
    workspaces = Workspace.objects.filter(
        members__user=request.user,
        members__is_active=True
    ).distinct()
    return render(request, 'workspaces/list.html', {'workspaces': workspaces})


@login_required
def workspace_create(request):
    """Create a new workspace"""
    if request.method == 'POST':
        name = request.POST.get('name')
        description = request.POST.get('description', '')
        
        # Create workspace
        workspace = Workspace.objects.create(
            name=name,
            description=description,
            slug=name.lower().replace(' ', '-'),  # Simple slug generation
            created_by=request.user
        )
        
        # Make creator the owner
        WorkspaceMember.objects.create(
            workspace=workspace,
            user=request.user,
            role='owner',
            created_by=request.user
        )
        
        messages.success(request, f'Workspace "{name}" created successfully!')
        return redirect('workspaces:detail', slug=workspace.slug)
    
    return render(request, 'workspaces/create.html')


@login_required
def workspace_detail(request, slug):
    """Workspace detail view"""
    workspace = get_object_or_404(Workspace, slug=slug)
    
    # Check if user is a member
    membership = workspace.members.filter(user=request.user, is_active=True).first()
    if not membership:
        messages.error(request, 'You do not have access to this workspace.')
        return redirect('workspaces:list')
    
    # Get workspace pages
    pages = workspace.pages.filter(parent=None).order_by('order', 'title')
    
    context = {
        'workspace': workspace,
        'membership': membership,
        'pages': pages,
    }
    return render(request, 'workspaces/detail.html', context)


@login_required
def workspace_settings(request, slug):
    """Workspace settings"""
    workspace = get_object_or_404(Workspace, slug=slug)
    
    # Check if user is admin
    membership = workspace.members.filter(user=request.user, is_active=True).first()
    if not membership or not membership.can_admin:
        messages.error(request, 'You do not have permission to access workspace settings.')
        return redirect('workspaces:detail', slug=slug)
    
    if request.method == 'POST':
        workspace.name = request.POST.get('name', workspace.name)
        workspace.description = request.POST.get('description', workspace.description)
        workspace.save()
        messages.success(request, 'Workspace settings updated successfully!')
        return redirect('workspaces:settings', slug=workspace.slug)
    
    return render(request, 'workspaces/settings.html', {'workspace': workspace})


@login_required
def workspace_members(request, slug):
    """Workspace members management"""
    workspace = get_object_or_404(Workspace, slug=slug)
    
    # Check if user is a member
    membership = workspace.members.filter(user=request.user, is_active=True).first()
    if not membership:
        messages.error(request, 'You do not have access to this workspace.')
        return redirect('workspaces:list')
    
    members = workspace.members.filter(is_active=True).order_by('role', 'user__username')
    
    return render(request, 'workspaces/members.html', {
        'workspace': workspace,
        'membership': membership,
        'members': members,
    })


@login_required
def workspace_invite(request, slug):
    """Invite members to workspace"""
    workspace = get_object_or_404(Workspace, slug=slug)
    
    # Check if user is admin
    membership = workspace.members.filter(user=request.user, is_active=True).first()
    if not membership or not membership.can_admin:
        return JsonResponse({'error': 'Permission denied'}, status=403)
    
    if request.method == 'POST':
        email = request.POST.get('email')
        role = request.POST.get('role', 'viewer')
        
        # Create invite (simplified - in production, send email)
        invite, created = WorkspaceInvite.objects.get_or_create(
            workspace=workspace,
            email=email,
            defaults={
                'role': role,
                'created_by': request.user,
                'expires_at': timezone.now() + timedelta(days=7)
            }
        )
        
        if created:
            return JsonResponse({'message': 'Invitation sent successfully!'})
        else:
            return JsonResponse({'message': 'User already invited.'})
    
    return JsonResponse({'error': 'Invalid request'}, status=400)
