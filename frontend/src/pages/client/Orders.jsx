import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { vendorDashboardService } from '../../services/vendorDashboardService';
import { authService } from '../../services/authService';
import Navbar from '../../components/common/Navbar';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import PriceTag from '../../components/common/PriceTag';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, completed, cancelled
  const currentUser = authService.getCurrentUser();
  const isVendor = (currentUser?.role || '').toLowerCase() === 'vendeur';

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);

      let orderList = [];

      if (isVendor) {
        const vendorResponse = await vendorDashboardService.getRecentOrders({
          period: 'all',
          status: filter,
          page: 1,
          per_page: 100,
        });

        const vendorPayload = vendorResponse?.data || [];
        orderList = Array.isArray(vendorPayload) ? vendorPayload : [];
      } else {
        const params = filter !== 'all' ? { status: filter } : {};
        const response = await orderService.getOrders(params);
        const payload = response?.data || response;
        orderList = Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : []);
      }

      setOrders(orderList);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des commandes');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'En attente' },
      processing: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'En traitement' },
      shipped: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Expédié' },
      delivered: { bg: 'bg-green-100', text: 'text-green-800', label: 'Livré' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Annulé' },
    };
    return statusMap[status] || statusMap.pending;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">{isVendor ? 'Commandes reçues' : 'Mes Commandes'}</h1>

          {/* Filtres */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex gap-3 flex-wrap">
              {[
                { value: 'all', label: 'Toutes' },
                { value: 'pending', label: 'En attente' },
                { value: 'processing', label: 'En cours' },
                { value: 'shipped', label: 'Expédié' },
                { value: 'delivered', label: 'Livré' },
                { value: 'cancelled', label: 'Annulé' },
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value)}
                  className={`px-4 py-2 rounded font-semibold transition ${
                    filter === option.value
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Commandes */}
          {isLoading ? (
            <Loading message="Chargement de vos commandes..." />
          ) : error ? (
            <ErrorMessage message={error} onRetry={fetchOrders} />
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <p className="text-4xl mb-4">📦</p>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Aucune commande
              </h2>
              <p className="text-gray-600 mb-8">
                {isVendor ? 'Vous n’avez pas encore reçu de commande' : 'Vous n\'avez pas encore passé de commande'}
              </p>
              <Link
                to={isVendor ? '/vendeur/products' : '/products'}
                className="inline-block bg-primary text-white px-8 py-3 rounded-lg hover:bg-opacity-90 transition font-semibold"
              >
                {isVendor ? 'Gérer mes produits' : 'Commencer à acheter'}
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => {
                const status = getStatusBadge(order.status);
                const createdAt = order.created_at || order.createdAt;
                const amount = Number(order.total ?? order.amount ?? 0);
                const itemsCount = order.items_count || order.items?.length || 0;
                const shippingAddress = order.shipping_address || order.shippingAddress;

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      {/* Info principale */}
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold">
                            Commande #{order.id}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${status.bg} ${status.text}`}>
                            {status.label}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm">
                          {formatDate(createdAt)}
                        </p>
                      </div>

                      {/* Montant */}
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          <PriceTag amount={amount} />
                        </p>
                        <p className="text-gray-600 text-sm">
                          {itemsCount} article{(itemsCount !== 1 ? 's' : '')}
                        </p>
                      </div>

                      {/* Boutons */}
                      {!isVendor && (
                        <div>
                          <Link
                            to={`/orders/${order.id}`}
                            className="inline-block bg-primary text-white px-6 py-2 rounded hover:bg-opacity-90 transition"
                          >
                            Détails
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Adresse de livraison */}
                    {shippingAddress && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-gray-600">
                          📍 {shippingAddress}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
