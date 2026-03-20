import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
    PlusCircle,
    Search,
    Edit2,
    Trash2,
    Folder,
    ChevronRight,
    X,
    UploadCloud,
    AlertCircle
} from 'lucide-react';
import Button from '../../components/ui/Button';
import categoryService from '../../services/categoryService';
import { toast } from 'sonner';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');

    // Form State
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        nom: '',
        description: '',
        parent_id: '',
        statut: 'actif'
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setIsLoading(true);
        try {
            const data = await categoryService.getAll();
            setCategories(data || []);
        } catch (error) {
            toast.error("Erreur de chargement des catégories.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Supprimer cette catégorie ? Cela pourrait affecter les produits liés.")) return;
        try {
            await categoryService.delete(id);
            toast.success("Catégorie supprimée.");
            fetchCategories();
        } catch (error) {
            toast.error("Erreur de suppression.");
        }
    };

    const handleOpenModal = (cat = null) => {
        if (cat) {
            setEditingCategory(cat);
            setFormData({
                nom: cat.nom || '',
                description: cat.description || '',
                parent_id: cat.parent_id || '',
                statut: cat.statut || 'actif'
            });
        } else {
            setEditingCategory(null);
            setFormData({
                nom: '',
                description: '',
                parent_id: '',
                statut: 'actif'
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await categoryService.update(editingCategory.id, formData);
                toast.success("Catégorie mise à jour !");
            } else {
                await categoryService.create(formData);
                toast.success("Catégorie créée !");
            }
            setIsModalOpen(false);
            fetchCategories();
        } catch (error) {
            toast.error("Échec de l'enregistrement.");
        }
    };

    const filtered = categories.filter(c =>
        c.nom.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DashboardLayout title="Gestion Catalogue">
            <div className="space-y-8 animate-in fade-in duration-500 font-inter pb-12">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic underline decoration-primary/30 decoration-8 underline-offset-4">Rayons & Familles</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-3 font-bold uppercase tracking-widest">Hiérarchie officielle du catalogue BCA.</p>
                    </div>
                    <Button
                        onClick={() => handleOpenModal()}
                        className="bg-primary text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-2xl shadow-primary/30 hover:scale-[1.05] active:scale-95 transition-all"
                    >
                        <PlusCircle className="size-4" />
                        Nouvelle Famille
                    </Button>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-3 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 size-4 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="RECHERCHER UN RAYON..."
                            className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-950 border border-transparent rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm font-black uppercase tracking-widest placeholder:text-slate-400"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Categories Table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto italic">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-100 dark:border-slate-800">
                                    <th className="px-8 py-6">Libellé de la catégorie</th>
                                    <th className="px-8 py-6">Parenté</th>
                                    <th className="px-8 py-6">Statut</th>
                                    <th className="px-8 py-6 text-right">Actions de gestion</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {isLoading ? (
                                    <tr><td colSpan="4" className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest text-xs">Chargement du système...</td></tr>
                                ) : filtered.length === 0 ? (
                                    <tr><td colSpan="4" className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest text-xs">Aucun résultat trouvé</td></tr>
                                ) : filtered.map((cat) => (
                                    <tr key={cat.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className={`flex items-center gap-4 ${cat.parent_id ? 'pl-8' : ''}`}>
                                                {cat.parent_id ? (
                                                    <ChevronRight className="size-3 text-slate-300" />
                                                ) : (
                                                    <Folder className="size-5 text-primary fill-primary/10" />
                                                )}
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">
                                                        {cat.nom}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-medium tracking-tight mt-1">{cat.description?.substring(0, 50) || 'Aucune description'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                                                {cat.Parent?.nom || 'RACINE'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest ${cat.statut === 'actif'
                                                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                                                : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                                                }`}>
                                                <div className={`size-1.5 rounded-full ${cat.statut === 'actif' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                                {cat.statut}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-3">
                                                <button
                                                    onClick={() => handleOpenModal(cat)}
                                                    className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-400 hover:text-primary hover:shadow-xl transition-all"
                                                >
                                                    <Edit2 className="size-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(cat.id)}
                                                    className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-400 hover:text-rose-500 hover:shadow-xl transition-all"
                                                >
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

            {/* Modal Form */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[100] flex justify-end animate-in fade-in duration-300">
                    <div className="w-full max-w-xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col transform animate-in slide-in-from-right duration-500 font-inter border-l border-slate-200 dark:border-slate-800">
                        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 sticky top-0 z-10">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">
                                    {editingCategory ? "Modifier la famille" : "Créer un nouveau rayon"}
                                </h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Édition des métadonnées du catalogue</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="size-12 flex items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-500 transition-all hover:rotate-90"
                            >
                                <X className="size-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 p-8 space-y-8 overflow-y-auto italic custom-scrollbar">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Libellé officiel *</label>
                                <input
                                    required
                                    className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:ring-8 focus:ring-primary/5 outline-none transition-all font-black text-sm dark:text-white placeholder:text-slate-300 uppercase tracking-tighter"
                                    placeholder="EX: ÉLECTROMÉNAGER"
                                    type="text"
                                    value={formData.nom}
                                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 underline decoration-primary/20 decoration-2 underline-offset-4">Emplacement hiérarchique</label>
                                <select
                                    className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:ring-4 focus:ring-primary/10 outline-none transition-all text-[10px] font-black uppercase tracking-widest appearance-none dark:text-white"
                                    value={formData.parent_id || ''}
                                    onChange={(e) => setFormData({ ...formData, parent_id: e.target.value || null })}
                                >
                                    <option value="">-- AUCUN (RACINE) --</option>
                                    {categories.filter(c => c.id !== editingCategory?.id && !c.parent_id).map(c => (
                                        <option key={c.id} value={c.id}>{c.nom.toUpperCase()}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Description détaillée</label>
                                <textarea
                                    className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:ring-4 focus:ring-primary/10 outline-none transition-all text-xs font-medium dark:text-white min-h-[140px] leading-relaxed tracking-tight"
                                    placeholder="Détails techniques pour les moteurs de recherche..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex gap-4">
                                <AlertCircle className="size-5 text-amber-500 shrink-0" />
                                <p className="text-[10px] text-amber-600/80 font-bold leading-relaxed uppercase tracking-tight">
                                    Une famille modifiée impacte l'affichage de tous les produits associés sur le marché public. Soyez précis !
                                </p>
                            </div>
                        </form>

                        <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-4">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 px-8 py-5 rounded-2xl border border-slate-200 dark:border-slate-800 font-black text-[10px] uppercase tracking-widest text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="flex-1 bg-primary text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                {editingCategory ? "Appliquer Mutations" : "Valider Création"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default Categories;
