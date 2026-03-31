import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
    Plus, Search, Edit3, Trash2, Package, AlertCircle,
    TrendingUp, Eye, RefreshCw, CheckCircle2,
    XCircle, ChevronUp, ChevronDown, Filter, Zap,
    Activity, ArrowUpRight, ChevronRight
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import productService from '../../services/productService';
import { toast } from 'sonner';
import DataTable from '../../components/ui/DataTable';
import { calculateRevenueAtRisk, formatGrowthCurrency } from '../../lib/GrowthMetrics';

// ── Executive Stock Badge ─────────────────────────────────────────
const StockBadge = ({ qty }) => {
    if (qty === 0) return (
        <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-rose-500/10 text-rose-500 text-[9px] font-black uppercase tracking-widest italic rounded-full border-2 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]">
            <span className="size-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" /> Rupture Immédiate
        </span>
    );
    if (qty <= 5) return (
        <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 text-amber-500 text-[9px] font-black uppercase tracking-widest italic rounded-full border-2 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
            <span className="size-1.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.6)]" /> Stock Critique
        </span>
    );
    return (
        <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-widest italic rounded-full border-2 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            <span className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" /> Flux Optimal
        </span>
    );
};

// ── Executive Stock Editor ─────────────────────────────────────────────
const StockEditor = ({ productId, initialStock, onUpdated }) => {
    const [value, setValue] = useState(initialStock);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const save = async () => {
        if (value === initialStock) { setIsEditing(false); return; }
        setIsSaving(true);
        try {
            await productService.patchStock(productId, parseInt(value));
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
            onUpdated(productId, parseInt(value));
            toast.success("Inventaire rectifié.");
        } catch (e) { 
            setValue(initialStock);
            toast.error("Échec de la mise à jour.");
        }
        finally { setIsSaving(false); setIsEditing(false); }
    };

    if (isEditing) {
        return (
            <div className="flex items-center gap-2">
                <input
                    type="number" min={0}
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && save()}
                    className="w-20 h-10 px-3 text-sm font-bold text-center border border-primary rounded-lg bg-background outline-none"
                    autoFocus
                />
                <button onClick={save} disabled={isSaving} className="size-10 flex items-center justify-center rounded-lg bg-primary text-white hover:bg-primary/90 transition-all">
                    <CheckCircle2 className="size-4" />
                </button>
                <button onClick={() => { setValue(initialStock); setIsEditing(false); }} className="size-10 flex items-center justify-center rounded-lg bg-accent border border-border text-muted-foreground hover:text-rose-500 transition-all">
                    <XCircle className="size-4" />
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 group hover:bg-accent/50 px-3 py-1.5 rounded-lg border border-transparent hover:border-border transition-all"
        >
            <span className="text-sm font-bold text-foreground">{value}</span>
            <Edit3 className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
        </button>
    );
};

// ── Main Controller ─────────────────────────────────────────────────────
const Products = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('tous');
    const [sortBy, setSortBy] = useState({ key: 'createdAt', dir: 'desc' });
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);

    const load = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await productService.getMyProducts();
            setProducts(data);
        } catch (err) {
            toast.error("Échec de la synchronisation.");
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
            toast.success("Référence révoquée.");
        } catch {
            toast.error("Échec de la révocation.");
        } finally {
            setIsDeleting(false);
        }
    };

    const FILTERS = [
        { key: 'tous', label: 'Global', count: products.length },
        { key: 'en_stock', label: 'Optimisés', count: products.filter(p => p.stock_quantite > 5).length },
        { key: 'faible', label: 'Critiques', count: products.filter(p => p.stock_quantite > 0 && p.stock_quantite <= 5).length },
        { key: 'rupture', label: 'Ruptures', count: products.filter(p => p.stock_quantite === 0).length },
    ];

    const sorted = [...products].sort((a, b) => {
        const dir = sortBy.dir === 'asc' ? 1 : -1;
        if (sortBy.key === 'prix_unitaire') return (parseFloat(a.prix_unitaire) - parseFloat(b.prix_unitaire)) * dir;
        if (sortBy.key === 'stock_quantite') return (a.stock_quantite - b.stock_quantite) * dir;
        return dir;
    });

    const filtered = sorted.filter(p => {
        const matchSearch = p.nom_produit?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchFilter =
            activeFilter === 'tous' ? true :
                activeFilter === 'en_stock' ? p.stock_quantite > 5 :
                    activeFilter === 'faible' ? (p.stock_quantite > 0 && p.stock_quantite <= 5) :
                        p.stock_quantite === 0;
        return matchSearch && matchFilter;
    });

    const totalStockValue = products.reduce((acc, p) => acc + parseFloat(p.prix_unitaire) * p.stock_quantite, 0);
    const outOfStock = products.filter(p => p.stock_quantite === 0).length;
    const lowStock = products.filter(p => p.stock_quantite > 0 && p.stock_quantite <= 5).length;
    const totalRevenueAtRisk = products.reduce((acc, p) => acc + calculateRevenueAtRisk(p), 0);

    const SortBtn = ({ col }) => (
        <button onClick={() => setSortBy(s => ({ key: col, dir: s.key === col && s.dir === 'asc' ? 'desc' : 'asc' }))}
            className="ml-1 opacity-40 hover:opacity-100">
            {sortBy.key === col
                ? sortBy.dir === 'asc' ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />
                : <ChevronDown className="size-3" />}
        </button>
    );

    return (
        <DashboardLayout title="GESTION DES STOCKS">
            <div className="space-y-8 p-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="size-2 bg-primary rounded-full" />
                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Inventaire Actif</span>
                        </div>
                        <h2 className="text-4xl font-black text-foreground tracking-tight uppercase">Registre <span className="text-primary">Produits.</span></h2>
                        <p className="text-muted-foreground text-sm">Gestion centralisée des actifs marchands et surveillance des niveaux de stock.</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={load} className="h-12 w-12 bg-background border border-border rounded-xl flex items-center justify-center text-muted-foreground hover:text-primary transition-all">
                            <RefreshCw className="size-5" />
                        </button>
                        <button onClick={() => navigate('/vendor/products/add')} className="h-12 px-6 bg-primary text-white rounded-xl font-bold uppercase text-[10px] flex items-center gap-3 hover:bg-primary/90 transition-all">
                            <Plus className="size-4" /> Nouvel Actif
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                        { label: 'Catalogue Global', val: products.length, icon: Package, color: 'text-primary' },
                        { label: 'Valorisation', val: `${totalStockValue.toLocaleString()} GNF`, icon: TrendingUp, color: 'text-emerald-500' },
                        { label: 'Revenue at Risk', val: formatGrowthCurrency(totalRevenueAtRisk), icon: AlertCircle, color: 'text-rose-500' },
                        { label: 'Ruptures', val: outOfStock, icon: XCircle, color: 'text-rose-500' },
                    ].map((kpi, i) => (
                        <div key={i} className="p-6 rounded-2xl border border-border bg-card flex flex-col justify-between h-32">
                            <div className="flex justify-between items-start">
                                <kpi.icon className={`size-5 ${kpi.color}`} />
                                <Zap className="size-3 text-muted-foreground/20" />
                            </div>
                            <div>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{kpi.label}</p>
                                <p className="text-2xl font-black tracking-tight">{kpi.val}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col xl:flex-row gap-6 items-stretch xl:items-center justify-between relative">
                    <div className="relative flex-1 max-w-xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/30 size-4" />
                        <input
                            className="w-full h-12 pl-12 pr-4 bg-background border border-border rounded-xl text-xs font-bold uppercase tracking-widest placeholder:text-muted-foreground/20 outline-none focus:border-primary transition-all"
                            placeholder="RECHERCHER RÉFÉRENCE..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    {/* Bulk Actions Bar */}
                    {selectedIds.length > 0 && (
                        <div className="flex items-center gap-3 animate-in slide-in-from-right-4 duration-300">
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mr-2">{selectedIds.length} SÉLECTIONNÉS</span>
                            <button className="h-10 px-4 bg-primary/10 text-primary rounded-lg text-[9px] font-black uppercase tracking-widest border border-primary/20 hover:bg-primary hover:text-white transition-all flex items-center gap-2">
                                <Edit3 className="size-3" /> Mass Edit
                            </button>
                            <button 
                                onClick={() => setDeleteConfirm(filtered.find(p => p.id === selectedIds[0]))}
                                className="h-10 px-4 bg-rose-500/10 text-rose-500 rounded-lg text-[9px] font-black uppercase tracking-widest border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all flex items-center gap-2">
                                <Trash2 className="size-3" /> Delete All
                            </button>
                        </div>
                    )}

                    <div className="flex items-center gap-2 bg-accent/30 p-1 rounded-xl border border-border">
                        {FILTERS.map(f => (
                            <button
                                key={f.key}
                                onClick={() => setActiveFilter(f.key)}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                                    activeFilter === f.key ? "bg-white dark:bg-white/10 text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {f.label} ({f.count})
                            </button>
                        ))}
                    </div>
                </div>

                <DataTable 
                    selectable
                    selectedIds={selectedIds}
                    onSelectionChange={setSelectedIds}
                    columns={[
                        {
                            label: 'Désignation',
                            render: (p) => (
                                <div className="flex items-center gap-4">
                                    <div className="size-10 rounded-lg bg-accent border border-border flex items-center justify-center overflow-hidden shrink-0">
                                        {p.image_url ? <img src={p.image_url} className="w-full h-full object-cover" alt="" /> : <Package className="size-4 text-muted-foreground/30" />}
                                    </div>
                                    <p className="text-xs font-bold text-foreground leading-tight">{p.nom_produit}</p>
                                </div>
                            )
                        },
                        {
                            label: 'Catégorie',
                            render: (p) => <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">{p.categorie?.nom_categorie || 'N/A'}</span>
                        },
                        {
                            label: 'Prix Unitaire',
                            render: (p) => <span className="text-xs font-black italic tracking-tighter">{parseFloat(p.prix_unitaire).toLocaleString()} GNF</span>
                        },
                        {
                            label: 'Volume Stock',
                            render: (p) => <StockEditor productId={p.id} initialStock={p.stock_quantite} onUpdated={handleStockUpdated} />
                        },
                        {
                            label: 'Impact Financier',
                            render: (p) => {
                                const risk = calculateRevenueAtRisk(p);
                                if (risk > 0) return (
                                    <span className="text-[10px] font-black text-rose-500 bg-rose-500/5 px-2 py-1 rounded-md border border-rose-500/10 animate-pulse">
                                        -{formatGrowthCurrency(risk)} RISQUE
                                    </span>
                                );
                                return <span className="text-[10px] font-bold text-emerald-500/40 uppercase tracking-widest">SÉCURISÉ</span>;
                            }
                        },
                        {
                            label: 'Certification État',
                            render: (p) => <StockBadge qty={p.stock_quantite} />
                        },
                        {
                            label: 'Actions',
                            render: (p) => (
                                <div className="flex items-center justify-end gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => navigate(`/vendor/products/edit/${p.id}`)} className="p-2 text-muted-foreground hover:text-primary transition-colors"><Edit3 className="size-4" /></button>
                                    <button onClick={() => setDeleteConfirm(p)} className="p-2 text-muted-foreground hover:text-rose-500 transition-colors"><Trash2 className="size-4" /></button>
                                    <button className="p-2 text-muted-foreground hover:text-primary transition-colors"><ChevronRight className="size-4" /></button>
                                </div>
                            )
                        }
                    ]}
                    data={filtered}
                />
            </div>

            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm">
                    <div className="bg-card border border-border p-8 rounded-2xl max-w-sm w-full shadow-xl">
                        <h3 className="text-lg font-black uppercase mb-4">Révocation</h3>
                        <p className="text-sm text-muted-foreground mb-8">Voulez-vous supprimer "{deleteConfirm.nom_produit}" ? Cette action est irréversible.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm(null)} className="flex-1 h-10 rounded-lg border border-border text-[10px] font-bold uppercase">Annuler</button>
                            <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 h-10 rounded-lg bg-rose-500 text-white text-[10px] font-bold uppercase">Confirmer</button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default Products;
