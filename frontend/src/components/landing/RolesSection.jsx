import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Store, ArrowRight, ShieldCheck, Zap, Star, LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { cn } from "../../lib/utils";

export function RolesSection() {
    const { t, lang } = useLanguage();

    const roles = [
        {
            title: t('roleBuyerTitle') || "Acheteur Certifié",
            description: t('roleBuyerDesc') || "Accédez au marché en toute sécurité avec notre protection des achats et paiements garantis.",
            icon: ShoppingBag,
            to: "/register?role=client",
            color: "text-blue-500",
            bg: "bg-blue-500/10",
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
            color: "text-primary",
            bg: "bg-primary/10",
            features: [
                "Boutique personnalisée",
                "Tableau de bord et statistiques",
                "Règlements unifiés et rapides"
            ]
        }
    ];

    return (
        <section className="relative py-24 bg-background border-t border-foreground/[0.03]">
            <div className="container mx-auto px-6 md:px-12">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight mb-4">
                        Rejoignez l'écosystème BCA
                    </h2>
                    <p className="text-sm md:text-base text-muted-foreground">
                        {t('aboutDescHero') || "Choisissez votre statut et commencez à bénéficier de tous les avantages de notre plateforme e-commerce sécurisée."}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                    {roles.map((role, index) => (
                        <Link 
                            key={index}
                            to={role.to}
                            className="group flex flex-col p-6 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-md transition-all duration-300 relative overflow-hidden"
                        >
                            <div className="relative z-10 flex flex-col h-full">
                                <div className={cn("size-12 rounded-xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-105", role.bg)}>
                                    <role.icon className={cn("size-6", role.color)} />
                                </div>
                                
                                <h3 className="text-[18px] font-semibold text-foreground mb-3">{role.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed mb-8 flex-1">
                                    {role.description}
                                </p>

                                <div className="space-y-3 mb-8">
                                    {role.features.map((feat, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="size-1.5 rounded-full bg-foreground/30 group-hover:bg-primary transition-colors" />
                                            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{feat}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Corrected Button for Light/Dark Mode */}
                                <div className="h-11 w-full rounded-xl bg-foreground text-background font-semibold text-sm transition-all group-hover:bg-primary group-hover:text-primary-foreground flex items-center justify-center gap-2">
                                    {t('join') || "Créer un compte"} 
                                    <ArrowRight className="size-4" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 text-center max-w-4xl mx-auto opacity-60">
                    {[
                        { icon: ShieldCheck, label: "Sécurité" },
                        { icon: Zap, label: "Rapidité" },
                        { icon: Star, label: "Excellence" },
                        { icon: LayoutDashboard, label: "Simplicité" }
                    ].map((item, i) => (
                        <div key={i} className="flex flex-col items-center gap-3">
                            <item.icon className="size-6 text-muted-foreground" />
                            <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
