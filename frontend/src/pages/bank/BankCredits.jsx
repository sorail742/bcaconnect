import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DataTable from '../../components/ui/DataTable';
import { usePendingCredits, useApproveCredit, useRejectCredit } from '../../hooks/data/useCreditData';
import { cn } from '../../lib/utils';
import {
    Landmark, ArrowLeft, CheckCircle2, XCircle, RefreshCcw,
    User, TrendingUp, Clock, FileText,
} from 'lucide-react';

const formatGnf = (val) => `${parseFloat(val || 0).toLocaleString('fr-GN')} GNF`;

const BankCredits = () => {
    const { data: credits, loading, refetch } = usePendingCredits();
    const { mutate: approve, isPending: approving } = useApproveCredit();
    const { mutate: reject, isPending: rejecting } = useRejectCredit();
    const [rejectId, setRejectId] = useState(null);
    const [motif, setMotif] = useState('');

    const handleReject = () => {
        if (!rejectId) return;
        reject({ id: rejectId, motif_refus: motif }, {
            onSuccess: () => { setRejectId(null); setMotif(''); },
        });
    };

    const columns = [
        {
            label: 'DEMANDEUR',
            render: (row) => (
                <div className="flex items-center gap-3 py-1">
                    <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <User className="size-4" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase">{row.utilisateur?.nom_complet || '—'}</p>
                        <p className="text-[8px] text-muted-foreground">{row.utilisateur?.email}</p>
                    </div>
                </div>
            ),
        },
        {
            label: 'MONTANT',
            render: (row) => (
                <span className="text-sm font-black tabular-nums text-primary">
                    {formatGnf(row.montant_principal)}
                </span>
            ),
        },
        {
            label: 'DURÉE',
            render: (row) => (
                <span className="text-[10px] font-black uppercase flex items-center gap-1">
                    <Clock className="size-3" />
                    {row.duree_mois} mois
                </span>
            ),
        },
        {
            label: 'SCORE IA',
            render: (row) => (
                <span className={cn(
                    'text-[10px] font-black uppercase flex items-center gap-1',
                    row.ia_score_solvabilite >= 70 ? 'text-emerald-500' :
                        row.ia_score_solvabilite >= 50 ? 'text-amber-500' : 'text-rose-500',
                )}>
                    <TrendingUp className="size-3" />
                    {Math.round(row.ia_score_solvabilite || 0)}%
                </span>
            ),
        },
        {
            label: 'MOTIF',
            render: (row) => (
                <span className="text-[9px] text-muted-foreground line-clamp-2 max-w-[180px]">
                    {row.motif || '—'}
                </span>
            ),
        },
        {
            label: 'ACTIONS',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => approve(row.id)}
                        disabled={approving || rejecting}
                        className="size-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center hover:scale-105 transition-all disabled:opacity-50"
                        title="Approuver"
                    >
                        <CheckCircle2 className="size-4" />
                    </button>
                    <button
                        onClick={() => { setRejectId(row.id); setMotif(''); }}
                        disabled={approving || rejecting}
                        className="size-8 rounded-lg bg-rose-500 text-white flex items-center justify-center hover:scale-105 transition-all disabled:opacity-50"
                        title="Refuser"
                    >
                        <XCircle className="size-4" />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <DashboardLayout title="CRÉDITS EN ATTENTE">
            <div className="space-y-4 animate-in fade-in duration-500 pb-24">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-border shadow-sm">
                    <div className="flex items-center gap-3">
                        <Link to="/bank/dashboard" className="size-8 rounded-xl bg-muted flex items-center justify-center hover:text-primary transition-colors">
                            <ArrowLeft className="size-4" />
                        </Link>
                        <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Landmark className="size-5" />
                        </div>
                        <div>
                            <h2 className="text-sm font-black uppercase">Demandes de <span className="text-primary">financement</span></h2>
                            <p className="text-[9px] text-muted-foreground uppercase tracking-widest">
                                {credits.length} demande(s) en attente d&apos;approbation
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => refetch()}
                        className="size-9 rounded-xl border border-border flex items-center justify-center hover:text-primary transition-colors"
                    >
                        <RefreshCcw className={cn('size-4', loading && 'animate-spin')} />
                    </button>
                </div>

                <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-border flex items-center gap-2">
                        <FileText className="size-4 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Registre des demandes</span>
                    </div>
                    <div className="p-2">
                        <DataTable columns={columns} data={credits} isLoading={loading} className="bg-transparent border-0" />
                        {!loading && credits.length === 0 && (
                            <div className="py-20 text-center opacity-40 flex flex-col items-center gap-3">
                                <CheckCircle2 className="size-8 text-emerald-500" />
                                <p className="text-[10px] font-black uppercase">Aucune demande en attente</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {rejectId && (
                <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
                        <h3 className="text-sm font-black uppercase">Motif de refus</h3>
                        <textarea
                            value={motif}
                            onChange={(e) => setMotif(e.target.value)}
                            placeholder="Expliquez la raison du refus (optionnel)..."
                            rows={4}
                            className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm outline-none focus:border-primary/50 resize-none"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => setRejectId(null)}
                                className="flex-1 h-10 rounded-xl border border-border text-[10px] font-black uppercase"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={rejecting}
                                className="flex-1 h-10 rounded-xl bg-rose-500 text-white text-[10px] font-black uppercase disabled:opacity-50"
                            >
                                {rejecting ? 'Refus...' : 'Confirmer le refus'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default BankCredits;
