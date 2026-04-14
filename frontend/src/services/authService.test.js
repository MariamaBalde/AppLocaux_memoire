import { authService } from './authService';
import api from './api';
import { authStorage } from './authStorage';

jest.mock('./api', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

jest.mock('./authStorage', () => ({
  authStorage: {
    setToken: jest.fn(),
    setUser: jest.fn(),
    clear: jest.fn(),
    getToken: jest.fn(),
    getUser: jest.fn(),
  },
}));

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.REACT_APP_ENABLE_PASSWORD_RESET_API = 'true';
  });

  test('login stocke token et user', async () => {
    api.post.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          user: { id: 10, role: 'client' },
          access_token: 'token-abc',
        },
      },
    });

    const result = await authService.login('client@test.local', 'Password123!');

    expect(api.post).toHaveBeenCalledWith('/auth/login', {
      email: 'client@test.local',
      password: 'Password123!',
    });
    expect(authStorage.setToken).toHaveBeenCalledWith('token-abc');
    expect(authStorage.setUser).toHaveBeenCalledWith({ id: 10, role: 'client' });
    expect(result.success).toBe(true);
  });

  test('forgotPassword utilise /password/forgot', async () => {
    api.post.mockResolvedValueOnce({ data: { success: true } });

    await authService.forgotPassword('mail@test.local');

    expect(api.post).toHaveBeenCalledWith('/password/forgot', { email: 'mail@test.local' });
  });

  test('resetPassword utilise /password/reset', async () => {
    api.post.mockResolvedValueOnce({ data: { success: true } });

    await authService.resetPassword({
      email: 'mail@test.local',
      token: 'token',
      password: 'Password123!',
      password_confirmation: 'Password123!',
    });

    expect(api.post).toHaveBeenCalledWith('/password/reset', {
      email: 'mail@test.local',
      token: 'token',
      password: 'Password123!',
      password_confirmation: 'Password123!',
    });
  });
});

