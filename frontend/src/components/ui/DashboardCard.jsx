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
    badge, // { label, color }
    impact, // { value, label, type }
    variant = "default", // default, glass
    color = "primary"
}) => {
    const isGlass = variant === "glass";

    return (
        <div className={cn(
            "group relative overflow-hidden rounded-[2.5rem] border-4 transition-all duration-700",
            isGlass
                ? "bg-white/[0.02] border-white/5 backdrop-blur-3xl shadow-3xl"
                : "bg-[#0A0D14] border-white/5 text-white shadow-3xl hover:border-[#FF6600]/20 hover:scale-[1.02]",
            className
        )}>
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF6600]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

            <div className="p-10 relative z-10 flex flex-col h-full justify-between">
                <div>
                    <div className="flex items-start justify-between mb-10">
                        {/* Icon */}
                        <div className={cn(
                            "size-16 rounded-2xl flex items-center justify-center border-2 transition-all duration-700 group-hover:rotate-12 shadow-3xl",
                            isGlass
                                ? "bg-white/5 border-white/10 text-[#FF6600]"
                                : "bg-white/5 border-white/5 text-[#FF6600] group-hover:bg-[#FF6600] group-hover:text-white group-hover:border-[#FF6600]"
                        )}>
                            {Icon && <Icon className="size-8" />}
                        </div>

                        {/* Badge */}
                        {badge && (
                            <div className={cn(
                                "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] border-2 italic shadow-lg",
                                badge.color === 'rose' ? "bg-rose-500/10 border-rose-500/20 text-rose-500" :
                                    badge.color === 'amber' ? "bg-amber-500/10 border-amber-500/20 text-amber-500" :
                                        badge.color === 'emerald' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                                            "bg-[#FF6600]/10 border-[#FF6600]/20 text-[#FF6600]"
                            )}>
                                {badge.label}
                            </div>
                        )}

                        {/* Trend — only if no badge */}
                        {trendValue && !badge && (
                            <div className={cn(
                                "flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black tracking-[0.3em] border-2 italic uppercase shadow-lg",
                                trend === "up"
                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                    : "bg-rose-500/10 border-rose-500/20 text-rose-500"
                            )}>
                                {trend === "up" ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
                                {trendValue}
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        {/* Label */}
                        <div className="flex items-center gap-3">
                            <div className="size-2 rounded-full bg-[#FF6600] animate-pulse shadow-[0_0_10px_rgba(255,102,0,0.4)]" />
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] italic leading-none pt-0.5">
                                {title}
                            </p>
                        </div>

                        {/* Value */}
                        <p className="text-4xl lg:text-5xl font-black italic tracking-tighter text-white uppercase leading-none truncate">
                            {value}
                        </p>

                        {/* Trend shown below value if badge is present */}
                        {trendValue && badge && (
                            <div className={cn(
                                "inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mt-2 italic",
                                trend === "up" ? "text-emerald-500" : "text-rose-500"
                            )}>
                                {trend === "up" ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                                {trendValue} <span className="text-slate-600 ml-1">VS MOIS DERNIER</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 space-y-6">
                    {/* Impact Tag */}
                    {impact && (
                        <div className={cn(
                            "inline-flex items-center gap-3 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border-2 italic",
                            impact.type === 'risk' ? "bg-rose-500/5 border-rose-500/10 text-rose-500" :
                                impact.type === 'growth' ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-500" :
                                    "bg-white/5 border-white/5 text-slate-500"
                        )}>
                            <Sparkles className="size-3 opacity-50" />
                            <span className="opacity-40">{impact.label}:</span>
                            <span className="font-black text-white">{impact.value}</span>
                        </div>
                    )}

                    {/* Description */}
                    {description && (
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] italic leading-relaxed text-slate-600 border-l-4 border-white/5 pl-6 group-hover:border-[#FF6600]/30 transition-colors">
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
