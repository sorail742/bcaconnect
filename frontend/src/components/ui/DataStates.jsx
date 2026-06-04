import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle, RefreshCw, Inbox } from 'lucide-react';
import { SkeletonGrid, SkeletonTable } from './SkeletonGrid';

export const LoadingState = ({ message = 'Chargement...', variant = 'default' }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-16 px-4 w-full"
    >
        {variant === 'table' ? (
            <div className="w-full max-w-4xl"><SkeletonTable rows={6} /></div>
        ) : variant === 'grid' ? (
            <div className="w-full max-w-6xl"><SkeletonGrid count={4} /></div>
        ) : (
            <>
                <Loader2 className="size-12 text-primary animate-spin mb-4" />
                <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">{message}</p>
            </>
        )}
    </motion.div>
);

export const ErrorState = ({ error, onRetry }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-6 bg-destructive/10 border-2 border-destructive/20 rounded-2xl flex items-center gap-4 premium-card"
    >
        <AlertCircle className="size-6 text-destructive shrink-0" />
        <div className="flex-1">
            <h3 className="font-black text-foreground mb-1 uppercase tracking-tight text-sm">Erreur</h3>
            <p className="text-sm text-muted-foreground mb-3">{error}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="flex items-center gap-2 px-4 py-2 bg-destructive/15 text-destructive rounded-xl hover:bg-destructive/25 transition-colors text-xs font-black uppercase tracking-widest"
                >
                    <RefreshCw className="size-4" />
                    Réessayer
                </button>
            )}
        </div>
    </motion.div>
);

export const EmptyState = ({ message = 'Aucune donnée disponible', icon: Icon = Inbox, action }) => (
    <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-20 px-6"
    >
        <div className="size-20 rounded-3xl bg-muted/50 border border-border flex items-center justify-center mx-auto mb-6">
            <Icon className="size-10 text-muted-foreground opacity-60" />
        </div>
        <h3 className="text-xl font-black text-foreground mb-2 uppercase tracking-tight">Aucun résultat</h3>
        <p className="text-muted-foreground max-w-md mx-auto">{message}</p>
        {action && <div className="mt-6">{action}</div>}
    </motion.div>
);

export const DataStateWrapper = ({ isLoading, error, isEmpty, onRetry, loadingVariant, children, emptyMessage }) => (
    <AnimatePresence mode="wait">
        {isLoading ? (
            <LoadingState key="loading" variant={loadingVariant} />
        ) : error ? (
            <ErrorState key="error" error={error} onRetry={onRetry} />
        ) : isEmpty ? (
            <EmptyState key="empty" message={emptyMessage} />
        ) : (
            <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {children}
            </motion.div>
        )}
    </AnimatePresence>
);
