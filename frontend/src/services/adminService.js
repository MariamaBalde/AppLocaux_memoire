import api from './api';

export const adminService = {
  async getUsers(filters = {}) {
    try {
      const params = new URLSearchParams(
        Object.entries(filters).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null && value !== '') acc[key] = String(value);
          return acc;
        }, {})
      );
      const response = await api.get(`/admin/users${params.toString() ? `?${params.toString()}` : ''}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async getDashboardStats() {
    try {
      const response = await api.get('/admin/dashboard/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async getAdvancedStats() {
    try {
      const response = await api.get('/admin/dashboard/advanced-stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async getSalesPerMonth(year) {
    try {
      const query = year ? `?year=${encodeURIComponent(year)}` : '';
      const response = await api.get(`/admin/charts/sales-per-month${query}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async getTopVendors(perPage = 10, page = 1) {
    try {
      const params = new URLSearchParams({
        per_page: String(perPage),
        page: String(page),
      });
      const response = await api.get(`/admin/top-vendors?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async getRecentOrders(perPage = 10, page = 1) {
    try {
      const params = new URLSearchParams({
        per_page: String(perPage),
        page: String(page),
      });
      const response = await api.get(`/admin/recent-orders?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async getPendingVendors() {
    try {
      const response = await api.get('/admin/pending-vendors');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async getVendorUsers(filters = {}) {
    try {
      const params = new URLSearchParams({
        role: 'vendeur',
        per_page: String(filters.per_page ?? 200),
        ...(filters.search ? { search: filters.search } : {}),
      });
      const response = await api.get(`/admin/users?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async createProductForVendor(payload) {
    try {
      const isFormData = typeof FormData !== 'undefined' && payload instanceof FormData;
      const response = await api.post(
        '/admin/products',
        payload,
        isFormData
          ? {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }
          : undefined
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async approveVendor(vendeurId) {
    try {
      const response = await api.post(`/admin/vendors/${encodeURIComponent(vendeurId)}/approve`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async rejectVendor(vendeurId, reason = '') {
    try {
      const response = await api.post(`/admin/vendors/${encodeURIComponent(vendeurId)}/reject`, {
        reason,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async toggleUserStatus(userId) {
    try {
      const response = await api.post(`/admin/users/${encodeURIComponent(userId)}/toggle-status`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async getAllProducts(filters = {}) {
    try {
      const params = new URLSearchParams(
        Object.entries(filters).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null && value !== '') acc[key] = String(value);
          return acc;
        }, {})
      );
      const response = await api.get(`/admin/products${params.toString() ? `?${params.toString()}` : ''}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async updateProductStatus(productId, status) {
    try {
      const response = await api.patch(`/admin/products/${encodeURIComponent(productId)}/status`, {
        status,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async toggleFeaturedProduct(productId) {
    try {
      const response = await api.patch(`/admin/products/${encodeURIComponent(productId)}/featured`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async deleteProduct(productId) {
    try {
      const response = await api.delete(`/admin/products/${encodeURIComponent(productId)}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
