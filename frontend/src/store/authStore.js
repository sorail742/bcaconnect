import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Store d'authentification global via Zustand.
 * Responsabilités : Gestion de l'état utilisateur, du token et de l'accessibilité.
 * Version : 2.0 (Dynamique & Persistant)
 */
const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: true,

            /**
             * Définit l'authentification suite à un login ou register réussi.
             */
            setAuth: (user, token) => {
                set({
                    user,
                    token,
                    isAuthenticated: true,
                    loading: false
                });
            },

            /**
             * Réinitialise l'état d'authentification (logout ou erreur 401).
             */
            clearAuth: () => {
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    loading: false
                });
            },

            /**
             * Met à jour les informations utilisateur sans toucher au token.
             */
            updateUser: (user) => {
                set({ user });
            },

            /**
             * Vérifie si l'utilisateur possède une permission spécifique (RBAC).
             */
            hasPermission: (permission) => {
                const user = get().user;
                if (!user) return false;
                // Si l'utilisateur est admin, il a potentiellement tous les droits
                if (user.role === 'admin') return true;
                return user.permissions?.includes(permission) || false;
            },

            /**
             * Définit l'état de chargement initial.
             */
            setLoading: (loading) => {
                set({ loading });
            },

            /**
             * Déconnecte l'utilisateur
             */
            logout: () => {
                get().clearAuth();
                window.location.href = '/';
            }
        }),
        {
            name: 'bca-auth-storage', // Nom de la clé dans le localStorage
            storage: createJSONStorage(() => localStorage),
            version: 1, // Gestion des versions pour migrations futures
            partialize: (state) => ({ 
                user: state.user, 
                // 🛑 SÉCURITÉ FINTECH : Le token n'est PLUS stocké en localStorage (anti-XSS)
                // Il sera conservé en mémoire (Zustand) et rafraîchi via le HttpOnly Cookie.
                isAuthenticated: state.isAuthenticated 
            }),
        }
    )
);

export default useAuthStore;

