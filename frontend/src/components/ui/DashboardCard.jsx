import React from 'react';
import { cn } from '../../lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

const DashboardCard = ({
    title,
    value,
    description,
    trend,
    trendValue,
    icon: Icon,
    className,
    badge, // { label, color }
    impact, // { value, label, type }
    variant = "default", // default, glass
    color = "primary"
}) => {
    const isGlass = variant === "glass";

    return (
        <div className={cn(
            "group relative overflow-hidden rounded-2xl border transition-all duration-200",
            isGlass
                ? "bg-slate-950 text-white border-slate-800 shadow-lg"
                : "bg-card border-slate-100 dark:border-white/5 text-slate-900 dark:text-white shadow-sm hover:border-primary/20 hover:shadow-md",
            className
        )}>
            <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                    {/* Icon */}
                    <div className={cn(
                        "size-11 rounded-xl flex items-center justify-center border transition-all duration-200 group-hover:scale-105",
                        isGlass
                            ? "bg-white/10 border-white/10 text-primary"
                            : "bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 text-primary group-hover:bg-primary group-hover:text-white"
                    )}>
                        {Icon && <Icon className="size-5" />}
                    </div>

                    {/* Badge */}
                    {badge && (
                        <div className={cn(
                            "px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider border",
                            badge.color === 'rose' ? "bg-rose-500/10 border-rose-500/20 text-rose-500" :
                            badge.color === 'amber' ? "bg-amber-500/10 border-amber-500/20 text-amber-500" :
                            badge.color === 'emerald' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" :
                            "bg-primary/10 border-primary/20 text-primary"
                        )}>
                            {badge.label}
                        </div>
                    )}

                    {/* Trend — only if no badge */}
                    {trendValue && !badge && (
                        <div className={cn(
                            "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border",
                            trend === "up"
                                ? "bg-emerald-500/10 border-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                : "bg-rose-500/10 border-rose-500/15 text-rose-600 dark:text-rose-400"
                        )}>
                            {trend === "up" ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                            {trendValue}
                        </div>
                    )}
                </div>

                <div className="space-y-1.5">
                    {/* Label */}
                    <p className={cn(
                        "text-executive-label",
                        isGlass ? "text-slate-500" : ""
                    )}>
                        {title}
                    </p>

                    {/* Value */}
                    <p className={cn(
                        "text-3xl font-bold tracking-tight tabular-nums",
                        isGlass ? "text-white" : "text-slate-900 dark:text-white"
                    )}>
                        {value}
                    </p>

                    {/* Trend shown below value if badge is present */}
                    {trendValue && badge && (
                        <div className={cn(
                            "inline-flex items-center gap-1.5 text-[11px] font-semibold mt-1",
                            trend === "up" ? "text-emerald-500" : "text-rose-500"
                        )}>
                            {trend === "up" ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                            {trendValue} vs mois dernier
                        </div>
                    )}

                    {/* Impact Tag */}
                    {impact && (
                        <div className={cn(
                            "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wide mt-2",
                            impact.type === 'risk' ? "bg-rose-500/10 text-rose-500" :
                            impact.type === 'growth' ? "bg-emerald-500/10 text-emerald-500" :
                            "bg-slate-500/10 text-slate-500"
                        )}>
                            <span className="opacity-60">{impact.label}:</span>
                            <span className="font-bold">{impact.value}</span>
                        </div>
                    )}

                    {/* Description */}
                    {description && (
                        <p className={cn(
                            "text-[12px] font-medium mt-3 leading-relaxed opacity-50",
                            isGlass ? "text-slate-400" : "text-slate-500"
                        )}>
                            {description}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export { DashboardCard };
export default DashboardCard;
