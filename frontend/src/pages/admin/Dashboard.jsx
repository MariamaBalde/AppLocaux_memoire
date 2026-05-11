import { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  Loader2,
  Mail,
  Menu,
  Settings,
  ShoppingCart,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import ClientsTable from '../../components/admin/ClientsTable';
import OrdersTable from '../../components/admin/OrdersTable';
import VendorsTable from '../../components/admin/VendorsTable';
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

function formatDateShort(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getInitials(name) {
  return String(name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || '?';
}

function normalizeOrderStage(status) {
  const value = String(status || '').toLowerCase();
  if (value === 'pending') return 'nouvelles';
  if (value === 'confirmed') return 'confirmees';
  if (value === 'processing') return 'preparation';
  if (value === 'shipped') return 'expediees';
  if (value === 'delivered') return 'livrees';
  if (value === 'cancelled' || value === 'refunded') return 'annulees';
  return 'nouvelles';
}

function stageLabel(stage) {
  const labels = {
    nouvelles: 'Nouvelles',
    confirmees: 'Confirmees',
    preparation: 'Preparation',
    expediees: 'Expediees',
    livrees: 'Livrees',
    annulees: 'Annulees',
  };
  return labels[stage] || 'Nouvelles';
}

function getOrderVendorNames(order) {
  const names = new Set();

  (order?.items || []).forEach((item) => {
    const vendeurName = item?.vendeur?.shop_name || item?.vendeur?.user_name;
    if (vendeurName) {
      names.add(vendeurName);
      return;
    }

    const productVendorName = item?.product?.vendeur?.shop_name || item?.product?.vendeur?.user_name;
    if (productVendorName) {
      names.add(productVendorName);
    }
  });

  return Array.from(names);
}

function getOrderProductsLabel(order) {
  const names = Array.from(new Set(
    (order?.items || [])
      .map((item) => item?.product?.name)
      .filter(Boolean)
  ));

  if (!names.length) return 'Produits non renseignes';
  if (names.length === 1) return names[0];
  return `${names[0]} +${names.length - 1}`;
}

const KPI_TONE = {
  orange: { text: 'text-[#bf5a21]', bar: 'bg-[#c7632a]' },
  amber: { text: 'text-[#b27b16]', bar: 'bg-[#bc8f2f]' },
  green: { text: 'text-[#3f7e3f]', bar: 'bg-[#4f8a45]' },
  blue: { text: 'text-[#2869b9]', bar: 'bg-[#3f74c7]' },
};

const DESTINATION_COLORS = ['bg-[#c7672e]', 'bg-[#cfa646]', 'bg-[#6fa06d]', 'bg-[#4a76b8]', 'bg-[#8e7665]', 'bg-[#74b8cb]'];

export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isVendorPage = location.pathname === '/admin/vendors';
  const isClientPage = location.pathname === '/admin/clients';
  const isOrderPage = location.pathname === '/admin/orders';
  const isOverviewPage = !isVendorPage && !isClientPage && !isOrderPage;
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
  const [clientUsers, setClientUsers] = useState([]);
  const [clientUsersTotal, setClientUsersTotal] = useState(0);
  const [searchVendor, setSearchVendor] = useState('');
  const [vendorFilter, setVendorFilter] = useState('all');
  const [vendorSort, setVendorSort] = useState('gmv_desc');
  const [vendorPage, setVendorPage] = useState(1);
  const [expandedVendorId, setExpandedVendorId] = useState(null);
  const [processingActionId, setProcessingActionId] = useState('');
  const [searchClient, setSearchClient] = useState('');
  const [clientFilter, setClientFilter] = useState('all');
  const [clientSort, setClientSort] = useState('spent_desc');
  const [clientPage, setClientPage] = useState(1);
  const [expandedClientId, setExpandedClientId] = useState(null);
  const [orderFilter, setOrderFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderSort, setOrderSort] = useState('date_desc');
  const [orderTypeFilter, setOrderTypeFilter] = useState('all');
  const [orderPage, setOrderPage] = useState(1);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

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
          adminService.getRecentOrders(250),
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
        setClientUsers(clients);
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
          { label: 'Dashboard', icon: BarChart3, path: '/admin/dashboard', active: location.pathname === '/admin/dashboard' },
        ],
      },
      {
        title: 'Gestion',
        items: [
          { label: 'Vendeurs', icon: Users, badge: String(pendingCount), path: '/admin/vendors', active: isVendorPage },
          { label: 'Clients', icon: Users, badge: formatCompact(stats.total_clients), path: '/admin/clients', active: isClientPage },
          { label: 'Commandes', icon: ShoppingCart, path: '/admin/orders', active: isOrderPage },
          { label: 'Produits', icon: Wrench, path: '/admin/products', active: location.pathname === '/admin/products' },
        ],
      },
      {
        title: 'Systeme',
        items: [
          { label: 'Parametres', icon: Settings, path: '/admin/settings' },
        ],
      },
    ],
    [isClientPage, isOrderPage, isVendorPage, location.pathname, pendingCount, stats]
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

  const vendorRows = useMemo(() => {
    const topVendorMap = new Map(topVendors.map((vendor) => [String(vendor.id), vendor]));
    const pendingVendorIds = new Set(pendingVendors.map((vendor) => String(vendor.id)));
    const recentOrdersByVendor = recentOrders.reduce((acc, order) => {
      const vendorIds = Array.from(new Set((order?.items || []).map((item) => String(item?.vendeur_id || '')).filter(Boolean)));

      vendorIds.forEach((vendorId) => {
        if (!acc[vendorId]) acc[vendorId] = 0;
        acc[vendorId] += 1;
      });

      return acc;
    }, {});

    return vendorUsers
      .filter((user) => user?.vendeur?.id)
      .map((user) => {
        const vendor = user.vendeur;
        const top = topVendorMap.get(String(vendor.id));
        const salesTotal = Number(top?.total_sales ?? vendor.total_sales ?? 0);
        const rating = Number(top?.rating ?? vendor.rating ?? 0);
        const isPending = pendingVendorIds.has(String(vendor.id)) || !vendor.verified;
        const isSuspended = String(user.statut || '').toLowerCase() === 'suspendu';

        let status = 'Actif';
        if (isSuspended) status = 'Suspendu';
        else if (isPending) status = 'En attente';
        else if (rating > 0 && rating < 3.5) status = 'Signale';

        let kyc = 'Verifie';
        if (isPending) kyc = 'En cours';
        if (!vendor.shop_name || !user.email) kyc = 'Manquant';

        return {
          id: String(vendor.id),
          userId: String(user.id),
          name: user.name || vendor.shop_name || `Vendeur ${vendor.id}`,
          shopName: vendor.shop_name || 'Boutique sans nom',
          email: user.email || 'email-non-defini',
          city: user.country || 'SN',
          products: Number(top?.products_count ?? vendor.products_count ?? 0),
          orders: Number(top?.orders_count ?? recentOrdersByVendor[String(vendor.id)] ?? 0),
          ordersSource: top?.orders_count !== undefined ? 'global' : 'recent',
          gmv: salesTotal,
          rating,
          status,
          kyc,
          joinedAt: user.created_at,
          flagged: status === 'Signale',
          verifiedEmail: Boolean(user.email_verified_at),
        };
      });
  }, [pendingVendors, recentOrders, topVendors, vendorUsers]);

  const vendorSummary = useMemo(() => {
    const total = vendorRows.length;
    const active = vendorRows.filter((row) => row.status === 'Actif').length;
    const pending = vendorRows.filter((row) => row.status === 'En attente').length;
    const flagged = vendorRows.filter((row) => row.status === 'Signale').length;
    const suspended = vendorRows.filter((row) => row.status === 'Suspendu').length;
    const totalGMV = vendorRows.reduce((acc, row) => acc + Number(row.gmv || 0), 0);

    return {
      total,
      active,
      pending,
      flagged,
      suspended,
      totalGMV,
    };
  }, [vendorRows]);

  const filteredVendorRows = useMemo(() => {
    let rows = [...vendorRows];
    const search = searchVendor.trim().toLowerCase();

    if (search) {
      rows = rows.filter(
        (row) =>
          row.name.toLowerCase().includes(search)
          || row.shopName.toLowerCase().includes(search)
          || row.email.toLowerCase().includes(search)
      );
    }

    if (vendorFilter !== 'all') {
      rows = rows.filter((row) => {
        if (vendorFilter === 'active') return row.status === 'Actif';
        if (vendorFilter === 'pending') return row.status === 'En attente';
        if (vendorFilter === 'flagged') return row.status === 'Signale';
        if (vendorFilter === 'suspended') return row.status === 'Suspendu';
        return true;
      });
    }

    rows.sort((a, b) => {
      if (vendorSort === 'gmv_asc') return a.gmv - b.gmv;
      if (vendorSort === 'name') return a.name.localeCompare(b.name, 'fr');
      return b.gmv - a.gmv;
    });

    return rows;
  }, [searchVendor, vendorFilter, vendorRows, vendorSort]);

  useEffect(() => {
    setVendorPage(1);
  }, [searchVendor, vendorFilter, vendorSort]);

  const perPage = 6;
  const totalVendorPages = Math.max(1, Math.ceil(filteredVendorRows.length / perPage));
  const currentVendorPage = Math.min(vendorPage, totalVendorPages);
  const pagedVendors = useMemo(() => {
    const start = (currentVendorPage - 1) * perPage;
    return filteredVendorRows.slice(start, start + perPage);
  }, [currentVendorPage, filteredVendorRows]);

  const exportVendorCsv = () => {
    const headers = ['Vendeur', 'Email', 'Ville', 'Produits', 'Commandes', 'GMV', 'Note', 'KYC', 'Statut', 'Inscrit le'];
    const lines = filteredVendorRows.map((row) => [
      row.name,
      row.email,
      row.city,
      row.products,
      row.ordersSource === 'global' ? row.orders : `${row.orders} (recentes)`,
      row.gmv,
      row.rating ? row.rating.toFixed(1) : 'Non note',
      row.kyc,
      row.status,
      formatDateShort(row.joinedAt),
    ]);
    const content = [headers, ...lines]
      .map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vendeurs-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Export CSV genere');
  };

  const handleApproveVendor = async (row) => {
    if (row.kyc === 'Verifie') {
      toast('Ce vendeur est deja verifie.');
      return;
    }
    try {
      setProcessingActionId(`approve-${row.id}`);
      await adminService.approveVendor(row.id);
      const refreshed = await adminService.getVendorUsers({ per_page: 200 });
      const usersPayload = unwrap(refreshed);
      const users = Array.isArray(usersPayload)
        ? usersPayload
        : Array.isArray(usersPayload?.data)
          ? usersPayload.data
          : [];
      setVendorUsers(users);
      toast.success('Vendeur approuve');
    } catch (err) {
      toast.error(err?.message || 'Impossible d approuver ce vendeur');
    } finally {
      setProcessingActionId('');
    }
  };

  const handleToggleSuspend = async (row) => {
    try {
      setProcessingActionId(`suspend-${row.id}`);
      await adminService.toggleUserStatus(row.userId);
      setVendorUsers((prev) => prev.map((user) => (String(user.id) === String(row.userId)
        ? { ...user, statut: user.statut === 'suspendu' ? 'actif' : 'suspendu' }
        : user)));
      toast.success(row.status === 'Suspendu' ? 'Vendeur reactive' : 'Vendeur suspendu');
    } catch (err) {
      toast.error(err?.message || 'Action indisponible');
    } finally {
      setProcessingActionId('');
    }
  };

  const handleBanVendor = async (row) => {
    const confirmed = window.confirm(`Bannir ${row.name} ? Cette action supprimera son compte vendeur.`);
    if (!confirmed) return;

    try {
      setProcessingActionId(`ban-${row.id}`);
      await adminService.rejectVendor(row.id, 'Banni par administration');
      setVendorUsers((prev) => prev.filter((user) => String(user.vendeur?.id) !== String(row.id)));
      setTopVendors((prev) => prev.filter((vendor) => String(vendor.id) !== String(row.id)));
      setPendingVendors((prev) => prev.filter((vendor) => String(vendor.id) !== String(row.id)));
      if (expandedVendorId === row.id) setExpandedVendorId(null);
      toast.success('Vendeur banni');
    } catch (err) {
      toast.error(err?.message || 'Impossible de bannir ce vendeur');
    } finally {
      setProcessingActionId('');
    }
  };

  const clientRows = useMemo(() => {
    const recentOrdersByUser = recentOrders.reduce((acc, order) => {
      const key = String(order?.user_id || '');
      if (!key) return acc;
      if (!acc[key]) acc[key] = [];
      acc[key].push(order);
      return acc;
    }, {});

    const flagByCountry = {
      SN: '🇸🇳',
      FR: '🇫🇷',
      US: '🇺🇸',
      CA: '🇨🇦',
      CI: '🇨🇮',
      ES: '🇪🇸',
      IT: '🇮🇹',
      GB: '🇬🇧',
      DE: '🇩🇪',
      MA: '🇲🇦',
    };

    return clientUsers.map((user) => {
        const metrics = user.client_metrics || {};
        const rowOrders = (recentOrdersByUser[String(user.id)] || []).slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        const rawCountry = String(metrics.country_code || user.country || 'SN').toUpperCase();
        const totalSpent = Number(metrics.total_spent || 0);
        const ordersCount = Number(metrics.orders_count || 0);
        const avgBasket = Number(metrics.average_order_value || 0);
        const lastOrderAt = metrics.last_order_at;

        return {
          id: String(user.id),
          name: user.name || `Client ${user.id}`,
          email: user.email || 'email-non-defini',
          countryCode: rawCountry,
          flag: flagByCountry[rawCountry] || '🌍',
          city: user.country || 'SN',
          segment: metrics.segment || 'Non classe',
          ordersCount,
          totalSpent,
          avgBasket,
          lastPurchaseLabel: lastOrderAt ? timeAgo(lastOrderAt) : 'Aucun achat',
          paymentMethod: formatPaymentMethod(metrics.last_payment_method),
          status: String(user.statut || 'actif').toLowerCase(),
          fidelityPoints: Number(metrics.fidelity_points || 1),
          fidelityProgress: clampPercent(metrics.fidelity_progress || 0),
          createdAt: user.created_at,
          metricsSource: metrics.source || 'full_history',
          orderHistory: rowOrders.slice(0, 6).map((order) => ({
            id: order.id,
            number: order.order_number || order.id,
            total: Number(order.total || 0),
            status: order.status || 'pending',
            date: order.created_at,
            payment: formatPaymentMethod(order?.payment?.method),
          })),
        };
      })
      .sort((a, b) => b.totalSpent - a.totalSpent);
  }, [clientUsers, recentOrders]);

  const clientSummary = useMemo(() => {
    const total = clientRows.length;
    const newThisMonth = clientRows.filter((row) => {
      const created = new Date(row.createdAt || Date.now());
      const now = new Date();
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length;
    const totalSpent = clientRows.reduce((sum, row) => sum + row.totalSpent, 0);
    const totalOrders = clientRows.reduce((sum, row) => sum + row.ordersCount, 0);
    const avgBasket = totalOrders > 0 ? totalSpent / totalOrders : 0;
    const returnRate = total > 0 ? (clientRows.filter((row) => row.ordersCount >= 2).length / total) * 100 : 0;

    const segmentCount = {
      VIP: clientRows.filter((row) => row.segment === 'VIP').length,
      Diaspora: clientRows.filter((row) => row.segment === 'Diaspora').length,
      'Local actif': clientRows.filter((row) => row.segment === 'Local actif').length,
      Nouveau: clientRows.filter((row) => row.segment === 'Nouveau').length,
      Inactif: clientRows.filter((row) => row.segment === 'Inactif').length,
    };

    return {
      total,
      newThisMonth,
      avgBasket,
      returnRate,
      segmentCount,
    };
  }, [clientRows]);

  const filteredClientRows = useMemo(() => {
    let rows = [...clientRows];
    const search = searchClient.trim().toLowerCase();

    if (search) {
      rows = rows.filter((row) =>
        row.name.toLowerCase().includes(search)
        || row.email.toLowerCase().includes(search)
        || row.city.toLowerCase().includes(search));
    }

    if (clientFilter !== 'all') {
      const map = {
        vip: 'VIP',
        diaspora: 'Diaspora',
        local: 'Local actif',
        new: 'Nouveau',
        inactive: 'Inactif',
      };
      rows = rows.filter((row) => row.segment === map[clientFilter]);
    }

    rows.sort((a, b) => {
      if (clientSort === 'spent_asc') return a.totalSpent - b.totalSpent;
      if (clientSort === 'orders_desc') return b.ordersCount - a.ordersCount;
      if (clientSort === 'name') return a.name.localeCompare(b.name, 'fr');
      return b.totalSpent - a.totalSpent;
    });

    return rows;
  }, [clientFilter, clientRows, clientSort, searchClient]);

  useEffect(() => {
    setClientPage(1);
  }, [clientFilter, clientSort, searchClient]);

  const clientPerPage = 6;
  const totalClientPages = Math.max(1, Math.ceil(filteredClientRows.length / clientPerPage));
  const currentClientPage = Math.min(clientPage, totalClientPages);
  const pagedClients = useMemo(() => {
    const start = (currentClientPage - 1) * clientPerPage;
    return filteredClientRows.slice(start, start + clientPerPage);
  }, [currentClientPage, filteredClientRows]);

  const exportClientCsv = () => {
    const headers = ['Client', 'Email', 'Pays', 'Segment', 'Commandes', 'Total depense', 'Panier moyen', 'Dernier achat', 'Fidelite'];
    const lines = filteredClientRows.map((row) => [
      row.name,
      row.email,
      row.countryCode,
      row.segment,
      row.ordersCount,
      row.totalSpent,
      Math.round(row.avgBasket),
      row.lastPurchaseLabel,
      row.fidelityPoints,
    ]);
    const content = [headers, ...lines]
      .map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `clients-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Export clients genere');
  };

  const handleClientStatusToggle = async (row) => {
    try {
      setProcessingActionId(`client-${row.id}`);
      await adminService.toggleUserStatus(row.id);
      setClientUsers((prev) => prev.map((client) => (String(client.id) === String(row.id)
        ? { ...client, statut: String(client.statut || '').toLowerCase() === 'suspendu' ? 'actif' : 'suspendu' }
        : client)));
      toast.success('Statut client mis a jour');
    } catch (err) {
      toast.error(err?.message || 'Impossible de modifier ce client');
    } finally {
      setProcessingActionId('');
    }
  };

  const orderRows = useMemo(() => {
    return recentOrders.map((order) => {
      const stage = normalizeOrderStage(order.status);
      const createdAt = new Date(order.created_at || Date.now());
      const ageHours = Math.max(0, Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60)));
      const isUrgent = ['nouvelles', 'confirmees', 'preparation'].includes(stage) && ageHours >= 48;
      const country = parseShippingCountry(order.shipping_address);
      const isInternational = String(country || '').toUpperCase() !== 'SN' && String(country || '').toLowerCase() !== 'senegal';
      const orderType = isInternational ? 'international' : 'local';
      const progressCount = stage === 'annulees'
        ? 1
        : ({
            nouvelles: 1,
            confirmees: 2,
            preparation: 3,
            expediees: 4,
            livrees: 5,
          }[stage] || 1);
      const vendorNames = getOrderVendorNames(order);
      const trackingNumber = order.tracking_number || 'Non attribue';

      return {
        id: String(order.id),
        orderNumber: order.order_number || `#${order.id}`,
        stage,
        stageLabel: stageLabel(stage),
        amount: Number(order.total || 0),
        clientName: order.user?.name || 'Client',
        clientEmail: order.user?.email || 'email@client.local',
        clientInitials: getInitials(order.user?.name || 'Client'),
        clientCountry: country || 'SN',
        orderType,
        isUrgent,
        ageHours,
        paymentMethod: formatPaymentMethod(order?.payment?.method),
        dateLabel: timeAgo(order.created_at),
        rawDate: order.created_at,
        vendorName: vendorNames.length ? vendorNames.join(', ') : 'Vendeur non renseigne',
        productsLabel: getOrderProductsLabel(order),
        progressCount,
        transporter: order.shipping_method || 'Non renseigne',
        trackingNumber,
        estimatedDate: order.tracking_number ? 'Suivi en cours' : 'Non disponible',
      };
    });
  }, [recentOrders]);

  const orderPipeline = useMemo(() => {
    const base = [
      { key: 'nouvelles', color: 'bg-[#2a67b5]', dot: 'bg-[#2a67b5]' },
      { key: 'confirmees', color: 'bg-[#c99b39]', dot: 'bg-[#c99b39]' },
      { key: 'preparation', color: 'bg-[#7e7a76]', dot: 'bg-[#7e7a76]' },
      { key: 'expediees', color: 'bg-[#4d79c1]', dot: 'bg-[#4d79c1]' },
      { key: 'livrees', color: 'bg-[#4b8f30]', dot: 'bg-[#4b8f30]' },
      { key: 'annulees', color: 'bg-[#a64c26]', dot: 'bg-[#a64c26]' },
    ];

    return base.map((item) => {
      const rows = orderRows.filter((row) => row.stage === item.key);
      const amount = rows.reduce((sum, row) => sum + row.amount, 0);
      return {
        ...item,
        key: item.key,
        label: stageLabel(item.key),
        count: rows.length,
        amount,
      };
    });
  }, [orderRows]);

  const urgentOrders = useMemo(() => orderRows.filter((row) => row.isUrgent), [orderRows]);

  const filteredOrders = useMemo(() => {
    let rows = [...orderRows];
    const search = orderSearch.trim().toLowerCase();

    if (search) {
      rows = rows.filter((row) =>
        String(row.orderNumber).toLowerCase().includes(search)
        || row.clientName.toLowerCase().includes(search)
        || row.clientEmail.toLowerCase().includes(search)
        || row.productsLabel.toLowerCase().includes(search));
    }

    if (orderFilter !== 'all') {
      if (orderFilter === 'urgent') rows = rows.filter((row) => row.isUrgent);
      else rows = rows.filter((row) => row.stage === orderFilter);
    }

    if (orderTypeFilter !== 'all') {
      rows = rows.filter((row) => row.orderType === orderTypeFilter);
    }

    rows.sort((a, b) => {
      if (orderSort === 'amount_desc') return b.amount - a.amount;
      if (orderSort === 'amount_asc') return a.amount - b.amount;
      return new Date(b.rawDate || 0) - new Date(a.rawDate || 0);
    });

    return rows;
  }, [orderFilter, orderRows, orderSearch, orderSort, orderTypeFilter]);

  useEffect(() => {
    setOrderPage(1);
  }, [orderFilter, orderSearch, orderSort, orderTypeFilter]);

  const orderPerPage = 6;
  const totalOrderPages = Math.max(1, Math.ceil(filteredOrders.length / orderPerPage));
  const currentOrderPage = Math.min(orderPage, totalOrderPages);
  const pagedOrders = useMemo(() => {
    const start = (currentOrderPage - 1) * orderPerPage;
    return filteredOrders.slice(start, start + orderPerPage);
  }, [currentOrderPage, filteredOrders]);

  const selectedOrder = useMemo(
    () => orderRows.find((row) => String(row.id) === String(selectedOrderId)) || null,
    [orderRows, selectedOrderId]
  );

  const exportOrderCsv = () => {
    const headers = ['Commande', 'Client', 'Montant', 'Statut', 'Type', 'Progression', 'Vendeur', 'Transporteur', 'Colis'];
    const lines = filteredOrders.map((row) => [
      row.orderNumber,
      row.clientName,
      row.amount,
      row.stageLabel,
      row.orderType,
      row.progressCount,
      row.vendorName,
      row.transporter,
      row.trackingNumber,
    ]);
    const content = [headers, ...lines]
      .map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `commandes-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Export commandes genere');
  };

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
                          onClick={() => {
                            if (item.path) navigate(item.path);
                          }}
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
            <h1 className="text-3xl font-semibold text-[#23170f]">
              {isVendorPage
                ? 'Gestion des vendeurs'
                : isClientPage
                  ? 'Gestion des clients'
                  : isOrderPage
                    ? 'Gestion des commandes'
                    : "Vue d'ensemble de la plateforme"}
            </h1>
            <p className="text-sm text-[#6a584a]">
              {isVendorPage
                ? 'Supervision KYC, statuts et performance vendeurs'
                : isClientPage
                  ? 'Segmentation, fidelite et historique des commandes'
                  : isOrderPage
                    ? 'Pipeline de suivi, progression et alertes urgentes'
                  : 'Mis a jour en temps reel'}
            </p>
          </div>
          {isOverviewPage ? (
            <div className="flex items-center gap-2 text-sm">
              <button type="button" className="rounded-full bg-[#cb6b2f] px-4 py-2 text-white">Ce mois</button>
              <button type="button" className="rounded-md border border-[#d2c3b7] px-4 py-2">Trim.</button>
              <button type="button" className="rounded-md border border-[#d2c3b7] px-4 py-2">Annee</button>
              <button type="button" className="rounded-md border border-[#d2c3b7] px-4 py-2">Exporter</button>
            </div>
          ) : isClientPage ? (
            <div className="flex items-center gap-2 text-sm">
              <button type="button" onClick={exportClientCsv} className="rounded-md border border-[#d2c3b7] px-4 py-2">Exporter CSV</button>
              <button
                type="button"
                onClick={() => window.location.assign(`mailto:?subject=Campagne clients&body=Segment: ${clientFilter}`)}
                className="inline-flex items-center gap-2 rounded-md border border-[#d2c3b7] px-4 py-2"
              >
                <Mail className="h-4 w-4" />
                Campagne email
              </button>
            </div>
          ) : isOrderPage ? (
            <div className="flex items-center gap-2 text-sm">
              <button type="button" onClick={exportOrderCsv} className="rounded-md border border-[#d2c3b7] px-4 py-2">Exporter</button>
              <button
                type="button"
                onClick={() => toast.success('Creation manuelle de commande a connecter au formulaire')}
                className="rounded-md bg-[#cb6b2f] px-4 py-2 font-semibold text-white"
              >
                + Commande manuelle
              </button>
            </div>
          ) : null}
        </header>

        {error ? (
          <div className="mb-6 rounded-md border border-[#f2c8b2] bg-[#fff4ee] px-4 py-3 text-sm text-[#8a3f1d]">
            {error}
          </div>
        ) : null}

        {isOverviewPage ? (
          <>
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
          </>
        ) : null}

        {isClientPage ? (
          <ClientsTable
            clientSummary={clientSummary}
            searchClient={searchClient}
            setSearchClient={setSearchClient}
            clientFilter={clientFilter}
            setClientFilter={setClientFilter}
            clientSort={clientSort}
            setClientSort={setClientSort}
            exportClientCsv={exportClientCsv}
            pagedClients={pagedClients}
            expandedClientId={expandedClientId}
            setExpandedClientId={setExpandedClientId}
            processingActionId={processingActionId}
            handleClientStatusToggle={handleClientStatusToggle}
            currentClientPage={currentClientPage}
            clientPerPage={clientPerPage}
            totalClientPages={totalClientPages}
            setClientPage={setClientPage}
            filteredClientRows={filteredClientRows}
            formatNumber={formatNumber}
            formatDateShort={formatDateShort}
            getInitials={getInitials}
          />
        ) : null}

        {isOrderPage ? (
          <OrdersTable
            orderPipeline={orderPipeline}
            setOrderFilter={setOrderFilter}
            filteredOrders={filteredOrders}
            orderRows={orderRows}
            setSelectedOrderId={setSelectedOrderId}
            urgentOrders={urgentOrders}
            orderSearch={orderSearch}
            setOrderSearch={setOrderSearch}
            orderTypeFilter={orderTypeFilter}
            setOrderTypeFilter={setOrderTypeFilter}
            orderFilter={orderFilter}
            orderSort={orderSort}
            setOrderSort={setOrderSort}
            pagedOrders={pagedOrders}
            selectedOrder={selectedOrder}
            currentOrderPage={currentOrderPage}
            orderPerPage={orderPerPage}
            totalOrderPages={totalOrderPages}
            setOrderPage={setOrderPage}
            formatNumber={formatNumber}
            formatDateShort={formatDateShort}
          />
        ) : null}

        {isVendorPage ? (
          <VendorsTable
            vendorSummary={vendorSummary}
            exportVendorCsv={exportVendorCsv}
            navigate={navigate}
            searchVendor={searchVendor}
            setSearchVendor={setSearchVendor}
            vendorFilter={vendorFilter}
            setVendorFilter={setVendorFilter}
            vendorSort={vendorSort}
            setVendorSort={setVendorSort}
            pagedVendors={pagedVendors}
            expandedVendorId={expandedVendorId}
            setExpandedVendorId={setExpandedVendorId}
            processingActionId={processingActionId}
            handleApproveVendor={handleApproveVendor}
            handleToggleSuspend={handleToggleSuspend}
            handleBanVendor={handleBanVendor}
            currentVendorPage={currentVendorPage}
            perPage={perPage}
            totalVendorPages={totalVendorPages}
            setVendorPage={setVendorPage}
            filteredVendorRows={filteredVendorRows}
            formatCompact={formatCompact}
            formatNumber={formatNumber}
            formatDateShort={formatDateShort}
            getInitials={getInitials}
          />
        ) : null}

        {isOverviewPage ? (
          <section className="grid gap-6 xl:grid-cols-2">
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
        ) : null}

      </main>
    </div>
  );
}
