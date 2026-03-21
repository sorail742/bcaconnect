import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout';
import { Button } from '../components/ui/Button';
import {
    ShoppingCart, Trash2, Plus, Minus, ArrowRight, ShieldCheck,
    Truck, Package, ArrowLeft, Tag, Zap, AlertCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

const DELIVERY_FEE = 50000;

const CartPage = () => {
    const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();
    const navigate = useNavigate();
    const total = cartTotal + DELIVERY_FEE;

    const handleRemove = (item) => {
        removeFromCart(item.id);
        toast.info(`"${item.nom_produit}" retiré du panier.`);
    };

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            toast.error("Votre panier est vide.");
            return;
        }
        navigate('/checkout');
    };

    return (
        <PublicLayout>
            <div className="font-inter max-w-7xl mx-auto px-4 md:px-8 py-10 pb-24 space-y-8 animate-in fade-in duration-500">

                {/* ── Header ── */}
                <div className="flex items-center justify-between">
                    <div>
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-xs font-black uppercase tracking-widest transition-colors mb-3 group"
                        >
                            <ArrowLeft className="size-3.5 group-hover:-translate-x-1 transition-transform" /> Continuer mes achats
                        </button>
                        <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-foreground uppercase">
                            Mon Panier
                            <span className="ml-3 text-2xl text-muted-foreground font-bold not-italic">
                                ({cartItems.reduce((a, i) => a + i.quantity, 0)} article{cartItems.reduce((a, i) => a + i.quantity, 0) > 1 ? 's' : ''})
                            </span>
                        </h1>
                    </div>
                    {cartItems.length > 0 && (
                        <button
                            onClick={() => { clearCart(); toast.info("Panier vidé."); }}
                            className="text-[10px] font-black text-destructive hover:text-destructive/80 uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                        >
                            <Trash2 className="size-3.5" /> Vider le panier
                        </button>
                    )}
                </div>

                {cartItems.length === 0 ? (
                    /* ── Panier vide ── */
                    <div className="py-24 flex flex-col items-center gap-8 text-center">
                        <div className="relative size-32">
                            <div className="size-32 rounded-[2.5rem] bg-muted/50 flex items-center justify-center border-4 border-dashed border-border">
                                <ShoppingCart className="size-16 text-muted-foreground/20" />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-3xl font-black italic tracking-tighter text-foreground">Votre panier est vide</h2>
                            <p className="text-muted-foreground font-medium mt-2 max-w-md mx-auto">
                                Découvrez notre catalogue et ajoutez des produits à votre panier pour commencer votre achat.
                            </p>
                        </div>
                        <Link to="/catalog">
                            <Button className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-sm gap-2 shadow-xl shadow-primary/20">
                                Explorer le catalogue <ArrowRight className="size-4" />
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                        {/* ── Liste articles ── */}
                        <div className="lg:col-span-2 space-y-4">
                            {cartItems.map((item) => {
                                const price = parseFloat(item.prix_unitaire || item.prix || item.price || 0);
                                const name = item.nom_produit || item.name || 'Produit';
                                const img = item.image_url || item.image || null;

                                return (
                                    <div key={item.id} className="flex gap-5 p-5 rounded-[1.5rem] bg-card border border-border hover:border-primary/20 transition-all group shadow-sm">
                                        {/* Image */}
                                        <div className="size-24 rounded-2xl bg-muted border border-border overflow-hidden shrink-0">
                                            {img
                                                ? <img src={img} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                : <div className="w-full h-full flex items-center justify-center"><Package className="size-8 text-muted-foreground/30" /></div>
                                            }
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0 flex flex-col justify-between gap-3">
                                            <div>
                                                <h3 className="font-black italic tracking-tight text-foreground truncate">{name}</h3>
                                                {item.categorie?.nom_categorie && (
                                                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest px-2 py-0.5 bg-muted rounded-full border border-border mt-1 inline-block">
                                                        {item.categorie.nom_categorie}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between flex-wrap gap-3">
                                                {/* Quantité */}
                                                <div className="flex items-center gap-2 bg-muted/50 rounded-xl p-1 border border-border">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        disabled={item.quantity <= 1}
                                                        className="size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-background transition-all disabled:opacity-30"
                                                    >
                                                        <Minus className="size-3" />
                                                    </button>
                                                    <span className="w-8 text-center text-sm font-black italic">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        disabled={item.stock_quantite && item.quantity >= item.stock_quantite}
                                                        className="size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-background transition-all disabled:opacity-30"
                                                    >
                                                        <Plus className="size-3" />
                                                    </button>
                                                </div>
                                                {/* Prix */}
                                                <div className="text-right">
                                                    <p className="text-xl font-black italic tracking-tighter text-foreground">
                                                        {(price * item.quantity).toLocaleString('fr-FR')} <span className="text-sm font-bold text-muted-foreground">GNF</span>
                                                    </p>
                                                    {item.quantity > 1 && (
                                                        <p className="text-[10px] text-muted-foreground font-medium">
                                                            {price.toLocaleString('fr-FR')} GNF / unité
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Supprimer */}
                                        <button
                                            onClick={() => handleRemove(item)}
                                            className="size-10 rounded-xl border border-border text-muted-foreground hover:border-destructive/40 hover:text-destructive hover:bg-destructive/5 flex items-center justify-center transition-all shrink-0 self-start"
                                        >
                                            <Trash2 className="size-4" />
                                        </button>
                                    </div>
                                );
                            })}

                            {/* Lien catalogue */}
                            <Link to="/catalog" className="flex items-center gap-2 text-primary text-xs font-black uppercase tracking-widest hover:gap-3 transition-all py-2">
                                <ArrowLeft className="size-3.5" /> Ajouter d'autres articles
                            </Link>
                        </div>

                        {/* ── Récapitulatif ── */}
                        <div className="sticky top-24">
                            <div className="rounded-[2rem] bg-card border border-border overflow-hidden shadow-2xl">
                                {/* En-tête */}
                                <div className="p-6 border-b border-border bg-muted/20">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground flex items-center gap-2">
                                        <Tag className="size-3.5 text-primary" /> Récapitulatif de commande
                                    </h3>
                                </div>

                                {/* Détail */}
                                <div className="p-6 space-y-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground font-medium">Sous-total ({cartItems.length} produit{cartItems.length > 1 ? 's' : ''})</span>
                                        <span className="font-black text-foreground">{cartTotal.toLocaleString('fr-FR')} GNF</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                                            <Truck className="size-3.5" /> Livraison Rush Conakry
                                        </span>
                                        <span className="font-black text-foreground">{DELIVERY_FEE.toLocaleString('fr-FR')} GNF</span>
                                    </div>

                                    <div className="pt-4 border-t border-border">
                                        <div className="flex justify-between items-end">
                                            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Total TTC</span>
                                            <div className="text-right">
                                                <p className="text-3xl font-black italic tracking-tighter text-foreground">{total.toLocaleString('fr-FR')}</p>
                                                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">GNF</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Bouton commander */}
                                <div className="p-6 pt-0 space-y-3">
                                    <Button
                                        onClick={handleCheckout}
                                        className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-sm gap-2 shadow-2xl shadow-primary/30"
                                    >
                                        <Zap className="size-4" /> Commander ({total.toLocaleString('fr-FR')} GNF)
                                    </Button>
                                    <p className="text-center text-[9px] text-muted-foreground font-medium">
                                        Paiement sécurisé • Remboursement garanti
                                    </p>
                                </div>

                                {/* Trust badges */}
                                <div className="px-6 pb-6 grid grid-cols-2 gap-3">
                                    {[
                                        { icon: ShieldCheck, label: 'Paiement sécurisé', sub: 'Séquestre BCA' },
                                        { icon: Truck, label: 'Livraison rapide', sub: '24-48h Conakry' },
                                    ].map((b, i) => (
                                        <div key={i} className="flex items-center gap-2 p-3 rounded-xl bg-muted/30 border border-border">
                                            <b.icon className="size-4 text-primary shrink-0" />
                                            <div>
                                                <p className="text-[9px] font-black text-foreground uppercase tracking-wide leading-none">{b.label}</p>
                                                <p className="text-[8px] text-muted-foreground font-medium mt-0.5">{b.sub}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </PublicLayout>
    );
};

export default CartPage;
