import axios from 'axios';

// Resolve base API URL (e.g., '/api/v1' locally, or full HTTPS url in production)
const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api/v1').replace(/\/+$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Send cookies (refresh token)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Access Token if available
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('shopsphere_access_token');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Token Refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 Unauthorized and request hasn't been retried yet
    if (
      error.response &&
      error.response.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh-token')
    ) {
      originalRequest._retry = true;
      try {
        // Use full base URL so refresh endpoint hits the backend server across domains
        const refreshUrl = `${API_BASE_URL}/auth/refresh-token`;
        const res = await axios.post(
          refreshUrl,
          {},
          { withCredentials: true }
        );
        const { accessToken } = res.data.data;

        if (accessToken) {
          localStorage.setItem('shopsphere_access_token', accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token expired or invalid -> clear local credentials
        localStorage.removeItem('shopsphere_access_token');
        localStorage.removeItem('shopsphere_user');
        window.dispatchEvent(new Event('shopsphere_logout'));
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
