import api from './api';

export const demandService = {
  create: (data: any) => api.post('/demands', data),
  list: (params?: any) => api.get('/demands', { params }),
  getById: (id: number) => api.get(`/demands/${id}`),
  getMatches: (id: number) => api.get(`/demands/${id}/matches`),
};
