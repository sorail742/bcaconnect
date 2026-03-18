import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import DataTable from '../components/ui/DataTable';
import StatusBadge from '../components/ui/StatusBadge';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';
import { Skeleton, TableRowSkeleton, CardSkeleton } from '../components/ui/Loader';
import { ErrorState, EmptyState } from '../components/ui/StatusStates';
import {
    Calendar,
    Download,
    TrendingUp,
    Clock,
    PackageCheck,
    Search,
    ChevronRight,
    ShoppingBag,
    Filter
} from 'lucide-react';
import orderService from '../services/orderService';

const UserOrders = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [activeFilter, setActiveFilter] = useState('Tout');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchOrders = async () => {
        try {
            const data = await orderService.getMyOrders();
            setOrders(data);
        } catch (err) {
            console.error("Erreur chargement commandes:", err);
            setHasError(true);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const filters = ["Tout", "payé", "expédié", "livré", "annulé"];

    const getStatusVariant = (status) => {
        switch (status) {
            case 'payé': return 'success';
            case 'expédié': return 'primary';
            case 'livré': return 'success';
            case 'annulé': return 'danger';
            case 'en_attente': return 'warning';
            default: return 'neutral';
        }
    };

    const filteredOrders = orders.filter(o =>
        (activeFilter === 'Tout' || o.statut === activeFilter) &&
        (o.id.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const stats = [
        {
            title: 'Dépenses Totales',
            value: `${orders.reduce((acc, o) => acc + parseFloat(o.total_ttc), 0).toLocaleString('fr-GN')} GNF`,
            icon: TrendingUp
        },
        {
            title: 'Commandes Actives',
            value: orders.filter(o => o.statut !== 'livré' && o.statut !== 'annulé').length.toString(),
            icon: PackageCheck
        },
        {
            title: 'Total Commandes',
            value: orders.length.toString(),
            icon: Clock
        },
    ];

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openOrderDetails = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const columns = [
        {
            label: 'Référence',
            render: (row) => (
                <div className="flex items-center gap-3 py-2">
                    <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
                        <ShoppingBag className="size-5" />
                    </div>
                    <div>
                        <span className="font-black text-foreground italic tracking-tight hover:underline cursor-pointer uppercase">{row.id.slice(0, 8)}</span>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{row.details?.length || 0} article(s)</p>
                    </div>
                </div>
            )
        },
        {
            label: 'Date d\'achat',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-foreground">{new Date(row.createdAt).toLocaleDateString('fr-FR')}</span>
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">{new Date(row.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            )
        },
        {
            label: 'Montant Total',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-black text-foreground italic">{parseFloat(row.total_ttc).toLocaleString('fr-GN')} GNF</span>
                    <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">TTC</span>
                </div>
            )
        },
        {
            label: 'État Global',
            render: (row) => <StatusBadge status={row.statut} variant={getStatusVariant(row.statut)} />
        },
        {
            label: 'Actions',
            render: (row) => (
                <div className="flex items-center justify-end gap-2">
                    {row.statut === 'payé' && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); handleStatusUpdate(row.id, 'annulé'); }}
                            className="h-10 px-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/20 transition-all"
                        >
                            Annuler
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openOrderDetails(row)}
                        className="h-10 px-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] text-primary hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all flex items-center gap-2"
                    >
                        Détails
                        <ChevronRight className="size-3" />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <DashboardLayout title="Historique des Commandes">
            <div className="w-full space-y-10 animate-in fade-in duration-700 font-inter pb-20 px-4 md:px-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                    <div className="space-y-4">
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-primary/20">Gestion des Achats</span>
                        <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tighter italic leading-none">
                            Suivez vos commandes <br />
                            <span className="text-primary not-italic text-3xl md:text-4xl">en toute transparence.</span>
                        </h2>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {isLoading ? (
                        [1, 2, 3].map(i => <CardSkeleton key={i} />)
                    ) : (
                        stats.map((stat, idx) => (
                            <div key={idx} className="bg-card p-6 rounded-3xl border border-border group hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="size-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                        <stat.icon className="size-6" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{stat.title}</p>
                                    <h4 className="text-2xl font-black italic tracking-tighter text-foreground">{stat.value}</h4>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Filter & Search Bar */}
                <Card className="rounded-[2rem] border-border overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none bg-card">
                    <div className="p-6 border-b border-border bg-muted/20 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                            {filters.map((filter, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveFilter(filter)}
                                    className={cn(
                                        "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2",
                                        activeFilter === filter
                                            ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105"
                                            : "bg-card border-border text-muted-foreground hover:border-primary/40 hover:text-primary"
                                    )}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>

                        <div className="relative group/search w-full lg:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground size-4 group-focus-within/search:text-primary transition-colors" />
                            <input
                                className="w-full pl-11 pr-4 h-12 bg-background border-border border-2 focus:border-primary/50 focus:ring-primary/20 transition-all rounded-xl text-sm font-bold placeholder:text-muted-foreground/50"
                                placeholder="Rechercher par ID..."
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="divide-y divide-border/50">
                                {[1, 2, 3, 4, 5].map(i => <TableRowSkeleton key={i} />)}
                            </div>
                        ) : hasError ? (
                            <div className="p-10 text-center">
                                <ErrorState />
                            </div>
                        ) : filteredOrders.length > 0 ? (
                            <DataTable
                                columns={columns}
                                data={filteredOrders}
                                className="border-none shadow-none"
                            />
                        ) : (
                            <div className="p-10">
                                <EmptyState
                                    title="Aucune commande"
                                    description="Vous n'avez pas encore passé de commande."
                                    icon={ShoppingBag}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Modal de Détails Premium */}
                {isModalOpen && selectedOrder && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300">
                        <div className="bg-card w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-border animate-in zoom-in-95 duration-300">
                            <div className="p-8 border-b border-border bg-muted/20 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="size-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20">
                                        <PackageCheck className="size-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black italic tracking-tighter">Détails Commande #{selectedOrder.id.slice(0, 8)}</h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-0.5">Statut: {selectedOrder.statut}</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="size-10 rounded-xl hover:bg-muted flex items-center justify-center transition-colors">
                                    <ChevronDown className="size-5" />
                                </button>
                            </div>

                            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
                                {/* Livraison */}
                                <div className="space-y-4">
                                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                                        <TrendingUp className="size-3" /> Livraison & Contact
                                    </h4>
                                    <div className="p-6 rounded-2xl bg-muted/30 border border-border space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground font-medium uppercase tracking-tighter text-[10px]">Destinataire</span>
                                            <span className="font-black italic text-foreground text-xs">{selectedOrder.nom_destinataire || 'Non renseigné'}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground font-medium uppercase tracking-tighter text-[10px]">Téléphone</span>
                                            <span className="font-black italic text-foreground text-xs">{selectedOrder.telephone_livraison || 'Non renseigné'}</span>
                                        </div>
                                        <div className="h-px bg-border my-2"></div>
                                        <div className="space-y-1">
                                            <span className="text-muted-foreground font-medium uppercase tracking-tighter text-[10px]">Adresse complète</span>
                                            <p className="text-xs font-bold leading-relaxed">{selectedOrder.adresse_livraison || 'Non renseignée'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Articles */}
                                <div className="space-y-4">
                                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                                        <ShoppingBag className="size-3" /> Articles Commandés
                                    </h4>
                                    <div className="space-y-3">
                                        {selectedOrder.details?.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
                                                <div className="size-14 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
                                                    {item.produit?.images?.[0] ? (
                                                        <img src={item.produit.images[0].url_image} className="w-full h-full object-cover" />
                                                    ) : <ShoppingBag className="text-muted-foreground size-6" />}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-sm truncate">{item.produit?.nom_produit || 'Produit inconnu'}</p>
                                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Qté: {item.quantite}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-black text-sm italic">{parseFloat(item.prix_unitaire_achat).toLocaleString('fr-GN')} GNF</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 border-t border-border bg-muted/20 flex justify-end">
                                <Button onClick={() => setIsModalOpen(false)} className="rounded-xl px-10 font-black uppercase tracking-widest text-[10px]">Fermer</Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default UserOrders;
