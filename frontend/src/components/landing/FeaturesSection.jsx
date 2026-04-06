import React from 'react';
import { motion } from 'framer-motion';
import { 
    ShoppingBag, Users, CreditCard, MapPin, 
    MessageCircle, ArrowRight, Zap, Activity,
    Shield, Cpu, Globe, ZapIcon
} from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";

export function FeaturesSection() {
    const { t, lang } = useLanguage();

    const features = [
        {
            icon: ShoppingBag,
            title: t('catalog') || "Catalogue complet",
            description: lang === 'FR' ? "Un catalogue réunissant les meilleurs articles localement et internationalement." : "A complete catalog featuring local and international goods.",
            route: "/marketplace",
            color: "text-primary",
            bg: "bg-primary/10",
            hoverBg: "hover:bg-primary/5",
        },
        {
            icon: Users,
            title: t('vendors') || "Réseau de vendeurs",
            description: lang === 'FR' ? "Accédez à une liste de vendeurs certifiés, vérifiés et fiables." : "Access a list of certified and reliable vendor nodes.",
            route: "/vendors",
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            hoverBg: "hover:bg-blue-500/5",
        },
        {
            icon: MapPin,
            title: t('tracking') || "Suivi en temps réel",
            description: lang === 'FR' ? "Suivez vos colis en temps réel depuis l'expédition jusqu'à votre porte." : "Track your packages in real-time through global geo-sync.",
            route: "/tracking",
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            hoverBg: "hover:bg-emerald-500/5",
        },
        {
            icon: CreditCard,
            title: t('feat3Title') || "Paiements sécurisés",
            description: t('feat3Desc') || "Transactions chiffrées avec système d'entiercement sécurisé.",
            route: "/help",
            color: "text-purple-500",
            bg: "bg-purple-500/10",
            hoverBg: "hover:bg-purple-500/5",
        },
        {
            icon: ZapIcon,
            title: t('feat2Title') || "Transactions rapides",
            description: t('feat2Desc') || "Vos règlements et transactions sont exécutés instantanément.",
            route: "/help",
            color: "text-primary",
            bg: "bg-primary/10",
            hoverBg: "hover:bg-primary/5",
        },
        {
            icon: MessageCircle,
            title: t('contact') || "Support direct",
            description: lang === 'FR' ? "Une assistance dédiée disponible 24h/24 par système de messagerie sécurisé." : "Dedicated 24/7 support nodes via secure chat.",
            route: "/contact",
            color: "text-pink-500",
            bg: "bg-pink-500/10",
            hoverBg: "hover:bg-pink-500/5",
        }
    ];

    return (
        <section id="features" className="relative py-24 bg-background border-t border-foreground/[0.03]">
            <div className="container mx-auto px-6 md:px-12">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight mb-4">
                        Des outils conçus pour simplifier votre commerce
                    </h2>
                    <p className="text-sm md:text-base text-muted-foreground">
                        {lang === 'FR' ? "Découvrez des fonctionnalités modernes et rapides pensées pour connecter vendeurs, acheteurs et livreurs dans un seul même écosystème." : "Modern tools engineered to simplify commerce and tracking across the continent."}
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {features.map((feature, index) => (
                        <Link
                            key={index}
                            to={feature.route}
                            className={`group p-6 rounded-2xl bg-card border border-foreground/[0.05] hover:border-foreground/[0.15] hover:shadow-lg transition-all duration-300 block ${feature.hoverBg}`}
                        >
                            <div className={`size-12 rounded-xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-105 ${feature.bg}`}>
                                <feature.icon className={`size-6 ${feature.color}`} />
                            </div>

                            <h3 className="text-[17px] font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                                {feature.title}
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {feature.description}
                            </p>

                            <div className="mt-8 flex items-center gap-2 text-sm font-medium text-primary opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                                {lang === 'FR' ? "En savoir plus" : "Learn more"}
                                <ArrowRight className="size-4" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
