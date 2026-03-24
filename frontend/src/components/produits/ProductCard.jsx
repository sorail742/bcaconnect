import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, Heart, Eye, ArrowRight, CheckCircle2, Zap } from 'lucide-react';
import { Button } from '../ui/Button';
import { useCart } from '../../context/CartContext';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';

const ProductCard = ({ product, compact = false }) => {
    const { addToCart } = useCart();
    const navigate = useNavigate();
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [isAdded, setIsAdded] = useState(false);

    const id = product.id;
    const name = product.nom_produit || product.name || 'Produit sans nom';
    const description = product.description || '';
    const price = parseFloat(product.prix_unitaire || product.price || 0);
    const oldPrice = product.prix_ancien ? parseFloat(product.prix_ancien) : null;
    const discount = oldPrice ? Math.round((1 - price / oldPrice) * 100) : null;
    const image = product.image_url || product.image || 'https://images.unsplash.com/photo-1523275319145-80b01958f7a2?auto=format&fit=crop&q=80&w=400';
    const isNew = product.isNew;
    const vendor = product.boutique?.nom_boutique || product.vendor;
    const stock = product.stock ?? 99;
    const rating = parseFloat(product.rating || 0);
    const reviewsCount = parseInt(product.reviews_count || 0);

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2500);
        toast.success(`"${name}" ajouté au panier !`, {
            action: {
                label: 'Panier',
                onClick: () => navigate('/cart')
            }
        });
    };

    const handleWishlist = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsWishlisted(prev => !prev);
    };

    const handleQuickView = (e) => {
        e.preventDefault();
        e.stopPropagation();
        navigate(`/product/${id}`);
    };

    return (
        <div className={cn(
            "group relative bg-card rounded-[1.75rem] overflow-hidden border border-border/60",
            "hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5",
            "transition-all duration-500 flex flex-col",
            compact ? "h-auto" : "h-full"
        )}>
            {/* ── Image Zone ── */}
            <div className="relative overflow-hidden bg-slate-100 dark:bg-slate-900 m-3 rounded-[1.25rem]">
                <Link to={`/product/${id}`} className="block relative aspect-[4/3]">
                    <img
                        src={image}
                        alt={name}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                    {/* Dark overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-500" />
                </Link>

                {/* ── Badges ── */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                    {isNew && (
                        <span className="px-2.5 py-1 bg-primary text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-xl shadow-primary/20">
                            New
                        </span>
                    )}
                    {discount && (
                        <span className="px-2.5 py-1 bg-red-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-xl shadow-red-500/20">
                            -{discount}%
                        </span>
                    )}
                    {stock <= 5 && stock > 0 && (
                        <span className="px-2.5 py-1 bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full">
                            Dernier stock
                        </span>
                    )}
                </div>

                {/* ── Action Buttons (top right) ── */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
                    {/* Wishlist */}
                    <button
                        onClick={handleWishlist}
                        className={cn(
                            "size-9 rounded-xl backdrop-blur-md border flex items-center justify-center transition-all duration-300 shadow-lg",
                            isWishlisted
                                ? "bg-red-500 border-red-500 text-white scale-110"
                                : "bg-white/80 dark:bg-black/40 border-white/20 text-slate-600 dark:text-white/80 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:border-red-500 hover:text-white"
                        )}
                    >
                        <Heart className={cn("size-4", isWishlisted ? "fill-white" : "")} />
                    </button>

                    {/* Quick View */}
                    <button
                        onClick={handleQuickView}
                        className="size-9 rounded-xl bg-white/80 dark:bg-black/40 backdrop-blur-md border border-white/20 text-slate-600 dark:text-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 delay-75 shadow-lg hover:bg-primary hover:border-primary hover:text-white"
                    >
                        <Eye className="size-4" />
                    </button>
                </div>

                {/* ── Quick Add Button (bottom center, slides up) ── */}
                <div className="absolute bottom-3 inset-x-3 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-10">
                    <button
                        onClick={handleAddToCart}
                        className={cn(
                            "w-full h-10 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-2xl transition-all duration-300",
                            isAdded
                                ? "bg-emerald-500 text-white"
                                : "bg-white dark:bg-slate-800 text-foreground hover:bg-primary hover:text-white"
                        )}
                    >
                        {isAdded ? (
                            <><CheckCircle2 className="size-4" /> Ajouté !</>
                        ) : (
                            <><ShoppingCart className="size-4" /> Ajouter au panier</>
                        )}
                    </button>
                </div>
            </div>

            {/* ── Info Zone ── */}
            <div className="px-5 pb-5 pt-3 flex flex-col flex-1 gap-3">
                {/* Category + Rating */}
                <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] px-2 py-0.5 bg-primary/8 rounded-md border border-primary/10">
                        {product.categorie?.nom_categorie || product.nom_categorie || 'Catalogue'}
                    </span>
                    <div className="flex items-center gap-1">
                        <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className={cn("size-2.5", i < Math.floor(rating) ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-600")} />
                            ))}
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground">({reviewsCount})</span>
                    </div>
                </div>

                {/* Name */}
                <div>
                    <Link to={`/product/${id}`} className="block">
                        <h3 className="font-black text-foreground text-base leading-tight hover:text-primary transition-colors line-clamp-2 tracking-tight italic uppercase">
                            {name}
                        </h3>
                    </Link>
                    {vendor && (
                        <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-[0.15em] flex items-center gap-1.5 mt-1">
                            <span className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
                            {vendor}
                        </p>
                    )}
                </div>

                {/* Description */}
                {!compact && (
                    <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2 font-medium flex-1">
                        {description || "Produit de qualité sélectionné par BCA Connect."}
                    </p>
                )}

                {/* Price + CTA */}
                <div className="flex items-end justify-between pt-3 border-t border-border/40 mt-auto">
                    <div className="flex flex-col">
                        {oldPrice && (
                            <span className="text-[10px] text-muted-foreground line-through font-medium">
                                {oldPrice.toLocaleString('fr-FR')} GNF
                            </span>
                        )}
                        <span className="text-xl font-black text-foreground italic tracking-tighter leading-none">
                            {price.toLocaleString('fr-FR')}
                            <span className="text-xs not-italic font-medium opacity-50 ml-1">GNF</span>
                        </span>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="h-9 px-4 rounded-xl font-black uppercase tracking-widest text-[9px] border-border/50 hover:bg-primary hover:text-white hover:border-primary transition-all group/btn gap-1.5"
                    >
                        <Link to={`/product/${id}`}>
                            Détails
                            <ArrowRight className="size-3 group-hover/btn:translate-x-0.5 transition-transform" />
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
