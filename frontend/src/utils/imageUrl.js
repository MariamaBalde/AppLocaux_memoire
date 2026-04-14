function getApiOrigin() {
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
  return apiUrl.replace(/\/api\/?$/, '');
}

export function resolveImageUrl(rawUrl, fallback = '') {
  if (!rawUrl || typeof rawUrl !== 'string') return fallback;

  const trimmed = rawUrl.trim();
  if (!trimmed) return fallback;

  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const parsed = new URL(trimmed);
      if (parsed.pathname.startsWith('/storage/')) {
        return `${getApiOrigin()}${parsed.pathname}`;
      }
      return trimmed;
    } catch {
      return trimmed;
    }
  }

  if (trimmed.startsWith('/storage/')) {
    return `${getApiOrigin()}${trimmed}`;
  }

  if (trimmed.startsWith('storage/')) {
    return `${getApiOrigin()}/${trimmed}`;
  }

  // Données seed legacy: "products/xxx.jpg" (sans /storage)
  if (trimmed.startsWith('products/')) {
    return `${getApiOrigin()}/storage/${trimmed}`;
  }

  // Données legacy: "/products/xxx.jpg"
  if (trimmed.startsWith('/products/')) {
    return `${getApiOrigin()}/storage${trimmed}`;
  }

  return trimmed;
}
