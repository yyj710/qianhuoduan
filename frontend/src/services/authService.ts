import api from './api';

export const authService = {
  register: (data: { username: string; password: string; phone?: string; college?: string; campus?: string }) =>
    api.post('/auth/register', data),

  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),

  getProfile: () => api.get('/users/profile'),

  updateProfile: (data: any) => api.put('/users/profile', data),
};
