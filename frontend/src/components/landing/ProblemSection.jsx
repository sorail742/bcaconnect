import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight, ShieldCheck, Zap, Lock, Globe, Coins, Route, Activity, TrendingUp } from "lucide-react";
import { useLanguage } from '../../context/useLanguage';
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
        <section className="relative py-40 bg-slate-900 text-white overflow-hidden font-sans rounded-[5rem] -mt-20 z-10 shadow-[0_40px_120px_rgba(0,0,0,0.5)] border-t border-white/5">
            <GeometricBackground />
            {/* Immersive Local Background */}
            <div 
                className="absolute inset-0 z-0 opacity-[0.05] bg-cover bg-fixed bg-center pointer-events-none grayscale"
                style={{ backgroundImage: `url(${imgBg})` }}
            />
            
            <div className="absolute top-0 left-0 w-full h-[60rem] bg-gradient-to-b from-primary/[0.1] to-transparent pointer-events-none" />
            
            <div className="container mx-auto px-6 md:px-12 relative z-10 w-full">
                <div className="max-w-full lg:max-w-[95%] mx-auto">
                    <div className="text-left space-y-10 mb-24 max-w-4xl">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-4 px-8 py-3 rounded-2xl bg-primary/20 border border-primary/30 text-[11px] font-black text-primary uppercase tracking-[0.4em] shadow-2xl"
                        >
                            <AlertCircle className="size-5 animate-pulse" /> {t('probBadge') || "SYSTEM_DIAGNOSTIC v4.0"}
                        </motion.div>
                        <motion.h2 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="text-5xl md:text-8xl lg:text-[9rem] font-black tracking-tighter text-white leading-[0.85] uppercase"
                            style={{ fontFamily: "'Outfit', sans-serif" }}
                        >
                             {t('probTitle')?.split(' ').slice(0, -1).join(' ') || "OPTIMISATION DU"}<br />
                             <span className="text-primary italic relative">
                                {t('probTitle')?.split(' ').slice(-1) || "FLUX COMMERCIAL"}
                                <motion.div 
                                    initial={{ width: 0 }}
                                    whileInView={{ width: "100%" }}
                                    className="absolute -bottom-4 left-0 h-4 bg-primary/20 blur-2xl -z-10"
                                />
                             </span>
                        </motion.h2>
                        <motion.p 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="text-2xl md:text-3xl text-white/60 leading-[1.3] max-w-3xl border-l-[12px] border-primary/40 pl-10 font-medium uppercase tracking-tight"
                        >
                            {t('probDesc') || "Le commerce en Afrique fait face à d'énormes défis logistiques et de confiance. BCA déploie l'infrastructure technologique ultime."}
                        </motion.p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
                        {comparisons.map((item, index) => (
                            <motion.div 
                                key={index} 
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.15, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                            >
                                <div className="group relative p-12 rounded-[3.5rem] bg-white/5 border border-white/10 backdrop-blur-2xl transition-all duration-700 hover:border-primary/40 hover:bg-white/[0.08] shadow-2xl flex flex-col justify-between h-full group">
                                    <div>
                                        <div className={`size-20 rounded-3xl ${item.bg} flex items-center justify-center mb-10 border border-white/10 transition-all duration-500 group-hover:scale-110 shadow-2xl group-hover:shadow-primary/20`}>
                                            <item.icon className={`size-10 ${item.color}`} />
                                        </div>
                                        <h3 className="text-3xl font-black text-white mb-8 uppercase tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>{item.label}</h3>
                                    </div>
                                    
                                    <div className="space-y-8 text-left mt-8">
                                        <div className="space-y-4 opacity-30 group-hover:opacity-50 transition-opacity">
                                            <div className="flex items-center justify-between text-[11px] font-black text-white/50 uppercase tracking-[0.2em]">
                                                <span>{item.old}</span>
                                                <span className="text-rose-500 font-bold text-lg">✗</span>
                                            </div>
                                            <div className="h-2.5 bg-white/10 rounded-full w-full overflow-hidden">
                                                <div className="h-full bg-white/20 w-1/4 rounded-full" />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between text-xs font-black text-primary uppercase tracking-[0.2em]">
                                                <span>{item.new}</span>
                                                <span className="text-emerald-500 font-bold text-lg">✓</span>
                                            </div>
                                            <div className="h-2.5 bg-primary/10 border border-primary/20 rounded-full w-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    whileInView={{ width: "100%" }}
                                                    transition={{ delay: 0.5, duration: 1.5, ease: "circOut" }}
                                                    className="h-full bg-primary rounded-full shadow-[0_0_20px_rgba(255,102,0,0.8)]"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="mt-20 p-12 rounded-[3.5rem] bg-white text-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-10 border border-white/20 shadow-[0_40px_100px_rgba(255,102,0,0.15)] group hover:scale-[1.02] transition-all duration-700"
                    >
                        <div className="space-y-4 text-left">
                            <h3 className="text-4xl md:text-5xl font-black leading-none text-slate-900 uppercase tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                {t('futureEconomy') || "L'Avenir de l'Économie Guinéenne"}
                            </h3>
                            <p className="text-xs text-primary font-black tracking-[0.4em] uppercase">{t('secureInfallible') || "Sécurité Infaillible • Livraison Garantie • Prix Transparents"}</p>
                        </div>
                        <div className="size-28 rounded-[2rem] bg-slate-900 flex items-center justify-center text-primary shadow-2xl shrink-0 border border-white/10 group-hover:rotate-12 transition-transform duration-700">
                            <Zap className="size-14 fill-current drop-shadow-[0_0_20px_rgba(255,102,0,0.5)]" />
                        </div>
                    </motion.div>
                </div>
            </div>
            
            {/* Background Texture */}
            <div className="absolute bottom-0 right-0 size-[50rem] bg-primary/[0.05] blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute -top-40 -left-40 size-[40rem] bg-blue-500/[0.03] blur-[150px] rounded-full pointer-events-none" />
        </section>
    );
}
