import axios from 'axios';
import { BACKEND_API_URL } from '@/constants/config';
import { supabase } from '@/lib/supabase';

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: BACKEND_API_URL,
  timeout: 10000,
});

// Request interceptor to attach auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
    } catch (error) {
      console.error('[ApiClient] Error getting session:', error);
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
          // Retry the original request with new token
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
