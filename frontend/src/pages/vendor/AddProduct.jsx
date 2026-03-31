import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
    Package, Image as ImageIcon, Tag, Layers, ArrowLeft,
    Save, AlertCircle, CheckCircle2, Loader2, Eye,
    Sparkles, TrendingDown, Hash, Wand2, Activity,
    ShieldCheck, Zap, ChevronRight, Info
} from 'lucide-react';
import { toast } from 'sonner';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';
import aiService from '../../services/aiService';
import { cn } from '../../lib/utils';

// ── Executive Form Field ─────────────────────────────────────
const FormField = ({ label, hint, required, children, error }) => (
    <div className="space-y-4">
        <div className="flex items-center justify-between ml-2">
            <label className="text-executive-label font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic flex items-center gap-3">
                {label}
                {required && <span className="text-primary text-xl">·</span>}
            </label>
            {hint && <span className="text-[10px] text-muted-foreground/20 font-black uppercase tracking-widest italic">{hint}</span>}
        </div>
        {children}
        {error && (
            <p className="text-[10px] text-rose-500 font-black uppercase tracking-widest italic flex items-center gap-2 ml-4">
                <AlertCircle className="size-3" /> {error}
            </p>
        )}
    </div>
);

// ── Executive Product Preview ──────────────────────────────────────
const ProductPreview = ({ data, categories }) => {
    const cat = categories.find(c => c.id === data.categorie_id);
    const price = parseFloat(data.prix_unitaire || 0);
    const oldPrice = parseFloat(data.prix_ancien || 0);
    const discount = oldPrice > price && oldPrice > 0
        ? Math.round(((oldPrice - price) / oldPrice) * 100)
        : null;

    return (
        <div className="sticky top-28 space-y-8">
            <div className="flex items-center gap-4">
                <div className="size-3 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(43,90,255,0.6)]" />
                <h3 className="text-executive-label font-black text-primary uppercase tracking-[0.4em] italic">Rendu Temps Réel v2</h3>
            </div>
            
            {/* High-Fidelity Product Card Preview */}
            <div className="glass-card rounded-[3.5rem] overflow-hidden border-4 border-border shadow-premium hover:shadow-premium-lg transition-all duration-700 group">
                <div className="relative aspect-[4/3] bg-accent/20 overflow-hidden">
                    {data.image_url ? (
                        <img
                            src={data.image_url}
                            alt={data.nom_produit || 'Aperçu'}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]"
                            onError={e => { e.target.onerror = null; e.target.src = ''; }}
                        />
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 text-muted-foreground/10">
                            <ImageIcon className="size-20" />
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] italic">Visuel Non Référencé</p>
                        </div>
                    )}
                    
                    <div className="absolute top-6 left-6 flex flex-col gap-3">
                        {discount && (
                            <div className="px-5 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest italic rounded-full shadow-premium-lg shadow-primary/30">
                                <TrendingUp className="size-3 inline-block mr-2" /> -{discount}%
                            </div>
                        )}
                        {data.est_local && (
                            <div className="px-5 py-2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest italic rounded-full shadow-premium-lg shadow-emerald-500/30">
                                🇬🇳 Origine Guinéenne
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-10 space-y-6">
                    <div className="space-y-2">
                        <div className={cn(
                            "inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest italic border-2 mb-2",
                            cat ? "bg-primary/5 border-primary/20 text-primary" : "bg-accent border-border text-muted-foreground/20"
                        )}>
                            {cat ? cat.nom_categorie : 'CLASSIFICATION EN ATTENTE'}
                        </div>
                        <h4 className="text-3xl font-black text-foreground italic tracking-tighter uppercase leading-none line-clamp-2 group-hover:text-primary transition-colors">
                            {data.nom_produit || <span className="opacity-10 not-italic">NOM DE L'ACTIF...</span>}
                        </h4>
                    </div>

                    <div className="flex items-end gap-4">
                        <span className="text-3xl font-black italic tracking-tighter text-foreground text-executive-data">
                            {price > 0 ? price.toLocaleString() : '0'} <small className="text-[10px] font-black not-italic opacity-30">GNF</small>
                        </span>
                        {oldPrice > price && oldPrice > 0 && (
                            <span className="text-xs text-muted-foreground/30 line-through font-black italic uppercase tracking-widest mb-1.5">
                                {oldPrice.toLocaleString()} GNF
                            </span>
                        )}
                    </div>

                    <div className="pt-6 border-t-2 border-border/50 flex items-center justify-between">
                        <div className={cn(
                            "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest italic",
                            parseInt(data.stock_quantite) > 10 ? "text-emerald-500" :
                                parseInt(data.stock_quantite) > 0 ? "text-amber-500" : "text-rose-500"
                        )}>
                            <span className={cn(
                                "size-2 rounded-full",
                                parseInt(data.stock_quantite) > 10 ? "bg-emerald-500" :
                                    parseInt(data.stock_quantite) > 0 ? "bg-amber-500 animate-pulse" : "bg-rose-500"
                            )} />
                            {parseInt(data.stock_quantite) > 10 ? 'Stock Sécurisé' :
                                parseInt(data.stock_quantite) > 0 ? `Flux Restreint (${data.stock_quantite})` :
                                    'Rupture Certifiée'}
                        </div>
                        <ShieldCheck className="size-5 text-primary opacity-20" />
                    </div>
                </div>
            </div>

            {/* AI Sales Insights */}
            <div className="p-8 rounded-[2.5rem] bg-slate-950 text-white border-4 border-slate-900 shadow-2xl relative overflow-hidden group/tip">
                <div className="absolute top-0 right-0 size-32 bg-primary/10 rounded-full blur-[60px] -mr-16 -mt-16 opacity-50 transition-transform group-hover/tip:scale-150" />
                <div className="relative z-10 space-y-4">
                    <p className="text-executive-label font-black uppercase tracking-[0.3em] text-primary italic flex items-center gap-3">
                        <Sparkles className="size-4" /> Optimisation de Vente
                    </p>
                    <ul className="space-y-3 text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">
                        <li className="flex items-start gap-3"><ChevronRight className="size-3 text-primary mt-0.5" /> Titre précis = +300% de clics</li>
                        <li className="flex items-start gap-3"><ChevronRight className="size-3 text-primary mt-0.5" /> Visuel HD obligatoire pour conversion</li>
                        <li className="flex items-start gap-3"><ChevronRight className="size-3 text-primary mt-0.5" /> Prix barré stimule l'engagement achat</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

// ── Main Controller ───────────────────────────────────────────────────────
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
                setCategories(cats);

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
                toast.error("Échec de l'accès à la base de données.");
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
            toast.warning("Désignation de l'actif requise pour l'analyse.");
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
            toast.success("Analyse IA terminée.");
        } catch (err) {
            toast.error("Le protocole IA a échoué.");
        } finally {
            setIsSuggestingPrice(false);
        }
    };

    const applyPriceSuggestion = () => {
        if (!priceSuggestion) return;
        setFormData(prev => ({ ...prev, prix_unitaire: priceSuggestion.prix_recommande.toString() }));
        setPriceSuggestion(null);
        toast.success("Cotation IA appliquée.");
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.nom_produit.trim() || formData.nom_produit.trim().length < 3) {
            newErrors.nom_produit = "Désignation invalide ou trop courte.";
        }
        if (!formData.prix_unitaire || parseFloat(formData.prix_unitaire) <= 0) {
            newErrors.prix_unitaire = "Cotation monétaire requise.";
        }
        if (formData.prix_ancien && parseFloat(formData.prix_ancien) <= parseFloat(formData.prix_unitaire)) {
            newErrors.prix_ancien = "La référence haute doit excéder la cotation.";
        }
        if (formData.stock_quantite === '' || parseInt(formData.stock_quantite) < 0) {
            newErrors.stock_quantite = "Volume d'inventaire non conforme.";
        }
        if (!formData.categorie_id) {
            newErrors.categorie_id = "Classification obligatoire.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) {
            toast.error("Paramètres non validés.");
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
                toast.success("Référence actualisée.");
            } else {
                await productService.create(payload);
                toast.success("Produit référencé avec succès.");
            }
            setTimeout(() => navigate('/vendor/products'), 1000);
        } catch (err) {
            toast.error(err.response?.data?.message || "Échec de l'enregistrement.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isInitializing) {
        return (
            <DashboardLayout title={isEditMode ? "RÉVISION D'ACTIF" : "RÉFÉRENCEMENT"}>
                <div className="flex items-center justify-center min-h-[40vh]">
                    <div className="size-16 border-8 border-primary border-t-transparent rounded-full animate-spin shadow-premium-lg shadow-primary/20" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title={isEditMode ? "RÉVISION DE RÉFÉRENCE" : "INITIATION DE PRODUIT"}>
            <div className="space-y-12 animate-in fade-in duration-1000 pb-20">

                {/* ── Executive Header ─────────────────────────────── */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b-4 border-border pb-12">
                    <div className="space-y-4">
                        <button
                            onClick={() => navigate('/vendor/products')}
                            className="flex items-center gap-3 text-muted-foreground/30 hover:text-primary text-[10px] font-black uppercase tracking-[0.3em] transition-all group mb-4 italic"
                        >
                            <ArrowLeft className="size-4 group-hover:-translate-x-2 transition-transform" />
                            RETOUR VERS L'INVENTAIRE
                        </button>
                        <h2 className="text-5xl md:text-7xl font-black text-foreground italic tracking-tighter uppercase leading-[0.85]">
                            {isEditMode ? "Mise à Jour <br />" : "Nouvelle <br />"}
                            <span className="text-primary not-italic underline decoration-primary/20 decoration-8 underline-offset-[-4px]">Référence.</span>
                        </h2>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => navigate('/vendor/products')}
                            className="h-24 px-10 bg-background border-4 border-border rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-[10px] text-muted-foreground/30 hover:text-foreground hover:border-foreground/20 transition-all active-press"
                        >
                            ANNULER
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="h-24 px-12 bg-primary text-white rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-[12px] flex items-center gap-6 shadow-premium-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                            {isLoading ? <Loader2 className="size-6 animate-spin" /> : <Save className="size-6" />}
                            <span className="relative z-10 leading-none pt-1">{isLoading ? 'SYCHRONISATION...' : (isEditMode ? 'SCELLER' : 'PUBLIER')}</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
                    
                    {/* ── Form Section ─────────────────────────────────── */}
                    <div className="xl:col-span-8 space-y-10">
                        {/* Information Grid */}
                        <div className="glass-card rounded-[3.5rem] border-4 border-border p-12 space-y-12 shadow-premium">
                            <div className="flex items-center gap-6 border-b-4 border-border pb-8">
                                <div className="size-16 rounded-[1.5rem] bg-primary text-white flex items-center justify-center shadow-premium-lg shadow-primary/20">
                                    <Package className="size-8" />
                                </div>
                                <h3 className="text-2xl font-black italic tracking-tighter uppercase">Spécifications Techniques</h3>
                            </div>

                            <div className="grid grid-cols-1 gap-12">
                                <FormField label="Désignation de l'Actif" required error={errors.nom_produit}
                                    hint={`${formData.nom_produit.length}/100`}>
                                    <input
                                        name="nom_produit"
                                        value={formData.nom_produit}
                                        onChange={handleChange}
                                        maxLength={100}
                                        placeholder="EX: ÉCOUTEURS SANS FIL ALPHA GEN-4"
                                        className="h-20 px-8 rounded-[2rem] border-4 border-border bg-background focus:border-primary/40 text-lg font-black italic uppercase tracking-tighter outline-none transition-all shadow-inner"
                                    />
                                </FormField>

                                <FormField label="Analytique & Détails (Description)">
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={6}
                                        placeholder="DÉCRIVEZ LES SPÉCIFICITÉS, PERFORMANCES ET CAPACITÉS..."
                                        className="w-full px-8 py-8 rounded-[2rem] border-4 border-border bg-background text-sm font-bold italic uppercase tracking-widest focus:border-primary/40 outline-none transition-all shadow-inner resize-none placeholder:text-muted-foreground/10"
                                    />
                                </FormField>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <FormField label="Classification Taxonomique" required error={errors.categorie_id}>
                                        <div className="relative group">
                                            <Layers className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-muted-foreground/20 group-focus-within:text-primary transition-colors pointer-events-none" />
                                            <select
                                                name="categorie_id"
                                                value={formData.categorie_id}
                                                onChange={handleChange}
                                                className="w-full h-20 pl-16 pr-8 rounded-[2rem] border-4 border-border bg-background text-[10px] font-black uppercase tracking-[0.2em] italic focus:border-primary/40 outline-none transition-all shadow-inner appearance-none"
                                            >
                                                <option value="">— SÉLECTIONNER CLASSE —</option>
                                                {categories.map(cat => (
                                                    <option key={cat.id} value={cat.id}>{cat.nom_categorie.toUpperCase()}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </FormField>

                                    <div className="p-6 rounded-[2rem] bg-accent/20 border-4 border-border flex items-center justify-between group hover:border-emerald-500/20 transition-all">
                                        <div className="flex items-center gap-6">
                                            <div className="size-16 rounded-[1.2rem] bg-background border-4 border-border flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all">🇬🇳</div>
                                            <div>
                                                <p className="text-executive-label font-black text-foreground uppercase tracking-widest italic mb-1">Actif Local</p>
                                                <p className="text-[10px] text-muted-foreground/40 font-black uppercase italic">Certification Guinée</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, est_local: !prev.est_local }))}
                                            className={cn(
                                                "relative w-16 h-8 rounded-full transition-all duration-300",
                                                formData.est_local ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]" : "bg-border"
                                            )}
                                        >
                                            <span className={cn(
                                                "absolute size-6 top-1 rounded-full bg-white shadow-xl transition-all duration-300",
                                                formData.est_local ? "left-9" : "left-1"
                                            )} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pricing & Stock Card */}
                        <div className="glass-card rounded-[3.5rem] border-4 border-border p-12 space-y-10 shadow-premium">
                            <div className="flex items-center justify-between border-b-4 border-border pb-8">
                                <div className="flex items-center gap-6">
                                    <div className="size-16 rounded-[1.5rem] bg-amber-500 text-white flex items-center justify-center shadow-premium-lg shadow-amber-500/20">
                                        <Tag className="size-8" />
                                    </div>
                                    <h3 className="text-2xl font-black italic tracking-tighter uppercase">Cotation & Logistique</h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleSuggestPrice}
                                    disabled={isSuggestingPrice || !formData.nom_produit.trim()}
                                    className="h-16 px-8 bg-slate-950 text-white rounded-2xl flex items-center gap-4 hover:scale-105 active:scale-95 transition-all shadow-2xl disabled:opacity-20 group/ai"
                                >
                                    {isSuggestingPrice ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4 text-primary group-hover:animate-pulse" />}
                                    <span className="text-[10px] font-black uppercase tracking-widest italic pt-0.5">Audit IA Prix</span>
                                </button>
                            </div>

                            {priceSuggestion && (
                                <div className="p-8 rounded-[2.5rem] bg-emerald-500/5 border-4 border-emerald-500/10 space-y-6 animate-in slide-in-from-top-4 duration-500">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <Zap className="size-5 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 italic">Protocole de Suggestion Groq LPU</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={applyPriceSuggestion}
                                            className="h-12 px-6 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-premium-lg shadow-emerald-500/20"
                                        >
                                            APPLIQUER LA COTATION
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-10">
                                        <div className="space-y-2">
                                            <p className="text-executive-label text-muted-foreground/30 font-black uppercase tracking-widest italic">Fourchette Marché</p>
                                            <p className="text-2xl font-black text-foreground italic tracking-tighter">
                                                {priceSuggestion.fourchette_min?.toLocaleString()} — {priceSuggestion.fourchette_max?.toLocaleString()} <small className="text-[8px] font-black not-italic opacity-30">GNF</small>
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-executive-label text-emerald-500 font-black uppercase tracking-widest italic">Optimale</p>
                                            <p className="text-4xl font-black text-emerald-500 italic tracking-tighter text-executive-data">
                                                {priceSuggestion.prix_recommande?.toLocaleString()} <small className="text-[8px] font-black not-italic">GNF</small>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <FormField label="Valeur de Marché (GNF)" required error={errors.prix_unitaire}>
                                    <input
                                        name="prix_unitaire"
                                        type="number"
                                        value={formData.prix_unitaire}
                                        onChange={handleChange}
                                        placeholder="EX: 250000"
                                        className="h-20 px-8 rounded-[2rem] border-4 border-border bg-background focus:border-primary/40 text-2xl font-black italic tracking-tighter outline-none transition-all shadow-inner text-executive-data"
                                    />
                                </FormField>

                                <FormField label="Réf. Avant Promo (Optionnel)" error={errors.prix_ancien}>
                                    <input
                                        name="prix_ancien"
                                        type="number"
                                        value={formData.prix_ancien}
                                        onChange={handleChange}
                                        placeholder="EX: 350000"
                                        className="h-20 px-8 rounded-[2rem] border-4 border-border bg-background focus:border-amber-500/20 text-lg font-black italic text-muted-foreground/30 line-through tracking-tighter outline-none transition-all shadow-inner"
                                    />
                                </FormField>
                            </div>

                            <FormField label="Volume d'Inventaire Actif" required error={errors.stock_quantite} hint="Capacité logistique">
                                <div className="relative group">
                                    <Hash className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-muted-foreground/20 group-focus-within:text-primary transition-colors pointer-events-none" />
                                    <input
                                        name="stock_quantite"
                                        type="number"
                                        value={formData.stock_quantite}
                                        onChange={handleChange}
                                        placeholder="50"
                                        className="h-20 pl-16 pr-8 rounded-[2rem] border-4 border-border bg-background text-xl font-black italic outline-none transition-all shadow-inner"
                                    />
                                </div>
                            </FormField>
                        </div>

                        {/* Media Asset Card */}
                        <div className="glass-card rounded-[3.5rem] border-4 border-border p-12 space-y-10 shadow-premium">
                            <div className="flex items-center gap-6 border-b-4 border-border pb-8">
                                <div className="size-16 rounded-[1.5rem] bg-indigo-500 text-white flex items-center justify-center shadow-premium-lg shadow-indigo-500/20">
                                    <ImageIcon className="size-8" />
                                </div>
                                <h3 className="text-2xl font-black italic tracking-tighter uppercase">Rendu Visuel (HD)</h3>
                            </div>
                            <FormField label="Protocole d'Asset Médias (URL)" hint="Visuel haute-fidélité requis">
                                <div className="relative group">
                                    <ImageIcon className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-muted-foreground/20 group-focus-within:text-primary transition-colors pointer-events-none" />
                                    <input
                                        name="image_url"
                                        type="url"
                                        value={formData.image_url}
                                        onChange={handleChange}
                                        placeholder="HTTPS://ASSETS.BCA.GN/PRODUCTS/GEN-ALPHA.JPG"
                                        className="h-20 pl-16 pr-8 rounded-[2rem] border-4 border-border bg-background text-[10px] font-black uppercase tracking-widest italic focus:border-primary/40 outline-none transition-all shadow-inner"
                                    />
                                </div>
                            </FormField>
                        </div>
                    </div>

                    {/* ── Preview Section ──────────────────────────────── */}
                    <div className="xl:col-span-4 h-full">
                        <ProductPreview data={formData} categories={categories} />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AddProduct;
