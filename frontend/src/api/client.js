import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const baseURL = import.meta.env.VITE_API_BASE_URL;
const client = axios.create({ baseURL });

client.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let refreshPromise = null;

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (status !== 401) {
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes('/api/auth/refresh')) {
      useAuthStore.getState().clearAuth();
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      return Promise.reject(error);
    }
    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        const { refreshToken } = useAuthStore.getState();
        refreshPromise = axios
          .post(`${baseURL}/api/auth/refresh`, { refresh_token: refreshToken })
          .finally(() => {
            refreshPromise = null;
          });
      }
      const { data } = await refreshPromise;
      useAuthStore.getState().setAuth({
        user: useAuthStore.getState().user,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
      });
      originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
      return client(originalRequest);
    } catch (refreshError) {
      useAuthStore.getState().clearAuth();
      return Promise.reject(refreshError);
    }
  }
);

export default client;
