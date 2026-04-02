import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import DataTable from '../components/ui/DataTable';
import StatusBadge from '../components/ui/StatusBadge';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';
import { TableRowSkeleton, CardSkeleton } from '../components/ui/Loader';
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
    ShoppingBag,
    Filter,
    X,
    ShieldCheck,
    Activity,
    Zap,
    Sparkles,
    Satellite,
    FileText,
    MapPin,
    Smartphone
} from 'lucide-react';
import orderService from '../services/orderService';

const UserOrders = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [activeFilter, setActiveFilter] = useState('Tout');
    const [searchQuery, setSearchQuery] = useState('');
    const [isCancelling, setIsCancelling] = useState(null);

    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        setHasError(false);
        try {
            const data = await orderService.getMyOrders();
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

    const handleCancelOrder = async (orderId) => {
        const confirmed = window.confirm('CONFIRMER L\'ANNULATION ? LE MONTANT SERA REMBOURSÉ DANS VOTRE PORTEFEUILLE EXÉCUTIF.');
        if (!confirmed) return;

        setIsCancelling(orderId);
        try {
            await orderService.updateOrderStatus(orderId, 'annulé');
            toast.success('COMMANDE RÉVOQUÉE. REMBOURSEMENT INTÉGRAL EFFECTUÉ.');
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, statut: 'annulé' } : o));
        } catch (err) {
            toast.error(err.response?.data?.message || 'IMPOSSIBLE DE RÉVOQUER LA COMMANDE.');
        } finally {
            setIsCancelling(null);
        }
    };

    const filters = [
        { key: "Tout", label: "FLUX GLOBAL" },
        { key: "en_attente_paiement", label: "PENDING" },
        { key: "payé", label: "INDEXÉ" },
        { key: "expédié", label: "TRANSIT" },
        { key: "livré", label: "ARCHIVÉ" },
        { key: "annulé", label: "RÉVOQUÉ" }
    ];

    const getStatusVariant = (status) => {
        switch (status) {
            case 'payé': return 'success';
            case 'expédié': return 'primary';
            case 'livré': return 'success';
            case 'annulé': return 'danger';
            case 'en_attente_paiement': return 'warning';
            default: return 'neutral';
        }
    };

    const filteredOrders = orders.filter(o =>
        (activeFilter === 'Tout' || o.statut === activeFilter) &&
        (String(o.id || '').toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openOrderDetails = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const columns = [
        {
            label: 'IDENTIFIANT FLUX',
            render: (row) => (
                <div className="flex items-center gap-6 py-3 group/item">
                    <div className="size-14 rounded-2xl bg-white/[0.03] border-4 border-white/5 flex items-center justify-center text-slate-600 transition-all duration-700 group-hover/item:bg-[#FF6600]/10 group-hover/item:text-[#FF6600] group-hover/item:border-[#FF6600]/20 shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#FF6600]/20 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity" />
                        <ShoppingBag className="size-6 relative z-10" />
                    </div>
                    <div className="min-w-[120px]">
                        <span className="font-black text-white text-sm tracking-tighter italic uppercase pt-1 inline-block">NODE: {(row.id || '...').slice(0, 8).toUpperCase()}</span>
                        <p className="text-[10px] text-[#FF6600] font-black uppercase tracking-[0.3em] mt-2 italic opacity-60 flex items-center gap-2">
                            <Activity className="size-3" />
                            {row.details?.length || 0} UNITÉS
                        </p>
                    </div>
                </div>
            )
        },
        {
            label: 'INDEX TEMPOREL',
            render: (row) => (
                <div className="flex flex-col gap-1.5 py-1">
                    <span className="text-[12px] font-black text-white uppercase tracking-wider italic">
                        {new Date(row.createdAt).toLocaleDateString('fr-GN')}
                    </span>
                    <span className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] italic flex items-center gap-2">
                        <Clock className="size-3 text-[#FF6600]" />
                        {new Date(row.createdAt).toLocaleTimeString('fr-GN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            )
        },
        {
            label: 'INVESTISSEMENT',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="text-sm font-black text-white tracking-tighter italic uppercase tabular-nums">
                        {parseFloat(row.total_ttc).toLocaleString('fr-GN')} <small className="text-[10px] font-black text-[#FF6600] non-italic">GNF</small>
                    </span>
                </div>
            )
        },
        {
            label: 'STATUT RÉSEAU',
            render: (row) => (
                <StatusBadge status={row.statut} variant={getStatusVariant(row.statut)} className="text-[9px] font-black italic uppercase tracking-widest border-2" />
            )
        },
        {
            label: 'GOUVERNANCE',
            render: (row) => (
                <div className="flex items-center justify-end gap-6 pr-6">
                    {row.statut === 'payé' && (
                        <button
                            disabled={isCancelling === row.id}
                            onClick={(e) => { e.stopPropagation(); handleCancelOrder(row.id); }}
                            className="text-[10px] font-black text-slate-600 hover:text-rose-500 transition-all duration-700 uppercase tracking-[0.4em] italic border-b-2 border-transparent hover:border-rose-500 pb-1"
                        >
                            {isCancelling === row.id ? 'ANNULATION...' : ' RÉVOQUER'}
                        </button>
                    )}
                    <button
                        onClick={() => openOrderDetails(row)}
                        className="h-11 px-8 rounded-xl bg-white/[0.03] border-2 border-white/5 font-black text-[10px] uppercase tracking-[0.4em] text-slate-400 hover:text-white hover:border-[#FF6600]/40 transition-all duration-700 flex items-center gap-3 italic group/btn shadow-3xl"
                    >
                        DOSSIER
                        <ChevronRight className="size-4 group-hover/btn:translate-x-2 transition-transform duration-700" />
                    </button>
                </div>
            )
        }
    ];

    const totalInvested = orders.reduce((acc, o) => acc + parseFloat(o.total_ttc || 0), 0);
    const activeOrders = orders.filter(o => !['livré', 'annulé'].includes(o.statut)).length;

    return (
        <DashboardLayout title="CENTRE DE SUIVI TRANSACTIONNEL">
            <div className="w-full space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-32">

                {/* Stats Header */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div className="p-10 bg-white/[0.02] rounded-[4rem] border-4 border-white/5 shadow-3xl group relative overflow-hidden flex items-center gap-8 border-l-[16px] border-l-[#FF6600]">
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-[#FF6600]/20 group-hover:h-full transition-all duration-700 opacity-20 pointer-events-none" />
                        <div className="size-16 rounded-[1.5rem] bg-[#FF6600]/10 flex items-center justify-center text-[#FF6600] border-2 border-[#FF6600]/20 shadow-3xl group-hover:rotate-12 transition-transform duration-700 relative z-10">
                            <TrendingUp className="size-8" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-3 italic">VALEUR TOTALE INDEXÉE</p>
                            <p className="text-4xl font-black text-white uppercase italic tracking-tighter tabular-nums">{totalInvested.toLocaleString('fr-GN')} <small className="text-xs opacity-40 font-black italic">GNF</small></p>
                        </div>
                    </div>
                    <div className="p-10 bg-white/[0.02] rounded-[4rem] border-4 border-white/5 shadow-3xl group relative overflow-hidden flex items-center gap-8 border-l-[16px] border-l-amber-500">
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-amber-500/20 group-hover:h-full transition-all duration-700 opacity-20 pointer-events-none" />
                        <div className="size-16 rounded-[1.5rem] bg-amber-500/10 flex items-center justify-center text-amber-500 border-2 border-amber-500/20 shadow-3xl group-hover:rotate-12 transition-transform duration-700 relative z-10">
                            <Zap className="size-8" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-3 italic">FLUX ACTIFS</p>
                            <p className="text-4xl font-black text-white uppercase italic tracking-tighter">{activeOrders}</p>
                        </div>
                    </div>
                    <div className="p-10 bg-white/[0.02] rounded-[4rem] border-4 border-white/5 shadow-3xl group relative overflow-hidden flex items-center gap-8 border-l-[16px] border-l-slate-700">
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-white/10 group-hover:h-full transition-all duration-700 opacity-20 pointer-events-none" />
                        <div className="size-16 rounded-[1.5rem] bg-white/5 flex items-center justify-center text-slate-400 border-2 border-white/10 shadow-3xl group-hover:rotate-12 transition-transform duration-700 relative z-10">
                            <Clock className="size-8" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-3 italic">ARCHIVES RÉSEAU</p>
                            <p className="text-4xl font-black text-white uppercase italic tracking-tighter">{orders.length}</p>
                        </div>
                    </div>
                </div>

                {/* Main Table Surface */}
                <div className="bg-white/[0.01] border-4 border-white/5 rounded-[4rem] overflow-hidden shadow-3xl">
                    <div className="p-12 border-b-4 border-white/5 bg-white/[0.02] flex flex-col lg:flex-row lg:items-center justify-between gap-12">
                        <div className="flex items-center gap-6 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide py-2">
                            {filters.map((f, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveFilter(f.key)}
                                    className={cn(
                                        "px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] italic transition-all duration-700 border-4 whitespace-nowrap",
                                        activeFilter === f.key
                                            ? "bg-[#FF6600] text-white border-[#FF6600] shadow-3xl scale-110"
                                            : "bg-white/5 border-transparent text-slate-600 hover:text-white"
                                    )}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>

                        <div className="relative group w-full lg:w-[32rem]">
                            <div className="absolute inset-0 bg-gradient-to-r from-[#FF6600]/20 to-transparent blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-1000" />
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 size-6 group-focus-within:text-[#FF6600] transition-all duration-700 relative z-10" />
                            <input
                                className="w-full pl-16 pr-8 h-16 bg-white/[0.03] border-4 border-white/5 group-focus-within:border-[#FF6600]/40 rounded-2xl text-sm font-black uppercase tracking-[0.2em] italic placeholder:text-slate-700 outline-none relative z-10 transition-all duration-700 text-white"
                                placeholder="REHERCHER IDENTIFIANT RÉSEAU..."
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="p-4">
                        {isLoading ? (
                            <div className="p-12 space-y-8">
                                {[1, 2, 3, 4, 5].map(i => <TableRowSkeleton key={i} className="h-20 bg-white/[0.02] rounded-2xl" />)}
                            </div>
                        ) : hasError ? (
                            <div className="p-24 text-center">
                                <ErrorState />
                            </div>
                        ) : filteredOrders.length > 0 ? (
                            <DataTable
                                columns={columns}
                                data={filteredOrders}
                                className="bg-transparent border-0"
                            />
                        ) : (
                            <div className="py-40 text-center opacity-20 flex flex-col items-center gap-10">
                                <ShoppingBag className="size-24 animate-pulse text-slate-500" />
                                <p className="text-[12px] font-black uppercase tracking-[0.6em] italic">AUCUN FLUX IDENTIFIÉ POUR CE FILTRE</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Detailed Modal Premium Design */}
                {isModalOpen && selectedOrder && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/80 backdrop-blur-3xl animate-in fade-in duration-500">
                        <div className="bg-white group rounded-[4rem] border-x-[16px] border-[#FF6600] w-full max-w-4xl shadow-3xl animate-in zoom-in-95 duration-700 relative overflow-hidden flex flex-col lg:flex-row max-h-[90vh]">
                            <div className="absolute top-0 right-0 size-[40rem] bg-[#FF6600]/10 rounded-full blur-[150px] -mr-64 -mt-64 transition-transform group-hover:scale-125 duration-[4s]" />

                            {/* Left Side: Summary Card */}
                            <div className="lg:w-2/5 bg-black p-12 flex flex-col justify-between relative z-10">
                                <div className="space-y-12">
                                    <div className="size-24 rounded-[2.5rem] bg-[#FF6600] flex items-center justify-center text-white shadow-3xl shadow-[#FF6600]/20 rotate-3 group-hover:rotate-12 transition-transform duration-1000">
                                        <PackageCheck className="size-12" />
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-4xl font-black text-white uppercase tracking-tighter leading-none italic">DOSSIER <br /> TRANSACTION</h3>
                                        <div className="inline-flex items-center gap-4 px-6 py-2 bg-[#FF6600]/10 border-2 border-[#FF6600]/20 rounded-2xl text-[#FF6600] text-[10px] font-black uppercase tracking-[0.3em] italic">
                                            #{(selectedOrder.id || '').slice(0, 12).toUpperCase()}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-10 pt-12 border-t border-white/10">
                                    <div className="flex items-center gap-6">
                                        <div className="size-12 rounded-xl bg-white/5 flex items-center justify-center text-[#FF6600] border-2 border-white/10">
                                            <MapPin className="size-6" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.3em] italic mb-1">DESTINATION FLUX</p>
                                            <p className="text-[12px] font-black text-white uppercase italic tracking-wider leading-relaxed">{selectedOrder.adresse_livraison}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="size-12 rounded-xl bg-white/5 flex items-center justify-center text-[#FF6600] border-2 border-white/10">
                                            <Smartphone className="size-6" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.3em] italic mb-1">CANAL CONTACT</p>
                                            <p className="text-[14px] font-black text-white font-mono">{selectedOrder.telephone_livraison}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: List & Totals */}
                            <div className="flex-1 bg-white p-12 lg:p-16 flex flex-col justify-between relative z-10 overflow-hidden">
                                <button onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 size-14 rounded-2xl hover:bg-black/5 flex items-center justify-center text-slate-400 hover:text-black transition-all">
                                    <X className="size-8" />
                                </button>

                                <div className="space-y-10 flex-1 overflow-y-auto pr-6 scrollbar-hide mb-12">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <FileText className="size-5 text-[#FF6600]" />
                                            <h4 className="text-[11px] font-black text-black uppercase tracking-[0.5em] italic">COMPOSITION DE L'EXPÉDITION</h4>
                                        </div>
                                        {selectedOrder.details?.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-8 p-6 rounded-3xl border-4 border-black/5 bg-slate-50/50 group/item hover:bg-black hover:border-black transition-all duration-700 shadow-xl">
                                                <div className="size-20 rounded-2xl bg-white border-2 border-black/5 flex items-center justify-center overflow-hidden shrink-0 group-hover/item:scale-110 transition-transform duration-700">
                                                    {item.produit?.image_url ? <img src={item.produit.image_url} className="w-full h-full object-cover" /> : <ShoppingBag className="size-8 text-slate-300" />}
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    <p className="font-black text-black text-sm uppercase tracking-tighter italic group-hover/item:text-[#FF6600] transition-colors">{item.produit?.nom_produit}</p>
                                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] italic group-hover/item:text-white/40">QUANTITÉ: {item.quantite} UNITÉS</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-black text-black text-lg tracking-tighter italic uppercase tabular-nums group-hover/item:text-white">{parseFloat(item.prix_unitaire_achat).toLocaleString('fr-GN')} <small className="text-[10px] font-black text-[#FF6600] non-italic">GNF</small></p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-10 border-t-8 border-black space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.4em] italic text-slate-400">
                                            <span>VALEUR BRUTE (HT)</span>
                                            <span>{parseFloat(selectedOrder.total_ht || 0).toLocaleString('fr-GN')} GNF</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.4em] italic text-slate-400">
                                            <span>TAXE INDEXÉE (GVT)</span>
                                            <span>{parseFloat(selectedOrder.total_ttc - (selectedOrder.total_ht || 0)).toLocaleString('fr-GN')} GNF</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-end bg-black p-8 rounded-[2rem] text-white shadow-3xl">
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-black text-[#FF6600] uppercase tracking-[0.5em] italic">MONTANT TOTAL RÉGLÉ</span>
                                            <p className="text-sm font-black text-white/40 uppercase tracking-[0.2em] italic">TRANSACTION CERTIFIÉE BCA</p>
                                        </div>
                                        <div className="flex flex-col items-end leading-none">
                                            <span className="text-5xl font-black text-white tracking-tighter tabular-nums italic uppercase">{parseFloat(selectedOrder.total_ttc).toLocaleString('fr-GN')} <small className="text-xl font-black text-[#FF6600] non-italic">GNF</small></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default UserOrders;
