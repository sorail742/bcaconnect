import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
    Package, Image as ImageIcon, Tag, ArrowLeft,
    Save, AlertCircle, Loader2, Sparkles,
    Hash, Zap, Info, Box, PlusCircle,
    ChevronRight, ChevronDown, RefreshCcw, Upload,
    X, Star, ImagePlus
} from 'lucide-react';
import api from '../../services/api';
import { toast } from 'sonner';
import CreatableSelect from '../../components/ui/CreatableSelect';
import productService from '../services/productService';
import categoryService from '../../category/services/categoryService';
import aiService from '../../ai/services/aiService';
import { cn } from '../../lib/utils';
import { productSchema } from '../../lib/validation';
import { getCategoryIconComponent } from '../../category/lib/categoryConstants';
import { offlineStorage } from '../../lib/db';
import { getAttributesForCategory, ATTRIBUTE_COLOR_MAP, mapAiResponseToAttributs, filterAttributsForProfile } from '../../category/lib/categoryAttributes';
import { Settings2 } from 'lucide-react';
import { useRBAC } from '../../hooks/useRBAC';

const MAX_PRODUCT_IMAGES = 8;

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
            {required && <span className="text-[#1CA0DB] text-sm leading-none">·</span>}
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
            <div className="bg-card rounded-3xl overflow-hidden border border-border shadow-sm group">
                <div className="relative aspect-square bg-slate-50 dark:bg-white/[0.02] overflow-hidden flex items-center justify-center border-b border-slate-100 dark:border-foreground/5">
                    {data.images?.[0] ? (
                        <img
                            src={data.images[0]}
                            alt=""
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-4 text-muted-foreground">
                            <ImageIcon className="size-6 opacity-20" />
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-40">APERCU VISUEL HD</p>
                        </div>
                    )}

                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {discount && (
                            <div className="px-3 py-1 bg-[#1CA0DB] text-foreground text-[8px] font-black uppercase tracking-widest rounded-lg shadow-lg">
                                -{discount}%
                            </div>
                        )}
                        {data.images?.length > 1 && (
                            <div className="px-3 py-1 bg-slate-900/80 text-white text-[8px] font-black uppercase tracking-widest rounded-lg shadow-lg flex items-center gap-1.5">
                                <ImageIcon className="size-3" /> {data.images.length} photos
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
                            <span className="scale-[0.6] text-[#1CA0DB]">{getCategoryIconComponent(cat ? cat.nom_categorie : '')}</span>
                            <p className="text-[8px] font-black text-[#1CA0DB] uppercase tracking-widest leading-none">{cat ? cat.nom_categorie : 'CATÉGORIE'}</p>
                        </div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-foreground uppercase truncate tracking-tight pt-1">
                            {data.nom_produit || 'NOM RÉSEAU'}
                        </h4>
                    </div>

                    <div className="flex items-baseline gap-2 overflow-hidden">
                        <span className="price-text text-slate-900 dark:text-foreground tabular-nums truncate">
                            {price.toLocaleString('fr-GN')}
                        </span>
                        <span className="text-[10px] font-black text-[#1CA0DB] uppercase tracking-widest shrink-0">GNF</span>
                        {oldPrice > price && oldPrice > 0 && (
                            <span className="text-[10px] text-muted-foreground/40 line-through font-black uppercase tabular-nums ml-auto shrink-0">
                                {oldPrice.toLocaleString('fr-GN')}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="dark p-5 rounded-3xl bg-card text-foreground space-y-4 shadow-xl border border-border relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#1CA0DB]/20 to-transparent opacity-40" />
                <p className="text-[9px] font-black uppercase tracking-widest text-[#1CA0DB] flex items-center gap-2 relative z-10">
                    <Sparkles className="size-4" /> CONSEIL MARCHAND
                </p>
                <div className="text-[10px] text-foreground/60 font-black uppercase tracking-widest leading-relaxed space-y-3 relative z-10">
                    <p className="flex items-start gap-2">
                        <span className="text-[#1CA0DB] mt-0.5">•</span>
                        <span>UN TITRE COURT ET PRÉCIS MAXIMISE VOTRE VISIBILITÉ RÉSEAU.</span>
                    </p>
                    <p className="flex items-start gap-2">
                        <span className="text-[#1CA0DB] mt-0.5">•</span>
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
        images: [],
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
    const [priceInsight, setPriceInsight] = useState(null);

    const handleMagicFill = async (name = formData.nom_produit, analysis = '', options = {}) => {
        if (!name && !analysis) return;

        const cat = categories.find(c => c.id === formData.categorie_id);
        const categoryName = options.categorie || cat?.nom_categorie || '';
        const attrProfile = getAttributesForCategory(categoryName, name);

        setIsAiLoading(true);
        setPriceInsight(null);
        try {
            const result = await aiService.suggestProductDetails(name, analysis, categoryName);
            const mappedAttributs = mapAiResponseToAttributs(attrProfile, result);

            if (result.prix_fourchette_min || result.prix_fourchette_max) {
                setPriceInsight({
                    prix_recommande: result.prix_suggere,
                    fourchette_min: result.prix_fourchette_min,
                    fourchette_max: result.prix_fourchette_max,
                    justification: result.prix_justification,
                });
            }

            setFormData(prev => {
                const nextCatId = (() => {
                    if (result.categorie_suggeree) {
                        const foundCat = categories.find(c =>
                            c.nom_categorie.toLowerCase().includes(result.categorie_suggeree.toLowerCase())
                            || result.categorie_suggeree.toLowerCase().includes(c.nom_categorie.toLowerCase())
                        );
                        if (foundCat) return foundCat.id;
                    }
                    return prev.categorie_id;
                })();

                const selectedCat = categories.find(c => c.id === nextCatId);
                const profile = getAttributesForCategory(selectedCat?.nom_categorie || categoryName, name || prev.nom_produit);
                const mergedAttributs = {
                    ...filterAttributsForProfile(prev.attributs, profile),
                    ...mappedAttributs,
                };

                return {
                    ...prev,
                    nom_produit: name || prev.nom_produit,
                    description: result.description || prev.description,
                    prix_unitaire: result.prix_suggere?.toString() || prev.prix_unitaire,
                    unite_mesure: result.unite_suggeree || prev.unite_mesure,
                    mots_cles: Array.isArray(result.mots_cles) ? result.mots_cles.join(', ') : (result.mots_cles || prev.mots_cles),
                    categorie_id: nextCatId,
                    attributs: mergedAttributs,
                };
            });

            if (result.categorie_suggeree) {
                const foundCat = categories.find(c =>
                    c.nom_categorie.toLowerCase().includes(result.categorie_suggeree.toLowerCase())
                );
                if (foundCat) {
                    toast.info(`IA : CATÉGORIE « ${foundCat.nom_categorie.toUpperCase()} » DÉTECTÉE.`);
                }
            }

            const filledCount = Object.keys(mappedAttributs).length;
            if (filledCount > 0) {
                toast.success(`IA : ${filledCount} CARACTÉRISTIQUE${filledCount > 1 ? 'S' : ''} COMPLÉTÉE${filledCount > 1 ? 'S' : ''}.`);
            } else {
                toast.success('IA : FICHE PRODUIT AUTO-COMPLÉTÉE.');
            }
        } catch (err) {
            console.error('Magic Fill error:', err);
            toast.error("L'IA N'A PAS PU COMPLÉTER LA FICHE. RÉESSAYEZ.");
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleCategoryChange = (categorieId) => {
        const selectedCat = categories.find(c => c.id === categorieId);
        const profile = getAttributesForCategory(selectedCat?.nom_categorie, formData.nom_produit);
        setFormData(prev => ({
            ...prev,
            categorie_id: categorieId,
            attributs: filterAttributsForProfile(prev.attributs, profile),
        }));
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
                        images: p.images?.length > 0
                            ? p.images.map(img => img.url_image)
                            : (p.image_url ? [p.image_url] : []),
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
    
    const handleFilesAdd = async (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        e.target.value = ''; // permet de re-sélectionner le même fichier plus tard

        const room = MAX_PRODUCT_IMAGES - formData.images.length;
        if (room <= 0) {
            toast.error(`MAXIMUM ${MAX_PRODUCT_IMAGES} PHOTOS PAR PRODUIT.`);
            return;
        }

        const wasEmpty = formData.images.length === 0;
        const toUpload = files.slice(0, room);
        if (files.length > toUpload.length) {
            toast.warning(`SEULES ${toUpload.length} PHOTO(S) AJOUTÉE(S) (LIMITE DE ${MAX_PRODUCT_IMAGES}).`);
        }

        const validFiles = toUpload.filter(file => {
            if (file.size > 10 * 1024 * 1024) { // 10MB max
                toast.error(`${file.name.toUpperCase()} TROP LOURD (MAX 10MO)`);
                return false;
            }
            return true;
        });
        if (!validFiles.length) return;

        setIsUploading(true);
        try {
            const uploadedUrls = [];
            for (const file of validFiles) {
                const uploadData = new FormData();
                uploadData.append('file', file);
                const response = await api.post('/upload', uploadData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                if (response.data?.url) uploadedUrls.push(response.data.url);
            }

            if (uploadedUrls.length) {
                setFormData(prev => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
                toast.success(`${uploadedUrls.length} PHOTO(S) TÉLÉCHARGÉE(S) AVEC SUCCÈS.`);

                // AI ANALYSIS TRIGGER — uniquement sur la toute première image du produit
                if (wasEmpty) {
                    toast.info("L'IA ANALYSE VOTRE IMAGE...");
                    try {
                        const analysis = await aiService.analyzeImage(validFiles[0]);
                        if (analysis && analysis.description) {
                            await handleMagicFill(formData.nom_produit, analysis.description);
                        }
                    } catch (aiErr) {
                        console.error('AI Analysis failed, but upload succeeded:', aiErr);
                        // On ne bloque pas si l'IA échoue
                    }
                }
            }
        } catch (err) {
            console.error('Erreur upload:', err);
            toast.error("ÉCHEC DU TÉLÉCHARGEMENT D'UNE OU PLUSIEURS IMAGES.");
        } finally {
            setIsUploading(false);
        }
    };

    const removeImage = (index) => {
        setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
    };

    const setCoverImage = (index) => {
        setFormData(prev => {
            if (index === 0) return prev;
            const images = [...prev.images];
            const [chosen] = images.splice(index, 1);
            images.unshift(chosen);
            return { ...prev, images };
        });
    };

    const addImageUrl = (url) => {
        const trimmed = url.trim();
        if (!trimmed) return;
        if (formData.images.length >= MAX_PRODUCT_IMAGES) {
            toast.error(`MAXIMUM ${MAX_PRODUCT_IMAGES} PHOTOS PAR PRODUIT.`);
            return;
        }
        setFormData(prev => ({ ...prev, images: [...prev.images, trimmed] }));
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
        if (formData.images.length === 0) {
            toast.error("AJOUTEZ AU MOINS UNE PHOTO DU PRODUIT.");
            return;
        }

        setIsLoading(true);
        const payload = {
            nom_produit: formData.nom_produit.trim(),
            description: formData.description.trim(),
            prix_unitaire: parseFloat(formData.prix_unitaire),
            prix_ancien: formData.prix_ancien ? parseFloat(formData.prix_ancien) : null,
            stock_quantite: parseInt(formData.stock_quantite),
            images: formData.images,
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
                    <div className="size-6 rounded-xl border-4 border-border border-t-[#1CA0DB] animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title={isEditMode ? "Modifier l'Article" : "Nouveau Produit"} noPadding>
            <div className="min-h-screen bg-background p-6 lg:p-8 space-y-8 custom-scrollbar">

                <div className="premium-card p-4 relative overflow-hidden">
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 relative z-10">
                        <div className="flex items-center gap-3">
                            <button
                                id="btn-back-catalogue-node"
                                onClick={() => navigate('/vendor/products')}
                                className="size-10 rounded-xl bg-muted border border-border flex items-center justify-center text-muted-foreground hover:text-primary transition-all "
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
                                    className="h-12 px-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-slate-200 dark:shadow-black/30 flex items-center gap-3 group/save border-0"
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
                                <div className="size-10 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center border border-amber-100 dark:border-amber-500/20 group-hover/hub:rotate-6 transition-transform">
                                    <Hash className="size-5 text-amber-500" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-lg font-black text-foreground uppercase leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>Informations Produit</h3>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Identification de l'article</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3 relative z-20">
                                <FormField label="Nom du Produit" required error={errors.nom_produit}>
                                    <div className="relative group/field flex gap-2">
                                        <div className="relative flex-1">
                                            <Tag className="absolute left-6 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within/field:text-primary transition-all" />
                                            <input
                                                id="input-asset-nom"
                                                name="nom_produit"
                                                value={formData.nom_produit}
                                                onChange={handleChange}
                                                placeholder="EX: ÉCOUTEURS BLUETOOTH V5..."
                                                className="w-full h-12 pl-14 pr-6 bg-muted border border-border rounded-2xl text-xs font-bold uppercase tracking-tight focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground"
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
                                                className="w-full h-12 pl-16 pr-6 bg-muted border border-border rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground tabular-nums"
                                            />
                                        </div>
                                    </FormField>

                                    <FormField label="Quantité en Stock" required error={errors.stock_quantite}>
                                        <div className="relative group/field">
                                            <Package className="absolute left-6 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within/field:text-primary transition-all" />
                                            <input
                                                id="input-asset-stock"
                                                name="stock_quantite"
                                                type="number"
                                                value={formData.stock_quantite}
                                                onChange={handleChange}
                                                className="w-full h-12 pl-14 pr-6 bg-muted border border-border rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground tabular-nums"
                                            />
                                        </div>
                                    </FormField>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <FormField label="Catégorie" required error={errors.categorie_id}>
                                        {categoryOptions.length === 0 ? (
                                            <div className="rounded-2xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400">
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
                                            <RefreshCcw className="absolute left-6 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within/field:text-primary transition-all" />
                                            <input
                                                id="input-asset-old-price"
                                                name="prix_ancien"
                                                type="number"
                                                value={formData.prix_ancien}
                                                onChange={handleChange}
                                                className="w-full h-12 pl-14 pr-6 bg-muted border border-border rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all text-muted-foreground tabular-nums line-through decoration-border"
                                            />
                                        </div>
                                    </FormField>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <FormField label="Unité de Mesure" error={errors.unite_mesure}>
                                        <div className="relative group/field">
                                            <Box className="absolute left-6 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within/field:text-primary transition-all" />
                                            <input
                                                name="unite_mesure"
                                                value={formData.unite_mesure}
                                                onChange={handleChange}
                                                placeholder="Pièce, Kg, Paire, Carton..."
                                                className="w-full h-12 pl-14 pr-6 bg-muted border border-border rounded-2xl text-xs font-bold uppercase outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                                            />
                                        </div>
                                    </FormField>

                                    <FormField label="Mots Clés (Séparés par des virgules)">
                                        <div className="relative group/field">
                                            <Hash className="absolute left-6 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within/field:text-primary transition-all" />
                                            <input
                                                name="mots_cles"
                                                value={formData.mots_cles}
                                                onChange={handleChange}
                                                placeholder="promo, nouveau, bio..."
                                                className="w-full h-12 pl-14 pr-6 bg-muted border border-border rounded-2xl text-xs font-bold uppercase outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                                            />
                                        </div>
                                    </FormField>
                                </div>

                                <FormField label="Description du Produit">
                                    <div className="relative group/field">
                                        <Info className="absolute left-6 top-4 size-4 text-muted-foreground group-focus-within/field:text-primary transition-all" />
                                        <textarea
                                            id="input-asset-desc"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            rows="5"
                                            placeholder="DÉCRIVEZ VOTRE PRODUIT EN DÉTAIL POUR VOS CLIENTS..."
                                            className="w-full p-4 pl-14 rounded-2xl bg-muted border border-border focus:ring-2 focus:ring-primary/20 outline-none text-xs font-bold uppercase tracking-tight transition-all text-foreground resize-none"
                                        />
                                    </div>
                                </FormField>

                                {/* ✨ DYNAMIC ATTRIBUTES SECTION */}
                                {(() => {
                                    const selectedCat = categories.find(c => c.id === formData.categorie_id);
                                    const attrConfig = getAttributesForCategory(selectedCat?.nom_categorie, formData.nom_produit);
                                    if (!attrConfig) return null;
                                    const colors = ATTRIBUTE_COLOR_MAP[attrConfig.color] || ATTRIBUTE_COLOR_MAP.blue;
                                    return (
                                        <div className={cn('rounded-3xl border p-6 space-y-6 transition-all duration-500 animate-in fade-in slide-in-from-top-4', colors.bg, colors.border)}>
                                            {/* Header */}
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <div className={cn('size-10 rounded-2xl flex items-center justify-center border', colors.bg, colors.border)}>
                                                    <Settings2 className={cn('size-5', colors.text)} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-black text-foreground uppercase tracking-tight">{attrConfig.label}</h4>
                                                    <p className={cn('text-[10px] font-bold uppercase tracking-widest', colors.label)}>
                                                        {attrConfig.fields.length} caractéristiques spécifiques — complétées par Magic Fill ci-dessus
                                                    </p>
                                                </div>
                                                <span className={cn('px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest', colors.badge)}>
                                                    {selectedCat?.nom_categorie}
                                                </span>
                                            </div>

                                            {/* Fields Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {attrConfig.fields.map(field => (
                                                    <div key={field.key} className="space-y-2">
                                                        <label className="text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground ml-1 flex items-center gap-1">
                                                            {field.label}
                                                            {field.unit && <span className={cn('text-[8px] px-1.5 py-0.5 rounded font-black uppercase', colors.badge)}>{field.unit}</span>}
                                                        </label>
                                                        {field.type === 'select' ? (
                                                            <select
                                                                value={formData.attributs?.[field.key] || ''}
                                                                onChange={e => setFormData(prev => ({ ...prev, attributs: { ...prev.attributs, [field.key]: e.target.value } }))}
                                                                className="w-full h-11 px-4 bg-card border border-border rounded-2xl text-xs font-bold text-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-all"
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
                                                                    className="w-full h-11 pl-4 pr-4 bg-card border border-border rounded-2xl text-xs font-bold uppercase outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground placeholder:normal-case placeholder:font-medium"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })()}

                                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-between group/local transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-xs font-black shadow-lg shadow-emerald-200">GN</div>
                                        <div className="space-y-0.5">
                                            <p className="text-[11px] font-black text-foreground uppercase leading-none">Produit d'origine locale</p>
                                            <p className="text-[9px] font-bold text-emerald-600/60 dark:text-emerald-400/70 uppercase tracking-widest leading-none">Valorisation du patrimoine</p>
                                        </div>
                                    </div>
                                    <input
                                        id="input-asset-local"
                                        type="checkbox"
                                        name="est_local"
                                        checked={formData.est_local}
                                        onChange={handleChange}
                                        className="size-6 rounded-lg border-2 border-emerald-200 dark:border-emerald-500/30 bg-card text-emerald-500 focus:ring-emerald-500/20 cursor-pointer transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {priceInsight && (
                            <div className="premium-card p-8 space-y-6 relative overflow-hidden group/ai animate-in zoom-in-95 fade-in duration-700">
                                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-200 via-primary to-amber-200 opacity-20" />
                                <div className="flex items-center gap-3 relative z-10">
                                    <div className="size-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center border border-amber-100 dark:border-amber-500/20 group-hover/ai:rotate-6 transition-transform duration-700">
                                        <Zap className="size-5 text-amber-500" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-black text-foreground uppercase tracking-tighter leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>Analyse <span className="text-primary">Prix</span> IA.</h3>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Estimée par Magic Fill — déjà appliquée au prix unitaire</p>
                                    </div>
                                </div>

                                <div className="p-8 rounded-3xl bg-muted border border-border shadow-inner relative z-10">
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                        <div className="lg:col-span-5 space-y-2">
                                            <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">Prix recommandé</p>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-5xl font-black tracking-tighter tabular-nums text-foreground" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                                    {priceInsight.prix_recommande?.toLocaleString('fr-GN')}
                                                </span>
                                                <span className="text-sm font-black text-primary uppercase tracking-widest">GNF</span>
                                            </div>
                                        </div>
                                        <div className="lg:col-span-7 space-y-6">
                                            <p className="text-xs font-bold leading-relaxed text-muted-foreground uppercase tracking-tight">
                                                {priceInsight.justification}
                                            </p>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 rounded-xl bg-card border border-border space-y-2">
                                                    <p className="text-[9px] font-black text-muted-foreground uppercase leading-none">Prix Min</p>
                                                    <p className="text-xs font-black text-foreground tabular-nums tracking-tighter leading-none">
                                                        {priceInsight.fourchette_min?.toLocaleString()} <span className="text-[10px] opacity-20">GNF</span>
                                                    </p>
                                                </div>
                                                <div className="p-4 rounded-xl bg-card border border-border space-y-2">
                                                    <p className="text-[9px] font-black text-muted-foreground uppercase leading-none">Prix Max</p>
                                                    <p className="text-xs font-black text-foreground tabular-nums tracking-tighter leading-none">
                                                        {priceInsight.fourchette_max?.toLocaleString()} <span className="text-[10px] opacity-20">GNF</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Media Terminal Section — Galerie multi-images (style Alibaba) */}
                        <div className="premium-card p-8 space-y-8 relative group/media overflow-hidden">
                            <div className="flex items-center gap-3 relative z-20">
                                <div className="size-10 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/10 group-hover/media:scale-110 transition-transform">
                                    <ImageIcon className="size-5 text-primary" />
                                </div>
                                <div className="space-y-1 flex-1">
                                    <h3 className="text-lg font-black text-foreground uppercase leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>Média Visuel</h3>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                                        Galerie produit — {formData.images.length}/{MAX_PRODUCT_IMAGES} photos · la première est la couverture
                                    </p>
                                </div>
                            </div>

                            {/* Grille de vignettes : cliquer une vignette = la définir comme couverture */}
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                                {formData.images.map((url, index) => (
                                    <div
                                        key={index}
                                        className={cn(
                                            "relative aspect-square rounded-2xl overflow-hidden border-2 group/thumb cursor-pointer bg-muted",
                                            index === 0 ? "border-primary shadow-lg shadow-primary/10" : "border-border hover:border-primary/40"
                                        )}
                                        onClick={() => setCoverImage(index)}
                                        title={index === 0 ? "Photo de couverture" : "Définir comme couverture"}
                                    >
                                        <img src={url} alt="" className="w-full h-full object-cover" />
                                        {index === 0 && (
                                            <div className="absolute bottom-0 inset-x-0 bg-primary text-white text-[8px] font-black uppercase tracking-widest text-center py-1 flex items-center justify-center gap-1">
                                                <Star className="size-2.5 fill-current" /> Couverture
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                                            className="absolute top-1.5 right-1.5 size-6 rounded-full bg-slate-900/70 text-white flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity hover:bg-rose-500"
                                        >
                                            <X className="size-3.5" />
                                        </button>
                                    </div>
                                ))}

                                {formData.images.length < MAX_PRODUCT_IMAGES && (
                                    <div
                                        onClick={() => !isUploading && document.getElementById('product-image-upload').click()}
                                        className={cn(
                                            "relative group/upload aspect-square border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:border-primary/40 hover:bg-primary/[0.02]",
                                            isUploading && "pointer-events-none opacity-50"
                                        )}
                                    >
                                        {isUploading ? (
                                            <Loader2 className="size-5 text-primary animate-spin" />
                                        ) : (
                                            <>
                                                <ImagePlus className="size-5 text-muted-foreground group-hover/upload:text-primary transition-colors" />
                                                <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground text-center px-1">Ajouter</p>
                                            </>
                                        )}
                                        <input
                                            id="product-image-upload"
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            className="hidden"
                                            onChange={handleFilesAdd}
                                        />
                                    </div>
                                )}
                            </div>

                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
                                Conseil : 4 à 8 photos nettes (produit seul, en situation, détails, packaging) augmentent nettement la confiance des acheteurs — comme sur les grandes places de marché B2B.
                            </p>

                            <FormField label="Ajouter aussi via un lien URL (optionnel)">
                                <div className="relative group/field flex gap-2">
                                    <div className="relative flex-1">
                                        <PlusCircle className="absolute left-6 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within/field:text-primary transition-all" />
                                        <input
                                            id="input-asset-image-proxy"
                                            type="url"
                                            placeholder="HTTPS://IMAGE-HOST.COM/..."
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addImageUrl(e.currentTarget.value);
                                                    e.currentTarget.value = '';
                                                }
                                            }}
                                            className="w-full h-12 pl-14 pr-6 bg-muted border border-border rounded-2xl text-[10px] font-bold uppercase tracking-widest focus:ring-2 focus:ring-primary/20 outline-none transition-all text-primary"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            const input = e.currentTarget.previousElementSibling.querySelector('input');
                                            addImageUrl(input.value);
                                            input.value = '';
                                        }}
                                        className="h-12 px-5 bg-muted border border-border rounded-2xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary hover:border-primary/30 transition-all"
                                    >
                                        Ajouter
                                    </button>
                                </div>
                            </FormField>
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

