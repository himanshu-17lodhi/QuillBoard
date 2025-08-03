// API base configuration
const API_BASE_URL = ''; // Use relative URLs for proxying

// Helper function to get CSRF token
const getCSRFToken = () => {
  const name = 'csrftoken';
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
};

// API client with authentication and error handling
class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCSRFToken() || '',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for session auth
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Authentication methods
  async login(username: string, password: string) {
    return this.request('/api/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async register(userData: { username: string; email: string; password: string; confirmPassword: string }) {
    return this.request('/api/auth/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout() {
    return this.request('/api/auth/logout/', {
      method: 'POST',
    });
  }

  async getCurrentUser() {
    return this.request('/api/auth/user/');
  }

  // Workspace methods
  async getWorkspaces() {
    return this.request('/api/workspaces/');
  }

  async createWorkspace(data: { name: string; description?: string; icon?: string }) {
    return this.request('/api/workspaces/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getWorkspace(slug: string) {
    return this.request(`/api/workspaces/${slug}/`);
  }

  async updateWorkspace(slug: string, data: any) {
    return this.request(`/api/workspaces/${slug}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteWorkspace(slug: string) {
    return this.request(`/api/workspaces/${slug}/`, {
      method: 'DELETE',
    });
  }

  // Page methods
  async getPages(workspaceSlug: string) {
    return this.request(`/api/workspaces/${workspaceSlug}/pages/`);
  }

  async createPage(workspaceSlug: string, data: { title: string; parent?: string }) {
    return this.request(`/api/workspaces/${workspaceSlug}/pages/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPage(pageId: string) {
    return this.request(`/api/pages/${pageId}/`);
  }

  async updatePage(pageId: string, data: any) {
    return this.request(`/api/pages/${pageId}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Block methods
  async getBlocks(pageId: string) {
    return this.request(`/api/pages/${pageId}/blocks/`);
  }

  async createBlock(pageId: string, data: any) {
    return this.request(`/api/pages/${pageId}/blocks/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBlock(blockId: string, data: any) {
    return this.request(`/api/blocks/${blockId}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteBlock(blockId: string) {
    return this.request(`/api/blocks/${blockId}/`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;