import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowUpRight, Globe, Zap, Activity, Users } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import aiService from '../../services/aiService';

const FALLBACK_TRENDS = [
    { label: "Agriculture Solaire", growth: "+45%", trend: "up", volume: "1.2B GNF" },
    { label: "Textile Bazin Luxe", growth: "+22%", trend: "up", volume: "850M GNF" },
    { label: "Matériaux de Construction", growth: "+38%", trend: "up", volume: "3.4B GNF" },
    { label: "Electronique Import", growth: "+12%", trend: "up", volume: "2.1B GNF" }
];

export const MarketTrendsSection = () => {
    const { lang } = useLanguage();
    const [trends, setTrends] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTrends = async () => {
            try {
                const response = await aiService.getMarketTrends();
                // L'API retourne { trends: [...], confidence: ..., resume: ... }
                const raw = response?.trends || response?.data?.trends || [];
                const mapped = raw.slice(0, 4).map(t => ({
                    label: t.category || t.label,
                    growth: t.demand_score ? `+${t.demand_score}%` : '+0%',
                    volume: t.periode || 'Live',
                    trend: 'up'
                }));
                // Si l'API répond mais sans données, on garde le fallback
                setTrends(mapped.length > 0 ? mapped : FALLBACK_TRENDS);
            } catch (error) {
                console.error("Failed to fetch trends", error);
                setTrends(FALLBACK_TRENDS);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTrends();
    }, []);

    return (
        <section className="py-24 bg-background relative overflow-hidden border-t border-border">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] dark:opacity-10 pointer-events-none" />
            
            <div className="container mx-auto px-6 md:px-12 relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-12 mb-20">
                    <div className="space-y-4 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/20 border border-primary/30 text-primary">
                            <Activity className="size-4 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">IA Market Index</span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black text-foreground uppercase tracking-tighter leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Tendances <span className="text-primary">du Marché</span>
                        </h2>
                        <p className="text-muted-foreground text-lg font-medium max-w-xl">
                            Analyses prédictives en temps réel sur les flux commerciaux en Guinée, générées par notre IA.
                        </p>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="text-center">
                            <p className="text-3xl font-black text-foreground">2.4B</p>
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest">Flux Journalier</p>
                        </div>
                        <div className="w-px h-12 bg-border" />
                        <div className="text-center">
                            <p className="text-3xl font-black text-emerald-500">+12%</p>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Croissance Hebdo</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {trends.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-card backdrop-blur-3xl border border-border p-8 rounded-[2rem] hover:shadow-xl transition-all duration-500 group"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="size-12 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary transition-colors">
                                    <TrendingUp className="size-5 text-foreground group-hover:text-white" />
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-emerald-500 font-black text-xl">{item.growth || '+0%'}</span>
                                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Velocity</span>
                                </div>
                            </div>

                            <h3 className="text-lg font-black text-foreground uppercase tracking-tight mb-2 group-hover:text-primary transition-colors">
                                {item.label || item.category_name}
                            </h3>
                            
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                                <div>
                                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Volume</p>
                                    <p className="text-sm font-black text-foreground/80">{item.volume || 'En calcul...'}</p>
                                </div>
                                <ArrowUpRight className="size-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
