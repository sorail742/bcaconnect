import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import DataTable from '../components/ui/DataTable';
import StatusBadge from '../components/ui/StatusBadge';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';
import { Skeleton, TableRowSkeleton, CardSkeleton } from '../components/ui/Loader';
import { ErrorState, EmptyState } from '../components/ui/StatusStates';
import { toast } from 'sonner';
import {
    Calendar,
    Download,
    TrendingUp,
    Clock,
    PackageCheck,
    Search,
    ChevronRight,
    ChevronDown,
    ShoppingBag,
    Filter,
    X,
    RefreshCw,
    XCircle,
    ShieldCheck
} from 'lucide-react';
import orderService from '../services/orderService';

const UserOrders = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [activeFilter, setActiveFilter] = useState('Tout');
    const [searchQuery, setSearchQuery] = useState('');
    const [isCancelling, setIsCancelling] = useState(null); // ID de la commande en cours d'annulation

    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        setHasError(false);
        try {
            const data = await orderService.getMyOrders();
            // Le backend retourne { orders: [...], total, pages } — on s'adapte
            const list = Array.isArray(data) ? data : (data?.orders || []);
            setOrders(list);
        } catch (err) {
            console.error("Erreur chargement commandes:", err);
            setHasError(true);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    // ── Annuler une commande avec remboursement automatique ───────────────────
    const handleStatusUpdate = async (orderId, newStatus) => {
        if (newStatus === 'annulé') {
            const confirmed = window.confirm('Confirmer l\'annulation ? Le montant sera remboursé dans votre portefeuille.');
            if (!confirmed) return;
        }
        setIsCancelling(orderId);
        try {
            await orderService.updateOrderStatus(orderId, newStatus);
            toast.success(`Commande ${newStatus === 'annulé' ? 'annulée' : 'mise à jour'}. ${newStatus === 'annulé' ? 'Remboursement en cours.' : ''}`);
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, statut: newStatus } : o));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Impossible de mettre à jour la commande.');
        } finally {
            setIsCancelling(null);
        }
    };

    const filters = ["Tout", "en_attente_paiement", "payé", "expédié", "livré", "annulé"];

    const getStatusVariant = (status) => {
        switch (status) {
            case 'payé': return 'success';
            case 'expédié': return 'primary';
            case 'livré': return 'success';
            case 'annulé': return 'danger';
            case 'en_attente':
            case 'en_attente_paiement': return 'warning';
            default: return 'neutral';
        }
    };

    const filteredOrders = orders.filter(o =>
        (activeFilter === 'Tout' || o.statut === activeFilter) &&
        (String(o.id || '').toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const stats = [
        {
            title: 'Dépenses Totales',
            value: `${orders.reduce((acc, o) => acc + parseFloat(o.total_ttc || 0), 0).toLocaleString('fr-GN')} GNF`,
            icon: TrendingUp,
            color: 'text-primary'
        },
        {
            title: 'Commandes Actives',
            value: orders.filter(o => o.statut !== 'livré' && o.statut !== 'annulé').length.toString(),
            icon: PackageCheck,
            color: 'text-amber-500'
        },
        {
            title: 'Total Commandes',
            value: orders.length.toString(),
            icon: Clock,
            color: 'text-slate-400'
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
            label: 'ID Commande',
            render: (row) => (
                <div className="flex items-center gap-4 py-2">
                    <div className="size-11 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-100 dark:border-slate-800 transition-transform group-hover:scale-110 group-hover:bg-primary group-hover:text-white group-hover:border-primary">
                        <ShoppingBag className="size-5" />
                    </div>
                    <div>
                        <span className="font-black text-slate-900 dark:text-white text-xs tracking-tight italic">#{(row.id || '...').slice(0, 8).toUpperCase()}</span>
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mt-0.5">{row.details?.length || 0} Article(s)</p>
                    </div>
                </div>
            )
        },
        {
            label: 'Horodatage',
            render: (row) => (
                <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-black italic text-slate-900 dark:text-white uppercase tracking-tight">{new Date(row.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    <div className="flex items-center gap-1.5 opacity-60">
                        <Clock className="size-3" />
                        <span className="text-[10px] font-bold text-slate-400">{new Date(row.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                </div>
            )
        },
        {
            label: 'Investissement',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="text-sm font-black text-slate-900 dark:text-white italic tracking-tighter">{parseFloat(row.total_ttc).toLocaleString('fr-GN')} <span className="text-[10px] not-italic text-primary">GNF</span></span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="size-1 rounded-full bg-emerald-500" />
                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">Taxes Incluses</span>
                    </div>
                </div>
            )
        },
        {
            label: 'État Actuel',
            render: (row) => (
                <div className="flex justify-start">
                     <StatusBadge status={row.statut} variant={getStatusVariant(row.statut)} className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border-2" />
                </div>
            )
        },
        {
            label: 'Actions',
            render: (row) => (
                <div className="flex items-center justify-end gap-5">
                    {row.statut === 'payé' && (
                        <button
                            disabled={isCancelling === row.id}
                            onClick={(e) => { e.stopPropagation(); handleStatusUpdate(row.id, 'annulé'); }}
                            className="text-[9px] font-black text-slate-400 hover:text-rose-500 transition-all uppercase tracking-[0.2em] italic underline decoration-2 decoration-rose-500/0 hover:decoration-rose-500/100"
                        >
                            {isCancelling === row.id ? 'Annulation...' : 'Rembourser'}
                        </button>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openOrderDetails(row)}
                        className="h-10 px-5 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] text-slate-900 dark:text-white hover:bg-slate-950 dark:hover:bg-white hover:text-white dark:hover:text-slate-950 border-2 border-slate-100 dark:border-slate-800 transition-all flex items-center gap-2 group/btn shadow-sm"
                    >
                        Expertise
                        <ChevronRight className="size-3 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <DashboardLayout title="Historique des Commandes">
            <div className="w-full space-y-12 animate-in fade-in duration-1000 font-inter pb-24 px-6 md:px-10 pt-10">
                {/* ══════════════════════════════════════════════════
                    SECTION 1 — EXECUTIVE HEADER
                ══════════════════════════════════════════════════ */}
                <div className="flex flex-col gap-4 border-b border-slate-100 dark:border-slate-800 pb-10">
                    <div className="flex items-center gap-3">
                        <div className="size-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Tableau de Bord Client Premium</span>
                    </div>
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
                        <div className="space-y-3">
                            <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter italic">
                                Mes <span className="text-primary italic">Commandes</span>
                            </h1>
                            <p className="text-slate-500 text-sm font-bold max-w-2xl leading-relaxed">
                                Suivez vos acquisitions BCA en temps réel. Gérez vos expéditions, factures et remboursements depuis votre interface sécurisée.
                            </p>
                        </div>
                        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900 p-2 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-inner">
                             <div className="flex flex-col items-center px-6 py-2 border-r border-slate-200 dark:border-slate-800">
                                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Actives</span>
                                 <span className="text-xl font-black italic text-primary">{orders.filter(o => o.statut !== 'livré' && o.statut !== 'annulé').length}</span>
                             </div>
                             <div className="flex flex-col items-center px-6 py-2">
                                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total</span>
                                 <span className="text-xl font-black italic text-slate-900 dark:text-white">{orders.length}</span>
                             </div>
                        </div>
                    </div>
                </div>

                {/* ══════════════════════════════════════════════════
                    SECTION 2 — EXECUTIVE STATS
                ══════════════════════════════════════════════════ */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {isLoading ? (
                        [1, 2, 3].map(i => <CardSkeleton key={i} />)
                    ) : (
                        stats.map((stat, idx) => (
                            <div key={idx} className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/40 dark:shadow-none group hover:border-primary/40 transition-all duration-500 relative overflow-hidden">
                                <div className="absolute top-0 right-0 size-24 bg-primary/5 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-primary/10 transition-colors" />
                                <div className="flex justify-between items-start mb-8">
                                    <div className={cn("size-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700 transition-all duration-500 group-hover:bg-primary group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary/20", stat.color)}>
                                        <stat.icon className="size-7" />
                                    </div>
                                    <div className="flex items-center gap-1 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/10">
                                        <TrendingUp className="size-3 text-emerald-500" />
                                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">+12%</span>
                                    </div>
                                </div>
                                <div className="space-y-1 relative z-10">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">{stat.title}</p>
                                    <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter italic">{stat.value}</h4>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Filter & Search Bar — Premium Surface */}
                <div className="rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-2xl shadow-slate-200/30 dark:shadow-none bg-white dark:bg-slate-900">
                    <div className="p-10 border-b border-slate-50 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                        <div className="flex items-center gap-4 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide">
                            {filters.map((filter, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveFilter(filter)}
                                    className={cn(
                                        "px-7 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all whitespace-nowrap border-2",
                                        activeFilter === filter
                                            ? "bg-slate-950 dark:bg-white text-white dark:text-slate-950 border-slate-950 dark:border-white shadow-xl shadow-slate-950/20 dark:shadow-white/10 scale-105"
                                            : "bg-slate-50/50 dark:bg-slate-900/50 border-transparent text-slate-400 hover:border-primary/30 hover:text-primary hover:bg-white dark:hover:bg-slate-800"
                                    )}
                                >
                                    {filter === 'Tout' ? 'Tous les statuts' : filter.replace(/_/g, ' ')}
                                </button>
                            ))}
                        </div>
  
                        <div className="relative group/search w-full lg:w-96">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 size-5 group-focus-within/search:text-primary transition-colors" />
                            <input
                                className="w-full pl-14 pr-6 h-14 bg-slate-50 dark:bg-slate-800 border-transparent focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all rounded-[1.5rem] text-sm font-bold placeholder:text-slate-400/70 shadow-inner"
                                placeholder="Recherche par ID de commande..."
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
                            <div className="p-20 text-center">
                                <ErrorState />
                            </div>
                        ) : filteredOrders.length > 0 ? (
                            <DataTable
                                columns={columns}
                                data={filteredOrders}
                                className="border-none shadow-none"
                            />
                        ) : (
                            <div className="p-20">
                                <EmptyState
                                    title="Silence radio"
                                    description="Aucune commande ne correspond à vos critères de recherche pour le moment."
                                    icon={ShoppingBag}
                                />
                            </div>
                        )}
                    </CardContent>
                </div>

                {/* ══════════════════════════════════════════════════
                    SECTION 3 — PREMIUM INVOICE MODAL
                ══════════════════════════════════════════════════ */}
                {isModalOpen && selectedOrder && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-xl animate-in fade-in duration-500">
                        <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] overflow-hidden border border-slate-200/50 dark:border-slate-800 animate-in zoom-in-95 duration-500 relative">
                            {/* Decorative background element */}
                            <div className="absolute top-0 right-0 size-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32" />
                            
                            <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-6">
                                    <div className="size-16 rounded-[1.5rem] bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20 rotate-3">
                                        <PackageCheck className="size-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter italic">Expertise Commande</h3>
                                        <div className="flex items-center gap-3 mt-1.5">
                                            <span className="text-[11px] font-black text-primary uppercase tracking-[0.2em]">#{(selectedOrder.id || '').slice(0, 12).toUpperCase()}</span>
                                            <div className="size-1 rounded-full bg-slate-300" />
                                            <StatusBadge status={selectedOrder.statut} variant={getStatusVariant(selectedOrder.statut)} className="px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border-2" />
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="size-12 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 transition-colors">
                                    <X className="size-6" />
                                </button>
                            </div>
 
                            <div className="p-12 space-y-12 max-h-[65vh] overflow-y-auto scrollbar-hide relative z-10">
                                {/* Logistic Dispatch */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">
                                             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic">01. Logistique de Livraison</span>
                                        </div>
                                    </div>
                                    <div className="p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20 grid grid-cols-2 gap-10">
                                        <div className="space-y-2">
                                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">Destinataire Final</p>
                                            <p className="text-sm font-black text-slate-900 dark:text-white uppercase italic tracking-tight">{selectedOrder.nom_destinataire || 'Client BCA'}</p>
                                        </div>
                                        <div className="space-y-2 text-right">
                                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">Canal Mobile</p>
                                            <p className="text-sm font-black text-slate-900 dark:text-white italic tracking-tight">{selectedOrder.telephone_livraison || '---'}</p>
                                        </div>
                                        <div className="col-span-2 space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">Point de Chute Certifié</p>
                                            <p className="text-sm font-black text-slate-900 dark:text-white leading-relaxed italic tracking-tight">{selectedOrder.adresse_livraison || 'Libre-service (Aéroport GBE)'}</p>
                                        </div>
                                    </div>
                                </div>
 
                                {/* Asset manifest */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">
                                             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic">02. Manifeste des Articles</span>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        {selectedOrder.details?.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-6 p-6 rounded-[1.5rem] border border-slate-50 dark:border-slate-800 hover:border-primary/30 transition-all group/item bg-white dark:bg-slate-900 shadow-sm">
                                                <div className="size-16 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-100 dark:border-slate-700 transition-transform group-hover/item:scale-110">
                                                    {item.produit?.image_url ? (
                                                        <img src={item.produit.image_url} className="w-full h-full object-cover" />
                                                    ) : <ShoppingBag className="text-slate-200 size-8" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-black text-slate-900 dark:text-white text-sm truncate italic tracking-tight">{item.produit?.nom_produit || 'Article BCA Connect'}</p>
                                                    <div className="flex items-center gap-3 mt-1.5">
                                                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg">Unité × {item.quantite}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-black text-slate-900 dark:text-white text-sm italic tracking-tight">{parseFloat(item.prix_unitaire_achat).toLocaleString('fr-GN')} <span className="text-[9px] not-italic text-primary">GNF</span></p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
 
                                {/* Fiscal Settlement */}
                                <div className="pt-10 border-t border-slate-100 dark:border-slate-800 space-y-4">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Valeur Marchande (HT)</span>
                                        <span className="text-slate-900 dark:text-white font-black italic">{parseFloat(selectedOrder.total_ht || 0).toLocaleString('fr-GN')} GNF</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Taxes & Frais Service</span>
                                        <span className="text-slate-900 dark:text-white font-black italic">{parseFloat(selectedOrder.total_ttc - (selectedOrder.total_ht || 0)).toLocaleString('fr-GN')} GNF</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-6 border-t-2 border-slate-950 dark:border-white animate-in slide-in-from-bottom-2">
                                        <div className="flex flex-col">
                                             <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.3em] italic">Règlement Final</span>
                                             <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mt-1">Transaction Libérée</span>
                                        </div>
                                        <div className="flex flex-col items-end leading-none">
                                            <span className="text-3xl font-black text-primary tracking-tighter italic">{parseFloat(selectedOrder.total_ttc).toLocaleString('fr-GN')}</span>
                                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1">GNF</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
 
                            <div className="p-10 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 flex justify-between items-center relative z-10">
                                <div className="flex items-center gap-3">
                                     <ShieldCheck className="size-5 text-emerald-500 animate-pulse" />
                                     <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest italic">Certifié par l'Algorithme BCA Guard</span>
                                </div>
                                <Button onClick={() => setIsModalOpen(false)} className="rounded-[1.2rem] px-10 h-14 font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-slate-900/10 hover:scale-105 transition-transform">Fermer le Dossier</Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default UserOrders;
