import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL //|| "http://localhost:8000";

//console.debug("API_BASE", API_BASE)

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// attach Authorization header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
