import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, TrendingUp, Users, Package, ShoppingCart, ArrowRight, Zap, MoreHorizontal, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../context/LanguageContext';
import statService from '../../services/statService';
import { ROLES } from '../../constants/roles';

export const DashboardPreview = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [stats, setStats] = useState({
        revenue: '124.5M',
        orders: '1,240',
        activeUsers: '8,420',
        listings: '342'
    });

    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await statService.getAdminStats();
                if (data) {
                    setStats({
                        revenue: `${(data.totalVolume / 1000000).toFixed(1)}M`,
                        orders: data.totalOrders?.toLocaleString() || '1,240',
                        activeUsers: data.totalUsers?.toLocaleString() || '8,420',
                        listings: data.totalProducts?.toLocaleString() || '342'
                    });
                }
            } catch (error) { console.error(error); }
        };
        fetch();
    }, []);

    const getDashboardLink = () => {
        if (!isAuthenticated) return '/register';
        const rolePaths = {
            [ROLES.ADMIN]: '/admin/dashboard',
            [ROLES.FOURNISSEUR]: '/vendor/dashboard',
            [ROLES.TRANSPORTEUR]: '/carrier/dashboard',
            [ROLES.BANQUE]: '/bank/dashboard',
            [ROLES.CLIENT]: '/dashboard'
        };
        return rolePaths[user.role] || '/dashboard';
    };

    return (
        <section className="bg-slate-50 py-12 sm:py-16 border-t border-slate-100 mb-[-1px]">
            <div className="container px-3 sm:px-6 lg:px-8">
                
                {/* Layout Container */}
                <div className="bg-slate-900 rounded-[2.5rem] sm:rounded-[3.5rem] overflow-hidden border border-white/5 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)]">
                    <div className="flex flex-col lg:flex-row min-h-[500px]">
                        
                        {/* Left: Interactive Preview */}
                        <div className="flex-1 p-6 sm:p-10 lg:p-12 space-y-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-white text-[10px] font-black uppercase tracking-widest">
                                <LayoutDashboard className="size-3.5" /> {t('predictiveSystem') || "Système de gestion prédictive"}
                            </div>
                            
                            <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                {t('controlBusiness') || "Contrôlez chaque aspect de votre business live."}
                            </h2>
                            
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { label: t('revenue') || 'Volume (GNF)', val: `${stats.revenue}`, icon: TrendingUp, color: 'text-emerald-400' },
                                    { label: t('orders') || 'Commandes', val: stats.orders, icon: ShoppingCart, color: 'text-blue-400' },
                                    { label: t('buyers') || 'Acheteurs', val: stats.activeUsers, icon: Users, color: 'text-orange-400' },
                                    { label: t('referenced') || 'Référencés', val: stats.listings, icon: Package, color: 'text-violet-400' },
                                ].map((s, i) => (
                                    <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                                        <div className="flex items-center justify-between mb-2">
                                            <s.icon className={`size-4 ${s.color}`} />
                                            <span className="text-[10px] font-black text-white/40 uppercase">Live</span>
                                        </div>
                                        <p className="text-xl font-black text-white tabular-nums leading-none">{s.val}</p>
                                        <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase">{s.label}</p>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => navigate(getDashboardLink())}
                                className="flex items-center gap-3 h-14 px-8 bg-white text-slate-900 font-black text-sm rounded-2xl hover:scale-105 transition-all group shadow-xl"
                            >
                                {t('accessSpace') || "Accéder à mon espace"}
                                <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        {/* Right: Glassmorphism Card Stack */}
                        <div className="lg:w-[45%] bg-white/5 border-l border-white/5 p-6 sm:p-10 flex items-center justify-center relative overflow-hidden">
                            {/* Decorative Blur */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-64 bg-[#FF6600]/20 blur-[100px] pointer-events-none" />

                            <div className="w-full max-w-sm space-y-4 relative z-10">
                                {/* Wallet Card */}
                                <motion.div 
                                    initial={{ x: 20, opacity: 0 }}
                                    whileInView={{ x: 0, opacity: 1 }}
                                    className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 p-5 rounded-3xl shadow-2xl"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="size-10 bg-white/10 border border-white/10 rounded-xl flex items-center justify-center">
                                            <Wallet className="size-5 text-white" />
                                        </div>
                                        <MoreHorizontal className="size-5 text-slate-500" />
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">{t('accountBalance') || "Solde de Compte"}</p>
                                    <p className="text-2xl font-black text-white mb-2">42.580.000 GNF</p>
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 flex-1 bg-white/10 rounded-full overflow-hidden">
                                            <div className="w-[70%] h-full bg-[#FF6600]" />
                                        </div>
                                        <span className="text-[10px] font-black text-[#FF6600]">+12.4%</span>
                                    </div>
                                </motion.div>

                                {/* Mini Chart Card */}
                                <motion.div 
                                    initial={{ x: -20, opacity: 0 }}
                                    whileInView={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="bg-white/10 backdrop-blur-xl border border-white/10 p-5 rounded-3xl shadow-xl ml-8"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                                            <Zap className="size-4 text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-white">Conversion Boost</p>
                                            <p className="text-[10px] text-slate-400">Analysé par BCA-AI</p>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
