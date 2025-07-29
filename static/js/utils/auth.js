import { ApiClient } from './api.js';

export class AuthManager {
    constructor() {
        this.api = new ApiClient();
        this.currentUser = null;
        this.listeners = new Set();
    }

    async initialize() {
        try {
            const user = await this.api.get('/api/auth/me/');
            this.setCurrentUser(user);
            return user;
        } catch (error) {
            this.setCurrentUser(null);
            throw error;
        }
    }

    async login(email, password) {
        try {
            const response = await this.api.post('/api/auth/login/', {
                email,
                password
            });
            this.setCurrentUser(response.user);
            return response;
        } catch (error) {
            this.setCurrentUser(null);
            throw error;
        }
    }

    async logout() {
        try {
            await this.api.post('/api/auth/logout/');
            this.setCurrentUser(null);
        } catch (error) {
            console.error('Logout failed:', error);
            throw error;
        }
    }

    async register(userData) {
        const response = await this.api.post('/api/auth/register/', userData);
        return response;
    }

    async resetPassword(email) {
        return await this.api.post('/api/auth/reset-password/', { email });
    }

    async verifyEmail(token) {
        return await this.api.post('/api/auth/verify-email/', { token });
    }

    setCurrentUser(user) {
        this.currentUser = user;
        this.notifyListeners();
    }

    addListener(callback) {
        this.listeners.add(callback);
        callback(this.currentUser);
    }

    removeListener(callback) {
        this.listeners.delete(callback);
    }

    notifyListeners() {
        this.listeners.forEach(callback => callback(this.currentUser));
    }

    isAuthenticated() {
        return !!this.currentUser;
    }

    hasPermission(permission) {
        return this.currentUser?.permissions?.includes(permission) || false;
    }

    hasRole(role) {
        return this.currentUser?.roles?.includes(role) || false;
    }
}

export const auth = new AuthManager();