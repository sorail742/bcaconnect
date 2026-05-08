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
import { cn, getImageUrl } from '../../lib/utils';
import { toast } from 'sonner';
import LazyImage from '../ui/LazyImage';
import { useLanguage } from '../../context/LanguageContext';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1523275319145-80b01958f7a2?auto=format&fit=crop&q=80&w=400';

// ── Shared UI: Price ───────────────────────────────────────────
export const ProductPrice = ({ price, oldPrice, size = 'md' }) => {
    const { t } = useLanguage();
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
                    {t('gnf')}
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
    const { t } = useLanguage();
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
            <span className="text-xs font-bold text-slate-700">{rating > 0 ? rating.toFixed(1) : t('new') || 'NEW'}</span>
            {showCount && count > 0 && (
                <span className="text-[10px] text-slate-400">({count})</span>
            )}
        </div>
    );
};

// ── Shared UI: Stock Badge ─────────────────────────────────────
export const ProductStockBadge = ({ qty }) => {
    const { t } = useLanguage();
    const q = parseInt(qty || 0);
    if (q === 0) return (
        <span className="text-[10px] font-bold text-rose-500 uppercase">{t('invStatusOut')}</span>
    );
    if (q <= 5) return (
        <span className="text-[10px] font-bold text-amber-500 uppercase">{t('invStatusLow')}</span>
    );
    return (
        <span className="text-[10px] font-bold text-emerald-600 uppercase">{t('invStatusInStock')}</span>
    );
};

const ProductCard = ({ 
    product, 
    variant = 'grid', 
    onDelete, 
    onEdit,
    onUpdateStock,
    customStockEditor 
}) => {
    const { t } = useLanguage();
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
            toast.error(t('pdOwnerAction'), { description: t('pdOwnerDesc') });
            return;
        }
        if (!inStock) {
            toast.error(t('pdOutOfStockMsg', { name: product.nom_produit }));
            return;
        }
        addToCart(product);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
        toast.success(t('pdAddedToCart'));
    };

    const handleWishlist = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const added = toggleItem(product);
        added ? toast.success(t('pdAddedToWishlist')) : toast.info(t('pdRemovedFromWishlist'));
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
                <td className="px-6 py-4 font-black text-slate-900 dark:text-white uppercase tracking-tight text-xs">{product.nom_produit}</td>
                <td className="px-6 py-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-lg">
                        {product.categorie?.nom_categorie || 'N/A'}
                    </span>
                </td>
                <td className="px-6 py-4">
                    <ProductPrice price={product.prix_unitaire} size="sm" />
                </td>
                <td className="px-6 py-4">
                    {customStockEditor ? customStockEditor : <ProductStockBadge qty={product.stock_quantite} />}
                </td>
                <td className="px-6 py-4">
                    <ProductRating avis={product.avis} showCount={false} />
                </td>
                <td className="px-6 py-4 text-right">
                   <div className="flex items-center justify-end gap-2">
                        <button onClick={(e) => { e.preventDefault(); onEdit?.(product); }} className="size-9 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-primary transition-all border-none">
                            <Edit3 className="size-4" />
                        </button>
                        <button onClick={(e) => { e.preventDefault(); onDelete?.(product); }} className="size-9 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-all border-none">
                            <Trash2 className="size-4" />
                        </button>
                   </div>
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
                            else toast.error(t('pdVendorNotFound'));
                        }}
                        className="flex items-center justify-center gap-2 h-11 rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
                    >
                        <MessageCircle className="size-4" />
                        {t('pdChat')}
                    </button>
                    
                    <button 
                        onClick={handleAddToCart}
                        disabled={!inStock || isOwner}
                        className={cn(
                            "flex items-center justify-center gap-2 h-11 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border-none",
                            isOwner ? "bg-slate-100 dark:bg-white/5 text-slate-400" : (isAdded ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 shadow-xl")
                        )}
                    >
                        {isAdded ? <CheckCircle2 className="size-4" /> : <ShoppingCart className="size-4" />}
                        {isAdded ? t('pdAdded') : t('pdAcquire')}
                    </button>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
