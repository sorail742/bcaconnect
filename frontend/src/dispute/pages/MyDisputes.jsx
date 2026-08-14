import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageTransition, { StaggerContainer, StaggerItem } from '../../components/ui/PageTransition';
import { DataStateWrapper } from '../../components/ui/DataStates';
import { useMyDisputes } from '../hooks/useDisputeData';
import { useAuth } from '../../hooks/useAuth';
import {
    Scale, ChevronRight, Sparkles, CheckCircle2, Clock,
    AlertTriangle, Package, Gavel
} from 'lucide-react';
import { cn } from '../../lib/utils';

const STATUS_CONFIG = {
    ouvert: { label: 'Ouvert', className: 'bg-amber-500/10 text-amber-600 border-amber-500/20', step: 1 },
    en_cours: { label: 'En cours', className: 'bg-blue-500/10 text-blue-600 border-blue-500/20', step: 2 },
    en_mediation: { label: 'Médiation IA', className: 'bg-violet-500/10 text-violet-600 border-violet-500/20', step: 2 },
    resolu: { label: 'Résolu', className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', step: 3 },
    ferme: { label: 'Fermé', className: 'bg-slate-500/10 text-muted-foreground border-slate-500/20', step: 3 },
};

const TYPE_LABELS = {
    qualite: 'Qualité produit',
    livraison: 'Livraison',
    paiement: 'Paiement',
    autre: 'Autre',
};

const DisputeStepper = ({ statut }) => {
    const step = STATUS_CONFIG[statut]?.step || 1;
    const steps = ['Ouverture', 'Traitement', 'Résolution'];

    return (
        <div className="flex items-center gap-2 mt-4">
            {steps.map((label, idx) => (
                <React.Fragment key={label}>
                    <div className="flex items-center gap-1.5">
                        <div className={cn(
                            'size-6 rounded-full flex items-center justify-center text-[10px] font-black',
                            step > idx ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                        )}>
                            {idx + 1}
                        </div>
                        <span className={cn(
                            'text-[10px] font-black uppercase tracking-widest hidden sm:inline',
                            step > idx ? 'text-foreground' : 'text-muted-foreground'
                        )}>
                            {label}
                        </span>
                    </div>
                    {idx < steps.length - 1 && (
                        <div className={cn('flex-1 h-0.5 max-w-12 rounded-full', step > idx + 1 ? 'bg-primary' : 'bg-muted')} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

const MyDisputes = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { data: disputes = [], loading, error, refetch, isFetching } = useMyDisputes();

    const sorted = useMemo(
        () => [...disputes].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
        [disputes]
    );

    const activeCount = sorted.filter(d => !['resolu', 'ferme'].includes(d.statut)).length;

    return (
        <DashboardLayout title="Mes Litiges">
            <PageTransition>
                <div className="space-y-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="size-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                                    <Scale className="size-6 text-primary-foreground" />
                                </div>
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-gradient-bca">
                                        Suivi des litiges
                                    </h1>
                                    <p className="text-sm text-muted-foreground font-medium">
                                        {activeCount} dossier{activeCount !== 1 ? 's' : ''} en cours
                                    </p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => refetch()}
                            disabled={isFetching}
                            className="btn-premium self-start md:self-auto"
                        >
                            Actualiser
                        </button>
                    </div>

                    <DataStateWrapper
                        isLoading={loading}
                        error={error}
                        isEmpty={!sorted.length}
                        onRetry={refetch}
                        loadingVariant="table"
                        emptyMessage="Vous n'avez aucun litige ouvert. En cas de problème avec une commande, ouvrez un dossier depuis « Mes commandes »."
                    >
                        <StaggerContainer className="space-y-4">
                            {sorted.map((dispute) => {
                                const status = STATUS_CONFIG[dispute.statut] || STATUS_CONFIG.ouvert;
                                const isDemandeur = dispute.demandeur_id === user?.id;
                                const orderTotal = dispute.Order?.total_ttc ?? dispute.commande?.total_ttc;

                                return (
                                    <StaggerItem key={dispute.id}>
                                        <article className="glass-premium rounded-2xl p-6 border border-border/50 hover:border-primary/20 transition-colors">
                                            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2 mb-3">
                                                        <span className={cn(
                                                            'px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border',
                                                            status.className
                                                        )}>
                                                            {status.label}
                                                        </span>
                                                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-muted text-muted-foreground">
                                                            {TYPE_LABELS[dispute.type] || dispute.type}
                                                        </span>
                                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                                            #{dispute.id.slice(0, 8)}
                                                        </span>
                                                    </div>

                                                    <p className="text-sm font-bold text-foreground line-clamp-2 mb-1">
                                                        {dispute.description}
                                                    </p>

                                                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground font-medium">
                                                        <span className="flex items-center gap-1">
                                                            <Package className="size-3.5" />
                                                            Commande #{String(dispute.commande_id).slice(0, 8).toUpperCase()}
                                                        </span>
                                                        {orderTotal != null && (
                                                            <span className="font-bold text-primary">
                                                                {parseFloat(orderTotal).toLocaleString()} GNF
                                                            </span>
                                                        )}
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="size-3.5" />
                                                            {new Date(dispute.created_at).toLocaleDateString('fr-FR')}
                                                        </span>
                                                        <span className={cn(
                                                            'flex items-center gap-1 font-black uppercase text-[10px] tracking-widest',
                                                            isDemandeur ? 'text-orange-600' : 'text-blue-600'
                                                        )}>
                                                            {isDemandeur ? 'Vous êtes demandeur' : 'Vous êtes défenseur'}
                                                        </span>
                                                    </div>

                                                    <DisputeStepper statut={dispute.statut} />

                                                    {dispute.solution_proposee_ia && (
                                                        <div className="mt-4 p-4 rounded-xl bg-slate-900/95 text-white relative overflow-hidden">
                                                            <div className="flex items-center gap-2 text-orange-400 mb-2">
                                                                <Sparkles className="size-4" />
                                                                <span className="text-[10px] font-black uppercase tracking-widest">
                                                                    Recommandation IA
                                                                </span>
                                                            </div>
                                                            <p className="text-sm font-medium italic opacity-90">
                                                                &ldquo;{dispute.solution_proposee_ia}&rdquo;
                                                            </p>
                                                        </div>
                                                    )}

                                                    {dispute.decision_finale && ['resolu', 'ferme'].includes(dispute.statut) && (
                                                        <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                                            <div className="flex items-center gap-2 text-emerald-600 mb-2">
                                                                <CheckCircle2 className="size-4" />
                                                                <span className="text-[10px] font-black uppercase tracking-widest">
                                                                    Décision finale
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-foreground">{dispute.decision_finale}</p>
                                                            {dispute.remboursement_montant > 0 && (
                                                                <p className="text-xs font-bold text-emerald-600 mt-2">
                                                                    Remboursement : {parseFloat(dispute.remboursement_montant).toLocaleString()} GNF
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex flex-col gap-2 shrink-0">
                                                    <button
                                                        onClick={() => navigate(`/disputes/${dispute.id}`)}
                                                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest hover:opacity-90 transition-colors"
                                                    >
                                                        Ouvrir le dossier
                                                        <ChevronRight className="size-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/orders`)}
                                                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border text-xs font-black uppercase tracking-widest hover:bg-muted transition-colors"
                                                    >
                                                        Voir commande
                                                    </button>
                                                    {!['resolu', 'ferme'].includes(dispute.statut) && (
                                                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 text-amber-700 text-[10px] font-black uppercase tracking-widest">
                                                            <AlertTriangle className="size-3.5 shrink-0" />
                                                            En traitement
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </article>
                                    </StaggerItem>
                                );
                            })}
                        </StaggerContainer>
                    </DataStateWrapper>

                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/30 border border-border/50">
                        <Gavel className="size-5 text-muted-foreground shrink-0" />
                        <p className="text-xs text-muted-foreground">
                            Les litiges sont arbitrés sous 24–48 h. Le remboursement automatique est crédité sur votre portefeuille BCA en cas de résolution favorable.
                        </p>
                    </div>
                </div>
            </PageTransition>
        </DashboardLayout>
    );
};

export default MyDisputes;
