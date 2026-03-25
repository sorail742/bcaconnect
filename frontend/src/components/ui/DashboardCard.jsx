import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './Card';
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
    variant = "default", // default, simple, glass
    color = "primary" // primary, emerald, amber, rose
}) => {
    const colorClasses = {
        primary: "text-primary bg-primary/10 border-primary/20",
        emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
        amber: "text-amber-500 bg-amber-500/10 border-amber-500/20",
        rose: "text-rose-500 bg-rose-500/10 border-rose-500/20"
    };

    return (
        <div className={cn(
            "group relative overflow-hidden rounded-[2rem] border transition-all duration-500",
            variant === "glass" 
                ? "bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border-white/20 dark:border-slate-800/50 shadow-2xl shadow-black/5" 
                : "bg-card border-slate-100 dark:border-slate-800 shadow-xl shadow-black/[0.02] hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1",
            className
        )}>
            {/* Background Accent Gradient */}
            <div className={cn(
                "absolute -right-4 -top-4 size-24 blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700",
                `bg-${color}`
            )}></div>

            <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                    <div className={cn(
                        "size-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
                        colorClasses[color] || colorClasses.primary
                    )}>
                        {Icon && <Icon className="size-6" />}
                    </div>
                    {trendValue && (
                        <div className={cn(
                            "flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                            trend === "up" ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                        )}>
                            {trend === "up" ? <TrendingUp className="size-3 mr-1" /> : <TrendingDown className="size-3 mr-1" />}
                            {trendValue}
                        </div>
                    )}
                </div>

                <div className="space-y-1.5">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 leading-none">
                        {title}
                    </p>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter italic">
                        {value}
                    </h3>
                    {description && (
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 opacity-80 pt-1">
                            {description}
                        </p>
                    )}
                </div>
            </div>

            {/* Micro-sparkle Effect */}
            <div className="absolute bottom-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                <div className="size-1 rounded-full bg-primary/40 animate-ping"></div>
            </div>
        </div>
    );
};

export { DashboardCard };
export default DashboardCard;
