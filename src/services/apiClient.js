import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor for Authorization token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("kyc_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      error.message = 'Cannot connect to backend. Make sure Spring Boot is running on port 8080.';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
