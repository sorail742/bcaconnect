import axios from 'axios';
import { API_BASE_URL } from '../constants/api';
import useAuthStore from '../store/authStore';
import { toast } from 'sonner';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true // 🛡️ SÉCURITÉ : Indispensable pour transmettre les Cookies HttpOnly
});

// ── Intercepteur Request : injecter le token depuis le store (source unique de vérité) ──
api.interceptors.request.use(
    (config) => {
        const { token } = useAuthStore.getState();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Gestion du refresh token silencieux ────────────────────────────────────────
let isRefreshing = false;
let refreshQueue = []; // File d'attente des requêtes en attente du nouveau token

const processQueue = (error, token = null) => {
    refreshQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error);
        else resolve(token);
    });
    refreshQueue = [];
};

// ── Intercepteur Response : gestion des erreurs HTTP globales ─────────────────
api.interceptors.response.use(
    (response) => {
        // RÈGLE CTO: succès → retourner response (le service fera return response.data)
        // Aucune manipulation de déballage intrusive (jamais de response.data.data global)
        return response;
    },
    async (error) => {
        const { response, config } = error;

        // STANDARD API CONTRACT - ERROR FORMATTER
        let standardizedError = {
            code: 'NETWORK_ERROR',
            message: 'Erreur réseau inattendue.',
            retryable: !response, // Si pas de réponse du serveur, le réseau a crashé, on peut retry
            requestId: null,
            debugContext: {
                status: response?.status,
                headers: response?.headers
            }
        };

        if (response && response.data) {
            standardizedError.code = response.data.error?.code || 'SERVER_ERROR';
            standardizedError.message = response.data.error?.message || response.data.message || 'Erreur serveur non définie.';
            standardizedError.retryable = [408, 429, 500, 502, 503, 504].includes(response.status);
            standardizedError.requestId = response.data.meta?.requestId || response.headers?.['x-request-id'] || null;
        }

        error.standardized = standardizedError;

        if (response) {
            switch (response.status) {
                case 401: {
                    // ✅ Fix: Ne pas redémarrer si la requête était déjà un refresh
                    if (config._retry) {
                        useAuthStore.getState().clearAuth();
                        window.location.href = '/login';
                        return Promise.reject(error);
                    }

                    const PUBLIC_ROUTES = ['/', '/login', '/register', '/marketplace', '/faq', '/about', '/contact', '/vendors'];
                    const isPublicRoute = PUBLIC_ROUTES.includes(window.location.pathname)
                        || window.location.pathname.startsWith('/shop/')
                        || window.location.pathname.startsWith('/store/');

                    if (isPublicRoute) break;

                    // ✅ Si un refresh est déjà en cours, mettre en queue
                    if (isRefreshing) {
                        return new Promise((resolve, reject) => {
                            refreshQueue.push({ resolve, reject });
                        }).then(token => {
                            // On crée une copie propre de la config pour le retry
                            const retryConfig = {
                                ...config,
                                headers: {
                                    ...config.headers,
                                    Authorization: `Bearer ${token}`
                                }
                            };
                            return api(retryConfig);
                        });
                    }

                    config._retry = true;
                    isRefreshing = true;

                    try {
                        const storedUser = useAuthStore.getState().user;

                        if (!storedUser?.id) throw new Error('No stored credentials');

                        console.log("🔄 Intercepteur: Jeton expiré, tentative de rafraîchissement silencieux...");
                        // Appel silencieux au refresh (Le HttpOnly Cookie est attaché automatiquement par le navigateur)
                        const refreshRes = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
                            userId: storedUser.id
                        }, {
                            withCredentials: true // Assure le passage du cookie HttpOnly
                        });

                        const newToken = refreshRes.data?.accessToken || refreshRes.data?.token;
                        if (!newToken) throw new Error('No token in refresh response');
                        
                        console.log("✅ Intercepteur: Session restaurée avec succès.");

                        useAuthStore.getState().setAuth(storedUser, newToken);
                        
                        // ✅ Crucial : Informer toutes les requêtes en attente
                        processQueue(null, newToken);

                        // ✅ Crucial : Utiliser le nouveau token DIRECTEMENT pour la requête actuelle
                        config.headers.Authorization = `Bearer ${newToken}`;
                        config._retry = true; // Empêcher les boucles infinies
                        return api(config); 
                    } catch (refreshError) {
                        isRefreshing = false;
                        processQueue(refreshError, null);
                        useAuthStore.getState().clearAuth();
                        toast.error('Session expirée. Veuillez vous reconnecter.');
                        
                        // Utilisons un setTimeout pour laisser la pile d'exécution se vider
                        setTimeout(() => {
                            window.location.href = '/login';
                        }, 500);
                        
                        return Promise.reject(refreshError);
                    }
                }

                case 403:
                    toast.error('Accès refusé. Permissions insuffisantes.');
                    break;

                case 422:
                    // Erreur de validation — gérée localement par les composants
                    break;

                case 500:
                    // 🛡️ SÉCURITÉ UX : On n'affiche un toast que si la requête est explicite (POST/PUT/DELETE)
                    // ou si elle n'est pas marquée comme "bg" (background).
                    if (['post', 'put', 'patch', 'delete'].includes(config.method) || !config._bg) {
                        toast.error(
                            error.standardized.message || "Erreur serveur (500). Nos équipes sont prévenues."
                        );
                    }
                    console.error("API Error 500:", error.config?.url, error.standardized);
                    break;

                default:
                    break;
            }
        } else if (error.request) {
            // 🔇 UX : On ne montre un toast de connexion que si ce n'est pas une requête d'arrière-plan.
            if (!config._bg) {
                toast.error("Problème de connexion réseau. Veuillez vérifier votre accès internet.");
            }
            console.warn('Requête API sans réponse (réseau/CORS):', error.config?.url);
        }

        return Promise.reject(error);
    }
);

export default api;

