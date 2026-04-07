import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

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

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [searchParams] = useSearchParams();

  const roleFromUrl = searchParams.get('role');
  const initialRole = roleFromUrl === 'vendeur' ? 'vendeur' : 'client';

  const [formData, setFormData] = useState({
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
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (formData.password !== formData.password_confirmation) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caracteres');
      return;
    }

    if (formData.role === 'vendeur' && !formData.shop_name.trim()) {
      toast.error('Le nom de la boutique est obligatoire pour un vendeur');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...formData,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        role: formData.role,
        shop_name: formData.role === 'vendeur' ? formData.shop_name.trim() : '',
        shop_description: formData.role === 'vendeur' ? formData.shop_description.trim() : '',
      };

      await register(payload);
      toast.success('Inscription reussie ! Bienvenue sur AfriShop');
      navigate('/');
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
          <h2 className="text-3xl font-bold text-gray-900">Inscription</h2>
          <p className="mt-2 text-gray-600">
            Deja un compte ?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Connectez-vous
            </Link>
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-semibold mb-2">Type de compte</label>
              <div className="grid grid-cols-2 gap-4">
                <label className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer ${
                  formData.role === 'client' ? 'border-primary bg-primary bg-opacity-5' : 'border-gray-200'
                }`}>
                  <input
                    type="radio"
                    name="role"
                    value="client"
                    checked={formData.role === 'client'}
                    onChange={handleChange}
                    className="mr-2"
                    disabled={loading}
                  />
                  <span className="font-medium">Client</span>
                </label>

                <label className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer ${
                  formData.role === 'vendeur' ? 'border-primary bg-primary bg-opacity-5' : 'border-gray-200'
                }`}>
                  <input
                    type="radio"
                    name="role"
                    value="vendeur"
                    checked={formData.role === 'vendeur'}
                    onChange={handleChange}
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
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Jean Dupont"
                  className="input"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="email@exemple.com"
                  className="input"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-2">Mot de passe *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">Confirmer mot de passe *</label>
                <input
                  type="password"
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-2">Telephone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+221 77 123 45 67"
                  className="input"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">Pays</label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
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
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="15 Rue de la Republique, Dakar"
                className="input"
                disabled={loading}
              />
            </div>

            {formData.role === 'vendeur' && (
              <div className="border-t pt-6">
                <h3 className="font-bold text-lg mb-4">Informations boutique</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block font-semibold mb-2">Nom de la boutique *</label>
                    <input
                      type="text"
                      name="shop_name"
                      value={formData.shop_name}
                      onChange={handleChange}
                      placeholder="Ma Boutique Africaine"
                      className="input"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-2">Description</label>
                    <textarea
                      name="shop_description"
                      value={formData.shop_description}
                      onChange={handleChange}
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
