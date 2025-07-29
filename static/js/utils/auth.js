export class AuthManager {
    constructor(api) {
        this.api = api;
        this.user = null;
    }

    async getCurrentUser() {
        if (!this.user) {
            const response = await this.api.request('GET', '/auth/me/');
            this.user = response.data;
        }
        return this.user;
    }

    isAuthenticated() {
        return !!this.user;
    }

    async login(credentials) {
        const response = await this.api.login(credentials);
        this.user = response.data.user;
        return response;
    }

    async logout() {
        await this.api.request('POST', '/auth/logout/');
        this.user = null;
    }
}