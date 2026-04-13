import { adminService } from './adminService';
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

describe('adminService pagination params', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getTopVendors envoie per_page et page', async () => {
    api.get.mockResolvedValueOnce({ data: { success: true } });

    await adminService.getTopVendors(25, 3);

    expect(api.get).toHaveBeenCalledWith('/admin/top-vendors?per_page=25&page=3');
  });

  test('getRecentOrders envoie per_page et page', async () => {
    api.get.mockResolvedValueOnce({ data: { success: true } });

    await adminService.getRecentOrders(15, 2);

    expect(api.get).toHaveBeenCalledWith('/admin/recent-orders?per_page=15&page=2');
  });
});

