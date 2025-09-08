// src/utils/api.ts
import axios from 'axios';

const isDevelopment = import.meta.env.MODE === 'development';

export const api = axios.create({
  baseURL: 'https://acthauros.com.br/api/cpma-api/registrations/',
  headers: {
    'Content-Type': 'application/json',
    // Add token header if exists then Authorization remove Bearer ( space ) token only token 
    'Authorization': localStorage.getItem('token').replace(/^"|"$/g, ""),
  },
  timeout: 10000,
  validateStatus: (status) => status >= 200 && status < 500,
});

// if (isDevelopment) {
//   api.interceptors.request.use((config) => {
//     console.log('Request:', config);
//     return config;
//   });

//   api.interceptors.response.use((response) => {
//     console.log('Response:', response);
//     return response;
//   }, (error) => {
//     console.error('Response Error:', error);
//     return Promise.reject(error);
//   });
// }