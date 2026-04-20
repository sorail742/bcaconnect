import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import { motion } from 'framer-motion';
import {
    Search, Plus, Package, CheckCircle2, Edit3, Trash2,
    AlertTriangle, RefreshCcw, Zap, Box, ShoppingBag,
    Activity, Filter, Image as ImageIcon,
    Tag, Briefcase, ChevronDown, PlusCircle, ShieldCheck
} from 'lucide-react';
import productService from '../../services/productService';
import { useProducts, useCategories } from '../../hooks/useDomainData';
import useApiMutation from '../../hooks/useApiMutation';
import { cn } from '../../lib/utils';

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

    const stats = [
        { title: 'Total Produits', value: products.length, icon: Package, color: 'text-primary' },
        { title: 'Inventaire Actif', value: products.filter(p => !p.est_supprime).length, icon: Activity, color: 'text-emerald-500', status: 'Optimal' },
        { title: 'Stock Critique', value: products.filter(p => p.stock_quantite <= 10).length, icon: AlertTriangle, color: 'text-rose-500', status: 'Alerte' }
    ];

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
            label: 'Vendeur',
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
            <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-8 space-y-8 custom-scrollbar">
                
                {/* Header HUD */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <div className="size-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-lg shadow-primary/5">
                            <ShoppingBag className="size-7 text-primary" />
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                Catalogue <span className="text-primary">E-Commerce</span>
                            </h1>
                            <div className="flex items-center gap-2">
                                <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                                    {products.length} RÉFÉRENCES ACTIVES • SYNC_OK
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={() => refetch()} className="h-12 px-5 bg-white border border-slate-100 rounded-2xl flex items-center gap-2 text-slate-600 hover:bg-slate-50 transition-all">
                            <RefreshCcw className={cn("size-4", isLoading && "animate-spin")} />
                        </button>
                        <button onClick={() => handleOpenModal()} className="h-12 px-8 bg-primary text-foreground rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center gap-3">
                            <PlusCircle className="size-4" />
                            Nouvel Article
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stats.map((s, i) => (
                        <StatCard key={i} {...s} />
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    {/* Filter HUD */}
                    <div className="p-6 border-b border-slate-50 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 xl:pb-0">
                            <div className="size-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 mr-1">
                                <Filter className="size-4 text-slate-400" />
                            </div>
                            <button
                                onClick={() => setSelectedCategory('TOUS')}
                                className={cn(
                                    "px-6 h-10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                    selectedCategory === 'TOUS' ? "bg-slate-900 text-white shadow-lg" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                                )}
                            >
                                TOUTES CATÉGORIES
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={cn(
                                        "px-6 h-10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                        selectedCategory === cat.id ? "bg-slate-900 text-white shadow-lg" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                                    )}
                                >
                                    {cat.nom_categorie?.toUpperCase()}
                                </button>
                            ))}
                        </div>

                        <div className="relative w-full xl:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 size-4" />
                            <input
                                className="w-full pl-12 pr-4 h-11 bg-slate-50 border-none rounded-2xl text-xs font-semibold focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-300"
                                placeholder="RECHERCHER UN PRODUIT..."
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
                        <div className="py-32 flex flex-col items-center gap-4 opacity-40 text-slate-400">
                            <Box className="size-16" />
                            <p className="text-sm font-bold uppercase tracking-widest">Aucun produit trouvé</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Asset Indexing Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingProduct ? "ÉDITION ARTICLE" : "NOUVELLE ACQUISITION"}
                glass
            >
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-2 group">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Désignation de l'Article</label>
                        <div className="relative">
                            <input 
                                required 
                                value={formData.nom_produit} 
                                onChange={(e) => setFormData({...formData, nom_produit: e.target.value})} 
                                className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-primary/20 transition-all uppercase" 
                                placeholder="NOM DU PRODUIT..."
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Prix Unitaire (GNF)</label>
                            <input 
                                required 
                                type="number"
                                value={formData.prix_unitaire} 
                                onChange={(e) => setFormData({...formData, prix_unitaire: e.target.value})} 
                                className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-emerald-600 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all tabular-nums" 
                                placeholder="0"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Stock Initial</label>
                            <input 
                                required 
                                type="number"
                                value={formData.stock_quantite} 
                                onChange={(e) => setFormData({...formData, stock_quantite: e.target.value})} 
                                className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-blue-600 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all tabular-nums" 
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Classification</label>
                            <div className="relative">
                                <select 
                                    value={formData.categorie_id} 
                                    onChange={(e) => setFormData({...formData, categorie_id: e.target.value})} 
                                    className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">CHOISIR UNE CATÉGORIE</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.nom_categorie?.toUpperCase() || c.nom?.toUpperCase()}</option>)}
                                </select>
                                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Image URL</label>
                            <div className="relative">
                                <ImageIcon className="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-slate-300" />
                                <input 
                                    value={formData.image_url} 
                                    onChange={(e) => setFormData({...formData, image_url: e.target.value})} 
                                    className="w-full h-14 pl-12 pr-6 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-medium text-slate-500 outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                                    placeholder="https://images.unsplash.com/..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Description Technique</label>
                        <textarea 
                            rows={4}
                            value={formData.description} 
                            onChange={(e) => setFormData({...formData, description: e.target.value})} 
                            className="w-full p-6 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-semibold text-slate-600 outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none shadow-inner italic" 
                            placeholder="SPÉCIFICATIONS DÉTAILLÉES..."
                        />
                    </div>

                    <div className="flex gap-4 pt-6">
                        <button type="submit" disabled={isSaving} className="flex-1 h-14 bg-primary text-foreground rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-3">
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
