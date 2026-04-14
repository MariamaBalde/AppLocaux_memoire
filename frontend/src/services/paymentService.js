import api from './api';

export const paymentService = {
  async initiatePayment(payload) {
    try {
      const response = await api.post('/payments/initiate', payload);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
