/**
 * Axios API Client
 * Centralised HTTP client with auth token injection
 */

import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 15000,
});

// ── Request Interceptor: attach JWT token ─────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("desicart_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor: normalise errors ────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong. Please try again.";

    // Auto logout on 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem("desicart_token");
      localStorage.removeItem("desicart_user");
      // Do not redirect here — let the AuthContext handle it
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
