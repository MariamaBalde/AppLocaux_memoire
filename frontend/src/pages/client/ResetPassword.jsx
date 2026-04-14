import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Button from '../../components/common/Button';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';

function getErrorMessage(error, fallback = 'Réinitialisation impossible') {
  if (!error) return fallback;
  if (typeof error === 'string') return error;
  if (typeof error.message === 'string') return error.message;
  if (error.errors && typeof error.errors === 'object') {
    const first = Object.values(error.errors)[0];
    if (Array.isArray(first) && first[0]) return String(first[0]);
  }
  return fallback;
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: searchParams.get('email') || '',
    token: searchParams.get('token') || '',
    password: '',
    password_confirmation: '',
  });

  const tokenMissing = useMemo(() => !form.token, [form.token]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading || tokenMissing) return;

    if (form.password !== form.password_confirmation) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      setLoading(true);
      await authService.resetPassword({
        email: form.email.trim(),
        token: form.token,
        password: form.password,
        password_confirmation: form.password_confirmation,
      });
      toast.success('Mot de passe réinitialisé');
      navigate('/login');
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
          <h1 className="mb-2 text-2xl font-bold">Réinitialiser le mot de passe</h1>
          <p className="mb-6 text-sm text-gray-600">
            Choisissez un nouveau mot de passe pour votre compte.
          </p>

          {tokenMissing && (
            <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              Lien invalide: token manquant.
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="input"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">Nouveau mot de passe</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="input"
                minLength={8}
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">Confirmation</label>
              <input
                type="password"
                name="password_confirmation"
                value={form.password_confirmation}
                onChange={handleChange}
                className="input"
                minLength={8}
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" fullWidth loading={loading} disabled={tokenMissing}>
              Réinitialiser
            </Button>
          </form>

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

