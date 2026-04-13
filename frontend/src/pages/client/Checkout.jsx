import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreditCard, Truck, CheckCircle } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { formatPrice } from '../../utils/formatPrice';
import { resolveImageUrl } from '../../utils/imageUrl';
import { SHIPPING_METHODS, PAYMENT_METHODS } from '../../utils/constants';
import { cartService } from '../../services/cartService';
import { orderService } from '../../services/orderService';
import { paymentService } from '../../services/paymentService';
import { shippingService } from '../../services/shippingService';
import { authService } from '../../services/authService';
import { useI18n } from '../../context/I18nContext';
import toast from 'react-hot-toast';
import { checkoutSchema } from '../../utils/formSchemas';

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

function normalizeFieldErrors(error) {
  const errors = error?.errors;
  if (!errors || typeof errors !== 'object') return {};

  const normalized = {};
  Object.entries(errors).forEach(([field, messages]) => {
    if (Array.isArray(messages) && messages[0]) {
      normalized[field] = String(messages[0]);
    } else if (typeof messages === 'string') {
      normalized[field] = messages;
    }
  });

  return normalized;
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

function getItemProduct(item) {
  return item?.product || item;
}

function toBackendShippingMethod(method) {
  if (method === 'local') return 'standard';
  if (method === 'international') return 'express';
  if (method === 'diaspora') return 'pickup';
  return method || 'standard';
}

export default function Checkout() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [fieldErrors, setFieldErrors] = useState({});
  const [estimatedShippingCost, setEstimatedShippingCost] = useState(0);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shipping_address: '',
      shipping_city: '',
      shipping_country: 'Sénégal',
      shipping_phone: '',
      shipping_method: 'local',
      payment_method: 'wave',
      notes: '',
    },
  });

  useEffect(() => {
    fetchCart();
    prefillUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await cartService.getCart();
      const normalized = normalizeCart(response);

      if (!normalized.items || normalized.items.length === 0) {
        toast.error('Votre panier est vide');
        navigate('/cart');
        return;
      }

      setCart(normalized);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Erreur lors du chargement du panier'));
      navigate('/cart');
    } finally {
      setLoading(false);
    }
  };

  const prefillUserData = () => {
    const user = authService.getCurrentUser();
    if (user) {
      setValue('shipping_address', user.address || '');
      setValue('shipping_country', user.country || 'Sénégal');
      setValue('shipping_phone', user.phone || '');
    }
  };
  const formData = watch();

  useEffect(() => {
    let active = true;

    const estimateShipping = async () => {
      if (!cart) return;

      try {
        const destinationRaw = String(formData.shipping_country || '').trim();
        const destinationCountry = destinationRaw.length === 2 ? destinationRaw.toUpperCase() : 'SN';

        const cost = await shippingService.estimate({
          shippingMethod: toBackendShippingMethod(formData.shipping_method),
          destinationCountry,
          subtotal: Number(cart.subtotal || 0),
          weightKg: 1,
        });
        if (active) {
          setEstimatedShippingCost(Number.isFinite(cost) ? cost : 0);
        }
      } catch {
        if (active) {
          // Fallback local aligné sur les règles backend MVP.
          const subtotal = Number(cart.subtotal || 0);
          if (subtotal >= 50000) {
            setEstimatedShippingCost(0);
            return;
          }

          const method = toBackendShippingMethod(formData.shipping_method);
          const fallbackCost = method === 'express' ? 5000 : method === 'pickup' ? 0 : 3000;
          setEstimatedShippingCost(fallbackCost);
        }
      }
    };

    estimateShipping();

    return () => {
      active = false;
    };
  }, [cart, formData.shipping_method, formData.shipping_country]);

  const calculateShippingCost = () => {
    return Number(estimatedShippingCost || 0);
  };

  const calculateTotal = () => {
    if (!cart) return 0;
    return cart.subtotal + calculateShippingCost();
  };

  const validateStep1 = async () => {
    const valid = await trigger(['shipping_address', 'shipping_city', 'shipping_phone']);
    if (!valid) toast.error('Veuillez corriger les champs de livraison');
    return valid;
  };

  const handleNextStep = async () => {
    if (submitting) return;
    if (currentStep === 1 && !(await validateStep1())) return;
    if (currentStep >= 3) return;
    setCurrentStep((prev) => prev + 1);
  };

  const handleSubmitOrder = async (values) => {
    if (submitting) return;

    if (!(await validateStep1())) {
      setCurrentStep(1);
      return;
    }

    try {
      setSubmitting(true);
      setFieldErrors({});

      const orderData = {
        shipping_address: `${values.shipping_address}, ${values.shipping_city}, ${values.shipping_country}`,
        shipping_method: toBackendShippingMethod(values.shipping_method),
        payment_method: values.payment_method,
        notes: values.notes,
      };

      const response = await orderService.createOrder(orderData);

      if (response?.success) {
        toast.success('Commande créée avec succès !');

        const orderId = response?.data?.order?.id || response?.data?.id || response?.order?.id;
        if (!orderId) {
          navigate('/orders');
          return;
        }

        try {
          const paymentResponse = await paymentService.initiatePayment({ order_id: orderId });
          const paymentUrl = paymentResponse?.data?.payment_url || paymentResponse?.payment_url;

          if (paymentUrl) {
            toast.success('Redirection vers le paiement...');
            navigate(
              `/checkout/payment?order_id=${encodeURIComponent(String(orderId))}&payment_url=${encodeURIComponent(paymentUrl)}`
            );
            return;
          }
        } catch (paymentError) {
          toast.error(getErrorMessage(paymentError, 'Paiement non initialisé, redirection vers la commande.'));
        }

        navigate(`/orders/${orderId}/confirmation`);
      } else {
        toast.error(getErrorMessage(response, 'Erreur lors de la creation de la commande'));
      }
    } catch (error) {
      if (error?.status === 409) {
        toast.error(getErrorMessage(error, 'Produit épuisé ou stock insuffisant'));
      } else {
        const normalizedErrors = normalizeFieldErrors(error);
        if (Object.keys(normalizedErrors).length > 0) {
          setFieldErrors(normalizedErrors);
        }
        toast.error(getErrorMessage(error, 'Erreur lors de la creation de la commande'));
      }
    } finally {
      setSubmitting(false);
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

  if (!cart) return null;

  const shippingCost = calculateShippingCost();
  const total = calculateTotal();

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">{t('checkout_title')}</h1>

        <div className="flex items-center justify-center mb-8 overflow-x-auto">
          <div className="flex items-center min-w-max">
            <div className={`flex items-center ${currentStep >= 1 ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep >= 1 ? 'bg-primary text-white' : 'bg-gray-200'
              }`}>
                1
              </div>
              <span className="ml-2 font-medium">{t('checkout_delivery')}</span>
            </div>

            <div className={`w-16 h-1 mx-4 ${currentStep >= 2 ? 'bg-primary' : 'bg-gray-200'}`} />

            <div className={`flex items-center ${currentStep >= 2 ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep >= 2 ? 'bg-primary text-white' : 'bg-gray-200'
              }`}>
                2
              </div>
              <span className="ml-2 font-medium">{t('checkout_payment')}</span>
            </div>

            <div className={`w-16 h-1 mx-4 ${currentStep >= 3 ? 'bg-primary' : 'bg-gray-200'}`} />

            <div className={`flex items-center ${currentStep >= 3 ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep >= 3 ? 'bg-primary text-white' : 'bg-gray-200'
              }`}>
                3
              </div>
              <span className="ml-2 font-medium">{t('checkout_confirmation')}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              {currentStep === 1 && (
                <div>
                  <h2 className="text-xl font-bold mb-6 flex items-center">
                    <Truck className="h-6 w-6 mr-2 text-primary" />
                    Informations de livraison
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block font-semibold mb-2">Adresse complète *</label>
                      <input
                        type="text"
                        {...register('shipping_address')}
                        placeholder="Ex: 15 Rue de la République"
                        className="input"
                        required
                        disabled={submitting}
                      />
                      {(errors.shipping_address?.message || fieldErrors.shipping_address) && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.shipping_address?.message || fieldErrors.shipping_address}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold mb-2">Ville *</label>
                        <input
                          type="text"
                          {...register('shipping_city')}
                          placeholder="Ex: Dakar"
                          className="input"
                          required
                          disabled={submitting}
                        />
                        {(errors.shipping_city?.message || fieldErrors.shipping_city) && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors.shipping_city?.message || fieldErrors.shipping_city}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block font-semibold mb-2">Pays *</label>
                        <select
                          {...register('shipping_country')}
                          className="input"
                          disabled={submitting}
                        >
                          <option value="Sénégal">Sénégal</option>
                          <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                          <option value="Mali">Mali</option>
                          <option value="Burkina Faso">Burkina Faso</option>
                          <option value="France">France</option>
                        </select>
                        {fieldErrors.shipping_country && (
                          <p className="mt-1 text-xs text-red-600">{fieldErrors.shipping_country}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold mb-2">Téléphone *</label>
                      <input
                        type="tel"
                        {...register('shipping_phone')}
                        placeholder="Ex: +221 77 123 45 67"
                        className="input"
                        required
                        disabled={submitting}
                      />
                      {(errors.shipping_phone?.message || fieldErrors.shipping_phone) && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.shipping_phone?.message || fieldErrors.shipping_phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block font-semibold mb-2">Méthode de livraison</label>
                      <div className="space-y-2">
                        {Object.entries(SHIPPING_METHODS).map(([key, method]) => (
                          <label
                            key={key}
                            className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer ${
                              formData.shipping_method === key
                                ? 'border-primary bg-primary bg-opacity-5'
                                : 'border-gray-200'
                            }`}
                          >
                            <div className="flex items-center">
                              <input
                                type="radio"
                                {...register('shipping_method')}
                                value={key}
                                checked={formData.shipping_method === key}
                                className="mr-3"
                                disabled={submitting}
                              />
                              <span className="font-medium">{method.label}</span>
                            </div>
                            <span className="font-semibold text-primary">
                              {method.price === 0 ? 'Gratuit' : formatPrice(method.price)}
                            </span>
                          </label>
                        ))}
                      </div>
                      {fieldErrors.shipping_method && (
                        <p className="mt-2 text-xs text-red-600">{fieldErrors.shipping_method}</p>
                      )}
                    </div>
                  </div>

                  <Button onClick={handleNextStep} fullWidth className="mt-6" size="lg" disabled={submitting}>
                    Continuer vers le paiement
                  </Button>
                </div>
              )}

              {currentStep === 2 && (
                <div>
                  <h2 className="text-xl font-bold mb-6 flex items-center">
                    <CreditCard className="h-6 w-6 mr-2 text-primary" />
                    Méthode de paiement
                  </h2>

                  <div className="space-y-3 mb-6">
                    {Object.entries(PAYMENT_METHODS).map(([key, method]) => (
                      <label
                        key={key}
                        className={`flex items-center p-4 border-2 rounded-lg cursor-pointer ${
                          formData.payment_method === key
                            ? 'border-primary bg-primary bg-opacity-5'
                            : 'border-gray-200'
                        }`}
                      >
                        <input
                          type="radio"
                          {...register('payment_method')}
                          value={key}
                          checked={formData.payment_method === key}
                          className="mr-3"
                          disabled={submitting}
                        />
                        <span className="text-2xl mr-3">{method.icon}</span>
                        <span className="font-medium">{method.label}</span>
                      </label>
                    ))}
                  </div>
                  {fieldErrors.payment_method && (
                    <p className="mb-4 text-xs text-red-600">{fieldErrors.payment_method}</p>
                  )}

                  <div className="flex gap-4">
                    <Button onClick={() => setCurrentStep(1)} variant="secondary" className="flex-1" disabled={submitting}>
                      Retour
                    </Button>
                    <Button onClick={handleNextStep} className="flex-1" disabled={submitting}>
                      Continuer
                    </Button>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div>
                  <h2 className="text-xl font-bold mb-6 flex items-center">
                    <CheckCircle className="h-6 w-6 mr-2 text-primary" />
                    Confirmation
                  </h2>

                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h3 className="font-semibold mb-2">Adresse de livraison</h3>
                    <p className="text-gray-700">{formData.shipping_address}</p>
                    <p className="text-gray-700">{formData.shipping_city}, {formData.shipping_country}</p>
                    <p className="text-gray-700">{formData.shipping_phone}</p>
                    <p className="text-sm text-gray-600 mt-2">
                      Méthode : {SHIPPING_METHODS[formData.shipping_method]?.label}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h3 className="font-semibold mb-2">Paiement</h3>
                    <p className="text-gray-700">
                      {PAYMENT_METHODS[formData.payment_method]?.label}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h3 className="font-semibold mb-3">Articles ({cart.items_count})</h3>
                    <div className="space-y-2">
                      {cart.items.map((item) => {
                        const product = getItemProduct(item);
                        const quantity = Number(item.quantity || 1);
                        const unitPrice = Number(product.price || item.price || 0);
                        return (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span>{product.name || 'Produit'} × {quantity}</span>
                            <span className="font-medium">
                              {formatPrice(unitPrice * quantity)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block font-semibold mb-2">Notes pour le vendeur (optionnel)</label>
                    <textarea
                      {...register('notes')}
                      placeholder="Instructions de livraison, commentaires..."
                      rows="3"
                      className="input"
                      disabled={submitting}
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button onClick={() => setCurrentStep(2)} variant="secondary" className="flex-1" disabled={submitting}>
                      Retour
                    </Button>
                    <Button
                      onClick={handleSubmit(handleSubmitOrder)}
                      loading={submitting}
                      className="flex-1"
                      size="lg"
                    >
                      Confirmer la commande
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <h3 className="font-bold text-xl mb-4">Récapitulatif</h3>

              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total ({cart.items_count} articles)</span>
                  <span>{formatPrice(cart.subtotal)}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Frais de livraison</span>
                  <span>
                    {shippingCost === 0 ? (
                      <span className="text-green-600 font-medium">Gratuit</span>
                    ) : (
                      formatPrice(shippingCost)
                    )}
                  </span>
                </div>

                {cart.subtotal >= 50000 && shippingCost === 0 && (
                  <p className="text-sm text-green-600">
                    Livraison gratuite appliquée
                  </p>
                )}

                <div className="border-t pt-3">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <h4 className="font-semibold mb-3">Articles ({cart.items_count})</h4>
                <div className="space-y-2">
                  {cart.items.slice(0, 3).map((item) => {
                    const product = getItemProduct(item);
                    const productImage = Array.isArray(product.images) && product.images.length > 0
                      ? resolveImageUrl(product.images[0], 'https://via.placeholder.com/50')
                      : resolveImageUrl(product.image, 'https://via.placeholder.com/50');

                    return (
                      <div key={item.id} className="flex gap-2">
                        <img
                          src={productImage}
                          alt={product.name || 'Produit'}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1 text-sm">
                          <p className="font-medium line-clamp-1">{product.name || 'Produit'}</p>
                          <p className="text-gray-600">Qté: {item.quantity}</p>
                        </div>
                      </div>
                    );
                  })}
                  {cart.items.length > 3 && (
                    <p className="text-sm text-gray-600">
                      +{cart.items.length - 3} autre(s) article(s)
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
