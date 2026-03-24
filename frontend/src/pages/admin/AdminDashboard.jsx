import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/ui/Button';
import DashboardCard from '../../components/ui/DashboardCard';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import { Users, CreditCard, Package, Calendar, Download, Info, Activity, Utensils, Car, Activity as HealthIcon, ShoppingBag } from 'lucide-react';
import { Skeleton, CardSkeleton, TableRowSkeleton } from '../../components/ui/Loader';
import productService from '../../services/productService';
import storeService from '../../services/storeService';
import statService from '../../services/statService';

const AdminDashboard = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [storesCount, setStoresCount] = useState(0);

    useEffect(() => {
        const fetchGlobalStats = async () => {
            try {
                const data = await statService.getAdminStats();
                setDashboardData(data);
                if (data.overview) {
                    setStoresCount(data.overview.storesCount || 0);
                }
            } catch (err) {
                console.error("Erreur stats admin:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchGlobalStats();
    }, []);

    const stats = dashboardData?.stats || [
        { title: "Utilisateurs totaux", value: '0', icon: 'Users', trend: 'up', trendValue: '0%', description: 'Chargement...' },
        { title: 'Transactions (Globales)', value: '0 GNF', icon: 'CreditCard', trend: 'up', trendValue: '0%', description: 'Chargement...' },
        { title: 'Produits actifs', value: '0', icon: 'Package', trend: 'up', trendValue: '0%', description: 'Chargement...' },
    ];

    const transactions = dashboardData?.recentTransactions || [];


    const transactionColumns = [
        {
            label: 'Transaction',
            render: (row) => (
                <div className="flex items-center gap-4 group transition-transform hover:translate-x-1 duration-200 cursor-default">
                    <div className="size-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                        {row.cat === 'Alimentation' ? <Utensils className="size-5" /> : row.cat === 'Transport' ? <Car className="size-5" /> : row.cat === 'Santé' ? <HealthIcon className="size-5" /> : row.cat === 'Vente' ? <ShoppingBag className="size-5" /> : <ShoppingBag className="size-5" />}
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
        <DashboardLayout title="Portail Administrateur BCA">
            <div className="space-y-8 animate-in fade-in duration-500">
                <header className="flex flex-wrap justify-between items-end gap-4">
                    <div>
                        <p className="text-muted-foreground font-medium">Gestion globale de la marketplace BCA Connect Guinée.</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors">
                            <Calendar className="size-4" />
                            Derniers 30 jours
                        </button>
                        <Button className="gap-2">
                            <Download className="size-4" />
                            Rapport PDF
                        </Button>
                    </div>
                </header>

                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {isLoading ? (
                        [1, 2, 3].map(i => <CardSkeleton key={i} />)
                    ) : (
                        stats.map((stat, idx) => {
                            const Icon = stat.icon === 'Users' ? Users : stat.icon === 'CreditCard' ? CreditCard : Package;
                            return <DashboardCard key={idx} {...stat} icon={Icon} />;
                        })
                    )}
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-card rounded-xl border border-border shadow-sm p-8 overflow-hidden">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-foreground">Volume d'Affaires Hebdomadaire</h3>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
                                <span className="text-muted-foreground font-medium">BCA Guinée Network</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-3xl font-bold tracking-tight text-foreground">{dashboardData?.weeklyChart?.total?.toLocaleString() || '0'} GNF</p>
                            <p className={`${(dashboardData?.weeklyChart?.delta || 0) >= 0 ? 'text-emerald-500' : 'text-rose-500'} text-[10px] font-bold uppercase tracking-widest`}>
                                {(dashboardData?.weeklyChart?.delta || 0) >= 0 ? '+' : ''}{dashboardData?.weeklyChart?.delta || '0'}% vs mois dernier
                            </p>
                        </div>
                        <div className="mt-8 relative h-64 w-full bg-muted/30 rounded-xl flex items-center justify-center border border-dashed border-border overflow-hidden group font-black italic uppercase tracking-[0.2em] text-muted-foreground">
                            Chart: Distribution Géographique des Ventes
                        </div>
                    </div>

                    <div className="flex flex-col gap-6">
                        {isLoading ? (
                            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
                                <Skeleton className="h-6 w-1/2" />
                                <div className="divide-y divide-border/50">
                                    {[1, 2, 3, 4, 5].map(i => <TableRowSkeleton key={i} />)}
                                </div>
                            </div>
                        ) : (
                            <DataTable
                                title="Transactions Globales"
                                columns={transactionColumns}
                                data={transactions}
                                actions={
                                    <button className="text-xs font-bold text-primary hover:underline uppercase tracking-widest">Auditer tout</button>
                                }
                            />
                        )}

                        <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
                            <div className="flex items-start gap-4">
                                <Info className="text-primary size-5 shrink-0 mt-1" />
                                <div>
                                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Monitoring</p>
                                    <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed font-medium">Le système surveille actuellement {storesCount} boutiques partenaires actives sur tout le territoire.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminDashboard;
