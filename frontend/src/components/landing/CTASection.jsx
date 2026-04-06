import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShoppingBag, Store, Zap, ShieldCheck, Globe, Star, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";

export function CTASection() {
    const { t } = useLanguage();

    return (
        <section className="relative py-16 bg-background overflow-hidden font-jakarta border-t border-border">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-transparent to-transparent pointer-events-none" />

            <div className="container mx-auto px-6 md:px-12 relative z-10 space-y-10">
                <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-foreground text-background text-xs font-semibold uppercase tracking-wide shadow-sm">
                    <Sparkles className="size-4 text-primary" /> {t('ctaReady') || "Rejoignez l'écosystème"}
                </div>

                <div className="max-w-3xl space-y-4">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
                        {t('ctaTitle')?.split(' ').slice(0, -1).join(' ') || "Rejoignez la"}{' '}
                        <span className="text-primary">{t('ctaTitle')?.split(' ').slice(-1) || "révolution"}</span>
                    </h2>
                    <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl border-l-4 border-primary/30 pl-4">
                        {t('ctaDesc') || "Découvrez une plateforme complète pour gérer, développer et optimiser vos opérations commerciales."}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-start gap-4">
                    <Link to="/register">
                        <button className="h-12 px-8 bg-primary text-primary-foreground font-semibold text-sm rounded-xl shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all flex items-center gap-3 group">
                            {t('ctaStart') || "Commencer maintenant"}
                            <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </Link>
                    <div className="flex items-center gap-2 pt-3 sm:pt-0">
                        <div className="flex gap-1">
                            {[1,2,3,4,5].map(i => <Star key={i} className="size-4 text-primary fill-primary" />)}
                        </div>
                        <span className="text-sm text-muted-foreground font-medium">Noté 5/5 par nos utilisateurs</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                    {[
                        { icon: ShieldCheck, label: "Paiements sécurisés" },
                        { icon: Globe, label: "Couverture nationale" },
                        { icon: Store, label: "Plateforme unifiée" },
                        { icon: Zap, label: "Synchronisation live" }
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl shadow-sm"
                        >
                            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <item.icon className="size-4 text-primary" />
                            </div>
                            <p className="text-sm font-medium text-foreground">{item.label}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
