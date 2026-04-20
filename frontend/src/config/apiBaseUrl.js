const LOCAL_API_URL = 'http://localhost:8000/api';

function normalizeUrl(value) {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/\/+$/, '');
}

function isLocalHostname(hostname) {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
}

export function resolveApiBaseUrl() {
  const envApiUrl = normalizeUrl(process.env.REACT_APP_API_URL);
  if (envApiUrl) return envApiUrl;

  if (typeof window !== 'undefined') {
    if (isLocalHostname(window.location.hostname)) {
      return LOCAL_API_URL;
    }

    const origin = normalizeUrl(window.location.origin);
    if (origin) return `${origin}/api`;
  }

  return LOCAL_API_URL;
}

export function resolveApiOrigin() {
  return resolveApiBaseUrl().replace(/\/api$/, '');
}
