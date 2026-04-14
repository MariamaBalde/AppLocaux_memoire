import axios from 'axios';
import { authStorage } from './authStorage';

// URL de votre API Laravel
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

let isRedirectingToLogin = false;

// Intercepteur pour ajouter le token à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = authStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const hadAuth = Boolean(authStorage.getToken() || authStorage.getUser());
      authStorage.clear();

      const currentPath = window.location.pathname;
      if (hadAuth && !isRedirectingToLogin && currentPath !== '/login') {
        isRedirectingToLogin = true;
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
