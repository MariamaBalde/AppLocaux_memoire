import { Trash2, Plus, Minus } from 'lucide-react';
import { formatPrice } from '../../utils/formatPrice';
import { resolveImageUrl } from '../../utils/imageUrl';

function getCartProduct(item) {
  if (item.product) return item.product;
  return item;
}

export default function CartItem({ item, onUpdateQuantity, onRemove }) {
  const product = getCartProduct(item);
  const quantity = Number(item.quantity || 1);
  const stock = Number(product.stock || 9999);
  const unitPrice = Number(product.price || item.price || 0);

  const productImage = Array.isArray(product.images) && product.images.length > 0
    ? resolveImageUrl(product.images[0], 'https://via.placeholder.com/100')
    : resolveImageUrl(product.image, 'https://via.placeholder.com/100');

  const productName = product.name || 'Produit';
  const vendorName = product.vendeur?.user?.name || product.vendor?.name;
  const subtotal = unitPrice * quantity;

  const cartItemId = item.id;

  return (
    <div className="flex items-center space-x-4 rounded-lg bg-white p-4 shadow">
      <img src={productImage} alt={productName} className="h-20 w-20 rounded object-cover" />

      <div className="flex-1">
        <h3 className="font-semibold text-gray-800">{productName}</h3>
        <p className="text-sm text-gray-500">{formatPrice(unitPrice)} × {quantity}</p>
        {vendorName && <p className="mt-1 text-sm text-gray-600">Vendeur: {vendorName}</p>}
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => onUpdateQuantity(cartItemId, quantity - 1)}
          disabled={quantity <= 1}
          className="rounded bg-gray-100 p-1 hover:bg-gray-200 disabled:opacity-50"
          type="button"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-8 text-center font-semibold">{quantity}</span>
        <button
          onClick={() => onUpdateQuantity(cartItemId, quantity + 1)}
          disabled={quantity >= stock}
          className="rounded bg-gray-100 p-1 hover:bg-gray-200 disabled:opacity-50"
          type="button"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="text-right">
        <p className="text-lg font-bold text-primary">{formatPrice(subtotal)}</p>
      </div>

      <button
        onClick={() => onRemove(cartItemId)}
        className="text-red-500 hover:text-red-600"
        title="Retirer du panier"
        type="button"
      >
        <Trash2 className="h-5 w-5" />
      </button>
    </div>
  );
}
