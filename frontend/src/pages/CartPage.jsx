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
            <div className="font-inter max-w-7xl mx-auto px-6 md:px-12 py-16 pb-40 space-y-16 animate-in fade-in duration-1000">

                {/* ══════════════════════════════════════════════════
                    EXECUTIVE HEADER
                ══════════════════════════════════════════════════ */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
                    <div>
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-4 text-muted-foreground/40 hover:text-primary text-executive-label font-black uppercase tracking-[0.4em] transition-all mb-8 group italic"
                        >
                            <ArrowLeft className="size-4 group-hover:-translate-x-3 transition-transform" /> Retour au Marché
                        </button>
                        <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-foreground italic uppercase leading-none drop-shadow-sm">
                            Votre <span className="text-primary not-italic">Panier.</span>
                        </h1>
                        <p className="text-executive-label font-black text-muted-foreground/40 uppercase tracking-[0.4em] mt-5 italic">
                            {cartItems.reduce((a, i) => a + i.quantity, 0)} ACCORD{cartItems.reduce((a, i) => a + i.quantity, 0) > 1 ? 'S' : ''} D'ACQUISITION — PRÊT POUR L'EXPÉDITION
                        </p>
                    </div>
                    {cartItems.length > 0 && (
                        <button
                            onClick={() => { clearCart(); toast.info("Panier vidé."); }}
                            className="text-executive-label font-black text-red-500 hover:bg-red-500/10 px-8 py-4 rounded-[1.5rem] border-2 border-red-500/20 hover:border-red-500/40 uppercase tracking-[0.3em] flex items-center gap-4 transition-all shadow-premium hover:shadow-red-500/10 active:scale-95 italic"
                        >
                            <Trash2 className="size-4" /> Vider le Panier
                        </button>
                    )}
                </div>

                {cartItems.length === 0 ? (
                    /* ══ EMPTY STATE ══ */
                    <div className="py-40 flex flex-col items-center text-center bg-card rounded-[4rem] border-4 border-border shadow-premium-lg relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                        <div className="size-40 rounded-[2.5rem] bg-background flex items-center justify-center mb-12 border-4 border-border shadow-inner relative z-10">
                            <ShoppingCart className="size-16 text-muted-foreground/20 animate-[pulse_4s_infinite]" />
                        </div>
                        <h2 className="text-4xl font-black text-foreground italic uppercase tracking-tighter relative z-10">Panier Vierge</h2>
                        <p className="text-sm text-muted-foreground/60 font-bold mt-6 max-w-sm mx-auto px-6 leading-loose italic uppercase tracking-widest relative z-10">
                            Aucun article en attente. Explorez notre catalogue pour constituer votre sélection d'achats groupés BCA.
                        </p>
                        <Link to="/catalog" className="mt-16 relative z-10">
                            <Button className="rounded-[2rem] px-16 h-20 shadow-premium-lg shadow-primary/30 font-black text-xs uppercase tracking-[0.4em] gap-6 hover:scale-105 transition-transform border-4 border-primary">
                                Explorer le Catalogue
                                <ArrowRight className="size-6 group-hover:translate-x-3 transition-transform" />
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-start">

                        {/* ══════════════════════════════════════════════════
                            CART ITEMS LIST
                        ══════════════════════════════════════════════════ */}
                        <div className="lg:col-span-2 space-y-10">
                            {cartItems.map((item) => {
                                const price = parseFloat(item.prix_unitaire || item.prix || item.price || 0);
                                const name = item.nom_produit || item.name || 'Produit';
                                const img = item.image_url || item.image || null;

                                return (
                                    <div key={item.id} className="flex flex-col sm:flex-row gap-10 p-10 rounded-[3.5rem] bg-card border-4 border-border hover:border-primary/40 transition-all group shadow-premium hover:shadow-premium-lg hover:shadow-primary/5 duration-700 relative overflow-hidden">
                                        <div className="absolute inset-x-0 top-0 h-1 bg-primary/0 group-hover:bg-primary transition-all duration-700"></div>
                                        
                                        {/* Image Container */}
                                        <div className="size-40 sm:size-48 rounded-[2.5rem] bg-background border-4 border-border overflow-hidden shrink-0 shadow-inner group-hover:border-primary/10 transition-colors">
                                            {img
                                                ? <img src={img} alt={name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 mix-blend-luminosity hover:mix-blend-normal" />
                                                : <div className="w-full h-full flex items-center justify-center"><Package className="size-16 text-muted-foreground/10" /></div>
                                            }
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0 flex flex-col justify-between py-2">
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-start gap-6">
                                                    <h3 className="font-black text-foreground text-3xl tracking-tighter group-hover:text-primary transition-colors italic uppercase leading-tight truncate">{name}</h3>
                                                    <button
                                                        onClick={() => handleRemove(item)}
                                                        className="size-12 rounded-[1.5rem] text-muted-foreground/30 hover:text-red-500 hover:bg-red-500/10 flex items-center justify-center transition-all shrink-0 border-2 border-transparent hover:border-red-500/20 shadow-sm active:scale-90"
                                                    >
                                                        <Trash2 className="size-5" />
                                                    </button>
                                                </div>
                                                {item.categorie?.nom_categorie && (
                                                    <span className="text-executive-label font-black text-primary uppercase tracking-[0.4em] italic leading-none inline-flex items-center gap-3">
                                                        <div className="size-2 rounded-full bg-primary" /> {item.categorie.nom_categorie}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between flex-wrap gap-8 mt-10">
                                                {/* Quantity Controls */}
                                                <div className="flex items-center gap-2 bg-background rounded-[1.5rem] p-2 border-4 border-border group-hover:border-primary/10 transition-colors shadow-inner">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        disabled={item.quantity <= 1}
                                                        className="size-12 rounded-[1rem] flex items-center justify-center text-muted-foreground/40 hover:text-primary hover:bg-card transition-all disabled:opacity-20 active:scale-90"
                                                    >
                                                        <Minus className="size-5" />
                                                    </button>
                                                    <span className="w-16 text-center text-xl font-black text-foreground italic drop-shadow-sm">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        disabled={item.stock_quantite && item.quantity >= item.stock_quantite}
                                                        className="size-12 rounded-[1rem] flex items-center justify-center text-muted-foreground/40 hover:text-primary hover:bg-card transition-all disabled:opacity-20 active:scale-90"
                                                    >
                                                        <Plus className="size-5" />
                                                    </button>
                                                </div>

                                                {/* Price */}
                                                <div className="text-right">
                                                    <p className="text-3xl font-black text-foreground tracking-tighter italic drop-shadow-sm">
                                                        {(price * item.quantity).toLocaleString('fr-FR')} <span className="text-xs font-black text-primary not-italic tracking-[0.2em] ml-2">GNF</span>
                                                    </p>
                                                    {item.quantity > 1 && (
                                                        <p className="text-executive-label text-muted-foreground/30 font-black uppercase tracking-[0.3em] mt-3 italic underline decoration-primary/10 decoration-2 underline-offset-4">
                                                            {price.toLocaleString('fr-FR')} GNF / UNITÉ
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Back to catalog link */}
                            <Link to="/catalog" className="inline-flex items-center gap-4 text-primary text-executive-label font-black uppercase tracking-[0.5em] hover:tracking-[0.6em] transition-all py-10 group italic">
                                <ArrowLeft className="size-5 group-hover:-translate-x-4 transition-transform" /> Continuer mes Achats
                            </Link>
                        </div>

                        {/* ══════════════════════════════════════════════════
                            ORDER SUMMARY SIDEBAR
                        ══════════════════════════════════════════════════ */}
                        <div className="sticky top-32">
                            <div className="rounded-[3.5rem] bg-card border-4 border-border overflow-hidden shadow-premium-lg relative">
                                <div className="absolute inset-x-0 top-0 h-2 bg-primary"></div>
                                
                                {/* Header */}
                                <div className="p-10 border-b-4 border-border bg-background/50 backdrop-blur-xl">
                                    <h3 className="text-executive-label font-black uppercase tracking-[0.4em] text-foreground flex items-center gap-4 italic leading-none">
                                        <Tag className="size-5 text-primary" /> Résumé Financier
                                    </h3>
                                </div>

                                {/* Breakdown */}
                                <div className="p-10 space-y-8">
                                    <div className="flex justify-between items-center group/item">
                                        <span className="text-executive-label text-muted-foreground/40 font-black uppercase tracking-[0.3em] italic group-hover/item:text-foreground transition-colors">Sous-total</span>
                                        <span className="font-black text-xl text-foreground italic tracking-tight group-hover/item:text-primary transition-colors">{cartTotal.toLocaleString('fr-FR')} <span className="text-[10px] not-italic text-muted-foreground/20 ml-2">GNF</span></span>
                                    </div>
                                    <div className="flex justify-between items-center group/item">
                                        <span className="text-executive-label text-muted-foreground/40 font-black uppercase tracking-[0.3em] flex items-center gap-4 italic group-hover/item:text-foreground transition-colors">
                                            <Truck className="size-4 text-primary" /> Logistique
                                        </span>
                                        <span className="font-black text-xl text-foreground italic tracking-tight group-hover/item:text-primary transition-colors">{DELIVERY_FEE.toLocaleString('fr-FR')} <span className="text-[10px] not-italic text-muted-foreground/20 ml-2">GNF</span></span>
                                    </div>

                                    <div className="pt-10 border-t-4 border-border">
                                        <div className="flex justify-between items-end">
                                            <span className="text-executive-label font-black uppercase tracking-[0.4em] text-primary italic mb-2">Total Global</span>
                                            <div className="text-right">
                                                <p className="text-5xl font-black tracking-tighter text-foreground italic drop-shadow-xl leading-none">{total.toLocaleString('fr-FR')}</p>
                                                <p className="text-executive-label font-black text-muted-foreground/20 uppercase tracking-[0.4em] mt-4 italic">FRANCS GUINÉENS (GNF)</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* CTA */}
                                <div className="p-10 pt-0 space-y-8">
                                    <Button
                                        onClick={handleCheckout}
                                        className="w-full h-20 rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-xs gap-6 shadow-premium-lg shadow-primary/40 hover:scale-105 active:scale-95 transition-all bg-primary text-white border-4 border-primary group relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                                        <Zap className="size-6 text-white" /> Finaliser l'Acquisition
                                    </Button>
                                    
                                    <div className="flex flex-col gap-6 py-8 px-6 rounded-[2.5rem] bg-background/50 border-4 border-border italic">
                                        <div className="flex items-center justify-between text-executive-label font-black text-muted-foreground/40 uppercase tracking-[0.3em]">
                                            <span className="flex items-center gap-4"><ShieldCheck className="size-4 text-emerald-500" /> SSL Scellé</span>
                                            <span className="flex items-center gap-4"><Truck className="size-4 text-primary" /> Express 48h</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Escrow Trust Banner */}
                            <div className="mt-10 p-10 rounded-[3.5rem] bg-primary/5 border-4 border-primary/20 shadow-premium group hover:bg-primary/10 transition-colors">
                                <p className="text-executive-label font-black text-primary uppercase tracking-[0.5em] mb-4 flex items-center gap-4 italic leading-none group-hover:tracking-[0.6em] transition-all">
                                    <AlertCircle className="size-5 animate-pulse" /> Garantie BCA Guard
                                </p>
                                <p className="text-sm text-primary/60 font-black leading-relaxed italic uppercase tracking-[0.1em]">
                                    Vos fonds sont conservés en séquestre sécurisé par <span className="text-primary underline decoration-primary/30 decoration-2 underline-offset-4">BCA Connect</span> jusqu'à confirmation de réception de vos articles.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ══════════════════════════════════════════════════
                STICKY MOBILE CTA BAR
            ══════════════════════════════════════════════════ */}
            {cartItems.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden p-8 bg-background/90 backdrop-blur-3xl border-t-8 border-border animate-in slide-in-from-bottom-20 duration-700 shadow-premium-lg">
                    <div className="flex items-center justify-between gap-10 max-w-lg mx-auto">
                        <div className="flex flex-col">
                            <span className="text-executive-label font-black text-muted-foreground/40 uppercase tracking-[0.4em] leading-none italic mb-2">Total TTC</span>
                            <span className="text-3xl font-black text-foreground leading-none italic tracking-tighter uppercase">{total.toLocaleString('fr-FR')} <span className="text-[10px] font-black text-primary not-italic tracking-widest ml-2">GNF</span></span>
                        </div>
                        <Button 
                            onClick={handleCheckout}
                            className="flex-1 h-16 rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-[10px] shadow-premium-lg shadow-primary/30 gap-4 active:scale-95 transition-all bg-primary border-4 border-primary"
                        >
                            <Zap className="size-5" /> Commander
                        </Button>
                    </div>
                </div>
            )}
        </PublicLayout>
    );
};

export default CartPage;
