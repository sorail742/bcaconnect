import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
    Plus, Search, Edit3, Trash2, Package, AlertCircle,
    TrendingUp, RefreshCw, CheckCircle2,
    XCircle, Zap,
    ShoppingBag,
    Satellite
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import productService from '../../services/productService';
import { toast } from 'sonner';
import DataTable from '../../components/ui/DataTable';
import { TableRowSkeleton } from '../../components/ui/Loader';
import DashboardCard from '../../components/ui/DashboardCard';
import ProductCard from '../../components/produits/ProductCard';

// ── Stock Badge ─────────────────────────────────────────
const StockBadge = ({ qty }) => {
    if (qty === 0) return (
        <span className="inline-flex items-center gap-2 px-3 py-1 bg-rose-50 text-rose-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-rose-100">
            <div className="size-1.5 rounded-full bg-rose-500 animate-pulse" />
            Rupture
        </span>
    );
    if (qty <= 5) return (
        <span className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-amber-100">
            <div className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
            Critique
        </span>
    );
    return (
        <span className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-emerald-100">
            <div className="size-1.5 rounded-full bg-emerald-500" />
            Stock
        </span>
    );
};

// ── Stock Editor ─────────────────────────────────────────────
const StockEditor = ({ productId, initialStock, onUpdated }) => {
    const [value, setValue] = useState(initialStock);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const save = async () => {
        if (value === initialStock) { setIsEditing(false); return; }
        setIsSaving(true);
        try {
            await productService.patchStock(productId, parseInt(value));
            onUpdated(productId, parseInt(value));
            toast.success("Stock mis à jour.");
        } catch (e) {
            setValue(initialStock);
            toast.error("Impossible de modifier le stock.");
        }
        finally { setIsSaving(false); setIsEditing(false); }
    };

    if (isEditing) {
        return (
            <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm animate-in zoom-in-95 duration-200">
                <input
                    type="number" min={0}
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && save()}
                    className="w-14 h-8 px-2 text-xs font-black text-center text-slate-900 bg-transparent outline-none"
                    autoFocus
                />
                <button id={`save-stock-${productId}`} onClick={save} disabled={isSaving} className="size-8 flex items-center justify-center rounded-lg bg-primary text-white hover:bg-primary/90 transition-all border-none">
                    <CheckCircle2 className="size-4" />
                </button>
                <button id={`cancel-stock-${productId}`} onClick={() => { setValue(initialStock); setIsEditing(false); }} className="size-8 flex items-center justify-center rounded-lg bg-slate-50 text-slate-400 hover:text-slate-600 transition-all border-none">
                    <XCircle className="size-4" />
                </button>
            </div>
        );
    }

    return (
        <button
            id={`edit-stock-${productId}`}
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-3 group bg-slate-50 hover:bg-slate-100 px-4 py-2 rounded-xl border border-slate-100 transition-all duration-300"
        >
            <span className="text-xs font-black text-slate-900 tabular-nums">{value}</span>
            <Edit3 className="size-3 text-slate-300 group-hover:text-primary transition-colors" />
        </button>
    );
};

const Products = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('tous');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);

    const load = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await productService.getMyProducts();
            setProducts(data || []);
        } catch (err) {
            toast.error("Erreur de chargement de l'inventaire.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleStockUpdated = (id, newStock) => {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, stock_quantite: newStock } : p));
    };

    const handleDelete = async (product) => {
        setIsDeleting(true);
        try {
            await productService.delete(product.id);
            setProducts(prev => prev.filter(p => p.id !== product.id));
            setDeleteConfirm(null);
            toast.success("Article supprimé de l'inventaire.");
        } catch {
            toast.error("Impossible de supprimer l'article.");
        } finally {
            setIsDeleting(false);
        }
    };

    const FILTERS = [
        { key: 'tous', label: 'Tous' },
        { key: 'en_stock', label: 'En stock' },
        { key: 'faible', label: 'Stock faible' },
        { key: 'rupture', label: 'Rupture' },
    ];

    const filtered = products.filter(p => {
        const matchSearch = p.nom_produit?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchFilter =
            activeFilter === 'tous' ? true :
                activeFilter === 'en_stock' ? p.stock_quantite > 5 :
                    activeFilter === 'faible' ? (p.stock_quantite > 0 && p.stock_quantite <= 5) :
                        p.stock_quantite === 0;
        return matchSearch && matchFilter;
    });

    const totalStockValue = products.reduce((acc, p) => acc + parseFloat(p.prix_unitaire) * p.stock_quantite, 0);

    return (
        <DashboardLayout title="Gestion Inventaire" noPadding>
            <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-8 space-y-8 custom-scrollbar">

                {/* Executive Command Bar — Inventory Node */}
                <div className="premium-card p-6 relative overflow-hidden group/header">
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="size-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 border border-amber-100 transition-all duration-700 group-hover:rotate-12 shadow-sm">
                                <Package className="size-6" />
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                    Inventaire <span className="text-primary">Boutique</span>
                                </h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                    {products.length} référence{products.length > 1 ? 's' : ''} • Synchronisation en temps réel
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button id="btn-refresh-inventory" onClick={load} className="size-11 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-primary transition-all group/refresh shadow-sm">
                                <RefreshCw className={cn("size-5 group-hover/refresh:rotate-180 transition-transform duration-1000", isLoading && "animate-spin")} />
                            </button>
                            <button
                                id="btn-add-article"
                                onClick={() => navigate('/vendor/products/add')}
                                className="h-11 px-8 bg-slate-900 text-white hover:bg-slate-800 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-slate-200 flex items-center gap-3 group/btn border-none"
                            >
                                <Plus className="size-4" />
                                <span>Ajouter Article</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* KPI Area — High Density Monitor */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="premium-card p-6 flex flex-col justify-between group/kpi h-36">
                        <div className="size-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover/kpi:scale-110 transition-transform duration-500">
                            <Package className="size-5" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Articles Actifs</p>
                            <p className="text-2xl font-black text-slate-900 tracking-tighter tabular-nums" style={{ fontFamily: "'Outfit', sans-serif" }}>{products.length}</p>
                        </div>
                    </div>
                    <div className="premium-card p-6 flex flex-col justify-between group/kpi h-36">
                        <div className="size-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover/kpi:scale-110 transition-transform duration-500">
                            <TrendingUp className="size-5" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Valeur Stock</p>
                            <p className="text-2xl font-black text-emerald-500 tracking-tighter tabular-nums" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                {totalStockValue.toLocaleString('fr-GN')}
                                <span className="text-xs ml-1 opacity-50">GNF</span>
                            </p>
                        </div>
                    </div>
                    <div className="premium-card p-6 flex flex-col justify-between group/kpi h-36">
                        <div className="size-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 group-hover/kpi:scale-110 transition-transform duration-500">
                            <AlertCircle className="size-5 animate-pulse" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Alertes</p>
                            <p className="text-2xl font-black text-rose-500 tracking-tighter tabular-nums" style={{ fontFamily: "'Outfit', sans-serif" }}>{products.filter(p => p.stock_quantite <= 5).length}</p>
                        </div>
                    </div>
                </div>

                {/* Registry Management — Alpha Flux Registry */}
                <div className="premium-card !p-0 overflow-hidden">
                    <div className="p-6 border-b border-slate-50 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 xl:pb-0 custom-scrollbar">
                            {FILTERS.map(f => (
                                <button
                                    id={`filter-${f.key}`}
                                    key={f.key}
                                    onClick={() => setActiveFilter(f.key)}
                                    className={cn(
                                        "px-6 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap",
                                        activeFilter === f.key
                                            ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105"
                                            : "bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                                    )}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>

                        <div className="relative group w-full xl:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 size-4 group-focus-within:text-primary transition-all" />
                            <input
                                id="inventory-search"
                                className="w-full pl-12 pr-6 h-11 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold uppercase tracking-tight focus:ring-2 focus:ring-primary/20 outline-none transition-all text-slate-900"
                                placeholder="RECHERCHER UN ARTICLE..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-white/[0.02]">
                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Aperçu</th>
                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Produit</th>
                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Catégorie</th>
                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Prix</th>
                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Stock</th>
                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Évaluation</th>
                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    [1,2,3,4,5].map(i => (
                                        <tr key={i} className="animate-pulse border-b border-slate-50 dark:border-white/5">
                                            <td colSpan={7} className="p-8">
                                                <div className="h-10 bg-slate-100 dark:bg-white/5 rounded-2xl w-full" />
                                            </td>
                                        </tr>
                                    ))
                                ) : filtered.length > 0 ? (
                                    filtered.map(p => (
                                        <ProductCard 
                                            key={p.id} 
                                            product={p} 
                                            variant="row" 
                                            onEdit={(prod) => navigate(`/vendor/products/edit/${prod.id}`)}
                                            onDelete={(prod) => setDeleteConfirm(prod)}
                                        />
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="py-32 text-center">
                                            <div className="flex flex-col items-center gap-4 opacity-30">
                                                <ShoppingBag className="size-12 text-slate-400" />
                                                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Aucun produit trouvé</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal de Confirmation — Executive Security Design */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-3xl animate-in fade-in duration-500 font-jakarta">
                    <div className="bg-card group rounded-2xl border-4 border-rose-500/20 p-20 max-w-2xl w-full shadow-[0_0_100px_rgba(244,63,94,0.1)] animate-in zoom-in-95 duration-700 relative overflow-hidden">
                        <div className="absolute top-0 right-0 size-[30rem] bg-rose-500/[0.03] rounded-full blur-[150px] -mr-60 -mt-60 transition-transform group-hover:scale-150 duration-[10s]" />

                        <div className="size-6 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 border-2 border-rose-500/20 shadow-2xl mb-12 relative z-10 group-hover:rotate-12 transition-all duration-700">
                            <Trash2 className="size-6" />
                        </div>
                        <h3 className="text-sm font-black text-foreground uppercase tracking-tighter mb-6 underline decoration-rose-500/30 decoration-8 underline-offset-8 relative z-10">Confirmer la suppression</h3>
                        <p className="text-[13px] text-muted-foreground font-black mb-16 leading-loose uppercase  border-l-4 border-rose-500/40 pl-10 relative z-10">
                            Confirmer la suppression définitive de <span className="text-rose-500">"{deleteConfirm.nom_produit}"</span> ? <br /> 
                            Cette action est irréversible.
                        </p>

                        <div className="flex gap-3 relative z-10">
                            <button id="modal-cancel" onClick={() => setDeleteConfirm(null)} className="flex-1 h-12 rounded-2xl bg-foreground/5 border-2 border-foreground/5 text-muted-foreground text-[10px] font-black uppercase  hover:bg-foreground/10 hover:text-foreground transition-all ">Annuler</button>
                            <button id="modal-confirm" onClick={() => handleDelete(deleteConfirm)} className="flex-1 h-12 rounded-2xl bg-rose-500 text-foreground text-[10px] font-black uppercase  shadow-2xl shadow-rose-500/40 hover:bg-rose-600  transition-all flex items-center justify-center gap-3 group/confirm border-none">
                                <Trash2 className="size-6" />
                                Confirmer la suppression
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default Products;
