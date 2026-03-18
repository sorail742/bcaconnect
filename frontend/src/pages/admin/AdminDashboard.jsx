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

const AdminDashboard = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [productsCount, setProductsCount] = useState(0);
    const [storesCount, setStoresCount] = useState(0);

    useEffect(() => {
        const fetchGlobalStats = async () => {
            try {
                const [products, stores] = await Promise.all([
                    productService.getAll(),
                    storeService.getAllStores()
                ]);
                setProductsCount(products.length);
                setStoresCount(stores.length);
            } catch (err) {
                console.error("Erreur stats admin:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchGlobalStats();
    }, []);

    const stats = [
        { title: "Utilisateurs totaux", value: '1 240', icon: Users, trend: 'up', trendValue: '+5.2%', description: 'Clients & Partenaires' },
        { title: 'Transactions (Globales)', value: '185.000.000 GNF', icon: CreditCard, trend: 'up', trendValue: '+12.8%', description: 'Volume total' },
        { title: 'Produits actifs', value: productsCount.toString(), icon: Package, trend: 'up', trendValue: '+2.4%', description: 'Catalogue multi-fournisseurs' },
    ];

    const transactions = [
        { name: 'Routeur Haute Performance', time: 'Il y a 2 min', cat: 'Électronique', amount: '8.490.000 GNF', status: 'Succès', statusType: 'success' },
        { name: 'Lot de Siment CPJ-35', time: 'Il y a 45 min', cat: 'Construction', amount: '12.500.000 GNF', status: 'Succès', statusType: 'success' },
        { name: 'Livraison Conakry-Labé', time: 'Il y a 1 heure', cat: 'Transport', amount: '450.000 GNF', status: 'En attente', statusType: 'warning' },
        { name: 'Panneaux Solaires 250W', time: 'Il y a 3 heures', cat: 'Énergie', amount: '15.000.000 GNF', status: 'Succès', statusType: 'success' },
        { name: 'Maintenance Réseau', time: 'Il y a 5 heures', cat: 'Services', amount: '2.500.000 GNF', status: 'Échoué', statusType: 'danger' },
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
                        stats.map((stat, idx) => (
                            <DashboardCard key={idx} {...stat} />
                        ))
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
                            <p className="text-3xl font-bold tracking-tight text-foreground">42.500.000 GNF</p>
                            <p className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest">+15% vs semaine dernière</p>
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
