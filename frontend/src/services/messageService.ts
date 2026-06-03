import api from './api';

export const messageService = {
  send: (data: any) => api.post('/messages', data),
  list: (params?: any) => api.get('/messages', { params }),
  markRead: (messageIds: number[]) => api.put('/messages/read', { messageIds }),
  getUnreadCount: () => api.get('/messages/unread'),
  getConversations: () => api.get('/messages/conversations'),
};
