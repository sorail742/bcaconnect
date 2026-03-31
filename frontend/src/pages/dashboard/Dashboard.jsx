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
            <div className="bg-background border-2 border-border rounded-2xl p-5 shadow-2xl">
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
                <div className="relative overflow-hidden rounded-[4rem] bg-background border-2 border-border p-12 md:p-20 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)]">
                    <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_0%,rgba(43,90,255,0.15),transparent_60%)]"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 size-96 bg-primary/5 rounded-full blur-[150px] animate-pulse"></div>
                    
                    <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-16">
                        <div className="space-y-10">
                            <div className="inline-flex items-center gap-4 px-6 py-2.5 rounded-2xl bg-white/5 border-2 border-white/5 text-primary text-[10px] font-black uppercase tracking-[0.4em] italic shadow-2xl">
                                <span className="size-2.5 rounded-full bg-primary animate-ping"></span>
                                Session Prioritaire — {user?.role === 'admin' ? 'Administrateur Elite' : user?.role === 'fournisseur' ? 'Marchand Partenaire' : 'Membre BCA'}
                            </div>
                            <h3 className="text-5xl md:text-8xl font-black tracking-tighter text-white leading-none italic uppercase">
                                Bienvenue, <br />
                                <span className="text-primary">{user?.nom_complet?.split(' ')[0] || 'Partenaire'}</span>.
                            </h3>
                            <p className="text-slate-400 font-bold max-w-xl text-lg leading-relaxed italic opacity-70">
                                Le réseau BCA Connect est à votre service. Pilotez vos opérations avec une précision chirurgicale.
                            </p>
                        </div>
                        <div className="flex flex-col items-center xl:items-end gap-10">
                             <div className="text-center xl:text-right space-y-4">
                                <p className="text-executive-label text-slate-600">Dernier Flux</p>
                                <p className="text-white font-black text-4xl italic tracking-tighter tabular-nums">{new Date().toLocaleTimeString('fr-GN', { hour: '2-digit', minute: '2-digit' })}</p>
                             </div>
                             <Link to="/profile">
                                 <button className="px-12 h-20 bg-white text-black rounded-[2rem] font-black text-[12px] uppercase tracking-[0.4em] hover:bg-primary hover:text-white transition-all duration-700 shadow-[0_20px_40px_-5px_rgba(255,255,255,0.1)] active-press hover:scale-[1.03]">
                                     Identité BCA
                                     <ArrowRight className="inline-block ml-4 size-5" />
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
                    <div className="lg:col-span-7 bg-card border-2 border-border rounded-[3.5rem] overflow-hidden shadow-premium p-12">
                        <div className="flex items-center justify-between mb-12">
                            <div className="flex items-center gap-6">
                                <div className="size-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary border-2 border-primary/10">
                                    <Activity className="size-6" />
                                </div>
                                <div>
                                    <h3 className="text-executive-title text-sm tracking-widest">Performance Flux</h3>
                                    <p className="text-executive-label mt-1.5 opacity-60">Volume Transactionnel — 7 Jours</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 px-5 py-2 bg-emerald-500/5 border-2 border-emerald-500/10 rounded-2xl">
                                <TrendingUp className="size-5 text-emerald-500" />
                                <span className="text-executive-data text-xs text-emerald-500">+23.8%</span>
                            </div>
                        </div>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={weeklyData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                                    <defs>
                                        <linearGradient id="gradientPrimary" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis 
                                        dataKey="jour" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: 'currentColor', opacity: 0.4, fontSize: 10, fontWeight: 900 }}
                                        className="text-foreground italic uppercase tracking-widest"
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: 'currentColor', opacity: 0.4, fontSize: 9, fontWeight: 700 }}
                                        tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                                        className="text-foreground"
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area 
                                        type="monotone" 
                                        dataKey="montant" 
                                        stroke="hsl(var(--primary))" 
                                        strokeWidth={4} 
                                        fill="url(#gradientPrimary)"
                                        animationDuration={2000}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Security & Trust Widget */}
                    <div className="lg:col-span-3 flex flex-col gap-8">
                        <div className="flex-1 bg-background text-white rounded-[3.5rem] p-12 relative overflow-hidden border-2 border-border shadow-2xl">
                            <div className="absolute top-0 right-0 size-48 bg-primary/10 rounded-full blur-[80px] -mr-24 -mt-24 opacity-50" />
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div className="space-y-8">
                                    <div className="size-16 rounded-2xl bg-white/5 border-2 border-white/5 flex items-center justify-center text-primary shadow-2xl">
                                        <Shield className="size-7" />
                                    </div>
                                    <div>
                                        <h4 className="text-executive-label text-slate-500 mb-4">Niveau Sécurité BCA</h4>
                                        <div className="flex items-baseline gap-4">
                                            <span className="text-6xl font-black italic tracking-tighter tabular-nums text-white">AA+</span>
                                            <span className="text-executive-label text-emerald-400">Optimal</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4 mt-12">
                                    <div className="flex justify-between text-executive-label">
                                        <span className="text-slate-500">Score de Confiance</span>
                                        <span className="text-primary italic font-black">96.4%</span>
                                    </div>
                                    <div className="h-3 bg-white/5 rounded-full overflow-hidden border-2 border-white/5 p-0.5 shadow-inner">
                                        <div className="bg-primary h-full w-[96.4%] rounded-full shadow-[0_0_30px_rgba(43,90,255,0.6)]" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Link to="/wallet" className="block group">
                            <div className="bg-primary p-10 rounded-[2.5rem] text-white relative overflow-hidden active-press transition-all duration-500 shadow-premium hover:shadow-primary/40 border-2 border-primary/20">
                                <div className="absolute top-0 right-0 size-40 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-1000" />
                                <div className="relative z-10 flex items-center gap-6">
                                    <div className="size-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border-2 border-white/10">
                                        <Wallet className="size-6" />
                                    </div>
                                    <div>
                                        <p className="text-executive-label text-white/60">Mon Portefeuille</p>
                                        <p className="text-executive-data text-xl text-white">Gestion Flux</p>
                                    </div>
                                    <ArrowRight className="size-6 ml-auto opacity-60 group-hover:translate-x-3 transition-transform duration-500" />
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
                    <div className="lg:col-span-6 space-y-10">
                        <div className="flex items-center justify-between px-4">
                            <div className="flex items-center gap-6">
                                <div className="size-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary border-2 border-primary/10">
                                    <ShoppingBag className="size-6" />
                                </div>
                                <h3 className="text-executive-title text-sm tracking-widest">Recommandations BCA</h3>
                            </div>
                            <Link className="text-executive-label text-primary hover:bg-primary/5 px-6 py-2.5 rounded-2xl border-2 border-primary/10 transition-all active-press" to="/marketplace">Flux Complet</Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            {isLoading ? (
                                [1, 2, 3, 4].map(i => <TableRowSkeleton key={i} />)
                            ) : (
                                quickProducts.map((product, idx) => (
                                    <Link to={`/product/${product.id}`} key={idx} className="group relative bg-card rounded-[2.5rem] border-2 border-border p-8 flex gap-6 hover:border-primary/20 hover:shadow-premium transition-all duration-500 cursor-pointer overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="size-2.5 rounded-full bg-primary animate-ping"></div>
                                        </div>
                                        
                                        <div className="w-28 h-28 bg-accent rounded-2xl overflow-hidden flex-shrink-0 border-2 border-border shadow-inner">
                                            <img
                                                src={product.images?.[0]?.url_image || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?auto=format&fit=crop&q=80&w=300'}
                                                alt={product.nom_produit}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                        </div>
                                        <div className="flex flex-col justify-between py-1 flex-1">
                                            <div className="space-y-2">
                                                <h5 className="text-executive-data text-[15px] group-hover:text-primary transition-colors italic">{product.nom_produit}</h5>
                                                <p className="text-executive-label opacity-60 line-clamp-2 leading-relaxed italic">{product.description}</p>
                                            </div>
                                            <div className="flex items-center justify-between mt-4">
                                                <span className="text-executive-data text-lg tabular-nums">
                                                    {parseFloat(product.prix_unitaire).toLocaleString('fr-FR')} <span className="text-[10px] font-black text-primary not-italic tracking-[0.2em] ml-1">GNF</span>
                                                </span>
                                                <div className="size-12 bg-accent group-hover:bg-primary group-hover:text-white rounded-2xl transition-all duration-500 flex items-center justify-center shadow-lg border-2 border-border group-hover:border-primary/20">
                                                    <Plus className="size-6" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Orders Table + Promo */}
                    <div className="lg:col-span-4 space-y-10">
                        <div className="flex flex-col h-full gap-10">
                            <div className="flex-1">
                                {isLoading ? (
                                    <CardSkeleton />
                                ) : hasError ? (
                                    <ErrorState />
                                ) : (
                                    <DataTable
                                        title="Flux Récent"
                                        columns={orderColumns}
                                        data={orders.slice(0, 4)}
                                        className="shadow-premium border-2 border-border"
                                        actions={
                                            <Link className="text-executive-label text-primary hover:bg-primary/5 px-6 py-2.5 rounded-2xl border-2 border-primary/10 transition-all active-press" to="/orders">Elite History</Link>
                                        }
                                    />
                                )}
                            </div>

                            {/* Premium Promo Banner */}
                            <div 
                                onClick={() => toast.info("Accès Privilège BCA+", { description: "Ce programme est actuellement sur invitation uniquement. Nos conseillers vous contacteront si vous êtes éligible." })}
                                className="bg-background p-12 rounded-[3.5rem] text-white relative overflow-hidden shadow-2xl shadow-black/40 group cursor-pointer active-press transition-all duration-500 border-2 border-border"
                            >
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-full bg-[radial-gradient(circle_at_50%_50%,rgba(43,90,255,0.1),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                                
                                <div className="relative z-10 space-y-8">
                                    <div className="size-16 rounded-[1.2rem] bg-white/5 backdrop-blur-xl flex items-center justify-center border-2 border-white/5 shadow-2xl">
                                        <Award className="size-8 text-primary shadow-[0_0_20px_rgba(43,90,255,0.5)]" />
                                    </div>
                                    <div className="space-y-3">
                                        <h4 className="text-3xl font-black italic tracking-tighter uppercase text-white">BCA Privilege+</h4>
                                        <p className="text-slate-400 text-[10px] font-black leading-relaxed max-w-[260px] italic uppercase tracking-widest opacity-60">Insight Exécutif • Crédit Illimité • Logistique Prioritaire</p>
                                    </div>
                                    <button className="h-16 w-full bg-white text-black text-[11px] font-black uppercase tracking-[0.4em] rounded-2xl hover:bg-primary hover:text-white transition-all duration-700 shadow-2xl shadow-white/5">
                                        Adhésion Réseau
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
