import axios from "axios";

const isBrowser = typeof window !== "undefined";

const url = isBrowser ? window.location.origin : process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";


// Cria instância principal do Axios
export const api = axios.create({
  baseURL: url,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
  validateStatus: (status) => status >= 200 && status < 500,
});

// Interceptor para adicionar token dinamicamente (apenas no client)
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const rawToken = sessionStorage.getItem("token");
    const token = rawToken ? rawToken.replace(/^"|"$/g, "") : null;

    if (token) {
      config.headers.Authorization = token; // se precisar com Bearer → `Bearer ${token}`
    }
  }
  return config;
});

// Instância sem token
export const apiTokenNull = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
  validateStatus: (status) => status >= 200 && status < 500,
});
