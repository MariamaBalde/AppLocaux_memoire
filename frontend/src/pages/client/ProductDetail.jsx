import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Heart, Share2, Minus, Plus, Star, ArrowLeft } from 'lucide-react';
import Button from '../../components/common/Button';
import ProductCard from '../../components/products/ProductCard';
import Spinner from '../../components/common/Spinner';
import Navbar from '../../components/common/Navbar';
import { formatPrice } from '../../utils/formatPrice';
import { resolveImageUrl } from '../../utils/imageUrl';
import { productService } from '../../services/productService';
import { authService } from '../../services/authService';
import { fxService } from '../../services/fxService';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';
import fallbackProductImage from '../../assets/home/product-bottles-display.jpg';

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

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedDelivery, setSelectedDelivery] = useState('local');
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    fetchProductData();
    setSelectedImage(0);
    setQuantity(1);
    setSelectedDelivery('local');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProductData = async () => {
    try {
      setLoading(true);

      const productRes = await productService.getProduct(id);
      if (productRes?.success && productRes?.data) {
        setProduct(productRes.data);

        try {
          const similarRes = await productService.getSimilarProducts(id);
          if (similarRes?.success) {
            setSimilarProducts(Array.isArray(similarRes.data) ? similarRes.data : []);
          } else {
            setSimilarProducts([]);
          }
        } catch {
          setSimilarProducts([]);
        }
      } else {
        toast.error('Produit non trouvé');
        navigate('/products');
      }
    } catch (error) {
      toast.error(getErrorMessage(error, 'Erreur lors du chargement du produit'));
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async ({ closeAfterAdd = false } = {}) => {
    if (!authService.isAuthenticated()) {
      toast.error('Veuillez vous connecter pour ajouter au panier');
      navigate('/login');
      return false;
    }

    if (!product) return false;

    if (quantity > product.stock) {
      toast.error(`Stock maximum : ${product.stock}`);
      return false;
    }

    try {
      setAddingToCart(true);
      const success = await addToCart(product.id, quantity);
      if (!success) {
        toast.error('Impossible d\'ajouter ce produit au panier');
        return false;
      }

      toast.success('Produit ajouté au panier');
      setQuantity(1);
      if (closeAfterAdd) {
        navigate('/products');
      }
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, 'Erreur lors de l\'ajout au panier'));
      return false;
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    const added = await handleAddToCart({ closeAfterAdd: false });
    if (added) {
      navigate('/cart');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <Spinner size="xl" />
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center text-gray-600">
          Produit non trouvé
        </div>
      </>
    );
  }

  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images.map((image) => resolveImageUrl(image, fallbackProductImage))
    : [resolveImageUrl(product.image || product.image_url, fallbackProductImage)];

  const safeSelectedImage = Math.min(selectedImage, images.length - 1);
  const isOutOfStock = Number(product.stock) <= 0;
  const maxQuantity = Math.max(1, Number(product.stock || 1));
  const isQuantityInvalid = quantity < 1 || quantity > maxQuantity;
  const exportUnitPrice = fxService.convertFromXof(Number(product.price || 0), 'EUR');
  const deliveryFee = selectedDelivery === 'intl' ? 2500 : 0;
  const subtotal = Number(product.price || 0) * quantity;
  const total = subtotal + deliveryFee;

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link to="/" className="hover:text-primary">Accueil</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-primary">Produits</Link>
          {product.category?.id && (
            <>
              <span>/</span>
              <Link to={`/products?category_id=${product.category.id}`} className="hover:text-primary">
                {product.category?.name || 'Catégorie'}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-gray-900 line-clamp-1">{product.name}</span>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-primary mb-6"
          type="button"
        >
          <ArrowLeft className="h-5 w-5" />
          Retour
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div>
            <div className="bg-gray-100 rounded-lg mb-4 overflow-hidden">
              <img
                src={images[safeSelectedImage]}
                alt={product.name}
                className="w-full h-96 object-cover"
              />
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    onClick={() => setSelectedImage(index)}
                    className={`border-2 rounded-lg overflow-hidden ${
                      safeSelectedImage === index ? 'border-primary' : 'border-gray-200'
                    }`}
                    type="button"
                  >
                    <img
                      src={image}
                      alt={`${product.name} - ${index + 1}`}
                      className="w-full h-20 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            {isOutOfStock ? (
              <span className="inline-block bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold mb-4">
                Rupture de stock
              </span>
            ) : Number(product.stock) < 10 && (
              <span className="inline-block bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-semibold mb-4">
                Plus que {product.stock} en stock
              </span>
            )}

            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

            {product.category?.id && (
              <Link
                to={`/products?category_id=${product.category.id}`}
                className="text-primary hover:underline mb-4 inline-block"
              >
                {product.category?.name}
              </Link>
            )}

            <div className="mb-6">
              <p className="text-4xl font-bold text-primary">
                {formatPrice(product.price)}
              </p>
            </div>

            <div className="bg-amber-50 rounded-lg p-4 mb-6 border border-amber-100">
              <h3 className="font-semibold mb-3">Prix local vs export</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Prix local (FCFA):</span>
                  <span className="font-semibold">{formatPrice(product.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Prix export (€):</span>
                  <span className="font-semibold">≈ €{exportUnitPrice.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm font-semibold mb-2">Options de livraison</p>
                <div className="space-y-2">
                  <label className="flex items-center justify-between rounded-md border border-amber-100 bg-white px-3 py-2">
                    <span>Livraison locale</span>
                    <input
                      type="radio"
                      name="delivery-option"
                      checked={selectedDelivery === 'local'}
                      onChange={() => setSelectedDelivery('local')}
                    />
                  </label>
                  <label className="flex items-center justify-between rounded-md border border-amber-100 bg-white px-3 py-2">
                    <span>Expédition internationale</span>
                    <input
                      type="radio"
                      name="delivery-option"
                      checked={selectedDelivery === 'intl'}
                      onChange={() => setSelectedDelivery('intl')}
                    />
                  </label>
                </div>
              </div>

              <div className="mt-4 space-y-1 border-t border-amber-100 pt-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sous-total:</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Livraison:</span>
                  <span>{deliveryFee ? formatPrice(deliveryFee) : 'Gratuite'}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">Vendu par</p>
              <p className="font-semibold text-lg">
                {product.vendeur?.shop_name || product.vendor?.name || 'Vendeur'}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(product.vendeur?.rating || product.vendor?.rating || 0)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  ({product.vendeur?.rating || product.vendor?.rating || 0}/5)
                </span>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold mb-3">Caractéristiques</h3>
              <div className="space-y-2 text-sm">
                {product.weight && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Poids :</span>
                    <span className="font-medium">{product.weight} kg</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Stock disponible :</span>
                  <span className="font-medium">{product.stock}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Référence :</span>
                  <span className="font-medium">#{product.id}</span>
                </div>
              </div>
            </div>

            {!isOutOfStock && (
              <>
                <div className="mb-6">
                  <label className="block font-semibold mb-2">Quantité</label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-4 py-2 hover:bg-gray-100"
                        disabled={quantity <= 1 || addingToCart}
                        type="button"
                      >
                        <Minus className="h-5 w-5" />
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10) || 1;
                          setQuantity(Math.min(Math.max(1, val), Number(product.stock)));
                        }}
                        className="w-16 text-center border-x border-gray-300 py-2"
                        min="1"
                        max={product.stock}
                        disabled={addingToCart}
                      />
                      <button
                        onClick={() => setQuantity(Math.min(Number(product.stock), quantity + 1))}
                        className="px-4 py-2 hover:bg-gray-100"
                        disabled={quantity >= Number(product.stock) || addingToCart}
                        type="button"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    </div>
                    <span className="text-gray-600">
                      {product.stock} disponible{Number(product.stock) > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <Button
                    onClick={() => handleAddToCart({ closeAfterAdd: true })}
                    loading={addingToCart}
                    className="flex-1"
                    disabled={isQuantityInvalid || addingToCart}
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Ajouter au panier
                  </Button>
                  <Button
                    onClick={handleBuyNow}
                    variant="outline"
                    className="flex-1"
                    disabled={isQuantityInvalid || addingToCart}
                  >
                    Acheter maintenant
                  </Button>
                </div>
              </>
            )}

            <div className="flex gap-4">
              <button
                className="flex items-center gap-2 text-gray-600 hover:text-primary"
                type="button"
                onClick={() => toast.success('Ajouté aux favoris')}
              >
                <Heart className="h-5 w-5" />
                <span>Ajouter aux favoris</span>
              </button>
              <button
                className="flex items-center gap-2 text-gray-600 hover:text-primary"
                type="button"
                onClick={() => toast('Fonctionnalité partage bientôt disponible')}
              >
                <Share2 className="h-5 w-5" />
                <span>Partager</span>
              </button>
            </div>
          </div>
        </div>

        {similarProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Produits similaires</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarProducts.map((similarProduct) => (
                <ProductCard key={similarProduct.id} product={similarProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
