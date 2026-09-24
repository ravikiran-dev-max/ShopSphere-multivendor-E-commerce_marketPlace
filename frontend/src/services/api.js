import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
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
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/login') &&
      !originalRequest.url.includes('/auth/refresh-token')
    ) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(
          '/api/v1/auth/refresh-token',
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
        // Refresh token expired or invalid -> clear token
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
