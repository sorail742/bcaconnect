import React from 'react';
import { cn } from '../../lib/utils';

export const Skeleton = ({ className, ...props }) => {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-muted/50", className)}
            {...props}
        />
    );
};

export const CardSkeleton = () => (
    <div className="bg-card p-6 rounded-3xl border border-border space-y-4">
        <div className="flex justify-between items-start">
            <Skeleton className="size-12 rounded-2xl" />
            <Skeleton className="h-4 w-12 rounded-lg" />
        </div>
        <div className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-40" />
        </div>
    </div>
);

export const TableRowSkeleton = () => (
    <div className="flex items-center gap-4 py-4 px-6 border-b border-border/50">
        <Skeleton className="size-10 rounded-xl" />
        <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-3 w-1/6" />
        </div>
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-24 rounded-xl" />
    </div>
);

export const PageLoader = () => (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-sm font-bold text-primary animate-pulse uppercase tracking-[0.2em]">Chargement...</p>
        </div>
    </div>
);
