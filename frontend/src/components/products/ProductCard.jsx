import { Link } from 'react-router-dom';
import { Heart, MapPin, Plus, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/formatPrice';
import { resolveImageUrl } from '../../utils/imageUrl';
import fallbackProductImage from '../../assets/home/product-bottles-display.jpg';
import './ProductCard.css';

function getProductImage(product) {
  if (Array.isArray(product.images) && product.images.length > 0) {
    return resolveImageUrl(product.images[0], fallbackProductImage);
  }
  if (product.image_url) return resolveImageUrl(product.image_url, fallbackProductImage);
  if (product.image) return resolveImageUrl(product.image, fallbackProductImage);
  return fallbackProductImage;
}

function getCategoryLabel(product) {
  if (typeof product.category === 'string') return product.category;
  return product.category?.name || 'Produit local';
}

function getVendorName(product) {
  return product.vendeur?.shop_name || product.vendeur?.user?.name || product.vendor?.name || 'Vendeur';
}

function getVendorRating(product) {
  const rating = Number(product._meta?.vendorRating || product.vendeur?.rating || product.vendor?.rating || 4.5);
  if (Number.isNaN(rating)) return 4.5;
  return Math.max(0, Math.min(5, rating));
}

function getBadge(product) {
  const seed = Number(product?.id || 1);
  if (product?._meta?.deliveryIntl && seed % 2 === 0) return { text: '✈ Intl', kind: 'intl' };
  if (seed % 3 === 0) return { text: 'Nouveau', kind: 'new' };
  return { text: 'Populaire', kind: 'hot' };
}

function getCardTone(product) {
  const tones = [
    { bg: '#e6d5b3', surface: '#efe1c8' },
    { bg: '#e2bf94', surface: '#ecd0ae' },
    { bg: '#bfd9ad', surface: '#d4e8c9' },
    { bg: '#e3c9ae', surface: '#ecd8c4' },
  ];

  const seed = Number(product.category_id || product.category?.id || product.id || 1);
  return tones[Math.abs(seed) % tones.length];
}

function ratingStars(rating) {
  const full = Math.round(rating);
  return '★'.repeat(full).padEnd(5, '☆');
}

function getReviewsCount(product) {
  const seed = Number(product?.id || 1);
  return 20 + ((seed * 7) % 130);
}

export default function ProductCard({ product }) {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const handleAddToCart = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Veuillez vous connecter pour ajouter au panier');
      return;
    }

    const success = await addToCart(product.id, 1);
    if (success) {
      toast.success('Produit ajouté au panier');
    } else {
      toast.error('Erreur lors de l\'ajout au panier');
    }
  };

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    toast.success('Ajouté aux favoris');
  };

  const productImage = getProductImage(product);
  const badge = getBadge(product);
  const tone = getCardTone(product);
  const vendorName = getVendorName(product);
  const rating = getVendorRating(product);
  const reviews = getReviewsCount(product);
  const origin = product?._meta?.origin || 'Dakar';
  const vendorInitials = vendorName
    .split(' ')
    .slice(0, 2)
    .map((part) => part?.[0]?.toUpperCase() || '')
    .join('');

  return (
    <article className="product-card-catalog">
      <Link to={`/products/${product.id}`} className="card-top" style={{ background: tone.surface }}>
        <span className={`product-mini-badge ${badge.kind}`}>{badge.text}</span>

        <button
          type="button"
          onClick={handleFavoriteClick}
          className="favorite-circle"
          aria-label="Ajouter aux favoris"
        >
          <Heart size={16} />
        </button>

        <div className="product-image-wrap" style={{ background: tone.bg }}>
          <img src={productImage} alt={product.name} className="product-image-visual" loading="lazy" />
        </div>
      </Link>

      <div className="card-content">
        <p className="product-origin">
          <MapPin size={12} /> {origin}, Senegal
        </p>

        <Link to={`/products/${product.id}`} className="product-name-link">
          <h3>{product.name}</h3>
        </Link>

        <div className="vendor-row">
          <span className="vendor-avatar" aria-hidden="true">{vendorInitials || 'V'}</span>
          <p className="vendor-name">{vendorName}</p>
        </div>

        <div className="vendor-rating">
          <span className="stars" aria-hidden="true">{ratingStars(rating)}</span>
          <Star size={12} fill="currentColor" />
          <span>{rating.toFixed(1)} ({reviews} avis)</span>
        </div>

        <p className="product-meta">
          {Number(product.weight) > 0 ? `${product.weight}g` : 'Produit artisanal'} - {getCategoryLabel(product)}
        </p>

        <div className="product-bottom-row">
          <div>
            <p className="product-price">{formatPrice(product.price)}</p>
            <p className="product-subprice">
              {Number(product.stock) === 0
                ? 'Indisponible temporairement'
                : Number(product.stock) < 10
                  ? `${product.stock} restants`
                  : 'Disponible'}
            </p>
          </div>

          {Number(product.stock) > 0 && (
            <button type="button" className="add-circle" onClick={handleAddToCart} aria-label="Ajouter au panier">
              <Plus size={22} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
