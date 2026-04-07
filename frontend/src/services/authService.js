import api from './api';

function normalizeAuthPayload(payload) {
  const root = payload || {};
  const data = root.data || root;

  return {
    success: Boolean(root.success ?? data.success ?? false),
    message: root.message || data.message,
    user: data.user || root.user || null,
    token: data.access_token || data.token || root.access_token || root.token || null,
  };
}

export const authService = {
  // Connexion
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });

      const normalized = normalizeAuthPayload(response.data);

      if (normalized.success && normalized.token && normalized.user) {
        localStorage.setItem('token', normalized.token);
        localStorage.setItem('user', JSON.stringify(normalized.user));
        return {
          success: true,
          user: normalized.user,
          token: normalized.token,
          message: normalized.message,
        };
      }

      throw new Error(response.data.message || 'Erreur de connexion');
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Inscription
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);

      const normalized = normalizeAuthPayload(response.data);

      if (normalized.success && normalized.token && normalized.user) {
        localStorage.setItem('token', normalized.token);
        localStorage.setItem('user', JSON.stringify(normalized.user));
        return {
          success: true,
          user: normalized.user,
          token: normalized.token,
          message: normalized.message,
        };
      }

      throw new Error(response.data.message || 'Erreur d\'inscription');
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Déconnexion
  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  // Récupérer l'utilisateur actuel
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Vérifier si l'utilisateur est authentifié
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  // Récupérer le profil depuis l'API
  async getProfile() {
    try {
      const response = await api.get('/auth/me');
      if (response.data.success) {
        const user = response.data.data || response.data.user;
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          return user;
        }
      }
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
