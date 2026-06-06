import api from './api';

export const announcementService = {
  list: (params?: { category?: string; page?: number; pageSize?: number }) =>
    api.get('/announcements', { params }),
  upcoming: () => api.get('/announcements/upcoming'),
};
