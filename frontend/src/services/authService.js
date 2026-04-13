import api from './api';
import { authStorage } from './authStorage';

function normalizeAuthPayload(payload) {
  const root = payload || {};
  const data = root.data || root;

  return {
    success: Boolean(root.success ?? data.success ?? false),
    message: root.message || data.message,
    user: data.user || root.user || null,
    token: data.access_token || data.token || root.access_token || root.token || null,
    requiresEmailVerification: Boolean(data.requires_email_verification || root.requires_email_verification),
    verificationSent: Boolean(data.verification_sent || root.verification_sent),
  };
}

export const authService = {
  // Connexion
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });

      const normalized = normalizeAuthPayload(response.data);

      if (normalized.success && normalized.user) {
        if (normalized.token) {
          authStorage.setToken(normalized.token);
          authStorage.setUser(normalized.user);
        } else {
          authStorage.clear();
          authStorage.setUser(normalized.user);
        }

        return {
          success: true,
          user: normalized.user,
          token: normalized.token || null,
          message: normalized.message,
          requiresEmailVerification: normalized.requiresEmailVerification,
          verificationSent: normalized.verificationSent,
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

      if (normalized.success && normalized.user) {
        if (normalized.token) {
          authStorage.setToken(normalized.token);
          authStorage.setUser(normalized.user);
        } else {
          authStorage.clear();
          authStorage.setUser(normalized.user);
        }

        return {
          success: true,
          user: normalized.user,
          token: normalized.token || null,
          message: normalized.message,
          requiresEmailVerification: normalized.requiresEmailVerification,
          verificationSent: normalized.verificationSent,
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
    } catch {
      // Même en cas d'échec API, on purge la session locale.
    } finally {
      authStorage.clear();
    }
  },

  // Récupérer l'utilisateur actuel
  getCurrentUser() {
    return authStorage.getUser();
  },

  // Vérifier si l'utilisateur est authentifié
  isAuthenticated() {
    return Boolean(authStorage.getToken() || authStorage.getUser());
  },

  // Récupérer le profil depuis l'API
  async getProfile() {
    try {
      const response = await api.get('/auth/me');
      if (response.data.success) {
        const user = response.data.data || response.data.user;
        if (user) {
          authStorage.setUser(user);
          return user;
        }
      }
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async bootstrapAuth() {
    const cachedUser = authStorage.getUser();
    const hasToken = Boolean(authStorage.getToken());

    if (!hasToken) {
      if (!cachedUser) {
        return { isAuthenticated: false, user: null };
      }
      authStorage.clear();
      return { isAuthenticated: false, user: null };
    }

    try {
      const user = await this.getProfile();
      return {
        isAuthenticated: Boolean(user),
        user: user || null,
      };
    } catch {
      if (cachedUser && hasToken) {
        return { isAuthenticated: true, user: cachedUser };
      }
      authStorage.clear();
      return { isAuthenticated: false, user: null };
    }
  },

  async forgotPassword(email) {
    const enabled = process.env.REACT_APP_ENABLE_PASSWORD_RESET_API !== 'false';
    if (!enabled) {
      throw new Error('Réinitialisation de mot de passe non disponible sur cette API pour le moment.');
    }
    const response = await api.post('/password/forgot', { email });
    return response.data;
  },

  async resetPassword(payload) {
    const enabled = process.env.REACT_APP_ENABLE_PASSWORD_RESET_API !== 'false';
    if (!enabled) {
      throw new Error('Réinitialisation de mot de passe non disponible sur cette API pour le moment.');
    }
    const response = await api.post('/password/reset', payload);
    return response.data;
  },

  async resendVerification() {
    try {
      const response = await api.post('/auth/email/verification-notification');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
