import React from 'react';
import { Link2, ExternalLink, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useSmartContracts, useCreateSmartContract } from '../hooks/useIotData';
import { formatRecordTime } from '../../lib/dateUtils';

const TYPE_LABELS = {
    escrow: 'Séquestre',
    certificat_authenticite: "Certificat d'authenticité",
    transfert_propriete: 'Transfert de propriété',
};

const STATUS_META = {
    pending: { label: 'En attente de confirmation', icon: Clock, className: 'text-amber-600 dark:text-amber-400' },
    confirmed: { label: 'Confirmée on-chain', icon: CheckCircle2, className: 'text-emerald-600 dark:text-emerald-400' },
    failed: { label: 'Échec', icon: XCircle, className: 'text-rose-600 dark:text-rose-400' },
};

/**
 * Preuves ancrées sur Polygon Amoy (testnet) pour une commande — cahier des
 * charges 3.16. Chaque preuve est une transaction réelle, signée et
 * diffusée sur le réseau, vérifiable indépendamment de BCA via le lien
 * PolygonScan Amoy (voir iot.service.js pour le design d'ancrage par hash).
 */
const BlockchainProofPanel = ({ orderId, canManage }) => {
    const { stubs, loading } = useSmartContracts(orderId);
    const anchor = useCreateSmartContract(orderId);

    if (loading) return null;
    if (stubs.length === 0 && !canManage) return null;

    return (
        <div className="bg-card border border-border rounded-[2rem] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                    <Link2 className="size-5 text-primary" />
                    <h4 className="text-sm font-black text-foreground uppercase tracking-widest">Preuves blockchain (Polygon Amoy)</h4>
                </div>
                {canManage && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {Object.entries(TYPE_LABELS).map(([type, label]) => (
                            <button
                                key={type}
                                onClick={() => anchor.mutate(type)}
                                disabled={anchor.isPending}
                                className="h-8 px-3 rounded-lg border border-border text-xs font-bold text-muted-foreground hover:text-primary hover:border-primary/40 bg-transparent disabled:opacity-50"
                            >
                                Ancrer : {label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {stubs.length === 0 ? (
                <p className="text-xs text-muted-foreground">Aucune preuve ancrée pour cette commande.</p>
            ) : (
                <ul className="space-y-2">
                    {stubs.map((s) => {
                        const meta = STATUS_META[s.statut_onchain] || STATUS_META.pending;
                        const StatusIcon = meta.icon;
                        return (
                            <li key={s.id} className="p-3 bg-muted/50 rounded-xl border border-border flex items-center justify-between gap-3 flex-wrap">
                                <div className="min-w-0">
                                    <p className="text-xs font-black text-foreground">{TYPE_LABELS[s.type_contrat] || s.type_contrat}</p>
                                    <p className="text-[10px] text-muted-foreground truncate">{formatRecordTime({ created_at: s.createdAt })} · testnet Amoy</p>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <span className={cn('flex items-center gap-1 text-[10px] font-bold uppercase', meta.className)}>
                                        <StatusIcon className="size-3.5" /> {meta.label}
                                    </span>
                                    <a href={s.explorer_url} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-[10px] font-bold text-primary hover:underline">
                                        PolygonScan <ExternalLink className="size-3" />
                                    </a>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default BlockchainProofPanel;
