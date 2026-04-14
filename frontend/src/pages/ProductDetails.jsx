import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
    ShoppingCart, Star, Minus, Plus, ShieldCheck, Truck, 
    ArrowRight, CheckCircle2, Share2, Heart, AlertCircle, 
    Zap, Package, ShieldAlert, Award, Globe, Clock, Info
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';
import productService from '../services/productService';
import { PageLoader } from '../components/ui/Loader';
import useCart from '../hooks/useCart';
import { toast } from 'sonner';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

const FALLBACK = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?auto=format&fit=crop&q=80&w=600';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, lang } = useLanguage();
    const { addToCart } = useCart();
    
    // State
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('desc');
    const [addedToCart, setAddedToCart] = useState(false);
    const [activeImg, setActiveImg] = useState(0);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const data = await productService.getById(id);
                setProduct(data);
            } catch {
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchProduct();
    }, [id]);

    const handleAddToCart = () => {
        if (!product || product.stock_quantite <= 0) return;
        addToCart(product, quantity);
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2500);
        toast.success(`${quantity}x "${product.nom_produit}" ajouté au panier`, {
            action: { label: 'Commander →', onClick: () => navigate('/checkout') }
        });
    };

    const handleBuyNow = () => {
        if (!product || product.stock_quantite <= 0) return;
        addToCart(product, quantity);
        navigate('/checkout');
    };

    if (loading) return <PageLoader />;
    if (error || !product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-background">
                <ShieldAlert className="size-16 text-primary mb-6 animate-bounce" />
                <h2 className="text-2xl font-black text-foreground mb-4 uppercase tracking-tighter">Produit Introuvable</h2>
                <p className="text-muted-foreground text-sm mb-8 font-medium">L'actif que vous recherchez n'est plus disponible dans notre index en temps réel.</p>
                <Link to="/marketplace">
                    <button className="h-14 px-10 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all">
                        Retour au Marché
                    </button>
                </Link>
            </div>
        );
    }

    const images = product.images?.length > 0 ? product.images.map(img => img.url_image) : [FALLBACK];
    const price = parseFloat(product.prix_unitaire || 0);
    const inStock = product.stock_quantite > 0;

    const specs = [
        { label: 'Catégorie', value: product.categorie?.nom_categorie || '—' },
        { label: 'Vendeur Certifié', value: product.boutique?.nom_boutique || 'BCA Connect Partner' },
        { label: 'ID Logistique', value: `#BCA-${product.id?.slice(-6).toUpperCase()}` },
        { label: 'Garantie BCA', value: 'Protection Premium (12 mois)' },
    ];

    return (
        <div className="bg-background text-foreground min-h-screen pt-32 pb-24 font-jakarta">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
                
                {/* 1. Header & Navigation */}
                <header className="mb-12 space-y-4">
                    <nav className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                        <Link to="/" className="hover:text-primary transition-colors">Accueil</Link>
                        <ArrowRight className="size-3" />
                        <Link to="/marketplace" className="hover:text-primary transition-colors">Marketplace</Link>
                        <ArrowRight className="size-3" />
                        <span className="text-foreground truncate max-w-[200px]">{product.nom_produit}</span>
                    </nav>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    
                    {/* 2. Gallery Section (lg:col-span-7) */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="relative aspect-[4/3] rounded-[2.5rem] bg-muted border border-border overflow-hidden group">
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={activeImg}
                                    initial={{ opacity: 0, scale: 1.1 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.4 }}
                                    src={images[activeImg] || FALLBACK}
                                    alt={product.nom_produit}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                            </AnimatePresence>
                            
                            {/* Visual Badges */}
                            <div className="absolute top-6 left-6 flex items-center gap-3">
                                <div className="px-4 py-2 bg-background/80 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center gap-2 shadow-2xl">
                                    <ShieldCheck className="size-4 text-primary" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Actif Certifié</span>
                                </div>
                                {inStock && (
                                    <div className="px-4 py-2 bg-emerald-500 text-white rounded-2xl flex items-center gap-2 shadow-2xl shadow-emerald-500/20">
                                        <div className="size-1.5 rounded-full bg-white animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Prêt pour Expédition</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Thumbnails */}
                        {images.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImg(idx)}
                                        className={cn(
                                            "min-w-[100px] aspect-square rounded-2xl border-4 overflow-hidden bg-muted transition-all duration-300",
                                            activeImg === idx ? "border-primary scale-95" : "border-transparent opacity-40 hover:opacity-100"
                                        )}
                                    >
                                        <img src={img} className="w-full h-full object-cover" alt="" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 3. Info & Buy Box Section (lg:col-span-5) */}
                    <div className="lg:col-span-5 space-y-8 sticky top-32">
                        
                        {/* Title & Ratings */}
                        <div className="space-y-4">
                            <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tighter uppercase leading-[0.9]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                {product.nom_produit}
                            </h1>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-1.5 text-amber-500">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={cn("size-4", i < 4 ? "fill-current" : "text-muted-foreground/20")} />
                                    ))}
                                    <span className="ml-2 text-sm font-black text-foreground">4.8</span>
                                </div>
                                <div className="h-4 w-px bg-border" />
                                <span className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">24 Avis Vérifiés</span>
                            </div>
                        </div>

                        {/* Price & Primary Call to Action Card */}
                        <div className="p-8 rounded-[2.5rem] bg-card/40 backdrop-blur-3xl border border-border shadow-2xl space-y-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Package className="size-24" />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-baseline gap-3">
                                    <span className="text-5xl font-black text-foreground tracking-tighter tabular-nums" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                        {price.toLocaleString('fr-FR')}
                                    </span>
                                    <span className="text-lg font-black text-primary italic">GNF</span>
                                </div>
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Cotation Temps Réel Marketplace</p>
                            </div>

                            {/* Options */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-2 pl-6 bg-muted/50 border border-border rounded-2xl">
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Quantité</span>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="size-10 flex items-center justify-center rounded-xl bg-background border border-border hover:bg-primary/10 transition-colors">
                                            <Minus className="size-4" />
                                        </button>
                                        <span className="w-12 text-center text-sm font-black text-foreground">{quantity}</span>
                                        <button onClick={() => setQuantity(q => Math.min(product.stock_quantite, q + 1))} className="size-10 flex items-center justify-center rounded-xl bg-background border border-border hover:bg-primary/10 transition-colors">
                                            <Plus className="size-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <button
                                        disabled={!inStock}
                                        onClick={handleAddToCart}
                                        className={cn(
                                            "w-full h-16 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl",
                                            addedToCart 
                                                ? "bg-emerald-500 text-white" 
                                                : "bg-primary text-white shadow-primary/25 hover:scale-[1.02] active:scale-95"
                                        )}
                                    >
                                        {addedToCart ? <><CheckCircle2 className="size-5" /> Confirmé</> : <><ShoppingCart className="size-5" /> Ajouter au panier</>}
                                    </button>
                                    
                                    <button
                                        disabled={!inStock}
                                        onClick={handleBuyNow}
                                        className="w-full h-16 rounded-2xl bg-foreground text-background font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-3 shadow-xl"
                                    >
                                        <Zap className="size-5 fill-current" />
                                        Achat Instantané
                                    </button>
                                </div>
                            </div>

                            {/* Logistics info */}
                            <div className="space-y-4 pt-4 border-t border-border">
                                <div className="flex items-start gap-4 p-4 rounded-2xl bg-muted/30">
                                    <Truck className="size-6 text-primary shrink-0" />
                                    <div className="space-y-1">
                                        <p className="text-[11px] font-black text-foreground uppercase tracking-tight">Logistique Prioritaire</p>
                                        <p className="text-xs text-muted-foreground font-medium">Livrable à Conakry en 24h. International disponible.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Marketplace Context */}
                        <div className="grid grid-cols-2 gap-4">
                             <div className="p-6 rounded-[2rem] bg-muted/20 border border-border space-y-3">
                                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <Award className="size-5" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Qualité BCA</p>
                                <p className="text-xs font-bold leading-relaxed">{t('pdExclusivePrice') || "Tarif direct producteur."}</p>
                             </div>
                             <div className="p-6 rounded-[2rem] bg-muted/20 border border-border space-y-3">
                                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <Globe className="size-5" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Impact Local</p>
                                <p className="text-xs font-bold leading-relaxed">Soutient l'économie nationale.</p>
                             </div>
                        </div>
                    </div>
                </div>

                {/* 4. Specifications & Details */}
                <div className="mt-24 space-y-12">
                    <div className="flex gap-2 p-1.5 bg-muted rounded-2xl w-fit">
                        {[
                            { id: 'desc', label: 'Description Technique' },
                            { id: 'tech', label: 'Fiche Synthétique' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all",
                                    activeTab === tab.id
                                        ? "bg-background text-foreground shadow-xl"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        <div className="lg:col-span-8 p-10 rounded-[3rem] bg-muted/30 border border-border">
                            {activeTab === 'desc' ? (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 text-primary">
                                        <Info className="size-5" />
                                        <h3 className="text-xl font-black uppercase tracking-tighter">Spécifications Opérationnelles</h3>
                                    </div>
                                    <p className="text-lg text-muted-foreground font-medium leading-relaxed">
                                        {product.description_longue || product.description}
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                                        <div className="p-6 rounded-2xl bg-background border border-border flex gap-4">
                                            <Clock className="size-6 text-primary" />
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Durabilité</p>
                                                <p className="text-sm font-bold">Cycle de vie certifié BCA.</p>
                                            </div>
                                        </div>
                                        <div className="p-6 rounded-2xl bg-background border border-border flex gap-4">
                                            <ShieldCheck className="size-6 text-primary" />
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Conformité</p>
                                                <p className="text-sm font-bold">Respecte les normes industrielles.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <table className="w-full">
                                    <tbody className="divide-y divide-border">
                                        {specs.map((spec, i) => (
                                            <tr key={i} className="group">
                                                <td className="py-6 pr-4 text-[11px] font-black text-muted-foreground uppercase tracking-widest w-1/3">{spec.label}</td>
                                                <td className="py-6 text-sm font-black text-foreground group-hover:text-primary transition-colors">{spec.value}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                        
                        {/* More Context (lg:col-span-4) */}
                        <div className="lg:col-span-4 p-8 rounded-[3.5rem] bg-primary/5 border border-primary/10 flex flex-col justify-between items-center text-center space-y-8">
                             <div className="size-20 rounded-[2rem] bg-primary text-white flex items-center justify-center shadow-2xl shadow-primary/20 scale-110">
                                <CheckCircle2 className="size-10" />
                             </div>
                             <div className="space-y-4">
                                <h3 className="text-2xl font-black uppercase tracking-tighter">Achat Sécurisé</h3>
                                <p className="text-sm text-muted-foreground font-medium leading-relaxed italic">
                                    "Chaque transaction est protégée par un protocole cryptographique de pointe et un service client dédié 24/7."
                                </p>
                             </div>
                             <div className="h-px w-full bg-primary/20" />
                             <div className="flex items-center gap-6">
                                <img src="/visa.png" className="h-4 opacity-50 grayscale hover:grayscale-0 transition-all cursor-pointer" alt="Pay" />
                                <img src="/mastercard.png" className="h-8 opacity-50 grayscale hover:grayscale-0 transition-all cursor-pointer" alt="Pay" />
                                <div className="text-[10px] font-black uppercase tracking-widest opacity-40">Wallet BCA</div>
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Control */}
            <div className="lg:hidden fixed bottom-6 left-6 right-6 z-50">
                <div className="p-4 bg-background/80 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-2xl flex items-center justify-between gap-6">
                    <div className="pl-4">
                        <p className="text-lg font-black tracking-tighter tabular-nums">{price.toLocaleString('fr-FR')}</p>
                        <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">GNF TOTAL</p>
                    </div>
                    <button
                        onClick={handleAddToCart}
                        disabled={!inStock}
                        className={cn(
                            "flex-1 h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg",
                            addedToCart ? "bg-emerald-500 text-white" : "bg-primary text-white shadow-primary/20"
                        )}
                    >
                        {addedToCart ? "AJOUTÉ" : "ACQUÉRIR L'ACTIF"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
