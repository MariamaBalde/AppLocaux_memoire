import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Button from '../../components/common/Button';

export default function CheckoutPayment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [seconds, setSeconds] = useState(5);

  const orderId = searchParams.get('order_id');
  const paymentUrl = searchParams.get('payment_url');

  useEffect(() => {
    if (!paymentUrl) return;
    const timeout = setTimeout(() => {
      window.location.assign(paymentUrl);
    }, 800);
    return () => clearTimeout(timeout);
  }, [paymentUrl]);

  useEffect(() => {
    if (!paymentUrl) return undefined;
    const interval = setInterval(() => {
      setSeconds((value) => (value <= 1 ? 1 : value - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [paymentUrl]);

  if (!orderId) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-100 px-4 py-10">
          <div className="mx-auto max-w-xl rounded-xl bg-white p-6 shadow">
            <p className="text-red-700">Commande introuvable pour le paiement.</p>
            <div className="mt-4">
              <Link className="text-primary hover:underline" to="/orders">
                Aller à mes commandes
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 px-4 py-10">
        <div className="mx-auto max-w-xl rounded-xl bg-white p-6 shadow">
          <h1 className="mb-3 text-2xl font-bold">Redirection vers le paiement</h1>
          <p className="text-sm text-gray-700">
            Commande #{orderId}. Vous allez être redirigé automatiquement.
          </p>

          {paymentUrl ? (
            <p className="mt-4 text-sm text-gray-600">Redirection dans {seconds}s...</p>
          ) : (
            <p className="mt-4 text-sm text-red-700">
              URL de paiement indisponible. Vous pouvez ouvrir votre commande manuellement.
            </p>
          )}

          <div className="mt-6 flex gap-3">
            {paymentUrl && (
              <Button type="button" onClick={() => window.location.assign(paymentUrl)}>
                Payer maintenant
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => navigate(`/orders/${orderId}`)}>
              Voir la commande
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

