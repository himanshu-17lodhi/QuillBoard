export class WorkspaceManager {
    constructor(api) {
        this.api = api;
        this.currentWorkspace = null;
        this.workspaces = [];
    }

    async initialize() {
        await this.loadWorkspaces();
        this.setupEventListeners();
    }

    async loadWorkspaces() {
        try {
            const response = await this.api.getWorkspaces();
            this.workspaces = response.data;
            
            // Set current workspace from URL or first available
            const workspaceId = this.getWorkspaceIdFromUrl();
            if (workspaceId) {
                await this.switchWorkspace(workspaceId);
            } else if (this.workspaces.length > 0) {
                await this.switchWorkspace(this.workspaces[0].id);
            }
            
            this.renderWorkspaceList();
        } catch (error) {
            console.error('Failed to load workspaces:', error);
        }
    }

    setupEventListeners() {
        // Workspace switching
        document.addEventListener('click', (e) => {
            const workspaceLink = e.target.closest('[data-workspace-id]');
            if (workspaceLink) {
                e.preventDefault();
                const workspaceId = workspaceLink.dataset.workspaceId;
                this.switchWorkspace(workspaceId);
            }
        });

        // Workspace creation
        const createWorkspaceForm = document.querySelector('#create-workspace-form');
        if (createWorkspaceForm) {
            createWorkspaceForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleCreateWorkspace(new FormData(e.target));
            });
        }

        // Workspace settings
        const workspaceSettingsForm = document.querySelector('#workspace-settings-form');
        if (workspaceSettingsForm) {
            workspaceSettingsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleUpdateWorkspaceSettings(new FormData(e.target));
            });
        }
    }

    async switchWorkspace(workspaceId) {
        try {
            const workspace = await this.api.getWorkspace(workspaceId);
            this.currentWorkspace = workspace;
            
            // Update URL
            this.updateUrl(workspace.slug);
            
            // Update UI
            this.updateWorkspaceUI();
            
            // Emit event
            this.emit('workspace:switched', { workspace });
            
        } catch (error) {
            console.error('Failed to switch workspace:', error);
        }
    }

    async handleCreateWorkspace(formData) {
        try {
            const workspace = await this.api.createWorkspace({
                name: formData.get('name'),
                description: formData.get('description')
            });
            
            this.workspaces.push(workspace);
            this.renderWorkspaceList();
            await this.switchWorkspace(workspace.id);
            
        } catch (error) {
            console.error('Failed to create workspace:', error);
        }
    }

    async handleUpdateWorkspaceSettings(formData) {
        try {
            const updatedWorkspace = await this.api.updateWorkspace(
                this.currentWorkspace.id,
                {
                    name: formData.get('name'),
                    description: formData.get('description'),
                    icon: formData.get('icon'),
                    theme: formData.get('theme')
                }
            );
            
            this.currentWorkspace = updatedWorkspace;
            this.updateWorkspaceUI();
            
        } catch (error) {
            console.error('Failed to update workspace settings:', error);
        }
    }

    renderWorkspaceList() {
        const container = document.querySelector('#workspace-list');
        if (!container) return;

        container.innerHTML = this.workspaces
            .map(workspace => `
                <a href="/w/${workspace.slug}"
                   data-workspace-id="${workspace.id}"
                   class="workspace-item ${workspace.id === this.currentWorkspace?.id ? 'active' : ''}">
                    ${workspace.icon ? `<span class="workspace-icon">${workspace.icon}</span>` : ''}
                    <span class="workspace-name">${workspace.name}</span>
                </a>
            `)
            .join('');
    }

    updateWorkspaceUI() {
        // Update workspace name in header
        const workspaceTitle = document.querySelector('#workspace-title');
        if (workspaceTitle) {
            workspaceTitle.textContent = this.currentWorkspace.name;
        }

        // Update workspace icon
        const workspaceIcon = document.querySelector('#workspace-icon');
        if (workspaceIcon && this.currentWorkspace.icon) {
            workspaceIcon.textContent = this.currentWorkspace.icon;
        }

        // Update active workspace in list
        const workspaceItems = document.querySelectorAll('.workspace-item');
        workspaceItems.forEach(item => {
            item.classList.toggle('active', 
                item.dataset.workspaceId === this.currentWorkspace.id);
        });
    }

    getWorkspaceIdFromUrl() {
        const match = window.location.pathname.match(/\/w\/([^\/]+)/);
        return match ? match[1] : null;
    }

    updateUrl(workspaceSlug) {
        const newUrl = `/w/${workspaceSlug}${window.location.pathname.split('/w/')[1] || ''}`;
        window.history.pushState({}, '', newUrl);
    }

    emit(eventName, detail) {
        document.dispatchEvent(
            new CustomEvent(eventName, { detail })
        );
    }
}