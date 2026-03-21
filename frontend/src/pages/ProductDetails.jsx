import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout';
import { Button } from '../components/ui/Button';
import {
    ShoppingCart,
    Star,
    Minus,
    Plus,
    ShieldCheck,
    Truck,
    ArrowRight,
    CheckCircle2,
    Award,
    Share2,
    Heart,
    AlertCircle,
    Zap
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { cn } from '../lib/utils';
import productService from '../services/productService';
import { PageLoader } from '../components/ui/Loader';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart, cartItems } = useCart();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('desc');
    const [addedToCart, setAddedToCart] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const data = await productService.getById(id);
                setProduct(data);
                setError(false);
            } catch (err) {
                console.error("Erreur chargement produit:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProduct();
        }
    }, [id]);

    const maxQty = product?.stock_quantite || 0;
    const increment = () => setQuantity(prev => Math.min(prev + 1, maxQty));
    const decrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

    const handleAddToCart = () => {
        if (!product || product.stock_quantite <= 0) return;
        addToCart(product, quantity);
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2500);
        toast.success(
            `✅ ${quantity}x "${product.nom_produit}" ajouté au panier
Total panier mis à jour.`,
            {
                duration: 3000,
                action: {
                    label: 'Commander →',
                    onClick: () => navigate('/checkout')
                }
            }
        );
    };

    const handleBuyNow = () => {
        if (!product || product.stock_quantite <= 0) return;
        addToCart(product, quantity);
        navigate('/checkout');
    };

    if (loading) return <PageLoader />;

    if (error || !product) {
        return (
            <PublicLayout>
                <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
                    <div className="size-20 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                        <AlertCircle className="size-10" />
                    </div>
                    <h2 className="text-3xl font-black italic tracking-tighter">Produit introuvable</h2>
                    <p className="text-muted-foreground font-medium max-w-md">Désolé, nous ne parvenons pas à charger les détails de ce produit. Il a peut-être été supprimé ou est temporairement indisponible.</p>
                    <Link to="/marketplace">
                        <Button variant="outline" className="gap-2">
                            <ArrowRight className="size-4 rotate-180" /> Retour au catalogue
                        </Button>
                    </Link>
                </div>
            </PublicLayout>
        );
    }

    // Mapping des données backend vers le format UI
    const uiProduct = {
        name: product.nom_produit || 'Produit sans nom',
        price: parseFloat(product.prix_unitaire || 0),
        description: product.description || "Aucune description disponible.",
        fullDescription: product.description_longue || product.description || "Détails complets à venir pour ce produit.",
        images: product.images && product.images.length > 0
            ? product.images.map(img => img.url_image)
            : ['https://images.unsplash.com/photo-1560393464-5c69a73c5770?auto=format&fit=crop&q=80&w=600'],
        rating: 4.5,
        reviewsCount: 0,
        isNew: true,
        stockStatus: product.stock_quantite > 0 ? `En stock` : 'Rupture de stock',
        stockDetail: product.stock_quantite > 0 ? `${product.stock_quantite} disponibles` : 'Indisponible',
        specs: [
            { label: 'Catégorie', value: product.categorie?.nom_categorie || 'Divers' },
            { label: 'Boutique', value: product.boutique?.nom_boutique || 'BCA Partner' },
            { label: 'Garantie', value: '1 an BCA Protect' },
        ]
    };

    return (
        <PublicLayout>
            <div className="w-full space-y-12 animate-in fade-in duration-700 font-inter pb-20 px-4 md:px-8 max-w-7xl mx-auto pt-10">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                    <Link to="/marketplace" className="hover:text-primary transition-colors">Marketplace</Link>
                    <ArrowRight className="size-3" />
                    <span className="text-foreground italic">{uiProduct.name}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Left: Gallery */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="relative aspect-[4/3] rounded-[2.5rem] bg-card border border-border overflow-hidden group shadow-2xl">
                            <img
                                src={uiProduct.images[0]}
                                alt={uiProduct.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute top-6 right-6 flex flex-col gap-3">
                                <button className="size-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-rose-500 transition-all shadow-lg">
                                    <Heart className="size-5" />
                                </button>
                                <button className="size-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-primary transition-all shadow-lg">
                                    <Share2 className="size-5" />
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            {uiProduct.images.slice(0, 4).map((img, idx) => (
                                <button
                                    key={idx}
                                    className={cn(
                                        "aspect-square rounded-2xl border-2 overflow-hidden bg-card transition-all",
                                        idx === 0 ? "border-primary scale-105 shadow-lg shadow-primary/10" : "border-border hover:border-primary/40"
                                    )}
                                >
                                    <img src={img} className="w-full h-full object-cover" alt={`Vue ${idx + 1}`} />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right: Info & CTA */}
                    <div className="lg:col-span-5 flex flex-col gap-8">
                        <div className="space-y-4">
                            <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em]">
                                {uiProduct.isNew ? 'Innovation 2024' : 'Stock Limité'}
                            </Badge>
                            <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tighter italic leading-none">{uiProduct.name}</h1>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-1 text-amber-500">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={cn("size-4", i < 4 ? "fill-current" : "opacity-30")} />
                                    ))}
                                    <span className="text-xs font-black ml-2 text-foreground italic">{uiProduct.rating}</span>
                                </div>
                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest border-l border-border pl-6">{uiProduct.reviewsCount} Avis clients</span>
                            </div>
                        </div>

                        <div className="p-8 rounded-[2rem] bg-muted/20 border border-border space-y-6">
                            <div className="flex items-end gap-4">
                                <div className="flex flex-col leading-none">
                                    <span className="text-4xl font-black italic tracking-tighter text-foreground">{uiProduct.price.toLocaleString('fr-FR')} GNF</span>
                                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] mt-2">Prix unitaire TTC</span>
                                </div>
                            </div>

                            <p className="text-sm text-foreground/70 font-medium leading-relaxed italic border-l-2 border-primary/30 pl-4">
                                "{uiProduct.description}"
                            </p>

                            <div className="space-y-4 pt-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Quantité à commander</p>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center bg-card border border-border rounded-xl px-2 h-14">
                                        <button onClick={decrement} className="size-10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"><Minus className="size-4" /></button>
                                        <span className="w-12 text-center text-sm font-black italic">{quantity}</span>
                                        <button onClick={increment} className="size-10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"><Plus className="size-4" /></button>
                                    </div>
                                    <div className="flex flex-col leading-none">
                                        <span className={cn(
                                            "text-[10px] font-black uppercase tracking-widest flex items-center gap-1",
                                            product.stock_quantite > 0 ? "text-emerald-500" : "text-destructive"
                                        )}>
                                            <CheckCircle2 className="size-3" /> {uiProduct.stockStatus}
                                        </span>
                                        <span className="text-[9px] text-muted-foreground font-medium mt-1">{uiProduct.stockDetail}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                                <Button
                                    disabled={product.stock_quantite <= 0}
                                    onClick={handleAddToCart}
                                    className={cn(
                                        "h-16 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-primary/30 group transition-all duration-300",
                                        addedToCart && "bg-emerald-500 shadow-emerald-500/30"
                                    )}
                                >
                                    {addedToCart
                                        ? <><CheckCircle2 className="size-5 mr-2" /> Ajouté !</>
                                        : <><ShoppingCart className="size-5 mr-2 group-hover:rotate-12 transition-transform" /> Ajouter au panier</>
                                    }
                                </Button>
                                <Button
                                    disabled={product.stock_quantite <= 0}
                                    onClick={handleBuyNow}
                                    variant="outline"
                                    className="h-16 rounded-2xl border-primary/30 bg-primary/5 font-black uppercase tracking-widest text-[11px] hover:bg-primary hover:text-white transition-all group"
                                >
                                    <Zap className="size-4 mr-2 group-hover:animate-bounce" /> Acheter maintenant
                                </Button>
                            </div>
                        </div>

                        {/* Quick Specs Cards */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl border border-border bg-card flex items-center gap-3">
                                <Truck className="size-5 text-primary" />
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground leading-none">Livraison</span>
                                    <span className="text-xs font-bold text-foreground mt-1">48h (Guinée)</span>
                                </div>
                            </div>
                            <div className="p-4 rounded-2xl border border-border bg-card flex items-center gap-3">
                                <ShieldCheck className="size-5 text-primary" />
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground leading-none">Garantie</span>
                                    <span className="text-xs font-bold text-foreground mt-1">1 an (BCA Care)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs / Detailed Specs */}
                <div className="space-y-8">
                    <div className="flex items-center gap-8 border-b border-border font-inter">
                        <button
                            onClick={() => setActiveTab('desc')}
                            className={cn(
                                "pb-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative",
                                activeTab === 'desc' ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Description Complète
                        </button>
                        <button
                            onClick={() => setActiveTab('tech')}
                            className={cn(
                                "pb-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative",
                                activeTab === 'tech' ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Détails Techniques
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                        <div className="lg:col-span-8">
                            {activeTab === 'desc' ? (
                                <div className="space-y-6 text-foreground/80 leading-relaxed font-medium italic italic">
                                    <h3 className="text-2xl font-black text-foreground not-italic tracking-tight mb-4">La robustesse au service du digital</h3>
                                    <p>{uiProduct.fullDescription}</p>
                                </div>
                            ) : (
                                <div className="bg-muted shadow-inner rounded-[2rem] overflow-hidden">
                                    <table className="w-full">
                                        <tbody>
                                            {uiProduct.specs.map((spec, i) => (
                                                <tr key={i} className="border-b border-slate-200/50 dark:border-slate-800/50 last:border-0">
                                                    <td className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-slate-50 dark:bg-slate-900/50 w-1/3">{spec.label}</td>
                                                    <td className="p-6 text-sm font-bold text-foreground italic">{spec.value}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};

export default ProductDetail;
