import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Store, Shield, Truck, Smartphone, Cpu, Zap, Activity, Globe, Zap as ZapIcon } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

import imgMarketplace from '../../assets/questceque_la_part_marche_comment_estelle_calculee.webp';
import imgSecure from '../../assets/terminal-de-paiement-achat-commerce-carte-de-credit.jpg';
import imgDelivery from '../../assets/coordinateur-logistique-coordinatrice-logistique.png';
import imgMobileMoney from '../../assets/interoperabilite_du_mobile_money_en_afrique.png';

export function SolutionSection() {
    const { t, lang } = useLanguage();

    const solutions = [
        {
            icon: Store,
            title: t('marketplace') || "ECOSYSTEM",
            description: t('solMarketplace') || "UNIFIED_COMMERCE_GATEWAY",
            image: imgMarketplace
        },
        {
            icon: Shield,
            title: t('feat1Title') || "PROTECTION",
            description: t('solSecure') || "ENCRYPTED_ESCROW_NODES",
            image: imgSecure
        },
        {
            icon: Truck,
            title: t('tracking') || "LOGISTICS",
            description: t('solDelivery') || "REALTIME_MOVEMENT_SYNC",
            image: imgDelivery
        },
        {
            icon: Smartphone,
            title: "MOBILE_MONEY",
            description: t('solMobileMoney') || "INTEROP_FINANCIAL_FLOW",
            image: imgMobileMoney
        }
    ];

    const benefits = [
        t('solCostReduction') || "OPERATIONAL_EFFICIENCY",
        t('solSecureTransac') || "SECURE_PROTOCOL_ENFORCEMENT",
        t('solEasyFinancing') || "VELOCITY_CAPITAL_ACCESS",
        t('solLocalSupport') || "GLOBAL_STANDARDS_LOCAL_LOGIC"
    ];

    return (
        <section className="relative py-16 bg-background overflow-hidden font-jakarta border-y border-border">
             <div className="absolute top-0 right-0 size-[60rem] bg-primary/[0.02] blur-[150px] rounded-full -mr-96 -mt-96 pointer-events-none" />
            
            <div className="container mx-auto px-8 md:px-12 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    <div className="lg:col-span-12 xl:col-span-5 space-y-6 text-left">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary uppercase tracking-wide shadow-sm"
                        >
                            <ZapIcon className="size-4" /> {t('solBadge') || "Avantages du Système"}
                        </motion.div>
                        
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="text-2xl md:text-4xl font-bold text-foreground tracking-tight leading-tight"
                        >
                            {t('solTitle')?.split(' ').slice(0, -1).join(' ') || "Solutions"}{' '}
                            <span className="text-primary">{t('solTitle')?.split(' ').slice(-1) || "optimisées."}</span>
                        </motion.h2>
                        
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="text-base text-muted-foreground leading-relaxed border-l-4 border-primary/30 pl-4 max-w-xl"
                        >
                            {t('solDesc') || "Nous reconstruisons l'infrastructure de la confiance. Nos protocoles sont conçus pour une efficacité maximale et une transparence absolue."}
                        </motion.p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {benefits.map((item, index) => (
                                <motion.div 
                                    key={index} 
                                    initial={{ opacity: 0, x: -10 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center gap-3 group cursor-pointer p-2 rounded-lg hover:bg-muted transition-colors"
                                >
                                    <div className="size-8 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                                        <CheckCircle2 className="size-4 text-primary group-hover:text-primary-foreground transition-colors" />
                                    </div>
                                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{item}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-12 xl:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {solutions.map((solution, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                className="group relative overflow-hidden rounded-2xl bg-card border border-border transition-all duration-300 hover:border-primary/40 hover:-translate-y-1 shadow-sm h-auto flex flex-col"
                            >
                                <div className="h-48 relative overflow-hidden shrink-0">
                                    <img 
                                        src={solution.image} 
                                        alt={solution.title} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-80 transition-all duration-1000" />
                                    <div className="absolute top-8 right-8 size-12 rounded-full bg-background/40 backdrop-blur-xl border border-foreground/10 flex items-center justify-center">
                                         <Activity className="size-5 text-primary animate-pulse" />
                                    </div>
                                </div>
                                
                                <div className="relative z-10 p-5 flex flex-col gap-3">
                                    <div className="size-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
                                        <solution.icon className="size-5" />
                                    </div>
                                    <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">{solution.title}</h3>
                                    <p className="text-sm text-muted-foreground">{solution.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                </div>
            </div>
            
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,95,0,0.03)_0%,transparent_50%)] pointer-events-none" />
        </section>
    );
}
