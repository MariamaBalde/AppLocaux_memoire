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

  // Endpoint non implémenté côté backend: on reconstruit un suivi à partir du statut
  async getTrackingInfo(id) {
    const response = await this.getOrder(id);
    const order = response?.data || response;
    const status = order?.status || 'pending';
    const createdAt = order?.created_at || new Date().toISOString();

    const steps = [
      { key: 'pending', name: 'Commande reçue' },
      { key: 'processing', name: 'Commande en préparation' },
      { key: 'shipped', name: 'Commande expédiée' },
      { key: 'delivered', name: 'Commande livrée' },
    ];

    const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(status);

    const events = steps.map((step, index) => ({
      name: step.name,
      completed: currentIndex >= index,
      date: createdAt,
    }));

    return { success: true, data: { events } };
  },
};
