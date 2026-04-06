import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight, ShieldCheck, Zap, Lock, Globe, Coins, Route, Activity, TrendingUp } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export function ProblemSection() {
    const { t } = useLanguage();

    const comparisons = [
        {
            icon: Lock,
            label: t('probLackTrust') || "TRUST_DEFICIT",
            old: t('probTrad') || "LEGACY_SYSTEM",
            new: t('probEscrow') || "ESCROW_PROTOCOL",
            color: "text-primary",
            bg: "bg-primary/10"
        },
        {
            icon: Coins,
            label: t('probComplexPay') || "PAYMENT_FRICTION",
            old: t('probTrad') || "FRAGILE_FLOW",
            new: t('probInterOp') || "INTEROP_STATION",
            color: "text-emerald-500",
            bg: "bg-emerald-500/10"
        },
        {
            icon: Route,
            label: t('probOpaqueLog') || "OPAQUE_CHAINS",
            old: t('probTrad') || "STATIC_TRACKING",
            new: t('probRealTime') || "VELOCITY_SYNC",
            color: "text-foreground",
            bg: "bg-foreground/10"
        }
    ];

    return (
        <section className="relative py-16 bg-background overflow-hidden font-jakarta">
            <div className="absolute top-0 left-0 w-full h-[60rem] bg-gradient-to-b from-primary/[0.03] to-transparent pointer-events-none" />
            
            <div className="container mx-auto px-8 md:px-12 relative z-10">
                <div className="max-w-[1400px] mx-auto">
                    <div className="text-left space-y-5 mb-10">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary uppercase tracking-wide shadow-sm"
                        >
                            <AlertCircle className="size-4" /> {t('probBadge') || "Diagnostic du Réseau"}
                        </motion.div>
                        <motion.h2 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="text-2xl md:text-4xl font-bold tracking-tight text-foreground leading-tight"
                            style={{ fontFamily: "'Outfit', sans-serif" }}
                        >
                             {t('probTitle')?.split(' ').slice(0, -1).join(' ') || "LEGACY"}<br />
                             <span className="text-primary italic">{t('probTitle')?.split(' ').slice(-1) || "LIMITATIONS."}</span>
                        </motion.h2>
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="text-base text-muted-foreground leading-relaxed max-w-2xl border-l-4 border-primary/30 pl-4"
                        >
                            {t('probDesc') || "L'architecture actuelle du commerce est fragmentée. Nous déployons des protocoles de nouvelle génération pour éliminer les frictions et renforcer la fiabilité absolue des échanges."}
                        </motion.p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {comparisons.map((item, index) => (
                            <motion.div 
                                key={index} 
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                className="group relative p-5 rounded-2xl bg-card border border-border transition-all duration-300 hover:border-primary/40 hover:-translate-y-1 hover:shadow-md"
                            >
                                <div className={`size-10 rounded-xl ${item.bg} flex items-center justify-center mb-3 border border-border transition-all duration-300 group-hover:scale-105`}>
                                    <item.icon className={`size-6 ${item.color}`} />
                                </div>
                                <h3 className="text-sm font-semibold text-foreground mb-2">{item.label}</h3>
                                
                                <div className="space-y-3 text-left">
                                    <div className="space-y-2 opacity-30">
                                        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                                            <span>{item.old}</span>
                                            <span className="text-rose-500 text-xs">✗</span>
                                        </div>
                                        <div className="h-2 bg-muted rounded-full w-full overflow-hidden">
                                            <div className="h-full bg-muted-foreground/30 w-1/3 rounded-full" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-xs font-semibold text-primary">
                                            <span>{item.new}</span>
                                            <span className="text-emerald-500 text-xs">✓</span>
                                        </div>
                                        <div className="h-2 bg-primary/10 border border-primary/20 rounded-full w-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: "100%" }}
                                                transition={{ delay: 0.3, duration: 1.2 }}
                                                className="h-full bg-primary rounded-full"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="mt-8 p-5 rounded-2xl bg-foreground text-background flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:shadow-md transition-all duration-300"
                    >
                        <div className="space-y-2 text-left">
                            <h3 className="text-lg font-bold leading-tight">{t('probOptim') || "Optimisation de l'Économie Digitale"}</h3>
                            <p className="text-xs opacity-60">Résilience • Souveraineté Numérique</p>
                        </div>
                        <div className="size-12 rounded-xl bg-background flex items-center justify-center text-primary shadow-sm shrink-0">
                            <Zap className="size-6 fill-current" />
                        </div>
                    </motion.div>
                </div>
            </div>
            
            {/* Background Texture */}
            <div className="absolute bottom-0 right-0 size-[40rem] bg-primary/[0.03] blur-[150px] rounded-full pointer-events-none" />
        </section>
    );
}
