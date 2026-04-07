import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { categoryService } from '../../services/categoryService';
import { cloudinaryService } from '../../services/cloudinaryService';

function initialForm() {
  return {
    vendeur_id: '',
    category_id: '',
    name: '',
    description: '',
    price: '',
    stock: '',
    weight: '',
    is_active: true,
  };
}

export default function AdminCreateProductForVendor() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [vendors, setVendors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [vendorsResponse, categoriesResponse] = await Promise.all([
          adminService.getVendorUsers(),
          categoryService.getCategories(),
        ]);

        const usersPage = vendorsResponse?.data || {};
        const userList = Array.isArray(usersPage?.data) ? usersPage.data : [];
        const formattedVendors = userList
          .filter((user) => user?.vendeur?.id)
          .map((user) => ({
            id: user.vendeur.id,
            label: `${user.name} - ${user.vendeur.shop_name || 'Boutique sans nom'}`,
            verified: Boolean(user.vendeur.verified),
          }));

        const categoryList = Array.isArray(categoriesResponse?.data) ? categoriesResponse.data : [];

        setVendors(formattedVendors);
        setCategories(categoryList);
        setError('');
      } catch (err) {
        setError(err?.message || 'Impossible de charger les données administrateur.');
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

  const selectedVendor = useMemo(
    () => vendors.find((vendor) => String(vendor.id) === String(form.vendeur_id)),
    [vendors, form.vendeur_id]
  );

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
        imageUrls = await cloudinaryService.uploadImages(images, 'app-produits-locaux/admin-products');
      }

      const payload = {
        vendeur_id: Number(form.vendeur_id),
        category_id: Number(form.category_id),
        name: form.name,
        description: form.description,
        price: Number(form.price),
        stock: Number(form.stock),
        is_active: Boolean(form.is_active),
        ...(form.weight !== '' ? { weight: Number(form.weight) } : {}),
        ...(imageUrls.length > 0 ? { image_urls: imageUrls } : {}),
      };

      await adminService.createProductForVendor(payload);
      setSuccess('Produit créé pour le vendeur avec succès.');
      setForm(initialForm());
      setImages([]);
      setImagePreviews([]);
    } catch (err) {
      if (err?.errors && typeof err.errors === 'object') {
        const first = Object.values(err.errors)[0];
        if (Array.isArray(first) && first[0]) {
          setError(first[0]);
          return;
        }
      }
      setError(err?.message || 'Impossible de créer le produit pour ce vendeur.');
    } finally {
      setUploadingImages(false);
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold text-[#2b1308]">Ajout assisté de produit vendeur</h1>
        <div className="flex gap-2">
          <Link to="/admin/dashboard" className="rounded-lg bg-gray-200 px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-300">
            Dashboard admin
          </Link>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Retour
          </button>
        </div>
      </div>

      {error && <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      {success && <div className="mb-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{success}</div>}

      <form onSubmit={handleSubmit} className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm space-y-4">
        {loading ? (
          <p className="text-sm text-[#7c4f2a]">Chargement des vendeurs et catégories...</p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="text-sm">
                <span className="mb-1 block text-[#7c4f2a]">Vendeur cible *</span>
                <select
                  name="vendeur_id"
                  value={form.vendeur_id}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-[#2b1308]"
                >
                  <option value="">Choisir...</option>
                  {vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.label} {vendor.verified ? '(Vérifié)' : '(Non vérifié)'}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm">
                <span className="mb-1 block text-[#7c4f2a]">Catégorie *</span>
                <select
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-[#2b1308]"
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
              <span className="mb-1 block text-[#7c4f2a]">Nom du produit *</span>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-[#2b1308]"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block text-[#7c4f2a]">Description *</span>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-[#2b1308]"
              />
            </label>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <label className="text-sm">
                <span className="mb-1 block text-[#7c4f2a]">Prix (FCFA) *</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-[#2b1308]"
                />
              </label>

              <label className="text-sm">
                <span className="mb-1 block text-[#7c4f2a]">Stock *</span>
                <input
                  type="number"
                  min="0"
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-[#2b1308]"
                />
              </label>

              <label className="text-sm">
                <span className="mb-1 block text-[#7c4f2a]">Poids (kg)</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="weight"
                  value={form.weight}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-[#2b1308]"
                />
              </label>
            </div>

            <label className="block text-sm">
              <span className="mb-1 block text-[#7c4f2a]">Images (max 5)</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-[#2b1308]"
              />
            </label>

            {imagePreviews.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {imagePreviews.map((preview, index) => (
                  <img
                    key={`${preview}-${index}`}
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                ))}
              </div>
            )}

            <label className="flex items-center gap-2 text-sm text-[#2b1308]">
              <input
                type="checkbox"
                name="is_active"
                checked={form.is_active}
                onChange={handleChange}
              />
              Publier ce produit immédiatement
            </label>

            {selectedVendor && !selectedVendor.verified && (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                Ce vendeur n&apos;est pas vérifié. Le backend refuse un produit actif tant que la vérification n&apos;est pas validée.
              </p>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting || uploadingImages}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {uploadingImages ? 'Upload images...' : submitting ? 'Création...' : 'Créer le produit pour ce vendeur'}
              </button>
            </div>
          </>
        )}
      </form>
    </main>
  );
}
