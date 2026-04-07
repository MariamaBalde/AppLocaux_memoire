import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import PriceTag from '../../components/common/PriceTag';

export default function OrderConfirmation() {
  const location = useLocation();
  const order = location.state?.order || null;

  if (!order) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <p>Redirection...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-12">
          {/* Success Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 text-center mb-8">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Commande confirmée!
            </h1>
            <p className="text-gray-600 mb-6">
              Merci pour votre achat. Vous recevrez un email de confirmation sous peu.
            </p>
            <p className="text-2xl font-bold text-primary mb-8">
              <PriceTag amount={order.total_amount} />
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
                  <PriceTag amount={order.total_amount} />
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
                {order.items?.map((item, index) => (
                  <div key={index} className="flex justify-between text-gray-700">
                    <span>{item.name} × {item.quantity}</span>
                    <span className="font-semibold">
                      <PriceTag amount={item.price * item.quantity} />
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Livraison */}
            <div className="border-t mt-6 pt-6">
              <h3 className="font-semibold mb-4">Adresse de livraison</h3>
              <p className="text-gray-700">{order.customer_name}</p>
              <p className="text-gray-700">{order.shipping_address}</p>
              <p className="text-gray-700">{order.customer_phone}</p>
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
