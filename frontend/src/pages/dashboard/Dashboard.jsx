import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DashboardCard from '../../components/ui/DashboardCard';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import { Wallet, ShoppingBag, Star, CheckCircle, Truck, Clock } from 'lucide-react';
import { Skeleton, CardSkeleton, TableRowSkeleton } from '../../components/ui/Loader';
import { ErrorState, EmptyState } from '../../components/ui/StatusStates';
import { useAuth } from '../../hooks/useAuth';

const Dashboard = () => {
    const { user } = useAuth();
    const isLoading = false;
    const hasError = false;

    // Données adaptées au contexte guinéen
    const stats = [
        { title: 'Solde du portefeuille', value: '15.450.000 GNF', icon: Wallet, trend: 'up', trendValue: '+12%', description: 'vs mois dernier' },
        { title: 'Commandes en cours', value: '12', icon: ShoppingBag, trend: 'up', trendValue: '+2%', description: 'vs mois dernier' },
        { title: 'Points de fidélité', value: '850 pts', icon: Star, trend: 'down', trendValue: '-5%', description: 'vs mois dernier' },
    ];

    const recentOrders = [
        { id: 'CMD-GN-2024-001', date: "Aujourd'hui, 14:30", amount: '4.500.000 GNF', status: 'Livré', statusVariant: 'success' },
        { id: 'CMD-GN-2024-002', date: 'Hier, 09:15', amount: '12.990.000 GNF', status: 'En route', statusVariant: 'primary' },
        { id: 'CMD-GN-2024-003', date: '24 Oct, 16:45', amount: '890.000 GNF', status: 'Préparation', statusVariant: 'warning' },
        { id: 'CMD-GN-2024-004', date: '22 Oct, 11:20', amount: '3.200.000 GNF', status: 'Livré', statusVariant: 'success' },
    ];

    const orderColumns = [
        {
            label: 'Commande',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                        {row.status === 'Livré' ? <CheckCircle className="size-5" /> : row.status === 'En route' ? <Truck className="size-5" /> : <Clock className="size-5" />}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-foreground tracking-tight">{row.id}</p>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter mt-0.5">{row.date}</p>
                    </div>
                </div>
            )
        },
        { label: 'Montant', key: 'amount' },
        {
            label: 'Statut',
            render: (row) => <StatusBadge status={row.status} variant={row.statusVariant} />
        }
    ];

    return (
        <DashboardLayout title="Tableau de bord">
            <div className="space-y-8 animate-in fade-in duration-500">
                {/* Welcome Section */}
                <div className="flex flex-col gap-1">
                    <h3 className="text-3xl font-bold tracking-tight text-foreground italic">Bienvenue, {user?.nom_complet || 'Utilisateur'} 👋</h3>
                    <p className="text-muted-foreground font-medium">Voici l'aperçu de votre activité commerciale en Guinée aujourd'hui.</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {isLoading ? (
                        [1, 2, 3].map(i => <CardSkeleton key={i} />)
                    ) : (
                        stats.map((stat, idx) => (
                            <DashboardCard key={idx} {...stat} />
                        ))
                    )}
                </div>

                {/* Main Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Quick Catalog */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-foreground">Catalogue Rapide</h3>
                            <a className="text-primary text-xs font-bold uppercase tracking-widest hover:underline" href="/catalog">Voir tout</a>
                        </div>

                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                            <button className="whitespace-nowrap bg-primary/10 border border-primary/20 text-primary px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all">Tous les produits</button>
                            {['Électronique', 'Construction', 'Alimentaire', 'Mode', 'Beauté'].map(cat => (
                                <button key={cat} className="whitespace-nowrap bg-card border border-border px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:border-primary/50 transition-all">
                                    {cat}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {[
                                { name: 'Solaire Pro 250W', price: 1850000, image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&q=80&w=300', desc: 'Panneau monocristallin haute performance.' },
                                { name: 'Ciment Guinée 50kg', price: 85000, image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=300', desc: 'Sac de ciment CPJ-35 local certifié.' },
                                { name: 'Pompe Solaire GN', price: 3450000, image: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&q=80&w=300', desc: 'Idéal pour l\'irrigation agricole locale.' },
                                { name: 'Tôles Bac 0.35mm', price: 65000, image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=300', desc: 'Toiture robuste, galvanisée à chaud.' }
                            ].map((product, idx) => (
                                <div key={idx} className="bg-card rounded-2xl border border-border p-4 flex gap-4 hover:shadow-lg transition-all cursor-pointer group hover:-translate-y-1">
                                    <div className="w-24 h-24 bg-muted rounded-xl overflow-hidden flex-shrink-0 border border-border">
                                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                    <div className="flex flex-col justify-between py-1 flex-1">
                                        <div>
                                            <h5 className="text-sm font-bold text-foreground tracking-tight">{product.name}</h5>
                                            <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 font-medium">{product.desc}</p>
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-sm font-bold text-primary italic">{product.price.toLocaleString('fr-FR')} GNF</span>
                                            <button className="size-9 bg-primary/10 text-primary rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center hover:bg-primary hover:text-primary-foreground shadow-lg shadow-primary/20">
                                                <ShoppingBag className="size-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Orders */}
                    <div className="flex flex-col">
                        {isLoading ? (
                            <Card className="rounded-[2rem] border-border overflow-hidden bg-card">
                                <div className="p-6 border-b border-border">
                                    <Skeleton className="h-6 w-1/3" />
                                </div>
                                <div className="divide-y divide-border/50">
                                    {[1, 2, 3, 4].map(i => <TableRowSkeleton key={i} />)}
                                </div>
                            </Card>
                        ) : hasError ? (
                            <ErrorState />
                        ) : (
                            <DataTable
                                title="Commandes Récentes"
                                columns={orderColumns}
                                data={recentOrders}
                                actions={
                                    <a className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest" href="/orders">Tout afficher</a>
                                }
                            />
                        )}

                        <div className="mt-6 bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-8 rounded-2xl text-primary-foreground relative overflow-hidden shadow-xl shadow-primary/20 group">
                            <div className="absolute top-0 right-0 -mr-8 -mt-8 size-40 bg-white/10 rounded-full blur-2xl transition-transform group-hover:scale-110"></div>
                            <h4 className="text-xl font-bold italic tracking-tight mb-2 relative z-10">BCA Premium</h4>
                            <p className="text-primary-foreground/80 text-xs font-medium relative z-10 leading-relaxed">Devenez membre premium et bénéficiez de la livraison gratuite sur toutes vos commandes.</p>
                            <button className="mt-6 px-6 py-2.5 bg-background text-foreground text-[10px] font-bold uppercase tracking-widest rounded-xl hover:scale-105 transition-transform shadow-xl">En savoir plus</button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Dashboard;
