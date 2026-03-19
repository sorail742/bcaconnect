import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DashboardCard from '../../components/ui/DashboardCard';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import { Wallet, ShoppingBag, Star, CheckCircle, Truck, Clock } from 'lucide-react';
import { Skeleton, CardSkeleton, TableRowSkeleton } from '../../components/ui/Loader';
import { ErrorState } from '../../components/ui/StatusStates';
import { useAuth } from '../../hooks/useAuth';
import orderService from '../../services/orderService';
import productService from '../../services/productService';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [orders, setOrders] = useState([]);
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

                setOrders(ordersData.slice(0, 4));
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
        { title: 'Solde du portefeuille', value: wallet ? `${parseFloat(wallet.solde_virtuel).toLocaleString('fr-GN')} GNF` : '0 GNF', icon: Wallet, trend: 'up', trendValue: '+0%', description: 'Disponible' },
        { title: 'Commandes en cours', value: orders.filter(o => o.statut !== 'Livré').length.toString(), icon: ShoppingBag, trend: 'up', trendValue: '+2%', description: 'Total commandes' },
        { title: 'Points de fidélité', value: user?.points_fidelite || '0 pts', icon: Star, trend: 'down', trendValue: '-0%', description: 'Points accumulés' },
    ];

    const orderColumns = [
        {
            label: 'Commande',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                        {row.statut === 'Livré' ? <CheckCircle className="size-5" /> : row.statut === 'En route' ? <Truck className="size-5" /> : <Clock className="size-5" />}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-foreground tracking-tight">#{row.id.substring(0, 8)}</p>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter mt-0.5">{new Date(row.createdAt).toLocaleDateString('fr-GN')}</p>
                    </div>
                </div>
            )
        },
        {
            label: 'Montant',
            render: (row) => <span className="font-bold">{parseFloat(row.total_ttc).toLocaleString('fr-FR')} GNF</span>
        },
        {
            label: 'Statut',
            render: (row) => {
                const variantMap = {
                    'En attente': 'warning',
                    'Payé': 'primary',
                    'En préparation': 'warning',
                    'En route': 'primary',
                    'Livré': 'success',
                    'Annulé': 'destructive'
                };
                return <StatusBadge status={row.statut} variant={variantMap[row.statut] || 'secondary'} />
            }
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
                            <Link className="text-primary text-xs font-bold uppercase tracking-widest hover:underline" to="/marketplace">Voir tout</Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {isLoading ? (
                                [1, 2, 3, 4].map(i => <TableRowSkeleton key={i} />)
                            ) : (
                                quickProducts.map((product, idx) => (
                                    <Link to={`/product/${product.id}`} key={idx} className="bg-card rounded-2xl border border-border p-4 flex gap-4 hover:shadow-lg transition-all cursor-pointer group hover:-translate-y-1">
                                        <div className="w-24 h-24 bg-muted rounded-xl overflow-hidden flex-shrink-0 border border-border">
                                            <img
                                                src={product.images?.[0]?.url_image || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?auto=format&fit=crop&q=80&w=300'}
                                                alt={product.nom_produit}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        </div>
                                        <div className="flex flex-col justify-between py-1 flex-1">
                                            <div>
                                                <h5 className="text-sm font-bold text-foreground tracking-tight">{product.nom_produit}</h5>
                                                <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 font-medium">{product.description}</p>
                                            </div>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-sm font-bold text-primary italic">{parseFloat(product.prix_unitaire).toLocaleString('fr-FR')} GNF</span>
                                                <button className="size-9 bg-primary/10 text-primary rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center hover:bg-primary hover:text-primary-foreground shadow-lg shadow-primary/20">
                                                    <ShoppingBag className="size-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Recent Orders */}
                    <div className="flex flex-col">
                        {isLoading ? (
                            <div className="bg-card rounded-2xl border border-border overflow-hidden">
                                <div className="p-6 border-b border-border">
                                    <Skeleton className="h-6 w-1/3" />
                                </div>
                                <div className="divide-y divide-border/50">
                                    {[1, 2, 3, 4].map(i => <TableRowSkeleton key={i} />)}
                                </div>
                            </div>
                        ) : hasError ? (
                            <ErrorState />
                        ) : (
                            <DataTable
                                title="Commandes Récentes"
                                columns={orderColumns}
                                data={orders}
                                actions={
                                    <Link className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest" to="/orders">Tout afficher</Link>
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
