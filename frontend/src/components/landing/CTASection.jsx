import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Store, Zap, ShieldCheck, Globe, LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from '../../context/useLanguage';
import { useAuth } from "../../hooks/useAuth";
import { ROLES } from "../../constants/roles";

import { formatCompact } from '../../lib/landingStats';

export function CTASection({ stats }) {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const getDashboardLink = () => {
        if (!user) return '/register';
        if (user.role === ROLES.ADMIN) return '/admin/dashboard';
        if (user.role === ROLES.FOURNISSEUR) return '/vendor/dashboard';
        if (user.role === ROLES.TRANSPORTEUR) return '/carrier/dashboard';
        if (user.role === ROLES.BANQUE) return '/bank/dashboard';
        return '/dashboard';
    };

    const features = [
        { icon: ShieldCheck, label: 'Paiements Sécurisés', desc: 'Protection Escrow' },
        { icon: Globe, label: 'Couverture Nationale', desc: 'Toute la Guinée' },
        { icon: Store, label: 'Plateforme Unifiée', desc: 'Tout en un' },
        { icon: Zap, label: 'Synchronisation Live', desc: 'Données temps réel' },
    ];

    return (
        <section className="bg-slate-900 py-12 sm:py-16 lg:py-20">
            <div className="container px-3 sm:px-6 lg:px-8">

                {/* Main content */}
                <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">

                    {/* Left — text + CTA */}
                    <div className="flex-1 text-center lg:text-left space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-[#FF6600] text-[11px] font-black uppercase tracking-widest">
                            <span className="size-2 rounded-full bg-[#FF6600] animate-pulse" />
                            {isAuthenticated
                                ? `${t('memberSpace') || "Espace de"} ${user?.nom_complet?.split(' ')[0] || 'Membre'}`
                                : t('joinBCA') || 'Rejoignez BCA Connect'}
                        </div>
 
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            {isAuthenticated
                                ? <>{t('welcome') || "Bienvenue sur"} <span className="text-[#FF6600]">BCA Connect</span></>
                                : t('ctaMostAdvanced') || <>La plateforme de commerce <span className="text-[#FF6600]">la plus avancée</span> d'Afrique de l'Ouest</>
                            }
                        </h2>
 
                        <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
                            {isAuthenticated
                                ? t('ctaContinueActivity') || "Continuez à gérer votre activité depuis votre espace personnel dédié."
                                : (stats?.totalUsers
                                    ? `${formatCompact(stats.totalUsers)} ${t('ctaConnectedActorsDynamic') || 'membres actifs — acheteurs, fournisseurs, livreurs et techniciens sur une plateforme unique.'}`
                                    : t('ctaConnectedActors') || "Acheteurs, fournisseurs, transporteurs — une plateforme unique pour connecter tous les acteurs du commerce guinéen.")}
                        </p>
 
                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                            {isAuthenticated ? (
                                <>
                                    <button
                                        onClick={() => navigate(getDashboardLink())}
                                        className="flex items-center gap-3 h-14 px-8 bg-[#FF6600] text-white font-black text-sm rounded-2xl shadow-lg hover:shadow-orange-500/25 hover:-translate-y-0.5 transition-all group"
                                    >
                                        <LayoutDashboard className="size-5" />
                                        {t('myDashboard') || "Mon Espace"}
                                        <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                    <button
                                        onClick={() => navigate('/marketplace')}
                                        className="flex items-center gap-3 h-14 px-8 bg-white/10 border border-white/20 text-white font-bold text-sm rounded-2xl hover:bg-white/20 transition-all"
                                    >
                                        {t('explore') || "Explorer le marché"}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => navigate('/register')}
                                        className="flex items-center gap-3 h-14 px-8 bg-[#FF6600] text-white font-black text-sm rounded-2xl shadow-lg hover:shadow-orange-500/25 hover:-translate-y-0.5 transition-all group"
                                    >
                                        {t('register') || "Créer un compte gratuit"}
                                        <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                    <button
                                        onClick={() => navigate('/marketplace')}
                                        className="flex items-center gap-3 h-14 px-8 bg-white/10 border border-white/20 text-white font-bold text-sm rounded-2xl hover:bg-white/20 transition-all"
                                    >
                                        {t('explore') || "Explorer le marché"}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
 
                    {/* Right — feature grid */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-sm lg:max-w-xs shrink-0">
                        {[
                            { icon: ShieldCheck, label: t('footerSecureTitle') || 'Paiements Sécurisés', desc: t('footerSecureDesc') || 'Protection Escrow' },
                            { icon: Globe, label: t('footerCoverageTitle') || 'Couverture Nationale', desc: t('footerCoverageDesc') || 'Toute la Guinée' },
                            { icon: Store, label: t('ctaUnifiedPlatform') || 'Plateforme Unifiée', desc: t('ctaUnifiedDesc') || 'Tout en un' },
                            { icon: Zap, label: t('footerSyncTitle') || 'Synchronisation Live', desc: t('footerSyncDesc') || 'Données temps réel' },
                        ].map((item, i) => (
                            <motion.button
                                key={i}
                                onClick={() => navigate('/marketplace')}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08 }}
                                className="group text-left p-4 sm:p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-[#FF6600]/30 transition-all"
                            >
                                <div className="size-10 rounded-xl bg-[#FF6600]/10 flex items-center justify-center mb-3 group-hover:bg-[#FF6600]/20 transition-colors">
                                    <item.icon className="size-5 text-[#FF6600]" />
                                </div>
                                <p className="text-xs font-black text-white leading-tight mb-1">{item.label}</p>
                                <p className="text-[10px] text-slate-500">{item.desc}</p>
                            </motion.button>
                        ))}
                    </div>
                </div>
 
                {/* Bottom divider + links */}
                <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-slate-500 text-sm">© 2025 BCA Connect · {t('guinea') || "Guinée"} · {t('rightsReserved') || (t('ctaAllRightsReserved') || "Tous droits réservés")}</p>
                    <div className="flex items-center gap-6">
                        {[
                            { name: t('privacy') || 'Confidentialité', path: '/privacy' },
                            { name: t('terms') || 'Conditions', path: '/terms' },
                            { name: t('contact') || 'Contact', path: '/contact' },
                            { name: t('about') || 'À propos', path: '/about' }
                        ].map(link => (
                            <button key={link.name} onClick={() => navigate(link.path)}
                                className="text-slate-500 hover:text-white text-xs transition-colors">
                                {link.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
