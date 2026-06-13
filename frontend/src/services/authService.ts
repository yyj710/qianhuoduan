import api from './api';

export const authService = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  getPublicProfile: (userId: number) => api.get(`/auth/users/${userId}`),
  applyVerify: (verifyInfo: string) => api.post('/auth/verify/apply', { verifyInfo }),
};
