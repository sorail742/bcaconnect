import { useState } from 'react';
import useAuthStore from '../store/authStore';
import authService from '../services/authService';

/**
 * Hook personnalisé pour interagir avec le système d'authentification.
 * Combine l'état global de Zustand avec les appels API du service.
 */
export const useAuth = () => {
    const { user, token, isAuthenticated, loading: storeLoading, setAuth, clearAuth, updateUser, logout } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Connecte l'utilisateur et met à jour le store global.
     */
    const login = async (email, password) => {
        try {
            setLoading(true);
            setError(null);
            const data = await authService.login(email, password);
            
            // Si 2FA est requis
            if (data.require2FA) {
                return data; // { require2FA: true, userId: '...' }
            }

            if (data.token && data.user) {
                setAuth(data.user, data.token);
                return data.user;
            }
            throw new Error("Réponse API incomplète");
        } catch (err) {
            const message = err.response?.data?.message || err.message || "Erreur de connexion";
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Vérifie le code 2FA pour terminer la connexion.
     */
    const verify2FA = async (userId, code) => {
        try {
            setLoading(true);
            setError(null);
            const data = await authService.verify2FA(userId, code);
            
            if (data.token && data.user) {
                setAuth(data.user, data.token);
                return data.user;
            }
            throw new Error("Code de vérification invalide ou expiré");
        } catch (err) {
            const message = err.response?.data?.message || err.message || "Erreur de vérification 2FA";
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Inscrit un nouvel utilisateur.
     */
    const register = async (userData) => {
        try {
            setLoading(true);
            setError(null);
            const data = await authService.register(userData);
            return data;
        } catch (err) {
            const message = err.response?.data?.message || err.message || "Erreur d'inscription";
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Met à jour le profil de l'utilisateur.
     */
    const updateProfile = async (userData) => {
        try {
            setLoading(true);
            const data = await authService.updateProfile(userData);
            if (data.user) {
                updateUser(data.user);
            }
            return data;
        } catch (err) {
            const message = err.response?.data?.message || err.message || "Erreur de mise à jour";
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Supprime le compte de l'utilisateur.
     */
    const deleteAccount = async () => {
        try {
            setLoading(true);
            await authService.deleteAccount();
            logout();
        } catch (err) {
            const message = err.response?.data?.message || err.message || "Erreur de suppression";
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Rafraîchit les données de l'utilisateur.
     */
    const refreshUser = async () => {
        try {
            const data = await authService.getMe();
            if (data.user) {
                updateUser(data.user);
            }
        } catch (err) {
            // Silently fail or log
        }
    };

    return {
        user,
        token,
        isAuthenticated,
        loading: loading || storeLoading,
        error,
        login,
        register,
        verify2FA,
        logout,
        updateUser,
        updateProfile,
        deleteAccount,
        refreshUser,
        setAuth,       // Exposé pour Google Auth et autres flows OAuth
        clearAuth,
    };
};
