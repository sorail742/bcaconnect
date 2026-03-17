import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
    ChevronRight, Upload, Plus, Minus, Check, ArrowLeft,
    Package, DollarSign, BarChart2, ImageIcon, Tag, Sparkles, X
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';

const INITIAL_FORM = {
    nom_produit: '',
    description: '',
    prix_unitaire: '',
    prix_ancien: '',
    stock_quantite: 0,
    categorie_id: '',
    image_url: '',
};

const ProductForm = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // Si défini → mode édition
    const isEditMode = Boolean(id);

    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(isEditMode);
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [imagePreview, setImagePreview] = useState('');
    const [activeStep, setActiveStep] = useState(1);

    // Chargement des catégories + données produit si édition
    useEffect(() => {
        const init = async () => {
            try {
                const cats = await categoryService.getAll();
                setCategories(cats);

                if (isEditMode) {
                    const product = await productService.getById(id);
                    setFormData({
                        nom_produit: product.nom_produit || '',
                        description: product.description || '',
                        prix_unitaire: product.prix_unitaire || '',
                        prix_ancien: product.prix_ancien || '',
                        stock_quantite: product.stock_quantite ?? 0,
                        categorie_id: product.categorie_id || '',
                        image_url: product.image_url || '',
                    });
                    if (product.image_url) setImagePreview(product.image_url);
                }
            } catch (err) {
                setError('Erreur de chargement des données.');
            } finally {
                setIsFetching(false);
            }
        };
        init();
    }, [id, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'image_url') setImagePreview(value);
    };

    const adjustStock = (amount) => {
        setFormData(prev => ({
            ...prev,
            stock_quantite: Math.max(0, parseInt(prev.stock_quantite || 0) + amount)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            if (!formData.categorie_id) throw new Error('Sélectionnez une catégorie.');
            if (!formData.nom_produit.trim()) throw new Error('Le nom du produit est requis.');
            if (!formData.prix_unitaire || parseFloat(formData.prix_unitaire) <= 0) throw new Error('Entrez un prix valide.');

            const payload = {
                ...formData,
                prix_unitaire: parseFloat(formData.prix_unitaire),
                prix_ancien: formData.prix_ancien ? parseFloat(formData.prix_ancien) : null,
                stock_quantite: parseInt(formData.stock_quantite),
                image_url: formData.image_url || null,
            };

            if (isEditMode) {
                await productService.update(id, payload);
                setSuccess('Produit mis à jour avec succès !');
            } else {
                await productService.create(payload);
                setSuccess('Produit publié avec succès !');
                setTimeout(() => navigate('/vendor/products'), 1500);
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Erreur lors de la sauvegarde.');
        } finally {
            setIsLoading(false);
        }
    };

    const STEPS = [
        { num: 1, label: 'Informations', icon: Package },
        { num: 2, label: 'Prix & Stock', icon: DollarSign },
        { num: 3, label: 'Médias', icon: ImageIcon },
    ];

    if (isFetching) {
        return (
            <DashboardLayout title={isEditMode ? "Modifier le produit" : "Nouveau produit"}>
                <div className="flex items-center justify-center py-32">
                    <div className="size-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title={isEditMode ? "Modifier le produit" : "Nouveau produit"}>
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                            <Link to="/vendor/products" className="hover:text-primary transition-colors font-medium flex items-center gap-1">
                                <ArrowLeft className="size-3" /> Mes Produits
                            </Link>
                            <ChevronRight className="size-3" />
                            <span className="font-black text-foreground">{isEditMode ? 'Modifier' : 'Nouveau produit'}</span>
                        </nav>
                        <h1 className="text-3xl font-black italic tracking-tighter text-foreground uppercase">
                            {isEditMode ? formData.nom_produit || 'Modifier le produit' : 'Ajouter un produit'}
                        </h1>
                    </div>
                    <div className="flex gap-3">
                        <Link to="/vendor/products">
                            <Button variant="outline" className="h-11 px-5 rounded-xl font-black uppercase tracking-widest text-xs">Annuler</Button>
                        </Link>
                        <Button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="h-11 px-6 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 gap-2"
                        >
                            {isLoading ? (
                                <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : <Check className="size-4" />}
                            {isLoading ? 'Sauvegarde...' : isEditMode ? 'Enregistrer' : 'Publier'}
                        </Button>
                    </div>
                </div>

                {/* Alerts */}
                {error && (
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 animate-in slide-in-from-top-2 duration-300">
                        <X className="size-5 shrink-0" />
                        <p className="text-sm font-bold">{error}</p>
                    </div>
                )}
                {success && (
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 animate-in slide-in-from-top-2 duration-300">
                        <Check className="size-5 shrink-0" />
                        <p className="text-sm font-bold">{success}</p>
                    </div>
                )}

                {/* Steps Navigation */}
                <div className="flex items-center gap-2 p-1 bg-muted/50 rounded-2xl border border-border">
                    {STEPS.map((step, i) => (
                        <React.Fragment key={step.num}>
                            <button
                                onClick={() => setActiveStep(step.num)}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all",
                                    activeStep === step.num
                                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <step.icon className="size-4" />
                                <span className="hidden sm:block">{step.label}</span>
                                <span className={cn("size-5 rounded-full text-[9px] font-black flex items-center justify-center",
                                    activeStep === step.num ? "bg-white/20 text-white" : "bg-muted"
                                )}>{step.num}</span>
                            </button>
                            {i < STEPS.length - 1 && <div className="h-px w-4 bg-border" />}
                        </React.Fragment>
                    ))}
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

                        {/* ── STEP 1 : Infos ── */}
                        <div className={cn("lg:col-span-3 space-y-6", activeStep !== 1 && "hidden lg:block")}>
                            <section className="bg-card rounded-[1.5rem] border border-border overflow-hidden shadow-sm">
                                <div className="p-6 border-b border-border flex items-center gap-3">
                                    <div className="size-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                        <Package className="size-4 text-primary" />
                                    </div>
                                    <h2 className="text-base font-black text-foreground uppercase tracking-tight">Informations générales</h2>
                                </div>
                                <div className="p-6 space-y-5">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">Nom du produit *</label>
                                        <input
                                            name="nom_produit" value={formData.nom_produit} onChange={handleChange} required
                                            className="w-full px-4 py-3 rounded-xl border border-border bg-muted/20 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm"
                                            placeholder="Ex: Panneau Solaire 250W Monocristallin"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">Catégorie *</label>
                                            <select
                                                name="categorie_id" value={formData.categorie_id} onChange={handleChange} required
                                                className="w-full px-4 py-3 rounded-xl border border-border bg-muted/20 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm appearance-none cursor-pointer"
                                            >
                                                <option value="">— Sélectionner —</option>
                                                {categories.map(c => (
                                                    <option key={c.id} value={c.id}>{c.nom_categorie}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">Référence SKU</label>
                                            <input
                                                className="w-full px-4 py-3 rounded-xl border border-border bg-muted/20 focus:ring-2 focus:ring-primary/20 transition-all font-mono text-sm"
                                                placeholder="BCA-REF-001"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">Description *</label>
                                        <textarea
                                            name="description" value={formData.description} onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl border border-border bg-muted/20 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm leading-relaxed resize-none"
                                            placeholder="Décrivez votre produit en détail : caractéristiques, utilisation, provenance..."
                                            rows={5}
                                        />
                                        <p className="text-[10px] text-muted-foreground mt-1.5 font-medium">{formData.description.length} / 1000 caractères</p>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* ── STEP 2 : Prix & Stock ── */}
                        <div className={cn("lg:col-span-2 space-y-6", activeStep !== 2 && "hidden lg:block")}>
                            <section className="bg-card rounded-[1.5rem] border border-border overflow-hidden shadow-sm">
                                <div className="p-6 border-b border-border flex items-center gap-3">
                                    <div className="size-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                        <DollarSign className="size-4 text-emerald-500" />
                                    </div>
                                    <h2 className="text-base font-black text-foreground uppercase tracking-tight">Prix & Inventaire</h2>
                                </div>
                                <div className="p-6 space-y-5">
                                    {/* Prix de vente */}
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">Prix de vente (GNF) *</label>
                                        <div className="relative">
                                            <input
                                                name="prix_unitaire" value={formData.prix_unitaire} onChange={handleChange}
                                                required type="number" min="1"
                                                className="w-full px-4 py-3 rounded-xl border border-border bg-muted/20 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-black text-lg pr-14"
                                                placeholder="0"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground">GNF</span>
                                        </div>
                                    </div>

                                    {/* Prix barré */}
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">
                                            Prix original (facultatif)
                                            <span className="ml-2 normal-case font-medium text-muted-foreground/60">Affiché barré</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                name="prix_ancien" value={formData.prix_ancien} onChange={handleChange}
                                                type="number" min="0"
                                                className="w-full px-4 py-3 rounded-xl border border-border bg-muted/20 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm pr-14"
                                                placeholder="0"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground">GNF</span>
                                        </div>
                                        {formData.prix_ancien && formData.prix_unitaire && parseFloat(formData.prix_ancien) > parseFloat(formData.prix_unitaire) && (
                                            <p className="text-[10px] text-emerald-500 font-black mt-1.5 flex items-center gap-1">
                                                <Sparkles className="size-3" />
                                                Remise de {Math.round((1 - parseFloat(formData.prix_unitaire) / parseFloat(formData.prix_ancien)) * 100)}% affichée
                                            </p>
                                        )}
                                    </div>

                                    {/* Stock */}
                                    <div className="pt-4 border-t border-border">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-3">Quantité en stock</label>
                                        <div className="flex items-center gap-3">
                                            <button type="button" onClick={() => adjustStock(-10)}
                                                className="size-10 flex items-center justify-center border border-border rounded-xl text-muted-foreground hover:bg-muted transition-all text-xs font-black">-10</button>
                                            <button type="button" onClick={() => adjustStock(-1)}
                                                className="size-10 flex items-center justify-center border border-border rounded-xl text-muted-foreground hover:bg-muted transition-all">
                                                <Minus className="size-4" />
                                            </button>
                                            <input
                                                name="stock_quantite" value={formData.stock_quantite} onChange={handleChange}
                                                type="number" min="0"
                                                className="flex-1 px-4 py-3 text-center rounded-xl border-2 border-primary/30 bg-primary/5 focus:ring-2 focus:ring-primary/20 font-black text-xl"
                                            />
                                            <button type="button" onClick={() => adjustStock(1)}
                                                className="size-10 flex items-center justify-center border border-border rounded-xl text-muted-foreground hover:bg-muted transition-all">
                                                <Plus className="size-4" />
                                            </button>
                                            <button type="button" onClick={() => adjustStock(10)}
                                                className="size-10 flex items-center justify-center border border-border rounded-xl text-muted-foreground hover:bg-muted transition-all text-xs font-black">+10</button>
                                        </div>
                                        <p className="text-[10px] font-black text-muted-foreground mt-3 flex items-center gap-1.5">
                                            {parseInt(formData.stock_quantite) === 0
                                                ? <><span className="size-2 rounded-full bg-red-500" /> Rupture de stock</>
                                                : parseInt(formData.stock_quantite) <= 5
                                                    ? <><span className="size-2 rounded-full bg-amber-500 animate-pulse" /> Stock faible — réapprovisionnez bientôt</>
                                                    : <><span className="size-2 rounded-full bg-emerald-500" /> Stock disponible</>
                                            }
                                        </p>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* ── STEP 3 : Image ── */}
                        <div className={cn("lg:col-span-5", activeStep !== 3 && "hidden lg:block")}>
                            <section className="bg-card rounded-[1.5rem] border border-border overflow-hidden shadow-sm">
                                <div className="p-6 border-b border-border flex items-center gap-3">
                                    <div className="size-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                        <ImageIcon className="size-4 text-primary" />
                                    </div>
                                    <h2 className="text-base font-black text-foreground uppercase tracking-tight">Image du produit</h2>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        {/* URL Input */}
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">URL de l'image</label>
                                                <div className="relative">
                                                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                                    <input
                                                        name="image_url" value={formData.image_url} onChange={handleChange}
                                                        type="url"
                                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-muted/20 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm"
                                                        placeholder="https://... (lien vers votre image)"
                                                    />
                                                </div>
                                                <p className="text-[10px] text-muted-foreground font-medium mt-2">
                                                    Collez un lien d'image depuis Unsplash, votre hébergeur ou tout autre CDN.
                                                </p>
                                            </div>

                                            {/* Upload placeholder */}
                                            <div className="border-2 border-dashed border-border rounded-2xl p-8 flex flex-col items-center gap-4 bg-muted/20 cursor-not-allowed opacity-60">
                                                <Upload className="size-8 text-muted-foreground" />
                                                <div className="text-center">
                                                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Upload direct</p>
                                                    <p className="text-[10px] text-muted-foreground font-medium mt-1">Disponible prochainement</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Prévisualisation */}
                                        <div className="space-y-3">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Aperçu</p>
                                            <div className="aspect-square rounded-2xl border-2 border-border overflow-hidden bg-muted/20">
                                                {imagePreview ? (
                                                    <img
                                                        src={imagePreview}
                                                        alt="Aperçu"
                                                        className="w-full h-full object-contain"
                                                        onError={() => setImagePreview('')}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
                                                        <ImageIcon className="size-12 opacity-30" />
                                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Aucune image</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>

                    {/* Mobile Submit */}
                    <div className="lg:hidden mt-8">
                        <Button type="submit" disabled={isLoading} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-sm shadow-2xl shadow-primary/20 gap-2">
                            {isLoading ? <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check className="size-5" />}
                            {isLoading ? 'Sauvegarde...' : isEditMode ? 'Enregistrer les modifications' : 'Publier le produit'}
                        </Button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
};

export default ProductForm;
