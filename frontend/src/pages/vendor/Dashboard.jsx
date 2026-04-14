import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/vendor/Sidebar';
import Header from '../../components/vendor/Header';
import StatsCard from '../../components/vendor/StatsCard';
import Charts from '../../components/vendor/Charts';
import OrdersTable from '../../components/vendor/OrdersTable';
import TopProducts from '../../components/vendor/TopProducts';
import { authService } from '../../services/authService';
import { vendorDashboardService } from '../../services/vendorDashboardService';
import { buildVendorMenuSections } from '../../components/vendor/menuConfig';

function formatCurrency(value) {
  return new Intl.NumberFormat('fr-FR').format(Number(value || 0));
}

const DEFAULT_DATA = {
  stats: {
    monthlyRevenue: 0,
    ordersCount: 0,
    pendingCount: 0,
    totalProducts: 0,
    activeProducts: 0,
    outOfStockProducts: 0,
    shopRating: 0,
  },
  weeklyRevenue: [
    { label: 'S1', value: 0 },
    { label: 'S2', value: 0 },
    { label: 'S3', value: 0 },
    { label: 'S4', value: 0 },
    { label: 'S5', value: 0 },
  ],
  destinations: {
    total: 0,
    items: [
      { name: 'Sénégal', count: 0, percent: 0 },
      { name: 'France', count: 0, percent: 0 },
      { name: 'USA', count: 0, percent: 0 },
      { name: 'Autres', count: 0, percent: 0 },
    ],
  },
  topProducts: [],
  recentOrders: [],
  pagination: {
    page: 1,
    totalPages: 1,
    totalOrders: 0,
    perPage: 6,
  },
  notifications: {
    pendingOrders: 0,
  },
};

export default function VendorDashboard() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const [dashboardData, setDashboardData] = useState(DEFAULT_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('month');
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('vendor-dashboard-theme') === 'dark');

  const dateLabel = useMemo(
    () => new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    []
  );

  useEffect(() => {
    localStorage.setItem('vendor-dashboard-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError('');

        const result = await vendorDashboardService.getDashboardData({
          status: statusFilter,
          period: periodFilter,
          page: currentPage,
          perPage: 6,
        });

        setDashboardData(result);
      } catch (err) {
        setError(err?.message || 'Impossible de charger le dashboard vendeur.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [statusFilter, periodFilter, currentPage]);

  const menuSections = buildVendorMenuSections(dashboardData.notifications.pendingOrders);

  const handleNavigateMenu = (item) => {
    setActiveMenu(item.key);
    if (item.path) navigate(item.path);
  };

  const handleChangeStatusFilter = (event) => {
    setStatusFilter(event.target.value);
    setCurrentPage(1);
  };

  const handleChangePeriodFilter = (event) => {
    setPeriodFilter(event.target.value);
    setCurrentPage(1);
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className={[
        'min-h-screen',
        darkMode ? 'bg-[#140b06]' : 'bg-[#f8f4f1]',
      ].join(' ')}>
        <Sidebar
          menuSections={menuSections}
          activeKey={activeMenu}
          onNavigate={handleNavigateMenu}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          user={user}
          darkMode={darkMode}
        />

        <main className="px-4 pb-8 pt-4 lg:ml-72 lg:px-8 lg:pt-8">
          <Header
            dateLabel={dateLabel}
            onCreateProduct={() => navigate('/vendeur/products/new')}
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode((value) => !value)}
            pendingOrders={dashboardData.notifications.pendingOrders}
            onOpenSidebar={() => setSidebarOpen(true)}
          />

          <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <label className="text-sm">
              <span className={darkMode ? 'mb-1 block text-amber-200/80' : 'mb-1 block text-[#7c4f2a]'}>Période</span>
              <select
                value={periodFilter}
                onChange={handleChangePeriodFilter}
                className={[
                  'w-full rounded-lg border px-3 py-2',
                  darkMode
                    ? 'border-amber-700/40 bg-[#2a160e] text-amber-50'
                    : 'border-amber-200 bg-white text-[#2b1308]',
                ].join(' ')}
              >
                <option value="month">Ce mois</option>
                <option value="7d">7 derniers jours</option>
                <option value="30d">30 derniers jours</option>
                <option value="all">Tout</option>
              </select>
            </label>

            <label className="text-sm">
              <span className={darkMode ? 'mb-1 block text-amber-200/80' : 'mb-1 block text-[#7c4f2a]'}>Statut commande</span>
              <select
                value={statusFilter}
                onChange={handleChangeStatusFilter}
                className={[
                  'w-full rounded-lg border px-3 py-2',
                  darkMode
                    ? 'border-amber-700/40 bg-[#2a160e] text-amber-50'
                    : 'border-amber-200 bg-white text-[#2b1308]',
                ].join(' ')}
              >
                <option value="all">Tous</option>
                <option value="pending">En attente</option>
                <option value="processing">Préparation</option>
                <option value="shipped">Expédié</option>
                <option value="delivered">Livré</option>
                <option value="cancelled">Annulé</option>
              </select>
            </label>

            <div
              className={[
                'rounded-xl border px-3 py-2 text-sm',
                dashboardData.notifications.pendingOrders > 0
                  ? 'border-orange-300 bg-orange-100 text-orange-800'
                  : darkMode
                    ? 'border-emerald-700/40 bg-emerald-900/20 text-emerald-200'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-700',
              ].join(' ')}
            >
              {dashboardData.notifications.pendingOrders > 0
                ? `${dashboardData.notifications.pendingOrders} commande(s) nécessitent une action.`
                : 'Aucune alerte critique en cours.'}
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatsCard
              title="Revenus du mois"
              value={loading ? '...' : formatCurrency(dashboardData.stats.monthlyRevenue)}
              subtitle="suivi automatique"
              darkMode={darkMode}
            />
            <StatsCard
              title="Nombre de commandes"
              value={loading ? '...' : dashboardData.stats.ordersCount}
              subtitle={`${dashboardData.stats.pendingCount} en attente`}
              darkMode={darkMode}
            />
            <StatsCard
              title="Produits actifs"
              value={loading ? '...' : dashboardData.stats.activeProducts}
              subtitle={`${dashboardData.stats.totalProducts || 0} au total · ${dashboardData.stats.outOfStockProducts} en rupture`}
              darkMode={darkMode}
            />
            <StatsCard
              title="Note boutique"
              value={loading ? '...' : dashboardData.stats.shopRating}
              subtitle="moyenne clients"
              darkMode={darkMode}
            />
          </div>

          <div className="mt-4">
            <Charts
              weeklyRevenue={dashboardData.weeklyRevenue}
              destinations={dashboardData.destinations}
              darkMode={darkMode}
            />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <OrdersTable
                orders={dashboardData.recentOrders}
                pagination={dashboardData.pagination}
                darkMode={darkMode}
                onPageChange={setCurrentPage}
              />
            </div>

            <TopProducts products={dashboardData.topProducts} darkMode={darkMode} />
          </div>
        </main>
      </div>
    </div>
  );
}
