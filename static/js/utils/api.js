export class ApiClient {
    constructor() {
        this.baseUrl = '/api/v1';
        this.headers = {
            'Content-Type': 'application/json',
            'X-CSRFToken': this.getCsrfToken()
        };
    }

    getCsrfToken() {
        return document.querySelector('[name=csrfmiddlewaretoken]')?.value;
    }

    async request(method, endpoint, data = null) {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method,
            headers: this.headers,
            body: data ? JSON.stringify(data) : null,
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        return response.json();
    }

    // Auth endpoints
    async login(credentials) {
        return this.request('POST', '/auth/login/', credentials);
    }

    // Workspace endpoints
    async getWorkspaces() {
        return this.request('GET', '/workspaces/');
    }

    // Page endpoints
    async getPage(id) {
        return this.request('GET', `/pages/${id}/`);
    }

    // Block endpoints
    async saveBlock(blockData) {
        return this.request('POST', '/blocks/', blockData);
    }
}