import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DashboardCard from '../../components/ui/DashboardCard';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import {
    ShoppingBasket,
    CreditCard,
    Plus,
    Package,
    ShieldCheck,
    Store,
    ArrowRight,
    TrendingUp,
    Zap,
    Award,
    BaggageClaim,
    Satellite,
    Briefcase,
    Activity,
    LineChart,
    ChevronRight,
    Globe,
    RefreshCcw
} from 'lucide-react';
import { CardSkeleton, TableRowSkeleton } from '../../components/ui/Loader';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';
import storeService from '../../services/storeService';
import orderService from '../../services/orderService';
import statService from '../../services/statService';
import aiService from '../../services/aiService';
import { cn } from '../../lib/utils';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useMyStore, useVendorOrders, useVendorStats, useTrustScore } from '../../hooks/useDomainData';
import socketService from '../../services/socketService';
const VendorDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isAuditing, setIsAuditing] = useState(false);

    const { data: store, loading: storeLoading } = useMyStore();
    const { data: orderData, loading: ordersLoading, refetch: refetchOrders } = useVendorOrders();
    const { data: statsData, loading: statsLoading, refetch: refetchStats } = useVendorStats();
    const { data: trustData, loading: trustLoading } = useTrustScore();

    useEffect(() => {
        socketService.connect();
        const handleUpdate = () => {
            refetchOrders();
            refetchStats();
            toast.info("Mise à jour des flux en cours...");
        };

        socketService.on('order_placed', handleUpdate);
        socketService.on('new_order_vendor', handleUpdate); // Event spécifique vendeur

        return () => {
            socketService.off('order_placed', handleUpdate);
            socketService.off('new_order_vendor', handleUpdate);
        };
    }, [refetchOrders, refetchStats]);

    const orders = orderData?.orders || [];
    const totalOrders = orderData?.total || 0;
    const isLoading = storeLoading || ordersLoading || statsLoading || trustLoading;


    // Calculs basés sur les données réelles
    const pendingOrders = orders.filter(o => o.statut === 'en_attente').length;
    const lowStockItems = store?.produits?.filter(p => p.stock_quantite < 10).length || 0;
    
    // Utiliser les stats du backend en priorité pour le chiffre d'affaires
    const totalRevenue = statsData?.totalRevenue || orders.reduce((acc, order) => acc + (parseFloat(order.prix_unitaire_achat || 0) * (order.quantite || 0)), 0);
    const productsCount = store?.produits?.length || 0;

    const kpis = [
        { title: "Chiffre d'Affaires", value: `${totalRevenue.toLocaleString('fr-GN')} GNF`, trend: 'up', trendValue: statsData?.growth || '--', icon: CreditCard, color: 'primary' },
        { title: 'Commandes Reçues', value: totalOrders.toString(), trend: 'up', trendValue: pendingOrders > 0 ? `${pendingOrders} en attente` : 'Optimal', icon: ShoppingBasket, color: 'emerald-500' },
        { title: 'Produits en Stock', value: productsCount.toString(), trend: 'up', trendValue: lowStockItems > 0 ? `${lowStockItems} stock bas` : 'Stock nominal', icon: Package, color: 'amber-500' },
        { title: 'Score de Confiance', value: user?.score_confiance ? `${user.score_confiance}%` : '100%', trend: 'up', trendValue: 'Vendeur élite', icon: ShieldCheck, color: 'primary' },
    ];

    const recentOrders = orders.slice(0, 5).map(item => ({
        id: item.commande_id || item.id,
        displayId: `#ORD-${(item.commande_id || item.id).slice(0, 8).toUpperCase()}`,
        time: new Date(item.createdAt).toLocaleDateString('fr-GN'),
        amount: `${(parseFloat(item.prix_unitaire_achat || 0) * (item.quantite || 0)).toLocaleString('fr-GN')} GNF`,
        status: item.statut === 'payé' ? 'Payé' : item.statut === 'en_attente' ? 'En attente' : 'Terminé'
    }));

    const handleAudit = async () => {
        setIsAuditing(true);
        toast.info("INITIATION_AUDIT_ALPHA_IA...", { icon: <Satellite className="size-4 animate-spin" /> });
        try {
            const insights = await aiService.getVendorInsights();
            // Optionnel : Mettre à jour manuellement si nécessaire, ou laisser le refetch automatique s'occuper du reste
            toast.success("AUDIT_SCELLÉ_TERMINÉ.", { description: insights.recommendation || "Optimisation du catalogue suggérée." });
            refetchStats();
        } catch (error) {
            toast.error("ERREUR_AUDIT_IA.");
        } finally {
            setIsAuditing(false);
        }
    };

    const orderColumns = [
        { 
            label: 'Référence', 
            render: (row) => (
                <div className="flex items-center gap-4 py-3">
                    <div className="size-2 rounded-full bg-primary/40" />
                    <span className="text-[10px] font-black uppercase text-muted-foreground ">{row.displayId}</span>
                </div>
            ) 
        },
        { 
            label: 'Montant', 
            render: (row) => (
                <div className="flex items-baseline gap-2">
                    <span className="font-black text-[13px] text-foreground tabular-nums tracking-tighter uppercase">{row.amount.split(' ')[0]}</span>
                    <span className="text-[9px] font-black text-primary uppercase tracking-widest">{row.amount.split(' ')[1]}</span>
                </div>
            ) 
        },
        { 
            label: 'Statut', 
            render: (row) => (
                <div className="flex items-center justify-end pr-6">
                    <StatusBadge status={row.status} className="text-[9px] font-black uppercase  border shadow-2xl py-2 px-5 rounded-xl bg-white/[0.02]" />
                </div>
            ) 
        },
    ];

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-background/95 backdrop-blur-[48px] border border-primary/20 rounded-2xl p-4 shadow-4xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary/[0.03] pointer-events-none" />
                    <p className="text-[10px] font-black text-primary uppercase  mb-4 relative z-10">{payload[0].payload.day}_SIGNAL</p>
                    <div className="flex items-baseline gap-3 relative z-10">
                        <p className="text-sm font-black text-foreground tabular-nums tracking-tighter uppercase leading-none">{payload[0].value.toLocaleString()}</p>
                        <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">GNF</span>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <DashboardLayout title="Tableau de Bord Vendeur" noPadding>
            <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-8 space-y-8 custom-scrollbar">

                {/* Executive Welcome Station — Signal Header */}
                <div className="premium-card p-6 relative overflow-hidden group/header">
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="size-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10 transition-all duration-700 group-hover:rotate-12 shadow-sm">
                                <Store className="size-6" />
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                    Bonjour, <span className="text-primary">{user?.nom_complet?.split(' ')[0] || 'Partenaire'}</span>
                                </h2>
                                <div className="flex items-center gap-2">
                                    <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                        Terminal: {store?.nom_boutique?.toUpperCase() || "MA BOUTIQUE"}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                             {store ? (
                                <button
                                    id="btn-add-product"
                                    onClick={() => navigate('/vendor/products/add')}
                                    className="h-11 px-8 bg-slate-900 text-white hover:bg-slate-800 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-slate-200 flex items-center gap-3 group/btn border-none"
                                >
                                    <Plus className="size-4 transition-transform group-hover/btn:rotate-90" />
                                    <span>Ajouter Article</span>
                                </button>
                            ) : (
                                <button
                                    id="btn-config-store"
                                    onClick={() => navigate('/vendor/store')}
                                    className="h-11 px-8 bg-primary text-white hover:bg-primary/90 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-primary/20 flex items-center gap-3 border-none"
                                >
                                    <Store className="size-4" />
                                    <span>Configurer Boutique</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {isLoading ? (
                        [1, 2, 3, 4].map(i => <div key={i} className="h-32 premium-card animate-pulse" />)
                    ) : (
                        kpis.map((kpi, idx) => (
                            <div key={idx} className="premium-card p-6 flex flex-col justify-between group/kpi h-32">
                                <div className="flex items-center justify-between">
                                    <div className="size-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover/kpi:scale-110 transition-transform duration-500">
                                        <kpi.icon className="size-5" />
                                    </div>
                                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-lg">↑ {kpi.trendValue}</span>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{kpi.title}</p>
                                    <p className="text-xl font-black text-slate-900 tracking-tighter tabular-nums" style={{ fontFamily: "'Outfit', sans-serif" }}>{kpi.value.split(' ')[0]} <small className="text-xs opacity-50">{kpi.value.split(' ')[1] || ''}</small></p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Analytics Central — Multi-Node Interface */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">

                    <div className="lg:col-span-8 space-y-6">
                        {/* Transaction Trend — Alpha Signal Deck */}
                        <div className="premium-card h-fit overflow-hidden group/chart">
                            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover/chart:rotate-12 transition-all duration-500">
                                        <TrendingUp className="size-5" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-xs font-black uppercase tracking-tight text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>Moniteur de Flux</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">30 Derniers Jours</p>
                                    </div>
                                </div>
                                <div className="px-4 py-2 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100">
                                    Status: Optimal
                                </div>
                            </div>

                            <div className="flex-1 relative z-10 w-full p-4 min-h-[240px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={statsData?.timeseries || []}>
                                        <defs>
                                            <linearGradient id="colorRevenues" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.02)" />
                                        <XAxis dataKey="day" hide />
                                        <YAxis hide />
                                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--primary)', strokeWidth: 2, strokeDasharray: '8 8' }} />
                                        <Area type="monotone" dataKey="val" stroke="var(--primary)" strokeWidth={10} fillOpacity={1} fill="url(#colorRevenues)" animationDuration={4000} strokeLinecap="round" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="p-6 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-sm transition-all duration-700">
                                        <Activity className="size-5" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Tendance IA</p>
                                        <p className="text-xs font-black text-slate-900 uppercase">"{statsData?.global_trend?.toUpperCase() || "Tendance Stable"}"</p>
                                    </div>
                                </div>
                                <Link to="/vendor/products" className="h-10 px-6 rounded-xl bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all flex items-center gap-3 group/link shadow-sm">
                                     Voir Produits
                                     <ArrowRight className="size-4 group-hover/link:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>

                        {/* Recent Order Ledger — Signal Registry */}
                        <div className="premium-card overflow-hidden group/ledger">
                            <DataTable
                                title="Commandes Récentes"
                                columns={orderColumns}
                                data={recentOrders}
                                className="border-0 bg-transparent"
                                actions={<Link className="text-[10px] font-black text-primary uppercase tracking-widest hover:text-slate-900 transition-all px-6 py-4 flex items-center gap-2" to="/vendor/orders">Tout Voir <ChevronRight className="size-3" /></Link>}
                            />
                        </div>
                    </div>

                    <div className="lg:col-span-4 flex flex-col gap-3">
                        {/* Supply Resilience — Alpha Node Watch */}
                        <div className="premium-card p-6 flex flex-col h-fit group/supply relative overflow-hidden">
                            <div className="flex items-start justify-between mb-8">
                                <div className="space-y-1">
                                    <h3 className="text-xs font-black uppercase tracking-tight text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>Résilience Stock</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Analyse de Disponibilité</p>
                                </div>
                                <div className="size-2 rounded-full bg-blue-500 animate-pulse shadow-glow shadow-blue-500/50" />
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                                        <span className="text-slate-400">Disponibilité</span>
                                        <span className="text-slate-900">{productsCount > 0 ? Math.round(((productsCount - lowStockItems) / productsCount) * 100) : 0}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${productsCount > 0 ? ((productsCount - lowStockItems) / productsCount) * 100 : 0}%` }}
                                            transition={{ duration: 2, ease: "easeOut" }}
                                            className="h-full bg-emerald-500 rounded-full" 
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                                        <span className="text-slate-400">Alerte Stock</span>
                                        <span className="text-amber-500">{productsCount > 0 ? Math.round((lowStockItems / productsCount) * 100) : 0}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${productsCount > 0 ? (lowStockItems / productsCount) * 100 : 0}%` }}
                                            transition={{ duration: 2, delay: 0.2, ease: "easeOut" }}
                                            className="h-full bg-amber-500 rounded-full" 
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                id="btn-ia-audit"
                                onClick={handleAudit}
                                disabled={isAuditing}
                                className={cn(
                                    "w-full h-11 mt-8 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3 shadow-sm group/btn",
                                    isAuditing ? "bg-slate-50 text-slate-300 cursor-not-allowed" : "bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-200"
                                )}
                            >
                                {isAuditing ? (
                                    <RefreshCcw className="size-4 animate-spin" />
                                ) : (
                                    <>
                                        <Satellite className="size-4 group-hover/btn:rotate-180 transition-transform duration-1000" />
                                        <span>Lancer Audit IA</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Trust Node Monitor — Elite Clearance */}
                        <div className="premium-card p-6 flex flex-col justify-between flex-1 group/trust relative overflow-hidden">
                            <div className="space-y-6 relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 border border-emerald-100 group-hover/trust:rotate-12 transition-all duration-700">
                                        <ShieldCheck className="size-5" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-xs font-black uppercase tracking-tight text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>Score Confiance</h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Certification Vendeur</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                                        <span className="text-slate-400">Intégrité</span>
                                        <span className="text-primary font-black italic">{trustData?.percentage || user?.score_confiance || 98.2}%</span>
                                    </div>
                                    <div className="h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${trustData?.percentage || user?.score_confiance || 98.2}%` }}
                                            transition={{ duration: 2, ease: "easeOut" }}
                                            className="h-full bg-primary rounded-full shadow-glow shadow-primary/20" 
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 py-3 px-4 bg-emerald-50 text-[10px] font-black text-emerald-600 uppercase tracking-widest rounded-xl text-center border border-emerald-100">
                                Terminal Sécurisé
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
};

export default VendorDashboard;
