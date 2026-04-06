import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, PackageSearch, CreditCard, Truck, ArrowRight, Zap, CheckCircle2, Activity, Shield, Cpu, Globe } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { cn } from "../../lib/utils";

export function HowItWorks() {
    const { t } = useLanguage();

    const steps = [
        {
            icon: UserPlus,
            title: t('howStep1Title') || "INIT_IDENTITY",
            description: t('howStep1Desc') || "REGISTER YOUR NODE WITHIN OUR NEURAL COMMERCE ARCHITECTURE.",
            color: "text-blue-500",
            bg: "bg-blue-500/10"
        },
        {
            icon: PackageSearch,
            title: t('howStep2Title') || "GLOBAL_DISCOVERY",
            description: t('howStep2Desc') || "EXPLORE CERTIFIED MERC_NODES AND OPTIMIZED PRODUCT LISTS.",
            color: "text-primary",
            bg: "bg-primary/10"
        },
        {
            icon: CreditCard,
            title: t('howStep3Title') || "SECURE_FLOW",
            description: t('howStep3Desc') || "EXECUTE TRANSACTIONS WITH SECURE ESCROW PROTOCOL SYNC.",
            color: "text-emerald-500",
            bg: "bg-emerald-500/10"
        },
        {
            icon: Truck,
            title: t('howStep4Title') || "VELOCITY_DEPLOY",
            description: t('howStep4Desc') || "TRACK HIGH-VELOCITY LOGISTICS TO FINAL GEOGRAPHICAL NODES.",
            color: "text-amber-500",
            bg: "bg-amber-500/10"
        }
    ];

    return (
        <section className="relative py-16 bg-background overflow-hidden font-jakarta border-y border-border">
            <div className="absolute top-0 right-0 size-[50rem] bg-primary/[0.03] rounded-full blur-[150px] -mr-48 -mt-24 pointer-events-none" />
            
            <div className="container mx-auto px-8 md:px-12 relative z-10">
                <div className="max-w-5xl mx-auto text-center space-y-5">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-foreground text-background text-xs font-semibold uppercase tracking-wide shadow-sm"
                    >
                        <CheckCircle2 className="size-4 text-primary" /> {t('howBadge') || "Comment ça marche"}
                    </motion.div>
                    
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-2xl md:text-4xl font-bold tracking-tight text-foreground leading-tight"
                    >
                        {t('howTitle')?.split(' ').slice(0, -1).join(' ') || "Processus"}{' '}
                        <span className="text-primary">{t('howTitle')?.split(' ').slice(-1) || "simplifié."}</span>
                    </motion.h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 relative">
                        <div className="absolute top-8 left-0 right-0 h-px bg-border hidden md:block" />

                        {steps.map((step, index) => (
                            <motion.div 
                                key={index} 
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1, duration: 1, ease: "circOut" }}
                                className="group relative space-y-6 flex flex-col items-center"
                            >
                                <div className="size-14 rounded-xl bg-card border border-border flex items-center justify-center relative z-10 shadow-sm group-hover:scale-105 group-hover:border-primary/40 transition-all duration-300">
                                    <div className={cn("size-10 rounded-lg flex items-center justify-center", step.bg)}>
                                        <step.icon className={cn("size-5", step.color)} />
                                    </div>
                                    <div className="absolute -top-2.5 -right-2.5 size-6 rounded-lg bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center shadow-sm">
                                        {index + 1}
                                    </div>
                                </div>
                                <div className="space-y-2 text-center max-w-[200px]">
                                    <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{step.title}</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
                                </div>
                                {index < steps.length - 1 && (
                                    <ArrowRight className="absolute top-7 -right-4 size-4 text-border hidden md:block" />
                                )}
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="mt-8 p-5 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 shadow-sm"
                    >
                        <div className="flex flex-col md:flex-row items-center gap-5 text-left">
                            <div className="size-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-sm shrink-0">
                                <Zap className="size-6 fill-current" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-base font-bold text-foreground">Prêt à rejoindre l'écosystème ?</h4>
                                <p className="text-sm text-muted-foreground mt-1">Onboarding simplifié • Validation instantanée</p>
                            </div>
                            <div className="h-10 px-6 rounded-xl bg-foreground text-background font-semibold text-sm flex items-center gap-2 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all">
                                {t('ctaStart') || "Démarrer"} <ArrowRight className="size-4" />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
            
            <div className="absolute bottom-1/2 left-0 w-full h-px bg-white/[0.02]" />
        </section>
    );
}
