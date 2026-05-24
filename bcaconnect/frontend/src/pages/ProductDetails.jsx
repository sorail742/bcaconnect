import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
    ShoppingCart, Star, Minus, Plus, ShieldCheck, Truck, 
    ArrowRight, CheckCircle2, Share2, Heart, AlertCircle, 
    Zap, Package, ShieldAlert, Award, Globe, Clock, Info,
    User, MessageSquare, Quote
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { cn, getImageUrl } from '../lib/utils';
import productService from '../services/productService';
import useCart from '../hooks/useCart';
import { toast } from 'sonner';
import { useLanguage } from '../context/LanguageContext';
import useAuthStore from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import { PageLoader } from '../components/ui/Loader';
import { ProductRating, ProductPrice } from '../components/produits/ProductCard';
import messageService from '../services/messageService';

const FALLBACK = 'https://images.unsplash.com/photo-1523275319145-80b01958f7a2?auto=format&fit=crop&q=80&w=800';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, lang } = useLanguage();
    const { addToCart } = useCart();
    const { user } = useAuthStore();
    
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

    const isOwner = user && product?.boutique && product.boutique.proprietaire_id === user.id;

    const handleAddToCart = () => {
        if (isOwner) {
            toast.error("Action impossible", { description: "Vous ne pouvez pas acheter vos propres produits." });
            return;
        }
        if (!product || product.stock_quantite <= 0) return;
        addToCart(product, quantity);
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2500);
        toast.success(`${quantity}x "${product.nom_produit}" ajouté au panier`);
    };

    const handleBuyNow = () => {
        if (isOwner) {
            toast.error("Action impossible", { description: "Vous ne pouvez pas acheter vos propres produits." });
            return;
        }
        if (!product || product.stock_quantite <= 0) return;
        addToCart(product, quantity);
        navigate('/checkout');
    };

    const handleStartChat = async () => {
        if (!user) {
            toast.info("Connexion requise", { description: "Veuillez vous connecter pour discuter avec le fournisseur." });
            navigate('/login');
            return;
        }
        if (isOwner) {
            toast.error("Action impossible", { description: "Vous ne pouvez pas discuter avec vous-même." });
            return;
        }
        try {
            const conversation = await messageService.startConversation(product.boutique.proprietaire_id);
            navigate(`/messages?id=${conversation.id}`);
        } catch (err) {
            toast.error("Erreur", { description: "Impossible de démarrer la conversation." });
        }
    };

    if (loading) return <PageLoader />;
    if (error || !product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-background">
                <ShieldAlert className="size-16 text-primary mb-6" />
                <h2 className="text-2xl font-black text-foreground mb-4 uppercase">Produit Introuvable</h2>
                <Link to="/marketplace"><Button>Retour au Marché</Button></Link>
            </div>
        );
    }

    const images = product.images?.length > 0 
        ? product.images.map(img => getImageUrl(img.url_image)) 
        : [getImageUrl(product.image_url || product.image)];
    const price = parseFloat(product.prix_unitaire || 0);
    const inStock = product.stock_quantite > 0;

    const specs = [
        { label: 'Catégorie', value: product.categorie?.nom_categorie || '—' },
        { label: 'Fournisseur Certifié', value: product.boutique?.nom_boutique || 'BCA Connect Partner' },
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
                    
                    {/* 2. Gallery Section */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="relative aspect-[4/3] rounded-[2.5rem] bg-muted border border-border overflow-hidden group">
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={activeImg}
                                    initial={{ opacity: 0, scale: 1.1 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    src={images[activeImg] || FALLBACK}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                            </AnimatePresence>
                            <div className="absolute top-6 left-6 flex items-center gap-3">
                                <div className="px-4 py-2 bg-background/80 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center gap-2 shadow-2xl">
                                    <ShieldCheck className="size-4 text-primary" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Actif Certifié</span>
                                </div>
                            </div>
                        </div>

                        {images.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                                {images.map((img, idx) => (
                                    <button key={idx} onClick={() => setActiveImg(idx)} className={cn("min-w-[100px] aspect-square rounded-2xl border-4 overflow-hidden bg-muted transition-all", activeImg === idx ? "border-primary scale-95" : "border-transparent opacity-40 hover:opacity-100")}>
                                        <img src={img} className="w-full h-full object-cover" alt="" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 3. Info & Buy Box Section */}
                    <div className="lg:col-span-5 space-y-8 sticky top-32">
                        <div className="space-y-4">
                            <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tighter uppercase leading-[0.9]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                {product.nom_produit}
                            </h1>
                            <div className="flex items-center gap-6">
                                <ProductRating avis={product.avis} />
                                <div className="h-4 w-px bg-border" />
                                <span className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">
                                    Avis Vérifiés ({product.avis?.length || 0})
                                </span>
                            </div>
                        </div>

                        <div className="p-8 rounded-[2.5rem] bg-card/40 backdrop-blur-3xl border border-border shadow-2xl space-y-8 relative overflow-hidden">
                            <div className="space-y-2">
                                <ProductPrice price={product.prix_unitaire} size="lg" />
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Cotation Temps Réel Marketplace</p>
                            </div>

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
                                    <button disabled={!inStock || isOwner} onClick={handleAddToCart} className={cn("w-full h-16 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl", isOwner ? "bg-rose-100 text-rose-400 cursor-not-allowed" : addedToCart ? "bg-emerald-500 text-white" : "bg-primary text-white shadow-primary/25 hover:scale-[1.02] active:scale-95")}>
                                        {addedToCart ? <><CheckCircle2 className="size-5" /> Confirmé</> : <><ShoppingCart className="size-5" /> Ajouter au panier</>}
                                    </button>
                                    
                                    <button disabled={!inStock || isOwner} onClick={handleBuyNow} className={cn("w-full h-16 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl", isOwner ? "bg-rose-100 text-rose-400 cursor-not-allowed" : "bg-foreground text-background hover:opacity-90")}>
                                        <Zap className="size-5 fill-current" />
                                        Achat Instantané
                                    </button>

                                    <button onClick={handleStartChat} className="w-full h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 border-2 border-primary/20 text-primary hover:bg-primary/5 active:scale-95">
                                        <MessageSquare className="size-5" />
                                        Discuter en ligne
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-border">
                                <div className="flex items-start gap-4 p-4 rounded-2xl bg-muted/30">
                                    <Truck className="size-6 text-primary shrink-0" />
                                    <div className="space-y-1">
                                        <p className="text-[11px] font-black text-foreground uppercase tracking-tight">Logistique Prioritaire</p>
                                        <p className="text-xs text-muted-foreground font-medium">Livrable à Conakry en 24h.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Specifications & Reviews */}
                <div className="mt-24 space-y-12">
                    <div className="flex gap-2 p-1.5 bg-muted rounded-2xl w-fit">
                        {[
                            { id: 'desc', label: 'Description' },
                            { id: 'reviews', label: `Avis Clients (${product.avis?.length || 0})` }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all",
                                    activeTab === tab.id ? "bg-background text-foreground shadow-xl" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        <div className="lg:col-span-8">
                            {activeTab === 'desc' ? (
                                <div className="p-10 rounded-[3rem] bg-muted/30 border border-border space-y-6">
                                    <div className="flex items-center gap-3 text-primary">
                                        <Info className="size-5" />
                                        <h3 className="text-xl font-black uppercase tracking-tighter">Spécifications Opérationnelles</h3>
                                    </div>
                                    <p className="text-lg text-muted-foreground font-medium leading-relaxed italic">
                                        {product.description_longue || product.description}
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                                        {specs.map((spec, i) => (
                                            <div key={i} className="p-6 rounded-2xl bg-background border border-border flex justify-between items-center">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{spec.label}</span>
                                                <span className="text-sm font-black text-foreground">{spec.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {product.avis?.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-6">
                                            {product.avis.map((rev, i) => (
                                                <motion.div 
                                                    key={i}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.1 }}
                                                    className="p-8 rounded-[2.5rem] bg-white dark:bg-white/5 border border-border shadow-sm group hover:border-primary/30 transition-all"
                                                >
                                                    <div className="flex items-start justify-between mb-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="size-12 rounded-2xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-400">
                                                                <User className="size-6" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-black text-foreground uppercase tracking-tight">Utilisateur Anonyme</p>
                                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{new Date(rev.created_at).toLocaleDateString('fr-FR')}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 dark:bg-amber-500/10 rounded-xl">
                                                            <Star className="size-3 fill-amber-400 text-amber-400" />
                                                            <span className="text-xs font-black text-amber-600 pt-0.5">{rev.note}.0</span>
                                                        </div>
                                                    </div>
                                                    <div className="relative">
                                                        <Quote className="absolute -top-2 -left-2 size-8 text-primary/5 -z-10" />
                                                        <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed font-medium italic">
                                                            "{rev.commentaire || "Excellent produit, conforme à la description et livré dans les délais impartis."}"
                                                        </p>
                                                    </div>
                                                    {rev.ia_sentiment && (
                                                        <div className="mt-6 flex items-center gap-2">
                                                            <div className={cn(
                                                                "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                                                rev.ia_sentiment === 'positif' ? "bg-emerald-50 text-emerald-500 border-emerald-100" : "bg-slate-50 text-slate-500 border-slate-100"
                                                            )}>
                                                                IA Sentiment: {rev.ia_sentiment}
                                                            </div>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-20 text-center rounded-[3rem] bg-muted/20 border-2 border-dashed border-border flex flex-col items-center gap-6">
                                            <div className="size-20 rounded-[2rem] bg-muted flex items-center justify-center text-muted-foreground/30">
                                                <MessageSquare className="size-10" />
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-xl font-black uppercase tracking-tighter">Aucun Avis Pour le Moment</p>
                                                <p className="text-sm text-muted-foreground font-medium">Soyez le premier à partager votre expérience sur cet actif.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        
                        <div className="lg:col-span-4 space-y-6">
                            {/* Vendor Card (Alibaba Style) */}
                            <div className="p-8 rounded-[3rem] bg-card border border-border shadow-xl space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                        <Globe className="size-8" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-black uppercase tracking-tight text-foreground truncate">{product.boutique?.nom_boutique}</h3>
                                        <div className="flex items-center gap-2">
                                            <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">En ligne</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl bg-muted/50 border border-border text-center">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Note</p>
                                        <p className="text-sm font-black text-foreground">4.9/5.0</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-muted/50 border border-border text-center">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Rép.</p>
                                        <p className="text-sm font-black text-foreground">&lt; 1h</p>
                                    </div>
                                </div>

                                <button onClick={handleStartChat} className="w-full h-14 rounded-2xl bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                                    <MessageSquare className="size-5" />
                                    Contacter le Fournisseur
                                </button>
                                
                                <Link to={`/shop/${product.boutique?.slug}`} className="block">
                                    <button className="w-full h-14 rounded-2xl border-2 border-border text-foreground font-black text-[10px] uppercase tracking-widest hover:bg-muted transition-all flex items-center justify-center gap-3">
                                        <Award className="size-5" />
                                        Visiter la Boutique
                                    </button>
                                </Link>
                            </div>

                            {/* Trust Badge Card */}
                            <div className="p-8 rounded-[3rem] bg-emerald-500/5 border border-emerald-500/10 flex flex-col items-center text-center space-y-6">
                                 <div className="size-16 rounded-[1.5rem] bg-emerald-500 text-white flex items-center justify-center shadow-2xl shadow-emerald-500/20">
                                    <ShieldCheck className="size-8" />
                                 </div>
                                 <div className="space-y-2">
                                    <h3 className="text-lg font-black uppercase tracking-tighter text-emerald-900 dark:text-emerald-400">Trade Assurance</h3>
                                    <p className="text-[11px] text-emerald-700/70 dark:text-emerald-500/70 font-medium leading-relaxed italic">
                                        "Protection intégrale de votre commande, du paiement à la livraison."
                                    </p>
                                 </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Control */}
            <div className="lg:hidden fixed bottom-6 left-6 right-6 z-50">
                <div className="p-4 bg-background/80 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-2xl flex items-center justify-between gap-6">
                    <div className="pl-4">
                        <ProductPrice price={product.prix_unitaire} size="sm" />
                    </div>
                    <button onClick={handleAddToCart} disabled={!inStock || isOwner} className={cn("flex-1 h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all", isOwner ? "bg-rose-100 text-rose-400" : addedToCart ? "bg-emerald-500 text-white" : "bg-primary text-white shadow-lg shadow-primary/20")}>
                        {addedToCart ? "AJOUTÉ" : "ACQUÉRIR"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
