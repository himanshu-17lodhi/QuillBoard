import { Presence } from '../utils/presence.js';
import { CursorManager } from '../utils/cursor.js';
import { OperationalTransform } from '../utils/operational-transform.js';

export class CollaborationManager {
    constructor(options) {
        this.editor = options.editor;
        this.ws = options.ws;
        this.workspace = options.workspace;
        
        this.presence = new Presence();
        this.cursors = new CursorManager();
        this.ot = new OperationalTransform();
        
        this.collaborators = new Map();
        this.initialize();
    }

    initialize() {
        // Connect to collaboration WebSocket
        this.connectWebSocket();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Start sending presence updates
        this.startPresenceHeartbeat();
    }

    connectWebSocket() {
        const pageId = this.editor.getPageId();
        this.ws.connect(`/ws/collaboration/${pageId}/`);
        
        this.ws.onMessage(message => {
            this.handleWebSocketMessage(JSON.parse(message));
        });
    }

    setupEventListeners() {
        // Handle editor changes
        document.addEventListener('editor:change', (e) => {
            this.handleLocalChange(e.detail);
        });

        // Handle cursor movements
        document.addEventListener('editor:cursor', (e) => {
            this.handleCursorMove(e.detail);
        });

        // Handle selection changes
        document.addEventListener('editor:selection', (e) => {
            this.handleSelectionChange(e.detail);
        });
    }

    startPresenceHeartbeat() {
        setInterval(() => {
            this.sendPresenceUpdate();
        }, 30000); // Send update every 30 seconds
    }

    handleWebSocketMessage(message) {
        switch (message.type) {
            case 'presence':
                this.updateCollaboratorPresence(message.data);
                break;
            case 'operation':
                this.handleRemoteOperation(message.data);
                break;
            case 'cursor':
                this.updateCollaboratorCursor(message.data);
                break;
            case 'selection':
                this.updateCollaboratorSelection(message.data);
                break;
        }
    }

    handleLocalChange(change) {
        // Transform change into operation
        const operation = this.ot.createOperation(change);
        
        // Apply operation locally
        this.ot.applyOperation(operation);
        
        // Send operation to server
        this.ws.send({
            type: 'operation',
            data: operation
        });
    }

    handleRemoteOperation(operation) {
        // Transform remote operation against pending local operations
        const transformedOperation = this.ot.transformOperation(operation);
        
        // Apply transformed operation
        this.editor.applyOperation(transformedOperation);
    }

    handleCursorMove(position) {
        this.ws.send({
            type: 'cursor',
            data: {
                userId: this.workspace.getCurrentUser().id,
                position
            }
        });
    }

    handleSelectionChange(selection) {
        this.ws.send({
            type: 'selection',
            data: {
                userId: this.workspace.getCurrentUser().id,
                selection
            }
        });
    }

    updateCollaboratorPresence(presenceData) {
        const { userId, timestamp, status } = presenceData;
        
        if (status === 'active') {
            this.collaborators.set(userId, {
                lastSeen: timestamp,
                status: 'active'
            });
        } else {
            this.collaborators.delete(userId);
        }
        
        this.presence.updateCollaborators(Array.from(this.collaborators.entries()));
    }

    updateCollaboratorCursor(cursorData) {
        const { userId, position } = cursorData;
        this.cursors.updateCursor(userId, position);
    }

    updateCollaboratorSelection(selectionData) {
        const { userId, selection } = selectionData;
        this.cursors.updateSelection(userId, selection);
    }

    sendPresenceUpdate() {
        this.ws.send({
            type: 'presence',
            data: {
                userId: this.workspace.getCurrentUser().id,
                timestamp: Date.now(),
                status: 'active'
            }
        });
    }
}