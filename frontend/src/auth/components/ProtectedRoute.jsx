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

    const PUBLIC_ROUTES = ['/', '/login', '/register', '/marketplace', '/catalog', '/search', '/faq', '/about', '/contact', '/vendors', '/terms', '/privacy', '/help', '/education', '/tracking'];
    const PUBLIC_ROUTE_PREFIXES = ['/shop', '/store', '/product', '/category']; // routes that start with these are also public

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

    // Si la route est publique, ne pas bloquer
    const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname) ||
        PUBLIC_ROUTE_PREFIXES.some(prefix => location.pathname.startsWith(prefix));
    if (isPublicRoute) {
        return children;
    }
    // Rediriger vers login si non connecté
    if (!isAuthenticated) {
        // Sauvegarder la page d'origine pour redirection après login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Vérifier les permissions par rôle (RBAC)
    if (allowedRoles.length > 0) {
        if (!user || !user.role || !allowedRoles.includes(user.role)) {
            return <Navigate to="/unauthorized" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
