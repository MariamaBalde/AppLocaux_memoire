import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Check,
  ShieldCheck,
  Star,
  Trash2,
  Truck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Spinner from '../../components/common/Spinner';
import { formatPrice } from '../../utils/formatPrice';
import { resolveImageUrl } from '../../utils/imageUrl';
import { cartService } from '../../services/cartService';
import { authService } from '../../services/authService';
import { fxService } from '../../services/fxService';
import { useCart } from '../../context/CartContext';
import { useI18n } from '../../context/I18nContext';
import toast from 'react-hot-toast';

const PROMO_CODE = 'DIASPORA10';
const SHIPPING_PRESETS = {
  dhl: { label: 'DHL Express International', eta: 'Livraison 5-8 jours', price: 7000 },
  chrono: { label: 'Chronopost Economique', eta: 'Livraison 10-14 jours', price: 5200 },
  groupage: { label: 'Groupage inter-vendeurs', eta: 'Expedie ensemble - Tarif reduit', price: 2000 },
};

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

function normalizeCart(payload) {
  const data = payload?.data || payload || {};
  const items = Array.isArray(data.items) ? data.items : [];
  const subtotal = Number(data.subtotal ?? data.total ?? data.total_amount ?? 0);

  return {
    ...data,
    items,
    items_count: Number(data.items_count ?? items.length),
    subtotal,
  };
}

function getCartProduct(item) {
  return item?.product || item;
}

function getVendorInfo(item) {
  const product = getCartProduct(item);
  const vendorId = product?.vendeur?.id || product?.vendor?.id || product?.vendeur_id || 'vendor';
  const vendorName = product?.vendeur?.shop_name || product?.vendeur?.user?.name || product?.vendor?.name || 'Boutique locale';
  const rating = Number(product?.vendeur?.rating || product?.vendor?.rating || 4.8).toFixed(1);
  const cityPool = ['Dakar', 'Kaolack', 'Thies', 'Ziguinchor'];
  const city = cityPool[Math.abs(Number(product?.id || 1)) % cityPool.length];
  const initials = vendorName
    .split(' ')
    .slice(0, 2)
    .map((part) => part?.[0]?.toUpperCase() || '')
    .join('');

  return {
    key: String(vendorId),
    name: vendorName,
    rating,
    city,
    initials: initials || 'V',
  };
}

function getItemImage(item) {
  const product = getCartProduct(item);
  if (Array.isArray(product.images) && product.images.length > 0) {
    return resolveImageUrl(product.images[0], 'https://via.placeholder.com/100');
  }
  return resolveImageUrl(product.image || product.image_url, 'https://via.placeholder.com/100');
}

function getAddressFromUser() {
  const user = authService.getCurrentUser();
  return {
    id: 'addr-1',
    name: user?.name || 'Client',
    line1: user?.address || '12 rue de la Paix, Appartement 4B',
    cityCountry: `${user?.city || 'Paris'}, ${user?.country || 'France'}`,
    phone: user?.phone || '+33 6 12 34 56 78',
  };
}

export default function Cart() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { refreshCart: refreshCartContext } = useCart();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyItemId, setBusyItemId] = useState(null);
  const [selectedItems, setSelectedItems] = useState({});
  const [shippingByVendor, setShippingByVendor] = useState({});
  const [promoInput, setPromoInput] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [addresses, setAddresses] = useState([getAddressFromUser()]);
  const [selectedAddressId, setSelectedAddressId] = useState('addr-1');
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ name: '', line1: '', cityCountry: '', phone: '' });

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await cartService.getCart();
      const normalized = normalizeCart(response);
      setCart(normalized);

      const nextSelected = {};
      const nextShipping = {};
      normalized.items.forEach((item) => {
        nextSelected[item.id] = true;
        const vendor = getVendorInfo(item);
        if (!nextShipping[vendor.key]) nextShipping[vendor.key] = 'dhl';
      });
      setSelectedItems(nextSelected);
      setShippingByVendor(nextShipping);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Erreur lors du chargement du panier'));
      setCart({ items: [], items_count: 0, subtotal: 0 });
    } finally {
      setLoading(false);
    }
  };

  const groupedByVendor = useMemo(() => {
    const sourceItems = Array.isArray(cart?.items) ? cart.items : [];
    const groups = {};

    sourceItems.forEach((item) => {
      const vendor = getVendorInfo(item);
      if (!groups[vendor.key]) {
        groups[vendor.key] = { vendor, items: [] };
      }
      groups[vendor.key].items.push(item);
    });

    return Object.values(groups);
  }, [cart]);

  const selectedItemList = useMemo(() => {
    const sourceItems = Array.isArray(cart?.items) ? cart.items : [];
    return sourceItems.filter((item) => selectedItems[item.id]);
  }, [cart, selectedItems]);

  const subtotal = useMemo(() => {
    return selectedItemList.reduce((sum, item) => {
      const product = getCartProduct(item);
      const unitPrice = Number(product.price || item.price || 0);
      const quantity = Number(item.quantity || 1);
      return sum + unitPrice * quantity;
    }, 0);
  }, [selectedItemList]);

  const shippingCost = useMemo(() => {
    const vendorHasSelectedItems = {};
    selectedItemList.forEach((item) => {
      const vendor = getVendorInfo(item);
      vendorHasSelectedItems[vendor.key] = true;
    });

    return Object.keys(vendorHasSelectedItems).reduce((sum, vendorKey) => {
      const choice = shippingByVendor[vendorKey] || 'dhl';
      return sum + (SHIPPING_PRESETS[choice]?.price || 0);
    }, 0);
  }, [selectedItemList, shippingByVendor]);

  const serviceFee = Math.round(subtotal * 0.05);
  const promoDiscount = promoApplied ? Math.round(subtotal * 0.1) : 0;
  const total = Math.max(0, subtotal + shippingCost + serviceFee - promoDiscount);
  const totalEur = fxService.convertFromXof(total, 'EUR');
  const selectedCount = selectedItemList.length;

  const toggleVendorSelection = (vendorKey, checked) => {
    setSelectedItems((prev) => {
      const next = { ...prev };
      const group = groupedByVendor.find((entry) => entry.vendor.key === vendorKey);
      if (!group) return prev;
      group.items.forEach((item) => {
        next[item.id] = checked;
      });
      return next;
    });
  };

  const updateQuantity = async (item, quantity) => {
    const normalizedQuantity = Math.max(1, quantity);
    try {
      setBusyItemId(item.id);
      await cartService.updateCartItem(item.id, normalizedQuantity);
      await Promise.all([fetchCart(), refreshCartContext()]);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Erreur de mise a jour'));
    } finally {
      setBusyItemId(null);
    }
  };

  const removeItem = async (item) => {
    try {
      setBusyItemId(item.id);
      await cartService.removeFromCart(item.id);
      toast.success('Article supprime');
      await Promise.all([fetchCart(), refreshCartContext()]);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Erreur de suppression'));
    } finally {
      setBusyItemId(null);
    }
  };

  const applyPromo = () => {
    if (promoInput.trim().toUpperCase() === PROMO_CODE) {
      setPromoApplied(true);
      setPromoError('');
      toast.success('Code promo applique: -10%');
      return;
    }
    setPromoApplied(false);
    setPromoError('Code invalide');
    toast.error('Code promo invalide');
  };

  const addAddress = () => {
    if (!newAddress.name.trim() || !newAddress.line1.trim()) {
      toast.error('Remplissez au moins le nom et l adresse');
      return;
    }

    const id = `addr-${Date.now()}`;
    setAddresses((prev) => [...prev, { ...newAddress, id }]);
    setSelectedAddressId(id);
    setNewAddress({ name: '', line1: '', cityCountry: '', phone: '' });
    setShowAddAddress(false);
  };

  const goToCheckout = () => {
    if (selectedCount === 0) {
      toast.error('Selectionnez au moins un article');
      return;
    }
    navigate('/checkout');
  };

  if (loading) {
    return (
      <>
        <Navbar variant="catalog" />
        <div className="container mx-auto px-4 py-16">
          <Spinner size="xl" />
        </div>
      </>
    );
  }

  if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
    return (
      <>
        <Navbar variant="catalog" />
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold">Votre panier est vide</h2>
        </div>
      </>
    );
  }

  const selectedAddress = addresses.find((address) => address.id === selectedAddressId) || addresses[0];

  return (
    <>
      <Navbar variant="catalog" />
      <div className="min-h-screen bg-[#f2f1ef] px-6 py-6">
        <div className="mx-auto max-w-[1600px]">
          <div className="mb-8 flex items-center justify-center gap-6 text-sm">
            {[
              { step: 1, label: 'Catalogue', done: true },
              { step: 2, label: 'Panier', active: true },
              { step: 3, label: 'Livraison' },
              { step: 4, label: 'Paiement' },
              { step: 5, label: 'Confirmation' },
            ].map((item, index, arr) => (
              <div key={item.step} className="flex items-center gap-2">
                <span
                  className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                    item.done
                      ? 'bg-green-700 text-white'
                      : item.active
                        ? 'bg-[#cb6b2f] text-white'
                      : 'bg-transparent text-[#3f2d23]'
                  }`}
                >
                  {item.done ? <Check className="h-4 w-4" /> : item.step}
                </span>
                <span className={item.active ? 'font-semibold text-[#cb6b2f]' : 'text-[#3f2d23]'}>
                  {item.step === 2 ? t('cart_title') : item.label}
                </span>
                {index < arr.length - 1 && <span className="mx-2 h-px w-10 bg-[#9ab082]" />}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_360px]">
            <div className="space-y-7">
              <section>
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-[#2c1c14]">Adresse de livraison</h2>
                  <button type="button" className="text-sm text-[#cb6b2f]">Modifier</button>
                </div>

                <div className="rounded border border-[#dfcfc1] bg-white p-4">
                  <p className="font-semibold text-[#2f2119]">{selectedAddress?.name}</p>
                  <p className="text-sm text-[#655548]">{selectedAddress?.line1}</p>
                  <p className="text-sm text-[#655548]">{selectedAddress?.cityCountry}</p>
                  <p className="text-sm text-[#655548]">{selectedAddress?.phone}</p>
                </div>

                <div className="mt-4 text-center">
                  <button
                    type="button"
                    className="text-sm font-semibold text-[#3b2b22]"
                    onClick={() => setShowAddAddress((value) => !value)}
                  >
                    + Ajouter une nouvelle adresse
                  </button>
                </div>

                {showAddAddress && (
                  <div className="mt-4 grid gap-2 rounded border border-[#dfcfc1] bg-white p-4 md:grid-cols-2">
                    <input
                      className="rounded border border-[#d4c7ba] px-3 py-2"
                      placeholder="Nom"
                      value={newAddress.name}
                      onChange={(e) => setNewAddress((prev) => ({ ...prev, name: e.target.value }))}
                    />
                    <input
                      className="rounded border border-[#d4c7ba] px-3 py-2"
                      placeholder="Telephone"
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress((prev) => ({ ...prev, phone: e.target.value }))}
                    />
                    <input
                      className="rounded border border-[#d4c7ba] px-3 py-2 md:col-span-2"
                      placeholder="Adresse complete"
                      value={newAddress.line1}
                      onChange={(e) => setNewAddress((prev) => ({ ...prev, line1: e.target.value }))}
                    />
                    <input
                      className="rounded border border-[#d4c7ba] px-3 py-2 md:col-span-2"
                      placeholder="Ville, Pays"
                      value={newAddress.cityCountry}
                      onChange={(e) => setNewAddress((prev) => ({ ...prev, cityCountry: e.target.value }))}
                    />
                    <div className="md:col-span-2">
                      <button type="button" onClick={addAddress} className="rounded bg-[#cb6b2f] px-4 py-2 text-white">
                        Enregistrer l adresse
                      </button>
                    </div>
                  </div>
                )}
              </section>

              <section>
                <h2 className="mb-4 text-lg font-semibold text-[#2c1c14]">
                  Articles du panier ({cart.items.length} articles)
                </h2>

                <div className="space-y-6">
                  {groupedByVendor.map((group, vendorIndex) => {
                    const isAllSelected = group.items.every((item) => selectedItems[item.id]);
                    return (
                      <div key={group.vendor.key} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#a46233] text-xs font-semibold text-white">
                              {group.vendor.initials}
                            </span>
                            <div>
                              <p className="font-semibold">{group.vendor.name}</p>
                              <p className="text-xs text-[#6a594b]">★ {group.vendor.rating} - {group.vendor.city}, Senegal</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="text-xs text-[#2e1e15]"
                            onClick={() => toggleVendorSelection(group.vendor.key, !isAllSelected)}
                          >
                            {isAllSelected ? 'Tout deselectionner' : 'Tout selectionner'}
                          </button>
                        </div>

                        {group.items.map((item) => {
                          const product = getCartProduct(item);
                          const quantity = Number(item.quantity || 1);
                          const stock = Number(product.stock || 9999);
                          const unitPrice = Number(product.price || item.price || 0);
                          const subtotalLine = unitPrice * quantity;

                          return (
                            <div key={item.id} className="grid grid-cols-[24px_64px_1fr_auto] items-center gap-3">
                              <input
                                type="checkbox"
                                checked={Boolean(selectedItems[item.id])}
                                onChange={(e) => setSelectedItems((prev) => ({ ...prev, [item.id]: e.target.checked }))}
                              />
                              <img src={getItemImage(item)} alt={product.name} className="h-16 w-16 rounded object-cover" />

                              <div>
                                <p className="font-semibold text-[#2a1a13]">{product.name}</p>
                                <p className="text-xs text-[#6f6053]">
                                  {product.weight ? `${product.weight}g` : '500g'} - {product.category?.name || 'Artisanal'}
                                </p>
                                <div className="mt-1 flex items-center gap-3 text-sm">
                                  <button
                                    type="button"
                                    className="font-bold"
                                    onClick={() => updateQuantity(item, quantity - 1)}
                                    disabled={quantity <= 1 || busyItemId === item.id}
                                  >
                                    −
                                  </button>
                                  <span>{quantity}</span>
                                  <button
                                    type="button"
                                    className="font-bold"
                                    onClick={() => updateQuantity(item, quantity + 1)}
                                    disabled={quantity >= stock || busyItemId === item.id}
                                  >
                                    +
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => toast.success('Ajouté aux favoris')}
                                    className="text-xs text-[#2f1f16]"
                                  >
                                    ♥ Favoris
                                  </button>
                                </div>
                              </div>

                              <div className="text-right">
                                <p className="font-semibold">{formatPrice(subtotalLine)}</p>
                                <p className="text-xs text-[#6f6053]">{quantity} x {formatPrice(unitPrice)}</p>
                                <button
                                  type="button"
                                  className="mt-1 inline-flex text-red-600"
                                  onClick={() => removeItem(item)}
                                  title="Supprimer"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}

                        <div className="rounded border border-[#e3d6ca] bg-white p-3">
                          <p className="mb-2 text-sm font-semibold uppercase tracking-wide">Options de livraison</p>
                          <div className="space-y-2">
                            {[...['dhl', 'chrono'], ...(vendorIndex > 0 ? ['groupage'] : [])].map((option) => (
                              <label key={option} className="flex items-center justify-between rounded bg-[#f6f3f0] px-3 py-2">
                                <span>
                                  <span className="font-medium">{SHIPPING_PRESETS[option].label}</span>
                                  <span className="block text-xs text-[#6f6053]">{SHIPPING_PRESETS[option].eta}</span>
                                </span>
                                <span className={SHIPPING_PRESETS[option].price < 0 ? 'text-green-700' : ''}>
                                  {SHIPPING_PRESETS[option].price < 0 ? `−${formatPrice(Math.abs(SHIPPING_PRESETS[option].price))}` : formatPrice(SHIPPING_PRESETS[option].price)}
                                </span>
                                <input
                                  type="radio"
                                  name={`ship-${group.vendor.key}`}
                                  checked={(shippingByVendor[group.vendor.key] || 'dhl') === option}
                                  onChange={() => setShippingByVendor((prev) => ({ ...prev, [group.vendor.key]: option }))}
                                />
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="rounded border border-[#dfd3c7] bg-white p-4">
                <p className="mb-2 font-semibold">Code promo</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => {
                      setPromoInput(e.target.value);
                      setPromoError('');
                    }}
                    placeholder="Entrez votre code promo..."
                    className="flex-1 rounded border border-[#d7cbbf] px-3 py-2"
                  />
                  <button type="button" className="rounded bg-[#cb6b2f] px-4 py-2 text-white" onClick={applyPromo}>
                    Appliquer
                  </button>
                </div>
                {promoError && <p className="mt-2 text-sm text-red-600">{promoError}</p>}
              </section>
            </div>

            <aside className="h-fit rounded border border-[#dfd3c7] bg-white p-5 xl:sticky xl:top-20">
              <h3 className="mb-4 text-lg font-semibold">Resume de la commande</h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Sous-total ({selectedCount} articles)</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Frais expedition</span>
                  <span>{formatPrice(shippingCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Frais de service AfriMarket</span>
                  <span>{formatPrice(serviceFee)}</span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between text-green-700">
                    <span>Promo {PROMO_CODE} (−10%)</span>
                    <span>−{formatPrice(promoDiscount)}</span>
                  </div>
                )}
              </div>

              <div className="my-4 border-t border-[#e3d7cc] pt-3">
                <div className="flex justify-between text-2xl font-semibold text-[#cb6b2f]">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <p className="text-right text-xs text-[#665548]">≈ €{totalEur.toFixed(2)}</p>
              </div>

              <p className="mb-2 text-sm font-semibold">Mode de paiement</p>
              <div className="mb-4 space-y-2">
                {[
                  { key: 'card', label: 'Carte bancaire (Visa / Mastercard)' },
                  { key: 'orange', label: 'Orange Money' },
                  { key: 'wave', label: 'Wave' },
                  { key: 'paypal', label: 'PayPal' },
                ].map((method) => (
                  <label key={method.key} className="flex items-center justify-between rounded bg-[#f6f3f0] px-3 py-2">
                    <span className="text-sm">{method.label}</span>
                    <input
                      type="radio"
                      name="payment-method"
                      checked={paymentMethod === method.key}
                      onChange={() => setPaymentMethod(method.key)}
                    />
                  </label>
                ))}
              </div>

              <button
                type="button"
                onClick={goToCheckout}
                className="mb-3 w-full rounded bg-[#cb6b2f] px-4 py-3 font-semibold text-white"
              >
                Confirmer et payer <ArrowRight className="inline h-4 w-4" />
              </button>
              <p className="mb-4 text-center text-xs text-[#5f5145]">Paiement 100% securise - SSL chiffre</p>

              <div className="space-y-2 text-sm">
                {[
                  { icon: ShieldCheck, text: 'Achat protege - Remboursement garanti' },
                  { icon: Star, text: 'Vendeurs verifies - Controle AfriMarket' },
                  { icon: Truck, text: 'Suivi international - Tracking sous 24h' },
                  { icon: ArrowRight, text: 'Retour facile - 14 jours' },
                ].map((item) => (
                  <div key={item.text} className="flex items-start gap-2 rounded bg-[#f6f3f0] p-2">
                    <item.icon className="mt-0.5 h-4 w-4 text-[#2f1f16]" />
                    <p>{item.text}</p>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
