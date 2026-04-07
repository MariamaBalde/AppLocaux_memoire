import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import ProductList from '../../components/products/ProductList';
import Navbar from '../../components/common/Navbar';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import toast from 'react-hot-toast';
import './products.css';

const ORIGIN_OPTIONS = ['Dakar', 'Kaolack', 'Thies', 'Ziguinchor'];

function getSortOption(sortBy, sortOrder) {
  if (sortBy === 'price' && sortOrder === 'asc') return 'price_asc';
  if (sortBy === 'price' && sortOrder === 'desc') return 'price_desc';
  if (sortBy === 'name' && sortOrder === 'asc') return 'name_asc';
  return 'newest';
}

function getSortConfig(sortOption) {
  if (sortOption === 'price_asc') return { sort_by: 'price', sort_order: 'asc' };
  if (sortOption === 'price_desc') return { sort_by: 'price', sort_order: 'desc' };
  if (sortOption === 'name_asc') return { sort_by: 'name', sort_order: 'asc' };
  return { sort_by: 'created_at', sort_order: 'desc' };
}

function getSortLabel(sortOption) {
  if (sortOption === 'price_asc') return 'Prix croissant';
  if (sortOption === 'price_desc') return 'Prix decroissant';
  if (sortOption === 'name_asc') return 'Nom A-Z';
  return 'Popularite';
}

function buildFiltersFromParams(searchParams) {
  const sortByParam = searchParams.get('sort_by');
  const sortOrderParam = searchParams.get('sort_order');
  const legacySort = searchParams.get('sort');

  let sortOption = getSortOption(sortByParam, sortOrderParam);
  if (!sortByParam && legacySort === 'newest') sortOption = 'newest';
  if (!sortByParam && legacySort === 'popular') sortOption = 'newest';

  return {
    search: searchParams.get('search') || '',
    category_id: searchParams.get('category_id') || searchParams.get('category') || '',
    price_min: searchParams.get('price_min') || '',
    price_max: searchParams.get('price_max') || '',
    in_stock: searchParams.get('in_stock') || '',
    sort_option: sortOption,
    delivery_local: searchParams.get('delivery_local') || '',
    delivery_intl: searchParams.get('delivery_intl') || '',
  };
}

function enrichProductMeta(product, index = 0) {
  const numericSeed = Number(product?.id || index + 1);
  const origin = ORIGIN_OPTIONS[Math.abs(numericSeed) % ORIGIN_OPTIONS.length];
  const deliveryLocal = true;
  const deliveryIntl = numericSeed % 4 !== 0;
  const rawVendorRating = Number(product?.vendeur?.rating || product?.vendor?.rating || 4.3 + ((numericSeed % 7) / 10));
  const vendorRating = Math.max(3, Math.min(5, Number(rawVendorRating.toFixed(1))));

  return {
    ...product,
    _meta: {
      origin,
      deliveryLocal,
      deliveryIntl,
      vendorRating,
    },
  };
}

function extractProducts(payload) {
  const data = payload?.data ?? payload;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data)) return data;
  return [];
}

function extractPagination(payload) {
  const data = payload?.data ?? payload;
  if (data && typeof data === 'object' && !Array.isArray(data) && Array.isArray(data.data)) {
    return {
      current_page: Number(data.current_page || 1),
      last_page: Number(data.last_page || 1),
      total: Number(data.total || data.data.length || 0),
      per_page: Number(data.per_page || data.data.length || 0),
    };
  }

  const list = extractProducts(payload);
  return {
    current_page: 1,
    last_page: 1,
    total: list.length,
    per_page: list.length,
  };
}

function getVisiblePaginationItems(currentPage, lastPage) {
  if (lastPage <= 7) {
    return Array.from({ length: lastPage }, (_, index) => index + 1);
  }

  const pages = new Set([1, lastPage, currentPage, currentPage - 1, currentPage + 1]);
  const safePages = Array.from(pages)
    .filter((page) => page >= 1 && page <= lastPage)
    .sort((a, b) => a - b);

  const items = [];
  for (let i = 0; i < safePages.length; i += 1) {
    const page = safePages[i];
    const prev = safePages[i - 1];
    if (i > 0 && page - prev > 1) {
      items.push('ellipsis');
    }
    items.push(page);
  }

  return items;
}

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState(() => buildFiltersFromParams(searchParams));

  useEffect(() => {
    setFilters(buildFiltersFromParams(searchParams));
  }, [searchParams]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      if (response?.success && Array.isArray(response.data)) {
        setCategories(response.data);
      } else if (Array.isArray(response?.data)) {
        setCategories(response.data);
      } else if (Array.isArray(response)) {
        setCategories(response);
      } else {
        setCategories([]);
      }
    } catch (fetchError) {
      console.error('Erreur categories:', fetchError);
      setCategories([]);
    }
  };

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const activeFilters = buildFiltersFromParams(searchParams);
      const sortConfig = getSortConfig(activeFilters.sort_option);

      const queryFilters = {
        search: activeFilters.search,
        category_id: activeFilters.category_id,
        price_min: activeFilters.price_min,
        price_max: activeFilters.price_max,
        in_stock: activeFilters.in_stock,
        sort_by: sortConfig.sort_by,
        sort_order: sortConfig.sort_order,
        page: searchParams.get('page') || '1',
        per_page: '6',
      };

      const response = await productService.getProducts(queryFilters);
      const list = extractProducts(response)
        .filter((item) => item && item.is_active !== false)
        .map((item, index) => enrichProductMeta(item, index));
      setProducts(list);
      setPagination(extractPagination(response));
    } catch (fetchError) {
      setError('Erreur lors du chargement des produits');
      toast.error('Erreur lors du chargement des produits');
      console.error(fetchError);
      setProducts([]);
      setPagination({ current_page: 1, last_page: 1, total: 0, per_page: 0 });
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const applyFiltersToUrl = (nextFilters, page = '1') => {
    const sortConfig = getSortConfig(nextFilters.sort_option);
    const params = {};

    if (nextFilters.search) params.search = nextFilters.search;
    if (nextFilters.category_id) params.category_id = nextFilters.category_id;
    if (nextFilters.price_min) params.price_min = nextFilters.price_min;
    if (nextFilters.price_max) params.price_max = nextFilters.price_max;
    if (nextFilters.in_stock) params.in_stock = nextFilters.in_stock;
    if (nextFilters.delivery_local) params.delivery_local = nextFilters.delivery_local;
    if (nextFilters.delivery_intl) params.delivery_intl = nextFilters.delivery_intl;

    params.sort_by = sortConfig.sort_by;
    params.sort_order = sortConfig.sort_order;
    params.page = page;
    setSearchParams(params);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleCategorySelection = (categoryId) => {
    const nextFilters = { ...filters, category_id: categoryId };
    setFilters(nextFilters);
    applyFiltersToUrl(nextFilters, '1');
  };

  const applyFilters = () => {
    applyFiltersToUrl(filters, '1');
    setShowFilters(false);
  };

  const resetFilters = () => {
    const cleanFilters = {
      search: '',
      category_id: '',
      price_min: '',
      price_max: '',
      in_stock: '',
      sort_option: 'newest',
      delivery_local: '',
      delivery_intl: '',
    };

    setFilters(cleanFilters);
    applyFiltersToUrl(cleanFilters, '1');
    setShowFilters(false);
  };

  const removeFilter = (key) => {
    const nextFilters = {
      ...filters,
      [key]: '',
    };

    setFilters(nextFilters);
    applyFiltersToUrl(nextFilters, '1');
  };

  const handleSortChange = (sortOption) => {
    const nextFilters = { ...filters, sort_option: sortOption };
    setFilters(nextFilters);
    applyFiltersToUrl(nextFilters, '1');
  };

  const handlePageChange = (page) => {
    const params = Object.fromEntries(searchParams.entries());
    params.page = String(page);
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (filters.delivery_local === 'true' && !product?._meta?.deliveryLocal) return false;
      if (filters.delivery_intl === 'true' && !product?._meta?.deliveryIntl) return false;

      return true;
    });
  }, [products, filters.delivery_intl, filters.delivery_local]);

  const totalProducts = pagination?.total ?? filteredProducts.length;

  const vendorCount = useMemo(() => {
    const vendors = filteredProducts
      .map((product) => product?.vendeur?.shop_name || product?.vendeur?.user?.name || product?.vendor?.name || '')
      .filter(Boolean);
    return new Set(vendors).size;
  }, [filteredProducts]);

  const featuredCategories = useMemo(() => categories.slice(0, 5), [categories]);

  const activeFilterChips = useMemo(() => {
    const chips = [];

    if (filters.search) chips.push({ key: 'search', label: filters.search });

    if (filters.category_id) {
      const selectedCategory = categories.find((category) => String(category.id) === String(filters.category_id));
      chips.push({ key: 'category_id', label: selectedCategory?.name || 'Categorie' });
    }

    if (filters.price_min) chips.push({ key: 'price_min', label: `Min ${filters.price_min} FCFA` });
    if (filters.price_max) chips.push({ key: 'price_max', label: `Max ${filters.price_max} FCFA` });
    if (filters.delivery_local === 'true') chips.push({ key: 'delivery_local', label: 'Livraison locale' });
    if (filters.delivery_intl === 'true') chips.push({ key: 'delivery_intl', label: 'Expedition intl.' });

    return chips;
  }, [categories, filters]);

  const startItem = useMemo(() => {
    if (!pagination || totalProducts === 0) return 0;
    const perPage = pagination.per_page || filteredProducts.length;
    return (pagination.current_page - 1) * perPage + 1;
  }, [pagination, filteredProducts.length, totalProducts]);

  const endItem = useMemo(() => {
    if (!pagination || totalProducts === 0) return 0;
    const perPage = pagination.per_page || filteredProducts.length;
    return Math.min(totalProducts, (pagination.current_page - 1) * perPage + filteredProducts.length);
  }, [pagination, filteredProducts.length, totalProducts]);

  return (
    <div className="catalog-page">
      <Navbar variant="catalog" />

      <section className="catalog-hero">
        <div className="catalog-hero-inner">
          <div className="catalog-hero-content">
            <p className="catalog-overline">Produits locaux africains</p>
            <h1>Le meilleur du Senegal, livre partout dans le monde</h1>
            <p>
              Commandez directement aupres des producteurs. Livraison locale ou expedition internationale
              pour la diaspora.
            </p>

            <div className="catalog-hero-tags">
              {featuredCategories.map((category) => (
                <button
                  type="button"
                  key={category.id}
                  className="hero-tag"
                  onClick={() => {
                    const nextFilters = { ...filters, category_id: String(category.id) };
                    setFilters(nextFilters);
                    applyFiltersToUrl(nextFilters, '1');
                  }}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          <div className="catalog-hero-stats" aria-hidden="true">
            <div>
              <strong>{totalProducts}+</strong>
              <span>Produits</span>
            </div>
            <div>
              <strong>{vendorCount || 0}</strong>
              <span>Vendeurs</span>
            </div>
            <div>
              <strong>32</strong>
              <span>Pays</span>
            </div>
          </div>
        </div>
      </section>

      <div className="catalog-body-wrap">
        <div className="catalog-body">
          <aside className="catalog-sidebar desktop-only">
            <h3>Categories</h3>
            <div className="catalog-sidebar-list">
              <button
                type="button"
                className={`category-check-item ${filters.category_id === '' ? 'active' : ''}`}
                onClick={() => handleCategorySelection('')}
              >
                <span className="category-check-main">
                  <span className="category-check-box" aria-hidden="true">✓</span>
                  <span>Tout</span>
                </span>
                <span className="category-count-badge">{totalProducts}</span>
              </button>
              {categories.map((category) => (
                <button
                  type="button"
                  key={category.id}
                  className={`category-check-item ${String(filters.category_id) === String(category.id) ? 'active' : ''}`}
                  onClick={() => handleCategorySelection(String(category.id))}
                >
                  <span className="category-check-main">
                    <span className="category-check-box" aria-hidden="true">✓</span>
                    <span>{category.name}</span>
                  </span>
                  <span className="category-count-badge">{category.products_count || 0}</span>
                </button>
              ))}
            </div>

            <div className="filter-block">
              <label htmlFor="price-min">Prix (FCFA)</label>
              <div className="price-row">
                <input
                  id="price-min"
                  type="number"
                  value={filters.price_min}
                  placeholder="0"
                  onChange={(e) => handleFilterChange('price_min', e.target.value)}
                />
                <span>-</span>
                <input
                  id="price-max"
                  type="number"
                  value={filters.price_max}
                  placeholder="10 000"
                  onChange={(e) => handleFilterChange('price_max', e.target.value)}
                />
              </div>
            </div>

            <div className="filter-block toggle-block">
              <span>Livraison</span>
              <div className="delivery-row">
                <span>Livraison locale</span>
                <label className="switch-wrap" htmlFor="delivery-local-toggle">
                  <input
                    id="delivery-local-toggle"
                    type="checkbox"
                    checked={filters.delivery_local === 'true'}
                    onChange={(e) => handleFilterChange('delivery_local', e.target.checked ? 'true' : '')}
                  />
                  <span className="switch-ui" />
                </label>
              </div>

              <div className="delivery-row">
                <span>✈ Expedition intl.</span>
                <label className="switch-wrap" htmlFor="delivery-intl-toggle">
                  <input
                    id="delivery-intl-toggle"
                    type="checkbox"
                    checked={filters.delivery_intl === 'true'}
                    onChange={(e) => handleFilterChange('delivery_intl', e.target.checked ? 'true' : '')}
                  />
                  <span className="switch-ui secondary" />
                </label>
              </div>
            </div>

            <div className="sidebar-actions">
              <button type="button" className="sidebar-btn apply" onClick={applyFilters}>
                Appliquer les filtres
              </button>
              <button type="button" className="sidebar-btn reset" onClick={resetFilters}>
                Reinitialiser
              </button>
            </div>
          </aside>

          <main className="catalog-main">
            <div className="catalog-toolbar">
              <div>
                <h2>{totalProducts} produits trouves</h2>
                {activeFilterChips.length > 0 && (
                  <div className="active-chips">
                    <span>Filtres actifs :</span>
                    {activeFilterChips.map((chip) => (
                      <button key={chip.key} type="button" onClick={() => removeFilter(chip.key)} className="chip-pill">
                        {chip.label} <X size={14} />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="toolbar-actions">
                <button onClick={() => setShowFilters(true)} className="mobile-filter-btn" type="button">
                  <SlidersHorizontal size={16} /> Filtres
                </button>

                <label className="sort-select" htmlFor="catalog-sort">
                  <span>{getSortLabel(filters.sort_option)}</span>
                  <ChevronDown size={16} />
                  <select
                    id="catalog-sort"
                    value={filters.sort_option}
                    onChange={(e) => handleSortChange(e.target.value)}
                  >
                    <option value="newest">Popularite</option>
                    <option value="price_asc">Prix croissant</option>
                    <option value="price_desc">Prix decroissant</option>
                    <option value="name_asc">Nom A-Z</option>
                  </select>
                </label>
              </div>
            </div>

            <ProductList products={filteredProducts} loading={loading} error={error} />

            {pagination && pagination.last_page > 1 && (
              <div className="catalog-pagination-wrap">
                <p>
                  Affichage {startItem}-{endItem} sur {totalProducts} produits
                </p>

                <div className="catalog-pagination">
                  <button
                    onClick={() => handlePageChange(pagination.current_page - 1)}
                    disabled={pagination.current_page <= 1}
                    type="button"
                  >
                    ‹
                  </button>

                  {getVisiblePaginationItems(pagination.current_page, pagination.last_page).map((item, index) =>
                    item === 'ellipsis' ? (
                      <span key={`ellipsis-${index}`} className="ellipsis">...</span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => handlePageChange(item)}
                        className={pagination.current_page === item ? 'active' : ''}
                        type="button"
                      >
                        {item}
                      </button>
                    )
                  )}

                  <button
                    onClick={() => handlePageChange(pagination.current_page + 1)}
                    disabled={pagination.current_page >= pagination.last_page}
                    type="button"
                  >
                    ›
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {showFilters && (
        <div className="mobile-filter-overlay">
          <div className="mobile-filter-panel">
            <div className="mobile-filter-head">
              <h3>Filtres</h3>
              <button onClick={() => setShowFilters(false)} type="button">
                <X size={20} />
              </button>
            </div>

            <div className="mobile-filter-content">
              <div>
                <label htmlFor="mobile-search">Recherche</label>
                <input
                  id="mobile-search"
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Nom du produit"
                />
              </div>

              <div>
                <label htmlFor="mobile-category">Categorie</label>
                <select
                  id="mobile-category"
                  value={filters.category_id}
                  onChange={(e) => handleFilterChange('category_id', e.target.value)}
                >
                  <option value="">Toutes les categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Prix (FCFA)</label>
                <div className="price-row">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.price_min}
                    onChange={(e) => handleFilterChange('price_min', e.target.value)}
                  />
                  <span>-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.price_max}
                    onChange={(e) => handleFilterChange('price_max', e.target.value)}
                  />
                </div>
              </div>

              <label className="switch-wrap" htmlFor="mobile-delivery-local">
                <input
                  id="mobile-delivery-local"
                  type="checkbox"
                  checked={filters.delivery_local === 'true'}
                  onChange={(e) => handleFilterChange('delivery_local', e.target.checked ? 'true' : '')}
                />
                <span className="switch-ui" />
                <span>Livraison locale</span>
              </label>

              <label className="switch-wrap" htmlFor="mobile-delivery-intl">
                <input
                  id="mobile-delivery-intl"
                  type="checkbox"
                  checked={filters.delivery_intl === 'true'}
                  onChange={(e) => handleFilterChange('delivery_intl', e.target.checked ? 'true' : '')}
                />
                <span className="switch-ui" />
                <span>Expedition intl.</span>
              </label>
            </div>

            <div className="mobile-filter-actions">
              <button type="button" className="sidebar-btn apply" onClick={applyFilters}>
                Appliquer
              </button>
              <button type="button" className="sidebar-btn reset" onClick={resetFilters}>
                Reinitialiser
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
