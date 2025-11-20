import axios from "axios";

// Determine API URL based on environment
const getApiUrl = () => {
  // Check if we have an explicit API URL set
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.toString();
  }
  
  // If running on GitHub Pages (production), we need a deployed backend
  if (import.meta.env.PROD) {
    // Default to a placeholder - user should set VITE_API_URL secret
    return import.meta.env.VITE_API_URL || "";
  }
  
  // Development: use localhost
  return "http://localhost:8000/api";
};

const API_BASE_URL = getApiUrl();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add request interceptor to handle missing API URL
apiClient.interceptors.request.use(
  (config) => {
    if (!API_BASE_URL && import.meta.env.PROD) {
      throw new Error("API_URL_NOT_CONFIGURED");
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.message === "API_URL_NOT_CONFIGURED" || !API_BASE_URL) {
      error.apiNotConfigured = true;
    }
    if (error.code === "ERR_NETWORK" || error.code === "ECONNREFUSED") {
      error.networkError = true;
    }
    return Promise.reject(error);
  }
);

export const fetcher = async <T>(url: string) => {
  const response = await apiClient.get<T>(url);
  return response.data;
};


