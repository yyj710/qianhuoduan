import api from './api';

export const bookmarkService = {
  add: (targetType: string, targetId: number) => api.post('/bookmarks', { targetType, targetId }),
  remove: (targetType: string, targetId: number) => api.delete(`/bookmarks/${targetType}/${targetId}`),
  list: (targetType?: string) => api.get('/bookmarks', { params: { targetType } }),
  check: (targetType: string, targetId: number) => api.get('/bookmarks/check', { params: { targetType, targetId } }),
};
