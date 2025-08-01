from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from workspaces.models import Workspace
from .models import Database, DatabaseView, DatabaseRecord, DatabaseField


@login_required
def database_detail(request, workspace_slug, database_id):
    """Database detail view with default view"""
    workspace = get_object_or_404(Workspace, slug=workspace_slug)
    database = get_object_or_404(Database, id=database_id, workspace=workspace)
    
    # Check workspace membership
    membership = workspace.members.filter(user=request.user, is_active=True).first()
    if not membership:
        messages.error(request, 'You do not have access to this workspace.')
        return redirect('core:home')
    
    # Get default view or create one
    default_view = database.views.filter(is_default=True).first()
    if not default_view:
        default_view = database.views.first()
    
    if not default_view:
        # Create a default table view
        default_view = DatabaseView.objects.create(
            database=database,
            name='Table',
            view_type='table',
            is_default=True,
            created_by=request.user
        )
    
    return database_view(request, workspace_slug, database_id, default_view.id)


@login_required
def database_view(request, workspace_slug, database_id, view_id):
    """Display database in specific view"""
    workspace = get_object_or_404(Workspace, slug=workspace_slug)
    database = get_object_or_404(Database, id=database_id, workspace=workspace)
    view = get_object_or_404(DatabaseView, id=view_id, database=database)
    
    # Check workspace membership
    membership = workspace.members.filter(user=request.user, is_active=True).first()
    if not membership:
        messages.error(request, 'You do not have access to this workspace.')
        return redirect('core:home')
    
    # Get records and fields
    fields = database.fields.all().order_by('order')
    records = DatabaseRecord.objects.filter(database=database).order_by('order', 'created_at')
    
    # Apply view filters and sorts if any
    filters = view.filters or []
    sorts = view.sorts or []
    
    # TODO: Apply actual filtering and sorting logic
    
    context = {
        'workspace': workspace,
        'database': database,
        'view': view,
        'fields': fields,
        'records': records,
        'membership': membership,
        'all_views': database.views.all(),
    }
    
    # Render different templates based on view type
    template_map = {
        'table': 'databases/table_view.html',
        'kanban': 'databases/kanban_view.html',
        'gallery': 'databases/gallery_view.html',
        'list': 'databases/list_view.html',
        'calendar': 'databases/calendar_view.html',
    }
    
    template = template_map.get(view.view_type, 'databases/table_view.html')
    return render(request, template, context)


@login_required
def database_create(request, workspace_slug):
    """Create a new database"""
    workspace = get_object_or_404(Workspace, slug=workspace_slug)
    
    # Check permissions
    membership = workspace.members.filter(user=request.user, is_active=True).first()
    if not membership or not membership.can_edit:
        messages.error(request, 'You do not have permission to create databases.')
        return redirect('workspaces:detail', slug=workspace_slug)
    
    if request.method == 'POST':
        name = request.POST.get('name', 'Untitled Database')
        description = request.POST.get('description', '')
        
        database = Database.objects.create(
            workspace=workspace,
            name=name,
            description=description,
            created_by=request.user
        )
        
        # Create default fields
        DatabaseField.objects.bulk_create([
            DatabaseField(
                database=database,
                name='Name',
                field_type='text',
                order=0,
                is_primary=True,
                created_by=request.user
            ),
            DatabaseField(
                database=database,
                name='Status',
                field_type='select',
                options={'options': ['Not Started', 'In Progress', 'Done']},
                order=1,
                created_by=request.user
            ),
            DatabaseField(
                database=database,
                name='Created',
                field_type='created_time',
                order=2,
                created_by=request.user
            ),
        ])
        
        # Create default table view
        DatabaseView.objects.create(
            database=database,
            name='Table',
            view_type='table',
            is_default=True,
            created_by=request.user
        )
        
        messages.success(request, f'Database "{name}" created successfully!')
        return redirect('databases:detail', workspace_slug=workspace_slug, database_id=database.id)
    
    return render(request, 'databases/create.html', {'workspace': workspace})
