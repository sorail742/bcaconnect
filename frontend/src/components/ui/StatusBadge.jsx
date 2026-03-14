import React from 'react';
import { Badge } from './Badge';
import { cn } from '../../lib/utils';

const StatusBadge = ({ status, variant = 'info', className }) => {
    const variantMap = {
        success: 'default', // We can adjust these to match our specific needs
        warning: 'secondary',
        danger: 'destructive',
        info: 'outline',
        neutral: 'outline',
    };

    const statusStyles = {
        success: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        warning: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        danger: 'bg-destructive/10 text-destructive border-destructive/20',
        info: 'bg-primary/10 text-primary border-primary/20',
        neutral: 'bg-muted text-muted-foreground border-border',
    };

    return (
        <Badge
            variant={variantMap[variant] || 'outline'}
            className={cn(
                "font-bold uppercase tracking-widest px-2 py-0.5 rounded-full text-[10px]",
                statusStyles[variant],
                className
            )}
        >
            {status}
        </Badge>
    );
};

export { StatusBadge };
export default StatusBadge;
