import { cartService } from './cartService';
import api from './api';

jest.mock('./api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('cartService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('addToCart appelle /cart avec le payload attendu', async () => {
    api.post.mockResolvedValueOnce({ data: { success: true } });

    await cartService.addToCart(15, 3);

    expect(api.post).toHaveBeenCalledWith('/cart', {
      product_id: 15,
      quantity: 3,
    });
  });

  test('updateCartItem appelle PATCH /cart/{id}', async () => {
    api.patch.mockResolvedValueOnce({ data: { success: true } });

    await cartService.updateCartItem(7, 4);

    expect(api.patch).toHaveBeenCalledWith('/cart/7', { quantity: 4 });
  });

  test('removeFromCart relaie les erreurs API', async () => {
    api.delete.mockRejectedValueOnce({ response: { data: { message: 'Erreur suppression' } } });

    await expect(cartService.removeFromCart(9)).rejects.toEqual({ message: 'Erreur suppression' });
  });
});

