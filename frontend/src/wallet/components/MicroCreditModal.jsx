import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Zap, Loader2, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { ModalOverlay } from '../../components/ui/ModalOverlay';
import { Button } from '../../components/ui/Button';
import creditService from '../../credit/services/creditService';
import { useAIScore } from '../../credit/hooks/useAIScore';

/**
 * Micro-prêt express (cahier des charges 3.13 — sous-bancarisés) : montant
 * plafonné, courte durée, versement instantané sur le portefeuille si le
 * score IA de l'utilisateur est suffisant. Sinon, part comme une demande
 * classique en attente de revue banque.
 */
const MicroCreditModal = ({ open, onClose, onSuccess }) => {
    const { data: config } = useQuery({
        queryKey: ['micro-credit-config'],
        queryFn: () => creditService.getMicroConfig(),
        enabled: open,
        staleTime: 5 * 60_000,
    });
    const { scoreData } = useAIScore();

    const [montant, setMontant] = useState(100000);
    const [dureeMois, setDureeMois] = useState(1);
    const [motif, setMotif] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);

    const maxAmount = config?.montant_max || 500000;
    const maxDuration = config?.duree_max_mois || 3;
    const likelyAutoApproved = scoreData?.score >= (config?.seuil_approbation_auto ?? 50);

    const handleClose = () => {
        setResult(null);
        setMotif('');
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (montant <= 0 || montant > maxAmount) {
            toast.error(`Le montant doit être entre 1 et ${maxAmount.toLocaleString('fr-GN')} GNF.`);
            return;
        }
        setSubmitting(true);
        try {
            const res = await creditService.requestMicro({
                montant_principal: montant,
                duree_mois: dureeMois,
                motif: motif.trim() || undefined,
            });
            setResult(res);
            onSuccess?.();
            if (res.auto_approved) {
                toast.success('Micro-prêt approuvé et versé instantanément !');
            } else {
                toast.info('Demande envoyée, en attente de revue par la banque.');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Impossible de soumettre la demande.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <ModalOverlay open={open} onClose={handleClose} title="Micro-prêt express" maxWidth="max-w-md">
            <div className="p-6 pt-4 space-y-5">
                {result ? (
                    <div className="text-center space-y-4 py-4">
                        <div className={`size-16 rounded-full mx-auto flex items-center justify-center ${result.auto_approved ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                            {result.auto_approved ? <CheckCircle2 className="size-8" /> : <Clock className="size-8" />}
                        </div>
                        <div>
                            <p className="font-black text-foreground">
                                {result.auto_approved ? 'Fonds versés !' : 'Demande en attente'}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                                {result.auto_approved
                                    ? `${parseFloat(montant).toLocaleString('fr-GN')} GNF ont été ajoutés à votre portefeuille.`
                                    : "Votre demande sera examinée par la banque sous peu."}
                            </p>
                        </div>
                        <Button onClick={handleClose} className="w-full">Fermer</Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
                            <Sparkles className="size-4 text-primary shrink-0 mt-0.5" />
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Avance de trésorerie rapide, sans commande liée. Plafond {maxAmount.toLocaleString('fr-GN')} GNF
                                sur {maxDuration} mois max. {likelyAutoApproved
                                    ? 'Votre profil est éligible à une approbation instantanée.'
                                    : 'Selon votre score, la demande peut nécessiter une revue banque.'}
                            </p>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                Montant (GNF)
                            </label>
                            <input
                                type="number"
                                min={1}
                                max={maxAmount}
                                value={montant}
                                onChange={(e) => setMontant(Number(e.target.value))}
                                className="mt-2 w-full h-11 px-4 bg-background border border-border rounded-xl text-sm font-bold outline-none focus:border-primary/50"
                            />
                            <input
                                type="range"
                                min={10000}
                                max={maxAmount}
                                step={10000}
                                value={Math.min(montant, maxAmount)}
                                onChange={(e) => setMontant(Number(e.target.value))}
                                className="w-full mt-2 accent-primary"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                Durée de remboursement
                            </label>
                            <div className="flex gap-2 mt-2">
                                {Array.from({ length: maxDuration }, (_, i) => i + 1).map((m) => (
                                    <button
                                        key={m}
                                        type="button"
                                        onClick={() => setDureeMois(m)}
                                        className={`flex-1 h-10 rounded-xl text-xs font-black uppercase transition-all ${dureeMois === m ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/70'}`}
                                    >
                                        {m} mois
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                Motif (optionnel)
                            </label>
                            <textarea
                                value={motif}
                                onChange={(e) => setMotif(e.target.value)}
                                rows={2}
                                placeholder="Ex : achat de stock, dépense urgente..."
                                className="mt-2 w-full px-4 py-3 bg-background border border-border rounded-xl text-sm outline-none focus:border-primary/50 resize-none"
                            />
                        </div>

                        <Button type="submit" disabled={submitting} className="w-full">
                            {submitting ? <Loader2 className="size-4 animate-spin" /> : <Zap className="size-4" />}
                            {submitting ? 'Envoi...' : 'Demander mon micro-prêt'}
                        </Button>
                    </form>
                )}
            </div>
        </ModalOverlay>
    );
};

export default MicroCreditModal;
