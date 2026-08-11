import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CheckCircle2,
    Package,
    Truck,
    MapPin,
    MessageCircle,
    XCircle,
    Eye,
    RotateCcw,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const ActionBtn = ({ onClick, disabled, title, children, variant = 'default', icon: Icon }) => {
    const variants = {
        default: 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-slate-300',
        success: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100',
        warning: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 hover:bg-amber-100',
        primary: 'bg-blue-50 dark:bg-primary/10 border-blue-200 dark:border-primary/20 text-primary hover:bg-blue-100',
        danger: 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-600 hover:bg-rose-100',
        info: 'bg-sky-50 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/20 text-sky-700 dark:text-sky-400 hover:bg-sky-100',
    };
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={cn(
                'h-9 min-w-[88px] px-3 rounded-xl text-[10px] font-bold uppercase tracking-wide border',
                'inline-flex flex-col items-center justify-center gap-0.5 transition-all shrink-0',
                'disabled:opacity-40 disabled:pointer-events-none',
                variants[variant],
            )}
        >
            {Icon && <Icon className="size-3.5 shrink-0" />}
            <span className="leading-none">{children}</span>
        </button>
    );
};

const VendorOrderActions = ({
    orderGroup,
    onStatusUpdate,
    onPrepareOrder,
    isPending,
}) => {
    const navigate = useNavigate();
    const { commande_id: orderId, commande: order, items } = orderGroup;
    const client = order?.client || order?.User;
    const carrier = order?.transporteur;
    const carrierId = carrier?.id || order?.transporteur_id;
    const logistics = order?.statut_livraison || 'en_attente';
    const hasCarrier = Boolean(carrierId);
    const canTrack = hasCarrier || ['ramasse', 'en_route', 'en_cours', 'pret', 'livre'].includes(logistics);

    const hasPending = items.some((i) => i.statut === 'en_attente');
    const hasConfirmed = items.some((i) => i.statut === 'confirme');
    const hasPreparedOnly = items.some((i) => i.statut === 'prepare');
    const hasShipped = items.some((i) => i.statut === 'expedie');
    const canCancelAny = items.some(
        (i) => ['en_attente', 'confirme'].includes(i.statut)
            || (i.statut === 'prepare' && ['en_attente', 'pret'].includes(logistics)),
    );

    const confirmAll = () => {
        items.filter((i) => i.statut === 'en_attente').forEach((i) => onStatusUpdate(i.id, 'confirme'));
    };
    const prepareAll = () => {
        items.filter((i) => i.statut === 'confirme').forEach((i) => onStatusUpdate(i.id, 'prepare'));
    };
    const shipAll = () => {
        items.filter((i) => i.statut === 'prepare').forEach((i) => onStatusUpdate(i.id, 'expedie'));
    };
    const deliverAll = () => {
        items.filter((i) => i.statut === 'expedie').forEach((i) => onStatusUpdate(i.id, 'livre'));
    };
    const cancelAll = () => {
        if (!window.confirm('Annuler tous les articles modifiables de cette commande ?')) return;
        items.forEach((i) => {
            if (['en_attente', 'confirme'].includes(i.statut)) onStatusUpdate(i.id, 'annule');
        });
    };

    return (
        <div className="flex items-stretch gap-2 overflow-x-auto pb-1 custom-scrollbar">
            <ActionBtn
                variant="info"
                icon={Eye}
                title="Voir le détail et le suivi"
                onClick={() => navigate(`/tracking?orderId=${orderId}`)}
            >
                Détail
            </ActionBtn>

            {hasPending && (
                <ActionBtn variant="success" icon={CheckCircle2} disabled={isPending} onClick={confirmAll} title="Confirmer tous les articles">
                    Confirmer
                </ActionBtn>
            )}

            {hasConfirmed && (
                <ActionBtn variant="warning" icon={Package} disabled={isPending} onClick={prepareAll} title="Préparer tous les articles">
                    Préparer
                </ActionBtn>
            )}

            {(hasPending || hasConfirmed) && (
                <ActionBtn
                    variant="success"
                    icon={Truck}
                    disabled={isPending}
                    onClick={() => onPrepareOrder(orderId)}
                    title="Marquer toute la commande prête pour le livreur"
                >
                    Prêt livreur
                </ActionBtn>
            )}

            {hasPreparedOnly && (
                <ActionBtn
                    variant="primary"
                    icon={Truck}
                    disabled={isPending || !hasCarrier}
                    onClick={shipAll}
                    title={hasCarrier ? 'Remettre au transporteur' : 'En attente qu\'un livreur accepte'}
                >
                    Remis livreur
                </ActionBtn>
            )}

            {hasShipped && (
                <ActionBtn variant="success" icon={CheckCircle2} disabled={isPending} onClick={deliverAll} title="Marquer comme livré">
                    Livré
                </ActionBtn>
            )}

            {canTrack && (
                <ActionBtn variant="info" icon={MapPin} onClick={() => navigate(`/tracking?orderId=${orderId}`)} title="Suivi GPS">
                    GPS
                </ActionBtn>
            )}

            {client?.id && (
                <ActionBtn variant="default" icon={MessageCircle} onClick={() => navigate(`/messages?recipient=${client.id}`)} title="Contacter le client">
                    Client
                </ActionBtn>
            )}

            {hasCarrier && (
                <ActionBtn
                    variant="primary"
                    icon={Truck}
                    onClick={() => navigate(`/messages?recipient=${carrierId}`)}
                    title={carrier?.nom_complet ? `Contacter ${carrier.nom_complet}` : 'Contacter le livreur'}
                >
                    Livreur
                </ActionBtn>
            )}

            {canCancelAny && (
                <ActionBtn variant="danger" icon={XCircle} disabled={isPending} onClick={cancelAll} title="Annuler">
                    Annuler
                </ActionBtn>
            )}

            {items.every((i) => i.statut === 'annule') && (
                <ActionBtn
                    variant="default"
                    icon={RotateCcw}
                    disabled={isPending}
                    onClick={() => items.forEach((i) => onStatusUpdate(i.id, 'en_attente'))}
                    title="Réouvrir la commande"
                >
                    Réouvrir
                </ActionBtn>
            )}

            {hasPreparedOnly && !hasCarrier && logistics === 'pret' && (
                <span className="self-center text-[10px] font-bold text-amber-600 uppercase whitespace-nowrap px-2">
                    Attente livreur…
                </span>
            )}
        </div>
    );
};

export default VendorOrderActions;
