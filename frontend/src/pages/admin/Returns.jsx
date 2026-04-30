import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
    RotateCcw,
    CheckCircle,
    XCircle,
    Package,
    Calendar,
    AlertTriangle,
    Search,
    Filter,
    RefreshCcw,
    ChevronRight,
    ArrowRightLeft,
    CheckCircle2,
    ShieldAlert,
    History,
    Download,
    FileText,
    PieChart,
    Database,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { useAdminDisputes } from '../../hooks/useDomainData';
import useApiMutation from '../../hooks/useApiMutation';
import api from '../../services/api';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const Returns = () => {
    const [search, setSearch] = useState('');
    const [showExportMenu, setShowExportMenu] = useState(false);
    const { data: disputes = [], loading, refetch } = useAdminDisputes();

    const { mutate: resolveMutation, isPending: isResolving } = useApiMutation(
        ({ id, status, decision }) => api.put(`/disputes/${id}/resolve`, { statut: status, decision_finale: decision }),
        {
            onSuccess: () => {
                refetch();
            },
            successMessage: "Protocole de litige mis à jour avec succès.",
            errorMessage: "Échec de la mise à jour du protocole."
        }
    );

    const handleAction = (id, status) => {
        const decision = status === 'resolu' ? "Retour approuvé par l'administration." : "Retour rejeté par l'administration.";
        resolveMutation({ id, status, decision });
    };

    const getExportData = () => {
        return filtered.map(r => ({
            ID: r.id?.toUpperCase() || 'N/A',
            CLIENT: r.demandeur?.nom_complet?.toUpperCase() || 'N/A',
            STATUT: r.statut?.toUpperCase() || 'N/A',
            MOTIF: r.description || 'N/A',
            DATE: new Date(r.createdAt).toLocaleString()
        }));
    };

    const handleExportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(getExportData());
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Retours");
        XLSX.writeFile(workbook, `BCA_Returns_${Date.now()}.xlsx`);
        setShowExportMenu(false);
        toast.success("REGISTRE LOGISTIQUE EXPORTÉ.");
    };

    const handleExportCSV = () => {
        const worksheet = XLSX.utils.json_to_sheet(getExportData());
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `BCA_Returns_Data_${Date.now()}.csv`);
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
        doc.text("AUDIT DES RETOURS ET LITIGES - BCA CONNECT", 14, 20);
        doc.setFontSize(10);
        doc.text(`REGISTRE LOGISTIQUE • GÉNÉRÉ LE: ${new Date().toLocaleString()} • TOTAL: ${filtered.length}`, 14, 30);
        
        autoTable(doc, {
            startY: 40,
            head: [["ID DOSSIER", "CLIENT / NODE", "STATUT", "DIAGNOSTIC MOTIF", "HORODATAGE"]],
            body: getExportData().map(row => [
                row.ID.slice(0, 10),
                row.CLIENT,
                row.STATUT,
                row.MOTIF.slice(0, 60) + (row.MOTIF.length > 60 ? '...' : ''),
                row.DATE
            ]),
            theme: 'grid',
            headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
            styles: { fontSize: 8 },
            margin: { top: 40 }
        });
        
        doc.save(`BCA_Returns_Audit_${Date.now()}.pdf`);
        setShowExportMenu(false);
        toast.success("AUDIT PDF PRÊT POUR ARCHIVAGE.");
    };

    const filtered = disputes.filter(r =>
        (r.id || '').toLowerCase().includes(search.toLowerCase()) ||
        (r.demandeur?.nom_complet || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <DashboardLayout title="GESTION DES RETOURS" noPadding>
            <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-12 space-y-12 animate-in pb-24 custom-scrollbar">

                {/* Command Center - Premium Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex items-start gap-6">
                        <div className="size-16 rounded-[1.5rem] bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-2xl shadow-amber-500/10">
                            <RotateCcw className="size-8 text-amber-500 shadow-glow" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                Flux <span className="text-amber-500">Retours</span>
                            </h1>
                            <div className="flex items-center gap-2">
                                <div className="size-2 rounded-full bg-amber-500 animate-pulse border-2 border-white shadow-sm" />
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">
                                    {disputes.length} SIGNALS_RECEPTION • SYNC_MASTER
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-slate-300 group-focus-within:text-amber-500 transition-colors" />
                            <input 
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="IDENTIFICATION RETOUR / NOM..."
                                className="h-16 w-80 bg-white border border-slate-100 rounded-[1.5rem] pl-16 pr-8 text-[11px] font-black uppercase tracking-widest outline-none transition-all placeholder:text-slate-200 focus:ring-4 focus:ring-amber-500/5 shadow-sm"
                            />
                        </div>
                        <button 
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            className="h-16 px-10 bg-slate-900 text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] flex items-center gap-4 shadow-[0_20px_40px_-15px_rgba(15,23,42,0.3)] hover:opacity-90 active:scale-95 transition-all text-white"
                        >
                            <Download className="size-5" />
                            Générer Rapport
                        </button>
                        <button 
                            onClick={() => refetch()} 
                            disabled={loading}
                            className="size-16 rounded-[1.5rem] bg-white border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-all shadow-xl shadow-slate-200/40 disabled:opacity-50"
                        >
                            <RefreshCcw className={cn("size-6 text-slate-600", loading && "animate-spin")} />
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
                                        <p className="text-[9px] font-bold text-slate-400 mt-1">Logistics Ledger .xlsx</p>
                                    </div>
                                </button>
                                <button onClick={handleExportPDF} className="p-8 rounded-3xl bg-white border border-slate-100 hover:border-rose-200 hover:shadow-xl hover:shadow-rose-500/5 flex flex-col items-center gap-4 transition-all group">
                                    <div className="size-14 rounded-2xl bg-rose-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <PieChart className="size-7 text-rose-500" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-800">Adobe PDF Audit</p>
                                        <p className="text-[9px] font-bold text-slate-400 mt-1">Audit Report .pdf</p>
                                    </div>
                                </button>
                                <button onClick={handleExportCSV} className="p-8 rounded-3xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 flex flex-col items-center gap-4 transition-all group">
                                    <div className="size-14 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Database className="size-7 text-blue-500" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-800">CSV Archive</p>
                                        <p className="text-[9px] font-bold text-slate-400 mt-1">Raw Logistics Data .csv</p>
                                    </div>
                                </button>
                                <button onClick={() => setShowExportMenu(false)} className="p-8 rounded-3xl bg-white border border-slate-100 hover:border-slate-300 hover:shadow-xl flex flex-col items-center gap-4 transition-all group">
                                    <div className="size-14 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <X className="size-7 text-slate-400" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-800">Annuler Opération</p>
                                        <p className="text-[9px] font-bold text-slate-400 mt-1">Fermer Panel</p>
                                    </div>
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {loading ? (
                        Array(4).fill(0).map((_, n) => (
                            <div key={n} className="h-96 bg-white border border-slate-100 rounded-[3rem] animate-pulse" />
                        ))
                    ) : filtered.length === 0 ? (
                        <div className="lg:col-span-2 py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-6 opacity-40 text-center">
                            <ArrowRightLeft className="size-16 text-slate-300" />
                            <p className="text-xl font-black uppercase tracking-tighter text-slate-400">Aucun signal de retour actif</p>
                        </div>
                    ) : (
                        filtered.map(item => (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                key={item.id}
                                className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/30 group relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/5 hover:-translate-y-1"
                            >
                                <div className="absolute top-8 right-8">
                                    <div className={cn(
                                        "px-6 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] border backdrop-blur-2xl transition-all duration-500",
                                        item.statut === 'resolu' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                            item.statut === 'rejete' ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
                                                "bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse"
                                    )}>
                                        {item.statut === 'ouvert' ? 'Review Required' : item.statut === 'resolu' ? 'Validé' : 'Rejeté'}
                                    </div>
                                </div>

                                <div className="space-y-10">
                                    <div className="flex items-center gap-6">
                                        <div className="size-16 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-center relative overflow-hidden group-hover:border-amber-500/30 transition-all duration-700">
                                            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <Package className="size-8 text-slate-400 group-hover:text-amber-500 transition-colors" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-lg font-black text-slate-800 uppercase tracking-tighter leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                                {item.demandeur?.nom_complet || "Client inconnu"}
                                            </p>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Transmission Node: #{item.id?.slice(0, 8).toUpperCase()}</p>
                                        </div>
                                    </div>

                                    <div className="p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 space-y-6 group-hover:border-amber-500/10 transition-colors">
                                        <div className="flex items-start gap-4">
                                            <ShieldAlert className="size-5 text-amber-500 shrink-0 mt-1" />
                                            <div className="space-y-2">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">Diagnostic Motif</p>
                                                <p className="text-sm text-slate-700 font-black uppercase leading-relaxed tracking-tight group-hover:text-slate-900 transition-colors line-clamp-3">
                                                    "{item.description || "Aucun détail fourni."}"
                                                </p>
                                            </div>
                                        </div>
                                        <div className="pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
                                            <div className="flex items-center gap-3">
                                                <Calendar className="size-4 text-slate-300" />
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest tabular-nums">{new Date(item.createdAt).toLocaleDateString('fr-GN')}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <History className="size-4 text-slate-300" />
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Quantum_Sync</span>
                                            </div>
                                        </div>
                                    </div>

                                    {item.statut === 'ouvert' && (
                                        <div className="flex gap-4 pt-4">
                                            <button
                                                onClick={() => handleAction(item.id, 'rejete')}
                                                disabled={isResolving}
                                                className="flex-1 h-14 bg-slate-50 border border-slate-100 text-rose-500 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-rose-50 hover:border-rose-200 transition-all flex items-center justify-center gap-3 shadow-sm disabled:opacity-50"
                                            >
                                                <XCircle className="size-5" /> Rejeter
                                            </button>
                                            <button
                                                onClick={() => handleAction(item.id, 'resolu')}
                                                disabled={isResolving}
                                                className="flex-1 h-14 bg-slate-900 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-amber-500 hover:text-white transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-200 disabled:opacity-50"
                                            >
                                                <CheckCircle2 className="size-5" /> Approuver
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Returns;
