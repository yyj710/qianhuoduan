import api from './api';

export const orderService = {
  create: (data: any) => api.post('/orders', data),
  list: (params?: any) => api.get('/orders', { params }),
  getById: (id: number) => api.get(`/orders/${id}`),
  confirm: (id: number) => api.put(`/orders/${id}/confirm`),
  complete: (id: number, data?: { score: number; content?: string }) => api.put(`/orders/${id}/complete`, data),
  cancel: (id: number) => api.put(`/orders/${id}/cancel`),
  evaluate: (id: number, data: any) => api.post(`/orders/${id}/evaluate`, data),
};
