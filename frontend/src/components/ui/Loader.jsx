import React from 'react';
import { cn } from '../../lib/utils';

export const Skeleton = ({ className, ...props }) => {
    return (
        <div
            className={cn("animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800", className)}
            {...props}
        />
    );
};

export const CardSkeleton = () => (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 space-y-6 shadow-sm">
        <div className="flex justify-between items-start">
            <Skeleton className="size-12 rounded-2xl" />
            <Skeleton className="h-4 w-16 rounded-lg" />
        </div>
        <div className="space-y-3">
            <Skeleton className="h-3 w-24 rounded-full" />
            <Skeleton className="h-8 w-44 rounded-xl" />
            <Skeleton className="h-3 w-full rounded-full" />
        </div>
    </div>
);

export const TableRowSkeleton = () => (
    <div className="flex items-center gap-6 py-5 px-8 border-b border-slate-50 dark:border-slate-800">
        <Skeleton className="size-10 rounded-xl" />
        <div className="flex-1 space-y-2.5">
            <Skeleton className="h-4 w-1/3 rounded-lg" />
            <Skeleton className="h-3 w-1/4 rounded-lg" />
        </div>
        <Skeleton className="h-4 w-24 rounded-lg" />
        <Skeleton className="h-9 w-28 rounded-xl" />
    </div>
);

export const PageLoader = () => (
    <div className="fixed inset-0 bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl z-[100] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
            <div className="relative size-16 flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-primary/10 rounded-full" />
                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] animate-pulse">Lancement de BCA Connect</p>
        </div>
    </div>
);
