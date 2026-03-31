import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, Heart, Eye, ArrowRight, CheckCircle2 } from 'lucide-react';
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
        toast.success(`"${name}" ajouté au panier !`);
    };

    const handleWishlist = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsWishlisted(prev => !prev);
    };

    return (
        <div className={cn(
            "group relative bg-card rounded-[2.5rem] overflow-hidden border border-border transition-all duration-700 hover:shadow-premium hover:-translate-y-2 flex flex-col h-full",
            compact ? "max-w-sm" : ""
        )}>
            {/* ── Image Zone ── */}
            <div className="relative aspect-[4/5] overflow-hidden bg-accent/30">
                <Link to={`/product/${id}`} className="block h-full">
                    <img
                        src={image}
                        alt={name}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                </Link>

                {/* ── Glass Badges ── */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 transition-transform duration-500 group-hover:translate-x-1">
                    {isNew && (
                        <span className="px-3 py-1 bg-primary/90 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg">
                            Nouveau
                        </span>
                    )}
                    {discount && (
                        <span className="px-3 py-1 bg-rose-500/90 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg">
                            -{discount}%
                        </span>
                    )}
                </div>

                {/* ── Overlay Actions ── */}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                
                <button
                    onClick={handleWishlist}
                    className={cn(
                        "absolute top-5 right-5 h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500 z-10 shadow-premium",
                        isWishlisted
                            ? "bg-red-500 text-white shadow-red-500/30"
                            : "bg-background/80 backdrop-blur-md text-muted-foreground hover:text-red-500 hover:bg-background opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0"
                    )}
                >
                    <Heart className={cn("size-6 transition-transform duration-500", isWishlisted ? "fill-current" : "group-hover:scale-110")} />
                </button>

                <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-10">
                    <Button 
                        onClick={() => navigate(`/product/${id}`)}
                        className="w-full h-11 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-900 dark:text-white hover:bg-primary hover:text-white border-transparent text-[10px] font-black uppercase tracking-[0.2em] rounded-xl shadow-2xl"
                    >
                        <Eye className="size-4 mr-2" />
                        Voir Détails
                    </Button>
                </div>
            </div>

            {/* ── Info Zone ── */}
            <div className="p-8 flex flex-col flex-1 gap-4">
                <div className="flex items-center justify-between">
                    <span className="text-executive-label text-primary italic uppercase opacity-80">
                        {product.categorie?.nom_categorie || 'Premium Collection'}
                    </span>
                    <div className="flex items-center px-2 py-1 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/10 shadow-sm">
                        <Star className="size-3.5 fill-amber-500 text-amber-500" />
                        <span className="text-executive-label ml-1.5">{rating || '4.8'}</span>
                    </div>
                </div>

                <Link to={`/product/${id}`} className="block group/title">
                    <h3 className="font-black text-foreground text-lg tracking-tight hover:text-primary transition-colors line-clamp-2 italic leading-tight uppercase">
                        {name}
                    </h3>
                </Link>

                <div className="flex items-center gap-3 py-1">
                    <div className="size-6 rounded-full bg-accent flex items-center justify-center overflow-hidden border border-border shadow-sm">
                         <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${vendor || 'BCA'}`} className="w-full h-full" alt="V" />
                    </div>
                    <p className="text-executive-label text-muted-foreground italic">
                        Par <span className="text-foreground hover:text-primary transition-colors cursor-pointer">{vendor || 'BCA Partner'}</span>
                    </p>
                </div>

                <div className="mt-auto pt-6 flex items-center justify-between border-t border-border">
                    <div className="flex flex-col">
                        <span className="text-2xl font-black text-foreground tracking-tighter italic">
                            {price.toLocaleString('fr-FR')} <span className="text-sm font-bold text-primary not-italic tracking-normal">GNF</span>
                        </span>
                        {oldPrice && (
                            <span className="text-executive-label text-muted-foreground/60 line-through tracking-tight">
                                {oldPrice.toLocaleString('fr-FR')}
                            </span>
                        )}
                    </div>
                    
                    <button
                        onClick={handleAddToCart}
                        className={cn(
                            "group/cart h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-500 relative overflow-hidden active-press shadow-premium",
                            isAdded
                                ? "bg-emerald-500 text-white shadow-emerald-500/30"
                                : "bg-accent text-muted-foreground hover:bg-primary hover:text-white"
                        )}
                    >
                        <div className={cn("transition-all duration-500", isAdded ? "scale-0 rotate-90" : "scale-100 group-hover/cart:rotate-12")}>
                             <ShoppingCart className="size-6" />
                        </div>
                        <div className={cn("absolute inset-0 flex items-center justify-center transition-all duration-500", isAdded ? "scale-100 rotate-0" : "scale-0 -rotate-90")}>
                             <CheckCircle2 className="size-8" />
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
