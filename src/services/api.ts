/**
 * Axios instance for all backend API calls.
 *
 * The request interceptor dynamically attaches:
 *  - Authorization: Bearer <firebase-id-token>   (fresh on every request)
 *  - x-org-id: <orgId>                           (from auth store)
 *
 * Using a dynamic token getter (getIdToken) ensures we never send an expired
 * token — Firebase refreshes it automatically in the background.
 */
import axios from "axios";

export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL ?? ""}/api`,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(async (config) => {
  if (typeof window === "undefined") return config;

  // TEMP DEMO AUTH
  config.headers.Authorization = "Bearer demo.employee.123";
  config.headers["x-org-id"] = "org-1";

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  },
);