import api from './api';

export const categoryService = {
  // Liste des catégories
  async getCategories() {
    try {
      const response = await api.get('/categories');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Détail d'une catégorie
  async getCategory(id) {
    try {
      const response = await api.get(`/categories/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Produits d'une catégorie
  async getCategoryProducts(id, filters = {}) {
    try {
      const params = new URLSearchParams(filters);
      const response = await api.get(`/categories/${id}/products?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};