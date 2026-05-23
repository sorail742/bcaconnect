import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DashboardCard from '../../components/ui/DashboardCard';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import { Wallet, ShoppingBag, Star, Activity, ArrowRight, Shield, Package, Zap, ChevronRight, Sparkles } from 'lucide-react';
import ProductCard from '../../components/produits/ProductCard';
import { CardSkeleton, TableRowSkeleton, ProductSkeleton } from '../../components/ui/Loader';
import { useAuth } from '../../hooks/useAuth';
import orderService from '../../services/orderService';
import productService from '../../services/productService';
import { Link, useNavigate } from 'react-router-dom';
import walletService from '../../services/walletService';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useOrders, useProducts, useWallet } from '../../hooks/useDomainData';
import { useAIScore } from '../../hooks/useAIScore';
import { getImageUrl } from '../../lib/utils';

const FALLBACK = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?auto=format&fit=crop&q=80&w=600';

const orderColumns = [
    { key: 'id', label: 'RÉFÉRENCE', render: (row) => <span className="font-black text-[9px] uppercase tracking-widest text-[#FF6600]">#{row.id && typeof row.id === 'string' ? row.id.slice(0, 8).toUpperCase() : (row.id || '—')}</span> },
    { key: 'total_ttc', label: 'VALEUR FLUX', render: (row) => <span className="font-black text-[12px] text-slate-900 dark:text-foreground tabular-nums tracking-tighter">{parseFloat(row.total_ttc || 0).toLocaleString('fr-GN')} <span className="text-[9px] text-[#FF6600]">GNF</span></span> },
    { key: 'statut', label: 'CANAL STATUT', render: (row) => <StatusBadge status={row.statut} className="text-[8px] font-black uppercase tracking-widest border border-slate-100 dark:border-foreground/5 py-1 px-3" /> },
];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900 dark:bg-white border border-slate-800 dark:border-slate-200 rounded-xl p-4 shadow-2xl">
                <p className="text-[9px] font-black text-[#FF6600] uppercase tracking-widest mb-1">{label}</p>
                <p className="text-sm font-black text-foreground dark:text-slate-900 tabular-nums">
                    {parseFloat(payload[0].value).toLocaleString('fr-GN')} <span className="text-[8px] opacity-40">GNF</span>
                </p>
            </div>
        );
    }
    return null;
};

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    // Utilisation des nouveaux hooks restructurés
    const { data: ordersData, loading: ordersLoading, error: ordersError } = useOrders();
    const { data: products, loading: productsLoading } = useProducts();
    const { data: wallet, loading: walletLoading } = useWallet();
    const { scoreData, loading: scoreLoading } = useAIScore();

    const orders = ordersData?.orders || [];
    const totalOrders = ordersData?.total || 0;
    
    // Correction de la structure des produits (objet paginé ou tableau direct)
    const quickProducts = products?.products?.slice(0, 4) || (Array.isArray(products) ? products.slice(0, 4) : []);
    
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        if (orders.length > 0) {
            processOrdersForChart(orders);
        }
    }, [orders]);

    const isLoading = ordersLoading || productsLoading || walletLoading || scoreLoading;
    const hasError = !!ordersError;

    const processOrdersForChart = (ordersList) => {
        const days = ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'];
        const activity = {};

        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dayName = days[date.getDay()];
            activity[dayName] = 0;
        }

        ordersList.forEach(order => {
            const orderDate = new Date(order.createdAt);
            const dayName = days[orderDate.getDay()];
            if (activity.hasOwnProperty(dayName)) {
                activity[dayName] += parseFloat(order.total_ttc || 0);
            }
        });

        const formattedData = Object.keys(activity).map(key => ({
            jour: key,
            montant: activity[key]
        }));

        setChartData(formattedData);
    };

    const stats = [
        { 
            title: 'PORTEFEUILLE', 
            value: wallet ? `${parseFloat(wallet.solde_virtuel || 0).toLocaleString('fr-GN')} GNF` : '0 GNF', 
            icon: Wallet, 
            trend: 'up', 
            trendValue: 'RÉEL', 
            description: 'FONDS DISPONIBLES EN SÉQUESTRE BCA' 
        },
        { 
            title: 'COMMANDES', 
            value: totalOrders.toString(), 
            icon: ShoppingBag, 
            trend: 'up', 
            trendValue: `${orders.length > 0 ? 'ACTIF' : 'N/A'}`, 
            description: 'HISTORIQUE TRANSACTIONNEL VÉRIFIÉ' 
        },
        { 
            title: 'POINTS FIDÉLITÉ', 
            value: user?.points_fidelite || '0', 
            icon: Star, 
            trend: 'up', 
            trendValue: 'PRÉMIUM', 
            description: 'STATUT DE GOUVERNANCE PRIVILÈGE' 
        },
    ];

    return (
        <DashboardLayout title="CONSOLE UTILISATEUR">
            <div className="space-y-4 animate-in fade-in duration-700 pb-24">

                {/* Compact Command Bar — Modernized v2.7 */}
                <div className="sticky top-0 z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#FF6600]/[0.05] to-[#0F1219] p-5 rounded-3xl border border-slate-200 dark:border-foreground/5 shadow-xl shadow-black/[0.02] overflow-hidden relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#FF6600]/[0.03] to-transparent pointer-events-none" />
                    
                    <div className="flex items-center gap-5 relative z-10">
                        {/* Avatar / Icon Circle */}
                        <div className="relative">
                            {user?.avatar_url ? (
                                <img 
                                    src={user.avatar_url} 
                                    alt="" 
                                    className="size-14 rounded-2xl object-cover border-2 border-[#FF6600]/20 shadow-lg shadow-[#FF6600]/10 group-hover:scale-105 transition-transform" 
                                />
                            ) : (
                                <div className="size-14 rounded-2xl bg-gradient-to-br from-[#FF6600] to-orange-600 flex items-center justify-center text-white shadow-lg shadow-[#FF6600]/20 group-hover:rotate-3 transition-transform">
                                    <span className="text-xl font-black">{user?.nom_complet?.charAt(0) || 'B'}</span>
                                </div>
                            )}
                            <div className="absolute -bottom-1 -right-1 size-5 rounded-lg bg-emerald-500 border-4 border-white dark:border-[#0F1219] flex items-center justify-center">
                                <div className="size-1.5 rounded-full bg-white animate-pulse" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">
                                BIENVENUE, <span className="text-[#FF6600]">{user?.nom_complet || 'MEMBRE'}</span>
                            </h2>
                            <div className="flex items-center gap-3">
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Shield className="size-3 text-emerald-500" />
                                    {user?.role || 'CLIENT'} ACCRÉDITÉ
                                </p>
                                <span className="h-1 w-1 rounded-full bg-slate-300" />
                                <p className="text-[10px] font-black text-[#FF6600] uppercase tracking-widest animate-pulse">
                                    RÉSEAU ACTIF
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 relative z-10">
                        <button
                            onClick={() => navigate('/profile')}
                            className="h-12 px-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-[#FF6600] hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] transition-all shadow-xl shadow-black/10 active:scale-95 flex items-center gap-3 group/btn"
                        >
                            <span>MON PROFIL</span>
                            <div className="size-6 rounded-lg bg-white/10 dark:bg-slate-900/5 flex items-center justify-center group-hover/btn:translate-x-1 transition-all">
                                <ArrowRight className="size-4" />
                            </div>
                        </button>
                    </div>
                </div>

                {/* KPI Area — High Density */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {isLoading ? (
                        [1, 2, 3].map(i => <CardSkeleton key={i} />)
                    ) : (
                        stats.map((stat, idx) => (
                            <DashboardCard key={idx} {...stat} className="h-40" />
                        ))
                    )}
                </div>

                {/* Activity & Performance — Unified Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                    <div className="lg:col-span-8 bg-white dark:bg-[#0F1219] border border-slate-200 dark:border-foreground/5 rounded-2xl p-4 shadow-sm relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-10 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="size-6 rounded-xl bg-slate-50 dark:bg-foreground/5 flex items-center justify-center text-[#FF6600] border border-slate-100 dark:border-foreground/5 shadow-md">
                                    <Activity className="size-5" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-[10px] font-black text-slate-900 dark:text-foreground uppercase ">FLUX D'ACQUISITION</h3>
                                    <p className="text-[8px] font-black text-muted-foreground/80 uppercase tracking-widest">ACTIVITÉ 7 DERNIERS JOURS</p>
                                </div>
                            </div>
                        </div>

                        <div className="h-[280px] relative z-10 w-full mb-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#FF6600" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#FF6600" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="jour"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 8, fontWeight: 900, letterSpacing: '0.1em' }}
                                    />
                                    <YAxis hide />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="montant" stroke="#FF6600" strokeWidth={4} fillOpacity={1} fill="url(#colorAmount)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="lg:col-span-4 flex flex-col gap-3">
                        <div className="bg-white dark:bg-[#0F1219] border border-slate-200 dark:border-foreground/5 rounded-2xl p-4 space-y-6 shadow-sm relative overflow-hidden flex-1 group">
                            <div className="space-y-6 relative z-10">
                                <div className="size-6 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20 shadow-xl group-hover:rotate-6 transition-transform">
                                    <Shield className="size-6" />
                                </div>
                                <div className="space-y-3">
                                    <p className="text-[9px] font-black text-muted-foreground/80 uppercase tracking-widest pt-1 leading-none">ALPHA-BCA SCORE</p>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-black text-slate-900 dark:text-foreground uppercase tracking-tight">
                                            {scoreData?.metadata?.status || 'ANALYSE...'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4 relative z-10">
                                <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
                                    <span className="text-muted-foreground/80">SOLVABILITÉ IA</span>
                                    <span className="text-[#FF6600]">{scoreData?.score || 0}%</span>
                                </div>
                                <div className="h-2.5 bg-slate-50 dark:bg-foreground/5 rounded-full overflow-hidden border border-slate-100 dark:border-foreground/10 p-0.5">
                                    <div className="bg-[#FF6600] h-full rounded-full shadow-[0_0_10px_rgba(255,102,0,0.4)] transition-all duration-1000" style={{ width: `${scoreData?.score || 0}%` }}></div>
                                </div>
                                <div className="flex justify-between gap-1 pt-1">
                                    {scoreData?.breakdown && Object.entries(scoreData.breakdown).map(([k, v]) => (
                                        <div key={k} className="flex-1 h-1 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-[#FF6600]/40" style={{ width: `${v}%` }} />
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[7px] font-black text-muted-foreground/80 uppercase tracking-widest text-center">SYSTÈME ALPHA v2.6 — PRÉDICTIONS BASÉES SUR FLUX</p>
                            </div>
                        </div>

                        <Link to="/wallet" className="group/wallet">
                            <div className="bg-[#FF6600] p-4 rounded-2xl text-foreground shadow-xl shadow-[#FF6600]/20 hover:scale-[1.02] transition-all relative overflow-hidden">
                                <div className="flex items-center gap-3">
                                    <div className="size-6 rounded-xl bg-foreground/20 border border-foreground/20 flex items-center justify-center group-hover/wallet:rotate-12 transition-transform shadow-lg shrink-0">
                                        <Wallet className="size-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[8px] font-black text-foreground/60 uppercase tracking-widest leading-none">MON CAPITAL</p>
                                        <p className="text-sm font-black tracking-tighter uppercase leading-none">PORTEFEUILLE</p>
                                    </div>
                                    <ChevronRight className="size-6 ml-auto text-foreground/40 group-hover/wallet:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Discovery & Traceability — Marketplace Density */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-foreground/5 pb-6">
                        <div className="flex items-center gap-4">
                            <Sparkles className="size-5 text-[#FF6600]/60" />
                            <h3 className="text-[10px] font-black text-slate-900 dark:text-foreground uppercase  pt-0.5">RECOMMANDATIONS RÉSEAU</h3>
                        </div>
                        <Link to="/marketplace" className="text-[9px] font-black text-[#FF6600] hover:text-slate-900 dark:text-foreground transition-colors uppercase  flex items-center gap-2">ACCÉDER AU MARCHÉ <ArrowRight className="size-3" /></Link>
                    </div>
                    
                    <div className="bg-white dark:bg-[#0F1219] border border-slate-200 dark:border-foreground/5 rounded-2xl overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-white/[0.02]">
                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Aperçu</th>
                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Produit</th>
                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Catégorie</th>
                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Prix</th>
                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Stock</th>
                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Évaluation</th>
                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    [1, 2, 3, 4].map(i => (
                                        <tr key={i} className="animate-pulse border-b border-slate-50 dark:border-white/5">
                                            <td colSpan={7} className="p-8"><div className="h-8 bg-slate-100 dark:bg-white/5 rounded-xl w-full" /></td>
                                        </tr>
                                    ))
                                ) : quickProducts.length > 0 ? (
                                    quickProducts.map((product) => (
                                        <ProductCard 
                                            key={product.id} 
                                            product={product} 
                                            variant="row" 
                                        />
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="py-20 text-center opacity-30 text-[10px] font-black uppercase tracking-widest">Aucune recommandation disponible</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-white dark:bg-[#0F1219] border border-slate-200 dark:border-foreground/5 rounded-2xl shadow-sm overflow-hidden mt-12">
                         <div className="p-4 border-b border-slate-100 dark:border-foreground/5 bg-slate-50/20 dark:bg-white/[0.01]">
                             {isLoading ? (
                                 <div className="space-y-4">
                                     {[1, 2, 3].map(i => <TableRowSkeleton key={i} />)}
                                 </div>
                             ) : (
                                 <DataTable
                                    title="REGISTRE TRANSACTIONNEL"
                                    columns={orderColumns}
                                    data={orders.slice(0, 5)}
                                    className="border-0 bg-transparent"
                                    actions={<Link className="text-[9px] font-black text-[#FF6600] uppercase tracking-widest flex items-center gap-2" to="/orders">HISTORIQUE COMPLET <ChevronRight className="size-4" /></Link>}
                                />
                             )}
                         </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Dashboard;
