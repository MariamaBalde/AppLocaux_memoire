import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import Navbar from '../../components/common/Navbar';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import Button from '../../components/common/Button';
import PriceTag from '../../components/common/PriceTag';
import fallbackProductImage from '../../assets/home/product-bottles-display.jpg';
import { resolveImageUrl } from '../../utils/imageUrl';

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trackingInfo, setTrackingInfo] = useState(null);

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchOrder = async () => {
    try {
      setIsLoading(true);
      const response = await orderService.getOrder(id);
      setOrder(response.data || response);

      // Fetch tracking info
      try {
        const tracking = await orderService.getTrackingInfo(id);
        setTrackingInfo(tracking.data || tracking);
      } catch (err) {
        console.log('Pas d\'info de suivi disponible');
      }

      setError(null);
    } catch (err) {
      setError('Commande non trouvée');
      console.error(err);
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

  if (isLoading) return (
    <>
      <Navbar />
      <Loading message="Chargement de la commande..." />
    </>
  );

  if (error) return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ErrorMessage message={error} onRetry={fetchOrder} />
      </div>
    </>
  );

  if (!order) return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-center text-gray-600">Commande non trouvée</p>
      </div>
    </>
  );

  const status = getStatusBadge(order.status);
  const items = Array.isArray(order.items) ? order.items : [];
  const subtotal = items.reduce((sum, item) => sum + (Number(item.subtotal) || (Number(item.price) * Number(item.quantity))), 0);

  const handleCancelOrder = async () => {
    try {
      await orderService.cancelOrder(order.id);
      await fetchOrder();
    } catch (err) {
      setError('Impossible d\'annuler la commande');
      console.error(err);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Bouton retour */}
          <button
            onClick={() => navigate('/orders')}
            className="mb-6 flex items-center gap-2 text-primary hover:underline"
          >
            ← Retour à mes commandes
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Détails */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">
                      Commande #{order.id}
                    </h1>
                    <p className="text-gray-600">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  <span className={`px-4 py-2 rounded-lg text-sm font-bold ${status.bg} ${status.text}`}>
                    {status.label}
                  </span>
                </div>
              </div>

              {/* Timeline/Statut */}
              {trackingInfo && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-bold mb-6">Suivi de la commande</h3>
                  <div className="space-y-4">
                    {trackingInfo.events?.map((event, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-4 h-4 rounded-full ${event.completed ? 'bg-success' : 'bg-gray-300'}`} />
                          {index < trackingInfo.events?.length - 1 && (
                            <div className="w-1 h-12 bg-gray-300" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold">{event.name}</p>
                          <p className="text-sm text-gray-600">{formatDate(event.date)}</p>
                          {event.description && (
                            <p className="text-sm text-gray-600">{event.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Produits */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4">Produits commandés</h3>
                <div className="space-y-4">
                  {order.items?.map((item, index) => (
                    <div key={index} className="flex gap-4 pb-4 border-b last:border-b-0">
                      <img
                        src={resolveImageUrl(
                          (Array.isArray(item.product?.images) && item.product.images[0]) || item.product?.image,
                          fallbackProductImage
                        )}
                        alt={item.product?.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-grow">
                        <h4 className="font-semibold">{item.product?.name}</h4>
                        <p className="text-sm text-gray-600">Quantité: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          <PriceTag amount={item.price * item.quantity} />
                        </p>
                        <p className="text-sm text-gray-600">
                          <PriceTag amount={item.price} /> × {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Informations client */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4">Informations de livraison</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Numéro commande</p>
                    <p className="font-semibold">{order.order_number || `#${order.id}`}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Méthode livraison</p>
                    <p className="font-semibold capitalize">{order.shipping_method || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Paiement</p>
                    <p className="font-semibold capitalize">{order.payment?.method || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Adresse</p>
                    <p className="font-semibold">{order.shipping_address}</p>
                  </div>
                </div>
                {order.notes && (
                  <div className="mt-4">
                    <p className="text-gray-600 text-sm mb-1">Notes</p>
                    <p className="font-semibold">{order.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Résumé */}
            <div>
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-20">
                <h3 className="text-xl font-bold mb-6">Résumé</h3>

                <div className="space-y-3 mb-6 pb-6 border-b">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sous-total</span>
                    <span className="font-semibold">
                      <PriceTag amount={Number(subtotal || 0)} />
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Livraison</span>
                    <span className="font-semibold">
                      <PriceTag amount={Number(order.shipping_cost || 0)} />
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">
                      <PriceTag amount={Number(order.total || 0)} />
                    </span>
                  </div>
                </div>

                {/* Paiement */}
                <div className="p-4 bg-gray-50 rounded-lg mb-6">
                  <p className="text-sm text-gray-600 mb-1">Méthode de paiement</p>
                  <p className="font-semibold capitalize">
                    {order.payment?.method || '-'}
                  </p>
                </div>

                {/* Boutons */}
                <div className="space-y-3">
                  {order.status !== 'cancelled' && (
                    <Button
                      variant="outline"
                      size="lg"
                      fullWidth
                    >
                      Télécharger la facture
                    </Button>
                  )}
                  {order.status === 'pending' && (
                    <Button
                      onClick={handleCancelOrder}
                      variant="danger"
                      size="lg"
                      fullWidth
                    >
                      Annuler la commande
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
