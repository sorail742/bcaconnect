import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { Loader2 } from 'lucide-react';

/**
 * Composant pour protéger les routes privées.
 * @param {React.ReactNode} children - Le contenu de la route.
 * @param {string[]} allowedRoles - Liste des rôles autorisés (optionnel).
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, isAuthenticated, loading: isInitializing } = useAuthStore();
    const location = useLocation();

    // Pendant la restauration de session (Initialisation)
    if (isInitializing) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Synchronisation BCA...</p>
                </div>
            </div>
        );
    }

    // Rediriger vers login si non connecté
    if (!isAuthenticated) {
        // Sauvegarder la page d'origine pour redirection après login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Vérifier les permissions par rôle (RBAC)
    if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

export default ProtectedRoute;
