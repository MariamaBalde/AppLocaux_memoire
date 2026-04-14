import { useEffect, useState } from 'react';
import VendorShell from '../../components/vendor/VendorShell';
import Charts from '../../components/vendor/Charts';
import { vendorDashboardService } from '../../services/vendorDashboardService';

export default function VendorStatistics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await vendorDashboardService.getDashboardData({ period: 'all', status: 'all' });
        setData(response);
        setError('');
      } catch (err) {
        setError(err?.message || 'Impossible de charger les statistiques.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <VendorShell activeKey="stats" title="Statistiques" subtitle="Analyse des ventes et destinations" pendingOrders={Number(data?.notifications?.pendingOrders || 0)}>
      {({ darkMode }) => (
        <div className="space-y-4">
          {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

          {loading ? (
            <div className={[
              'rounded-2xl border p-5',
              darkMode ? 'border-amber-700/30 bg-[#2a160e] text-amber-100' : 'border-amber-100 bg-white text-[#2b1308]',
            ].join(' ')}>
              Chargement des graphiques...
            </div>
          ) : (
            <Charts
              weeklyRevenue={data?.weeklyRevenue || []}
              destinations={data?.destinations || { total: 0, items: [] }}
              darkMode={darkMode}
            />
          )}
        </div>
      )}
    </VendorShell>
  );
}
