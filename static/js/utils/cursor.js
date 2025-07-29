export class CursorManager {
    constructor() {
        this.cursors = new Map();
    }

    updateCursor(userId, position) {
        let cursor = this.cursors.get(userId);
        
        if (!cursor) {
            cursor = this.createCursor(userId);
            this.cursors.set(userId, cursor);
        }

        cursor.style.transform = `translate(${position.x}px, ${position.y}px)`;
    }

    createCursor(userId) {
        const cursor = document.createElement('div');
        cursor.className = 'cursor-indicator';
        document.body.appendChild(cursor);
        return cursor;
    }

    removeCursor(userId) {
        const cursor = this.cursors.get(userId);
        if (cursor) {
            cursor.remove();
            this.cursors.delete(userId);
        }
    }
}