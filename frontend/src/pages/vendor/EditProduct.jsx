import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import VendorShell from '../../components/vendor/VendorShell';
import { categoryService } from '../../services/categoryService';
import { productService } from '../../services/productService';
import { vendorDashboardService } from '../../services/vendorDashboardService';
import { vendorProductSchema } from '../../utils/formSchemas';

function normalizeFieldErrors(error) {
  const errors = error?.errors;
  if (!errors || typeof errors !== 'object') return {};
  const normalized = {};
  Object.entries(errors).forEach(([field, messages]) => {
    normalized[field] = Array.isArray(messages) ? String(messages[0] || '') : String(messages || '');
  });
  return normalized;
}

export default function VendorEditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [pendingOrders, setPendingOrders] = useState(0);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(vendorProductSchema),
    defaultValues: {
      category_id: '',
      name: '',
      description: '',
      price: '',
      stock: '',
      weight: '',
      is_active: true,
    },
  });
  const form = watch();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [productResponse, categoriesResponse, statsResponse] = await Promise.all([
          productService.getProduct(id),
          categoryService.getCategories(),
          vendorDashboardService.getStats({ period: 'all' }),
        ]);

        const product = productResponse?.data || productResponse || null;
        if (!product) {
          setError('Produit introuvable.');
          return;
        }

        reset({
          category_id: String(product.category_id || product.category?.id || ''),
          name: product.name || '',
          description: product.description || '',
          price: String(product.price ?? ''),
          stock: String(product.stock ?? ''),
          weight: String(product.weight ?? ''),
          is_active: Boolean(product.is_active),
        });

        setCategories(Array.isArray(categoriesResponse?.data) ? categoriesResponse.data : []);
        setPendingOrders(Number(statsResponse?.data?.notifications?.pendingOrders || 0));
      } catch (err) {
        setError(err?.message || 'Impossible de charger le produit.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, reset]);

  const onSubmit = async (values) => {
    if (submitting) return;

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');
      setFieldErrors({});

      await productService.updateProduct(id, {
        category_id: Number(values.category_id),
        name: values.name,
        description: values.description,
        price: Number(values.price),
        stock: Number(values.stock),
        is_active: Boolean(values.is_active),
        ...(values.weight !== '' ? { weight: Number(values.weight) } : {}),
      });

      setSuccess('Produit mis à jour avec succès.');
      setTimeout(() => navigate('/vendeur/products'), 800);
    } catch (err) {
      const normalizedErrors = normalizeFieldErrors(err);
      if (Object.keys(normalizedErrors).length > 0) {
        setFieldErrors(normalizedErrors);
      }
      setError(err?.message || 'Impossible de mettre à jour le produit.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <VendorShell activeKey="products" title="Modifier le produit" subtitle="Mettez à jour les informations produit" pendingOrders={pendingOrders}>
      {({ darkMode }) => (
        <div className="space-y-4">
          <Link to="/vendeur/products" className="inline-flex rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white">
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
              <p className={darkMode ? 'text-amber-200/80' : 'text-[#7c4f2a]'}>Chargement...</p>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="text-sm">
                    <span className={darkMode ? 'mb-1 block text-amber-200/80' : 'mb-1 block text-[#7c4f2a]'}>Nom *</span>
                    <input {...register('name')} required className="input" />
                    {(errors.name?.message || fieldErrors.name) && (
                      <p className="mt-1 text-xs text-red-600">{errors.name?.message || fieldErrors.name}</p>
                    )}
                  </label>

                  <label className="text-sm">
                    <span className={darkMode ? 'mb-1 block text-amber-200/80' : 'mb-1 block text-[#7c4f2a]'}>Catégorie *</span>
                    <select {...register('category_id')} required className="input">
                      <option value="">Choisir...</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                    {(errors.category_id?.message || fieldErrors.category_id) && (
                      <p className="mt-1 text-xs text-red-600">{errors.category_id?.message || fieldErrors.category_id}</p>
                    )}
                  </label>
                </div>

                <label className="block text-sm">
                  <span className={darkMode ? 'mb-1 block text-amber-200/80' : 'mb-1 block text-[#7c4f2a]'}>Description *</span>
                  <textarea {...register('description')} rows={4} required className="input" />
                  {(errors.description?.message || fieldErrors.description) && (
                    <p className="mt-1 text-xs text-red-600">{errors.description?.message || fieldErrors.description}</p>
                  )}
                </label>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <label className="text-sm">
                    <span className={darkMode ? 'mb-1 block text-amber-200/80' : 'mb-1 block text-[#7c4f2a]'}>Prix *</span>
                    <input type="number" min="0" step="0.01" {...register('price')} required className="input" />
                  </label>
                  <label className="text-sm">
                    <span className={darkMode ? 'mb-1 block text-amber-200/80' : 'mb-1 block text-[#7c4f2a]'}>Stock *</span>
                    <input type="number" min="0" {...register('stock')} required className="input" />
                  </label>
                  <label className="text-sm">
                    <span className={darkMode ? 'mb-1 block text-amber-200/80' : 'mb-1 block text-[#7c4f2a]'}>Poids (kg)</span>
                    <input type="number" min="0" step="0.01" {...register('weight')} className="input" />
                  </label>
                </div>

                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" {...register('is_active')} checked={Boolean(form.is_active)} />
                  <span className={darkMode ? 'text-amber-100' : 'text-[#2b1308]'}>Produit actif</span>
                </label>

                <button type="submit" disabled={submitting} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:bg-gray-300">
                  {submitting ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </>
            )}
          </form>
        </div>
      )}
    </VendorShell>
  );
}
