import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Link, useNavigate } from 'react-router-dom';
import { useOrders } from '../hooks/useOrderData';
import useSocket from '../../hooks/useSocket';
import { LoadingState, ErrorState } from '../../components/ui/DataStates';
import { useQueryClient } from '@tanstack/react-query';
import orderService from '../services/orderService';
import {
    Package, Eye, MessageSquare, AlertCircle, CheckCircle2,
    Clock, Truck, MapPin, ArrowRight, ShoppingBag, Zap,
    Activity, Download, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import Skeleton from '../../components/ui/Skeleton';
import PrefetchLink from '../../components/ui/PrefetchLink';
import FilterDropdown from '../../components/ui/FilterDropdown';
import productService from '../../product/services/productService';
import { generateFactureOrProformaPdf } from '../../lib/bcaDocumentPdf';

// Statuts pour lesquels une facture peut être téléchargée (commande réellement payée).
const INVOICEABLE_STATUSES = new Set(['payé', 'en_préparation', 'en_cours', 'livré']);

const STATUS_CONFIG = {
    en_attente_paiement: { label: 'En attente', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', dot: 'bg-amber-500' },
    payé:               { label: 'Payée', icon: CheckCircle2, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', dot: 'bg-blue-500' },
    en_préparation:     { label: 'En préparation', icon: Package, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20', dot: 'bg-purple-500' },
    en_cours:           { label: 'En Transit', icon: Truck, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20', dot: 'bg-primary' },
    livré:              { label: 'Livrée', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dot: 'bg-emerald-500' },
    annulé:             { label: 'Annulée', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', dot: 'bg-red-500' },
};

// order.statut ne couvre que le paiement/préparation — il ne passe jamais à
// 'en_cours'/'livré' côté backend (c'est order.statut_livraison qui porte le vrai
// état de la livraison). On combine les deux pour ne pas afficher "Payée" à vie
// sur une commande pourtant livrée.
const isCancelled = (statut) => statut === 'annulé' || statut === 'annule';

const computeDisplayStatus = (order) => {
    if (isCancelled(order.statut)) return 'annulé';
    if (order.statut_livraison === 'livre') return 'livré';
    if (['en_route', 'ramasse'].includes(order.statut_livraison)) return 'en_cours';
    return order.statut || 'en_attente_paiement';
};

const OrderCard = ({ order, index }) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const vendors = React.useMemo(() => {
        const map = new Map();
        for (const item of order.details || []) {
            const id = item.fournisseur_id;
            if (id && !map.has(id)) map.set(id, { id, nom: item.produit?.boutique?.nom_boutique || 'Marchand' });
        }
        return [...map.values()];
    }, [order.details]);
    const displayStatut = computeDisplayStatus(order);
    const status = STATUS_CONFIG[displayStatut] || STATUS_CONFIG['en_attente_paiement'];
    const StatusIcon = status.icon;
    const total = parseFloat(order.total_ttc || 0);
    const [isDownloading, setIsDownloading] = useState(false);

    const prefetchTracking = () => {
        queryClient.prefetchQuery({
            queryKey: ['order-tracking', order.id],
            queryFn: () => orderService.getTracking(order.id),
            staleTime: 60_000
        });
    };

    const handleDownloadFacture = async () => {
        setIsDownloading(true);
        try {
            const fullOrder = await orderService.getById(order.id);
            const items = (fullOrder.details || []).map((item) => ({
                description: item.produit?.nom_produit || 'Article',
                qte: item.quantite,
                prixUnitaire: parseFloat(item.prix_unitaire_achat) || 0,
            }));
            const doc = generateFactureOrProformaPdf('facture', {
                numero: `CMD-${fullOrder.id.slice(0, 8).toUpperCase()}`,
                date: fullOrder.date_commande || fullOrder.createdAt,
                client: {
                    nom: fullOrder.client?.nom_complet || fullOrder.nom_destinataire || '—',
                    adresse: fullOrder.adresse_livraison || '',
                    telephone: fullOrder.client?.telephone || fullOrder.telephone_livraison || '',
                },
                items,
                livraison: fullOrder.adresse_livraison || '',
                modePaiement: fullOrder.methode_paiement || '',
            });
            doc.save(`BCA_Facture_CMD-${fullOrder.id.slice(0, 8).toUpperCase()}.pdf`);
        } catch {
            toast.error('Impossible de générer la facture pour le moment.');
        } finally {
            setIsDownloading(false);
        }
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
                            {new Date(order.createdAt || order.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        {order.adresse_livraison && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="size-3.5 shrink-0" />
                                <p className="text-xs font-medium truncate">{order.adresse_livraison}</p>
                            </div>
                        )}
                        {order.date_livraison_prevue && order.statut_livraison !== 'livre' && (() => {
                            const late = new Date(order.date_livraison_prevue) < new Date();
                            return (
                                <div className={cn('flex items-center gap-2', late ? 'text-rose-500' : 'text-muted-foreground')}>
                                    {late ? <AlertCircle className="size-3.5 shrink-0" /> : <Clock className="size-3.5 shrink-0" />}
                                    <p className="text-xs font-medium">
                                        {late ? 'Livraison en retard — prévue le ' : 'Livraison prévue avant le '}
                                        {new Date(order.date_livraison_prevue).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                            );
                        })()}
                    </div>
                </div>
                
                {/* Center: Metrics */}
                <div className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-border shrink-0">
                    {[
                        { label: 'Montant', value: `${total.toLocaleString('fr-FR')} GNF` },
                        { label: 'Articles', value: order.items_count || '—' },
                        {
                            label: 'Livraison',
                            value: order.type_livraison
                                ? `${({ eco: 'Éco', standard: 'Std', prioritaire: 'Prio' })[order.type_livraison] || order.type_livraison} — ${parseFloat(order.frais_port || 0).toLocaleString('fr-FR')} GNF`
                                : `${parseFloat(order.frais_port || 0).toLocaleString('fr-FR')} GNF`,
                        },
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
                    {vendors.length > 1 ? (
                        <div className="flex flex-col gap-1.5">
                            <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                {vendors.length} marchands sur cette commande
                            </span>
                            {vendors.map((v) => (
                                <button
                                    key={v.id}
                                    type="button"
                                    onClick={() => navigate(`/messages?recipient=${v.id}`)}
                                    className="h-10 px-6 bg-muted border border-border rounded-2xl font-black text-[9px] uppercase tracking-widest flex items-center gap-2 hover:border-primary/30 hover:bg-primary/5 transition-all text-foreground truncate"
                                    title={`Contacter ${v.nom}`}
                                >
                                    <MessageSquare className="size-4 shrink-0" />
                                    <span className="truncate">{v.nom}</span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => navigate(`/messages${vendors[0] ? `?recipient=${vendors[0].id}` : ''}`)}
                            className="h-10 px-6 bg-muted border border-border rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:border-primary/30 hover:bg-primary/5 transition-all text-foreground"
                        >
                            <MessageSquare className="size-4" />
                            Contact
                        </button>
                    )}
                    {INVOICEABLE_STATUSES.has(order.statut) && (
                        <button
                            type="button"
                            onClick={handleDownloadFacture}
                            disabled={isDownloading}
                            className="h-10 px-6 bg-muted border border-border rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:border-primary/30 hover:bg-primary/5 transition-all text-foreground disabled:opacity-50"
                        >
                            {isDownloading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
                            Facture
                        </button>
                    )}
                    {!isCancelled(order.statut) && (
                        <Link
                            to={`/dispute/${order.id}`}
                            className="h-10 px-6 border border-rose-500/20 bg-rose-500/5 text-rose-500 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-rose-500 hover:text-white transition-all"
                        >
                            <AlertCircle className="size-4" />
                            Litige
                        </Link>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const OrdersClient = () => {
    const { data, loading, error, refetch } = useOrders();
    const orders = data?.orders || []; // 🛡️ Extraction sécurisée du tableau
    const [filterStatus, setFilterStatus] = useState('all');
    const { on, off } = useSocket();

    useEffect(() => {
        if (!on) return;
        const handleRealTimeUpdate = () => refetch();
        on('notification_received', handleRealTimeUpdate);
        return () => off('notification_received', handleRealTimeUpdate);
    }, [on, off, refetch]);

    const filteredOrders = filterStatus === 'all' ? orders : orders.filter(o => computeDisplayStatus(o) === filterStatus);
    const statusCounts = Object.fromEntries(
        Object.keys(STATUS_CONFIG).map(k => [k, orders.filter(o => computeDisplayStatus(o) === k).length])
    );

    return (
        <DashboardLayout title="COMMANDES & LOGISTIQUE" noPadding>
            <div className="min-h-screen font-jakarta">
                
                {/* ── Header Intégré ─────────────────────────────────── */}
                <div className="bg-white/50 dark:bg-[#0F1219]/50 backdrop-blur-xl border-b border-border">
                    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
                    
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
                    <FilterDropdown
                        value={filterStatus}
                        onChange={setFilterStatus}
                        defaultValue="all"
                        options={[
                            { value: 'all', label: `Toutes (${orders.length})` },
                            ...Object.entries(STATUS_CONFIG)
                                .filter(([key]) => (statusCounts[key] || 0) > 0)
                                .map(([key, status]) => ({
                                    value: key,
                                    label: `${status.label} (${statusCounts[key] || 0})`,
                                    dotClassName: status.dot,
                                })),
                        ]}
                    />
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
    </DashboardLayout>
    );
};

export default OrdersClient;
