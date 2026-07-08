/** Dev : `/api` passe par le proxy Vite → backend:5001. Prod : URL absolue. */
export const API_BASE_URL = import.meta.env.VITE_API_URL
    || (import.meta.env.DEV ? '/api' : 'http://localhost:5001/api');
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';
