import axios from 'axios';
import { BACKEND_API_URL } from '@/constants/config';
import { supabase } from '@/lib/supabase';

// Module-level token cache — updated synchronously by auth.tsx
let _cachedAccessToken = null;

export const setAccessToken = (token) => {
  _cachedAccessToken = token;
};

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: BACKEND_API_URL,
  timeout: 10000,
});

// Request interceptor — synchronous, reads cached token (no async getSession)
apiClient.interceptors.request.use(
  (config) => {
    if (_cachedAccessToken) {
      config.headers.Authorization = `Bearer ${_cachedAccessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling auth errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh the session
      try {
        const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
        if (session && !refreshError) {
          // Update cached token and retry the original request
          _cachedAccessToken = session.access_token;
          error.config.headers.Authorization = `Bearer ${session.access_token}`;
          return apiClient.request(error.config);
        }
      } catch (refreshError) {
        console.error('[ApiClient] Token refresh failed:', refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
