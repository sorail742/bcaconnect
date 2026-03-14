import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/ui/Button';
import DashboardCard from '../../components/ui/DashboardCard';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import { ShoppingBasket, CreditCard, BarChart3, MousePointer2, Plus, Package } from 'lucide-react';
import { Skeleton, CardSkeleton, TableRowSkeleton } from '../../components/ui/Loader';
import { ErrorState } from '../../components/ui/StatusStates';
import { Card } from '../../components/ui/Card';

const VendorDashboard = () => {
    const isLoading = false;
    const hasError = false;

    // Données fictives GNF
    const kpis = [
        { title: "Chiffre d'affaires", value: '12.450.000 GNF', trend: 'up', trendValue: '+12.5%', description: 'vs mois dernier', icon: CreditCard },
        { title: 'Commandes totales', value: '142', trend: 'up', trendValue: '+5.2%', description: 'vs mois dernier', icon: ShoppingBasket },
        { title: 'Panier moyen', value: '87.670 GNF', description: 'Stable', icon: BarChart3 },
        { title: 'Taux de conversion', value: '3.4%', trend: 'down', trendValue: '-1.2%', description: 'vs mois dernier', icon: MousePointer2 },
    ];

    const recentOrders = [
        { id: '#ORD-GN-2489', time: 'Il y a 2 min', amount: '1.299.000 GNF', status: 'En cours', statusType: 'warning' },
        { id: '#ORD-GN-2488', time: 'Il y a 15 min', amount: '450.000 GNF', status: 'Livré', statusType: 'success' },
        { id: '#ORD-GN-2487', time: 'Il y a 1 heure', amount: '3.205.000 GNF', status: 'Livré', statusType: 'success' },
        { id: '#ORD-GN-2486', time: 'Il y a 3 heures', amount: '129.000 GNF', status: 'Annulé', statusType: 'danger' },
    ];

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
                        <h1 className="text-3xl font-bold tracking-tight text-foreground italic">Bonjour, Ibrahima 👋</h1>
                        <p className="text-muted-foreground font-medium">Voici les performances de votre boutique en Guinée aujourd'hui.</p>
                    </div>
                    <Button
                        onClick={() => window.location.href = '/vendor/products/add'}
                        className="shadow-lg shadow-primary/20 rounded-xl font-bold"
                    >
                        <Plus className="size-4 mr-2" />
                        Nouveau Produit
                    </Button>
                </div>

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
                        <div className="relative w-full h-72 mt-4 bg-muted/30 rounded-2xl flex items-center justify-center border border-dashed border-border overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <p className="text-muted-foreground text-sm italic font-bold uppercase tracking-widest relative z-10">Graphique des ventes (SVG Dynamique)</p>
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
                            <p className="mt-3 text-primary-foreground/80 max-w-md font-medium leading-relaxed">Utilisez nos nouveaux outils d'analyse pour comprendre les habitudes d'achat de vos clients guinéens et optimiser vos stocks.</p>
                            <Button variant="secondary" className="mt-8 px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform shadow-xl">Découvrir les insights</Button>
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

