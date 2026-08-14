import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    ShoppingCart, Star, Minus, Plus, ShieldCheck, Truck,
    ArrowRight, CheckCircle2, Share2, Heart, AlertCircle,
    Zap, Package, ShieldAlert, Award, Globe, Clock, Info,
    User, MessageSquare, Quote, MapPin, Tag, Layers, Sparkles
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { cn, getImageUrl } from '../../lib/utils';
import useCart from '../../cart/hooks/useCart';
import { toast } from 'sonner';
import { useLanguage } from '../../context/useLanguage';
import useAuthStore from '../../store/authStore';
import useWishlistStore from '../store/wishlistStore';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedCounter from '../../components/ui/AnimatedCounter';
import { PageLoader } from '../../components/ui/Loader';
import ProductCard, { ProductRating, ProductPrice, ProductStockBadge } from '../components/ProductCard';
import messageService from '../../message/services/messageService';
import reviewService from '../../review/services/reviewService';
import productService from '../services/productService';
import ReviewForm from '../../review/components/ReviewForm';
import ProductQA from '../../product-question/components/ProductQA';
import { useProductById } from '../hooks/useProductData';
import { useProductVariants } from '../../product-variant/hooks/useProductVariantData';
import PriceIndexCard from '../../category/components/PriceIndexCard';
import AlertThresholdButton from '../../alert-threshold/components/AlertThresholdButton';
import { useQuery } from '@tanstack/react-query';

const FALLBACK = 'https://images.unsplash.com/photo-1523275319145-80b01958f7a2?auto=format&fit=crop&q=80&w=800';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, lang } = useLanguage();
    const { addToCart } = useCart();
    const { user, isAuthenticated } = useAuthStore();
    const { toggleItem, isInWishlist } = useWishlistStore();

    const { data: product, loading, error, refetch } = useProductById(id);
    const { data: variants } = useProductVariants(id);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const { data: eligibility, refetch: refetchEligible } = useQuery({
        queryKey: ['review-eligible', id],
        queryFn: () => reviewService.getEligible(id),
        enabled: !!id && isAuthenticated && !!user,
        staleTime: 60_000,
    });
    const eligibleOrders = eligibility?.orders || [];
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('desc');
    const [addedToCart, setAddedToCart] = useState(false);
    const [activeImg, setActiveImg] = useState(0);
    const [zoomStyle, setZoomStyle] = useState({ display: 'none' });

    const isOwner = user && product?.boutique && product.boutique.proprietaire_id === user.id;

    const { data: storeProducts = [] } = useQuery({
        queryKey: ['products-by-store', product?.boutique?.id, id],
        queryFn: async () => {
            const res = await productService.getAll({ boutique_id: product.boutique.id, exclude_id: id, limit: 8 });
            return res.products || [];
        },
        enabled: !!product?.boutique?.id,
        staleTime: 60_000,
    });

    const { data: similarProducts = [] } = useQuery({
        queryKey: ['products-similar', product?.categorie_id, id],
        queryFn: async () => {
            const res = await productService.getAll({ categorie_id: product.categorie_id, exclude_id: id, limit: 8 });
            return res.products || [];
        },
        enabled: !!product?.categorie_id,
        staleTime: 60_000,
    });

    const handleImageMouseMove = (e) => {
        const bounds = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - bounds.left) / bounds.width) * 100;
        const y = ((e.clientY - bounds.top) / bounds.height) * 100;
        setZoomStyle({ display: 'block', backgroundPosition: `${x}% ${y}%` });
    };
    const handleImageMouseLeave = () => setZoomStyle({ display: 'none' });

    const handleAddToCart = () => {
        if (isOwner) {
            toast.error("Action impossible", { description: "Vous ne pouvez pas acheter vos propres produits." });
            return;
        }
        if (product?.has_variants && !selectedVariant) {
            toast.error("Veuillez choisir une variante avant d'ajouter au panier.");
            return;
        }
        const effectiveStock = product?.has_variants ? (selectedVariant?.stock_quantite ?? 0) : product?.stock_quantite;
        if (!product || effectiveStock <= 0) return;
        addToCart(product, quantity, selectedVariant);
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2500);
        toast.success(`${quantity}x "${product.nom_produit}${selectedVariant ? ` — ${selectedVariant.nom_variante}` : ''}" ajouté au panier`);
    };

    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({ title: product?.nom_produit, url });
            } catch {
                // partage annulé par l'utilisateur
            }
            return;
        }
        await navigator.clipboard.writeText(url);
        toast.success('Lien copié dans le presse-papiers');
    };

    const handleWishlist = () => {
        if (!product) return;
        const added = toggleItem(product);
        toast.success(added ? (t('pdAddedToWishlist') || 'Ajouté aux favoris') : (t('pdRemovedFromWishlist') || 'Retiré des favoris'));
    };

    const handleBuyNow = () => {
        if (isOwner) {
            toast.error("Action impossible", { description: "Vous ne pouvez pas acheter vos propres produits." });
            return;
        }
        if (product?.has_variants && !selectedVariant) {
            toast.error("Veuillez choisir une variante avant de commander.");
            return;
        }
        const effectiveStock = product?.has_variants ? (selectedVariant?.stock_quantite ?? 0) : product?.stock_quantite;
        if (!product || effectiveStock <= 0) return;
        addToCart(product, quantity, selectedVariant);
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
            // Partage la fiche produit dans la conversation — le marchand voit
            // immédiatement de quel article il s'agit (comme sur Alibaba).
            messageService.shareProduct(product.boutique.proprietaire_id, product).catch(() => {});
            navigate(`/messages?id=${conversation.id}`, { state: { openConversation: conversation } });
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
    const basePrice = parseFloat(product.prix_unitaire || 0);
    const price = (selectedVariant?.prix_unitaire !== null && selectedVariant?.prix_unitaire !== undefined)
        ? parseFloat(selectedVariant.prix_unitaire)
        : basePrice;
    const oldPrice = parseFloat(product.prix_ancien || 0);
    const hasDiscount = !selectedVariant && oldPrice > price;
    const discountPercent = hasDiscount ? Math.round((1 - price / oldPrice) * 100) : 0;
    const activeVariants = variants.filter((v) => v.actif);
    const effectiveStock = product.has_variants ? (selectedVariant?.stock_quantite ?? 0) : product.stock_quantite;
    const inStock = product.has_variants ? (selectedVariant ? effectiveStock > 0 : activeVariants.some((v) => v.stock_quantite > 0)) : effectiveStock > 0;
    const memberSince = product.boutique?.createdAt ? new Date(product.boutique.createdAt).getFullYear() : null;
    const hasRating = typeof product.boutique?.rating_reel === 'number' && product.boutique?.nb_avis > 0;

    const specs = [
        { label: 'Catégorie', value: product.categorie?.nom_categorie || '—' },
        { label: 'Fournisseur Certifié', value: product.boutique?.nom_boutique || 'BCA Connect Partner' },
        { label: 'ID Logistique', value: `#BCA-${product.id?.slice(-6).toUpperCase()}` },
        { label: 'Garantie BCA', value: 'Protection Premium (12 mois)' },
    ];
    if (product.marque) specs.push({ label: 'Marque', value: product.marque });
    if (product.condition) specs.push({ label: 'État', value: product.condition === 'neuf' ? 'Neuf' : product.condition === 'occasion' ? 'Occasion' : product.condition });
    if (product.unite_mesure) specs.push({ label: 'Unité de vente', value: product.unite_mesure });
    if (product.est_local) specs.push({ label: 'Origine', value: 'Produit / sourcé localement en Guinée' });

    if (product.preferences_ia && typeof product.preferences_ia === 'object' && Object.keys(product.preferences_ia).length > 0) {
        Object.entries(product.preferences_ia).forEach(([key, value]) => {
            if (value) {
                // Format the key to be more readable (e.g., 'boite_vitesse' -> 'Boite Vitesse')
                const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                specs.push({ label, value: String(value) });
            }
        });
    }

    return (
        <div className="marketplace-bg text-[#333] min-h-screen pt-28 pb-24">
            <div className="max-w-7xl mx-auto px-4 lg:px-8">
                
                {/* Fil d'Ariane style BCA */}
                <nav className="text-xs text-[#999] mb-4 flex items-center gap-2 flex-wrap">
                    <Link to="/marketplace" className="hover:text-[#1CA0DB]">Marketplace</Link>
                    <span>/</span>
                    <span className="text-[#666] truncate max-w-[200px]">{product.categorie?.nom_categorie || 'Produits'}</span>
                    <span>/</span>
                    <span className="text-[#333] font-medium truncate">{product.nom_produit}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* Galerie */}
                    <div className="lg:col-span-7 space-y-3">
                        <div
                            className="relative aspect-square max-h-[520px] rounded border border-[#e8e8e8] dark:border-border bg-card overflow-hidden group cursor-zoom-in"
                            onMouseMove={handleImageMouseMove}
                            onMouseLeave={handleImageMouseLeave}
                        >
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={activeImg}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    src={images[activeImg] || FALLBACK}
                                    className="w-full h-full object-contain p-4"
                                />
                            </AnimatePresence>
                            {/* Loupe style Alibaba/Amazon : zoom suivant le curseur, desktop uniquement */}
                            <div
                                className="hidden lg:block absolute inset-0 pointer-events-none bg-no-repeat"
                                style={{
                                    ...zoomStyle,
                                    backgroundImage: `url(${images[activeImg] || FALLBACK})`,
                                    backgroundSize: '200%',
                                }}
                            />
                            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                                <span className="bca-badge-trade">
                                    <ShieldCheck className="size-3" />
                                    Escrow BCA
                                </span>
                                {product.boutique?.is_verified && (
                                    <span className="bca-badge-verified">
                                        <Award className="size-3" />
                                        Fournisseur vérifié
                                    </span>
                                )}
                                {product.est_local && (
                                    <span className="bca-badge-trade bg-emerald-50 text-emerald-700 border-emerald-200">
                                        <MapPin className="size-3" />
                                        Produit local
                                    </span>
                                )}
                            </div>
                            {hasDiscount && (
                                <span className="absolute top-3 right-3 bg-rose-600 text-white text-xs font-bold px-2 py-1 rounded">
                                    -{discountPercent}%
                                </span>
                            )}
                        </div>

                        {product.mots_cles?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {product.mots_cles.map((tag, i) => (
                                    <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#f5f5f5] text-[#666] text-[11px]">
                                        <Tag className="size-2.5" />
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {images.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                                {images.map((img, idx) => (
                                    <button key={idx} onClick={() => setActiveImg(idx)} className={cn("min-w-[72px] size-[72px] rounded border-2 overflow-hidden bg-card transition-all", activeImg === idx ? "border-[#1CA0DB]" : "border-[#e8e8e8] opacity-70 hover:opacity-100")}>
                                        <img src={img} className="w-full h-full object-cover" alt="" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Buy box BCA */}
                    <div className="lg:col-span-5 space-y-4 sticky top-28">
                        {product.boutique && (
                            <div className="bca-supplier-strip p-3 flex items-center gap-3">
                                <div className="size-10 rounded bg-card border border-[#7DD3F0] flex items-center justify-center text-[#1CA0DB]">
                                    <Globe className="size-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-[#333] truncate">{product.boutique.nom_boutique}</p>
                                    <p className="text-[11px] text-[#999]">
                                        {product.boutique.localisation || 'Guinée'} · Réponse {product.boutique.temps_reponse || '< 24h'}
                                    </p>
                                </div>
                                <button onClick={handleStartChat} className="bca-btn-outline h-8 px-3 text-xs hidden sm:flex items-center gap-1">
                                    <MessageSquare className="size-3.5" />
                                    Chat
                                </button>
                            </div>
                        )}

                        <div className="bca-card p-5 space-y-5">
                            <div>
                                <h1 className="text-xl md:text-2xl font-bold text-[#333] leading-snug">
                                    {product.nom_produit}
                                </h1>
                                <div className="flex items-center gap-4 mt-2">
                                    <ProductRating avis={product.avis} />
                                    <ProductStockBadge qty={effectiveStock} />
                                </div>
                            </div>

                            <div className="py-4 border-y border-[#f0f0f0]">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <ProductPrice price={price} oldPrice={hasDiscount ? product.prix_ancien : undefined} size="lg" variant="bca" />
                                    {hasDiscount && (
                                        <span className="bg-rose-50 text-rose-600 text-xs font-bold px-2 py-1 rounded">
                                            -{discountPercent}%
                                        </span>
                                    )}
                                </div>
                                <p className="text-[11px] text-[#999] mt-1">Prix unitaire · Paiement sécurisé escrow</p>
                            </div>

                            {product.has_variants && activeVariants.length > 0 && (
                                <div className="space-y-2">
                                    <span className="text-sm text-[#666]">Choisir une variante</span>
                                    <div className="flex flex-wrap gap-2">
                                        {activeVariants.map((v) => (
                                            <button
                                                key={v.id}
                                                type="button"
                                                disabled={v.stock_quantite <= 0}
                                                onClick={() => { setSelectedVariant(v); setQuantity(1); }}
                                                className={cn(
                                                    "px-3 py-2 rounded-lg border text-sm font-medium transition-colors",
                                                    selectedVariant?.id === v.id
                                                        ? "border-[#1CA0DB] bg-[#eff6ff] text-[#1CA0DB]"
                                                        : v.stock_quantite <= 0
                                                            ? "border-[#f0f0f0] text-[#ccc] cursor-not-allowed line-through"
                                                            : "border-[#d9d9d9] text-[#666] hover:border-[#1CA0DB]"
                                                )}
                                            >
                                                {v.nom_variante}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-[#666]">Quantité</span>
                                <div className="flex items-center border border-[#d9d9d9] rounded">
                                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="size-9 flex items-center justify-center hover:bg-[#fafafa] text-[#666]">
                                        <Minus className="size-4" />
                                    </button>
                                    <span className="w-12 text-center text-sm font-semibold">{quantity}</span>
                                    <button onClick={() => setQuantity(q => Math.min(effectiveStock || 1, q + 1))} className="size-9 flex items-center justify-center hover:bg-[#fafafa] text-[#666]">
                                        <Plus className="size-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <button disabled={!inStock || isOwner} onClick={handleAddToCart} className={cn("flex-1 h-12 rounded font-semibold text-sm flex items-center justify-center gap-2", isOwner ? "bg-[#f5f5f5] text-[#999] cursor-not-allowed" : addedToCart ? "bg-emerald-500 text-white" : "bca-btn-primary")}>
                                        {addedToCart ? <><CheckCircle2 className="size-5" /> Ajouté au panier</> : <><ShoppingCart className="size-5" /> Ajouter au panier</>}
                                    </button>
                                    <button
                                        onClick={handleWishlist}
                                        title={isInWishlist(product?.id) ? (t('pdRemovedFromWishlist') || 'Retirer des favoris') : (t('pdAddedToWishlist') || 'Ajouter aux favoris')}
                                        className="size-12 shrink-0 rounded border border-[#d9d9d9] flex items-center justify-center hover:border-rose-300 transition-colors"
                                    >
                                        <Heart className={cn("size-5", isInWishlist(product?.id) ? "fill-rose-500 text-rose-500" : "text-[#666]")} />
                                    </button>
                                    <button
                                        onClick={handleShare}
                                        title="Partager"
                                        className="size-12 shrink-0 rounded border border-[#d9d9d9] flex items-center justify-center hover:border-[#1CA0DB] transition-colors text-[#666] hover:text-[#1CA0DB]"
                                    >
                                        <Share2 className="size-5" />
                                    </button>
                                    {!isOwner && (
                                        <AlertThresholdButton productId={id} currentPrice={price} currentStock={effectiveStock} />
                                    )}
                                </div>
                                <button disabled={!inStock || isOwner} onClick={handleBuyNow} className={cn("w-full h-12 rounded font-semibold text-sm flex items-center justify-center gap-2 border", isOwner ? "border-[#f0f0f0] text-[#999] cursor-not-allowed" : "border-[#1CA0DB] text-[#1CA0DB] hover:bg-[#eff6ff]")}>
                                    <Zap className="size-4" />
                                    Commander maintenant
                                </button>
                                <button onClick={handleStartChat} className="w-full h-10 rounded text-sm font-medium flex items-center justify-center gap-2 text-[#666] hover:text-[#1CA0DB] sm:hidden">
                                    <MessageSquare className="size-4" />
                                    Contacter le fournisseur
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-[#666]">
                                <div className="flex items-center gap-2 p-2 bg-[#fafafa] rounded">
                                    <Truck className="size-4 text-[#1CA0DB] shrink-0" />
                                    <span>Livraison Conakry 24–48h</span>
                                </div>
                                <div className="flex items-center gap-2 p-2 bg-[#fafafa] rounded">
                                    <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
                                    <span>Remboursement litige</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Specs & avis */}
                <div className="mt-10 space-y-6">
                    <div className="flex gap-0 border-b border-[#e8e8e8]">
                        {[
                            { id: 'desc', label: 'Description' },
                            { id: 'reviews', label: `Avis (${product.avis?.length || 0})` },
                            { id: 'qa', label: 'Questions & Réponses' },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "px-6 py-3 text-sm font-medium border-b-2 -mb-px transition-all",
                                    activeTab === tab.id ? "border-[#1CA0DB] text-[#1CA0DB]" : "border-transparent text-[#666] hover:text-[#333]"
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        <div className="lg:col-span-8">
                            {activeTab === 'desc' ? (
                                <div className="bca-card p-6 space-y-4">
                                    <h3 className="text-base font-bold text-[#333]">Description produit</h3>
                                    <p className="text-sm text-[#666] leading-relaxed">
                                        {product.description_longue || product.description || 'Aucune description disponible.'}
                                    </p>
                                    {specs.length > 0 && (
                                        <div className="border border-[#f0f0f0] rounded overflow-hidden mt-4">
                                            {specs.map((spec, i) => (
                                                <div key={i} className={cn("flex justify-between px-4 py-3 text-sm", i % 2 === 0 ? "bg-muted/50" : "bg-card")}>
                                                    <span className="text-[#999]">{spec.label}</span>
                                                    <span className="font-medium text-[#333]">{spec.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : activeTab === 'reviews' ? (
                                <div className="space-y-8">
                                    {!isAuthenticated ? (
                                        <div className="p-6 rounded-[2rem] bg-muted/30 border border-border text-center space-y-3">
                                            <p className="text-sm font-semibold text-foreground">Connectez-vous pour laisser un avis</p>
                                            <p className="text-xs text-muted-foreground">Seuls les acheteurs ayant reçu leur commande peuvent noter un produit.</p>
                                            <Link to="/login" className="inline-block">
                                                <Button size="sm">Se connecter</Button>
                                            </Link>
                                        </div>
                                    ) : isOwner ? null : eligibility?.status === 'eligible' ? (
                                        <ReviewForm
                                            productId={id}
                                            eligibleOrders={eligibleOrders}
                                            onSuccess={() => {
                                                refetch();
                                                refetchEligible();
                                            }}
                                        />
                                    ) : (
                                        <div className="p-6 rounded-[2rem] bg-muted/30 border border-border text-center">
                                            <p className="text-sm text-muted-foreground">
                                                {eligibility?.status === 'awaiting_delivery' && "Votre commande n'est pas encore marquée comme livrée — vous pourrez laisser un avis dès sa réception confirmée."}
                                                {eligibility?.status === 'already_reviewed' && "Vous avez déjà laissé un avis pour ce produit. Merci pour votre retour !"}
                                                {(!eligibility || eligibility?.status === 'not_purchased') && "Achetez ce produit pour pouvoir le noter après réception de votre commande."}
                                            </p>
                                        </div>
                                    )}
                                    {product.avis?.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-6">
                                            {product.avis.map((rev, i) => (
                                                <motion.div 
                                                    key={i}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.1 }}
                                                    className="p-8 rounded-3xl bg-card dark:bg-white/5 border border-border shadow-sm group hover:border-primary/30 transition-all"
                                                >
                                                    <div className="flex items-start justify-between mb-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="size-12 rounded-2xl bg-muted dark:bg-white/10 flex items-center justify-center text-muted-foreground">
                                                                <User className="size-6" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-black text-foreground uppercase tracking-tight">
                                                                    {rev.User?.nom_complet || 'Client vérifié'}
                                                                </p>
                                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                                    {new Date(rev.created_at || rev.createdAt).toLocaleDateString('fr-FR')}
                                                                </p>
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
                                                                rev.ia_sentiment === 'positif' ? "bg-emerald-50 text-emerald-500 border-emerald-100" : "bg-muted text-muted-foreground border-border"
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
                            ) : (
                                <ProductQA
                                    productId={id}
                                    isAuthenticated={isAuthenticated}
                                    isOwner={isOwner}
                                    currentUserId={user?.id}
                                />
                            )}
                        </div>

                        <div className="lg:col-span-4 space-y-4">
                            <div className="bca-card p-5 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="size-12 rounded bg-[#eff6ff] flex items-center justify-center text-[#1CA0DB]">
                                        <Globe className="size-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-bold text-[#333] truncate">{product.boutique?.nom_boutique}</h3>
                                        <span className="text-[11px] text-[#999] font-medium">
                                            {memberSince ? `Sur BCA Connect depuis ${memberSince}` : 'Nouveau sur BCA Connect'}
                                        </span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div className="p-3 bg-[#fafafa] rounded border border-[#f0f0f0]">
                                        <p className="text-[10px] text-[#999]">Note</p>
                                        <p className="text-sm font-bold text-[#333] flex items-center justify-center gap-1">
                                            {hasRating ? (
                                                <>
                                                    <Star className="size-3 fill-amber-400 text-amber-400" />
                                                    {product.boutique.rating_reel}/5
                                                </>
                                            ) : (
                                                <span className="text-[#999] font-medium flex items-center gap-1"><Sparkles className="size-3" />Nouveau</span>
                                            )}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-[#fafafa] rounded border border-[#f0f0f0]">
                                        <p className="text-[10px] text-[#999]">Produits</p>
                                        <p className="text-sm font-bold text-[#333]">{product.boutique?.nb_produits ?? '—'}</p>
                                    </div>
                                    <div className="p-3 bg-[#fafafa] rounded border border-[#f0f0f0]">
                                        <p className="text-[10px] text-[#999]">Réponse</p>
                                        <p className="text-sm font-bold text-[#333]">{product.boutique?.temps_reponse || '—'}</p>
                                    </div>
                                </div>
                                <button onClick={handleStartChat} className="w-full h-10 bca-btn-primary text-sm font-semibold flex items-center justify-center gap-2">
                                    <MessageSquare className="size-4" />
                                    Contacter le fournisseur
                                </button>
                                <Link to={`/shop/${product.boutique?.slug}`} className="block">
                                    <button className="w-full h-10 bca-btn-outline text-sm font-semibold flex items-center justify-center gap-2">
                                        <Award className="size-4" />
                                        Visiter la boutique
                                    </button>
                                </Link>
                            </div>

                            <div className="bca-card p-5 flex items-start gap-4 border-l-4 border-l-emerald-500">
                                <ShieldCheck className="size-8 text-emerald-600 shrink-0" />
                                <div>
                                    <h3 className="text-sm font-bold text-[#333]">Trade Assurance BCA</h3>
                                    <p className="text-xs text-[#666] mt-1 leading-relaxed">
                                        Votre paiement est bloqué en escrow jusqu&apos;à confirmation de livraison. Remboursement en cas de litige.
                                    </p>
                                </div>
                            </div>

                            <PriceIndexCard produitId={id} />
                        </div>
                    </div>
                </div>

                {storeProducts.length > 0 && (
                    <div className="mt-10">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold text-[#333] flex items-center gap-2">
                                <Layers className="size-4 text-[#1CA0DB]" />
                                Plus de produits de {product.boutique?.nom_boutique}
                            </h3>
                            <Link to={`/shop/${product.boutique?.slug}`} className="text-xs font-semibold text-[#1CA0DB] hover:underline">
                                Voir la boutique
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {storeProducts.slice(0, 8).map((p) => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    </div>
                )}

                {similarProducts.length > 0 && (
                    <div className="mt-10">
                        <h3 className="text-base font-bold text-[#333] flex items-center gap-2 mb-4">
                            <Sparkles className="size-4 text-[#1CA0DB]" />
                            Produits similaires
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {similarProducts.slice(0, 8).map((p) => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-[#e8e8e8] dark:border-border bg-card p-3 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
                <div className="flex items-center gap-3">
                    <div className="shrink-0">
                        <ProductPrice price={product.prix_unitaire} size="sm" variant="bca" />
                    </div>
                    <button onClick={handleAddToCart} disabled={!inStock || isOwner} className={cn("flex-1 h-11 rounded font-semibold text-sm", isOwner ? "bg-[#f5f5f5] text-[#999]" : addedToCart ? "bg-emerald-500 text-white" : "bca-btn-primary")}>
                        {addedToCart ? 'Ajouté' : 'Panier'}
                    </button>
                    <button onClick={handleBuyNow} disabled={!inStock || isOwner} className="h-11 px-4 bca-btn-outline text-sm font-semibold">
                        Acheter
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
