import { WebSocketClient } from './websocket.js';

export class PresenceManager {
    constructor(options = {}) {
        this.workspaceId = options.workspaceId;
        this.onPresenceUpdate = options.onPresenceUpdate;
        this.activeUsers = new Map();
        this.lastActivity = Date.now();

        this.websocket = new WebSocketClient({
            endpoint: `/ws/presence/${this.workspaceId}/`,
            onMessage: this.handleMessage.bind(this),
            onConnect: this.handleConnect.bind(this)
        });

        this.setupActivityTracking();
        this.startHeartbeat();
    }

    setupActivityTracking() {
        const events = ['mousemove', 'keydown', 'click', 'scroll'];
        events.forEach(eventName => {
            document.addEventListener(eventName, () => {
                this.lastActivity = Date.now();
                this.broadcastPresence();
            });
        });
    }

    handleConnect() {
        this.broadcastPresence();
    }

    handleMessage(message) {
        switch (message.type) {
            case 'presence_update':
                this.handlePresenceUpdate(message.data);
                break;
            case 'user_left':
                this.handleUserLeft(message.data);
                break;
            default:
                console.warn('Unknown presence message type:', message.type);
        }
    }

    handlePresenceUpdate(data) {
        data.forEach(presence => {
            this.activeUsers.set(presence.userId, {
                ...presence,
                lastSeen: Date.now()
            });
        });

        this.cleanupInactiveUsers();
        this.notifyPresenceUpdate();
    }

    handleUserLeft(data) {
        this.activeUsers.delete(data.userId);
        this.notifyPresenceUpdate();
    }

    broadcastPresence() {
        this.websocket.send({
            type: 'presence',
            data: {
                lastActivity: this.lastActivity
            }
        });
    }

    cleanupInactiveUsers() {
        const now = Date.now();
        const timeout = 1000 * 60; // 1 minute

        for (const [userId, data] of this.activeUsers) {
            if (now - data.lastSeen > timeout) {
                this.activeUsers.delete(userId);
            }
        }
    }

    notifyPresenceUpdate() {
        if (this.onPresenceUpdate) {
            const presenceData = Array.from(this.activeUsers.values());
            this.onPresenceUpdate(presenceData);
        }
    }

    startHeartbeat() {
        setInterval(() => {
            if (Date.now() - this.lastActivity < 1000 * 60 * 5) { // 5 minutes
                this.broadcastPresence();
            }
        }, 30000); // Every 30 seconds
    }

    disconnect() {
        this.websocket.disconnect();
    }
}