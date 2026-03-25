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
            "group relative bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden border border-slate-100 dark:border-slate-800 transition-all duration-700 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 flex flex-col h-full",
            compact ? "max-w-sm" : ""
        )}>
            {/* ── Image Zone ── */}
            <div className="relative aspect-[4/5] overflow-hidden bg-slate-50 dark:bg-slate-950">
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
                        "absolute top-4 right-4 h-10 w-10 rounded-2xl flex items-center justify-center transition-all duration-500 z-10",
                        isWishlisted
                            ? "bg-rose-500 text-white shadow-xl shadow-rose-500/20"
                            : "bg-white/80 dark:bg-slate-800/80 backdrop-blur-md text-slate-400 hover:text-rose-500 hover:bg-white dark:hover:bg-slate-800 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"
                    )}
                >
                    <Heart className={cn("size-5 transition-transform duration-500", isWishlisted ? "fill-current" : "group-hover:scale-110")} />
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
            <div className="p-6 flex flex-col flex-1 gap-3">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] opacity-80">
                        {product.categorie?.nom_categorie || 'Premium Collection'}
                    </span>
                    <div className="flex items-center px-1.5 py-0.5 rounded-lg bg-amber-500/10 text-amber-600 border border-amber-500/10">
                        <Star className="size-3 fill-amber-500 text-amber-500" />
                        <span className="text-[10px] font-black ml-1">{rating || '4.8'}</span>
                    </div>
                </div>

                <Link to={`/product/${id}`} className="block group/title">
                    <h3 className="font-black text-slate-900 dark:text-white text-base tracking-tight hover:text-primary transition-colors line-clamp-2 italic leading-tight">
                        {name}
                    </h3>
                </Link>

                <div className="flex items-center gap-2 py-1">
                    <div className="size-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700">
                         <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${vendor || 'BCA'}`} className="w-full h-full" alt="V" />
                    </div>
                    <p className="text-[11px] font-bold text-slate-500">
                        Par <span className="text-slate-800 dark:text-slate-300 hover:text-primary transition-colors cursor-pointer">{vendor || 'BCA Partner'}</span>
                    </p>
                </div>

                <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-50 dark:border-slate-800/50">
                    <div className="flex flex-col">
                        <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter italic">
                            {price.toLocaleString('fr-FR')} <span className="text-[10px] font-bold text-primary not-italic tracking-normal">GNF</span>
                        </span>
                        {oldPrice && (
                            <span className="text-[10px] text-slate-400 font-bold line-through tracking-tight opacity-60">
                                {oldPrice.toLocaleString('fr-FR')}
                            </span>
                        )}
                    </div>
                    
                    <button
                        onClick={handleAddToCart}
                        className={cn(
                            "group/cart h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500 relative overflow-hidden",
                            isAdded
                                ? "bg-emerald-500 text-white shadow-xl shadow-emerald-500/20"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-primary hover:text-white hover:shadow-xl hover:shadow-primary/20"
                        )}
                    >
                        <div className={cn("transition-all duration-500", isAdded ? "scale-0 rotate-90" : "scale-100 group-hover/cart:rotate-12")}>
                             <ShoppingCart className="size-5" />
                        </div>
                        <div className={cn("absolute inset-0 flex items-center justify-center transition-all duration-500", isAdded ? "scale-100 rotate-0" : "scale-0 -rotate-90")}>
                             <CheckCircle2 className="size-6" />
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
