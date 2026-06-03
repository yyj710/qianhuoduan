import axios from 'axios';
import { message } from 'antd';

// 开发环境：Vite 代理 /api → localhost:3000
// 生产环境：直连 Render 后端地址（部署前需替换为实际地址）
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    const data = response.data;
    if (data.code && data.code !== 200) {
      message.error(data.message || '请求失败');
      return Promise.reject(new Error(data.message));
    }
    return data;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return;
    }
    message.error(error.response?.data?.message || '网络错误');
    return Promise.reject(error);
  }
);

export default api;
