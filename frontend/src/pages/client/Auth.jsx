import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle, ArrowRight, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const FEATURED_PRODUCTS = [
  { id: 1, name: 'Arachides Grillées Nature', vendor: 'Boutique Naturelle', price: '3,000 FCFA', location: 'Dakar', discount: 'Nouveau stock' },
  { id: 2, name: 'Mix Fruits Secs Tropicaux', vendor: 'Saveurs de Casamance', price: '5,500 FCFA', location: 'Ziguinchor', discount: '-15%' },
];

const PLATFORM_STATS = [
  { value: '85', label: 'Vendeurs vérifiés' },
  { value: '240+', label: 'Produits' },
  { value: '32', label: 'Pays' },
];

function getPasswordStrength(password) {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  
  if (strength <= 1) return { level: 'Faible', color: 'bg-red-500', text: 'text-red-600' };
  if (strength <= 2) return { level: 'Moyen', color: 'bg-yellow-500', text: 'text-yellow-600' };
  if (strength <= 3) return { level: 'Bon', color: 'bg-blue-500', text: 'text-blue-600' };
  return { level: 'Fort', color: 'bg-green-500', text: 'text-green-600' };
}

export default function Auth() {
  const navigate = useNavigate();
  const { login, register: registerUser } = useAuth();

  const [activeTab, setActiveTab] = useState('login');
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Login form
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
    remember: false,
  });

  // Register forms
  const [registerForm, setRegisterForm] = useState({
    role: 'client',
    email: '',
    password: '',
    password_confirmation: '',
    name: '',
    phone: '',
    country: 'SN',
    address: '',
    categories: [],
    shop_name: '',
    shop_description: '',
  });

  const passwordStrength = getPasswordStrength(registerForm.password);

  const handleLoginChange = (e) => {
    const { name, type, checked, value } = e.target;
    setLoginForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleRegisterChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setRegisterForm((prev) => ({
        ...prev,
        categories: checked
          ? [...prev.categories, value]
          : prev.categories.filter((c) => c !== value),
      }));
    } else {
      setRegisterForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);
      await login(loginForm.email.trim(), loginForm.password);
      toast.success('Connexion réussie !');
      navigate('/');
    } catch (error) {
      toast.error(error?.message || 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterNext = async () => {
    if (step === 1) {
      if (!registerForm.email || !registerForm.password) {
        toast.error('Veuillez remplir tous les champs');
        return;
      }
      if (registerForm.password.length < 8) {
        toast.error('Le mot de passe doit contenir au moins 8 caractères');
        return;
      }
      if (registerForm.password !== registerForm.password_confirmation) {
        toast.error('Les mots de passe ne correspondent pas');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!registerForm.name || !registerForm.phone) {
        toast.error('Veuillez remplir tous les champs');
        return;
      }
      setStep(3);
    }
  };

  const handleRegisterBack = () => {
    setStep(step - 1);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!registerForm.address) {
      toast.error('L\'adresse est obligatoire');
      return;
    }

    if (registerForm.role === 'vendeur' && !registerForm.shop_name.trim()) {
      toast.error('Le nom de la boutique est obligatoire');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...registerForm,
        name: registerForm.name.trim(),
        email: registerForm.email.trim(),
        phone: registerForm.phone.trim(),
        address: registerForm.address.trim(),
        shop_name: registerForm.role === 'vendeur' ? registerForm.shop_name.trim() : '',
        shop_description: registerForm.role === 'vendeur' ? registerForm.shop_description.trim() : '',
      };

      await registerUser(payload);
      toast.success('Inscription réussie ! Bienvenue sur AfriMarket');
      navigate('/');
    } catch (error) {
      toast.error(error?.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f4f3f1]">
      {/* Panneau gauche - Sombre avec produits */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#2a0b03] flex-col justify-between p-8">
        <div>
          <div className="text-white text-2xl font-bold mb-2">AfriMarket</div>
          <p className="text-[#dcc3ad] text-sm">Bienvenue sur la plateforme des produits locaux africains</p>
        </div>

        <div className="flex-1 flex flex-col justify-center space-y-6">
          <h3 className="text-[#f6ead8] text-xl font-semibold">Produits phares</h3>
          {FEATURED_PRODUCTS.map((product) => (
            <div key={product.id} className="bg-[#3a1f11] rounded-lg p-4 border border-[#5d3522]">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-[#f6ead8] font-semibold text-sm">{product.name}</h4>
                <span className="bg-[#cb6b2f] text-white text-xs px-2 py-1 rounded">{product.discount}</span>
              </div>
              <p className="text-[#a88467] text-xs mb-2">{product.vendor}</p>
              <div className="flex justify-between items-end">
                <span className="text-[#e2b555] font-bold">{product.price}</span>
                <span className="text-[#a88467] text-xs flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {product.location}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-[#5d3522] pt-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            {PLATFORM_STATS.map((stat) => (
              <div key={stat.label}>
                <p className="text-[#f0be63] text-2xl font-bold">{stat.value}</p>
                <p className="text-[#a88467] text-xs uppercase tracking-wide">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panneau droit - Formulaire */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 md:px-12">
        <div className="max-w-md mx-auto w-full">
          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b-2 border-[#e8d5c4]">
            <button
              onClick={() => {
                setActiveTab('login');
                setStep(1);
              }}
              className={`pb-3 px-2 font-semibold text-sm transition ${
                activeTab === 'login'
                  ? 'text-[#cb6b2f] border-b-2 border-[#cb6b2f] -mb-[2px]'
                  : 'text-[#6f6156]'
              }`}
            >
              Connexion
            </button>
            <button
              onClick={() => {
                setActiveTab('register');
                setStep(1);
              }}
              className={`pb-3 px-2 font-semibold text-sm transition ${
                activeTab === 'register'
                  ? 'text-[#cb6b2f] border-b-2 border-[#cb6b2f] -mb-[2px]'
                  : 'text-[#6f6156]'
              }`}
            >
              Inscription
            </button>
          </div>

          {/* LOGIN TAB */}
          {activeTab === 'login' && (
            <div>
              <h2 className="text-2xl font-bold text-[#1f1712] mb-2">Connectez-vous</h2>
              <p className="text-[#6f6156] mb-6">Accédez à votre compte AfriMarket</p>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#1f1712] mb-2">Email ou Téléphone</label>
                  <input
                    type="email"
                    name="email"
                    value={loginForm.email}
                    onChange={handleLoginChange}
                    placeholder="exemple@email.com"
                    className="w-full px-4 py-2.5 border border-[#e8d5c4] rounded-lg focus:outline-none focus:border-[#cb6b2f]"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#1f1712] mb-2">Mot de passe</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={loginForm.password}
                      onChange={handleLoginChange}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 border border-[#e8d5c4] rounded-lg focus:outline-none focus:border-[#cb6b2f]"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-[#6f6156]"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="remember"
                      checked={loginForm.remember}
                      onChange={handleLoginChange}
                      className="w-4 h-4 rounded"
                      disabled={loading}
                    />
                    <span className="text-sm text-[#6f6156]">Se souvenir de moi</span>
                  </label>
                  <button type="button" className="text-sm text-[#cb6b2f] hover:underline font-medium">
                    Mot de passe oublié ?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#cb6b2f] hover:bg-[#b85e29] text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
                >
                  {loading ? 'Connexion...' : 'Se connecter →'}
                </button>
              </form>

              <div className="mt-6">
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#e8d5c4]"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-[#6f6156]">Ou continuer avec</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <button className="w-full flex items-center justify-center gap-2 border border-[#e8d5c4] py-2.5 rounded-lg hover:bg-[#f9f8f7] transition">
                    <span className="text-xl">🔵</span>
                    <span className="text-sm font-medium text-[#1f1712]">Google</span>
                  </button>
                  <button className="w-full flex items-center justify-center gap-2 border border-[#e8d5c4] py-2.5 rounded-lg hover:bg-[#f9f8f7] transition">
                    <span className="text-xl">f</span>
                    <span className="text-sm font-medium text-[#1f1712]">Facebook</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* REGISTER TAB */}
          {activeTab === 'register' && (
            <div>
              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between mb-3">
                  {[1, 2, 3].map((s) => (
                    <div
                      key={s}
                      className={`h-2 flex-1 mx-1 rounded-full transition ${
                        s <= step ? 'bg-[#cb6b2f]' : 'bg-[#e8d5c4]'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-[#6f6156]">Étape {step} sur 3</p>
              </div>

              <h2 className="text-2xl font-bold text-[#1f1712] mb-2">
                {step === 1 && "Créez votre compte"}
                {step === 2 && "Vos informations"}
                {step === 3 && "Adresse de livraison"}
              </h2>
              <p className="text-[#6f6156] mb-6">
                {step === 1 && "Commençons par les bases"}
                {step === 2 && "Parlez-nous un peu de vous"}
                {step === 3 && "Où voulez-vous recevoir vos colis ?"}
              </p>

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {/* STEP 1 */}
                {step === 1 && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-[#1f1712] mb-3">Type de compte</label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { value: 'client', label: '👤 Client' },
                          { value: 'vendeur', label: '🏪 Vendeur' },
                        ].map((role) => (
                          <label
                            key={role.value}
                            className={`p-3 border-2 rounded-lg cursor-pointer transition text-center font-medium text-sm ${
                              registerForm.role === role.value
                                ? 'border-[#cb6b2f] bg-[#fff1dd] text-[#cb6b2f]'
                                : 'border-[#e8d5c4] text-[#6f6156]'
                            }`}
                          >
                            <input
                              type="radio"
                              name="role"
                              value={role.value}
                              checked={registerForm.role === role.value}
                              onChange={handleRegisterChange}
                              className="sr-only"
                            />
                            {role.label}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#1f1712] mb-2">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={registerForm.email}
                        onChange={handleRegisterChange}
                        placeholder="exemple@email.com"
                        className="w-full px-4 py-2.5 border border-[#e8d5c4] rounded-lg focus:outline-none focus:border-[#cb6b2f]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#1f1712] mb-2">Mot de passe</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={registerForm.password}
                          onChange={handleRegisterChange}
                          placeholder="••••••••"
                          className="w-full px-4 py-2.5 border border-[#e8d5c4] rounded-lg focus:outline-none focus:border-[#cb6b2f]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-[#6f6156]"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      {registerForm.password && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className={`h-1.5 w-12 rounded-full ${passwordStrength.color}`}></div>
                          <span className={`text-xs font-medium ${passwordStrength.text}`}>{passwordStrength.level}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#1f1712] mb-2">Confirmer le mot de passe</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="password_confirmation"
                          value={registerForm.password_confirmation}
                          onChange={handleRegisterChange}
                          placeholder="••••••••"
                          className="w-full px-4 py-2.5 border border-[#e8d5c4] rounded-lg focus:outline-none focus:border-[#cb6b2f]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-2.5 text-[#6f6156]"
                        >
                          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-[#1f1712] mb-2">Nom complet</label>
                      <input
                        type="text"
                        name="name"
                        value={registerForm.name}
                        onChange={handleRegisterChange}
                        placeholder="Jean Dupont"
                        className="w-full px-4 py-2.5 border border-[#e8d5c4] rounded-lg focus:outline-none focus:border-[#cb6b2f]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#1f1712] mb-2">Téléphone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={registerForm.phone}
                        onChange={handleRegisterChange}
                        placeholder="+221 77 123 45 67"
                        className="w-full px-4 py-2.5 border border-[#e8d5c4] rounded-lg focus:outline-none focus:border-[#cb6b2f]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#1f1712] mb-2">Pays de résidence</label>
                      <select
                        name="country"
                        value={registerForm.country}
                        onChange={handleRegisterChange}
                        className="w-full px-4 py-2.5 border border-[#e8d5c4] rounded-lg focus:outline-none focus:border-[#cb6b2f]"
                      >
                        <option value="SN">🇸🇳 Sénégal</option>
                        <option value="FR">🇫🇷 France</option>
                        <option value="USA">🇺🇸 USA</option>
                        <option value="CA">🇨🇦 Canada</option>
                        <option value="DE">🇩🇪 Allemagne</option>
                      </select>
                    </div>

                    {registerForm.role === 'vendeur' && (
                      <>
                        <div>
                          <label className="block text-sm font-semibold text-[#1f1712] mb-2">Nom de la boutique</label>
                          <input
                            type="text"
                            name="shop_name"
                            value={registerForm.shop_name}
                            onChange={handleRegisterChange}
                            placeholder="Ex: Délices du Sénégal"
                            className="w-full px-4 py-2.5 border border-[#e8d5c4] rounded-lg focus:outline-none focus:border-[#cb6b2f]"
                          />
                        </div>
                      </>
                    )}
                  </>
                )}

                {/* STEP 3 */}
                {step === 3 && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-[#1f1712] mb-2">Adresse complète</label>
                      <input
                        type="text"
                        name="address"
                        value={registerForm.address}
                        onChange={handleRegisterChange}
                        placeholder="123 rue de la Paix, Dakar"
                        className="w-full px-4 py-2.5 border border-[#e8d5c4] rounded-lg focus:outline-none focus:border-[#cb6b2f]"
                      />
                    </div>

                    {registerForm.role === 'vendeur' && (
                      <div>
                        <label className="block text-sm font-semibold text-[#1f1712] mb-2">Description de la boutique</label>
                        <textarea
                          name="shop_description"
                          value={registerForm.shop_description}
                          onChange={handleRegisterChange}
                          placeholder="Décrivez votre boutique..."
                          className="w-full px-4 py-2.5 border border-[#e8d5c4] rounded-lg focus:outline-none focus:border-[#cb6b2f] h-24 resize-none"
                        />
                      </div>
                    )}
                  </>
                )}

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={handleRegisterBack}
                      className="flex-1 border border-[#e8d5c4] text-[#6f6156] font-semibold py-2.5 rounded-lg hover:bg-[#f9f8f7] transition"
                    >
                      ← Retour
                    </button>
                  )}
                  {step < 3 && (
                    <button
                      type="button"
                      onClick={handleRegisterNext}
                      className="flex-1 bg-[#cb6b2f] hover:bg-[#b85e29] text-white font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      Continuer <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                  {step === 3 && (
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-[#cb6b2f] hover:bg-[#b85e29] text-white font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <CheckCircle className="h-4 w-4" />
                      {loading ? 'Création...' : 'Créer mon compte'}
                    </button>
                  )}
                </div>
              </form>

              <p className="text-xs text-[#6f6156] text-center mt-4">
                ✓ Aucune carte de crédit requise • ✓ Gratuit pour 30 jours • ✓ Support 24/7
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
