import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';
import VendorShell from '../../components/vendor/VendorShell';
import { productService } from '../../services/productService';
import { vendorDashboardService } from '../../services/vendorDashboardService';
import { authService } from '../../services/authService';
import { resolveImageUrl } from '../../utils/imageUrl';
import fallbackProductImage from '../../assets/home/product-bottles-display.jpg';

function getProductImage(product) {
  if (Array.isArray(product.images) && product.images.length > 0) {
    return resolveImageUrl(product.images[0], fallbackProductImage);
  }
  if (product.image_url) return resolveImageUrl(product.image_url, fallbackProductImage);
  if (product.image) return resolveImageUrl(product.image, fallbackProductImage);
  return fallbackProductImage;
}

function getCardTint(product) {
  if (!product.is_active) return 'bg-[#d9d3c3]';
  const stock = Number(product.stock || 0);
  if (stock <= 0) return 'bg-[#efd3c0]';
  if (stock < 10) return 'bg-[#ead4b8]';
  return 'bg-[#c8ddb5]';
}

function getStockBadge(product) {
  const stock = Number(product.stock || 0);
  if (stock <= 0) return { label: 'Rupture', className: 'bg-red-100 text-red-700' };
  if (stock < 10) return { label: 'Stock faible', className: 'bg-amber-100 text-amber-700' };
  return { label: 'En stock', className: 'bg-green-100 text-green-700' };
}

function getProgressValue(stock) {
  const numeric = Number(stock || 0);
  return Math.max(0, Math.min(100, numeric));
}

export default function ManageProducts() {
  const currentUser = authService.getCurrentUser();
  const [products, setProducts] = useState([]);
  const [stockInputs, setStockInputs] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [search, setSearch] = useState('');
  const [isActive, setIsActive] = useState('');
  const [pendingOrders, setPendingOrders] = useState(0);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const totalProducts = products.length;
  const inStockCount = products.filter((product) => Number(product.stock || 0) > 0).length;
  const lowStockCount = products.filter((product) => {
    const stock = Number(product.stock || 0);
    return stock > 0 && stock < 10;
  }).length;
  const outOfStockCount = products.filter((product) => Number(product.stock || 0) <= 0).length;
  const publishedCount = products.filter((product) => Boolean(product.is_active)).length;
  const draftCount = products.filter((product) => !product.is_active).length;

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [productsResponse, statsResponse] = await Promise.all([
          productService.getVendorProducts({
            search: search || undefined,
            is_active: isActive === '' ? undefined : isActive,
            per_page: 100,
          }),
          vendorDashboardService.getStats({ period: 'all' }),
        ]);

        const payload = productsResponse?.data || productsResponse || {};
        const list = Array.isArray(payload?.data) ? payload.data : [];
        setProducts(list);
        setStockInputs(
          list.reduce((acc, product) => {
            acc[product.id] = String(product.stock ?? 0);
            return acc;
          }, {})
        );
        setPendingOrders(Number(statsResponse?.data?.notifications?.pendingOrders || 0));
        setError('');
      } catch (err) {
        setError(err?.message || 'Impossible de charger les produits vendeur.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [search, isActive]);

  const getErrorMessage = (err, fallback) => {
    // Chercher le message dans les erreurs de validation
    if (err?.errors && typeof err.errors === 'object') {
      const errorValues = Object.values(err.errors);
      for (const value of errorValues) {
        if (Array.isArray(value) && value.length > 0 && value[0]) {
          return value[0];
        }
      }
    }
    // Chercher le message simple
    if (err?.message && err.message !== 'Request failed with status code 422') {
      return err.message;
    }
    // Message par défaut
    return fallback;
  };

  const updateLocalProduct = (nextProduct) => {
    setProducts((prev) => prev.map((product) => (product.id === nextProduct.id ? nextProduct : product)));
  };

  const handleToggle = async (productId) => {
    try {
      setUpdatingId(productId);
      setActionError('');
      const response = await productService.toggleProduct(productId);
      const updated = response?.data?.data || response?.data || response;
      if (updated?.id) {
        updateLocalProduct(updated);
      }
    } catch (err) {
      setActionError(getErrorMessage(err, 'Impossible de modifier le statut du produit.'));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStockSave = async (productId) => {
    const quantity = Number(stockInputs[productId]);
    if (!Number.isInteger(quantity) || quantity < 0) {
      setActionError('Le stock doit être un nombre entier positif.');
      return;
    }

    try {
      setUpdatingId(productId);
      setActionError('');
      const response = await productService.updateProductStock(productId, quantity);
      const updated = response?.data?.data || response?.data || response;
      if (updated?.id) {
        updateLocalProduct(updated);
        setStockInputs((prev) => ({ ...prev, [productId]: String(updated.stock ?? quantity) }));
      }
    } catch (err) {
      setActionError(getErrorMessage(err, 'Impossible de mettre à jour le stock.'));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (productId, canDelete = true) => {
    if (!canDelete) {
      setActionError('Ce produit est lié à une commande active et ne peut pas être supprimé.');
      return;
    }

    const confirmed = await new Promise((resolve) => {
      let settled = false;
      const finish = (value) => {
        if (settled) return;
        settled = true;
        resolve(value);
      };

      const id = toast.custom(
        (t) => (
          <div className="w-[320px] rounded-xl border border-amber-200 bg-white p-3 shadow-lg">
            <p className="text-sm font-semibold text-[#2b1308]">Supprimer ce produit ?</p>
            <p className="mt-1 text-xs text-[#7c4f2a]">Cette action est irréversible.</p>
            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                type="button"
                className="rounded-lg border border-amber-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-[#5c361f]"
                onClick={() => {
                  toast.dismiss(t.id);
                  finish(false);
                }}
              >
                Annuler
              </button>
              <button
                type="button"
                className="rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-semibold text-white"
                onClick={() => {
                  toast.dismiss(t.id);
                  finish(true);
                }}
              >
                Supprimer
              </button>
            </div>
          </div>
        ),
        { duration: 7000, position: 'top-center' }
      );

      setTimeout(() => {
        toast.dismiss(id);
        finish(false);
      }, 7100);
    });

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(productId);
      setActionError('');
      await productService.deleteProduct(productId);
      setProducts((prev) => prev.filter((product) => product.id !== productId));
      setStockInputs((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
    } catch (err) {
      const errorData = err?.response?.data || err;
      const errorMsg = errorData?.errors 
        ? getErrorMessage(errorData, 'Impossible de supprimer ce produit.')
        : getErrorMessage(err, 'Impossible de supprimer ce produit.');
      setActionError(errorMsg);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <VendorShell
      activeKey="products"
      title={`Produits vendeur ${currentUser?.name ? `- ${currentUser.name}` : ''}`}
      subtitle="Gérez votre catalogue"
      pendingOrders={pendingOrders}
    >
      {({ darkMode }) => (
        <div className="space-y-5">
          <div
            className={[
              'rounded-2xl border p-4 shadow-sm',
              darkMode ? 'border-amber-700/30 bg-[#2a160e]' : 'border-[#ddd4cb] bg-[#f8f4ef]',
            ].join(' ')}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className={['text-2xl font-semibold', darkMode ? 'text-amber-50' : 'text-[#2f2924]'].join(' ')}>Mes produits</h2>
                <p className={darkMode ? 'text-amber-200/70' : 'text-[#6f655c]'}>Boutique vendeur</p>
              </div>

              <Link
                to="/vendeur/products/new"
                className={[
                  'inline-flex rounded-xl border px-4 py-2 text-sm font-semibold transition',
                  darkMode
                    ? 'border-amber-600/40 bg-amber-500/10 text-amber-100 hover:bg-amber-500/20'
                    : 'border-[#cfc6bd] bg-white text-[#2f2924] hover:bg-[#f5f1eb]',
                ].join(' ')}
              >
                Ajouter un produit
              </Link>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <div className={['rounded-xl p-3', darkMode ? 'bg-[#1e110b]' : 'bg-[#ece7df]'].join(' ')}>
                <p className={['text-xs uppercase tracking-wide', darkMode ? 'text-amber-200/70' : 'text-[#6f655c]'].join(' ')}>Total produits</p>
                <p className={['mt-1 text-3xl font-semibold', darkMode ? 'text-amber-50' : 'text-[#2f2924]'].join(' ')}>{totalProducts}</p>
                <p className={['text-xs', darkMode ? 'text-amber-200/70' : 'text-[#6f655c]'].join(' ')}>
                  {publishedCount} publiés · {draftCount} brouillons
                </p>
              </div>

              <div className={['rounded-xl p-3', darkMode ? 'bg-[#1e110b]' : 'bg-[#ece7df]'].join(' ')}>
                <p className={['text-xs uppercase tracking-wide', darkMode ? 'text-amber-200/70' : 'text-[#6f655c]'].join(' ')}>En stock</p>
                <p className={['mt-1 text-3xl font-semibold', darkMode ? 'text-amber-50' : 'text-[#2f2924]'].join(' ')}>{inStockCount}</p>
                <p className="text-xs text-green-700">Disponibles</p>
              </div>

              <div className={['rounded-xl p-3', darkMode ? 'bg-[#1e110b]' : 'bg-[#ece7df]'].join(' ')}>
                <p className={['text-xs uppercase tracking-wide', darkMode ? 'text-amber-200/70' : 'text-[#6f655c]'].join(' ')}>Stock faible</p>
                <p className={['mt-1 text-3xl font-semibold', darkMode ? 'text-amber-50' : 'text-[#2f2924]'].join(' ')}>{lowStockCount}</p>
                <p className="text-xs text-amber-700">Réappro. conseillée</p>
              </div>

              <div className={['rounded-xl p-3', darkMode ? 'bg-[#1e110b]' : 'bg-[#ece7df]'].join(' ')}>
                <p className={['text-xs uppercase tracking-wide', darkMode ? 'text-amber-200/70' : 'text-[#6f655c]'].join(' ')}>Rupture de stock</p>
                <p className={['mt-1 text-3xl font-semibold', darkMode ? 'text-amber-50' : 'text-[#2f2924]'].join(' ')}>{outOfStockCount}</p>
                <p className="text-xs text-red-700">Action requise</p>
              </div>

              <div className={['rounded-xl p-3', darkMode ? 'bg-[#1e110b]' : 'bg-[#ece7df]'].join(' ')}>
                <p className={['text-xs uppercase tracking-wide', darkMode ? 'text-amber-200/70' : 'text-[#6f655c]'].join(' ')}>Produits actifs</p>
                <p className={['mt-1 text-3xl font-semibold', darkMode ? 'text-amber-50' : 'text-[#2f2924]'].join(' ')}>{publishedCount}</p>
                <p className={darkMode ? 'text-xs text-amber-200/70' : 'text-xs text-[#6f655c]'}>Visibles en boutique</p>
              </div>
            </div>
          </div>

          <div
            className={[
              'rounded-2xl border p-3 shadow-sm',
              darkMode ? 'border-amber-700/30 bg-[#2a160e]' : 'border-[#ddd4cb] bg-[#f8f4ef]',
            ].join(' ')}
          >
            <div className="flex flex-wrap items-center gap-2">
              <label
                className={[
                  'flex min-w-[220px] flex-1 items-center gap-2 rounded-xl border px-3 py-2',
                  darkMode ? 'border-amber-700/40 bg-[#1f120c]' : 'border-[#cdc3b9] bg-white',
                ].join(' ')}
              >
                <Search className={['h-4 w-4', darkMode ? 'text-amber-200/70' : 'text-[#81776d]'].join(' ')} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher"
                  className={[
                    'w-full bg-transparent text-sm outline-none',
                    darkMode ? 'text-amber-50 placeholder:text-amber-200/50' : 'text-[#2f2924] placeholder:text-[#81776d]',
                  ].join(' ')}
                />
              </label>

              <button
                type="button"
                onClick={() => setIsActive('')}
                className={[
                  'rounded-full border px-4 py-2 text-sm transition',
                  isActive === ''
                    ? 'border-[#bb652f] bg-[#bb652f] text-white'
                    : darkMode
                      ? 'border-amber-700/40 bg-[#1f120c] text-amber-100'
                      : 'border-[#cfc6bd] bg-white text-[#544e47]',
                ].join(' ')}
              >
                Tous ({totalProducts})
              </button>
              <button
                type="button"
                onClick={() => setIsActive('1')}
                className={[
                  'rounded-full border px-4 py-2 text-sm transition',
                  isActive === '1'
                    ? 'border-[#bb652f] bg-[#bb652f] text-white'
                    : darkMode
                      ? 'border-amber-700/40 bg-[#1f120c] text-amber-100'
                      : 'border-[#cfc6bd] bg-white text-[#544e47]',
                ].join(' ')}
              >
                Publiés ({publishedCount})
              </button>
              <button
                type="button"
                onClick={() => setIsActive('0')}
                className={[
                  'rounded-full border px-4 py-2 text-sm transition',
                  isActive === '0'
                    ? 'border-[#bb652f] bg-[#bb652f] text-white'
                    : darkMode
                      ? 'border-amber-700/40 bg-[#1f120c] text-amber-100'
                      : 'border-[#cfc6bd] bg-white text-[#544e47]',
                ].join(' ')}
              >
                Brouillons ({draftCount})
              </button>
            </div>
          </div>

          {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          {actionError && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{actionError}</div>}

          <div className={['rounded-2xl border p-4 shadow-sm', darkMode ? 'border-amber-700/30 bg-[#2a160e]' : 'border-[#ddd4cb] bg-[#f8f4ef]'].join(' ')}>
            {loading ? (
              <p className={darkMode ? 'text-amber-200/80' : 'text-[#7c4f2a]'}>Chargement des produits...</p>
            ) : products.length === 0 ? (
              <p className={darkMode ? 'text-amber-200/80' : 'text-[#7c4f2a]'}>Aucun produit trouvé.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => {
                  const stockBadge = getStockBadge(product);
                  const progressValue = getProgressValue(product.stock);
                  return (
                    <article
                      key={product.id}
                      className={[
                        'overflow-hidden rounded-2xl border shadow-sm',
                        darkMode ? 'border-amber-700/30 bg-[#1f120c]' : 'border-[#d8cfc6] bg-[#fdfcfb]',
                      ].join(' ')}
                    >
                      <div className={['relative h-64', getCardTint(product)].join(' ')}>
                        <img
                          src={getProductImage(product)}
                          alt={product.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                        <span className="absolute left-3 top-3 rounded-full bg-[#61412b] px-2 py-0.5 text-[11px] font-semibold text-white">
                          {product.is_active ? 'Publié' : 'Brouillon'}
                        </span>
                        <span className={`absolute right-3 top-3 rounded-full px-2 py-0.5 text-[11px] font-semibold ${stockBadge.className}`}>
                          {stockBadge.label}
                        </span>
                      </div>

                      <div className="space-y-3 p-4">
                        <div>
                          <h3 className={['line-clamp-1 text-xl font-semibold', darkMode ? 'text-amber-50' : 'text-[#2f2924]'].join(' ')}>
                            {product.name}
                          </h3>
                          <p className={['line-clamp-1 text-xs uppercase tracking-wide', darkMode ? 'text-amber-200/70' : 'text-[#6f655c]'].join(' ')}>
                            {typeof product.category === 'string' ? product.category : product.category?.name || 'Produit local'}
                            {product.weight ? ` · ${product.weight} KG` : ''}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className={['rounded-lg border p-2', darkMode ? 'border-amber-700/30 bg-[#2a160e]' : 'border-[#e1d8ce] bg-[#f3eee8]'].join(' ')}>
                            <p className={['text-[11px] uppercase tracking-wide', darkMode ? 'text-amber-200/70' : 'text-[#6f655c]'].join(' ')}>Prix</p>
                            <p className={['text-xl font-semibold', darkMode ? 'text-amber-50' : 'text-[#2f2924]'].join(' ')}>
                              {Number(product.price || 0).toLocaleString('fr-FR')} FCFA
                            </p>
                          </div>
                          <div className={['rounded-lg border p-2', darkMode ? 'border-amber-700/30 bg-[#2a160e]' : 'border-[#e1d8ce] bg-[#f3eee8]'].join(' ')}>
                            <p className={['text-[11px] uppercase tracking-wide', darkMode ? 'text-amber-200/70' : 'text-[#6f655c]'].join(' ')}>Stock</p>
                            <p className={['text-xl font-semibold', darkMode ? 'text-amber-50' : 'text-[#2f2924]'].join(' ')}>{product.stock ?? 0}</p>
                          </div>
                        </div>

                        <div>
                          <div className="mb-1 flex items-center justify-between">
                            <p className={['text-sm font-medium', darkMode ? 'text-amber-200/80' : 'text-[#544e47]'].join(' ')}>Stock</p>
                            <p className={['text-sm font-semibold', darkMode ? 'text-amber-50' : 'text-[#2f2924]'].join(' ')}>
                              {product.stock ?? 0}/100
                            </p>
                          </div>
                          <div className={['h-2 overflow-hidden rounded-full', darkMode ? 'bg-[#3a2619]' : 'bg-[#e8e1d8]'].join(' ')}>
                            <div
                              className={['h-full rounded-full', progressValue <= 10 ? 'bg-red-500' : progressValue <= 30 ? 'bg-amber-500' : 'bg-green-600'].join(' ')}
                              style={{ width: `${progressValue}%` }}
                            />
                          </div>
                        </div>

                        {Number(product.active_orders_count || 0) > 0 && (
                          <p className="rounded-lg bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-700">
                            {product.active_orders_count} commande{Number(product.active_orders_count) > 1 ? 's' : ''} active{Number(product.active_orders_count) > 1 ? 's' : ''}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggle(product.id)}
                            disabled={updatingId === product.id || deletingId === product.id}
                            className="rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
                          >
                            {product.is_active ? 'Désactiver' : 'Activer'}
                          </button>

                          <input
                            type="number"
                            min="0"
                            value={stockInputs[product.id] ?? ''}
                            onChange={(e) => setStockInputs((prev) => ({ ...prev, [product.id]: e.target.value }))}
                            className={[
                              'w-20 rounded-xl border px-2.5 py-2 text-sm',
                              darkMode ? 'border-amber-700/40 bg-[#2a160e] text-amber-50' : 'border-[#cdc3b9] bg-white text-[#2f2924]',
                            ].join(' ')}
                          />
                          <button
                            type="button"
                            onClick={() => handleStockSave(product.id)}
                            disabled={updatingId === product.id || deletingId === product.id}
                            className="rounded-xl bg-amber-700 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
                          >
                            Stock
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(product.id, Boolean(product.can_delete))}
                            disabled={updatingId === product.id || deletingId === product.id || !product.can_delete}
                            title={product.can_delete ? 'Supprimer le produit' : 'Produit lié à une commande active'}
                            className="rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
                          >
                            {deletingId === product.id ? 'Suppression...' : 'Supprimer'}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </VendorShell>
  );
}
