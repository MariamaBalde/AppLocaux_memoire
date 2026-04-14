import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Search } from 'lucide-react';
import VendorShell from '../../components/vendor/VendorShell';
import { vendorDashboardService } from '../../services/vendorDashboardService';

function statusClasses(status) {
  if (status === 'delivered') return 'bg-green-100 text-green-700';
  if (status === 'shipped') return 'bg-blue-100 text-blue-700';
  if (status === 'processing') return 'bg-amber-100 text-amber-700';
  if (status === 'cancelled') return 'bg-red-100 text-red-700';
  return 'bg-orange-100 text-orange-700';
}

function initials(name) {
  const base = (name || 'CL').trim();
  const parts = base.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'CL';
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
}

export default function VendorOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('all');
  const [period, setPeriod] = useState('month');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalOrders: 0 });
  const [pendingOrders, setPendingOrders] = useState(0);
  const [counts, setCounts] = useState({
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    all: 0,
  });

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const ordersResponse = await vendorDashboardService.getRecentOrders({ status, period, page, per_page: 10 });
        setOrders(Array.isArray(ordersResponse?.data) ? ordersResponse.data : []);
        setPagination(ordersResponse?.pagination || { page: 1, totalPages: 1, totalOrders: 0 });
        setError('');
      } catch (err) {
        setError(err?.message || 'Impossible de charger les commandes vendeur.');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [status, period, page]);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const [statsResponse, allRes, pendingRes, processingRes, shippedRes, deliveredRes, cancelledRes] = await Promise.all([
          vendorDashboardService.getStats({ period: 'all' }),
          vendorDashboardService.getRecentOrders({ status: 'all', period, page: 1, per_page: 1 }),
          vendorDashboardService.getRecentOrders({ status: 'pending', period, page: 1, per_page: 1 }),
          vendorDashboardService.getRecentOrders({ status: 'processing', period, page: 1, per_page: 1 }),
          vendorDashboardService.getRecentOrders({ status: 'shipped', period, page: 1, per_page: 1 }),
          vendorDashboardService.getRecentOrders({ status: 'delivered', period, page: 1, per_page: 1 }),
          vendorDashboardService.getRecentOrders({ status: 'cancelled', period, page: 1, per_page: 1 }),
        ]);

        setPendingOrders(Number(statsResponse?.data?.notifications?.pendingOrders || 0));
        setCounts({
          all: Number(allRes?.pagination?.totalOrders || 0),
          pending: Number(pendingRes?.pagination?.totalOrders || 0),
          processing: Number(processingRes?.pagination?.totalOrders || 0),
          shipped: Number(shippedRes?.pagination?.totalOrders || 0),
          delivered: Number(deliveredRes?.pagination?.totalOrders || 0),
          cancelled: Number(cancelledRes?.pagination?.totalOrders || 0),
        });
      } catch {
        // Ignore les erreurs de widgets de synthèse pour ne pas bloquer la liste.
      }
    };

    loadSummary();
  }, [period]);

  const visibleOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orders;

    return orders.filter((order) => {
      const haystack = [
        String(order.id || ''),
        order.clientName || '',
        order.productSummary || '',
        order.productName || '',
        order.destination || '',
        order.statusLabel || '',
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [orders, search]);

  return (
    <VendorShell
      activeKey="orders"
      title="Mes commandes"
      subtitle={`${counts.all} commandes sur la période · ${counts.pending} nécessitent une action`}
      pendingOrders={pendingOrders}
    >
      {({ darkMode }) => (
        <div className="space-y-4">
          <section
            className={[
              'rounded-2xl border p-4 shadow-sm',
              darkMode ? 'border-amber-700/30 bg-[#2a160e]' : 'border-[#ddd4cb] bg-[#f8f4ef]',
            ].join(' ')}
          >
            <div className="mb-3 flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                className={[
                  'inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold',
                  darkMode
                    ? 'border-amber-600/40 bg-amber-500/10 text-amber-100'
                    : 'border-[#cfc6bd] bg-white text-[#2f2924]',
                ].join(' ')}
              >
                <Download className="h-4 w-4" />
                Exporter
              </button>
              <button
                type="button"
                className={[
                  'rounded-xl border px-4 py-2 text-sm font-semibold',
                  darkMode
                    ? 'border-amber-600/40 bg-amber-500/10 text-amber-100'
                    : 'border-[#cfc6bd] bg-white text-[#2f2924]',
                ].join(' ')}
              >
                Marquer tout lu
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
              <div className={['rounded-xl p-3', darkMode ? 'bg-[#1f120c]' : 'bg-[#ece7df]'].join(' ')}>
                <p className={['text-xs uppercase tracking-wide', darkMode ? 'text-amber-200/70' : 'text-[#6f655c]'].join(' ')}>Nouvelles</p>
                <p className={['text-3xl font-semibold', darkMode ? 'text-amber-50' : 'text-[#2f2924]'].join(' ')}>{counts.pending}</p>
                <p className="text-xs text-[#7c4f2a]">À confirmer</p>
              </div>
              <div className={['rounded-xl p-3', darkMode ? 'bg-[#1f120c]' : 'bg-[#ece7df]'].join(' ')}>
                <p className={['text-xs uppercase tracking-wide', darkMode ? 'text-amber-200/70' : 'text-[#6f655c]'].join(' ')}>En préparation</p>
                <p className={['text-3xl font-semibold', darkMode ? 'text-amber-50' : 'text-[#2f2924]'].join(' ')}>{counts.processing}</p>
                <p className="text-xs text-amber-700">En cours</p>
              </div>
              <div className={['rounded-xl p-3', darkMode ? 'bg-[#1f120c]' : 'bg-[#ece7df]'].join(' ')}>
                <p className={['text-xs uppercase tracking-wide', darkMode ? 'text-amber-200/70' : 'text-[#6f655c]'].join(' ')}>Expédiées</p>
                <p className={['text-3xl font-semibold', darkMode ? 'text-amber-50' : 'text-[#2f2924]'].join(' ')}>{counts.shipped}</p>
                <p className="text-xs text-[#7c4f2a]">En transit</p>
              </div>
              <div className={['rounded-xl p-3', darkMode ? 'bg-[#1f120c]' : 'bg-[#ece7df]'].join(' ')}>
                <p className={['text-xs uppercase tracking-wide', darkMode ? 'text-amber-200/70' : 'text-[#6f655c]'].join(' ')}>Livrées</p>
                <p className={['text-3xl font-semibold', darkMode ? 'text-amber-50' : 'text-[#2f2924]'].join(' ')}>{counts.delivered}</p>
                <p className="text-xs text-green-700">Ce mois</p>
              </div>
              <div className={['rounded-xl p-3', darkMode ? 'bg-[#1f120c]' : 'bg-[#ece7df]'].join(' ')}>
                <p className={['text-xs uppercase tracking-wide', darkMode ? 'text-amber-200/70' : 'text-[#6f655c]'].join(' ')}>Annulées</p>
                <p className={['text-3xl font-semibold', darkMode ? 'text-amber-50' : 'text-[#2f2924]'].join(' ')}>{counts.cancelled}</p>
                <p className="text-xs text-red-700">Remboursement</p>
              </div>
            </div>
          </section>

          <section
            className={[
              'rounded-2xl border p-3 shadow-sm',
              darkMode ? 'border-amber-700/30 bg-[#2a160e]' : 'border-[#ddd4cb] bg-[#f8f4ef]',
            ].join(' ')}
          >
            <div className="flex flex-wrap items-center gap-2">
              <label
                className={[
                  'flex min-w-[260px] flex-1 items-center gap-2 rounded-xl border px-3 py-2',
                  darkMode ? 'border-amber-700/40 bg-[#1f120c]' : 'border-[#cdc3b9] bg-white',
                ].join(' ')}
              >
                <Search className={['h-4 w-4', darkMode ? 'text-amber-200/70' : 'text-[#81776d]'].join(' ')} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="N° commande, client..."
                  className={[
                    'w-full bg-transparent text-sm outline-none',
                    darkMode ? 'text-amber-50 placeholder:text-amber-200/50' : 'text-[#2f2924] placeholder:text-[#81776d]',
                  ].join(' ')}
                />
              </label>

              <div className="flex flex-wrap items-center gap-2">
                {[
                  { key: 'all', label: `Toutes (${counts.all})` },
                  { key: 'pending', label: `Nouvelles (${counts.pending})` },
                  { key: 'processing', label: `En cours (${counts.processing})` },
                  { key: 'delivered', label: `Livrées (${counts.delivered})` },
                  { key: 'cancelled', label: `Annulées (${counts.cancelled})` },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      setStatus(item.key);
                      setPage(1);
                    }}
                    className={[
                      'rounded-full border px-3 py-1.5 text-sm transition',
                      status === item.key
                        ? 'border-[#bb652f] bg-[#bb652f] text-white'
                        : darkMode
                          ? 'border-amber-700/40 bg-[#1f120c] text-amber-100'
                          : 'border-[#cfc6bd] bg-white text-[#544e47]',
                    ].join(' ')}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <select
                value={period}
                onChange={(e) => {
                  setPeriod(e.target.value);
                  setPage(1);
                }}
                className={[
                  'ml-auto rounded-xl border px-3 py-2 text-sm',
                  darkMode ? 'border-amber-700/40 bg-[#1f120c] text-amber-50' : 'border-[#cdc3b9] bg-white text-[#2f2924]',
                ].join(' ')}
              >
                <option value="month">Ce mois</option>
                <option value="all">Toute période</option>
                <option value="7d">7 derniers jours</option>
                <option value="30d">30 derniers jours</option>
              </select>
            </div>
          </section>

          {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

          <section
            className={[
              'overflow-hidden rounded-2xl border shadow-sm',
              darkMode ? 'border-amber-700/30 bg-[#2a160e]' : 'border-[#ddd4cb] bg-[#f8f4ef]',
            ].join(' ')}
          >
            <div className={['flex items-center justify-between border-b px-4 py-3', darkMode ? 'border-amber-700/20' : 'border-[#ddd4cb]'].join(' ')}>
              <h3 className={['text-lg font-semibold', darkMode ? 'text-amber-100' : 'text-[#2f2924]'].join(' ')}>Liste des commandes</h3>
              <p className={darkMode ? 'text-sm text-amber-200/80' : 'text-sm text-[#6f655c]'}>
                {pagination.totalOrders} au total
              </p>
            </div>

            {loading ? (
              <p className={['px-4 py-6', darkMode ? 'text-amber-200/80' : 'text-[#7c4f2a]'].join(' ')}>Chargement des commandes...</p>
            ) : visibleOrders.length === 0 ? (
              <p className={['px-4 py-6', darkMode ? 'text-amber-200/80' : 'text-[#7c4f2a]'].join(' ')}>Aucune commande trouvée.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className={darkMode ? 'text-amber-200/80' : 'text-[#6f655c]'}>
                      <th className="px-4 py-3 text-left">N° commande</th>
                      <th className="px-4 py-3 text-left">Client</th>
                      <th className="px-4 py-3 text-left">Produits</th>
                      <th className="px-4 py-3 text-left">Montant</th>
                      <th className="px-4 py-3 text-left">Statut</th>
                      <th className="px-4 py-3 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleOrders.map((order) => (
                      <tr key={order.id} className={darkMode ? 'border-t border-amber-700/20' : 'border-t border-[#e5ddd5]'}>
                        <td className={['px-4 py-3 font-medium', darkMode ? 'text-amber-50' : 'text-[#2f2924]'].join(' ')}>#{order.id}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7a4067] text-xs font-semibold text-white">
                              {initials(order.clientName)}
                            </span>
                            <div>
                              <p className={darkMode ? 'text-amber-50' : 'text-[#2f2924]'}>{order.clientName}</p>
                              <p className={darkMode ? 'text-xs text-amber-200/70' : 'text-xs text-[#6f655c]'}>{order.destination || '-'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            {(Array.isArray(order.productNames) ? order.productNames : [order.productName])
                              .filter(Boolean)
                              .slice(0, 2)
                              .map((name) => (
                                <span key={`${order.id}-${name}`} className="rounded-md bg-[#e9e3dc] px-2 py-0.5 text-xs text-[#5c544c]">
                                  {name}
                                </span>
                              ))}
                          </div>
                        </td>
                        <td className={['px-4 py-3 font-semibold', darkMode ? 'text-amber-50' : 'text-[#2f2924]'].join(' ')}>
                          {Number(order.amount || 0).toLocaleString('fr-FR')} FCFA
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(order.status)}`}>
                            {order.statusLabel}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Link to={`/vendeur/orders/${order.id}`} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-dark">
                            Voir
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className={['flex items-center justify-between border-t px-4 py-3', darkMode ? 'border-amber-700/20' : 'border-[#ddd4cb]'].join(' ')}>
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                Précédent
              </button>

              <span className={darkMode ? 'text-xs text-amber-200/80' : 'text-xs text-[#7c4f2a]'}>
                Page {pagination.page} / {pagination.totalPages}
              </span>

              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                Suivant
              </button>
            </div>
          </section>
        </div>
      )}
    </VendorShell>
  );
}
