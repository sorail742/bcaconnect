import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DashboardCard from '../../components/ui/DashboardCard';
import FilterDropdown from '../../components/ui/FilterDropdown';
import {
    Search, Wallet, CheckCircle2, Download, RefreshCcw,
    ArrowUpRight, ArrowDownLeft, Activity,
    Clock, CreditCard, ShieldCheck, History, FileText, PieChart, Database, X
} from 'lucide-react';
import { useAllTransactions } from '../../wallet/hooks/useWalletData';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { getTransactionDirection, getTransactionLabel } from '../../wallet/lib/walletUtils';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { addPdfLetterhead } from '../../lib/pdfBranding';

/** Statut transaction réussi (API utilise `complete`, legacy `terminé`) */
const isTxComplete = (statut) => statut === 'complete' || statut === 'terminé';

const AdminTransactions = () => {
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [showExportMenu, setShowExportMenu] = useState(false);

    // Débounce : on n'interroge le backend qu'une fois la frappe stabilisée
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search.trim()), 350);
        return () => clearTimeout(timer);
    }, [search]);

    const { data, loading: isLoading, refetch: fetchTransactions } = useAllTransactions({ search: debouncedSearch, limit: 100 });
    const transactions = data?.transactions || [];

    const filtered = transactions.filter(t => {
        const matchesStatus = filterStatus === 'ALL' || (filterStatus === 'SUCCESS' && isTxComplete(t.statut)) || (filterStatus === 'PENDING' && t.statut === 'en_attente');
        return matchesStatus;
    });

    const totalVolume = transactions.reduce((acc, t) => acc + parseFloat(t.montant || 0), 0);
    const successfulCount = transactions.filter(t => isTxComplete(t.statut)).length;
    const pendingCount = transactions.filter(t => t.statut === 'en_attente').length;

    const getExportData = () => {
        return filtered.map(t => ({
            ID: t.id?.toUpperCase() || 'N/A',
            USER: t.Wallet?.User?.nom_complet || 'System',
            ROLE: t.Wallet?.User?.role?.toUpperCase() || 'CLIENT',
            TYPE: t.type?.toUpperCase() || 'TX',
            MONTANT: parseFloat(t.montant || 0),
            STATUT: t.statut?.toUpperCase() || 'N/A',
            DATE: new Date(t.createdAt).toLocaleString()
        }));
    };

    const handleExportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(getExportData());
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Ledger");
        XLSX.writeFile(workbook, `BCA_Ledger_${Date.now()}.xlsx`);
        setShowExportMenu(false);
        toast.success("EXPORT EXCEL RÉUSSI.");
    };

    const handleExportCSV = () => {
        const worksheet = XLSX.utils.json_to_sheet(getExportData());
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `BCA_Transactions_${Date.now()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setShowExportMenu(false);
        toast.success("FICHIER CSV GÉNÉRÉ.");
    };

    const handleExportPDF = () => {
        const doc = new jsPDF('landscape');
        const headerY = addPdfLetterhead(doc, "LIVRE DE TRÉSORERIE", `AUDIT RÉSEAU • GÉNÉRÉ LE: ${new Date().toLocaleString()} • TOTAL TX: ${filtered.length}`);

        autoTable(doc, {
            startY: headerY,
            head: [["ID TX", "UTILISATEUR", "RÔLE", "TYPE", "MONTANT", "STATUT", "DATE"]],
            body: getExportData().map(row => [
                row.ID.slice(0, 10),
                row.USER,
                row.ROLE,
                row.TYPE,
                row.MONTANT.toLocaleString() + " GNF",
                row.STATUT,
                row.DATE.split(',')[0]
            ]),
            theme: 'grid',
            headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
            styles: { fontSize: 8 },
            margin: { top: headerY }
        });
        
        doc.save(`BCA_Audit_${Date.now()}.pdf`);
        setShowExportMenu(false);
        toast.success("AUDIT PDF PRÊT POUR ARCHIVAGE.");
    };

    return (
        <DashboardLayout title="TRANSACTIONAL AUDIT" noPadding>
            <div className="min-h-screen bg-background p-6 lg:p-12 space-y-12 custom-scrollbar">
                
                {/* HUD Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex items-start gap-6">
                        <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-2xl shadow-primary/10">
                            <Activity className="size-8 text-primary shadow-glow" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                Audit <span className="text-primary">Flux</span>
                            </h1>
                            <div className="flex items-center gap-2">
                                <div className="size-2 rounded-full bg-emerald-500 animate-pulse border-2 border-white shadow-sm" />
                                <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.3em]">
                                    {transactions.length} ENTRÉES INDEXÉES • SYNC_MASTER
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input 
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="IDENTIFIER USER / ID..."
                                className="h-12 w-80 bg-card border border-border rounded-2xl pl-16 pr-8 text-[11px] font-black uppercase tracking-widest outline-none transition-all placeholder:text-muted-foreground/40 focus:ring-4 focus:ring-primary/5 shadow-sm"
                            />
                        </div>
                        <button 
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            className="h-12 px-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] flex items-center gap-4 shadow-[0_20px_40px_-15px_rgba(15,23,42,0.3)] hover:opacity-90 active:scale-95 transition-all text-white"
                        >
                            <Download className="size-5" />
                            Générer Rapport
                        </button>
                        <button onClick={fetchTransactions} className="size-12 rounded-2xl bg-card border border-border flex items-center justify-center hover:bg-muted transition-all shadow-xl shadow-slate-200/40">
                            <RefreshCcw className={cn("size-6", isLoading && "animate-spin")} />
                        </button>
                    </div>
                </div>

                {/* Export HUD - Expanding Area */}
                <AnimatePresence>
                    {showExportMenu && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0, y: -20 }}
                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -20 }}
                            className="overflow-hidden"
                        >
                            <div className="bg-card p-8 rounded-3xl border border-primary/20 bg-primary/[0.01] grid grid-cols-1 md:grid-cols-4 gap-6 shadow-2xl shadow-primary/5">
                                <button onClick={handleExportExcel} className="p-8 rounded-3xl bg-card border border-border hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5 flex flex-col items-center gap-4 transition-all group">
                                    <div className="size-11 rounded-2xl bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <FileText className="size-7 text-emerald-500" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Microsoft Excel</p>
                                        <p className="text-[9px] font-bold text-muted-foreground mt-1">Audit Ledger .xlsx</p>
                                    </div>
                                </button>
                                <button onClick={handleExportPDF} className="p-8 rounded-3xl bg-card border border-border hover:border-rose-200 hover:shadow-xl hover:shadow-rose-500/5 flex flex-col items-center gap-4 transition-all group">
                                    <div className="size-11 rounded-2xl bg-rose-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <PieChart className="size-7 text-rose-500" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Adobe PDF Audit</p>
                                        <p className="text-[9px] font-bold text-muted-foreground mt-1">Report Generation .pdf</p>
                                    </div>
                                </button>
                                <button onClick={handleExportCSV} className="p-8 rounded-3xl bg-card border border-border hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 flex flex-col items-center gap-4 transition-all group">
                                    <div className="size-11 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Database className="size-7 text-blue-500" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">CSV Archive</p>
                                        <p className="text-[9px] font-bold text-muted-foreground mt-1">Raw Ledger Data .csv</p>
                                    </div>
                                </button>
                                <button onClick={() => setShowExportMenu(false)} className="p-8 rounded-3xl bg-card border border-border hover:border-slate-300 hover:shadow-xl flex flex-col items-center gap-4 transition-all group">
                                    <div className="size-11 rounded-2xl bg-muted flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <X className="size-7 text-muted-foreground" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Annuler Opération</p>
                                        <p className="text-[9px] font-bold text-muted-foreground mt-1">Fermer Panel Export</p>
                                    </div>
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Summary HUD */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <DashboardCard title="Volume Global" value={`${totalVolume.toLocaleString()} GNF`} icon={Wallet} iconColor="primary" description="Liquidity Flow" />
                    <DashboardCard title="Succès Réseau" value={successfulCount.toString()} icon={ShieldCheck} iconColor="emerald" description="Validated TX" />
                    <DashboardCard title="En Attente" value={pendingCount.toString()} icon={Clock} iconColor="amber" description="Pending Reconciliation" />
                    <DashboardCard title="Santé Satellite" value="100%" icon={History} iconColor="primary" description="Uptime Integrity" />
                </div>

                {/* Main Content Area */}
                <div className="bg-card rounded-3xl border border-border shadow-xl shadow-slate-200/30 overflow-hidden">
                    {/* Filter HUD */}
                    <div className="p-10 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-8 bg-muted/30">
                        <FilterDropdown
                            label="Filtrer"
                            value={filterStatus}
                            onChange={setFilterStatus}
                            defaultValue="ALL"
                            options={[
                                { value: 'ALL', label: 'Tous' },
                                { value: 'SUCCESS', label: 'Validés' },
                                { value: 'PENDING', label: 'En attente' },
                            ]}
                        />
                        <span className="text-[11px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] italic">Master Ledger V4.0.2</span>
                    </div>

                    <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-muted/50 border-b border-border">
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">Identité / Node</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">Type / Rôle</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">Flux</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">Quantum (GNF)</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">Statut</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black text-muted-foreground uppercase tracking-widest">Horodatage</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {isLoading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={6} className="px-8 py-10" />
                                        </tr>
                                    ))
                                ) : filtered.map((tx, idx) => {
                                    const user = tx.Wallet?.User;
                                    const isDeposit = getTransactionDirection(tx) === 'credit';
                                    return (
                                        <motion.tr 
                                            key={tx.id || idx}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: idx * 0.02 }}
                                            className="hover:bg-muted/50 transition-colors group"
                                        >
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-10 rounded-xl bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                                                        <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${user?.id || idx}`} alt="" className="size-full opacity-60" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[11px] font-black text-foreground uppercase tracking-tight truncate">{user?.nom_complet || 'System Root'}</p>
                                                        <p className="text-[9px] font-bold text-muted-foreground uppercase truncate">ID: {tx.id?.slice(0, 10).toUpperCase()}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col gap-1">
                                                    <span className={cn(
                                                        "px-2 py-0.5 w-fit rounded-lg text-[8px] font-black uppercase tracking-widest",
                                                        user?.role === 'banque' ? "bg-amber-50 text-amber-500 border border-amber-100" : "bg-muted text-muted-foreground border border-border"
                                                    )}>
                                                        {user?.role || 'CLIENT'}
                                                    </span>
                                                    <div className="flex items-center gap-1 text-[8px] font-bold text-muted-foreground uppercase">
                                                        <CreditCard className="size-2.5" /> {(tx.type_transaction || tx.type || 'TX').toUpperCase()}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={cn(
                                                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                                                    isDeposit ? "bg-emerald-50 text-emerald-500 border border-emerald-100" : "bg-rose-50 text-rose-500 border border-rose-100"
                                                )}>
                                                    {isDeposit ? <ArrowDownLeft className="size-3" /> : <ArrowUpRight className="size-3" />}
                                                    {isDeposit ? 'Crédit' : 'Débit'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <p className="text-sm font-black text-foreground tabular-nums">
                                                    {parseFloat(tx.montant || 0).toLocaleString()}
                                                </p>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    <div className={cn(
                                                        "size-1.5 rounded-full",
                                                        tx.statut === 'complete' || tx.statut === 'terminé' ? "bg-emerald-500" : tx.statut === 'en_attente' ? "bg-amber-500 animate-pulse" : "bg-rose-500"
                                                    )} />
                                                    <span className={cn(
                                                        "text-[9px] font-black uppercase tracking-widest",
                                                        tx.statut === 'complete' || tx.statut === 'terminé' ? "text-emerald-500" : tx.statut === 'en_attente' ? "text-amber-500" : "text-rose-500"
                                                    )}>
                                                        {isTxComplete(tx.statut) ? 'Validé' : tx.statut === 'en_attente' ? 'Revue' : 'Échoué'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <p className="text-[10px] font-black text-foreground uppercase tracking-tight">{new Date(tx.createdAt).toLocaleDateString()}</p>
                                                <p className="text-[9px] font-bold text-muted-foreground uppercase italic opacity-60">
                                                    {new Date(tx.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </p>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminTransactions;
