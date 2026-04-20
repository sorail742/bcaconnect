import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight, ShieldCheck, Zap, Lock, Globe, Coins, Route, Activity, TrendingUp } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import imgBg from '../../assets/guinea_bg_faded.png';
import TiltWrapper from '../ui/TiltWrapper';
import GeometricBackground from '../ui/GeometricBackground';

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
        <section className="relative py-16 bg-background text-foreground overflow-hidden font-sans border-y border-border">
            <GeometricBackground />
            {/* Immersive Local Background */}
            <div 
                className="absolute inset-0 z-0 opacity-[0.07] bg-cover bg-fixed bg-center pointer-events-none"
                style={{ backgroundImage: `url(${imgBg})` }}
            />
            
            <div className="absolute top-0 left-0 w-full h-[60rem] bg-gradient-to-b from-primary/[0.03] to-transparent pointer-events-none" />
            
            <div className="container mx-auto px-4 md:px-8 relative z-10 w-full">
                <div className="max-w-full lg:max-w-[90%] mx-auto">
                    <div className="text-left space-y-6 mb-12">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-primary/10 border border-primary/20 text-sm font-bold text-primary uppercase tracking-wide shadow-sm"
                        >
                            <AlertCircle className="size-5" /> {t('probBadge') || "Diagnostic du Réseau"}
                        </motion.div>
                        <motion.h2 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.1]"
                        >
                             {t('probTitle')?.split(' ').slice(0, -1).join(' ') || "NOUS RESOLVONS LES"}<br />
                             <span className="text-primary italic">{t('probTitle')?.split(' ').slice(-1) || "OBSTACLES"}</span>
                        </motion.h2>
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl border-l-4 border-primary/40 pl-6 font-medium"
                        >
                            {t('probDesc') || "Le commerce en Afrique fait face à d'énormes défis logistiques et de confiance. Voici comment la plateforme BCA Connect déploie des solutions innovantes pour garantir un écosystème sûr, rapide et fiable."}
                        </motion.p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                        {comparisons.map((item, index) => (
                            <motion.div 
                                key={index} 
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            >
                                <TiltWrapper className="group relative p-8 rounded-[2rem] bg-card border border-border transition-all duration-300 hover:border-primary/40 hover:shadow-[0_40px_80px_-20px_rgba(255,102,0,0.12)] flex flex-col justify-between h-full">
                                    <div>
                                    <div className={`size-16 rounded-2xl ${item.bg} flex items-center justify-center mb-6 border border-border transition-all duration-300 group-hover:scale-110 shadow-sm`}>
                                        <item.icon className={`size-8 ${item.color}`} />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground mb-4">{item.label}</h3>
                                </div>
                                
                                <div className="space-y-5 text-left mt-6">
                                    <div className="space-y-3 opacity-40 group-hover:opacity-60 transition-opacity">
                                        <div className="flex items-center justify-between text-sm font-semibold text-muted-foreground">
                                            <span>{item.old}</span>
                                            <span className="text-rose-500 font-bold">✗</span>
                                        </div>
                                        <div className="h-3 bg-muted rounded-full w-full overflow-hidden">
                                            <div className="h-full bg-muted-foreground/30 w-1/3 rounded-full" />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-base font-bold text-primary">
                                            <span>{item.new}</span>
                                            <span className="text-emerald-500 font-bold">✓</span>
                                        </div>
                                        <div className="h-3 bg-primary/10 border border-primary/20 rounded-full w-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: "100%" }}
                                                transition={{ delay: 0.3, duration: 1.2 }}
                                                className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(255,102,0,0.5)]"
                                            />
                                        </div>
                                    </div>
                                    </div>
                                </TiltWrapper>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="mt-12 p-8 rounded-[2rem] bg-muted text-foreground flex flex-col md:flex-row md:items-center justify-between gap-6 border border-border hover:shadow-lg hover:border-primary/20 transition-all duration-300"
                    >
                        <div className="space-y-3 text-left">
                            <h3 className="text-2xl font-black leading-tight text-foreground">{t('probOptim') || "L'Avenir de l'Économie Guinéenne"}</h3>
                            <p className="text-base text-muted-foreground font-medium tracking-wide text-primary">Sécurité Infaillible • Livraison Garantie • Prix Transparents</p>
                        </div>
                        <div className="size-20 rounded-[1.5rem] bg-background flex items-center justify-center text-primary shadow-sm shrink-0 border border-border">
                            <Zap className="size-10 fill-current drop-shadow-md" />
                        </div>
                    </motion.div>
                </div>
            </div>
            
            {/* Background Texture */}
            <div className="absolute bottom-0 right-0 size-[40rem] bg-primary/[0.03] blur-[150px] rounded-full pointer-events-none" />
        </section>
    );
}
