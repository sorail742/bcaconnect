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
        stockDetail: product.stock_quantite > 0 ? `${product.stock_quantite} disponibles` : 'Indisponible',
        specs: [
            { label: 'Catégorie', value: product.categorie?.nom_categorie || 'Divers' },
            { label: 'Boutique', value: product.boutique?.nom_boutique || 'BCA Partner' },
            { label: 'Garantie', value: '1 an BCA Protect' },
        ]
    };

    return (
        <PublicLayout>
            <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 font-inter pb-24 px-4 md:px-8 pt-10">
                {/* ══════════════════════════════════════════════════
                    BREADCRUMBS & NAVIGATION
                ══════════════════════════════════════════════════ */}
                <nav className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400/80">
                    <Link to="/marketplace" className="hover:text-primary transition-colors flex items-center gap-2">
                        <div className="size-1.5 rounded-full bg-slate-200 dark:bg-slate-800" />
                        Marketplace
                    </Link>
                    <ArrowRight className="size-3 opacity-20" />
                    <span className="text-slate-900 dark:text-white truncate max-w-[200px] italic">#{uiProduct.name}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
                    {/* ══════════════════════════════════════════════════
                        SECTION 1 — IMMERSIVE GALLERY
                    ══════════════════════════════════════════════════ */}
                    <div className="lg:col-span-7 space-y-8 animate-in slide-in-from-left-10 duration-1000">
                        <div className="relative aspect-square md:aspect-[4/3] rounded-[3rem] bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 overflow-hidden group shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)]">
                            <img
                                src={uiProduct.images[0]}
                                alt={uiProduct.name}
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                            />
                            
                            {/* Overlay Trust Badge */}
                            <div className="absolute top-8 left-8">
                                <div className="px-4 py-2 bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/20 dark:border-slate-800/20 rounded-2xl flex items-center gap-3 shadow-2xl">
                                    <div className="size-8 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                                         <ShieldCheck className="size-4" />
                                    </div>
                                    <div className="flex flex-col">
                                         <span className="text-[8px] font-black text-slate-900 dark:text-white uppercase tracking-widest leading-none">BCA Verified</span>
                                         <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest mt-1">Authenticité Garantie</span>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute top-8 right-8 flex flex-col gap-4">
                                <button className="size-14 rounded-2xl bg-white/20 dark:bg-slate-950/20 backdrop-blur-2xl border border-white/20 dark:border-white/5 flex items-center justify-center text-white hover:bg-white hover:text-rose-500 transition-all shadow-2xl group/wish">
                                    <Heart className="size-6 group-hover/wish:fill-current" />
                                </button>
                                <button className="size-14 rounded-2xl bg-white/20 dark:bg-slate-950/20 backdrop-blur-2xl border border-white/20 dark:border-white/5 flex items-center justify-center text-white hover:bg-white hover:text-primary transition-all shadow-2xl">
                                    <Share2 className="size-6" />
                                </button>
                            </div>

                            {/* Floating zoom indicator */}
                            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                 <div className="px-6 py-3 bg-slate-900/80 backdrop-blur-md rounded-full text-white text-[10px] font-black uppercase tracking-[0.2em] border border-white/10 flex items-center gap-3">
                                     <Plus className="size-3" /> Survolez pour agrandir
                                 </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-6">
                            {uiProduct.images.slice(0, 4).map((img, idx) => (
                                <button
                                    key={idx}
                                    className={cn(
                                        "aspect-square rounded-[1.5rem] border-4 overflow-hidden bg-white dark:bg-slate-900 transition-all duration-300 relative group/thumb",
                                        idx === 0 ? "border-primary shadow-2xl shadow-primary/10 ring-4 ring-primary/5" : "border-transparent opacity-60 hover:opacity-100 hover:scale-105"
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
                    <div className="lg:col-span-5 flex flex-col gap-10 animate-in slide-in-from-right-10 duration-1000">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em]">Optimisation BCA Connect</span>
                            </div>
                            
                            <div className="space-y-4">
                                <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter italic leading-[0.9] uppercase underline decoration-primary/20 decoration-8 underline-offset-[-2px]">
                                    {uiProduct.name}
                                </h1>
                                <div className="flex items-center gap-8">
                                    <div className="flex items-center gap-2 text-amber-500">
                                        <div className="flex -space-x-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={cn("size-4", i < 4 ? "fill-current" : "text-slate-200 dark:text-slate-800")} />
                                            ))}
                                        </div>
                                        <span className="text-xs font-black text-slate-900 dark:text-white tracking-widest">{uiProduct.rating}</span>
                                    </div>
                                    <div className="h-4 w-px bg-slate-100 dark:bg-slate-800" />
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">{uiProduct.reviewsCount} AUDITS CLIENTS</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-10 rounded-[3rem] bg-white dark:bg-slate-900 border-2 border-slate-50 dark:border-slate-800 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] space-y-10 relative overflow-hidden group/pricing">
                            <div className="absolute top-0 right-0 size-40 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 group-hover/pricing:bg-primary/10 transition-colors" />
                            
                            <div className="space-y-6 relative z-10">
                                <div className="space-y-2">
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-5xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white italic">{uiProduct.price.toLocaleString('fr-FR')}</span>
                                        <span className="text-sm font-black text-primary uppercase tracking-[0.3em]">GNF Net</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-100 dark:border-slate-700">TVA 18% & SÉQUESTRE INCLUS</span>
                                         <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-emerald-500/20 text-emerald-600 bg-emerald-50/50">Elite Price</Badge>
                                    </div>
                                </div>

                                <p className="text-sm text-slate-500 font-bold leading-relaxed italic border-l-4 border-primary/20 pl-6">
                                    "{uiProduct.description}"
                                </p>
                            </div>

                            <div className="space-y-6 pt-10 border-t border-slate-50 dark:border-slate-800 relative z-10">
                                <div className="flex items-center justify-between">
                                     <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Configuration de l'ordre</p>
                                     <div className={cn(
                                            "flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                            product.stock_quantite > 0 ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                                        )}>
                                            <div className={cn("size-1.5 rounded-full", product.stock_quantite > 0 ? "bg-emerald-500 animate-pulse" : "bg-rose-500")} />
                                            {uiProduct.stockStatus} ({product.stock_quantite})
                                     </div>
                                </div>

                                <div className="flex flex-col md:flex-row items-center gap-6">
                                    <div className="flex items-center bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-1.5 h-16 shadow-inner w-full md:w-auto">
                                        <button onClick={decrement} className="size-12 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-white dark:hover:bg-slate-900 transition-all rounded-xl"><Minus className="size-5" /></button>
                                        <span className="w-16 text-center text-lg font-black text-slate-900 dark:text-white italic">{quantity}</span>
                                        <button onClick={increment} className="size-12 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-white dark:hover:bg-slate-900 transition-all rounded-xl"><Plus className="size-5" /></button>
                                    </div>
                                    
                                    <div className="flex-1 w-full flex flex-col gap-2">
                                        <Button
                                            disabled={product.stock_quantite <= 0}
                                            onClick={handleAddToCart}
                                            className={cn(
                                                "h-16 w-full rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] transition-all duration-500 group/btn",
                                                addedToCart ? "bg-emerald-500 border-emerald-500 text-white" : "bg-slate-900 hover:bg-primary text-white border-0 shadow-2xl shadow-primary/20 hover:scale-[1.03] active:scale-[0.97]"
                                            )}
                                        >
                                            {addedToCart
                                                ? <><CheckCircle2 className="size-4 mr-3 animate-bounce" /> Ajouté avec succès</>
                                                : <><ShoppingCart className="size-4 mr-3 group-hover/btn:rotate-12 transition-transform" /> Ajouter au Cargo</>
                                            }
                                        </Button>
                                    </div>
                                </div>

                                <Button
                                    disabled={product.stock_quantite <= 0}
                                    onClick={handleBuyNow}
                                    variant="outline"
                                    className="h-16 w-full rounded-2xl border-2 border-slate-900 dark:border-white font-black uppercase tracking-[0.3em] text-[11px] hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all gap-3 hover:scale-[1.02]"
                                >
                                    <Zap className="size-5 fill-current" />
                                    <span>Acquisition Immédiate</span>
                                </Button>
                            </div>

                            {/* Standardized Trust Signals */}
                            <div className="grid grid-cols-2 gap-4 pt-6">
                                <div className="p-4 rounded-[1.5rem] bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex flex-col gap-3 group/trust">
                                     <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover/trust:scale-110 transition-transform">
                                         <ShieldCheck className="size-5" />
                                     </div>
                                     <div className="space-y-1">
                                         <p className="text-[8px] font-black text-slate-900 dark:text-white uppercase tracking-widest leading-none">BCA Guard</p>
                                         <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Protection Active</p>
                                     </div>
                                </div>
                                <div className="p-4 rounded-[1.5rem] bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex flex-col gap-3 group/trust">
                                     <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 group-hover/trust:scale-110 transition-transform">
                                         <Truck className="size-5" />
                                     </div>
                                     <div className="space-y-1">
                                         <p className="text-[8px] font-black text-slate-900 dark:text-white uppercase tracking-widest leading-none">Express Line</p>
                                         <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Délai Prioritaire</p>
                                     </div>
                                </div>
                            </div>
                        </div>

                        {/* Immersive Social Proof */}
                        <div className="px-8 py-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-4 animate-in fade-in slide-in-from-bottom duration-1000 delay-500">
                             <div className="relative">
                                 <div className="size-3 rounded-full bg-primary animate-ping" />
                                 <div className="absolute top-0 left-0 size-3 rounded-full bg-primary" />
                             </div>
                             <p className="text-[9px] font-black text-primary uppercase tracking-[0.3em] italic">
                                 Hautement convoité : 43 investisseurs consultent cette offre
                             </p>
                        </div>
                    </div>
                </div>

                {/* Tabs / Detailed Specs */}
                <div className="space-y-10 pt-10 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-10 border-b border-slate-100 dark:border-slate-800 overflow-x-auto scrollbar-hide">
                        <button
                            onClick={() => setActiveTab('desc')}
                            className={cn(
                                "pb-4 text-[11px] font-bold uppercase tracking-[0.2em] transition-all relative whitespace-nowrap",
                                activeTab === 'desc' ? "text-primary border-b-2 border-primary" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            Description détaillée
                        </button>
                        <button
                            onClick={() => setActiveTab('tech')}
                            className={cn(
                                "pb-4 text-[11px] font-bold uppercase tracking-[0.2em] transition-all relative whitespace-nowrap",
                                activeTab === 'tech' ? "text-primary border-b-2 border-primary" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            Informations techniques
                        </button>
                    </div>

                    <div>
                        <div className="lg:col-span-8">
                            {activeTab === 'desc' ? (
                                <div className="space-y-6 text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
                                    <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-4">La qualité BCA Connect Garantie</h3>
                                    <p className="font-medium">{uiProduct.fullDescription}</p>
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 max-w-2xl">
                                    <table className="w-full">
                                        <tbody>
                                            {uiProduct.specs.map((spec, i) => (
                                                <tr key={i} className="border-b border-slate-50 dark:border-slate-800 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                                    <td className="p-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50/30 dark:bg-slate-950/30 w-1/3 border-r border-slate-50 dark:border-slate-800">{spec.label}</td>
                                                    <td className="p-5 text-sm font-bold text-slate-700 dark:text-slate-300">{spec.value}</td>
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

            {/* Sticky Mobile CTA Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden p-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 animate-in slide-in-from-bottom duration-500">
                <div className="flex items-center gap-4 max-w-lg mx-auto">
                    <div className="flex flex-col">
                        <span className="text-lg font-bold text-slate-900 dark:text-white leading-none">{uiProduct.price.toLocaleString('fr-FR')}</span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">GNF TTC</span>
                    </div>
                    <Button 
                        onClick={handleAddToCart}
                        disabled={product.stock_quantite <= 0}
                        className={cn(
                            "flex-1 h-12 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all duration-300",
                            addedToCart ? "bg-emerald-500" : "shadow-lg shadow-primary/20"
                        )}
                    >
                        {addedToCart ? <CheckCircle2 className="size-4" /> : <><ShoppingCart className="size-4 mr-2" /> Ajouter</>}
                    </Button>
                </div>
            </div>
        </PublicLayout>
    );
};

export default ProductDetail;
