import React from 'react';
import { Package, Truck, User } from 'lucide-react';
import { cn } from '../../lib/utils';
import StatusBadge from '../../components/ui/StatusBadge';
import VendorOrderActions from './VendorOrderActions';
import {
    formatDisplayPhone,
    ITEM_STATUS_LABELS,
    LOGISTICS_LABELS,
} from '../lib/orderDisplay';

const VendorOrderCard = ({
    orderGroup,
    selected,
    onToggleSelect,
    onStatusUpdate,
    onPrepareOrder,
    isPending,
}) => {
    const { commande_id: orderId, commande: order, items } = orderGroup;
    const client = order?.client || order?.User;
    const logistics = order?.statut_livraison || 'en_attente';
    const orderTotal = items.reduce((s, i) => s + Number(i.prix_unitaire_achat) * i.quantite, 0);
    const itemIds = items.map((i) => i.id);

    const getStatusVariant = (status) => {
        switch (status) {
            case 'en_attente': return 'warning';
            case 'confirme': return 'info';
            case 'prepare': return 'info';
            case 'expedie': return 'primary';
            case 'livre': return 'success';
            case 'annule': return 'danger';
            default: return 'neutral';
        }
    };

    const getLogisticsVariant = (status) => {
        switch (status) {
            case 'pret': return 'warning';
            case 'ramasse':
            case 'en_route':
            case 'en_cours': return 'primary';
            case 'livre': return 'success';
            default: return 'neutral';
        }
    };

    return (
        <article
            className={cn(
                'rounded-2xl border bg-white dark:bg-[#0F1219] transition-shadow',
                selected
                    ? 'border-primary shadow-md shadow-primary/10'
                    : 'border-slate-100 dark:border-white/5 shadow-sm',
            )}
        >
            {/* En-tête commande */}
            <div className="flex flex-wrap items-start gap-4 p-4 border-b border-slate-50 dark:border-white/5">
                <label className="flex items-center pt-1 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => onToggleSelect(itemIds)}
                        className="size-4 rounded border-slate-300 text-primary focus:ring-primary"
                    />
                </label>

                <div className="flex-1 min-w-[200px] space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                            Commande
                        </span>
                        <span className="text-sm font-black text-slate-900 dark:text-white">
                            #{orderId.slice(0, 8).toUpperCase()}
                        </span>
                        <StatusBadge
                            status={LOGISTICS_LABELS[logistics] || logistics}
                            variant={getLogisticsVariant(logistics)}
                            className="text-[9px]"
                        />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <User className="size-4 text-slate-400 shrink-0" />
                        <span className="font-semibold truncate max-w-[200px]">
                            {client?.nom_complet || 'Client'}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs text-slate-400 truncate">
                            {formatDisplayPhone(client?.telephone)}
                        </span>
                    </div>
                    {order?.transporteur && (
                        <p className="text-[10px] font-bold text-primary flex items-center gap-1 uppercase">
                            <Truck className="size-3" />
                            {order.transporteur.nom_complet}
                        </p>
                    )}
                </div>

                <div className="text-right shrink-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Total vendeur</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white tabular-nums">
                        {orderTotal.toLocaleString('fr-GN')}
                        <span className="text-xs font-bold text-slate-400 ml-1">GNF</span>
                    </p>
                    <p className="text-[10px] text-slate-400">{items.length} article{items.length > 1 ? 's' : ''}</p>
                </div>
            </div>

            {/* Articles */}
            <div className="divide-y divide-slate-50 dark:divide-white/5">
                {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                        <div className="size-11 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center overflow-hidden shrink-0 border border-slate-100 dark:border-white/5">
                            {item.produit?.image_url ? (
                                <img src={item.produit.image_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <Package className="size-5 text-slate-400" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                                {item.produit?.nom_produit || 'Produit'}
                            </p>
                            <p className="text-xs text-slate-400">
                                ×{item.quantite} · {(item.prix_unitaire_achat * item.quantite).toLocaleString('fr-GN')} GNF
                            </p>
                        </div>
                        <StatusBadge
                            status={ITEM_STATUS_LABELS[item.statut] || item.statut}
                            variant={getStatusVariant(item.statut)}
                            className="text-[9px] shrink-0"
                        />
                    </div>
                ))}
            </div>

            {/* Actions — une seule barre par commande */}
            <div className="p-3 bg-slate-50/80 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/5 rounded-b-2xl">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Actions</p>
                <VendorOrderActions
                    orderGroup={orderGroup}
                    onStatusUpdate={onStatusUpdate}
                    onPrepareOrder={onPrepareOrder}
                    isPending={isPending}
                />
            </div>
        </article>
    );
};

export default VendorOrderCard;
