import api from './api';

export const orderService = {
  // Créer une commande
  async createOrder(orderData) {
    try {
      const response = await api.post('/orders', orderData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Liste des commandes
  async getOrders(filters = {}) {
    try {
      const params = new URLSearchParams(filters);
      const response = await api.get(`/orders?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Alias legacy pour compatibilité pages existantes
  async getAll(filters = {}) {
    return this.getOrders(filters);
  },

  // Détail d'une commande
  async getOrder(id) {
    try {
      const response = await api.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Alias legacy pour compatibilité pages existantes
  async getById(id) {
    return this.getOrder(id);
  },

  // Annuler une commande
  async cancelOrder(id) {
    try {
      const response = await api.patch(`/orders/${id}/cancel`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Confirmer le paiement
  async confirmPayment(id, paymentData) {
    try {
      const response = await api.post(`/orders/${id}/confirm-payment`, paymentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
