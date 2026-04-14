import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useOrders } from '../hooks/useDomainData';
import useSocket from '../hooks/useSocket';
import { LoadingState, ErrorState } from '../components/ui/DataStates';
import { useQueryClient } from '@tanstack/react-query';
import orderService from '../services/orderService';
import { 
    Package, Eye, MessageSquare, AlertCircle, CheckCircle2, 
    Clock, Truck, MapPin, ArrowRight, ShoppingBag, Zap,
    Activity, Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import Skeleton from '../components/ui/Skeleton';

const STATUS_CONFIG = {
    en_attente_paiement: { label: 'En attente', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', dot: 'bg-amber-500' },
    payé:               { label: 'Payée', icon: CheckCircle2, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', dot: 'bg-blue-500' },
    en_préparation:     { label: 'En préparation', icon: Package, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20', dot: 'bg-purple-500' },
    en_cours:           { label: 'En Transit', icon: Truck, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20', dot: 'bg-primary' },
    livré:              { label: 'Livrée', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dot: 'bg-emerald-500' },
    annulé:             { label: 'Annulée', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', dot: 'bg-red-500' },
};

const OrderCard = ({ order, index }) => {
    const queryClient = useQueryClient();
    const status = STATUS_CONFIG[order.statut] || STATUS_CONFIG['en_attente_paiement'];
    const StatusIcon = status.icon;
    const total = parseFloat(order.total_ttc || 0);

    const prefetchTracking = () => {
        queryClient.prefetchQuery({
            queryKey: ['order-tracking', order.id],
            queryFn: () => orderService.getTracking(order.id),
            staleTime: 60_000
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.5 }}
            className="group p-6 md:p-8 bg-card/50 backdrop-blur-sm rounded-[2.5rem] border border-border hover:border-primary/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
        >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                
                {/* Left: Core Info */}
                <div className="flex items-start gap-5 flex-1 min-w-0">
                    <div className={cn("size-16 rounded-[1.5rem] flex items-center justify-center shrink-0 border", status.bg, status.border)}>
                        <StatusIcon className={cn("size-8", status.color)} />
                    </div>
                    <div className="space-y-2 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-xl font-black uppercase tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                Colis #{order.id?.slice(0, 8).toUpperCase() || '——'}
                            </h3>
                            <div className={cn("flex items-center gap-2 px-3 py-1 rounded-xl border", status.bg, status.border)}>
                                <div className={cn("size-1.5 rounded-full animate-pulse", status.dot)} />
                                <span className={cn("text-[9px] font-black uppercase tracking-widest", status.color)}>
                                    {status.label}
                                </span>
                            </div>
                        </div>
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                            {new Date(order.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        {order.adresse_livraison && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="size-3.5 shrink-0" />
                                <p className="text-xs font-medium truncate">{order.adresse_livraison}</p>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Center: Metrics */}
                <div className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-border shrink-0">
                    {[
                        { label: 'Montant', value: `${total.toLocaleString('fr-FR')} GNF` },
                        { label: 'Articles', value: order.items_count || '—' },
                        { label: 'Livraison', value: `${parseFloat(order.frais_port || 0).toLocaleString('fr-FR')} GNF` },
                    ].map((m, i) => (
                        <div key={i} className="px-5 py-4 bg-muted/30 text-center space-y-1">
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{m.label}</p>
                            <p className={cn("text-sm font-black", i === 0 ? "text-primary" : "text-foreground")}>{m.value}</p>
                        </div>
                    ))}
                </div>

                {/* Right: Actions */}
                <div className="flex flex-col gap-3 shrink-0">
                    <Link
                        to={`/tracking?orderId=${order.id}`}
                        onMouseEnter={prefetchTracking}
                        className="h-12 px-6 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
                    >
                        <Eye className="size-4" />
                        Suivre
                    </Link>
                    <button className="h-12 px-6 bg-muted border border-border rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:border-primary/30 hover:bg-primary/5 transition-all text-foreground">
                        <MessageSquare className="size-4" />
                        Contact
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

const OrdersClient = () => {
    const { data: orders = [], loading, error, refetch } = useOrders();
    const [filterStatus, setFilterStatus] = useState('all');
    const { on, off } = useSocket();

    useEffect(() => {
        if (!on) return;
        const handleRealTimeUpdate = () => refetch();
        on('notification_received', handleRealTimeUpdate);
        return () => off('notification_received', handleRealTimeUpdate);
    }, [on, off, refetch]);

    const filteredOrders = filterStatus === 'all' ? orders : orders.filter(o => o.statut === filterStatus);
    const statusCounts = Object.fromEntries(
        Object.keys(STATUS_CONFIG).map(k => [k, orders.filter(o => o.statut === k).length])
    );

    return (
        <div className="min-h-screen bg-background font-jakarta">
            
            {/* ── Sticky Header ─────────────────────────────────── */}
            <div className="sticky top-16 z-20 bg-background/80 backdrop-blur-xl border-b border-border">
                <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">
                    
                    <div className="flex items-center justify-between">
                        <div className="flex items-start gap-4">
                            <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                <ShoppingBag className="size-6 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black uppercase tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                    Mes Commandes
                                </h1>
                                <div className="flex items-center gap-2">
                                    <Activity className="size-3 text-emerald-500 animate-pulse" />
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                        {orders.length} commande{orders.length > 1 ? 's' : ''} • Sync temps réel
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-2 mr-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                            <Filter className="size-3.5" />
                        </div>
                        <button
                            onClick={() => setFilterStatus('all')}
                            className={cn(
                                "h-9 px-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border",
                                filterStatus === 'all'
                                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                                    : "bg-muted border-border hover:border-primary/30 text-muted-foreground"
                            )}
                        >
                            Toutes ({orders.length})
                        </button>
                        {Object.entries(STATUS_CONFIG).map(([key, status]) => {
                            const count = statusCounts[key] || 0;
                            if (count === 0) return null;
                            return (
                                <button
                                    key={key}
                                    onClick={() => setFilterStatus(key)}
                                    className={cn(
                                        "h-9 px-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border flex items-center gap-2",
                                        filterStatus === key
                                            ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                                            : "bg-muted border-border hover:border-primary/30 text-muted-foreground"
                                    )}
                                >
                                    <div className={cn("size-1.5 rounded-full", status.dot)} />
                                    {status.label} ({count})
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── Content ───────────────────────────────────────── */}
            <div className="max-w-5xl mx-auto px-6 py-12 pb-24 space-y-6">
                {loading ? (
                    <div className="space-y-6">
                        {[1, 2, 3].map(i => (
                            <Skeleton key={i} className="h-40 w-full rounded-[2.5rem] border border-border" />
                        ))}
                    </div>
                ) : error ? (
                    <ErrorState error={error} />
                ) : filteredOrders.length > 0 ? (
                    <AnimatePresence>
                        {filteredOrders.map((order, idx) => (
                            <OrderCard key={order.id} order={order} index={idx} />
                        ))}
                    </AnimatePresence>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="py-32 flex flex-col items-center text-center gap-8"
                    >
                        <div className="size-32 rounded-[3rem] bg-muted/30 border border-dashed border-border flex items-center justify-center">
                            <Package className="size-14 text-muted-foreground/20" />
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-3xl font-black uppercase tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                {filterStatus === 'all' ? 'Aucune commande' : 'Aucune commande dans ce statut'}
                            </h2>
                            <p className="text-muted-foreground font-medium max-w-xs mx-auto">
                                {filterStatus === 'all' 
                                    ? 'Votre historique de commandes est vide. Parcourez le marketplace pour commencer.'
                                    : 'Modifiez vos filtres pour voir d\'autres commandes.'}
                            </p>
                        </div>
                        {filterStatus === 'all' && (
                            <PrefetchLink to="/marketplace" queryKey={['products']} queryFn={() => productService.getAll()} className="h-14 px-8 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition-all shadow-xl shadow-primary/20">
                                <Zap className="size-5 fill-current" />
                                Explorer le Marché
                            </PrefetchLink>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default OrdersClient;
