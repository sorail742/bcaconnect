import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Store, ArrowRight, ShieldCheck, Zap, Star, LayoutDashboard, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { cn } from "../../lib/utils";
import TiltWrapper from '../ui/TiltWrapper';
import GeometricBackground from '../ui/GeometricBackground';

export function RolesSection() {
    const { t, lang } = useLanguage();

    const roles = [
        {
            title: t('roleBuyerTitle') || "Acheteur Certifié",
            description: t('roleBuyerDesc') || "Accédez au marché en toute sécurité avec notre protection des achats et paiements garantis.",
            icon: ShoppingBag,
            to: "/register?role=client",
            color: "text-blue-600",
            bg: "bg-blue-50",
            hoverBorder: "hover:border-blue-500/50",
            buttonHover: "group-hover:bg-blue-600",
            shadow: "hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.15)]",
            features: [
                "Protection des paiements (Escrow)",
                "Support client prioritaire",
                "Suivi logistique en temps réel"
            ]
        },
        {
            title: t('roleVendorTitle') || "Vendeur Professionnel",
            description: t('roleVendorDesc') || "Ouvrez votre boutique numérique, touchez des milliers de clients et gérez vos ventes facilement.",
            icon: Store,
            to: "/register?role=vendeur",
            color: "text-[#FF6600]",
            bg: "bg-orange-50",
            hoverBorder: "hover:border-[#FF6600]/50",
            buttonHover: "group-hover:bg-[#FF6600]",
            shadow: "hover:shadow-[0_20px_40px_-15px_rgba(255,102,0,0.15)]",
            features: [
                "Boutique personnalisée en ligne",
                "Tableau de bord et statistiques poussées",
                "Règlements unifiés et sécurisés"
            ]
        }
    ];

    return (
        <section className="relative py-32 bg-white font-sans overflow-hidden border-t border-slate-100">
            <GeometricBackground />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 via-white to-white pointer-events-none" />
            
            <div className="container mx-auto px-6 md:px-12 relative z-10 w-full max-w-[90%] lg:max-w-[1200px]">
                
                {/* Header Title */}
                <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="inline-block px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-black text-slate-500 uppercase tracking-widest shadow-sm"
                    >
                        Création de Compte
                    </motion.div>
                    
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]"
                    >
                        Rejoignez l'écosystème <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-500">BCA</span>
                    </motion.h2>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto"
                    >
                        {t('aboutDescHero') || "Une seule plateforme unifiée pour vos achats sécurisés et l'accélération de votre croissance commerciale en Afrique."}
                    </motion.p>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                    {roles.map((role, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + (index * 0.1), duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <TiltWrapper className="h-full">
                                <Link 
                                    to={role.to}
                                    className={cn(
                                        "group flex flex-col p-10 rounded-[2.5rem] bg-white border-2 border-slate-100 transition-all duration-500 relative overflow-hidden h-full",
                                        role.hoverBorder,
                                        "hover:shadow-[0_40px_100px_-25px_rgba(0,0,0,0.1)]"
                                    )}
                                >
                                {/* Decorative Blur Background on hover */}
                                <div className={cn(
                                    "absolute -top-32 -right-32 size-64 rounded-full blur-[100px] opacity-0 group-hover:opacity-60 transition-opacity duration-700",
                                    role.bg
                                )} />

                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="flex items-center gap-6 mb-8">
                                        <div className={cn("size-16 rounded-[1.2rem] flex items-center justify-center transition-transform duration-500 group-hover:scale-110 shadow-sm border border-slate-100", role.bg)}>
                                            <role.icon className={cn("size-8", role.color)} />
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-900">{role.title}</h3>
                                    </div>
                                    
                                    <p className="text-base text-slate-600 leading-relaxed mb-10 min-h-[4rem]">
                                        {role.description}
                                    </p>

                                    <div className="space-y-4 mb-12 flex-1">
                                        {role.features.map((feat, i) => (
                                            <div key={i} className="flex items-start gap-4">
                                                <CheckCircle2 className={cn("size-5 shrink-0 mt-0.5", role.color)} />
                                                <span className="text-base font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">{feat}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Premium Button */}
                                    <div className={cn(
                                        "h-14 w-full rounded-2xl bg-slate-900 text-white font-bold text-base transition-all duration-500 overflow-hidden relative"
                                    )}>
                                        <div className={cn(
                                            "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                                            role.buttonHover
                                        )} />
                                        <div className="absolute inset-0 flex items-center justify-center gap-3 relative z-10">
                                            {t('join') || "Créer un compte"} 
                                            <ArrowRight className="size-5 transform group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </div>
                                </Link>
                            </TiltWrapper>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom Stats / Badges */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 text-center max-w-4xl mx-auto border-t border-slate-100 pt-16"
                >
                    {[
                        { icon: ShieldCheck, label: "Sécurité Infaillible" },
                        { icon: Zap, label: "Expérience Fluide" },
                        { icon: Star, label: "Qualité Premium" },
                        { icon: LayoutDashboard, label: "Interface Intuitive" }
                    ].map((item, i) => (
                        <div key={i} className="flex flex-col items-center gap-4 group">
                            <div className="size-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 transition-transform group-hover:-translate-y-1">
                                <item.icon className="size-5 text-slate-400 group-hover:text-slate-900 transition-colors" />
                            </div>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{item.label}</p>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
