const LOCAL_API_URL = 'http://localhost:8000/api';
// const ONLINE_API_URL = 'https://tableguerte.free.laravel.cloud/api';

function normalizeUrl(value) {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/\/+$/, '');
}

function ensureApiSuffix(url) {
  if (!url) return '';
  return /\/api$/i.test(url) ? url : `${url}/api`;
}

function isLocalHostname(hostname) {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
}

export function resolveApiBaseUrl() {
  const envApiUrl = normalizeUrl(process.env.REACT_APP_API_URL || process.env.ONLINE_API_URL);
  if (typeof window !== 'undefined') {
    if (isLocalHostname(window.location.hostname)) {
      // En dev local, passer par le proxy CRA (/api) pour éviter les blocages CORS.
      return '/api';
    }
  }

  if (envApiUrl) return ensureApiSuffix(envApiUrl);

  if (typeof window !== 'undefined') {
    const origin = normalizeUrl(window.location.origin);
    if (origin) return `${origin}/api`;
  }

  return LOCAL_API_URL;
}

export function resolveApiOrigin() {
  return resolveApiBaseUrl().replace(/\/api$/, '');
}
