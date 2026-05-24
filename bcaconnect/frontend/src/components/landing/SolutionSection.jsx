import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Store, Shield, Truck, Smartphone, Cpu, Zap, Activity, Globe, Zap as ZapIcon } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import TiltWrapper from '../ui/TiltWrapper';
import GeometricBackground from '../ui/GeometricBackground';

import imgMarketplace from '../../assets/guinea_marketplace.png';
import imgSecure from '../../assets/guinea_tech.png';
import imgDelivery from '../../assets/guinea_logistics.png';
import imgAgriculture from '../../assets/guinea_agriculture.png';

export function SolutionSection() {
    const { t, lang } = useLanguage();

    const solutions = [
        {
            icon: Store,
            title: t('marketplace') || "MARCHÉ LOCAL",
            description: t('solMarketplace') || "ÉCOSYSTÈME DE COMMERCE UNIFIÉ GUINÉEN",
            image: imgMarketplace
        },
        {
            icon: Shield,
            title: t('feat1Title') || "CONFIANCE & PROTECTION",
            description: t('solSecure') || "PROTOCOLES D'ESCROW SÉCURISÉS POUR NOS PME",
            image: imgSecure
        },
        {
            icon: Truck,
            title: t('tracking') || "LOGISTIQUE 224",
            description: t('solDelivery') || "SYNC EN TEMPS RÉEL DES MOUVEMENTS DE FRET",
            image: imgDelivery
        },
        {
            icon: Smartphone,
            title: t('featAgri') || "AGRI-SUCCESS",
            description: t('solAgriculture') || "ACCÉLÉRER LA CHAINE DE VALEUR AGRICOLE",
            image: imgAgriculture
        }
    ];

    const benefits = [
        t('solCostReduction') || "OPERATIONAL_EFFICIENCY",
        t('solSecureTransac') || "SECURE_PROTOCOL_ENFORCEMENT",
        t('solEasyFinancing') || "VELOCITY_CAPITAL_ACCESS",
        t('solLocalSupport') || "GLOBAL_STANDARDS_LOCAL_LOGIC"
    ];

    return (
        <section className="relative py-40 bg-white overflow-hidden font-jakarta rounded-[5rem] -mt-20 z-10 shadow-2xl">
             <GeometricBackground />
             <div className="absolute top-0 right-0 size-[80rem] bg-primary/[0.03] blur-[180px] rounded-full -mr-96 -mt-96 pointer-events-none" />
            
            <div className="container mx-auto px-6 md:px-12 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                    
                    <div className="lg:col-span-12 xl:col-span-5 space-y-12 text-left">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-3 px-8 py-3 rounded-2xl bg-primary/10 border border-primary/20 text-[11px] font-black text-primary uppercase tracking-[0.4em] shadow-sm"
                        >
                            <ZapIcon className="size-5" /> {t('solBadge') || "AVANTAGES SYSTÈME v4.5"}
                        </motion.div>
                        
                        <motion.h2
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none uppercase"
                            style={{ fontFamily: "'Outfit', sans-serif" }}
                        >
                            {t('solTitle')?.split(' ').slice(0, -1).join(' ') || "Solutions"}{' '}
                            <span className="text-primary italic relative">
                                {t('solTitle')?.split(' ').slice(-1) || "OPTIMISÉES."}
                                <motion.div 
                                    initial={{ width: 0 }}
                                    whileInView={{ width: "100%" }}
                                    className="absolute -bottom-2 left-0 h-2 bg-primary/20 blur-xl -z-10"
                                />
                            </span>
                        </motion.h2>
                        
                        <motion.p
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="text-xl text-slate-500 font-medium leading-relaxed border-l-[10px] border-primary/40 pl-8 max-w-xl uppercase tracking-tight"
                        >
                            {t('solDesc') || "Nous reconstruisons l'infrastructure de la confiance. Nos protocoles sont conçus pour une efficacité maximale et une transparence absolue."}
                        </motion.p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {benefits.map((item, index) => (
                                <motion.div 
                                    key={index} 
                                    initial={{ opacity: 0, x: -10 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center gap-4 group cursor-pointer p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-primary/20 transition-all hover:translate-x-2"
                                >
                                    <div className="size-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:border-primary transition-all duration-300 shadow-sm">
                                        <CheckCircle2 className="size-5 text-primary group-hover:text-white transition-colors" />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-900 transition-colors">{item}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-12 xl:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {solutions.map((solution, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                            >
                                <div className="group relative overflow-hidden rounded-[3rem] bg-white border border-slate-100 transition-all duration-700 hover:border-primary/40 hover:shadow-[0_60px_120px_-30px_rgba(0,0,0,0.1)] h-full flex flex-col p-4">
                                    <div className="h-64 relative overflow-hidden shrink-0 rounded-[2rem]">
                                        <img 
                                            src={solution.image} 
                                            alt={solution.title} 
                                            className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110" 
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-80" />
                                        <div className="absolute top-6 right-6 size-12 rounded-2xl bg-white/40 backdrop-blur-3xl border border-white/20 flex items-center justify-center">
                                             <Activity className="size-6 text-primary animate-pulse" />
                                        </div>
                                    </div>
                                
                                    <div className="relative z-10 p-8 flex flex-col gap-5">
                                        <div className="size-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-sm group-hover:bg-primary group-hover:text-white transition-all">
                                            <solution.icon className="size-7" />
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter leading-none group-hover:text-primary transition-colors" style={{ fontFamily: "'Outfit', sans-serif" }}>{solution.title}</h3>
                                        <p className="text-sm font-medium text-slate-400 uppercase tracking-tight leading-relaxed">{solution.description}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                </div>
            </div>
            
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,102,0,0.05)_0%,transparent_50%)] pointer-events-none" />
        </section>
    );
}
