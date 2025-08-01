from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from workspaces.models import Workspace
from .models import Page, Block, Template


@login_required
def page_detail(request, workspace_slug, page_id):
    """Page detail view with blocks"""
    workspace = get_object_or_404(Workspace, slug=workspace_slug)
    page = get_object_or_404(Page, id=page_id, workspace=workspace)
    
    # Check workspace membership
    membership = workspace.members.filter(user=request.user, is_active=True).first()
    if not membership:
        messages.error(request, 'You do not have access to this workspace.')
        return redirect('core:home')
    
    # Get root blocks (no parent)
    blocks = Block.objects.filter(page=page, is_active=True, parent_block=None).order_by('order')
    
    context = {
        'workspace': workspace,
        'page': page,
        'blocks': blocks,
        'membership': membership,
    }
    return render(request, 'pages/detail.html', context)


@login_required
def page_edit(request, workspace_slug, page_id):
    """Page edit view"""
    workspace = get_object_or_404(Workspace, slug=workspace_slug)
    page = get_object_or_404(Page, id=page_id, workspace=workspace)
    
    # Check permissions
    membership = workspace.members.filter(user=request.user, is_active=True).first()
    if not membership or not membership.can_edit:
        messages.error(request, 'You do not have permission to edit this page.')
        return redirect('pages:detail', workspace_slug=workspace_slug, page_id=page_id)
    
    if request.method == 'POST':
        page.title = request.POST.get('title', page.title)
        page.icon = request.POST.get('icon', page.icon)
        page.save()
        messages.success(request, 'Page updated successfully!')
        return redirect('pages:detail', workspace_slug=workspace_slug, page_id=page_id)
    
    blocks = Block.objects.filter(page=page, is_active=True, parent_block=None).order_by('order')
    
    context = {
        'workspace': workspace,
        'page': page,
        'blocks': blocks,
        'membership': membership,
        'edit_mode': True,
    }
    return render(request, 'pages/edit.html', context)


@login_required
def page_create(request, workspace_slug):
    """Create a new page"""
    workspace = get_object_or_404(Workspace, slug=workspace_slug)
    
    # Check permissions
    membership = workspace.members.filter(user=request.user, is_active=True).first()
    if not membership or not membership.can_edit:
        messages.error(request, 'You do not have permission to create pages.')
        return redirect('workspaces:detail', slug=workspace_slug)
    
    if request.method == 'POST':
        title = request.POST.get('title', 'Untitled')
        parent_id = request.POST.get('parent')
        
        parent = None
        if parent_id:
            parent = get_object_or_404(Page, id=parent_id, workspace=workspace)
        
        page = Page.objects.create(
            workspace=workspace,
            title=title,
            parent=parent,
            created_by=request.user
        )
        
        # Create initial text block
        Block.objects.create(
            page=page,
            block_type='text',
            content={'text': ''},
            order=0,
            created_by=request.user
        )
        
        messages.success(request, f'Page "{title}" created successfully!')
        return redirect('pages:detail', workspace_slug=workspace_slug, page_id=page.id)
    
    # Get pages for parent selection
    pages = Page.objects.filter(workspace=workspace).order_by('title')
    
    return render(request, 'pages/create.html', {
        'workspace': workspace,
        'pages': pages,
    })


@login_required
def template_list(request, workspace_slug):
    """List available templates"""
    workspace = get_object_or_404(Workspace, slug=workspace_slug)
    
    # Check membership
    membership = workspace.members.filter(user=request.user, is_active=True).first()
    if not membership:
        messages.error(request, 'You do not have access to this workspace.')
        return redirect('core:home')
    
    # Get public templates and workspace templates
    public_templates = Template.objects.filter(is_public=True).order_by('category', 'name')
    workspace_templates = Template.objects.filter(workspace=workspace).order_by('category', 'name')
    
    context = {
        'workspace': workspace,
        'public_templates': public_templates,
        'workspace_templates': workspace_templates,
    }
    return render(request, 'pages/templates.html', context)
