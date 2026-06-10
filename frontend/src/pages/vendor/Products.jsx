import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
    Plus, Search, Edit3, Trash2, Package, AlertCircle,
    TrendingUp, RefreshCw, CheckCircle2,
    XCircle, ShoppingBag
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import { useLanguage } from '../../context/useLanguage';
import ProductCard from '../../components/produits/ProductCard';
import { useVendorProducts, useUpdateStock, useDeleteProduct } from '../../hooks/data/useProductData';

// ── Stock Badge ─────────────────────────────────────────
const StockBadge = ({ qty, t }) => {
    if (qty === 0) return (
        <span className="inline-flex items-center gap-2 px-3 py-1 bg-rose-50 text-rose-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-rose-100">
            <div className="size-1.5 rounded-full bg-rose-500 animate-pulse" />
            {t('invStatusOut')}
        </span>
    );
    if (qty <= 5) return (
        <span className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-amber-100">
            <div className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
            {t('invStatusLow')}
        </span>
    );
    return (
        <span className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-emerald-100">
            <div className="size-1.5 rounded-full bg-emerald-500" />
            {t('invStock')}
        </span>
    );
};

// ── Stock Editor ─────────────────────────────────────────────
const StockEditor = ({ productId, initialStock }) => {
    const { t } = useLanguage();
    const [value, setValue] = useState(initialStock);
    const [isEditing, setIsEditing] = useState(false);
    
    const updateStockMutation = useUpdateStock();

    const save = () => {
        if (value === initialStock) { setIsEditing(false); return; }
        updateStockMutation.mutate({ id: productId, stock_quantite: parseInt(value) }, {
            onSuccess: () => setIsEditing(false)
        });
    };

    if (isEditing) {
        return (
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm animate-in zoom-in-95 duration-200">
                <input
                    type="number" min={0}
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && save()}
                    className="w-14 h-8 px-2 text-xs font-black text-center text-slate-900 dark:text-white bg-transparent outline-none"
                    autoFocus
                />
                <button 
                    onClick={save} 
                    disabled={updateStockMutation.isPending} 
                    className="size-8 flex items-center justify-center rounded-lg bg-primary text-white hover:bg-primary/90 transition-all border-none disabled:opacity-50"
                >
                    {updateStockMutation.isPending ? <RefreshCw className="size-3 animate-spin" /> : <CheckCircle2 className="size-4" />}
                </button>
                <button 
                    onClick={() => { setValue(initialStock); setIsEditing(false); }} 
                    className="size-8 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-slate-600 transition-all border-none"
                >
                    <XCircle className="size-4" />
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-3 group bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 px-4 py-2 rounded-xl border border-slate-100 dark:border-white/5 transition-all duration-300"
        >
            <span className="text-xs font-black text-slate-900 dark:text-white tabular-nums">{value}</span>
            <Edit3 className="size-3 text-slate-300 group-hover:text-primary transition-colors" />
        </button>
    );
};

const Products = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('tous');
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    // React Query Hooks
    const { data: products = [], isLoading, refetch } = useVendorProducts();
    const deleteMutation = useDeleteProduct();

    const handleDelete = async (product) => {
        deleteMutation.mutate(product.id, {
            onSuccess: () => setDeleteConfirm(null)
        });
    };

    const FILTERS = [
        { key: 'tous', label: t('all') },
        { key: 'en_stock', label: t('invStatusInStock') },
        { key: 'faible', label: t('invStatusLow') },
        { key: 'rupture', label: t('invStatusOut') },
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
        <DashboardLayout title={t('invTitle')} noPadding>
            <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0F1219] p-6 lg:p-8 space-y-8 custom-scrollbar">

                {/* Executive Command Bar — Inventory Node */}
                <div className="premium-card p-6 relative overflow-hidden group/header">
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="size-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-100 dark:border-amber-500/20 transition-all duration-700 group-hover:rotate-12 shadow-sm">
                                <Package className="size-6" />
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                    {t('invTitle')}
                                </h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                    {products.length} {t('referenced')} • {t('invSync')}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={() => refetch()} className="size-11 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl flex items-center justify-center text-slate-400 hover:text-primary transition-all group/refresh shadow-sm">
                                <RefreshCw className={cn("size-5 group-hover/refresh:rotate-180 transition-transform duration-1000", isLoading && "animate-spin")} />
                            </button>
                            <button
                                onClick={() => navigate('/vendor/products/add')}
                                className="h-11 px-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-slate-200 flex items-center gap-3 group/btn border-none"
                            >
                                <Plus className="size-4" />
                                <span>{t('invAdd')}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* KPI Area — High Density Monitor */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="premium-card p-6 flex flex-col justify-between group/kpi h-36">
                        <div className="size-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover/kpi:scale-110 transition-transform duration-500">
                            <Package className="size-5" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{t('invActive')}</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums" style={{ fontFamily: "'Outfit', sans-serif" }}>{products.length}</p>
                        </div>
                    </div>
                    <div className="premium-card p-6 flex flex-col justify-between group/kpi h-36">
                        <div className="size-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover/kpi:scale-110 transition-transform duration-500">
                            <TrendingUp className="size-5" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{t('invValue')}</p>
                            <p className="text-2xl font-black text-emerald-500 tracking-tighter tabular-nums" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                {totalStockValue.toLocaleString('fr-GN')}
                                <span className="text-xs ml-1 opacity-50">{t('gnf')}</span>
                            </p>
                        </div>
                    </div>
                    <div className="premium-card p-6 flex flex-col justify-between group/kpi h-36">
                        <div className="size-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-500 group-hover/kpi:scale-110 transition-transform duration-500">
                            <AlertCircle className="size-5 animate-pulse" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{t('invAlerts')}</p>
                            <p className="text-2xl font-black text-rose-500 tracking-tighter tabular-nums" style={{ fontFamily: "'Outfit', sans-serif" }}>{products.filter(p => p.stock_quantite <= 5).length}</p>
                        </div>
                    </div>
                </div>

                {/* Registry Management — Alpha Flux Registry */}
                <div className="premium-card !p-0 overflow-hidden">
                    <div className="p-6 border-b border-slate-50 dark:border-white/5 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 xl:pb-0 custom-scrollbar">
                            {FILTERS.map(f => (
                                <button
                                    key={f.key}
                                    onClick={() => setActiveFilter(f.key)}
                                    className={cn(
                                        "px-6 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap",
                                        activeFilter === f.key
                                            ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105"
                                            : "bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/10"
                                    )}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>

                        <div className="relative group w-full xl:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 size-4 group-focus-within:text-primary transition-all" />
                            <input
                                className="w-full pl-12 pr-6 h-11 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl text-xs font-bold uppercase tracking-tight focus:ring-2 focus:ring-primary/20 outline-none transition-all text-slate-900 dark:text-white"
                                placeholder={t('invSearch')}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-white/[0.02]">
                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{t('invPreview')}</th>
                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{t('invProduct')}</th>
                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{t('invCategory')}</th>
                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{t('invPrice')}</th>
                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{t('invStock')}</th>
                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{t('invReview')}</th>
                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">{t('invActions')}</th>
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
                                            customStockEditor={<StockEditor productId={p.id} initialStock={p.stock_quantite} />}
                                        />
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="py-32 text-center">
                                            <div className="flex flex-col items-center gap-4 opacity-30">
                                                <ShoppingBag className="size-12 text-slate-400" />
                                                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">{t('invNoProduct')}</p>
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-3xl animate-in fade-in duration-500">
                    <div className="bg-white dark:bg-[#0F1219] group rounded-3xl border border-slate-200 dark:border-white/5 p-12 max-w-xl w-full shadow-2xl animate-in zoom-in-95 duration-500 relative overflow-hidden">
                        <div className="absolute top-0 right-0 size-64 bg-rose-500/[0.03] rounded-full blur-[100px] -mr-32 -mt-32" />

                        <div className="size-14 rounded-2xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-100 dark:border-rose-500/20 shadow-sm mb-8">
                            <Trash2 className="size-6" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">{t('invDeleteTitle')}</h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-bold mb-10 leading-relaxed uppercase tracking-widest">
                            {t('invDeleteDesc', { name: deleteConfirm.nom_produit })}
                        </p>

                        <div className="flex gap-4">
                            <button onClick={() => setDeleteConfirm(null)} className="flex-1 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all border-none">{t('invCancel')}</button>
                            <button 
                                onClick={() => handleDelete(deleteConfirm)} 
                                disabled={deleteMutation.isPending}
                                className="flex-1 h-12 rounded-2xl bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-rose-500/20 hover:bg-rose-600 transition-all flex items-center justify-center gap-3 border-none disabled:opacity-50"
                            >
                                {deleteMutation.isPending ? <RefreshCw className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                                {t('invConfirm')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default Products;
