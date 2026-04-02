import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
    Plus, Search, Edit3, Trash2, Package, AlertCircle,
    TrendingUp, Eye, RefreshCw, CheckCircle2,
    XCircle, ChevronUp, ChevronDown, Filter, Zap,
    Activity, ArrowUpRight, ChevronRight, ShoppingBag,
    MoreVertical, Sparkles, Satellite, LayoutGrid
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import productService from '../../services/productService';
import { toast } from 'sonner';
import DataTable from '../../components/ui/DataTable';
import { TableRowSkeleton } from '../../components/ui/Loader';
import { Button } from '../../components/ui/Button';

// ── Stock Badge ─────────────────────────────────────────
const StockBadge = ({ qty }) => {
    if (qty === 0) return (
        <span className="inline-flex items-center gap-3 px-4 py-1.5 bg-rose-600/10 text-rose-500 text-[9px] font-black uppercase tracking-[0.3em] rounded-xl border-2 border-rose-500/20 italic shadow-lg shadow-rose-500/5">
            <div className="size-1.5 rounded-full bg-rose-500 animate-pulse" />
            RUPTURE
        </span>
    );
    if (qty <= 5) return (
        <span className="inline-flex items-center gap-3 px-4 py-1.5 bg-amber-500/10 text-amber-500 text-[9px] font-black uppercase tracking-[0.3em] rounded-xl border-2 border-amber-500/20 italic shadow-lg shadow-amber-500/5">
            <div className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
            CRITIQUE
        </span>
    );
    return (
        <span className="inline-flex items-center gap-3 px-4 py-1.5 bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-[0.3em] rounded-xl border-2 border-emerald-500/20 italic shadow-lg shadow-emerald-500/5">
            <div className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            OPTIMAL
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
            toast.success("INDEX STOCK MIS À JOUR.");
        } catch (e) {
            setValue(initialStock);
            toast.error("ÉCHEC DE LA MODIFICATION.");
        }
        finally { setIsSaving(false); setIsEditing(false); }
    };

    if (isEditing) {
        return (
            <div className="flex items-center gap-3 bg-white/[0.03] p-1.5 rounded-xl border-2 border-[#FF6600]/20">
                <input
                    type="number" min={0}
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && save()}
                    className="w-16 h-10 px-2 text-xs font-black text-center text-white bg-transparent outline-none italic"
                    autoFocus
                />
                <button onClick={save} disabled={isSaving} className="size-10 flex items-center justify-center rounded-lg bg-[#FF6600] text-white hover:scale-110 transition-all shadow-3xl">
                    <CheckCircle2 className="size-5" />
                </button>
                <button onClick={() => { setValue(initialStock); setIsEditing(false); }} className="size-10 flex items-center justify-center rounded-lg bg-white/5 text-slate-500 hover:text-white transition-all">
                    <XCircle className="size-5" />
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-4 group bg-white/[0.02] hover:bg-[#FF6600]/10 px-6 py-2.5 rounded-xl border-2 border-transparent hover:border-[#FF6600]/20 transition-all duration-700 shadow-inner group/stock"
        >
            <span className="text-sm font-black text-white uppercase tracking-tighter italic pt-0.5">{value}</span>
            <Edit3 className="size-4 text-slate-600 group-hover:text-[#FF6600] transition-colors" />
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
            toast.error("ÉCHEC DU CHARGEMENT DES PRODUITS.");
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
            toast.success("OBJET RÉVOQUÉ DE L'INVENTAIRE.");
        } catch {
            toast.error("IMPOSSIBLE DE SUPPRIMER LE PRODUIT.");
        } finally {
            setIsDeleting(false);
        }
    };

    const FILTERS = [
        { key: 'tous', label: 'FLUX GLOBAL' },
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
        <DashboardLayout title="CENTRE DE GESTION INVENTAIRE">
            <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-20">

                {/* Header Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-12 bg-white rounded-[4rem] p-12 md:p-16 border-x-[16px] border-[#FF6600] shadow-3xl group relative overflow-hidden">
                    <div className="absolute top-0 right-0 size-96 bg-[#FF6600]/10 rounded-full blur-[100px] -mr-48 -mt-48 transition-transform group-hover:scale-125 duration-[4s]" />

                    <div className="space-y-8 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="size-3 bg-[#FF6600] rounded-full animate-pulse" />
                            <span className="text-[10px] font-black text-[#FF6600] uppercase tracking-[0.4em] italic pt-0.5">CONTRÔLE QUANTIQUE INVENTAIRE</span>
                        </div>
                        <h2 className="text-6xl font-black text-black tracking-tighter leading-[0.8] uppercase italic">
                            MES <span className="text-[#FF6600] not-italic underline decoration-black/10 decoration-8 underline-offset-[-15px]">PRODUITS.</span>
                        </h2>
                    </div>
                    <div className="flex gap-6 relative z-10">
                        <button onClick={load} className="size-20 bg-black/5 border-4 border-black/5 rounded-[1.5rem] flex items-center justify-center text-slate-400 hover:text-[#FF6600] hover:border-black/10 transition-all duration-700 shadow-inner group/refresh">
                            <RefreshCw className={cn("size-8 group/refresh:rotate-180 transition-transform duration-700", isLoading && "animate-spin")} />
                        </button>
                        <button
                            onClick={() => navigate('/vendor/products/add')}
                            className="h-20 px-12 bg-black text-white hover:bg-[#FF6600] rounded-[1.5rem] font-black text-xs uppercase tracking-[0.4em] shadow-3xl transition-all duration-700 hover:scale-105 active:scale-95 italic group/btn relative overflow-hidden flex items-center gap-6"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_2s_infinite]" />
                            <Plus className="size-6 relative z-10" />
                            <span className="relative z-10 pt-1">NOUVEL ARTICLE</span>
                        </button>
                    </div>
                </div>

                {/* KPI Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div className="p-10 bg-white/[0.02] rounded-[4rem] border-4 border-white/5 shadow-3xl group relative overflow-hidden flex items-center gap-8 border-l-[16px] border-l-[#FF6600]">
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-[#FF6600]/20 group-hover:h-full transition-all duration-700 opacity-20 pointer-events-none" />
                        <div className="size-16 rounded-[1.5rem] bg-[#FF6600]/10 flex items-center justify-center text-[#FF6600] border-2 border-[#FF6600]/20 shadow-3xl group-hover:rotate-12 transition-transform duration-700 relative z-10">
                            <Package className="size-8" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-3 italic">ARTICLES INDEXÉS</p>
                            <p className="text-4xl font-black text-white uppercase italic tracking-tighter">{products.length}</p>
                        </div>
                    </div>
                    <div className="p-10 bg-white/[0.02] rounded-[4rem] border-4 border-white/5 shadow-3xl group relative overflow-hidden flex items-center gap-8 border-l-[16px] border-l-emerald-500">
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-emerald-500/20 group-hover:h-full transition-all duration-700 opacity-20 pointer-events-none" />
                        <div className="size-16 rounded-[1.5rem] bg-emerald-500/10 flex items-center justify-center text-emerald-500 border-2 border-emerald-500/20 shadow-3xl group-hover:rotate-12 transition-transform duration-700 relative z-10">
                            <TrendingUp className="size-8" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-3 italic">VALORISATION STOCK</p>
                            <p className="text-4xl font-black text-white uppercase italic tracking-tighter tabular-nums">{totalStockValue.toLocaleString('fr-GN')} <small className="text-xs opacity-40 font-black italic">GNF</small></p>
                        </div>
                    </div>
                    <div className="p-10 bg-white/[0.02] rounded-[4rem] border-4 border-white/5 shadow-3xl group relative overflow-hidden flex items-center gap-8 border-l-[16px] border-l-rose-500">
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-rose-500/20 group-hover:h-full transition-all duration-700 opacity-20 pointer-events-none" />
                        <div className="size-16 rounded-[1.5rem] bg-rose-500/10 flex items-center justify-center text-rose-500 border-2 border-rose-500/20 shadow-3xl group-hover:rotate-12 transition-transform duration-700 relative z-10">
                            <AlertCircle className="size-8" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-3 italic">ALERTES CRITIQUES</p>
                            <p className="text-4xl font-black text-white uppercase italic tracking-tighter">{products.filter(p => p.stock_quantite <= 5).length}</p>
                        </div>
                    </div>
                </div>

                {/* Table Surface */}
                <div className="bg-white/[0.01] border-4 border-white/5 rounded-[4rem] overflow-hidden shadow-3xl">
                    <div className="p-12 border-b-4 border-white/5 bg-white/[0.02] flex flex-col lg:flex-row lg:items-center justify-between gap-12">
                        <div className="flex items-center gap-6 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide py-2">
                            {FILTERS.map(f => (
                                <button
                                    key={f.key}
                                    onClick={() => setActiveFilter(f.key)}
                                    className={cn(
                                        "px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] italic transition-all duration-700 border-4",
                                        activeFilter === f.key
                                            ? "bg-[#FF6600] text-white border-[#FF6600] shadow-3xl scale-110"
                                            : "bg-white/5 border-transparent text-slate-600 hover:text-white"
                                    )}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>

                        <div className="relative group w-full lg:w-[32rem]">
                            <div className="absolute inset-0 bg-gradient-to-r from-[#FF6600]/20 to-transparent blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-1000" />
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 size-6 group-focus-within:text-[#FF6600] transition-all duration-700 relative z-10" />
                            <input
                                className="w-full pl-16 pr-8 h-16 bg-white/[0.03] border-4 border-white/5 group-focus-within:border-[#FF6600]/40 rounded-2xl text-sm font-black uppercase tracking-[0.2em] italic placeholder:text-slate-700 outline-none relative z-10 transition-all duration-700 text-white"
                                placeholder="RECHERCHER RÉFÉRENCE QUANTIQUE..."
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
                            className="bg-transparent"
                            columns={[
                                {
                                    label: 'DÉSIGNATION',
                                    render: (p) => (
                                        <div className="flex items-center gap-6 py-3 group/item">
                                            <div className="size-16 rounded-2xl bg-white/[0.03] border-4 border-white/5 flex items-center justify-center overflow-hidden shrink-0 group-hover/item:scale-110 group-hover/item:rotate-3 transition-all duration-700 shadow-2xl relative">
                                                <div className="absolute inset-0 bg-gradient-to-tr from-[#FF6600]/20 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                                {p.image_url ? <img src={p.image_url} className="w-full h-full object-cover relative z-10" alt="" /> : <Package className="size-8 text-slate-700" />}
                                            </div>
                                            <p className="text-sm font-black text-white uppercase tracking-tighter italic group-hover/item:text-[#FF6600] transition-colors duration-700">{p.nom_produit}</p>
                                        </div>
                                    )
                                },
                                {
                                    label: 'CATÉGORIE',
                                    render: (p) => <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] italic">{p.categorie?.nom_categorie?.toUpperCase() || 'CLASSIFIÉ'}</span>
                                },
                                {
                                    label: 'VALEUR UNITÉ',
                                    render: (p) => <span className="text-sm font-black text-white italic tracking-tighter tabular-nums uppercase">{parseFloat(p.prix_unitaire).toLocaleString('fr-GN')} <small className="text-[11px] font-black text-[#FF6600] non-italic">GNF</small></span>
                                },
                                {
                                    label: 'INDEX STOCK',
                                    render: (p) => <StockEditor productId={p.id} initialStock={p.stock_quantite} onUpdated={handleStockUpdated} />
                                },
                                {
                                    label: 'STATUT FLUX',
                                    render: (p) => <StockBadge qty={p.stock_quantite} />
                                },
                                {
                                    label: 'OPÉRATIONS',
                                    render: (p) => (
                                        <div className="flex items-center justify-end gap-4 pr-6">
                                            <button onClick={() => navigate(`/vendor/products/edit/${p.id}`)} className="p-3 text-slate-500 hover:text-[#FF6600] hover:bg-[#FF6600]/10 border-2 border-transparent hover:border-[#FF6600]/20 rounded-xl transition-all duration-700 group/edit">
                                                <Edit3 className="size-5 group-hover/edit:animate-pulse" />
                                            </button>
                                            <button onClick={() => setDeleteConfirm(p)} className="p-3 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 border-2 border-transparent hover:border-rose-500/20 rounded-xl transition-all duration-700 group/trash">
                                                <Trash2 className="size-5 group-hover/trash:animate-bounce" />
                                            </button>
                                        </div>
                                    )
                                }
                            ]}
                            data={filtered}
                        />

                        {!isLoading && filtered.length === 0 && (
                            <div className="py-40 text-center opacity-20 flex flex-col items-center gap-10">
                                <ShoppingBag className="size-24 animate-pulse text-slate-500" />
                                <p className="text-[12px] font-black uppercase tracking-[0.6em] italic">AUCUNE RÉFÉRENCE IDENTIFIÉE DANS CETTE SECTION</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de Confirmation Correction Styles */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/80 backdrop-blur-3xl animate-in fade-in duration-500">
                    <div className="bg-white group rounded-[4rem] border-x-[16px] border-rose-600 p-16 md:p-20 max-w-2xl w-full shadow-3xl animate-in zoom-in-95 duration-700 relative overflow-hidden">
                        <div className="absolute top-0 right-0 size-96 bg-rose-600/10 rounded-full blur-[100px] -mr-48 -mt-48 transition-transform group-hover:scale-125 duration-[4s]" />

                        <div className="size-24 rounded-[2rem] bg-rose-600/10 flex items-center justify-center text-rose-600 border-4 border-rose-600/20 shadow-3xl mb-12 relative z-10 group-hover:rotate-12 transition-transform duration-700">
                            <Trash2 className="size-12" />
                        </div>
                        <h3 className="text-5xl font-black text-black uppercase tracking-tighter italic mb-6 leading-none relative z-10">VÉRIFICATION <br /> DE DÉLÉTION</h3>
                        <p className="text-md text-slate-600 font-extrabold mb-16 leading-relaxed italic uppercase tracking-widest border-l-8 border-rose-600/20 pl-10 relative z-10">VOULEZ-VOUS RÉVOQUER <span className="text-rose-600">"{deleteConfirm.nom_produit?.toUpperCase()}"</span> ? <br /> CETTE OPÉRATION EST IRRÉVERSIBLE DANS L'INDEX RÉSEAU.</p>

                        <div className="flex gap-8 relative z-10">
                            <button onClick={() => setDeleteConfirm(null)} className="flex-1 h-20 rounded-2xl border-4 border-black text-black text-[11px] font-black uppercase tracking-[0.4em] italic hover:bg-black hover:text-white transition-all duration-700">CANCEL</button>
                            <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 h-20 rounded-2xl bg-rose-600 text-white text-[11px] font-black uppercase tracking-[0.4em] italic shadow-3xl shadow-rose-600/20 hover:scale-110 active:scale-95 transition-all duration-700 flex items-center justify-center gap-6 group/confirm">
                                <Trash2 className="size-6 group-confirm:animate-bounce" />
                                CONFIRM
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default Products;
