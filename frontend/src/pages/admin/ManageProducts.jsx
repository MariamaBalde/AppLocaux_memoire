import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Grid3x3,
  List,
  Loader2,
  Plus,
  Search,
  Star,
  Trash2,
  UserCheck,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import AdminSidebar from '../../components/admin/AdminSidebar';

const PAGE_SIZE = 8;

const STOCK_STYLE = {
  green: {
    label: 'En stock',
    card: 'border-green-200 bg-green-50',
    badge: 'bg-green-100 text-green-800',
    bar: 'bg-green-600',
  },
  orange: {
    label: 'Stock faible',
    card: 'border-amber-200 bg-amber-50',
    badge: 'bg-amber-100 text-amber-800',
    bar: 'bg-amber-500',
  },
  red: {
    label: 'Rupture',
    card: 'border-rose-200 bg-rose-50',
    badge: 'bg-rose-100 text-rose-800',
    bar: 'bg-rose-500',
  },
};

function formatNumber(value) {
  return new Intl.NumberFormat('fr-FR').format(Number(value || 0));
}

function formatPrice(value) {
  return `${formatNumber(value)} FCFA`;
}

function normalizeProduct(raw) {
  const stock = Number(raw?.stock || 0);
  const stockColor = raw?.stock_color || (stock === 0 ? 'red' : stock <= 5 ? 'orange' : 'green');

  return {
    ...raw,
    stock,
    stockColor: STOCK_STYLE[stockColor] ? stockColor : 'green',
    stockLabel: STOCK_STYLE[stockColor]?.label || STOCK_STYLE.green.label,
    categoryName: raw?.category?.name || 'Divers',
    vendorName: raw?.vendor?.name || 'Vendeur inconnu',
    pendingReview: Boolean(raw?.vendor?.pending_review),
    featured: Boolean(raw?.featured),
    isActive: Boolean(raw?.is_active),
    sales: Number(raw?.performance?.sales || 0),
    satisfaction: Number(raw?.performance?.satisfaction || 0),
    diasporaPercent: Number(raw?.performance?.diaspora_percent || 0),
    image: Array.isArray(raw?.images) && raw.images.length ? raw.images[0] : '',
  };
}

function toCsv(rows) {
  return rows
    .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n');
}

function ProductDetailPanel({
  product,
  processingKey,
  onClose,
  onApproveVendor,
  onToggleStatus,
  onToggleFeatured,
  onDeleteProduct,
}) {
  if (!product) return null;

  const style = STOCK_STYLE[product.stockColor] || STOCK_STYLE.green;
  const isBusy = processingKey.includes(`:${product.id}`) || processingKey === `approve:${product.vendor?.id || ''}`;

  return (
    <div className="fixed inset-0 z-50 flex">
      <button type="button" aria-label="Fermer" className="flex-1 bg-black/40" onClick={onClose} />
      <aside className="h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 z-10 border-b border-[#ead8c6] bg-white px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#7c6a5d]">Fiche produit</p>
              <h2 className="mt-1 text-2xl font-semibold text-[#2b1308]">{product.name}</h2>
            </div>
            <button type="button" onClick={onClose} className="rounded-full border border-[#ead8c6] p-2 text-[#7c4f2a] hover:bg-[#faf2eb]">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-5 px-6 py-6">
          <div className={`overflow-hidden rounded-3xl border ${style.card}`}>
            <div className="relative aspect-[16/8]">
              <span className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-medium ${style.badge}`}>
                {product.stockLabel}
              </span>
              {product.image ? (
                <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-[#6f5d4e]">Aucune image</div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {product.pendingReview && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#fff3d1] px-3 py-1 text-xs font-medium text-[#966200]">
                <AlertCircle className="h-3.5 w-3.5" />
                En revision
              </span>
            )}
            {product.featured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#f6e6d6] px-3 py-1 text-xs font-medium text-[#ad5a27]">
                <Star className="h-3.5 w-3.5 fill-current" />
                Mis en avant
              </span>
            )}
          </div>

          <section className="rounded-3xl border border-[#ead8c6] p-5">
            <p className="text-xs uppercase tracking-[0.15em] text-[#7c6a5d]">Description</p>
            <p className="mt-2 text-sm leading-7 text-[#4f3f34]">
              {product.description || 'Aucune description detaillee disponible pour ce produit.'}
            </p>
          </section>

          <section className="grid grid-cols-2 gap-4 rounded-3xl border border-[#ead8c6] p-5">
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-[#7c6a5d]">Prix</p>
              <p className="mt-1 text-lg font-semibold text-[#c7632a]">{formatPrice(product.price)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-[#7c6a5d]">Stock</p>
              <p className="mt-1 text-lg font-semibold text-[#2b1308]">{product.stock} unites</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-[#7c6a5d]">Categorie</p>
              <p className="mt-1 text-lg font-semibold text-[#2b1308]">{product.categoryName}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-[#7c6a5d]">Vendeur</p>
              <p className="mt-1 text-lg font-semibold text-[#2b1308]">{product.vendorName}</p>
            </div>
          </section>

          <section className="rounded-3xl border border-[#ead8c6] p-5">
            <p className="text-xs uppercase tracking-[0.15em] text-[#7c6a5d]">Indicateurs de performance</p>
            <div className="mt-3 grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-[#faf2eb] p-3">
                <p className="text-xs text-[#7c6a5d]">Ventes</p>
                <p className="text-2xl font-semibold text-[#2b1308]">{formatNumber(product.sales)}</p>
              </div>
              <div className="rounded-2xl bg-[#eef8e8] p-3">
                <p className="text-xs text-[#7c6a5d]">Satisfaction</p>
                <p className="text-2xl font-semibold text-[#2b1308]">{product.satisfaction.toFixed(1)}</p>
              </div>
              <div className="rounded-2xl bg-[#f3ece6] p-3">
                <p className="text-xs text-[#7c6a5d]">Diaspora %</p>
                <p className="text-2xl font-semibold text-[#2b1308]">{product.diasporaPercent}%</p>
              </div>
            </div>
          </section>

          <section className="space-y-3 rounded-3xl border border-[#ead8c6] p-5">
            {product.pendingReview && (
              <button
                type="button"
                onClick={() => onApproveVendor(product.vendor?.id)}
                disabled={isBusy}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-[#d8bc9f] bg-white px-4 py-3 text-sm font-medium text-[#7c4f2a] hover:bg-[#faf2eb] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <UserCheck className="h-4 w-4" />
                Valider vendeur
              </button>
            )}
            <button
              type="button"
              onClick={() => onToggleStatus(product.id, product.isActive ? 'inactive' : 'active')}
              disabled={isBusy}
              className="w-full rounded-full border border-[#ead8c6] bg-[#f8f0ea] px-4 py-3 text-sm font-medium text-[#5f4a3d] hover:bg-[#f0e1d4] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {product.isActive ? 'Desactiver' : 'Activer'}
            </button>
            <button
              type="button"
              onClick={() => onToggleFeatured(product.id)}
              disabled={isBusy}
              className="w-full rounded-full bg-[#c7632a] px-4 py-3 text-sm font-medium text-white hover:bg-[#af5523] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {product.featured ? 'Retirer mise en avant' : 'Mettre en avant'}
            </button>
            <button
              type="button"
              onClick={() => onDeleteProduct(product.id)}
              disabled={isBusy}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#a83033] px-4 py-3 text-sm font-medium text-white hover:bg-[#8f2226] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" />
              Supprimer
            </button>
          </section>
        </div>
      </aside>
    </div>
  );
}

export default function AdminManageProducts() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [stockFilter, setStockFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const [processingKey, setProcessingKey] = useState('');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        setError('');
        const response = await adminService.getAllProducts({
          limit: 100,
          sort_by: 'created_at',
          sort_order: 'desc',
        });
        const data = response?.data || response;
        const normalized = (Array.isArray(data) ? data : []).map(normalizeProduct);
        setProducts(normalized);
      } catch (err) {
        setError('Erreur lors du chargement des produits.');
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  const categoryTabs = useMemo(() => {
    const names = Array.from(new Set(products.map((product) => product.categoryName)));
    return names.sort((a, b) => a.localeCompare(b, 'fr'));
  }, [products]);

  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return products.filter((product) => {
      const matchesSearch =
        !term ||
        product.name.toLowerCase().includes(term) ||
        product.vendorName.toLowerCase().includes(term) ||
        product.categoryName.toLowerCase().includes(term);
      const matchesStock = stockFilter === 'all' || product.stockColor === stockFilter;
      const matchesCategory = categoryFilter === 'all' || product.categoryName === categoryFilter;
      return matchesSearch && matchesStock && matchesCategory;
    });
  }, [products, searchTerm, stockFilter, categoryFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, stockFilter, categoryFilter, viewMode]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const visibleProducts = filteredProducts.slice(start, start + PAGE_SIZE);
  const selectedProduct = products.find((product) => product.id === selectedId) || null;

  const metrics = useMemo(() => {
    const total = products.length;
    const lowStock = products.filter((product) => product.stockColor === 'orange').length;
    const outOfStock = products.filter((product) => product.stockColor === 'red').length;
    const pending = products.filter((product) => product.pendingReview).length;
    const active = products.filter((product) => product.isActive).length;
    const top = [...products].sort((a, b) => b.sales - a.sales)[0];
    return { total, lowStock, outOfStock, pending, active, top };
  }, [products]);

  const mutateList = (updater) => {
    setProducts((current) => current.map((product) => normalizeProduct(updater(product))));
  };

  const handleApproveVendor = async (vendorId) => {
    if (!vendorId) return;
    try {
      setProcessingKey(`approve:${vendorId}`);
      await adminService.approveVendor(vendorId);
      setProducts((current) =>
        current.map((product) =>
          product.vendor?.id === vendorId
            ? normalizeProduct({
                ...product,
                vendor: { ...(product.vendor || {}), pending_review: false, verified: true },
              })
            : product
        )
      );
      toast.success('Vendeur valide.');
    } catch (err) {
      toast.error(err?.message || 'Impossible de valider ce vendeur.');
    } finally {
      setProcessingKey('');
    }
  };

  const handleToggleFeatured = async (productId) => {
    try {
      setProcessingKey(`featured:${productId}`);
      await adminService.toggleFeaturedProduct(productId);
      mutateList((product) => (product.id === productId ? { ...product, featured: !product.featured } : product));
      toast.success('Mise en avant mise a jour.');
    } catch (err) {
      toast.error(err?.message || 'Impossible de modifier la mise en avant.');
    } finally {
      setProcessingKey('');
    }
  };

  const handleToggleStatus = async (productId, status) => {
    try {
      setProcessingKey(`status:${productId}`);
      await adminService.updateProductStatus(productId, status);
      mutateList((product) => (product.id === productId ? { ...product, is_active: status === 'active' } : product));
      toast.success(status === 'active' ? 'Produit active.' : 'Produit desactive.');
    } catch (err) {
      toast.error(err?.message || 'Impossible de changer le statut.');
    } finally {
      setProcessingKey('');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Supprimer ce produit ?')) return;
    try {
      setProcessingKey(`delete:${productId}`);
      await adminService.deleteProduct(productId);
      setProducts((current) => current.filter((product) => product.id !== productId));
      if (selectedId === productId) setSelectedId(null);
      toast.success('Produit supprime.');
    } catch (err) {
      toast.error(err?.message || 'Impossible de supprimer ce produit.');
    } finally {
      setProcessingKey('');
    }
  };

  const handleExportCsv = () => {
    const rows = [
      ['Nom', 'Vendeur', 'Categorie', 'Prix', 'Stock', 'Etat stock', 'Actif', 'En revision', 'Ventes', 'Satisfaction', 'Diaspora %'],
      ...filteredProducts.map((product) => [
        product.name,
        product.vendorName,
        product.categoryName,
        product.price,
        product.stock,
        product.stockLabel,
        product.isActive ? 'Oui' : 'Non',
        product.pendingReview ? 'Oui' : 'Non',
        product.sales,
        product.satisfaction,
        product.diasporaPercent,
      ]),
    ];

    const csv = toCsv(rows);
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'catalogue-produits-admin.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Export CSV genere.');
  };

  if (isLoading) {
    return (
      <div className="flex h-screen overflow-hidden bg-[#f7f1ea]">
        <AdminSidebar pendingCount={metrics.pending} />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#c7632a]" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#fbf7f2] text-[#2b1308]">
      <AdminSidebar pendingCount={metrics.pending} />
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <section className="rounded-[34px] border border-[#ead8c6] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold">Catalogue Produits</h1>
              <p className="mt-2 text-sm text-[#6f5d4e]">
                {formatNumber(metrics.total)} produits · {formatNumber(metrics.outOfStock)} en rupture · {formatNumber(metrics.pending)} en attente de validation
              </p>
              <p className="mt-2 text-sm text-[#7c6a5d]">
                La section est interactive: clique sur n&apos;importe quelle ligne ou carte pour ouvrir le panneau detail.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={handleExportCsv} className="inline-flex items-center gap-2 rounded-full border border-[#ead8c6] px-4 py-2.5 text-sm text-[#5f4a3d] hover:bg-[#faf2eb]">
                <Download className="h-4 w-4" />
                Exporter
              </button>
              <button type="button" onClick={() => navigate('/admin/products/create')} className="inline-flex items-center gap-2 rounded-full bg-[#c7632a] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#af5523]">
                <Plus className="h-4 w-4" />
                Ajouter produit
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <article className="rounded-3xl border border-[#ead8c6] bg-white p-4">
              <p className="text-xs uppercase tracking-[0.15em] text-[#7c6a5d]">Total produits</p>
              <p className="mt-2 text-3xl font-semibold text-[#2b1308]">{formatNumber(metrics.total)}</p>
            </article>
            <article className="rounded-3xl border border-[#ead8c6] bg-white p-4">
              <p className="text-xs uppercase tracking-[0.15em] text-[#7c6a5d]">En vente</p>
              <p className="mt-2 text-3xl font-semibold text-[#2b1308]">{formatNumber(metrics.active)}</p>
            </article>
            <article className="rounded-3xl border border-[#ead8c6] bg-white p-4">
              <p className="text-xs uppercase tracking-[0.15em] text-[#7c6a5d]">Stock faible</p>
              <p className="mt-2 text-3xl font-semibold text-[#c47c22]">{formatNumber(metrics.lowStock)}</p>
            </article>
            <article className="rounded-3xl border border-[#ead8c6] bg-white p-4">
              <p className="text-xs uppercase tracking-[0.15em] text-[#7c6a5d]">En validation</p>
              <p className="mt-2 text-3xl font-semibold text-[#355f9d]">{formatNumber(metrics.pending)}</p>
            </article>
            <article className="rounded-3xl border border-[#ead8c6] bg-white p-4">
              <p className="text-xs uppercase tracking-[0.15em] text-[#7c6a5d]">Produit top</p>
              <p className="mt-2 text-xl font-semibold text-[#2b1308]">{metrics.top?.name || 'Aucun'}</p>
              <p className="text-sm text-[#6f5d4e]">{metrics.top ? `${formatNumber(metrics.top.sales)} ventes` : 'Pas de donnees'}</p>
            </article>
          </div>

          <div className="mt-6 flex flex-col gap-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8f7b6b]" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Nom, vendeur, categorie..."
                  className="w-full rounded-full border border-[#ead8c6] bg-[#fffdf9] py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#c7632a]"
                />
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setViewMode('grid')} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm ${viewMode === 'grid' ? 'bg-[#c7632a] text-white' : 'border border-[#ead8c6] text-[#5f4a3d] hover:bg-[#faf2eb]'}`}>
                  <Grid3x3 className="h-4 w-4" />
                  Grille
                </button>
                <button type="button" onClick={() => setViewMode('list')} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm ${viewMode === 'list' ? 'bg-[#c7632a] text-white' : 'border border-[#ead8c6] text-[#5f4a3d] hover:bg-[#faf2eb]'}`}>
                  <List className="h-4 w-4" />
                  Liste
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setCategoryFilter('all')} className={`rounded-full px-4 py-2 text-sm ${categoryFilter === 'all' ? 'bg-[#c7632a] text-white' : 'bg-[#faf2eb] text-[#5f4a3d]'}`}>
                  Tous
                </button>
                {categoryTabs.map((category) => (
                  <button key={category} type="button" onClick={() => setCategoryFilter(category)} className={`rounded-full px-4 py-2 text-sm ${categoryFilter === category ? 'bg-[#c7632a] text-white' : 'bg-[#faf2eb] text-[#5f4a3d]'}`}>
                    {category}
                  </button>
                ))}
              </div>
              <select
                value={stockFilter}
                onChange={(event) => setStockFilter(event.target.value)}
                className="rounded-full border border-[#ead8c6] bg-white px-4 py-2 text-sm text-[#5f4a3d] outline-none"
              >
                <option value="all">Tous les stocks</option>
                <option value="green">En stock</option>
                <option value="orange">Stock faible</option>
                <option value="red">Rupture</option>
              </select>
            </div>
          </div>
        </section>

        {error && <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

        <section className="mt-6">
          {visibleProducts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#d6c1ae] bg-white px-6 py-12 text-center text-[#7c6a5d]">
              Aucun produit trouve.
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {visibleProducts.map((product) => {
                const style = STOCK_STYLE[product.stockColor] || STOCK_STYLE.green;
                const isBusy = processingKey.includes(`:${product.id}`) || processingKey === `approve:${product.vendor?.id || ''}`;
                return (
                  <article key={product.id} onClick={() => setSelectedId(product.id)} className={`cursor-pointer overflow-hidden rounded-3xl border shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${style.card}`}>
                    <div className="relative aspect-[16/7] bg-[#f3e7d9]">
                      <span className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-medium ${style.badge}`}>{product.stockLabel}</span>
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-[#7c6a5d]">Aucune image</div>
                      )}
                    </div>
                    <div className="space-y-3 p-4">
                      <div>
                        <h3 className="text-lg font-semibold text-[#2b1308]">{product.name}</h3>
                        <p className="text-sm text-[#5f4a3d]">{product.vendorName}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {product.pendingReview && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#fff3d1] px-3 py-1 text-xs font-medium text-[#966200]">
                            <AlertCircle className="h-3.5 w-3.5" />
                            En revision
                          </span>
                        )}
                        {product.featured && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#f6e6d6] px-3 py-1 text-xs font-medium text-[#ad5a27]">
                            <Star className="h-3.5 w-3.5 fill-current" />
                            Top
                          </span>
                        )}
                      </div>

                      <p className="text-xl font-semibold text-[#c7632a]">{formatPrice(product.price)}</p>
                      <div className="flex justify-between text-sm text-[#5f4a3d]">
                        <span>{formatNumber(product.sales)} ventes</span>
                        <span>{product.diasporaPercent}% diaspora</span>
                      </div>

                      <div className="h-1.5 rounded-full bg-white">
                        <div className={`h-1.5 rounded-full ${style.bar}`} style={{ width: `${Math.max(15, Math.min(100, product.stock * 4))}%` }} />
                      </div>

                      <div className="flex gap-2" onClick={(event) => event.stopPropagation()}>
                        {product.pendingReview ? (
                          <button
                            type="button"
                            onClick={() => handleApproveVendor(product.vendor?.id)}
                            disabled={isBusy}
                            className="flex-1 rounded-full border border-[#d8bc9f] bg-white px-3 py-2 text-xs font-medium text-[#7c4f2a] hover:bg-[#faf2eb] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Valider
                          </button>
                        ) : (
                          <button type="button" onClick={() => setSelectedId(product.id)} className="flex-1 rounded-full border border-[#d8bc9f] bg-white px-3 py-2 text-xs font-medium text-[#7c4f2a] hover:bg-[#faf2eb]">
                            <span className="inline-flex items-center gap-1">
                              <Eye className="h-3.5 w-3.5" />
                              Voir
                            </span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(product.id)}
                          disabled={isBusy}
                          className="rounded-full bg-[#c7632a] px-3 py-2 text-xs font-medium text-white hover:bg-[#af5523] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {product.featured ? 'Retirer' : 'Mettre en avant'}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[980px] space-y-3">
                {visibleProducts.map((product) => {
                  const style = STOCK_STYLE[product.stockColor] || STOCK_STYLE.green;
                  const isBusy = processingKey.includes(`:${product.id}`) || processingKey === `approve:${product.vendor?.id || ''}`;
                  return (
                    <div key={product.id} onClick={() => setSelectedId(product.id)} className={`grid cursor-pointer grid-cols-[2.2fr_1fr_1fr_1fr_1.2fr] items-center gap-4 rounded-3xl border px-5 py-4 ${style.card}`}>
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-[#2b1308]">{product.name}</p>
                        <p className="truncate text-sm text-[#5f4a3d]">{product.vendorName}</p>
                      </div>
                      <div className="text-sm text-[#5f4a3d]">
                        <p>{product.categoryName}</p>
                        <p>{formatPrice(product.price)}</p>
                      </div>
                      <div className="text-sm text-[#5f4a3d]">
                        <p>{formatNumber(product.sales)} ventes</p>
                        <p>{product.satisfaction.toFixed(1)} / 5</p>
                      </div>
                      <div>
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${style.badge}`}>{product.stockLabel}</span>
                      </div>
                      <div className="flex justify-end gap-2" onClick={(event) => event.stopPropagation()}>
                        {product.pendingReview && (
                          <button
                            type="button"
                            onClick={() => handleApproveVendor(product.vendor?.id)}
                            disabled={isBusy}
                            className="rounded-full border border-[#d8bc9f] bg-white px-3 py-2 text-xs font-medium text-[#7c4f2a] hover:bg-[#faf2eb] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Valider
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(product.id)}
                          disabled={isBusy}
                          className="rounded-full bg-[#c7632a] px-3 py-2 text-xs font-medium text-white hover:bg-[#af5523] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {product.featured ? 'Retirer' : 'Mettre en avant'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-[#ead8c6] pt-5 text-sm text-[#6f5d4e]">
          <p>
            Affichage {filteredProducts.length ? `${start + 1}-${Math.min(start + PAGE_SIZE, filteredProducts.length)}` : '0'} sur {formatNumber(filteredProducts.length)} produits
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={safePage === 1}
              className="rounded-full border border-[#ead8c6] p-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="rounded-full bg-[#c7632a] px-3 py-1 text-white">{safePage}</span>
            <span>/ {totalPages}</span>
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={safePage === totalPages}
              className="rounded-full border border-[#ead8c6] p-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        </div>
      </main>

      <ProductDetailPanel
        product={selectedProduct}
        processingKey={processingKey}
        onClose={() => setSelectedId(null)}
        onApproveVendor={handleApproveVendor}
        onToggleStatus={handleToggleStatus}
        onToggleFeatured={handleToggleFeatured}
        onDeleteProduct={handleDeleteProduct}
      />
    </div>
  );
}
