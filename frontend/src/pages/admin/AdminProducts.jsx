import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DashboardCard from '../../components/ui/DashboardCard';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import {
    Search,
    Plus,
    Package,
    CheckCircle2,
    Clock,
    Filter,
    Download,
    Edit3,
    Trash2,
    Eye,
    EyeOff,
    AlertTriangle,
    Image as ImageIcon
} from 'lucide-react';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';
import { toast } from 'sonner';

const formatGNF = (n) => n?.toLocaleString('fr-GN') + ' GNF';

const STOCK_COLOR = (n) => {
    if (n === 0) return 'text-rose-600';
    if (n <= 10) return 'text-amber-600';
    return 'text-emerald-600';
};

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [stats, setStats] = useState({ total: 0, active: 0, lowStock: 0 });

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
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

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [prods, cats] = await Promise.all([
                productService.getAll(),
                categoryService.getAll()
            ]);
            setProducts(prods || []);
            setCategories(cats || []);

            // Calculate stats
            const total = prods.length;
            const active = prods.filter(p => !p.est_supprime).length;
            const low = prods.filter(p => p.stock_quantite <= 10).length;
            setStats({ total, active, lowStock: low });
        } catch (error) {
            toast.error("Échec du chargement du catalogue.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Supprimer définitivement ce produit du catalogue ?")) return;
        try {
            await productService.delete(id);
            toast.success("Produit supprimé.");
            fetchData();
        } catch (error) {
            toast.error("Erreur de suppression.");
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
        try {
            if (editingProduct) {
                await productService.update(editingProduct.id, formData);
                toast.success("Produit mis à jour.");
            } else {
                await productService.create(formData);
                toast.success("Nouveau produit ajouté.");
            }
            setShowModal(false);
            fetchData();
        } catch (error) {
            toast.error("Erreur d'enregistrement.");
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
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <div
                            className="size-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 bg-cover bg-center shadow-sm overflow-hidden"
                            style={{ backgroundImage: `url('${row.image_url || 'https://via.placeholder.com/150'}')` }}
                        />
                        {row.stock_quantite === 0 && (
                            <div className="absolute inset-0 bg-red-500/20 backdrop-blur-[1px] flex items-center justify-center rounded-xl">
                                <AlertTriangle className="size-5 text-white fill-red-500" />
                            </div>
                        )}
                    </div>
                    <div>
                        <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">
                            {row.nom_produit}
                        </p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{row.Category?.nom || 'Sans catégorie'}</p>
                    </div>
                </div>
            )
        },
        {
            label: 'Boutique',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        {row.Store?.nom_boutique || 'BCA Connect'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium tracking-tight">ID Store: {row.store_id?.slice(0, 8)}</span>
                </div>
            )
        },
        {
            label: 'Tarification',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="text-sm font-black text-primary italic">{formatGNF(row.prix_unitaire)}</span>
                    {row.prix_ancien && (
                        <span className="text-[10px] text-slate-400 line-through font-bold">{formatGNF(row.prix_ancien)}</span>
                    )}
                </div>
            )
        },
        {
            label: 'Stock Réel',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <span className={`text-lg font-black tracking-tighter ${STOCK_COLOR(row.stock_quantite)}`}>
                        {row.stock_quantite}
                    </span>
                    {row.stock_quantite <= 5 && <AlertTriangle className="size-4 text-rose-500 animate-pulse" />}
                </div>
            )
        },
        {
            label: 'Actions',
            render: (row) => (
                <div className="flex justify-end gap-3 translate-x-2">
                    <button
                        onClick={() => handleOpenModal(row)}
                        className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 hover:text-primary hover:shadow-lg transition-all"
                        title="Détails / Modifier"
                    >
                        <Edit3 className="size-4" />
                    </button>
                    <button
                        onClick={() => handleDelete(row.id)}
                        className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 hover:text-rose-500 hover:shadow-lg transition-all"
                        title="Retirer du catalogue"
                    >
                        <Trash2 className="size-4" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <DashboardLayout title="Gestion Catalogue">
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* Header Actions */}
                <div className="flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                        <input
                            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-slate-400"
                            placeholder="RECHERCHER UN PRODUIT..."
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95"
                    >
                        <Plus className="size-4" />
                        Nouveau Produit
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <DashboardCard title="Total Références" value={stats.total} icon={Package} trend="up" trendValue="+12.5%" />
                    <DashboardCard title="Unités Actives" value={stats.active} icon={CheckCircle2} trend="up" trendValue="+5.2%" />
                    <DashboardCard title="Alerte Stock" value={stats.lowStock} icon={AlertTriangle} trend={stats.lowStock > 0 ? "down" : "up"} trendValue={stats.lowStock > 0 ? "Critique" : "OK"} />
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <DataTable
                        title="Catalogue Officiel"
                        columns={columns}
                        data={filtered}
                        isLoading={isLoading}
                        actions={(
                            <div className="flex gap-2">
                                <button className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                                    <Filter className="size-4 text-slate-500" />
                                </button>
                                <button className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                                    <Download className="size-4 text-slate-500" />
                                </button>
                            </div>
                        )}
                    />
                </div>
            </div>

            {/* Modal Form */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingProduct ? "Éditer le produit" : "Ajouter au catalogue"}
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nom du produit</label>
                        <input
                            required
                            className="w-full px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-bold focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                            placeholder="Ex: Laptop Premium"
                            value={formData.nom_produit}
                            onChange={(e) => setFormData({ ...formData, nom_produit: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Prix Unitaire (GNF)</label>
                            <input
                                type="number"
                                required
                                className="w-full px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-bold focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                                value={formData.prix_unitaire}
                                onChange={(e) => setFormData({ ...formData, prix_unitaire: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Stock Initial</label>
                            <input
                                type="number"
                                required
                                className="w-full px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-bold focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                                value={formData.stock_quantite}
                                onChange={(e) => setFormData({ ...formData, stock_quantite: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Catégorie</label>
                        <select
                            className="w-full px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-bold uppercase tracking-widest focus:ring-4 focus:ring-primary/10 outline-none"
                            value={formData.categorie_id}
                            onChange={(e) => setFormData({ ...formData, categorie_id: e.target.value })}
                        >
                            {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <ImageIcon className="size-3" /> URL Image
                        </label>
                        <input
                            className="w-full px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                            placeholder="https://images.unsplash.com/..."
                            value={formData.image_url}
                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                    >
                        {editingProduct ? "Confirmer Mise à jour" : "Inscrire au Catalogue"}
                    </button>
                </form>
            </Modal>
        </DashboardLayout>
    );
};

export default AdminProducts;
