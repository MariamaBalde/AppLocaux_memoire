import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../context/I18nContext';
import toast from 'react-hot-toast';
import { loginSchema } from '../../utils/formSchemas';

function getPostAuthRouteByRole(role) {
  const normalizedRole = String(role || '').toLowerCase();
  if (normalizedRole === 'vendeur') return '/vendeur/dashboard';
  if (normalizedRole === 'admin') return '/admin/dashboard';
  return '/products';
}

function getErrorMessage(error, fallbackMessage) {
  if (!error) return fallbackMessage;
  if (typeof error === 'string') return error;
  if (error.message && typeof error.message === 'string') return error.message;
  if (error.error && typeof error.error === 'string') return error.error;
  if (Array.isArray(error.errors) && error.errors.length > 0) return String(error.errors[0]);
  if (error.errors && typeof error.errors === 'object') {
    const firstKey = Object.keys(error.errors)[0];
    const firstValue = firstKey ? error.errors[firstKey] : null;
    if (Array.isArray(firstValue) && firstValue.length > 0) return String(firstValue[0]);
    if (typeof firstValue === 'string') return firstValue;
  }
  return fallbackMessage;
}

export default function Login() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    },
  });
  const onSubmit = async (values) => {
    if (loading) return;

    try {
      setLoading(true);
      const result = await login(values.email.trim(), values.password);
      if (result?.requiresEmailVerification) {
        toast('Veuillez vérifier votre email pour activer votre compte');
        navigate('/verify-email');
        return;
      }
      toast.success('Connexion reussie');
      navigate(getPostAuthRouteByRole(result?.user?.role));
    } catch (error) {
      toast.error(getErrorMessage(error, 'Email ou mot de passe incorrect'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">{t('login_title')}</h2>
          <p className="mt-2 text-gray-600">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-primary hover:underline font-medium">
              Inscrivez-vous
            </Link>
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block font-semibold mb-2">Email</label>
              <input
                type="email"
                {...register('email')}
                placeholder="votre@email.com"
                className="input"
                required
                disabled={loading}
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block font-semibold mb-2">Mot de passe</label>
              <input
                type="password"
                {...register('password')}
                placeholder="••••••••"
                className="input"
                required
                disabled={loading}
              />
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('remember')}
                  className="mr-2"
                  disabled={loading}
                />
                <span className="text-sm text-gray-600">Se souvenir de moi</span>
              </label>
              <button
                type="button"
                className="text-sm text-primary hover:underline"
                onClick={() => navigate('/forgot-password')}
                disabled={loading}
              >
                Mot de passe oublie ?
              </button>
            </div>

            <Button type="submit" fullWidth size="lg" loading={loading}>
              Se connecter
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Ou</span>
              </div>
            </div>

            <div className="mt-6">
              <Link to="/register">
                <Button variant="outline" fullWidth disabled={loading}>
                  Creer un compte
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
