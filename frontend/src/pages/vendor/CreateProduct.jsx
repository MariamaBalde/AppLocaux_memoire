import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import VendorShell from '../../components/vendor/VendorShell';
import { categoryService } from '../../services/categoryService';
import { cloudinaryService } from '../../services/cloudinaryService';
import { productService } from '../../services/productService';
import { vendorDashboardService } from '../../services/vendorDashboardService';
import { vendorProductSchema } from '../../utils/formSchemas';

function initialForm() {
  return {
    category_id: '',
    name: '',
    description: '',
    price: '',
    stock: '',
    weight: '',
    is_active: true,
  };
}

function normalizeFieldErrors(error) {
  const errors = error?.errors;
  if (!errors || typeof errors !== 'object') return {};

  const normalized = {};
  Object.entries(errors).forEach(([field, messages]) => {
    if (Array.isArray(messages) && messages[0]) {
      normalized[field] = String(messages[0]);
    } else if (typeof messages === 'string') {
      normalized[field] = messages;
    }
  });

  return normalized;
}

export default function VendorCreateProduct() {
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [pendingOrders, setPendingOrders] = useState(0);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(vendorProductSchema),
    defaultValues: initialForm(),
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [categoriesResponse, statsResponse] = await Promise.all([
          categoryService.getCategories(),
          vendorDashboardService.getStats({ period: 'all' }),
        ]);

        const categoryList = Array.isArray(categoriesResponse?.data) ? categoriesResponse.data : [];
        setCategories(categoryList);
        setPendingOrders(Number(statsResponse?.data?.notifications?.pendingOrders || 0));
        setError('');
      } catch (err) {
        setError(err?.message || 'Impossible de charger le formulaire produit.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [imagePreviews]);

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files || []);
    setFieldErrors((prev) => ({ ...prev, images: '' }));
    const validationError = cloudinaryService.validateFiles(files);
    if (validationError) {
      setError(validationError);
      event.target.value = '';
      return;
    }

    imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
    setError('');
    setImages(files);
    setImagePreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const onSubmit = async (values) => {
    try {
      setSubmitting(true);
      setError('');
      setSuccess('');
      setFieldErrors({});

      let imageUrls = [];
      if (images.length > 0) {
        setUploadingImages(true);
        imageUrls = await cloudinaryService.uploadImages(images, 'app-produits-locaux/vendor-products');
      }

      const payload = {
        category_id: Number(values.category_id),
        name: values.name,
        description: values.description,
        price: Number(values.price),
        stock: Number(values.stock),
        is_active: Boolean(values.is_active),
        ...(values.weight !== '' ? { weight: Number(values.weight) } : {}),
        ...(imageUrls.length > 0 ? { image_urls: imageUrls } : {}),
      };

      await productService.createProduct(payload);
      setSuccess('Produit créé avec succès.');
      reset(initialForm());
      setImages([]);
      setImagePreviews([]);

      setTimeout(() => {
        navigate('/vendeur/products');
      }, 700);
    } catch (err) {
      const normalizedErrors = normalizeFieldErrors(err);
      if (Object.keys(normalizedErrors).length > 0) {
        setFieldErrors(normalizedErrors);
        const first = Object.values(normalizedErrors)[0];
        if (first) {
          setError(first);
          return;
        }
      }
      setError(err?.message || 'Impossible de créer le produit.');
    } finally {
      setUploadingImages(false);
      setSubmitting(false);
    }
  };

  return (
    <VendorShell
      activeKey="products"
      title="Ajouter un produit"
      subtitle="Publiez un nouveau produit dans votre boutique"
      pendingOrders={pendingOrders}
    >
      {({ darkMode }) => (
        <div className="space-y-4">
          <Link
            to="/vendeur/products"
            className="inline-flex rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-dark"
          >
            Retour aux produits
          </Link>

          {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          {success && <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{success}</div>}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className={[
              'rounded-2xl border p-5 shadow-sm space-y-4',
              darkMode ? 'border-amber-700/30 bg-[#2a160e]' : 'border-amber-100 bg-white',
            ].join(' ')}
          >
            {loading ? (
              <p className={darkMode ? 'text-amber-200/80' : 'text-[#7c4f2a]'}>Chargement des données...</p>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="text-sm">
                    <span className={darkMode ? 'mb-1 block text-amber-200/80' : 'mb-1 block text-[#7c4f2a]'}>Nom *</span>
                    <input
                      {...register('name')}
                      required
                      className={[
                        'w-full rounded-lg border px-3 py-2',
                        darkMode ? 'border-amber-700/40 bg-[#1f120c] text-amber-50' : 'border-amber-200 bg-white text-[#2b1308]',
                      ].join(' ')}
                    />
                    {(errors.name?.message || fieldErrors.name) && (
                      <p className="mt-1 text-xs text-red-600">{errors.name?.message || fieldErrors.name}</p>
                    )}
                  </label>

                  <label className="text-sm">
                    <span className={darkMode ? 'mb-1 block text-amber-200/80' : 'mb-1 block text-[#7c4f2a]'}>Catégorie *</span>
                    <select
                      {...register('category_id')}
                      required
                      className={[
                        'w-full rounded-lg border px-3 py-2',
                        darkMode ? 'border-amber-700/40 bg-[#1f120c] text-amber-50' : 'border-amber-200 bg-white text-[#2b1308]',
                      ].join(' ')}
                    >
                      <option value="">Choisir...</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                      </select>
                    {(errors.category_id?.message || fieldErrors.category_id) && (
                        <p className="mt-1 text-xs text-red-600">{errors.category_id?.message || fieldErrors.category_id}</p>
                      )}
                  </label>
                </div>

                <label className="block text-sm">
                  <span className={darkMode ? 'mb-1 block text-amber-200/80' : 'mb-1 block text-[#7c4f2a]'}>Description *</span>
                  <textarea
                    {...register('description')}
                    required
                    rows={4}
                    className={[
                      'w-full rounded-lg border px-3 py-2',
                      darkMode ? 'border-amber-700/40 bg-[#1f120c] text-amber-50' : 'border-amber-200 bg-white text-[#2b1308]',
                    ].join(' ')}
                  />
                  {(errors.description?.message || fieldErrors.description) && (
                    <p className="mt-1 text-xs text-red-600">{errors.description?.message || fieldErrors.description}</p>
                  )}
                </label>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <label className="text-sm">
                    <span className={darkMode ? 'mb-1 block text-amber-200/80' : 'mb-1 block text-[#7c4f2a]'}>Prix (FCFA) *</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      {...register('price')}
                      required
                      className={[
                        'w-full rounded-lg border px-3 py-2',
                        darkMode ? 'border-amber-700/40 bg-[#1f120c] text-amber-50' : 'border-amber-200 bg-white text-[#2b1308]',
                      ].join(' ')}
                    />
                    {(errors.price?.message || fieldErrors.price) && (
                      <p className="mt-1 text-xs text-red-600">{errors.price?.message || fieldErrors.price}</p>
                    )}
                  </label>

                  <label className="text-sm">
                    <span className={darkMode ? 'mb-1 block text-amber-200/80' : 'mb-1 block text-[#7c4f2a]'}>Stock *</span>
                    <input
                      type="number"
                      min="0"
                      {...register('stock')}
                      required
                      className={[
                        'w-full rounded-lg border px-3 py-2',
                        darkMode ? 'border-amber-700/40 bg-[#1f120c] text-amber-50' : 'border-amber-200 bg-white text-[#2b1308]',
                      ].join(' ')}
                    />
                    {(errors.stock?.message || fieldErrors.stock) && (
                      <p className="mt-1 text-xs text-red-600">{errors.stock?.message || fieldErrors.stock}</p>
                    )}
                  </label>

                  <label className="text-sm">
                    <span className={darkMode ? 'mb-1 block text-amber-200/80' : 'mb-1 block text-[#7c4f2a]'}>Poids (kg)</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      {...register('weight')}
                      className={[
                        'w-full rounded-lg border px-3 py-2',
                        darkMode ? 'border-amber-700/40 bg-[#1f120c] text-amber-50' : 'border-amber-200 bg-white text-[#2b1308]',
                      ].join(' ')}
                    />
                    {(errors.weight?.message || fieldErrors.weight) && (
                      <p className="mt-1 text-xs text-red-600">{errors.weight?.message || fieldErrors.weight}</p>
                    )}
                  </label>
                </div>

                <label className="block text-sm">
                  <span className={darkMode ? 'mb-1 block text-amber-200/80' : 'mb-1 block text-[#7c4f2a]'}>Images (max 5)</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className={[
                      'w-full rounded-lg border px-3 py-2',
                      darkMode ? 'border-amber-700/40 bg-[#1f120c] text-amber-50' : 'border-amber-200 bg-white text-[#2b1308]',
                    ].join(' ')}
                  />
                  {fieldErrors.images && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.images}</p>
                  )}
                  {fieldErrors.image_urls && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.image_urls}</p>
                  )}
                </label>

                {imagePreviews.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {imagePreviews.map((preview, index) => (
                      <img
                        key={`${preview}-${index}`}
                        src={preview}
                        alt={`Prévisualisation ${index + 1}`}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                    ))}
                  </div>
                )}

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    {...register('is_active')}
                  />
                  <span className={darkMode ? 'text-amber-100' : 'text-[#2b1308]'}>Publier ce produit immédiatement</span>
                </label>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting || uploadingImages}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    {uploadingImages ? 'Upload images...' : submitting ? 'Création...' : 'Créer le produit'}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      )}
    </VendorShell>
  );
}
