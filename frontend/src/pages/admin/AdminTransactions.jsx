import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
    Search, Wallet, CheckCircle2, Download, RefreshCcw,
    ArrowUpRight, ArrowDownLeft, Activity, Filter,
    Clock, CreditCard, ShieldCheck, History, FileText, PieChart, Database, X
} from 'lucide-react';
import { useAllTransactions } from '../../hooks/useDomainData';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { getTransactionDirection, getTransactionLabel } from '../../lib/walletUtils';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/** Statut transaction réussi (API utilise `complete`, legacy `terminé`) */
const isTxComplete = (statut) => statut === 'complete' || statut === 'terminé';

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:shadow-2xl hover:shadow-primary/5 transition-all"
    >
        <div className={cn("absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform duration-1000", color)}>
            <Icon className="size-12" />
        </div>
        <div className="relative z-10 space-y-6">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 group-hover:text-slate-600 transition-colors">
                {title}
            </p>
            <div className="space-y-2">
                <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter tabular-nums leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    {value}
                </h3>
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-tight">{subtitle}</p>
            </div>
        </div>
    </motion.div>
);

const AdminTransactions = () => {
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [showExportMenu, setShowExportMenu] = useState(false);
    const { data, loading: isLoading, refetch: fetchTransactions } = useAllTransactions();
    const transactions = data?.transactions || [];

    const filtered = transactions.filter(t => {
        const user = t.Wallet?.User?.nom_complet || '';
        const id = t.id || '';
        const matchesSearch = id.toLowerCase().includes(search.toLowerCase()) || user.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = filterStatus === 'ALL' || (filterStatus === 'SUCCESS' && isTxComplete(t.statut)) || (filterStatus === 'PENDING' && t.statut === 'en_attente');
        return matchesSearch && matchesStatus;
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
        doc.setFontSize(22);
        doc.text("LIVRE DE TRÉSORERIE - BCA CONNECT", 14, 20);
        doc.setFontSize(10);
        doc.text(`AUDIT RÉSEAU • GÉNÉRÉ LE: ${new Date().toLocaleString()} • TOTAL TX: ${filtered.length}`, 14, 30);
        
        autoTable(doc, {
            startY: 40,
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
            margin: { top: 40 }
        });
        
        doc.save(`BCA_Audit_${Date.now()}.pdf`);
        setShowExportMenu(false);
        toast.success("AUDIT PDF PRÊT POUR ARCHIVAGE.");
    };

    return (
        <DashboardLayout title="TRANSACTIONAL AUDIT" noPadding>
            <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-12 space-y-12 custom-scrollbar">
                
                {/* HUD Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex items-start gap-6">
                        <div className="size-16 rounded-[1.5rem] bg-primary/10 border border-primary/20 flex items-center justify-center shadow-2xl shadow-primary/10">
                            <Activity className="size-8 text-primary shadow-glow" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                Audit <span className="text-primary">Flux</span>
                            </h1>
                            <div className="flex items-center gap-2">
                                <div className="size-2 rounded-full bg-emerald-500 animate-pulse border-2 border-white shadow-sm" />
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">
                                    {transactions.length} ENTRÉES INDEXÉES • SYNC_MASTER
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                            <input 
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="IDENTIFIER USER / ID..."
                                className="h-16 w-80 bg-white border border-slate-100 rounded-[1.5rem] pl-16 pr-8 text-[11px] font-black uppercase tracking-widest outline-none transition-all placeholder:text-slate-200 focus:ring-4 focus:ring-primary/5 shadow-sm"
                            />
                        </div>
                        <button 
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            className="h-16 px-10 bg-slate-900 text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] flex items-center gap-4 shadow-[0_20px_40px_-15px_rgba(15,23,42,0.3)] hover:opacity-90 active:scale-95 transition-all text-white"
                        >
                            <Download className="size-5" />
                            Générer Rapport
                        </button>
                        <button onClick={fetchTransactions} className="size-16 rounded-[1.5rem] bg-white border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-all shadow-xl shadow-slate-200/40">
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
                            <div className="bg-white p-8 rounded-[3rem] border border-primary/20 bg-primary/[0.01] grid grid-cols-1 md:grid-cols-4 gap-6 shadow-2xl shadow-primary/5">
                                <button onClick={handleExportExcel} className="p-8 rounded-3xl bg-white border border-slate-100 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5 flex flex-col items-center gap-4 transition-all group">
                                    <div className="size-14 rounded-2xl bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <FileText className="size-7 text-emerald-500" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-800">Microsoft Excel</p>
                                        <p className="text-[9px] font-bold text-slate-400 mt-1">Audit Ledger .xlsx</p>
                                    </div>
                                </button>
                                <button onClick={handleExportPDF} className="p-8 rounded-3xl bg-white border border-slate-100 hover:border-rose-200 hover:shadow-xl hover:shadow-rose-500/5 flex flex-col items-center gap-4 transition-all group">
                                    <div className="size-14 rounded-2xl bg-rose-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <PieChart className="size-7 text-rose-500" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-800">Adobe PDF Audit</p>
                                        <p className="text-[9px] font-bold text-slate-400 mt-1">Report Generation .pdf</p>
                                    </div>
                                </button>
                                <button onClick={handleExportCSV} className="p-8 rounded-3xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 flex flex-col items-center gap-4 transition-all group">
                                    <div className="size-14 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Database className="size-7 text-blue-500" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-800">CSV Archive</p>
                                        <p className="text-[9px] font-bold text-slate-400 mt-1">Raw Ledger Data .csv</p>
                                    </div>
                                </button>
                                <button onClick={() => setShowExportMenu(false)} className="p-8 rounded-3xl bg-white border border-slate-100 hover:border-slate-300 hover:shadow-xl flex flex-col items-center gap-4 transition-all group">
                                    <div className="size-14 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <X className="size-7 text-slate-400" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-800">Annuler Opération</p>
                                        <p className="text-[9px] font-bold text-slate-400 mt-1">Fermer Panel Export</p>
                                    </div>
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Summary HUD */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <StatCard title="Volume Global" value={`${totalVolume.toLocaleString()} GNF`} icon={Wallet} color="text-primary" subtitle="Liquidity Flow" />
                    <StatCard title="Succès Réseau" value={successfulCount.toString()} icon={ShieldCheck} color="text-emerald-500" subtitle="Validated TX" />
                    <StatCard title="En Attente" value={pendingCount.toString()} icon={Clock} color="text-amber-500" subtitle="Pending Reconciliation" />
                    <StatCard title="Santé Satellite" value="100%" icon={History} color="text-blue-500" subtitle="Uptime Integrity" />
                </div>

                {/* Main Content Area */}
                <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/30 overflow-hidden">
                    {/* Filter HUD */}
                    <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-slate-50/30">
                        <div className="flex items-center gap-4">
                            <Filter className="size-5 text-slate-300" />
                            <div className="flex items-center gap-3">
                                {['ALL', 'SUCCESS', 'PENDING'].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setFilterStatus(s)}
                                        className={cn(
                                            "text-[10px] font-black uppercase tracking-[0.2em] px-8 h-11 rounded-[1.25rem] transition-all",
                                            filterStatus === s ? "bg-slate-900 text-white shadow-2xl shadow-slate-900/20" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                                        )}
                                    >
                                        {s === 'ALL' ? 'TOUS' : s === 'SUCCESS' ? 'VALIDÉS' : 'EN ATTENTE'}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <span className="text-[11px] font-black text-slate-200 uppercase tracking-[0.3em] italic">Master Ledger V4.0.2</span>
                    </div>

                    <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-50">
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Identité / Node</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Type / Rôle</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Flux</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Quantum (GNF)</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Statut</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Horodatage</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
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
                                            className="hover:bg-slate-50/50 transition-colors group"
                                        >
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                                                        <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${user?.id || idx}`} alt="" className="size-full opacity-60" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight truncate">{user?.nom_complet || 'System Root'}</p>
                                                        <p className="text-[9px] font-bold text-slate-300 uppercase truncate">ID: {tx.id?.slice(0, 10).toUpperCase()}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col gap-1">
                                                    <span className={cn(
                                                        "px-2 py-0.5 w-fit rounded-lg text-[8px] font-black uppercase tracking-widest",
                                                        user?.role === 'banque' ? "bg-amber-50 text-amber-500 border border-amber-100" : "bg-slate-50 text-slate-400 border border-slate-100"
                                                    )}>
                                                        {user?.role || 'CLIENT'}
                                                    </span>
                                                    <div className="flex items-center gap-1 text-[8px] font-bold text-slate-300 uppercase">
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
                                                <p className="text-sm font-black text-slate-900 tabular-nums">
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
                                                <p className="text-[10px] font-black text-slate-800 uppercase tracking-tight">{new Date(tx.createdAt).toLocaleDateString()}</p>
                                                <p className="text-[9px] font-bold text-slate-300 uppercase italic opacity-60">
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
