import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/ui/Modal';
import {
    Plus,
    Edit2,
    Trash2,
    Search,
    RefreshCcw,
    LayoutGrid,
    ChevronRight,
    Tag,
    Image as ImageIcon,
    AlertCircle,
    CheckCircle2,
    MoreVertical,
    Activity,
    Layers
} from 'lucide-react';
import categoryService from '../../services/categoryService';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        nom_categorie: '',
        description: '',
        image_url: ''
    });

    const fetchCategories = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await categoryService.getAll();
            setCategories(data || []);
        } catch (error) {
            toast.error("Impossible de synchroniser l'architecture.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleDelete = async (id) => {
        if (!window.confirm("Révoquer définitivement cette classification taxonomique ?")) return;
        try {
            await categoryService.delete(id);
            toast.success("Classification révoquée.");
            fetchCategories();
        } catch (error) {
            toast.error("Échec de la suppression.");
        }
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const payload = {
                nom_categorie: formData.nom_categorie.trim(),
                description: formData.description.trim(),
                image_url: formData.image_url.trim() || null
            };

            if (editingCategory) {
                await categoryService.update(editingCategory.id, payload);
                toast.success("Taxonomie mise à jour.");
            } else {
                await categoryService.create(payload);
                toast.success("Nouvelle classe créée.");
            }
            setShowModal(false);
            fetchCategories();
        } catch (error) {
            toast.error("Erreur d'enregistrement.");
        } finally {
            setIsSaving(false);
        }
    };

    const filtered = categories.filter(c =>
        (c.nom_categorie || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.description || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <DashboardLayout title="Architecture Offre">
            <div className="max-w-7xl mx-auto space-y-10 animate-fade-in pb-24 px-6 md:px-10 pt-10">

                {/* Header Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="size-2 bg-primary rounded-full" />
                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Taxonomie du Réseau</span>
                        </div>
                        <h2 className="text-4xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Gestion des <span className="text-primary italic">Catégories.</span></h2>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={fetchCategories} className="size-12 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-primary transition-all shadow-sm">
                            <RefreshCcw className={cn("size-5", isLoading && "animate-spin")} />
                        </button>
                        <Button onClick={() => handleOpenModal()} className="h-14 px-10 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl">
                            <Plus className="size-5" /> Nouvelle Classe
                        </Button>
                    </div>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="p-8 bg-slate-900 rounded-[2rem] border border-slate-800 shadow-xl flex items-center justify-center gap-6">
                        <Layers className="size-10 text-primary" />
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Classes</p>
                            <p className="text-xl font-bold text-white uppercase">{categories.length}</p>
                        </div>
                    </div>
                    {/* Search Surface */}
                    <div className="md:col-span-3 p-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] flex items-center shadow-sm">
                        <div className="relative group w-full">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 size-5 group-focus-within:text-primary transition-colors" />
                            <input
                                className="w-full pl-16 pr-8 h-16 bg-transparent text-sm font-bold uppercase tracking-widest placeholder:text-slate-300 outline-none"
                                placeholder="FILTRER LES CLASSIFICATIONS..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {isLoading ? (
                        [1, 2, 3, 4, 5, 6].map(n => <div key={n} className="h-48 bg-slate-100 dark:bg-slate-800/50 rounded-[2.5rem] animate-pulse border border-slate-200 dark:border-slate-700" />)
                    ) : filtered.length === 0 ? (
                        <div className="lg:col-span-3 py-24 flex flex-col items-center gap-6 opacity-30 text-center">
                            <LayoutGrid className="size-16" />
                            <p className="text-xs font-bold uppercase tracking-widest">Architecture Vierge</p>
                        </div>
                    ) : (
                        filtered.map(cat => (
                            <div
                                key={cat.id}
                                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm hover:shadow-md transition-all group relative overflow-hidden flex flex-col justify-between h-[280px]"
                            >
                                <div className="absolute top-0 right-0 size-32 bg-primary/5 rounded-full blur-[40px] -mr-16 -mt-16 group-hover:bg-primary/10 transition-all" />

                                <div>
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="size-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 flex items-center justify-center overflow-hidden transition-all group-hover:scale-110 group-hover:-rotate-3">
                                            {cat.image_url ? <img src={cat.image_url} alt="" className="w-full h-full object-cover" /> : <Tag className="size-6 text-slate-200" />}
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleOpenModal(cat)} className="size-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-primary rounded-xl flex items-center justify-center transition-all shadow-sm"><Edit2 className="size-4" /></button>
                                            <button onClick={() => handleDelete(cat.id)} className="size-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-red-500 rounded-xl flex items-center justify-center transition-all shadow-sm"><Trash2 className="size-4" /></button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white uppercase truncate group-hover:text-primary transition-colors">
                                            {cat.nom_categorie}
                                        </h3>
                                        <p className="text-[11px] text-slate-500 font-medium italic border-l-2 border-primary/20 pl-4 line-clamp-2 leading-relaxed">
                                            {cat.description || "Aucune description fournie pour cette classification."}
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-6 mt-auto border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest italic truncate max-w-[120px]">UID: {cat.id}</span>
                                    <ChevronRight className="size-5 text-slate-200 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal Form */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingCategory ? "Révision Classe" : "Déploiement Taxon"}
            >
                <form onSubmit={handleSubmit} className="space-y-8 p-6">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Désignation Officielle</label>
                            <Input
                                required
                                value={formData.nom_categorie}
                                onChange={(e) => setFormData({ ...formData, nom_categorie: e.target.value })}
                                placeholder="ÉLECTRONIQUE..."
                                className="h-14 px-6 rounded-xl font-bold text-sm uppercase"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Définition</label>
                            <textarea
                                className="w-full h-32 px-6 py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold uppercase tracking-widest outline-none focus:border-primary transition-all resize-none placeholder:text-slate-300"
                                placeholder="DÉCRIRE LA PORTÉE..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Asset Iconographie (URL)</label>
                            <Input
                                value={formData.image_url}
                                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                placeholder="https://..."
                                className="h-14 px-6 rounded-xl font-bold text-[10px] tracking-widest"
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
                            {editingCategory ? "Sceller MAJ" : "Valider Classe"}
                        </Button>
                    </div>
                </form>
            </Modal>
        </DashboardLayout>
    );
};

export default Categories;
