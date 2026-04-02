import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import {
    Search,
    ListOrdered,
    Clock,
    Wallet,
    Package,
    CheckCircle2,
    XCircle,
    RotateCcw,
    RefreshCw,
    ChevronRight,
    ArrowUpRight,
    Filter,
    Truck,
    CircleDashed,
    ShoppingBag,
    TrendingUp,
    Activity,
    Satellite,
    Zap,
    Sparkles
} from 'lucide-react';
import orderService from '../../services/orderService';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import { Button } from '../../components/ui/Button';

const OrdersVendor = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('Tous');
    const [search, setSearch] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);

    const STATUS_FILTERS = [
        { key: 'Tous', label: 'FLUX GLOBAL' },
        { key: 'en_attente', label: 'ATTENTE' },
        { key: 'confirme', label: 'CONFIRMÉ' },
        { key: 'prepare', label: 'PRÉPARÉ' },
        { key: 'expedie', label: 'EXPÉDIÉ' },
        { key: 'livre', label: 'LIVRÉ' },
        { key: 'annule', label: 'ANNULÉ' }
    ];

    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await orderService.getVendorOrders();
            setOrders(data.orders || []);
        } catch (err) {
            toast.error("ÉCHEC DE LA RÉCUPÉRATION DES COMMANDES.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleStatusUpdate = async (itemId, newStatus) => {
        try {
            await orderService.updateItemStatus(itemId, newStatus);
            toast.success(`STATUT MIS À JOUR : ${newStatus.toUpperCase()}`);
            fetchOrders();
        } catch (err) {
            toast.error("ERREUR LORS DE LA MISE À JOUR DU STATUT.");
        }
    };

    const getStatusVariant = (status) => {
        switch (status) {
            case 'en_attente': return 'warning';
            case 'confirme': return 'info';
            case 'prepare': return 'info';
            case 'expedie': return 'primary';
            case 'livre': return 'success';
            case 'annule': return 'danger';
            case 'retourne': return 'danger';
            default: return 'neutral';
        }
    };

    const filtered = orders.filter((o) => {
        const matchStatus = activeFilter === 'Tous' || o.statut === activeFilter;
        const matchSearch =
            o.commande_id.toLowerCase().includes(search.toLowerCase()) ||
            o.Order?.User?.nom_complet.toLowerCase().includes(search.toLowerCase()) ||
            o.produit?.nom_produit.toLowerCase().includes(search.toLowerCase());
        return matchStatus && matchSearch;
    });

    const columns = [
        {
            label: 'DESIGNATION FLUX',
            render: (row) => (
                <div className="flex items-center gap-6 py-3 group/item">
                    <div className="size-16 rounded-2xl bg-white/[0.03] border-4 border-white/5 flex items-center justify-center overflow-hidden shrink-0 group-hover/item:scale-110 group-hover/item:rotate-3 transition-all duration-700 shadow-2xl relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#FF6600]/20 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity" />
                        {row.produit?.image_url ? (
                            <img src={row.produit.image_url} className="w-full h-full object-cover relative z-10" alt="" />
                        ) : (
                            <Package className="size-8 text-slate-700" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-black text-white uppercase tracking-tighter leading-none mb-2 italic truncate max-w-[200px] pt-1 group-hover/item:text-[#FF6600] transition-colors">
                            {row.produit?.nom_produit}
                        </p>
                        <p className="text-[10px] font-black text-[#FF6600] uppercase tracking-[0.3em] leading-none italic opacity-60">
                            NODE: {row.commande_id.slice(0, 8).toUpperCase()}
                        </p>
                    </div>
                </div>
            )
        },
        {
            label: 'OPÉRATEUR RÉSEAU',
            render: (row) => (
                <div className="flex flex-col gap-1.5 py-1">
                    <span className="text-[12px] font-black text-white uppercase tracking-wider italic">
                        {row.Order?.User?.nom_complet?.toUpperCase()}
                    </span>
                    <span className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] italic flex items-center gap-2">
                        <Activity className="size-3 text-[#FF6600]" />
                        {row.Order?.User?.telephone}
                    </span>
                </div>
            )
        },
        {
            label: 'VOLUME',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-white italic tracking-tighter uppercase tabular-nums">x{row.quantite}</span>
                    <div className="size-1.5 rounded-full bg-[#FF6600]/40" />
                </div>
            )
        },
        {
            label: 'TOTAL GNF',
            render: (row) => (
                <span className="text-sm font-black text-white tracking-tighter italic tabular-nums uppercase">
                    {(row.prix_unitaire_achat * row.quantite).toLocaleString('fr-GN')} <small className="text-[10px] font-black text-[#FF6600] non-italic">GNF</small>
                </span>
            )
        },
        {
            label: 'STATUT CANAL',
            render: (row) => (
                <StatusBadge status={row.statut} variant={getStatusVariant(row.statut)} className="text-[9px] font-black italic uppercase tracking-widest border-2" />
            )
        },
        {
            label: 'GOUVERNANCE',
            render: (row) => (
                <div className="flex items-center justify-end gap-4 pr-6">
                    {row.statut === 'en_attente' && (
                        <button onClick={() => handleStatusUpdate(row.id, 'confirme')}
                            className="size-11 bg-white/[0.03] border-2 border-white/5 rounded-xl flex items-center justify-center text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all duration-700 shadow-3xl hover:scale-110 active:scale-95 group/confirm"
                            title="Confirmer">
                            <CheckCircle2 className="size-5 group-hover/confirm:scale-110" />
                        </button>
                    )}
                    {row.statut === 'confirme' && (
                        <button onClick={() => handleStatusUpdate(row.id, 'prepare')}
                            className="size-11 bg-[#FF6600]/10 border-2 border-[#FF6600]/20 rounded-xl flex items-center justify-center text-[#FF6600] hover:bg-[#FF6600] hover:text-white transition-all duration-700 shadow-3xl hover:scale-110 active:scale-95 group/prepare"
                            title="Prêt">
                            <Package className="size-5 group-hover/prepare:animate-pulse" />
                        </button>
                    )}
                    {['en_attente', 'confirme', 'prepare'].includes(row.statut) && (
                        <button onClick={() => handleStatusUpdate(row.id, 'annule')}
                            className="size-11 bg-white/[0.03] border-2 border-white/5 rounded-xl flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-all duration-700 shadow-3xl hover:scale-110 active:scale-95 group/cancel"
                            title="Annuler">
                            <XCircle className="size-5 group-hover/cancel:rotate-90" />
                        </button>
                    )}
                </div>
            )
        }
    ];

    return (
        <DashboardLayout title="CENTRE LOGISTIQUE TRANSACTIONNEL">
            <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-20">

                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div className="p-10 bg-white/[0.02] rounded-[4rem] border-4 border-white/5 shadow-3xl group relative overflow-hidden flex items-center gap-8 border-l-[16px] border-l-[#FF6600]">
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-[#FF6600]/20 group-hover:h-full transition-all duration-700 opacity-20 pointer-events-none" />
                        <div className="size-16 rounded-[1.5rem] bg-[#FF6600]/10 flex items-center justify-center text-[#FF6600] border-2 border-[#FF6600]/20 shadow-3xl group-hover:rotate-12 transition-transform duration-700 relative z-10">
                            <ListOrdered className="size-8" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-3 italic">FLUX TOTAL</p>
                            <p className="text-4xl font-black text-white uppercase italic tracking-tighter">{orders.length}</p>
                        </div>
                    </div>
                    <div className="p-10 bg-white/[0.02] rounded-[4rem] border-4 border-white/5 shadow-3xl group relative overflow-hidden flex items-center gap-8 border-l-[16px] border-l-amber-500">
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-amber-500/20 group-hover:h-full transition-all duration-700 opacity-20 pointer-events-none" />
                        <div className="size-16 rounded-[1.5rem] bg-amber-500/10 flex items-center justify-center text-amber-500 border-2 border-amber-500/20 shadow-3xl group-hover:rotate-12 transition-transform duration-700 relative z-10">
                            <Clock className="size-8" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-3 italic">EN ATTENTE</p>
                            <p className="text-4xl font-black text-white uppercase italic tracking-tighter">{orders.filter(o => o.statut === 'en_attente').length}</p>
                        </div>
                    </div>
                    <div className="p-10 bg-white/[0.02] rounded-[4rem] border-4 border-white/5 shadow-3xl group relative overflow-hidden flex items-center gap-8 border-l-[16px] border-l-emerald-500">
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-emerald-500/20 group-hover:h-full transition-all duration-700 opacity-20 pointer-events-none" />
                        <div className="size-16 rounded-[1.5rem] bg-emerald-500/10 flex items-center justify-center text-emerald-500 border-2 border-emerald-500/20 shadow-3xl group-hover:rotate-12 transition-transform duration-700 relative z-10">
                            <Wallet className="size-8" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-3 italic">VALEUR LIVRÉE</p>
                            <p className="text-4xl font-black text-white uppercase italic tracking-tighter tabular-nums">{orders.filter(o => o.statut === 'livre').reduce((acc, o) => acc + (o.prix_unitaire_achat * o.quantite), 0).toLocaleString('fr-GN')} <small className="text-xs opacity-40 font-black italic">GNF</small></p>
                        </div>
                    </div>
                </div>

                {/* Filter & Search Surface */}
                <div className="bg-white/[0.01] border-4 border-white/5 rounded-[4rem] overflow-hidden shadow-3xl">
                    <div className="p-12 border-b-4 border-white/5 bg-white/[0.02] flex flex-col lg:flex-row lg:items-center justify-between gap-12">
                        <div className="flex items-center gap-6 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide py-2">
                            {STATUS_FILTERS.map((f) => (
                                <button
                                    key={f.key}
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
                                placeholder="CLIENT, PRODUIT, RÉFÉRENCE..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="p-4">
                        <DataTable
                            selectable
                            selectedIds={selectedIds}
                            onSelectionChange={setSelectedIds}
                            columns={columns}
                            data={filtered}
                            isLoading={isLoading}
                            className="bg-transparent border-0"
                        />

                        {!isLoading && filtered.length === 0 && (
                            <div className="py-40 text-center opacity-20 flex flex-col items-center gap-10">
                                <ShoppingBag className="size-24 animate-pulse text-slate-500" />
                                <p className="text-[12px] font-black uppercase tracking-[0.6em] italic">AUCUN FLUX TRANSACTIONNEL IDENTIFIÉ</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bulk Action Button */}
                {selectedIds.length > 0 && (
                    <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-20 duration-700">
                        <button
                            onClick={async () => {
                                for (const id of selectedIds) {
                                    await handleStatusUpdate(id, 'confirme');
                                }
                                setSelectedIds([]);
                            }}
                            className="h-20 px-12 rounded-[2rem] bg-[#FF6600] text-white shadow-3xl shadow-[#FF6600]/30 font-black text-xs uppercase tracking-[0.4em] border-0 flex items-center gap-6 italic hover:scale-110 active:scale-95 transition-all duration-700 group/bulk"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/bulk:animate-[shimmer_2s_infinite]" />
                            <CheckCircle2 className="size-6 relative z-10" />
                            <span className="relative z-10 pt-1">CONFIRMER {selectedIds.length} FLUX SÉLECTIONNÉS</span>
                        </button>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default OrdersVendor;
