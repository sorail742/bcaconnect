import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DashboardCard from '../../components/ui/DashboardCard';
import HeroChartCard from '../../components/ui/HeroChartCard';
import {
    Users, TrendingUp, Store, ChevronDown,
    Activity, Zap, RefreshCcw, ShoppingBag,
    ShieldCheck, Satellite
} from 'lucide-react';
import { useAdminStats } from '../hooks/useDashboardData';
import socketService from '../../services/socketService';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import { useLanguage } from '../../context/useLanguage';

const AdminDashboard = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { data: dashboardData, isLoading, error, refetch } = useAdminStats();

    useEffect(() => {
        socketService.connect();
        const handleUpdate = () => {
            refetch();
            toast.info(t('adSyncRealtime'));
        };

        socketService.on('order_placed', handleUpdate);
        socketService.on('transaction_updated', handleUpdate);

        return () => {
            socketService.off('order_placed', handleUpdate);
            socketService.off('transaction_updated', handleUpdate);
        };
    }, [refetch]);


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
            title: t('adNetworkUsers'),
            value: formatValue(apiStats.find(s => s.title.includes('Utilisateurs'))?.value || 0, "Membres"),
            icon: Users,
            iconColor: "primary",
            trend: "up",
            trendValue: "12.5%",
            description: t('adActiveNodes')
        },
        {
            title: t('adBusinessVolume'),
            value: formatValue(apiStats.find(s => s.title.includes('Transactions'))?.value || 0, "Volume"),
            icon: TrendingUp,
            iconColor: "primary",
            trend: "up",
            trendValue: "8.2%",
            description: t('adSystemGMV')
        },
        {
            title: t('adPartnerStores'),
            value: formatValue(overview.storesCount || 0, "Boutiques"),
            icon: Store,
            iconColor: "emerald",
            trend: "up",
            trendValue: "5.4%",
            description: t('adVerifiedEntities')
        },
        {
            title: t('adIntegrityIndex'),
            value: (overview.satisfaction_rate || "99.8") + "%",
            icon: ShieldCheck,
            iconColor: "amber",
            description: t('adOperationalPulse')
        }
    ];

    const transactions = dashboardData?.recentTransactions || [];

    return (
        <DashboardLayout title={t('adCommandCenter')} noPadding>
            <div className="min-h-screen bg-background p-6 lg:p-8 space-y-8 custom-scrollbar">

                {/* HUD Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <div className="size-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-lg shadow-primary/5">
                            <Zap className="size-7 text-primary shadow-glow fill-current" />
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-3xl font-black text-foreground uppercase tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                Command <span className="text-primary">Center</span>
                            </h1>
                            <div className="flex items-center gap-2">
                                <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                                    {t('adFluxRealtime')}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/admin/trends')}
                            className="h-12 px-6 bg-card border border-border rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-muted transition-all shadow-sm"
                        >
                            <Satellite className="size-4 text-primary" />
                            {t('adAiPredictive')}
                        </button>
                        <button
                            onClick={() => refetch()}
                            className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                        >
                            <RefreshCcw className={cn("size-5", isLoading && "animate-spin")} />
                        </button>
                    </div>
                </div>

                {/* Navigation Pill Deck */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
                    {[
                        { label: t('adSynthesis'), path: '/admin/dashboard', active: true },
                        { label: 'Logistique', path: '/admin/logistics' },
                        { label: t('adFinanceFlux'), path: '/admin/transactions' },
                        { label: t('adDisputeHub'), path: '/admin/disputes' },
                        { label: t('adTaxonomy'), path: '/admin/categories' },
                        { label: t('adCatalog'), path: '/admin/products' },
                        { label: t('adGovernance'), path: '/admin/users' }
                    ].map((nav, i) => (
                        <button
                            key={i}
                            onClick={() => navigate(nav.path)}
                            className={cn(
                                "px-6 h-10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border shrink-0",
                                nav.active
                                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-lg"
                                    : "bg-card border-border text-muted-foreground hover:border-primary/50"
                            )}
                        >
                            {nav.label}
                        </button>
                    ))}
                </div>

                {/* Core Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {displayStats.map((s, i) => <DashboardCard key={i} {...s} />)}
                </div>

                {/* Market Trend Area — élément visuel central, pleine largeur */}
                <HeroChartCard
                    title={t('adMarketPerf')}
                    subtitle={t('adFluxAnalysis')}
                    icon={TrendingUp}
                    data={dashboardData?.weeklyChart?.timeseries || []}
                    xKey="day"
                    yKey="val"
                    unit="GNF"
                    height={420}
                    emptyState={{ icon: TrendingUp, message: 'Aucun flux sur la période' }}
                    headerExtra={
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-foreground/5 border border-border">
                            <div className="size-2 rounded-full bg-primary" />
                            <span className="text-[9px] font-black text-muted-foreground uppercase">Volume GNF</span>
                        </div>
                    }
                />

                {/* Derniers Flux — sous le graphique, pleine largeur */}
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xl font-black text-foreground uppercase tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>{t('adLatestFlux')}</h3>
                        <button onClick={() => navigate('/admin/transactions')} className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline px-3 py-1 bg-primary/5 rounded-lg">{t('adHistory')}</button>
                    </div>

                    <div className="bg-card rounded-3xl border border-border shadow-sm p-5">
                        {transactions.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                {transactions.slice(0, 6).map((tx, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-muted/50 border border-transparent hover:border-border hover:bg-card hover:shadow-sm transition-all group min-w-0">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="size-10 rounded-xl bg-card border border-border flex items-center justify-center shrink-0 overflow-hidden">
                                                <img src={`https://api.dicebear.com/7.x/shapes/svg?seed=${tx.id}`} alt="" className="w-full h-full object-cover p-1 opacity-80" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[11px] font-black text-foreground uppercase truncate tracking-tight">{tx.name || tx.userName || "System Node"}</p>
                                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none mt-1">{tx.statut || tx.status || 'INDEXED'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0 ml-3">
                                            <p className="text-[12px] font-black text-foreground tabular-nums">{(tx.amount || tx.total_prix || 0).toLocaleString()}</p>
                                            <div className={cn(
                                                "text-[8px] font-black uppercase tracking-tighter",
                                                (tx.status === 'SUCCESS' || tx.statut === 'payé') ? "text-emerald-500" : "text-amber-500"
                                            )}>
                                                GNF • {(tx.status === 'SUCCESS' || tx.statut === 'payé') ? 'VALIDE' : 'PENDING'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-24 text-center opacity-40 flex flex-col items-center gap-4 text-muted-foreground">
                                <Activity className="size-14" />
                                <p className="text-[10px] font-black uppercase tracking-widest">{t('adNoFluxDetected')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminDashboard;
