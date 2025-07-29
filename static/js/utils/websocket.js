export class WebSocketClient {
    constructor(options = {}) {
        this.endpoint = options.endpoint;
        this.onMessage = options.onMessage;
        this.onConnect = options.onConnect;
        this.onDisconnect = options.onDisconnect;
        this.autoReconnect = options.autoReconnect !== false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = options.maxReconnectAttempts || 5;
        this.reconnectDelay = options.reconnectDelay || 1000;

        this.connect();
    }

    connect() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}${this.endpoint}`;

        this.ws = new WebSocket(wsUrl);
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.ws.addEventListener('open', () => {
            this.reconnectAttempts = 0;
            if (this.onConnect) {
                this.onConnect();
            }
        });

        this.ws.addEventListener('message', (event) => {
            try {
                const message = JSON.parse(event.data);
                if (this.onMessage) {
                    this.onMessage(message);
                }
            } catch (error) {
                console.error('Failed to parse WebSocket message:', error);
            }
        });

        this.ws.addEventListener('close', () => {
            if (this.onDisconnect) {
                this.onDisconnect();
            }

            if (this.autoReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
                setTimeout(() => {
                    this.reconnectAttempts++;
                    this.connect();
                }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts));
            }
        });

        this.ws.addEventListener('error', (error) => {
            console.error('WebSocket error:', error);
        });
    }

    send(data) {
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        } else {
            console.warn('WebSocket is not open. Message not sent:', data);
        }
    }

    disconnect() {
        this.autoReconnect = false;
        if (this.ws) {
            this.ws.close();
        }
    }
}