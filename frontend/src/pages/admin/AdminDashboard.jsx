import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/ui/Button';
import DashboardCard from '../../components/ui/DashboardCard';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import { Users, CreditCard, Package, Calendar, Download, Info, Activity, Utensils, Car, Activity as HealthIcon, ShoppingBag } from 'lucide-react';
import { Skeleton, CardSkeleton, TableRowSkeleton } from '../../components/ui/Loader';
import { ErrorState } from '../../components/ui/StatusStates';
import { Card, CardContent } from '../../components/ui/Card';

const AdminDashboard = () => {
    const isLoading = false;
    const hasError = false;

    // Données fictives GNF pour l'admin
    const stats = [
        { title: "Utilisateurs totaux", value: '12 840', icon: Users, trend: 'up', trendValue: '+5.2%', description: 'vs mois dernier' },
        { title: 'Transactions (MTD)', value: '45.200.000 GNF', icon: CreditCard, trend: 'up', trendValue: '+12.8%', description: 'vs mois dernier' },
        { title: 'Produits actifs', value: '1 420', icon: Package, trend: 'up', trendValue: '+2.4%', description: 'vs mois dernier' },
    ];

    const transactions = [
        { name: 'Apple Watch Series 9', time: 'Il y a 2 min', cat: 'Électronique', amount: '3.990.000 GNF', status: 'Succès', statusType: 'success' },
        { name: 'Le Petit Bistro Conakry', time: 'Il y a 45 min', cat: 'Alimentation', amount: '725.000 GNF', status: 'Succès', statusType: 'success' },
        { name: 'Taxi - Kaloum', time: 'Il y a 1 heure', cat: 'Transport', amount: '182.000 GNF', status: 'En attente', statusType: 'warning' },
        { name: 'Sony WH-1000XM5', time: 'Il y a 3 heures', cat: 'Électronique', amount: '3.490.000 GNF', status: 'Succès', statusType: 'success' },
        { name: 'Abonnement Gym', time: 'Il y a 5 heures', cat: 'Santé', amount: '299.000 GNF', status: 'Échoué', statusType: 'danger' },
    ];

    const transactionColumns = [
        {
            label: 'Transaction',
            render: (row) => (
                <div className="flex items-center gap-4 group transition-transform hover:translate-x-1 duration-200 cursor-default">
                    <div className="size-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                        {row.cat === 'Alimentation' ? <Utensils className="size-5" /> : row.cat === 'Transport' ? <Car className="size-5" /> : row.cat === 'Santé' ? <HealthIcon className="size-5" /> : <ShoppingBag className="size-5" />}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-bold truncate text-foreground">{row.name}</p>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">{row.time} • {row.cat}</p>
                    </div>
                </div>
            )
        },
        { label: 'Montant', key: 'amount' },
        {
            label: 'Statut',
            render: (row) => <StatusBadge status={row.status} variant={row.statusType} />
        }
    ];

    return (
        <DashboardLayout title="Tableau de bord Administrateur">
            <div className="space-y-8 animate-in fade-in duration-500">
                <header className="flex flex-wrap justify-between items-end gap-4">
                    <div>
                        <p className="text-muted-foreground font-medium">Bienvenue, voici un aperçu de l'activité globale en Guinée.</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors">
                            <Calendar className="size-4" />
                            Derniers 30 jours
                        </button>
                        <Button className="gap-2">
                            <Download className="size-4" />
                            Exporter
                        </Button>
                    </div>
                </header>

                {/* Stats Overview Cards */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {isLoading ? (
                        [1, 2, 3].map(i => <CardSkeleton key={i} />)
                    ) : (
                        stats.map((stat, idx) => (
                            <DashboardCard key={idx} {...stat} />
                        ))
                    )}
                </section>

                {/* Main Grid and Lists */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-card rounded-xl border border-border shadow-sm p-8 overflow-hidden">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-foreground">Performance Hebdomadaire</h3>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
                                <span className="text-muted-foreground font-medium">Volume de Transactions</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-3xl font-bold tracking-tight text-foreground">8.400.000 GNF</p>
                            <p className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest">+8% cette semaine</p>
                        </div>
                        <div className="mt-8 relative h-64 w-full bg-muted/30 rounded-xl flex items-center justify-center border border-dashed border-border overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <p className="text-muted-foreground text-sm italic font-bold uppercase tracking-widest relative z-10">Graphique de performance dynamique (Admin)</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6">
                        {isLoading ? (
                            <Card className="rounded-xl border border-border shadow-sm p-0 overflow-hidden">
                                <div className="p-6 border-b border-border">
                                    <Skeleton className="h-6 w-1/2" />
                                </div>
                                <div className="divide-y divide-border/50">
                                    {[1, 2, 3, 4, 5].map(i => <TableRowSkeleton key={i} />)}
                                </div>
                            </Card>
                        ) : hasError ? (
                            <ErrorState />
                        ) : (
                            <DataTable
                                title="Transactions Récentes"
                                columns={transactionColumns}
                                data={transactions}
                                actions={
                                    <a className="text-xs font-bold text-primary hover:underline uppercase tracking-widest" href="#">Voir tout</a>
                                }
                            />
                        )}

                        <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
                            <div className="flex items-start gap-4">
                                <Info className="text-primary size-5 shrink-0 mt-1" />
                                <div>
                                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Note Système</p>
                                    <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed font-medium">Les transactions échouées sont automatiquement notifiées à l'assistance pour vérification manuelle.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <footer className="mt-12 py-8 border-t border-border flex flex-wrap justify-between items-center gap-4 text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
                    <p>© 2024 BCA Connect Admin. Tous droits réservés.</p>
                    <div className="flex gap-8">
                        <a className="hover:text-primary transition-colors" href="#">Support technique</a>
                        <a className="hover:text-primary transition-colors" href="#">Documentation</a>
                    </div>
                </footer>
            </div>
        </DashboardLayout>
    );
};

export default AdminDashboard;

