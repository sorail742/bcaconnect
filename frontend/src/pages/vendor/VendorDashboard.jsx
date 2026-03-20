import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/ui/Button';
import DashboardCard from '../../components/ui/DashboardCard';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import { ShoppingBasket, CreditCard, BarChart3, MousePointer2, Plus, Package, ShieldCheck } from 'lucide-react';
import { Skeleton, CardSkeleton, TableRowSkeleton } from '../../components/ui/Loader';
import { ErrorState } from '../../components/ui/StatusStates';
import { Card } from '../../components/ui/Card';

import { useAuth } from '../../hooks/useAuth';
import storeService from '../../services/storeService';
import orderService from '../../services/orderService';
import aiService from '../../services/aiService';

const VendorDashboard = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = React.useState(true);
    const [hasError, setHasError] = React.useState(false);
    const [store, setStore] = React.useState(null);
    const [orders, setOrders] = React.useState([]);
    const [totalOrders, setTotalOrders] = React.useState(0);
    const [insights, setInsights] = React.useState(null);

    React.useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            try {
                // Appel Boutique - On gère le 404 séparément car c'est un état normal au début
                try {
                    const storeData = await storeService.getMyStore();
                    setStore(storeData);
                } catch (storeError) {
                    if (storeError.response?.status !== 404) {
                        console.error("Erreur boutique:", storeError);
                    }
                }

                // Appel Commandes
                try {
                    const orderData = await orderService.getVendorOrders();
                    setOrders(orderData.orders || []);
                    setTotalOrders(orderData.total || 0);
                } catch (orderError) {
                    console.error("Erreur commandes:", orderError);
                }

                // Appel AI Insights
                try {
                    const aiData = await aiService.getSalesInsights();
                    setInsights(aiData);
                } catch (aiError) {
                    // On ne bloque pas si l'IA échoue
                }

            } catch (error) {
                console.error("Erreur globale dashboard:", error);
                setHasError(true);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Calcul des KPIs basés sur les données réelles (ou mocks intelligents si vide)
    const totalSales = orders.reduce((acc, order) => acc + (parseFloat(order.prix_unitaire_achat) * order.quantite), 0);

    const kpis = [
        { title: "Chiffre d'affaires", value: `${totalSales.toLocaleString('fr-GN')} GNF`, trend: 'up', trendValue: '+0%', description: 'Total historique', icon: CreditCard },
        { title: 'Commandes totales', value: totalOrders.toString(), trend: 'up', trendValue: '+0%', description: 'Commandes reçues', icon: ShoppingBasket },
        { title: 'Produits actifs', value: store?.produits?.length.toString() || '0', description: 'Dans votre boutique', icon: Package },
        { title: 'Score Confiance', value: user?.score_confiance ? `${user.score_confiance}%` : '100%', description: 'Évaluation BCA', icon: ShieldCheck },
    ];

    const recentOrders = orders.slice(0, 4).map(item => ({
        id: `#ORD-${item.commande_id.slice(0, 8)}`,
        time: new Date(item.createdAt).toLocaleDateString('fr-GN'),
        amount: `${(item.prix_unitaire_achat * item.quantite).toLocaleString('fr-GN')} GNF`,
        status: item.commande.statut === 'payé' ? 'Payé' : 'En attente',
        statusType: item.commande.statut === 'payé' ? 'success' : 'warning'
    }));

    const orderColumns = [
        {
            label: 'Commande',
            render: (row) => (
                <div className="flex items-center gap-4 group">
                    <div className="size-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                        <Package className="size-5" />
                    </div>
                    <div>
                        <p className="text-sm font-bold tracking-tight">{row.id}</p>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter mt-0.5">{row.time}</p>
                    </div>
                </div>
            )
        },
        { label: 'Montant', key: 'amount' },
        {
            label: 'Statut',
            render: (row) => <StatusBadge status={row.status} variant={row.statusType} />
        },
    ];

    return (
        <DashboardLayout title="Portail Fournisseur">
            <div className="flex flex-col gap-8 animate-in fade-in duration-500">
                <div className="flex flex-wrap items-center justify-between gap-6">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground italic">Bonjour, {user?.nom_complet?.split(' ')[0] || 'Vendeur'} 👋</h1>
                        <p className="text-muted-foreground font-medium">Voici les performances de votre boutique {store?.nom_boutique ? `"${store.nom_boutique}"` : ''} aujourd'hui.</p>
                    </div>
                    {store ? (
                        <Button
                            onClick={() => window.location.href = '/vendor/products/add'}
                            className="shadow-lg shadow-primary/20 rounded-xl font-bold"
                        >
                            <Plus className="size-4 mr-2" />
                            Nouveau Produit
                        </Button>
                    ) : (
                        <Button
                            onClick={() => window.location.href = '/vendor/store'}
                            className="shadow-lg shadow-primary/20 rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-white border-none"
                        >
                            <Store className="size-4 mr-2" />
                            Créer ma boutique
                        </Button>
                    )}
                </div>

                {!isLoading && !store && (
                    <div className="p-8 rounded-[2rem] bg-gradient-to-r from-primary/20 via-primary/5 to-transparent border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-top-4 duration-700">
                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-foreground italic tracking-tight uppercase">Lancez votre activité !</h3>
                            <p className="text-muted-foreground text-sm font-medium">Vous n'avez pas encore configuré votre boutique. Créez-la maintenant pour commencer à vendre sur BCA Connect.</p>
                        </div>
                        <Button onClick={() => window.location.href = '/vendor/store'} className="h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/30">
                            Configurer ma boutique
                        </Button>
                    </div>
                )}

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {isLoading ? (
                        [1, 2, 3, 4].map(i => <CardSkeleton key={i} />)
                    ) : (
                        kpis.map((kpi, idx) => (
                            <DashboardCard key={idx} {...kpi} />
                        ))
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-card p-8 rounded-2xl border border-border shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-lg font-bold text-foreground">Performance des Ventes</h3>
                                <p className="text-sm text-muted-foreground font-medium">Analyse comparative hebdomadaire</p>
                            </div>
                        </div>
                        <div className="relative w-full h-72 mt-4 bg-muted/50 rounded-3xl flex items-center justify-center border border-border overflow-hidden group">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-1000"></div>

                            <svg className="w-full h-full px-6 pt-10 pb-6 overflow-visible" viewBox="0 0 800 300">
                                {/* Grille horizontale */}
                                {[0, 1, 2, 3].map(i => (
                                    <line key={i} x1="0" y1={300 - i * 80} x2="800" y2={300 - i * 80} stroke="currentColor" strokeOpacity="0.05" strokeWidth="1" />
                                ))}

                                {/* Chemin de courbe lissé (Bézier) */}
                                <path
                                    d="M 0 250 C 100 230, 200 280, 300 200 C 400 120, 500 150, 600 80 C 700 10, 800 50, 850 40"
                                    fill="none"
                                    stroke="url(#gradient-line)"
                                    strokeWidth="6"
                                    strokeLinecap="round"
                                    className="animate-draw-path"
                                    style={{
                                        strokeDasharray: '1000',
                                        strokeDashoffset: '1000',
                                        animation: 'drawPath 3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
                                    }}
                                />

                                {/* Gradient definition */}
                                <defs>
                                    <linearGradient id="gradient-line" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
                                        <stop offset="100%" stopColor="hsl(var(--primary))" />
                                    </linearGradient>
                                    <linearGradient id="gradient-fill" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
                                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                                    </linearGradient>
                                </defs>

                                {/* Area Fill */}
                                <path
                                    d="M 0 250 C 100 230, 200 280, 300 200 C 400 120, 500 150, 600 80 C 700 10, 800 50, 850 40 L 850 300 L 0 300 Z"
                                    fill="url(#gradient-fill)"
                                    className="fade-in-delayed"
                                />

                                {/* Points d'interaction simulés */}
                                {[
                                    { x: 300, y: 200, label: 'Lun' },
                                    { x: 450, y: 130, label: 'Mar' },
                                    { x: 600, y: 80, label: 'Mer' },
                                    { x: 750, y: 45, label: 'Jeu' },
                                ].map((p, i) => (
                                    <g key={i} className="cursor-pointer group/point">
                                        <circle cx={p.x} cy={p.y} r="6" fill="white" stroke="hsl(var(--primary))" strokeWidth="3" className="transition-all duration-300 group-hover/point:r-8" />
                                        <text x={p.x} y={290} textAnchor="middle" fill="currentColor" fillOpacity="0.4" className="text-[10px] font-black uppercase tracking-widest">{p.label}</text>
                                    </g>
                                ))}
                            </svg>

                            <div className="absolute top-6 left-8 flex items-center gap-2">
                                <div className="size-2 rounded-full bg-primary animate-pulse"></div>
                                <span className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">En Direct • GNF / Heure</span>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        {isLoading ? (
                            <Card className="rounded-2xl border border-border shadow-sm p-0 overflow-hidden bg-card">
                                <div className="p-6 border-b border-border">
                                    <Skeleton className="h-6 w-1/2" />
                                </div>
                                <div className="divide-y divide-border/50">
                                    {[1, 2, 3, 4].map(i => <TableRowSkeleton key={i} />)}
                                </div>
                            </Card>
                        ) : hasError ? (
                            <ErrorState />
                        ) : (
                            <DataTable
                                title="Dernières Commandes"
                                columns={orderColumns}
                                data={recentOrders}
                                actions={
                                    <button className="text-xs font-bold text-primary hover:underline uppercase tracking-widest">Voir tout</button>
                                }
                            />
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap gap-6 items-start">
                    <div className="flex-1 bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-10 rounded-2xl text-primary-foreground relative overflow-hidden shadow-xl shadow-primary/20 group">
                        <div className="relative z-10">
                            <h4 className="text-2xl font-bold tracking-tight italic">Booster votre croissance</h4>
                            <p className="mt-3 text-primary-foreground/80 max-w-md font-medium leading-relaxed">
                                {insights?.global_trend || "Utilisez nos nouveaux outils d'analyse pour comprendre les habitudes d'achat."}
                            </p>
                            <div className="mt-6 space-y-2">
                                {insights?.recommendations?.map((rec, i) => (
                                    <div key={i} className="flex items-center gap-2 text-xs font-bold bg-white/10 p-2 rounded-lg">
                                        <ShieldCheck className="size-3" />
                                        <span>{rec.name}: {rec.insight}</span>
                                    </div>
                                ))}
                            </div>
                            <Button variant="secondary" className="mt-8 px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform shadow-xl">Calculer de nouveaux Insights</Button>
                        </div>
                        <BarChart3 className="absolute -right-6 -bottom-6 size-48 opacity-10 rotate-12 transition-transform group-hover:rotate-0 duration-700" />
                    </div>

                    <div className="w-full lg:w-96 bg-card p-8 rounded-2xl border border-border shadow-sm">
                        <h4 className="font-bold text-foreground mb-6 uppercase text-xs tracking-widest border-b border-border pb-4">Statut des Stocks</h4>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                                    <span className="text-muted-foreground">Disponibilité globale</span>
                                    <span className="text-emerald-500">85%</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '85%' }}></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                                    <span className="text-muted-foreground">En réapprovisionnement</span>
                                    <span className="text-amber-500">12%</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '12%' }}></div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 p-4 bg-muted/30 rounded-xl border border-border/50">
                            <p className="text-[10px] text-muted-foreground font-medium italic">Astuce : Un stock à 90% augmente la satisfaction client de 15%.</p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default VendorDashboard;

