import { Fragment, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Download,
  House,
  Loader2,
  Mail,
  Menu,
  Plus,
  Search,
  Settings,
  ShoppingCart,
  Truck,
  ShieldCheck,
  ShieldQuestion,
  ShieldX,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';
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

function weeklySeries(seedValue) {
  const seed = Number(seedValue || 1);
  return Array.from({ length: 7 }, (_, index) => {
    const base = ((seed * (index + 3) * 17) % 90) + 10;
    return Math.min(100, Math.max(8, base));
  });
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
  Banni: 'text-[#7d2537]',
};

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
  const [bannedVendorIds, setBannedVendorIds] = useState(() => new Set());
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

  useEffect(() => {
    try {
      const raw = localStorage.getItem('admin-banned-vendors');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setBannedVendorIds(new Set(parsed.map((id) => String(id))));
      }
    } catch (err) {
      // ignore malformed cache
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('admin-banned-vendors', JSON.stringify(Array.from(bannedVendorIds)));
  }, [bannedVendorIds]);

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
    const avgOrderValue = Number(advancedStats.average_order_value || 0);

    return vendorUsers
      .filter((user) => user?.vendeur?.id)
      .map((user) => {
        const vendor = user.vendeur;
        const top = topVendorMap.get(String(vendor.id));
        const salesCount = Number(top?.total_sales ?? vendor.total_sales ?? 0);
        const rating = Number(top?.rating ?? vendor.rating ?? 0);
        const reviewCount = Math.max(0, Math.round((salesCount || 0) / 4));
        const orders = Math.max(0, Math.round((salesCount || 0) / 2));
        const gmv = Number(salesCount * (avgOrderValue || 15000));
        const isPending = pendingVendorIds.has(String(vendor.id)) || !vendor.verified;
        const isBanned = bannedVendorIds.has(String(vendor.id));
        const isSuspended = String(user.statut || '').toLowerCase() === 'suspendu';

        let status = 'Actif';
        if (isBanned) status = 'Banni';
        else if (isSuspended) status = 'Suspendu';
        else if (isPending) status = 'En attente';
        else if (rating > 0 && rating < 3.5) status = 'Signale';

        let kyc = 'Verifie';
        if (isPending) kyc = 'En cours';
        if (!vendor.shop_name || !user.email) kyc = 'Manquant';

        const activity = weeklySeries(vendor.id || user.id);

        return {
          id: String(vendor.id),
          userId: String(user.id),
          name: user.name || vendor.shop_name || `Vendeur ${vendor.id}`,
          shopName: vendor.shop_name || 'Boutique sans nom',
          email: user.email || 'email-non-defini',
          city: user.country || 'SN',
          products: Number(vendor.total_products || 0),
          orders,
          gmv,
          rating,
          reviewCount,
          status,
          kyc,
          joinedAt: user.created_at,
          flagged: status === 'Signale',
          activity,
        };
      });
  }, [advancedStats.average_order_value, bannedVendorIds, pendingVendors, topVendors, vendorUsers]);

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
      row.orders,
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
      setBannedVendorIds((prev) => new Set([...prev, String(row.id)]));
      setVendorUsers((prev) => prev.filter((user) => String(user.vendeur?.id) !== String(row.id)));
      if (expandedVendorId === row.id) setExpandedVendorId(null);
      toast.success('Vendeur banni');
    } catch (err) {
      toast.error(err?.message || 'Impossible de bannir ce vendeur');
    } finally {
      setProcessingActionId('');
    }
  };

  const clientRows = useMemo(() => {
    const ordersByUser = recentOrders.reduce((acc, order) => {
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
        const rowOrders = (ordersByUser[String(user.id)] || []).slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        const ordersCount = rowOrders.length;
        const totalSpent = rowOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
        const avgBasket = ordersCount > 0 ? totalSpent / ordersCount : 0;
        const lastOrder = rowOrders[0];
        const lastOrderDate = lastOrder?.created_at ? new Date(lastOrder.created_at) : null;
        const daysSinceOrder = lastOrderDate ? Math.floor((Date.now() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24)) : 9999;
        const createdAt = new Date(user.created_at || Date.now());
        const accountAgeDays = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

        const rawCountry = String(user.country || 'SN').toUpperCase();
        const isDiaspora = rawCountry !== 'SN';
        const isInactive = daysSinceOrder > 90 || (ordersCount === 0 && accountAgeDays > 45);
        const isNew = accountAgeDays <= 30 || ordersCount <= 2;
        const isVip = ordersCount >= 10 || totalSpent >= 120000;
        let segment = 'Local actif';
        if (isInactive) segment = 'Inactif';
        else if (isNew) segment = 'Nouveau';
        else if (isDiaspora) segment = 'Diaspora';
        if (isVip && !isInactive) segment = 'VIP';

        const fidelityPoints = Math.max(1, Math.min(5, Math.round(totalSpent / 45000) || 1));
        const fidelityProgress = clampPercent((totalSpent / 220000) * 100);

        return {
          id: String(user.id),
          name: user.name || `Client ${user.id}`,
          email: user.email || 'email-non-defini',
          countryCode: rawCountry,
          flag: flagByCountry[rawCountry] || '🌍',
          city: user.country || 'SN',
          segment,
          ordersCount,
          totalSpent,
          avgBasket,
          lastPurchaseLabel: lastOrder?.created_at ? timeAgo(lastOrder.created_at) : 'Aucun achat',
          paymentMethod: formatPaymentMethod(lastOrder?.payment?.method),
          status: String(user.statut || 'actif').toLowerCase(),
          fidelityPoints,
          fidelityProgress,
          createdAt: user.created_at,
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
    const vendors = vendorUsers.filter((user) => user?.vendeur?.id);
    const carriers = ['DHL', 'Chronopost', 'La Poste', 'UPS', 'FedEx'];

    return recentOrders.map((order, index) => {
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
      const vendor = vendors.length ? vendors[index % vendors.length] : null;
      const trackingNumber = `TRK-${String(order.id).padStart(5, '0')}-${String((index % 89) + 10)}`;
      const etaDays = stage === 'livrees' ? 0 : Math.max(1, 5 - progressCount);
      const estimatedDate = new Date(createdAt.getTime() + (etaDays * 24 * 60 * 60 * 1000));

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
        vendorName: vendor?.name || vendor?.vendeur?.shop_name || 'Vendeur local',
        productsLabel: `Produit x${Math.max(1, (index % 5) + 1)}`,
        progressCount,
        transporter: carriers[index % carriers.length],
        trackingNumber,
        estimatedDate: formatDateShort(estimatedDate.toISOString()),
      };
    });
  }, [recentOrders, vendorUsers]);

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
          <section className="mb-6 rounded-lg border border-[#e4d9d0] bg-white p-5">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold text-[#261911]">Gestion des clients</h2>
                <p className="text-sm text-[#6d5b4d]">
                  {formatNumber(clientSummary.total)} clients inscrits - {formatNumber(clientSummary.newThisMonth)} nouveaux ce mois
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={exportClientCsv}
                  className="inline-flex items-center gap-2 rounded-md border border-[#dfcfc2] px-3 py-2 text-sm text-[#4e382a] hover:bg-[#f7f0ea]"
                >
                  <Download className="h-4 w-4" />
                  Exporter CSV
                </button>
                <button
                  type="button"
                  onClick={() => window.location.assign(`mailto:?subject=Campagne clients&body=Segment: ${clientFilter}`)}
                  className="inline-flex items-center gap-2 rounded-md border border-[#dfcfc2] px-3 py-2 text-sm text-[#4e382a] hover:bg-[#f7f0ea]"
                >
                  <Mail className="h-4 w-4" />
                  Campagne email
                </button>
              </div>
            </div>

            <div className="mb-6 grid gap-6 xl:grid-cols-2">
              <article className="rounded-md border border-[#eee1d8] p-4">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-[#6a4f3d]">Indicateurs clés</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-[#6f5d4e]">Total clients</p>
                    <p className="text-3xl font-semibold text-[#23170f]">{formatNumber(clientSummary.total)}</p>
                    <p className="text-xs text-[#4b8a4f]">+{formatNumber(clientSummary.newThisMonth)} ce mois</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6f5d4e]">Diaspora</p>
                    <p className="text-3xl font-semibold text-[#2c5ea0]">{formatNumber(clientSummary.segmentCount.Diaspora)}</p>
                    <p className="text-xs text-[#6f5d4e]">
                      {clientSummary.total ? `${Math.round((clientSummary.segmentCount.Diaspora / clientSummary.total) * 100)}% du total` : '0% du total'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6f5d4e]">Panier moyen</p>
                    <p className="text-3xl font-semibold text-[#23170f]">{formatNumber(Math.round(clientSummary.avgBasket))}</p>
                    <p className="text-xs text-[#4b8a4f]">Calcul auto</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6f5d4e]">Taux de retour</p>
                    <p className="text-3xl font-semibold text-[#23170f]">{Math.round(clientSummary.returnRate)}%</p>
                    <p className="text-xs text-[#4b8a4f]">Clients avec +2 commandes</p>
                  </div>
                </div>
              </article>

              <article className="rounded-md border border-[#eee1d8] p-4">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-[#6a4f3d]">Segmentation clients</h3>
                <div className="space-y-3">
                  {[
                    { label: 'VIP', key: 'VIP', color: 'bg-[#c89a34]' },
                    { label: 'Diaspora', key: 'Diaspora', color: 'bg-[#5a7fbe]' },
                    { label: 'Local actif', key: 'Local actif', color: 'bg-[#68a057]' },
                    { label: 'Nouveaux', key: 'Nouveau', color: 'bg-[#2e65a8]' },
                    { label: 'Inactifs', key: 'Inactif', color: 'bg-[#8f7d6f]' },
                  ].map((item) => {
                    const value = clientSummary.segmentCount[item.key] || 0;
                    const percent = clientSummary.total ? Math.round((value / clientSummary.total) * 100) : 0;
                    return (
                      <div key={item.key} className="grid grid-cols-[120px_1fr_70px] items-center gap-3 text-sm">
                        <span>{item.label}</span>
                        <div className="h-2 rounded-full bg-[#efe7e0]">
                          <div className={`h-full rounded-full ${item.color}`} style={{ width: `${percent}%` }} />
                        </div>
                        <span className="text-right text-[#5f4a3b]">{value} ({percent}%)</span>
                      </div>
                    );
                  })}
                </div>
              </article>
            </div>

            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <label className="relative min-w-[240px] flex-1 max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#987f6c]" />
                <input
                  type="search"
                  value={searchClient}
                  onChange={(event) => setSearchClient(event.target.value)}
                  placeholder="Nom, email, pays..."
                  className="w-full rounded-md border border-[#e5d7cb] py-2 pl-9 pr-3 text-sm outline-none focus:border-[#c7632a]"
                />
              </label>

              <div className="flex flex-wrap items-center gap-2">
                {[
                  { key: 'all', label: 'Tous' },
                  { key: 'vip', label: 'VIP' },
                  { key: 'diaspora', label: 'Diaspora' },
                  { key: 'local', label: 'Local' },
                  { key: 'new', label: 'Nouveaux' },
                  { key: 'inactive', label: 'Inactifs' },
                ].map((filter) => (
                  <button
                    key={filter.key}
                    type="button"
                    onClick={() => setClientFilter(filter.key)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                      clientFilter === filter.key ? 'bg-[#5a7fbe] text-white' : 'bg-[#f4eee9] text-[#5f4636]'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-[#624c3c]">Trier:</span>
                <select
                  value={clientSort}
                  onChange={(event) => setClientSort(event.target.value)}
                  className="rounded-md border border-[#e5d7cb] px-2 py-1.5 text-sm outline-none focus:border-[#5a7fbe]"
                >
                  <option value="spent_desc">Depenses desc</option>
                  <option value="spent_asc">Depenses asc</option>
                  <option value="orders_desc">Commandes</option>
                  <option value="name">Nom A-Z</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1150px] text-sm">
                <thead>
                  <tr className="border-b border-[#ecdfd4] text-left text-xs uppercase tracking-[0.14em] text-[#6f5d4e]">
                    <th className="px-2 py-3"></th>
                    <th className="px-2 py-3">Client</th>
                    <th className="px-2 py-3">Pays</th>
                    <th className="px-2 py-3">Segment</th>
                    <th className="px-2 py-3">Commandes</th>
                    <th className="px-2 py-3">Total depense</th>
                    <th className="px-2 py-3">Dernier achat</th>
                    <th className="px-2 py-3">Mode paiement</th>
                    <th className="px-2 py-3">Fidelite</th>
                    <th className="px-2 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedClients.map((row) => {
                    const expanded = expandedClientId === row.id;
                    return (
                      <Fragment key={row.id}>
                        <tr className="border-b border-[#f3e9e1] align-top">
                          <td className="px-2 py-3">
                            <button
                              type="button"
                              onClick={() => setExpandedClientId(expanded ? null : row.id)}
                              className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#d8c6b9] text-[#6b5342] hover:bg-[#f7f0ea]"
                            >
                              {expanded ? <ChevronUp className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                            </button>
                          </td>
                          <td className="px-2 py-3">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#5f7fb6] text-xs font-semibold text-white">
                                {getInitials(row.name)}
                              </span>
                              <div>
                                <p className="font-medium text-[#2b1c13]">{row.name}</p>
                                <p className="text-xs text-[#7c6a5c]">{row.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-2 py-3 text-[#3e2b1f]">{row.flag} {row.city}</td>
                          <td className="px-2 py-3">
                            <span className="rounded-full bg-[#eef3fc] px-2 py-1 text-xs font-semibold text-[#355c93]">{row.segment}</span>
                          </td>
                          <td className="px-2 py-3 text-[#3e2b1f]">{row.ordersCount}</td>
                          <td className="px-2 py-3 text-[#3e2b1f]">{formatNumber(row.totalSpent)}</td>
                          <td className="px-2 py-3 text-[#3e2b1f]">{row.lastPurchaseLabel}</td>
                          <td className="px-2 py-3 text-[#3e2b1f]">{row.paymentMethod}</td>
                          <td className="px-2 py-3">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-20 rounded-full bg-[#efe7e0]">
                                <div className="h-full rounded-full bg-[#c89a34]" style={{ width: `${row.fidelityProgress}%` }} />
                              </div>
                              <span className="text-xs text-[#6f5d4e]">{'●'.repeat(row.fidelityPoints)}</span>
                            </div>
                          </td>
                          <td className="px-2 py-3">
                            <button
                              type="button"
                              disabled={processingActionId === `client-${row.id}`}
                              onClick={() => handleClientStatusToggle(row)}
                              className="rounded-md border border-[#f0d7c2] bg-[#fff7ef] px-2 py-1 text-xs font-semibold text-[#8d4f22] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {row.status === 'suspendu' ? 'Reactiver' : 'Suspendre'}
                            </button>
                          </td>
                        </tr>
                        {expanded ? (
                          <tr className="border-b border-[#f3e9e1] bg-[#fcf9f6]">
                            <td colSpan={10} className="px-4 py-4">
                              <div className="grid gap-4 lg:grid-cols-[1fr_1.5fr]">
                                <div>
                                  <p className="text-sm font-semibold text-[#2a1a10]">Detail client</p>
                                  <p className="mt-2 text-sm text-[#5f4a3b]">Segment: <span className="font-medium text-[#2b1c13]">{row.segment}</span></p>
                                  <p className="text-sm text-[#5f4a3b]">Total depense: <span className="font-medium text-[#2b1c13]">{formatNumber(row.totalSpent)} FCFA</span></p>
                                  <p className="text-sm text-[#5f4a3b]">Commandes: <span className="font-medium text-[#2b1c13]">{row.ordersCount}</span></p>
                                  <p className="text-sm text-[#5f4a3b]">Panier moyen auto: <span className="font-medium text-[#2b1c13]">{formatNumber(Math.round(row.avgBasket))} FCFA</span></p>
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-[#2a1a10]">Historique commandes</p>
                                  <div className="mt-2 space-y-2">
                                    {row.orderHistory.length ? row.orderHistory.map((order) => (
                                      <div key={order.id} className="rounded-md border border-[#eadfd5] bg-white px-3 py-2">
                                        <div className="flex items-center justify-between text-sm">
                                          <p className="font-medium text-[#2b1c13]">#{order.number}</p>
                                          <p className="text-[#2b1c13]">{formatNumber(order.total)} FCFA</p>
                                        </div>
                                        <p className="text-xs text-[#7a6758]">{formatDateShort(order.date)} - {order.payment} - {order.status}</p>
                                      </div>
                                    )) : (
                                      <p className="text-sm text-[#7a6758]">Aucune commande recemment.</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ) : null}
                      </Fragment>
                    );
                  })}
                  {!pagedClients.length ? (
                    <tr>
                      <td colSpan={10} className="px-2 py-10 text-center text-sm text-[#7a6556]">
                        Aucun client trouve avec ces filtres.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[#6d5a4b]">
              <p>
                Affichage {pagedClients.length ? `${(currentClientPage - 1) * clientPerPage + 1}-${(currentClientPage - 1) * clientPerPage + pagedClients.length}` : '0'}
                {' '}sur {filteredClientRows.length} clients
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setClientPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentClientPage <= 1}
                  className="rounded-md border border-[#dfcfc2] px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronDown className="h-4 w-4 rotate-90" />
                </button>
                <span className="rounded-md bg-[#5a7fbe] px-2.5 py-1 text-white">{currentClientPage}</span>
                <span>/ {totalClientPages}</span>
                <button
                  type="button"
                  onClick={() => setClientPage((prev) => Math.min(totalClientPages, prev + 1))}
                  disabled={currentClientPage >= totalClientPages}
                  className="rounded-md border border-[#dfcfc2] px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronDown className="h-4 w-4 -rotate-90" />
                </button>
              </div>
            </div>
          </section>
        ) : null}

        {isOrderPage ? (
          <section className="mb-6 rounded-lg border border-[#e4d9d0] bg-white p-5">
            <div className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
              {orderPipeline.map((step) => (
                <button
                  key={step.key}
                  type="button"
                  onClick={() => {
                    setOrderFilter(step.key);
                    const first = filteredOrders.find((row) => row.stage === step.key) || orderRows.find((row) => row.stage === step.key);
                    if (first) setSelectedOrderId(first.id);
                  }}
                  className="rounded-md border border-[#eee1d8] p-3 text-left hover:bg-[#f8f3ee]"
                >
                  <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#5f4738]">
                    <span className={`inline-flex h-2.5 w-2.5 rounded-full ${step.dot}`} />
                    {step.label}
                  </p>
                  <p className="text-3xl font-semibold text-[#23170f]">{formatNumber(step.count)}</p>
                  <p className="text-sm text-[#5f4a3b]">{formatNumber(step.amount)} FCFA</p>
                  <div className="mt-2 h-1.5 rounded-full bg-[#efe7e0]">
                    <div
                      className={`h-full rounded-full ${step.color}`}
                      style={{ width: `${orderRows.length ? (step.count / orderRows.length) * 100 : 0}%` }}
                    />
                  </div>
                </button>
              ))}
            </div>

            {urgentOrders.length ? (
              <div className="mb-4 flex items-center gap-2 rounded-md border border-[#f4d7ca] bg-[#fff4ef] px-3 py-2 text-sm text-[#8c3f1d]">
                <AlertTriangle className="h-4 w-4" />
                {urgentOrders.length} commande(s) bloquee(s) +48h
              </div>
            ) : null}

            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <label className="relative min-w-[240px] flex-1 max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#987f6c]" />
                <input
                  type="search"
                  value={orderSearch}
                  onChange={(event) => setOrderSearch(event.target.value)}
                  placeholder="N° commande, client, produit..."
                  className="w-full rounded-md border border-[#e5d7cb] py-2 pl-9 pr-3 text-sm outline-none focus:border-[#c7632a]"
                />
              </label>

              <div className="flex flex-wrap items-center gap-2">
                {[
                  { key: 'all', label: 'Toutes' },
                  { key: 'local', label: 'Locales' },
                  { key: 'international', label: 'Internationales' },
                  { key: 'urgent', label: 'Urgentes' },
                ].map((filter) => (
                  <button
                    key={filter.key}
                    type="button"
                    onClick={() => {
                      if (filter.key === 'local' || filter.key === 'international') {
                        setOrderTypeFilter(filter.key);
                        setOrderFilter('all');
                        return;
                      }
                      setOrderTypeFilter('all');
                      setOrderFilter(filter.key);
                    }}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                      (filter.key === orderFilter || filter.key === orderTypeFilter) ? 'bg-[#c7632a] text-white' : 'bg-[#f4eee9] text-[#5f4636]'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-[#624c3c]">Trier:</span>
                <select
                  value={orderSort}
                  onChange={(event) => setOrderSort(event.target.value)}
                  className="rounded-md border border-[#e5d7cb] px-2 py-1.5 text-sm outline-none focus:border-[#c7632a]"
                >
                  <option value="date_desc">Date desc</option>
                  <option value="amount_desc">Montant desc</option>
                  <option value="amount_asc">Montant asc</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px] text-sm">
                <thead>
                  <tr className="border-b border-[#ecdfd4] text-left text-xs uppercase tracking-[0.14em] text-[#6f5d4e]">
                    <th className="px-2 py-3">N° commande</th>
                    <th className="px-2 py-3">Client</th>
                    <th className="px-2 py-3">Produits</th>
                    <th className="px-2 py-3">Montant</th>
                    <th className="px-2 py-3">Type</th>
                    <th className="px-2 py-3">Statut</th>
                    <th className="px-2 py-3">Progression</th>
                    <th className="px-2 py-3">Vendeur</th>
                    <th className="px-2 py-3">Date</th>
                    <th className="px-2 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedOrders.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedOrderId(row.id)}
                      className="cursor-pointer border-b border-[#f3e9e1] hover:bg-[#fbf7f3]"
                    >
                      <td className="px-2 py-3 font-medium text-[#2b1c13]">
                        {row.orderNumber} {row.isUrgent ? <span className="text-xs text-[#a54a23]">Alerte 48h+</span> : null}
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#8c4c82] text-xs font-semibold text-white">
                            {row.clientInitials}
                          </span>
                          <div>
                            <p className="text-[#2b1c13]">{row.clientName}</p>
                            <p className="text-xs text-[#7c6a5c]">{row.clientCountry}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-3 text-[#3e2b1f]">{row.productsLabel}</td>
                      <td className="px-2 py-3 text-[#3e2b1f]">{formatNumber(row.amount)}</td>
                      <td className="px-2 py-3 text-[#3e2b1f]">
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#eef3fc] px-2 py-1 text-xs font-semibold text-[#355c93]">
                          {row.orderType === 'international' ? <Truck className="h-3.5 w-3.5" /> : <House className="h-3.5 w-3.5" />}
                          {row.orderType === 'international' ? 'Intl' : 'Local'}
                        </span>
                      </td>
                      <td className="px-2 py-3 text-[#3e2b1f]">{row.stageLabel}</td>
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <span
                              key={`${row.id}-${idx}`}
                              className={`inline-flex h-1.5 w-4 rounded-full ${
                                idx < row.progressCount ? (row.stage === 'annulees' ? 'bg-[#a64c26]' : 'bg-[#4b8f30]') : 'bg-[#e4d9d0]'
                              }`}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="px-2 py-3 text-[#3e2b1f]">{row.vendorName}</td>
                      <td className="px-2 py-3 text-[#3e2b1f]">{row.dateLabel}</td>
                      <td className="px-2 py-3 text-[#3e2b1f]">
                        <ChevronRight className="h-4 w-4" />
                      </td>
                    </tr>
                  ))}
                  {!pagedOrders.length ? (
                    <tr>
                      <td colSpan={10} className="px-2 py-10 text-center text-sm text-[#7a6556]">
                        Aucune commande trouvee avec ces filtres.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[#6d5a4b]">
              <p>
                Affichage {pagedOrders.length ? `${(currentOrderPage - 1) * orderPerPage + 1}-${(currentOrderPage - 1) * orderPerPage + pagedOrders.length}` : '0'}
                {' '}sur {filteredOrders.length} commandes
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOrderPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentOrderPage <= 1}
                  className="rounded-md border border-[#dfcfc2] px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronDown className="h-4 w-4 rotate-90" />
                </button>
                <span className="rounded-md bg-[#c7632a] px-2.5 py-1 text-white">{currentOrderPage}</span>
                <span>/ {totalOrderPages}</span>
                <button
                  type="button"
                  onClick={() => setOrderPage((prev) => Math.min(totalOrderPages, prev + 1))}
                  disabled={currentOrderPage >= totalOrderPages}
                  className="rounded-md border border-[#dfcfc2] px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronDown className="h-4 w-4 -rotate-90" />
                </button>
              </div>
            </div>
          </section>
        ) : null}

        {isVendorPage ? (
          <section className="mb-6 rounded-lg border border-[#e4d9d0] bg-white p-5">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-[#261911]">Gestion des vendeurs</h2>
              <p className="text-sm text-[#6d5b4d]">
                {formatNumber(vendorSummary.total)} vendeurs - {formatNumber(vendorSummary.pending)} en attente de validation
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={exportVendorCsv}
                className="inline-flex items-center gap-2 rounded-md border border-[#dfcfc2] px-3 py-2 text-sm text-[#4e382a] hover:bg-[#f7f0ea]"
              >
                <Download className="h-4 w-4" />
                Exporter CSV
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/products/create')}
                className="inline-flex items-center gap-2 rounded-md bg-[#c7632a] px-3 py-2 text-sm font-semibold text-white hover:bg-[#af5523]"
              >
                <Plus className="h-4 w-4" />
                Ajouter vendeur
              </button>
            </div>
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-md border border-[#eee1d8] p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6a4f3d]">Total vendeurs</p>
              <p className="mt-2 text-3xl font-semibold text-[#23170f]">{formatNumber(vendorSummary.total)}</p>
              <p className="mt-1 text-xs text-[#6f5d4e]">{formatNumber(vendorSummary.active)} actifs</p>
            </article>
            <article className="rounded-md border border-[#eee1d8] p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6a4f3d]">En attente KYC</p>
              <p className="mt-2 text-3xl font-semibold text-[#bf5a21]">{formatNumber(vendorSummary.pending)}</p>
              <p className="mt-1 text-xs text-[#6f5d4e]">Action requise</p>
            </article>
            <article className="rounded-md border border-[#eee1d8] p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6a4f3d]">Signales / litiges</p>
              <p className="mt-2 text-3xl font-semibold text-[#b56a22]">{formatNumber(vendorSummary.flagged)}</p>
              <p className="mt-1 text-xs text-[#6f5d4e]">Surveillance</p>
            </article>
            <article className="rounded-md border border-[#eee1d8] p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6a4f3d]">GMV total vendeurs</p>
              <p className="mt-2 text-3xl font-semibold text-[#23170f]">{formatCompact(vendorSummary.totalGMV)}</p>
              <p className="mt-1 text-xs text-[#6f5d4e]">FCFA estime</p>
            </article>
          </div>

          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <label className="relative min-w-[240px] flex-1 max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#987f6c]" />
              <input
                type="search"
                value={searchVendor}
                onChange={(event) => setSearchVendor(event.target.value)}
                placeholder="Rechercher un vendeur..."
                className="w-full rounded-md border border-[#e5d7cb] py-2 pl-9 pr-3 text-sm outline-none focus:border-[#c7632a]"
              />
            </label>

            <div className="flex flex-wrap items-center gap-2">
              {[
                { key: 'all', label: `Tous (${vendorSummary.total})` },
                { key: 'active', label: `Actifs (${vendorSummary.active})` },
                { key: 'pending', label: `En attente (${vendorSummary.pending})` },
                { key: 'flagged', label: `Signales (${vendorSummary.flagged})` },
                { key: 'suspended', label: `Suspendus (${vendorSummary.suspended})` },
              ].map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setVendorFilter(filter.key)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    vendorFilter === filter.key ? 'bg-[#c7632a] text-white' : 'bg-[#f4eee9] text-[#5f4636]'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-[#624c3c]">Trier:</span>
              <select
                value={vendorSort}
                onChange={(event) => setVendorSort(event.target.value)}
                className="rounded-md border border-[#e5d7cb] px-2 py-1.5 text-sm outline-none focus:border-[#c7632a]"
              >
                <option value="gmv_desc">GMV desc</option>
                <option value="gmv_asc">GMV asc</option>
                <option value="name">Nom A-Z</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] text-sm">
              <thead>
                <tr className="border-b border-[#ecdfd4] text-left text-xs uppercase tracking-[0.14em] text-[#6f5d4e]">
                  <th className="px-2 py-3"></th>
                  <th className="px-2 py-3">Vendeur</th>
                  <th className="px-2 py-3">Ville</th>
                  <th className="px-2 py-3">Produits</th>
                  <th className="px-2 py-3">Commandes</th>
                  <th className="px-2 py-3">GMV (FCFA)</th>
                  <th className="px-2 py-3">Note</th>
                  <th className="px-2 py-3">KYC</th>
                  <th className="px-2 py-3">Statut</th>
                  <th className="px-2 py-3">Inscrit le</th>
                  <th className="px-2 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pagedVendors.map((row) => {
                  const expanded = expandedVendorId === row.id;
                  const maxActivity = Math.max(...row.activity, 1);
                  return (
                    <Fragment key={row.id}>
                      <tr key={row.id} className="border-b border-[#f3e9e1] align-top">
                        <td className="px-2 py-3">
                          <button
                            type="button"
                            onClick={() => setExpandedVendorId(expanded ? null : row.id)}
                            className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#d8c6b9] text-[#6b5342] hover:bg-[#f7f0ea]"
                            aria-label={expanded ? 'Fermer details vendeur' : 'Ouvrir details vendeur'}
                          >
                            {expanded ? <ChevronUp className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                          </button>
                        </td>
                        <td className="px-2 py-3">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#c9723a] text-xs font-semibold text-white">
                              {getInitials(row.name)}
                            </span>
                            <div>
                              <p className="font-medium text-[#2b1c13]">{row.name}</p>
                              <p className="text-xs text-[#7c6a5c]">{row.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-3 text-[#3e2b1f]">{row.city}</td>
                        <td className="px-2 py-3 text-[#3e2b1f]">{formatNumber(row.products)}</td>
                        <td className="px-2 py-3 text-[#3e2b1f]">{formatNumber(row.orders)}</td>
                        <td className="px-2 py-3 text-[#3e2b1f]">{formatNumber(row.gmv)}</td>
                        <td className="px-2 py-3 text-[#3e2b1f]">
                          {row.rating > 0 ? `★★★★★ ${row.rating.toFixed(1)}` : 'Non note'}
                        </td>
                        <td className="px-2 py-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                              row.kyc === 'Verifie'
                                ? 'bg-[#edf8ef] text-[#2f7a3b]'
                                : row.kyc === 'En cours'
                                  ? 'bg-[#fff5e8] text-[#b7771e]'
                                  : 'bg-[#fcecee] text-[#9d3349]'
                            }`}
                          >
                            {row.kyc === 'Verifie' ? <ShieldCheck className="h-3.5 w-3.5" /> : null}
                            {row.kyc === 'En cours' ? <ShieldQuestion className="h-3.5 w-3.5" /> : null}
                            {row.kyc === 'Manquant' ? <ShieldX className="h-3.5 w-3.5" /> : null}
                            {row.kyc}
                          </span>
                        </td>
                        <td className={`px-2 py-3 font-medium ${STATUS_STYLE[row.status] || 'text-[#3e2b1f]'}`}>
                          {row.status}
                        </td>
                        <td className="px-2 py-3 text-[#3e2b1f]">{formatDateShort(row.joinedAt)}</td>
                        <td className="px-2 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            <button
                              type="button"
                              disabled={processingActionId === `approve-${row.id}` || row.kyc === 'Verifie' || row.status === 'Banni'}
                              onClick={() => handleApproveVendor(row)}
                              className="rounded-md border border-[#c8e4cf] bg-[#f2fbf5] px-2 py-1 text-xs font-semibold text-[#2f7a3b] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Approuver
                            </button>
                            <button
                              type="button"
                              disabled={processingActionId === `suspend-${row.id}` || row.status === 'Banni'}
                              onClick={() => handleToggleSuspend(row)}
                              className="rounded-md border border-[#f0d7c2] bg-[#fff7ef] px-2 py-1 text-xs font-semibold text-[#8d4f22] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {row.status === 'Suspendu' ? 'Reactiver' : 'Suspendre'}
                            </button>
                            <button
                              type="button"
                              disabled={processingActionId === `ban-${row.id}` || row.status === 'Banni'}
                              onClick={() => handleBanVendor(row)}
                              className="rounded-md border border-[#f3ccd4] bg-[#fff1f4] px-2 py-1 text-xs font-semibold text-[#8f2f46] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Bannir
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expanded ? (
                        <tr className="border-b border-[#f3e9e1] bg-[#fcf9f6]">
                          <td colSpan={11} className="px-4 py-4">
                            <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
                              <div>
                                <p className="text-sm font-semibold text-[#2a1a10]">Detail vendeur</p>
                                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                                  <p className="text-sm text-[#5f4a3b]">Boutique: <span className="font-medium text-[#2b1c13]">{row.shopName}</span></p>
                                  <p className="text-sm text-[#5f4a3b]">Email: <span className="font-medium text-[#2b1c13]">{row.email}</span></p>
                                  <p className="text-sm text-[#5f4a3b]">KYC: <span className="font-medium text-[#2b1c13]">{row.kyc}</span></p>
                                  <p className="text-sm text-[#5f4a3b]">Signalements: <span className="font-medium text-[#2b1c13]">{row.flagged ? 'Oui' : 'Non'}</span></p>
                                </div>
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-[#2a1a10]">Activite hebdomadaire</p>
                                <div className="mt-3 flex h-20 items-end gap-1.5">
                                  {row.activity.map((value, index) => (
                                    <div key={`${row.id}-bar-${index}`} className="flex flex-1 flex-col items-center justify-end">
                                      <div
                                        className="w-full rounded-t-sm bg-gradient-to-t from-[#c4672d] to-[#e7b48a]"
                                        style={{ height: `${Math.max(8, (value / maxActivity) * 100)}%` }}
                                      />
                                    </div>
                                  ))}
                                </div>
                                <div className="mt-2 flex justify-between text-[10px] uppercase tracking-[0.08em] text-[#8e7767]">
                                  <span>L</span>
                                  <span>M</span>
                                  <span>M</span>
                                  <span>J</span>
                                  <span>V</span>
                                  <span>S</span>
                                  <span>D</span>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })}
                {!pagedVendors.length ? (
                  <tr>
                    <td colSpan={11} className="px-2 py-10 text-center text-sm text-[#7a6556]">
                      Aucun vendeur trouve avec ces filtres.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[#6d5a4b]">
            <p>
              Affichage {pagedVendors.length ? `${(currentVendorPage - 1) * perPage + 1}-${(currentVendorPage - 1) * perPage + pagedVendors.length}` : '0'}
              {' '}sur {filteredVendorRows.length} vendeurs
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setVendorPage((prev) => Math.max(1, prev - 1))}
                disabled={currentVendorPage <= 1}
                className="rounded-md border border-[#dfcfc2] px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronDown className="h-4 w-4 rotate-90" />
              </button>
              <span className="rounded-md bg-[#c7632a] px-2.5 py-1 text-white">{currentVendorPage}</span>
              <span>/ {totalVendorPages}</span>
              <button
                type="button"
                onClick={() => setVendorPage((prev) => Math.min(totalVendorPages, prev + 1))}
                disabled={currentVendorPage >= totalVendorPages}
                className="rounded-md border border-[#dfcfc2] px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronDown className="h-4 w-4 -rotate-90" />
              </button>
            </div>
          </div>
          </section>
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

        {isOrderPage && selectedOrder ? (
          <>
            <button
              type="button"
              aria-label="Fermer detail commande"
              onClick={() => setSelectedOrderId(null)}
              className="fixed inset-0 z-30 bg-black/30"
            />
            <aside className="fixed right-0 top-0 z-40 h-full w-full max-w-md overflow-y-auto border-l border-[#e4d9d0] bg-white p-5 shadow-2xl">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-[#7c6a5c]">Detail commande</p>
                  <h3 className="text-xl font-semibold text-[#24170f]">{selectedOrder.orderNumber}</h3>
                  <p className="text-sm text-[#6d5a4b]">{selectedOrder.clientName} - {selectedOrder.clientEmail}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrderId(null)}
                  className="rounded-md border border-[#e1d2c5] p-1.5 text-[#6b5342] hover:bg-[#f7f0ea]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mb-4 rounded-md border border-[#eee1d8] bg-[#fcf9f6] p-3 text-sm">
                <p className="text-[#5f4a3b]">Montant: <span className="font-semibold text-[#2b1c13]">{formatNumber(selectedOrder.amount)} FCFA</span></p>
                <p className="text-[#5f4a3b]">Statut: <span className="font-semibold text-[#2b1c13]">{selectedOrder.stageLabel}</span></p>
                <p className="text-[#5f4a3b]">Vendeur: <span className="font-semibold text-[#2b1c13]">{selectedOrder.vendorName}</span></p>
              </div>

              <div className="mb-4 rounded-md border border-[#eee1d8] p-3">
                <p className="mb-2 text-sm font-semibold text-[#2a1a10]">Suivi logistique</p>
                <p className="text-sm text-[#5f4a3b]">Transporteur: <span className="font-medium text-[#2b1c13]">{selectedOrder.transporter}</span></p>
                <p className="text-sm text-[#5f4a3b]">Numero colis: <span className="font-medium text-[#2b1c13]">{selectedOrder.trackingNumber}</span></p>
                <p className="text-sm text-[#5f4a3b]">Livraison estimee: <span className="font-medium text-[#2b1c13]">{selectedOrder.estimatedDate}</span></p>
              </div>

              <div className="rounded-md border border-[#eee1d8] p-3">
                <p className="mb-3 text-sm font-semibold text-[#2a1a10]">Timeline de suivi</p>
                <div className="space-y-3">
                  {[
                    { key: 'nouvelles', label: 'Nouvelle commande enregistree' },
                    { key: 'confirmees', label: 'Commande confirmee' },
                    { key: 'preparation', label: 'Preparation en cours' },
                    { key: 'expediees', label: 'Commande expediee' },
                    { key: 'livrees', label: 'Commande livree' },
                  ].map((step, index) => {
                    const stageOrder = ['nouvelles', 'confirmees', 'preparation', 'expediees', 'livrees'];
                    const currentIndex = stageOrder.indexOf(selectedOrder.stage);
                    const active = selectedOrder.stage === 'annulees' ? index === 0 : index <= Math.max(0, currentIndex);
                    return (
                      <div key={step.key} className="flex items-start gap-2">
                        <span className={`mt-1 inline-flex h-2.5 w-2.5 rounded-full ${active ? 'bg-[#4b8f30]' : 'bg-[#d7c9bd]'}`} />
                        <div>
                          <p className={`text-sm ${active ? 'text-[#2b1c13]' : 'text-[#8b7565]'}`}>{step.label}</p>
                          <p className="text-xs text-[#8b7565]">{formatDateShort(selectedOrder.rawDate)}</p>
                        </div>
                      </div>
                    );
                  })}
                  {selectedOrder.stage === 'annulees' ? (
                    <div className="flex items-start gap-2">
                      <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-[#a64c26]" />
                      <div>
                        <p className="text-sm text-[#2b1c13]">Commande annulee</p>
                        <p className="text-xs text-[#8b7565]">{formatDateShort(selectedOrder.rawDate)}</p>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </aside>
          </>
        ) : null}
      </main>
    </div>
  );
}
