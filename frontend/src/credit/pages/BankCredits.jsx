import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DataTable from '../../components/ui/DataTable';
import { usePendingCredits, useApproveCredit, useRejectCredit } from '../hooks/useCreditData';
import { usePendingWithdrawals, useProcessWithdrawal } from '../../wallet/hooks/useWalletData';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { addPdfLetterhead } from '../../lib/pdfBranding';
import {
    Landmark, ArrowLeft, CheckCircle2, XCircle, RefreshCcw,
    User, TrendingUp, Clock, FileText, Wallet as WalletIcon, Phone,
    Download, FileSpreadsheet, FileType,
} from 'lucide-react';

const formatGnf = (val) => `${parseFloat(val || 0).toLocaleString('fr-GN')} GNF`;

const BankCredits = () => {
    const { data: credits, loading, refetch } = usePendingCredits();
    const { mutate: approve, isPending: approving } = useApproveCredit();
    const { mutate: reject, isPending: rejecting } = useRejectCredit();
    const [rejectId, setRejectId] = useState(null);
    const [motif, setMotif] = useState('');

    const { data: withdrawals, loading: withdrawalsLoading, refetch: refetchWithdrawals } = usePendingWithdrawals();
    const { mutate: processWithdrawal, isPending: processingWithdrawal } = useProcessWithdrawal();
    const [rejectWithdrawalId, setRejectWithdrawalId] = useState(null);
    const [withdrawalNote, setWithdrawalNote] = useState('');
    const [showExportMenu, setShowExportMenu] = useState(false);

    const handleReject = () => {
        if (!rejectId) return;
        reject({ id: rejectId, motif_refus: motif }, {
            onSuccess: () => { setRejectId(null); setMotif(''); },
        });
    };

    const handleRejectWithdrawal = () => {
        if (!rejectWithdrawalId) return;
        processWithdrawal({ id: rejectWithdrawalId, action: 'reject', notes_admin: withdrawalNote }, {
            onSuccess: () => { setRejectWithdrawalId(null); setWithdrawalNote(''); },
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

    const withdrawalColumns = [
        {
            label: 'DEMANDEUR',
            render: (row) => (
                <div className="flex items-center gap-3 py-1">
                    <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <User className="size-4" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase">{row.Wallet?.User?.nom_complet || '—'}</p>
                        <p className="text-[8px] text-muted-foreground">{row.Wallet?.User?.email}</p>
                    </div>
                </div>
            ),
        },
        {
            label: 'MONTANT',
            render: (row) => (
                <span className="text-sm font-black tabular-nums text-primary">
                    {formatGnf(row.montant)}
                </span>
            ),
        },
        {
            label: 'DESTINATION',
            render: (row) => (
                <div className="text-[10px] font-black uppercase flex items-center gap-1">
                    <Phone className="size-3" />
                    {row.metadata?.destination_phone} <span className="text-muted-foreground normal-case">({row.metadata?.methode})</span>
                </div>
            ),
        },
        {
            label: 'NET À ENVOYER',
            render: (row) => (
                <span className="text-sm font-black tabular-nums text-emerald-500">
                    {formatGnf(row.metadata?.montant_net)}
                </span>
            ),
        },
        {
            label: 'ACTIONS',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => processWithdrawal({ id: row.id, action: 'approve' })}
                        disabled={processingWithdrawal}
                        className="size-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center hover:scale-105 transition-all disabled:opacity-50"
                        title="Valider — j'ai envoyé les fonds"
                    >
                        <CheckCircle2 className="size-4" />
                    </button>
                    <button
                        onClick={() => { setRejectWithdrawalId(row.id); setWithdrawalNote(''); }}
                        disabled={processingWithdrawal}
                        className="size-8 rounded-lg bg-rose-500 text-white flex items-center justify-center hover:scale-105 transition-all disabled:opacity-50"
                        title="Refuser"
                    >
                        <XCircle className="size-4" />
                    </button>
                </div>
            ),
        },
    ];

    const getExportData = () => [
        ...credits.map((row) => ({
            "REGISTRE": "Crédit",
            "DEMANDEUR": row.utilisateur?.nom_complet || 'N/A',
            "EMAIL": row.utilisateur?.email || 'N/A',
            "MONTANT (GNF)": Math.round(parseFloat(row.montant_principal) || 0),
            "DURÉE (MOIS)": row.duree_mois || 0,
            "SCORE IA (%)": Math.round(row.ia_score_solvabilite || 0),
            "MOTIF": row.motif || '—',
        })),
        ...withdrawals.map((row) => ({
            "REGISTRE": "Retrait",
            "DEMANDEUR": row.Wallet?.User?.nom_complet || 'N/A',
            "EMAIL": row.Wallet?.User?.email || 'N/A',
            "MONTANT (GNF)": Math.round(parseFloat(row.montant) || 0),
            "DURÉE (MOIS)": '—',
            "SCORE IA (%)": '—',
            "MOTIF": `${row.metadata?.destination_phone || ''} (${row.metadata?.methode || ''})`,
        })),
    ];

    const handleExportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(getExportData());
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Demandes Banque");
        XLSX.writeFile(workbook, `BCA_Demandes_Banque_${Date.now()}.xlsx`);
        setShowExportMenu(false);
        toast.success("Excel généré avec succès.");
    };

    const handleExportCSV = () => {
        const worksheet = XLSX.utils.json_to_sheet(getExportData());
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `BCA_Demandes_Banque_${Date.now()}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setShowExportMenu(false);
        toast.success("Fichier CSV généré.");
    };

    const handleExportPDF = () => {
        const doc = new jsPDF("landscape");
        const headerY = addPdfLetterhead(
            doc,
            "REGISTRE DES DEMANDES — CRÉDITS & RETRAITS",
            `GÉNÉRÉ LE : ${new Date().toLocaleString()} • ${credits.length} crédit(s) • ${withdrawals.length} retrait(s) en attente`,
        );

        autoTable(doc, {
            startY: headerY,
            head: [["Registre", "Demandeur", "Email", "Montant (GNF)", "Durée (mois)", "Score IA (%)", "Motif"]],
            body: getExportData().map((row) => [
                row["REGISTRE"],
                row["DEMANDEUR"],
                row["EMAIL"],
                row["MONTANT (GNF)"].toLocaleString("fr-GN"),
                row["DURÉE (MOIS)"],
                row["SCORE IA (%)"],
                row["MOTIF"],
            ]),
            theme: "grid",
            headStyles: { fillColor: [28, 160, 219], textColor: [255, 255, 255] },
            styles: { fontSize: 8 },
            margin: { top: headerY },
        });

        doc.save(`BCA_Demandes_Banque_${Date.now()}.pdf`);
        setShowExportMenu(false);
        toast.success("Rapport PDF prêt.");
    };

    return (
        <DashboardLayout title="DEMANDES EN ATTENTE">
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
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <button
                                onClick={() => setShowExportMenu((v) => !v)}
                                className="h-9 px-4 rounded-xl border border-border flex items-center gap-2 text-[9px] font-black uppercase tracking-widest hover:text-primary transition-colors"
                            >
                                <Download className="size-4" />
                                Exporter
                            </button>
                            {showExportMenu && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />
                                    <div className="absolute right-0 mt-2 w-52 rounded-xl border border-border bg-card shadow-xl z-20 overflow-hidden">
                                        <button
                                            onClick={handleExportExcel}
                                            className="w-full flex items-center gap-2 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest hover:bg-muted transition-colors"
                                        >
                                            <FileSpreadsheet className="size-4 text-emerald-600" />
                                            Excel (.xlsx)
                                        </button>
                                        <button
                                            onClick={handleExportCSV}
                                            className="w-full flex items-center gap-2 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest hover:bg-muted transition-colors"
                                        >
                                            <FileType className="size-4 text-blue-600" />
                                            CSV
                                        </button>
                                        <button
                                            onClick={handleExportPDF}
                                            className="w-full flex items-center gap-2 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest hover:bg-muted transition-colors"
                                        >
                                            <FileText className="size-4 text-red-600" />
                                            PDF
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                        <button
                            onClick={() => refetch()}
                            className="size-9 rounded-xl border border-border flex items-center justify-center hover:text-primary transition-colors"
                        >
                            <RefreshCcw className={cn('size-4', loading && 'animate-spin')} />
                        </button>
                    </div>
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

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-border shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <WalletIcon className="size-5" />
                        </div>
                        <div>
                            <h2 className="text-sm font-black uppercase">Retraits en <span className="text-primary">attente</span></h2>
                            <p className="text-[9px] text-muted-foreground uppercase tracking-widest">
                                {withdrawals.length} demande(s) — solde déjà bloqué côté client
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => refetchWithdrawals()}
                        className="size-9 rounded-xl border border-border flex items-center justify-center hover:text-primary transition-colors"
                    >
                        <RefreshCcw className={cn('size-4', withdrawalsLoading && 'animate-spin')} />
                    </button>
                </div>

                <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-border flex items-center gap-2">
                        <FileText className="size-4 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Registre des retraits</span>
                    </div>
                    <div className="p-2">
                        <DataTable columns={withdrawalColumns} data={withdrawals} isLoading={withdrawalsLoading} className="bg-transparent border-0" />
                        {!withdrawalsLoading && withdrawals.length === 0 && (
                            <div className="py-20 text-center opacity-40 flex flex-col items-center gap-3">
                                <CheckCircle2 className="size-8 text-emerald-500" />
                                <p className="text-[10px] font-black uppercase">Aucun retrait en attente</p>
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

            {rejectWithdrawalId && (
                <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
                        <h3 className="text-sm font-black uppercase">Motif de refus du retrait</h3>
                        <p className="text-[10px] text-muted-foreground">Le solde sera intégralement restitué au client.</p>
                        <textarea
                            value={withdrawalNote}
                            onChange={(e) => setWithdrawalNote(e.target.value)}
                            placeholder="Expliquez la raison du refus (optionnel)..."
                            rows={4}
                            className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm outline-none focus:border-primary/50 resize-none"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => setRejectWithdrawalId(null)}
                                className="flex-1 h-10 rounded-xl border border-border text-[10px] font-black uppercase"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleRejectWithdrawal}
                                disabled={processingWithdrawal}
                                className="flex-1 h-10 rounded-xl bg-rose-500 text-white text-[10px] font-black uppercase disabled:opacity-50"
                            >
                                {processingWithdrawal ? 'Refus...' : 'Confirmer le refus'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default BankCredits;
