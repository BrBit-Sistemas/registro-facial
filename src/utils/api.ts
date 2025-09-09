import axios from 'axios';

//const isDevelopment = import.meta.env.MODE === 'development';
//const url = 'https://acthauros.com.br/api/cpma-api/registrations/';
const url = import.meta.env.VITE_APP_BASE_URL || 'http://localhost';

// Safely get token from localStorage and remove quotes if present
const rawToken = localStorage?.getItem('token');
const token = rawToken ? rawToken.replace(/^"|"$/g, "") : import.meta.env.VITE_APP_KEY;

// Create an Axios instance with default configuration
export const api = axios.create({
  baseURL: url,
  headers: {
    'Content-Type': 'application/json',
    // Add token header if exists then Authorization remove Bearer ( space ) token only token 
    'Authorization': token ? `${token}` : '',
  },
  timeout: 10000,
  validateStatus: (status) => status >= 200 && status < 500,
});

// Create an Axios instance with default configuration
export const apiTokenNull = axios.create({
  baseURL: url,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  validateStatus: (status) => status >= 200 && status < 500,
});