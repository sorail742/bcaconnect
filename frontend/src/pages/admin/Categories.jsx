import React, { useState, useEffect } from 'react';
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
    AlertCircle
} from 'lucide-react';
import categoryService from '../../services/categoryService';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        nom: '',
        description: '',
        image_url: ''
    });

    const fetchCategories = async () => {
        try {
            setIsLoading(true);
            const data = await categoryService.getAll();
            setCategories(data || []);
        } catch (error) {
            toast.error("Échec de la synchronisation taxonomique.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Supprimer définitivement cette classification ?")) return;
        try {
            await categoryService.delete(id);
            toast.success("Classification révoquée.");
            fetchCategories();
        } catch (error) {
            toast.error("Opération compromise.");
        }
    };

    const handleOpenModal = (cat = null) => {
        if (cat) {
            setEditingCategory(cat);
            setFormData({
                nom: cat.nom || '',
                description: cat.description || '',
                image_url: cat.image_url || ''
            });
        } else {
            setEditingCategory(null);
            setFormData({ nom: '', description: '', image_url: '' });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await categoryService.update(editingCategory.id, formData);
                toast.success("Classification mise à jour.");
            } else {
                await categoryService.create(formData);
                toast.success("Nouvelle unité taxonomique créée.");
            }
            setShowModal(false);
            fetchCategories();
        } catch (error) {
            toast.error("Erreur d'enregistrement.");
        }
    };

    const filtered = categories.filter(c => 
        c.nom.toLowerCase().includes(search.toLowerCase()) ||
        c.description?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <DashboardLayout title="GESTION DES CLASSIFICATIONS">
            <div className="space-y-12 animate-in fade-in duration-700 pb-20">
                
                {/* ── Header Executive ──────────────────────────────── */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b-4 border-border pb-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="size-3 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(43,90,255,0.6)]" />
                            <span className="text-executive-label font-black text-primary uppercase tracking-[0.4em] italic leading-none pt-0.5">Architecture du Catalogue BCA</span>
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black text-foreground italic tracking-tighter uppercase leading-[0.85]">Taxonomie des <br /><span className="text-primary not-italic underline decoration-primary/20 decoration-8 underline-offset-[-4px]">Produits.</span></h2>
                        <p className="text-muted-foreground/60 font-medium text-lg italic border-l-4 border-primary/20 pl-8 max-w-xl">Structuration logique et catégorisation des actifs marchands pour une distribution optimisée.</p>
                    </div>
                    <div className="flex gap-4">
                        <button 
                            onClick={fetchCategories}
                            className="h-24 w-24 bg-background border-4 border-border rounded-[2.5rem] flex items-center justify-center text-muted-foreground/30 hover:border-primary/40 hover:text-primary transition-all shadow-premium group"
                        >
                            <RefreshCcw className="size-8 group-hover:rotate-180 transition-transform duration-700" />
                        </button>
                        <button
                            onClick={() => handleOpenModal()}
                            className="h-24 px-12 bg-primary text-white rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-xs flex items-center gap-6 shadow-premium-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                            <Plus className="size-6 group-hover:rotate-90 transition-transform duration-500" />
                            <span className="leading-none pt-1">Nouvelle Catégorie</span>
                        </button>
                    </div>
                </div>

                {/* ── Grid of Categories ────────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {/* Search & Filter Card */}
                    <div className="md:col-span-2 xl:col-span-3 glass-card p-4 rounded-[2.5rem] border-4 border-border flex flex-col md:flex-row gap-4 bg-accent/10">
                        <div className="relative group/search flex-1">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/30 size-6 group-focus-within/search:text-primary transition-all" />
                            <input
                                className="w-full h-20 pl-16 pr-8 bg-background border-4 border-transparent focus:border-primary/40 rounded-[1.8rem] text-sm font-black italic uppercase tracking-widest placeholder:text-muted-foreground/20 shadow-inner outline-none transition-all"
                                placeholder="FILTRER LES CLASSIFICATIONS..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {isLoading ? (
                        [1, 2, 3, 4, 5, 6].map(n => <div key={n} className="h-48 bg-accent/20 rounded-[3rem] animate-pulse border-4 border-border" />)
                    ) : filtered.length === 0 ? (
                        <div className="md:col-span-2 xl:col-span-3 py-32 flex flex-col items-center gap-8 opacity-20">
                            <LayoutGrid className="size-20" />
                            <p className="text-2xl font-black italic tracking-tighter uppercase">Aucun Résultat Taxonomique</p>
                        </div>
                    ) : (
                        filtered.map(cat => (
                            <div
                                key={cat.id}
                                className="glass-card group border-4 border-border rounded-[3rem] p-8 shadow-premium hover:shadow-premium-lg hover:border-primary/20 transition-all duration-500 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 size-40 bg-primary/5 rounded-full blur-[60px] -mr-20 -mt-20 group-hover:bg-primary/10 transition-all" />
                                
                                <div className="flex items-start justify-between mb-8 relative z-10">
                                    <div className="size-16 rounded-2xl bg-background border-4 border-border flex items-center justify-center font-black text-primary shadow-premium group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 overflow-hidden shrink-0">
                                        <img src={cat.image_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${cat.id}`} alt="cat" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 group-hover:duration-500">
                                        <button
                                            onClick={() => handleOpenModal(cat)}
                                            className="size-12 bg-background border-4 border-border rounded-xl text-muted-foreground/40 hover:text-primary hover:border-primary/40 transition-all flex items-center justify-center shadow-premium active:scale-95"
                                        >
                                            <Edit2 className="size-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(cat.id)}
                                            className="size-12 bg-background border-4 border-border rounded-xl text-muted-foreground/40 hover:text-rose-500 hover:border-rose-500/40 transition-all flex items-center justify-center shadow-premium active:scale-95"
                                        >
                                            <Trash2 className="size-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-4 relative z-10">
                                    <div className="flex items-center gap-3">
                                        <Tag className="size-4 text-primary opacity-40" />
                                        <h3 className="text-2xl font-black text-foreground italic tracking-tighter uppercase leading-none group-hover:text-primary transition-colors">
                                            {cat.nom}
                                        </h3>
                                    </div>
                                    <p className="text-muted-foreground/60 font-medium text-sm line-clamp-2 italic leading-relaxed border-l-4 border-border pl-6 group-hover:border-primary/20 transition-all">
                                        {cat.description || "Aucune description analytique fournie pour cette classification."}
                                    </p>
                                </div>

                                <div className="mt-8 pt-6 border-t-2 border-border flex items-center justify-between relative z-10">
                                    <span className="text-[10px] font-black text-muted-foreground/20 italic tracking-[0.2em] uppercase">UID: {cat.id.slice(0, 8)}</span>
                                    <ChevronRight className="size-5 text-muted-foreground/20 group-hover:text-primary group-hover:translate-x-2 transition-all" />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal de Modification (Premium Style) */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingCategory ? "RÉVISION TAXONOMIQUE" : "CRÉATION DE CLASSE"}
            >
                <form onSubmit={handleSubmit} className="space-y-10 p-4">
                    <div className="space-y-4">
                        <label className="text-executive-label font-black uppercase tracking-widest text-muted-foreground/40 ml-2 italic">Désignation</label>
                        <input
                            required
                            className="w-full h-16 px-8 rounded-[1.5rem] border-4 border-border bg-background/50 focus:border-primary/40 text-sm font-black italic uppercase tracking-widest outline-none transition-all shadow-inner"
                            placeholder="EX: ÉLECTRONIQUE HAUTE-GAMME"
                            value={formData.nom}
                            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="text-executive-label font-black uppercase tracking-widest text-muted-foreground/40 ml-2 italic">Analytique (Description)</label>
                        <textarea
                            className="w-full h-32 px-8 py-6 rounded-[1.5rem] border-4 border-border bg-background/50 focus:border-primary/40 text-sm font-black italic uppercase tracking-widest outline-none transition-all shadow-inner placeholder:text-muted-foreground/10"
                            placeholder="DÉTAILLEZ LA PORTÉE DE CETTE CATÉGORIE..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="text-executive-label font-black uppercase tracking-widest text-muted-foreground/40 ml-2 italic">Iconographie (URL)</label>
                        <div className="relative group">
                            <ImageIcon className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-muted-foreground/20 group-focus-within:text-primary transition-colors" />
                            <input
                                className="w-full h-16 pl-16 pr-6 rounded-[1.5rem] border-4 border-border bg-background/50 focus:border-primary/40 text-xs font-medium italic outline-none transition-all shadow-inner"
                                placeholder="HTTPS://ASSETS.BCA.GN/ICONS/TECH.SVG"
                                value={formData.image_url}
                                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex gap-6 pt-10">
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="flex-1 h-20 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest text-muted-foreground/30 hover:text-foreground hover:bg-accent transition-all italic underline decoration-4 underline-offset-8 decoration-transparent hover:decoration-border"
                        >
                            Annuler l'Opération
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-primary text-white h-20 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.4em] shadow-premium-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all italic leading-none"
                        >
                            {editingCategory ? "SCELLER LES MODIFICATIONS" : "VALIDER LA TAXONOMIE"}
                        </button>
                    </div>
                </form>
            </Modal>
        </DashboardLayout>
    );
};

export default Categories;
