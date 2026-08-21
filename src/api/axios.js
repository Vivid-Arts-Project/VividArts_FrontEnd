import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,  // sends session cookie with every request
  headers: { 'Content-Type': 'application/json' },
});

export default api;
