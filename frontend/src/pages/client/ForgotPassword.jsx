import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Button from '../../components/common/Button';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';

function getErrorMessage(error, fallback = 'Erreur lors de l envoi du lien') {
  if (!error) return fallback;
  if (typeof error === 'string') return error;
  if (typeof error.message === 'string') return error.message;
  if (error.errors && typeof error.errors === 'object') {
    const first = Object.values(error.errors)[0];
    if (Array.isArray(first) && first[0]) return String(first[0]);
  }
  return fallback;
}

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;

    try {
      setLoading(true);
      await authService.forgotPassword(email.trim());
      setSent(true);
      toast.success('Lien de réinitialisation envoyé');
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
        <div className="mx-auto max-w-lg rounded-xl bg-white p-6 shadow">
          <h1 className="mb-2 text-2xl font-bold">Mot de passe oublié</h1>
          <p className="mb-6 text-sm text-gray-600">
            Entrez votre email pour recevoir un lien de réinitialisation.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold">Email</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="input"
                placeholder="votre@email.com"
                required
                disabled={loading}
              />
            </div>

            <Button type="submit" fullWidth loading={loading}>
              Envoyer le lien
            </Button>
          </form>

          {sent && (
            <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
              Si cet email existe, un lien vient d etre envoyé.
            </p>
          )}

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

