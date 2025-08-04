/**
 * QuillBoard Collaboration Module
 * Handles real-time collaboration features including user presence and cursors
 */

class CollaborationManager {
    constructor(websocket, options = {}) {
        this.websocket = websocket;
        this.options = {
            showCursors: true,
            showPresence: true,
            cursorTimeout: 5000,
            presenceTimeout: 30000,
            currentUser: null,
            ...options
        };
        
        this.connectedUsers = new Map();
        this.userCursors = new Map();
        this.presenceContainer = null;
        this.lastActivity = Date.now();
        
        this.init();
    }
    
    init() {
        this.createPresenceUI();
        this.setupWebSocketHandlers();
        this.setupActivityTracking();
        this.startHeartbeat();
    }
    
    createPresenceUI() {
        // Create presence indicator in the header
        const nav = document.querySelector('nav .flex.justify-between .flex.items-center.space-x-4');
        if (nav && !document.querySelector('#user-presence')) {
            const presenceContainer = document.createElement('div');
            presenceContainer.id = 'user-presence';
            presenceContainer.className = 'flex items-center space-x-2 mr-4';
            presenceContainer.innerHTML = `
                <div class="flex items-center">
                    <span class="text-sm text-gray-500 mr-2">Online:</span>
                    <div id="presence-avatars" class="flex -space-x-2"></div>
                </div>
            `;
            
            // Insert before the user menu
            const userMenu = nav.querySelector('.relative.group');
            if (userMenu) {
                nav.insertBefore(presenceContainer, userMenu);
            }
        }
        
        this.presenceContainer = document.querySelector('#presence-avatars');
    }
    
    setupWebSocketHandlers() {
        if (!this.websocket) return;
        
        // Override the WebSocket message handler to include collaboration
        const originalHandler = this.websocket.handleMessage.bind(this.websocket);
        
        this.websocket.handleMessage = (data) => {
            // Handle collaboration messages
            if (data.type === 'user_joined') {
                this.handleUserJoined(data);
            } else if (data.type === 'user_left') {
                this.handleUserLeft(data);
            } else if (data.type === 'cursor_position') {
                this.handleCursorPosition(data);
            } else if (data.type === 'user_activity') {
                this.handleUserActivity(data);
            } else if (data.type === 'presence_update') {
                this.handlePresenceUpdate(data);
            }
            
            // Call original handler for other messages
            originalHandler(data);
        };
        
        // Send initial presence
        this.sendPresence();
    }
    
    setupActivityTracking() {
        // Track user activity for presence
        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, this.throttle(() => {
                this.updateActivity();
            }, 1000));
        });
        
        // Track cursor position in editable elements
        document.addEventListener('selectionchange', this.throttle(() => {
            this.trackCursorPosition();
        }, 500));
        
        // Track focus changes
        document.addEventListener('focusin', (e) => {
            if (this.isEditableElement(e.target)) {
                this.sendFocusUpdate(e.target, true);
            }
        });
        
        document.addEventListener('focusout', (e) => {
            if (this.isEditableElement(e.target)) {
                this.sendFocusUpdate(e.target, false);
            }
        });
    }
    
    startHeartbeat() {
        // Send heartbeat every 15 seconds
        setInterval(() => {
            this.sendHeartbeat();
        }, 15000);
    }
    
    // WebSocket message handlers
    handleUserJoined(data) {
        const user = {
            id: data.user_id,
            username: data.username,
            avatar: data.avatar,
            color: this.generateUserColor(data.user_id),
            lastSeen: Date.now()
        };
        
        this.connectedUsers.set(data.user_id, user);
        this.updatePresenceDisplay();
        this.showNotification(`${data.username} joined the page`, 'info');
    }
    
    handleUserLeft(data) {
        this.connectedUsers.delete(data.user_id);
        this.removeCursor(data.user_id);
        this.updatePresenceDisplay();
        this.showNotification(`${data.username} left the page`, 'info');
    }
    
    handleCursorPosition(data) {
        if (data.user_id === this.options.currentUser?.id) return;
        
        this.updateUserCursor(data);
    }
    
    handleUserActivity(data) {
        const user = this.connectedUsers.get(data.user_id);
        if (user) {
            user.lastSeen = Date.now();
            this.updatePresenceDisplay();
        }
    }
    
    handlePresenceUpdate(data) {
        // Update user presence information
        data.users.forEach(userData => {
            if (userData.user_id !== this.options.currentUser?.id) {
                const user = {
                    id: userData.user_id,
                    username: userData.username,
                    avatar: userData.avatar,
                    color: this.generateUserColor(userData.user_id),
                    lastSeen: Date.now()
                };
                this.connectedUsers.set(userData.user_id, user);
            }
        });
        
        this.updatePresenceDisplay();
    }
    
    // Activity tracking
    updateActivity() {
        this.lastActivity = Date.now();
        this.sendActivity();
    }
    
    trackCursorPosition() {
        const selection = window.getSelection();
        if (selection.rangeCount === 0) return;
        
        const range = selection.getRangeAt(0);
        const element = range.startContainer;
        const blockElement = element.nodeType === Node.TEXT_NODE ? 
            element.parentElement.closest('.notion-block') :
            element.closest('.notion-block');
        
        if (blockElement) {
            const blockId = blockElement.dataset.blockId;
            const position = range.startOffset;
            
            this.sendCursorPosition(blockId, position, element);
        }
    }
    
    // WebSocket senders
    sendPresence() {
        if (!this.websocket || !this.options.currentUser) return;
        
        this.websocket.send({
            type: 'user_presence',
            user_id: this.options.currentUser.id,
            username: this.options.currentUser.username,
            avatar: this.options.currentUser.avatar,
            timestamp: Date.now()
        });
    }
    
    sendActivity() {
        if (!this.websocket || !this.options.currentUser) return;
        
        this.websocket.send({
            type: 'user_activity',
            user_id: this.options.currentUser.id,
            timestamp: Date.now()
        });
    }
    
    sendCursorPosition(blockId, position, element) {
        if (!this.websocket || !this.options.currentUser) return;
        
        const rect = element.getBoundingClientRect();
        
        this.websocket.send({
            type: 'cursor_position',
            user_id: this.options.currentUser.id,
            username: this.options.currentUser.username,
            block_id: blockId,
            position: position,
            coordinates: {
                x: rect.left,
                y: rect.top
            },
            timestamp: Date.now()
        });
    }
    
    sendFocusUpdate(element, focused) {
        const blockElement = element.closest('.notion-block');
        if (!blockElement) return;
        
        const blockId = blockElement.dataset.blockId;
        
        this.websocket.send({
            type: 'user_focus',
            user_id: this.options.currentUser.id,
            username: this.options.currentUser.username,
            block_id: blockId,
            focused: focused,
            timestamp: Date.now()
        });
    }
    
    sendHeartbeat() {
        if (!this.websocket || !this.options.currentUser) return;
        
        this.websocket.send({
            type: 'heartbeat',
            user_id: this.options.currentUser.id,
            timestamp: Date.now()
        });
    }
    
    // UI Updates
    updatePresenceDisplay() {
        if (!this.presenceContainer) return;
        
        const activeUsers = Array.from(this.connectedUsers.values())
            .filter(user => Date.now() - user.lastSeen < this.options.presenceTimeout);
        
        this.presenceContainer.innerHTML = activeUsers.map(user => `
            <div class="relative" title="${user.username}">
                <img src="${user.avatar || this.getDefaultAvatar(user.username)}" 
                     alt="${user.username}" 
                     class="w-8 h-8 rounded-full border-2 border-white shadow-sm">
                <div class="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
            </div>
        `).join('');
    }
    
    updateUserCursor(data) {
        if (!this.options.showCursors) return;
        
        const user = this.connectedUsers.get(data.user_id);
        if (!user) return;
        
        // Find the block element
        const blockElement = document.querySelector(`[data-block-id="${data.block_id}"]`);
        if (!blockElement) return;
        
        // Remove existing cursor
        this.removeCursor(data.user_id);
        
        // Create new cursor
        const cursor = document.createElement('div');
        cursor.id = `cursor-${data.user_id}`;
        cursor.className = 'collaboration-cursor absolute z-40 pointer-events-none';
        cursor.innerHTML = `
            <div class="flex items-center">
                <div class="w-0.5 h-5 animate-pulse" style="background-color: ${user.color}"></div>
                <div class="ml-2 px-2 py-1 text-xs text-white rounded shadow-lg whitespace-nowrap" 
                     style="background-color: ${user.color}">
                    ${user.username}
                </div>
            </div>
        `;
        
        // Position cursor
        const editableElement = blockElement.querySelector('[contenteditable="true"]');
        if (editableElement) {
            const rect = editableElement.getBoundingClientRect();
            cursor.style.position = 'fixed';
            cursor.style.left = `${data.coordinates?.x || rect.left}px`;
            cursor.style.top = `${data.coordinates?.y || rect.top}px`;
        }
        
        document.body.appendChild(cursor);
        this.userCursors.set(data.user_id, cursor);
        
        // Remove cursor after timeout
        setTimeout(() => {
            this.removeCursor(data.user_id);
        }, this.options.cursorTimeout);
    }
    
    removeCursor(userId) {
        const cursor = this.userCursors.get(userId);
        if (cursor) {
            cursor.remove();
            this.userCursors.delete(userId);
        }
    }
    
    // Utility functions
    generateUserColor(userId) {
        const colors = [
            '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
            '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
            '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
            '#ec4899', '#f43f5e'
        ];
        
        const hash = userId.toString().split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);
        
        return colors[Math.abs(hash) % colors.length];
    }
    
    getDefaultAvatar(username) {
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=6366f1&color=fff&size=32`;
    }
    
    isEditableElement(element) {
        return element && (
            element.contentEditable === 'true' ||
            element.tagName === 'INPUT' ||
            element.tagName === 'TEXTAREA'
        );
    }
    
    showNotification(message, type = 'info') {
        // Create a simple notification for collaboration events
        const notification = document.createElement('div');
        notification.className = `fixed bottom-4 right-4 z-50 px-4 py-2 rounded-lg text-white ${
            type === 'success' ? 'bg-green-500' : 
            type === 'error' ? 'bg-red-500' : 
            'bg-blue-500'
        } opacity-0 transition-opacity duration-300`;
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-users mr-2"></i>
                ${message}
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Fade in
        setTimeout(() => {
            notification.classList.remove('opacity-0');
        }, 100);
        
        // Fade out and remove
        setTimeout(() => {
            notification.classList.add('opacity-0');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
    
    // Utility function for throttling
    throttle(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            if (!timeout) {
                timeout = setTimeout(later, wait);
            }
        };
    }
}

// Export for use in templates
window.CollaborationManager = CollaborationManager;