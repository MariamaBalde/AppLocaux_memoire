import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import Navbar from '../../components/common/Navbar';
import Button from '../../components/common/Button';

export default function Profile() {
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // profile, addresses, settings
  const [message, setMessage] = useState('');

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    company: user?.company || '',
  });

  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: '',
    address: '',
    zipcode: '',
    city: '',
    phone: '',
    is_default: false,
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });

  useEffect(() => {
    if (activeTab === 'addresses') {
      fetchAddresses();
    }
  }, [activeTab]);

  const fetchAddresses = async () => {
    try {
      const response = await userService.getAddresses();
      setAddresses(response.data || response);
    } catch (err) {
      console.error('Erreur récupération adresses', err);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await userService.updateProfile(profileData);
      setMessage({ type: 'success', text: 'Profil mis à jour avec succès' });
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await userService.addAddress(newAddress);
      setNewAddress({
        name: '',
        address: '',
        zipcode: '',
        city: '',
        phone: '',
        is_default: false,
      });
      setShowAddressForm(false);
      fetchAddresses();
      setMessage({ type: 'success', text: 'Adresse ajoutée avec succès' });
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur lors de l\'ajout de l\'adresse' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas' });
      return;
    }
    try {
      setIsLoading(true);
      await userService.changePassword(
        passwordData.current_password,
        passwordData.new_password
      );
      setPasswordData({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      });
      setMessage({ type: 'success', text: 'Mot de passe changé avec succès' });
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur lors du changement de mot de passe' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette adresse?')) {
      try {
        await userService.deleteAddress(id);
        fetchAddresses();
        setMessage({ type: 'success', text: 'Adresse supprimée' });
        setTimeout(() => setMessage(''), 3000);
      } catch (err) {
        setMessage({ type: 'error', text: 'Erreur lors de la suppression' });
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Mon Profil</h1>

          {/* Message alert */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg font-semibold ${
              message.type === 'success'
                ? 'bg-green-100 text-success'
                : 'bg-red-100 text-danger'
            }`}>
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Tabs */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {[
                  { id: 'profile', label: 'Profil', icon: '👤' },
                  { id: 'addresses', label: 'Adresses', icon: '📍' },
                  { id: 'settings', label: 'Paramètres', icon: '⚙️' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full px-6 py-4 text-left font-semibold transition flex items-center gap-3 ${
                      activeTab === tab.id
                        ? 'bg-primary text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              {/* Logout */}
              <div className="mt-6">
                <Button
                  onClick={() => {
                    logout();
                    window.location.href = '/login';
                  }}
                  variant="danger"
                  fullWidth
                >
                  Déconnexion
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              {/* PROFIL */}
              {activeTab === 'profile' && (
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-2xl font-bold mb-6">Informations personnelles</h2>
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        Nom complet
                      </label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        disabled
                        className="w-full px-4 py-2 border rounded-lg bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        Entreprise (optionnel)
                      </label>
                      <input
                        type="text"
                        value={profileData.company}
                        onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <Button
                      type="submit"
                      isLoading={isLoading}
                      variant="primary"
                      size="lg"
                      fullWidth
                    >
                      Mettre à jour
                    </Button>
                  </form>
                </div>
              )}

              {/* ADRESSES */}
              {activeTab === 'addresses' && (
                <div className="space-y-6">
                  {/* Ajouter adresse */}
                  {!showAddressForm ? (
                    <Button
                      onClick={() => setShowAddressForm(true)}
                      variant="primary"
                    >
                      + Ajouter une adresse
                    </Button>
                  ) : (
                    <div className="bg-white rounded-lg shadow-lg p-8">
                      <h3 className="text-xl font-bold mb-4">Nouvelle adresse</h3>
                      <form onSubmit={handleAddAddress} className="space-y-4">
                        <div>
                          <label className="block text-gray-700 font-semibold mb-2">
                            Nom de l'adresse
                          </label>
                          <input
                            type="text"
                            value={newAddress.name}
                            onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg"
                            placeholder="Ex: Domicile, Bureau..."
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 font-semibold mb-2">
                            Adresse
                          </label>
                          <input
                            type="text"
                            value={newAddress.address}
                            onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-gray-700 font-semibold mb-2">
                              Code Postal
                            </label>
                            <input
                              type="text"
                              value={newAddress.zipcode}
                              onChange={(e) => setNewAddress({ ...newAddress, zipcode: e.target.value })}
                              className="w-full px-4 py-2 border rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-700 font-semibold mb-2">
                              Ville
                            </label>
                            <input
                              type="text"
                              value={newAddress.city}
                              onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                              className="w-full px-4 py-2 border rounded-lg"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-gray-700 font-semibold mb-2">
                            Téléphone
                          </label>
                          <input
                            type="tel"
                            value={newAddress.phone}
                            onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg"
                          />
                        </div>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={newAddress.is_default}
                            onChange={(e) => setNewAddress({ ...newAddress, is_default: e.target.checked })}
                            className="w-4 h-4"
                          />
                          <span className="font-semibold">Adresse par défaut</span>
                        </label>
                        <div className="flex gap-3">
                          <Button
                            type="submit"
                            isLoading={isLoading}
                            variant="primary"
                            fullWidth
                          >
                            Ajouter
                          </Button>
                          <button
                            type="button"
                            onClick={() => setShowAddressForm(false)}
                            className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50"
                          >
                            Annuler
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Liste adresses */}
                  <div className="space-y-4">
                    {addresses.map(address => (
                      <div key={address.id} className="bg-white rounded-lg shadow-lg p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-lg">{address.name}</h4>
                            <p className="text-gray-600">{address.address}</p>
                            <p className="text-gray-600">{address.zipcode} {address.city}</p>
                            <p className="text-gray-600">{address.phone}</p>
                            {address.is_default && (
                              <span className="inline-block mt-2 px-3 py-1 bg-success text-white text-sm rounded">
                                Adresse par défaut
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteAddress(address.id)}
                            className="text-danger hover:underline"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PARAMÈTRES */}
              {activeTab === 'settings' && (
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-2xl font-bold mb-6">Sécurité</h2>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        Mot de passe actuel
                      </label>
                      <input
                        type="password"
                        value={passwordData.current_password}
                        onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        Nouveau mot de passe
                      </label>
                      <input
                        type="password"
                        value={passwordData.new_password}
                        onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        Confirmez le mot de passe
                      </label>
                      <input
                        type="password"
                        value={passwordData.new_password_confirmation}
                        onChange={(e) => setPasswordData({ ...passwordData, new_password_confirmation: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      isLoading={isLoading}
                      variant="primary"
                      size="lg"
                      fullWidth
                    >
                      Changer le mot de passe
                    </Button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
