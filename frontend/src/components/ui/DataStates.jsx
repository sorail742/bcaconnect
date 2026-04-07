import React from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

export const LoadingState = ({ message = 'Chargement...' }) => (
    <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="size-12 text-primary animate-spin mb-4" />
        <p className="text-lg text-muted-foreground">{message}</p>
    </div>
);

export const ErrorState = ({ error, onRetry }) => (
    <div className="p-6 bg-destructive/10 border-2 border-destructive/30 rounded-xl flex items-center gap-4">
        <AlertCircle className="size-6 text-destructive shrink-0" />
        <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-1">Erreur</h3>
            <p className="text-sm text-muted-foreground mb-3">{error}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="flex items-center gap-2 px-4 py-2 bg-destructive/20 text-destructive rounded-lg hover:bg-destructive/30 transition-colors"
                >
                    <RefreshCw className="size-4" />
                    Réessayer
                </button>
            )}
        </div>
    </div>
);

export const EmptyState = ({ message = 'Aucune donnée disponible', icon: Icon = AlertCircle }) => (
    <div className="text-center py-20">
        <Icon className="size-16 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h3 className="text-2xl font-bold text-foreground mb-2">Aucun résultat</h3>
        <p className="text-muted-foreground">{message}</p>
    </div>
);
