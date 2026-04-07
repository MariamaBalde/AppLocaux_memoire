import { useEffect, useState } from 'react';
import VendorShell from '../../components/vendor/VendorShell';
import TopProducts from '../../components/vendor/TopProducts';
import { vendorDashboardService } from '../../services/vendorDashboardService';

export default function VendorRevenue() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await vendorDashboardService.getDashboardData({ period: 'month', status: 'all' });
        setData(response);
        setError('');
      } catch (err) {
        setError(err?.message || 'Impossible de charger les revenus.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <VendorShell activeKey="revenue" title="Revenus" subtitle="Performance financière" pendingOrders={Number(data?.notifications?.pendingOrders || 0)}>
      {({ darkMode }) => (
        <div className="space-y-4">
          {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { label: 'Revenus du mois', value: data?.stats?.monthlyRevenue || 0 },
              { label: 'Commandes traitées', value: data?.stats?.ordersCount || 0 },
              { label: 'Produits actifs', value: data?.stats?.activeProducts || 0 },
            ].map((card) => (
              <article key={card.label} className={[
                'rounded-2xl border p-4 shadow-sm',
                darkMode ? 'border-amber-700/30 bg-[#2a160e] text-amber-100' : 'border-amber-100 bg-white text-[#2b1308]',
              ].join(' ')}>
                <p className={darkMode ? 'text-amber-200/70 text-sm' : 'text-[#7c4f2a] text-sm'}>{card.label}</p>
                <p className="mt-1 text-3xl font-semibold">{loading ? '...' : Number(card.value).toLocaleString('fr-FR')}</p>
              </article>
            ))}
          </div>

          <TopProducts products={data?.topProducts || []} darkMode={darkMode} />
        </div>
      )}
    </VendorShell>
  );
}
