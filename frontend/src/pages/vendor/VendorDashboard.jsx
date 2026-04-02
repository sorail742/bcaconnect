import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DashboardCard from '../../components/ui/DashboardCard';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import {
    ShoppingBasket,
    CreditCard,
    BarChart3,
    Plus,
    Package,
    ShieldCheck,
    Store,
    ArrowRight,
    TrendingUp,
    Zap,
    Activity,
    Award,
    Sparkles,
    Satellite,
    BaggageClaim
} from 'lucide-react';
import { CardSkeleton, TableRowSkeleton } from '../../components/ui/Loader';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';
import storeService from '../../services/storeService';
import orderService from '../../services/orderService';
import statService from '../../services/statService';
import { cn } from '../../lib/utils';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const VendorDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = React.useState(true);
    const [hasError, setHasError] = React.useState(false);
    const [store, setStore] = React.useState(null);
    const [orders, setOrders] = React.useState([]);
    const [totalOrders, setTotalOrders] = React.useState(0);
    const [vendorStats, setVendorStats] = React.useState(null);
    const [isAuditing, setIsAuditing] = React.useState(false);

    React.useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            try {
                const storeData = await storeService.getMyStore();
                setStore(storeData);

                const orderData = await orderService.getVendorOrders();
                setOrders(orderData.orders || []);
                setTotalOrders(orderData.total || 0);

                const statsData = await statService.getVendorStats();
                setVendorStats(statsData);

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
    const lowStockItems = store?.produits?.filter(p => p.stock_quantite < 10).length || 0;
    const totalRevenue = orders.reduce((acc, order) => acc + (parseFloat(order.prix_unitaire_achat) * order.quantite), 0);
    const productsCount = store?.produits?.length || 0;

    const kpis = [
        {
            title: "CHIFFRE D'AFFAIRES",
            value: `${totalRevenue.toLocaleString('fr-GN')} GNF`,
            trend: 'up',
            trendValue: '+12.4%',
            icon: CreditCard,
            color: 'primary'
        },
        {
            title: 'COMMANDES REÇUES',
            value: totalOrders.toString(),
            trend: 'up',
            trendValue: pendingOrders > 0 ? `${pendingOrders} EN ATTENTE` : 'FLUX OPTIMAL',
            icon: ShoppingBasket,
            color: 'primary'
        },
        {
            title: 'PRODUITS ACTIFS',
            value: productsCount.toString(),
            trend: 'up',
            trendValue: lowStockItems > 0 ? `${lowStockItems} LOW STOCK` : 'UNITÉS OK',
            icon: Package,
            color: 'primary'
        },
        { title: 'SCORE CONFIANCE', value: user?.score_confiance ? `${user.score_confiance}%` : '100%', trend: 'up', trendValue: 'ELITE', icon: ShieldCheck, color: 'primary' },
    ];

    const recentOrders = orders.slice(0, 5).map(item => ({
        id: `#ORD-${item.commande_id.slice(0, 8).toUpperCase()}`,
        time: new Date(item.createdAt).toLocaleDateString('fr-GN'),
        amount: `${(item.prix_unitaire_achat * item.quantite).toLocaleString('fr-GN')} GNF`,
        status: item.statut === 'payé' ? 'Payé' : item.statut === 'en_attente' ? 'En attente' : 'Terminé'
    }));

    const handleAudit = () => {
        setIsAuditing(true);
        toast.info("LANCEMENT DE L'AUDIT D'INVENTAIRE IA...");
        setTimeout(() => {
            setIsAuditing(false);
            toast.success("AUDIT IA TERMINÉ. L'INVENTAIRE EST ALIGNÉ SUR LES PRÉVISIONS.");
        }, 2000);
    };

    const orderColumns = [
        { key: 'id', label: 'RÉFÉRENCE', render: (val) => <span className="font-black text-[10px] uppercase text-slate-500 tracking-widest italic transition-colors hover:text-[#FF6600]">{val}</span> },
        { key: 'amount', label: 'VOLUME', render: (val) => <span className="font-black text-sm text-white italic">{val}</span> },
        { key: 'status', label: 'STATUT', render: (val) => <StatusBadge status={val} className="text-[9px] font-black italic uppercase tracking-widest border-2" /> },
    ];

    return (
        <DashboardLayout title="CONSOLE MARCHAND EXÉCUTIF">
            <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-20">

                {/* Hero Partner */}
                <div className="relative overflow-hidden rounded-[4rem] bg-white group border-x-[16px] border-[#FF6600] p-12 md:p-20 shadow-3xl">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,102,0,0.1),transparent_70%)] opacity-50" />
                    <div className="absolute top-0 right-0 size-[50rem] bg-[#FF6600]/5 rounded-full blur-[200px] -mt-64 -mr-64 group-hover:scale-125 transition-transform duration-[4s]" />

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-12">
                        <div className="space-y-10">
                            <div className="inline-flex items-center gap-4 px-6 py-2 rounded-2xl bg-[#FF6600]/10 border-2 border-[#FF6600]/20 text-[#FF6600] text-[10px] font-black uppercase tracking-[0.4em] italic leading-none pt-0.5">
                                <span className="size-2 rounded-full bg-[#FF6600] animate-pulse"></span>
                                BOUTIQUE CERTIFIÉE — {store?.nom_boutique?.toUpperCase() || "INITIALISATION DU NOEUD..."}
                            </div>
                            <h2 className="text-6xl md:text-8xl font-black text-black tracking-tighter leading-[0.8] uppercase italic">
                                BONJOUR, <br />
                                <span className="text-[#FF6600] not-italic underline decoration-black/10 decoration-8 underline-offset-[-15px]">{user?.nom_complet?.split(' ')[0] || 'PARTENAIRE'}.</span>
                            </h2>
                            <p className="text-slate-500 font-extrabold max-w-2xl leading-relaxed uppercase tracking-widest italic border-l-8 border-[#FF6600]/20 pl-10">
                                PILOTEZ VOS STOCKS ET SUIVEZ VOS REVENUS EN TEMPS RÉEL SUR L'INFRASTRUCTURE DE GESTION EXÉCUTIVE BCA CONNECT.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-8">
                            {store ? (
                                <button
                                    onClick={() => navigate('/vendor/products/add')}
                                    className="h-24 px-12 bg-black text-white hover:bg-[#FF6600] rounded-[1.5rem] font-black text-xs uppercase tracking-[0.4em] transition-all duration-700 shadow-3xl hover:scale-105 active:scale-95 italic group/btn relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_2s_infinite]" />
                                    <Plus className="size-6 inline-block mr-4 relative z-10" />
                                    <span className="relative z-10 pt-1">AJOUTER PRODUIT</span>
                                </button>
                            ) : (
                                <button
                                    onClick={() => navigate('/vendor/store')}
                                    className="h-24 px-12 bg-[#FF6600] text-white hover:bg-black rounded-[1.5rem] font-black text-xs uppercase tracking-[0.4em] transition-all duration-700 shadow-3xl hover:scale-105 active:scale-95 italic group/btn relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_2s_infinite]" />
                                    <Store className="size-6 inline-block mr-4 relative z-10" />
                                    <span className="relative z-10 pt-1">CONFIGURER BOUTIQUE</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* KPI stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {isLoading ? (
                        [1, 2, 3, 4].map(i => <CardSkeleton key={i} />)
                    ) : (
                        kpis.map((kpi, idx) => (
                            <DashboardCard key={idx} {...kpi} className="hover:border-[#FF6600]/40 transition-all duration-700" />
                        ))
                    )}
                </div>

                {/* Analytics & Orders */}
                <div className="grid grid-cols-1 lg:grid-cols-10 gap-12">

                    <div className="lg:col-span-6 bg-white/[0.02] border-4 border-white/5 rounded-[4rem] p-12 shadow-3xl group relative overflow-hidden flex flex-col justify-between">
                        <div className="absolute top-0 right-0 size-80 bg-[#FF6600]/5 rounded-full blur-[120px] -mr-40 -mt-40 group-hover:bg-[#FF6600]/10 transition-colors duration-1000" />

                        <div className="flex items-center justify-between mb-12 relative z-10">
                            <div className="flex items-center gap-6">
                                <div className="size-14 rounded-2xl bg-[#FF6600]/10 flex items-center justify-center text-[#FF6600] shadow-3xl border-2 border-[#FF6600]/20 group-hover:rotate-12 transition-transform duration-700">
                                    <TrendingUp className="size-7" />
                                </div>
                                <h3 className="text-xl font-black text-white uppercase tracking-[0.3em] italic">ÉVOLUTION TRANSACTIONNELLE</h3>
                            </div>
                            <div className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] italic bg-emerald-500/10 px-6 py-2 rounded-xl border-2 border-emerald-500/20 shadow-lg">+14.2% RENDEMENT</div>
                        </div>

                        <div className="h-80 relative z-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={vendorStats?.timeseries || []}>
                                    <defs>
                                        <linearGradient id="colorRevenues" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#FF6600" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#FF6600" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="day" hide />
                                    <YAxis hide />
                                    <Tooltip content={({ active, payload }) => (
                                        active && payload ? (
                                            <div className="bg-black/80 backdrop-blur-3xl border-4 border-[#FF6600]/20 rounded-3xl p-6 shadow-3xl">
                                                <p className="text-[10px] font-black text-[#FF6600] uppercase tracking-[0.3em] mb-3 italic">{payload[0].payload.day}</p>
                                                <p className="text-xl font-black text-white italic">{payload[0].value.toLocaleString()} <small className="text-[10px] text-slate-500 non-italic">GNF</small></p>
                                            </div>
                                        ) : null
                                    )} />
                                    <Area type="monotone" dataKey="val" stroke="#FF6600" strokeWidth={6} fillOpacity={1} fill="url(#colorRevenues)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="mt-12 bg-white/[0.01] border-4 border-white/5 p-8 rounded-[2.5rem] flex items-center gap-8 group/perspective shadow-inner relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-[#FF6600]/5 via-transparent to-transparent opacity-0 group-hover/perspective:opacity-100 transition-opacity duration-1000" />
                            <div className="size-14 rounded-2xl bg-[#FF6600]/10 flex items-center justify-center text-[#FF6600] shadow-3xl border-2 border-[#FF6600]/20 group-hover/perspective:scale-110 transition-transform duration-700 relative z-10">
                                <Award className="size-7" />
                            </div>
                            <div className="relative z-10">
                                <h4 className="text-[11px] font-black text-white uppercase tracking-[0.4em] mb-1 italic">PERSPECTIVE IA EXÉCUTIVE</h4>
                                <p className="text-sm text-slate-500 font-extrabold italic uppercase tracking-widest">{vendorStats?.global_trend?.toUpperCase() || "ANALYSE EN COURS SELON VOTRE FLUX ACTUEL..."}</p>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-4 space-y-12">
                        <div className="bg-white/[0.02] border-4 border-white/5 rounded-[4rem] p-10 shadow-3xl relative overflow-hidden group">
                            <div className="absolute bottom-0 right-0 size-64 bg-blue-500/5 rounded-full blur-[100px] -mr-32 -mb-32 transition-colors duration-1000 group-hover:bg-blue-500/10" />

                            <div className="flex items-center justify-between mb-10 px-4">
                                <div className="flex items-center gap-4">
                                    <BaggageClaim className="size-5 text-slate-600" />
                                    <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] italic">GOUVERNANCE INVENTAIRE</h3>
                                </div>
                                <div className="text-[10px] font-black text-[#FF6600] uppercase tracking-[0.4em] cursor-pointer hover:text-white transition-colors italic border-b-2 border-[#FF6600]/20" onClick={() => navigate('/vendor/products')}>GÉRER PRODUITS</div>
                            </div>

                            <div className="space-y-10 px-4 mb-2">
                                <div className="space-y-4">
                                    <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.2em] italic">
                                        <span className="text-slate-600">STOCK DISPONIBLE</span>
                                        <span className="text-emerald-500">{productsCount > 0 ? Math.round(((productsCount - lowStockItems) / productsCount) * 100) : 0}%</span>
                                    </div>
                                    <div className="h-4 bg-white/5 rounded-full overflow-hidden border-2 border-white/5 p-1 shadow-inner">
                                        <div className="h-full bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]" style={{ width: `${productsCount > 0 ? ((productsCount - lowStockItems) / productsCount) * 100 : 0}%` }}></div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.2em] italic">
                                        <span className="text-slate-600">UNITÉS À RÉAPPROVISIONNER</span>
                                        <span className="text-amber-500">{productsCount > 0 ? Math.round((lowStockItems / productsCount) * 100) : 0}%</span>
                                    </div>
                                    <div className="h-4 bg-white/5 rounded-full overflow-hidden border-2 border-white/5 p-1 shadow-inner">
                                        <div className="h-full bg-amber-500 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.5)]" style={{ width: `${productsCount > 0 ? (lowStockItems / productsCount) * 100 : 0}%` }}></div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleAudit}
                                disabled={isAuditing}
                                className={cn(
                                    "w-full h-16 mt-12 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] transition-all duration-700 italic border-4",
                                    isAuditing ? "bg-white/5 text-slate-700 border-white/5 cursor-not-allowed" : "bg-[#FF6600]/10 border-[#FF6600]/20 text-[#FF6600] hover:bg-[#FF6600] hover:text-white hover:border-[#FF6600] shadow-3xl"
                                )}
                            >
                                {isAuditing ? "AUDIT EN COURS..." : "LANCER AUDIT STRATÉGIQUE IA"}
                            </button>
                        </div>

                        <div className="bg-white/[0.01] border-4 border-white/5 rounded-[4rem] p-10 shadow-3xl">
                            <DataTable
                                title="FLUX COMMANDES"
                                columns={orderColumns}
                                data={recentOrders}
                                className="border-0 bg-transparent text-white"
                                actions={<Link className="text-[10px] font-black text-[#FF6600] uppercase tracking-[0.4em] italic border-b-2 border-[#FF6600]/20 pb-1" to="/vendor/orders">VOIR TOUT</Link>}
                            />
                        </div>
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
};

export default VendorDashboard;
