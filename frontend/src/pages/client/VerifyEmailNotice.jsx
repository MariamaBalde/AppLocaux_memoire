import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Button from '../../components/common/Button';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';

function getErrorMessage(error, fallback = 'Impossible de renvoyer l email') {
  if (!error) return fallback;
  if (typeof error === 'string') return error;
  if (typeof error.message === 'string') return error.message;
  if (error.errors && typeof error.errors === 'object') {
    const first = Object.values(error.errors)[0];
    if (Array.isArray(first) && first[0]) return String(first[0]);
  }
  return fallback;
}

export default function VerifyEmailNotice() {
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    if (loading) return;
    try {
      setLoading(true);
      await authService.resendVerification();
      toast.success('Email de vérification renvoyé');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 px-4 py-10">
        <div className="mx-auto max-w-xl rounded-xl bg-white p-6 shadow">
          <h1 className="mb-2 text-2xl font-bold">Vérifiez votre email</h1>
          <p className="text-sm text-gray-700">
            Votre compte est créé, mais vous devez cliquer sur le lien reçu par email avant de continuer.
          </p>

          <div className="mt-6">
            <Button type="button" onClick={handleResend} loading={loading}>
              Renvoyer l email de vérification
            </Button>
          </div>

          <div className="mt-5 text-sm">
            <Link to="/login" className="text-primary hover:underline">
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

