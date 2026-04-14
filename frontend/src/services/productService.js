import api from './api';

function extractProductList(payload) {
  const data = payload?.data ?? payload;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function buildQuery(filters = {}) {
  const params = new URLSearchParams();

  Object.keys(filters).forEach((key) => {
    if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
      params.append(key, filters[key]);
    }
  });

  return params.toString();
}

export const productService = {
  // Liste des produits avec filtres
  async getProducts(filters = {}) {
    try {
      const query = buildQuery(filters);
      const response = await api.get(`/products${query ? `?${query}` : ''}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Détail d'un produit
  async getProduct(id) {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Recherche de produits
  async searchProducts(query, filters = {}) {
    try {
      const params = buildQuery({ q: query, ...filters });
      const response = await api.get(`/products/search?${params}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Suggestions (fallback sur recherche)
  async getSuggestions(query) {
    try {
      if (!query?.trim()) {
        return { success: true, data: [] };
      }

      const response = await this.searchProducts(query, { per_page: 8 });
      const products = extractProductList(response);
      const suggestions = products.map((product) => ({
        id: product.id,
        name: product.name,
      }));

      return { success: true, data: suggestions };
    } catch {
      return { success: true, data: [] };
    }
  },

  // Produits populaires (fallback sur liste triée)
  async getPopularProducts(limit = 8) {
    try {
      const response = await this.getProducts({
        sort_by: 'created_at',
        sort_order: 'desc',
        per_page: limit,
      });

      const items = extractProductList(response).slice(0, limit);
      return { success: true, data: items };
    } catch {
      return { success: true, data: [] };
    }
  },

  // Nouveautés
  async getNewProducts(limit = 8) {
    try {
      const response = await api.get(`/products/new?limit=${limit}`);
      const data = response.data;
      const items = extractProductList(data).slice(0, limit);
      return { success: true, data: items };
    } catch {
      // Fallback sur les produits populaires
      return this.getPopularProducts(limit);
    }
  },

  // Produits similaires (fallback local par catégorie)
  async getSimilarProducts(productId, limit = 8) {
    try {
      const productResponse = await this.getProduct(productId);
      const baseProduct = productResponse?.data ?? productResponse;
      const categoryId = baseProduct?.category?.id || baseProduct?.category_id;

      if (!categoryId) return { success: true, data: [] };

      const listResponse = await this.getProducts({
        category_id: categoryId,
        per_page: Math.max(limit + 1, 8),
      });

      const items = extractProductList(listResponse)
        .filter((item) => Number(item.id) !== Number(productId))
        .slice(0, limit);

      return { success: true, data: items };
    } catch {
      return { success: true, data: [] };
    }
  },

  // Créer un produit (vendeur)
  async createProduct(productData) {
    try {
      const isFormData = typeof FormData !== 'undefined' && productData instanceof FormData;
      const response = await api.post(
        '/products',
        productData,
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

  // Produits du vendeur connecté
  async getVendorProducts(filters = {}) {
    try {
      const query = buildQuery(filters);
      const response = await api.get(`/vendeur/products${query ? `?${query}` : ''}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Mettre à jour un produit
  async updateProduct(id, productData) {
    try {
      const response = await api.put(`/products/${id}`, productData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Activer/désactiver un produit
  async toggleProduct(id) {
    try {
      const response = await api.patch(`/products/${id}/toggle`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Mettre à jour le stock d'un produit
  async updateProductStock(id, quantity) {
    try {
      const response = await api.patch(`/products/${id}/stock`, { quantity });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Supprimer un produit
  async deleteProduct(id) {
    try {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
