import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Request deduplication
const pendingRequests = new Map<string, Promise<any>>();

const createDeduplicatedRequest = (
  key: string,
  requestFn: () => Promise<any>
): Promise<any> => {
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key)!;
  }

  const promise = requestFn().finally(() => {
    pendingRequests.delete(key);
  });

  pendingRequests.set(key, promise);
  return promise;
};

const api: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request deduplication for GET requests
    if (config.method === 'get') {
      const key = `${config.method}:${config.url}:${JSON.stringify(config.params)}`;
      return createDeduplicatedRequest(key, () => Promise.resolve(config));
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
