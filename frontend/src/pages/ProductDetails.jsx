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
                <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 bg-[#0A0D14]">
                    <div className="size-24 rounded-[2.5rem] bg-white/[0.03] flex items-center justify-center text-slate-500 border border-white/5 mb-10 shadow-2xl">
                        <AlertCircle className="size-12" />
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter uppercase">Signal Perdu.</h2>
                    <p className="text-slate-500 font-bold mt-4 max-w-sm mx-auto leading-relaxed italic uppercase text-xs tracking-widest opacity-60">
                        L'actif spécifié est introuvable ou a été retiré du registre central de BCA Connect.
                    </p>
                    <Link to="/marketplace" className="mt-12">
                        <Button className="rounded-2xl h-16 px-12 border-2 border-[#FF6600] text-[#FF6600] bg-transparent hover:bg-[#FF6600] hover:text-white font-black uppercase italic tracking-[0.2em] transition-all">
                            RETOUR AU HUB CENTRAL
                        </Button>
                    </Link>
                </div>
            </PublicLayout>
        );
    }

    // Mapping des données backend vers le format UI
    const uiProduct = {
        name: product.nom_produit || 'PRODUIT ALPHA',
        price: parseFloat(product.prix_unitaire || 0),
        description: product.description || "ANALYSE DE DESCRIPTION EN ATTENTE.",
        fullDescription: product.description_longue || product.description || "DÉTAILS OPÉRATIONNELS EN COURS D'INDEXATION POUR CET ACTIF.",
        images: product.images && product.images.length > 0
            ? product.images.map(img => img.url_image)
            : ['https://images.unsplash.com/photo-1560393464-5c69a73c5770?auto=format&fit=crop&q=80&w=600'],
        rating: 4.8,
        reviewsCount: Math.floor(Math.random() * 50) + 12,
        isNew: true,
        stockStatus: product.stock_quantite > 0 ? `OPÉRATIONNEL` : 'RUPTURE DE FLUX',
        specs: [
            { label: 'CATÉGORIE', value: product.categorie?.nom_categorie?.toUpperCase() || 'DIVERS' },
            { label: 'PROVENANCE', value: product.boutique?.nom_boutique?.toUpperCase() || 'BCA PARTNER' },
            { label: 'GARANTIE', value: 'BCA PROTECT PREMIUM' },
        ]
    };

    return (
        <PublicLayout>
            <div className="bg-[#0A0D14] text-white font-inter">
                <div className="max-w-7xl mx-auto space-y-20 animate-in fade-in duration-1000 pb-44 px-6 md:px-10 pt-20">
                    {/* BREADCRUMBS & NAVIGATION */}
                    <nav className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">
                        <Link to="/marketplace" className="hover:text-[#FF6600] transition-colors flex items-center gap-3 group">
                            <div className="size-2 rounded-full bg-white/10 group-hover:bg-[#FF6600] transition-colors" />
                            MARKETPLACE
                        </Link>
                        <ArrowRight className="size-3 opacity-30" />
                        <span className="text-white truncate max-w-[300px] italic border-b border-[#FF6600]/30 pb-0.5">#{uiProduct.name.toUpperCase()}</span>
                    </nav>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 lg:gap-32">
                        {/* SECTION 1 — IMMERSIVE GALLERY */}
                        <div className="lg:col-span-7 space-y-10 animate-in slide-in-from-left-10 duration-1000">
                            <div className="relative aspect-square md:aspect-[4/3] rounded-[3.5rem] bg-white/[0.02] border-4 border-white/5 overflow-hidden group shadow-2xl transition-all hover:border-[#FF6600]/30">
                                <img
                                    src={uiProduct.images[0]}
                                    alt={uiProduct.name}
                                    className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
                                />

                                {/* Overlay Trust Badge */}
                                <div className="absolute top-10 left-10">
                                    <div className="px-6 py-3 bg-black/40 backdrop-blur-3xl border-2 border-white/10 rounded-[1.5rem] flex items-center gap-4 shadow-2xl">
                                        <div className="size-10 rounded-full bg-[#FF6600] flex items-center justify-center text-white shadow-xl shadow-[#FF6600]/30 animate-pulse">
                                            <ShieldCheck className="size-5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-white uppercase italic leading-none tracking-widest">BCA VERIFIED</span>
                                            <span className="text-[8px] font-bold text-slate-400 uppercase mt-1 opacity-60 tracking-tighter">AUTHENTICITÉ GARANTIE</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="absolute top-10 right-10 flex flex-col gap-6">
                                    <button className="size-16 rounded-[1.5rem] bg-black/20 backdrop-blur-3xl border-2 border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-[#FF6600] transition-all shadow-2xl group/wish">
                                        <Heart className="size-8 group-hover/wish:fill-current" />
                                    </button>
                                    <button className="size-16 rounded-[1.5rem] bg-black/20 backdrop-blur-3xl border-2 border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-[#FF6600] transition-all shadow-2xl">
                                        <Share2 className="size-8" />
                                    </button>
                                </div>

                                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                                    <div className="px-8 py-4 bg-[#FF6600] backdrop-blur-xl rounded-full text-white text-[10px] font-black uppercase italic border-2 border-white/20 flex items-center gap-4 shadow-2xl">
                                        <Plus className="size-4" /> FOCUS IMMERSIF ACTIF
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-8">
                                {uiProduct.images.slice(0, 4).map((img, idx) => (
                                    <button
                                        key={idx}
                                        className={cn(
                                            "aspect-square rounded-[2.5rem] border-4 overflow-hidden bg-white/[0.02] transition-all duration-500 relative group/thumb shadow-xl",
                                            idx === 0 ? "border-[#FF6600] ring-8 ring-[#FF6600]/10" : "border-white/5 opacity-40 hover:opacity-100 hover:scale-105"
                                        )}
                                    >
                                        <img src={img} className="w-full h-full object-cover" alt={`Vue ${idx + 1}`} />
                                        {idx === 0 && <div className="absolute inset-0 bg-[#FF6600]/10" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* SECTION 2 — EXECUTIVE PRODUCT INFO */}
                        <div className="lg:col-span-5 flex flex-col gap-12 animate-in slide-in-from-right-10 duration-1000">
                            <div className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="size-3 rounded-full bg-[#FF6600] animate-pulse shadow-[0_0_15px_rgba(255,102,0,0.6)]" />
                                    <span className="text-[10px] font-black text-[#FF6600] uppercase italic tracking-[0.4em]">BCA CONNECT • PRISE DE POSSESSION</span>
                                </div>

                                <div className="space-y-6">
                                    <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter italic leading-[0.85] uppercase">
                                        {uiProduct.name}
                                    </h1>
                                    <div className="flex items-center gap-10">
                                        <div className="flex items-center gap-3 text-amber-500">
                                            <div className="flex -space-x-1.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className={cn("size-6", i < 4 ? "fill-current" : "text-white/10")} />
                                                ))}
                                            </div>
                                            <span className="text-2xl font-black text-white italic ml-2">{uiProduct.rating}</span>
                                        </div>
                                        <div className="h-8 w-[2px] bg-white/10" />
                                        <span className="text-[10px] font-black text-slate-500 uppercase italic tracking-[0.2em]">{uiProduct.reviewsCount} AUDITS CLIENTS PRO</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-12 rounded-[4rem] bg-[#0F1219] border-4 border-white/5 shadow-2xl space-y-12 relative overflow-hidden group/pricing">
                                <div className="absolute top-0 right-0 size-80 bg-[#FF6600]/10 rounded-full blur-[100px] -mr-40 -mt-40 group-hover/pricing:bg-[#FF6600]/20 transition-all duration-1000" />

                                <div className="space-y-8 relative z-10">
                                    <div className="space-y-4">
                                        <div className="flex items-baseline gap-4">
                                            <span className="text-6xl md:text-9xl font-black tracking-tighter text-white italic leading-none">{uiProduct.price.toLocaleString('fr-FR')}</span>
                                            <span className="text-xl font-black text-[#FF6600] uppercase italic tracking-widest">GNF</span>
                                        </div>
                                        <div className="flex items-center gap-4 flex-wrap">
                                            <span className="text-[9px] font-black text-slate-400 uppercase italic px-5 py-2.5 bg-white/5 rounded-full border border-white/5 shadow-inner tracking-widest">TVA 18% & SÉQUESTRE INCLUS</span>
                                            <Badge className="h-10 rounded-full bg-[#FF6600]/10 text-[#FF6600] border-[#FF6600]/20 shadow-xl uppercase font-black italic tracking-[0.2em] text-[10px] px-6">ELITE PRICE</Badge>
                                        </div>
                                    </div>

                                    <p className="text-xl text-slate-400 font-bold leading-relaxed italic border-l-8 border-[#FF6600]/30 pl-10 py-2 opacity-80 uppercase tracking-tighter">
                                        "{uiProduct.description}"
                                    </p>
                                </div>

                                <div className="space-y-10 pt-12 border-t-4 border-white/5 relative z-10">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] font-black uppercase italic tracking-[0.4em] text-slate-600">CONFIGURATION DE L'ORDRE</p>
                                        <div className={cn(
                                            "flex items-center gap-3 px-6 py-2.5 rounded-full text-[10px] font-black uppercase italic border-2 shadow-2xl transition-all",
                                            product.stock_quantite > 0 ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                                        )}>
                                            <div className={cn("size-2 rounded-full", product.stock_quantite > 0 ? "bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" : "bg-red-500")} />
                                            {uiProduct.stockStatus.toUpperCase()} ({product.stock_quantite})
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row items-center gap-8">
                                        <div className="flex items-center bg-white/[0.03] border-2 border-white/5 rounded-[2.5rem] p-3 h-24 shadow-inner w-full md:w-auto">
                                            <button onClick={decrement} className="size-16 flex items-center justify-center text-slate-500 hover:text-[#FF6600] hover:bg-white/5 transition-all rounded-[1.5rem] border border-transparent hover:border-white/10"><Minus className="size-8" /></button>
                                            <span className="w-24 text-center text-4xl font-black text-white italic">{quantity}</span>
                                            <button onClick={increment} className="size-16 flex items-center justify-center text-slate-500 hover:text-[#FF6600] hover:bg-white/5 transition-all rounded-[1.5rem] border border-transparent hover:border-white/10"><Plus className="size-8" /></button>
                                        </div>

                                        <div className="flex-1 w-full flex flex-col gap-2">
                                            <Button
                                                disabled={product.stock_quantite <= 0}
                                                onClick={handleAddToCart}
                                                className={cn(
                                                    "h-24 w-full rounded-[2.5rem] font-black uppercase italic tracking-[0.2em] text-sm transition-all duration-700 group/btn border-transparent shadow-2xl",
                                                    addedToCart ? "bg-emerald-500 text-white" : "bg-[#FF6600] text-white hover:scale-[1.03] active:scale-[0.97] hover:shadow-[#FF6600]/40"
                                                )}
                                            >
                                                {addedToCart
                                                    ? <><CheckCircle2 className="size-7 mr-4 animate-bounce" /> AJOUTÉ AVEC SUCCÈS</>
                                                    : <><ShoppingCart className="size-7 mr-4 group-hover/btn:rotate-12 transition-transform" /> ACQUÉRIR L'ACTIF</>
                                                }
                                            </Button>
                                        </div>
                                    </div>

                                    <Button
                                        disabled={product.stock_quantite <= 0}
                                        onClick={handleBuyNow}
                                        variant="outline"
                                        className="h-24 w-full rounded-[2.5rem] border-4 border-white/10 bg-transparent hover:bg-white hover:text-[#0A0D14] transition-all gap-5 hover:scale-[1.02] text-sm font-black uppercase italic tracking-[0.2em] shadow-2xl"
                                    >
                                        <Zap className="size-7 fill-current" />
                                        <span>FINALISATION PRIORITAIRE</span>
                                    </Button>
                                </div>

                                {/* Standardized Trust Signals */}
                                <div className="grid grid-cols-2 gap-8 pt-8">
                                    <div className="p-8 rounded-[3rem] bg-white/[0.02] border-2 border-white/5 flex flex-col gap-6 group/trust hover:border-[#FF6600]/40 transition-all shadow-inner">
                                        <div className="size-16 rounded-[1.5rem] bg-[#FF6600]/10 flex items-center justify-center text-[#FF6600] group-hover/trust:scale-110 transition-transform shadow-2xl">
                                            <ShieldCheck className="size-9" />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[11px] font-black text-white uppercase italic leading-none tracking-widest">BCA GUARD</p>
                                            <p className="text-[9px] font-bold text-slate-500 uppercase italic tracking-widest opacity-60">SÉCURITÉ MAXIMALE ACTIVE</p>
                                        </div>
                                    </div>
                                    <div className="p-8 rounded-[3rem] bg-white/[0.02] border-2 border-white/5 flex flex-col gap-6 group/trust hover:border-emerald-500/40 transition-all shadow-inner">
                                        <div className="size-16 rounded-[1.5rem] bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover/trust:scale-110 transition-transform shadow-2xl">
                                            <Truck className="size-9" />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[11px] font-black text-white uppercase italic leading-none tracking-widest">EXPRESS LINE</p>
                                            <p className="text-[9px] font-bold text-slate-500 uppercase italic tracking-widest opacity-60">LOGISTIQUE PRIORITAIRE 48H</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Immersive Social Proof */}
                            <div className="px-12 py-8 rounded-[3rem] bg-[#FF6600]/5 border-2 border-[#FF6600]/20 flex items-center gap-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-500 shadow-2xl">
                                <div className="relative">
                                    <div className="size-5 rounded-full bg-[#FF6600] animate-ping" />
                                    <div className="absolute top-0 left-0 size-5 rounded-full bg-[#FF6600]" />
                                </div>
                                <p className="text-[10px] font-black text-[#FF6600] uppercase italic tracking-[0.3em] opacity-80 leading-relaxed">
                                    ALERTE CONCURRENCE : 43 INVESTISSEURS CONSULTENT CETTE OPPORTUNITÉ EN TEMPS RÉEL
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Tabs / Detailed Specs */}
                    <div className="space-y-16 pt-24 border-t-8 border-white/5">
                        <div className="flex items-center gap-20 border-b-4 border-white/5 overflow-x-auto scrollbar-hide">
                            <button
                                onClick={() => setActiveTab('desc')}
                                className={cn(
                                    "pb-8 text-xs font-black uppercase italic tracking-[0.4em] transition-all relative whitespace-nowrap",
                                    activeTab === 'desc' ? "text-[#FF6600] decoration-[#FF6600] decoration-4 underline underline-offset-[34px]" : "text-slate-600 hover:text-white"
                                )}
                            >
                                INDEX OPÉRATIONNEL
                            </button>
                            <button
                                onClick={() => setActiveTab('tech')}
                                className={cn(
                                    "pb-8 text-xs font-black uppercase italic tracking-[0.4em] transition-all relative whitespace-nowrap",
                                    activeTab === 'tech' ? "text-[#FF6600] decoration-[#FF6600] decoration-4 underline underline-offset-[34px]" : "text-slate-600 hover:text-white"
                                )}
                            >
                                SPÉCIFICATIONS TECHNIQUES
                            </button>
                        </div>

                        <div className="animate-in fade-in slide-in-from-top-4 duration-700">
                            <div className="lg:col-span-8">
                                {activeTab === 'desc' ? (
                                    <div className="space-y-12 text-slate-400 font-bold leading-relaxed max-w-5xl italic text-2xl opacity-80">
                                        <h3 className="text-4xl md:text-7xl font-black text-white tracking-tighter uppercase italic leading-none mb-4">L'EXCELLENCE <span className="text-[#FF6600] italic">SANS COMPROMIS</span></h3>
                                        <p className="leading-relaxed uppercase tracking-tighter">{uiProduct.fullDescription}</p>
                                    </div>
                                ) : (
                                    <div className="rounded-[4rem] border-4 border-white/5 overflow-hidden bg-[#0A0D14] max-w-4xl shadow-2xl">
                                        <table className="w-full">
                                            <tbody>
                                                {uiProduct.specs.map((spec, i) => (
                                                    <tr key={i} className="border-b-2 border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                                                        <td className="p-10 text-[10px] font-black uppercase italic tracking-[0.4em] text-slate-500 bg-white/[0.01] w-1/3 border-r-2 border-white/5">{spec.label}</td>
                                                        <td className="p-10 text-2xl font-black text-white italic uppercase tracking-tighter">{spec.value}</td>
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
                <div className="fixed bottom-10 left-6 right-6 z-50 lg:hidden px-10 py-8 bg-black/60 backdrop-blur-3xl border-4 border-white/10 rounded-[3rem] shadow-2xl animate-in slide-in-from-bottom duration-700">
                    <div className="flex items-center gap-10 max-w-lg mx-auto">
                        <div className="flex flex-col">
                            <span className="text-3xl font-black text-white italic leading-none">{uiProduct.price.toLocaleString('fr-FR')}</span>
                            <span className="text-[10px] font-black text-[#FF6600] uppercase italic mt-1 tracking-widest">GNF TTC</span>
                        </div>
                        <Button
                            onClick={handleAddToCart}
                            disabled={product.stock_quantite <= 0}
                            className={cn(
                                "flex-1 h-20 rounded-[1.5rem] font-black uppercase italic tracking-[0.2em] text-[10px] transition-all duration-500 border-transparent",
                                addedToCart ? "bg-emerald-500 text-white" : "bg-[#FF6600] text-white shadow-xl shadow-[#FF6600]/30"
                            )}
                        >
                            {addedToCart ? <CheckCircle2 className="size-7" /> : "ACQUÉRIR L'ACTIF"}
                        </Button>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};

export default ProductDetail;
