import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DashboardCard from '../../components/ui/DashboardCard';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import { Wallet, ShoppingBag, Star, Activity, ArrowRight, TrendingUp, Shield, Package, Sparkles, Zap, TrendingDown } from 'lucide-react';
import { CardSkeleton, TableRowSkeleton } from '../../components/ui/Loader';
import { ErrorState } from '../../components/ui/StatusStates';
import { useAuth } from '../../hooks/useAuth';
import orderService from '../../services/orderService';
import productService from '../../services/productService';
import { Link, useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const orderColumns = [
    { key: 'numero_commande', label: 'N° COMMANDE', render: (val) => <span className="font-black text-[10px] uppercase tracking-widest italic">{val || '—'}</span> },
    { key: 'montant_total', label: 'MONTANT', render: (val) => <span className="font-black text-sm text-white italic">{parseFloat(val || 0).toLocaleString('fr-GN')} <span className="text-[10px] text-[#FF6600] non-italic">GNF</span></span> },
    { key: 'statut', label: 'STATUT', render: (val) => <StatusBadge status={val} className="text-[9px] font-black italic uppercase tracking-widest border-2" /> },
];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-black/80 backdrop-blur-3xl border-4 border-[#FF6600]/20 rounded-3xl p-6 shadow-3xl">
                <p className="text-[10px] font-black text-[#FF6600] uppercase tracking-[0.3em] mb-3 italic">{label}</p>
                <p className="text-xl font-black text-white italic">
                    {parseFloat(payload[0].value).toLocaleString('fr-GN')} <span className="text-[10px] text-slate-500 non-italic">GNF</span>
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
                    import('../../services/walletService').then(m => m.default.getMyWallet())
                ]);

                const fetchedOrders = ordersData.orders || [];
                setOrders(fetchedOrders);
                setTotalOrders(ordersData.total || 0);
                setQuickProducts(productsData.slice(0, 4));
                setWallet(walletData);

                // Process chart data from orders
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

        // Initialize last 7 days
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
        { title: 'SOLDE PORTEFEUILLE', value: wallet ? `${parseFloat(wallet.solde_virtuel).toLocaleString('fr-GN')} GNF` : '0 GNF', icon: Wallet, trend: 'up', trendValue: 'RÉEL', description: 'FONDS DISPONIBLES EN SÉQUESTRE', color: 'primary' },
        { title: 'COMMANDES TOTALES', value: totalOrders.toString(), icon: ShoppingBag, trend: 'up', trendValue: `${orders.length > 0 ? 'ACTIF' : 'N/A'}`, description: 'HISTORIQUE TRANSACTIONNEL COMPLET', color: 'primary' },
        { title: 'POINTS BCA', value: user?.points_fidelite || '0', icon: Star, trend: 'up', trendValue: 'PRIVILÈGE', description: 'STATUT DE GOUVERNANCE FIDÉLITÉ', color: 'primary' },
    ];

    return (
        <DashboardLayout title="TABLEAU DE BORD">
            <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-20">

                {/* Hero Welcome */}
                <div className="relative overflow-hidden rounded-[4rem] bg-white group border-x-[16px] border-[#FF6600] p-12 md:p-20 shadow-3xl">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,102,0,0.1),transparent_70%)] opacity-50" />
                    <div className="absolute top-0 right-0 size-[50rem] bg-[#FF6600]/5 rounded-full blur-[200px] -mt-64 -mr-64 group-hover:scale-125 transition-transform duration-[4s]" />

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-12">
                        <div className="space-y-10">
                            <div className="inline-flex items-center gap-4 px-6 py-2 rounded-2xl bg-[#FF6600]/10 border-2 border-[#FF6600]/20 text-[#FF6600] text-[10px] font-black uppercase tracking-[0.4em] italic">
                                <Zap className="size-4 animate-pulse" />
                                SESSION {user?.role === 'admin' ? 'ADMINISTRATEUR' : 'MEMBRE PREMIUM'} ACTIVATE
                            </div>
                            <h2 className="text-6xl md:text-8xl font-black text-black tracking-tighter leading-[0.8] uppercase italic">
                                BIENVENUE, <br />
                                <span className="text-[#FF6600] not-italic">{user?.nom_complet?.split(' ')[0] || 'MEMBRE'}</span>.
                            </h2>
                            <p className="text-slate-500 font-extrabold max-w-2xl leading-relaxed uppercase tracking-widest italic border-l-8 border-[#FF6600]/20 pl-10">
                                ACCÉDEZ À VOS COMMANDES, GÉREZ VOTRE PORTEFEUILLE ET SUIVEZ VOS LIVRAISONS EN TEMPS RÉEL SUR L'INFRASTRUCTURE BCA CONNECT.
                            </p>
                        </div>
                        <div className="flex flex-col items-start md:items-end gap-10">
                            <div className="text-left md:text-right space-y-2">
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] italic">DERNIER SYNC FLUX</p>
                                <p className="text-black font-black text-5xl tabular-nums italic tracking-tighter">{new Date().toLocaleTimeString('fr-GN', { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                            <button
                                onClick={() => navigate('/profile')}
                                className="px-12 h-20 bg-black text-white hover:bg-[#FF6600] rounded-[1.5rem] font-black text-xs uppercase tracking-[0.4em] transition-all duration-700 shadow-3xl hover:scale-110 active:scale-95 italic group/btn overflow-hidden relative"
                            >
                                <span className="relative z-10">MON PROFIL EXÉCUTIF</span>
                                <ArrowRight className="inline-block ml-4 size-5 relative z-10 group-hover/btn:translate-x-2 transition-transform" />
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_2s_infinite]" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* KPI stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {isLoading ? (
                        [1, 2, 3].map(i => <CardSkeleton key={i} />)
                    ) : (
                        stats.map((stat, idx) => (
                            <DashboardCard key={idx} {...stat} className="hover:border-[#FF6600]/40 transition-all duration-700" />
                        ))
                    )}
                </div>

                {/* Activity & Wallet */}
                <div className="grid grid-cols-1 lg:grid-cols-10 gap-12">
                    <div className="lg:col-span-6 bg-white/[0.02] border-4 border-white/5 rounded-[4rem] p-12 shadow-3xl group relative overflow-hidden">
                        <div className="absolute top-0 right-0 size-80 bg-[#FF6600]/5 rounded-full blur-[120px] -mr-40 -mt-40 group-hover:bg-[#FF6600]/10 transition-colors duration-1000" />

                        <div className="flex items-center justify-between mb-12 relative z-10">
                            <div className="flex items-center gap-6">
                                <div className="size-14 rounded-2xl bg-[#FF6600]/10 flex items-center justify-center text-[#FF6600] shadow-3xl border-2 border-[#FF6600]/20 group-hover:rotate-12 transition-transform duration-700">
                                    <Activity className="size-7" />
                                </div>
                                <h3 className="text-xl font-black text-white uppercase tracking-[0.3em] italic">ACTIVITÉ D'ACQUISITION</h3>
                            </div>
                        </div>
                        <div className="h-80 relative z-10">
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
                                        tick={{ fill: '#475569', fontSize: 10, fontWeight: 900, letterSpacing: '0.2em' }}
                                    />
                                    <YAxis hide />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="montant" stroke="#FF6600" strokeWidth={6} fillOpacity={1} fill="url(#colorAmount)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="lg:col-span-4 flex flex-col gap-10">
                        <div className="bg-white/[0.02] border-4 border-white/5 rounded-[4rem] p-12 flex flex-col justify-between flex-1 shadow-3xl relative overflow-hidden group">
                            <div className="absolute bottom-0 left-0 size-64 bg-blue-500/5 rounded-full blur-[100px] -ml-32 -mb-32 transition-colors duration-1000 group-hover:bg-blue-500/10" />

                            <div className="space-y-10 relative z-10">
                                <div className="size-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 shadow-3xl border-2 border-blue-500/20 group-hover:rotate-6 transition-transform">
                                    <Shield className="size-8" />
                                </div>
                                <div className="space-y-4">
                                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] italic leading-none pt-1">NIVEAU DE CONFIANCE RÉSEAU</p>
                                    <div className="flex items-baseline gap-4">
                                        <span className="text-5xl font-black text-white italic uppercase tracking-tighter">ELITE</span>
                                        <span className="text-2xl font-black text-[#FF6600] italic">A++</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-12 space-y-6 relative z-10">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.3em] italic">
                                    <span className="text-slate-600">SCORE D'INTÉGRITÉ</span>
                                    <span className="text-[#FF6600]">92.8%</span>
                                </div>
                                <div className="h-4 bg-white/5 rounded-full overflow-hidden border-2 border-white/5 p-1 shadow-inner">
                                    <div className="bg-[#FF6600] h-full w-[92.8%] rounded-full shadow-[0_0_20px_rgba(255,102,0,0.4)] animate-pulse"></div>
                                </div>
                            </div>
                        </div>

                        <Link to="/wallet" className="group/wallet">
                            <div className="bg-[#FF6600] p-12 rounded-[3rem] text-white shadow-3xl shadow-[#FF6600]/20 hover:scale-[1.05] transition-all duration-700 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/wallet:animate-[shimmer_3s_infinite]" />
                                <div className="flex items-center gap-8">
                                    <div className="size-16 rounded-2xl bg-white/20 border-2 border-white/20 flex items-center justify-center group-hover/wallet:rotate-12 transition-transform">
                                        <Wallet className="size-8" />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[11px] font-black text-white/60 uppercase tracking-[0.4em] italic">MON SYSTÈME FINANCIER</p>
                                        <p className="text-2xl font-black italic tracking-tighter uppercase">PORTEFEUILLE</p>
                                    </div>
                                    <ArrowRight className="size-8 ml-auto text-white/40 group-hover/wallet:translate-x-3 transition-transform" />
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Suggestions & History */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-12 space-y-10">
                        <div className="flex items-center justify-between border-b-4 border-white/5 pb-8">
                            <div className="flex items-center gap-6">
                                <div className="size-3 bg-[#FF6600] rounded-full shadow-[0_0_10px_rgba(255,102,0,0.5)]" />
                                <h3 className="text-xl font-black text-white uppercase tracking-[0.4em] italic leading-none pt-1">RECOMMANDATIONS STRATÉGIQUES</h3>
                            </div>
                            <Link to="/marketplace" className="text-[10px] font-black text-[#FF6600] hover:text-white transition-colors uppercase tracking-[0.4em] italic border-b-2 border-[#FF6600]/20 pb-1">VOIR TOUT LE CATALOGUE</Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {isLoading ? [1, 2, 3, 4].map(i => <TableRowSkeleton key={i} />) : quickProducts.map((product, idx) => (
                                <Link to={`/product/${product.id}`} key={idx} className="bg-white/[0.02] border-4 border-white/5 p-6 rounded-[3rem] flex flex-col gap-6 hover:border-[#FF6600]/40 transition-all duration-700 group hover:-translate-y-4 shadow-3xl">
                                    <div className="aspect-square rounded-[2rem] bg-white/[0.01] overflow-hidden flex-shrink-0 relative border-2 border-white/5">
                                        <img src={product.images?.[0]?.url_image} alt="" className="w-full h-full object-cover group-hover:scale-125 transition-all duration-[2s] opacity-80 group-hover:opacity-100" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                                        <div className="absolute bottom-6 left-6 flex items-center gap-3">
                                            <div className="size-2 rounded-full bg-[#FF6600] animate-pulse shadow-[0_0_8px_rgba(255,102,0,0.5)]" />
                                            <span className="text-[9px] font-black text-white uppercase tracking-widest italic pt-0.5">DISPONIBLE</span>
                                        </div>
                                    </div>
                                    <div className="space-y-4 px-2">
                                        <h4 className="text-sm font-black text-white uppercase tracking-widest italic line-clamp-1 group-hover:text-[#FF6600] transition-colors">{product.nom_produit}</h4>
                                        <div className="flex items-center justify-between">
                                            <p className="text-xl font-black text-[#FF6600] italic tracking-tighter">{parseFloat(product.prix_unitaire).toLocaleString()} <small className="text-[9px] non-italic text-slate-600">GNF</small></p>
                                            <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover:bg-[#FF6600]/10 group-hover:text-[#FF6600] transition-all">
                                                <Zap className="size-5" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-12">
                        <div className="bg-white/[0.01] border-4 border-white/5 rounded-[4rem] p-12 shadow-3xl">
                            <DataTable
                                title="COMMANDES RÉCENTES"
                                columns={orderColumns}
                                data={orders.slice(0, 5)}
                                className="border-0 bg-transparent text-white"
                                actions={<Link className="text-[10px] font-black text-[#FF6600] uppercase tracking-[0.4em] italic border-b-2 border-[#FF6600]/20 pb-1" to="/orders">ACCÉDER À L'HISTORIQUE COMPLET</Link>}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Dashboard;
