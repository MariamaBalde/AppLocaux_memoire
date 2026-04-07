import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, LogOut } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ variant = 'default' }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { cartCount } = useCart();
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const normalizedRole = (user?.role || '').toLowerCase();
  const ordersLink = normalizedRole === 'vendeur' ? '/vendeur/orders' : '/orders';
  const profileLink = normalizedRole === 'vendeur' ? '/vendeur/shop-profile' : '/profile';
  const isCatalogVariant = variant === 'catalog';

  const closeMobile = () => setIsMenuOpen(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      closeMobile();
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      closeMobile();
      navigate('/');
    } catch (error) {
      closeMobile();
    }
  };

  return (
    <nav
      className={`sticky top-0 z-50 border-b backdrop-blur ${
        isCatalogVariant
          ? 'border-amber-900/80 bg-[#1f0d06]/95 text-amber-100 shadow-[0_8px_22px_rgba(15,6,3,0.4)]'
          : 'border-amber-100 bg-white/95 shadow-sm'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2" onClick={closeMobile}>
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${
              isCatalogVariant ? 'bg-amber-600 text-amber-50' : 'bg-primary text-white'
            }`}
          >
            <span className="text-xl font-bold">A</span>
          </div>
          <span className={`text-xl font-bold ${isCatalogVariant ? 'text-amber-100' : 'text-gray-800'}`}>
            {isCatalogVariant ? 'AfriMarket' : 'AfriShop'}
          </span>
        </Link>

        <form onSubmit={handleSearch} className="mx-6 hidden max-w-xl flex-1 md:flex">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isCatalogVariant ? 'Arachides, caramel...' : 'Rechercher des produits...'}
              className={`w-full rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 ${
                isCatalogVariant
                  ? 'border border-amber-700/70 bg-[#2d130a] text-amber-50 placeholder:text-amber-300/60 focus:ring-amber-500'
                  : 'border border-gray-300 focus:ring-primary'
              }`}
            />
            <Search
              className={`absolute left-3 top-2.5 h-5 w-5 ${isCatalogVariant ? 'text-amber-300/70' : 'text-gray-400'}`}
            />
          </div>
        </form>

        <div className="hidden items-center space-x-6 md:flex">
          <Link
            to="/products"
            className={`${isCatalogVariant ? 'text-amber-100 hover:text-amber-300' : 'text-gray-700 hover:text-primary'} transition`}
          >
            {isCatalogVariant ? 'Catalogue' : 'Produits'}
          </Link>
          <Link
            to={isCatalogVariant ? '/vendors' : '/products'}
            className={`${isCatalogVariant ? 'text-amber-100 hover:text-amber-300' : 'text-gray-700 hover:text-primary'} transition`}
          >
            {isCatalogVariant ? 'Vendeurs' : 'Categories'}
          </Link>
          {isCatalogVariant && (
            <>
              <Link to="/shipping" className="text-amber-100 transition hover:text-amber-300">
                Expedition
              </Link>
              <Link to="/about" className="text-amber-100 transition hover:text-amber-300">
                A propos
              </Link>
            </>
          )}

          <Link
            to="/cart"
            className={`relative transition ${
              isCatalogVariant ? 'text-amber-100 hover:text-amber-300' : 'text-gray-700 hover:text-primary'
            }`}
            aria-label="Panier"
          >
            <ShoppingCart className="h-6 w-6" />
            {cartCount > 0 && (
              <span
                className={`absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-bold text-white ${
                  isCatalogVariant ? 'bg-amber-600' : 'bg-primary'
                }`}
              >
                {cartCount}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="group relative">
              <button
                type="button"
                className={`flex items-center space-x-2 transition ${
                  isCatalogVariant ? 'text-amber-100 hover:text-amber-300' : 'text-gray-700 hover:text-primary'
                }`}
              >
                <User className="h-6 w-6" />
                <span className="hidden lg:block">{user?.name || 'Compte'}</span>
              </button>
              <div className="absolute right-0 mt-2 hidden w-56 rounded-lg bg-white py-2 shadow-lg group-hover:block">
                <Link to={profileLink} className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Mon profil</Link>
                <Link to={ordersLink} className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Mes commandes</Link>
                <hr className="my-2" />
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center space-x-2 px-4 py-2 text-left text-red-600 hover:bg-gray-100"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Déconnexion</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className={`rounded-lg px-4 py-2 transition ${
                  isCatalogVariant
                    ? 'border border-amber-700 text-amber-100 hover:bg-amber-900/40'
                    : 'bg-primary text-white hover:bg-primary-dark'
                }`}
              >
                Connexion
              </Link>
              {isCatalogVariant && (
                <Link to="/register" className="rounded-lg bg-amber-700 px-4 py-2 text-white transition hover:bg-amber-600">
                  S'inscrire
                </Link>
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => setIsMenuOpen((v) => !v)}
          className={`${isCatalogVariant ? 'text-amber-100' : 'text-gray-700'} md:hidden`}
          aria-label="Menu mobile"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isMenuOpen && (
        <div className={`border-t px-4 py-4 md:hidden ${isCatalogVariant ? 'border-amber-800 bg-[#1f0d06]' : ''}`}>
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isCatalogVariant ? 'Arachides, caramel...' : 'Rechercher...'}
                className={`w-full rounded-lg py-2 pl-10 pr-4 ${
                  isCatalogVariant
                    ? 'border border-amber-700/70 bg-[#2d130a] text-amber-50 placeholder:text-amber-300/60'
                    : 'border border-gray-300'
                }`}
              />
              <Search
                className={`absolute left-3 top-2.5 h-5 w-5 ${isCatalogVariant ? 'text-amber-300/70' : 'text-gray-400'}`}
              />
            </div>
          </form>

          <div className="space-y-2">
            <Link
              to={isCatalogVariant ? '/vendors' : '/products'}
              onClick={closeMobile}
              className={`block py-2 ${isCatalogVariant ? 'text-amber-100 hover:text-amber-300' : 'text-gray-700 hover:text-primary'}`}
            >
              {isCatalogVariant ? 'Catalogue' : 'Produits'}
            </Link>
            <Link
              to="/products"
              onClick={closeMobile}
              className={`block py-2 ${isCatalogVariant ? 'text-amber-100 hover:text-amber-300' : 'text-gray-700 hover:text-primary'}`}
            >
              {isCatalogVariant ? 'Vendeurs' : 'Categories'}
            </Link>
            {isCatalogVariant && (
              <>
                <Link to="/shipping" onClick={closeMobile} className="block py-2 text-amber-100 hover:text-amber-300">
                  Expedition
                </Link>
                <Link to="/about" onClick={closeMobile} className="block py-2 text-amber-100 hover:text-amber-300">
                  A propos
                </Link>
              </>
            )}
            <Link
              to="/cart"
              onClick={closeMobile}
              className={`block py-2 ${isCatalogVariant ? 'text-amber-100 hover:text-amber-300' : 'text-gray-700 hover:text-primary'}`}
            >
              Panier {cartCount > 0 && `(${cartCount})`}
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to={profileLink}
                  onClick={closeMobile}
                  className={`block py-2 ${isCatalogVariant ? 'text-amber-100 hover:text-amber-300' : 'text-gray-700 hover:text-primary'}`}
                >
                  Mon profil
                </Link>
                <Link
                  to={ordersLink}
                  onClick={closeMobile}
                  className={`block py-2 ${isCatalogVariant ? 'text-amber-100 hover:text-amber-300' : 'text-gray-700 hover:text-primary'}`}
                >
                  Mes commandes
                </Link>
                <button onClick={handleLogout} className="block w-full py-2 text-left text-red-600">Déconnexion</button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={closeMobile}
                  className={`block py-2 font-medium ${isCatalogVariant ? 'text-amber-300' : 'text-primary'}`}
                >
                  Connexion
                </Link>
                {isCatalogVariant && (
                  <Link to="/register" onClick={closeMobile} className="block py-2 font-medium text-amber-200">
                    S'inscrire
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
