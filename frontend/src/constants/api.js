/** Backend local par défaut : port 3000 (voir backend/src/index.js). Surcharger via VITE_API_URL. */
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';
