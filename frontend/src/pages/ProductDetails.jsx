import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, Minus, Plus, ShieldCheck, Truck, ArrowRight, CheckCircle2, Share2, Heart, AlertCircle, Zap } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';
import productService from '../services/productService';
import { PageLoader } from '../components/ui/Loader';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';
import { useLanguage } from '../context/LanguageContext';

const FALLBACK = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?auto=format&fit=crop&q=80&w=600';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, lang } = useLanguage();
    const { addToCart } = useCart();
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

    const handleAddToCart = () => {
        if (!product || product.stock_quantite <= 0) return;
        addToCart(product, quantity);
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2500);
        toast.success(`${quantity}x "${product.nom_produit}" ajouté au panier`, {
            action: { label: 'Commander →', onClick: () => navigate('/checkout') }
        });
    };

    const handleBuyNow = () => {
        if (!product || product.stock_quantite <= 0) return;
        addToCart(product, quantity);
        navigate('/checkout');
    };

    if (loading) return <PageLoader />;

    if (error || !product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-background">
                <AlertCircle className="size-12 text-primary mb-4" />
                <h2 className="text-xl font-bold text-foreground mb-2">{t('pdNotFound')}</h2>
                <p className="text-muted-foreground text-sm mb-6">{t('pdNotFoundDesc')}</p>
                <Link to="/marketplace">
                    <Button className="h-10 px-6 bg-primary text-primary-foreground rounded-xl font-semibold">
                        {t('pdBackToCatalog')}
                    </Button>
                </Link>
            </div>
        );
    }

    const images = product.images?.length > 0
        ? product.images.map(img => img.url_image)
        : [FALLBACK];

    const price = parseFloat(product.prix_unitaire || 0);
    const inStock = product.stock_quantite > 0;

    const specs = [
        { label: 'Catégorie', value: product.categorie?.nom_categorie || '—' },
        { label: 'Vendeur', value: product.boutique?.nom_boutique || 'BCA Partner' },
        { label: 'Garantie', value: 'BCA Protect Premium' },
    ];

    return (
        <div className="bg-background text-foreground min-h-screen">
            <div className="max-w-6xl mx-auto px-4 md:px-8 pt-24 pb-16 space-y-8">

                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Link to="/marketplace" className="hover:text-primary transition-colors">Marketplace</Link>
                    <ArrowRight className="size-3" />
                    <span className="text-foreground font-medium truncate max-w-xs">{product.nom_produit}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Gallery */}
                    <div className="space-y-3">
                        <div className="relative aspect-square rounded-2xl bg-muted border border-border overflow-hidden group">
                            <img
                                src={images[activeImg] || FALLBACK}
                                alt={product.nom_produit}
                                onError={e => { e.target.src = FALLBACK; }}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 bg-background/80 backdrop-blur-sm border border-border rounded-xl">
                                <ShieldCheck className="size-4 text-primary" />
                                <span className="text-xs font-semibold text-foreground">{t('pdVerified')}</span>
                            </div>
                            <div className="absolute top-3 right-3 flex flex-col gap-2">
                                <button className="size-9 rounded-xl bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors">
                                    <Heart className="size-4" />
                                </button>
                                <button className="size-9 rounded-xl bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                                    <Share2 className="size-4" />
                                </button>
                            </div>
                        </div>
                        {images.length > 1 && (
                            <div className="grid grid-cols-4 gap-2">
                                {images.slice(0, 4).map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImg(idx)}
                                        className={cn(
                                            "aspect-square rounded-xl border-2 overflow-hidden bg-muted transition-all",
                                            activeImg === idx ? "border-primary" : "border-border opacity-60 hover:opacity-100"
                                        )}
                                    >
                                        <img src={img} onError={e => { e.target.src = FALLBACK; }} className="w-full h-full object-cover" alt="" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <div className={cn("size-2 rounded-full", inStock ? "bg-emerald-500 animate-pulse" : "bg-rose-500")} />
                                <span className={cn("text-xs font-semibold", inStock ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500")}>
                                    {inStock ? `En stock (${product.stock_quantite})` : 'Rupture de stock'}
                                </span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
                                {product.nom_produit}
                            </h1>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1 text-amber-500">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={cn("size-4", i < 4 ? "fill-current" : "text-muted")} />
                                    ))}
                                </div>
                                <span className="text-sm font-semibold text-foreground">4.8</span>
                                <span className="text-sm text-muted-foreground">(24 avis)</span>
                            </div>
                        </div>

                        {/* Price card */}
                        <div className="bg-card border border-border rounded-2xl p-5 space-y-5 shadow-sm">
                            <div className="space-y-1">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold text-foreground tabular-nums">{price.toLocaleString('fr-FR')}</span>
                                    <span className="text-lg font-semibold text-primary">GNF</span>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    <span className="text-xs font-medium text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-lg">
                                        {t('pdFreeDelivery')}
                                    </span>
                                    <span className="text-xs font-medium text-foreground bg-muted border border-border px-3 py-1 rounded-lg">
                                        {t('pdExclusivePrice')}
                                    </span>
                                </div>
                            </div>

                            <p className="text-sm text-muted-foreground leading-relaxed border-l-4 border-primary/30 pl-3">
                                {product.description}
                            </p>

                            <div className="space-y-3 pt-2 border-t border-border">
                                {/* Quantity */}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-foreground">Quantité</span>
                                    <div className="flex items-center gap-1 bg-muted border border-border rounded-xl p-1">
                                        <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="size-8 flex items-center justify-center rounded-lg hover:bg-background transition-colors text-foreground">
                                            <Minus className="size-4" />
                                        </button>
                                        <span className="w-10 text-center text-sm font-bold text-foreground tabular-nums">{quantity}</span>
                                        <button onClick={() => setQuantity(q => Math.min(product.stock_quantite, q + 1))} className="size-8 flex items-center justify-center rounded-lg hover:bg-background transition-colors text-foreground">
                                            <Plus className="size-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Buttons */}
                                <Button
                                    disabled={!inStock}
                                    onClick={handleAddToCart}
                                    className={cn(
                                        "w-full h-11 rounded-xl font-semibold text-sm transition-all border-none",
                                        addedToCart ? "bg-emerald-500 text-white" : "bg-primary text-primary-foreground hover:bg-primary/90"
                                    )}
                                >
                                    {addedToCart
                                        ? <><CheckCircle2 className="size-4 mr-2" /> {t('pdAddedToCart')}</>
                                        : <><ShoppingCart className="size-4 mr-2" /> {t('pdAddToCart')}</>
                                    }
                                </Button>
                                <Button
                                    disabled={!inStock}
                                    onClick={handleBuyNow}
                                    variant="outline"
                                    className="w-full h-11 rounded-xl font-semibold text-sm border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-foreground"
                                >
                                    <Zap className="size-4 mr-2 text-primary" />
                                    {t('pdBuyNow')}
                                </Button>
                            </div>

                            {/* Trust signals */}
                            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
                                {[
                                    { icon: ShieldCheck, title: 'BCA Secure', desc: 'Garantie & SAV' },
                                    { icon: Truck, title: 'Livraison 48h', desc: 'Guinée & régions' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                                        <item.icon className="size-5 text-primary shrink-0" />
                                        <div>
                                            <p className="text-xs font-semibold text-foreground">{item.title}</p>
                                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="space-y-4 pt-4 border-t border-border">
                    <div className="flex gap-1 bg-muted p-1 rounded-xl w-fit">
                        {[
                            { id: 'desc', label: t('pdDetailedDesc') },
                            { id: 'tech', label: t('pdTechSpecs') }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "px-5 py-2 rounded-lg text-sm font-medium transition-all",
                                    activeTab === tab.id
                                        ? "bg-card text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="bg-card border border-border rounded-2xl p-6">
                        {activeTab === 'desc' ? (
                            <div className="space-y-3">
                                <h3 className="text-base font-bold text-foreground">
                                    {t('pdOperationalDetails')} <span className="text-primary">{lang === 'FR' ? 'certifiés.' : 'certified.'}</span>
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {product.description_longue || product.description}
                                </p>
                            </div>
                        ) : (
                            <table className="w-full text-sm">
                                <tbody className="divide-y divide-border">
                                    {specs.map((spec, i) => (
                                        <tr key={i}>
                                            <td className="py-3 pr-4 font-medium text-muted-foreground w-1/3">{spec.label}</td>
                                            <td className="py-3 font-semibold text-foreground">{spec.value}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile sticky bar */}
            <div className="fixed bottom-4 left-4 right-4 z-50 lg:hidden">
                <div className="flex items-center gap-3 p-3 bg-card/95 backdrop-blur-md border border-border rounded-2xl shadow-lg">
                    <div>
                        <p className="text-base font-bold text-foreground tabular-nums">{price.toLocaleString('fr-FR')}</p>
                        <p className="text-xs text-primary font-semibold">GNF</p>
                    </div>
                    <Button
                        onClick={handleAddToCart}
                        disabled={!inStock}
                        className={cn(
                            "flex-1 h-10 rounded-xl font-semibold text-sm border-none",
                            addedToCart ? "bg-emerald-500 text-white" : "bg-primary text-primary-foreground"
                        )}
                    >
                        {addedToCart ? <CheckCircle2 className="size-4" /> : t('pdAcquireAsset')}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
