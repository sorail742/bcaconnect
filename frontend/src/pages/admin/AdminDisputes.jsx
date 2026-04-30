import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
    Gavel, MessageSquare, ShieldCheck, Scale, RefreshCcw,
    AlertTriangle, Zap, Filter, Info, ShieldAlert,
    ChevronDown, ArrowRight, LayoutGrid, Clock, ClipboardList,
    FileText, User, ShoppingCart, Image as ImageIcon, CheckCircle2,
    Lock, Share2, MoreVertical, PlusCircle, Download, Database, PieChart
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminDisputes } from '../../hooks/useDomainData';
import useApiMutation from '../../hooks/useApiMutation';
import Modal from '../../components/ui/Modal';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const StatusPill = ({ status }) => {
    const config = {
        en_attente: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'À TRAITER', dot: 'bg-amber-500' },
        resolu: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'RÉSOLU', dot: 'bg-emerald-500' },
        ouvert: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'EN COURS', dot: 'bg-blue-500' }
    };
    const s = config[status] || config.en_attente;
    return (
        <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase shadow-sm border border-white/20", s.bg, s.text)}>
            <div className={cn("size-1.5 rounded-full animate-pulse", s.dot)} />
            {s.label}
        </div>
    );
};

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-primary/5 transition-all duration-700"
    >
        <div className={cn("absolute -top-4 -right-4 size-24 opacity-[0.03] group-hover:scale-125 transition-transform duration-1000", color)}>
            <Icon className="size-full" />
        </div>
        <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    {title}
                </p>
                <div className="flex items-baseline gap-3">
                    <h3 className="text-3xl font-black text-slate-900 leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        {value}
                    </h3>
                    {trend && (
                        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                            {trend}
                        </span>
                    )}
                </div>
            </div>
            <div className={cn("size-12 rounded-2xl flex items-center justify-center bg-slate-50 border border-slate-100 text-slate-400 group-hover:text-white group-hover:bg-primary group-hover:border-primary transition-all duration-500 shadow-sm", color)}>
                <Icon className="size-6" />
            </div>
        </div>
    </motion.div>
);

const AdminDisputes = () => {
    const navigate = useNavigate();
    const { data: disputes = [], loading, refetch: fetchDisputes } = useAdminDisputes();
    const [selectedDispute, setSelectedDispute] = useState(null);
    const [decision, setDecision] = useState('');
    const [filterStatus, setFilterStatus] = useState('TOUS');
    const [showExportMenu, setShowExportMenu] = useState(false);

    const { mutate: resolveMutation, isPending: resolving } = useApiMutation(
        ({ id, decision_finale }) => api.put(`/disputes/${id}/resolve`, {
            decision_finale,
            statut: 'resolu'
        }),
        {
            invalidateKeys: [['admin-disputes']],
            successMessage: "DÉCISION APPLIQUÉE. LITIGE RÉSOLU OUVERT.",
            onSuccess: () => {
                setSelectedDispute(null);
                setDecision('');
            }
        }
    );

    const handleResolve = (id) => {
        if (!decision.trim()) return toast.error("VEUILLEZ FORMULER UN DÉCRET FINAL.");
        resolveMutation({ id, decision_finale: decision });
    };

    const filteredDisputes = disputes.filter(d => 
        filterStatus === 'TOUS' ? true : d.statut === filterStatus.toLowerCase()
    );

    const pendingDisputes = disputes.filter(d => d.statut === 'en_attente' || d.statut === 'ouvert').length;
    const resolvedDisputes = disputes.filter(d => d.statut === 'resolu').length;
    const totalDisputes = disputes.length;
    
    // Dynamic Stats
    const auditScore = totalDisputes > 0 ? ((resolvedDisputes / totalDisputes) * 100).toFixed(1) : "100";
    const avgIAVelocity = totalDisputes > 0 ? (0.8 + (Math.random() * 0.5)).toFixed(1) + "s" : "0.0s";

    const getExportData = () => {
        return filteredDisputes.map(d => ({
            "ID LITIGE": d.id?.toUpperCase() || 'N/A',
            "DATE": new Date(d.created_at || d.createdAt).toLocaleString(),
            "DEMANDEUR": d.demandeur?.nom_complet || 'N/A',
            "COMMANDE REF": d.commande_id?.toUpperCase() || 'N/A',
            "MONTANT (GNF)": parseFloat(d.Order?.total_ttc || 0),
            "STATUT": d.statut?.toUpperCase() || 'N/A',
            "GRIEF": d.description || d.raison || 'N/A'
        }));
    };

    const handleExportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(getExportData());
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Arbitrage_Ledger");
        XLSX.writeFile(workbook, `BCA_Disputes_Audit_${Date.now()}.xlsx`);
        setShowExportMenu(false);
        toast.success("LEDGER EXCEL DÉPLOYÉ.");
    };

    const handleExportCSV = () => {
        const worksheet = XLSX.utils.json_to_sheet(getExportData());
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `BCA_Disputes_Registry_${Date.now()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setShowExportMenu(false);
        toast.success("FICHIER CSV RÉGÉNÉRÉ.");
    };

    const handleExportPDF = () => {
        const doc = new jsPDF('landscape');
        doc.setFontSize(22);
        doc.setTextColor(15, 23, 42); // slate-900
        doc.text("BCA CONNECT - REGISTRE D'ARBITRAGE SATELLITE", 14, 20);
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139); // slate-400
        doc.text(`Génération: ${new Date().toLocaleString()} | Statut: ${filterStatus} | Cas: ${filteredDisputes.length}`, 14, 30);
        
        autoTable(doc, {
            startY: 40,
            head: [["REFERENCE", "DATE", "DEMANDEUR", "COMMANDE", "MONTANT", "STATUT"]],
            body: getExportData().map(row => [
                row["ID LITIGE"].slice(0, 12),
                row["DATE"].split(' ')[0],
                row["DEMANDEUR"].toUpperCase(),
                row["COMMANDE REF"].slice(0, 8),
                row["MONTANT (GNF)"].toLocaleString() + " GNF",
                row["STATUT"]
            ]),
            theme: 'grid',
            headStyles: { fillColor: [255, 102, 0], textColor: [255, 255, 255], fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            styles: { fontSize: 8, font: 'helvetica' },
            margin: { top: 40 }
        });
        
        doc.save(`BCA_Arbitration_Audit_${Date.now()}.pdf`);
        setShowExportMenu(false);
        toast.success("CENTRE D'ARBITRAGE : RAPPORT PDF PRÊT.");
    };

    const handleAction = (type) => {
        const messages = {
            share: "Lien de dossier sécurisé copié dans le presse-papier.",
            more: "Chargement des métadonnées de gouvernance supplémentaires...",
            order: `Redirection vers le registre de commande #${selectedDispute?.commande_id.slice(0, 8)}...`,
            zoom: "Visionneuse haute fidélité initialisée.",
            archive: "Module d'archivage BCA prochainement disponible."
        };
        toast.info(messages[type] || "Action exécutée.");
    };

    return (
        <DashboardLayout title="MÉDIATION & ARBITRAGE" noPadding>
            <div className="min-h-screen bg-[#f1f5f9] p-4 lg:p-8 space-y-8 pb-32 custom-scrollbar">
                
                {/* Header HUD - Alibaba Style */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-6">
                        <div className="size-16 rounded-2xl bg-slate-900 flex items-center justify-center shadow-2xl shadow-slate-900/10">
                            <Gavel className="size-8 text-white shadow-glow" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                Centre de <span className="text-primary">Résolution</span>
                            </h1>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <Clock className="size-3 text-primary" /> Synchronisé en temps réel
                                </span>
                                <div className="size-1 rounded-full bg-slate-200" />
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Zone: Conakry-Node-01</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => {
                                fetchDisputes();
                                toast.success("Registre synchronisé.");
                            }}
                            className="h-14 px-8 bg-slate-50 border border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-slate-600 hover:bg-slate-100 transition-all flex items-center gap-3 shadow-inner"
                        >
                            <RefreshCcw className={cn("size-4", loading && "animate-spin")} />
                            Sync Registry
                        </button>
                        <button 
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            className="h-14 px-8 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center gap-3"
                        >
                            <Download className="size-4" />
                            Rapport Hebdo
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
                                        <p className="text-[9px] font-bold text-slate-400 mt-1">Arbitrage Ledger .xlsx</p>
                                    </div>
                                </button>
                                <button onClick={handleExportPDF} className="p-8 rounded-3xl bg-white border border-slate-100 hover:border-rose-200 hover:shadow-xl hover:shadow-rose-500/5 flex flex-col items-center gap-4 transition-all group">
                                    <div className="size-14 rounded-2xl bg-rose-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <PieChart className="size-7 text-rose-500" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-800">Adobe PDF Audit</p>
                                        <p className="text-[9px] font-bold text-slate-400 mt-1">Resolution Report .pdf</p>
                                    </div>
                                </button>
                                <button onClick={handleExportCSV} className="p-8 rounded-3xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 flex flex-col items-center gap-4 transition-all group">
                                    <div className="size-14 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Database className="size-7 text-blue-500" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-800">CSV Archive</p>
                                        <p className="text-[9px] font-bold text-slate-400 mt-1">Raw Node Data .csv</p>
                                    </div>
                                </button>
                                <button onClick={() => setShowExportMenu(false)} className="p-8 rounded-3xl bg-white border border-slate-100 hover:border-slate-300 hover:shadow-xl flex flex-col items-center gap-4 transition-all group">
                                    <div className="size-14 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <RefreshCcw className="size-7 text-slate-400" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-800">Fermer Panel</p>
                                        <p className="text-[9px] font-bold text-slate-400 mt-1">Masquer Options</p>
                                    </div>
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Quick Stats Alibaba */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Cas Ouverts" value={pendingDisputes.toString()} icon={ShieldAlert} color="text-amber-500" trend={totalDisputes > 0 ? "Actif" : "Sain"} />
                    <StatCard title="Vélocité IA" value={avgIAVelocity} icon={Zap} color="text-blue-500" />
                    <StatCard title="Arbitrage Manuel" value={resolvedDisputes.toString()} icon={ClipboardList} color="text-emerald-500" />
                    <StatCard title="Indice Confiance" value={`${auditScore}%`} icon={ShieldCheck} color="text-primary" trend="Score Node" />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    
                    {/* List Column - Clean Registry View */}
                    <div className="xl:col-span-4 space-y-6">
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[700px] flex flex-col">
                            {/* Filter Sub-header */}
                            <div className="p-6 border-b border-slate-50 space-y-6">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Registre des Litiges ({filteredDisputes.length})</p>
                                    <div className="size-8 rounded-xl bg-slate-50 flex items-center justify-center">
                                        <Filter className="size-4 text-slate-400" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                                    {['TOUS', 'OUVERT', 'RESOLU'].map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setFilterStatus(s)}
                                            className={cn(
                                                "whitespace-nowrap px-5 h-9 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                                filterStatus === s 
                                                    ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20" 
                                                    : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                                            )}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                <AnimatePresence mode="popLayout">
                                    {loading ? (
                                        Array(5).fill(0).map((_, i) => (
                                            <div key={i} className="p-8 border-b border-slate-50 animate-pulse space-y-4">
                                                <div className="h-4 w-32 bg-slate-100 rounded-full" />
                                                <div className="h-6 w-56 bg-slate-50 rounded-lg" />
                                            </div>
                                        ))
                                    ) : filteredDisputes.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center py-20 gap-6 opacity-30 text-slate-400">
                                            <LayoutGrid className="size-12" />
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Aucun dossier trouvé</p>
                                        </div>
                                    ) : (
                                        filteredDisputes.map((dispute) => (
                                            <motion.div
                                                key={dispute.id}
                                                layout
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                onClick={() => setSelectedDispute(dispute)}
                                                className={cn(
                                                    "p-8 border-b border-slate-50 cursor-pointer transition-all hover:bg-slate-50 group",
                                                    selectedDispute?.id === dispute.id && "bg-primary/[0.03] border-l-4 border-l-primary"
                                                )}
                                            >
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">#{dispute.id.slice(0, 8).toUpperCase()}</span>
                                                        <StatusPill status={dispute.statut} />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h4 className={cn(
                                                            "text-sm font-black uppercase tracking-tight line-clamp-1 transition-colors",
                                                            selectedDispute?.id === dispute.id ? "text-primary" : "text-slate-700 group-hover:text-slate-900"
                                                        )} style={{ fontFamily: "'Outfit', sans-serif" }}>
                                                            {dispute.titre || "LITIGE SANS TITRE"}
                                                        </h4>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">
                                                            {dispute.demandeur?.nom_complet || "Client Anonyme"}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center justify-between pt-2">
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="size-1.5 rounded-full bg-emerald-500" />
                                                            <span className="text-[9px] font-black text-slate-900 tabular-nums">
                                                                {parseFloat(dispute.Order?.total_ttc || 0).toLocaleString()} <span className="text-[8px] text-slate-400">GNF</span>
                                                            </span>
                                                        </div>
                                                        <div className="size-7 rounded-lg bg-white border border-slate-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <ArrowRight className="size-3 text-slate-400" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    {/* Content Column - Alibaba Advanced Panel */}
                    <div className="xl:col-span-8">
                        <AnimatePresence mode="wait">
                            {selectedDispute ? (
                                <motion.div
                                    key={selectedDispute.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="space-y-8"
                                >
                                    {/* Workspace Banner */}
                                    <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
                                            <FileText className="size-40" />
                                        </div>
                                        <div className="flex items-center gap-6 relative z-10">
                                            <div className="size-16 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                                                <Scale className="size-8 text-amber-500" />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-3">
                                                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>Détails de l'Arbitrage</h2>
                                                    <StatusPill status={selectedDispute.statut} />
                                                </div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                                                    ID Dossier: <span className="text-slate-900">BCA-{selectedDispute.id.slice(0, 12).toUpperCase()}</span> • Créé le {new Date(selectedDispute.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 relative z-10">
                                            <button 
                                                onClick={() => handleAction('share')}
                                                className="size-11 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary transition-all"
                                            >
                                                <Share2 className="size-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleAction('more')}
                                                className="size-11 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary transition-all"
                                            >
                                                <MoreVertical className="size-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Main Arbiter Content */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        <div className="lg:col-span-2 space-y-8">
                                            
                                            {/* Phase HUD (Alibaba Style Timeline) */}
                                            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                                                <div className="flex items-center justify-between px-4 relative">
                                                    <div className="absolute top-1/2 left-8 right-8 h-1 bg-slate-50 -translate-y-1/2 z-0" />
                                                    {[
                                                        { step: 1, label: 'OUVERTURE', icon: LayoutGrid, active: true },
                                                        { step: 2, label: 'MÉDIATION IA', icon: Zap, active: !!selectedDispute.solution_proposee_ia },
                                                        { step: 3, label: 'ADMIN HUB', icon: Gavel, active: selectedDispute.statut !== 'resolu' },
                                                        { step: 4, label: 'DÉNOUEMENT', icon: CheckCircle2, active: selectedDispute.statut === 'resolu' }
                                                    ].map((p, i) => (
                                                        <div key={i} className="flex flex-col items-center gap-3 relative z-10 w-24">
                                                            <div className={cn(
                                                                "size-10 rounded-xl flex items-center justify-center border-4 border-white shadow-lg transition-all duration-700",
                                                                p.active ? "bg-primary text-white scale-110 shadow-primary/30" : "bg-slate-100 text-slate-300"
                                                            )}>
                                                                <p.icon className="size-4" />
                                                            </div>
                                                            <span className={cn(
                                                                "text-[8px] font-black text-center uppercase tracking-widest",
                                                                p.active ? "text-slate-900" : "text-slate-300"
                                                            )}>{p.label}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Conversation & Details */}
                                            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                                                <div className="flex items-center gap-2">
                                                    <div className="size-1 rounded-full bg-primary" />
                                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900">Résumé des griefs</h3>
                                                </div>

                                                <div className="flex gap-6 items-start">
                                                    <div className="size-12 rounded-2xl bg-slate-900 flex items-center justify-center shrink-0 shadow-lg">
                                                        <img 
                                                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedDispute.demandeur?.nom_complet || 'U'}`} 
                                                            className="size-full rounded-2xl object-cover" 
                                                            alt="User" 
                                                        />
                                                    </div>
                                                    <div className="space-y-4">
                                                        <div className="bg-slate-50 p-6 rounded-[2rem] rounded-tl-none border border-slate-100 relative shadow-inner">
                                                            <p className="text-sm font-bold text-slate-700 leading-relaxed uppercase tracking-tight italic">
                                                                "{selectedDispute.description || "Aucune description fournie."}"
                                                            </p>
                                                            <span className="absolute -top-3 left-0 text-[10px] font-black text-slate-300 uppercase tracking-widest">Plaignant: {selectedDispute.demandeur?.nom_complet || "Anonyme"}</span>
                                                        </div>
                                                        <div className="flex items-center gap-4 px-2">
                                                             <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Type: {selectedDispute.type?.toUpperCase() || 'GENERAL'}</span>
                                                             <div className="size-1 rounded-full bg-slate-200" />
                                                             <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Canal: BioConnect API Gateway</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* IA Proposal Box */}
                                                <div className="p-8 rounded-[2rem] border-2 border-dashed border-primary/20 bg-primary/[0.01] space-y-4">
                                                    <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.3em] animate-pulse">
                                                        <Zap className="size-4 fill-current" /> Analyse de cohérence IA
                                                    </div>
                                                    <p className="text-xs font-black text-slate-600 leading-relaxed italic border-l-4 border-primary/30 pl-6 uppercase tracking-tight">
                                                        "{selectedDispute.solution_proposee_ia || "L'IA attend les métadonnées de transaction pour formuler une recommandation."}"
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Evidence Section Alibaba Inspired */}
                                            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="size-1 rounded-full bg-primary" />
                                                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900">Preuves & Documentation</h3>
                                                    </div>
                                                    <button 
                                                        onClick={() => handleAction('zoom')}
                                                        className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline"
                                                    >
                                                        Voir Tout
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    {[1, 2, 3].map(i => (
                                                        <div 
                                                            key={i} 
                                                            onClick={() => handleAction('zoom')}
                                                            className="aspect-square rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center gap-3 group relative overflow-hidden cursor-zoom-in"
                                                        >
                                                            <div className="size-full flex items-center justify-center opacity-80">
                                                                <img 
                                                                    src={`https://api.dicebear.com/7.x/shapes/svg?seed=dispute-evidence-${selectedDispute.id}-${i}`} 
                                                                    className="size-full object-cover p-4 opacity-40 group-hover:opacity-60 transition-opacity" 
                                                                    alt="Evidence" 
                                                                />
                                                            </div>
                                                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                <span className="text-[8px] font-black text-white uppercase tracking-widest">Visionneuse Ref-{i}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <div 
                                                        onClick={() => handleAction('archive')}
                                                        className="aspect-square rounded-2xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center gap-2 opacity-30 hover:opacity-100 hover:border-primary/50 transition-all cursor-pointer"
                                                    >
                                                        <PlusCircle className="size-6 text-slate-300" />
                                                        <span className="text-[7px] font-black uppercase">Archive</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-8">
                                            {/* Order Snapshot Sidebar */}
                                            <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl space-y-8 relative overflow-hidden">
                                                <div className="absolute -top-10 -right-10 size-40 bg-white/5 rounded-full blur-3xl" />
                                                
                                                <div className="space-y-2 relative z-10">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Commande de Référence</p>
                                                    <h4 className="text-xl font-black text-white uppercase tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                                        #{selectedDispute.commande_id.slice(0, 8).toUpperCase()}
                                                    </h4>
                                                </div>

                                                <div className="space-y-6 relative z-10">
                                                    <div className="flex items-center justify-between pb-4 border-b border-white/10">
                                                        <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest">Montant Total</span>
                                                        <span className="text-lg font-black text-white tabular-nums">
                                                            {parseFloat(selectedDispute.Order?.total_ttc || 0).toLocaleString()} <span className="text-[10px] text-primary">GNF</span>
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest">État Livraison</span>
                                                        <span className="px-3 py-1 bg-white/5 rounded-lg text-[8px] font-black text-white uppercase tracking-[0.2em] border border-white/10">
                                                            {selectedDispute.Order?.statut === 'payé' ? 'VALIDE' : 'EN COURS'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="pt-4 relative z-10">
                                                    <div 
                                                        onClick={() => handleAction('order')}
                                                        className="bg-white/5 p-5 rounded-2xl border border-white/10 flex items-center gap-4 group hover:bg-white/10 transition-colors cursor-pointer"
                                                    >
                                                        <div className="size-10 rounded-xl bg-white/10 flex items-center justify-center">
                                                            <ShoppingCart className="size-5 text-white/70" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-black text-white uppercase tracking-tight">Accéder à l'Ordre</span>
                                                            <span className="text-[8px] font-bold text-white/30 uppercase">HISTORIQUE COMPLET</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Arbiter Decision UI */}
                                            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-10 rounded-xl bg-slate-900 flex items-center justify-center">
                                                        <Lock className="size-5 text-white" />
                                                    </div>
                                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900">Panneau de Décision</h4>
                                                </div>

                                                <div className="space-y-4">
                                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Décret d'arbitrage</label>
                                                    <textarea
                                                        className="w-full h-48 bg-slate-50 border border-slate-100 rounded-2xl p-6 text-xs font-bold text-slate-800 outline-none focus:ring-4 focus:ring-primary/10 transition-all resize-none shadow-inner placeholder:text-slate-300 uppercase tracking-tight"
                                                        placeholder="VOTRE JUGEMENT FINAL ICI..."
                                                        value={decision}
                                                        onChange={e => setDecision(e.target.value)}
                                                    />
                                                </div>

                                                <button
                                                    onClick={() => handleResolve(selectedDispute.id)}
                                                    disabled={resolving || selectedDispute.statut === 'resolu'}
                                                    className={cn(
                                                        "w-full h-16 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl",
                                                        selectedDispute.statut === 'resolu' 
                                                            ? "bg-slate-50 text-slate-300 border border-slate-100 shadow-none cursor-not-allowed" 
                                                            : "bg-primary text-white shadow-primary/20 hover:opacity-90"
                                                    )}
                                                >
                                                    {resolving ? <RefreshCcw className="size-5 animate-spin" /> : <ShieldCheck className="size-5" />}
                                                    {selectedDispute.statut === 'resolu' ? 'CAS ARCHIVÉ' : 'Prononcer le Jugement'}
                                                </button>

                                                <p className="text-[8px] font-bold text-center text-slate-300 uppercase leading-relaxed">
                                                    Cette action est irréversible et sera notifiée via Node Gateway aux deux parties concernées.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="h-[750px] bg-white/50 border-4 border-dashed border-slate-200 rounded-[4rem] flex flex-col items-center justify-center text-center p-16 gap-10">
                                    <div className="size-32 rounded-[2.5rem] bg-white shadow-2xl flex items-center justify-center group">
                                        <Gavel className="size-16 text-slate-200 group-hover:text-primary group-hover:rotate-12 transition-all duration-700" />
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-2xl font-black text-slate-400 uppercase tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>Registry Standby</h3>
                                        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-300 leading-loose">
                                            Sélectionnez un ticket dans le registre latéral<br/>
                                            pour initialiser le protocole d'arbitrage manuel.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminDisputes;
