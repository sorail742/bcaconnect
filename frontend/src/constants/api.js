/** Backend local : proxy Vite `/api` en dev, port 5000 sinon. Surcharger via VITE_* */
export const API_BASE_URL = import.meta.env.VITE_API_URL
  || (import.meta.env.DEV ? '/api' : 'http://localhost:5000/api');
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL
  || (import.meta.env.DEV ? window.location.origin : 'http://localhost:5000');
