import React from 'react';
import { cn } from '../../lib/utils';

const statusConfig = {
    // Order statuses
    'livré':         { style: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', pulse: false },
    'en_cours':      { style: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20', pulse: true },
    'en attente':    { style: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', pulse: true },
    'annulé':        { style: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20', pulse: false },
    'confirmé':      { style: 'bg-primary/10 text-primary border-primary/20', pulse: true },
    // Generic
    'success':       { style: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', pulse: false },
    'warning':       { style: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', pulse: false },
    'danger':        { style: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20', pulse: false },
    'info':          { style: 'bg-primary/10 text-primary border-primary/20', pulse: false },
    'neutral':       { style: 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10', pulse: false },
};

const StatusBadge = ({ status, variant, className }) => {
    const key = status?.toLowerCase() || variant || 'neutral';
    const config = statusConfig[key] || statusConfig['neutral'];

    return (
        <span className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border tracking-wide",
            config.style,
            className
        )}>
            <span className={cn(
                "size-1.5 rounded-full bg-current shrink-0",
                config.pulse ? "animate-pulse" : ""
            )} />
            {status}
        </span>
    );
};

export { StatusBadge };
export default StatusBadge;

