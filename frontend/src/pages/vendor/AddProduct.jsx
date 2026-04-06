import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
    Package, Image as ImageIcon, Tag, ArrowLeft,
    Save, AlertCircle, Loader2, Sparkles,
    Hash, Zap, Info, Box, PlusCircle,
    ChevronRight, RefreshCcw
} from 'lucide-react';
import { toast } from 'sonner';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';
import aiService from '../../services/aiService';
import { cn } from '../../lib/utils';

const FormField = ({ label, required, children, error }) => (
    <div className="space-y-2.5">
        <label className="text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground/80 ml-1 flex items-center gap-2">
            {label}
            {required && <span className="text-[#FF6600] text-sm leading-none">·</span>}
        </label>
        {children}
        {error && (
            <p className="text-[9px] text-rose-500 font-black uppercase tracking-widest flex items-center gap-2 ml-1 animate-in slide-in-from-left-2 transition-all">
                <AlertCircle className="size-3" /> {error}
            </p>
        )}
    </div>
);

const ProductPreview = ({ data, categories }) => {
    const cat = categories.find(c => c.id === data.categorie_id);
    const price = parseFloat(data.prix_unitaire || 0);
    const oldPrice = parseFloat(data.prix_ancien || 0);
    const discount = oldPrice > price && oldPrice > 0
        ? Math.round(((oldPrice - price) / oldPrice) * 100)
        : null;

    return (
        <div className="sticky top-28 space-y-6">
            <div className="bg-white dark:bg-[#0F1219] rounded-2xl overflow-hidden border border-slate-200 dark:border-foreground/5 shadow-sm group">
                <div className="relative aspect-square bg-slate-50 dark:bg-white/[0.02] overflow-hidden flex items-center justify-center border-b border-slate-100 dark:border-foreground/5">
                    {data.image_url ? (
                        <img
                            src={data.image_url}
                            alt=""
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-4 text-slate-300">
                            <ImageIcon className="size-6 opacity-20" />
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-40">APERCU VISUEL HD</p>
                        </div>
                    )}

                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {discount && (
                            <div className="px-3 py-1 bg-[#FF6600] text-foreground text-[8px] font-black uppercase tracking-widest rounded-lg shadow-lg">
                                -{discount}%
                            </div>
                        )}
                        {data.est_local && (
                            <div className="px-3 py-1 bg-emerald-500 text-foreground text-[8px] font-black uppercase tracking-widest rounded-lg shadow-lg">
                                LOCAL 🇬🇳
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 space-y-4">
                    <div className="space-y-1">
                        <p className="text-[8px] font-black text-[#FF6600] uppercase tracking-widest leading-none">{cat ? cat.nom_categorie : 'CATÉGORIE'}</p>
                        <h4 className="text-sm font-black text-slate-900 dark:text-foreground uppercase truncate tracking-tight pt-1">
                            {data.nom_produit || 'NOM RÉSEAU'}
                        </h4>
                    </div>

                    <div className="flex items-baseline gap-3">
                        <span className="text-sm font-black text-slate-900 dark:text-foreground tracking-tighter tabular-nums">
                            {price.toLocaleString('fr-GN')} <small className="text-[9px] font-black text-[#FF6600]">GNF</small>
                        </span>
                        {oldPrice > price && oldPrice > 0 && (
                            <span className="text-[10px] text-muted-foreground/80 line-through font-black uppercase tabular-nums">
                                {oldPrice.toLocaleString('fr-GN')}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 text-foreground space-y-4 shadow-xl border border-slate-800 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF6600]/20 to-transparent opacity-40" />
                <p className="text-[9px] font-black uppercase tracking-widest text-[#FF6600] flex items-center gap-2 relative z-10">
                    <Sparkles className="size-4" /> CONSEIL MARCHAND
                </p>
                <div className="text-[10px] text-foreground/60 font-black uppercase tracking-widest leading-relaxed space-y-3 relative z-10">
                    <p className="flex items-start gap-2">
                        <span className="text-[#FF6600] mt-0.5">•</span>
                        <span>UN TITRE COURT ET PRÉCIS MAXIMISE VOTRE VISIBILITÉ RÉSEAU.</span>
                    </p>
                    <p className="flex items-start gap-2">
                        <span className="text-[#FF6600] mt-0.5">•</span>
                        <span>L'ORIGINE LOCALE EST UN ARGUMENT DE POIDS POUR LE MARCHÉ GUINÉEN.</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

const AddProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        nom_produit: '',
        description: '',
        prix_unitaire: '',
        prix_ancien: '',
        stock_quantite: '',
        image_url: '',
        categorie_id: '',
        est_local: true,
    });

    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);
    const [isSuggestingPrice, setIsSuggestingPrice] = useState(false);
    const [priceSuggestion, setPriceSuggestion] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const init = async () => {
            try {
                const cats = await categoryService.getAll();
                setCategories(cats || []);

                if (isEditMode) {
                    const p = await productService.getById(id);
                    setFormData({
                        nom_produit: p.nom_produit || '',
                        description: p.description || '',
                        prix_unitaire: p.prix_unitaire || '',
                        prix_ancien: p.prix_ancien || '',
                        stock_quantite: p.stock_quantite ?? '',
                        image_url: (p.images && p.images[0]?.url_image) || p.image_url || '',
                        categorie_id: p.categorie_id || '',
                        est_local: p.est_local ?? true,
                    });
                }
            } catch (err) {
                toast.error("ÉCHEC DE LA RÉCUPÉRATION DES DONNÉES RÉSEAU.");
            } finally {
                setIsInitializing(false);
            }
        };
        init();
    }, [id, isEditMode]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleSuggestPrice = async () => {
        if (!formData.nom_produit.trim()) {
            toast.warning("NOM REQUIS POUR L'AUDIT IA.");
            return;
        }
        const cat = categories.find(c => c.id === formData.categorie_id);
        setIsSuggestingPrice(true);
        setPriceSuggestion(null);
        try {
            const suggestion = await aiService.suggestPrice(
                formData.nom_produit,
                cat?.nom_categorie || 'Général',
                formData.description
            );
            setPriceSuggestion(suggestion);
            toast.success("AUDIT IA TERMINÉ.");
        } catch (err) {
            toast.error("MODULE IA TEMPORAIREMENT INDISPONIBLE.");
        } finally {
            setIsSuggestingPrice(false);
        }
    };

    const applyPriceSuggestion = () => {
        if (!priceSuggestion) return;
        setFormData(prev => ({ ...prev, prix_unitaire: priceSuggestion.prix_recommande.toString() }));
        setPriceSuggestion(null);
        toast.success("INDEXATION IA APPLIQUÉE.");
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.nom_produit.trim()) newErrors.nom_produit = "NOM REQUIS POUR INDEXATION.";
        if (!formData.prix_unitaire || parseFloat(formData.prix_unitaire) <= 0) newErrors.prix_unitaire = "PRIX RÉSEAU INVALIDE.";
        if (formData.stock_quantite === '' || parseInt(formData.stock_quantite) < 0) newErrors.stock_quantite = "QUANTITÉ INVALIDE.";
        if (!formData.categorie_id) newErrors.categorie_id = "CATÉGORIE REQUISE.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) {
            toast.error("VÉRIFIEZ LES CHAMPS D'INDEXATION.");
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                nom_produit: formData.nom_produit.trim(),
                description: formData.description.trim(),
                prix_unitaire: parseFloat(formData.prix_unitaire),
                prix_ancien: formData.prix_ancien ? parseFloat(formData.prix_ancien) : null,
                stock_quantite: parseInt(formData.stock_quantite),
                image_url: formData.image_url.trim() || null,
                categorie_id: formData.categorie_id || null,
                est_local: formData.est_local,
            };

            if (isEditMode) {
                await productService.update(id, payload);
                toast.success("ACTIF MIS À JOUR.");
            } else {
                await productService.create(payload);
                toast.success("ACTIF RÉFÉRENCÉ.");
            }
            navigate('/vendor/products');
        } catch (err) {
            toast.error("ERREUR LORS DE L'ÉCRITURE RÉSEAU.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isInitializing) {
        return (
            <DashboardLayout title="SYNC...">
                <div className="flex items-center justify-center min-h-[50vh]">
                    <div className="size-6 rounded-xl border-4 border-slate-100 border-t-[#FF6600] animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title={isEditMode ? "ÉDITION_ACTIF_RÉSEAU" : "INDEXATION_NOUVEL_ACTIF"}>
            <div className="space-y-4 animate-in pb-16">

                {/* Executive Command Center — Master Directive */}
                <div className="executive-card !p-4 group overflow-visible">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#FFB703]/[0.02] to-transparent pointer-events-none" />
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 relative z-10">
                        <div className="flex items-center gap-3">
                            <button 
                                id="btn-back-catalogue-node"
                                onClick={() => navigate('/vendor/products')} 
                                className="size-6 rounded-[2.2rem] bg-white/[0.03] border border-foreground/10 flex items-center justify-center text-muted-foreground/80 hover:text-[#FFB703] hover:border-[#FFB703]/20 transition-all "
                            >
                                <ArrowLeft className="size-6" />
                            </button>
                            <div className="space-y-2.5">
                                <h2 className="text-sm font-black text-foreground uppercase tracking-tighter leading-none pt-0.5">
                                    {isEditMode ? "RÉVISION_ASSET" : "ENREGISTREMENT_UNITÉ"}.
                                </h2>
                                <div className="flex items-center gap-3">
                                    <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <p className="text-[10px] font-black text-muted-foreground/80 uppercase  opacity-80 pt-0.5">
                                        VND_NODE SYNC — FLUX_ACTIF_{new Date().toLocaleTimeString('fr-GN', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                id="btn-master-save-directive"
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="h-11 px-6 bg-white text-background hover:bg-[#FFB703] rounded-2xl font-medium text-sm text-muted-foreground transition-all shadow-[0_30px_90px_rgba(0,0,0,0.5)]  flex items-center gap-3 group/save border-0"
                            >
                                {isLoading ? <Loader2 className="size-5 animate-spin" /> : <Save className="size-5 transition-all group-hover/save:scale-125" />}
                                <span>{isEditMode ? "ACTUALISER_INDEX" : "PUBLIER_SUR_RÉSEAU"}</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
                    <div className="xl:col-span-8 space-y-4">
                        {/* Technical Data Hub — Asset Identity */}
                        <div className="executive-card group/hub overflow-hidden hover-shine !p-4 space-y-4">
                            <div className="absolute top-0 right-0 p-4 opacity-[0.05] grayscale group-hover/hub:grayscale-0 group-hover/hub:rotate-0 rotate-12 group-hover/hub:scale-125 transition-all duration-1000">
                                <Box className="size-60" />
                            </div>

                            <div className="flex items-center gap-3 relative z-20">
                                <div className="size-6 rounded-2xl bg-[#FFB703]/10 flex items-center justify-center border border-[#FFB703]/20 shadow-inner group-hover/hub:rotate-6 transition-transform">
                                    <Hash className="size-6 text-[#FFB703]" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-[15px] font-black text-foreground uppercase  leading-none pt-0.5">MÉTADATA_STRUCTURELLES</h3>
                                    <p className="text-[9px] font-black text-muted-foreground uppercase  leading-none">IDENTIFICATION_NODALE_ET_VALEUR</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3 relative z-20">
                                <FormField label="DÉSIGNATION_STRUCTURELLE_ACTIF" required error={errors.nom_produit}>
                                    <div className="relative group/field">
                                        <Tag className="absolute left-7 top-1/2 -translate-y-1/2 size-5 text-slate-600 group-focus-within/field:text-[#FFB703] transition-all" />
                                        <input
                                            id="input-asset-nom"
                                            name="nom_produit"
                                            value={formData.nom_produit}
                                            onChange={handleChange}
                                            placeholder="DESIGNATION_ALPHA_..."
                                            className="w-full h-11 pl-20 pr-8 bg-white/[0.01] border border-foreground/10 rounded-2xl text-[18px] font-black uppercase tracking-tight focus:border-[#FFB703]/40 outline-none transition-all text-foreground shadow-inner"
                                        />
                                    </div>
                                </FormField>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <FormField label="COTATION_UNITAIRE_INDEX" required error={errors.prix_unitaire}>
                                        <div className="relative group/field">
                                            <div className="absolute left-7 top-1/2 -translate-y-1/2 text-[#FFB703] font-black text-xs z-10 tracking-widest">GNF</div>
                                            <input
                                                id="input-asset-price"
                                                name="prix_unitaire"
                                                type="number"
                                                value={formData.prix_unitaire}
                                                onChange={handleChange}
                                                className="w-full h-11 pl-20 pr-8 bg-white/[0.01] border border-foreground/10 rounded-2xl text-sm font-black outline-none focus:border-[#FFB703]/40 transition-all text-foreground tabular-nums"
                                            />
                                        </div>
                                    </FormField>

                                    <FormField label="UNITÉS_DISPONIBLES" required error={errors.stock_quantite}>
                                        <div className="relative group/field">
                                            <Package className="absolute left-7 top-1/2 -translate-y-1/2 size-5 text-slate-600 group-focus-within/field:text-[#FFB703] transition-all" />
                                            <input
                                                id="input-asset-stock"
                                                name="stock_quantite"
                                                type="number"
                                                value={formData.stock_quantite}
                                                onChange={handleChange}
                                                className="w-full h-11 pl-20 pr-8 bg-white/[0.01] border border-foreground/10 rounded-2xl text-sm font-black outline-none focus:border-[#FFB703]/40 transition-all text-foreground tabular-nums"
                                            />
                                        </div>
                                    </FormField>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <FormField label="NODALE_CATÉGORIE" required error={errors.categorie_id}>
                                        <div className="relative group/field">
                                            <Box className="absolute left-7 top-1/2 -translate-y-1/2 size-5 text-slate-600 group-focus-within/field:text-[#FFB703] transition-all" />
                                            <select
                                                id="input-asset-cat"
                                                name="categorie_id"
                                                value={formData.categorie_id}
                                                onChange={handleChange}
                                                className="w-full h-11 pl-20 pr-12 bg-white/[0.01] border border-foreground/10 rounded-2xl text-[12px] font-black uppercase  focus:border-[#FFB703]/40 outline-none transition-all text-foreground appearance-none"
                                            >
                                                <option value="" className="bg-card">SÉLECTIONNER_NODAL...</option>
                                                {categories.map(cat => (
                                                    <option key={cat.id} value={cat.id} className="bg-card">{cat.nom_categorie.toUpperCase()}</option>
                                                ))}
                                            </select>
                                            <ChevronRight className="absolute right-8 top-1/2 -translate-y-1/2 size-5 text-slate-600 pointer-events-none group-focus-within/field:rotate-90 transition-transform duration-500" />
                                        </div>
                                    </FormField>

                                    <FormField label="INDEX_ANTÉRIEUR_OPT">
                                        <div className="relative group/field">
                                            <RefreshCcw className="absolute left-7 top-1/2 -translate-y-1/2 size-5 text-slate-600 group-focus-within/field:text-[#FFB703] transition-all" />
                                            <input
                                                id="input-asset-old-price"
                                                name="prix_ancien"
                                                type="number"
                                                value={formData.prix_ancien}
                                                onChange={handleChange}
                                                className="w-full h-11 pl-20 pr-8 bg-white/[0.01] border border-foreground/10 rounded-2xl text-sm font-black outline-none focus:border-[#FFB703]/40 transition-all text-slate-600 tabular-nums line-through decoration-[#FFB703]/20"
                                            />
                                        </div>
                                    </FormField>
                                </div>

                                <FormField label="SPÉCIFICATIONS_TECHNIQUES_DÉTAILLÉES">
                                    <div className="relative group/field">
                                        <Info className="absolute left-7 top-4 size-5 text-slate-600 group-focus-within/field:text-[#FFB703] transition-all" />
                                        <textarea
                                            id="input-asset-desc"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            rows="6"
                                            placeholder="INJECTION_DATAS_TECHNIQUES_..."
                                            className="w-full p-4 pl-20 rounded-2xl bg-white/[0.01] border border-foreground/10 focus:border-[#FFB703]/40 outline-none text-[14px] font-black uppercase tracking-tight transition-all text-foreground resize-none shadow-inner"
                                        />
                                    </div>
                                </FormField>

                                <label className="relative flex items-center justify-between p-4 rounded-2xl bg-emerald-500/[0.03] cursor-pointer group/local border border-emerald-500/10 hover:bg-emerald-500/[0.06] transition-all ">
                                    <div className="flex items-center gap-3">
                                        <div className="size-6 rounded-2xl bg-emerald-500 text-background flex items-center justify-center text-sm shadow-[0_20px_50px_rgba(16,185,129,0.3)] group-hover/local:rotate-6 transition-transform relative z-10 font-bold">GN</div>
                                        <div className="space-y-2 relative z-10">
                                            <p className="text-[14px] font-black text-emerald-400 uppercase  leading-none">CERTIFICATION_ORIGINE_LOCALE</p>
                                            <p className="text-[10px] font-black text-emerald-500/50 uppercase  leading-none">VALORISATION_DU_PATRIMOINE_UNITAIRE</p>
                                        </div>
                                    </div>
                                    <input
                                        id="input-asset-local"
                                        type="checkbox"
                                        name="est_local"
                                        checked={formData.est_local}
                                        onChange={handleChange}
                                        className="size-6 rounded-2xl border-2 border-emerald-500/30 bg-black text-emerald-500 focus:ring-emerald-500 cursor-pointer transition-all relative z-10"
                                    />
                                </label>
                            </div>
                        </div>

                        {/* AI Smart-Hub Centre — HUD Intelligence */}
                        <div className="executive-card group/ai overflow-hidden shadow-[0_50px_120px_rgba(0,0,0,0.6)] !p-0">
                            <div className="p-4 space-y-4 relative">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,183,3,0.15),transparent)] pointer-events-none" />
                                
                                <div className="relative z-10 space-y-4">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="size-6 rounded-[2.2rem] bg-white/[0.05] backdrop-blur-3xl border border-foreground/10 flex items-center justify-center shadow-2xl group-hover/ai:rotate-6 transition-transform duration-700">
                                                <Sparkles className="size-6 text-[#FFB703] drop-shadow-[0_0_20px_rgba(255,183,3,0.8)]" />
                                            </div>
                                            <div className="space-y-3">
                                                <h3 className="text-sm font-black text-foreground uppercase tracking-tighter leading-none pt-0.5">SMART_<span className="text-[#FFB703]">HUB</span>_AI.</h3>
                                                <p className="text-[10px] font-black text-foreground/40 uppercase  leading-none">PROTOCOLE_V4.8 — ANALYSE_RÉSEAU</p>
                                            </div>
                                        </div>
                                        <button
                                            id="btn-ai-audit-trigger"
                                            onClick={handleSuggestPrice}
                                            disabled={isSuggestingPrice}
                                            className="h-11 px-14 bg-white text-background rounded-2xl font-black text-[13px] uppercase  hover:bg-[#FFB703] hover:text-background transition-all shadow-[0_30px_70px_rgba(255,183,3,0.2)]  disabled:opacity-30 border-0 flex items-center gap-3 group/abtn"
                                        >
                                            {isSuggestingPrice ? <Loader2 className="size-6 animate-spin" /> : <Zap className="size-6 transition-transform group-hover/abtn:scale-125" />}
                                            EXÉCUTER_AUDIT_VALEUR
                                        </button>
                                    </div>

                                    {priceSuggestion && (
                                        <div className="p-14 rounded-2xl bg-white/[0.02] backdrop-blur-3xl border border-foreground/10 animate-in zoom-in-95 fade-in duration-700 shadow-inner">
                                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
                                                <div className="lg:col-span-5 space-y-6">
                                                    <div className="space-y-4">
                                                        <p className="text-[10px] font-black text-[#FFB703] uppercase  opacity-60 pt-0.5">RECOMMANDATION_POINT_INDICE</p>
                                                        <div className="flex items-baseline gap-3">
                                                            <span className="text-7xl font-black tracking-tighter tabular-nums text-foreground">
                                                                {priceSuggestion.prix_recommande.toLocaleString('fr-GN')}
                                                            </span>
                                                            <span className="text-[14px] font-black text-[#FFB703] uppercase ">GNF</span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        id="btn-apply-ai-directive"
                                                        onClick={applyPriceSuggestion}
                                                        className="w-full h-11 bg-[#FFB703] text-background rounded-2xl font-black text-[13px] uppercase  shadow-[0_25px_60px_rgba(255,183,3,0.35)] hover:bg-white transition-all  border-0"
                                                    >
                                                        APPLIQUER_LA_DIRECTIVE
                                                    </button>
                                                </div>
                                                <div className="lg:col-span-7 space-y-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="size-3 rounded-full bg-[#FFB703] animate-ping" />
                                                        <p className="text-[10px] font-black text-foreground/40 uppercase  leading-none pt-0.5">ANALYSE_PARAMÉTRIQUE_SYSTÈME</p>
                                                    </div>
                                                    <p className="text-[17px] font-black leading-relaxed text-foreground uppercase tracking-tight opacity-90">
                                                        {priceSuggestion.raisonnement}
                                                    </p>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-6">
                                                        <div className="p-4 rounded-2xl bg-white/[0.03] border border-foreground/5 space-y-4">
                                                            <p className="text-[10px] font-black text-foreground/30 uppercase  leading-none pt-1">FLUX_MIN</p>
                                                            <p className="text-sm font-black text-foreground tabular-nums tracking-tighter leading-none">
                                                                {priceSuggestion.fourchette_min?.toLocaleString()} <span className="text-[12px] opacity-20">GNF</span>
                                                            </p>
                                                        </div>
                                                        <div className="p-4 rounded-2xl bg-white/[0.03] border border-foreground/5 space-y-4">
                                                            <p className="text-[10px] font-black text-foreground/30 uppercase  leading-none pt-1">FLUX_MAX</p>
                                                            <p className="text-sm font-black text-foreground tabular-nums tracking-tighter leading-none">
                                                                {priceSuggestion.fourchette_max?.toLocaleString()} <span className="text-[12px] opacity-20">GNF</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Media Terminal Section — HD Proxy Asset */}
                        <div className="executive-card group/media !p-4 space-y-4">
                            <div className="flex items-center gap-3 text-[#FFB703] relative z-20">
                                <div className="size-6 rounded-2xl bg-[#FFB703]/10 flex items-center justify-center border border-[#FFB703]/20 shadow-inner group-hover/media:scale-110 transition-transform">
                                    <ImageIcon className="size-6" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-[15px] font-black text-foreground uppercase  leading-none pt-0.5">FLUX_VISUEL_HD</h3>
                                    <p className="text-[9px] font-black text-muted-foreground uppercase  leading-none">PROXY_MÉDIA_ET_INDEXATION_VISUELLE</p>
                                </div>
                            </div>
                            <FormField label="URL_SOURCE_ACTIF_MÉDIA">
                                <div className="relative group/field">
                                    <PlusCircle className="absolute left-7 top-1/2 -translate-y-1/2 size-5 text-slate-600 group-focus-within/field:text-[#FFB703] transition-all" />
                                    <input
                                        id="input-asset-image-proxy"
                                        name="image_url"
                                        type="url"
                                        value={formData.image_url}
                                        onChange={handleChange}
                                        placeholder="HTTPS://STORAGE.BCA.GN/UNITS/..."
                                        className="w-full h-11 pl-20 pr-8 bg-white/[0.01] border border-foreground/10 rounded-2xl text-[14px] font-black uppercase tracking-widest focus:border-[#FFB703]/40 outline-none transition-all text-[#FFB703]"
                                    />
                                </div>
                            </FormField>
                        </div>
                    </div>

                    <div className="xl:col-span-4">
                        <ProductPreview data={formData} categories={categories} />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AddProduct;

