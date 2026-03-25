import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DashboardCard from '../../components/ui/DashboardCard';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import { Wallet, ShoppingBag, Star, CheckCircle, Truck, Clock, Plus, Award, ArrowRight, TrendingUp, Shield, Activity } from 'lucide-react';
import { Skeleton, CardSkeleton, TableRowSkeleton } from '../../components/ui/Loader';
import { ErrorState } from '../../components/ui/StatusStates';
import { useAuth } from '../../hooks/useAuth';
import orderService from '../../services/orderService';
import productService from '../../services/productService';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Sample weekly performance data for the chart
const weeklyData = [
    { jour: 'Lun', montant: 120000, commandes: 3 },
    { jour: 'Mar', montant: 250000, commandes: 5 },
    { jour: 'Mer', montant: 180000, commandes: 4 },
    { jour: 'Jeu', montant: 420000, commandes: 8 },
    { jour: 'Ven', montant: 380000, commandes: 7 },
    { jour: 'Sam', montant: 560000, commandes: 12 },
    { jour: 'Dim', montant: 340000, commandes: 6 },
];

const orderColumns = [
    { key: 'numero_commande', label: 'N° Commande', render: (val) => <span className="font-black text-xs italic tracking-tight">{val || '—'}</span> },
    { key: 'montant_total', label: 'Montant', render: (val) => <span className="font-black text-xs italic">{parseFloat(val || 0).toLocaleString('fr-GN')} <span className="text-[8px] text-primary font-bold not-italic tracking-widest">GNF</span></span> },
    { key: 'statut', label: 'Statut', render: (val) => <StatusBadge status={val} /> },
];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-950 border-2 border-slate-800 rounded-2xl p-5 shadow-2xl">
                <p className="text-[9px] font-black text-primary uppercase tracking-[0.3em] mb-2">{label}</p>
                <p className="text-lg font-black text-white italic tracking-tight">
                    {parseFloat(payload[0].value).toLocaleString('fr-GN')} <span className="text-[9px] text-primary font-bold not-italic">GNF</span>
                </p>
                {payload[1] && (
                    <p className="text-[9px] text-slate-500 font-bold mt-1 uppercase tracking-widest">
                        {payload[1].value} commandes
                    </p>
                )}
            </div>
        );
    }
    return null;
};

const Dashboard = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [orders, setOrders] = useState([]);
    const [totalOrders, setTotalOrders] = useState(0);
    const [quickProducts, setQuickProducts] = useState([]);
    const [wallet, setWallet] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [ordersData, productsData, walletData] = await Promise.all([
                    orderService.getMyOrders(),
                    productService.getAll(),
                    import('../../services/walletService').then(m => m.default.getMyWallet())
                ]);

                setOrders(ordersData.orders || []);
                setTotalOrders(ordersData.total || 0);
                setQuickProducts(productsData.slice(0, 4));
                setWallet(walletData);
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

    const stats = [
        { title: 'Solde du portefeuille', value: wallet ? `${parseFloat(wallet.solde_virtuel).toLocaleString('fr-GN')} GNF` : '0 GNF', icon: Wallet, trend: 'up', trendValue: '+12.4%', description: 'Fonds disponibles immédiatement', color: 'primary' },
        { title: 'Commandes totales', value: totalOrders.toString(), icon: ShoppingBag, trend: 'up', trendValue: '+5.2%', description: 'Historique des transactions', color: 'emerald' },
        { title: 'Score de Fidélité', value: user?.points_fidelite || '2.4k', icon: Star, trend: 'up', trendValue: 'TOP 5%', description: 'Rang privilège BCA', color: 'amber' },
    ];

    return (
        <DashboardLayout title="Cockpit Exécutif">
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                
                {/* ══════════════════════════════════════════════════
                    SECTOR 1 — EXECUTIVE HERO COMMAND CENTER
                ══════════════════════════════════════════════════ */}
                <div className="relative overflow-hidden rounded-[3.5rem] bg-slate-950 border-2 border-slate-800 p-10 md:p-16 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]">
                    <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_0%,rgba(43,90,255,0.15),transparent_60%)]"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 size-96 bg-primary/5 rounded-full blur-[150px] animate-pulse"></div>
                    <div className="absolute top-1/2 right-1/4 size-2 bg-primary rounded-full animate-ping opacity-40"></div>
                    
                    <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-12">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-[0.3em]">
                                <span className="size-2 rounded-full bg-primary animate-ping"></span>
                                Session Active — {user?.role === 'admin' ? 'Administrateur' : user?.role === 'fournisseur' ? 'Marchand' : 'Investisseur'}
                            </div>
                            <h3 className="text-4xl md:text-6xl font-black tracking-tighter text-white leading-none italic uppercase">
                                Bienvenue, <br />
                                <span className="text-primary">{user?.nom_complet?.split(' ')[0] || 'Partenaire'}</span>.
                            </h3>
                            <p className="text-slate-400 font-bold max-w-lg text-sm leading-relaxed italic opacity-80">
                                Votre activité commerciale en Guinée progresse. Voici les insights clés pour piloter votre croissance aujourd'hui.
                            </p>
                        </div>
                        <div className="flex flex-col items-center xl:items-end gap-6">
                             <div className="text-center xl:text-right space-y-2">
                                <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.4em]">Dernière Synchronisation</p>
                                <p className="text-white font-black text-xl italic tracking-tight">{new Date().toLocaleTimeString('fr-GN', { hour: '2-digit', minute: '2-digit' })}</p>
                             </div>
                             <Link to="/profile">
                                 <button className="px-10 py-4 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-primary hover:text-white transition-all duration-500 shadow-2xl active:scale-95 hover:scale-[1.03]">
                                     Mon Identité
                                     <ArrowRight className="inline-block ml-3 size-4" />
                                 </button>
                             </Link>
                        </div>
                    </div>
                </div>

                {/* ══════════════════════════════════════════════════
                    SECTOR 2 — KPI STATS GRID (EXECUTIVE BENTO)
                ══════════════════════════════════════════════════ */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {isLoading ? (
                        [1, 2, 3].map(i => <CardSkeleton key={i} />)
                    ) : (
                        stats.map((stat, idx) => (
                            <DashboardCard key={idx} {...stat} variant={idx === 0 ? "glass" : "default"} />
                        ))
                    )}
                </div>

                {/* ══════════════════════════════════════════════════
                    SECTOR 3 — WEEKLY PERFORMANCE CHART + SECURITY
                ══════════════════════════════════════════════════ */}
                <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
                    {/* Recharts Activity Graph */}
                    <div className="lg:col-span-7 bg-white dark:bg-slate-900 border-2 border-slate-50 dark:border-slate-800 rounded-[3rem] overflow-hidden shadow-[0_30px_60px_-20px_rgba(0,0,0,0.05)] p-10">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/10">
                                    <Activity className="size-5" />
                                </div>
                                <div>
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-900 dark:text-white">Performance Hebdo</h3>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Volume des transactions — 7 jours</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                <TrendingUp className="size-4 text-emerald-500" />
                                <span className="text-[10px] font-black text-emerald-500 italic">+23.8%</span>
                            </div>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={weeklyData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                                    <defs>
                                        <linearGradient id="gradientPrimary" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="hsl(222, 80%, 55%)" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="hsl(222, 80%, 55%)" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis 
                                        dataKey="jour" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#64748b', fontSize: 9, fontWeight: 700 }}
                                        tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area 
                                        type="monotone" 
                                        dataKey="montant" 
                                        stroke="hsl(222, 80%, 55%)" 
                                        strokeWidth={3} 
                                        fill="url(#gradientPrimary)"
                                        animationDuration={2000}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Security & Trust Widget */}
                    <div className="lg:col-span-3 flex flex-col gap-8">
                        <div className="flex-1 bg-slate-950 text-white rounded-[3rem] p-10 relative overflow-hidden border-2 border-slate-800 shadow-2xl">
                            <div className="absolute top-0 right-0 size-48 bg-primary/10 rounded-full blur-[80px] -mr-24 -mt-24 opacity-50" />
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div className="space-y-6">
                                    <div className="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary">
                                        <Shield className="size-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-3">Niveau Sécurité</h4>
                                        <div className="flex items-baseline gap-3">
                                            <span className="text-5xl font-black italic tracking-tighter">AA+</span>
                                            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Optimal</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3 mt-8">
                                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                                        <span className="text-slate-500">Score confiance</span>
                                        <span className="text-primary italic">96%</span>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                                        <div className="bg-primary h-full w-[96%] rounded-full shadow-[0_0_20px_rgba(43,90,255,0.5)]" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Link to="/wallet" className="block">
                            <div className="bg-gradient-to-br from-primary via-blue-600 to-indigo-700 p-8 rounded-[2rem] text-white relative overflow-hidden group cursor-pointer active:scale-[0.97] transition-all duration-500 shadow-2xl shadow-primary/20 hover:shadow-primary/40">
                                <div className="absolute top-0 right-0 size-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
                                <div className="relative z-10 flex items-center gap-5">
                                    <div className="size-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                                        <Wallet className="size-5" />
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/60">Accès Rapide</p>
                                        <p className="text-sm font-black italic tracking-tight">Mon Portefeuille</p>
                                    </div>
                                    <ArrowRight className="size-5 ml-auto opacity-60 group-hover:translate-x-2 transition-transform" />
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* ══════════════════════════════════════════════════
                    SECTOR 4 — CATALOG + ORDERS + PROMO BENTO
                ══════════════════════════════════════════════════ */}
                <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
                    
                    {/* Catalog Exploration */}
                    <div className="lg:col-span-6 space-y-8">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-4">
                                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/10">
                                    <ShoppingBag className="size-5" />
                                </div>
                                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-900 dark:text-white">Catalogue Recommandé</h3>
                            </div>
                            <Link className="text-[9px] font-black text-primary hover:bg-primary/10 px-4 py-2 rounded-xl border border-primary/20 uppercase tracking-[0.2em] transition-all" to="/marketplace">Marché Complet</Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {isLoading ? (
                                [1, 2, 3, 4].map(i => <TableRowSkeleton key={i} />)
                            ) : (
                                quickProducts.map((product, idx) => (
                                    <Link to={`/product/${product.id}`} key={idx} className="group relative bg-white dark:bg-slate-900/50 rounded-[2rem] border-2 border-slate-50 dark:border-slate-800 p-6 flex gap-5 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 cursor-pointer overflow-hidden">
                                        <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="size-2 rounded-full bg-primary animate-ping"></div>
                                        </div>
                                        
                                        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-50 dark:border-slate-800">
                                            <img
                                                src={product.images?.[0]?.url_image || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?auto=format&fit=crop&q=80&w=300'}
                                                alt={product.nom_produit}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                        </div>
                                        <div className="flex flex-col justify-between py-1 flex-1">
                                            <div>
                                                <h5 className="text-[13px] font-black text-slate-900 dark:text-white tracking-tight group-hover:text-primary transition-colors italic">{product.nom_produit}</h5>
                                                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 font-bold leading-relaxed">{product.description}</p>
                                            </div>
                                            <div className="flex items-center justify-between mt-3">
                                                <span className="text-base font-black text-slate-900 dark:text-white italic tracking-tighter">
                                                    {parseFloat(product.prix_unitaire).toLocaleString('fr-FR')} <span className="text-[9px] font-bold text-primary not-italic tracking-widest">GNF</span>
                                                </span>
                                                <div className="size-10 bg-slate-50 dark:bg-slate-800 group-hover:bg-primary group-hover:text-white rounded-xl transition-all duration-500 flex items-center justify-center shadow-lg shadow-black/[0.02] border border-slate-100 dark:border-slate-700">
                                                    <Plus className="size-5" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Orders Table + Promo */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="flex flex-col h-full gap-8">
                            <div className="flex-1">
                                {isLoading ? (
                                    <CardSkeleton />
                                ) : hasError ? (
                                    <ErrorState />
                                ) : (
                                    <DataTable
                                        title={<span className="text-[11px] font-black italic tracking-[0.3em] uppercase">Activité Récente</span>}
                                        columns={orderColumns}
                                        data={orders.slice(0, 4)}
                                        className="rounded-[2.5rem] border-2 border-slate-50 dark:border-slate-800 shadow-xl"
                                        actions={
                                            <Link className="text-[9px] font-black text-primary hover:bg-primary/10 px-4 py-2 rounded-xl border border-primary/20 uppercase tracking-[0.2em] transition-all" to="/orders">Historique</Link>
                                        }
                                    />
                                )}
                            </div>

                            {/* Premium Promo Banner */}
                            <div className="bg-gradient-to-br from-indigo-600 via-primary to-blue-500 p-10 rounded-[3rem] text-primary-foreground relative overflow-hidden shadow-2xl shadow-primary/20 group cursor-pointer active:scale-[0.97] transition-all duration-500 border-2 border-primary/20">
                                <div className="absolute top-0 right-0 -mr-16 -mt-16 size-56 bg-white/15 rounded-full blur-3xl transition-transform duration-1000 group-hover:scale-150 opacity-50"></div>
                                <div className="absolute bottom-0 left-0 -ml-10 -mb-10 size-40 bg-black/10 rounded-full blur-2xl"></div>
                                
                                <div className="relative z-10 space-y-6">
                                    <div className="size-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/10">
                                        <Award className="size-7 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-black italic tracking-tighter mb-2 uppercase">BCA Premium+</h4>
                                        <p className="text-white/70 text-[10px] font-bold leading-relaxed max-w-[220px] italic">Activez le mode expert : Statistiques avancées, livraisons prioritaires et accès au crédit marchand.</p>
                                    </div>
                                    <button className="px-10 py-4 bg-white text-primary text-[9px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-slate-900 hover:text-white transition-all duration-500 shadow-2xl">
                                        Découvrir l'Offre
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

export default Dashboard;
