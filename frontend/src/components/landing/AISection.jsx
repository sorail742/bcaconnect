import React from 'react';
import { motion } from 'framer-motion';
import { Search, BrainCircuit, Sparkles, MessageSquare, Activity, Cpu as CpuIcon } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export function AISection() {
    const { t, lang } = useLanguage();

    const aiFeatures = [
        {
            icon: Search,
            title: "Reconnaissance visuelle",
            desc: lang === 'FR' ? "Identifiez les produits à partir d'une simple image grâce au deep learning." : "Identify products from a single image using neural deep learning.",
            color: "text-primary",
            bg: "bg-primary/10"
        },
        {
            icon: BrainCircuit,
            title: "Prédiction marché",
            desc: lang === 'FR' ? "Anticipez les ruptures de stock et les tendances grâce à l'analyse prédictive." : "Anticipate stockouts and trends via predictive analytics.",
            color: "text-blue-500",
            bg: "bg-blue-500/10"
        },
        {
            icon: MessageSquare,
            title: "Assistance intelligente",
            desc: lang === 'FR' ? "Support automatisé disponible 24/7 pour vos besoins de gestion." : "Automated support available 24/7 for your management needs.",
            color: "text-emerald-500",
            bg: "bg-emerald-500/10"
        }
    ];

    return (
        <section className="relative py-16 bg-background overflow-hidden font-jakarta border-y border-border">
            <div className="container mx-auto px-6 md:px-12 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-foreground text-background text-xs font-semibold uppercase tracking-wide shadow-sm">
                            <CpuIcon className="size-4 text-primary" /> {t('aiBadge') || "Intelligence Artificielle"}
                        </div>

                        <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-foreground leading-tight">
                            {t('aiTitle')?.split(' ').slice(0, -1).join(' ') || "Intelligence"}{' '}
                            <span className="text-primary">{t('aiTitle')?.split(' ').slice(-1) || "Artificielle"}</span>
                        </h2>

                        <p className="text-base text-muted-foreground leading-relaxed border-l-4 border-primary/30 pl-4">
                            {t('aiDesc') || "Notre IA optimise vos transactions, prédit les tendances et sécurise vos échanges en temps réel."}
                        </p>

                        <div className="space-y-4">
                            {aiFeatures.map((feat, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex items-center gap-4 group cursor-pointer p-3 rounded-xl hover:bg-muted transition-colors"
                                >
                                    <div className={`size-10 rounded-xl ${feat.bg} flex items-center justify-center shrink-0 border border-border group-hover:scale-105 transition-transform`}>
                                        <feat.icon className={`size-5 ${feat.color}`} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{feat.title}</h4>
                                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{feat.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                        className="rounded-2xl bg-card border border-border p-6 shadow-sm hover:border-primary/40 transition-all duration-300"
                    >
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-border pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
                                        <Sparkles className="size-5" />
                                    </div>
                                    <div>
                                        <span className="text-sm font-semibold text-foreground">Processeur BCA Vision</span>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <Activity className="size-3 text-primary animate-pulse" />
                                            <span className="text-xs text-muted-foreground">Calculs en temps réel</span>
                                        </div>
                                    </div>
                                </div>
                                <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-600 dark:text-emerald-400 text-xs font-semibold">Actif</span>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                                        <span>Synchronisation base de données</span>
                                        <span className="text-foreground">85%</span>
                                    </div>
                                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: "85%" }}
                                            transition={{ duration: 1.5 }}
                                            className="h-full bg-primary rounded-full"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                                        <span>Latence réseau</span>
                                        <span className="text-foreground">0.2ms</span>
                                    </div>
                                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: "100%" }}
                                            transition={{ duration: 2 }}
                                            className="h-full bg-emerald-500 rounded-full"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-muted border border-border font-mono text-xs text-muted-foreground leading-relaxed">
                                <span className="text-primary font-bold">{">_"}</span> CORE_SYSTEM_OPTIMIZED<br />
                                <span className="text-primary font-bold">{">_"}</span> TREND_ANALYSIS: COMPLETED<br />
                                <span className="text-primary font-bold">{">_"}</span> USER_MATCHING: 99.82%<br />
                                <span className="text-primary font-bold">{">_"}</span> SYNC_PROTOCOL: ACTIVE
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
