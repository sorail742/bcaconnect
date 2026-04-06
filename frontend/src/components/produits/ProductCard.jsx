import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Heart, CheckCircle2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1523275319145-80b01958f7a2?auto=format&fit=crop&q=80&w=400';

const ProductCard = ({ product, compact = false }) => {
    const { addToCart } = useCart();
    const [isWishlisted, setIsWishlisted] = React.useState(false);
    const [isAdded, setIsAdded] = React.useState(false);
    const [imgError, setImgError] = React.useState(false);

    const id = product.id;
    const name = product.nom_produit || product.name || 'Produit sans nom';
    const price = parseFloat(product.prix_unitaire || product.price || 0);
    const oldPrice = product.prix_ancien ? parseFloat(product.prix_ancien) : null;
    const discount = oldPrice && oldPrice > price ? Math.round((1 - price / oldPrice) * 100) : null;
    const image = imgError ? FALLBACK_IMAGE : (product.image_url || product.image || FALLBACK_IMAGE);
    const rating = parseFloat(product.rating || 4.5);
    const reviewsCount = parseInt(product.reviews_count || 0);

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
        toast.success(`${name} ajouté au panier`);
    };

    const handleWishlist = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsWishlisted(!isWishlisted);
    };

    return (
        <Link
            to={`/product/${id}`}
            className="group flex flex-col bg-card rounded-xl border border-border overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 w-full h-full"
        >
            {/* Image */}
            <div className="relative w-full aspect-[4/3] overflow-hidden bg-muted flex items-center justify-center">
                <img
                    src={image}
                    alt={name}
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Badges */}
                {discount && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-md shadow">
                        -{discount}%
                    </span>
                )}

                {/* Wishlist */}
                <button
                    onClick={handleWishlist}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 dark:bg-black/60 shadow text-muted-foreground hover:text-red-500 transition-colors"
                >
                    <Heart className={cn("size-4", isWishlisted ? "fill-red-500 text-red-500" : "")} />
                </button>
            </div>

            {/* Info */}
            <div className="p-3 flex flex-col flex-1 gap-2">
                <h3 className="text-sm font-medium text-foreground line-clamp-2 leading-snug">
                    {name}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-1">
                    <Star className="size-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-semibold text-foreground">{rating.toFixed(1)}</span>
                    {reviewsCount > 0 && (
                        <span className="text-xs text-muted-foreground">({reviewsCount})</span>
                    )}
                </div>

                {/* Price + Cart */}
                <div className="flex items-end justify-between mt-auto pt-1">
                    <div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-base font-bold text-foreground">
                                {price.toLocaleString('fr-FR')}
                            </span>
                            <span className="text-xs font-medium text-muted-foreground">GNF</span>
                        </div>
                        {oldPrice && (
                            <span className="text-xs text-muted-foreground line-through">
                                {oldPrice.toLocaleString('fr-FR')} GNF
                            </span>
                        )}
                    </div>

                    <button
                        onClick={handleAddToCart}
                        className={cn(
                            "flex items-center justify-center size-8 rounded-full transition-all duration-200 shadow-sm",
                            isAdded
                                ? "bg-emerald-500 text-white"
                                : "bg-primary/10 text-primary hover:bg-primary hover:text-white"
                        )}
                    >
                        {isAdded
                            ? <CheckCircle2 className="size-4" />
                            : <ShoppingCart className="size-4" />
                        }
                    </button>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
