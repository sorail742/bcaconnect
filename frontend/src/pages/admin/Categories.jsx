import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/ui/Modal';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Edit2, Trash2, Search, RefreshCcw,
    LayoutGrid, ChevronRight, Tag,
    Activity, Layers, Filter, CheckCircle2, ShieldCheck
} from 'lucide-react';
import categoryService from '../../services/categoryService';
import { useCategories } from '../../hooks/useDomainData';
import useApiMutation from '../../hooks/useApiMutation';
import { cn } from '../../lib/utils';

const StatCard = ({ title, value, icon: Icon, color }) => (
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
            <h3 className="text-2xl font-black text-slate-900 leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {value}
            </h3>
        </div>
    </motion.div>
);

const Categories = () => {
    const { data: categories = [], loading: isLoading, refetch } = useCategories();
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        nom_categorie: '',
        description: '',
        image_url: ''
    });

    const { mutate: crudMutation, isPending: isSaving } = useApiMutation(
        async (payload) => {
            if (editingCategory) {
                return categoryService.update(editingCategory.id, payload);
            }
            return categoryService.create(payload);
        },
        {
            invalidateKeys: ['categories'],
            successMessage: editingCategory ? "TAXONOMIE MISE À JOUR." : "NOUVELLE CLASSE CRÉÉE.",
            onSuccess: () => setShowModal(false)
        }
    );

    const { mutate: deleteMutation } = useApiMutation(
        (id) => categoryService.delete(id),
        {
            invalidateKeys: ['categories'],
            successMessage: "CLASSIFICATION RÉVOQUÉE."
        }
    );

    const handleDelete = (id) => {
        if (!window.confirm("RÉVOQUER DÉFINITIVEMENT CETTE CLASSIFICATION ?")) return;
        deleteMutation(id);
    };

    const handleOpenModal = (cat = null) => {
        if (cat) {
            setEditingCategory(cat);
            setFormData({
                nom_categorie: cat.nom_categorie || '',
                description: cat.description || '',
                image_url: cat.image_url || ''
            });
        } else {
            setEditingCategory(null);
            setFormData({ nom_categorie: '', description: '', image_url: '' });
        }
        setShowModal(true);
    };

    const filtered = categories.filter(c => {
        const matchesSearch = (c.nom_categorie || '').toLowerCase().includes(search.toLowerCase()) ||
                             (c.description || '').toLowerCase().includes(search.toLowerCase());
        return matchesSearch;
    });

    return (
        <DashboardLayout title="GESTION DES CATÉGORIES" noPadding>
            <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-8 space-y-8 custom-scrollbar">
                
                {/* Header HUD */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <div className="size-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-lg shadow-primary/5">
                            <Layers className="size-7 text-primary" />
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                Architecture <span className="text-primary">Produits</span>
                            </h1>
                            <div className="flex items-center gap-2">
                                <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                                    {categories.length} SEGMENTS RÉPERTORIÉS • SYNC_OK
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={() => refetch()} className="h-12 px-5 bg-white border border-slate-100 rounded-2xl flex items-center gap-2 text-slate-600 hover:bg-slate-50 transition-all">
                            <RefreshCcw className={cn("size-4", isLoading && "animate-spin")} />
                        </button>
                        <button onClick={() => handleOpenModal()} className="h-12 px-8 bg-primary text-foreground rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center gap-3">
                            <Plus className="size-4" />
                            Nouvelle Classe
                        </button>
                    </div>
                </div>

                {/* Summary Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard title="Total Catégories" value={categories.length} icon={LayoutGrid} color="text-primary" />
                    <StatCard title="Hiérarchie Active" value="Standard" icon={Activity} color="text-blue-500" />
                    <StatCard title="Dernier Segment" value={categories[0]?.nom_categorie?.slice(0, 12).toUpperCase() || "VACANT"} icon={Tag} color="text-emerald-500" />
                </div>

                {/* Filter Surface */}
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-slate-50 flex items-center justify-center">
                            <Filter className="size-4 text-slate-400" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Filtrage Intelligent</p>
                    </div>
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 size-4" />
                        <input
                            className="w-full pl-12 pr-4 h-11 bg-slate-50 border-none rounded-2xl text-xs font-semibold focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-300"
                            placeholder="RECHERCHER UNE CATÉGORIE..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Grid Deck */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {isLoading ? (
                            Array(6).fill(0).map((_, i) => (
                                <div key={i} className="h-64 rounded-[2rem] bg-white border border-slate-100 animate-pulse" />
                            ))
                        ) : filtered.length === 0 ? (
                            <div className="col-span-full py-32 flex flex-col items-center gap-4 opacity-40 text-slate-400">
                                <LayoutGrid className="size-16" />
                                <p className="text-sm font-bold uppercase tracking-widest">Aucune catégorie au registre</p>
                            </div>
                        ) : (
                            filtered.map((cat, idx) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    key={cat.id}
                                    className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden group flex flex-col min-h-[380px]"
                                >
                                    <div className="h-40 relative bg-slate-50 overflow-hidden">
                                        {cat.image_url ? (
                                            <img src={cat.image_url} alt="" className="size-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        ) : (
                                            <div className="size-full flex items-center justify-center opacity-10">
                                                <Tag className="size-12" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-60" />
                                        
                                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                            <button onClick={() => handleOpenModal(cat)} className="size-9 rounded-xl bg-white/90 backdrop-blur shadow-xl flex items-center justify-center text-slate-600 hover:text-primary transition-all">
                                                <Edit2 className="size-4" />
                                            </button>
                                            <button onClick={() => handleDelete(cat.id)} className="size-9 rounded-xl bg-white/90 backdrop-blur shadow-xl flex items-center justify-center text-slate-600 hover:text-rose-500 transition-all">
                                                <Trash2 className="size-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-8 flex flex-col flex-1">
                                        <div className="mb-4">
                                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                                {cat.nom_categorie}
                                            </h3>
                                            <div className="h-1 w-10 bg-primary/20 rounded-full mt-2" />
                                        </div>
                                        <p className="text-[11px] font-bold text-slate-400 leading-relaxed line-clamp-3 italic mb-6">
                                            {cat.description || "Aucune documentation de classe disponible pour ce segment."}
                                        </p>
                                        
                                        <div className="mt-auto pt-6 flex items-center justify-between border-t border-slate-50">
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-300">Segment ID</span>
                                                <span className="text-[10px] font-bold text-slate-400 tabular-nums">#{cat.id?.slice(0, 8).toUpperCase()}</span>
                                            </div>
                                            <ChevronRight className="size-5 text-slate-200 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Classification Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingCategory ? "ÉDITION CLASSIFICATION" : "NOUVELLE CLASSE"}
                glass
            >
                <form onSubmit={(e) => { e.preventDefault(); crudMutation(formData); }} className="space-y-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Désignation de la Classe</label>
                        <input 
                            required 
                            value={formData.nom_categorie} 
                            onChange={(e) => setFormData({...formData, nom_categorie: e.target.value})} 
                            className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-primary/20 transition-all uppercase" 
                            placeholder="EX: ÉLECTRONIQUE, MODE..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Documentation Technique</label>
                        <textarea 
                            rows={4}
                            value={formData.description} 
                            onChange={(e) => setFormData({...formData, description: e.target.value})} 
                            className="w-full p-6 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-semibold text-slate-600 outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none shadow-inner italic" 
                            placeholder="DÉCRIVEZ LES SPÉCIFICATIONS..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Image de Couverture (URL)</label>
                        <input 
                            value={formData.image_url} 
                            onChange={(e) => setFormData({...formData, image_url: e.target.value})} 
                            className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-medium text-slate-500 outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                            placeholder="https://images.unsplash.com/..."
                        />
                    </div>

                    <div className="flex gap-4 pt-6">
                        <button type="submit" disabled={isSaving} className="flex-1 h-14 bg-primary text-foreground rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-3">
                            {isSaving ? <RefreshCcw className="size-5 animate-spin" /> : <ShieldCheck className="size-5" />}
                            {editingCategory ? "Enregistrer les Changements" : "Déployer la Classe"}
                        </button>
                    </div>
                </form>
            </Modal>
        </DashboardLayout>
    );
};

export default Categories;
