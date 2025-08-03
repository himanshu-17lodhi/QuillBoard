import type { WebSocketMessage, BlockUpdateMessage, PageUpdateMessage } from '../types';

export type WebSocketEventHandler = (message: WebSocketMessage) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectInterval: number = 3000;
  private maxReconnectAttempts: number = 5;
  private reconnectAttempts: number = 0;
  private eventHandlers: Map<string, WebSocketEventHandler[]> = new Map();
  private isConnected: boolean = false;
  private url: string = '';

  constructor() {
    this.setupEventHandlers();
  }

  connect(pageId?: string, workspaceSlug?: string) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    
    if (pageId) {
      this.url = `${protocol}//${host}/ws/pages/${pageId}/`;
    } else if (workspaceSlug) {
      this.url = `${protocol}//${host}/ws/workspaces/${workspaceSlug}/`;
    } else {
      this.url = `${protocol}//${host}/ws/general/`;
    }

    this.disconnect(); // Close existing connection
    this.ws = new WebSocket(this.url);
    this.setupWebSocketEvents();
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
    }
  }

  private setupWebSocketEvents() {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connected', { type: 'connected', data: {}, timestamp: new Date().toISOString() });
    };

    this.ws.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      this.isConnected = false;
      this.emit('disconnected', { type: 'disconnected', data: { code: event.code, reason: event.reason }, timestamp: new Date().toISOString() });
      
      // Attempt to reconnect
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(() => {
          this.reconnectAttempts++;
          console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
          this.connect();
        }, this.reconnectInterval);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', { type: 'error', data: error, timestamp: new Date().toISOString() });
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
  }

  private handleMessage(message: WebSocketMessage) {
    console.log('WebSocket message received:', message);
    
    // Emit to specific event handlers
    this.emit(message.type, message);
    
    // Emit to general message handlers
    this.emit('message', message);
  }

  private setupEventHandlers() {
    // Block update handler
    this.on('block_update', (message: WebSocketMessage) => {
      const blockMessage = message as BlockUpdateMessage;
      console.log('Block updated:', blockMessage.data.block_id);
      // Emit to block-specific handlers
      this.emit(`block_${blockMessage.data.block_id}`, message);
    });

    // Page update handler
    this.on('page_update', (message: WebSocketMessage) => {
      const pageMessage = message as PageUpdateMessage;
      console.log('Page updated:', pageMessage.data.page_id);
      // Emit to page-specific handlers
      this.emit(`page_${pageMessage.data.page_id}`, message);
    });
  }

  send(message: any) {
    if (this.ws && this.isConnected) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected. Message not sent:', message);
    }
  }

  // Send block update
  sendBlockUpdate(blockId: string, content: any, action: 'update' | 'create' | 'delete' = 'update') {
    this.send({
      type: 'block_update',
      data: {
        block_id: blockId,
        content,
        action,
      },
    });
  }

  // Send page update
  sendPageUpdate(pageId: string, data: any, action: 'update' | 'create' | 'delete' = 'update') {
    this.send({
      type: 'page_update',
      data: {
        page_id: pageId,
        ...data,
        action,
      },
    });
  }

  // Send cursor position for collaborative editing
  sendCursorPosition(blockId: string, position: { start: number; end: number }) {
    this.send({
      type: 'cursor_position',
      data: {
        block_id: blockId,
        position,
      },
    });
  }

  // Event handler management
  on(event: string, handler: WebSocketEventHandler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  off(event: string, handler: WebSocketEventHandler) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private emit(event: string, message: WebSocketMessage) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(message));
    }
  }

  // Connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      url: this.url,
      reconnectAttempts: this.reconnectAttempts,
    };
  }
}

// Export singleton instance
export const webSocketService = new WebSocketService();
export default webSocketService;