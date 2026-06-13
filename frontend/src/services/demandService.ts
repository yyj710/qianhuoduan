import api from './api';

export const demandService = {
  list: (params: any) => api.get('/demands', { params }),
  getById: (id: number) => api.get(`/demands/${id}`),
  create: (data: any) => api.post('/demands', data),
  getMatches: (id: number) => api.get(`/demands/${id}/matches`),
};
