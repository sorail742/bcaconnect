/** Dev : `/api` passe par le proxy Vite → backend:5000. Prod : URL absolue. */
export const API_BASE_URL = import.meta.env.VITE_API_URL
    || (import.meta.env.DEV ? '/api' : 'http://localhost:5000/api');
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (import.meta.env.DEV ? '/' : 'http://localhost:5000');
