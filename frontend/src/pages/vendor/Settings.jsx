import { useEffect, useState } from 'react';
import VendorShell from '../../components/vendor/VendorShell';
import { vendorDashboardService } from '../../services/vendorDashboardService';

export default function VendorSettings() {
  const [pendingOrders, setPendingOrders] = useState(0);
  const [emailAlerts, setEmailAlerts] = useState(() => localStorage.getItem('vendor-email-alerts') !== 'off');
  const [smsAlerts, setSmsAlerts] = useState(() => localStorage.getItem('vendor-sms-alerts') === 'on');

  useEffect(() => {
    vendorDashboardService.getStats({ period: 'all' })
      .then((response) => setPendingOrders(Number(response?.data?.notifications?.pendingOrders || 0)))
      .catch(() => setPendingOrders(0));
  }, []);

  useEffect(() => {
    localStorage.setItem('vendor-email-alerts', emailAlerts ? 'on' : 'off');
  }, [emailAlerts]);

  useEffect(() => {
    localStorage.setItem('vendor-sms-alerts', smsAlerts ? 'on' : 'off');
  }, [smsAlerts]);

  return (
    <VendorShell activeKey="settings" title="Paramètres" subtitle="Préférences vendeur" pendingOrders={pendingOrders}>
      {({ darkMode }) => (
        <div className={[
          'rounded-2xl border p-5 shadow-sm space-y-4',
          darkMode ? 'border-amber-700/30 bg-[#2a160e]' : 'border-amber-100 bg-white',
        ].join(' ')}>
          <label className="flex items-center justify-between gap-3">
            <span className={darkMode ? 'text-amber-100' : 'text-[#2b1308]'}>Notifications email</span>
            <input type="checkbox" checked={emailAlerts} onChange={(e) => setEmailAlerts(e.target.checked)} />
          </label>

          <label className="flex items-center justify-between gap-3">
            <span className={darkMode ? 'text-amber-100' : 'text-[#2b1308]'}>Notifications SMS</span>
            <input type="checkbox" checked={smsAlerts} onChange={(e) => setSmsAlerts(e.target.checked)} />
          </label>

          <p className={darkMode ? 'text-amber-200/70 text-sm' : 'text-[#7c4f2a] text-sm'}>
            Ces paramètres sont sauvegardés localement sur ce navigateur.
          </p>
        </div>
      )}
    </VendorShell>
  );
}
