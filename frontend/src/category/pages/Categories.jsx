import React, { useMemo, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import ConfirmDeleteModal from '../../components/ui/ConfirmDeleteModal';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Edit2, Trash2, Search, RefreshCcw,
    LayoutGrid, ChevronRight, Tag,
    Activity, Layers, Filter, CheckCircle2, ShieldCheck,
    Download, FileText, PieChart, Database, X, Sparkles
} from 'lucide-react';
import categoryService from '../services/categoryService';
import { useCategories } from '../hooks/useCategoryData';
import useApiMutation from '../../hooks/useApiMutation';
import { cn } from '../../lib/utils';
import api from '../../services/api';
import { aiService } from '../../ai/services/aiService';
import { toast } from 'sonner';
import { Image as ImageIcon } from 'lucide-react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { addPdfLetterhead } from '../../lib/pdfBranding';
import CreatableSelect from '../../components/ui/CreatableSelect';
import { BCA_CATEGORIES, getCategoryIconComponent } from '../lib/categoryConstants';
import DashboardCard from '../../components/ui/DashboardCard';

const Categories = () => {
    const { data: categories = [], loading: isLoading, refetch } = useCategories();
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        nom_categorie: '',
        description: '',
        image_url: '',
        parent_id: ''
    });
    const [isUploading, setIsUploading] = useState(false);

    // Le endpoint public ne renvoie que les catégories principales, avec leurs
    // sous-catégories imbriquées dans `sous_categories`. On les aplatit ici pour
    // pouvoir les lister, chercher et éditer individuellement dans le tableau.
    const flatCategories = useMemo(() => {
        const flat = [];
        for (const cat of categories) {
            flat.push(cat);
            if (Array.isArray(cat.sous_categories)) {
                for (const sub of cat.sous_categories) {
                    flat.push({ ...sub, parent_id: cat.id, parent_nom: cat.nom_categorie });
                }
            }
        }
        return flat;
    }, [categories]);

    const { mutate: crudMutation, isPending: isSaving } = useApiMutation(
        async (payload) => {
            const normalized = { ...payload, parent_id: payload.parent_id || null };
            if (editingCategory) {
                return categoryService.update(editingCategory.id, normalized);
            }
            return categoryService.create(normalized);
        },
        {
            invalidateKeys: ['categories'],
            successMessage: editingCategory ? "TAXONOMIE MISE À JOUR." : "NOUVELLE CLASSE CRÉÉE.",
            onSuccess: () => setShowModal(false)
        }
    );

    const [deleteTarget, setDeleteTarget] = useState(null);

    const { mutateAsync: deleteMutation } = useApiMutation(
        ({ id, confirmationText }) => categoryService.delete(id, confirmationText),
        {
            invalidateKeys: ['categories'],
            successMessage: "CLASSIFICATION RÉVOQUÉE.",
            onSuccess: () => setDeleteTarget(null),
        }
    );

    const handleDelete = (row) => setDeleteTarget(row);

    const handleOpenModal = (cat = null) => {
        if (cat && cat.id) {
            setEditingCategory(cat);
            setFormData({
                nom_categorie: cat.nom_categorie || '',
                description: cat.description || '',
                image_url: cat.image_url || '',
                parent_id: cat.parent_id || ''
            });
        } else {
            setEditingCategory(null);
            setFormData({
                nom_categorie: cat?.nom_categorie || '',
                description: cat?.description || '',
                image_url: cat?.image_url || '',
                parent_id: cat?.parent_id || ''
            });
        }
        setShowModal(true);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            const res = await api.post('/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData(prev => ({ ...prev, image_url: res.data.url }));
            toast.success("MÉDIA SYNCHRONISÉ AVEC SUCCÈS");
        } catch (error) {
            toast.error("ÉCHEC DU TRANSFERT MÉDIA");
            console.error(error);
        } finally {
            setIsUploading(false);
        }
    };

    const getExportData = () => {
        return filtered.map(c => ({
            ID: c.id?.toUpperCase() || 'N/A',
            NOM: c.nom_categorie?.toUpperCase() || 'N/A',
            CATEGORIE_PARENTE: c.parent_nom?.toUpperCase() || 'CATÉGORIE PRINCIPALE',
            DESCRIPTION: c.description || 'N/A',
            DATE_CREATION: new Date(c.createdAt).toLocaleString()
        }));
    };

    const handleExportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(getExportData());
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Taxonomie");
        XLSX.writeFile(workbook, `BCA_Categories_${Date.now()}.xlsx`);
        setShowExportMenu(false);
        toast.success("REGISTRE EXCEL RÉUSSI.");
    };

    const handleExportCSV = () => {
        const worksheet = XLSX.utils.json_to_sheet(getExportData());
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `BCA_Taxonomy_${Date.now()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setShowExportMenu(false);
        toast.success("ARCHIVE CSV GÉNÉRÉE.");
    };

    const handleExportPDF = () => {
        const doc = new jsPDF('landscape');
        const headerY = addPdfLetterhead(doc, "AUDIT TAXONOMIE", `STRUCTURE DES SEGMENTS • GÉNÉRÉ LE: ${new Date().toLocaleString()} • TOTAL: ${filtered.length}`);

        autoTable(doc, {
            startY: headerY,
            head: [["ID", "NOM DU SEGMENT", "DESCRIPTION TECHNIQUE", "HORODATAGE"]],
            body: getExportData().map(row => [
                row.ID.slice(0, 10),
                row.NOM,
                row.DESCRIPTION.slice(0, 80) + (row.DESCRIPTION.length > 80 ? '...' : ''),
                row.DATE_CREATION
            ]),
            theme: 'grid',
            headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
            styles: { fontSize: 8 },
            margin: { top: headerY }
        });
        
        doc.save(`BCA_Taxonomy_Report_${Date.now()}.pdf`);
        setShowExportMenu(false);
        toast.success("RAPPORT PDF PRÊT.");
    };

    const filtered = flatCategories.filter(c => {
        const matchesSearch = (c.nom_categorie || '').toLowerCase().includes(search.toLowerCase()) ||
                             (c.description || '').toLowerCase().includes(search.toLowerCase());
        return matchesSearch;
    });

    const [isAiGenerating, setIsAiGenerating] = useState(false);
    const handleMagicFill = async (nameOverride = null) => {
        const nameToUse = nameOverride || formData.nom_categorie;
        if (!nameToUse) {
            toast.warning("SAISISSEZ UN NOM DE CATÉGORIE D'ABORD.");
            return;
        }
        setIsAiGenerating(true);
        try {
            const result = await aiService.generateCategoryDescription(nameToUse);
            setFormData(prev => ({ ...prev, nom_categorie: nameToUse, description: result.description }));
            toast.success("DOCUMENTATION GÉNÉRÉE PAR IA.");
        } catch (error) {
            toast.error("ÉCHEC DE LA GÉNÉRATION IA.");
        } finally {
            setIsAiGenerating(false);
        }
    };

    return (
        <DashboardLayout title="GESTION DES CATÉGORIES" noPadding>
            <div className="min-h-screen bg-background p-6 lg:p-12 space-y-12 custom-scrollbar">
                
                {/* Header HUD */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex items-start gap-6">
                        <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-2xl shadow-primary/10">
                            <Layers className="size-8 text-primary shadow-glow" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                Architecture <span className="text-primary">Produits</span>
                            </h1>
                            <div className="flex items-center gap-2">
                                <div className="size-2 rounded-full bg-emerald-500 animate-pulse border-2 border-white shadow-sm" />
                                <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.3em]">
                                    {flatCategories.length} SEGMENTS RÉPERTORIÉS • SYNC_MASTER
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            className="h-12 px-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] flex items-center gap-4 shadow-[0_20px_40px_-15px_rgba(15,23,42,0.3)] hover:opacity-90 active:scale-95 transition-all"
                        >
                            <Download className="size-5" />
                            Générer Rapport
                        </button>
                        <button onClick={() => handleOpenModal()} className="h-12 px-10 bg-primary text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center gap-4">
                            <Plus className="size-5" />
                            Nouvelle Classe
                        </button>
                        <button onClick={() => refetch()} className="size-12 rounded-2xl bg-card border border-border flex items-center justify-center hover:bg-muted transition-all shadow-xl shadow-slate-200/40">
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
                                        <p className="text-[9px] font-bold text-muted-foreground mt-1">Taxonomy Ledger .xlsx</p>
                                    </div>
                                </button>
                                <button onClick={handleExportPDF} className="p-8 rounded-3xl bg-card border border-border hover:border-rose-200 hover:shadow-xl hover:shadow-rose-500/5 flex flex-col items-center gap-4 transition-all group">
                                    <div className="size-11 rounded-2xl bg-rose-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <PieChart className="size-7 text-rose-500" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Adobe PDF Audit</p>
                                        <p className="text-[9px] font-bold text-muted-foreground mt-1">Structure Report .pdf</p>
                                    </div>
                                </button>
                                <button onClick={handleExportCSV} className="p-8 rounded-3xl bg-card border border-border hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 flex flex-col items-center gap-4 transition-all group">
                                    <div className="size-11 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Database className="size-7 text-blue-500" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">CSV Archive</p>
                                        <p className="text-[9px] font-bold text-muted-foreground mt-1">Raw Segments Data .csv</p>
                                    </div>
                                </button>
                                <button onClick={() => setShowExportMenu(false)} className="p-8 rounded-3xl bg-card border border-border hover:border-slate-300 hover:shadow-xl flex flex-col items-center gap-4 transition-all group">
                                    <div className="size-11 rounded-2xl bg-muted flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <X className="size-7 text-muted-foreground" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Annuler Opération</p>
                                        <p className="text-[9px] font-bold text-muted-foreground mt-1">Fermer Panel</p>
                                    </div>
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Summary Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <DashboardCard title="Total Catégories" value={categories.length} icon={LayoutGrid} iconColor="primary" />
                    <DashboardCard title="Sous-catégories" value={flatCategories.length - categories.length} icon={Activity} iconColor="primary" />
                <DashboardCard title="Dernier Segment" value={flatCategories[0]?.nom_categorie?.slice(0, 12).toUpperCase() || "VACANT"} icon={Tag} iconColor="emerald" />
                </div>

                {/* Quick Creation Hub */}
                <div className="bg-card p-10 rounded-3xl border border-border shadow-xl shadow-slate-200/20 space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                                <Sparkles className="size-6 text-primary" />
                            </div>
                            <div className="flex flex-col">
                                <h2 className="text-xl font-black text-foreground uppercase tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                    Hub de Création Rapide
                                </h2>
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Standardisation BCA & Taxonomie</p>
                            </div>
                        </div>
                        <button 
                            onClick={async () => {
                                if (!window.confirm("CRÉER TOUTES LES CATÉGORIES STANDARDS MANQUANTES ?")) return;
                                toast.info("DÉPLOYEMENT DE LA TAXONOMIE GLOBALE...");
                                let created = 0;
                                for (const cat of BCA_CATEGORIES) {
                                    if (!flatCategories.find(c => c.nom_categorie.toLowerCase() === cat.nom.toLowerCase())) {
                                        try {
                                            await categoryService.create({ nom_categorie: cat.nom, description: `Catégorie standard: ${cat.nom}` });
                                            created++;
                                        } catch (e) { /* skip existing */ }
                                    }
                                }
                                if (created > 0) {
                                    refetch();
                                    toast.success(`${created} NOUVELLES CLASSES DÉPLOYÉES.`);
                                } else {
                                    toast.success("TOUTES LES CLASSES SONT DÉJÀ OPTIMISÉES.");
                                }
                            }}
                            className="px-8 h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all shadow-lg"
                        >
                            Bulk Import Standards
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {BCA_CATEGORIES.map(cat => {
                            const exists = flatCategories.find(c => c.nom_categorie.toLowerCase() === cat.nom.toLowerCase());
                            return (
                                <button
                                    key={cat.nom}
                                    onClick={() => !exists && handleOpenModal({ nom_categorie: cat.nom })}
                                    className={cn(
                                        "px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-3",
                                        exists 
                                            ? "bg-muted text-muted-foreground border-border cursor-default" 
                                            : "bg-card text-foreground/80 border-border hover:border-primary hover:text-primary hover:shadow-lg hover:shadow-primary/5 active:scale-95"
                                    )}
                                >
                                    <span className="text-muted-foreground flex items-center justify-center scale-90">
                                        {cat.icon && cat.icon()}
                                    </span>
                                    {cat.nom}
                                    {exists && <CheckCircle2 className="size-3 text-emerald-500" />}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Main Content Surface */}
                <div className="bg-card rounded-3xl border border-border shadow-xl shadow-slate-200/30 overflow-hidden flex flex-col min-h-[600px]">
                    {/* Filter HUD */}
                    <div className="p-10 border-b border-border flex flex-col xl:flex-row xl:items-center justify-between gap-8 bg-muted/10">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-2xl bg-card shadow-sm border border-border flex items-center justify-center">
                                <Filter className="size-6 text-primary" />
                            </div>
                            <div className="flex flex-col">
                                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-foreground">Filtrage Dynamique</p>
                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Registre des segments actifs</p>
                            </div>
                        </div>
                        <div className="relative w-full xl:w-[500px]">
                            <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-muted-foreground size-6" />
                            <input
                                className="w-full pl-20 pr-8 h-12 bg-card border border-border rounded-2xl text-[11px] font-black text-foreground focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-muted-foreground/40 uppercase tracking-widest shadow-sm"
                                placeholder="RECHERCHER DANS LE REGISTRE DES CATÉGORIES..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <DataTable
                        columns={[
                            {
                                label: 'Segment & Classification',
                                render: (row) => (
                                    <div className={cn("flex items-center gap-6 py-4", row.parent_id && "pl-8")}>
                                        {row.parent_id && (
                                            <ChevronRight className="size-4 text-muted-foreground -mr-3 shrink-0" />
                                        )}
                                        <div className="size-12 rounded-2xl bg-muted border border-border flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform text-muted-foreground">
                                            {row.image_url ? (
                                                <img src={row.image_url} alt="" className="size-full object-cover" />
                                            ) : (
                                                getCategoryIconComponent(row.nom_categorie)
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm font-black text-foreground uppercase tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                                {row.nom_categorie}
                                            </span>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-[9px] font-black text-primary/60 bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10 tracking-widest text-[7px]">
                                                    ID: {row.id?.slice(0, 8).toUpperCase()}
                                                </span>
                                                {row.parent_id ? (
                                                    <span className="text-[9px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 tracking-widest text-[7px]">
                                                        SOUS-CAT. DE {row.parent_nom?.toUpperCase()}
                                                    </span>
                                                ) : (
                                                    <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 tracking-widest text-[7px]">
                                                        CATÉGORIE PRINCIPALE
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            },
                            {
                                label: 'Documentation Technique',
                                render: (row) => (
                                    <div className="max-w-[400px]">
                                        <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest leading-relaxed line-clamp-2 italic">
                                            {row.description || "AUCUNE DOCUMENTATION DE CLASSE DISPONIBLE POUR CE SEGMENT."}
                                        </p>
                                    </div>
                                )
                            },
                            {
                                label: 'État Système',
                                render: () => (
                                    <div className="flex items-center gap-2">
                                        <div className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">SÉCURISÉ</span>
                                    </div>
                                )
                            },
                            {
                                label: 'Actions HUD',
                                render: (row) => (
                                    <div className="flex items-center justify-end gap-3 pr-4">
                                        <button 
                                            onClick={() => handleOpenModal(row)} 
                                            className="size-11 rounded-2xl bg-muted border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-card hover:shadow-lg hover:shadow-primary/10 transition-all active:scale-90"
                                            title="Éditer la classification"
                                        >
                                            <Edit2 className="size-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(row)}
                                            className="size-11 rounded-2xl bg-muted border border-border flex items-center justify-center text-muted-foreground hover:text-rose-500 hover:bg-card hover:shadow-lg hover:shadow-rose-500/10 transition-all active:scale-90"
                                            title="Révoquer le segment"
                                        >
                                            <Trash2 className="size-4" />
                                        </button>
                                    </div>
                                )
                            }
                        ]}
                        data={filtered}
                        isLoading={isLoading}
                    />

                    {!isLoading && filtered.length === 0 && (
                        <div className="flex-1 flex flex-col items-center justify-center py-32 gap-6 opacity-40">
                            <div className="size-24 rounded-3xl bg-muted border border-border flex items-center justify-center">
                                <LayoutGrid className="size-10 text-muted-foreground" />
                            </div>
                            <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">Aucune catégorie répertoriée dans ce segment</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Premium BCA Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingCategory ? "ÉDITION CLASSIFICATION" : "NOUVELLE CLASSE"}
                glass
            >
                <div className="p-4 space-y-10">
                    <form onSubmit={(e) => { e.preventDefault(); crudMutation(formData); }} className="space-y-10">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground px-1">Désignation de la Classe</label>
                            <CreatableSelect
                                                options={[
                                                    ...BCA_CATEGORIES.map(cat => ({ id: cat.nom, label: cat.nom, icon: cat.icon })),
                                                    ...categories.map(cat => ({ id: cat.nom_categorie, label: cat.nom_categorie }))
                                                ].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i)}
                                value={formData.nom_categorie}
                                onChange={(val) => handleMagicFill(val)}
                                onCreate={(val) => setFormData(prev => ({ ...prev, nom_categorie: val }))}
                                placeholder="Chercher ou créer une catégorie..."
                                className="z-50"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground px-1">Catégorie Parente (Sous-catégorie de)</label>
                            <select
                                value={formData.parent_id}
                                onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                                className="w-full h-12 px-8 bg-muted border border-border rounded-3xl text-[11px] font-black text-foreground outline-none focus:ring-4 focus:ring-primary/10 focus:bg-card transition-all shadow-inner uppercase tracking-widest"
                            >
                                <option value="">Aucune — Catégorie principale</option>
                                {categories
                                    .filter((c) => c.id !== editingCategory?.id)
                                    .map((c) => (
                                        <option key={c.id} value={c.id}>{c.nom_categorie}</option>
                                    ))}
                            </select>
                            <p className="text-[9px] font-bold text-muted-foreground px-1 normal-case tracking-normal">
                                Choisissez une catégorie principale pour créer une sous-catégorie : elle n'apparaîtra que dans le menu de cette catégorie, avec sa propre image.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between px-1">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground">Documentation Technique</label>
                                <button 
                                    type="button"
                                    onClick={() => handleMagicFill()}
                                    disabled={isAiGenerating}
                                    className="flex items-center gap-2 text-[9px] font-black text-primary uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-50"
                                >
                                    {isAiGenerating ? <RefreshCcw className="size-3 animate-spin" /> : <Sparkles className="size-3" />}
                                    Auto-Générer IA
                                </button>
                            </div>
                            <textarea 
                                rows={4}
                                value={formData.description} 
                                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                                className="w-full p-8 bg-muted border border-border rounded-3xl text-xs font-black text-foreground outline-none focus:ring-4 focus:ring-primary/10 focus:bg-card transition-all resize-none placeholder:text-muted-foreground uppercase tracking-widest italic shadow-inner" 
                                placeholder="DÉCRIVEZ LES SPÉCIFICATIONS..."
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground px-1">Image de Couverture</label>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="relative group">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        disabled={isUploading}
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="h-14 w-full bg-muted border-2 border-dashed border-border rounded-3xl flex items-center justify-center gap-4 group-hover:bg-primary/5 group-hover:border-primary group-hover:border-solid transition-all shadow-inner">
                                        <div className="size-10 rounded-2xl bg-card shadow-sm flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all">
                                            <Plus className="size-5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-foreground uppercase tracking-widest">Choisir un fichier</span>
                                            <span className="text-[8px] font-bold text-muted-foreground">PNG, JPG (MAX 5MB)</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="relative group">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-foreground z-10">
                                        <Layers className="size-4 opacity-40" />
                                    </div>
                                    <input 
                                        value={formData.image_url} 
                                        onChange={(e) => setFormData({...formData, image_url: e.target.value})} 
                                        className="w-full h-14 pl-14 pr-8 bg-muted border border-border rounded-3xl text-[10px] font-black text-foreground outline-none focus:ring-4 focus:ring-primary/10 focus:bg-card transition-all shadow-inner placeholder:text-muted-foreground" 
                                        placeholder="OU INSÉRER UNE URL DIRECTE..." 
                                    />
                                </div>
                            </div>

                            <AnimatePresence>
                                {formData.image_url && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="relative group h-48 mt-4 rounded-2xl overflow-hidden border-2 border-border bg-muted shadow-inner"
                                    >
                                        <img 
                                            src={formData.image_url} 
                                            alt="Preview" 
                                            className="size-full object-contain"
                                        />
                                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm">
                                            <button 
                                                type="button"
                                                onClick={() => setFormData({...formData, image_url: ''})}
                                                className="px-6 py-2 bg-card rounded-xl text-[10px] font-black text-rose-500 uppercase tracking-widest hover:scale-110 transition-transform"
                                            >
                                                Supprimer
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {(isUploading || isAiGenerating) && (
                                <div className="flex items-center gap-3 mt-2 px-2">
                                    <RefreshCcw className="size-3 animate-spin text-primary" />
                                    <span className="text-[9px] font-black text-primary uppercase tracking-widest animate-pulse">
                                        {isAiGenerating ? "L'IA RÉDIGE LA DOCUMENTATION..." : "CRYPTAGE & TRANSFERT EN COURS..."}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="pt-6">
                            <button 
                                type="submit" 
                                disabled={isSaving} 
                                className="w-full h-12 bg-primary text-white rounded-2xl font-black text-[12px] uppercase tracking-[0.3em] shadow-2xl shadow-primary/40 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-4 group overflow-hidden relative"
                            >
                                <div className="absolute inset-0 bg-card/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                                {isSaving ? <RefreshCcw className="size-6 animate-spin" /> : <ShieldCheck className="size-6" />}
                                <span className="relative z-10">
                                    {editingCategory ? "Mettre à jour la Classe" : "Déployer la Classe"}
                                </span>
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            <ConfirmDeleteModal
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                itemName={deleteTarget?.nom_categorie}
                itemLabel="cette catégorie"
                onConfirm={(confirmationText) => deleteMutation({ id: deleteTarget.id, confirmationText })}
            />
        </DashboardLayout>
    );
};

export default Categories;
