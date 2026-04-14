import api from './api';

export const shippingService = {
  async estimate({ shippingMethod, destinationCountry, subtotal, weightKg = 1 }) {
    const response = await api.post('/shipping/estimate', {
      shipping_method: shippingMethod,
      destination_country: destinationCountry,
      subtotal,
      weight_kg: weightKg,
    });

    return Number(response?.data?.data?.estimated_cost ?? 0);
  },
};

