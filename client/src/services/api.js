import axios from "axios";
import { useAuthStore } from "../stores/auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000",
});

api.interceptors.request.use((config) => {
  try {
    const auth = useAuthStore();
    if (auth?.accessToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${auth.accessToken}`;
    }
  } catch {
    // If Pinia isn't initialized in this execution context, skip auth header.
  }
  return config;
});

export default api;
