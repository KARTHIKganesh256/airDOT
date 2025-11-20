import axios from "axios";

// Determine API URL based on environment
const getApiUrl = () => {
  // Check if we have an explicit API URL set
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.toString();
  }
  
  // Development: use localhost
  if (!import.meta.env.PROD) {
    return "http://localhost:8000/api";
  }
  
  // Production: return empty to use mock data
  return "";
};

const API_BASE_URL = getApiUrl();
const USE_MOCK_DATA = !API_BASE_URL || API_BASE_URL === "";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ERR_NETWORK" || error.code === "ECONNREFUSED") {
      error.networkError = true;
    }
    return Promise.reject(error);
  }
);

export const fetcher = async <T>(url: string): Promise<T> => {
  // If no API URL, use mock data
  if (USE_MOCK_DATA) {
    const { getMockLatest, getMockHistory, getMockForecast, getMockMapData } = await import("./mockData");
    
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    if (url === "/latest") {
      return getMockLatest() as T;
    }
    if (url.startsWith("/history")) {
      const params = new URLSearchParams(url.split("?")[1] || "");
      const city = params.get("city") || "Hyderabad";
      const limit = parseInt(params.get("limit") || "200");
      return { readings: getMockHistory(city, limit) } as T;
    }
    if (url.startsWith("/predict")) {
      const params = new URLSearchParams(url.split("?")[1] || "");
      const city = params.get("city") || undefined;
      return getMockForecast(city) as T;
    }
    if (url === "/mapdata") {
      return getMockMapData() as T;
    }
    
    throw new Error(`Mock data not available for ${url}`);
  }
  
  // Use real API
  const response = await apiClient.get<T>(url);
  return response.data;
};


