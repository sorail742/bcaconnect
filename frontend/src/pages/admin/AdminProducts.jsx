import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import {
    Search,
    Plus,
    Package,
    CheckCircle2,
    Edit3,
    Trash2,
    AlertTriangle,
    RefreshCcw,
    Zap,
    Box,
    ShoppingBag,
    PlusCircle,
    Activity,
    ChevronRight,
    TrendingUp,
    Globe,
    Satellite,
    Briefcase
} from 'lucide-react';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import DashboardCard from '../../components/ui/DashboardCard';
import { motion, AnimatePresence } from 'framer-motion';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [stats, setStats] = useState({ total: 0, active: 0, lowStock: 0 });

    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
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

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [prods, cats] = await Promise.all([
                productService.getAll(),
                categoryService.getAll()
            ]);
            setProducts(prods || []);
            setCategories(cats || []);

            const total = prods.length;
            const active = prods.filter(p => !p.est_supprime).length;
            const low = prods.filter(p => p.stock_quantite <= 10).length;
            setStats({ total, active, lowStock: low });
        } catch (error) {
            toast.error("ÉCHEC DE LA SYNCHRONISATION DU CATALOGUE.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDelete = async (id) => {
        if (!window.confirm("RÉVOQUER DÉFINITIVEMENT CET ACTIF ?")) return;
        try {
            await productService.delete(id);
            toast.success("PRODUIT RÉVOQUÉ.");
            fetchData();
        } catch (error) {
            toast.error("ÉCHEC DE L'OPÉRATION.");
        }
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (editingProduct) {
                await productService.update(editingProduct.id, formData);
                toast.success("CATALOGUE ACTUALISÉ.");
            } else {
                await productService.create(formData);
                toast.success("RÉFÉRENCE AJOUTÉE.");
            }
            setShowModal(false);
            fetchData();
        } catch (error) {
            toast.error("ÉCHEC DE L'ENREGISTREMENT.");
        } finally {
            setIsSaving(false);
        }
    };

    const filtered = products.filter(
        (p) =>
            p.nom_produit.toLowerCase().includes(search.toLowerCase()) ||
            p.Store?.nom_boutique?.toLowerCase().includes(search.toLowerCase())
    );

    const columns = [
        {
            label: 'UNITÉ ACTIF',
            render: (row) => (
                <div className="flex items-center gap-3 py-3 group/item">
                    <div className="size-6 rounded-xl bg-white/[0.02] border border-foreground/5 flex items-center justify-center overflow-hidden shrink-0 shadow-2xl relative">
                        {row.image_url || (row.images && row.images[0]?.url_image) ? (
                            <img src={row.image_url || row.images[0]?.url_image} alt="" className="w-full h-full object-cover group-hover/item:scale-125 transition-transform duration-1000" />
                        ) : (
                            <Box className="size-6 text-slate-700" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/40 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity" />
                    </div>
                    <div className="min-w-0 space-y-1.5">
                        <p className="text-[12px] font-black text-foreground uppercase tracking-tight truncate max-w-[220px] pt-0.5 group-hover/item:text-primary transition-colors">
                            {row.nom_produit}
                        </p>
                        <div className="flex items-center gap-2">
                            <Satellite className="size-2.5 text-slate-600" />
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none">
                                {row.Category?.nom_categorie || 'UNCLASSIFIED_NODE'}
                            </p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            label: 'VENDEUR RÉSEAU',
            render: (row) => (
                <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                        <Briefcase className="size-3 text-primary" />
                        {row.Store?.nom_boutique || 'ADMIN_CORE'}
                    </span>
                    <span className="text-[9px] text-slate-600 font-bold uppercase  border-l-2 border-primary/20 pl-3">
                        SID: {(row.store_id || 'LOCAL-01').slice(0, 8).toUpperCase()}
                    </span>
                </div>
            )
        },
        {
            label: 'COTATION GNF',
            render: (row) => (
                <div className="flex items-baseline gap-2">
                    <span className="text-[13px] font-black text-foreground tracking-tighter tabular-nums uppercase">
                        {parseFloat(row.prix_unitaire).toLocaleString('fr-GN')}
                    </span>
                    <span className="text-[9px] font-black text-primary uppercase tracking-widest">GNF</span>
                </div>
            )
        },
        {
            label: 'INVENTAIRE',
            render: (row) => (
                <div className="flex items-center gap-4 p-2.5 rounded-xl bg-white/[0.01] border border-white/[0.03]">
                    <div className={cn(
                        "size-2 rounded-full",
                        row.stock_quantite === 0 ? "bg-rose-500 animate-pulse shadow-[0_0_12px_#f43f5e]" :
                            row.stock_quantite <= 10 ? "bg-amber-500 animate-pulse" : "bg-emerald-500 shadow-[0_0_12px_#10b981]"
                    )} />
                    <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest",
                        row.stock_quantite === 0 ? "text-rose-500" :
                            row.stock_quantite <= 10 ? "text-amber-500" : "text-emerald-500"
                    )}>
                        {row.stock_quantite} UNITÉS
                    </span>
                </div>
            )
        },
        {
            label: 'GOUVERNANCE',
            render: (row) => (
                <div className="flex items-center justify-end gap-3 pr-4">
                    <button onClick={() => handleOpenModal(row)} className="size-6 rounded-xl bg-white/[0.02] border border-foreground/5 text-muted-foreground/80 hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center hover:border-primary/20 shadow-xl  overflow-hidden relative group/btn">
                         <div className="absolute inset-x-0 bottom-0 h-[2px] bg-primary scale-x-0 group-hover/btn:scale-x-100 transition-transform origin-left" />
                         <Edit3 className="size-5" />
                    </button>
                    <button onClick={() => handleDelete(row.id)} className="size-6 rounded-xl bg-white/[0.02] border border-foreground/5 text-muted-foreground/80 hover:text-rose-500 hover:bg-rose-500/5 transition-all flex items-center justify-center hover:border-rose-500/20 shadow-xl  overflow-hidden relative group/btn">
                         <div className="absolute inset-x-0 bottom-0 h-[2px] bg-rose-500 scale-x-0 group-hover/btn:scale-x-100 transition-transform origin-left" />
                         <Trash2 className="size-5" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <DashboardLayout title="ALPHA_INDEX_CATALOGUE">
            <div className="space-y-4 animate-in pb-16">

                {/* Catalogue Infrastructure — Executive Control v5 */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="executive-card !p-4 group overflow-visible relative"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.03] to-transparent pointer-events-none" />
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="size-6 rounded-[2.2rem] bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner group-hover:rotate-6 transition-transform duration-700">
                                <Box className="size-6 text-primary drop-shadow-xl" />
                            </div>
                            <div className="space-y-2.5">
                                <h2 className="text-sm font-black text-foreground uppercase tracking-tighter leading-none pt-0.5" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                    AUDIT_<span className="text-primary italic">INDEX</span>_RÉSEAU.
                                </h2>
                                <div className="flex items-center gap-3">
                                    <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <p className="text-[10px] font-black text-muted-foreground uppercase  opacity-80 pt-0.5">
                                        PROTOCOLE_V5.1 — CATALOGUE_LIVE_SYNC
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button 
                                id="btn-products-refresh-signal"
                                onClick={fetchData} 
                                className="size-6 rounded-[2.2rem] bg-white/[0.03] border border-foreground/10 flex items-center justify-center text-muted-foreground/80 hover:text-primary hover:border-primary/20 transition-all "
                            >
                                <RefreshCcw className={cn("size-6 transition-all duration-700", isLoading && "animate-spin")} />
                            </button>
                            <button
                                id="btn-products-add-node"
                                onClick={() => handleOpenModal()} 
                                className="h-11 px-6 bg-white text-background hover:bg-primary hover:text-foreground rounded-2xl font-medium text-sm text-muted-foreground transition-all shadow-2xl  flex items-center gap-3 group/btn border-0"
                            >
                                <PlusCircle className="size-5 transition-transform group-hover/btn:rotate-90 group-hover/btn:scale-125" />
                                <span>INDEXER_NOUVEL_ACTIF</span>
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Macro Asset Indicators — HUD Node 02 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                        { label: 'UNITÉS_RÉFÉRENCÉES', value: stats.total, icon: Package, color: 'primary' },
                        { label: 'ACTIFS_OPÉRATIONNELS', value: stats.active, icon: TrendingUp, color: 'emerald-500', status: 'LIVE_SYNC' },
                        { label: 'ALERTES_CRITIQUES', value: stats.lowStock, icon: Activity, color: 'rose-500', status: stats.lowStock > 0 ? 'ACTION_REQUIS' : 'STATUS_STABLE' }
                    ].map((kpi, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={cn(
                                "executive-card group  hover-shine relative overflow-hidden",
                                kpi.color === 'rose-500' && stats.lowStock > 0 ? "border-l-4 border-l-rose-500/50" : 
                                kpi.color === 'emerald-500' ? "border-l-4 border-l-emerald-500/50" : "border-l-4 border-l-primary/50"
                            )}
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                                <kpi.icon className="size-6" />
                            </div>
                            <div className="relative z-10 space-y-6">
                                <p className="text-[10px] font-black uppercase  text-muted-foreground group-hover:text-foreground transition-colors">{kpi.label}</p>
                                <div className="flex items-end justify-between">
                                    <h3 className="text-sm font-black tracking-tighter text-foreground uppercase tabular-nums leading-none">
                                        {kpi.value}
                                    </h3>
                                    {kpi.status && (
                                        <div className={cn(
                                            "text-[10px] font-black tracking-widest px-5 py-2 rounded-xl border backdrop-blur-xl",
                                            kpi.color === 'rose-500' && stats.lowStock > 0 ? "bg-rose-500/10 text-rose-500 border-rose-500/20 animate-pulse" : 
                                            kpi.color === 'emerald-500' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-foreground/5 text-muted-foreground border-foreground/5"
                                        )}>
                                            {kpi.status}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Unified Asset Surface — HUD Ledger */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="executive-card !p-0 overflow-hidden border-t-8 border-t-primary shadow-2xl relative"
                >
                    <div className="absolute inset-0 opacity-[0.01] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
                    
                    <div className="p-4 border-b border-white/[0.03] bg-white/[0.01] flex flex-col xl:flex-row xl:items-center justify-between gap-3 relative z-10">
                        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
                            <button id="filter-all-nodes" className="px-6 h-12 rounded-2xl text-[10px] font-black uppercase  bg-white text-background shadow-2xl  transition-all hover:bg-primary hover:text-foreground">INDEX_GLOBAL</button>
                            <button id="filter-node-alerts" className="px-6 h-12 rounded-2xl text-[10px] font-black uppercase  bg-white/[0.03] border border-foreground/5 text-muted-foreground hover:text-foreground transition-all ">SIGNALS_ALERTE</button>
                        </div>

                        <div className="relative group w-full xl:w-[45rem]">
                            <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-600 size-6 group-focus-within:text-primary transition-colors z-10" />
                            <div className="absolute inset-y-2 left-2 w-1.5 bg-primary/20 rounded-full" />
                            <input
                                id="input-search-catalogue"
                                className="w-full pl-20 pr-10 h-11 bg-white/[0.02] border border-foreground/10 rounded-2xl text-[13px] font-black tracking-widest placeholder:text-slate-800 outline-none focus:border-primary/40 transition-all text-foreground uppercase"
                                placeholder="IDENTIFIER_UNITÉ_ACTIF..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="p-4 relative z-10">
                        <DataTable
                            columns={columns}
                            data={filtered}
                            isLoading={isLoading}
                            className="bg-transparent border-0"
                        />

                        {!isLoading && filtered.length === 0 && (
                            <div className="py-60 text-center opacity-20 flex flex-col items-center gap-3">
                                <ShoppingBag className="size-6 text-slate-600" />
                                <div className="space-y-6">
                                    <p className="text-sm font-black uppercase  text-muted-foreground">CATALOGUE_EMPTY</p>
                                    <p className="text-[12px] font-black uppercase  text-primary">SYSTEM_PENDING_ASSETS_V5</p>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Indexation Desk — Alpha Console Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingProduct ? "RÉVISION_ASSET_ALPHA" : "PROTOCOLE_INDEXATION_ACTIF"}
                className="max-w-4xl"
            >
                <form onSubmit={handleSubmit} className="p-4 space-y-20 bg-background">
                    <div className="space-y-14">
                        <div className="space-y-6">
                            <label className="text-[10px] font-black uppercase  text-muted-foreground ml-4">DÉSIGNATION_STRUCTURELLE</label>
                            <div className="relative group/field focus-within:ring-2 ring-primary/10 rounded-2xl overflow-hidden">
                                <Box className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/field:text-primary size-6 z-20 transition-colors" />
                                <input
                                    id="modal-asset-nom"
                                    required
                                    value={formData.nom_produit}
                                    onChange={(e) => setFormData({ ...formData, nom_produit: e.target.value })}
                                    placeholder="DESIGNATION_ALPHA_REF..."
                                    className="w-full h-12 pl-20 pr-10 bg-white/[0.01] border border-foreground/10 text-[20px] font-black uppercase tracking-tight focus:border-primary/40 outline-none transition-all text-foreground placeholder:text-slate-900"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-6">
                                <label className="text-[10px] font-black uppercase  text-muted-foreground ml-4">COTATION_UNITAIRE (GNF)</label>
                                <div className="relative group/field focus-within:ring-2 ring-primary/10 rounded-2xl overflow-hidden">
                                    <Zap className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/field:text-primary size-5 z-20 transition-colors" />
                                    <input
                                        id="modal-asset-prix"
                                        type="number"
                                        required
                                        value={formData.prix_unitaire}
                                        onChange={(e) => setFormData({ ...formData, prix_unitaire: e.target.value })}
                                        className="w-full h-12 pl-20 pr-10 bg-white/[0.01] border border-foreground/10 text-[24px] font-black outline-none focus:border-primary/40 transition-all text-foreground tabular-nums"
                                    />
                                </div>
                            </div>
                            <div className="space-y-6">
                                <label className="text-[10px] font-black uppercase  text-muted-foreground ml-4">UNITÉS_STOCK_RÉSEAU</label>
                                <div className="relative group/field focus-within:ring-2 ring-primary/10 rounded-2xl overflow-hidden">
                                    <Activity className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/field:text-primary size-5 z-20 transition-colors" />
                                    <input
                                        id="modal-asset-stock"
                                        type="number"
                                        required
                                        value={formData.stock_quantite}
                                        onChange={(e) => setFormData({ ...formData, stock_quantite: e.target.value })}
                                        className="w-full h-12 pl-20 pr-10 bg-white/[0.01] border border-foreground/10 text-[24px] font-black outline-none focus:border-primary/40 transition-all text-foreground tabular-nums"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <label className="text-[10px] font-black uppercase  text-muted-foreground ml-4">NODALE_CATÉGORIE_SYNC</label>
                            <div className="relative group/field h-12">
                                <Package className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/field:text-primary size-5 z-20 pointer-events-none transition-colors" />
                                <select
                                    id="modal-asset-cat"
                                    className="w-full h-full pl-20 pr-16 bg-white/[0.01] border border-foreground/10 rounded-2xl text-[14px] font-black uppercase  focus:border-primary/40 outline-none transition-all text-foreground appearance-none"
                                    value={formData.categorie_id}
                                    onChange={(e) => setFormData({ ...formData, categorie_id: e.target.value })}
                                >
                                    {categories.map(c => <option key={c.id} value={c.id} className="bg-background">{c.nom_categorie?.toUpperCase() || c.nom?.toUpperCase()}</option>)}
                                </select>
                                <ChevronRight className="absolute right-10 top-1/2 -translate-y-1/2 size-6 text-slate-700 pointer-events-none group-focus-within/field:rotate-90 transition-transform duration-[0.8s] group-focus-within/field:text-primary" />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <label className="text-[10px] font-black uppercase  text-muted-foreground ml-4">SOURCE_IMAGE_ACTIF (URL_HTTPS)</label>
                            <div className="relative group/field focus-within:ring-2 ring-primary/10 rounded-2xl overflow-hidden">
                                <PlusCircle className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/field:text-primary size-5 z-20 transition-colors" />
                                <input
                                    id="modal-asset-img"
                                    value={formData.image_url}
                                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                    placeholder="HTTPS://STORAGE.BCACONNECT.GN/ASSETS/ALPHA.WEBP"
                                    className="w-full h-12 pl-20 pr-10 bg-white/[0.01] border border-foreground/10 text-[14px] font-black tracking-widest outline-none focus:border-primary/40 transition-all text-primary placeholder:text-slate-900"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-12 flex gap-3">
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="flex-1 h-12 rounded-2xl bg-white/[0.03] border border-foreground/10 text-muted-foreground font-bold uppercase  text-[10px] hover:bg-foreground/5  transition-all"
                        >
                            AVORTIR_SYNC
                        </button>
                        <button
                            id="btn-modal-asset-execute"
                            type="submit"
                            disabled={isSaving}
                            className="flex-[2] h-12 rounded-2xl bg-white text-background font-black text-[14px] uppercase  flex items-center justify-center gap-3 shadow-2xl hover:bg-primary hover:text-foreground transition-all  border-0 group/submit"
                        >
                            {isSaving ? <RefreshCcw className="size-6 animate-spin" /> : <CheckCircle2 className="size-6 transition-all group-hover/submit:scale-110" />}
                            <span>{editingProduct ? "TERMINER_LA_RÉVISION" : "EXÉCUTER_L'INDEXATION"}</span>
                        </button>
                    </div>
                </form>
            </Modal>
        </DashboardLayout>
    );
};

export default AdminProducts;
