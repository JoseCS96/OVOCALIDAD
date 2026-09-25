import axios from "axios";
import { clearSession, getToken } from "@/modules/auth/session";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "",
});

api.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && getToken()) {
      clearSession();
      window.dispatchEvent(new Event("ovocalidad:unauthorized"));
    }

    return Promise.reject(error);
  },
);
