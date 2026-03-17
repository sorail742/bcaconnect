import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
    Plus, Search, Edit3, Trash2, Package, AlertCircle,
    TrendingUp, Eye, MoreVertical, RefreshCw, CheckCircle2,
    XCircle, ChevronUp, ChevronDown, Filter, Download, Zap
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import productService from '../../services/productService';

// ── Composant Badge de statut stock ─────────────────────────────────────────
const StockBadge = ({ qty }) => {
    if (qty === 0) return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[9px] font-black uppercase tracking-widest rounded-full border border-red-200 dark:border-red-800">
            <span className="size-1.5 rounded-full bg-red-500" /> Rupture
        </span>
    );
    if (qty <= 5) return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-[9px] font-black uppercase tracking-widest rounded-full border border-amber-200 dark:border-amber-800">
            <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" /> Stock faible
        </span>
    );
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase tracking-widest rounded-full border border-emerald-200 dark:border-emerald-800">
            <span className="size-1.5 rounded-full bg-emerald-500" /> En stock
        </span>
    );
};

// ── Composant Inline Stock Editor ─────────────────────────────────────────────
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
        } catch (e) { setValue(initialStock); }
        finally { setIsSaving(false); setIsEditing(false); }
    };

    if (isEditing) {
        return (
            <div className="flex items-center gap-1">
                <input
                    type="number" min={0}
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && save()}
                    className="w-20 px-2 py-1 text-xs font-black text-center border-2 border-primary rounded-lg bg-card focus:outline-none"
                    autoFocus
                />
                <button onClick={save} disabled={isSaving} className="size-6 flex items-center justify-center rounded-lg bg-emerald-500 text-white hover:bg-emerald-600">
                    <CheckCircle2 className="size-3.5" />
                </button>
                <button onClick={() => { setValue(initialStock); setIsEditing(false); }} className="size-6 flex items-center justify-center rounded-lg bg-muted text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                    <XCircle className="size-3.5" />
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => setIsEditing(true)}
            className={cn("flex items-center gap-2 group hover:bg-muted px-2 py-1 rounded-lg transition-all", saved && "bg-emerald-50 dark:bg-emerald-900/20")}
        >
            {saved ? <CheckCircle2 className="size-3 text-emerald-500" /> : null}
            <span className="text-sm font-black italic">{value}</span>
            <span className="text-[9px] text-muted-foreground font-medium">unités</span>
            <Edit3 className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
    );
};

// ── Composant Principal ─────────────────────────────────────────────────────
const Products = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('tous');
    const [sortBy, setSortBy] = useState({ key: 'createdAt', dir: 'desc' });
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const load = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await productService.getMyProducts();
            setProducts(data);
        } catch (err) {
            console.error('Erreur chargement:', err);
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
        } catch {
            alert('Erreur lors de la suppression.');
        } finally {
            setIsDeleting(false);
        }
    };

    const FILTERS = [
        { key: 'tous', label: 'Tous', count: products.length },
        { key: 'en_stock', label: 'En stock', count: products.filter(p => p.stock_quantite > 5).length },
        { key: 'faible', label: 'Stock faible', count: products.filter(p => p.stock_quantite > 0 && p.stock_quantite <= 5).length },
        { key: 'rupture', label: 'Rupture', count: products.filter(p => p.stock_quantite === 0).length },
    ];

    const sorted = [...products].sort((a, b) => {
        const dir = sortBy.dir === 'asc' ? 1 : -1;
        if (sortBy.key === 'prix_unitaire') return (parseFloat(a.prix_unitaire) - parseFloat(b.prix_unitaire)) * dir;
        if (sortBy.key === 'stock_quantite') return (a.stock_quantite - b.stock_quantite) * dir;
        return dir; // createdAt — keep API order by default
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

    const SortBtn = ({ col }) => (
        <button onClick={() => setSortBy(s => ({ key: col, dir: s.key === col && s.dir === 'asc' ? 'desc' : 'asc' }))}
            className="ml-1 opacity-40 hover:opacity-100 transition-opacity">
            {sortBy.key === col
                ? sortBy.dir === 'asc' ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />
                : <ChevronDown className="size-3" />}
        </button>
    );

    return (
        <DashboardLayout title="Gestion des Produits">
            <div className="space-y-8 animate-in fade-in duration-500">

                {/* ── Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-black italic tracking-tighter text-foreground">Mes Produits</h2>
                        <p className="text-sm text-muted-foreground font-medium mt-0.5">
                            Gérez votre catalogue — prix, stocks, descriptions en temps réel.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={load} className="p-2.5 rounded-xl border border-border text-muted-foreground hover:text-primary hover:border-primary transition-all">
                            <RefreshCw className="size-4" />
                        </button>
                        <Button onClick={() => navigate('/vendor/products/add')} className="gap-2 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 h-11">
                            <Plus className="size-4" /> Nouveau produit
                        </Button>
                    </div>
                </div>

                {/* ── Stats KPI ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Total produits', val: products.length, icon: Package, color: 'text-primary', bg: 'bg-primary/10 border-primary/20' },
                        { label: 'Valeur du stock', val: `${totalStockValue.toLocaleString('fr-FR')} GNF`, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' },
                        { label: 'Stock faible', val: lowStock, icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20' },
                        { label: 'En rupture', val: outOfStock, icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20' },
                    ].map((kpi, i) => (
                        <div key={i} className={`p-5 rounded-2xl border ${kpi.bg} flex items-center gap-4`}>
                            <div className={`size-10 rounded-xl flex items-center justify-center ${kpi.bg}`}>
                                <kpi.icon className={`size-5 ${kpi.color}`} />
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{kpi.label}</p>
                                <p className={`text-xl font-black italic ${kpi.color} leading-tight`}>{kpi.val}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Toolbar ── */}
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-card p-4 rounded-2xl border border-border shadow-sm">
                    {/* Search */}
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <input
                            className="w-full pl-10 pr-4 py-2.5 bg-muted/30 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium placeholder:text-muted-foreground"
                            placeholder="Rechercher un produit..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl border border-border">
                        {FILTERS.map(f => (
                            <button
                                key={f.key}
                                onClick={() => setActiveFilter(f.key)}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                    activeFilter === f.key
                                        ? "bg-primary text-white shadow-md"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {f.label}
                                <span className={cn("text-[8px] px-1.5 py-0.5 rounded-full font-black",
                                    activeFilter === f.key ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                                )}>{f.count}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Table ── */}
                <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border bg-muted/30">
                                    <th className="text-left px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Produit</th>
                                    <th className="text-left px-4 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Catégorie</th>
                                    <th className="text-left px-4 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest cursor-pointer select-none">
                                        <div className="flex items-center">Prix <SortBtn col="prix_unitaire" /></div>
                                    </th>
                                    <th className="text-left px-4 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest cursor-pointer select-none">
                                        <div className="flex items-center">Stock <SortBtn col="stock_quantite" /></div>
                                    </th>
                                    <th className="text-left px-4 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Statut</th>
                                    <th className="text-right px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {isLoading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-6 py-4"><div className="h-10 w-48 bg-muted rounded-xl" /></td>
                                            <td className="px-4 py-4"><div className="h-6 w-24 bg-muted rounded-lg" /></td>
                                            <td className="px-4 py-4"><div className="h-6 w-28 bg-muted rounded-lg" /></td>
                                            <td className="px-4 py-4"><div className="h-6 w-20 bg-muted rounded-lg" /></td>
                                            <td className="px-4 py-4"><div className="h-6 w-20 bg-muted rounded-full" /></td>
                                            <td className="px-6 py-4"><div className="h-8 w-20 bg-muted rounded-xl ml-auto" /></td>
                                        </tr>
                                    ))
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-16 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="size-16 rounded-full bg-muted flex items-center justify-center">
                                                    <Package className="size-7 text-muted-foreground/40" />
                                                </div>
                                                <div>
                                                    <p className="font-black italic text-foreground uppercase tracking-tight">Aucun produit trouvé</p>
                                                    <p className="text-xs text-muted-foreground font-medium mt-1">
                                                        {searchTerm ? `Aucun résultat pour "${searchTerm}"` : 'Créez votre premier produit.'}
                                                    </p>
                                                </div>
                                                {!searchTerm && (
                                                    <Button onClick={() => navigate('/vendor/products/add')} className="h-10 px-6 rounded-xl font-black text-xs uppercase gap-2 mt-2">
                                                        <Plus className="size-4" /> Ajouter un produit
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ) : filtered.map((product) => (
                                    <tr key={product.id} className="group hover:bg-muted/20 transition-colors">
                                        {/* Produit */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="size-12 rounded-xl bg-muted border border-border overflow-hidden shrink-0">
                                                    {product.image_url ? (
                                                        <img src={product.image_url} className="w-full h-full object-cover" alt={product.nom_produit} />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Package className="size-5 text-muted-foreground/40" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-black text-foreground truncate max-w-[180px] italic">{product.nom_produit}</p>
                                                    <p className="text-[10px] text-muted-foreground font-medium truncate max-w-[180px] mt-0.5">{product.description?.substring(0, 50) || '-'}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Catégorie */}
                                        <td className="px-4 py-4">
                                            <span className="text-[9px] px-2.5 py-1 bg-muted rounded-lg font-black uppercase tracking-widest text-muted-foreground border border-border">
                                                {product.categorie?.nom_categorie || 'N/A'}
                                            </span>
                                        </td>

                                        {/* Prix */}
                                        <td className="px-4 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black italic text-foreground">
                                                    {parseFloat(product.prix_unitaire).toLocaleString('fr-FR')} GNF
                                                </span>
                                                {product.prix_ancien && (
                                                    <span className="text-[10px] text-muted-foreground line-through font-medium">
                                                        {parseFloat(product.prix_ancien).toLocaleString('fr-FR')} GNF
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Stock — éditable inline */}
                                        <td className="px-4 py-4">
                                            <StockEditor
                                                productId={product.id}
                                                initialStock={product.stock_quantite}
                                                onUpdated={handleStockUpdated}
                                            />
                                        </td>

                                        {/* Statut */}
                                        <td className="px-4 py-4">
                                            <StockBadge qty={product.stock_quantite} />
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link to={`/product/${product.id}`} className="p-2 text-muted-foreground hover:text-primary bg-card border border-border rounded-xl shadow-sm transition-all hover:border-primary hover:scale-110" title="Aperçu marketplace">
                                                    <Eye className="size-4" />
                                                </Link>
                                                <button onClick={() => navigate(`/vendor/products/edit/${product.id}`)}
                                                    className="p-2 text-muted-foreground hover:text-primary bg-card border border-border rounded-xl shadow-sm transition-all hover:border-primary hover:scale-110" title="Modifier">
                                                    <Edit3 className="size-4" />
                                                </button>
                                                <button onClick={() => setDeleteConfirm(product)}
                                                    className="p-2 text-muted-foreground hover:text-destructive bg-card border border-border rounded-xl shadow-sm transition-all hover:border-destructive hover:scale-110" title="Supprimer">
                                                    <Trash2 className="size-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* ── Modal Confirmation Suppression ── */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-card border border-border rounded-[2rem] p-8 max-w-sm w-full shadow-2xl animate-in slide-in-from-bottom-4 duration-300 space-y-6">
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="size-16 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center">
                                <Trash2 className="size-7 text-destructive" />
                            </div>
                            <div>
                                <p className="text-lg font-black text-foreground italic tracking-tight">Supprimer le produit ?</p>
                                <p className="text-sm text-muted-foreground font-medium mt-1">
                                    "<strong className="text-foreground">{deleteConfirm.nom_produit}</strong>" sera définitivement supprimé.
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="rounded-xl h-12 font-black uppercase tracking-widest text-xs">
                                Annuler
                            </Button>
                            <Button
                                onClick={() => handleDelete(deleteConfirm)}
                                disabled={isDeleting}
                                className="rounded-xl h-12 font-black uppercase tracking-widest text-xs bg-destructive hover:bg-destructive/90 shadow-lg shadow-destructive/20"
                            >
                                {isDeleting ? <RefreshCw className="size-4 animate-spin" /> : 'Supprimer'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default Products;
