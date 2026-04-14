import { useEffect, useCallback } from 'react';
import socketService from '../services/socketService';
import useAuthStore from '../store/authStore';

/**
 * Hook React pour gérer et utiliser la connexion Socket.io.
 * S'occupe de la connexion/déconnexion automatique basée sur l'état auth.
 */
export const useSocket = () => {
    const { user, isAuthenticated } = useAuthStore();

    useEffect(() => {
        // Only connect if we have a valid session
        if (isAuthenticated && user?.id) {
            socketService.connect(user.id);
        } else {
            socketService.disconnect();
        }
    }, [isAuthenticated, user?.id]);

    const on = useCallback((event, callback) => {
        if (!event || !callback) return;
        socketService.on(event, callback);
    }, []);

    const off = useCallback((event, callback) => {
        if (!event || !callback) return;
        socketService.off(event, callback);
    }, []);

    const emit = useCallback((event, data) => {
        if (!event) return;
        socketService.emit(event, data);
    }, []);

    return {
        socket: socketService.socket,
        isConnected: socketService.isConnected(),
        on,
        off,
        emit
    };
};

export default useSocket;
