import axios from 'axios';

// New standalone API: creator-canvas-api (ports 5003 HTTP / 7003 HTTPS)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7003';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Get user ID from various localStorage sources
 * Required by creative-canvas-api for all requests
 */
function getUserId(): string {
  // Try auth user first
  const authUser = localStorage.getItem('authUser');
  if (authUser) {
    try {
      const parsed = JSON.parse(authUser);
      if (parsed.userId || parsed.id) {
        return parsed.userId || parsed.id;
      }
    } catch {
      // Ignore parse errors
    }
  }

  // Try direct userId
  const userId = localStorage.getItem('userId');
  if (userId) {
    return userId;
  }

  // Try user object
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const parsed = JSON.parse(user);
      if (parsed.userId || parsed.id) {
        return parsed.userId || parsed.id;
      }
    } catch {
      // Ignore parse errors
    }
  }

  // Fallback to anonymous
  return 'anonymous';
}

// Request interceptor for auth tokens and user ID
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add X-User-Id header (required by creative-canvas-api)
    config.headers['X-User-Id'] = getUserId();

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
