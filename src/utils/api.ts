// src/utils/api.ts
import axios from 'axios';

const isDevelopment = import.meta.env.MODE === 'development';

export const api = axios.create({
  baseURL: isDevelopment ? '/api' : 'http://app.facial.sagep.com.br/api-facil',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000,
  validateStatus: (status) => status >= 200 && status < 500,
});

// Interceptor para adicionar headers específicos em desenvolvimento
api.interceptors.request.use((config) => {
  if (isDevelopment) {
    if (config.headers) {
      config.headers['Referer'] = 'http://localhost:3000';
      config.headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
    }
  }
  return config;
});