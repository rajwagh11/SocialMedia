import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
const API_BASE_URL = `${BACKEND_URL}/api`;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for sending cookies
});

export default axiosInstance;
