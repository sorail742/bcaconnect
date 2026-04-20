import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
    Users, TrendingUp, Store, ChevronDown,
    Activity, Zap, RefreshCcw, ShoppingBag,
    ArrowUpRight, ArrowDownRight, ShieldCheck, Satellite
} from 'lucide-react';
import statService from '../../services/statService';
import socketService from '../../services/socketService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/80 border border-slate-100 rounded-2xl p-4 shadow-2xl backdrop-blur-xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
                <p className="text-xl font-black text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    {parseFloat(payload[0].value).toLocaleString('fr-GN')} <span className="text-[10px] text-primary ml-1">GNF</span>
                </p>
            </div>
        );
    }
    return null;
};

const StatCard = ({ title, value, icon: Icon, color, growth, subtitle }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group"
    >
        <div className={cn("absolute top-0 right-0 p-5 opacity-5 group-hover:scale-125 transition-transform duration-700", color)}>
            <Icon className="size-10" />
        </div>
        <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-600 transition-colors">
                    {title}
                </p>
                {growth && (
                    <div className={cn("flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full", growth > 0 ? "text-emerald-500 bg-emerald-50" : "text-rose-500 bg-rose-50")}>
                        {growth > 0 ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                        {Math.abs(growth)}%
                    </div>
                )}
            </div>
            
            <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-900 leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    {value}
                </h3>
                <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">{subtitle}</p>
            </div>
        </div>
    </motion.div>
);

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);

    const fetchGlobalStats = useCallback(async () => {
        try {
            const data = await statService.getAdminStats();
            setDashboardData(data);
        } catch (err) {
            toast.error("Erreur de synchronisation Satellite.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGlobalStats();
        socketService.connect();
        const handleUpdate = () => {
            fetchGlobalStats();
            toast.info("Données synchronisées en temps réel.");
        };

        socketService.on('order_placed', handleUpdate);
        socketService.on('transaction_updated', handleUpdate);

        return () => {
            socketService.off('order_placed', handleUpdate);
            socketService.off('transaction_updated', handleUpdate);
        };
    }, [fetchGlobalStats]);

    const apiStats = dashboardData?.stats || [];
    const overview = dashboardData?.overview || {};
    
    const formatValue = (val, title) => {
        if (typeof val === 'string' && isNaN(parseFloat(val))) return val;
        const num = parseFloat(val || 0);
        const formatted = num.toLocaleString('fr-GN');
        return title.toLowerCase().includes('volume') || title.toLowerCase().includes('gmv') || title.toLowerCase().includes('volume')
            ? `${formatted}` 
            : formatted;
    };

    const displayStats = [
        { 
            title: "Réseau Utilisateurs", 
            value: formatValue(apiStats.find(s => s.title.includes('Utilisateurs'))?.value || 0, "Membres"), 
            icon: Users, 
            color: "text-primary",
            growth: 12.5,
            subtitle: "Global Active Nodes"
        },
        { 
            title: "Volume d'Affaires", 
            value: formatValue(apiStats.find(s => s.title.includes('Transactions'))?.value || 0, "Volume"), 
            icon: TrendingUp, 
            color: "text-blue-500",
            growth: 8.2,
            subtitle: "System GMV (GNF)"
        },
        { 
            title: "Partenaires Boutiques", 
            value: formatValue(overview.storesCount || 0, "Boutiques"), 
            icon: Store, 
            color: "text-emerald-500",
            growth: 5.4,
            subtitle: "Verified Entities"
        },
        { 
            title: "Index Intégrité", 
            value: "99.8%", 
            icon: ShieldCheck, 
            color: "text-amber-500",
            subtitle: "Operational Pulse"
        }
    ];

    const transactions = dashboardData?.recentTransactions || [];

    return (
        <DashboardLayout title="ADMIN COMMAND CENTER" noPadding>
            <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-8 space-y-8 custom-scrollbar">
                
                {/* HUD Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <div className="size-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-lg shadow-primary/5">
                            <Zap className="size-7 text-primary shadow-glow fill-current" />
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                Command <span className="text-primary">Center</span>
                            </h1>
                            <div className="flex items-center gap-2">
                                <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                                    Flux temps réel • Sync Satellite Active
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/admin/trends')}
                            className="h-12 px-6 bg-white border border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-slate-50 transition-all shadow-sm"
                        >
                            <Satellite className="size-4 text-primary" />
                            IA Predictive
                        </button>
                        <button 
                            onClick={fetchGlobalStats}
                            className="size-12 rounded-2xl bg-primary text-foreground flex items-center justify-center shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                        >
                            <RefreshCcw className={cn("size-5", isLoading && "animate-spin")} />
                        </button>
                    </div>
                </div>

                {/* Navigation Pill Deck */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
                    {[
                        { label: 'Synthèse', path: '/admin/dashboard', active: true },
                        { label: 'Flux Finance', path: '/admin/transactions' },
                        { label: 'Litiges Hub', path: '/admin/disputes' },
                        { label: 'Taxonomie', path: '/admin/categories' },
                        { label: 'Catalogue', path: '/admin/products' },
                        { label: 'Gouvernance', path: '/admin/users' }
                    ].map((nav, i) => (
                        <button
                            key={i}
                            onClick={() => navigate(nav.path)}
                            className={cn(
                                "px-6 h-10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border shrink-0",
                                nav.active 
                                    ? "bg-slate-900 text-white border-slate-900 shadow-lg" 
                                    : "bg-white border-slate-100 text-slate-400 hover:border-primary/50"
                            )}
                        >
                            {nav.label}
                        </button>
                    ))}
                </div>

                {/* Core Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {displayStats.map((s, i) => <StatCard key={i} {...s} />)}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Market Trend Area */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        <div className="flex items-center justify-between px-2">
                            <div className="space-y-1">
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>Performance Marché</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Analyse des flux sur les 7 derniers cycles</p>
                            </div>
                            <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl border border-slate-100">
                                <div className="flex items-center gap-2">
                                    <div className="size-2 rounded-full bg-primary" />
                                    <span className="text-[9px] font-black text-slate-600 uppercase">Volume GNF</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 h-[380px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={dashboardData?.weeklyChart?.timeseries || []} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis 
                                        dataKey="day" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 800 }} 
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 800 }}
                                        tickFormatter={(val) => `${val >= 1000 ? (val/1000)+'K' : val}`}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area 
                                        type="monotone" 
                                        dataKey="val" 
                                        stroke="#f97316" 
                                        strokeWidth={4} 
                                        fillOpacity={1} 
                                        fill="url(#colorValue)"
                                        animationDuration={1500}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Activity Feed */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>Derniers Flux</h3>
                            <button onClick={() => navigate('/admin/transactions')} className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline px-3 py-1 bg-primary/5 rounded-lg">Historique</button>
                        </div>

                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 overflow-hidden">
                            <div className="space-y-4">
                                {transactions.slice(0, 6).map((tx, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-transparent hover:border-slate-100 hover:bg-white hover:shadow-sm transition-all group">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                                                <img src={`https://api.dicebear.com/7.x/shapes/svg?seed=${tx.id}`} alt="" className="w-full h-full object-cover p-1 opacity-80" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[11px] font-black text-slate-800 uppercase truncate tracking-tight">{tx.name || tx.userName || "System Node"}</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">{tx.statut || tx.status || 'INDEXED'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[12px] font-black text-slate-900 tabular-nums">{(tx.amount || tx.total_prix || 0).toLocaleString()}</p>
                                            <div className={cn(
                                                "text-[8px] font-black uppercase tracking-tighter",
                                                (tx.status === 'SUCCESS' || tx.statut === 'payé') ? "text-emerald-500" : "text-amber-500"
                                            )}>
                                                GNF • {(tx.status === 'SUCCESS' || tx.statut === 'payé') ? 'VALIDE' : 'PENDING'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {transactions.length === 0 && (
                                    <div className="py-24 text-center opacity-40 flex flex-col items-center gap-4 text-slate-300">
                                        <Activity className="size-14" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">Aucun flux détecté</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminDashboard;
