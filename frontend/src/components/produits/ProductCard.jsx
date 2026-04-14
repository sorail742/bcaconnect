import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Heart, CheckCircle2 } from 'lucide-react';
import useCart from '../../hooks/useCart';
import useWishlistStore from '../../store/wishlistStore';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import LazyImage from '../ui/LazyImage';
import { useQueryClient } from '@tanstack/react-query';
import productService from '../../services/productService';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1523275319145-80b01958f7a2?auto=format&fit=crop&q=80&w=400';

const ProductCard = ({ product, compact = false }) => {
    const queryClient = useQueryClient();
    const { addToCart } = useCart();
    const { toggleItem, isInWishlist } = useWishlistStore();
    
    // États locaux UI
    const [isAdded, setIsAdded] = React.useState(false);
    const [imgError, setImgError] = React.useState(false);
    
    const isWishlisted = isInWishlist(product.id);

    const id = product.id;
    const name = product.nom_produit || product.name || 'Produit sans nom';
    const price = parseFloat(product.prix_unitaire || product.price || 0);
    const oldPrice = product.prix_ancien ? parseFloat(product.prix_ancien) : null;
    const discount = oldPrice && oldPrice > price ? Math.round((1 - price / oldPrice) * 100) : null;
    const image = imgError ? FALLBACK_IMAGE : (product.image_url || product.image || FALLBACK_IMAGE);
    const rating = parseFloat(product.rating || 4.5);
    const reviewsCount = parseInt(product.reviews_count || 0);
    const stock = parseInt(product.stock_quantite ?? 10);
    const inStock = stock > 0;

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!inStock) {
            toast.error(`"${name}" est actuellement en rupture de stock.`);
            return;
        }
        addToCart(product);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
        toast.success(`"${name}" ajouté au panier.`, {
            description: "Vous pouvez finaliser votre commande dans le panier.",
            icon: <ShoppingCart className="size-4 text-emerald-500" />
        });
    };

    const handleWishlist = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const added = toggleItem(product);
        if (added) {
            toast.success(`"${name}" ajouté à vos favoris.`);
        } else {
            toast.info(`"${name}" retiré de vos favoris.`);
        }
    };

    // Pré-chargement des données du produit au survol pour un effet "instantané"
    const prefetchProduct = () => {
        queryClient.prefetchQuery({
            queryKey: ['product', id],
            queryFn: () => productService.getById(id),
            staleTime: 2 * 60_000,
        });
    };

    return (
        <Link
            to={`/product/${id}`}
            onMouseEnter={prefetchProduct}
            className={cn(
                "group flex flex-col bg-card/60 backdrop-blur-sm rounded-[2rem] border border-white/5 overflow-hidden hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] hover:-translate-y-2 transition-all duration-500 w-full h-full p-2 isolate",
                !inStock && "opacity-80 grayscale-[0.8]"
            )}
        >
            {/* Image Section */}
            <div className="relative w-full aspect-square md:aspect-[4/3] rounded-[1.5rem] overflow-hidden bg-muted">
                <LazyImage
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Badges - Glass Style */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {discount && (
                        <span className="px-3 py-1 bg-red-500 text-white text-[10px] font-black rounded-full shadow-xl uppercase tracking-widest animate-pulse">
                            -{discount}%
                        </span>
                    )}
                    {!inStock && (
                        <span className="px-3 py-1 bg-black/80 backdrop-blur-md text-white text-[10px] font-black rounded-full border border-white/10 uppercase tracking-widest">
                            SOLD_OUT
                        </span>
                    )}
                </div>

                {/* Wishlist */}
                <button
                    onClick={handleWishlist}
                    className="absolute top-4 right-4 p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl text-white hover:bg-red-500 hover:text-white transition-all duration-300"
                >
                    <Heart className={cn("size-4", isWishlisted ? "fill-current text-current" : "")} />
                </button>
            </div>

            {/* Meta Info */}
            <div className="p-5 flex flex-col flex-1 gap-4">
                <h3 className="text-base font-black text-foreground line-clamp-2 leading-tight uppercase tracking-tighter group-hover:text-primary transition-colors">
                    {name}
                </h3>
 
                {/* Visual Stats */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 bg-muted/30 px-2 py-1 rounded-lg">
                        <Star className="size-3.5 fill-primary text-primary" />
                        <span className="text-[10px] font-black text-foreground uppercase tracking-widest">{rating.toFixed(1)}</span>
                    </div>
                </div>

                {/* Pricing - Outfit Black */}
                <div className="flex items-end justify-between mt-auto">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">PRIX_GLOBAL</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black text-foreground tracking-tighter leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                {price.toLocaleString('fr-FR')}
                            </span>
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest italic">GNF</span>
                        </div>
                    </div>

                    <button
                        onClick={handleAddToCart}
                        disabled={!inStock}
                        className={cn(
                            "flex items-center justify-center size-12 rounded-2xl transition-all duration-500 shadow-xl",
                            !inStock 
                                ? "bg-muted/50 text-muted-foreground cursor-not-allowed"
                                : isAdded
                                    ? "bg-emerald-500 text-white scale-110"
                                    : "bg-primary text-primary-foreground hover:scale-110 hover:shadow-primary/30"
                        )}
                    >
                        {isAdded
                            ? <CheckCircle2 className="size-5" />
                            : <ShoppingCart className="size-5" />
                        }
                    </button>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
