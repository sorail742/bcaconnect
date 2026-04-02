import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import {
    Search,
    Plus,
    Package,
    CheckCircle2,
    Filter,
    Download,
    Edit3,
    Trash2,
    AlertTriangle,
    Image as ImageIcon,
    ChevronDown,
    RefreshCcw,
    Zap,
    ChevronLeft,
    ChevronRight,
    ShoppingBag,
    MoreVertical,
    Activity
} from 'lucide-react';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

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
            toast.error("Impossible de synchroniser le catalogue.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDelete = async (id) => {
        if (!window.confirm("Révoquer définitivement ce produit du catalogue ?")) return;
        try {
            await productService.delete(id);
            toast.success("Produit révoqué.");
            fetchData();
        } catch (error) {
            toast.error("Échec de l'opération.");
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
                toast.success("Catalogue actualisé.");
            } else {
                await productService.create(formData);
                toast.success("Référence ajoutée.");
            }
            setShowModal(false);
            fetchData();
        } catch (error) {
            toast.error("Échec de l'enregistrement.");
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
            label: 'Produit',
            render: (row) => (
                <div className="flex items-center gap-4 py-2 group">
                    <div className="size-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden transition-all group-hover:scale-105">
                        {row.image_url ? <img src={row.image_url} alt="" className="w-full h-full object-cover" /> : <Package className="size-6 text-slate-300" />}
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight truncate max-w-[180px]">
                            {row.nom_produit}
                        </p>
                        <p className="text-[9px] font-bold text-primary uppercase tracking-widest truncate">
                            {row.Category?.nom_categorie || 'BCA'}
                        </p>
                    </div>
                </div>
            )
        },
        {
            label: 'Vendeur',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                        {row.Store?.nom_boutique || 'ADMIN'}
                    </span>
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                        SID: {row.store_id?.slice(0, 8) || 'SYSTEM'}
                    </span>
                </div>
            )
        },
        {
            label: 'Cotation',
            render: (row) => (
                <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                    {parseFloat(row.prix_unitaire).toLocaleString('fr-GN')} <small className="text-[10px] font-bold text-primary">GNF</small>
                </span>
            )
        },
        {
            label: 'Inventaire',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <div className={cn(
                        "size-2 rounded-full",
                        row.stock_quantite === 0 ? "bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" :
                            row.stock_quantite <= 10 ? "bg-amber-500" : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                    )} />
                    <span className={cn(
                        "text-[10px] font-bold uppercase tracking-widest",
                        row.stock_quantite === 0 ? "text-red-500" :
                            row.stock_quantite <= 10 ? "text-amber-500" : "text-emerald-500"
                    )}>
                        {row.stock_quantite} Unités
                    </span>
                </div>
            )
        },
        {
            label: 'Actions',
            render: (row) => (
                <div className="flex items-center justify-end gap-2 pr-2">
                    <button onClick={() => handleOpenModal(row)} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"><Edit3 className="size-4" /></button>
                    <button onClick={() => handleDelete(row.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="size-4" /></button>
                </div>
            )
        }
    ];

    return (
        <DashboardLayout title="Audit Catalogue">
            <div className="max-w-7xl mx-auto space-y-10 animate-fade-in pb-24 px-6 md:px-10 pt-10">

                {/* Header Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="size-2 bg-primary rounded-full" />
                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Supervision de l'Offre</span>
                        </div>
                        <h2 className="text-4xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Catalogue <span className="text-primary italic">Global.</span></h2>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={fetchData} className="size-12 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-primary transition-all shadow-sm">
                            <RefreshCcw className={cn("size-5", isLoading && "animate-spin")} />
                        </button>
                        <Button onClick={() => handleOpenModal()} className="h-14 px-10 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl">
                            <Plus className="size-5" /> Ajouter Actif
                        </Button>
                    </div>
                </div>

                {/* KPI Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-8 bg-slate-900 rounded-[2rem] border border-slate-800 shadow-xl flex items-center gap-6">
                        <div className="size-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
                            <Package className="size-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Rédérénces Indexées</p>
                            <p className="text-xl font-bold text-white uppercase">{stats.total}</p>
                        </div>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-6">
                        <div className="size-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                            <CheckCircle2 className="size-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Articles Actifs</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-white uppercase">{stats.active}</p>
                        </div>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-6">
                        <div className="size-14 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
                            <AlertTriangle className={cn("size-7", stats.lowStock > 0 && "animate-bounce")} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Alerte Stock</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-white uppercase">{stats.lowStock}</p>
                        </div>
                    </div>
                </div>

                {/* Table Surface */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm">
                    <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3 p-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                                <button className="px-5 py-2 group bg-slate-900 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest">Tous</button>
                                <button className="px-5 py-2 group text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg text-[10px] font-bold uppercase tracking-widest">En Alerte</button>
                            </div>
                        </div>

                        <div className="relative group w-full lg:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-4 group-focus-within:text-primary transition-colors" />
                            <input
                                className="w-full pl-12 pr-4 h-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold uppercase tracking-widest placeholder:text-slate-300 outline-none"
                                placeholder="PRODUIT, VENDEUR..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="p-0">
                        <DataTable
                            columns={columns}
                            data={filtered}
                            isLoading={isLoading}
                            className="border-none shadow-none"
                        />

                        {!isLoading && filtered.length === 0 && (
                            <div className="py-24 text-center opacity-30">
                                <ShoppingBag className="size-16 mx-auto mb-6" />
                                <p className="text-xs font-bold uppercase tracking-widest">Aucune référence identifiée</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Product Form */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingProduct ? "Révision Dossier" : "Enregistrement"}
            >
                <form onSubmit={handleSubmit} className="space-y-8 p-6">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Désignation</label>
                            <Input
                                required
                                value={formData.nom_produit}
                                onChange={(e) => setFormData({ ...formData, nom_produit: e.target.value })}
                                placeholder="NOM DU PRODUIT..."
                                className="h-14 px-6 rounded-xl font-bold text-sm uppercase"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Prix (GNF)</label>
                                <Input
                                    type="number"
                                    required
                                    value={formData.prix_unitaire}
                                    onChange={(e) => setFormData({ ...formData, prix_unitaire: e.target.value })}
                                    className="h-14 px-6 rounded-xl font-bold text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Stock</label>
                                <Input
                                    type="number"
                                    required
                                    value={formData.stock_quantite}
                                    onChange={(e) => setFormData({ ...formData, stock_quantite: e.target.value })}
                                    className="h-14 px-6 rounded-xl font-bold text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Catégorie</label>
                            <select
                                className="w-full h-14 px-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[10px] font-bold uppercase tracking-widest outline-none"
                                value={formData.categorie_id}
                                onChange={(e) => setFormData({ ...formData, categorie_id: e.target.value })}
                            >
                                {categories.map(c => <option key={c.id} value={c.id}>{c.nom_categorie?.toUpperCase() || c.nom?.toUpperCase()}</option>)}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Image URL</label>
                            <Input
                                value={formData.image_url}
                                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                placeholder="https://..."
                                className="h-14 px-6 rounded-xl font-bold text-[10px] tracking-widest text-primary"
                            />
                        </div>
                    </div>

                    <div className="pt-6">
                        <Button
                            type="submit"
                            disabled={isSaving}
                            className="w-full h-14 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl"
                        >
                            {isSaving ? <RefreshCcw className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                            Enregistrer Base
                        </Button>
                    </div>
                </form>
            </Modal>
        </DashboardLayout>
    );
};

export default AdminProducts;
