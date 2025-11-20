import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.toString() ?? "http://localhost:8000/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const fetcher = async <T>(url: string) => {
  const response = await apiClient.get<T>(url);
  return response.data;
};


