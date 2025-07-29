import { WebSocketClient } from '../utils/websocket.js';

export class CollaborationManager {
    constructor(options = {}) {
        this.pageId = options.pageId;
        this.onPresenceUpdate = options.onPresenceUpdate;
        this.onBlockUpdate = options.onBlockUpdate;
        this.cursorPosition = { x: 0, y: 0 };
        this.selection = { start: null, end: null };

        this.websocket = new WebSocketClient({
            endpoint: `/ws/collaboration/${this.pageId}/`,
            onMessage: this.handleMessage.bind(this)
        });

        this.setupEventListeners();
        this.startHeartbeat();
    }

    setupEventListeners() {
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('selectionchange', this.handleSelectionChange.bind(this));
    }

    handleMouseMove(event) {
        this.cursorPosition = {
            x: event.clientX,
            y: event.clientY
        };
        
        this.broadcastPresence();
    }

    handleSelectionChange() {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            this.selection = {
                start: this.getNodePath(range.startContainer),
                end: this.getNodePath(range.endContainer),
                startOffset: range.startOffset,
                endOffset: range.endOffset
            };
            
            this.broadcastPresence();
        }
    }

    getNodePath(node) {
        const path = [];
        while (node && node !== document.body) {
            const parent = node.parentNode;
            if (!parent) break;
            
            const index = Array.from(parent.childNodes).indexOf(node);
            path.unshift(index);
            node = parent;
        }
        return path;
    }

    broadcastPresence() {
        this.websocket.send({
            type: 'presence',
            data: {
                cursor: this.cursorPosition,
                selection: this.selection
            }
        });
    }

    broadcastBlockUpdate(blockId, content) {
        this.websocket.send({
            type: 'block_update',
            data: {
                blockId,
                content
            }
        });
    }

    handleMessage(message) {
        switch (message.type) {
            case 'presence':
                this.handlePresenceUpdate(message.data);
                break;
            case 'block_update':
                this.handleBlockUpdate(message.data);
                break;
            default:
                console.warn('Unknown message type:', message.type);
        }
    }

    handlePresenceUpdate(data) {
        if (this.onPresenceUpdate) {
            this.onPresenceUpdate(data);
        }
    }

    handleBlockUpdate(data) {
        if (this.onBlockUpdate) {
            this.onBlockUpdate(data.blockId, data.content);
        }
    }

    startHeartbeat() {
        setInterval(() => {
            this.websocket.send({
                type: 'heartbeat'
            });
        }, 30000); // Every 30 seconds
    }

    disconnect() {
        this.websocket.disconnect();
    }
}