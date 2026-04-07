import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Plus, Search } from 'lucide-react';
import VendorShell from '../../components/vendor/VendorShell';
import { vendorDashboardService } from '../../services/vendorDashboardService';

function initials(name) {
  const base = (name || 'CL').trim();
  const parts = base.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'CL';
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
}

function carrierLabel(destination) {
  const text = (destination || '').toLowerCase();
  if (text.includes('sénégal') || text.includes('senegal') || text.includes('sn')) return 'Yoboo Delivery';
  if (text.includes('france') || text.includes('usa') || text.includes('canada')) return 'DHL Express';
  return 'Chronopost';
}

export default function VendorShipments() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingOrders, setPendingOrders] = useState(0);
  const [period, setPeriod] = useState('all');
  const [page, setPage] = useState(1);
  const [statusGroup, setStatusGroup] = useState('all');
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalOrders: 0 });
  const [counts, setCounts] = useState({
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    all: 0,
  });

  const apiStatus =
    statusGroup === 'in_transit'
      ? 'shipped'
      : statusGroup === 'problem'
        ? 'cancelled'
        : statusGroup;

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [ordersResponse, stats] = await Promise.all([
          vendorDashboardService.getRecentOrders({ status: apiStatus, period, page, per_page: 10 }),
          vendorDashboardService.getStats({ period: 'all' }),
        ]);

        setShipments(Array.isArray(ordersResponse?.data) ? ordersResponse.data : []);
        setPagination(ordersResponse?.pagination || { page: 1, totalPages: 1, totalOrders: 0 });
        setPendingOrders(Number(stats?.data?.notifications?.pendingOrders || 0));
        setError('');
      } catch (err) {
        setError(err?.message || 'Impossible de charger les expéditions.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [apiStatus, period, page]);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const [allRes, pendingRes, processingRes, shippedRes, deliveredRes, cancelledRes] = await Promise.all([
          vendorDashboardService.getRecentOrders({ status: 'all', period, page: 1, per_page: 1 }),
          vendorDashboardService.getRecentOrders({ status: 'pending', period, page: 1, per_page: 1 }),
          vendorDashboardService.getRecentOrders({ status: 'processing', period, page: 1, per_page: 1 }),
          vendorDashboardService.getRecentOrders({ status: 'shipped', period, page: 1, per_page: 1 }),
          vendorDashboardService.getRecentOrders({ status: 'delivered', period, page: 1, per_page: 1 }),
          vendorDashboardService.getRecentOrders({ status: 'cancelled', period, page: 1, per_page: 1 }),
        ]);

        setCounts({
          all: Number(allRes?.pagination?.totalOrders || 0),
          pending: Number(pendingRes?.pagination?.totalOrders || 0),
          processing: Number(processingRes?.pagination?.totalOrders || 0),
          shipped: Number(shippedRes?.pagination?.totalOrders || 0),
          delivered: Number(deliveredRes?.pagination?.totalOrders || 0),
          cancelled: Number(cancelledRes?.pagination?.totalOrders || 0),
        });
      } catch {
        // Ignore les erreurs de widgets de synthèse.
      }
    };

    loadSummary();
  }, [period]);

  const visibleRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return shipments;

    return shipments.filter((row) => {
      const text = [
        String(row.id || ''),
        row.clientName || '',
        row.productSummary || '',
        row.destination || '',
        row.statusLabel || '',
      ]
        .join(' ')
        .toLowerCase();

      return text.includes(q);
    });
  }, [shipments, search]);

  return (
    <VendorShell
      activeKey="shipping"
      title="Expéditions & livraisons"
      subtitle={`${counts.shipped} en transit · ${counts.pending} à préparer`}
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
                Rapport
              </button>
              <button
                type="button"
                className={[
                  'inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold',
                  darkMode
                    ? 'border-amber-600/40 bg-amber-500/10 text-amber-100'
                    : 'border-[#cfc6bd] bg-white text-[#2f2924]',
                ].join(' ')}
              >
                <Plus className="h-4 w-4" />
                Créer expédition
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <div className={['rounded-xl p-3', darkMode ? 'bg-[#1f120c]' : 'bg-[#ece7df]'].join(' ')}>
                <p className={['text-xs uppercase tracking-wide', darkMode ? 'text-amber-200/70' : 'text-[#6f655c]'].join(' ')}>À préparer</p>
                <p className={['text-3xl font-semibold', darkMode ? 'text-amber-50' : 'text-[#2f2924]'].join(' ')}>{counts.pending}</p>
                <p className="text-xs text-amber-700">Action rapide</p>
              </div>
              <div className={['rounded-xl p-3', darkMode ? 'bg-[#1f120c]' : 'bg-[#ece7df]'].join(' ')}>
                <p className={['text-xs uppercase tracking-wide', darkMode ? 'text-amber-200/70' : 'text-[#6f655c]'].join(' ')}>En transit</p>
                <p className={['text-3xl font-semibold', darkMode ? 'text-amber-50' : 'text-[#2f2924]'].join(' ')}>{counts.shipped}</p>
                <p className="text-xs text-[#7c4f2a]">Locaux + Intl</p>
              </div>
              <div className={['rounded-xl p-3', darkMode ? 'bg-[#1f120c]' : 'bg-[#ece7df]'].join(' ')}>
                <p className={['text-xs uppercase tracking-wide', darkMode ? 'text-amber-200/70' : 'text-[#6f655c]'].join(' ')}>En préparation</p>
                <p className={['text-3xl font-semibold', darkMode ? 'text-amber-50' : 'text-[#2f2924]'].join(' ')}>{counts.processing}</p>
                <p className="text-xs text-amber-700">À expédier</p>
              </div>
              <div className={['rounded-xl p-3', darkMode ? 'bg-[#1f120c]' : 'bg-[#ece7df]'].join(' ')}>
                <p className={['text-xs uppercase tracking-wide', darkMode ? 'text-amber-200/70' : 'text-[#6f655c]'].join(' ')}>Livrées</p>
                <p className={['text-3xl font-semibold', darkMode ? 'text-amber-50' : 'text-[#2f2924]'].join(' ')}>{counts.delivered}</p>
                <p className="text-xs text-green-700">Total période</p>
              </div>
            </div>
          </section>

          <section
            className={[
              'rounded-2xl border p-4 shadow-sm',
              darkMode ? 'border-amber-700/30 bg-[#2a160e]' : 'border-[#ddd4cb] bg-[#f8f4ef]',
            ].join(' ')}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className={['text-xl font-semibold', darkMode ? 'text-amber-100' : 'text-[#2f2924]'].join(' ')}>Partenaires logistiques</h3>
              <p className={darkMode ? 'text-sm text-amber-200/80' : 'text-sm text-[#6f655c]'}>Gérer mes partenaires</p>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                { name: 'DHL Express', zone: 'Europe · USA · Asie', price: 'À partir de 8 500 FCFA/kg' },
                { name: 'Chronopost Sénégal', zone: 'Afrique de l\'Ouest', price: 'À partir de 4 200 FCFA/kg' },
                { name: 'Yoboo Delivery', zone: 'Dakar & banlieue', price: '1 500 FCFA livraison fixe' },
                { name: 'Waxu Express', zone: 'Sénégal national', price: 'À partir de 2 000 FCFA' },
              ].map((partner) => (
                <article
                  key={partner.name}
                  className={[
                    'rounded-xl border p-3',
                    darkMode ? 'border-amber-700/30 bg-[#1f120c]' : 'border-[#d8cfc6] bg-[#f7f3ee]',
                  ].join(' ')}
                >
                  <p className={['font-semibold', darkMode ? 'text-amber-50' : 'text-[#2f2924]'].join(' ')}>{partner.name}</p>
                  <p className={darkMode ? 'text-sm text-amber-200/70' : 'text-sm text-[#6f655c]'}>{partner.zone}</p>
                  <p className={['mt-2 text-sm', darkMode ? 'text-amber-100' : 'text-[#5c544c]'].join(' ')}>{partner.price}</p>
                </article>
              ))}
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
                  placeholder="N° commande, destinataire..."
                  className={[
                    'w-full bg-transparent text-sm outline-none',
                    darkMode ? 'text-amber-50 placeholder:text-amber-200/50' : 'text-[#2f2924] placeholder:text-[#81776d]',
                  ].join(' ')}
                />
              </label>

              {[
                { key: 'all', label: `Toutes (${counts.all})` },
                { key: 'in_transit', label: `En cours (${counts.shipped})` },
                { key: 'delivered', label: `Livrées (${counts.delivered})` },
                { key: 'problem', label: `Problèmes (${counts.cancelled})` },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setStatusGroup(item.key);
                    setPage(1);
                  }}
                  className={[
                    'rounded-full border px-3 py-1.5 text-sm transition',
                    statusGroup === item.key
                      ? 'border-[#bb652f] bg-[#bb652f] text-white'
                      : darkMode
                        ? 'border-amber-700/40 bg-[#1f120c] text-amber-100'
                        : 'border-[#cfc6bd] bg-white text-[#544e47]',
                  ].join(' ')}
                >
                  {item.label}
                </button>
              ))}

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
                <option value="all">Toute période</option>
                <option value="month">Ce mois</option>
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
              <h3 className={['text-lg font-semibold', darkMode ? 'text-amber-100' : 'text-[#2f2924]'].join(' ')}>Suivi des expéditions</h3>
              <p className={darkMode ? 'text-sm text-amber-200/80' : 'text-sm text-[#6f655c]'}>
                {pagination.totalOrders} en suivi
              </p>
            </div>

            {loading ? (
              <p className={['px-4 py-6', darkMode ? 'text-amber-200/80' : 'text-[#7c4f2a]'].join(' ')}>Chargement des expéditions...</p>
            ) : visibleRows.length === 0 ? (
              <p className={['px-4 py-6', darkMode ? 'text-amber-200/80' : 'text-[#7c4f2a]'].join(' ')}>Aucune expédition trouvée.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className={darkMode ? 'text-amber-200/80' : 'text-[#6f655c]'}>
                      <th className="px-4 py-3 text-left">Colis / commande</th>
                      <th className="px-4 py-3 text-left">Destinataire</th>
                      <th className="px-4 py-3 text-left">Transporteur</th>
                      <th className="px-4 py-3 text-left">N° suivi</th>
                      <th className="px-4 py-3 text-left">Statut</th>
                      <th className="px-4 py-3 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleRows.map((row) => {
                      const carrier = carrierLabel(row.destination);
                      const tracking = `${carrier.slice(0, 3).toUpperCase()}-${row.id}`;
                      return (
                        <tr key={`${row.id}-${row.status}`} className={darkMode ? 'border-t border-amber-700/20' : 'border-t border-[#e5ddd5]'}>
                          <td className={['px-4 py-3 font-medium', darkMode ? 'text-amber-50' : 'text-[#2f2924]'].join(' ')}>
                            #{row.id}
                            <p className={darkMode ? 'text-xs font-normal text-amber-200/70' : 'text-xs font-normal text-[#6f655c]'}>{row.productSummary || row.productName}</p>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7a4067] text-xs font-semibold text-white">
                                {initials(row.clientName)}
                              </span>
                              <div>
                                <p className={darkMode ? 'text-amber-50' : 'text-[#2f2924]'}>{row.clientName}</p>
                                <p className={darkMode ? 'text-xs text-amber-200/70' : 'text-xs text-[#6f655c]'}>{row.destination || '-'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="rounded-md bg-[#e9e3dc] px-2 py-0.5 text-xs text-[#5c544c]">{carrier}</span>
                          </td>
                          <td className={darkMode ? 'px-4 py-3 text-amber-100' : 'px-4 py-3 text-[#5c544c]'}>{tracking}</td>
                          <td className="px-4 py-3">
                            <span
                              className={[
                                'rounded-full px-2.5 py-1 text-xs font-semibold',
                                row.status === 'delivered'
                                  ? 'bg-green-100 text-green-700'
                                  : row.status === 'cancelled'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-blue-100 text-blue-700',
                              ].join(' ')}
                            >
                              {row.statusLabel}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Link to={`/vendeur/orders/${row.id}`} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-dark">
                              Voir
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
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
