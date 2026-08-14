import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { DataStateWrapper } from '../../components/ui/DataStates';
import { useAuth } from '../../hooks/useAuth';
import {
    useDispute,
    useRespondDispute,
    useAcceptDisputeProposal,
    useEscalateDispute,
} from '../hooks/useDisputeData';
import {
    Scale, ArrowLeft, Sparkles, MessageSquare, AlertTriangle,
    CheckCircle2, Gavel, Clock, Package, User, Send, Shield,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { formatDateTime } from '../../utils/helpers';

const STATUS_CONFIG = {
    ouvert: { label: 'Ouvert', className: 'bg-amber-500/10 text-amber-600' },
    en_cours: { label: 'En cours', className: 'bg-blue-500/10 text-blue-600' },
    en_mediation: { label: 'Médiation', className: 'bg-violet-500/10 text-violet-600' },
    resolu: { label: 'Résolu', className: 'bg-emerald-500/10 text-emerald-600' },
    ferme: { label: 'Fermé', className: 'bg-slate-500/10 text-muted-foreground' },
};

const EVENT_ICONS = {
    ouverture: Package,
    reponse_defenseur: MessageSquare,
    proposition_ia: Sparkles,
    acceptation: CheckCircle2,
    escalade: Gavel,
    changement_statut: Clock,
    resolution: Shield,
};

const EVENT_LABELS = {
    ouverture: 'Ouverture du dossier',
    reponse_defenseur: 'Réponse du vendeur',
    proposition_ia: 'Proposition IA',
    acceptation: 'Accord des parties',
    escalade: 'Escalade admin',
    changement_statut: 'Changement de statut',
    resolution: 'Résolution',
};

const TYPE_LABELS = {
    qualite: 'Qualité produit',
    livraison: 'Livraison',
    paiement: 'Paiement',
    autre: 'Autre',
};

const DisputeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { data: dispute, loading, error, refetch, isFetching } = useDispute(id);

    const [response, setResponse] = useState('');
    const [escalateMotif, setEscalateMotif] = useState('');
    const [showEscalate, setShowEscalate] = useState(false);

    const respondMutation = useRespondDispute();
    const acceptMutation = useAcceptDisputeProposal();
    const escalateMutation = useEscalateDispute();

    const isActive = dispute && !['resolu', 'ferme'].includes(dispute.statut);
    const isDemandeur = dispute?.demandeur_id === user?.id;
    const isDefenseur = dispute?.defenseur_id === user?.id;
    const status = STATUS_CONFIG[dispute?.statut] || STATUS_CONFIG.ouvert;
    const events = dispute?.evenements || [];

    const handleRespond = () => {
        if (response.trim().length < 10) return;
        respondMutation.mutate({ id, message: response }, { onSuccess: () => setResponse('') });
    };

    const handleEscalate = () => {
        escalateMutation.mutate(
            { id, motif: escalateMotif || undefined },
            { onSuccess: () => { setShowEscalate(false); setEscalateMotif(''); } },
        );
    };

    return (
        <DashboardLayout title="Détail du litige">
            <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
                <button
                    onClick={() => navigate('/disputes')}
                    className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition"
                >
                    <ArrowLeft className="size-4" />
                    Retour aux litiges
                </button>

                <DataStateWrapper isLoading={loading} error={error} onRetry={refetch}>
                    {dispute && (
                        <>
                            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className={cn('px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest', status.className)}>
                                        {status.label}
                                    </span>
                                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-muted text-muted-foreground">
                                        {TYPE_LABELS[dispute.type] || dispute.type}
                                    </span>
                                    <span className="text-[10px] font-black text-muted-foreground uppercase">
                                        #{dispute.id.slice(0, 8)}
                                    </span>
                                </div>

                                <h1 className="text-xl font-black text-foreground flex items-center gap-2">
                                    <Scale className="size-5 text-primary" />
                                    Dossier litige
                                </h1>

                                <p className="text-sm text-foreground">{dispute.description}</p>

                                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <User className="size-4" />
                                        Demandeur : <strong>{dispute.demandeur?.nom_complet}</strong>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <User className="size-4" />
                                        Défenseur : <strong>{dispute.defenseur?.nom_complet}</strong>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Package className="size-4" />
                                        Commande #{dispute.commande_id?.slice(0, 8)}
                                        {dispute.Order?.total_ttc != null && (
                                            <span className="text-primary font-bold">
                                                — {parseFloat(dispute.Order.total_ttc).toLocaleString()} GNF
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Clock className="size-4" />
                                        Ouvert le {formatDateTime(dispute.created_at)}
                                    </div>
                                </div>

                                {dispute.solution_proposee_ia && isActive && (
                                    <div className="p-4 rounded-xl bg-slate-900 text-white">
                                        <div className="flex items-center gap-2 text-orange-400 mb-2">
                                            <Sparkles className="size-4" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Médiation IA</span>
                                            {dispute.ia_score_gravite != null && (
                                                <span className="text-[10px] opacity-70">
                                                    Gravité {(dispute.ia_score_gravite * 100).toFixed(0)}%
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm italic">&ldquo;{dispute.solution_proposee_ia}&rdquo;</p>
                                        {isDemandeur && (
                                            <button
                                                onClick={() => acceptMutation.mutate(id)}
                                                disabled={acceptMutation.isPending}
                                                className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 disabled:opacity-50"
                                            >
                                                Accepter cette proposition
                                            </button>
                                        )}
                                    </div>
                                )}

                                {dispute.decision_finale && ['resolu', 'ferme'].includes(dispute.statut) && (
                                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                        <p className="text-[10px] font-black uppercase text-emerald-600 mb-1">Décision finale</p>
                                        <p className="text-sm">{dispute.decision_finale}</p>
                                        {dispute.remboursement_montant > 0 && (
                                            <p className="text-xs font-bold text-emerald-600 mt-2">
                                                Remboursement : {parseFloat(dispute.remboursement_montant).toLocaleString()} GNF
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Chronologie */}
                            <div className="bg-card border border-border rounded-2xl p-6">
                                <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                                    <Clock className="size-5 text-primary" />
                                    Chronologie
                                </h2>
                                {events.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">Aucun événement enregistré.</p>
                                ) : (
                                    <ol className="space-y-4">
                                        {events.map((ev) => {
                                            const Icon = EVENT_ICONS[ev.type] || Clock;
                                            return (
                                                <li key={ev.id} className="flex gap-4">
                                                    <div className="flex flex-col items-center">
                                                        <div className="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                                            <Icon className="size-4" />
                                                        </div>
                                                        <div className="w-px flex-1 bg-border mt-2" />
                                                    </div>
                                                    <div className="flex-1 pb-4">
                                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                                            <span className="text-xs font-black uppercase tracking-widest text-foreground">
                                                                {EVENT_LABELS[ev.type] || ev.type}
                                                            </span>
                                                            <span className="text-[10px] text-muted-foreground">
                                                                {formatDateTime(ev.created_at)}
                                                            </span>
                                                            {ev.auteur?.nom_complet && (
                                                                <span className="text-[10px] text-muted-foreground">
                                                                    — {ev.auteur.nom_complet}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">{ev.message}</p>
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ol>
                                )}
                            </div>

                            {/* Actions */}
                            {isActive && (
                                <div className="space-y-4">
                                    {isDefenseur && (
                                        <div className="bg-card border border-border rounded-2xl p-6">
                                            <h3 className="font-bold mb-3 flex items-center gap-2">
                                                <MessageSquare className="size-4 text-primary" />
                                                Votre réponse
                                            </h3>
                                            <textarea
                                                value={response}
                                                onChange={(e) => setResponse(e.target.value)}
                                                rows={4}
                                                placeholder="Expliquez votre position (min. 10 caractères)..."
                                                className="w-full px-4 py-3 border border-border rounded-xl bg-background text-sm mb-3"
                                            />
                                            <button
                                                onClick={handleRespond}
                                                disabled={respondMutation.isPending || response.trim().length < 10}
                                                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold disabled:opacity-50"
                                            >
                                                <Send className="size-4" />
                                                Envoyer la réponse
                                            </button>
                                        </div>
                                    )}

                                    {(isDemandeur || isDefenseur) && (
                                        <div className="bg-card border border-border rounded-2xl p-6">
                                            {!showEscalate ? (
                                                <button
                                                    onClick={() => setShowEscalate(true)}
                                                    className="flex items-center gap-2 text-sm font-bold text-amber-600 hover:text-amber-700"
                                                >
                                                    <AlertTriangle className="size-4" />
                                                    Escalader vers un médiateur humain
                                                </button>
                                            ) : (
                                                <div className="space-y-3">
                                                    <h3 className="font-bold flex items-center gap-2">
                                                        <Gavel className="size-4" />
                                                        Motif d&apos;escalade (optionnel)
                                                    </h3>
                                                    <textarea
                                                        value={escalateMotif}
                                                        onChange={(e) => setEscalateMotif(e.target.value)}
                                                        rows={2}
                                                        className="w-full px-4 py-2 border border-border rounded-xl bg-background text-sm"
                                                        placeholder="Pourquoi souhaitez-vous une intervention admin ?"
                                                    />
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => setShowEscalate(false)}
                                                            className="px-4 py-2 border border-border rounded-xl text-sm"
                                                        >
                                                            Annuler
                                                        </button>
                                                        <button
                                                            onClick={handleEscalate}
                                                            disabled={escalateMutation.isPending}
                                                            className="px-4 py-2 bg-amber-600 text-white rounded-xl text-sm font-bold disabled:opacity-50"
                                                        >
                                                            Confirmer l&apos;escalade
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            <button
                                onClick={() => refetch()}
                                disabled={isFetching}
                                className="text-xs font-bold text-muted-foreground hover:text-primary"
                            >
                                {isFetching ? 'Actualisation...' : 'Actualiser le dossier'}
                            </button>
                        </>
                    )}
                </DataStateWrapper>
            </div>
        </DashboardLayout>
    );
};

export default DisputeDetail;
