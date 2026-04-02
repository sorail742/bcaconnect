import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
    Package, Image as ImageIcon, Tag, Layers, ArrowLeft,
    Save, AlertCircle, Loader2, Sparkles, TrendingDown,
    Hash, ShieldCheck, Zap, ChevronRight, Info, CheckCircle2,
    X
} from 'lucide-react';
import { toast } from 'sonner';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';
import aiService from '../../services/aiService';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const FormField = ({ label, required, children, error }) => (
    <div className="space-y-3">
        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-1 flex items-center gap-2">
            {label}
            {required && <span className="text-primary text-lg leading-none">·</span>}
        </label>
        {children}
        {error && (
            <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest italic flex items-center gap-2 ml-2">
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
        <div className="sticky top-28 space-y-8 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-xl group">
                <div className="relative aspect-square bg-slate-50 dark:bg-slate-800/50 overflow-hidden flex items-center justify-center">
                    {data.image_url ? (
                        <img
                            src={data.image_url}
                            alt=""
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-4 text-slate-200">
                            <ImageIcon className="size-16" />
                            <p className="text-[10px] font-bold uppercase tracking-widest">Aperçu Visuel</p>
                        </div>
                    )}

                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {discount && (
                            <div className="px-3 py-1 bg-primary text-white text-[9px] font-bold uppercase tracking-widest rounded-lg shadow-lg">
                                -{discount}%
                            </div>
                        )}
                        {data.est_local && (
                            <div className="px-3 py-1 bg-emerald-500 text-white text-[9px] font-bold uppercase tracking-widest rounded-lg shadow-lg">
                                Local 🇬🇳
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-8 space-y-4">
                    <div className="space-y-1">
                        <p className="text-[9px] font-bold text-primary uppercase tracking-[0.2em]">{cat ? cat.nom_categorie : 'Catégorie'}</p>
                        <h4 className="text-xl font-bold text-slate-900 dark:text-white uppercase truncate">
                            {data.nom_produit || 'Nom de l\'article'}
                        </h4>
                    </div>

                    <div className="flex items-baseline gap-3">
                        <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                            {price.toLocaleString('fr-GN')} <small className="text-[10px] font-bold text-primary not-italic">GNF</small>
                        </span>
                        {oldPrice > price && oldPrice > 0 && (
                            <span className="text-xs text-slate-400 line-through font-bold">
                                {oldPrice.toLocaleString('fr-GN')}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-8 rounded-[2rem] bg-slate-900 text-white space-y-4 shadow-xl border border-slate-800">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                    <Sparkles className="size-4" /> Conseil Marchand
                </p>
                <div className="text-[11px] text-slate-400 font-medium leading-relaxed italic space-y-3">
                    <p>• Un titre clair augmente le taux de clic de 45%.</p>
                    <p>• Les articles avec description détaillée se vendent 2x mieux.</p>
                    <p>• L'origine locale 🇬🇳 est un atout majeur pour nos clients.</p>
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
                        image_url: p.image_url || '',
                        categorie_id: p.categorie_id || '',
                        est_local: p.est_local ?? true,
                    });
                }
            } catch (err) {
                toast.error("Impossible de récupérer les données.");
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
            toast.warning("Nom requis pour l'analyse.");
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
            toast.success("Analyse IA complétée.");
        } catch (err) {
            toast.error("Le service d'audit IA est temporairement indisponible.");
        } finally {
            setIsSuggestingPrice(false);
        }
    };

    const applyPriceSuggestion = () => {
        if (!priceSuggestion) return;
        setFormData(prev => ({ ...prev, prix_unitaire: priceSuggestion.prix_recommande.toString() }));
        setPriceSuggestion(null);
        toast.success("Prix suggéré appliqué.");
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.nom_produit.trim()) newErrors.nom_produit = "Nom requis.";
        if (!formData.prix_unitaire || parseFloat(formData.prix_unitaire) <= 0) newErrors.prix_unitaire = "Prix invalide.";
        if (formData.stock_quantite === '' || parseInt(formData.stock_quantite) < 0) newErrors.stock_quantite = "Stock invalide.";
        if (!formData.categorie_id) newErrors.categorie_id = "Catégorie requise.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) {
            toast.error("Veuillez corriger les erreurs.");
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
                toast.success("Produit mis à jour.");
            } else {
                await productService.create(payload);
                toast.success("Produit créé.");
            }
            navigate('/vendor/products');
        } catch (err) {
            toast.error("Une erreur est survenue lors de l'enregistrement.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isInitializing) {
        return (
            <DashboardLayout title={isEditMode ? "Edition" : "Référencement"}>
                <div className="flex items-center justify-center min-h-[40vh]">
                    <Loader2 className="size-10 text-primary animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title={isEditMode ? "Modifier le Produit" : "Ajouter un Produit"}>
            <div className="max-w-7xl mx-auto space-y-10 animate-fade-in pb-24 px-6 md:px-10 pt-10">

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-8">
                    <div className="space-y-4">
                        <button onClick={() => navigate('/vendor/products')} className="flex items-center gap-2 text-[10px] font-bold text-slate-500 hover:text-primary uppercase tracking-widest transition-all group">
                            <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" /> Retour
                        </button>
                        <h2 className="text-4xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                            {isEditMode ? "Révision d'Actif" : "Nouvel Article"}
                        </h2>
                    </div>
                    <div className="flex gap-4">
                        <Button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="h-14 px-10 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl"
                        >
                            {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                            {isEditMode ? "Sauvegarder" : "Publier l'Article"}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                    <div className="xl:col-span-8 space-y-10">
                        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-10 space-y-10 shadow-sm">
                            <div className="flex items-center gap-4 text-primary">
                                <Package className="size-6" />
                                <h3 className="text-sm font-bold uppercase tracking-widest">Fiche Descriptive</h3>
                            </div>

                            <div className="grid grid-cols-1 gap-8">
                                <FormField label="Désignation" required error={errors.nom_produit}>
                                    <Input
                                        name="nom_produit"
                                        value={formData.nom_produit}
                                        onChange={handleChange}
                                        placeholder="NOM DU PRODUIT..."
                                        className="h-14 px-6 rounded-xl font-bold text-sm uppercase tracking-tight"
                                    />
                                </FormField>

                                <FormField label="Description">
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={4}
                                        placeholder="DÉCRIRE LES CARACTÉRISTIQUES..."
                                        className="w-full px-6 py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                                    />
                                </FormField>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <FormField label="Catégorie" required error={errors.categorie_id}>
                                        <select
                                            name="categorie_id"
                                            value={formData.categorie_id}
                                            onChange={handleChange}
                                            className="w-full h-14 px-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[10px] font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                                        >
                                            <option value="">SÉLECTIONNER...</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.nom_categorie.toUpperCase()}</option>
                                            ))}
                                        </select>
                                    </FormField>

                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="text-2xl">🇬🇳</div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-widest">Origine Locale</p>
                                                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-0.5">Produit en Guinée</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, est_local: !prev.est_local }))}
                                            className={cn(
                                                "relative w-12 h-6 rounded-full transition-all duration-300 border border-slate-200",
                                                formData.est_local ? "bg-primary" : "bg-slate-300"
                                            )}
                                        >
                                            <span className={cn(
                                                "absolute size-4 top-1/2 -translate-y-1/2 rounded-full bg-white shadow-sm transition-all",
                                                formData.est_local ? "right-1" : "left-1"
                                            )} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-10 space-y-10 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 text-emerald-500">
                                    <Tag className="size-6" />
                                    <h3 className="text-sm font-bold uppercase tracking-widest">Cotation & Stock</h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleSuggestPrice}
                                    disabled={isSuggestingPrice || !formData.nom_produit.trim()}
                                    className="h-10 px-5 bg-slate-900 text-white rounded-xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all text-[9px] font-bold uppercase tracking-widest disabled:opacity-30"
                                >
                                    {isSuggestingPrice ? <Loader2 className="size-3 animate-spin" /> : <Sparkles className="size-4 text-primary" />}
                                    Audit Prix IA
                                </button>
                            </div>

                            {priceSuggestion && (
                                <div className="p-6 bg-primary/5 rounded-2xl border border-primary/20 space-y-6 animate-fade-in">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-primary italic">Recommandations Strategiques Groq LPU</p>
                                        <button
                                            type="button"
                                            onClick={applyPriceSuggestion}
                                            className="text-[9px] font-bold text-white bg-primary px-4 py-2 rounded-lg uppercase tracking-widest shadow-lg"
                                        >
                                            Appliquer
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-8">
                                        <div>
                                            <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mb-1">Marché Local</p>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white italic">
                                                {priceSuggestion.fourchette_min?.toLocaleString()} — {priceSuggestion.fourchette_max?.toLocaleString()} GNF
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[8px] text-primary font-bold uppercase tracking-widest mb-1">Prix Recommandé</p>
                                            <p className="text-xl font-bold text-primary italic">
                                                {priceSuggestion.prix_recommande?.toLocaleString()} GNF
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <FormField label="Prix Actuel (GNF)" required error={errors.prix_unitaire}>
                                    <Input
                                        name="prix_unitaire"
                                        type="number"
                                        value={formData.prix_unitaire}
                                        onChange={handleChange}
                                        placeholder="0"
                                        className="h-14 px-6 rounded-xl font-bold text-lg tracking-tight"
                                    />
                                </FormField>

                                <FormField label="Prix Avant (Optionnel)" error={errors.prix_ancien}>
                                    <Input
                                        name="prix_ancien"
                                        type="number"
                                        value={formData.prix_ancien}
                                        onChange={handleChange}
                                        placeholder="0"
                                        className="h-14 px-6 rounded-xl font-bold text-sm text-slate-400 line-through tracking-tight"
                                    />
                                </FormField>
                            </div>

                            <FormField label="Quantité en Stock" required error={errors.stock_quantite}>
                                <div className="relative group">
                                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                                    <Input
                                        name="stock_quantite"
                                        type="number"
                                        value={formData.stock_quantite}
                                        onChange={handleChange}
                                        placeholder="0"
                                        className="h-14 pl-12 pr-6 rounded-xl font-bold text-sm"
                                    />
                                </div>
                            </FormField>
                        </div>

                        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-10 space-y-10 shadow-sm">
                            <div className="flex items-center gap-4 text-indigo-500">
                                <ImageIcon className="size-6" />
                                <h3 className="text-sm font-bold uppercase tracking-widest">Média</h3>
                            </div>
                            <FormField label="URL de l'Image HD">
                                <Input
                                    name="image_url"
                                    type="url"
                                    value={formData.image_url}
                                    onChange={handleChange}
                                    placeholder="https://..."
                                    className="h-14 px-6 rounded-xl font-bold text-[10px] tracking-widest"
                                />
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
