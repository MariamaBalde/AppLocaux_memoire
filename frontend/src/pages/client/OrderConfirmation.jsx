import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import PriceTag from '../../components/common/PriceTag';
import { orderService } from '../../services/orderService';

export default function OrderConfirmation() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order);

  useEffect(() => {
    const loadOrder = async () => {
      if (order || !id) return;

      try {
        setLoading(true);
        const response = await orderService.getOrder(id);
        setOrder(response?.data || response || null);
      } catch {
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id, order]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <p>Chargement...</p>
        </div>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
          <div className="max-w-md rounded-lg bg-white p-6 text-center shadow">
            <p className="mb-4 text-gray-700">Commande introuvable.</p>
            <button
              type="button"
              onClick={() => navigate('/orders')}
              className="rounded bg-primary px-4 py-2 font-semibold text-white"
            >
              Retour à mes commandes
            </button>
          </div>
        </div>
      </>
    );
  }

  const totalAmount = Number(order.total ?? order.total_amount ?? 0);
  const items = Array.isArray(order.items) ? order.items : [];
  const paymentStatusParam = searchParams.get('payment_status') || searchParams.get('status');
  const hasFailedPayment = paymentStatusParam === 'failed' || paymentStatusParam === 'cancelled';

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-12">
          {/* Success Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 text-center mb-8">
            <div className="text-6xl mb-4">{hasFailedPayment ? '❌' : '✅'}</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {hasFailedPayment ? 'Paiement échoué' : 'Commande confirmée!'}
            </h1>
            <p className="text-gray-600 mb-6">
              {hasFailedPayment
                ? 'Votre commande est créée, mais le paiement a échoué. Vous pouvez réessayer depuis le détail de commande.'
                : 'Merci pour votre achat. Vous recevrez un email de confirmation sous peu.'}
            </p>
            <p className="text-2xl font-bold text-primary mb-8">
              <PriceTag amount={totalAmount} />
            </p>
          </div>

          {/* Commande Details */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Détails de la commande</h2>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-gray-600 mb-1">Numéro de commande</p>
                <p className="font-bold">#{order.id}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Date</p>
                <p className="font-bold">
                  {new Date(order.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Montant</p>
                <p className="font-bold">
                  <PriceTag amount={totalAmount} />
                </p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Statut</p>
                <p className="font-bold text-primary">En traitement</p>
              </div>
            </div>

            {/* Produits */}
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">Produits commandés</h3>
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="flex justify-between text-gray-700">
                    <span>{item.product?.name || item.name || 'Produit'} × {item.quantity}</span>
                    <span className="font-semibold">
                      <PriceTag amount={Number(item.subtotal || (item.price * item.quantity) || 0)} />
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Livraison */}
            <div className="border-t mt-6 pt-6">
              <h3 className="font-semibold mb-4">Adresse de livraison</h3>
              <p className="text-gray-700">{order.user?.name || order.customer_name || '-'}</p>
              <p className="text-gray-700">{order.shipping_address}</p>
              <p className="text-gray-700">{order.user?.phone || order.customer_phone || '-'}</p>
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded mb-8">
            <h3 className="font-semibold text-blue-900 mb-2">📋 Prochaines étapes</h3>
            <ul className="text-blue-800 space-y-2">
              <li>✓ Confirmation par email</li>
              <li>• Préparation de votre commande</li>
              <li>• Notif d'expédition</li>
              <li>• Livraison à votre adresse</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-4 flex-col md:flex-row">
            <Link
              to="/orders"
              className="flex-1 bg-primary text-white px-6 py-3 rounded-lg text-center font-semibold hover:bg-opacity-90 transition"
            >
              Mes commandes
            </Link>
            <Link
              to="/products"
              className="flex-1 bg-secondary text-white px-6 py-3 rounded-lg text-center font-semibold hover:bg-opacity-90 transition"
            >
              Continuer les achats
            </Link>
            <Link
              to="/"
              className="flex-1 border-2 border-primary text-primary px-6 py-3 rounded-lg text-center font-semibold hover:bg-gray-50 transition"
            >
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
