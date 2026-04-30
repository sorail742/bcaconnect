import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    ShoppingCart, Star, Heart, CheckCircle2, Store, 
    Package, Edit3, Trash2, TrendingUp, AlertCircle,
    Eye, MoreHorizontal, MessageSquare, MessageCircle
} from 'lucide-react';
import useCart from '../../hooks/useCart';
import useWishlistStore from '../../store/wishlistStore';
import useAuthStore from '../../store/authStore';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import LazyImage from '../ui/LazyImage';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1523275319145-80b01958f7a2?auto=format&fit=crop&q=80&w=400';

// ── Shared Helper: Image URL ─────────────────────────────────
export const getImageUrl = (url) => {
    if (!url) return FALLBACK_IMAGE;
    if (url.startsWith('http')) return url;
    const serverUrl = 'http://localhost:5000';
    return `${serverUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

// ── Shared UI: Price ───────────────────────────────────────────
export const ProductPrice = ({ price, oldPrice, size = 'md' }) => {
    const priceStr = parseFloat(price || 0).toLocaleString();
    const isLong = priceStr.length > 8;
    const isVeryLong = priceStr.length > 11;

    return (
        <div className="flex flex-col gap-0.5 overflow-hidden">
            <div className="flex items-baseline gap-1 flex-wrap">
                <span className={cn(
                    "price-text font-black text-slate-900 leading-none tracking-tight truncate",
                    size === 'sm' && "!text-xs"
                )}>
                    {priceStr}
                </span>
                <span className={cn(
                    "font-black text-primary uppercase shrink-0",
                    size === 'sm' ? "text-[7px]" : "text-[9px]"
                )}>
                    GNF
                </span>
            </div>
            {oldPrice && (
                <span className="text-[10px] sm:text-xs font-bold text-slate-400 line-through opacity-40 tabular-nums">
                    {parseFloat(oldPrice).toLocaleString()}
                </span>
            )}
        </div>
    );
};

// ── Shared UI: Rating ──────────────────────────────────────────
export const ProductRating = ({ avis = [], showCount = true }) => {
    const count = avis.length;
    const rating = count > 0 
        ? avis.reduce((sum, a) => sum + (parseFloat(a.note) || 0), 0) / count 
        : 0;

    return (
        <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                    <Star 
                        key={s} 
                        className={cn(
                            "size-3", 
                            s <= Math.round(rating) ? "fill-orange-400 text-orange-400" : "fill-slate-200 text-slate-200"
                        )} 
                    />
                ))}
            </div>
            <span className="text-xs font-bold text-slate-700">{rating > 0 ? rating.toFixed(1) : 'NEW'}</span>
            {showCount && count > 0 && (
                <span className="text-[10px] text-slate-400">({count})</span>
            )}
        </div>
    );
};

// ── Shared UI: Stock Badge ─────────────────────────────────────
export const ProductStockBadge = ({ qty }) => {
    const q = parseInt(qty || 0);
    if (q === 0) return (
        <span className="text-[10px] font-bold text-rose-500 uppercase">Rupture</span>
    );
    if (q <= 5) return (
        <span className="text-[10px] font-bold text-amber-500 uppercase">Faible stock</span>
    );
    return (
        <span className="text-[10px] font-bold text-emerald-600 uppercase">En stock</span>
    );
};

const ProductCard = ({ 
    product, 
    variant = 'grid', 
    onDelete, 
    onEdit,
    onUpdateStock 
}) => {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { toggleItem, isInWishlist } = useWishlistStore();
    const { user } = useAuthStore();
    
    const [isAdded, setIsAdded] = React.useState(false);

    const isWishlisted = isInWishlist(product.id);
    const isOwner = user && product.boutique && product.boutique.proprietaire_id === user.id;
    const inStock = parseInt(product.stock_quantite || 0) > 0;

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isOwner) {
            toast.error("Action impossible", { description: "Vous ne pouvez pas acheter vos propres produits." });
            return;
        }
        if (!inStock) {
            toast.error(`"${product.nom_produit}" est en rupture de stock.`);
            return;
        }
        addToCart(product);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
        toast.success("Ajouté au panier !");
    };

    const handleWishlist = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const added = toggleItem(product);
        added ? toast.success("Ajouté aux favoris") : toast.info("Retiré des favoris");
    };

    // ── Variant: TABLE ROW (Dashboard) ─────────────────────────
    if (variant === 'row') {
        return (
            <tr className="hover:bg-slate-50 transition-colors border-b border-slate-100">
                <td className="p-4">
                    <div className="size-12 rounded-lg bg-slate-100 overflow-hidden">
                        <img src={getImageUrl(product.image_url)} className="w-full h-full object-cover" alt="" />
                    </div>
                </td>
                <td className="p-4 font-bold text-slate-900">{product.nom_produit}</td>
                <td className="p-4">
                    <ProductPrice price={product.prix_unitaire} size="sm" />
                </td>
                <td className="p-4">
                    <ProductStockBadge qty={product.stock_quantite} />
                </td>
                <td className="p-4 text-right">
                    <button onClick={() => onEdit?.(product)} className="text-slate-500 hover:text-blue-600 mr-3">Modifier</button>
                    <button onClick={() => onDelete?.(product)} className="text-rose-500 hover:text-rose-600">Supprimer</button>
                </td>
            </tr>
        );
    }

    return (
        <Link
            to={`/product/${product.id}`}
            className="flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 transition-all h-full"
        >
            <div className="relative aspect-square overflow-hidden bg-slate-100">
                <LazyImage
                    src={getImageUrl(product.image_url)}
                    alt={product.nom_produit}
                    className="w-full h-full object-cover"
                />
                <button 
                    onClick={handleWishlist} 
                    className="absolute top-3 right-3 p-2 bg-white/90 rounded-full shadow-sm hover:scale-110 transition-transform"
                >
                    <Heart className={cn("size-4", isWishlisted ? "fill-rose-500 text-rose-500" : "text-slate-400")} />
                </button>
            </div>

            <div className="p-3 sm:p-4 flex flex-col flex-1">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 min-h-[2.5rem] mb-2 leading-snug">
                    {product.nom_produit}
                </h3>
                
                <div className="flex flex-wrap items-center justify-between gap-y-1 mb-3">
                    <ProductRating avis={product.avis} />
                    <ProductStockBadge qty={product.stock_quantite} />
                </div>

                <div className="mt-auto">
                    <ProductPrice price={product.prix_unitaire} oldPrice={product.prix_ancien} />
                </div>
                
                <div className="grid grid-cols-2 gap-2 mt-2">
                    <button 
                        onClick={(e) => { 
                            e.preventDefault(); 
                            e.stopPropagation();
                            const vendorId = product.boutique?.proprietaire_id || product.vendeur_id;
                            if (vendorId) navigate(`/messages?recipient=${vendorId}`);
                            else toast.error("Fournisseur non trouvé");
                        }}
                        className="flex items-center justify-center gap-2 h-9 rounded-lg border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors"
                    >
                        <MessageCircle className="size-4" />
                        Chat
                    </button>
                    
                    <button 
                        onClick={handleAddToCart}
                        disabled={!inStock || isOwner}
                        className={cn(
                            "flex items-center justify-center gap-2 h-9 rounded-lg text-xs font-bold transition-all active:scale-95",
                            isOwner ? "bg-slate-100 text-slate-400" : (isAdded ? "bg-emerald-600 text-white" : "bg-slate-900 text-white hover:bg-slate-800")
                        )}
                    >
                        {isAdded ? <CheckCircle2 className="size-4" /> : <ShoppingCart className="size-4" />}
                        {isAdded ? "Ajouté" : "Acheter"}
                    </button>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
