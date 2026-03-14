import React from 'react';
import { AlertCircle, Inbox, RefreshCcw } from 'lucide-react';
import { Button } from './Button';

export const ErrorState = ({ message, onRetry }) => (
    <div className="py-20 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-500">
        <div className="size-20 rounded-full bg-destructive/10 flex items-center justify-center border-2 border-destructive/20 shadow-xl shadow-destructive/5">
            <AlertCircle className="size-10 text-destructive" />
        </div>
        <div className="space-y-2">
            <h3 className="text-xl font-black italic uppercase tracking-widest text-foreground">Erreur de chargement</h3>
            <p className="text-sm text-muted-foreground font-medium max-w-xs mx-auto">
                {message || "Une erreur est survenue lors de la récupération des données. Veuillez réessayer."}
            </p>
        </div>
        {onRetry && (
            <Button onClick={onRetry} variant="outline" className="rounded-xl gap-2 font-bold uppercase tracking-widest text-[10px] border-border hover:border-primary transition-all">
                <RefreshCcw className="size-4" />
                Réessayer
            </Button>
        )}
    </div>
);

export const EmptyState = ({ title, description, icon: UserIcon = Inbox, action }) => (
    <div className="py-20 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-500">
        <div className="size-20 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-border">
            <UserIcon className="size-10 text-muted-foreground/50" />
        </div>
        <div className="space-y-2">
            <h3 className="text-xl font-black italic uppercase tracking-widest text-foreground">
                {title || "Aucune donnée"}
            </h3>
            <p className="text-sm text-muted-foreground font-medium max-w-xs mx-auto">
                {description || "Il n'y a actuellement aucun élément à afficher ici."}
            </p>
        </div>
        {action && (
            <Button onClick={action.onClick} variant="outline" className="rounded-xl font-bold uppercase tracking-widest text-[10px]">
                {action.label}
            </Button>
        )}
    </div>
);
