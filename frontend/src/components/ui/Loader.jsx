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
    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-6 shadow-sm">
        <div className="flex justify-between items-start">
            <Skeleton className="size-9 rounded-lg" />
            <Skeleton className="h-4 w-16 rounded-lg" />
        </div>
        <div className="space-y-3">
            <Skeleton className="h-3 w-24 rounded-full" />
            <Skeleton className="h-8 w-44 rounded-lg" />
            <Skeleton className="h-3 w-full rounded-full" />
        </div>
    </div>
);

export const TableRowSkeleton = () => (
    <div className="flex items-center gap-5 py-5 px-8 border-b border-slate-50 dark:border-slate-800">
        <Skeleton className="size-6 rounded-lg" />
        <div className="flex-1 space-y-2.5">
            <Skeleton className="h-4 w-1/3 rounded-lg" />
            <Skeleton className="h-3 w-1/4 rounded-lg" />
        </div>
        <Skeleton className="h-4 w-24 rounded-lg" />
        <Skeleton className="h-9 w-28 rounded-lg" />
    </div>
);

export const ProductSkeleton = () => (
    <div className="space-y-4">
        <Skeleton className="aspect-[3/4] w-full rounded-2xl md:rounded-3xl" />
        <div className="space-y-2">
            <Skeleton className="h-4 w-2/3 rounded-full" />
            <Skeleton className="h-3 w-1/2 rounded-full" />
            <div className="flex justify-between items-center pt-2">
                <Skeleton className="h-6 w-20 rounded-lg" />
                <Skeleton className="size-8 rounded-full" />
            </div>
        </div>
    </div>
);

export const PageLoader = () => (
    <div className="fixed inset-0 bg-foreground/60 dark:bg-slate-950/60 backdrop-blur-xl z-[100] flex items-center justify-center">
        <div className="flex flex-col items-center gap-5">
            <div className="relative size-6 flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-primary/10 rounded-full" />
                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] animate-pulse">Lancement de BCA Connect</p>
        </div>
    </div>
);

/* ── WalletSkeleton ── */
export const WalletSkeleton = () => (
    <div className="space-y-8 pt-32 pb-16 container mx-auto px-4 md:px-8">
        <div className="space-y-3">
            <Skeleton className="h-5 w-32 rounded-full" />
            <Skeleton className="h-10 w-64 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-48 rounded-3xl" />
            <Skeleton className="h-48 rounded-3xl" />
            <Skeleton className="h-48 rounded-3xl" />
        </div>
        <div className="flex gap-4 p-4 bg-muted rounded-3xl border border-border">
            <Skeleton className="h-14 w-48 rounded-2xl" />
            <Skeleton className="h-14 w-40 rounded-2xl" />
            <Skeleton className="h-14 w-52 rounded-2xl" />
        </div>
    </div>
);

/* ── MessagesSkeleton ── */
export const MessagesSkeleton = () => (
    <div className="space-y-3">
        {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center gap-4 p-4 bg-muted/40 rounded-2xl border border-border/50">
                <Skeleton className="size-12 rounded-2xl shrink-0" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3 rounded-full" />
                    <Skeleton className="h-3 w-2/3 rounded-full" />
                </div>
                <Skeleton className="h-3 w-12 rounded-full shrink-0" />
            </div>
        ))}
    </div>
);

/* ── ProfileSkeleton ── */
export const ProfileSkeleton = () => (
    <div className="space-y-8 pt-32 pb-16 container mx-auto px-4 md:px-8 max-w-2xl">
        <div className="flex items-center gap-6">
            <Skeleton className="size-20 rounded-3xl shrink-0" />
            <div className="space-y-3 flex-1">
                <Skeleton className="h-6 w-40 rounded-lg" />
                <Skeleton className="h-4 w-24 rounded-full" />
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="space-y-2">
                    <Skeleton className="h-3 w-20 rounded-full" />
                    <Skeleton className="h-12 w-full rounded-2xl" />
                </div>
            ))}
        </div>
        <Skeleton className="h-14 w-full rounded-2xl" />
    </div>
);

