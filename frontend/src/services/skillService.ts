import api from './api';

export const skillService = {
  create: (data: any) => api.post('/skills', data),
  list: (params?: any) => api.get('/skills', { params }),
  getById: (id: number) => api.get(`/skills/${id}`),
  update: (id: number, data: any) => api.put(`/skills/${id}`, data),
  delete: (id: number) => api.delete(`/skills/${id}`),
};
