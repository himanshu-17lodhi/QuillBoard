import { ApiClient } from '../utils/api.js';
import { PresenceManager } from '../utils/presence.js';

export class WorkspaceManager {
    constructor(options = {}) {
        this.workspaceId = options.workspaceId;
        this.api = new ApiClient();
        this.presence = new PresenceManager({
            workspaceId: this.workspaceId,
            onPresenceUpdate: this.updatePresenceIndicators.bind(this)
        });

        this.setupEventListeners();
        this.loadWorkspaceData();
    }

    async loadWorkspaceData() {
        try {
            const workspace = await this.api.get(`/api/workspaces/${this.workspaceId}/`);
            this.updateWorkspaceUI(workspace);

            const members = await this.api.get(`/api/workspaces/${this.workspaceId}/members/`);
            this.updateMembersList(members);

            const pages = await this.api.get(`/api/workspaces/${this.workspaceId}/pages/`);
            this.updatePagesGrid(pages);
        } catch (error) {
            console.error('Failed to load workspace data:', error);
        }
    }

    updateWorkspaceUI(workspace) {
        document.querySelector('.workspace-name').textContent = workspace.name;
        document.querySelector('.workspace-description').textContent = workspace.description;
        
        if (workspace.icon) {
            document.querySelector('.workspace-icon').textContent = workspace.icon;
        }
    }

    updateMembersList(members) {
        const membersList = document.querySelector('.members-list');
        if (!membersList) return;

        membersList.innerHTML = members.map(member => `
            <div class="member-item" data-member-id="${member.id}">
                <img src="${member.user.avatar_url || '/static/img/default-avatar.png'}" 
                     alt="" 
                     class="member-avatar">
                <div class="member-info">
                    <div class="member-name">${member.user.name || member.user.email}</div>
                    <div class="member-role">${member.role}</div>
                </div>
                ${this.getMemberActions(member)}
            </div>
        `).join('');
    }

    getMemberActions(member) {
        if (member.role === 'owner') return '';
        
        return `
            <div class="member-actions">
                <select class="role-select" data-member-id="${member.id}">
                    <option value="admin" ${member.role === 'admin' ? 'selected' : ''}>Admin</option>
                    <option value="editor" ${member.role === 'editor' ? 'selected' : ''}>Editor</option>
                    <option value="viewer" ${member.role === 'viewer' ? 'selected' : ''}>Viewer</option>
                </select>
                <button class="remove-member" data-member-id="${member.id}">
                    Remove
                </button>
            </div>
        `;
    }

    updatePagesGrid(pages) {
        const pagesGrid = document.querySelector('.pages-grid');
        if (!pagesGrid) return;

        pagesGrid.innerHTML = pages.map(page => `
            <a href="/pages/${page.id}" class="page-card">
                ${page.cover_image ? `
                    <img src="${page.cover_image}" alt="" class="page-cover">
                ` : ''}
                <div class="page-info">
                    <h3 class="page-title">${page.title}</h3>
                    <div class="page-meta">
                        <span>Updated ${new Date(page.updated_at).toLocaleDateString()}</span>
                        <span>${page.created_by.name}</span>
                    </div>
                </div>
            </a>
        `).join('');
    }

    updatePresenceIndicators(presenceData) {
        const presenceContainer = document.querySelector('.presence-indicators');
        if (!presenceContainer) return;

        presenceContainer.innerHTML = presenceData.map(user => `
            <div class="presence-indicator" 
                 style="background-color: ${user.color}"
                 title="${user.name || user.email}">
                ${(user.name || user.email)[0].toUpperCase()}
            </div>
        `).join('');
    }

    setupEventListeners() {
        // Workspace settings
        document.getElementById('workspace-settings-form')?.addEventListener('submit', 
            this.handleWorkspaceUpdate.bind(this));

        // Member management
        document.addEventListener('change', event => {
            if (event.target.matches('.role-select')) {
                this.updateMemberRole(
                    event.target.dataset.memberId,
                    event.target.value
                );
            }
        });

        document.addEventListener('click', event => {
            if (event.target.matches('.remove-member')) {
                this.removeMember(event.target.dataset.memberId);
            }
        });

        // Create page
        document.getElementById('create-page')?.addEventListener('click',
            this.showCreatePageModal.bind(this));
    }

    async handleWorkspaceUpdate(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);

        try {
            const workspace = await this.api.patch(
                `/api/workspaces/${this.workspaceId}/`,
                Object.fromEntries(formData)
            );
            this.updateWorkspaceUI(workspace);
        } catch (error) {
            console.error('Failed to update workspace:', error);
        }
    }

    async updateMemberRole(memberId, role) {
        try {
            await this.api.patch(`/api/workspaces/${this.workspaceId}/members/${memberId}/`, {
                role
            });
        } catch (error) {
            console.error('Failed to update member role:', error);
        }
    }

    async removeMember(memberId) {
        if (!confirm('Are you sure you want to remove this member?')) return;

        try {
            await this.api.delete(`/api/workspaces/${this.workspaceId}/members/${memberId}/`);
            document.querySelector(`[data-member-id="${memberId}"]`)?.remove();
        } catch (error) {
            console.error('Failed to remove member:', error);
        }
    }

    showCreatePageModal() {
        // Implementation for creating new page modal
    }
}