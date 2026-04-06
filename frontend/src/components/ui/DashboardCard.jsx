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
            "group relative overflow-hidden rounded-xl border border-border bg-card text-card-foreground transition-all duration-300 hover:shadow-md hover:-translate-y-0.5",
            "shadow-sm",
            className
        )}>
            <div className="p-5 flex flex-col h-full gap-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className={cn(
                        "size-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-105",
                        "bg-primary/10 text-primary border border-primary/20"
                    )}>
                        {Icon && <Icon className="size-5" />}
                    </div>

                    {badge ? (
                        <span className={cn(
                            "px-2.5 py-1 rounded-lg text-[11px] font-semibold border",
                            badge.color === 'rose' ? "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20" :
                            badge.color === 'amber' ? "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20" :
                            badge.color === 'emerald' ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" :
                            "bg-primary/10 text-primary border-primary/20"
                        )}>
                            {badge.label}
                        </span>
                    ) : trendValue && (
                        <span className={cn(
                            "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border",
                            trend === "up"
                                ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                                : "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                        )}>
                            {trend === "up" ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                            {trendValue}
                        </span>
                    )}
                </div>

                {/* Content */}
                <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        {title}
                    </p>
                    <p className="text-2xl font-bold text-foreground tracking-tight tabular-nums truncate">
                        {value}
                    </p>
                </div>

                {/* Footer */}
                {(description || impact) && (
                    <div className="pt-3 border-t border-border space-y-2">
                        {impact && (
                            <div className={cn(
                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border",
                                impact.type === 'risk' ? "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20" :
                                impact.type === 'growth' ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" :
                                "bg-muted text-muted-foreground border-border"
                            )}>
                                <Sparkles className="size-3 opacity-60" />
                                <span className="opacity-70">{impact.label}:</span>
                                <span className="font-semibold">{impact.value}</span>
                            </div>
                        )}
                        {description && (
                            <p className="text-xs text-muted-foreground leading-relaxed">
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
