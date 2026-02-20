import axios from 'axios';
import { BACKEND_API_URL } from '@/constants/config';
import { supabase } from '@/lib/supabase';

// Module-level token cache — updated synchronously by auth.tsx
let _cachedAccessToken = null;

// Mutex: only one refresh at a time; subsequent 401s await the same promise
let _refreshPromise = null;

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
    // Prevent infinite retry: only retry once per request
    if (error.response?.status === 401 && !error.config._retried) {
      error.config._retried = true;

      try {
        // Mutex: reuse in-flight refresh if one exists
        if (!_refreshPromise) {
          _refreshPromise = supabase.auth.refreshSession().finally(() => {
            _refreshPromise = null;
          });
        }

        const { data: { session }, error: refreshError } = await _refreshPromise;
        if (session && !refreshError) {
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
