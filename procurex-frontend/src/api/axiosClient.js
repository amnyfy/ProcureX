import axios from "axios";

// Base URL of the FastAPI backend. Configurable via .env (VITE_API_BASE_URL).
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export const TOKEN_STORAGE_KEY = "procurex_access_token";

export function getStoredToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the JWT bearer token to every outgoing request, if present.
axiosClient.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Normalize error messages and handle expired/invalid sessions globally.
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // Token missing/expired/invalid — clear it so the app falls back to
      // the logged-out state. We avoid a hard redirect here so callers
      // (e.g. AuthContext) can decide how to react.
      setStoredToken(null);
    }

    const rawDetail = error.response?.data?.detail;
    let backendMessage = null;

    if (typeof rawDetail === "string") {
      backendMessage = rawDetail;
    } else if (Array.isArray(rawDetail)) {
      // FastAPI 422 validation errors: [{ loc, msg, type }, ...]
      backendMessage = rawDetail
        .map((d) => d.msg || JSON.stringify(d))
        .join(", ");
    } else if (error.response?.data?.message) {
      backendMessage = error.response.data.message;
    }

    let defaultMsg = error.message || "Something went wrong. Please try again.";
    if (error.message === "Network Error" || !error.response) {
      defaultMsg = "Unable to connect to the backend server. Please check your connection or ensure the server is running.";
    }

    const normalized = new Error(
      typeof backendMessage === "string" ? backendMessage : defaultMsg
    );
    normalized.status = status;
    normalized.original = error;
    return Promise.reject(normalized);
  }
);

export default axiosClient;
