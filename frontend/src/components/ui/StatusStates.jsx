import React from 'react';
import { AlertCircle, Inbox, RefreshCcw } from 'lucide-react';
import { Button } from './Button';

export const ErrorState = ({ message, onRetry }) => (
    <div className="py-10 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-500">
        <div className="size-9 rounded-full bg-destructive/10 flex items-center justify-center border-2 border-destructive/20 shadow-xl shadow-destructive/5">
            <AlertCircle className="size-6 text-destructive" />
        </div>
        <div className="space-y-2">
            <h3 className="text-lg font-black italic uppercase tracking-widest text-foreground">Erreur de chargement</h3>
            <p className="text-sm text-muted-foreground font-medium max-w-xs mx-auto">
                {message || "Une erreur est survenue lors de la récupération des données. Veuillez réessayer."}
            </p>
        </div>
        {onRetry && (
            <Button onClick={onRetry} variant="outline" className="rounded-lg gap-2 font-bold uppercase tracking-widest text-[10px] border-border hover:border-primary transition-all">
                <RefreshCcw className="size-4" />
                Réessayer
            </Button>
        )}
    </div>
);

export const EmptyState = ({ title, description, icon: UserIcon = Inbox, action }) => (
    <div className="flex flex-col items-center justify-center p-5 text-center rounded-2xl border border-dashed border-slate-300 dark:border-foreground/10 bg-white/[0.01] animate-in fade-in duration-500">
        <div className="w-16 h-12 rounded-lg bg-[#0f172a] border border-slate-200 dark:border-foreground/5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),_0_0_15px_rgba(59,130,246,0.1)] flex items-center justify-center mb-6">
            <UserIcon className="size-6 text-muted-foreground" />
        </div>
        <div className="space-y-2 mb-6">
            <h3 className="text-lg font-medium text-slate-900 dark:text-foreground tracking-widest uppercase">
                {title || "Aucune donnée"}
            </h3>
            <p className="text-sm text-slate-600 dark:text-muted-foreground/80 font-medium max-w-sm mx-auto leading-relaxed">
                {description || "Il n'y a actuellement aucun élément à afficher ici. Commencez par explorer la plateforme."}
            </p>
        </div>
        {action && (
            <Button onClick={action.onClick} variant="outline" className="rounded-lg font-bold uppercase tracking-widest text-[10px] text-fintech-400 border-slate-200 dark:border-foreground/5 hover:border-fintech-500/30 hover:bg-fintech-500/10">
                {action.label}
            </Button>
        )}
    </div>
);
