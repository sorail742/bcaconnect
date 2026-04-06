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
        <DashboardLayout title="ARCHITECTURE_OFFRE_RÉSEAU">
            <div className="space-y-4 animate-in pb-16">

                {/* Executive Command Center — Master Directive */}
                <div className="executive-card !p-4 group overflow-visible">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#FFB703]/[0.02] to-transparent pointer-events-none" />
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="size-6 rounded-[2.2rem] bg-[#FFB703]/10 flex items-center justify-center text-[#FFB703] border border-[#FFB703]/20 shadow-inner group-hover:rotate-6 transition-transform">
                                <Layers className="size-6 shadow-sm" />
                            </div>
                            <div className="space-y-2.5">
                                <h2 className="text-sm font-black text-foreground uppercase tracking-tighter leading-none pt-0.5">
                                    GESTION_<span className="text-[#FFB703]">TAXONOMIE</span>.
                                </h2>
                                <div className="flex items-center gap-3">
                                    <div className="size-2 rounded-full bg-[#FFB703] animate-pulse" />
                                    <p className="text-[10px] font-black text-muted-foreground/80 uppercase  opacity-80 pt-0.5">
                                        OFFRE_NODE SYNC — FLUX_ACTIF_{new Date().toLocaleTimeString('fr-GN', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button 
                                id="btn-refresh-taxo-hub"
                                onClick={fetchCategories} 
                                className="size-6 rounded-[2.2rem] bg-white/[0.03] border border-foreground/10 flex items-center justify-center text-muted-foreground/80 hover:text-[#FFB703] hover:border-[#FFB703]/20 transition-all "
                            >
                                <RefreshCcw className={cn("size-6", isLoading && "animate-spin")} />
                            </button>
                            <button 
                                id="btn-deploy-new-taxon"
                                onClick={() => handleOpenModal()}
                                className="h-11 px-6 bg-[#FFB703] text-background hover:bg-white rounded-2xl font-medium text-sm text-muted-foreground transition-all shadow-[0_30px_90px_rgba(255,183,3,0.3)]  flex items-center gap-3 group/deploy border-0"
                            >
                                <Plus className="size-5" />
                                <span>DÉPLOYER_NOUVELLE_CLASSE</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Dashboard Stats & Search — High Density */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
                    <div className="xl:col-span-4 executive-card group/kpi hover-shine !py-12 flex items-center justify-center gap-3">
                        <div className="size-6 rounded-2xl bg-[#FFB703]/5 border border-[#FFB703]/10 flex items-center justify-center">
                            <Activity className="size-6 text-[#FFB703]" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-muted-foreground uppercase  leading-none pt-1">INDEX_GLOBAL_CLASSES</p>
                            <p className="text-sm font-black text-foreground tabular-nums tracking-tighter leading-none">{categories.length}</p>
                        </div>
                    </div>
                    
                    <div className="xl:col-span-8 executive-card !p-4 flex items-center bg-background/40 border-[#FFB703]/10">
                        <div className="relative group w-full">
                            <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-600 size-5 group-focus-within:text-[#FFB703] transition-colors relative z-10" />
                            <input
                                id="input-search-taxo-ledger"
                                className="w-full pl-20 pr-8 h-11 bg-transparent text-[16px] font-black uppercase tracking-widest placeholder:text-slate-800 text-foreground outline-none"
                                placeholder="FILTRER_LES_CLASSIFICATIONS_RÉSEAU..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {isLoading ? (
                        [1, 2, 3, 4, 5, 6].map(n => <div key={n} className="h-64 bg-white/[0.02] border border-foreground/5 rounded-2xl animate-pulse" />)
                    ) : filtered.length === 0 ? (
                        <div className="lg:col-span-3 py-24 executive-card flex flex-col items-center gap-3 opacity-20 text-center border-dashed border-foreground/10">
                            <LayoutGrid className="size-6 text-foreground" />
                            <p className="text-[14px] font-black uppercase  text-foreground">ARCHITECTURE_VIERGE_DÉPLOYÉE</p>
                        </div>
                    ) : (
                        filtered.map(cat => (
                            <div
                                key={cat.id}
                                className="executive-card p-4 group relative overflow-hidden flex flex-col justify-between h-[340px] hover:border-[#FFB703]/40 transition-all duration-500"
                            >
                                <div className="absolute top-0 right-0 size-6 bg-[#FFB703]/5 rounded-full blur-[60px] -mr-16 -mt-16 group-hover:bg-[#FFB703]/15 transition-all duration-700 pointer-events-none" />

                                <div className="space-y-6">
                                    <div className="flex items-start justify-between">
                                        <div className="size-6 rounded-2xl bg-white/[0.03] border border-foreground/10 p-2 flex items-center justify-center overflow-hidden transition-all duration-700 group-hover:scale-110 group-hover:rotate-3 shadow-2xl">
                                            {cat.image_url ? 
                                                <img src={cat.image_url} alt="" className="w-full h-full object-cover rounded-lg" /> : 
                                                <Tag className="size-6 text-slate-700" />
                                            }
                                        </div>
                                        <div className="flex gap-4 opacity-40 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                id={`btn-edit-taxon-${cat.id}`}
                                                onClick={() => handleOpenModal(cat)} 
                                                className="size-6 bg-white/[0.03] border border-foreground/10 text-muted-foreground/80 hover:text-[#FFB703] hover:border-[#FFB703]/20 rounded-xl flex items-center justify-center transition-all "
                                            >
                                                <Edit2 className="size-6" />
                                            </button>
                                            <button 
                                                id={`btn-delete-taxon-${cat.id}`}
                                                onClick={() => handleDelete(cat.id)} 
                                                className="size-6 bg-white/[0.03] border border-foreground/10 text-muted-foreground/80 hover:text-rose-500 hover:border-rose-500/20 rounded-xl flex items-center justify-center transition-all "
                                            >
                                                <Trash2 className="size-6" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-sm font-black text-foreground uppercase truncate tracking-tight group-hover:text-[#FFB703] transition-colors leading-none">
                                            {cat.nom_categorie}.
                                        </h3>
                                        <p className="text-[12px] text-muted-foreground font-black uppercase tracking-tight border-l-2 border-[#FFB703]/20 pl-6 line-clamp-2 leading-relaxed opacity-60">
                                            {cat.description || "AUCUNE_INDEXATION_DÉTAILLÉE_POUR_CETTE_CLASSE_TAXONOMIQUE."}
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-8 mt-auto border-t border-foreground/5 flex items-center justify-between">
                                    <span className="text-[10px] font-black text-slate-600 uppercase  truncate max-w-[180px]">UID: {cat.id?.slice(0, 16)}</span>
                                    <ChevronRight className="size-5 text-slate-800 group-hover:text-[#FFB703] group-hover:translate-x-2 transition-all duration-500" />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Executive Modal Form — High Density Taxon Deployment */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingCategory ? "RÉVISION_TAXONOMIE_UNITAIRE" : "DÉPLOIEMENT_NOUVEL_ASSET_CLASSE"}
            >
                <form onSubmit={handleSubmit} className="space-y-6 p-4 bg-card">
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase  text-muted-foreground ml-1">DÉSIGNATION_STRUCTURELLE</label>
                            <input
                                required
                                value={formData.nom_categorie}
                                onChange={(e) => setFormData({ ...formData, nom_categorie: e.target.value })}
                                placeholder="ALPHA_CONTRÔLE_..."
                                className="w-full h-11 px-8 bg-white/[0.02] border border-foreground/10 rounded-2xl font-black text-[18px] uppercase tracking-tight text-foreground focus:border-[#FFB703]/40 outline-none transition-all shadow-inner"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase  text-muted-foreground ml-1">DÉFINITION_SYSTÉMIQUE</label>
                            <textarea
                                className="w-full h-40 px-8 py-6 bg-white/[0.02] border border-foreground/10 rounded-2xl text-[14px] font-black uppercase tracking-tight text-foreground outline-none focus:border-[#FFB703]/40 transition-all resize-none shadow-inner placeholder:text-slate-800"
                                placeholder="INJECTION_DATAS_TECHNIQUES_..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase  text-muted-foreground ml-1">IMAGE_PROXY_RÉSEAU (URL)</label>
                            <div className="relative group">
                                <ImageIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 size-6" />
                                <input
                                    value={formData.image_url}
                                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                    placeholder="HTTPS://STORAGE.BCA.GN/ASSETS/..."
                                    className="w-full h-11 pl-16 pr-8 bg-white/[0.02] border border-foreground/10 rounded-2xl font-black text-[12px] uppercase tracking-widest text-[#FFB703] focus:border-[#FFB703]/40 outline-none transition-all shadow-inner"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-8">
                        <button
                            id="btn-confirm-taxon-seal"
                            type="submit"
                            disabled={isSaving}
                            className="w-full h-11 bg-[#FFB703] text-background rounded-2xl font-black text-[13px] uppercase  shadow-[0_30px_70px_rgba(255,183,3,0.3)] hover:bg-white transition-all  border-0 flex items-center justify-center gap-3 group/save"
                        >
                            {isSaving ? <RefreshCcw className="size-6 animate-spin" /> : <CheckCircle2 className="size-6 transition-transform group-hover/save:scale-125" />}
                            <span>{editingCategory ? "SCELLER_MODIFICATION" : "VALIDER_NOUVEL_ASSET"}</span>
                        </button>
                    </div>
                </form>
            </Modal>
        </DashboardLayout>
    );
};

export default Categories;
