import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatusBadge from '../components/ui/StatusBadge';
import { cn } from '../lib/utils';
import { TableRowSkeleton } from '../components/ui/Loader';
import { ErrorState } from '../components/ui/StatusStates';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock, Search, ChevronRight, ShoppingBag, X,
    Activity, Zap, FileText, MapPin, Smartphone,
    TrendingUp, ShieldCheck, Box
} from 'lucide-react';
import orderService from '../services/orderService';
import { toast as toastSonner } from 'sonner';

const FILTERS = [
    { key: "Tout", label: "Tout" },
    { key: "en_attente_paiement", label: "En attente" },
    { key: "payé", label: "Payé" },
    { key: "expédié", label: "Expédié" },
    { key: "livré", label: "Livré" },
    { key: "annulé", label: "Annulé" }
];

const UserOrders = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [activeFilter, setActiveFilter] = useState('Tout');
    const [searchQuery, setSearchQuery] = useState('');
    const [isCancelling, setIsCancelling] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        setHasError(false);
        try {
            const data = await orderService.getMyOrders();
            setOrders(Array.isArray(data) ? data : (data?.orders || []));
        } catch {
            setHasError(true);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm("Confirmer l'annulation ? Le montant sera remboursé dans votre portefeuille.")) return;
        setIsCancelling(orderId);
        try {
            await orderService.updateOrderStatus(orderId, 'annulé');
            toastSonner.success('Commande annulée. Remboursement effectué.');
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, statut: 'annulé' } : o));
        } catch (err) {
            toastSonner.error(err.response?.data?.message || 'Impossible d\'annuler la commande.');
        } finally {
            setIsCancelling(null);
        }
    };

    const filteredOrders = orders.filter(o =>
        (activeFilter === 'Tout' || o.statut === activeFilter) &&
        String(o.id || o.numero_commande || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalInvested = orders.reduce((acc, o) => acc + parseFloat(o.total_ttc || 0), 0);
    const activeOrders = orders.filter(o => !['livré', 'annulé'].includes(o.statut)).length;

    return (
        <DashboardLayout title="Mes Commandes">
            <div className="space-y-6 pb-10">

                {/* KPIs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { title: "Total investi", value: `${totalInvested.toLocaleString('fr-GN')} GNF`, icon: TrendingUp },
                        { title: "Commandes actives", value: activeOrders.toString(), icon: Zap },
                        { title: "Total commandes", value: orders.length.toString(), icon: Box }
                    ].map((kpi, idx) => (
                        <div key={idx} className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center gap-4">
                            <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                                <kpi.icon className="size-5" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium">{kpi.title}</p>
                                <p className="text-lg font-bold text-foreground tabular-nums">{kpi.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Table card */}
                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                    {/* Filters + search */}
                    <div className="p-4 border-b border-border space-y-3">
                        <div className="flex flex-wrap gap-2">
                            {FILTERS.map(f => (
                                <button
                                    key={f.key}
                                    onClick={() => setActiveFilter(f.key)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border",
                                        activeFilter === f.key
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "bg-muted text-muted-foreground border-border hover:text-foreground hover:border-primary/40"
                                    )}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <input
                                className="w-full h-9 pl-9 pr-3 bg-background border border-border focus:border-primary/50 rounded-lg text-sm outline-none transition-all text-foreground placeholder:text-muted-foreground"
                                placeholder="Rechercher une commande..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        {isLoading ? (
                            <div className="p-4 space-y-3">
                                {[1,2,3,4].map(i => <TableRowSkeleton key={i} />)}
                            </div>
                        ) : hasError ? (
                            <div className="p-12 text-center"><ErrorState /></div>
                        ) : filteredOrders.length > 0 ? (
                            <table className="w-full text-sm min-w-[640px]">
                                <thead>
                                    <tr className="bg-muted/50 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                        <th className="px-4 py-3 text-left">Commande</th>
                                        <th className="px-4 py-3 text-left">Date</th>
                                        <th className="px-4 py-3 text-left">Montant</th>
                                        <th className="px-4 py-3 text-left">Statut</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filteredOrders.map((row, idx) => (
                                        <tr key={row.id || idx} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-8 rounded-lg bg-muted border border-border flex items-center justify-center">
                                                        <Box className="size-4 text-muted-foreground" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-foreground">#{(row.id || row.numero_commande || '').slice(0, 8).toUpperCase()}</p>
                                                        <p className="text-xs text-muted-foreground">{row.details?.length || 0} article(s)</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-xs font-medium text-foreground">{new Date(row.createdAt).toLocaleDateString('fr-GN')}</p>
                                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Clock className="size-3" />
                                                    {new Date(row.createdAt).toLocaleTimeString('fr-GN', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-sm font-bold text-foreground tabular-nums">
                                                    {parseFloat(row.total_ttc).toLocaleString('fr-GN')}
                                                    <span className="text-xs text-primary ml-1">GNF</span>
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatusBadge status={row.statut} />
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {row.statut === 'payé' && (
                                                        <button
                                                            disabled={isCancelling === row.id}
                                                            onClick={() => handleCancelOrder(row.id)}
                                                            className="text-xs font-medium text-muted-foreground hover:text-rose-500 transition-colors"
                                                        >
                                                            {isCancelling === row.id ? '...' : 'Annuler'}
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => setSelectedOrder(row)}
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-foreground text-background hover:bg-primary hover:text-primary-foreground rounded-lg text-xs font-semibold transition-all"
                                                    >
                                                        Détails <ChevronRight className="size-3" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="py-16 text-center">
                                <ShoppingBag className="size-10 text-muted-foreground/30 mx-auto mb-3" />
                                <p className="text-sm text-muted-foreground">Aucune commande trouvée</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Order detail modal */}
                <AnimatePresence>
                    {selectedOrder && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setSelectedOrder(null)}
                                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                className="bg-card rounded-2xl w-full max-w-2xl shadow-xl relative border border-border max-h-[85vh] flex flex-col"
                            >
                                {/* Modal header */}
                                <div className="flex items-center justify-between p-5 border-b border-border">
                                    <div className="flex items-center gap-3">
                                        <div className="size-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                            <FileText className="size-4 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-foreground">Détail commande</h3>
                                            <p className="text-xs text-muted-foreground">#{(selectedOrder.id || '').slice(0, 14).toUpperCase()}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedOrder(null)}
                                        className="size-8 rounded-lg bg-muted hover:bg-rose-500/10 hover:text-rose-500 flex items-center justify-center text-muted-foreground transition-colors"
                                    >
                                        <X className="size-4" />
                                    </button>
                                </div>

                                {/* Modal body */}
                                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                                    {/* Delivery info */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {[
                                            { icon: MapPin, label: "Adresse", value: selectedOrder.adresse_livraison },
                                            { icon: Smartphone, label: "Téléphone", value: selectedOrder.telephone_livraison }
                                        ].map((info, i) => (
                                            <div key={i} className="flex items-start gap-3 p-3 bg-muted rounded-xl">
                                                <info.icon className="size-4 text-primary mt-0.5 shrink-0" />
                                                <div>
                                                    <p className="text-xs text-muted-foreground">{info.label}</p>
                                                    <p className="text-sm font-medium text-foreground">{info.value || '—'}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Items */}
                                    <div className="space-y-2">
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Articles</p>
                                        {selectedOrder.details?.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-3 p-3 bg-muted rounded-xl border border-border">
                                                <div className="size-12 rounded-lg bg-background border border-border overflow-hidden shrink-0">
                                                    {item.produit?.image_url
                                                        ? <img src={item.produit.image_url} className="w-full h-full object-cover" alt="" />
                                                        : <Box className="size-5 text-muted-foreground m-auto mt-3" />
                                                    }
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-foreground truncate">{item.produit?.nom_produit}</p>
                                                    <p className="text-xs text-muted-foreground">Qté : {item.quantite}</p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-sm font-bold text-foreground tabular-nums">{parseFloat(item.prix_unitaire_achat).toLocaleString('fr-GN')}</p>
                                                    <p className="text-xs text-primary">GNF</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Modal footer */}
                                <div className="p-5 border-t border-border">
                                    <div className="flex items-center justify-between bg-primary text-primary-foreground rounded-xl p-4">
                                        <p className="text-sm font-semibold">Total</p>
                                        <p className="text-lg font-bold tabular-nums">
                                            {parseFloat(selectedOrder.total_ttc).toLocaleString('fr-GN')} GNF
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </DashboardLayout>
    );
};

export default UserOrders;
