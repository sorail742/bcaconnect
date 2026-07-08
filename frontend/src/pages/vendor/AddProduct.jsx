import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
    Package, Image as ImageIcon, Tag, ArrowLeft,
    Save, AlertCircle, Loader2, Sparkles,
    Hash, Zap, Info, Box, PlusCircle,
    ChevronRight, ChevronDown, RefreshCcw, Upload
} from 'lucide-react';
import api from '../../services/api';
import { toast } from 'sonner';
import CreatableSelect from '../../components/ui/CreatableSelect';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';
import aiService from '../../services/aiService';
import { cn } from '../../lib/utils';
import { productSchema } from '../../lib/validation';
import { getCategoryIconComponent } from '../../lib/categoryConstants';
import { offlineStorage } from '../../lib/db';
import { getAttributesForCategory, ATTRIBUTE_COLOR_MAP } from '../../lib/categoryAttributes';
import { Settings2 } from 'lucide-react';
import { useRBAC } from '../../hooks/useRBAC';

/** Aplatit parents + sous-catégories pour le sélecteur produit */
const flattenCategories = (categories = []) => {
    const flat = [];
    for (const cat of categories) {
        flat.push(cat);
        for (const sub of cat.sous_categories || []) {
            flat.push({
                ...sub,
                nom_categorie: `${cat.nom_categorie} › ${sub.nom_categorie}`,
            });
        }
    }
    return flat.sort((a, b) => a.nom_categorie.localeCompare(b.nom_categorie, 'fr'));
};
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
            <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm group">
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
                        <div className="flex items-center gap-1.5">
                            <span className="scale-[0.6] text-[#FF6600]">{getCategoryIconComponent(cat ? cat.nom_categorie : '')}</span>
                            <p className="text-[8px] font-black text-[#FF6600] uppercase tracking-widest leading-none">{cat ? cat.nom_categorie : 'CATÉGORIE'}</p>
                        </div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-foreground uppercase truncate tracking-tight pt-1">
                            {data.nom_produit || 'NOM RÉSEAU'}
                        </h4>
                    </div>

                    <div className="flex items-baseline gap-2 overflow-hidden">
                        <span className="price-text text-slate-900 dark:text-foreground tabular-nums truncate">
                            {price.toLocaleString('fr-GN')}
                        </span>
                        <span className="text-[10px] font-black text-[#FF6600] uppercase tracking-widest shrink-0">GNF</span>
                        {oldPrice > price && oldPrice > 0 && (
                            <span className="text-[10px] text-muted-foreground/40 line-through font-black uppercase tabular-nums ml-auto shrink-0">
                                {oldPrice.toLocaleString('fr-GN')}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900 text-white space-y-4 shadow-xl border border-slate-800 relative overflow-hidden group">
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
    const { can } = useRBAC();
    const canManageCategories = can('manage_categories');

    const [formData, setFormData] = useState({
        nom_produit: '',
        description: '',
        prix_unitaire: '',
        prix_ancien: '',
        stock_quantite: '',
        image_url: '',
        categorie_id: '',
        est_local: true,
        unite_mesure: 'Pièce',
        mots_cles: '',
        attributs: {},
    });

    const [categories, setCategories] = useState([]);
    const categoryOptions = flattenCategories(categories);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [isSuggestingPrice, setIsSuggestingPrice] = useState(false);
    const [priceSuggestion, setPriceSuggestion] = useState(null);

    const handleMagicFill = async (name = formData.nom_produit, analysis = '') => {
        if (!name && !analysis) return;
        
        setIsAiLoading(true);
        try {
            const result = await aiService.suggestProductDetails(name, analysis);
            
            setFormData(prev => ({
                ...prev,
                nom_produit: name || prev.nom_produit,
                description: result.description || prev.description,
                prix_unitaire: result.prix_suggere?.toString() || prev.prix_unitaire,
                unite_mesure: result.unite_suggeree || prev.unite_mesure,
                mots_cles: Array.isArray(result.mots_cles) ? result.mots_cles.join(', ') : (result.mots_cles || prev.mots_cles)
            }));

            // Auto-select category if found
            if (result.categorie_suggeree) {
                const foundCat = categories.find(c => 
                    c.nom_categorie.toLowerCase().includes(result.categorie_suggeree.toLowerCase())
                );
                if (foundCat) {
                    setFormData(prev => ({ ...prev, categorie_id: foundCat.id }));
                    toast.info(`IA : CATÉGORIE "${foundCat.nom_categorie.toUpperCase()}" DÉTECTÉE.`);
                }
            }

            toast.success("IA : FICHE PRODUIT AUTO-COMPLÉTÉE.");
        } catch (err) {
            console.error('Magic Fill error:', err);
        } finally {
            setIsAiLoading(false);
        }
    };

    // DEBOUNCED AI FILL FOR NAME
    useEffect(() => {
        if (!formData.nom_produit || isEditMode || formData.description) return;
        
        const timer = setTimeout(() => {
            if (formData.nom_produit.length > 5 && !formData.description) {
                handleMagicFill(formData.nom_produit);
            }
        }, 2000); // Trigger after 2s of typing pause

        return () => clearTimeout(timer);
    }, [formData.nom_produit]);

    const [errors, setErrors] = useState({});

    useEffect(() => {
        const init = async () => {
            try {
                const cats = await categoryService.getAll();
                setCategories(Array.isArray(cats) ? cats : []);

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
                        unite_mesure: p.unite_mesure || 'Pièce',
                        mots_cles: Array.isArray(p.mots_cles) ? p.mots_cles.join(', ') : (p.mots_cles || ''),
                        attributs: p.preferences_ia || {},
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
    
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validation basique côté client
        if (file.size > 10 * 1024 * 1024) { // Augmenté à 10MB
            toast.error("FICHIER TROP LOURD (MAX 10MO)");
            return;
        }

        const uploadData = new FormData();
        uploadData.append('file', file);

        setIsUploading(true);
        try {
            const response = await api.post('/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (response.data?.url) {
                setFormData(prev => ({ ...prev, image_url: response.data.url }));
                toast.success("IMAGE TÉLÉCHARGÉE AVEC SUCCÈS.");

                // AI ANALYSIS TRIGGER
                toast.info("L'IA ANALYSE VOTRE IMAGE...");
                try {
                    const analysis = await aiService.analyzeImage(file);
                    if (analysis && analysis.description) {
                        await handleMagicFill(formData.nom_produit, analysis.description);
                    }
                } catch (aiErr) {
                    console.error('AI Analysis failed, but upload succeeded:', aiErr);
                    // On ne bloque pas si l'IA échoue
                }
            }
        } catch (err) {
            console.error('Erreur upload:', err);
            toast.error("ÉCHEC DU TÉLÉCHARGEMENT DE L'IMAGE.");
        } finally {
            setIsUploading(false);
        }
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
        try {
            // Transformation des types pour Zod
            const dataToValidate = {
                ...formData,
                prix_unitaire: parseFloat(formData.prix_unitaire || '0'),
                stock_quantite: parseInt(formData.stock_quantite || '0')
            };

            productSchema.parse(dataToValidate);
            setErrors({});
            return true;
        } catch (error) {
            const newErrors = {};
            error.errors.forEach(err => {
                newErrors[err.path[0]] = err.message;
            });
            setErrors(newErrors);
            return false;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) {
            toast.error("VÉRIFIEZ LES CHAMPS D'INDEXATION.");
            return;
        }

        setIsLoading(true);
        const payload = {
            nom_produit: formData.nom_produit.trim(),
            description: formData.description.trim(),
            prix_unitaire: parseFloat(formData.prix_unitaire),
            prix_ancien: formData.prix_ancien ? parseFloat(formData.prix_ancien) : null,
            stock_quantite: parseInt(formData.stock_quantite),
            image_url: formData.image_url.trim() || null,
            categorie_id: formData.categorie_id || null,
            est_local: formData.est_local,
            unite_mesure: formData.unite_mesure || 'Pièce',
            mots_cles: formData.mots_cles.split(',').map(k => k.trim()).filter(k => k),
            preferences_ia: formData.attributs || {},
        };

        // GESTION HORS-LIGNE PROACTIVE
        if (!navigator.onLine) {
            try {
                await offlineStorage.queueProduct(payload);
                toast.success("MODE HORS-LIGNE : PRODUIT MIS EN FILE D'ATTENTE.");
                navigate('/vendor/products');
                return;
            } catch (err) {
                toast.error("ERREUR DE STOCKAGE LOCAL.");
                return;
            } finally {
                setIsLoading(false);
            }
        }

        try {
            if (isEditMode) {
                await productService.update(id, payload);
                toast.success("ACTIF MIS À JOUR.");
            } else {
                await productService.create(payload);
                toast.success("ACTIF RÉFÉRENCÉ.");
            }
            navigate('/vendor/products');
        } catch (err) {
            console.error('Submission error:', err);
            
            // FALLBACK RÉACTIF : Si erreur réseau pendant l'envoi
            if (!err.response || err.code === 'ERR_NETWORK') {
                await offlineStorage.queueProduct(payload);
                toast.warning("RÉSEAU INSTABLE : PRODUIT SAUVEGARDÉ LOCALEMENT.");
                navigate('/vendor/products');
            } else {
                const backendMsg = err.response?.data?.errors?.[0]?.message || err.response?.data?.message || "ERREUR LORS DE L'ÉCRITURE RÉSEAU.";
                toast.error(backendMsg);
            }
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
        <DashboardLayout title={isEditMode ? "Modifier l'Article" : "Nouveau Produit"} noPadding>
            <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-8 space-y-8 custom-scrollbar">

                <div className="premium-card p-4 relative overflow-hidden">
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 relative z-10">
                        <div className="flex items-center gap-3">
                            <button 
                                id="btn-back-catalogue-node"
                                onClick={() => navigate('/vendor/products')} 
                                className="size-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary transition-all "
                            >
                                <ArrowLeft className="size-5" />
                            </button>
                            <div className="space-y-2.5">
                                <h2 className="text-sm font-black text-foreground uppercase tracking-tighter leading-none pt-0.5">
                                    {isEditMode ? "RÉVISION_ASSET" : "ENREGISTREMENT_UNITÉ"}.
                                </h2>
                                <div className="flex items-center gap-3">
                                    <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <p className="text-[10px] font-black text-muted-foreground/80 uppercase  opacity-80 pt-0.5">
                                    {isEditMode ? "Modification en cours" : "Nouvel article"} — {new Date().toLocaleTimeString('fr-GN', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                                <button
                                    id="btn-master-save-directive"
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                    className="h-12 px-8 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-slate-200 flex items-center gap-3 group/save border-0"
                                >
                                {isLoading ? <Loader2 className="size-5 animate-spin" /> : <Save className="size-5 transition-all group-hover/save:scale-125" />}
                                <span>{isEditMode ? "Mettre à jour" : "Publier l'article"}</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
                    <div className="xl:col-span-8 space-y-4">
                        {/* Technical Data Hub — Asset Identity */}
                        <div className="premium-card p-8 space-y-8 relative overflow-hidden group/hub">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.02] grayscale group-hover/hub:grayscale-0 group-hover/hub:rotate-0 rotate-12 group-hover/hub:scale-125 transition-all duration-1000">
                                <Box className="size-48" />
                            </div>

                            <div className="flex items-center gap-3 relative z-20">
                                <div className="size-10 rounded-2xl bg-amber-50 flex items-center justify-center border border-amber-100 group-hover/hub:rotate-6 transition-transform">
                                    <Hash className="size-5 text-amber-500" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-lg font-black text-slate-900 uppercase leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>Informations Produit</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Identification de l'article</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3 relative z-20">
                                <FormField label="Nom du Produit" required error={errors.nom_produit}>
                                    <div className="relative group/field flex gap-2">
                                        <div className="relative flex-1">
                                            <Tag className="absolute left-6 top-1/2 -translate-y-1/2 size-4 text-slate-300 group-focus-within/field:text-primary transition-all" />
                                            <input
                                                id="input-asset-nom"
                                                name="nom_produit"
                                                value={formData.nom_produit}
                                                onChange={handleChange}
                                                placeholder="EX: ÉCOUTEURS BLUETOOTH V5..."
                                                className="w-full h-12 pl-14 pr-6 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold uppercase tracking-tight focus:ring-2 focus:ring-primary/20 outline-none transition-all text-slate-900"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleMagicFill()}
                                            disabled={isAiLoading || !formData.nom_produit}
                                            className="h-12 px-6 bg-primary/10 text-primary rounded-2xl flex items-center gap-2 hover:bg-primary/20 transition-all disabled:opacity-50 group/magic"
                                            title="Auto-remplir avec l'IA"
                                        >
                                            {isAiLoading ? (
                                                <Loader2 className="size-4 animate-spin" />
                                            ) : (
                                                <Sparkles className="size-4 group-hover/magic:scale-125 transition-transform" />
                                            )}
                                            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Magic Fill</span>
                                        </button>
                                    </div>
                                </FormField>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <FormField label="Prix Unitaire (GNF)" required error={errors.prix_unitaire}>
                                        <div className="relative group/field">
                                            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-primary font-black text-[10px] z-10 tracking-widest">GNF</div>
                                            <input
                                                id="input-asset-price"
                                                name="prix_unitaire"
                                                type="number"
                                                value={formData.prix_unitaire}
                                                onChange={handleChange}
                                                className="w-full h-12 pl-16 pr-6 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all text-slate-900 tabular-nums"
                                            />
                                        </div>
                                    </FormField>

                                    <FormField label="Quantité en Stock" required error={errors.stock_quantite}>
                                        <div className="relative group/field">
                                            <Package className="absolute left-6 top-1/2 -translate-y-1/2 size-4 text-slate-300 group-focus-within/field:text-primary transition-all" />
                                            <input
                                                id="input-asset-stock"
                                                name="stock_quantite"
                                                type="number"
                                                value={formData.stock_quantite}
                                                onChange={handleChange}
                                                className="w-full h-12 pl-14 pr-6 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all text-slate-900 tabular-nums"
                                            />
                                        </div>
                                    </FormField>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <FormField label="Catégorie" required error={errors.categorie_id}>
                                        {categoryOptions.length === 0 ? (
                                            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-amber-700">
                                                Aucune catégorie disponible. Contactez l&apos;administrateur ou relancez le backend.
                                            </div>
                                        ) : (
                                            <CreatableSelect
                                                options={categoryOptions.map(c => ({ id: c.id, label: c.nom_categorie }))}
                                                value={formData.categorie_id}
                                                onChange={(val) => {
                                                    setFormData(prev => ({ ...prev, categorie_id: val }));
                                                    if (errors.categorie_id) setErrors(prev => ({ ...prev, categorie_id: null }));
                                                }}
                                                placeholder="Sélectionner une catégorie..."
                                                onCreate={canManageCategories ? async (newCatName) => {
                                                    try {
                                                        const newCat = await categoryService.create({
                                                            nom_categorie: newCatName,
                                                            description: "Catégorie créée lors de l'ajout d'un produit.",
                                                        });
                                                        setCategories(prev => [...prev, newCat]);
                                                        setFormData(prev => ({ ...prev, categorie_id: newCat.id }));
                                                        toast.success(`NOUVELLE CATÉGORIE "${newCatName.toUpperCase()}" CRÉÉE.`);
                                                    } catch {
                                                        toast.error("ÉCHEC DE LA CRÉATION DE LA CATÉGORIE.");
                                                    }
                                                } : undefined}
                                            />
                                        )}
                                    </FormField>

                                    <FormField label="Ancien Prix (optionnel)">
                                        <div className="relative group/field">
                                            <RefreshCcw className="absolute left-6 top-1/2 -translate-y-1/2 size-4 text-slate-300 group-focus-within/field:text-primary transition-all" />
                                            <input
                                                id="input-asset-old-price"
                                                name="prix_ancien"
                                                type="number"
                                                value={formData.prix_ancien}
                                                onChange={handleChange}
                                                className="w-full h-12 pl-14 pr-6 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all text-slate-400 tabular-nums line-through decoration-slate-200"
                                            />
                                        </div>
                                    </FormField>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <FormField label="Unité de Mesure" error={errors.unite_mesure}>
                                        <div className="relative group/field">
                                            <Box className="absolute left-6 top-1/2 -translate-y-1/2 size-4 text-slate-300 group-focus-within/field:text-primary transition-all" />
                                            <input
                                                name="unite_mesure"
                                                value={formData.unite_mesure}
                                                onChange={handleChange}
                                                placeholder="Pièce, Kg, Paire, Carton..."
                                                className="w-full h-12 pl-14 pr-6 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold uppercase outline-none focus:ring-2 focus:ring-primary/20 transition-all text-slate-900"
                                            />
                                        </div>
                                    </FormField>

                                    <FormField label="Mots Clés (Séparés par des virgules)">
                                        <div className="relative group/field">
                                            <Hash className="absolute left-6 top-1/2 -translate-y-1/2 size-4 text-slate-300 group-focus-within/field:text-primary transition-all" />
                                            <input
                                                name="mots_cles"
                                                value={formData.mots_cles}
                                                onChange={handleChange}
                                                placeholder="promo, nouveau, bio..."
                                                className="w-full h-12 pl-14 pr-6 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold uppercase outline-none focus:ring-2 focus:ring-primary/20 transition-all text-slate-900"
                                            />
                                        </div>
                                    </FormField>
                                </div>

                                <FormField label="Description du Produit">
                                    <div className="relative group/field">
                                        <Info className="absolute left-6 top-4 size-4 text-slate-300 group-focus-within/field:text-primary transition-all" />
                                        <textarea
                                            id="input-asset-desc"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            rows="5"
                                            placeholder="DÉCRIVEZ VOTRE PRODUIT EN DÉTAIL POUR VOS CLIENTS..."
                                            className="w-full p-4 pl-14 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-primary/20 outline-none text-xs font-bold uppercase tracking-tight transition-all text-slate-900 resize-none"
                                        />
                                    </div>
                                </FormField>

                                {/* ✨ DYNAMIC ATTRIBUTES SECTION */}
                                {(() => {
                                    const selectedCat = categories.find(c => c.id === formData.categorie_id);
                                    const attrConfig = getAttributesForCategory(selectedCat?.nom_categorie);
                                    if (!attrConfig) return null;
                                    const colors = ATTRIBUTE_COLOR_MAP[attrConfig.color] || ATTRIBUTE_COLOR_MAP.blue;
                                    return (
                                        <div className={cn('rounded-3xl border p-6 space-y-6 transition-all duration-500 animate-in fade-in slide-in-from-top-4', colors.bg, colors.border)}>
                                            {/* Header */}
                                            <div className="flex items-center gap-3">
                                                <div className={cn('size-10 rounded-2xl flex items-center justify-center border', colors.bg, colors.border)}>
                                                    <Settings2 className={cn('size-5', colors.text)} />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{attrConfig.label}</h4>
                                                    <p className={cn('text-[10px] font-bold uppercase tracking-widest', colors.label)}>
                                                        {attrConfig.fields.length} caractéristiques spécifiques à renseigner
                                                    </p>
                                                </div>
                                                <span className={cn('ml-auto px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest', colors.badge)}>
                                                    {selectedCat?.nom_categorie}
                                                </span>
                                            </div>

                                            {/* Fields Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {attrConfig.fields.map(field => (
                                                    <div key={field.key} className="space-y-2">
                                                        <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-500 ml-1 flex items-center gap-1">
                                                            {field.label}
                                                            {field.unit && <span className={cn('text-[8px] px-1.5 py-0.5 rounded font-black uppercase', colors.badge)}>{field.unit}</span>}
                                                        </label>
                                                        {field.type === 'select' ? (
                                                            <select
                                                                value={formData.attributs?.[field.key] || ''}
                                                                onChange={e => setFormData(prev => ({ ...prev, attributs: { ...prev.attributs, [field.key]: e.target.value } }))}
                                                                className="w-full h-11 px-4 bg-white border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                                            >
                                                                <option value="">-- Sélectionner --</option>
                                                                {field.options.map(opt => (
                                                                    <option key={opt} value={opt}>{opt}</option>
                                                                ))}
                                                            </select>
                                                        ) : (
                                                            <div className="relative">
                                                                <input
                                                                    type={field.type === 'number' || field.type === 'year' ? 'number' : 'text'}
                                                                    value={formData.attributs?.[field.key] || ''}
                                                                    onChange={e => setFormData(prev => ({ ...prev, attributs: { ...prev.attributs, [field.key]: e.target.value } }))}
                                                                    placeholder={field.placeholder}
                                                                    min={field.type === 'year' ? 1950 : undefined}
                                                                    max={field.type === 'year' ? new Date().getFullYear() + 1 : undefined}
                                                                    className="w-full h-11 pl-4 pr-4 bg-white border border-slate-100 rounded-2xl text-xs font-bold uppercase outline-none focus:ring-2 focus:ring-primary/20 transition-all text-slate-900 placeholder:normal-case placeholder:font-medium"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })()}

                                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-between group/local transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-xs font-black shadow-lg shadow-emerald-200">GN</div>
                                        <div className="space-y-0.5">
                                            <p className="text-[11px] font-black text-slate-900 uppercase leading-none">Produit d'origine locale</p>
                                            <p className="text-[9px] font-bold text-emerald-600/60 uppercase tracking-widest leading-none">Valorisation du patrimoine</p>
                                        </div>
                                    </div>
                                    <input
                                        id="input-asset-local"
                                        type="checkbox"
                                        name="est_local"
                                        checked={formData.est_local}
                                        onChange={handleChange}
                                        className="size-6 rounded-lg border-2 border-emerald-200 bg-white text-emerald-500 focus:ring-emerald-500/20 cursor-pointer transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="premium-card p-8 space-y-6 relative overflow-hidden group/ai">
                            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-200 via-primary to-amber-200 opacity-20" />
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100 group-hover/ai:rotate-6 transition-transform duration-700">
                                        <Sparkles className="size-5 text-amber-500" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>Smart <span className="text-primary">Hub</span> IA.</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Analyse prédictive du marché</p>
                                    </div>
                                </div>
                                <button
                                    id="btn-ai-audit-trigger"
                                    onClick={handleSuggestPrice}
                                    disabled={isSuggestingPrice}
                                    className="h-12 px-8 bg-white border border-slate-100 text-slate-900 hover:bg-slate-50 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm active:scale-95 disabled:opacity-30 flex items-center gap-3 group/abtn"
                                >
                                    {isSuggestingPrice ? <Loader2 className="size-4 animate-spin text-primary" /> : <Zap className="size-4 text-amber-500 transition-transform group-hover/abtn:scale-125" />}
                                    Analyser le marché
                                </button>
                            </div>

                            {priceSuggestion && (
                                <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 animate-in zoom-in-95 fade-in duration-700 shadow-inner">
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                        <div className="lg:col-span-5 space-y-6">
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">Prix recommandé</p>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-5xl font-black tracking-tighter tabular-nums text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                                        {priceSuggestion.prix_recommande.toLocaleString('fr-GN')}
                                                    </span>
                                                    <span className="text-sm font-black text-primary uppercase tracking-widest">GNF</span>
                                                </div>
                                            </div>
                                            <button
                                                id="btn-apply-ai-directive"
                                                onClick={applyPriceSuggestion}
                                                className="w-full h-12 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:opacity-90 transition-all border-0"
                                            >
                                                Appliquer ce prix
                                            </button>
                                        </div>
                                        <div className="lg:col-span-7 space-y-6">
                                            <div className="flex items-center gap-3">
                                                <div className="size-2 rounded-full bg-primary animate-pulse" />
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Analyse du marché</p>
                                            </div>
                                            <p className="text-xs font-bold leading-relaxed text-slate-600 uppercase tracking-tight">
                                                {priceSuggestion.raisonnement}
                                            </p>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 rounded-xl bg-white border border-slate-100 space-y-2">
                                                    <p className="text-[9px] font-black text-slate-300 uppercase leading-none">Prix Min</p>
                                                    <p className="text-xs font-black text-slate-700 tabular-nums tracking-tighter leading-none">
                                                        {priceSuggestion.fourchette_min?.toLocaleString()} <span className="text-[10px] opacity-20">GNF</span>
                                                    </p>
                                                </div>
                                                <div className="p-4 rounded-xl bg-white border border-slate-100 space-y-2">
                                                    <p className="text-[9px] font-black text-slate-300 uppercase leading-none">Prix Max</p>
                                                    <p className="text-xs font-black text-slate-700 tabular-nums tracking-tighter leading-none">
                                                        {priceSuggestion.fourchette_max?.toLocaleString()} <span className="text-[10px] opacity-20">GNF</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Media Terminal Section — HD Proxy Asset */}
                        <div className="premium-card p-8 space-y-8 relative group/media overflow-hidden">
                            <div className="flex items-center gap-3 relative z-20">
                                <div className="size-10 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/10 group-hover/media:scale-110 transition-transform">
                                    <ImageIcon className="size-5 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-lg font-black text-slate-900 uppercase leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>Média Visuel</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Catalogue Haute-Résolution</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div 
                                    onClick={() => document.getElementById('product-image-upload').click()}
                                    className={cn(
                                        "relative group/upload h-32 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all hover:border-primary/40 hover:bg-primary/[0.02] overflow-hidden",
                                        isUploading && "pointer-events-none opacity-50"
                                    )}
                                >
                                    {isUploading ? (
                                        <Loader2 className="size-6 text-primary animate-spin" />
                                    ) : (
                                        <>
                                            <div className="size-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover/upload:scale-110 transition-transform">
                                                <Upload className="size-5 text-slate-400 group-hover/upload:text-primary" />
                                            </div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">TÉLÉVERSER IMAGE HD</p>
                                        </>
                                    )}
                                    <input 
                                        id="product-image-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileUpload}
                                    />
                                </div>

                                <FormField label="Ou via un lien URL (Direct)">
                                    <div className="relative group/field h-full flex flex-col justify-center">
                                        <PlusCircle className="absolute left-6 top-1/2 -translate-y-1/2 size-4 text-slate-300 group-focus-within/field:text-primary transition-all" />
                                        <input
                                            id="input-asset-image-proxy"
                                            name="image_url"
                                            type="url"
                                            value={formData.image_url}
                                            onChange={handleChange}
                                            placeholder="HTTPS://IMAGE-HOST.COM/..."
                                            className="w-full h-12 pl-14 pr-6 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-bold uppercase tracking-widest focus:ring-2 focus:ring-primary/20 outline-none transition-all text-primary"
                                        />
                                    </div>
                                </FormField>
                            </div>
                        </div>
                    </div>

                    <div className="xl:col-span-4">
                        <ProductPreview data={formData} categories={categoryOptions} />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AddProduct;

