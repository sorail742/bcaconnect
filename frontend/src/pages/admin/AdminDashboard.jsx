import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DashboardCard from '../../components/ui/DashboardCard';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import {
    Users,
    CreditCard,
    Package,
    Calendar,
    Download,
    Activity,
    TrendingUp,
    Shield,
    RefreshCcw,
    Search,
    Landmark,
    MessageSquare,
    Store,
    ArrowUpRight,
    Gavel,
    History,
    Satellite,
    Zap,
    Sparkles,
    Cpu
} from 'lucide-react';
import { CardSkeleton, TableRowSkeleton } from '../../components/ui/Loader';
import statService from '../../services/statService';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [dashboardData, setDashboardData] = useState(null);

    const fetchGlobalStats = useCallback(async () => {
        try {
            setIsRefreshing(true);
            const data = await statService.getAdminStats();
            setDashboardData(data);
        } catch (err) {
            toast.error("Impossible de synchroniser les indicateurs de performance.");
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchGlobalStats();
    }, [fetchGlobalStats]);

    const handleRefresh = () => {
        fetchGlobalStats();
        toast.success('RÉSEAU SYNCHRONISÉ AVEC LE NOEUD CENTRAL.');
    };

    const handleDownload = () => {
        setIsDownloading(true);
        toast.info("GÉNÉRATION DE L'AUDIT STRATÉGIQUE EN COURS...");
        setTimeout(() => {
            setIsDownloading(false);
            toast.success("RAPPORT D'AUDIT CERTIFIÉ TÉLÉCHARGÉ.");
        }, 1500);
    };

    const stats = [
        {
            title: "MEMBRES RÉSEAU",
            value: dashboardData?.overview?.usersCount?.toString() || '0',
            icon: Users,
            trend: 'up',
            trendValue: 'ACTIFS',
            color: 'primary'
        },
        {
            title: 'FLUX GLOBAL (GNF)',
            value: `${(dashboardData?.overview?.totalRevenue || 0).toLocaleString('fr-GN')}`,
            icon: Landmark,
            trend: 'up',
            trendValue: '+14.2%',
            color: 'primary'
        },
        {
            title: 'ENTITÉS BOUTIQUES',
            value: dashboardData?.overview?.storesCount?.toString() || '0',
            icon: Store,
            trend: 'up',
            trendValue: 'CERTIFIÉES',
            color: 'primary'
        },
        {
            title: 'LITIGES ACTIFS',
            value: dashboardData?.overview?.disputesCount?.toString() || '0',
            icon: Gavel,
            trend: (dashboardData?.overview?.disputesCount || 0) > 5 ? 'down' : 'up',
            trendValue: 'AUDIT REQUIS',
            color: 'primary'
        },
    ];

    const transactions = dashboardData?.recentTransactions || [];

    const transactionColumns = [
        {
            label: 'ACTEUR ACTIF',
            render: (row) => (
                <div className="flex items-center gap-4 py-2">
                    <div className="size-10 rounded-xl bg-white/[0.03] border-2 border-white/5 flex items-center justify-center overflow-hidden shadow-2xl relative group-hover:rotate-6 transition-transform">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${row.name || 'BCA'}`} alt="" className="w-full h-full object-cover relative z-10" />
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#FF6600]/20 to-transparent" />
                    </div>
                    <span className="text-[11px] font-black text-white uppercase tracking-widest italic truncate max-w-[140px]">
                        {row.name?.toUpperCase() || "SYSTÈME NOEUD"}
                    </span>
                </div>
            )
        },
        {
            label: 'VOLUME',
            render: (row) => (
                <span className="text-sm font-black text-white italic tabular-nums tracking-tighter">
                    {row.amount?.toLocaleString('fr-GN')} <small className="text-[10px] font-black text-[#FF6600] non-italic">GNF</small>
                </span>
            )
        },
        {
            label: 'STATUT TRANSIT',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "size-2 rounded-full shadow-[0_0_8px_rgba(var(--color),0.5)]",
                        row.status === 'SUCCESS' ? "bg-emerald-500" :
                            row.status === 'PENDING' ? "bg-amber-500 animate-pulse" : "bg-rose-500"
                    )} />
                    <span className={cn(
                        "text-[9px] font-black uppercase tracking-[0.2em] italic",
                        row.status === 'SUCCESS' ? "text-emerald-500" :
                            row.status === 'PENDING' ? "text-amber-500" : "text-rose-500"
                    )}>
                        {row.status || 'VALIDE'}
                    </span>
                </div>
            )
        }
    ];

    return (
        <DashboardLayout title="CONSOLE DE GOUVERNANCE RÉSEAU">
            <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-20">

                {/* Hero Executive */}
                <div className="relative overflow-hidden rounded-[4rem] bg-white group border-x-[16px] border-[#FF6600] p-12 md:p-20 shadow-3xl">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,102,0,0.1),transparent_70%)] opacity-50" />
                    <div className="absolute top-0 right-0 size-[50rem] bg-[#FF6600]/5 rounded-full blur-[200px] -mt-64 -mr-64 group-hover:scale-125 transition-transform duration-[4s]" />

                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
                        <div className="space-y-10">
                            <div className="inline-flex items-center gap-4 px-6 py-2 rounded-2xl bg-[#FF6600]/10 border-2 border-[#FF6600]/20 text-[#FF6600] text-[10px] font-black uppercase tracking-[0.4em] italic leading-none pt-0.5 shadow-lg">
                                <Shield className="size-4" /> SUPERVISION RÉSEAU • NOEUD CENTRAL ALPHA-1
                            </div>
                            <h2 className="text-6xl md:text-8xl font-black text-black tracking-tighter leading-[0.8] uppercase italic">
                                PILOTAGE <br /> <span className="text-[#FF6600] not-italic underline decoration-black/10 decoration-8 underline-offset-[-15px]">INFRASTRUCTURE.</span>
                            </h2>
                            <p className="text-slate-500 font-extrabold max-w-2xl leading-relaxed uppercase tracking-widest italic border-l-8 border-[#FF6600]/20 pl-10">
                                GESTION CENTRALISÉE DES FLUX, ARBITRAGE DES CONFLITS ET AUDIT DE CONFORMITÉ GLOBALE DE L'ÉCOSYSTÈME EXÉCUTIF BCA CONNECT.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-8">
                            <div className="h-24 px-10 bg-black/5 border-4 border-black/5 text-black rounded-[1.5rem] flex items-center gap-6 group/box shadow-inner group-hover:border-black/10 transition-all duration-700">
                                <Calendar className="size-8 text-[#FF6600] group-hover/box:scale-110 transition-all duration-500" />
                                <div className="text-left font-black italic tracking-[0.2em] text-[10px] uppercase space-y-1">
                                    <p className="opacity-40 leading-none">PÉRIODE D'AUDIT</p>
                                    <p className="text-black text-sm leading-none pt-1">DERNIERS 30 JOURS</p>
                                </div>
                            </div>
                            <button
                                onClick={handleDownload}
                                disabled={isDownloading}
                                className="h-24 px-12 bg-black text-white hover:bg-[#FF6600] rounded-[1.5rem] font-black text-xs uppercase tracking-[0.4em] transition-all duration-700 shadow-3xl hover:scale-105 active:scale-95 italic group/btn relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_2s_infinite]" />
                                {isDownloading ? <RefreshCcw className="size-6 animate-spin relative z-10" /> : <Download className="size-6 relative z-10" />}
                                <span className="ml-4 relative z-10 pt-1">{isDownloading ? "TRAITEMENT..." : "RAPPORT AUDIT"}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Performance Hub */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {isLoading ? (
                        [1, 2, 3, 4].map(i => <CardSkeleton key={i} />)
                    ) : (
                        stats.map((stat, idx) => (
                            <DashboardCard key={idx} {...stat} className="hover:border-[#FF6600]/40 transition-all duration-700 h-[220px]" />
                        ))
                    )}
                </div>

                {/* Analytical Monitoring */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Main Chart */}
                    <div className="lg:col-span-12 xl:col-span-12 bg-white/[0.02] border-4 border-white/5 rounded-[4rem] p-12 shadow-3xl flex flex-col justify-between group relative overflow-hidden">
                        <div className="absolute top-0 right-0 size-96 bg-[#FF6600]/5 rounded-full blur-[150px] -mr-48 -mt-48 group-hover:bg-[#FF6600]/10 transition-colors duration-1000" />

                        <div className="flex items-center justify-between mb-16 relative z-10">
                            <div className="flex items-center gap-6">
                                <div className="size-14 rounded-2xl bg-[#FF6600]/10 flex items-center justify-center text-[#FF6600] shadow-3xl border-2 border-[#FF6600]/20 group-hover:rotate-12 transition-transform duration-700">
                                    <TrendingUp className="size-7" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-[0.3em] italic leading-none pt-1">FLUX TRANSACTIONNEL GLOBAL</h3>
                                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] mt-3 italic opacity-60">DONNÉES QUANTUM EN TEMPS RÉEL (GNF / JOUR)</p>
                                </div>
                            </div>
                            <button onClick={handleRefresh} disabled={isRefreshing} className="size-16 rounded-[1.5rem] bg-white/[0.03] border-2 border-white/10 flex items-center justify-center text-slate-500 hover:text-[#FF6600] hover:border-[#FF6600]/20 transition-all shadow-xl group/refresh">
                                <RefreshCcw className={cn("size-6 group-hover/refresh:rotate-180 transition-transform duration-700", isRefreshing && "animate-spin")} />
                            </button>
                        </div>

                        <div className="h-96 relative z-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={dashboardData?.weeklyChart?.timeseries || []}>
                                    <defs>
                                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#FF6600" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#FF6600" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="day" hide />
                                    <YAxis hide />
                                    <Tooltip content={({ active, payload }) => (
                                        active && payload ? (
                                            <div className="bg-black/80 backdrop-blur-3xl border-4 border-[#FF6600]/20 rounded-3xl p-8 shadow-3xl">
                                                <p className="text-[11px] font-black text-[#FF6600] uppercase tracking-[0.4em] mb-3 italic">{payload[0].payload.day}</p>
                                                <p className="text-2xl font-black text-white italic tabular-nums tracking-tighter">{payload[0].value.toLocaleString()} <small className="text-[11px] text-slate-600 non-italic">GNF</small></p>
                                            </div>
                                        ) : null
                                    )} />
                                    <Area type="monotone" dataKey="val" stroke="#FF6600" strokeWidth={8} fillOpacity={1} fill="url(#colorVal)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="mt-16 p-10 bg-black/40 rounded-[3rem] border-4 border-white/5 flex items-center justify-between shadow-3xl group/status relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-[#FF6600]/5 via-transparent to-transparent opacity-0 group-hover/status:opacity-100 transition-opacity duration-1000" />
                            <div className="flex items-center gap-8 relative z-10">
                                <div className="size-14 rounded-2xl bg-[#FF6600]/10 flex items-center justify-center border-2 border-[#FF6600]/20 shadow-3xl">
                                    <Activity className="size-8 text-[#FF6600] animate-pulse" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2 italic">INDICE DE STABILITÉ RÉSEAU ALPHA</p>
                                    <p className="text-sm font-black text-white uppercase italic tracking-widest flex items-center gap-4">
                                        OPTIMAL <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" /> 99.9% UPTIME <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" /> {dashboardData?.overview?.storesCount || 0} ENTITÉS SURVEILLÉES
                                    </p>
                                </div>
                            </div>
                            <Link to="/admin/transactions" className="h-16 px-10 rounded-2xl bg-[#FF6600]/10 border-4 border-[#FF6600]/20 text-[#FF6600] text-[11px] font-black uppercase tracking-[0.4em] italic flex items-center hover:bg-[#FF6600] hover:text-white hover:border-[#FF6600] transition-all duration-700 relative z-10 shadow-3xl">AUDIT FLUX</Link>
                        </div>
                    </div>

                    {/* Side Feed */}
                    <div className="lg:col-span-12 xl:col-span-12 bg-white/[0.01] border-4 border-white/5 rounded-[4rem] overflow-hidden shadow-3xl flex flex-col">
                        <div className="p-10 border-b-4 border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <div className="flex items-center gap-6">
                                <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center">
                                    <History className="size-5 text-slate-500" />
                                </div>
                                <span className="text-[12px] font-black uppercase tracking-[0.4em] text-white italic pt-1">LOG D'ACTIVITÉS QUANTUM</span>
                            </div>
                            <Link to="/admin/transactions" className="size-12 rounded-xl bg-[#FF6600]/10 border-2 border-[#FF6600]/20 text-[#FF6600] flex items-center justify-center hover:bg-[#FF6600] hover:text-white transition-all duration-700 shadow-3xl"><ArrowUpRight className="size-6" /></Link>
                        </div>
                        <div className="p-4">
                            <DataTable
                                columns={transactionColumns}
                                data={transactions}
                                className="bg-transparent border-0"
                                noHeader
                            />
                            {isLoading && <div className="space-y-4 p-10">{[1, 2, 3, 4].map(i => <TableRowSkeleton key={i} />)}</div>}
                            {!isLoading && transactions.length === 0 && (
                                <div className="py-32 text-center opacity-20 flex flex-col items-center gap-8">
                                    <Cpu className="size-20 animate-pulse" />
                                    <p className="text-[12px] font-black uppercase tracking-[0.5em] italic">AUCUNE ACTIVITÉ RÉSEAU DÉTECTÉE</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminDashboard;
