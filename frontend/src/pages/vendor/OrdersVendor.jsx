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
    RefreshCw,
    Activity,
    ShoppingBag,
    ShieldCheck
} from 'lucide-react';
import orderService from '../../services/orderService';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import DashboardCard from '../../components/ui/DashboardCard';

const OrdersVendor = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('Tous');
    const [search, setSearch] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);

    const STATUS_FILTERS = [
        { key: 'Tous', label: 'GLOBAL' },
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
            toast.error("ÉCHEC_RÉCUPÉRATION_COMMANDES_RÉSEAU.");
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
            toast.success(`STATUT_MIS_À_JOUR_ALPHA : ${newStatus.toUpperCase()}`);
            fetchOrders();
        } catch (err) {
            toast.error("ERREUR_MISE_À_JOUR_STATUT_SYSTÈME.");
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
            label: 'DÉSIGNATION_FLUX_TECH',
            render: (row) => (
                <div className="flex items-center gap-3 py-4 group/item">
                    <div className="size-6 rounded-2xl bg-foreground/5 border-2 border-foreground/10 flex items-center justify-center overflow-hidden shrink-0 group-hover/item:scale-110 group-hover/item:rotate-6 transition-all shadow-2xl relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#FFB703]/30 via-transparent to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-700" />
                        {row.produit?.image_url ? (
                            <img src={row.produit.image_url} className="w-full h-full object-cover relative z-10" alt="" />
                        ) : (
                            <Package className="size-6 text-slate-700" />
                        )}
                    </div>
                    <div className="min-w-0 space-y-2">
                        <p className="text-[14px] font-black text-foreground uppercase tracking-tighter leading-none pt-1 group-hover/item:text-[#FFB703] transition-colors truncate max-w-[200px]">
                            {row.produit?.nom_produit}
                        </p>
                        <p className="text-[10px] font-black text-[#FFB703]/60 uppercase  leading-none decoration-[#FFB703]/30 underline underline-offset-4 decoration-2">
                            ID: {row.commande_id.slice(0, 8).toUpperCase()}_SIG
                        </p>
                    </div>
                </div>
            )
        },
        {
            label: 'OPÉRATEUR_RÉSEAU_ALPHA',
            render: (row) => (
                <div className="flex flex-col gap-2 py-1">
                    <span className="text-[12px] font-black text-foreground uppercase tracking-wider">
                        {row.Order?.User?.nom_complet?.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-black uppercase  flex items-center gap-3">
                        <Activity className="size-4 text-[#FFB703]/50 animate-pulse" />
                        {row.Order?.User?.telephone}
                    </span>
                </div>
            )
        },
        {
            label: 'UNITÉS_TRANSACTÉES',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <span className="text-[14px] font-black text-foreground tracking-tighter uppercase tabular-nums">X{row.quantite}</span>
                </div>
            )
        },
        {
            label: 'VALEUR_TOTALE_GNF',
            render: (row) => (
                <span className="text-[15px] font-black text-foreground tracking-tighter tabular-nums uppercase">
                    {(row.prix_unitaire_achat * row.quantite).toLocaleString('fr-GN')} <small className="text-[10px] font-black text-[#FFB703] tracking-widest ml-1">GNF</small>
                </span>
            )
        },
        {
            label: 'CANAL_STATUT_ALPHA',
            render: (row) => (
                <StatusBadge status={row.statut} variant={getStatusVariant(row.statut)} className="text-[9px] font-black uppercase  border-none py-2 px-4 shadow-inner" />
            )
        },
        {
            label: 'GOUVERNANCE_FLUX',
            render: (row) => (
                <div className="flex items-center justify-end gap-3 pr-8">
                    {row.statut === 'en_attente' && (
                        <button id={`confirm-o-${row.id}`} onClick={() => handleStatusUpdate(row.id, 'confirme')}
                            className="size-6 bg-foreground/5 border-2 border-foreground/5 rounded-2xl flex items-center justify-center text-emerald-500 hover:bg-emerald-500 hover:text-foreground transition-all shadow-4xl  group/confirm hover:border-emerald-500/30"
                            title="CONFIRMER_FLUX">
                            <CheckCircle2 className="size-6 group-hover/confirm:scale-110 transition-transform" />
                        </button>
                    )}
                    {row.statut === 'confirme' && (
                        <button id={`prepare-o-${row.id}`} onClick={() => handleStatusUpdate(row.id, 'prepare')}
                            className="size-6 bg-[#FFB703]/10 border-2 border-[#FFB703]/20 rounded-2xl flex items-center justify-center text-[#FFB703] hover:bg-[#FFB703] hover:text-background transition-all shadow-4xl  group/prepare"
                            title="PRÉPARER_EXPÉDITION">
                            <Package className="size-6 group-hover/prepare:animate-pulse" />
                        </button>
                    )}
                    {['en_attente', 'confirme', 'prepare'].includes(row.statut) && (
                        <button id={`cancel-o-${row.id}`} onClick={() => handleStatusUpdate(row.id, 'annule')}
                            className="size-6 bg-foreground/5 border-2 border-foreground/5 rounded-2xl flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-foreground transition-all shadow-4xl  group/cancel hover:border-rose-500/30"
                            title="RÉVOQUER_FLUX">
                            <XCircle className="size-6 group-hover/cancel:rotate-90 transition-transform" />
                        </button>
                    )}
                </div>
            )
        }
    ];

    return (
        <DashboardLayout title="TERMINAL_OPÉRATEUR_LOGISTIQUE">
            <div className="space-y-6 animate-in fade-in duration-1000 pb-40 font-jakarta">

                {/* Executive Command Bar — Logistics Node */}
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 executive-card !py-8 bg-card border-[#FFB703]/20 relative overflow-hidden group/header shadow-4xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#FFB703]/5 via-transparent to-transparent opacity-0 group-hover/header:opacity-100 transition-opacity duration-1000" />
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="size-6 rounded-2xl bg-[#FFB703]/10 flex items-center justify-center text-[#FFB703] border-2 border-[#FFB703]/20 transition-all duration-700 group-hover/header:rotate-12 group-hover/header:scale-110 shadow-2xl shadow-[#FFB703]/20">
                            <ListOrdered className="size-6" />
                        </div>
                        <div className="space-y-3">
                            <h2 className="text-sm font-black text-foreground uppercase tracking-tighter leading-none">
                                COMMANDES_<span className="text-[#FFB703]">REÇUES</span>
                            </h2>
                            <p className="text-[10px] font-black text-muted-foreground uppercase  opacity-80 decoration-[#FFB703]/30 underline underline-offset-8 decoration-2">
                                GESTION_FLUX_SORTANTS_TERMINAL — SYNC_ALPHA_{new Date().toLocaleTimeString('fr-GN', { hour: '2-digit', minute: '2-digit' })}_SIG
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 relative z-10">
                        <button id="btn-refresh-orders" onClick={fetchOrders} className="size-6 bg-white/[0.03] border-2 border-foreground/5 rounded-2xl flex items-center justify-center text-muted-foreground hover:text-[#FFB703] hover:border-[#FFB703]/20 transition-all group/refresh shadow-inner ">
                            <RefreshCw className={cn("size-5 group-hover/refresh:rotate-180 transition-transform duration-1000", isLoading && "animate-spin")} />
                        </button>
                        <div className="h-12 px-10 bg-white text-background rounded-2xl flex items-center gap-3 border-none shadow-[0_20px_50px_rgba(255,255,255,0.05)]">
                             <ShieldCheck className="size-6 text-[#FFB703]" />
                             <span className="text-[10px] font-black uppercase  pt-1">RÉSEAU_SÉCURISÉ_ALPHA</span>
                        </div>
                    </div>
                </div>

                {/* KPI Area — High Density Monitoring */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="executive-card h-44 flex flex-col justify-between group/kpi border-foreground/5 hover:border-[#FFB703]/30 transition-all duration-700">
                        <div className="p-4 rounded-xl bg-white/[0.03] border border-foreground/5 text-[#FFB703] w-fit group-hover/kpi:rotate-12 transition-all duration-700 shadow-inner">
                            <ListOrdered className="size-5" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-muted-foreground uppercase  opacity-60 leading-none">DEMANDES_TOTALES_CORE</p>
                            <p className="text-sm font-black text-foreground tracking-tighter uppercase leading-none truncate group-hover/kpi:translate-x-3 transition-transform duration-700">{orders.length.toString()}</p>
                        </div>
                    </div>
                    <div className="executive-card h-44 flex flex-col justify-between group/kpi border-foreground/5 hover:border-[#FFB703]/30 transition-all duration-700">
                        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 text-amber-500 w-fit group-hover/kpi:scale-110 animate-pulse transition-all duration-700 shadow-inner">
                            <Clock className="size-5" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-muted-foreground uppercase  opacity-60 leading-none">FLUX_EN_ATTENTE_PRIORITÉ</p>
                            <p className="text-sm font-black text-amber-500 tracking-tighter uppercase leading-none truncate group-hover/kpi:translate-x-3 transition-transform duration-700">{orders.filter(o => o.statut === 'en_attente').length.toString()}</p>
                        </div>
                    </div>
                    <div className="executive-card h-44 flex flex-col justify-between group/kpi border-foreground/5 hover:border-emerald-500/30 transition-all duration-700">
                        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-500 w-fit group-hover/kpi:rotate-12 transition-all duration-700 shadow-inner">
                            <Wallet className="size-5" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-muted-foreground uppercase  opacity-60 leading-none">FLUX_LIVRÉ_VALORISÉ_ALPHA</p>
                            <p className="text-sm font-black text-emerald-500 tracking-tighter uppercase leading-none truncate group-hover/kpi:translate-x-3 transition-transform duration-700">{orders.filter(o => o.statut === 'livre').reduce((acc, o) => acc + (o.prix_unitaire_achat * o.quantite), 0).toLocaleString('fr-GN')} <small className="text-sm">GNF</small></p>
                        </div>
                    </div>
                </div>

                {/* Registry Registry — Alpha Ledger Interface */}
                <div className="executive-card !p-0 overflow-hidden shadow-4xl group/registry border-foreground/5 hover:border-[#FFB703]/20 transition-all duration-1000">
                    <div className="p-4 border-b border-foreground/5 bg-white/[0.01] flex flex-col xl:flex-row xl:items-center justify-between gap-3">
                        <div className="flex items-center gap-4 overflow-x-auto pb-4 xl:pb-0 scrollbar-hide">
                            {STATUS_FILTERS.map((f) => (
                                <button
                                    id={`filter-${f.key}`}
                                    key={f.key}
                                    onClick={() => setActiveFilter(f.key)}
                                    className={cn(
                                        "px-8 h-12 rounded-2xl text-[10px] font-black uppercase  transition-all duration-500 border-2 whitespace-nowrap  font-jakarta",
                                        activeFilter === f.key
                                            ? "bg-[#FFB703] text-background border-[#FFB703] shadow-2xl scale-105"
                                            : "bg-foreground/5 border-foreground/5 text-muted-foreground hover:text-foreground hover:bg-white/[0.08]"
                                    )}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>

                        <div className="relative group w-full xl:w-[35rem] font-jakarta">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground size-6 group-focus-within:text-[#FFB703] transition-all relative z-10" />
                            <input
                                id="orders-search"
                                className="w-full pl-16 pr-8 h-11 bg-white/[0.03] border-2 border-foreground/5 group-focus-within:border-[#FFB703]/40 rounded-2xl text-[12px] font-black  placeholder:text-slate-600 outline-none relative z-10 transition-all text-foreground uppercase"
                                placeholder="CLIENT, PRODUIT, RÉFÉRENCE_SIG..."
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
                            className="bg-transparent border-0 text-foreground"
                        />

                        {!isLoading && filtered.length === 0 && (
                            <div className="py-24 text-center opacity-40 flex flex-col items-center gap-3">
                                <div className="relative">
                                    <ShoppingBag className="size-6 text-slate-800 animate-pulse" />
                                    <Activity className="absolute -top-4 -right-4 size-6 text-[#FFB703] animate-ping" />
                                </div>
                                <p className="text-[12px] font-black uppercase  text-foreground">AUCUN_FLUX_TRANSACTIONNEL_IDENTIFIÉ_ALPHA</p>
                                <button onClick={fetchOrders} className="text-[#FFB703] text-[10px] font-black uppercase  border-b-2 border-[#FFB703]/20 pb-2 hover:border-[#FFB703] transition-all">RESCANNER_TERMINAL</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bulk Action Station — Floating HUD Protocol */}
                {selectedIds.length > 0 && (
                    <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-20 duration-1000 font-jakarta">
                        <div className="bg-background/95 backdrop-blur-3xl border-2 border-[#FFB703]/40 rounded-2xl p-4 shadow-[0_50px_100px_rgba(0,0,0,0.9)] flex items-center gap-3 group/bulk">
                             <div className="flex flex-col gap-1">
                                <span className="text-[12px] font-black text-[#FFB703] uppercase  leading-none">ACTION_BULK_DÉPLOYÉE</span>
                                <span className="text-[10px] font-black text-muted-foreground uppercase  leading-none">{selectedIds.length} FLUX_SÉLECTIONNÉS</span>
                             </div>
                             <div className="w-[1px] h-10 bg-foreground/10" />
                             <button
                                id="bulk-confirm-btn"
                                onClick={async () => {
                                    for (const id of selectedIds) {
                                        await handleStatusUpdate(id, 'confirme');
                                    }
                                    setSelectedIds([]);
                                }}
                                className="h-12 px-6 gap-3 rounded-2xl bg-[#FFB703] text-background shadow-2xl font-black text-[10px] uppercase  flex items-center hover:bg-white transition-all  border-none"
                            >
                                <CheckCircle2 className="size-6" />
                                <span>VALIDER_PROCÉDURE_ALPHA</span>
                            </button>
                            <button
                                id="bulk-cancel-selection"
                                onClick={() => setSelectedIds([])}
                                className="size-6 rounded-2xl bg-foreground/5 text-muted-foreground hover:text-rose-500 transition-all border-none flex items-center justify-center"
                            >
                                <XCircle className="size-6" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default OrdersVendor;
