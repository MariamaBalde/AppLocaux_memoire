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

  async getTopVendors(limit = 10) {
    try {
      const response = await api.get(`/admin/top-vendors?limit=${encodeURIComponent(limit)}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async getRecentOrders(limit = 10) {
    try {
      const response = await api.get(`/admin/recent-orders?limit=${encodeURIComponent(limit)}`);
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
};
