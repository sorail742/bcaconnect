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
    Globe
} from 'lucide-react';
import { CardSkeleton, TableRowSkeleton } from '../../components/ui/Loader';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';
import storeService from '../../services/storeService';
import orderService from '../../services/orderService';
import statService from '../../services/statService';
import { cn } from '../../lib/utils';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const VendorDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [store, setStore] = useState(null);
    const [orders, setOrders] = useState([]);
    const [totalOrders, setTotalOrders] = useState(0);
    const [vendorStats, setVendorStats] = useState(null);
    const [isAuditing, setIsAuditing] = useState(false);

    const fetchDashboardData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [storeData, orderData, statsData] = await Promise.all([
                storeService.getMyStore(),
                orderService.getVendorOrders(),
                statService.getVendorStats()
            ]);
            setStore(storeData);
            setOrders(orderData.orders || []);
            setTotalOrders(orderData.total || 0);
            setVendorStats(statsData);
        } catch (error) {
            console.error("ERREUR_SYSTÈME_TERMINAL:", error);
            setHasError(true);
            toast.error("ÉCHEC DE LA CONNEXION AU NOEUD VENDEUR.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const pendingOrders = orders.filter(o => o.statut === 'en_attente').length;
    const lowStockItems = store?.produits?.filter(p => p.stock_quantite < 10).length || 0;
    const totalRevenue = orders.reduce((acc, order) => acc + (parseFloat(order.prix_unitaire_achat) * order.quantite), 0);
    const productsCount = store?.produits?.length || 0;

    const kpis = [
        { title: "FLUX_REVENUS", value: `${totalRevenue.toLocaleString('fr-GN')} GNF`, trend: 'up', trendValue: '+12.4%_SIG', icon: CreditCard, color: 'primary' },
        { title: 'UNITÉS_TRANSACTÉES', value: totalOrders.toString(), trend: 'up', trendValue: pendingOrders > 0 ? `${pendingOrders}_PENDING` : 'OPTIMAL_CORE', icon: ShoppingBasket, color: 'emerald-500' },
        { title: 'INVENTAIRE_ACTIF', value: productsCount.toString(), trend: 'up', trendValue: lowStockItems > 0 ? `${lowStockItems}_LOW_STOCK` : 'STOCK_NOMINAL', icon: Package, color: 'amber-500' },
        { title: 'TRUST_SCORE_ALPHA', value: user?.score_confiance ? `${user.score_confiance}%` : '100%', trend: 'up', trendValue: 'ELITE_VENDOR', icon: ShieldCheck, color: 'primary' },
    ];

    const recentOrders = orders.slice(0, 5).map(item => ({
        id: `#ORD-${item.commande_id.slice(0, 8).toUpperCase()}`,
        time: new Date(item.createdAt).toLocaleDateString('fr-GN'),
        amount: `${(item.prix_unitaire_achat * item.quantite).toLocaleString('fr-GN')} GNF`,
        status: item.statut === 'payé' ? 'Payé' : item.statut === 'en_attente' ? 'En attente' : 'Terminé'
    }));

    const handleAudit = () => {
        setIsAuditing(true);
        toast.info("INITIATION_AUDIT_ALPHA_IA...");
        setTimeout(() => {
            setIsAuditing(false);
            toast.success("AUDIT_SCELLÉ_TERMINÉ.");
        }, 2000);
    };

    const orderColumns = [
        { 
            label: 'ID_RÉFÉRENCE', 
            render: (row) => (
                <div className="flex items-center gap-4 py-3">
                    <div className="size-2 rounded-full bg-primary/40" />
                    <span className="text-[10px] font-black uppercase text-muted-foreground ">{row.id}</span>
                </div>
            ) 
        },
        { 
            label: 'VOLUME_VALEUR', 
            render: (row) => (
                <div className="flex items-baseline gap-2">
                    <span className="font-black text-[13px] text-foreground tabular-nums tracking-tighter uppercase">{row.amount.split(' ')[0]}</span>
                    <span className="text-[9px] font-black text-primary uppercase tracking-widest">{row.amount.split(' ')[1]}</span>
                </div>
            ) 
        },
        { 
            label: 'STATUT_FLUX', 
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
        <DashboardLayout title="TERMINAL_OPÉRATIONNEL_VEND">
            <div className="space-y-4 pb-40 animate-in pb-16">

                {/* Executive Welcome Station — Signal Header */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="executive-card !p-4 group overflow-visible relative"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.05] to-transparent pointer-events-none" />
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="size-6 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-2xl transition-all duration-1000 group-hover:rotate-6 group-hover:scale-105  overflow-hidden relative">
                                <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-5 transition-opacity" />
                                <Store className="size-6 drop-shadow-xl" />
                            </div>
                            <div className="space-y-3.5 text-left">
                                <h2 className="text-sm font-black text-foreground uppercase tracking-tighter leading-none pt-0.5" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                    BONJOUR, <span className="text-primary italic">{user?.nom_complet?.split(' ')[0] || 'PARTENAIRE'}.</span>
                                </h2>
                                <div className="flex items-center gap-4">
                                     <div className="size-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_#10b981]" />
                                     <p className="text-[10px] font-black text-muted-foreground uppercase  opacity-80 pt-0.5" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                        NODE: {store?.nom_boutique?.toUpperCase() || "BCA_ALPHA_HUB"} — SID: {(store?.id || 'LOCAL').slice(0, 8).toUpperCase()} — V6.1.4
                                     </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 relative z-10">
                             {store ? (
                                <button
                                    id="btn-add-product"
                                    onClick={() => navigate('/vendor/products/add')}
                                    className="h-11 px-6 bg-white text-background hover:bg-primary hover:text-foreground rounded-[1.8rem] font-medium text-sm text-muted-foreground transition-all shadow-2xl  flex items-center gap-3 group/btn border-0"
                                >
                                    <Plus className="size-5 transition-transform group-hover/btn:rotate-90 group-hover/btn:scale-125" />
                                    <span>INDEXER_NOUVEL_ACTIF</span>
                                </button>
                            ) : (
                                <button
                                    id="btn-config-store"
                                    onClick={() => navigate('/vendor/store')}
                                    className="h-11 px-6 bg-primary text-foreground hover:bg-white hover:text-background rounded-[1.8rem] font-medium text-sm text-muted-foreground transition-all shadow-2xl  flex items-center gap-3 border-0 group/btn"
                                >
                                    <Store className="size-5 transition-transform group-hover/btn:scale-110" />
                                    <span>DÉPLOIEMENT_TERMINAL</span>
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* KPI Matrix — High Density Hub */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {isLoading ? (
                        [1, 2, 3, 4].map(i => <div key={i} className="h-44 executive-card animate-pulse" />)
                    ) : (
                        kpis.map((kpi, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <DashboardCard
                                    title={kpi.title}
                                    value={kpi.value}
                                    icon={kpi.icon}
                                    trend={kpi.trend}
                                    trendValue={kpi.trendValue}
                                />
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Analytics Central — Multi-Node Interface */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">

                    <div className="lg:col-span-8 flex flex-col gap-3">
                        {/* Transaction Trend — Alpha Signal Deck */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="executive-card !p-0 flex flex-col relative overflow-hidden group/chart border-l-4 border-l-primary"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.01] to-transparent pointer-events-none" />
                            <div className="p-4 border-b border-white/[0.03] bg-white/[0.01] flex flex-col xl:flex-row xl:items-center justify-between gap-3 relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="size-6 rounded-[1.8rem] bg-white/[0.03] flex items-center justify-center text-primary border border-foreground/10 group-hover/chart:rotate-12 transition-all duration-1000 shadow-inner group-hover:scale-110 ">
                                        <TrendingUp className="size-6" />
                                    </div>
                                    <div className="space-y-3 text-left">
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">MONITEUR FLUX</p>
                                        <p className="text-[10px] text-muted-foreground">Algorithme prédictif — 30 derniers jours</p>
                                    </div>
                                </div>
                                <div className="px-8 py-3 bg-primary/10 text-primary border border-primary/20 rounded-2xl text-[10px] font-black uppercase  shadow-inner backdrop-blur-3xl">SIGNAL_STATUS : OPTIMAL_CORE</div>
                            </div>

                            <div className="flex-1 relative z-10 w-full p-4 min-h-[240px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={vendorStats?.timeseries || []}>
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

                            <div className="p-4 bg-white/[0.01] border-t border-white/[0.03] relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="size-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 animate-pulse transition-all duration-700">
                                        <Activity className="size-6" />
                                    </div>
                                    <div className="space-y-2 text-left">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase  leading-none mb-1">AUDIT_TENDANCE_IA</p>
                                        <p className="text-[13px] text-foreground font-black uppercase tracking-tight italic opacity-90 transition-all group-hover/chart:translate-x-2">"{vendorStats?.global_trend?.toUpperCase() || "FORCE_EXPANSIONNELLE_DÉTERMINÉE_SYNAPSE"}"</p>
                                    </div>
                                </div>
                                <Link to="/vendor/products" className="h-12 px-10 rounded-2xl bg-white/[0.03] border border-foreground/5 text-[10px] font-black uppercase  text-muted-foreground/80 hover:text-foreground hover:bg-white/[0.05] transition-all flex items-center gap-4 ">
                                     EXPAND_DATA <ArrowRight className="size-5" />
                                </Link>
                            </div>
                        </motion.div>

                        {/* Recent Order Ledger — Signal Registry */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="executive-card !p-0 overflow-hidden shadow-4xl group/ledger border-t-8 border-t-white relative group "
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none" />
                            <DataTable
                                title="REGISTRE_FLUX_DÉLIVRANCE"
                                columns={orderColumns}
                                data={recentOrders}
                                className="border-0 bg-transparent text-foreground"
                                actions={<Link className="text-[10px] font-black text-primary uppercase  hover:text-foreground transition-all underline underline-offset-[12px] decoration-4 decoration-primary/20 hover:decoration-primary/60 pb-4 pr-10" to="/vendor/orders">HUB_HISTORIQUE_FLUX_ALPHA</Link>}
                            />
                        </motion.div>
                    </div>

                    <div className="lg:col-span-4 flex flex-col gap-3">
                        {/* Supply Resilience — Alpha Node Watch */}
                        <motion.div 
                             initial={{ opacity: 0, x: 20 }}
                             animate={{ opacity: 1, x: 0 }}
                             className="executive-card !p-4 flex flex-col h-auto relative overflow-hidden group/supply"
                        >
                            <div className="absolute top-0 right-0 size-60 bg-primary/10 rounded-full blur-[120px] -mr-40 -mt-40 transition-transform duration-[6s] group-hover/supply:scale-150 pointer-events-none" />

                            <div className="flex items-start justify-between mb-16 relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="size-4 rounded-full bg-blue-500 animate-pulse shadow-[0_0_20px_#3b82f6]" />
                                    <div className="space-y-2 text-left">
                                        <h3 className="text-sm font-black text-foreground uppercase tracking-tighter leading-none pt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>RÉSILIENCE_SOLVABILITÉ</h3>
                                        <p className="text-[10px] font-black text-muted-foreground uppercase ">RATIO_STABILITÉ_STOCK_ALPHA</p>
                                    </div>
                                </div>
                                <button id="navigate-inventory" onClick={() => navigate('/vendor/products')} className="size-6 rounded-2xl bg-white/[0.03] border border-foreground/5 flex items-center justify-center text-muted-foreground hover:text-primary transition-all ">
                                     <LineChart className="size-5" />
                                </button>
                            </div>

                            <div className="space-y-4 relative z-10 px-4">
                                <div className="space-y-6">
                                    <div className="flex justify-between text-[10px] font-black uppercase ">
                                        <span className="text-muted-foreground">INDICE_DISPONIBILITÉ</span>
                                        <span className="text-primary font-black">{productsCount > 0 ? Math.round(((productsCount - lowStockItems) / productsCount) * 100) : 0}%_SIG</span>
                                    </div>
                                    <div className="h-5 bg-background rounded-full overflow-hidden border border-white/[0.03] p-1.5 shadow-inner ring-4 ring-white/[0.01]">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${productsCount > 0 ? ((productsCount - lowStockItems) / productsCount) * 100 : 0}%` }}
                                            transition={{ duration: 3, ease: "easeOut" }}
                                            className="h-full bg-emerald-500 rounded-full shadow-[0_0_20px_#10b981]" 
                                        />
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="flex justify-between text-[10px] font-black uppercase ">
                                        <span className="text-muted-foreground">ALERTE_STOCK_BRÈCHE</span>
                                        <span className="text-amber-500 font-black">{productsCount > 0 ? Math.round((lowStockItems / productsCount) * 100) : 0}%_NODE</span>
                                    </div>
                                    <div className="h-5 bg-background rounded-full overflow-hidden border border-white/[0.03] p-1.5 shadow-inner ring-4 ring-white/[0.01]">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${productsCount > 0 ? (lowStockItems / productsCount) * 100 : 0}%` }}
                                            transition={{ duration: 3, delay: 0.5, ease: "easeOut" }}
                                            className="h-full bg-amber-500 rounded-full shadow-[0_0_20px_#f59e0b]" 
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                id="btn-ia-audit"
                                onClick={handleAudit}
                                disabled={isAuditing}
                                className={cn(
                                    "w-full h-12 mt-16 rounded-2xl text-[12px] font-black uppercase  transition-all duration-1000 border-0 relative z-10 flex items-center justify-center gap-3 shadow-4xl  group/btn",
                                    isAuditing ? "bg-white/[0.02] text-slate-700 cursor-not-allowed" : "bg-white text-background hover:bg-primary hover:text-foreground shadow-2xl"
                                )}
                            >
                                {isAuditing ? (
                                    <> <RefreshCcw className="size-6 animate-spin" /> </>
                                ) : (
                                    <> <Satellite className="size-6 group-hover/btn:rotate-180 transition-transform duration-[3s]" /> <span>INITIER_AUDIT_ALPHA</span></>
                                )}
                            </button>
                        </motion.div>

                         {/* Trust Node Monitor — Elite Clearance */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="executive-card !p-4 flex flex-col justify-between flex-1 shadow-4xl relative overflow-hidden group/trust border-t-8 border-t-emerald-500/20 "
                        >
                           <div className="absolute bottom-0 left-0 size-66 bg-emerald-500/5 rounded-full blur-[140px] -ml-48 -mb-24 group-hover/trust:bg-primary/5 transition-all duration-[5s] pointer-events-none" />

                           <div className="space-y-4 relative z-10">
                               <div className="flex items-center gap-3 text-left">
                                    <div className="size-6 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-inner border border-emerald-500/20 group-hover/trust:rotate-12 transition-all duration-1000 group-hover:scale-110">
                                        <ShieldCheck className="size-11" />
                                    </div>
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-black tracking-tighter uppercase leading-none text-foreground" style={{ fontFamily: "'Outfit', sans-serif" }}>CONFIANCE_ÉLITE</h4>
                                        <div className="flex items-center gap-3">
                                             <Globe className="size-3 text-slate-700" />
                                             <p className="text-[10px] font-black text-muted-foreground uppercase  leading-none">ALPHA_NETWORK_ACCR_LVL_5</p>
                                        </div>
                                    </div>
                               </div>

                               <div className="space-y-6">
                                   <div className="flex items-center justify-between text-[12px] font-black uppercase ">
                                        <span className="text-slate-600">SCORE_INTÉGRITÉ_ALPHA</span>
                                        <span className="text-primary  italic shadow-orange-500/20">98.2%_SCL</span>
                                   </div>
                                   <div className="h-8 bg-background rounded-full overflow-hidden border border-white/[0.03] p-2 shadow-inner ring-8 ring-emerald-500/[0.02]">
                                       <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: '98.2%' }}
                                            transition={{ duration: 4, ease: [0.16, 1, 0.3, 1] }}
                                            className="h-full bg-gradient-to-r from-emerald-500 via-primary to-emerald-500 rounded-full shadow-[0_0_40px_rgba(16,185,129,0.4)] animate-pulse" 
                                        />
                                   </div>
                               </div>
                           </div>

                           <div className="mt-20 text-[12px] font-black text-emerald-500 uppercase  bg-emerald-500/5 p-4 rounded-2xl text-center border border-emerald-500/20 relative z-10 shadow-2xl group-hover/trust:border-emerald-500/40 transition-all duration-700 ">
                               TERMINAL_ALPHA_SÉCURISÉ — COMPTE_EN_RÈGLE_V6
                           </div>
                        </motion.div>
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
};

export default VendorDashboard;
