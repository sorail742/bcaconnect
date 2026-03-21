import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import {
    Package, Image as ImageIcon, Tag, Layers, ArrowLeft,
    Save, AlertCircle, CheckCircle2, Loader2, Eye,
    Store, Star, ShoppingCart, Truck, ShieldCheck, Sparkles, TrendingDown, Hash
} from 'lucide-react';
import { toast } from 'sonner';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';
import { cn } from '../../lib/utils';

// ── Composant : Champ formulaire stylisé ─────────────────────────────────────
const FormField = ({ label, hint, required, children, error }) => (
    <div className="space-y-2">
        <div className="flex items-center justify-between">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                {label}
                {required && <span className="text-primary">*</span>}
            </label>
            {hint && <span className="text-[9px] text-muted-foreground font-medium">{hint}</span>}
        </div>
        {children}
        {error && (
            <p className="text-[10px] text-destructive font-bold flex items-center gap-1">
                <AlertCircle className="size-3" /> {error}
            </p>
        )}
    </div>
);

// ── Composant : Preview live du produit ──────────────────────────────────────
const ProductPreview = ({ data, categories }) => {
    const cat = categories.find(c => c.id === data.categorie_id);
    const price = parseFloat(data.prix_unitaire || 0);
    const oldPrice = parseFloat(data.prix_ancien || 0);
    const discount = oldPrice > price && oldPrice > 0
        ? Math.round(((oldPrice - price) / oldPrice) * 100)
        : null;

    return (
        <div className="sticky top-28 space-y-4">
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                <Eye className="size-4 text-primary" /> Aperçu en temps réel
            </h3>
            {/* Carte Produit Preview */}
            <div className="rounded-[2rem] overflow-hidden border border-border bg-card shadow-2xl hover:-translate-y-1 transition-transform duration-300">
                {/* Image */}
                <div className="relative aspect-[4/3] bg-muted/30 overflow-hidden">
                    {data.image_url ? (
                        <img
                            src={data.image_url}
                            alt={data.nom_produit || 'Aperçu'}
                            className="w-full h-full object-cover"
                            onError={e => { e.target.onerror = null; e.target.src = ''; }}
                        />
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground/30">
                            <ImageIcon className="size-16" />
                            <p className="text-xs font-black uppercase tracking-widest">Aucune image</p>
                        </div>
                    )}
                    {/* Badges overlay */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                        {discount && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg">
                                <TrendingDown className="size-2.5" /> -{discount}%
                            </span>
                        )}
                        {data.est_local && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg">
                                🇬🇳 Local
                            </span>
                        )}
                    </div>
                    {cat && (
                        <div className="absolute top-3 right-3">
                            <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest rounded-full">
                                {cat.nom_categorie}
                            </span>
                        </div>
                    )}
                </div>

                {/* Infos */}
                <div className="p-5 space-y-4">
                    <div>
                        <h4 className="font-black text-foreground italic tracking-tight text-lg leading-tight line-clamp-2">
                            {data.nom_produit || <span className="text-muted-foreground/30 not-italic">Nom du produit...</span>}
                        </h4>
                        <p className="text-muted-foreground text-xs font-medium mt-1.5 line-clamp-2 leading-relaxed">
                            {data.description || <span className="text-muted-foreground/30">Description du produit...</span>}
                        </p>
                    </div>

                    {/* Prix */}
                    <div className="flex items-end gap-3">
                        <span className="text-2xl font-black italic tracking-tighter text-foreground">
                            {price > 0 ? price.toLocaleString('fr-FR') : '---'} <span className="text-sm font-bold text-muted-foreground">GNF</span>
                        </span>
                        {oldPrice > price && oldPrice > 0 && (
                            <span className="text-sm text-muted-foreground line-through font-medium">
                                {oldPrice.toLocaleString('fr-FR')} GNF
                            </span>
                        )}
                    </div>

                    {/* Stock */}
                    <div className={cn(
                        "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest",
                        parseInt(data.stock_quantite) > 5 ? "text-emerald-500" :
                            parseInt(data.stock_quantite) > 0 ? "text-amber-500" : "text-destructive"
                    )}>
                        <span className={cn(
                            "size-2 rounded-full",
                            parseInt(data.stock_quantite) > 5 ? "bg-emerald-500" :
                                parseInt(data.stock_quantite) > 0 ? "bg-amber-500 animate-pulse" : "bg-destructive"
                        )} />
                        {parseInt(data.stock_quantite) > 5 ? `${data.stock_quantite} en stock` :
                            parseInt(data.stock_quantite) > 0 ? `Stock faible (${data.stock_quantite})` :
                                'Rupture de stock'}
                    </div>

                    {/* Trust badges */}
                    <div className="border-t border-border pt-4 grid grid-cols-2 gap-2">
                        {[
                            { icon: Truck, label: 'Livraison 48h' },
                            { icon: ShieldCheck, label: 'Sécurisé BCA' },
                        ].map((b, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-[9px] font-black text-muted-foreground uppercase tracking-wide">
                                <b.icon className="size-3 text-primary" /> {b.label}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Conseils Rédaction */}
            <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20 space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                    <Sparkles className="size-3.5" /> Conseils de vente
                </p>
                <ul className="space-y-2 text-[10px] text-muted-foreground font-medium">
                    <li className="flex items-start gap-2"><span className="text-primary mt-0.5">→</span> Un titre clair et précis attire 3× plus de clics</li>
                    <li className="flex items-start gap-2"><span className="text-primary mt-0.5">→</span> Ajoutez une vraie photo du produit (pas de logo)</li>
                    <li className="flex items-start gap-2"><span className="text-primary mt-0.5">→</span> Prix barré = impression de promo, booste les ventes</li>
                    <li className="flex items-start gap-2"><span className="text-primary mt-0.5">→</span> Stock &gt; 10 = badge "En stock" visible sur le catalogue</li>
                </ul>
            </div>
        </div>
    );
};

// ── Composant Principal ───────────────────────────────────────────────────────
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
    const [errors, setErrors] = useState({});

    // ── Initialisation ────────────────────────────────────────────────────────
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
                toast.error("Impossible de charger les données du formulaire.");
            } finally {
                setIsInitializing(false);
            }
        };
        init();
    }, [id, isEditMode]);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        // Effacer l'erreur du champ modifié
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    // ── Validation ────────────────────────────────────────────────────────────
    const validate = () => {
        const newErrors = {};
        if (!formData.nom_produit.trim() || formData.nom_produit.trim().length < 3) {
            newErrors.nom_produit = "Le nom doit contenir au moins 3 caractères.";
        }
        if (!formData.prix_unitaire || parseFloat(formData.prix_unitaire) <= 0) {
            newErrors.prix_unitaire = "Le prix doit être supérieur à 0 GNF.";
        }
        if (formData.prix_ancien && parseFloat(formData.prix_ancien) <= parseFloat(formData.prix_unitaire)) {
            newErrors.prix_ancien = "Le prix barré doit être supérieur au prix de vente.";
        }
        if (formData.stock_quantite === '' || parseInt(formData.stock_quantite) < 0) {
            newErrors.stock_quantite = "Le stock doit être un nombre positif ou nul.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ── Soumission ────────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) {
            toast.error("Veuillez corriger les erreurs avant de publier.");
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
                toast.success("✅ Produit mis à jour avec succès !");
            } else {
                await productService.create(payload);
                toast.success("🎉 Produit publié sur le catalogue !");
            }

            setTimeout(() => navigate('/vendor/products'), 800);
        } catch (err) {
            const msg = err.response?.data?.message;
            if (msg?.includes('boutique')) {
                toast.error("⚠️ Créez d'abord votre boutique avant d'ajouter des produits.", {
                    action: { label: 'Créer ma boutique', onClick: () => navigate('/vendor/store') }
                });
            } else {
                toast.error(msg || "Erreur lors de l'enregistrement du produit.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (isInitializing) {
        return (
            <DashboardLayout title={isEditMode ? "Modifier le produit" : "Ajouter un produit"}>
                <div className="flex items-center justify-center min-h-[40vh]">
                    <Loader2 className="size-10 text-primary animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title={isEditMode ? "Modifier le produit" : "Ajouter un produit"}>
            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 font-inter pb-12">

                {/* ── Header Page ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <button
                            onClick={() => navigate('/vendor/products')}
                            className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-xs font-black uppercase tracking-widest transition-colors mb-3 group"
                        >
                            <ArrowLeft className="size-3.5 group-hover:-translate-x-1 transition-transform" />
                            Mes produits
                        </button>
                        <h1 className="text-3xl font-black italic tracking-tighter text-foreground uppercase">
                            {isEditMode ? "Modifier le produit" : "Nouveau Produit"}
                        </h1>
                        <p className="text-muted-foreground text-sm font-medium mt-1">
                            {isEditMode
                                ? "Modifiez les informations et sauvegardez."
                                : "Remplissez le formulaire pour publier votre produit sur le catalogue BCA."}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={() => navigate('/vendor/products')}
                            className="h-11 px-6 rounded-xl font-black uppercase tracking-widest text-xs"
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="h-11 px-8 rounded-xl font-black uppercase tracking-widest text-xs gap-2 shadow-xl shadow-primary/20"
                        >
                            {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                            {isLoading ? 'Publication...' : (isEditMode ? 'Enregistrer' : 'Publier')}
                        </Button>
                    </div>
                </div>

                {/* ── Grille : Formulaire + Preview ── */}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                    {/* ─ Colonne Gauche : Formulaire ──────────────────────── */}
                    <div className="xl:col-span-2 space-y-6">

                        {/* Section 1 : Informations de base */}
                        <Card>
                            <CardHeader className="flex flex-row items-center gap-3 border-b border-border py-4">
                                <Package className="size-5 text-primary" />
                                <CardTitle className="text-sm font-black text-foreground uppercase tracking-widest">
                                    Informations de base
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <FormField label="Nom du produit" required error={errors.nom_produit}
                                    hint={`${formData.nom_produit.length}/100`}>
                                    <Input
                                        name="nom_produit"
                                        value={formData.nom_produit}
                                        onChange={handleChange}
                                        maxLength={100}
                                        placeholder="Ex: Téléphone Samsung Galaxy A54"
                                        className={cn("h-12 rounded-xl", errors.nom_produit && "border-destructive focus:ring-destructive/20")}
                                    />
                                </FormField>

                                <FormField label="Description" hint="Décrivez les caractéristiques principales">
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={5}
                                        placeholder="Modèle 2024, processeur Exynos, 128Go de stockage, écran AMOLED 6.4 pouces..."
                                        className="w-full px-5 py-4 rounded-xl border border-input bg-transparent text-sm font-medium focus:ring-2 focus:ring-ring outline-none transition-all placeholder:text-muted-foreground min-h-[130px] resize-none"
                                    />
                                </FormField>

                                <FormField label="Catégorie">
                                    <div className="relative">
                                        <Layers className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                                        <select
                                            name="categorie_id"
                                            value={formData.categorie_id}
                                            onChange={handleChange}
                                            className="w-full h-12 pl-11 pr-4 rounded-xl border border-input bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                        >
                                            <option value="">— Sélectionner une catégorie —</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.nom_categorie}</option>
                                            ))}
                                        </select>
                                    </div>
                                </FormField>

                                {/* Toggle Produit Local */}
                                <div className="flex items-center justify-between p-5 rounded-2xl bg-muted/30 border border-border">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">🇬🇳</span>
                                        <div>
                                            <p className="text-sm font-black text-foreground">Produit guinéen local</p>
                                            <p className="text-xs text-muted-foreground font-medium">Affiche le badge "Local" sur votre fiche produit</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, est_local: !prev.est_local }))}
                                        className={cn(
                                            "relative w-12 h-6 rounded-full transition-all duration-300 shrink-0",
                                            formData.est_local ? "bg-emerald-500" : "bg-muted border border-border"
                                        )}
                                    >
                                        <span className={cn(
                                            "absolute size-5 top-0.5 rounded-full bg-white shadow transition-all duration-300",
                                            formData.est_local ? "left-6" : "left-0.5"
                                        )} />
                                    </button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Section 2 : Médias */}
                        <Card>
                            <CardHeader className="flex flex-row items-center gap-3 border-b border-border py-4">
                                <ImageIcon className="size-5 text-primary" />
                                <CardTitle className="text-sm font-black text-foreground uppercase tracking-widest">
                                    Image du produit
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-5">
                                <FormField label="URL de l'image" hint="Format HTTPS recommandé">
                                    <Input
                                        name="image_url"
                                        type="url"
                                        value={formData.image_url}
                                        onChange={handleChange}
                                        placeholder="https://exemple.com/photo-produit.jpg"
                                        className="h-12 rounded-xl"
                                    />
                                </FormField>

                                {/* Preview image */}
                                {formData.image_url && (
                                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-muted/30 border border-border">
                                        <img
                                            src={formData.image_url}
                                            alt="Aperçu"
                                            className="w-full h-full object-contain"
                                            onError={e => { e.target.style.display = 'none'; }}
                                        />
                                        <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[9px] font-black text-white uppercase tracking-widest">
                                            Aperçu image
                                        </div>
                                    </div>
                                )}

                                {!formData.image_url && (
                                    <div className="border-2 border-dashed border-border rounded-2xl aspect-video flex flex-col items-center justify-center gap-3 text-muted-foreground/40">
                                        <ImageIcon className="size-12" />
                                        <p className="text-xs font-black uppercase tracking-widest">Collez une URL pour prévisualiser</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Section 3 : Prix & Stock */}
                        <Card>
                            <CardHeader className="flex flex-row items-center gap-3 border-b border-border py-4">
                                <Tag className="size-5 text-primary" />
                                <CardTitle className="text-sm font-black text-foreground uppercase tracking-widest">
                                    Prix & Stock
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <FormField label="Prix de vente (GNF)" required error={errors.prix_unitaire}>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-muted-foreground">GNF</span>
                                            <Input
                                                name="prix_unitaire"
                                                type="number"
                                                min="0"
                                                step="1000"
                                                value={formData.prix_unitaire}
                                                onChange={handleChange}
                                                placeholder="150000"
                                                className={cn("h-12 pl-12 rounded-xl font-black italic text-lg", errors.prix_unitaire && "border-destructive")}
                                            />
                                        </div>
                                        {formData.prix_unitaire > 0 && (
                                            <p className="text-[10px] text-emerald-500 font-bold mt-1">
                                                ≈ {(parseFloat(formData.prix_unitaire) / 10000000).toFixed(2)} USD
                                            </p>
                                        )}
                                    </FormField>

                                    <FormField label="Prix barré (optionnel)" hint="Pour afficher une promo" error={errors.prix_ancien}>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-muted-foreground line-through opacity-60">GNF</span>
                                            <Input
                                                name="prix_ancien"
                                                type="number"
                                                min="0"
                                                step="1000"
                                                value={formData.prix_ancien}
                                                onChange={handleChange}
                                                placeholder="200000"
                                                className={cn("h-12 pl-12 rounded-xl text-muted-foreground", errors.prix_ancien && "border-destructive")}
                                            />
                                        </div>
                                    </FormField>
                                </div>

                                {/* Calcul promo live */}
                                {formData.prix_ancien && formData.prix_unitaire &&
                                    parseFloat(formData.prix_ancien) > parseFloat(formData.prix_unitaire) && (
                                        <div className="flex items-center gap-3 px-5 py-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                                            <CheckCircle2 className="size-5 text-emerald-500 shrink-0" />
                                            <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                                                Économie de {(parseFloat(formData.prix_ancien) - parseFloat(formData.prix_unitaire)).toLocaleString('fr-FR')} GNF
                                                {' '}(<span className="italic">-{Math.round(((parseFloat(formData.prix_ancien) - parseFloat(formData.prix_unitaire)) / parseFloat(formData.prix_ancien)) * 100)}%</span>)
                                                → Badge PROMO actif sur le catalogue ✅
                                            </p>
                                        </div>
                                    )}

                                <FormField label="Quantité en stock" required error={errors.stock_quantite}
                                    hint="Mis à jour automatiquement après chaque vente">
                                    <div className="relative">
                                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                        <Input
                                            name="stock_quantite"
                                            type="number"
                                            min="0"
                                            value={formData.stock_quantite}
                                            onChange={handleChange}
                                            placeholder="50"
                                            className={cn("h-12 pl-11 rounded-xl", errors.stock_quantite && "border-destructive")}
                                        />
                                    </div>
                                    {/* Indicateur de niveau stock */}
                                    {formData.stock_quantite !== '' && (
                                        <div className={cn(
                                            "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mt-1",
                                            parseInt(formData.stock_quantite) > 10 ? "text-emerald-500" :
                                                parseInt(formData.stock_quantite) > 0 ? "text-amber-500" : "text-destructive"
                                        )}>
                                            <span className={cn("size-2 rounded-full",
                                                parseInt(formData.stock_quantite) > 10 ? "bg-emerald-500" :
                                                    parseInt(formData.stock_quantite) > 0 ? "bg-amber-500 animate-pulse" : "bg-destructive"
                                            )} />
                                            {parseInt(formData.stock_quantite) > 10 ? 'Bon niveau de stock' :
                                                parseInt(formData.stock_quantite) > 0 ? 'Stock faible — pensez à réapprovisionner' :
                                                    'Rupture de stock — produit non visible sur le catalogue'}
                                        </div>
                                    )}
                                </FormField>
                            </CardContent>
                        </Card>

                        {/* Bouton Submit Mobile */}
                        <div className="xl:hidden">
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-sm gap-2 shadow-xl shadow-primary/20"
                            >
                                {isLoading ? <Loader2 className="size-5 animate-spin" /> : <Save className="size-5" />}
                                {isLoading ? 'Publication...' : (isEditMode ? 'Enregistrer les modifications' : 'Publier le produit')}
                            </Button>
                        </div>
                    </div>

                    {/* ─ Colonne Droite : Preview ─────────────────────────── */}
                    <div className="hidden xl:block">
                        <ProductPreview data={formData} categories={categories} />
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
};

export default AddProduct;
