import api from './api';

export const notificationService = {
  list: (readStatus?: number) => api.get('/notifications', { params: { readStatus } }),
  unreadCount: () => api.get('/notifications/unread-count'),
  markRead: (ids: number[]) => api.put('/notifications/read', { ids }),
  markAllRead: () => api.put('/notifications/read-all'),
};
