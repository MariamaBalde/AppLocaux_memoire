import api from './api';

export const cartService = {
  // Récupérer le panier
  async getCart() {
    try {
      const response = await api.get('/cart');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Ajouter au panier
  async addToCart(productId, quantity = 1) {
    try {
      const response = await api.post('/cart', {
        product_id: productId,
        quantity,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Mettre à jour la quantité
  async updateCartItem(cartItemId, quantity) {
    try {
      const response = await api.patch(`/cart/${cartItemId}`, { quantity });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Supprimer du panier
  async removeFromCart(cartItemId) {
    try {
      const response = await api.delete(`/cart/${cartItemId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Vider le panier
  async clearCart() {
    try {
      const response = await api.delete('/cart');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Vérifier la disponibilité
  async checkCartAvailability() {
    try {
      const response = await api.get('/cart/check');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};