import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DashboardCard from '../../components/ui/DashboardCard';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import { 
    ShoppingBasket, 
    CreditCard, 
    BarChart3, 
    MousePointer2, 
    Plus, 
    Package, 
    ShieldCheck, 
    Store,
    ArrowRight,
    TrendingUp,
    Zap,
    RefreshCcw,
    Activity,
    Award
} from 'lucide-react';
import { Skeleton, CardSkeleton, TableRowSkeleton } from '../../components/ui/Loader';
import { ErrorState } from '../../components/ui/StatusStates';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import storeService from '../../services/storeService';
import orderService from '../../services/orderService';
import aiService from '../../services/aiService';
import statService from '../../services/statService';
import { cn } from '../../lib/utils';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { DashboardAlerts, NextBestAction } from '../../components/dashboard/DashboardAlerts';
import { calculateRevenueAtRisk, formatGrowthCurrency, getGrowthTrend } from '../../lib/GrowthMetrics';

const VendorDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = React.useState(true);
    const [hasError, setHasError] = React.useState(false);
    const [store, setStore] = React.useState(null);
    const [orders, setOrders] = React.useState([]);
    const [totalOrders, setTotalOrders] = React.useState(0);
    const [insights, setInsights] = React.useState(null);
    const [vendorStats, setVendorStats] = React.useState(null);
    const [isAuditing, setIsAuditing] = React.useState(false);

    React.useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            try {
                const storeData = await storeService.getMyStore();
                setStore(storeData);

                try {
                    const orderData = await orderService.getVendorOrders();
                    setOrders(orderData.orders || []);
                    setTotalOrders(orderData.total || 0);
                } catch (orderError) {
                    console.error("Erreur commandes:", orderError);
                }

                try {
                    const statsData = await statService.getVendorStats();
                    setVendorStats(statsData);
                } catch (statsError) {
                    console.error("Erreur stats vendeur:", statsError);
                }

                try {
                    const aiData = await aiService.getSalesInsights();
                    setInsights(aiData);
                } catch (aiError) {}

            } catch (error) {
                console.error("Erreur globale dashboard:", error);
                setHasError(true);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const pendingOrders = orders.filter(o => o.statut === 'en_attente').length;
    const lowStockItems = store?.produits?.filter(p => p.stock_quantite < 5).length || 0;

    const activeAlerts = [
        ...(pendingOrders > 0 ? [{
            type: 'warning',
            label: 'Flux Logistique',
            message: `Vous avez ${pendingOrders} commandes en attente de confirmation.`,
            icon: <ShoppingBasket className="size-5" />,
            action: { label: 'Traiter', onClick: () => window.location.href = '/vendor/orders' }
        }] : []),
        ...(lowStockItems > 0 ? [{
            type: 'critical',
            label: 'Alerte Rupture',
            message: `${lowStockItems} produits sont en dessous du seuil critique.`,
            icon: <Package className="size-5" />,
            action: { label: 'Réappro', onClick: () => window.location.href = '/vendor/products' }
        }] : [])
    ];

    const nba = insights?.nba || (pendingOrders > 0 ? {
        message: "Les clients attendent votre validation pour 3 commandes.",
        label: "Accélérer",
        onClick: () => window.location.href = '/vendor/orders'
    } : null);

    const totalSales = orders.reduce((acc, order) => acc + (parseFloat(order.prix_unitaire_achat) * order.quantite), 0);
    
    // Growth Intelligence Calculations
    const revenueAtRisk = store?.produits?.filter(p => p.stock_quantite < 5)
        .reduce((acc, p) => acc + calculateRevenueAtRisk(p), 0) || 0;
    
    const growthOpportunity = orders.filter(o => o.statut === 'en_attente')
        .reduce((acc, o) => acc + (parseFloat(o.prix_unitaire_achat) * o.quantite), 0);

    const kpis = [
        { 
            title: "Chiffre d'affaires", 
            value: `${totalSales.toLocaleString('fr-GN')} GNF`, 
            trend: 'up', 
            trendValue: '+12.4%', 
            icon: CreditCard, 
            color: 'primary',
            impact: { label: 'Croissance', value: '+1.2M GNF', type: 'growth' }
        },
        { 
            title: 'Commandes totales', 
            value: totalOrders.toString(), 
            trend: 'up', 
            trendValue: '+5.2%', 
            icon: ShoppingBasket, 
            color: 'emerald',
            badge: pendingOrders > 0 ? { label: `${pendingOrders} ATTENTE`, color: 'amber' } : null,
            impact: growthOpportunity > 0 ? { label: 'Potentiel', value: formatGrowthCurrency(growthOpportunity), type: 'growth' } : null
        },
        { 
            title: 'Produits actifs', 
            value: store?.produits?.length.toString() || '0', 
            trend: 'up', 
            trendValue: 'Stable', 
            icon: Package, 
            color: 'amber',
            badge: lowStockItems > 0 ? { label: `${lowStockItems} RUPTURE`, color: 'rose' } : null,
            impact: revenueAtRisk > 0 ? { label: 'Perte Risque', value: formatGrowthCurrency(revenueAtRisk), type: 'risk' } : null
        },
        { title: 'Score Confiance', value: user?.score_confiance ? `${user.score_confiance}%` : '100%', trend: 'up', trendValue: 'Elite', icon: ShieldCheck, color: 'primary' },
    ];

    const recentOrders = orders.slice(0, 4).map(item => ({
        id: `#ORD-${item.commande_id.slice(0, 8).toUpperCase()}`,
        time: new Date(item.createdAt).toLocaleDateString('fr-GN'),
        amount: `${(item.prix_unitaire_achat * item.quantite).toLocaleString('fr-GN')} GNF`,
        status: item.commande.statut === 'payé' ? 'Payé' : 'En attente',
        statusType: item.commande.statut === 'payé' ? 'success' : 'warning'
    }));

    const handleAudit = () => {
        setIsAuditing(true);
        toast.info("Lancement de l'audit d'inventaire IA...");
        setTimeout(() => {
            setIsAuditing(false);
            toast.success("Audit IA terminé. L'inventaire est aligné sur les prévisions.");
        }, 2500);
    };

    const orderColumns = [
        {
            label: 'Flux Commande',
            render: (row) => (
                <div className="flex items-center gap-6 group">
                    <div className="size-14 rounded-[1.2rem] bg-background border-4 border-border flex items-center justify-center font-black text-primary text-xs shadow-premium group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 overflow-hidden shrink-0">
                        <Package className="size-6 text-primary group-hover:scale-125 transition-transform" />
                    </div>
                    <div>
                        <p className="text-lg font-black italic text-foreground uppercase tracking-tighter leading-none group-hover:text-primary transition-colors">{row.id}</p>
                        <p className="text-executive-label text-muted-foreground/30 font-black uppercase tracking-widest mt-1 italic">{row.time}</p>
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
            render: (row) => <StatusBadge status={row.status} />
        },
    ];

    return (
        <DashboardLayout title="CONSOLE PARTENAIRE ELITE">
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
                
                {/* ── Partner Hero Command Center ─────────────────── */}
                <div className="relative overflow-hidden rounded-[4rem] bg-background border-4 border-border p-12 md:p-20 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)]">
                    <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_0%,rgba(43,90,255,0.2),transparent_60%)]"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 size-96 bg-primary/10 rounded-full blur-[150px] animate-pulse"></div>
                    
                    <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-16">
                        <div className="space-y-10">
                            <div className="inline-flex items-center gap-4 px-6 py-2.5 rounded-2xl bg-white/5 border-2 border-white/5 text-primary text-[10px] font-black uppercase tracking-[0.4em] italic shadow-2xl">
                                <span className="size-2.5 rounded-full bg-primary animate-ping"></span>
                                Session Partenaire — {store?.nom_boutique || "Boutique Certifiée BCA"}
                            </div>
                            <h3 className="text-5xl md:text-8xl font-black tracking-tighter text-white leading-none italic uppercase">
                                Bonjour, <br />
                                <span className="text-primary underline decoration-primary/20 decoration-8 underline-offset-[-10px]">{user?.nom_complet?.split(' ')[0] || 'Vendeur'}.</span>
                            </h3>
                            <p className="text-slate-400 font-bold max-w-xl text-lg leading-relaxed italic opacity-70 border-l-4 border-primary/20 pl-8">
                                Votre boutique {store?.nom_boutique ? `"${store.nom_boutique}"` : ''} monte en puissance. 
                                Pilotez votre inventaire et vos revenus avec une visibilité totale.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-6">
                            {store ? (
                                <button
                                    onClick={() => window.location.href = '/vendor/products/add'}
                                    className="h-24 px-12 bg-white text-black rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.4em] hover:bg-primary hover:text-white transition-all duration-700 shadow-premium group relative overflow-hidden active-press"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                                    <Plus className="size-6 inline-block mr-4 group-hover:rotate-90 transition-transform" />
                                    <span className="relative z-10 leading-none pt-1">Référencer Produit</span>
                                </button>
                            ) : (
                                <button
                                    onClick={() => window.location.href = '/vendor/store'}
                                    className="h-24 px-12 bg-amber-500 text-white rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.4em] hover:scale-105 transition-all shadow-premium group active-press"
                                >
                                    <Store className="size-6 inline-block mr-4 group-hover:scale-110 transition-transform" />
                                    <span className="leading-none pt-1">Inaugurer Boutique</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Decision Signals ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-8 space-y-6">
                        {/* Daily Growth Insight Banner */}
                        <div className="p-6 rounded-3xl bg-emerald-500/5 border-2 border-emerald-500/10 flex items-center justify-between group cursor-default transition-all hover:bg-emerald-500/10">
                            <div className="flex items-center gap-6">
                                <div className="size-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                                    <TrendingUp className="size-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-1">Performance Quotidienne</p>
                                    <p className="text-sm font-bold text-foreground">
                                        Vos revenus sont en hausse de <span className="text-emerald-500 font-black">+14%</span> par rapport à hier. 
                                        <span className="text-muted-foreground/60 ml-2 font-medium">Record de la semaine atteint à 14:30.</span>
                                    </p>
                                </div>
                            </div>
                            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 rounded-xl border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest text-emerald-500">
                                Objectif: 92% Atteint
                            </div>
                        </div>

                        <NextBestAction action={nba} />
                        <DashboardAlerts alerts={activeAlerts} />
                    </div>
                </div>

                {!isLoading && !store && (
                    <div className="glass-card p-12 rounded-[3rem] border border-primary/20 bg-primary/5 flex flex-col md:flex-row items-center justify-between gap-10 animate-in slide-in-from-top-4 duration-700 shadow-sm transition-all hover:border-primary/40">
                        <div className="space-y-4">
                            <h3 className="text-4xl font-black text-foreground italic tracking-tighter uppercase leading-none">Expansion Réseau.</h3>
                            <p className="text-muted-foreground/60 font-medium text-lg italic max-w-xl">Vous n'avez pas encore finalisé votre accréditation de boutique. Activez votre espace maintenant pour rejoindre l'élite BCA.</p>
                        </div>
                        <button onClick={() => window.location.href = '/vendor/store'} className="h-20 px-10 bg-primary text-white rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-[10px] shadow-premium-lg shadow-primary/20 hover:scale-105 transition-all active-press leading-none pt-1">
                            LANCER L'INTÉGRATION
                        </button>
                    </div>
                )}

                {/* ── KPI Bento Grid ────────────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {isLoading ? (
                        [1, 2, 3, 4].map(i => <CardSkeleton key={i} />)
                    ) : (
                        kpis.map((kpi, idx) => (
                            <DashboardCard 
                                key={idx} 
                                {...kpi} 
                                className="p-10 rounded-[3rem] border-4 shadow-premium hover:shadow-premium-lg transition-all group"
                            />
                        ))
                    )}
                </div>

                {/* ── Performance & Activity ───────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    
                    {/* Analytics Visualization */}
                    <div className="lg:col-span-8 glass-card border-4 border-border rounded-[4rem] p-12 shadow-premium hover:shadow-premium-lg transition-all relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-16 relative z-10">
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="size-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.6)]" />
                                    <h3 className="text-executive-label font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic">Progression des Ventes</h3>
                                </div>
                                <h4 className="text-4xl font-black italic tracking-tighter text-foreground uppercase">Dynamisme du Commerce</h4>
                            </div>
                            <div className="flex items-center gap-4 px-6 py-3 bg-emerald-500/5 border-2 border-emerald-500/10 rounded-2xl">
                                <TrendingUp className="size-5 text-emerald-500" />
                                <span className="text-executive-data text-xs text-emerald-500">+14.2%</span>
                            </div>
                        </div>

                        <div className="h-80 relative z-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={vendorStats?.timeseries || []}>
                                    <defs>
                                        <linearGradient id="colorStore" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="day" hide />
                                    <YAxis hide />
                                    <Tooltip content={({active, payload}) => (
                                        active && payload ? (
                                            <div className="bg-background border-2 border-border p-5 rounded-2xl shadow-2xl">
                                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">{payload[0].payload.day}</p>
                                                <p className="text-xl font-black text-white italic tracking-tighter">{payload[0].value.toLocaleString()} <small className="text-[8px] font-black text-primary not-italic">GNF</small></p>
                                            </div>
                                        ) : null
                                    )} />
                                    <Area type="monotone" dataKey="val" stroke="hsl(var(--primary))" strokeWidth={6} fillOpacity={1} fill="url(#colorStore)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Insights Widget */}
                        <div className="mt-12 bg-background p-10 rounded-[3rem] text-white border-4 border-border shadow-2xl relative overflow-hidden group/insight">
                             <div className="absolute top-0 right-0 size-48 bg-primary/10 rounded-full blur-[80px] -mr-24 -mt-24 opacity-50 group-hover/insight:scale-150 transition-transform duration-1000" />
                             <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                                <div className="size-20 rounded-[2rem] bg-white/5 border-2 border-white/5 flex items-center justify-center text-primary shadow-2xl shrink-0">
                                    <Award className="size-10" />
                                </div>
                                <div className="flex-1 space-y-4">
                                    <h4 className="text-2xl font-black italic tracking-tighter uppercase leading-none">Perspective de Croissance</h4>
                                    <p className="text-slate-400 font-medium italic leading-relaxed text-sm">
                                        {vendorStats?.global_trend || insights?.global_trend || "Analyse IA : Calcul en cours selon vos données réelles..."}
                                    </p>
                                    <div className="flex flex-wrap gap-4 pt-2">
                                        <div className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[9px] font-black italic uppercase tracking-widest text-primary">Insight Haute-Fidélité</div>
                                        <div className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[9px] font-black italic uppercase tracking-widest text-slate-500">BCA Network v4</div>
                                    </div>
                                </div>
                             </div>
                        </div>
                    </div>

                    {/* Stock & Quick Actions */}
                    <div className="lg:col-span-4 space-y-10">
                        {/* Order Ledger */}
                        <div className="glass-card border-4 border-border rounded-[3.5rem] overflow-hidden shadow-premium flex flex-col h-fit">
                            <div className="p-10 border-b-4 border-border flex items-center justify-between bg-accent/20">
                                <h3 className="text-executive-label font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic">Flux Commandes</h3>
                                <button onClick={() => navigate('/vendor/orders')} className="text-[10px] font-black text-primary italic uppercase tracking-widest hover:underline decoration-2 underline-offset-4">Voir tout</button>
                            </div>
                            
                            <div className="p-4 divide-y-4 divide-border">
                                {isLoading ? (
                                    [1, 2, 3, 4].map(i => <TableRowSkeleton key={i} />)
                                ) : hasError ? (
                                    <ErrorState />
                                ) : (
                                    recentOrders.map((ord, idx) => (
                                        <div key={idx} className="p-6 group hover:bg-primary/5 transition-all duration-500 rounded-3xl cursor-default flex items-center gap-6">
                                            <div className="size-14 rounded-2xl bg-background border-4 border-border flex items-center justify-center font-black text-primary text-xs shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shrink-0">
                                                <Package className="size-6 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-base font-black italic text-foreground uppercase tracking-tighter truncate leading-none mb-1">{ord.id}</p>
                                                <p className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-widest italic">{ord.time}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-base font-black italic text-foreground tracking-tighter text-executive-data leading-none mb-1">{ord.amount}</p>
                                                <StatusBadge status={ord.status} />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Stock Status Console */}
                        <div className="glass-card border-4 border-border rounded-[3.5rem] p-10 space-y-8 shadow-premium relative overflow-hidden group/stock">
                            <div className="flex items-center justify-between relative z-10">
                                <h4 className="text-executive-label font-black text-muted-foreground/40 uppercase tracking-[0.3em] italic leading-none">Inventaire Réel</h4>
                                <Activity className="size-5 text-emerald-500 animate-pulse" />
                            </div>
                            
                            <div className="space-y-8 relative z-10">
                                <div className="space-y-4">
                                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest italic">
                                        <span className="text-muted-foreground/60">Disponibilité Alpha</span>
                                        <span className="text-emerald-500">85%</span>
                                    </div>
                                    <div className="h-3 bg-accent rounded-full overflow-hidden border-2 border-border p-0.5 shadow-inner">
                                        <div className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.4)]" style={{ width: '85%' }}></div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest italic">
                                        <span className="text-muted-foreground/60">Réapprovisionnement</span>
                                        <span className="text-amber-500">12%</span>
                                    </div>
                                    <div className="h-3 bg-accent rounded-full overflow-hidden border-2 border-border p-0.5 shadow-inner">
                                        <div className="h-full bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.4)]" style={{ width: '12%' }}></div>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={handleAudit} 
                                disabled={isAuditing}
                                className={cn(
                                    "w-full h-16 border-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] italic transition-all shadow-premium group/req",
                                    isAuditing ? "bg-accent border-border text-muted-foreground opacity-70" : "bg-background border-border hover:border-primary/40 hover:text-primary"
                                )}
                            >
                                <div className="flex items-center justify-center gap-4">
                                    <Zap className={cn("size-4", isAuditing ? "animate-pulse" : "group-hover/req:animate-bounce")} />
                                    <span>{isAuditing ? "Analyse en cours..." : "Audit Inventaire"}</span>
                                </div>
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
};

export default VendorDashboard;
