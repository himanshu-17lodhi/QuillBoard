export class WebSocketManager {
    constructor() {
        this.connections = new Map();
        this.messageHandlers = new Set();
    }

    connect(path) {
        const ws = new WebSocket(`ws://${window.location.host}${path}`);
        
        ws.onmessage = (event) => {
            this.messageHandlers.forEach(handler => handler(event.data));
        };

        this.connections.set(path, ws);
        return ws;
    }

    send(path, data) {
        const ws = this.connections.get(path);
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(data));
        }
    }

    onMessage(handler) {
        this.messageHandlers.add(handler);
    }
}