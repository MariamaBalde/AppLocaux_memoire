import { useEffect, useState } from 'react';
import VendorShell from '../../components/vendor/VendorShell';
import { authService } from '../../services/authService';
import { vendorDashboardService } from '../../services/vendorDashboardService';

export default function VendorShopProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingOrders, setPendingOrders] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [user, stats] = await Promise.all([
          authService.getProfile(),
          vendorDashboardService.getStats({ period: 'all' }),
        ]);

        setProfile(user);
        setPendingOrders(Number(stats?.data?.notifications?.pendingOrders || 0));
        setError('');
      } catch (err) {
        setError(err?.message || 'Impossible de charger le profil boutique.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <VendorShell activeKey="shop" title="Profil boutique" subtitle="Informations du compte vendeur" pendingOrders={pendingOrders}>
      {({ darkMode }) => (
        <div className={[
          'rounded-2xl border p-5 shadow-sm',
          darkMode ? 'border-amber-700/30 bg-[#2a160e]' : 'border-amber-100 bg-white',
        ].join(' ')}>
          {error && <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

          {loading ? (
            <p className={darkMode ? 'text-amber-200/80' : 'text-[#7c4f2a]'}>Chargement du profil...</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <p className={darkMode ? 'text-amber-200/80' : 'text-[#7c4f2a]'}>Nom: <span className={darkMode ? 'text-amber-50' : 'text-[#2b1308]'}>{profile?.name || '-'}</span></p>
              <p className={darkMode ? 'text-amber-200/80' : 'text-[#7c4f2a]'}>Email: <span className={darkMode ? 'text-amber-50' : 'text-[#2b1308]'}>{profile?.email || '-'}</span></p>
              <p className={darkMode ? 'text-amber-200/80' : 'text-[#7c4f2a]'}>Téléphone: <span className={darkMode ? 'text-amber-50' : 'text-[#2b1308]'}>{profile?.phone || '-'}</span></p>
              <p className={darkMode ? 'text-amber-200/80' : 'text-[#7c4f2a]'}>Pays: <span className={darkMode ? 'text-amber-50' : 'text-[#2b1308]'}>{profile?.country || '-'}</span></p>
              <p className={darkMode ? 'text-amber-200/80 md:col-span-2' : 'text-[#7c4f2a] md:col-span-2'}>Adresse: <span className={darkMode ? 'text-amber-50' : 'text-[#2b1308]'}>{profile?.address || '-'}</span></p>
            </div>
          )}
        </div>
      )}
    </VendorShell>
  );
}
