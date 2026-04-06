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

// ── Stock Badge ─────────────────────────────────────────
const StockBadge = ({ qty }) => {
    if (qty === 0) return (
        <span className="inline-flex items-center gap-3 px-4 py-2 bg-rose-500/10 text-rose-500 text-[9px] font-black uppercase  rounded-[1rem] border-none shadow-inner">
            <div className="size-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
            RUPTURE_FLUX
        </span>
    );
    if (qty <= 5) return (
        <span className="inline-flex items-center gap-3 px-4 py-2 bg-amber-500/10 text-amber-500 text-[9px] font-black uppercase  rounded-[1rem] border-none shadow-inner">
            <div className="size-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
            CRITIQUE_NODE
        </span>
    );
    return (
        <span className="inline-flex items-center gap-3 px-4 py-2 bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase  rounded-[1rem] border-none shadow-inner">
            <div className="size-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            OPTIMAL_SIG
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
            toast.success("INDEX_STOCK_MIS_À_JOUR_ALPHA.");
        } catch (e) {
            setValue(initialStock);
            toast.error("ÉCHEC_MODIFICATION_INDEX.");
        }
        finally { setIsSaving(false); setIsEditing(false); }
    };

    if (isEditing) {
        return (
            <div className="flex items-center gap-3 bg-white/[0.03] p-2 rounded-2xl border border-[#FFB703]/40 shadow-4xl animate-in zoom-in-95 duration-500">
                <input
                    type="number" min={0}
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && save()}
                    className="w-16 h-10 px-2 text-[12px] font-black text-center text-foreground bg-transparent outline-none border-b border-foreground/10"
                    autoFocus
                />
                <button id={`save-stock-${productId}`} onClick={save} disabled={isSaving} className="size-6 flex items-center justify-center rounded-xl bg-[#FFB703] text-background hover:bg-white transition-all shadow-xl  border-none">
                    <CheckCircle2 className="size-5" />
                </button>
                <button id={`cancel-stock-${productId}`} onClick={() => { setValue(initialStock); setIsEditing(false); }} className="size-6 flex items-center justify-center rounded-xl bg-foreground/5 text-muted-foreground hover:text-foreground transition-all border-none">
                    <XCircle className="size-5" />
                </button>
            </div>
        );
    }

    return (
        <button
            id={`edit-stock-${productId}`}
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-3 group bg-white/[0.02] hover:bg-[#FFB703]/10 px-6 py-3 rounded-2xl border-none transition-all duration-700 shadow-inner group/stock"
        >
            <span className="text-[13px] font-black text-foreground uppercase tracking-tighter tabular-nums">{value}</span>
            <Edit3 className="size-4 text-muted-foreground group-hover:text-[#FFB703] transition-colors" />
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
            toast.error("ÉCHEC_CHARGEMENT_INVENTAIRE_RÉSEAU.");
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
            toast.success("OBJET_RÉVOQUÉ_INVENTAIRE_SCELLÉ.");
        } catch {
            toast.error("IMPOSSIBLE_RÉVOCATION_ARTICLE.");
        } finally {
            setIsDeleting(false);
        }
    };

    const FILTERS = [
        { key: 'tous', label: 'GLOBAL' },
        { key: 'en_stock', label: 'INDEXÉ' },
        { key: 'faible', label: 'CRITIQUE' },
        { key: 'rupture', label: 'RUPTURE' },
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
        <DashboardLayout title="TERMINAL_INVENTAIRE_ALPHA">
            <div className="space-y-6 animate-in fade-in duration-1000 pb-40 font-jakarta">

                {/* Executive Command Bar — Inventory Node */}
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 executive-card !py-8 bg-card border-[#FFB703]/20 relative overflow-hidden group/header shadow-4xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#FFB703]/5 via-transparent to-transparent opacity-0 group-hover/header:opacity-100 transition-opacity duration-1000" />
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="size-6 rounded-2xl bg-[#FFB703]/10 flex items-center justify-center text-[#FFB703] border-2 border-[#FFB703]/20 transition-all duration-700 group-hover/header:rotate-12 group-hover/header:scale-110 shadow-2xl shadow-[#FFB703]/20">
                            <Package className="size-6" />
                        </div>
                        <div className="space-y-3">
                            <h2 className="text-sm font-black text-foreground uppercase tracking-tighter leading-none">
                                INVENTAIRE_<span className="text-[#FFB703]">RÉSEAU</span>
                            </h2>
                            <p className="text-[10px] font-black text-muted-foreground uppercase  opacity-80 decoration-[#FFB703]/30 underline underline-offset-8 decoration-2">
                                {products.length} RÉFÉRENCES_INDEXÉES — SYNC_TERMINAL_{new Date().toLocaleTimeString('fr-GN', { hour: '2-digit', minute: '2-digit' })}_SIG
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 relative z-10">
                        <button id="btn-refresh-inventory" onClick={load} className="size-6 bg-white/[0.03] border-2 border-foreground/5 rounded-2xl flex items-center justify-center text-muted-foreground hover:text-[#FFB703] hover:border-[#FFB703]/20 transition-all group/refresh shadow-inner ">
                            <RefreshCw className={cn("size-5 group-hover/refresh:rotate-180 transition-transform duration-1000", isLoading && "animate-spin")} />
                        </button>
                        <button
                            id="btn-add-article"
                            onClick={() => navigate('/vendor/products/add')}
                            className="h-12 px-10 bg-[#FFB703] text-background hover:bg-white rounded-2xl font-black text-[10px] uppercase  transition-all shadow-[0_20px_50px_rgba(255,183,3,0.3)]  flex items-center gap-3 group/btn relative overflow-hidden border-none"
                        >
                            <Plus className="size-6 relative z-10" />
                            <span className="relative z-10 pt-1">INDEXER_NOUVEL_ARTICLE</span>
                        </button>
                    </div>
                </div>

                {/* KPI Area — High Density Monitor */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="executive-card h-44 flex flex-col justify-between group/kpi border-foreground/5 hover:border-[#FFB703]/30 transition-all duration-700">
                        <div className="p-4 rounded-xl bg-white/[0.03] border border-foreground/5 text-[#FFB703] w-fit group-hover/kpi:rotate-12 group-hover/kpi:scale-110 transition-all duration-700 shadow-inner">
                            <Package className="size-5" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-muted-foreground uppercase  opacity-60 leading-none">ARTICLES_ACTIFS_CORE</p>
                            <p className="text-sm font-black text-foreground tracking-tighter uppercase leading-none truncate group-hover/kpi:translate-x-3 transition-transform duration-700">{products.length.toString()}</p>
                        </div>
                    </div>
                    <div className="executive-card h-44 flex flex-col justify-between group/kpi border-foreground/5 hover:border-[#FFB703]/30 transition-all duration-700">
                        <div className="p-4 rounded-xl bg-white/[0.03] border border-foreground/5 text-[#FFB703] w-fit group-hover/kpi:rotate-12 group-hover/kpi:scale-110 transition-all duration-700 shadow-inner">
                            <TrendingUp className="size-5" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-muted-foreground uppercase  opacity-60 leading-none">VALORISATION_STOCK_ALPHA</p>
                            <p className="text-sm font-black text-foreground tracking-tighter uppercase leading-none truncate group-hover/kpi:translate-x-3 transition-transform duration-700">{totalStockValue.toLocaleString('fr-GN')} <small className="text-sm">GNF</small></p>
                        </div>
                    </div>
                    <div className="executive-card h-44 flex flex-col justify-between group/kpi border-foreground/5 hover:border-rose-500/30 transition-all duration-700">
                        <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10 text-rose-500 w-fit group-hover/kpi:rotate-12 group-hover/kpi:scale-110 transition-all duration-700 shadow-inner scale-110">
                            <AlertCircle className="size-5 animate-pulse" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-muted-foreground uppercase  opacity-60 leading-none">ALERTES_CRITIQUES_NODE</p>
                            <p className="text-sm font-black text-rose-500 tracking-tighter uppercase leading-none truncate group-hover/kpi:translate-x-3 transition-transform duration-700">{products.filter(p => p.stock_quantite <= 5).length.toString()}</p>
                        </div>
                    </div>
                </div>

                {/* Registry Management — Alpha Flux Registry */}
                <div className="executive-card !p-0 overflow-hidden shadow-4xl group/registry border-foreground/5 hover:border-[#FFB703]/20 transition-all duration-1000">
                    <div className="p-4 border-b border-foreground/5 bg-white/[0.01] flex flex-col xl:flex-row xl:items-center justify-between gap-3">
                        <div className="flex items-center gap-4 overflow-x-auto pb-4 xl:pb-0 scrollbar-hide">
                            {FILTERS.map(f => (
                                <button
                                    id={`filter-${f.key}`}
                                    key={f.key}
                                    onClick={() => setActiveFilter(f.key)}
                                    className={cn(
                                        "px-8 h-12 rounded-2xl text-[10px] font-black uppercase  transition-all duration-500 border-2  font-jakarta",
                                        activeFilter === f.key
                                            ? "bg-[#FFB703] text-background border-[#FFB703] shadow-2xl scale-105"
                                            : "bg-foreground/5 border-foreground/5 text-muted-foreground hover:text-foreground hover:bg-white/[0.08]"
                                    )}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>

                        <div className="relative group w-full xl:w-[35rem] font-jakarta">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground size-6 group-focus-within:text-[#FFB703] transition-all relative z-10" />
                            <input
                                id="inventory-search"
                                className="w-full pl-16 pr-8 h-11 bg-white/[0.03] border-2 border-foreground/5 group-focus-within:border-[#FFB703]/40 rounded-2xl text-[12px] font-black  placeholder:text-slate-600 outline-none relative z-10 transition-all text-foreground uppercase"
                                placeholder="RECHERCHER_RÉFÉRENCE_INDEX..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="p-4">
                        <DataTable
                            selectable
                            selectedIds={selectedIds}
                            onSelectionChange={setSelectedIds}
                            isLoading={isLoading}
                            className="bg-transparent border-0 text-foreground"
                            columns={[
                                {
                                    label: 'DÉSIGNATION_TECHNIQUE',
                                    render: (p) => (
                                        <div className="flex items-center gap-3 py-4 group/item">
                                            <div className="size-6 rounded-2xl bg-foreground/5 border-2 border-foreground/10 flex items-center justify-center overflow-hidden shrink-0 group-hover/item:scale-110 group-hover/item:rotate-6 transition-all shadow-2xl relative">
                                                <div className="absolute inset-0 bg-gradient-to-tr from-[#FFB703]/30 via-transparent to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-700" />
                                                {p.image_url ? <img src={p.image_url} className="w-full h-full object-cover relative z-10" alt="" /> : <Package className="size-6 text-slate-700" />}
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[14px] font-black text-foreground uppercase tracking-tighter group-hover/item:text-[#FFB703] transition-colors truncate max-w-[250px] leading-none">{p.nom_produit}</p>
                                                <p className="text-[9px] font-black text-slate-600 uppercase  leading-none">NODE_ID: {p.id.slice(0,8)}</p>
                                            </div>
                                        </div>
                                    )
                                },
                                {
                                    label: 'NOMENCLATURE',
                                    render: (p) => <span className="text-[10px] font-black text-muted-foreground uppercase  font-jakarta">{p.categorie?.nom_categorie?.toUpperCase() || 'ALPHA_CLASSIFIED'}</span>
                                },
                                {
                                    label: 'VALEUR_UNITÉ',
                                    render: (p) => <span className="text-[14px] font-black text-foreground tracking-tighter tabular-nums uppercase font-jakarta">{parseFloat(p.prix_unitaire).toLocaleString('fr-GN')} <small className="text-[10px] font-black text-[#FFB703] tracking-widest ml-1">GNF</small></span>
                                },
                                {
                                    label: 'STOCK_RÉEL_INDEX',
                                    render: (p) => <StockEditor productId={p.id} initialStock={p.stock_quantite} onUpdated={handleStockUpdated} />
                                },
                                {
                                    label: 'STATUT_SYNC',
                                    render: (p) => <StockBadge qty={p.stock_quantite} />
                                },
                                {
                                    label: 'GOUVERNANCE_TERMINAL',
                                    render: (p) => (
                                        <div className="flex items-center justify-end gap-3 pr-8">
                                            <button id={`edit-p-${p.id}`} onClick={() => navigate(`/vendor/products/edit/${p.id}`)} className="size-6 flex items-center justify-center text-muted-foreground hover:text-foreground bg-foreground/5 border-2 border-foreground/5 rounded-2xl transition-all group/edit hover:border-[#FFB703]/30 ">
                                                <Edit3 className="size-5 group-hover/edit:scale-110 transition-transform" />
                                            </button>
                                            <button id={`delete-p-${p.id}`} onClick={() => setDeleteConfirm(p)} className="size-6 flex items-center justify-center text-muted-foreground hover:text-rose-500 bg-foreground/5 border-2 border-foreground/5 rounded-2xl transition-all group/trash hover:border-rose-500/30 ">
                                                <Trash2 className="size-5 group-hover/trash:scale-110 transition-transform" />
                                            </button>
                                        </div>
                                    )
                                }
                            ]}
                            data={filtered}
                        />

                        {!isLoading && filtered.length === 0 && (
                            <div className="py-24 text-center opacity-40 flex flex-col items-center gap-3">
                                <div className="relative">
                                    <ShoppingBag className="size-6 text-slate-800 animate-pulse" />
                                    <Satellite className="absolute -top-4 -right-4 size-6 text-[#FFB703] animate-bounce" />
                                </div>
                                <p className="text-[12px] font-black uppercase  text-foreground">AUCUNE_RÉFÉRENCE_IDENTIFIÉE_ALPHA</p>
                                <button onClick={load} className="text-[#FFB703] text-[10px] font-black uppercase  border-b-2 border-[#FFB703]/20 pb-2 hover:border-[#FFB703] transition-all">RESCANNER_TERMINAL</button>
                            </div>
                        )}
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
                        <h3 className="text-sm font-black text-foreground uppercase tracking-tighter mb-6 underline decoration-rose-500/30 decoration-8 underline-offset-8 relative z-10">VÉRIFICATION_ALPHA_SÉCURITÉ</h3>
                        <p className="text-[13px] text-muted-foreground font-black mb-16 leading-loose uppercase  border-l-4 border-rose-500/40 pl-10 relative z-10">
                            CONFIRMER LA RÉVOCATION DÉFINITIVE DE <span className="text-rose-500">"{deleteConfirm.nom_produit?.toUpperCase()}"</span> ? <br /> 
                            L'OPÉRATION EST IRRÉVERSIBLE DANS L'ARCHIVE RÉSEAU_BCA.
                        </p>

                        <div className="flex gap-3 relative z-10">
                            <button id="modal-cancel" onClick={() => setDeleteConfirm(null)} className="flex-1 h-12 rounded-2xl bg-foreground/5 border-2 border-foreground/5 text-muted-foreground text-[10px] font-black uppercase  hover:bg-foreground/10 hover:text-foreground transition-all ">ANNULER_PROCÉDURE</button>
                            <button id="modal-confirm" onClick={() => handleDelete(deleteConfirm)} className="flex-1 h-12 rounded-2xl bg-rose-500 text-foreground text-[10px] font-black uppercase  shadow-2xl shadow-rose-500/40 hover:bg-rose-600  transition-all flex items-center justify-center gap-3 group/confirm border-none">
                                <Trash2 className="size-6" />
                                VALIDATION_RÉVOCATION_ALPHA
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default Products;
