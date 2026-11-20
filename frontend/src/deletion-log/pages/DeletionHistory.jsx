import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DataTable from '../../components/ui/DataTable';
import { ModalOverlay } from '../../components/ui/ModalOverlay';
import deletionLogService from '../services/deletionLogService';
import {
    History, Search, RefreshCcw, Eye, RotateCcw, ShieldAlert,
    User, Tag, Clock, CheckCircle2, AlertTriangle
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';

const TABLE_LABELS = {
    Product: 'Produit',
    Category: 'Catégorie',
    Notification: 'Notification',
    Publicite: 'Publicité',
    EducationalResource: 'Ressource BCA Academy',
    Webinar: 'Webinaire',
    User: 'Utilisateur (cascade complète)',
    'User (auto-suppression RGPD)': 'Utilisateur (auto-suppression RGPD)',
    AiConversation: 'Discussion IA',
};

const DeletionHistory = () => {
    const [page, setPage] = useState(1);
    const [tableFilter, setTableFilter] = useState('');
    const [search, setSearch] = useState('');
    const [viewing, setViewing] = useState(null);
    const [restoringId, setRestoringId] = useState(null);

    const { data, isLoading, refetch, isFetching } = useQuery({
        queryKey: ['deletion-history', page, tableFilter, search],
        queryFn: () => deletionLogService.getAll({ page, limit: 25, table_affectee: tableFilter, search }),
        keepPreviousData: true,
    });

    const logs = data?.logs || [];
    const restorableTables = data?.restorableTables || [];

    const handleRestore = async (log) => {
        setRestoringId(log.id);
        try {
            await deletionLogService.restore(log.id);
            toast.success('Élément restauré avec succès.');
            refetch();
        } catch (err) {
            toast.error(err?.response?.data?.message || "Échec de la restauration.");
        } finally {
            setRestoringId(null);
        }
    };

    return (
        <DashboardLayout title="Historique des suppressions" noPadding>
            <div className="min-h-screen bg-background p-6 lg:p-10 space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <div className="size-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <History className="size-7 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                Historique des suppressions
                            </h1>
                            <p className="text-xs text-muted-foreground font-medium mt-1 max-w-xl">
                                Rien n'est jamais réellement effacé sans laisser de trace : chaque suppression sur la plateforme
                                dépose ici une preuve complète (instantané des données), consultable indéfiniment.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => refetch()}
                        className="h-11 px-5 rounded-xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all shrink-0"
                    >
                        <RefreshCcw className={cn("size-4", isFetching && "animate-spin")} />
                        Actualiser
                    </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
                        <input
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            placeholder="Rechercher par nom, identifiant, auteur..."
                            className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-100 dark:border-white/10 bg-white dark:bg-white/5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                    <select
                        value={tableFilter}
                        onChange={(e) => { setTableFilter(e.target.value); setPage(1); }}
                        className="h-11 px-4 rounded-xl border border-slate-100 dark:border-white/10 bg-white dark:bg-white/5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        <option value="">Tous les types</option>
                        {Object.keys(TABLE_LABELS).map((key) => (
                            <option key={key} value={key}>{TABLE_LABELS[key] || key}</option>
                        ))}
                    </select>
                </div>

                <DataTable
                    isLoading={isLoading}
                    emptyMessage="AUCUNE SUPPRESSION ENREGISTRÉE"
                    columns={[
                        {
                            label: 'Élément supprimé',
                            render: (row) => (
                                <div className="flex flex-col gap-1 py-2">
                                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                                        {row.libelle || `#${row.id_enregistrement?.slice(0, 8)}`}
                                    </span>
                                    <span className="inline-flex items-center gap-1 w-fit text-[9px] font-black uppercase tracking-widest text-primary bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">
                                        <Tag className="size-2.5" />
                                        {TABLE_LABELS[row.table_affectee] || row.table_affectee}
                                    </span>
                                </div>
                            ),
                        },
                        {
                            label: 'Supprimé par',
                            render: (row) => (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <User className="size-3.5 shrink-0" />
                                    {row.supprime_par_nom || 'Système'}
                                </div>
                            ),
                        },
                        {
                            label: 'Confirmation saisie',
                            render: (row) => (
                                row.confirmation_saisie
                                    ? <span className="font-mono text-[11px] bg-slate-50 dark:bg-white/5 px-2 py-1 rounded border border-slate-100 dark:border-white/10">{row.confirmation_saisie}</span>
                                    : <span className="text-muted-foreground text-xs">—</span>
                            ),
                        },
                        {
                            label: 'Date',
                            render: (row) => (
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Clock className="size-3.5" />
                                    {new Date(row.createdAt).toLocaleString('fr-FR')}
                                </div>
                            ),
                        },
                        {
                            label: 'État',
                            render: (row) => row.restaure ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                                    <CheckCircle2 className="size-3" /> Restauré
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-rose-600 bg-rose-50 px-2 py-1 rounded-full border border-rose-100">
                                    <ShieldAlert className="size-3" /> Supprimé
                                </span>
                            ),
                        },
                        {
                            label: 'Actions',
                            render: (row) => (
                                <div className="flex items-center justify-end gap-2 pr-2">
                                    <button
                                        onClick={() => setViewing(row)}
                                        title="Voir la preuve complète"
                                        className="size-9 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-center text-muted-foreground hover:text-primary transition-all"
                                    >
                                        <Eye className="size-4" />
                                    </button>
                                    {!row.restaure && restorableTables.includes(row.table_affectee) && (
                                        <button
                                            onClick={() => handleRestore(row)}
                                            disabled={restoringId === row.id}
                                            title="Restaurer cet élément"
                                            className="size-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 hover:bg-emerald-100 transition-all disabled:opacity-50"
                                        >
                                            {restoringId === row.id ? <RefreshCcw className="size-4 animate-spin" /> : <RotateCcw className="size-4" />}
                                        </button>
                                    )}
                                </div>
                            ),
                        },
                    ]}
                    data={logs}
                />

                {data && data.pages > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        <button
                            disabled={page <= 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            className="h-9 px-4 rounded-lg bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 text-xs font-semibold disabled:opacity-40"
                        >
                            Précédent
                        </button>
                        <span className="text-xs text-muted-foreground font-medium">Page {data.currentPage} / {data.pages}</span>
                        <button
                            disabled={page >= data.pages}
                            onClick={() => setPage((p) => p + 1)}
                            className="h-9 px-4 rounded-lg bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 text-xs font-semibold disabled:opacity-40"
                        >
                            Suivant
                        </button>
                    </div>
                )}
            </div>

            <ModalOverlay open={!!viewing} onClose={() => setViewing(null)} title="Preuve de suppression" maxWidth="max-w-2xl">
                {viewing && (
                    <div className="p-6 pt-4 space-y-4">
                        {!viewing.restaure && !restorableTables.includes(viewing.table_affectee) && (
                            <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-xs text-amber-700 dark:text-amber-300">
                                <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                                La restauration automatique n'est pas disponible pour ce type d'élément — cette preuve reste
                                consultable en cas de besoin, mais toute réintégration nécessite une intervention manuelle du support.
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div><span className="text-muted-foreground">Type</span><p className="font-bold">{TABLE_LABELS[viewing.table_affectee] || viewing.table_affectee}</p></div>
                            <div><span className="text-muted-foreground">Identifiant d'origine</span><p className="font-mono">{viewing.id_enregistrement}</p></div>
                            <div><span className="text-muted-foreground">Supprimé par</span><p className="font-bold">{viewing.supprime_par_nom || 'Système'}</p></div>
                            <div><span className="text-muted-foreground">Date</span><p className="font-bold">{new Date(viewing.createdAt).toLocaleString('fr-FR')}</p></div>
                            {viewing.confirmation_saisie && (
                                <div className="col-span-2"><span className="text-muted-foreground">Texte tapé pour confirmer</span><p className="font-mono">{viewing.confirmation_saisie}</p></div>
                            )}
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-1.5">Instantané complet des données (JSON)</p>
                            <pre className="max-h-96 overflow-auto bg-slate-900 text-emerald-300 text-[11px] p-4 rounded-xl leading-relaxed">
                                {JSON.stringify(viewing.snapshot, null, 2)}
                            </pre>
                        </div>
                    </div>
                )}
            </ModalOverlay>
        </DashboardLayout>
    );
};

export default DeletionHistory;
