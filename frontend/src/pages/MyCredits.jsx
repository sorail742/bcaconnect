import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Landmark, Clock, CheckCircle2, AlertCircle, ArrowRight,
    CreditCard, Calendar, TrendingUp, RefreshCcw, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { DataStateWrapper } from '../components/ui/DataStates';
import { useLanguage } from '../context/LanguageContext';
import { useMyCredits, usePayInstallment } from '../hooks/useDomainData';

export default function MyCredits() {
    const { t, lang } = useLanguage();
    const { data: credits, loading, error, refetch } = useMyCredits();
    const payInstallment = usePayInstallment();
    const [payingId, setPayingId] = useState(null);

    const statusMap = {
        en_attente: { label: t('statusWaiting') || 'En attente', color: 'text-amber-500', bg: 'bg-amber-500/10', icon: Clock },
        approuve: { label: t('statusApproved') || 'Approuvé', color: 'text-blue-500', bg: 'bg-blue-500/10', icon: CheckCircle2 },
        rembourse: { label: t('statusRefunded') || 'Remboursé', color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: CheckCircle2 },
        refuse: { label: t('statusRejected') || 'Refusé', color: 'text-rose-500', bg: 'bg-rose-500/10', icon: AlertCircle },
    };

    const handlePayInstallment = async (echeanceId) => {
        setPayingId(echeanceId);
        try {
            await payInstallment.mutateAsync(echeanceId);
        } finally {
            setPayingId(null);
        }
    };

    return (
        <main className="min-h-screen bg-background pt-32 pb-16">
            <div className="container mx-auto px-4 md:px-8">

                {/* Header */}
                <div className="max-w-4xl mx-auto mb-12 text-center space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs font-black text-primary uppercase tracking-widest"
                    >
                        <Landmark className="size-3" /> {t('myFinancing') || "MES FINANCEMENTS"}
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
                        {t('creditHistory')?.split(' ').slice(0, -1).join(' ') || "Historique"} <span className="text-primary">{t('creditHistory')?.split(' ').slice(-1) || "Crédits"}</span>
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium">
                        {t('creditHistoryDesc') || "Suivi de vos demandes de financement et échéanciers de remboursement."}
                    </p>
                </div>

                {/* Actions */}
                <div className="max-w-5xl mx-auto mb-8 flex justify-end">
                    <Link
                        to="/credits/simulate"
                        className="h-10 px-6 bg-primary text-primary-foreground rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
                    >
                        <Sparkles className="size-4" /> {t('newSimulation') || "Nouvelle Simulation"}
                    </Link>
                </div>

                {/* Content */}
                <div className="max-w-5xl mx-auto space-y-6">
                    <DataStateWrapper
                        isLoading={loading}
                        error={error}
                        isEmpty={!credits.length}
                        onRetry={refetch}
                        loadingVariant="grid"
                        emptyMessage={t('noCredits') || 'Aucun crédit en cours. Lancez une simulation pour commencer.'}
                    >
                        {credits.map((credit, idx) => {
                            const status = statusMap[credit.statut] || statusMap.en_attente;
                            const StatusIcon = status.icon;
                            const echeances = credit.echeances || [];
                            const paidCount = echeances.filter(e => e.statut === 'paye').length;
                            const progress = echeances.length > 0 ? (paidCount / echeances.length) * 100 : 0;

                            return (
                                <motion.div
                                    key={credit.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                                >
                                    {/* Credit Header */}
                                    <div className="p-6 border-b border-border">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="size-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                                    <CreditCard className="size-6 text-primary" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h3 className="text-sm font-black text-foreground uppercase tracking-tight">
                                                            Crédit #{credit.id.slice(0, 8).toUpperCase()}
                                                        </h3>
                                                        <div className={cn("px-3 py-1 rounded-lg flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest", status.bg, status.color)}>
                                                            <StatusIcon className="size-3" />
                                                            {status.label}
                                                        </div>
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                                                        Soumis le {new Date(credit.created_at || credit.createdAt).toLocaleDateString(lang === 'FR' ? 'fr-FR' : 'en-US')}
                                                        {credit.ia_score_solvabilite && ` • Score IA : ${(credit.ia_score_solvabilite * 100).toFixed(0)}%`}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-black text-primary tabular-nums">
                                                    {parseFloat(credit.montant_principal).toLocaleString(lang === 'FR' ? 'fr-GN' : 'en-US')} <span className="text-xs">GNF</span>
                                                </p>
                                                <p className="text-[10px] text-muted-foreground font-bold uppercase">
                                                    {credit.duree_mois} {lang === 'FR' ? 'mois' : 'months'} • {credit.taux_interet}% taux
                                                </p>
                                            </div>
                                        </div>

                                        {/* Progress bar */}
                                        {credit.statut === 'approuve' && echeances.length > 0 && (
                                            <div className="mt-4 space-y-2">
                                                <div className="flex justify-between text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                                    <span>{t('repayment') || "Remboursement"}</span>
                                                    <span>{paidCount}/{echeances.length} {lang === 'FR' ? 'échéances' : 'installments'} ({progress.toFixed(0)}%)</span>
                                                </div>
                                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${progress}%` }}
                                                        className="h-full bg-primary rounded-full"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Échéancier */}
                                    {credit.statut === 'approuve' && echeances.length > 0 && (
                                        <div className="p-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                {echeances.map((ech) => (
                                                    <div
                                                        key={ech.id}
                                                        className={cn(
                                                            "p-4 rounded-xl border transition-all",
                                                            ech.statut === 'paye'
                                                                ? "bg-emerald-500/5 border-emerald-500/20"
                                                                : "bg-muted border-border hover:border-primary/30"
                                                        )}
                                                    >
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <Calendar className="size-3 text-muted-foreground" />
                                                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                                                    {new Date(ech.date_echeance).toLocaleDateString(lang === 'FR' ? 'fr-FR' : 'en-US', { month: 'short', year: 'numeric' })}
                                                                </span>
                                                            </div>
                                                            {ech.statut === 'paye' ? (
                                                                <CheckCircle2 className="size-4 text-emerald-500" />
                                                            ) : (
                                                                <Clock className="size-4 text-amber-500" />
                                                            )}
                                                        </div>
                                                        <p className="text-sm font-black text-foreground tabular-nums mb-2">
                                                            {parseFloat(ech.montant_du).toLocaleString(lang === 'FR' ? 'fr-GN' : 'en-US')} GNF
                                                        </p>
                                                        {ech.statut !== 'paye' && (
                                                            <button
                                                                onClick={() => handlePayInstallment(ech.id)}
                                                                disabled={payingId === ech.id}
                                                                className="w-full h-8 bg-primary text-primary-foreground rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                                                            >
                                                                {payingId === ech.id ? (
                                                                    <RefreshCcw className="size-3 animate-spin" />
                                                                ) : (
                                                                    <CreditCard className="size-3" />
                                                                )}
                                                                {payingId === ech.id ? (t('paying') || 'PAIEMENT...') : (t('pay') || 'PAYER')}
                                                            </button>
                                                        )}
                                                        {ech.statut === 'paye' && ech.reference_paiement && (
                                                            <p className="text-[8px] text-emerald-500 font-mono mt-1">
                                                                REF: {ech.reference_paiement}
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </DataStateWrapper>
                </div>
            </div>
        </main>
    );
}
