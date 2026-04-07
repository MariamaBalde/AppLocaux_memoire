import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-16 bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <h3 className="mb-4 text-xl font-bold">AfriShop</h3>
            <p className="mb-4 text-gray-400">
              La plateforme e-commerce des produits africains authentiques.
              Découvrez des produits uniques de toute l&apos;Afrique.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 transition hover:text-white" aria-label="Facebook"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="text-gray-400 transition hover:text-white" aria-label="Twitter"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="text-gray-400 transition hover:text-white" aria-label="Instagram"><Instagram className="h-5 w-5" /></a>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Liens rapides</h3>
            <ul className="space-y-2">
              <li><Link to="/products" className="text-gray-400 transition hover:text-white">Produits</Link></li>
              <li><a href="/#categories" className="text-gray-400 transition hover:text-white">Catégories</a></li>
              <li><a href="/#story" className="text-gray-400 transition hover:text-white">À propos</a></li>
              <li><a href="/#contact" className="text-gray-400 transition hover:text-white">Contact</a></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Service client</h3>
            <ul className="space-y-2 text-gray-400">
              <li>FAQ</li>
              <li>Livraison</li>
              <li>Retours</li>
              <li>Confidentialité</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Contact</h3>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-start space-x-2"><MapPin className="mt-0.5 h-5 w-5 flex-shrink-0" /><span>Dakar, Sénégal</span></li>
              <li className="flex items-center space-x-2"><Phone className="h-5 w-5 flex-shrink-0" /><span>+221 77 123 45 67</span></li>
              <li className="flex items-center space-x-2"><Mail className="h-5 w-5 flex-shrink-0" /><span>support@afrishop.com</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-700 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} AfriShop. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
