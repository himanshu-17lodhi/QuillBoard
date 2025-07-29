// Main application initialization
import { Editor } from './components/editor.js';
import { CollaborationManager } from './components/collaboration.js';
import { WorkspaceManager } from './components/workspace.js';
import { ApiClient } from './utils/api.js';
import { WebSocketManager } from './utils/websocket.js';
import { AuthManager } from './utils/auth.js';

class QuillBoardApp {
    constructor() {
        this.api = new ApiClient();
        this.auth = new AuthManager(this.api);
        this.ws = new WebSocketManager();
        
        // Initialize components when DOM is ready
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeComponents();
        });
    }

    async initializeComponents() {
        // Initialize workspace manager
        this.workspace = new WorkspaceManager(this.api);
        await this.workspace.initialize();

        // Initialize editor if on editor page
        if (document.querySelector('#editor')) {
            this.editor = new Editor({
                container: '#editor',
                api: this.api,
                workspace: this.workspace
            });

            // Initialize collaboration if enabled
            if (window.ENABLE_COLLABORATION) {
                this.collaboration = new CollaborationManager({
                    editor: this.editor,
                    ws: this.ws,
                    workspace: this.workspace
                });
            }
        }

        // Setup global event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Handle authentication events
        document.addEventListener('auth:login', (e) => {
            this.handleLogin(e.detail);
        });

        document.addEventListener('auth:logout', () => {
            this.handleLogout();
        });

        // Handle workspace events
        document.addEventListener('workspace:switch', (e) => {
            this.handleWorkspaceSwitch(e.detail.workspaceId);
        });

        // Handle collaboration events
        if (this.collaboration) {
            document.addEventListener('collaboration:presence', (e) => {
                this.collaboration.updatePresence(e.detail);
            });
        }
    }

    async handleLogin(credentials) {
        try {
            await this.auth.login(credentials);
            window.location.href = '/dashboard';
        } catch (error) {
            console.error('Login failed:', error);
            // Show error notification
        }
    }

    async handleLogout() {
        await this.auth.logout();
        window.location.href = '/login';
    }

    async handleWorkspaceSwitch(workspaceId) {
        try {
            await this.workspace.switchWorkspace(workspaceId);
            // Reload necessary components
            if (this.editor) {
                await this.editor.reload();
            }
        } catch (error) {
            console.error('Failed to switch workspace:', error);
            // Show error notification
        }
    }
}

// Initialize application
window.app = new QuillBoardApp();