export class Presence {
    constructor() {
        this.container = document.querySelector('#presence-indicators');
        this.indicators = new Map();
    }

    updateCollaborators(collaborators) {
        collaborators.forEach(([userId, data]) => {
            this.updateIndicator(userId, data);
        });
    }

    updateIndicator(userId, data) {
        let indicator = this.indicators.get(userId);
        
        if (!indicator) {
            indicator = this.createIndicator(userId);
            this.indicators.set(userId, indicator);
        }

        indicator.classList.toggle('active', data.status === 'active');
        indicator.title = `${data.name} - ${data.status}`;
    }

    createIndicator(userId) {
        const indicator = document.createElement('div');
        indicator.className = 'presence-indicator';
        this.container.appendChild(indicator);
        return indicator;
    }
}