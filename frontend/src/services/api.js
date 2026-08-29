// Shared Axios client configuration.
// Frontend and backend are deployed together on the same origin.

import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "http://localhost:8000" : "");

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;