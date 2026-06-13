import api from './api';

export const followService = {
  follow: (followingId: number) => api.post('/follows', { followingId }),
  unfollow: (followingId: number) => api.delete(`/follows/${followingId}`),
  check: (followingId: number) => api.get('/follows/check', { params: { followingId } }),
  followers: (id: number) => api.get(`/follows/${id}/followers`),
  following: (id: number) => api.get(`/follows/${id}/following`),
};
