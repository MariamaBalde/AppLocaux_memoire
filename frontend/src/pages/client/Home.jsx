import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import { productService } from '../../services/productService';
import { useCart } from '../../context/CartContext';
import './home.css';

import heroBg from '../../assets/home/hero-nuts.png';
import productCaramelBars from '../../assets/home/product-caramel-bars.jpg';
import productCoatedPeanuts from '../../assets/home/product-coated-peanuts.jpg';
import productGoldenPeanuts from '../../assets/home/product-golden-peanuts.jpg';
import productShellPeanuts from '../../assets/home/product-shell-peanuts.jpg';
import productCoco from '../../assets/home/coco.jpeg';
import productToffi from '../../assets/home/toffi.jpeg';
import productKhertouba from '../../assets/home/khertouba1.jpg';
import productbottle from '../../assets/home/product-mixed-nuts-bottles.jpg';
import categoryRoastedNuts from '../../assets/home/product-shell-peanuts.jpg';
import categoryCaramelTreats from '../../assets/home/product-golden-peanuts.jpg';
import categoryTraditionalSweets from '../../assets/home/product-bottles-display.jpg';
import categoryCoatedSnacks from '../../assets/home/product-coated-peanuts.jpg';
import categoryExportGiftPacks from '../../assets/home/product-mixed-nuts-bottles.jpg';
import categorySeasonalSpecials from '../../assets/home/product-wr-bottles.jpg';
import brandLogo from '../../assets/home/logo-brand.png';

const fallbackProducts = [
  {
    id: 9001,
    name: 'Nougat arachide traditionnel',
    image: productCaramelBars,
    country: 'Sénégal',
    tag: 'Bestseller',
    tagClass: 'tag-orange',
    rating: 4.9,
    reviews_count: 213,
    price: 14.99,
    original_price: 18.99,
    discount: 21,
  },
 
  {
    id: 9005,
    name: 'Délices Coco',
    image: productCoco,
    country: 'Côte d\'Ivoire',
    tag: 'Nouveau',
    tagClass: 'tag-green',
    rating: 4.8,
    reviews_count: 156,
    price: 12.99,
    original_price: 16.99,
    discount: 24,
  },
  {
    id: 9006,
    name: 'Bouchées Toffi Caramel',
    image: productToffi,
    country: 'Sénégal',
    tag: 'Nouveau',
    tagClass: 'tag-green',
    rating: 4.9,
    reviews_count: 142,
    price: 13.99,
    original_price: 17.99,
    discount: 22,
  },
  {
    id: 9007,
    name: 'KherTouba Biscuit sablé',
    image: productKhertouba,
    country: 'Sénégal',
    tag: 'Nouveau',
    tagClass: 'tag-green',
    rating: 4.9,
    reviews_count: 142,
    price: 13.99,
    original_price: 17.99,
    discount: 22,
  },
   {
    id: 9002,
    name: 'Arachides rôties en coque',
    image: productShellPeanuts,
    country: 'Ghana',
    tag: 'Nouveau',
    tagClass: 'tag-green',
    rating: 4.8,
    reviews_count: 187,
    price: 9.99,
    original_price: 12.99,
    discount: 23,
  },
  {
    id: 9003,
    name: 'Mélange arachides enrobées colorées',
    image: productCoatedPeanuts,
    country: 'Nigeria',
    tag: 'Populaire',
    tagClass: 'tag-gold',
    rating: 4.7,
    reviews_count: 142,
    price: 11.99,
    original_price: 15.99,
    discount: 25,
  },

   {
    id: 9004,
    name: 'Arachides dorées premium',
    image: productGoldenPeanuts,
    country: 'Nigeria',
    tag: 'Populaire',
    tagClass: 'tag-gold',
    rating: 4.7,
    reviews_count: 142,
    price: 11.99,
    original_price: 15.99,
    discount: 25,
  },
  {
    id: 9008,
    name: 'Bouteilles mélange premium',
    image: productbottle,
    country: 'Nigeria',
    tag: 'Populaire',
    tagClass: 'tag-gold',
    rating: 4.7,
    reviews_count: 142,
    price: 11.99,
    original_price: 15.99,
    discount: 25,
  },
];

const categories = [
  { id: 1, title: 'Noix rôties', count: 32, image: categoryRoastedNuts },
  { id: 2, title: 'Friandises caramel', count: 24, image: categoryCaramelTreats },
  { id: 3, title: 'Sucreries traditionnelles', count: 18, image: categoryTraditionalSweets },
  { id: 4, title: 'Collations enrobées', count: 27, image: categoryCoatedSnacks },
  { id: 5, title: 'Coffrets cadeaux', count: 15, image: categoryExportGiftPacks },
  { id: 6, title: 'Spécialités saisonnières', count: 11, image: categorySeasonalSpecials },
];

const impactMetrics = [
  { id: 1, value: '2019', label: 'Naissance de la marque' },
  { id: 2, value: '8', label: 'Pays d\'origine partenaires' },
  { id: 3, value: '50k+', label: 'Clients servis' },
  { id: 4, value: '98%', label: 'Satisfaction client' },
];

function normalizeProduct(product, index) {
  return {
    id: product?.id || 9900 + index,
    name: product?.name || fallbackProducts[index]?.name || 'Artisan Product',
    image: product?.image || fallbackProducts[index]?.image || productCaramelBars,
    country: fallbackProducts[index]?.country || 'Senegal',
    tag: fallbackProducts[index]?.tag || 'Featured',
    tagClass: fallbackProducts[index]?.tagClass || 'tag-orange',
    rating: Number(product?.rating || fallbackProducts[index]?.rating || 4.8),
    reviews_count: Number(product?.reviews_count || fallbackProducts[index]?.reviews_count || 120),
    price: Number(product?.price || fallbackProducts[index]?.price || 12.99),
    original_price: Number(product?.original_price || fallbackProducts[index]?.original_price || 15.99),
    discount: Number(product?.discount || fallbackProducts[index]?.discount || 20),
  };
}

function formatPrice(price) {
  return price.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  });
}

export default function Home() {
  const { addToCart } = useCart();
  const [apiProducts, setApiProducts] = useState([]);
  const [selectedTrendingFilter, setSelectedTrendingFilter] = useState('all');

  useEffect(() => {
    const fetchHomeProducts = async () => {
      try {
        const [popular, newest] = await Promise.all([
          productService.getPopularProducts(8).catch(() => ({ data: [] })),
          productService.getNewProducts(8).catch(() => ({ data: [] })),
        ]);

        const popularItems = Array.isArray(popular?.data) ? popular.data : [];
        const newestItems = Array.isArray(newest?.data) ? newest.data : [];
        const merged = [...popularItems, ...newestItems];
        const unique = merged.filter(
          (item, idx, arr) => arr.findIndex(other => other.id === item.id) === idx
        );
        setApiProducts(unique.slice(0, 4));
      } catch (error) {
        setApiProducts([]);
      }
    };

    fetchHomeProducts();
  }, []);

  const trendingProducts = useMemo(() => {
    if (!apiProducts.length) return fallbackProducts;

    const normalized = apiProducts.map((product, index) => normalizeProduct(product, index));
    if (normalized.length < 4) {
      const missing = fallbackProducts.slice(normalized.length);
      return [...normalized, ...missing];
    }

    return normalized.slice(0, 4);
  }, [apiProducts]);

  const trendingFilters = [
    { id: 'all', label: 'Tous' },
    { id: 'roasted', label: 'Rôtis' },
    { id: 'coated', label: 'Enrobés' },
    { id: 'sweet', label: 'Sucrés' },
    { id: 'traditional', label: 'Traditionnels' },
    { id: 'premium', label: 'Premium' },
  ];

  const filteredTrendingProducts = useMemo(() => {
    if (selectedTrendingFilter === 'all') return trendingProducts;

    const byFilter = trendingProducts.filter((product) => {
      const value = `${product.name} ${product.tag} ${product.country}`.toLowerCase();

      if (selectedTrendingFilter === 'roasted') {
        return (
          value.includes('rôti')
          || value.includes('roast')
          || value.includes('arachide')
          || value.includes('peanut')
          || value.includes('coque')
        );
      }

      if (selectedTrendingFilter === 'coated') {
        return value.includes('enrob') || value.includes('coated') || value.includes('color');
      }

      if (selectedTrendingFilter === 'sweet') {
        return (
          value.includes('caramel')
          || value.includes('nougat')
          || value.includes('toffi')
          || value.includes('coco')
          || value.includes('biscuit')
          || value.includes('sucré')
          || value.includes('sweet')
        );
      }

      if (selectedTrendingFilter === 'traditional') {
        return (
          value.includes('tradition')
          || value.includes('traditional')
          || value.includes('artisan')
          || value.includes('khertouba')
        );
      }

      if (selectedTrendingFilter === 'premium') {
        return (
          value.includes('premium')
          || value.includes('dorée')
          || value.includes('mélange')
          || value.includes('bouteilles')
          || value.includes('export')
        );
      }

      return true;
    });

    return byFilter.length ? byFilter : trendingProducts;
  }, [selectedTrendingFilter, trendingProducts]);

  const handleAddToCart = (product) => {
    addToCart(product, 1);
  };

  return (
    <div className="home-page">
      <Navbar />

      <section className="hero-section" id="hero" style={{ backgroundImage: `url(${heroBg})` }}>
        <div className="hero-overlay" />
        <div className="home-container hero-content">
          <div className="hero-left">
            <p className="hero-pill">Livraison vers 40+ pays mondiaux</p>
            <h1>
              Savourez l'Afrique <span>N'importe où dans</span> le monde
            </h1>
            <p className="hero-text">
              Des produits locaux authentiques d'artisans africains, livrés à votre porte.
              Soutenez les communautés, savourez la tradition et apportez l'Afrique à votre table.
            </p>
            <div className="hero-actions">
              <Link to="/products" className="btn-primary-home">Commander maintenant</Link>
              <a href="#seller" className="btn-outline-home">Devenir vendeur</a>
            </div>
            <div className="hero-features">
              <span>Paiement sécurisé</span>
              <span>Livraison rapide</span>
              <span>Qualité garantie</span>
            </div>
          </div>

          <div className="hero-card">
            <div className="hero-card-badge">Fabriqué au Sénégal</div>
            <img src={productGoldenPeanuts} alt="Brittle arachide premium" />
            <div className="hero-card-body">
              <h3>Brittle arachide premium</h3>
              <p>Caramélisé &amp; fait à la main</p>
              <div className="hero-card-price-row">
                <strong>{formatPrice(12.99)}</strong>
                <Link to="/products" className="hero-card-button">Acheter maintenant</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-light section-trending" id="trending">
        <div className="home-container">
          <div className="section-header">
            <p className="section-overline">PRODUITS PRÉFÉRÉS</p>
            <h2>Produits tendance</h2>
            <p>Saveurs authentiques du continent africain, aimées par la diaspora mondiale</p>
          </div>

          <div className="trending-filters" role="tablist" aria-label="Filtrer les produits tendance">
            {trendingFilters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                className={`trending-filter-btn ${selectedTrendingFilter === filter.id ? 'active' : ''}`}
                onClick={() => setSelectedTrendingFilter(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="product-grid">
            {filteredTrendingProducts.map((product) => (
              <article className="product-card-home" key={product.id}>
                <div className="product-image-wrap">
                  <img src={product.image || productCaramelBars} alt={product.name} />
                  <span className={`product-tag ${product.tagClass}`}>{product.tag}</span>
                  <span className="product-country">{product.country}</span>
                </div>
                <div className="product-content">
                  <h3>{product.name}</h3>
                  <div className="product-rating">{`★`.repeat(Math.round(product.rating))} <span>{product.rating} ({product.reviews_count})</span></div>
                  <div className="product-price-row">
                    <strong>{formatPrice(product.price)}</strong>
                    <span className="old-price">{formatPrice(product.original_price)}</span>
                    <span className="discount-chip">{product.discount}% off</span>
                  </div>
                  <button
                    type="button"
                    className="add-to-cart-btn"
                    onClick={() => handleAddToCart(product)}
                  >
                    Ajouter au panier
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="section-center-action">
            <Link to="/products" className="btn-outline-accent">Voir tous les produits</Link>
          </div>
        </div>
      </section>

      <section className="section section-cream" id="categories">
        <div className="home-container">
          <div className="section-header">
            <p className="section-overline">EXPLORER LES SAVEURS</p>
            <h2>Magasiner par catégorie</h2>
            <p>Découvrez la riche diversité des trésors culinaires africains</p>
          </div>

          <div className="category-grid">
            {categories.map((category) => (
              <article
                key={category.id}
                className="category-card"
                style={{ backgroundImage: `url(${category.image})` }}
              >
                <div className="category-overlay" />
                <div className="category-content">
                  <h3>{category.title}</h3>
                  <p>{category.count} produits</p>
                </div>
                <Link to={`/products?category_id=${category.id}`} className="category-arrow">→</Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-light" id="story">
        <div className="home-container">
          <div className="impact-content">
            <p className="impact-pill">À PROPOS DU PROJET</p>
            <h2>
              L&apos;Histoire de <span>Notre Marque</span>
            </h2>
            <p>
              Sahel Gourmet est née d&apos;une idée simple: partager les saveurs locales africaines avec les
              familles d&apos;ici et la diaspora partout dans le monde. Nous avons commencé avec quelques
              artisans passionnés et des recettes transmises de génération en génération.
            </p>
            <p>
              Notre mission est de valoriser le savoir-faire local: arachides grillées,
              arachides caramélisées, barres caramel, fruits secs et d&apos;autres spécialités qui
              racontent une culture, une famille et un territoire.
            </p>
            <p>
              Aujourd&apos;hui, Sahel Gourmet grandit avec une vision claire: construire une marque forte,
              authentique et moderne, qui crée de la fierté locale, soutient durablement les producteurs
              et rapproche les communautés africaines à travers le goût.
            </p>
            <div className="impact-metrics">
              {impactMetrics.map((metric) => (
                <div key={metric.id} className="metric-card">
                  <strong>{metric.value}</strong>
                  <span>{metric.label}</span>
                </div>
              ))}
            </div>
            <a href="#trending" className="btn-outline-accent">Découvrir notre univers</a>
          </div>
        </div>
      </section>

     

      <section className="section section-contact" id="contact">
        <div className="home-container">
          <div className="section-header contact-header">
            <p className="section-overline">CONTACTEZ-NOUS</p>
            <h2>Parlons de Votre Projet</h2>
            <p>
              Une question sur nos produits ? Vous souhaitez devenir vendeur ou partenaire ?
              Notre équipe est disponible pour vous aider.
            </p>
          </div>

          <div className="contact-card">
            <aside className="contact-info-panel">
              <h3>Restons en Contact</h3>

              <div className="contact-info-list">
                <div className="contact-info-item">
                  <div className="contact-icon-box">✉</div>
                  <div>
                    <p>EMAIL</p>
                    <strong>contact@afrobouffe.com</strong>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="contact-icon-box">⌁</div>
                  <div>
                    <p>WHATSAPP</p>
                    <strong>+221 77 000 00 00</strong>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="contact-icon-box">⌖</div>
                  <div>
                    <p>ADRESSE</p>
                    <strong>Dakar, Sénégal</strong>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="contact-icon-box">◷</div>
                  <div>
                    <p>DISPONIBILITÉ</p>
                    <strong>Lun-Sam: 8h - 20h</strong>
                  </div>
                </div>
              </div>

              <div className="contact-socials">
                <p>SUIVEZ-NOUS</p>
                <div>
                  <a href="#contact" aria-label="Instagram">IG</a>
                  <a href="#contact" aria-label="Facebook">FB</a>
                  <a href="#contact" aria-label="WhatsApp">WA</a>
                  <a href="#contact" aria-label="YouTube">YT</a>
                </div>
              </div>
            </aside>

            <form className="contact-form-panel">
              <div className="contact-form-grid">
                <label>
                  Nom complet *
                  <input type="text" placeholder="Votre nom" />
                </label>
                <label>
                  Email *
                  <input type="email" placeholder="votre@email.com" />
                </label>
              </div>

              <label>
                Sujet *
                <select defaultValue="">
                  <option value="" disabled>Choisissez un sujet</option>
                  <option value="commande">Question sur une commande</option>
                  <option value="vendeur">Devenir vendeur</option>
                  <option value="partenariat">Partenariat</option>
                </select>
              </label>

              <label>
                Téléphone
                <input type="tel" placeholder="+221 77 000 00 00" />
              </label>

              <label className="message-label">
                Message *
                <span>0/500</span>
              </label>
              <textarea placeholder="Décrivez votre demande..." maxLength={500} />

              <button type="button" className="contact-submit-btn">
                Envoyer le Message
              </button>
            </form>
          </div>
        </div>
      </section>

      <footer className="home-footer" id="footer" >
        <div className="footer-overlay" />
        <div className="home-container footer-content">
          <div>
            <Link to="/" className="footer-brand-logo" aria-label="Sahel Gourmet">
              <img src={brandLogo} alt="Sahel Gourmet" />
            </Link>
            <p>
              Connecter l'Afrique au monde, un produit authentique à la fois.
              Savourez la tradition, soutenez les communautés et célébrez l'héritage.
            </p>
          </div>
          <div>
            <h4>Boutique</h4>
            <ul>
              <li><Link to="/products">Tous les produits</Link></li>
              <li><a href="#trending">Meilleures ventes</a></li>
              <li><a href="#categories">Coffrets cadeaux</a></li>
            </ul>
          </div>
          <div>
            <h4>Entreprise</h4>
            <ul>
              <li><a href="#story">Notre histoire</a></li>
              <li><a href="#seller">Partenaires artisans</a></li>
              <li><a href="#export">Programme d'exportation</a></li>
            </ul>
          </div>
          <div>
            <h4>Support</h4>
            <ul>
              <li><a href="/shipping">Info livraison</a></li>
              <li><a href="/returns-policy">Politique de retour</a></li>
              <li><a href="/contact">Nous contacter</a></li>
            </ul>
          </div>
        </div>

        <div className="home-container newsletter-row">
          <div>
            <h3>Obtenez des offres exclusives &amp; recettes africaines</h3>
            <p>Inscrivez-vous et recevez 10% de réduction sur votre première commande plus des idées de recettes hebdomadaires.</p>
          </div>
          <form className="newsletter-form">
            <input type="email" placeholder="Votre adresse email" aria-label="Adresse email" />
            <button type="button">S'abonner</button>
          </form>
        </div>

        <div className="home-container footer-bottom">
          <p>© 2026 Sahel Gourmet. Tous les droits réservés.</p>
          <div>
            <a href="/privacy-policy">Privacy Policy</a>
            <a href="/terms-of-service">Terms of Service</a>
            <a href="/cookie-policy">Cookie Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
