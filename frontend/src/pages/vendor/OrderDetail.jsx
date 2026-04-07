import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import VendorShell from '../../components/vendor/VendorShell';
import { vendorDashboardService } from '../../services/vendorDashboardService';

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function nextStatusOptions(status) {
  if (status === 'pending') return ['processing'];
  if (status === 'processing') return ['shipped'];
  if (status === 'shipped') return ['delivered'];
  return [];
}

function statusLabel(status) {
  if (status === 'pending') return 'En attente';
  if (status === 'processing') return 'Préparation';
  if (status === 'shipped') return 'Expédié';
  if (status === 'delivered') return 'Livré';
  if (status === 'cancelled') return 'Annulé';
  if (status === 'refunded') return 'Remboursé';
  return status || '-';
}

function paymentStatusLabel(status) {
  if (status === 'pending') return 'En attente';
  if (status === 'completed') return 'Payé';
  if (status === 'failed') return 'Échoué';
  if (status === 'refunded') return 'Remboursé';
  return status || '-';
}

function shippingMethodLabel(method) {
  if (method === 'standard') return 'Standard';
  if (method === 'express') return 'Express';
  if (method === 'pickup') return 'Retrait sur place';
  return method || '-';
}

export default function VendorOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingTracking, setSavingTracking] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [trackingInput, setTrackingInput] = useState('');
  const [pendingOrders, setPendingOrders] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const [detailResponse, statsResponse] = await Promise.all([
          vendorDashboardService.getVendorOrderDetail(id),
          vendorDashboardService.getStats({ period: 'all' }),
        ]);

        setOrder(detailResponse?.data || null);
        setSelectedStatus('');
        setTrackingInput(detailResponse?.data?.tracking_number || '');
        setPendingOrders(Number(statsResponse?.data?.notifications?.pendingOrders || 0));
        setError('');
      } catch (err) {
        setError(err?.message || 'Impossible de charger le détail de la commande.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const getErrorMessage = (err, fallback) => {
    if (err?.message) return err.message;
    if (err?.errors && typeof err.errors === 'object') {
      const first = Object.values(err.errors)[0];
      if (Array.isArray(first) && first[0]) return first[0];
    }
    return fallback;
  };

  const handleStatusUpdate = async () => {
    if (!selectedStatus) {
      setActionError('Choisis un statut cible.');
      return;
    }

    try {
      setSavingStatus(true);
      setActionError('');
      setActionSuccess('');
      const response = await vendorDashboardService.updateVendorOrderStatus(id, selectedStatus);
      const updated = response?.data || null;
      if (updated) {
        setOrder(updated);
        setTrackingInput(updated.tracking_number || '');
      }
      setSelectedStatus('');
      setActionSuccess('Statut de la commande mis à jour.');
    } catch (err) {
      setActionError(getErrorMessage(err, 'Impossible de mettre à jour le statut.'));
    } finally {
      setSavingStatus(false);
    }
  };

  const handleTrackingUpdate = async () => {
    if (!trackingInput.trim()) {
      setActionError('Le numéro de suivi est requis.');
      return;
    }

    try {
      setSavingTracking(true);
      setActionError('');
      setActionSuccess('');
      const response = await vendorDashboardService.updateVendorOrderTracking(id, trackingInput.trim());
      const updated = response?.data || null;
      if (updated) {
        setOrder(updated);
        setTrackingInput(updated.tracking_number || trackingInput.trim());
      }
      setActionSuccess('Numéro de suivi mis à jour.');
    } catch (err) {
      setActionError(getErrorMessage(err, 'Impossible de mettre à jour le suivi.'));
    } finally {
      setSavingTracking(false);
    }
  };

  return (
    <VendorShell
      activeKey="orders"
      title={`Commande #${id}`}
      subtitle="Détail complet de la commande vendeur"
      pendingOrders={pendingOrders}
    >
      {({ darkMode }) => (
        <div className="space-y-4">
          <Link to="/vendeur/orders" className="inline-flex rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-dark">
            Retour aux commandes
          </Link>

          {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          {actionError && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{actionError}</div>}
          {actionSuccess && <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{actionSuccess}</div>}

          {loading ? (
            <div className={[
              'rounded-2xl border p-5',
              darkMode ? 'border-amber-700/30 bg-[#2a160e] text-amber-100' : 'border-amber-100 bg-white text-[#2b1308]',
            ].join(' ')}>
              Chargement...
            </div>
          ) : !order ? (
            <div className={[
              'rounded-2xl border p-5',
              darkMode ? 'border-amber-700/30 bg-[#2a160e] text-amber-100' : 'border-amber-100 bg-white text-[#2b1308]',
            ].join(' ')}>
              Commande introuvable.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <section className={[
                  'rounded-2xl border p-5 shadow-sm lg:col-span-2',
                  darkMode ? 'border-amber-700/30 bg-[#2a160e]' : 'border-amber-100 bg-white',
                ].join(' ')}>
                  <h2 className={['mb-4 text-lg font-semibold', darkMode ? 'text-amber-100' : 'text-[#2b1308]'].join(' ')}>
                    Produits de cette commande
                  </h2>

                  <div className="space-y-3">
                    {(order.items || []).map((item) => (
                      <article key={item.id} className={[
                        'flex flex-col justify-between gap-3 rounded-lg border p-3 md:flex-row md:items-center',
                        darkMode ? 'border-amber-700/20 bg-[#1f120c]' : 'border-amber-100 bg-amber-50/30',
                      ].join(' ')}>
                        <div>
                          <p className={['font-semibold', darkMode ? 'text-amber-50' : 'text-[#2b1308]'].join(' ')}>{item.product_name}</p>
                          <p className={darkMode ? 'text-sm text-amber-200/80' : 'text-sm text-[#7c4f2a]'}>
                            Quantité: {item.quantity} • Prix unitaire: {Number(item.price || 0).toLocaleString('fr-FR')} FCFA
                          </p>
                        </div>
                        <p className={['text-sm font-semibold', darkMode ? 'text-amber-100' : 'text-[#2b1308]'].join(' ')}>
                          {Number(item.subtotal || 0).toLocaleString('fr-FR')} FCFA
                        </p>
                      </article>
                    ))}
                  </div>
                </section>

                <section className={[
                  'rounded-2xl border p-5 shadow-sm',
                  darkMode ? 'border-amber-700/30 bg-[#2a160e]' : 'border-amber-100 bg-white',
                ].join(' ')}>
                  <h2 className={['mb-4 text-lg font-semibold', darkMode ? 'text-amber-100' : 'text-[#2b1308]'].join(' ')}>
                    Résumé vendeur
                  </h2>

                  <div className="space-y-2 text-sm">
                    <p className={darkMode ? 'text-amber-200/80' : 'text-[#7c4f2a]'}>Numéro: <span className={darkMode ? 'text-amber-50' : 'text-[#2b1308]'}>{order.order_number}</span></p>
                    <p className={darkMode ? 'text-amber-200/80' : 'text-[#7c4f2a]'}>Statut: <span className={darkMode ? 'text-amber-50' : 'text-[#2b1308]'}>{statusLabel(order.status)}</span></p>
                    <p className={darkMode ? 'text-amber-200/80' : 'text-[#7c4f2a]'}>Créée: <span className={darkMode ? 'text-amber-50' : 'text-[#2b1308]'}>{formatDate(order.created_at)}</span></p>
                    <p className={darkMode ? 'text-amber-200/80' : 'text-[#7c4f2a]'}>Total vendeur: <span className={darkMode ? 'text-amber-50' : 'text-[#2b1308]'}>{Number(order.summary?.vendor_subtotal || 0).toLocaleString('fr-FR')} FCFA</span></p>
                    <p className={darkMode ? 'text-amber-200/80' : 'text-[#7c4f2a]'}>Articles: <span className={darkMode ? 'text-amber-50' : 'text-[#2b1308]'}>{order.summary?.total_items || 0}</span></p>
                  </div>
                </section>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <section className={[
                  'rounded-2xl border p-5 shadow-sm',
                  darkMode ? 'border-amber-700/30 bg-[#2a160e]' : 'border-amber-100 bg-white',
                ].join(' ')}>
                  <h3 className={['mb-3 text-base font-semibold', darkMode ? 'text-amber-100' : 'text-[#2b1308]'].join(' ')}>
                    Informations client
                  </h3>
                  <p className={darkMode ? 'text-amber-200/80' : 'text-[#7c4f2a]'}>Nom: <span className={darkMode ? 'text-amber-50' : 'text-[#2b1308]'}>{order.customer?.name || '-'}</span></p>
                  <p className={darkMode ? 'text-amber-200/80' : 'text-[#7c4f2a]'}>Email: <span className={darkMode ? 'text-amber-50' : 'text-[#2b1308]'}>{order.customer?.email || '-'}</span></p>
                  <p className={darkMode ? 'text-amber-200/80' : 'text-[#7c4f2a]'}>Téléphone: <span className={darkMode ? 'text-amber-50' : 'text-[#2b1308]'}>{order.customer?.phone || '-'}</span></p>
                  <p className={darkMode ? 'text-amber-200/80 mt-2' : 'text-[#7c4f2a] mt-2'}>Adresse: <span className={darkMode ? 'text-amber-50' : 'text-[#2b1308]'}>{order.shipping_address || '-'}</span></p>
                </section>

                <section className={[
                  'rounded-2xl border p-5 shadow-sm',
                  darkMode ? 'border-amber-700/30 bg-[#2a160e]' : 'border-amber-100 bg-white',
                ].join(' ')}>
                  <h3 className={['mb-3 text-base font-semibold', darkMode ? 'text-amber-100' : 'text-[#2b1308]'].join(' ')}>
                    Paiement & livraison
                  </h3>
                  <p className={darkMode ? 'text-amber-200/80' : 'text-[#7c4f2a]'}>Méthode paiement: <span className={darkMode ? 'text-amber-50' : 'text-[#2b1308]'}>{order.payment?.method || '-'}</span></p>
                  <p className={darkMode ? 'text-amber-200/80' : 'text-[#7c4f2a]'}>Statut paiement: <span className={darkMode ? 'text-amber-50' : 'text-[#2b1308]'}>{paymentStatusLabel(order.payment?.status)}</span></p>
                  <p className={darkMode ? 'text-amber-200/80' : 'text-[#7c4f2a]'}>Payé le: <span className={darkMode ? 'text-amber-50' : 'text-[#2b1308]'}>{formatDate(order.payment?.paid_at)}</span></p>
                  <p className={darkMode ? 'text-amber-200/80' : 'text-[#7c4f2a]'}>Méthode livraison: <span className={darkMode ? 'text-amber-50' : 'text-[#2b1308]'}>{shippingMethodLabel(order.shipping_method)}</span></p>
                  <p className={darkMode ? 'text-amber-200/80' : 'text-[#7c4f2a]'}>Suivi: <span className={darkMode ? 'text-amber-50' : 'text-[#2b1308]'}>{order.tracking_number || '-'}</span></p>
                  {order.notes && (
                    <p className={darkMode ? 'text-amber-200/80 mt-2' : 'text-[#7c4f2a] mt-2'}>Note: <span className={darkMode ? 'text-amber-50' : 'text-[#2b1308]'}>{order.notes}</span></p>
                  )}

                  {!['cancelled', 'refunded'].includes(order.status) && (
                    <div className="mt-4 space-y-3">
                      <div>
                        <p className={darkMode ? 'mb-1 text-xs text-amber-200/70' : 'mb-1 text-xs text-[#7c4f2a]'}>Faire avancer le statut</p>
                        <div className="flex items-center gap-2">
                          <select
                            value={selectedStatus}
                            onChange={(event) => setSelectedStatus(event.target.value)}
                            className={[
                              'rounded-lg border px-2.5 py-1.5 text-xs',
                              darkMode
                                ? 'border-amber-700/40 bg-[#1f120c] text-amber-50'
                                : 'border-amber-200 bg-white text-[#2b1308]',
                            ].join(' ')}
                          >
                            <option value="">Choisir...</option>
                            {nextStatusOptions(order.status).map((status) => (
                              <option key={status} value={status}>
                                {statusLabel(status)}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={handleStatusUpdate}
                            disabled={savingStatus || nextStatusOptions(order.status).length === 0}
                            className="rounded-lg bg-primary px-2.5 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
                          >
                            {savingStatus ? 'Mise à jour...' : 'Mettre à jour'}
                          </button>
                        </div>
                      </div>

                      <div>
                        <p className={darkMode ? 'mb-1 text-xs text-amber-200/70' : 'mb-1 text-xs text-[#7c4f2a]'}>Numéro de suivi</p>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={trackingInput}
                            onChange={(event) => setTrackingInput(event.target.value)}
                            placeholder="Ex: DHL-99887766"
                            className={[
                              'w-full rounded-lg border px-2.5 py-1.5 text-xs',
                              darkMode
                                ? 'border-amber-700/40 bg-[#1f120c] text-amber-50'
                                : 'border-amber-200 bg-white text-[#2b1308]',
                            ].join(' ')}
                          />
                          <button
                            type="button"
                            onClick={handleTrackingUpdate}
                            disabled={savingTracking || ['delivered', 'cancelled', 'refunded'].includes(order.status)}
                            className="rounded-lg bg-amber-700 px-2.5 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
                          >
                            {savingTracking ? 'Sauvegarde...' : 'Sauver'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </section>
              </div>
            </>
          )}
        </div>
      )}
    </VendorShell>
  );
}
