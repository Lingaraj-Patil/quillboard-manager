const API_BASE_URL = 'https://backend-articel-project.vercel.app/api';

class ApiClient {
  private getAuthHeaders(token?: string) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    return headers;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async registerUser(userData: { username: string; email: string; password: string }) {
    return this.request('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async loginUser(credentials: { email: string; password: string }) {
    return this.request('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async registerAdmin(adminData: { username: string; email: string; password: string }) {
    return this.request('/admin/register', {
      method: 'POST',
      body: JSON.stringify(adminData),
    });
  }

  async loginAdmin(credentials: { email: string; password: string }) {
    return this.request('/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // User endpoints
  async getUserDashboard(token: string) {
    return this.request('/users/dashboard', {
      headers: this.getAuthHeaders(token),
    });
  }

  async getAllArticles(params?: { page?: number; limit?: number; category?: string; search?: string }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    const queryString = searchParams.toString();
    return this.request(`/users/articles${queryString ? `?${queryString}` : ''}`);
  }

  async getArticleById(id: string) {
    return this.request(`/users/articles/${id}`);
  }

  async createArticle(articleData: any, token: string) {
    return this.request('/users/articles', {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(articleData),
    });
  }

  async getUserArticles(token: string, params?: { page?: number; limit?: number; status?: string }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    const queryString = searchParams.toString();
    return this.request(`/users/my-articles${queryString ? `?${queryString}` : ''}`, {
      headers: this.getAuthHeaders(token),
    });
  }

  async updateArticle(id: string, articleData: any, token: string) {
    return this.request(`/users/articles/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(articleData),
    });
  }

  async deleteArticle(id: string, token: string) {
    return this.request(`/users/articles/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(token),
    });
  }

  // Admin endpoints
  async getAdminDashboard(token: string) {
    return this.request('/admin/dashboard', {
      headers: this.getAuthHeaders(token),
    });
  }

  async getPendingArticles(token: string, params?: { page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    const queryString = searchParams.toString();
    return this.request(`/admin/articles/pending${queryString ? `?${queryString}` : ''}`, {
      headers: this.getAuthHeaders(token),
    });
  }

  async getAllArticlesAdmin(token: string, params?: { page?: number; limit?: number; status?: string; search?: string }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    const queryString = searchParams.toString();
    return this.request(`/admin/articles${queryString ? `?${queryString}` : ''}`, {
      headers: this.getAuthHeaders(token),
    });
  }

  async approveArticle(id: string, token: string) {
    return this.request(`/admin/articles/${id}/approve`, {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
    });
  }

  async rejectArticle(id: string, token: string, reason?: string) {
    return this.request(`/admin/articles/${id}/reject`, {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify({ reason }),
    });
  }

  async unpublishArticle(id: string, token: string, reason?: string) {
    return this.request(`/admin/articles/${id}/unpublish`, {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify({ reason }),
    });
  }

  async deleteArticleAdmin(id: string, token: string) {
    return this.request(`/admin/articles/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(token),
    });
  }

  async getAllUsers(token: string, params?: { page?: number; limit?: number; search?: string }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    const queryString = searchParams.toString();
    return this.request(`/admin/users${queryString ? `?${queryString}` : ''}`, {
      headers: this.getAuthHeaders(token),
    });
  }

  async getAnalytics(token: string, period?: string) {
    const queryString = period ? `?period=${period}` : '';
    return this.request(`/admin/analytics${queryString}`, {
      headers: this.getAuthHeaders(token),
    });
  }
}

export const apiClient = new ApiClient();
