import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowUpRight, Activity, RefreshCcw, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import aiService from '../../services/aiService';
import statService from '../../services/statService';

export const MarketTrendsSection = () => {
    const { lang, t } = useLanguage();
    const navigate = useNavigate();

    const getFallbackTrends = () => [
        { label: t('trendAgriSolar'), growth: "+45%", volume: `1.2B ${t('gnf')}`, tag: t('tagTrend') },
        { label: t('trendTextileLuxe'), growth: "+22%", volume: `850M ${t('gnf')}`, tag: t('tagPopular') },
        { label: t('trendConstruction'), growth: "+38%", volume: `3.4B ${t('gnf')}`, tag: t('tagHighDemand') },
        { label: t('trendElectronics'), growth: "+12%", volume: `2.1B ${t('gnf')}`, tag: t('tagLowPrice') },
        { label: t('trendFood'), growth: "+28%", volume: `4.0B ${t('gnf')}`, tag: t('tagEssential') },
        { label: t('trendLogistics'), growth: "+18%", volume: `980M ${t('gnf')}`, tag: t('tagGrowing') },
    ];

    const [trends, setTrends] = useState(getFallbackTrends());
    const [stats, setStats] = useState({
        volume: `2.4B ${t('gnf')}`,
        growth: '+12%',
        active: '24'
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchTrends = async (showRefreshing = false) => {
        if (showRefreshing) setIsRefreshing(true);
        try {
            // Fetch trends
            const trendResponse = await aiService.getMarketTrends();
            const raw = trendResponse?.trends || trendResponse?.data?.trends || [];
            const mapped = raw.slice(0, 6).map(tr => ({
                label: tr.category || tr.label,
                growth: tr.demand_score ? `+${tr.demand_score}%` : '+0%',
                volume: tr.periode || 'Live',
                tag: t('tagTrend'),
                categoryId: tr.category_id || null
            }));
            setTrends(mapped.length > 0 ? mapped : getFallbackTrends());

            // Fetch public stats for summary
            const statsData = await statService.getAdminStats();
            if (statsData) {
                setStats({
                    volume: statsData.totalVolume 
                        ? `${(statsData.totalVolume / 1000000000).toFixed(1)}B ${t('gnf')}` 
                        : `2.4B ${t('gnf')}`,
                    growth: statsData.growthRate ? `+${statsData.growthRate}%` : '+12%',
                    active: statsData.totalProducts?.toString() || '24'
                });
            }

            setLastUpdated(new Date());
        } catch (error) { 
            console.error("Trends fetch error:", error);
            setTrends(getFallbackTrends()); 
        }
        finally { setIsLoading(false); setIsRefreshing(false); }
    };

    useEffect(() => {
        fetchTrends();
        const interval = setInterval(() => fetchTrends(), 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [lang]); // Re-fetch or re-map on language change

    const handleClick = (item) => {
        navigate(item.categoryId
            ? `/marketplace?category=${item.categoryId}`
            : `/marketplace?q=${encodeURIComponent(item.label)}`
        );
    };

    return (
        <section className="bg-slate-50 border-t border-slate-100 py-8 sm:py-12">
            <div className="container px-3 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-8 bg-[#FF6600] rounded-full" />
                        <div>
                            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                {t('marketTrends')}
                            </h2>
                            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                                {t('aiAnalysis')}
                                {lastUpdated && <span className="text-slate-300">• {lastUpdated.toLocaleTimeString(lang === 'FR' ? 'fr-FR' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</span>}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 self-end sm:self-auto">
                        <button
                            onClick={() => fetchTrends(true)}
                            disabled={isRefreshing}
                            className="flex items-center gap-2 h-9 px-4 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:border-[#FF6600] hover:text-[#FF6600] transition-all"
                        >
                            <RefreshCcw className={`size-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                            {t('refresh')}
                        </button>
                        <button
                            onClick={() => navigate('/marketplace')}
                            className="flex items-center gap-1.5 text-[#FF6600] font-bold text-sm hover:underline"
                        >
                            {t('catViewAll')} <ArrowRight className="size-4" />
                        </button>
                    </div>
                </div>

                {/* Summary stats */}
                <div className="flex flex-wrap gap-3 mb-6">
                    {[
                        { label: t('globalFlow'), val: stats.volume, color: 'text-emerald-600 bg-emerald-50' },
                        { label: t('growthIndex'), val: stats.growth, color: 'text-blue-600 bg-blue-50' },
                        { label: t('refProducts'), val: stats.active, color: 'text-violet-600 bg-violet-50' },
                    ].map((s, i) => (
                        <div key={i} className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold ${s.color}`}>
                            <Activity className="size-3.5" />
                            <span className="whitespace-nowrap">{s.label}:</span>
                            <span className="font-black tabular-nums auto-scale-text leading-none">{s.val}</span>
                        </div>
                    ))}
                </div>

                {/* Trend cards — 2 cols mobile, 3 tablet, 6 desktop */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                    {(isLoading ? getFallbackTrends() : trends).map((item, idx) => (
                        <motion.button
                            key={idx}
                            onClick={() => handleClick(item)}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.05, duration: 0.4 }}
                            className="group text-left bg-white rounded-xl border border-slate-100 p-4 hover:shadow-md hover:border-[#FF6600]/30 transition-all duration-300 relative overflow-hidden"
                        >
                            {/* Top */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="size-9 rounded-xl bg-orange-50 flex items-center justify-center group-hover:bg-[#FF6600] transition-colors">
                                    <TrendingUp className="size-4 text-[#FF6600] group-hover:text-white transition-colors" />
                                </div>
                                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                    {item.growth}
                                </span>
                            </div>

                            <h3 className="text-xs sm:text-sm font-bold text-slate-800 leading-snug mb-2 line-clamp-2 group-hover:text-[#FF6600] transition-colors">
                                {item.label}
                            </h3>

                            <div className="flex items-center justify-between">
                                <span className="text-[10px] text-slate-400 font-medium">{item.volume}</span>
                                <ArrowUpRight className="size-3.5 text-slate-300 group-hover:text-[#FF6600] group-hover:rotate-45 transition-all" />
                            </div>

                            {/* Tag */}
                            <span className="absolute top-2 right-2 text-[9px] font-black text-[#FF6600] bg-orange-50 px-1.5 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                {item.tag}
                            </span>

                            {/* Bottom border animation */}
                            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-[#FF6600] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                        </motion.button>
                    ))}
                </div>
            </div>
        </section>
    );
};
