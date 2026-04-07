const CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_UPLOAD_URL = CLOUD_NAME
  ? `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`
  : '';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
const MAX_IMAGE_SIZE_MB = 5;
const MAX_IMAGE_COUNT = 5;

function assertCloudinaryConfig() {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      'Configuration Cloudinary manquante: REACT_APP_CLOUDINARY_CLOUD_NAME et REACT_APP_CLOUDINARY_UPLOAD_PRESET.'
    );
  }
}

function validateFile(file) {
  if (!file) return 'Fichier invalide.';
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'Type de fichier non autorisé. Utilise JPG, PNG ou WEBP.';
  }
  const maxBytes = MAX_IMAGE_SIZE_MB * 1024 * 1024;
  if (file.size > maxBytes) {
    return `Image trop lourde (max ${MAX_IMAGE_SIZE_MB}MB).`;
  }
  return null;
}

async function uploadSingle(file, folder = 'app-produits-locaux/products') {
  const validationError = validateFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  if (folder) {
    formData.append('folder', folder);
  }

  const response = await fetch(CLOUDINARY_UPLOAD_URL, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload?.error?.message || 'Échec upload Cloudinary.');
  }

  const data = await response.json();
  if (!data?.secure_url) {
    throw new Error('Cloudinary n\'a pas retourné d\'URL sécurisée.');
  }

  return data.secure_url;
}

export const cloudinaryService = {
  MAX_IMAGE_COUNT,

  validateFiles(files = []) {
    if (files.length > MAX_IMAGE_COUNT) {
      return `Vous pouvez envoyer jusqu'à ${MAX_IMAGE_COUNT} images maximum.`;
    }

    for (const file of files) {
      const validationError = validateFile(file);
      if (validationError) return validationError;
    }

    return null;
  },

  async uploadImages(files = [], folder) {
    assertCloudinaryConfig();

    if (!Array.isArray(files) || files.length === 0) {
      return [];
    }

    const validationError = this.validateFiles(files);
    if (validationError) {
      throw new Error(validationError);
    }

    const urls = [];
    for (const file of files) {
      const url = await uploadSingle(file, folder);
      urls.push(url);
    }
    return urls;
  },
};
