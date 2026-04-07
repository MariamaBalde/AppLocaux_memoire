import { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  Loader2,
  Menu,
  Settings,
  ShoppingCart,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/adminService';

function unwrap(payload) {
  if (!payload) return null;
  return payload.data ?? payload;
}

function formatCompact(value) {
  const num = Number(value || 0);
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${Math.round(num / 1000)}K`;
  return num.toLocaleString('fr-FR');
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString('fr-FR');
}

function clampPercent(value) {
  const num = Number(value || 0);
  return Math.max(0, Math.min(100, num));
}

function monthShortName(name, index) {
  const map = {
    January: 'Jan',
    February: 'Fev',
    March: 'Mar',
    April: 'Avr',
    May: 'Mai',
    June: 'Juin',
    July: 'Juil',
    August: 'Aout',
    September: 'Sep',
    October: 'Oct',
    November: 'Nov',
    December: 'Dec',
  };
  return map[name] || `${index + 1}`;
}

function parseShippingCountry(address) {
  if (!address || typeof address !== 'string') return 'Non defini';
  const parts = address.split(',').map((part) => part.trim()).filter(Boolean);
  if (!parts.length) return 'Non defini';
  return parts[parts.length - 1];
}

function parseShippingLocation(address) {
  if (!address || typeof address !== 'string') return 'Destination inconnue';
  const parts = address.split(',').map((part) => part.trim()).filter(Boolean);
  if (parts.length >= 2) return `${parts[parts.length - 2]} - ${parts[parts.length - 1]}`;
  return parts[parts.length - 1] || 'Destination inconnue';
}

function formatPaymentMethod(method) {
  const labels = {
    wave: 'Wave',
    orange_money: 'Orange Money',
    stripe: 'Stripe',
    paypal: 'Paypal',
    visa: 'Visa',
  };
  return labels[method] || 'N/A';
}

function timeAgo(dateString) {
  if (!dateString) return 'Date inconnue';
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffMin = Math.max(1, Math.floor(diffMs / 60000));
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `il y a ${diffHour} h`;
  const diffDay = Math.floor(diffHour / 24);
  return `il y a ${diffDay} j`;
}

const KPI_TONE = {
  orange: { text: 'text-[#bf5a21]', bar: 'bg-[#c7632a]' },
  amber: { text: 'text-[#b27b16]', bar: 'bg-[#bc8f2f]' },
  green: { text: 'text-[#3f7e3f]', bar: 'bg-[#4f8a45]' },
  blue: { text: 'text-[#2869b9]', bar: 'bg-[#3f74c7]' },
};

const DESTINATION_COLORS = ['bg-[#c7672e]', 'bg-[#cfa646]', 'bg-[#6fa06d]', 'bg-[#4a76b8]', 'bg-[#8e7665]', 'bg-[#74b8cb]'];

const STATUS_STYLE = {
  Actif: 'text-[#2f7a3b]',
  'Signale': 'text-[#b45c1c]',
  'En revision': 'text-[#2f5f9f]',
  Suspendu: 'text-[#8f2f46]',
};

export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [stats, setStats] = useState({});
  const [advancedStats, setAdvancedStats] = useState({});
  const [salesData, setSalesData] = useState([]);
  const [topVendors, setTopVendors] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [pendingVendors, setPendingVendors] = useState([]);
  const [vendorUsers, setVendorUsers] = useState([]);
  const [vendorUsersTotal, setVendorUsersTotal] = useState(0);
  const [clientUsersTotal, setClientUsersTotal] = useState(0);

  const pendingCount = Number(pendingVendors.length || stats.pending_vendeurs || 0);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setIsLoading(true);
        setError('');

        const results = await Promise.allSettled([
          adminService.getDashboardStats(),
          adminService.getAdvancedStats(),
          adminService.getSalesPerMonth(new Date().getFullYear()),
          adminService.getTopVendors(6),
          adminService.getRecentOrders(12),
          adminService.getPendingVendors(),
          adminService.getVendorUsers({ per_page: 200 }),
          adminService.getUsers({ role: 'client', per_page: 200 }),
        ]);

        if (!mounted) return;

        const [
          statsResult,
          advancedResult,
          salesResult,
          topVendorsResult,
          recentOrdersResult,
          pendingVendorsResult,
          vendorUsersResult,
          clientUsersResult,
        ] = results;

        const safeValue = (result, fallback) => (result.status === 'fulfilled' ? result.value : fallback);

        setStats(unwrap(safeValue(statsResult, null)) || {});
        setAdvancedStats(unwrap(safeValue(advancedResult, null)) || {});
        setSalesData(Array.isArray(unwrap(safeValue(salesResult, null))) ? unwrap(safeValue(salesResult, null)) : []);
        setTopVendors(Array.isArray(unwrap(safeValue(topVendorsResult, null))) ? unwrap(safeValue(topVendorsResult, null)) : []);
        setRecentOrders(Array.isArray(unwrap(safeValue(recentOrdersResult, null))) ? unwrap(safeValue(recentOrdersResult, null)) : []);
        setPendingVendors(Array.isArray(unwrap(safeValue(pendingVendorsResult, null))) ? unwrap(safeValue(pendingVendorsResult, null)) : []);

        const usersPayload = unwrap(safeValue(vendorUsersResult, null));
        const users = Array.isArray(usersPayload)
          ? usersPayload
          : Array.isArray(usersPayload?.data)
            ? usersPayload.data
            : [];
        setVendorUsers(users);
        setVendorUsersTotal(Number(usersPayload?.total || users.length || 0));

        const clientsPayload = unwrap(safeValue(clientUsersResult, null));
        const clients = Array.isArray(clientsPayload)
          ? clientsPayload
          : Array.isArray(clientsPayload?.data)
            ? clientsPayload.data
            : [];
        setClientUsersTotal(Number(clientsPayload?.total || clients.length || 0));

        if (results.every((result) => result.status === 'rejected')) {
          setError('Impossible de charger les donnees du dashboard admin.');
        }
      } catch (err) {
        if (!mounted) return;
        setError('Impossible de charger les donnees du dashboard admin.');
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const navSections = useMemo(
    () => [
      {
        title: "Vue d'ensemble",
        items: [
          { label: 'Dashboard', icon: BarChart3, active: true },
        ],
      },
      {
        title: 'Gestion',
        items: [
          { label: 'Vendeurs', icon: Users, badge: String(pendingCount) },
          { label: 'Clients', icon: Users, badge: formatCompact(stats.total_clients) },
          { label: 'Commandes', icon: ShoppingCart },
          { label: 'Produits', icon: Wrench },
        ],
      },
      {
        title: 'Systeme',
        items: [
          { label: 'Parametres', icon: Settings },
        ],
      },
    ],
    [pendingCount, stats]
  );

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      setError('Erreur lors de la deconnexion.');
    }
  };

  const kpis = useMemo(() => {
    const totalRevenue = Number(stats.total_revenue || 0);
    const revenueThisMonth = Number(stats.revenue_this_month || 0);
    const revenueGrowth = Number(advancedStats.revenue_growth || 0);
    const totalOrders = Number(stats.total_orders || 0);
    const completedOrders = Number(stats.completed_orders || 0);
    const totalVendors = Number(stats.total_vendeurs || vendorUsersTotal || 0);
    const pendingVendorsCount = pendingCount;
    const activeVendors = Math.max(0, totalVendors - pendingVendorsCount);
    const totalClients = Number(stats.total_clients || clientUsersTotal || 0);
    const totalUsers = Number(stats.total_users || 0);
    const commission = totalRevenue * 0.05;

    return [
      {
        label: 'GMV TOTAL',
        value: formatCompact(totalRevenue),
        hint: `${revenueGrowth >= 0 ? '+' : ''}${revenueGrowth.toFixed(1)}% vs mois precedent`,
        progress: clampPercent((revenueThisMonth / Math.max(1, totalRevenue)) * 100),
        tone: 'orange',
      },
      {
        label: 'COMMANDES',
        value: formatNumber(totalOrders),
        hint: `${formatNumber(stats.pending_orders)} en attente`,
        progress: clampPercent((completedOrders / Math.max(1, totalOrders)) * 100),
        tone: 'amber',
      },
      {
        label: 'VENDEURS ACTIFS',
        value: formatNumber(activeVendors),
        hint: `${formatNumber(pendingVendorsCount)} en attente`,
        progress: clampPercent((activeVendors / Math.max(1, totalVendors)) * 100),
        tone: 'green',
      },
      {
        label: 'CLIENTS INSCRITS',
        value: formatNumber(totalClients),
        hint: `${formatNumber(Math.max(0, totalUsers - totalClients))} autres comptes`,
        progress: clampPercent((totalClients / Math.max(1, totalUsers)) * 100),
        tone: 'blue',
      },
      {
        label: 'COMMISSION PERCUE',
        value: formatCompact(commission),
        hint: '5% du GMV realise',
        progress: clampPercent((commission / Math.max(1, revenueThisMonth || totalRevenue)) * 100),
        tone: 'orange',
      },
    ];
  }, [advancedStats, clientUsersTotal, pendingCount, stats, vendorUsersTotal]);

  const chartData = useMemo(
    () =>
      salesData.map((point, index) => ({
        month: monthShortName(point.month_name, index),
        total: Number(point.total || 0),
        ordersCount: Number(point.orders_count || 0),
      })),
    [salesData]
  );

  const maxGMV = useMemo(() => Math.max(...chartData.map((item) => item.total), 1), [chartData]);

  const chartStats = useMemo(() => {
    const thisMonth = Number(stats.revenue_this_month || 0);
    const objective = thisMonth > 0 ? Math.ceil(thisMonth * 1.06) : 5000000;
    const rate = objective > 0 ? (thisMonth / objective) * 100 : 0;
    const avgOrder = Number(advancedStats.average_order_value || 0);

    return {
      thisMonth,
      objective,
      rate: clampPercent(rate),
      avgOrder,
    };
  }, [advancedStats, stats]);

  const alerts = useMemo(
    () => [
      {
        id: 1,
        color: 'bg-[#fff8f4] border-[#f0d8ca] text-[#542e17]',
        dot: 'bg-[#c66a2e]',
        title: `${formatNumber(pendingCount)} vendeurs en attente de validation (KYC)`,
        meta: 'Priorite haute',
      },
      {
        id: 2,
        color: 'bg-[#fffbf2] border-[#eddcb8] text-[#533a16]',
        dot: 'bg-[#b9861f]',
        title: `${formatNumber(stats.pending_orders)} commandes en attente de traitement`,
        meta: 'A traiter',
      },
      {
        id: 3,
        color: 'bg-[#fff9f2] border-[#f0d9b5] text-[#4f3313]',
        dot: 'bg-[#bf7d12]',
        title: `${formatNumber(stats.cancelled_orders)} litiges/annulations non resolus`,
        meta: 'Suivi urgent',
      },
      {
        id: 4,
        color: 'bg-[#f5faff] border-[#cfe0f5] text-[#1e4673]',
        dot: 'bg-[#2f77c5]',
        title: `${formatNumber(stats.total_products)} produits actifs sur la plateforme`,
        meta: 'Info operationnelle',
      },
      {
        id: 5,
        color: 'bg-[#f5fff7] border-[#cde8d3] text-[#264f30]',
        dot: 'bg-[#4d8f58]',
        title: `${formatNumber(stats.completed_orders)} commandes completees`,
        meta: 'Cycle de paiement valide',
      },
    ],
    [pendingCount, stats]
  );

  const vendorsTable = useMemo(() => {
    const userMap = new Map(vendorUsers.map((user) => [String(user.email || user.name || user.id), user]));

    return topVendors.slice(0, 6).map((vendor, index) => {
      const matchingUser = userMap.get(String(vendor.user_name)) || vendorUsers.find((u) => u.name === vendor.user_name);

      let status = 'Actif';
      if (matchingUser?.statut === 'suspendu') {
        status = 'Suspendu';
      } else if (!vendor.verified) {
        status = 'En revision';
      } else if (Number(vendor.rating || 0) > 0 && Number(vendor.rating || 0) < 3.5) {
        status = 'Signale';
      }

      const initials = String(vendor.shop_name || '?')
        .split(' ')
        .slice(0, 2)
        .map((part) => part?.[0]?.toUpperCase() || '')
        .join('') || `V${index + 1}`;

      return {
        id: vendor.id,
        shortName: initials,
        name: vendor.shop_name || vendor.user_name || `Vendeur ${index + 1}`,
        city: matchingUser?.country || 'SN',
        products: Number(vendor.total_sales || 0),
        gmv: `${formatCompact(Number(vendor.total_sales || 0) * Number(advancedStats.average_order_value || 0))}`,
        status,
      };
    });
  }, [advancedStats.average_order_value, topVendors, vendorUsers]);

  const destinations = useMemo(() => {
    const grouped = recentOrders.reduce((acc, order) => {
      const country = parseShippingCountry(order.shipping_address);
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {});

    const entries = Object.entries(grouped)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const max = Math.max(...entries.map((entry) => entry.count), 1);

    return entries.map((entry, index) => ({
      ...entry,
      percent: clampPercent((entry.count / max) * 100),
      color: DESTINATION_COLORS[index % DESTINATION_COLORS.length],
    }));
  }, [recentOrders]);

  const transactions = useMemo(
    () =>
      recentOrders.slice(0, 8).map((order) => {
        const paymentMethod = formatPaymentMethod(order?.payment?.method);
        const isRefund = order.status === 'refunded' || order?.payment?.status === 'refunded';
        const isCancelled = order.status === 'cancelled';
        const positive = !(isRefund || isCancelled);

        let nature = 'Commande';
        if (isRefund) nature = 'Remboursement';
        if (isCancelled) nature = 'Annulation';

        const amount = `${positive ? '+' : '-'}${formatNumber(order.total)}`;

        return {
          id: String(order.id),
          title: `${nature} #${order.order_number || order.id} - ${parseShippingLocation(order.shipping_address)}`,
          subtitle: `${paymentMethod} - ${timeAgo(order.created_at)}`,
          amount,
          positive,
        };
      }),
    [recentOrders]
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f7]">
        <Loader2 className="h-8 w-8 animate-spin text-[#c7632a]" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f7f7f7]">
      <aside
        className={`${sidebarOpen ? 'w-72' : 'w-20'} bg-[#180602] text-[#f2d9bd] transition-all duration-300 flex-shrink-0`}
      >
        <div className="flex h-full flex-col border-r border-[#2f130a]">
          <div className="border-b border-[#2f130a] px-5 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#cf6d2f] text-xs font-semibold text-white">
                  A
                </div>
                {sidebarOpen && <span className="text-3xl font-semibold text-[#f0be82]">AfriMarket</span>}
              </div>
              <button
                type="button"
                className="text-[#a88467] hover:text-[#f2d9bd]"
                onClick={() => setSidebarOpen((prev) => !prev)}
                aria-label="Basculer la sidebar"
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
            {sidebarOpen && <p className="mt-2 text-xs uppercase tracking-[0.15em] text-[#7f5f4a]">Administration</p>}
          </div>

          <nav className="flex-1 overflow-y-auto px-4 py-4">
            {navSections.map((section) => (
              <div key={section.title} className="mb-6">
                {sidebarOpen && (
                  <p className="mb-2 text-xs uppercase tracking-[0.18em] text-[#7f5f4a]">{section.title}</p>
                )}
                <ul className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.label}>
                        <button
                          type="button"
                          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition ${
                            item.active ? 'bg-[#31140b] text-[#f4d8bc]' : 'hover:bg-[#251008] text-[#d7b392]'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {sidebarOpen && <span className="text-sm">{item.label}</span>}
                          {sidebarOpen && item.badge && (
                            <span className="ml-auto rounded-full bg-[#c8652a] px-2 py-0.5 text-[11px] text-white">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          <div className="border-t border-[#2f130a] p-4">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#cb6b2f] text-xs font-semibold text-white">
                AD
              </div>
              {sidebarOpen && (
                <div>
                  <p className="text-sm font-semibold">Admin Principal</p>
                  <p className="text-xs text-[#8f705c]">Super administrateur</p>
                </div>
              )}
            </div>
            {sidebarOpen && (
              <button
                type="button"
                onClick={handleLogout}
                className="mt-3 w-full rounded-md border border-[#5f3824] px-3 py-2 text-left text-sm text-[#f2d9bd] transition hover:bg-[#2b1209]"
              >
                Deconnexion
              </button>
            )}
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-6 lg:p-8">
        <header className="mb-7 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-[#23170f]">Vue d'ensemble de la plateforme</h1>
            <p className="text-sm text-[#6a584a]">Mis a jour en temps reel</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <button type="button" className="rounded-full bg-[#cb6b2f] px-4 py-2 text-white">Ce mois</button>
            <button type="button" className="rounded-md border border-[#d2c3b7] px-4 py-2">Trim.</button>
            <button type="button" className="rounded-md border border-[#d2c3b7] px-4 py-2">Annee</button>
            <button type="button" className="rounded-md border border-[#d2c3b7] px-4 py-2">Exporter</button>
          </div>
        </header>

        {error ? (
          <div className="mb-6 rounded-md border border-[#f2c8b2] bg-[#fff4ee] px-4 py-3 text-sm text-[#8a3f1d]">
            {error}
          </div>
        ) : null}

        <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {kpis.map((kpi) => {
            const tone = KPI_TONE[kpi.tone];
            return (
              <article key={kpi.label} className="rounded-lg border border-[#e4d9d0] bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#664d3c]">{kpi.label}</p>
                <p className={`mt-2 text-4xl font-semibold ${tone.text}`}>{kpi.value}</p>
                <p className="mt-1 text-xs text-[#6f5d4e]">{kpi.hint}</p>
                <div className="mt-3 h-1.5 rounded-full bg-[#efe7e0]">
                  <div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${kpi.progress}%` }} />
                </div>
              </article>
            );
          })}
        </section>

        <section className="mb-8 grid gap-6 lg:grid-cols-[2fr_1.2fr]">
          <article className="rounded-lg border border-[#e4d9d0] bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#261911]">Evolution des revenus (GMV - FCFA)</h2>
              <button type="button" className="text-sm text-[#3f2b1f] hover:underline">Detail -></button>
            </div>
            <div className="mb-4 flex h-40 items-end gap-1.5">
              {chartData.map((point) => {
                const height = point.total === 0 ? 6 : Math.max(12, (point.total / maxGMV) * 100);
                return (
                  <div key={point.month} className="flex flex-1 flex-col items-center justify-end">
                    <div
                      className="w-full rounded-t-sm bg-gradient-to-t from-[#c4672d] to-[#e7b48a]"
                      style={{ height: `${height}%` }}
                    />
                    <span className="mt-2 text-xs text-[#6f5d4e]">{point.month}</span>
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
              <div>
                <p className="text-[#6f5d4e]">Ce mois</p>
                <p className="font-semibold text-[#251910]">{formatNumber(chartStats.thisMonth)}</p>
              </div>
              <div>
                <p className="text-[#6f5d4e]">Objectif</p>
                <p className="font-semibold text-[#251910]">{formatNumber(chartStats.objective)}</p>
              </div>
              <div>
                <p className="text-[#6f5d4e]">Taux atteinte</p>
                <p className="font-semibold text-[#3f7e3f]">{chartStats.rate.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-[#6f5d4e]">Moy. / commande</p>
                <p className="font-semibold text-[#251910]">{formatNumber(chartStats.avgOrder)}</p>
              </div>
            </div>
          </article>

          <article className="rounded-lg border border-[#e4d9d0] bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#261911]">Alertes & Actions requises</h2>
              <button type="button" className="text-sm text-[#3f2b1f] hover:underline">Tout voir</button>
            </div>
            <div className="space-y-2.5">
              {alerts.map((alert) => (
                <div key={alert.id} className={`rounded-md border p-3 ${alert.color}`}>
                  <div className="flex items-start gap-2.5">
                    <span className={`mt-1 inline-flex h-2.5 w-2.5 rounded-full ${alert.dot}`} />
                    <div>
                      <p className="text-sm font-medium">{alert.title}</p>
                      <p className="text-xs opacity-80">{alert.meta}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <article className="rounded-lg border border-[#e4d9d0] bg-white p-5 xl:col-span-1">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#261911]">Vendeurs - suivi statut</h2>
              <button type="button" className="text-sm text-[#3f2b1f] hover:underline">Gerer -></button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-[0.14em] text-[#6f5d4e]">
                    <th className="pb-3">Vendeur</th>
                    <th className="pb-3">Produits</th>
                    <th className="pb-3">GMV</th>
                    <th className="pb-3">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0e7df]">
                  {vendorsTable.map((vendor) => (
                    <tr key={vendor.id}>
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#c9723a] text-[11px] font-semibold text-white">
                            {vendor.shortName}
                          </span>
                          <div>
                            <p className="font-medium text-[#2b1c13]">{vendor.name}</p>
                            <p className="text-xs text-[#7c6a5c]">{vendor.city}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 text-[#3e2b1f]">{vendor.products}</td>
                      <td className="py-2.5 text-[#3e2b1f]">{vendor.gmv}</td>
                      <td className={`py-2.5 ${STATUS_STYLE[vendor.status] || 'text-[#3e2b1f]'}`}>{vendor.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="rounded-lg border border-[#e4d9d0] bg-white p-5 xl:col-span-1">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#261911]">Commandes par destination</h2>
              <button type="button" className="text-sm text-[#3f2b1f] hover:underline">Carte -></button>
            </div>
            <div className="space-y-3">
              {destinations.map((destination) => (
                <div key={destination.country}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-[#2f2016]">{destination.country}</span>
                    <span className="font-medium text-[#5a483a]">{destination.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#f0e7df]">
                    <div className={`h-full rounded-full ${destination.color}`} style={{ width: `${destination.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-lg border border-[#e4d9d0] bg-white p-5 xl:col-span-1">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#261911]">Transactions recentes</h2>
              <button type="button" className="text-sm text-[#3f2b1f] hover:underline">Toutes -></button>
            </div>
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[#2b1c13]">{tx.title}</p>
                    <p className="text-xs text-[#766456]">{tx.subtitle}</p>
                  </div>
                  <p className={`text-sm font-semibold ${tx.positive ? 'text-[#3e8a43]' : 'text-[#a24a42]'}`}>
                    {tx.amount}
                  </p>
                </div>
              ))}
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
