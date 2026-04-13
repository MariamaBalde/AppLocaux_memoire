import api from './api';

function buildQuery(filters = {}) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      const normalizedKey = key === 'perPage' ? 'per_page' : key;
      params.append(normalizedKey, value);
    }
  });

  return params.toString();
}

export const vendorDashboardService = {
  async getDashboardData(filters = {}) {
    try {
      const query = buildQuery(filters);
      const response = await api.get(`/vendor/dashboard/overview${query ? `?${query}` : ''}`);
      const payload = response?.data?.data || response?.data || {};

      return {
        stats: payload.stats || {
          monthlyRevenue: 0,
          ordersCount: 0,
          pendingCount: 0,
          totalProducts: 0,
          activeProducts: 0,
          outOfStockProducts: 0,
          shopRating: 0,
        },
        weeklyRevenue: payload.weeklyRevenue || [],
        destinations: payload.destinations || { total: 0, items: [] },
        topProducts: payload.topProducts || [],
        recentOrders: payload.recentOrders || [],
        pagination: payload.pagination || {
          page: 1,
          perPage: 6,
          totalOrders: 0,
          totalPages: 1,
        },
        notifications: payload.notifications || { pendingOrders: 0 },
      };
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async getStats(filters = {}) {
    const query = buildQuery(filters);
    const response = await api.get(`/vendor/dashboard/stats${query ? `?${query}` : ''}`);
    return response.data;
  },

  async getWeeklyRevenue(filters = {}) {
    const query = buildQuery(filters);
    const response = await api.get(`/vendor/dashboard/revenue-weekly${query ? `?${query}` : ''}`);
    return response.data;
  },

  async getDestinations(filters = {}) {
    const query = buildQuery(filters);
    const response = await api.get(`/vendor/dashboard/destinations${query ? `?${query}` : ''}`);
    return response.data;
  },

  async getRecentOrders(filters = {}) {
    const query = buildQuery(filters);
    const response = await api.get(`/vendor/dashboard/recent-orders${query ? `?${query}` : ''}`);
    return response.data;
  },

  async getTopProducts(filters = {}) {
    const query = buildQuery(filters);
    const response = await api.get(`/vendor/dashboard/top-products${query ? `?${query}` : ''}`);
    return response.data;
  },

  async getVendorOrderDetail(orderId) {
    try {
      const response = await api.get(`/vendor/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async updateVendorOrderStatus(orderId, status) {
    try {
      const response = await api.patch(`/vendor/orders/${orderId}/status`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async updateVendorOrderTracking(orderId, trackingNumber) {
    try {
      const response = await api.patch(`/vendor/orders/${orderId}/tracking`, {
        tracking_number: trackingNumber,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
