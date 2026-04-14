import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

/**
 * ErrorBoundary Global — BCA Connect
 * Capture les crashes JavaScript et affiche un écran de récupération
 * au lieu de laisser l'application en page blanche.
 * 
 * Usage wrap dans App.jsx :
 *   <ErrorBoundary>
 *     <YourComponent />
 *   </ErrorBoundary>
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo });

        // Auto-fix for dynamic import failures (lazy chunk error)
        const isChunkError = error?.name === 'ChunkLoadError' || 
            /Failed to fetch dynamically imported module/i.test(error?.message || '') || 
            /Importing a module script failed/i.test(error?.message || '');

        if (isChunkError) {
            const hasReloaded = sessionStorage.getItem('chunk_failed_reload');
            if (!hasReloaded) {
                console.warn('[ErrorBoundary] ChunkLoadError détecté, tentative de rechargement...');
                sessionStorage.setItem('chunk_failed_reload', 'true');
                window.location.reload();
                return;
            }
        }

        // Log structuré vers la console (et Sentry en production si configuré)
        if (process.env.NODE_ENV === 'production') {
            // Sentry.captureException(error, { extra: errorInfo });
        } else {
            console.error('[ErrorBoundary] Crash capturé:', error, errorInfo);
        }
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    handleReload = () => {
        window.location.reload();
    };

    render() {
        // En cas de crash, on tente de récupérer la langue directement depuis le localStorage
        // pour rester cohérent avec le choix de l'utilisateur sans dépendre du hook.
        const isFR = window.localStorage.getItem('bca_lang') === 'EN' ? false : true;

        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-background flex items-center justify-center p-8 font-jakarta">
                    <div className="max-w-lg w-full text-center space-y-10">
                        
                        {/* Icon */}
                        <div className="relative mx-auto w-fit">
                            <div className="size-28 rounded-[2.5rem] bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto">
                                <AlertTriangle className="size-14 text-destructive" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 size-6 rounded-full bg-destructive border-4 border-background" />
                        </div>

                        {/* Message */}
                        <div className="space-y-4">
                            <h1
                                className="text-4xl font-black uppercase tracking-tighter text-foreground"
                                style={{ fontFamily: "'Outfit', sans-serif" }}
                            >
                                {isFR ? "Erreur Inattendue" : "Unexpected Error"}
                            </h1>
                            <p className="text-muted-foreground font-medium leading-relaxed">
                                {isFR 
                                    ? "Un problème est survenu dans cette section de l'application. Votre session et vos données sont préservées."
                                    : "A problem occurred in this section of the application. Your session and data are preserved."}
                            </p>

                            {/* Error detail en développement */}
                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <div className="mt-6 p-5 bg-muted/50 rounded-2xl border border-border text-left font-mono text-xs text-destructive overflow-auto max-h-40">
                                    <p className="font-black mb-2 uppercase tracking-widest opacity-60">Détail de l'erreur (dev)</p>
                                    <p>{this.state.error.toString()}</p>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={this.handleReset}
                                className="h-14 px-8 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
                            >
                                <RefreshCw className="size-4" />
                                {isFR ? "Réessayer" : "Try Again"}
                            </button>
                            <Link
                                to="/"
                                onClick={this.handleReset}
                                className="h-14 px-8 rounded-2xl bg-muted border border-border text-foreground font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:border-primary/30 hover:bg-primary/5 transition-all"
                            >
                                <Home className="size-4" />
                                {isFR ? "Accueil" : "Home"}
                            </Link>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
