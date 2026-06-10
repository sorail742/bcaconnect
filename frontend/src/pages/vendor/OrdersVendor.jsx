import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import VendorOrderCard from '../../components/vendor/VendorOrderCard';
import { ModalOverlay } from '../../components/ui/ModalOverlay';
import {
    Search,
    ListOrdered,
    Clock,
    Wallet,
    Package,
    CheckCircle2,
    XCircle,
    RefreshCw,
    ShoppingBag,
    ShieldCheck,
    Truck,
    Activity,
    Lock,
    Fingerprint,
    BadgeCheck,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useVendorOrders, useUpdateOrderStatus, usePrepareVendorOrder } from '../../hooks/data/useOrderData';
import { groupVendorOrderItems } from '../../lib/orderDisplay';

const OrdersVendor = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [activeFilter, setActiveFilter] = useState('Tous');
    const [search, setSearch] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);
    const [securityOpen, setSecurityOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const { data: ordersData, isLoading, isFetching, refetch } = useVendorOrders();
    const orders = ordersData?.orders || [];

    const updateStatusMutation = useUpdateOrderStatus();
    const prepareOrderMutation = usePrepareVendorOrder();
    const isPending = updateStatusMutation.isPending || prepareOrderMutation.isPending;

    const STATUS_FILTERS = [
        { key: 'Tous', label: 'Tous' },
        { key: 'en_attente', label: 'Attente' },
        { key: 'confirme', label: 'Confirmé' },
        { key: 'prepare', label: 'Préparé' },
        { key: 'expedie', label: 'Expédié' },
        { key: 'livre', label: 'Livré' },
        { key: 'annule', label: 'Annulé' },
    ];

    const handleStatusUpdate = (itemId, newStatus) => {
        updateStatusMutation.mutate({ id: itemId, status: newStatus });
    };

    const filteredItems = useMemo(() => orders.filter((o) => {
        const matchStatus = activeFilter === 'Tous' || o.statut === activeFilter;
        const client = o.commande?.client || o.Order?.User;
        const q = search.toLowerCase();
        const matchSearch = !q
            || o.commande_id?.toLowerCase().includes(q)
            || client?.nom_complet?.toLowerCase().includes(q)
            || o.produit?.nom_produit?.toLowerCase().includes(q);
        return matchStatus && matchSearch;
    }), [orders, activeFilter, search]);

    const groupedOrders = useMemo(
        () => groupVendorOrderItems(filteredItems),
        [filteredItems],
    );

    const toggleSelectOrder = (itemIds) => {
        const allSelected = itemIds.every((id) => selectedIds.includes(id));
        if (allSelected) {
            setSelectedIds((prev) => prev.filter((id) => !itemIds.includes(id)));
        } else {
            setSelectedIds((prev) => [...new Set([...prev, ...itemIds])]);
        }
    };

    const isOrderSelected = (itemIds) => itemIds.every((id) => selectedIds.includes(id));

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await Promise.all([
                refetch(),
                queryClient.invalidateQueries({ queryKey: ['vendor-orders'] }),
            ]);
            toast.success('Commandes actualisées');
        } catch {
            toast.error('Impossible d\'actualiser les commandes');
        } finally {
            setIsRefreshing(false);
        }
    };

    const securitySummary = useMemo(() => {
        const inEscrow = orders.filter((o) => !o.escrow_released && !['livre', 'annule', 'annulé'].includes(o.statut)).length;
        const inTransit = orders.filter((o) => ['expedie', 'prepare'].includes(o.statut)).length;
        return { total: groupedOrders.length, inEscrow, inTransit };
    }, [groupedOrders, orders]);

    return (
        <DashboardLayout title="Gestion des Commandes" noPadding>
            <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0F1219] p-4 sm:p-6 lg:p-8 space-y-6">
                {/* En-tête */}
                <div className="bg-white dark:bg-[#0F1219] p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="size-11 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-500">
                                <ListOrdered className="size-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                                    Commandes reçues
                                </h2>
                                <p className="text-xs text-slate-400">
                                    {groupedOrders.length} commande{groupedOrders.length !== 1 ? 's' : ''} · {orders.length} ligne{orders.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleRefresh}
                                disabled={isRefreshing || isFetching}
                                title="Actualiser les commandes"
                                aria-label="Actualiser les commandes"
                                className="size-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-primary border border-slate-100 dark:border-white/5 disabled:opacity-60"
                            >
                                <RefreshCw className={cn('size-4', (isRefreshing || isFetching) && 'animate-spin')} />
                            </button>
                            <button
                                type="button"
                                onClick={() => setSecurityOpen(true)}
                                title="Centre de sécurité des commandes"
                                className="h-10 px-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl flex items-center gap-2 text-[10px] font-bold uppercase hover:opacity-90 transition-opacity"
                            >
                                <ShieldCheck className="size-4 text-amber-400" />
                                Sécurisé
                            </button>
                        </div>
                    </div>
                </div>

                {/* KPI */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                        { label: 'Lignes', value: orders.length, icon: ListOrdered, color: 'text-slate-500' },
                        { label: 'En attente', value: orders.filter((o) => o.statut === 'en_attente').length, icon: Clock, color: 'text-amber-500' },
                        { label: 'Prêtes', value: orders.filter((o) => o.statut === 'prepare').length, icon: Truck, color: 'text-primary' },
                        {
                            label: 'CA livré',
                            value: `${orders.filter((o) => o.statut === 'livre').reduce((a, o) => a + o.prix_unitaire_achat * o.quantite, 0).toLocaleString('fr-GN')} GNF`,
                            icon: Wallet,
                            color: 'text-emerald-500',
                        },
                    ].map((kpi) => (
                        <div key={kpi.label} className="bg-white dark:bg-[#0F1219] p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                            <kpi.icon className={cn('size-4 mb-2', kpi.color)} />
                            <p className="text-[10px] font-bold text-slate-400 uppercase">{kpi.label}</p>
                            <p className={cn('text-base font-black tabular-nums truncate', kpi.color)}>{kpi.value}</p>
                        </div>
                    ))}
                </div>

                {/* Filtres */}
                <div className="bg-white dark:bg-[#0F1219] rounded-2xl border border-slate-100 dark:border-white/5 p-4 space-y-3">
                    <div className="flex flex-wrap gap-2">
                        {STATUS_FILTERS.map((f) => (
                            <button
                                key={f.key}
                                type="button"
                                onClick={() => setActiveFilter(f.key)}
                                className={cn(
                                    'px-4 h-9 rounded-lg text-xs font-bold transition-all',
                                    activeFilter === f.key
                                        ? 'bg-primary text-white shadow-sm'
                                        : 'bg-slate-50 dark:bg-white/5 text-slate-500 hover:text-slate-700',
                                )}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 size-4" />
                        <input
                            className="w-full pl-10 pr-4 h-10 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="Client, produit, référence…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Liste par commande */}
                {isLoading ? (
                    <div className="py-20 text-center text-slate-400 text-sm">Chargement…</div>
                ) : groupedOrders.length === 0 ? (
                    <div className="py-20 text-center text-slate-400 flex flex-col items-center gap-2 bg-white dark:bg-[#0F1219] rounded-2xl border border-slate-100 dark:border-white/5">
                        <ShoppingBag className="size-8 opacity-40" />
                        <p className="text-sm font-bold">Aucune commande trouvée</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {groupedOrders.map((group) => (
                            <VendorOrderCard
                                key={group.commande_id}
                                orderGroup={group}
                                selected={isOrderSelected(group.items.map((i) => i.id))}
                                onToggleSelect={toggleSelectOrder}
                                onStatusUpdate={handleStatusUpdate}
                                onPrepareOrder={(id) => prepareOrderMutation.mutate(id)}
                                isPending={isPending}
                            />
                        ))}
                    </div>
                )}

                {/* Barre actions groupées */}
                {selectedIds.length > 0 && (
                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-2xl">
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-3 shadow-2xl flex flex-wrap items-center justify-center gap-2">
                            <span className="text-xs font-bold text-slate-500 w-full text-center sm:w-auto sm:mr-2">
                                {selectedIds.length} sélectionné(s)
                            </span>
                            <button
                                type="button"
                                onClick={async () => {
                                    for (const id of selectedIds) {
                                        await updateStatusMutation.mutateAsync({ id, status: 'confirme' });
                                    }
                                    setSelectedIds([]);
                                }}
                                disabled={isPending}
                                className="h-9 px-4 rounded-xl bg-amber-500 text-white text-xs font-bold flex items-center gap-2 border-none"
                            >
                                <CheckCircle2 className="size-4" /> Confirmer
                            </button>
                            <button
                                type="button"
                                onClick={async () => {
                                    const orderIds = [...new Set(
                                        selectedIds.map((id) => orders.find((o) => o.id === id)?.commande_id).filter(Boolean),
                                    )];
                                    for (const orderId of orderIds) {
                                        await prepareOrderMutation.mutateAsync(orderId);
                                    }
                                    setSelectedIds([]);
                                }}
                                disabled={isPending}
                                className="h-9 px-4 rounded-xl bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 border-none"
                            >
                                <Package className="size-4" /> Prêt livreur
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    const first = orders.find((o) => selectedIds.includes(o.id));
                                    if (first) navigate(`/tracking?orderId=${first.commande_id}`);
                                }}
                                className="h-9 px-4 rounded-xl bg-sky-500 text-white text-xs font-bold flex items-center gap-2 border-none"
                            >
                                <Activity className="size-4" /> GPS
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedIds([])}
                                className="size-9 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center border-none"
                            >
                                <XCircle className="size-4 text-rose-500" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <ModalOverlay
                open={securityOpen}
                onClose={() => setSecurityOpen(false)}
                title="Centre de sécurité BCA"
                maxWidth="max-w-md"
            >
                <div className="space-y-5">
                    <p className="text-sm text-muted-foreground">
                        Vos commandes sont protégées par chiffrement des coordonnées, séquestre (escrow) et validation OTP à la livraison.
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: 'Commandes', value: securitySummary.total, icon: ShoppingBag },
                            { label: 'En séquestre', value: securitySummary.inEscrow, icon: Lock },
                            { label: 'En transit', value: securitySummary.inTransit, icon: Truck },
                        ].map((item) => (
                            <div key={item.label} className="rounded-xl bg-muted/50 border border-border p-3 text-center">
                                <item.icon className="size-4 mx-auto mb-1 text-primary" />
                                <p className="text-lg font-black tabular-nums">{item.value}</p>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase">{item.label}</p>
                            </div>
                        ))}
                    </div>
                    <ul className="space-y-3 text-sm">
                        {[
                            { icon: Fingerprint, text: 'Données client chiffrées (AES-256) en transit et au repos.' },
                            { icon: Lock, text: 'Fonds bloqués en séquestre jusqu\'à confirmation de livraison.' },
                            { icon: BadgeCheck, text: 'Clôture livraison par code OTP unique côté transporteur.' },
                        ].map((row) => (
                            <li key={row.text} className="flex gap-3 items-start">
                                <row.icon className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                                <span className="text-foreground">{row.text}</span>
                            </li>
                        ))}
                    </ul>
                    <button
                        type="button"
                        onClick={() => setSecurityOpen(false)}
                        className="w-full h-11 rounded-xl bg-primary text-white font-bold text-sm"
                    >
                        Compris
                    </button>
                </div>
            </ModalOverlay>
        </DashboardLayout>
    );
};

export default OrdersVendor;
