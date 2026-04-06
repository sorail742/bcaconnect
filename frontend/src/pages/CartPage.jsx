import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Truck, Package, ArrowLeft, Tag, Zap, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import { useLanguage } from '../context/LanguageContext';

const DELIVERY_FEE = 50000;

const CartPage = () => {
    const { t } = useLanguage();
    const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();
    const navigate = useNavigate();
    const total = (cartTotal || 0) + DELIVERY_FEE;

    const handleRemove = (item) => {
        removeFromCart(item.id);
        toast.info(`${item.nom_produit || item.name} retiré du panier.`);
    };

    const handleCheckout = () => {
        if (cartItems.length === 0) { toast.error('Votre panier est vide.'); return; }
        navigate('/checkout');
    };

    return (
        <div className="bg-background min-h-screen text-foreground pb-16">
            <div className="max-w-6xl mx-auto px-6 md:px-12 pt-24 space-y-8">

                {/* Header */}
                <div className="flex items-center justify-between pb-6 border-b border-border">
                    <div className="space-y-2">
                        <button onClick={() => navigate('/marketplace')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                            <ArrowLeft className="size-4" /> Continuer les achats
                        </button>
                        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                            Mon panier <span className="text-primary">({cartItems.reduce((a, i) => a + i.quantity, 0)} article{cartItems.reduce((a, i) => a + i.quantity, 0) > 1 ? 's' : ''})</span>
                        </h1>
                    </div>
                    {cartItems.length > 0 && (
                        <button onClick={() => { clearCart(); toast.info('Panier vidé.'); }}
                            className="flex items-center gap-2 text-sm font-medium text-rose-500 hover:bg-rose-500/10 px-4 py-2 rounded-xl border border-rose-500/20 hover:border-rose-500/40 transition-all">
                            <Trash2 className="size-4" /> Vider
                        </button>
                    )}
                </div>

                {cartItems.length === 0 ? (
                    <div className="py-20 flex flex-col items-center text-center bg-card rounded-2xl border border-border gap-5">
                        <ShoppingCart className="size-12 text-muted-foreground/30" />
                        <div>
                            <h2 className="text-lg font-bold text-foreground">{t('cartEmptyTitle') || 'Votre panier est vide'}</h2>
                            <p className="text-sm text-muted-foreground mt-1">{t('cartEmptyDesc') || 'Ajoutez des produits pour commencer.'}</p>
                        </div>
                        <Link to="/marketplace">
                            <Button className="h-10 px-6 bg-primary text-primary-foreground rounded-xl font-semibold text-sm border-none hover:bg-primary/90">
                                {t('cartOpenCatalog') || 'Explorer le catalogue'} <ArrowRight className="size-4 ml-2" />
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {cartItems.map(item => {
                                const price = parseFloat(item.prix_unitaire || item.prix || 0);
                                const name = item.nom_produit || item.name || 'Produit';
                                const img = item.image_url || item.image || item.images?.[0]?.url_image;
                                return (
                                    <div key={item.id} className="flex gap-4 p-4 bg-card rounded-2xl border border-border hover:border-primary/30 transition-all group shadow-sm">
                                        <div className="size-20 rounded-xl bg-muted border border-border overflow-hidden shrink-0">
                                            {img ? <img src={img} alt={name} className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
                                                : <Package className="size-6 text-muted-foreground m-auto mt-7" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-3">
                                                <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">{name}</h3>
                                                <button onClick={() => handleRemove(item)} className="size-7 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 flex items-center justify-center transition-all shrink-0">
                                                    <Trash2 className="size-3.5" />
                                                </button>
                                            </div>
                                            {item.categorie?.nom_categorie && (
                                                <span className="text-xs text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">{item.categorie.nom_categorie}</span>
                                            )}
                                            <div className="flex items-center justify-between mt-3">
                                                <div className="flex items-center gap-1 bg-muted border border-border rounded-lg p-0.5">
                                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}
                                                        className="size-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors">
                                                        <Minus className="size-3.5" />
                                                    </button>
                                                    <span className="w-8 text-center text-sm font-bold text-foreground tabular-nums">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="size-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                                                        <Plus className="size-3.5" />
                                                    </button>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-foreground tabular-nums">{(price * item.quantity).toLocaleString()} GNF</p>
                                                    {item.quantity > 1 && <p className="text-xs text-muted-foreground">{price.toLocaleString()} / unité</p>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm sticky top-24">
                                <div className="h-1 bg-primary" />
                                <div className="p-5 space-y-5">
                                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                        <Tag className="size-4 text-primary" /> Récapitulatif
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between text-muted-foreground">
                                            <span>Sous-total</span>
                                            <span className="font-medium text-foreground tabular-nums">{(cartTotal || 0).toLocaleString()} GNF</span>
                                        </div>
                                        <div className="flex justify-between text-muted-foreground">
                                            <span className="flex items-center gap-1.5"><Truck className="size-3.5 text-primary" /> Livraison</span>
                                            <span className="font-medium text-foreground tabular-nums">{DELIVERY_FEE.toLocaleString()} GNF</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
                                            <span>Total</span>
                                            <span className="text-primary tabular-nums">{total.toLocaleString()} GNF</span>
                                        </div>
                                    </div>
                                    <Button onClick={handleCheckout}
                                        className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-bold text-sm border-none hover:bg-primary/90 flex items-center justify-center gap-2">
                                        <Zap className="size-4" /> {t('cartCheckout') || 'Commander'}
                                    </Button>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <ShieldCheck className="size-3.5 text-emerald-500" /> Paiement 100% sécurisé
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Truck className="size-3.5 text-primary" /> Livraison express 48h
                                        </div>
                                    </div>
                                    <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl">
                                        <p className="text-xs font-semibold text-primary flex items-center gap-2">
                                            <AlertCircle className="size-3.5" /> {t('cartBcaGuard') || 'Protection BCA'}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">{t('cartEscrowDesc') || 'Votre paiement est sécurisé par notre système d\'entiercement.'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile sticky CTA */}
            {cartItems.length > 0 && (
                <div className="fixed bottom-4 left-4 right-4 z-50 lg:hidden">
                    <div className="flex items-center gap-3 p-3 bg-card/95 backdrop-blur-md border border-border rounded-2xl shadow-lg">
                        <div>
                            <p className="text-xs text-muted-foreground">Total</p>
                            <p className="text-base font-bold text-primary tabular-nums">{total.toLocaleString()} GNF</p>
                        </div>
                        <Button onClick={handleCheckout} className="flex-1 h-10 rounded-xl bg-primary text-primary-foreground font-bold text-sm border-none">
                            {t('cartCheckout') || 'Commander'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;
