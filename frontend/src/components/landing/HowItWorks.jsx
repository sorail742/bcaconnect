import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, PackageSearch, CreditCard, Truck, ArrowRight, Zap, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { cn } from "../../lib/utils";
import GeometricBackground from '../ui/GeometricBackground';

export function HowItWorks() {
    const { t } = useLanguage();

    const steps = [
        {
            number: "01",
            icon: UserPlus,
            title: "Créez votre compte",
            description: "Inscription rapide en moins de 2 minutes. Choisissez votre profil — Acheteur, Vendeur ou Transporteur — et commencez immédiatement.",
            color: "text-blue-600",
            bg: "bg-blue-50",
            border: "border-blue-100",
            glow: "rgba(37,99,235,0.08)"
        },
        {
            number: "02",
            icon: PackageSearch,
            title: "Explorez le Marché",
            description: "Parcourez des milliers de produits vérifiés. Filtrez par catégorie, prix ou vendeur certifié BCA Connect.",
            color: "text-[#FF6600]",
            bg: "bg-orange-50",
            border: "border-orange-100",
            glow: "rgba(255,102,0,0.08)"
        },
        {
            number: "03",
            icon: CreditCard,
            title: "Paiement Sécurisé",
            description: "Réglez via Orange Money, Areeba, Paycard ou virement. Votre paiement est bloqué en séquestre jusqu'à la livraison.",
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            border: "border-emerald-100",
            glow: "rgba(5,150,105,0.08)"
        },
        {
            number: "04",
            icon: Truck,
            title: "Livraison & Confirmation",
            description: "Suivez votre commande en temps réel. Les fonds sont libérés au vendeur uniquement à votre confirmation de réception.",
            color: "text-amber-600",
            bg: "bg-amber-50",
            border: "border-amber-100",
            glow: "rgba(217,119,6,0.08)"
        }
    ];

    return (
        <section className="relative py-32 bg-slate-50 overflow-hidden font-sans border-y border-slate-100">
            <GeometricBackground />
            
            <div className="container mx-auto px-6 md:px-12 relative z-10 w-full max-w-[90%] lg:max-w-[1200px]">

                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto space-y-6 mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-slate-900 text-white text-xs font-black uppercase tracking-widest shadow-sm"
                    >
                        <CheckCircle2 className="size-4 text-[#FF6600]" />
                        {t('howBadge') || "Comment ça marche"}
                    </motion.div>
                    
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.1]"
                    >
                        {t('howTitle')?.split(' ').slice(0, -1).join(' ') || "Un processus"}{' '}
                        <span className="text-[#FF6600] italic">{t('howTitle')?.split(' ').slice(-1) || "simplifié."}</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg md:text-xl text-slate-500 font-medium"
                    >
                        De l'inscription à la livraison, BCA Connect garantit chaque étape de votre transaction.
                    </motion.p>
                </div>

                {/* Steps Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 relative">
                    {/* Animated Flow Connector (Desktop) */}
                    <div className="absolute top-12 left-[10%] right-[10%] h-1 z-0 hidden lg:block overflow-hidden">
                        <motion.div 
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                            className="w-full h-full bg-gradient-to-r from-blue-500 via-[#FF6600] to-amber-500 origin-left opacity-30"
                        />
                         {/* Animated particles along the line */}
                         <motion.div
                            animate={{ x: ["0%", "100%"] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent w-20 h-full opacity-50"
                        />
                    </div>

                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                            className="group relative flex flex-col"
                        >
                            <div
                                className={cn(
                                    "flex flex-col p-8 rounded-[2rem] bg-white border-2 transition-all duration-500 group-hover:-translate-y-3 h-full",
                                    step.border,
                                    `hover:shadow-[0_24px_50px_-20px_${step.glow}]`
                                )}
                                style={{ boxShadow: '0 2px 12px -4px rgba(0,0,0,0.06)' }}
                            >
                                {/* Step number badge */}
                                <div className="flex items-center justify-between mb-8">
                                    <div className={cn("size-16 rounded-[1.2rem] flex items-center justify-center transition-transform duration-500 group-hover:scale-110 shadow-sm", step.bg)}>
                                        <step.icon className={cn("size-8", step.color)} />
                                    </div>
                                    <span className="text-4xl font-black text-slate-100 tabular-nums select-none">{step.number}</span>
                                </div>

                                <h3 className="text-xl font-black text-slate-900 mb-3 group-hover:text-slate-800 transition-colors">
                                    {step.title}
                                </h3>
                                <p className="text-base text-slate-500 leading-relaxed flex-1">
                                    {step.description}
                                </p>

                                {/* Bottom arrow on last step hidden, connector arrow between others */}
                                {index < steps.length - 1 && (
                                    <div className="absolute -right-4 top-12 z-20 hidden lg:flex size-8 rounded-full bg-white border-2 border-slate-100 items-center justify-center shadow-sm">
                                        <ArrowRight className="size-4 text-slate-400" />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom CTA Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-20 p-10 rounded-[2.5rem] bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl border border-white/5 relative overflow-hidden"
                >
                    {/* Glow overlay */}
                    <div className="absolute top-0 left-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-[#FF6600]/50 to-transparent" />

                    <div className="flex items-center gap-6">
                        <div className="size-16 rounded-2xl bg-[#FF6600] flex items-center justify-center shadow-[0_8px_32px_-8px_rgba(255,102,0,0.6)] shrink-0">
                            <Zap className="size-8 fill-white text-white" />
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-2xl font-black text-white leading-tight">Prêt à rejoindre l'écosystème BCA ?</h4>
                            <p className="text-base text-slate-400 font-medium">Inscription gratuite • Paiement sécurisé • Support 24/7</p>
                        </div>
                    </div>

                    <Link 
                        to="/register"
                        className="flex items-center gap-3 h-14 px-10 rounded-2xl bg-[#FF6600] text-white font-black text-base hover:bg-orange-500 hover:-translate-y-1 hover:shadow-[0_12px_30px_-8px_rgba(255,102,0,0.5)] transition-all duration-300 shrink-0 whitespace-nowrap"
                    >
                        {t('ctaStart') || "Démarrer maintenant"} <ArrowRight className="size-5" />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
