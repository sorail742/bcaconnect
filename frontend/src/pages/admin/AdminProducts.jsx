import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Plus, Package, CheckCircle2, Edit3, Trash2,
    AlertTriangle, RefreshCcw, Zap, Box, ShoppingBag,
    Activity, Filter, Image as ImageIcon,
    Tag, Briefcase, ChevronDown, PlusCircle, ShieldCheck,
    Download, FileText, PieChart, Database, X
} from 'lucide-react';
import productService from '../../services/productService';
import { useProducts, useCategories } from '../../hooks/useDomainData';
import useApiMutation from '../../hooks/useApiMutation';
import { cn } from '../../lib/utils';
import api from '../../services/api';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const StatCard = ({ title, value, icon: Icon, color, status }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group"
    >
        <div className={cn("absolute top-0 right-0 p-5 opacity-5 group-hover:scale-125 transition-transform duration-700", color)}>
            <Icon className="size-10" />
        </div>
        <div className="relative z-10 space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {title}
            </p>
            <div className="flex items-end justify-between">
                <h3 className="text-3xl font-black text-slate-900 leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    {value}
                </h3>
                {status && (
                    <div className={cn("text-[9px] font-bold px-2 py-1 rounded-lg", 
                        status === 'Optimal' ? "text-emerald-500 bg-emerald-50" : "text-rose-500 bg-rose-50"
                    )}>
                        {status}
                    </div>
                )}
            </div>
        </div>
    </motion.div>
);

const AdminProducts = () => {
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('TOUS');
    const [showModal, setShowModal] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const { data: productsRaw, loading: isLoading, refetch } = useProducts();
    const { data: categories = [] } = useCategories();

    const products = Array.isArray(productsRaw) ? productsRaw : (productsRaw?.products || []);

    const [formData, setFormData] = useState({
        nom_produit: '',
        description: '',
        prix_unitaire: '',
        prix_ancien: '',
        stock_quantite: '',
        categorie_id: '',
        image_url: '',
        statut: 'Publié'
    });
    const [isUploading, setIsUploading] = useState(false);

    const stats = [
        { title: 'Total Produits', value: products.length, icon: Package, color: 'text-primary' },
        { title: 'Inventaire Actif', value: products.filter(p => !p.est_supprime).length, icon: Activity, color: 'text-emerald-500', status: 'Optimal' },
        { title: 'Stock Critique', value: products.filter(p => p.stock_quantite <= 10).length, icon: AlertTriangle, color: 'text-rose-500', status: 'Alerte' }
    ];

    const filtered = products.filter(
        (p) => {
            const name = p.nom_produit || '';
            const store = p.Store?.nom_boutique || '';
            const matchesSearch = name.toLowerCase().includes(search.toLowerCase()) ||
                                store.toLowerCase().includes(search.toLowerCase());
            
            const categoryMatch = selectedCategory === 'TOUS' || (p.categorie_id === selectedCategory);
                                 
            return matchesSearch && categoryMatch;
        }
    );

    const { mutate: deleteProduct } = useApiMutation(
        (id) => productService.delete(id),
        {
            successMessage: "PRODUIT RÉVOQUÉ DU CATALOGUE.",
            invalidateKeys: ['products']
        }
    );

    const { mutate: saveProduct, isPending: isSaving } = useApiMutation(
        (data) => editingProduct ? productService.update(editingProduct.id, data) : productService.create(data),
        {
            successMessage: editingProduct ? "CATALOGUE ACTUALISÉ." : "ACQUISITION RÉUSSIE.",
            invalidateKeys: ['products'],
            onSuccess: () => setShowModal(false)
        }
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        saveProduct(formData);
    };

    const handleDelete = (id) => {
        if (!window.confirm("CONFIRMER LA RÉVOCATION DE CET ACTIF ?")) return;
        deleteProduct(id);
    };

    const handleOpenModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                nom_produit: product.nom_produit || '',
                description: product.description || '',
                prix_unitaire: product.prix_unitaire || '',
                prix_ancien: product.prix_ancien || '',
                stock_quantite: product.stock_quantite || '',
                categorie_id: product.categorie_id || '',
                image_url: product.image_url || '',
                statut: product.statut || 'Publié'
            });
        } else {
            setEditingProduct(null);
            setFormData({
                nom_produit: '',
                description: '',
                prix_unitaire: '',
                prix_ancien: '',
                stock_quantite: '',
                categorie_id: categories[0]?.id || '',
                image_url: '',
                statut: 'Publié'
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
            toast.success("MÉDIA INDEXÉ AVEC SUCCÈS");
        } catch (error) {
            toast.error("ÉCHEC DU TRANSFERT MÉDIA");
            console.error(error);
        } finally {
            setIsUploading(false);
        }
    };

    const getExportData = () => {
        return filtered.map(p => ({
            ID: p.id?.toUpperCase() || 'N/A',
            DESIGNATION: p.nom_produit?.toUpperCase() || 'N/A',
            CATEGORIE: p.Category?.nom_categorie?.toUpperCase() || 'N/A',
            BOUTIQUE: p.Store?.nom_boutique?.toUpperCase() || 'BCA ADMIN',
            PRIX: parseFloat(p.prix_unitaire || 0),
            STOCK: parseInt(p.stock_quantite || 0),
            STATUT: p.statut?.toUpperCase() || 'PUBLIÉ'
        }));
    };

    const handleExportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(getExportData());
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Catalogue");
        XLSX.writeFile(workbook, `BCA_Products_Audit_${Date.now()}.xlsx`);
        setShowExportMenu(false);
        toast.success("INVENTAIRE EXCEL GÉNÉRÉ.");
    };

    const handleExportCSV = () => {
        const worksheet = XLSX.utils.json_to_sheet(getExportData());
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `BCA_Catalog_${Date.now()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setShowExportMenu(false);
        toast.success("ARCHIVE CSV PRÊTE.");
    };

    const handleExportPDF = () => {
        const doc = new jsPDF('landscape');
        doc.setFontSize(22);
        doc.text("AUDIT CATALOGUE - BCA CONNECT", 14, 20);
        doc.setFontSize(10);
        doc.text(`INVENTAIRE RÉSEAU • GÉNÉRÉ LE: ${new Date().toLocaleString()} • SEGMENT: ${selectedCategory}`, 14, 30);
        
        autoTable(doc, {
            startY: 40,
            head: [["ID", "DÉSIGNATION", "CATÉGORIE", "BOUTIQUE", "PRIX (GNF)", "STOCK", "STATUT"]],
            body: getExportData().map(p => [
                p.ID.slice(0, 10),
                p.DESIGNATION,
                p.CATEGORIE,
                p.BOUTIQUE,
                p.PRIX.toLocaleString() + " GNF",
                p.STOCK,
                p.STATUT
            ]),
            theme: 'grid',
            headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
            styles: { fontSize: 8 },
            margin: { top: 40 }
        });
        
        doc.save(`BCA_Audit_Catalog_${Date.now()}.pdf`);
        setShowExportMenu(false);
        toast.success("RAPPORT PDF PRÊT POUR ARCHIVAGE.");
    };

    const columns = [
        {
            label: 'Identité Produit',
            render: (row) => (
                <div className="flex items-center gap-4 py-3">
                    <div className="size-11 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                        {row.image_url || (row.images && row.images[0]?.url_image) ? (
                            <img src={row.image_url || row.images[0]?.url_image} alt="" className="size-full object-cover" />
                        ) : (
                            <Package className="size-5 text-slate-300" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-black text-slate-800 uppercase tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            {row.nom_produit}
                        </p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">
                            {row.Category?.nom_categorie || 'SANS CLASSE'}
                        </p>
                    </div>
                </div>
            )
        },
        {
            label: 'Fournisseur',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <Briefcase className="size-3 text-primary" />
                    <span className="text-[10px] font-bold text-slate-600 uppercase truncate max-w-[120px]">
                        {row.Store?.nom_boutique || 'BCA ADMIN'}
                    </span>
                </div>
            )
        },
        {
            label: 'Cotation (GNF)',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="text-xs font-black text-slate-900 tabular-nums">
                        {parseFloat(row.prix_unitaire || 0).toLocaleString('fr-GN')}
                    </span>
                    {row.prix_ancien > 0 && (
                        <span className="text-[8px] text-slate-300 line-through tabular-nums">
                            {parseFloat(row.prix_ancien).toLocaleString()}
                        </span>
                    )}
                </div>
            )
        },
        {
            label: 'Inventaire',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <div className={cn("size-1.5 rounded-full", 
                        row.stock_quantite === 0 ? "bg-rose-500" :
                        row.stock_quantite <= 10 ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]" : "bg-emerald-500"
                    )} />
                    <span className={cn("text-[9px] font-black uppercase tracking-widest",
                        row.stock_quantite === 0 ? "text-rose-500" :
                        row.stock_quantite <= 10 ? "text-amber-500" : "text-emerald-500"
                    )}>
                        {row.stock_quantite} UNITÉS
                    </span>
                </div>
            )
        },
        {
            label: 'Actions',
            render: (row) => (
                <div className="flex items-center justify-end gap-2 pr-2">
                    <button onClick={() => handleOpenModal(row)} className="size-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary transition-all duration-300">
                        <Edit3 className="size-3.5" />
                    </button>
                    <button onClick={() => handleDelete(row.id)} className="size-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all duration-300">
                        <Trash2 className="size-3.5" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <DashboardLayout title="GESTION CATALOGUE PRODUITS" noPadding>
            <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-12 space-y-12 custom-scrollbar">
                
                {/* Header HUD */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex items-start gap-6">
                        <div className="size-16 rounded-[1.5rem] bg-primary/10 border border-primary/20 flex items-center justify-center shadow-2xl shadow-primary/10">
                            <ShoppingBag className="size-8 text-primary shadow-glow" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                Catalogue <span className="text-primary">E-Commerce</span>
                            </h1>
                            <div className="flex items-center gap-2">
                                <div className="size-2 rounded-full bg-emerald-500 animate-pulse border-2 border-white shadow-sm" />
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">
                                    {products.length} RÉFÉRENCES ACTIVES • SYNC_MASTER
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            className="h-16 px-10 bg-slate-900 text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] flex items-center gap-4 shadow-[0_20px_40px_-15px_rgba(15,23,42,0.3)] hover:opacity-90 active:scale-95 transition-all text-white"
                        >
                            <Download className="size-5" />
                            Générer Rapport
                        </button>
                        <button onClick={() => handleOpenModal()} className="h-16 px-10 bg-primary text-foreground rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center gap-4">
                            <PlusCircle className="size-5" />
                            Nouvel Article
                        </button>
                        <button onClick={() => refetch()} className="size-16 rounded-[1.5rem] bg-white border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-all shadow-xl shadow-slate-200/40">
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
                                        <p className="text-[9px] font-bold text-slate-400 mt-1">Inventory Ledgers .xlsx</p>
                                    </div>
                                </button>
                                <button onClick={handleExportPDF} className="p-8 rounded-3xl bg-white border border-slate-100 hover:border-rose-200 hover:shadow-xl hover:shadow-rose-500/5 flex flex-col items-center gap-4 transition-all group">
                                    <div className="size-14 rounded-2xl bg-rose-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <PieChart className="size-7 text-rose-500" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-800">Adobe PDF Audit</p>
                                        <p className="text-[9px] font-bold text-slate-400 mt-1">Catalog Report .pdf</p>
                                    </div>
                                </button>
                                <button onClick={handleExportCSV} className="p-8 rounded-3xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 flex flex-col items-center gap-4 transition-all group">
                                    <div className="size-14 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Database className="size-7 text-blue-500" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-800">CSV Archive</p>
                                        <p className="text-[9px] font-bold text-slate-400 mt-1">Raw Catalog Data .csv</p>
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

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {stats.map((s, i) => (
                        <StatCard key={i} {...s} />
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/30 overflow-hidden">
                    {/* Filter HUD */}
                    <div className="p-10 border-b border-slate-50 flex flex-col xl:flex-row xl:items-center justify-between gap-8 bg-slate-50/10">
                        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 xl:pb-0">
                            <div className="size-11 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shrink-0 mr-2 shadow-sm">
                                <Filter className="size-5 text-primary" />
                            </div>
                            <button
                                onClick={() => setSelectedCategory('TOUS')}
                                className={cn(
                                    "px-8 h-11 rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                                    selectedCategory === 'TOUS' ? "bg-slate-900 text-white shadow-2xl shadow-slate-900/20" : "bg-white border border-slate-100 text-slate-400 hover:bg-slate-50"
                                )}
                            >
                                TOUTES CATÉGORIES
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={cn(
                                        "px-8 h-11 rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                                        selectedCategory === cat.id ? "bg-slate-900 text-white shadow-2xl shadow-slate-900/20" : "bg-white border border-slate-100 text-slate-400 hover:bg-slate-50"
                                    )}
                                >
                                    {cat.nom_categorie?.toUpperCase()}
                                </button>
                            ))}
                        </div>

                        <div className="relative w-full xl:w-[450px]">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 size-5" />
                            <input
                                className="w-full pl-16 pr-8 h-16 bg-white border border-slate-100 rounded-[1.5rem] text-[11px] font-black text-slate-900 focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-slate-200 uppercase tracking-widest shadow-sm"
                                placeholder="IDENTIFIER PRODUIT / FOURNISSEUR / SKU..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <DataTable
                        columns={columns}
                        data={filtered}
                        isLoading={isLoading}
                    />

                    {!isLoading && filtered.length === 0 && (
                        <div className="py-40 flex flex-col items-center gap-6 opacity-40 text-slate-400">
                            <Box className="size-20" />
                            <div className="space-y-2 text-center">
                                <p className="text-[11px] font-black uppercase tracking-[0.3em]">Aucun enregistrement détecté</p>
                                <p className="text-[9px] font-bold uppercase italic opacity-60">Vérifiez les paramètres de filtrage</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingProduct ? "ÉDITION ARTICLE" : "NOUVELLE ACQUISITION"}
                glass
            >
                <form onSubmit={handleSubmit} className="space-y-8 p-4">
                    <div className="space-y-2 group">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 px-1">Désignation de l'Article</label>
                        <div className="relative">
                            <input 
                                required 
                                value={formData.nom_produit} 
                                onChange={(e) => setFormData({...formData, nom_produit: e.target.value})} 
                                className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary/20 transition-all uppercase placeholder:text-slate-500" 
                                placeholder="NOM DU PRODUIT..."
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 px-1">Prix Unitaire (GNF)</label>
                            <input 
                                required 
                                type="number"
                                value={formData.prix_unitaire} 
                                onChange={(e) => setFormData({...formData, prix_unitaire: e.target.value})} 
                                className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-emerald-700 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all tabular-nums placeholder:text-slate-500" 
                                placeholder="0"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 px-1">Stock Initial</label>
                            <input 
                                required 
                                type="number"
                                value={formData.stock_quantite} 
                                onChange={(e) => setFormData({...formData, stock_quantite: e.target.value})} 
                                className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-blue-700 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all tabular-nums placeholder:text-slate-500" 
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 px-1">Classification</label>
                            <div className="relative">
                                <select 
                                    value={formData.categorie_id} 
                                    onChange={(e) => setFormData({...formData, categorie_id: e.target.value})} 
                                    className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-900 outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">CHOISIR UNE CATÉGORIE</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.nom_categorie?.toUpperCase() || c.nom?.toUpperCase()}</option>)}
                                </select>
                                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 px-1">Statut Initial</label>
                            <div className="relative">
                                <select 
                                    value={formData.statut} 
                                    onChange={(e) => setFormData({...formData, statut: e.target.value})} 
                                    className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-900 outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="Publié">EN LIGNE (PUBLIÉ)</option>
                                    <option value="Brouillon">BROUILLON (ARCHIVÉ)</option>
                                </select>
                                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 px-1">Visuel de l'Article</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="relative group">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    disabled={isUploading}
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                />
                                <div className="h-20 w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center gap-4 group-hover:bg-primary/5 group-hover:border-primary group-hover:border-solid transition-all shadow-inner">
                                    <div className="size-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-500 group-hover:text-primary group-hover:scale-110 transition-all">
                                        <Plus className="size-5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Importer Média</span>
                                        <span className="text-[8px] font-bold text-slate-500">FORMATS STANDARDS</span>
                                    </div>
                                </div>
                            </div>
                            <div className="relative group">
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-900">
                                    <ImageIcon className="size-4 opacity-40" />
                                </div>
                                <input 
                                    value={formData.image_url} 
                                    onChange={(e) => setFormData({...formData, image_url: e.target.value})} 
                                    className="w-full h-20 pl-14 pr-8 bg-slate-50 border border-slate-200 rounded-3xl text-[10px] font-black text-slate-900 outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all shadow-inner placeholder:text-slate-500" 
                                    placeholder="OU URL DIRECTE..."
                                />
                            </div>
                        </div>

                        <AnimatePresence>
                            {formData.image_url && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="relative group h-40 mt-4 rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 shadow-inner"
                                >
                                    <img src={formData.image_url} alt="Preview" className="size-full object-contain" />
                                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm">
                                        <button type="button" onClick={() => setFormData({...formData, image_url: ''})} className="px-4 py-1.5 bg-white rounded-lg text-[9px] font-black text-rose-500 uppercase tracking-widest shadow-xl">RETIRER</button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {isUploading && (
                            <div className="flex items-center gap-2 mt-2 px-1">
                                <RefreshCcw className="size-3 animate-spin text-primary" />
                                <span className="text-[9px] font-black text-primary uppercase tracking-widest animate-pulse">SYNCHRONISATION DATA SATELLITE...</span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 px-1">Description Technique</label>
                        <textarea 
                            rows={4}
                            value={formData.description} 
                            onChange={(e) => setFormData({...formData, description: e.target.value})} 
                            className="w-full p-6 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black text-slate-800 outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none shadow-inner italic placeholder:text-slate-500" 
                            placeholder="SPÉCIFICATIONS DÉTAILLÉES..."
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button type="submit" disabled={isSaving || isUploading} className="flex-1 h-14 bg-primary text-foreground rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                            {isSaving ? <RefreshCcw className="size-5 animate-spin" /> : <ShieldCheck className="size-5" />}
                            {editingProduct ? "Mettre à jour le catalogue" : "Valider l'Acquisition"}
                        </button>
                    </div>
                </form>
            </Modal>
        </DashboardLayout>
    );
};

export default AdminProducts;
