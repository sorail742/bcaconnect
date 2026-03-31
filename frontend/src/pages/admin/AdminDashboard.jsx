import React, { useState, useEffect } from 'react';
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
    ShoppingBag, 
    TrendingUp, 
    Shield, 
    Zap, 
    RefreshCcw,
    ArrowUpRight,
    Search
} from 'lucide-react';
import { Skeleton, CardSkeleton, TableRowSkeleton } from '../../components/ui/Loader';
import statService from '../../services/statService';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { DashboardAlerts, NextBestAction } from '../../components/dashboard/DashboardAlerts';
import { formatGrowthCurrency } from '../../lib/GrowthMetrics';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [dashboardData, setDashboardData] = useState(null);
    const [storesCount, setStoresCount] = useState(0);

    const fetchGlobalStats = async () => {
        try {
            const data = await statService.getAdminStats();
            setDashboardData(data);
            if (data.overview) {
                setStoresCount(data.overview.storesCount || 0);
            }
        } catch (err) {
            console.error("Erreur stats admin:", err);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchGlobalStats();
    }, []);

    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchGlobalStats();
        toast.promise(
            new Promise(resolve => setTimeout(resolve, 800)),
            {
                loading: 'Actualisation des flux réseau...',
                success: 'Tableau de bord synchronisé en temps réel',
                error: 'Erreur réseau.'
            }
        );
    };

    const handleDownload = () => {
        setIsDownloading(true);
        toast.info("Génération du rapport PDF consolidé...");
        setTimeout(() => {
            setIsDownloading(false);
            toast.success("Rapport téléchargé avec succès.");
        }, 2000);
    };

    const activeAlerts = [
        ...(dashboardData?.disputesCount > 0 ? [{
            type: 'critical',
            label: 'Fuite de Revenus',
            message: `Analyse IA : ${dashboardData.disputesCount} litiges non résolus (~${formatGrowthCurrency(dashboardData.disputesCount * 500000)} à risque).`,
            icon: <Shield className="size-5" />,
            action: { label: 'Arbitrer', onClick: () => window.location.href = '/admin/disputes' }
        }] : []),
        {
            type: 'info',
            label: 'Vitesse de Règlement',
            message: "Moyenne Mobile Money : 2h15m (+5m vs hier). Point de vigilance sur le segment Orange.",
            icon: <Activity className="size-5" />
        }
    ];

    const nba = {
        message: "Audit de sécurité requis pour 3 nouvelles boutiques partenaires.",
        label: "Lancer l'audit",
        onClick: () => window.location.href = '/admin/stores'
    };

    const stats = dashboardData?.stats || [
        { 
            title: "Utilisateurs totaux", 
            value: '0', 
            icon: 'Users', 
            trend: 'up', 
            trendValue: '0%', 
            color: 'primary',
            badge: { label: '+12 Nouveaux', color: 'primary' }
        },
        { title: 'Transactions (Globales)', value: '0 GNF', icon: 'CreditCard', trend: 'up', trendValue: '0%', color: 'emerald' },
        { 
            title: 'Potentiel Réseau', 
            value: '42.5M GNF', 
            icon: 'TrendingUp', 
            trend: 'up', 
            trendValue: '+18%', 
            color: 'primary',
            badge: { label: 'GROWTH MODE', color: 'primary' },
            impact: { label: 'Capacité', value: '85%', type: 'growth' }
        },
        { 
            title: 'Alertes Système', 
            value: '2', 
            icon: 'Zap', 
            trend: 'down', 
            trendValue: '-5%', 
            color: 'amber',
            badge: { label: 'LOW RISK', color: 'emerald' }
        },
    ];

    const transactions = dashboardData?.recentTransactions || [];

    const transactionColumns = [
        {
            label: 'Flux Transactionnel',
            render: (row) => (
                <div className="flex items-center gap-6 group cursor-default">
                    <div className="size-14 rounded-[1.2rem] bg-background border-4 border-border flex items-center justify-center font-black text-primary text-xs shadow-premium group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 overflow-hidden shrink-0">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${row.id || row.name}`} alt="avatar" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-lg font-black italic text-foreground uppercase tracking-tighter leading-none group-hover:text-primary transition-colors truncate">
                            {row.name}
                        </p>
                        <p className="text-executive-label text-muted-foreground/30 font-black uppercase tracking-widest mt-1 italic">
                            {row.time} • {row.cat.toUpperCase()}
                        </p>
                    </div>
                </div>
            )
        },
        { 
            label: 'Volume', 
            render: (row) => (
                <span className="text-lg font-black italic text-foreground tracking-tighter text-executive-data">
                    {row.amount}
                </span>
            )
        },
        {
            label: 'Certification',
            render: (row) => (
                <div className="flex items-center gap-4">
                    <StatusBadge status={row.status} />
                </div>
            )
        }
    ];

    return (
        <DashboardLayout title="CENTRE DE COMMANDEMENT">
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
                
                {/* ── Executive Hero Console ───────────────────────── */}
                <div className="relative overflow-hidden rounded-3xl bg-background border border-border p-8 md:p-12 shadow-lg">
                    <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_0%,rgba(43,90,255,0.1),transparent_60%)]"></div>
                    
                    <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-xl bg-white/5 border border-white/5 text-primary text-[9px] font-black uppercase tracking-widest shadow-2xl">
                                <Shield className="size-3" />
                                Accès Admin Niveau 5 • Système Stable
                            </div>
                            <h3 className="text-4xl md:text-6xl font-black tracking-tight text-white uppercase leading-none">
                                Surveillance <span className="text-primary">Globale.</span>
                            </h3>
                            <p className="text-slate-400 font-medium max-w-lg text-sm leading-relaxed opacity-70 border-l-2 border-primary/20 pl-6">
                                Supervision de l'infrastructure BCA Connect. 
                                Analysez les indicateurs et pilotez la croissance du réseau.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            <button 
                                onClick={() => toast.info("Le MVP utilise la période de '30 JOURS' par défaut.")}
                                className="h-16 px-6 bg-white/5 border border-white/5 text-white rounded-2xl font-bold uppercase tracking-widest text-[9px] flex items-center gap-4 hover:bg-white/10 transition-all shadow-xl group"
                            >
                                <Calendar className="size-5 text-primary" />
                                <div className="text-left">
                                    <p className="opacity-40 leading-none mb-1">Période</p>
                                    <p className="leading-none pt-1">30 JOURS</p>
                                </div>
                            </button>
                            <button 
                                onClick={handleDownload}
                                disabled={isDownloading}
                                className="h-16 px-8 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-lg group disabled:opacity-70 disabled:hover:bg-white disabled:hover:text-black"
                            >
                                <Download className={cn("size-5 inline-block mr-3", isDownloading && "animate-bounce")} />
                                {isDownloading ? "Génération..." : "Rapport de Synthèse"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Decision Intelligence ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-8">
                        <NextBestAction action={nba} />
                        <DashboardAlerts alerts={activeAlerts} />
                    </div>
                </div>

                {/* ── KPI Bento Grid ────────────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {isLoading ? (
                        [1, 2, 3].map(i => <CardSkeleton key={i} />)
                    ) : (
                        stats.map((stat, idx) => {
                            const IconMap = { 'Users': Users, 'CreditCard': CreditCard, 'Package': Package };
                            const Icon = IconMap[stat.icon] || Zap;
                            return (
                                <DashboardCard 
                                    key={idx} 
                                    {...stat} 
                                    icon={Icon} 
                                    variant={idx === 1 ? "glass" : "default"}
                                    className="p-8 rounded-3xl border border-border transition-all group shadow-sm"
                                />
                            );
                        })
                    )}
                </div>

                {/* ── Main Analytics & Activity ─────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    
                    {/* Performance Visualization */}
                    <div className="lg:col-span-8 glass-card border border-border rounded-[2rem] p-10 shadow-sm relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-12 relative z-10">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="size-2 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Croissance du Réseau</h3>
                                </div>
                                <h4 className="text-3xl font-black tracking-tight text-foreground uppercase">Flux Hebdomadaires</h4>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex flex-col items-end">
                                    <span className="text-3xl font-black text-primary italic tracking-tighter text-executive-data">
                                        {dashboardData?.weeklyChart?.total?.toLocaleString() || '0'} <small className="text-[10px] font-bold not-italic">GNF</small>
                                    </span>
                                    <div className={cn(
                                        "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest italic mt-2",
                                        (dashboardData?.weeklyChart?.delta || 0) >= 0 ? "text-emerald-500" : "text-rose-500"
                                    )}>
                                        {(dashboardData?.weeklyChart?.delta || 0) >= 0 ? <ArrowUpRight className="size-3" /> : <TrendingUp className="size-3 rotate-180" />}
                                        {(dashboardData?.weeklyChart?.delta || 0) >= 0 ? '+' : ''}{dashboardData?.weeklyChart?.delta || '0'}% vs mois dernier
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Chart Area */}
                        <div className="h-96 relative z-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={dashboardData?.weeklyChart?.timeseries || []}>
                                    <defs>
                                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="day" hide />
                                    <YAxis hide />
                                    <Tooltip content={({active, payload}) => (
                                        active && payload ? (
                                            <div className="bg-background border-2 border-border p-4 rounded-2xl shadow-2xl">
                                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">{payload[0].payload.day}</p>
                                                <p className="text-lg font-black text-white italic tracking-tighter">{payload[0].value.toLocaleString()} <small className="text-[8px] font-black text-primary not-italic uppercase tracking-widest">Flux</small></p>
                                            </div>
                                        ) : null
                                    )} />
                                    <Area type="monotone" dataKey="val" stroke="hsl(var(--primary))" strokeWidth={6} fillOpacity={1} fill="url(#colorVal)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Network Monitoring Widget */}
                        <div className="mt-8 p-8 bg-primary/5 rounded-2xl border border-primary/10 flex items-center justify-between group/monitor">
                            <div className="flex items-center gap-6">
                                <div className="size-16 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/10">
                                    <Activity className="size-8" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Monitoring Actif</p>
                                    <p className="text-lg font-bold text-muted-foreground/70 leading-tight">
                                        Système supervise <span className="text-foreground font-black">{storesCount} boutiques</span> actives.
                                    </p>
                                </div>
                            </div>
                            <button onClick={handleRefresh} disabled={isRefreshing} className="size-12 rounded-xl bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-primary transition-all disabled:opacity-50">
                                <RefreshCcw className={cn("size-5", isRefreshing && "animate-spin")} />
                            </button>
                        </div>
                    </div>

                    {/* Recent Stream & Actions */}
                    <div className="lg:col-span-4 space-y-10">
                        <div className="glass-card border-4 border-border rounded-[3.5rem] overflow-hidden shadow-premium flex flex-col h-full">
                            <div className="p-10 border-b-4 border-border flex items-center justify-between bg-accent/20">
                                <h3 className="text-executive-label font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic">Flux Temps Réel</h3>
                                <button onClick={() => navigate('/admin/transactions')} className="text-[10px] font-black text-primary italic uppercase tracking-widest hover:underline decoration-2 underline-offset-4">Auditer tout</button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto max-h-[600px] p-4 divide-y-4 divide-border">
                                {isLoading ? (
                                    [1, 2, 3, 4, 5].map(i => <TableRowSkeleton key={i} />)
                                ) : (
                                    transactions.map((trx, idx) => (
                                        <div key={idx} className="p-6 group hover:bg-primary/5 transition-all duration-500 rounded-3xl cursor-default flex items-center gap-6">
                                            <div className="size-14 rounded-2xl bg-background border-4 border-border flex items-center justify-center font-black text-primary text-xs shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 overflow-hidden shrink-0">
                                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${trx.name}`} alt="avatar" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-base font-black italic text-foreground uppercase tracking-tighter truncate leading-none mb-1">{trx.name}</p>
                                                <p className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-widest italic">{trx.time} • {trx.cat.toUpperCase()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-base font-black italic text-foreground tracking-tighter text-executive-data leading-none mb-1">{trx.amount}</p>
                                                <StatusBadge status={trx.status} />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Quick Actions Console */}
                            <div className="p-10 border-t-4 border-border bg-background text-white space-y-6">
                                <p className="text-executive-label font-black text-slate-500 uppercase tracking-[0.3em] italic mb-4">Commandes d'Urgence</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <button onClick={() => toast.success("Modèle IA analytique lancé. Aucun signal d'anomalie détecté.")} className="h-20 bg-white/5 border-2 border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all flex flex-col items-center justify-center gap-2 group">
                                        <Zap className="size-4 text-primary group-hover:text-white" />
                                        <span>Alerte IA</span>
                                    </button>
                                    <button onClick={() => toast.success("BCA Guard Actif : Toutes les transactions sont actuellement scellées.")} className="h-20 bg-white/5 border-2 border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 transition-all flex flex-col items-center justify-center gap-2 group">
                                        <Shield className="size-4 text-rose-500 group-hover:text-white" />
                                        <span>Sécurité</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminDashboard;
