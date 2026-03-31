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
                <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
                    <div className="size-20 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-300 border border-slate-100 dark:border-slate-800 mb-8">
                        <AlertCircle className="size-10" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Produit introuvable</h2>
                    <p className="text-slate-500 font-medium mt-3 max-w-sm mx-auto leading-relaxed">
                        Le produit que vous recherchez n'existe pas ou n'est plus disponible dans notre catalogue.
                    </p>
                    <Link to="/marketplace" className="mt-10">
                        <Button variant="outline" className="rounded-xl px-10 gap-2">
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
        specs: [
            { label: 'Catégorie', value: product.categorie?.nom_categorie || 'Divers' },
            { label: 'Boutique', value: product.boutique?.nom_boutique || 'BCA Partner' },
            { label: 'Garantie', value: '1 an BCA Protect' },
        ]
    };

    return (
        <PublicLayout>
            <div className="max-w-7xl mx-auto space-y-20 animate-in fade-in duration-1000 pb-40 px-6 md:px-10 pt-16">
                {/* ══════════════════════════════════════════════════
                    BREADCRUMBS & NAVIGATION
                ══════════════════════════════════════════════════ */}
                <nav className="flex items-center gap-4 text-executive-label font-black uppercase tracking-widest text-muted-foreground/60">
                    <Link to="/marketplace" className="hover:text-primary transition-colors flex items-center gap-3 group">
                        <div className="size-2 rounded-full bg-border group-hover:bg-primary transition-colors" />
                        MARKETPLACE
                    </Link>
                    <ArrowRight className="size-4 opacity-30" />
                    <span className="text-foreground truncate max-w-[300px] italic underline underline-offset-4 decoration-primary/20">#{uiProduct.name.toUpperCase()}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 lg:gap-32">
                    {/* ══════════════════════════════════════════════════
                        SECTION 1 — IMMERSIVE GALLERY
                    ══════════════════════════════════════════════════ */}
                    <div className="lg:col-span-7 space-y-10 animate-in slide-in-from-left-10 duration-1000">
                        <div className="relative aspect-square md:aspect-[4/3] rounded-[3.5rem] bg-accent/40 border-4 border-border overflow-hidden group shadow-premium">
                            <img
                                src={uiProduct.images[0]}
                                alt={uiProduct.name}
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                            />
                            
                            {/* Overlay Trust Badge */}
                            <div className="absolute top-10 left-10">
                                <div className="px-6 py-3 bg-background/40 backdrop-blur-3xl border-2 border-white/20 rounded-[1.5rem] flex items-center gap-4 shadow-premium">
                                    <div className="size-10 rounded-full bg-primary flex items-center justify-center text-background shadow-lg shadow-primary/40">
                                         <ShieldCheck className="size-5" />
                                    </div>
                                    <div className="flex flex-col">
                                         <span className="text-executive-label font-black text-foreground uppercase italic leading-none">BCA VERIFIED</span>
                                         <span className="text-[10px] font-bold text-muted-foreground uppercase mt-1 opacity-60">AUTHENTICITÉ GARANTIE</span>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute top-10 right-10 flex flex-col gap-6">
                                <button className="size-16 rounded-[1.5rem] bg-background/20 backdrop-blur-3xl border-2 border-white/20 flex items-center justify-center text-white hover:bg-background hover:text-rose-500 transition-all shadow-premium group/wish">
                                    <Heart className="size-8 group-hover/wish:fill-current" />
                                </button>
                                <button className="size-16 rounded-[1.5rem] bg-background/20 backdrop-blur-3xl border-2 border-white/20 flex items-center justify-center text-white hover:bg-background hover:text-primary transition-all shadow-premium">
                                    <Share2 className="size-8" />
                                </button>
                            </div>

                            {/* Floating zoom indicator */}
                            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                                 <div className="px-8 py-4 bg-foreground/90 backdrop-blur-xl rounded-full text-background text-executive-label font-black uppercase italic border-2 border-white/10 flex items-center gap-4">
                                     <Plus className="size-4" /> SURVOLEZ POUR AGRANDIR
                                 </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-8">
                            {uiProduct.images.slice(0, 4).map((img, idx) => (
                                <button
                                    key={idx}
                                    className={cn(
                                        "aspect-square rounded-[2rem] border-4 overflow-hidden bg-card transition-all duration-500 relative group/thumb shadow-premium",
                                        idx === 0 ? "border-primary ring-8 ring-primary/10" : "border-border opacity-60 hover:opacity-100 hover:scale-105"
                                    )}
                                >
                                    <img src={img} className="w-full h-full object-cover" alt={`Vue ${idx + 1}`} />
                                    {idx === 0 && <div className="absolute inset-0 bg-primary/10" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ══════════════════════════════════════════════════
                        SECTION 2 — EXECUTIVE PRODUCT INFO
                    ══════════════════════════════════════════════════ */}
                    <div className="lg:col-span-5 flex flex-col gap-12 animate-in slide-in-from-right-10 duration-1000">
                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="size-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                                <span className="text-executive-label font-black text-emerald-500 uppercase italic tracking-widest">OPTIMISATION BCA CONNECT ACTIVE</span>
                            </div>
                            
                            <div className="space-y-6">
                                <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tighter italic leading-[0.85] uppercase">
                                    {uiProduct.name}
                                </h1>
                                <div className="flex items-center gap-10">
                                    <div className="flex items-center gap-3 text-amber-500">
                                        <div className="flex -space-x-1.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={cn("size-5", i < 4 ? "fill-current" : "text-border")} />
                                            ))}
                                        </div>
                                        <span className="text-executive-data font-black text-foreground italic">{uiProduct.rating}</span>
                                    </div>
                                    <div className="h-6 w-[2px] bg-border" />
                                    <span className="text-executive-label font-black text-muted-foreground/60 uppercase italic tracking-widest">{uiProduct.reviewsCount} AUDITS CLIENTS PRO</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-12 rounded-[3.5rem] bg-card border-4 border-border shadow-premium space-y-12 relative overflow-hidden group/pricing">
                            <div className="absolute top-0 right-0 size-64 bg-primary/10 rounded-full blur-[100px] -mr-32 -mt-32 group-hover/pricing:bg-primary/20 transition-all duration-1000" />
                            
                            <div className="space-y-8 relative z-10">
                                <div className="space-y-4">
                                    <div className="flex items-baseline gap-4">
                                        <span className="text-6xl md:text-8xl font-black tracking-tighter text-foreground italic">{uiProduct.price.toLocaleString('fr-FR')}</span>
                                        <span className="text-executive-label font-black text-primary uppercase italic tracking-widest">GNF NET</span>
                                    </div>
                                    <div className="flex items-center gap-4 flex-wrap">
                                         <span className="text-executive-label font-black text-muted-foreground uppercase italic px-5 py-2 bg-background/50 rounded-full border-2 border-border shadow-inner">TVA 18% & SÉQUESTRE INCLUS</span>
                                         <Badge className="h-8 rounded-full bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-premium uppercase font-black italic tracking-widest text-[9px]">ELITE PRICE</Badge>
                                    </div>
                                </div>

                                <p className="text-lg text-muted-foreground font-bold leading-relaxed italic border-l-8 border-primary/20 pl-10 py-2 opacity-80">
                                    "{uiProduct.description}"
                                </p>
                            </div>

                            <div className="space-y-10 pt-12 border-t-4 border-border/50 relative z-10">
                                <div className="flex items-center justify-between">
                                     <p className="text-executive-label font-black uppercase italic tracking-widest text-muted-foreground/40">CONFIGURATION DE L'ORDRE</p>
                                     <div className={cn(
                                            "flex items-center gap-3 px-5 py-2 rounded-full text-executive-label font-black uppercase italic border-2 shadow-premium",
                                            product.stock_quantite > 0 ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-destructive/10 text-destructive border-destructive/20"
                                        )}>
                                            <div className={cn("size-2 rounded-full", product.stock_quantite > 0 ? "bg-emerald-500 animate-pulse" : "bg-destructive")} />
                                            {uiProduct.stockStatus.toUpperCase()} ({product.stock_quantite})
                                     </div>
                                </div>

                                <div className="flex flex-col md:flex-row items-center gap-8">
                                    <div className="flex items-center bg-accent/30 border-2 border-border rounded-2xl p-2 h-20 shadow-inner w-full md:w-auto">
                                        <button onClick={decrement} className="size-14 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-background transition-all rounded-xl border border-transparent hover:border-border"><Minus className="size-6" /></button>
                                        <span className="w-20 text-center text-2xl font-black text-foreground italic">{quantity}</span>
                                        <button onClick={increment} className="size-14 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-background transition-all rounded-xl border border-transparent hover:border-border"><Plus className="size-6" /></button>
                                    </div>
                                    
                                    <div className="flex-1 w-full flex flex-col gap-2">
                                        <Button
                                            disabled={product.stock_quantite <= 0}
                                            onClick={handleAddToCart}
                                            className={cn(
                                                "h-20 w-full rounded-[1.5rem] font-black uppercase italic tracking-widest text-executive-label transition-all duration-700 group/btn border-transparent",
                                                addedToCart ? "bg-emerald-500 text-white" : "bg-foreground text-background hover:bg-primary shadow-premium hover:scale-[1.03] active:scale-[0.97]"
                                            )}
                                        >
                                            {addedToCart
                                                ? <><CheckCircle2 className="size-6 mr-4 animate-bounce" /> AJOUTÉ AVEC SUCCÈS</>
                                                : <><ShoppingCart className="size-6 mr-4 group-hover/btn:rotate-12 transition-transform" /> COMMANDER LE CARGO</>
                                            }
                                        </Button>
                                    </div>
                                </div>

                                <Button
                                    disabled={product.stock_quantite <= 0}
                                    onClick={handleBuyNow}
                                    variant="outline"
                                    className="h-20 w-full rounded-[1.5rem] border-4 border-foreground hover:bg-foreground hover:text-background transition-all gap-5 hover:scale-[1.02] text-executive-label font-black uppercase italic tracking-widest shadow-premium"
                                >
                                    <Zap className="size-6 fill-current" />
                                    <span>ACQUISITION IMMÉDIATE</span>
                                </Button>
                            </div>

                            {/* Standardized Trust Signals */}
                            <div className="grid grid-cols-2 gap-6 pt-8">
                                <div className="p-6 rounded-[2rem] bg-accent/40 border-2 border-border flex flex-col gap-5 group/trust hover:border-primary/40 transition-all shadow-inner">
                                     <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover/trust:scale-110 transition-transform shadow-premium">
                                         <ShieldCheck className="size-7" />
                                     </div>
                                     <div className="space-y-2">
                                         <p className="text-executive-label font-black text-foreground uppercase italic leading-none">BCA GUARD</p>
                                         <p className="text-[10px] font-bold text-muted-foreground uppercase italic tracking-widest opacity-60">SÉCURITÉ MAXIMALE ACTIVE</p>
                                     </div>
                                </div>
                                <div className="p-6 rounded-[2rem] bg-accent/40 border-2 border-border flex flex-col gap-5 group/trust hover:border-emerald-500/40 transition-all shadow-inner">
                                     <div className="size-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 group-hover/trust:scale-110 transition-transform shadow-premium">
                                         <Truck className="size-7" />
                                     </div>
                                     <div className="space-y-2">
                                         <p className="text-executive-label font-black text-foreground uppercase italic leading-none">EXPRESS LINE</p>
                                         <p className="text-[10px] font-bold text-muted-foreground uppercase italic tracking-widest opacity-60">LIVRAISON PRIORITAIRE 48H</p>
                                     </div>
                                </div>
                            </div>
                        </div>

                        {/* Immersive Social Proof */}
                        <div className="px-10 py-6 rounded-[2rem] bg-primary/5 border-2 border-primary/20 flex items-center gap-6 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-500 shadow-premium">
                             <div className="relative">
                                 <div className="size-4 rounded-full bg-primary animate-ping" />
                                 <div className="absolute top-0 left-0 size-4 rounded-full bg-primary" />
                             </div>
                             <p className="text-executive-label font-black text-primary uppercase italic tracking-widest opacity-80 leading-relaxed">
                                 HAUTEMENT CONVOITÉ : 43 INVESTISSEURS CONSULTENT CETTE OPPORTUNITÉ EN TEMPS RÉEL
                             </p>
                        </div>
                    </div>
                </div>

                {/* Tabs / Detailed Specs */}
                <div className="space-y-12 pt-20 border-t-8 border-border">
                    <div className="flex items-center gap-16 border-b-4 border-border overflow-x-auto scrollbar-hide">
                        <button
                            onClick={() => setActiveTab('desc')}
                            className={cn(
                                "pb-6 text-executive-label font-black uppercase italic tracking-widest transition-all relative whitespace-nowrap",
                                activeTab === 'desc' ? "text-primary decoration-primary decoration-4 underline underline-offset-[26px]" : "text-muted-foreground/40 hover:text-foreground"
                            )}
                        >
                            DESCRIPTION DÉTAILLÉE
                        </button>
                        <button
                            onClick={() => setActiveTab('tech')}
                            className={cn(
                                "pb-6 text-executive-label font-black uppercase italic tracking-widest transition-all relative whitespace-nowrap",
                                activeTab === 'tech' ? "text-primary decoration-primary decoration-4 underline underline-offset-[26px]" : "text-muted-foreground/40 hover:text-foreground"
                            )}
                        >
                            SPÉCIFICATIONS TECHNIQUES
                        </button>
                    </div>

                    <div className="animate-in fade-in slide-in-from-top-4 duration-700">
                        <div className="lg:col-span-8">
                            {activeTab === 'desc' ? (
                                <div className="space-y-10 text-muted-foreground font-bold leading-relaxed max-w-4xl italic text-lg opacity-80">
                                    <h3 className="text-3xl md:text-5xl font-black text-foreground tracking-tighter uppercase italic leading-none mb-4">L'EXCELLENCE BCA <span className="text-primary italic">SANS COMPROMIS</span></h3>
                                    <p className="leading-loose">{uiProduct.fullDescription}</p>
                                </div>
                            ) : (
                                <div className="rounded-[3rem] border-4 border-border overflow-hidden bg-card max-w-3xl shadow-premium">
                                    <table className="w-full">
                                        <tbody>
                                            {uiProduct.specs.map((spec, i) => (
                                                <tr key={i} className="border-b-2 border-border last:border-0 hover:bg-accent/50 transition-colors">
                                                    <td className="p-8 text-executive-label font-black uppercase italic tracking-widest text-muted-foreground bg-accent/20 w-1/3 border-r-2 border-border">{spec.label}</td>
                                                    <td className="p-8 text-xl font-black text-foreground italic uppercase tracking-tighter">{spec.value}</td>
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

            {/* Sticky Mobile CTA Bar (Premium Modern) */}
            <div className="fixed bottom-10 left-6 right-6 z-50 lg:hidden px-8 py-6 bg-background/80 backdrop-blur-3xl border-4 border-border rounded-[2.5rem] shadow-premium-lg animate-in slide-in-from-bottom duration-700">
                <div className="flex items-center gap-8 max-w-lg mx-auto">
                    <div className="flex flex-col">
                        <span className="text-2xl font-black text-foreground italic leading-none">{uiProduct.price.toLocaleString('fr-FR')}</span>
                        <span className="text-executive-label font-black text-primary uppercase italic mt-1 tracking-widest">GNF TTC</span>
                    </div>
                    <Button 
                        onClick={handleAddToCart}
                        disabled={product.stock_quantite <= 0}
                        className={cn(
                            "flex-1 h-16 rounded-2xl font-black uppercase italic tracking-widest text-executive-label transition-all duration-500 border-transparent",
                            addedToCart ? "bg-emerald-500 text-white" : "bg-foreground text-background shadow-premium"
                        )}
                    >
                        {addedToCart ? <CheckCircle2 className="size-6" /> : "COMMANDER"}
                    </Button>
                </div>
            </div>
        </PublicLayout>
    );
};

export default ProductDetail;
