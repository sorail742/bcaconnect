import React from 'react';
import { cn } from '../../lib/utils';
import { TrendingUp, TrendingDown, Sparkles } from 'lucide-react';

const DashboardCard = ({
    title,
    value,
    description,
    trend,
    trendValue,
    icon: Icon,
    className,
    badge,
    impact,
    variant = "default",
}) => {
    return (
        <div className={cn(
            "group relative overflow-hidden rounded border border-border bg-card text-card-foreground transition-colors hover:border-primary/30",
            className
        )}>
            <div className="p-3 flex flex-col h-full gap-2">
                <div className="flex items-start justify-between gap-2">
                    <div className="size-7 rounded bg-primary/10 text-primary border border-primary/15 flex items-center justify-center shrink-0">
                        {Icon && <Icon className="size-3.5" />}
                    </div>

                    {badge ? (
                        <span className={cn(
                            "px-1.5 py-0.5 rounded text-[10px] font-medium border leading-none",
                            badge.color === 'rose' ? "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20" :
                            badge.color === 'amber' ? "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20" :
                            badge.color === 'emerald' ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" :
                            "bg-primary/10 text-primary border-primary/20"
                        )}>
                            {badge.label}
                        </span>
                    ) : trendValue && (
                        <span className={cn(
                            "flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium border leading-none",
                            trend === "up"
                                ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                                : "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                        )}>
                            {trend === "up" ? <TrendingUp className="size-2.5" /> : <TrendingDown className="size-2.5" />}
                            {trendValue}
                        </span>
                    )}
                </div>

                <div className="space-y-0.5">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                        {title}
                    </p>
                    <p className="text-base font-bold text-foreground tracking-tight tabular-nums leading-tight">
                        {value}
                    </p>
                </div>

                {(description || impact) && (
                    <div className="pt-2 border-t border-border space-y-1.5">
                        {impact && (
                            <div className={cn(
                                "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border",
                                impact.type === 'risk' ? "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20" :
                                impact.type === 'growth' ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" :
                                "bg-muted text-muted-foreground border-border"
                            )}>
                                <Sparkles className="size-2.5 opacity-60" />
                                <span className="opacity-70">{impact.label}:</span>
                                <span className="font-semibold">{impact.value}</span>
                            </div>
                        )}
                        {description && (
                            <p className="text-[11px] text-muted-foreground leading-snug">
                                {description}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export { DashboardCard };
export default DashboardCard;
