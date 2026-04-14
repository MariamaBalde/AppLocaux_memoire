import api from './api';

export const userService = {
  async getProfile() {
    const response = await api.get('/user/profile');
    return response.data;
  },

  async updateProfile(data) {
    const response = await api.patch('/user/profile', data);
    return response.data;
  },

  async changePassword(currentPassword, newPassword) {
    const response = await api.post('/user/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  },

  async getAddresses() {
    const response = await api.get('/user/addresses');
    return response.data;
  },

  async addAddress(addressData) {
    const response = await api.post('/user/addresses', addressData);
    return response.data;
  },

  async updateAddress(id, addressData) {
    const response = await api.patch(`/user/addresses/${id}`, addressData);
    return response.data;
  },

  async deleteAddress(id) {
    const response = await api.delete(`/user/addresses/${id}`);
    return response.data;
  },

  async getPaymentMethods() {
    const response = await api.get('/user/payment-methods');
    return response.data;
  },

  async addPaymentMethod(methodData) {
    const response = await api.post('/user/payment-methods', methodData);
    return response.data;
  },

  async deletePaymentMethod(id) {
    const response = await api.delete(`/user/payment-methods/${id}`);
    return response.data;
  },
};
