import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import VendorShell from '../../components/vendor/VendorShell';
import { categoryService } from '../../services/categoryService';
import { cloudinaryService } from '../../services/cloudinaryService';
import { productService } from '../../services/productService';
import { vendorDashboardService } from '../../services/vendorDashboardService';

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

export default function VendorCreateProduct() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pendingOrders, setPendingOrders] = useState(0);

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

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files || []);
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      let imageUrls = [];
      if (images.length > 0) {
        setUploadingImages(true);
        imageUrls = await cloudinaryService.uploadImages(images, 'app-produits-locaux/vendor-products');
      }

      const payload = {
        category_id: Number(form.category_id),
        name: form.name,
        description: form.description,
        price: Number(form.price),
        stock: Number(form.stock),
        is_active: Boolean(form.is_active),
        ...(form.weight !== '' ? { weight: Number(form.weight) } : {}),
        ...(imageUrls.length > 0 ? { image_urls: imageUrls } : {}),
      };

      await productService.createProduct(payload);
      setSuccess('Produit créé avec succès.');
      setForm(initialForm());
      setImages([]);
      setImagePreviews([]);

      setTimeout(() => {
        navigate('/vendeur/products');
      }, 700);
    } catch (err) {
      if (err?.errors && typeof err.errors === 'object') {
        const first = Object.values(err.errors)[0];
        if (Array.isArray(first) && first[0]) {
          setError(first[0]);
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
            onSubmit={handleSubmit}
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
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className={[
                        'w-full rounded-lg border px-3 py-2',
                        darkMode ? 'border-amber-700/40 bg-[#1f120c] text-amber-50' : 'border-amber-200 bg-white text-[#2b1308]',
                      ].join(' ')}
                    />
                  </label>

                  <label className="text-sm">
                    <span className={darkMode ? 'mb-1 block text-amber-200/80' : 'mb-1 block text-[#7c4f2a]'}>Catégorie *</span>
                    <select
                      name="category_id"
                      value={form.category_id}
                      onChange={handleChange}
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
                  </label>
                </div>

                <label className="block text-sm">
                  <span className={darkMode ? 'mb-1 block text-amber-200/80' : 'mb-1 block text-[#7c4f2a]'}>Description *</span>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    className={[
                      'w-full rounded-lg border px-3 py-2',
                      darkMode ? 'border-amber-700/40 bg-[#1f120c] text-amber-50' : 'border-amber-200 bg-white text-[#2b1308]',
                    ].join(' ')}
                  />
                </label>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <label className="text-sm">
                    <span className={darkMode ? 'mb-1 block text-amber-200/80' : 'mb-1 block text-[#7c4f2a]'}>Prix (FCFA) *</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      name="price"
                      value={form.price}
                      onChange={handleChange}
                      required
                      className={[
                        'w-full rounded-lg border px-3 py-2',
                        darkMode ? 'border-amber-700/40 bg-[#1f120c] text-amber-50' : 'border-amber-200 bg-white text-[#2b1308]',
                      ].join(' ')}
                    />
                  </label>

                  <label className="text-sm">
                    <span className={darkMode ? 'mb-1 block text-amber-200/80' : 'mb-1 block text-[#7c4f2a]'}>Stock *</span>
                    <input
                      type="number"
                      min="0"
                      name="stock"
                      value={form.stock}
                      onChange={handleChange}
                      required
                      className={[
                        'w-full rounded-lg border px-3 py-2',
                        darkMode ? 'border-amber-700/40 bg-[#1f120c] text-amber-50' : 'border-amber-200 bg-white text-[#2b1308]',
                      ].join(' ')}
                    />
                  </label>

                  <label className="text-sm">
                    <span className={darkMode ? 'mb-1 block text-amber-200/80' : 'mb-1 block text-[#7c4f2a]'}>Poids (kg)</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      name="weight"
                      value={form.weight}
                      onChange={handleChange}
                      className={[
                        'w-full rounded-lg border px-3 py-2',
                        darkMode ? 'border-amber-700/40 bg-[#1f120c] text-amber-50' : 'border-amber-200 bg-white text-[#2b1308]',
                      ].join(' ')}
                    />
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
                    name="is_active"
                    checked={form.is_active}
                    onChange={handleChange}
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
