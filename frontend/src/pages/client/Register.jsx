import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../context/I18nContext';
import toast from 'react-hot-toast';
import { registerSchema } from '../../utils/formSchemas';

function getPostAuthRouteByRole(role) {
  const normalizedRole = String(role || '').toLowerCase();
  if (normalizedRole === 'vendeur') return '/vendeur/dashboard';
  if (normalizedRole === 'admin') return '/admin/dashboard';
  return '/products';
}

function getErrorMessage(error, fallbackMessage) {
  if (!error) return fallbackMessage;
  if (typeof error === 'string') return error;

  // Prioriser les erreurs de validation backend pour afficher le vrai champ bloquant.
  if (error.errors && typeof error.errors === 'object') {
    const firstKey = Object.keys(error.errors)[0];
    const firstValue = firstKey ? error.errors[firstKey] : null;
    if (Array.isArray(firstValue) && firstValue.length > 0) return String(firstValue[0]);
    if (typeof firstValue === 'string') return firstValue;
  }
  if (Array.isArray(error.errors) && error.errors.length > 0) return String(error.errors[0]);
  if (error.message && typeof error.message === 'string') return error.message;
  if (error.error && typeof error.error === 'string') return error.error;
  return fallbackMessage;
}

export default function Register() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { register } = useAuth();
  const [searchParams] = useSearchParams();

  const roleFromUrl = searchParams.get('role');
  const initialRole = roleFromUrl === 'vendeur' ? 'vendeur' : 'client';

  const [loading, setLoading] = useState(false);
  const {
    register: registerField,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      phone: '',
      address: '',
      country: 'SN',
      role: initialRole,
      shop_name: '',
      shop_description: '',
    },
  });
  const role = watch('role');

  const onSubmit = async (formData) => {
    if (loading) return;

    try {
      setLoading(true);

      const payload = {
        ...formData,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        role: formData.role,
        ...(formData.role === 'vendeur'
          ? {
              shop_name: formData.shop_name.trim(),
              shop_description: formData.shop_description.trim(),
            }
          : {}),
      };

      const result = await register(payload);
      if (result?.requiresEmailVerification) {
        toast.success('Inscription réussie. Vérifiez votre email.');
        navigate('/verify-email');
      } else {
        toast.success('Inscription reussie ! Bienvenue sur AfriShop');
        navigate(getPostAuthRouteByRole(result?.user?.role));
      }
    } catch (error) {
      toast.error(getErrorMessage(error, 'Erreur lors de l\'inscription'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">{t('register_title')}</h2>
          <p className="mt-2 text-gray-600">
            Deja un compte ?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Connectez-vous
            </Link>
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block font-semibold mb-2">Type de compte</label>
              <div className="grid grid-cols-2 gap-4">
                <label className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer ${
                  role === 'client' ? 'border-primary bg-primary bg-opacity-5' : 'border-gray-200'
                }`}>
                  <input
                    type="radio"
                    value="client"
                    {...registerField('role')}
                    className="mr-2"
                    disabled={loading}
                  />
                  <span className="font-medium">Client</span>
                </label>

                <label className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer ${
                  role === 'vendeur' ? 'border-primary bg-primary bg-opacity-5' : 'border-gray-200'
                }`}>
                  <input
                    type="radio"
                    value="vendeur"
                    {...registerField('role')}
                    className="mr-2"
                    disabled={loading}
                  />
                  <span className="font-medium">Vendeur</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-2">Nom complet *</label>
                <input
                  type="text"
                  {...registerField('name')}
                  placeholder="Jean Dupont"
                  className="input"
                  required
                  disabled={loading}
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block font-semibold mb-2">Email *</label>
                <input
                  type="email"
                  {...registerField('email')}
                  placeholder="email@exemple.com"
                  className="input"
                  required
                  disabled={loading}
                />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-2">Mot de passe *</label>
                <input
                  type="password"
                  {...registerField('password')}
                  placeholder="••••••••"
                  className="input"
                  required
                  disabled={loading}
                />
                {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
              </div>

              <div>
                <label className="block font-semibold mb-2">Confirmer mot de passe *</label>
                <input
                  type="password"
                  {...registerField('password_confirmation')}
                  placeholder="••••••••"
                  className="input"
                  required
                  disabled={loading}
                />
                {errors.password_confirmation && (
                  <p className="mt-1 text-xs text-red-600">{errors.password_confirmation.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-2">Telephone</label>
                <input
                  type="tel"
                  {...registerField('phone')}
                  placeholder="+221 77 123 45 67"
                  className="input"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">Pays</label>
                <select
                  {...registerField('country')}
                  className="input"
                  disabled={loading}
                >
                  <option value="SN">Sénégal</option>
                  <option value="CI">Côte d'Ivoire</option>
                  <option value="ML">Mali</option>
                  <option value="BF">Burkina Faso</option>
                  <option value="FR">France</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-2">Adresse</label>
              <input
                type="text"
                {...registerField('address')}
                placeholder="15 Rue de la Republique, Dakar"
                className="input"
                disabled={loading}
              />
            </div>

            {role === 'vendeur' && (
              <div className="border-t pt-6">
                <h3 className="font-bold text-lg mb-4">Informations boutique</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block font-semibold mb-2">Nom de la boutique *</label>
                    <input
                      type="text"
                      {...registerField('shop_name')}
                      placeholder="Ma Boutique Africaine"
                      className="input"
                      required
                      disabled={loading}
                    />
                    {errors.shop_name && <p className="mt-1 text-xs text-red-600">{errors.shop_name.message}</p>}
                  </div>

                  <div>
                    <label className="block font-semibold mb-2">Description</label>
                    <textarea
                      {...registerField('shop_description')}
                      placeholder="Decrivez votre boutique et vos produits..."
                      rows="3"
                      className="input"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-start">
              <input type="checkbox" className="mt-1 mr-2" required disabled={loading} />
              <p className="text-sm text-gray-600">
                J'accepte les{' '}
                <Link to="/terms-of-service" className="text-primary hover:underline">
                  conditions d'utilisation
                </Link>{' '}
                et la{' '}
                <Link to="/privacy-policy" className="text-primary hover:underline">
                  politique de confidentialite
                </Link>
              </p>
            </div>

            <Button type="submit" fullWidth size="lg" loading={loading}>
              Creer mon compte
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
