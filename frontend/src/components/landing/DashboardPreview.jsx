import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Package, Users, Bell, Search, ArrowUpRight, ArrowRight, Zap, Activity, Terminal } from "lucide-react";
import { cn } from "../../lib/utils";
import { useLanguage } from "../../context/LanguageContext";

export function DashboardPreview() {
    const { lang } = useLanguage();

    return (
        <section className="relative py-16 bg-background overflow-hidden font-jakarta border-y border-border">
            <div className="container mx-auto px-6 md:px-12 relative z-10">
                <div className="max-w-3xl mx-auto text-center mb-10 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-foreground text-background text-xs font-semibold uppercase tracking-wide shadow-sm">
                        <Activity className="size-4 text-primary animate-pulse" />
                        {lang === 'FR' ? "Interface Intuitive" : "Intuitive Interface"}
                    </div>
                    <h2 className="text-2xl md:text-4xl font-bold text-foreground tracking-tight">
                        {lang === 'FR' ? "Une gestion " : "Simplified "}
                        <span className="text-primary">{lang === 'FR' ? "simplifiée." : "management."}</span>
                    </h2>
                    <p className="text-base text-muted-foreground leading-relaxed max-w-xl mx-auto">
                        {lang === 'FR'
                            ? "Pilotez votre activité avec une clarté absolue grâce à notre tableau de bord tout-en-un."
                            : "Drive your operations with absolute clarity and high-velocity performance."}
                    </p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative max-w-5xl mx-auto"
                >
                    <div className="rounded-2xl overflow-hidden border border-border bg-card shadow-sm hover:border-primary/40 transition-all duration-300">
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/50">
                            <div className="flex items-center gap-3">
                                <div className="size-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
                                    <span className="font-bold text-xs">BCA</span>
                                </div>
                                <div className="hidden sm:block">
                                    <p className="font-semibold text-foreground text-sm leading-none">BCA Connect</p>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <div className="size-1.5 rounded-full bg-primary animate-pulse" />
                                        <span className="text-xs text-primary font-medium">Actif</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background border border-border">
                                    <Search className="size-3.5 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">Rechercher...</span>
                                </div>
                                <div className="relative p-2 rounded-lg bg-background border border-border cursor-pointer hover:border-primary/40 transition-colors">
                                    <Bell className="size-4 text-foreground" />
                                    <span className="absolute top-1.5 right-1.5 size-1.5 bg-primary rounded-full animate-pulse" />
                                </div>
                                <div className="size-8 rounded-full overflow-hidden border border-border">
                                    <img src="https://ui-avatars.com/api/?name=BCA+Admin&background=FF6600&color=fff" alt="User" className="w-full h-full object-cover" />
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-5">
                            {/* KPI row */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                                {[
                                    { icon: TrendingUp, label: lang === 'FR' ? "Volume Ventes" : "Sales Volume", val: "15,2M", unit: "GNF", color: "text-primary", bg: "bg-primary/10" },
                                    { icon: Package, label: lang === 'FR' ? "Commandes" : "Orders", val: "284", unit: "unités", color: "text-blue-500", bg: "bg-blue-500/10" },
                                    { icon: Users, label: lang === 'FR' ? "Utilisateurs" : "Users", val: "1 429", unit: "actifs", color: "text-emerald-500", bg: "bg-emerald-500/10" },
                                    { icon: Activity, label: lang === 'FR' ? "Croissance" : "Growth", val: "94,2", unit: "%", color: "text-purple-500", bg: "bg-purple-500/10" },
                                ].map((stat, i) => (
                                    <div key={i} className="p-4 rounded-xl bg-muted border border-border hover:border-primary/30 transition-all shadow-sm">
                                        <div className={cn("size-9 rounded-lg flex items-center justify-center mb-3 border border-border", stat.bg)}>
                                            <stat.icon className={cn("size-4", stat.color)} />
                                        </div>
                                        <p className="text-xs font-medium text-muted-foreground mb-1">{stat.label}</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-lg font-bold text-foreground tabular-nums">{stat.val}</span>
                                            <span className="text-xs text-muted-foreground">{stat.unit}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Bottom row */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                                <div className="lg:col-span-2 rounded-xl bg-muted border border-border overflow-hidden">
                                    <div className="px-4 py-3 border-b border-border bg-background flex justify-between items-center">
                                        <h4 className="font-semibold text-xs text-foreground border-l-4 border-primary pl-3 py-0.5">
                                            {lang === 'FR' ? "Dernières Opérations" : "Recent Operations"}
                                        </h4>
                                        <span className="text-xs font-semibold text-primary cursor-pointer flex items-center gap-1">
                                            {lang === 'FR' ? "Voir tout" : "View All"} <ArrowUpRight className="size-3" />
                                        </span>
                                    </div>
                                    <div className="p-3 space-y-1">
                                        {[
                                            { name: "Alpha Diallo", ref: "#BCA-2847", amount: "850k", status: "Livré", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
                                            { name: "Fatou Barry", ref: "#BCA-2846", amount: "1,2M", status: "En cours", color: "text-primary", bg: "bg-primary/10" },
                                            { name: "Ibrahim Sow", ref: "#BCA-2845", amount: "2,5M", status: "Livré", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10" },
                                        ].map((row, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-background border border-transparent hover:border-border transition-all cursor-default">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-7 rounded-lg bg-background border border-border flex items-center justify-center font-bold text-xs text-muted-foreground">0{i + 1}</div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-foreground leading-none">{row.name}</p>
                                                        <p className="text-xs text-muted-foreground mt-0.5">{row.ref}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <p className="text-sm font-bold text-foreground tabular-nums">{row.amount} GNF</p>
                                                    <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold", row.bg, row.color)}>{row.status}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3 flex flex-col justify-center">
                                    <div className="p-5 rounded-xl bg-primary text-primary-foreground shadow-sm relative overflow-hidden cursor-pointer hover:bg-primary/90 transition-colors">
                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                            <Zap className="size-16 fill-current" />
                                        </div>
                                        <div className="relative z-10 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <ArrowUpRight className="size-5" />
                                                <span className="px-2.5 py-1 bg-background/20 rounded-full text-xs font-semibold">Premium</span>
                                            </div>
                                            <h5 className="text-sm font-bold leading-tight">
                                                {lang === 'FR' ? "Passez au niveau supérieur" : "Upgrade to Premium"}
                                            </h5>
                                            <p className="text-xs opacity-80 leading-relaxed">
                                                {lang === 'FR' ? "Débloquez les analyses avancées." : "Unlock advanced analytics."}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-xl bg-foreground text-background border border-border flex items-center justify-between cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <Terminal className="size-5 text-primary" />
                                            <div>
                                                <p className="text-sm font-semibold leading-none">Console</p>
                                                <p className="text-xs opacity-60 mt-0.5">Interface système</p>
                                            </div>
                                        </div>
                                        <ArrowRight className="size-4" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
