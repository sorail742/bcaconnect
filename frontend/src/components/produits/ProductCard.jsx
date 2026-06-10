import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    ShoppingCart, Star, Heart, CheckCircle2, Store, 
    Package, Edit3, Trash2, MessageCircle, ShieldCheck, BadgeCheck
} from 'lucide-react';
import useCart from '../../hooks/useCart';
import useWishlistStore from '../../store/wishlistStore';
import useAuthStore from '../../store/authStore';
import { hasPermission } from '../../utils/permissions';
import messageService from '../../services/messageService';
import { cn, getImageUrl } from '../../lib/utils';
import { toast } from 'sonner';
import LazyImage from '../ui/LazyImage';
import { useLanguage } from '../../context/useLanguage';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1523275319145-80b01958f7a2?auto=format&fit=crop&q=80&w=400';

const getMoq = (product) => {
    const attrs = product?.attributs_produit || product?.attributs || {};
    const moq = attrs.quantite_min ?? attrs.moq ?? attrs.min_order;
    return moq ? parseInt(moq, 10) : null;
};

const isVerifiedSupplier = (product) =>
    product?.boutique?.is_verified || product?.boutique?.proprietaire?.is_verified;

// ── Shared UI: Price ───────────────────────────────────────────
export const ProductPrice = ({ price, oldPrice, size = 'md', variant = 'default' }) => {
    const { t } = useLanguage();
    const priceStr = parseFloat(price || 0).toLocaleString();
    const isBca = variant === 'bca';

    return (
        <div className="flex flex-col gap-0.5 overflow-hidden">
            <div className="flex items-baseline gap-1 flex-wrap">
                {isBca && (
                    <span className="text-[10px] text-[#999] font-medium mr-0.5">à partir de</span>
                )}
                <span className={cn(
                    "leading-none tracking-tight truncate",
                    isBca ? "bca-price text-lg sm:text-xl" : "price-text font-black text-slate-900",
                    size === 'sm' && !isBca && "!text-xs",
                    size === 'lg' && isBca && "text-3xl sm:text-4xl"
                )}>
                    {priceStr}
                </span>
                <span className={cn(
                    "font-bold uppercase shrink-0",
                    isBca ? "text-[#FF6600] text-xs" : "font-black text-primary",
                    size === 'sm' && !isBca && "text-[7px]",
                    !isBca && size !== 'sm' && "text-[9px]"
                )}>
                    {t('gnf')}
                </span>
            </div>
            {oldPrice && (
                <span className="text-[10px] sm:text-xs font-medium text-[#999] line-through tabular-nums">
                    {parseFloat(oldPrice).toLocaleString()} {t('gnf')}
                </span>
            )}
        </div>
    );
};

// ── Shared UI: Rating ──────────────────────────────────────────
export const ProductRating = ({ avis = [], showCount = true, compact = false }) => {
    const { t } = useLanguage();
    const count = avis?.length || 0;
    const rating = count > 0 
        ? avis.reduce((sum, a) => sum + (parseFloat(a.note) || 0), 0) / count 
        : 0;

    return (
        <div className="flex items-center gap-1">
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                    <Star 
                        key={s} 
                        className={cn(
                            compact ? "size-2.5" : "size-3",
                            s <= Math.round(rating) ? "fill-[#FF6600] text-[#FF6600]" : "fill-[#e8e8e8] text-[#e8e8e8]"
                        )} 
                    />
                ))}
            </div>
            <span className={cn("font-semibold text-[#333]", compact ? "text-[10px]" : "text-xs")}>
                {rating > 0 ? rating.toFixed(1) : (t('new') || 'Nouveau')}
            </span>
            {showCount && count > 0 && (
                <span className="text-[10px] text-[#999]">({count})</span>
            )}
        </div>
    );
};

// ── Shared UI: Stock Badge ─────────────────────────────────────
export const ProductStockBadge = ({ qty }) => {
    const { t } = useLanguage();
    const q = parseInt(qty || 0);
    if (q === 0) return (
        <span className="text-[10px] font-semibold text-rose-500">{t('invStatusOut') || 'Rupture'}</span>
    );
    if (q <= 5) return (
        <span className="text-[10px] font-semibold text-amber-600">{t('invStatusLow') || 'Stock faible'}</span>
    );
    return (
        <span className="text-[10px] font-semibold text-emerald-600">{t('invStatusInStock') || 'En stock'}</span>
    );
};

const SupplierRow = ({ product }) => {
    const storeName = product?.boutique?.nom_boutique || product?.boutique?.name || 'Fournisseur BCA';
    const verified = isVerifiedSupplier(product);

    return (
        <div className="flex items-center gap-1.5 min-w-0 mb-2">
            <Store className="size-3 text-[#999] shrink-0" />
            <span className="text-[11px] text-[#666] truncate">{storeName}</span>
            {verified && (
                <span className="bca-badge-verified shrink-0">
                    <BadgeCheck className="size-2.5" />
                    Vérifié
                </span>
            )}
        </div>
    );
};

const ProductCard = ({ 
    product, 
    variant = 'grid',
    layout,
    onDelete, 
    onEdit,
    onUpdateStock,
    customStockEditor 
}) => {
    const cardVariant = layout || variant;
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { toggleItem, isInWishlist } = useWishlistStore();
    const { user } = useAuthStore();
    
    const [isAdded, setIsAdded] = React.useState(false);
    const [chatLoading, setChatLoading] = React.useState(false);

    const isWishlisted = isInWishlist(product.id);
    const isOwner = user && product.boutique && product.boutique.proprietaire_id === user.id;
    const canBuy = hasPermission(user, 'CAN_BUY');
    const inStock = parseInt(product.stock_quantite || 0) > 0;
    const cartDisabled = !inStock || isOwner || !canBuy;
    const moq = getMoq(product);

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!canBuy) {
            toast.error('Action réservée aux clients', { description: 'Seuls les comptes client peuvent passer commande.' });
            return;
        }
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

    const handleChat = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
            toast.info('Connexion requise', { description: 'Connectez-vous pour discuter avec le fournisseur.' });
            navigate('/login');
            return;
        }
        if (isOwner) {
            toast.error(t('pdOwnerAction'), { description: t('pdOwnerDesc') });
            return;
        }
        const vendorId = product.boutique?.proprietaire_id || product.vendeur_id;
        if (!vendorId) {
            toast.error(t('pdVendorNotFound') || 'Vendeur introuvable.');
            return;
        }
        setChatLoading(true);
        try {
            const conversation = await messageService.startConversation(vendorId);
            navigate(`/messages?id=${conversation.id}`, { state: { openConversation: conversation } });
        } catch {
            toast.error('Impossible de démarrer la conversation.');
        } finally {
            setChatLoading(false);
        }
    };

    // ── Variant: TABLE ROW (Dashboard) ─────────────────────────
    if (cardVariant === 'row') {
        return (
            <tr className="hover:bg-slate-50 transition-colors border-b border-slate-100">
                <td className="p-4">
                    <div className="size-12 rounded border border-[#e8e8e8] overflow-hidden bg-slate-100">
                        <img src={getImageUrl(product.image_url)} className="w-full h-full object-cover" alt="" />
                    </div>
                </td>
                <td className="px-6 py-4 font-semibold text-[#333] text-xs">{product.nom_produit}</td>
                <td className="px-6 py-4">
                    <span className="text-[10px] font-medium text-[#666] bg-[#f5f5f5] px-2 py-1 rounded-sm">
                        {product.categorie?.nom_categorie || 'N/A'}
                    </span>
                </td>
                <td className="px-6 py-4">
                    <ProductPrice price={product.prix_unitaire} size="sm" variant="bca" />
                </td>
                <td className="px-6 py-4">
                    {customStockEditor ? customStockEditor : <ProductStockBadge qty={product.stock_quantite} />}
                </td>
                <td className="px-6 py-4">
                    <ProductRating avis={product.avis} showCount={false} compact />
                </td>
                <td className="px-6 py-4 text-right">
                   <div className="flex items-center justify-end gap-2">
                        <button onClick={(e) => { e.preventDefault(); onEdit?.(product); }} className="size-8 rounded border border-[#e8e8e8] flex items-center justify-center text-[#666] hover:text-[#FF6600] hover:border-[#FF6600] transition-all">
                            <Edit3 className="size-3.5" />
                        </button>
                        <button onClick={(e) => { e.preventDefault(); onDelete?.(product); }} className="size-8 rounded border border-rose-200 flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-all">
                            <Trash2 className="size-3.5" />
                        </button>
                   </div>
                </td>
            </tr>
        );
    }

    // ── Variant: LIST (BCA horizontal card) ────────────────
    if (cardVariant === 'list') {
        return (
            <Link to={`/product/${product.id}`} className="bca-product-card flex flex-row h-full group">
                <div className="relative w-36 sm:w-44 md:w-52 shrink-0 aspect-square bg-[#fafafa] border-r border-[#e8e8e8]">
                    <LazyImage
                        src={getImageUrl(product.image_url)}
                        alt={product.nom_produit}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                </div>
                <div className="flex-1 p-4 flex flex-col min-w-0">
                    <SupplierRow product={product} />
                    <h3 className="text-sm font-semibold text-[#333] line-clamp-2 mb-2 group-hover:text-[#FF6600] transition-colors">
                        {product.nom_produit}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                        <ProductRating avis={product.avis} compact />
                        <ProductStockBadge qty={product.stock_quantite} />
                        {moq && <span className="bca-badge-moq">MOQ: {moq} pcs</span>}
                        <span className="bca-badge-trade">
                            <ShieldCheck className="size-2.5" />
                            Escrow
                        </span>
                    </div>
                    <div className="mt-auto flex items-end justify-between gap-4">
                        <ProductPrice price={product.prix_unitaire} oldPrice={product.prix_ancien} variant="bca" />
                        <div className="flex items-center gap-2 shrink-0">
                            <button onClick={handleChat} className="bca-btn-outline h-9 px-3 text-xs hidden sm:flex items-center gap-1.5">
                                <MessageCircle className="size-3.5" />
                                Contacter
                            </button>
                            <button
                                onClick={handleAddToCart}
                                className={cn(
                                    "h-9 px-4 text-xs flex items-center gap-1.5 rounded",
                                    cartDisabled ? "bg-[#f5f5f5] text-[#999] cursor-not-allowed" :
                                    isAdded ? "bg-emerald-500 text-white" : "bca-btn-primary"
                                )}
                            >
                                {isAdded ? <CheckCircle2 className="size-3.5" /> : <ShoppingCart className="size-3.5" />}
                                {isAdded ? 'Ajouté' : 'Commander'}
                            </button>
                        </div>
                    </div>
                </div>
            </Link>
        );
    }

    // ── Variant: GRID (BCA default) ──────────────────────────
    return (
        <Link to={`/product/${product.id}`} className="bca-product-card flex flex-col h-full group">
            <div className="relative aspect-square overflow-hidden bg-[#fafafa]">
                <LazyImage
                    src={getImageUrl(product.image_url)}
                    alt={product.nom_produit}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {isVerifiedSupplier(product) && (
                        <span className="bca-badge-verified shadow-sm">
                            <BadgeCheck className="size-2.5" />
                            Vérifié
                        </span>
                    )}
                    <span className="bca-badge-trade shadow-sm">
                        <ShieldCheck className="size-2.5" />
                        Escrow
                    </span>
                </div>
                <button 
                    onClick={handleWishlist} 
                    className="absolute top-2 right-2 p-1.5 bg-white/95 rounded-sm border border-[#e8e8e8] hover:border-[#FF6600] transition-colors"
                >
                    <Heart className={cn("size-3.5", isWishlisted ? "fill-rose-500 text-rose-500" : "text-[#999]")} />
                </button>
            </div>

            <div className="p-3 flex flex-col flex-1 border-t border-[#f0f0f0]">
                <SupplierRow product={product} />
                <h3 className="text-xs sm:text-sm font-medium text-[#333] line-clamp-2 min-h-[2.5rem] mb-2 leading-snug group-hover:text-[#FF6600] transition-colors">
                    {product.nom_produit}
                </h3>
                
                <div className="flex flex-wrap items-center gap-2 mb-2">
                    <ProductRating avis={product.avis} compact />
                    {moq && <span className="bca-badge-moq">MOQ {moq}</span>}
                </div>

                <div className="flex items-center justify-between gap-2 mb-2">
                    <ProductPrice price={product.prix_unitaire} oldPrice={product.prix_ancien} variant="bca" size="sm" />
                    <ProductStockBadge qty={product.stock_quantite} />
                </div>
                
                <div className="grid grid-cols-2 gap-1.5 mt-auto pt-2 border-t border-[#f5f5f5]">
                    <button 
                        onClick={handleChat}
                        disabled={chatLoading || isOwner}
                        className={cn(
                            "flex items-center justify-center gap-1 h-8 text-[10px] font-semibold bca-btn-outline",
                            (chatLoading || isOwner) && "opacity-50 cursor-not-allowed",
                        )}
                    >
                        <MessageCircle className="size-3" />
                        {chatLoading ? '...' : 'Chat'}
                    </button>
                    <button 
                        onClick={handleAddToCart}
                        className={cn(
                            "flex items-center justify-center gap-1 h-8 text-[10px] font-semibold rounded",
                            cartDisabled ? "bg-[#f5f5f5] text-[#999] cursor-not-allowed" :
                            isAdded ? "bg-emerald-500 text-white" : "bca-btn-primary"
                        )}
                    >
                        {isAdded ? <CheckCircle2 className="size-3" /> : <ShoppingCart className="size-3" />}
                        {isAdded ? 'OK' : 'Panier'}
                    </button>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
