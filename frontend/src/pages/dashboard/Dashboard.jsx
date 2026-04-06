import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DashboardCard from '../../components/ui/DashboardCard';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import { Wallet, ShoppingBag, Star, Activity, ArrowRight, Shield, Package, Zap, ChevronRight, Sparkles } from 'lucide-react';
import { CardSkeleton, TableRowSkeleton } from '../../components/ui/Loader';
import { useAuth } from '../../hooks/useAuth';
import orderService from '../../services/orderService';
import productService from '../../services/productService';
import { Link, useNavigate } from 'react-router-dom';
import walletService from '../../services/walletService';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const orderColumns = [
    { key: 'numero_commande', label: 'RÉFÉRENCE', render: (val) => <span className="font-black text-[9px] uppercase tracking-widest text-muted-foreground/80">{val || '—'}</span> },
    { key: 'montant_total', label: 'VALEUR FLUX', render: (val) => <span className="font-black text-[12px] text-slate-900 dark:text-foreground tabular-nums tracking-tighter">{parseFloat(val || 0).toLocaleString('fr-GN')} <span className="text-[9px] text-[#FF6600]">GNF</span></span> },
    { key: 'statut', label: 'CANAL STATUT', render: (val) => <StatusBadge status={val} className="text-[8px] font-black uppercase tracking-widest border border-slate-100 dark:border-foreground/5 py-1 px-3" /> },
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
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [orders, setOrders] = useState([]);
    const [totalOrders, setTotalOrders] = useState(0);
    const [quickProducts, setQuickProducts] = useState([]);
    const [wallet, setWallet] = useState(null);
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [ordersData, productsData, walletData] = await Promise.all([
                    orderService.getMyOrders(),
                    productService.getAll(),
                    walletService.getMyWallet()
                ]);

                const fetchedOrders = ordersData.orders || [];
                setOrders(fetchedOrders);
                setTotalOrders(ordersData.total || 0);
                setQuickProducts(productsData.slice(0, 4));
                setWallet(walletData);

                processOrdersForChart(fetchedOrders);
                setHasError(false);
            } catch (err) {
                console.error("Erreur chargement dashboard:", err);
                setHasError(true);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

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
                activity[dayName] += parseFloat(order.montant_total || 0);
            }
        });

        const formattedData = Object.keys(activity).map(key => ({
            jour: key,
            montant: activity[key]
        }));

        setChartData(formattedData);
    };

    const stats = [
        { title: 'PORTEFEUILLE', value: wallet ? `${parseFloat(wallet.solde_virtuel).toLocaleString('fr-GN')} GNF` : '0 GNF', icon: Wallet, trend: 'up', trendValue: 'RÉEL', description: 'FONDS DISPONIBLES EN SÉQUESTRE BCA' },
        { title: 'COMMANDES', value: totalOrders.toString(), icon: ShoppingBag, trend: 'up', trendValue: `${orders.length > 0 ? 'ACTIF' : 'N/A'}`, description: 'HISTORIQUE TRANSACTIONNEL VÉRIFIÉ' },
        { title: 'POINTS FIDÉLITÉ', value: user?.points_fidelite || '0', icon: Star, trend: 'up', trendValue: 'PRÉMIUM', description: 'STATUT DE GOUVERNANCE PRIVILÈGE' },
    ];

    return (
        <DashboardLayout title="CONSOLE UTILISATEUR">
            <div className="space-y-4 animate-in fade-in duration-700 pb-24">

                {/* Compact Command Bar */}
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 bg-white dark:bg-[#0F1219] p-4 rounded-2xl border border-slate-200 dark:border-foreground/5 shadow-sm overflow-hidden relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#FF6600]/[0.01] to-transparent pointer-events-none" />
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="size-6 rounded-xl bg-[#FF6600]/10 flex items-center justify-center text-[#FF6600] border border-[#FF6600]/5 group-hover:rotate-6 transition-transform">
                            <Zap className="size-6 shadow-sm" />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-sm font-black text-slate-900 dark:text-foreground uppercase tracking-tight leading-none pt-0.5">
                                BIENVENUE, <span className="text-[#FF6600]">{user?.nom_complet?.split(' ')[0] || 'MEMBRE'}</span>.
                            </h2>
                            <p className="text-[9px] font-black text-muted-foreground/80 uppercase tracking-widest opacity-80 decoration-[#FF6600]/20 underline underline-offset-4">
                                {user?.role?.toUpperCase() || 'MEMBRE'} — SYNC RÉSEAU : {new Date().toLocaleTimeString('fr-GN', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 relative z-10">
                        <button
                            onClick={() => navigate('/profile')}
                            className="h-10 px-6 bg-slate-900 dark:bg-white text-foreground dark:text-slate-900 hover:bg-[#FF6600] hover:text-foreground rounded-xl font-black text-[9px] uppercase tracking-widest transition-all shadow-md active:scale-95 flex items-center gap-3 group/btn"
                        >
                            <span>MON PROFIL</span>
                            <ArrowRight className="size-4 group-hover/btn:translate-x-1 transition-transform" />
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
                                    <p className="text-[9px] font-black text-muted-foreground/80 uppercase tracking-widest pt-1 leading-none">CONFIANCE RÉSEAU</p>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-black text-slate-900 dark:text-foreground uppercase tracking-tight">ELITE A++</span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4 relative z-10">
                                <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
                                    <span className="text-muted-foreground/80">INTÉGRITÉ NODALE</span>
                                    <span className="text-[#FF6600]">92.8%</span>
                                </div>
                                <div className="h-2.5 bg-slate-50 dark:bg-foreground/5 rounded-full overflow-hidden border border-slate-100 dark:border-foreground/10 p-0.5">
                                    <div className="bg-[#FF6600] h-full w-[92.8%] rounded-full shadow-[0_0_10px_rgba(255,102,0,0.4)]"></div>
                                </div>
                                <p className="text-[7px] font-black text-muted-foreground/80 uppercase tracking-widest text-center">SYSTÈME OPTIMAL — AUCUN RISQUE DÉTECTÉ</p>
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
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {isLoading ? [1, 2, 3, 4].map(i => <TableRowSkeleton key={i} />) : quickProducts.map((product, idx) => (
                            <Link to={`/product/${product.id}`} key={idx} className="bg-white dark:bg-[#0F1219] border border-slate-200 dark:border-foreground/5 p-4 rounded-2xl flex flex-col gap-3 hover:border-[#FF6600]/20 transition-all group shadow-sm">
                                <div className="aspect-square rounded-xl bg-slate-50 dark:bg-white/[0.03] overflow-hidden flex-shrink-0 relative border border-slate-100 dark:border-foreground/5">
                                    <img src={product.images?.[0]?.url_image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-all duration-[2s]" />
                                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
                                    <div className="absolute bottom-4 left-4 flex items-center gap-2">
                                        <div className="size-1.5 rounded-full bg-[#FF6600] animate-pulse" />
                                        <span className="text-[8px] font-black text-foreground uppercase tracking-widest pt-0.5">INDEXÉ</span>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-slate-800 dark:text-foreground uppercase tracking-tight line-clamp-1 group-hover:text-[#FF6600] transition-colors">{product.nom_produit}</h4>
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-black text-[#FF6600] tracking-tighter tabular-nums">{parseFloat(product.prix_unitaire).toLocaleString()} <span className="text-[8px] text-muted-foreground/80">GNF</span></p>
                                        <div className="size-6 rounded-lg bg-slate-50 dark:bg-foreground/5 flex items-center justify-center text-muted-foreground/80 group-hover:bg-[#FF6600] group-hover:text-foreground transition-all shadow-sm">
                                            <ArrowRight className="size-4" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    <div className="bg-white dark:bg-[#0F1219] border border-slate-200 dark:border-foreground/5 rounded-2xl shadow-sm overflow-hidden mt-12">
                         <div className="p-4 border-b border-slate-100 dark:border-foreground/5 bg-slate-50/20 dark:bg-white/[0.01]">
                             <DataTable
                                title="REGISTRE TRANSACTIONNEL"
                                columns={orderColumns}
                                data={orders.slice(0, 5)}
                                className="border-0 bg-transparent"
                                actions={<Link className="text-[9px] font-black text-[#FF6600] uppercase tracking-widest flex items-center gap-2" to="/orders">HISTORIQUE COMPLET <ChevronRight className="size-4" /></Link>}
                            />
                         </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Dashboard;
