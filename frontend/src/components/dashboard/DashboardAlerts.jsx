import React from 'react';
import { AlertCircle, Package, Zap, ArrowRight, X } from 'lucide-react';
import { cn } from '../../lib/utils';

const DashboardAlerts = ({ alerts = [], onDismiss }) => {
    if (alerts.length === 0) return null;

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
            {alerts.map((alert, idx) => (
                <div key={idx} className={cn(
                    "relative overflow-hidden rounded-2xl border-2 p-5 flex items-center justify-between group transition-all",
                    alert.type === 'critical' ? "bg-rose-500/5 border-rose-500/20 text-rose-500" :
                    alert.type === 'warning' ? "bg-amber-500/5 border-amber-500/20 text-amber-500" :
                    "bg-primary/5 border-primary/20 text-primary"
                )}>
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "size-10 rounded-xl flex items-center justify-center shadow-lg",
                            alert.type === 'critical' ? "bg-rose-500 text-white" :
                            alert.type === 'warning' ? "bg-amber-500 text-white" :
                            "bg-primary text-white"
                        )}>
                            {alert.icon || <AlertCircle className="size-5" />}
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest leading-none mb-1">{alert.label}</p>
                            <p className="text-sm font-bold text-foreground opacity-70 italic">{alert.message}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {alert.action && (
                            <button onClick={alert.action.onClick} className="px-4 py-2 bg-background border border-current rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-current hover:text-white transition-all">
                                {alert.action.label}
                            </button>
                        )}
                        <button onClick={() => onDismiss?.(idx)} className="p-2 opacity-20 hover:opacity-100 transition-opacity">
                            <X className="size-4" />
                        </button>
                    </div>

                    {/* Gradient pulse for critical alerts */}
                    {alert.type === 'critical' && (
                        <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-transparent animate-pulse pointer-events-none" />
                    )}
                </div>
            ))}
        </div>
    );
};

const NextBestAction = ({ action }) => {
    if (!action) return null;

    return (
        <div className="glass-card border border-primary/20 bg-primary/[0.02] p-4 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-primary/[0.05] transition-all mb-8">
            <div className="flex items-center gap-4">
                <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Zap className="size-4 fill-current" />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">IA Insight</span>
                    <span className="text-sm font-bold text-foreground/80">{action.message}</span>
                </div>
            </div>
            <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                {action.label || "Optimiser"}
                <ArrowRight className="size-3" />
            </div>
        </div>
    );
};

export { DashboardAlerts, NextBestAction };
