import React from 'react';
import { ClipboardCheck, ShieldAlert, ShieldCheck, ShieldQuestion } from 'lucide-react';
import { useVendorScorecard } from '../hooks/useVendorScorecard';

const NIVEAU_CONFIG = {
    excellent: { label: 'Fournisseur excellent', icon: ShieldCheck, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    fiable: { label: 'Fournisseur fiable', icon: ShieldCheck, color: 'text-primary bg-primary/5 border-primary/20' },
    a_surveiller: { label: 'À surveiller', icon: ShieldAlert, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    donnees_insuffisantes: { label: 'Historique insuffisant', icon: ShieldQuestion, color: 'text-slate-400 bg-slate-50 border-slate-200' },
};

/**
 * Préqualification / scorecard fournisseur (analyse concurrentielle #6) —
 * calculé depuis l'historique transactionnel réel (litiges, avis,
 * ancienneté, réactivité), affiché sur la page boutique publique.
 */
const VendorScorecardCard = ({ vendorId }) => {
    const { data, loading } = useVendorScorecard(vendorId);

    if (loading || !data) return null;

    const config = NIVEAU_CONFIG[data.niveau] || NIVEAU_CONFIG.donnees_insuffisantes;
    const Icon = config.icon;

    return (
        <div className="bca-card p-5 space-y-4">
            <div className="flex items-center gap-3">
                <div className={`size-10 rounded-xl flex items-center justify-center border ${config.color}`}>
                    <Icon className="size-5" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-[#333] flex items-center gap-1.5">
                        <ClipboardCheck className="size-3.5 text-slate-300" />
                        Préqualification
                    </h3>
                    <p className={`text-xs font-black ${config.color.split(' ')[0]}`}>{config.label}</p>
                </div>
                {data.niveau !== 'donnees_insuffisantes' && (
                    <span className="ml-auto text-lg font-black text-[#333] tabular-nums">{data.score_total}<span className="text-xs text-slate-400">/100</span></span>
                )}
            </div>

            {data.niveau !== 'donnees_insuffisantes' && (
                <div className="grid grid-cols-2 gap-2 text-center">
                    {Object.entries(data.details).map(([key, d]) => (
                        <div key={key} className="p-2.5 bg-[#fafafa] rounded border border-[#f0f0f0]">
                            <p className="text-[9px] text-[#999] uppercase tracking-wide">{d.label}</p>
                            <p className="text-sm font-bold text-[#333]">
                                {d.valeur === null ? '—' : d.valeur}
                                {key === 'litiges' && d.valeur !== null ? '%' : ''}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default VendorScorecardCard;
