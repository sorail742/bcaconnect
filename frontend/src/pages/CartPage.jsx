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
            <div className="font-inter max-w-7xl mx-auto px-4 md:px-8 py-12 pb-32 space-y-12 animate-in fade-in duration-1000">

                {/* ══════════════════════════════════════════════════
                    EXECUTIVE HEADER
                ══════════════════════════════════════════════════ */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div>
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-3 text-slate-400 hover:text-primary text-[9px] font-black uppercase tracking-[0.3em] transition-colors mb-6 group"
                        >
                            <ArrowLeft className="size-4 group-hover:-translate-x-2 transition-transform" /> Retour au Marché
                        </button>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white italic uppercase leading-none">
                            Votre Panier
                        </h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-3">
                            {cartItems.reduce((a, i) => a + i.quantity, 0)} article{cartItems.reduce((a, i) => a + i.quantity, 0) > 1 ? 's' : ''} — Prêt pour l'expédition
                        </p>
                    </div>
                    {cartItems.length > 0 && (
                        <button
                            onClick={() => { clearCart(); toast.info("Panier vidé."); }}
                            className="text-[9px] font-black text-red-500 hover:bg-red-500/5 px-5 py-2.5 rounded-xl border border-red-500/10 hover:border-red-500/20 uppercase tracking-[0.2em] flex items-center gap-2.5 transition-all"
                        >
                            <Trash2 className="size-3.5" /> Vider le Panier
                        </button>
                    )}
                </div>

                {cartItems.length === 0 ? (
                    /* ══ EMPTY STATE ══ */
                    <div className="py-32 flex flex-col items-center text-center bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-slate-50 dark:border-slate-800 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.05)]">
                        <div className="size-32 rounded-[2rem] bg-slate-50 dark:bg-slate-950 flex items-center justify-center mb-10 border-2 border-slate-100 dark:border-slate-800">
                            <ShoppingCart className="size-12 text-slate-300" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white italic uppercase tracking-tight">Panier Vierge</h2>
                        <p className="text-xs text-slate-400 font-bold mt-4 max-w-sm mx-auto px-4 leading-relaxed italic">
                            Aucun article en attente. Explorez notre catalogue pour constituer votre sélection d'achats groupés BCA.
                        </p>
                        <Link to="/catalog" className="mt-12">
                            <Button size="lg" className="rounded-2xl px-12 h-16 shadow-2xl shadow-primary/20 font-black text-[10px] uppercase tracking-[0.3em]">
                                Explorer le Catalogue
                                <ArrowRight className="size-4 ml-3" />
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">

                        {/* ══════════════════════════════════════════════════
                            CART ITEMS LIST
                        ══════════════════════════════════════════════════ */}
                        <div className="lg:col-span-2 space-y-6">
                            {cartItems.map((item) => {
                                const price = parseFloat(item.prix_unitaire || item.prix || item.price || 0);
                                const name = item.nom_produit || item.name || 'Produit';
                                const img = item.image_url || item.image || null;

                                return (
                                    <div key={item.id} className="flex gap-6 p-6 rounded-[2rem] bg-white dark:bg-slate-900 border-2 border-slate-50 dark:border-slate-800 hover:border-primary/20 transition-all group shadow-sm hover:shadow-xl hover:shadow-primary/5 duration-500">
                                        {/* Image */}
                                        <div className="size-28 sm:size-36 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 overflow-hidden shrink-0">
                                            {img
                                                ? <img src={img} alt={name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                : <div className="w-full h-full flex items-center justify-center"><Package className="size-12 text-slate-200" /></div>
                                            }
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                                            <div>
                                                <h3 className="font-black text-slate-900 dark:text-white text-lg tracking-tight group-hover:text-primary transition-colors italic truncate">{name}</h3>
                                                {item.categorie?.nom_categorie && (
                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2 inline-block">
                                                        {item.categorie.nom_categorie}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between flex-wrap gap-4 mt-5">
                                                {/* Quantity Controls */}
                                                <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 rounded-xl p-1.5 border border-slate-100 dark:border-slate-700">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        disabled={item.quantity <= 1}
                                                        className="size-9 rounded-lg flex items-center justify-center text-slate-500 hover:text-primary hover:bg-white dark:hover:bg-slate-700 transition-all disabled:opacity-30"
                                                    >
                                                        <Minus className="size-4" />
                                                    </button>
                                                    <span className="w-12 text-center text-sm font-black text-slate-900 dark:text-white italic">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        disabled={item.stock_quantite && item.quantity >= item.stock_quantite}
                                                        className="size-9 rounded-lg flex items-center justify-center text-slate-500 hover:text-primary hover:bg-white dark:hover:bg-slate-700 transition-all disabled:opacity-30"
                                                    >
                                                        <Plus className="size-4" />
                                                    </button>
                                                </div>

                                                {/* Price */}
                                                <div className="text-right">
                                                    <p className="text-xl font-black text-slate-900 dark:text-white tracking-tighter italic">
                                                        {(price * item.quantity).toLocaleString('fr-FR')} <span className="text-[9px] font-bold text-primary not-italic tracking-widest">GNF</span>
                                                    </p>
                                                    {item.quantity > 1 && (
                                                        <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mt-1">
                                                            {price.toLocaleString('fr-FR')} GNF / unité
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Remove */}
                                        <button
                                            onClick={() => handleRemove(item)}
                                            className="size-10 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-500/5 flex items-center justify-center transition-all shrink-0 self-start mt-1 border border-transparent hover:border-red-500/10"
                                        >
                                            <Trash2 className="size-4" />
                                        </button>
                                    </div>
                                );
                            })}

                            {/* Back to catalog link */}
                            <Link to="/catalog" className="inline-flex items-center gap-3 text-primary text-[9px] font-black uppercase tracking-[0.3em] hover:underline transition-all py-6 group">
                                <ArrowLeft className="size-4 group-hover:-translate-x-2 transition-transform" /> Continuer mes Achats
                            </Link>
                        </div>

                        {/* ══════════════════════════════════════════════════
                            ORDER SUMMARY SIDEBAR
                        ══════════════════════════════════════════════════ */}
                        <div className="sticky top-24">
                            <div className="rounded-[2.5rem] bg-white dark:bg-slate-900 border-2 border-slate-50 dark:border-slate-800 overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none">
                                {/* Header */}
                                <div className="p-8 border-b-2 border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-900 dark:text-white flex items-center gap-3">
                                        <Tag className="size-4 text-primary" /> Résumé Financier
                                    </h3>
                                </div>

                                {/* Breakdown */}
                                <div className="p-8 space-y-5">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Sous-total</span>
                                        <span className="font-black text-sm text-slate-900 dark:text-white italic tracking-tight">{cartTotal.toLocaleString('fr-FR')} GNF</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-2">
                                            <Truck className="size-3.5" /> Logistique
                                        </span>
                                        <span className="font-black text-sm text-slate-900 dark:text-white italic tracking-tight">{DELIVERY_FEE.toLocaleString('fr-FR')} GNF</span>
                                    </div>

                                    <div className="pt-6 border-t-2 border-slate-50 dark:border-slate-800">
                                        <div className="flex justify-between items-end">
                                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Engagement Total</span>
                                            <div className="text-right">
                                                <p className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white italic">{total.toLocaleString('fr-FR')}</p>
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Francs Guinéens</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* CTA */}
                                <div className="p-8 pt-0 space-y-6">
                                    <Button
                                        onClick={handleCheckout}
                                        className="w-full h-16 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] gap-3 shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                    >
                                        <Zap className="size-5" /> Finaliser la Commande
                                    </Button>
                                    <div className="flex items-center justify-center gap-6 py-5 text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] border-t-2 border-slate-50 dark:border-slate-800">
                                        <span className="flex items-center gap-2"><ShieldCheck className="size-3.5 text-emerald-500" /> SSL Scellé</span>
                                        <span className="flex items-center gap-2"><Truck className="size-3.5 text-primary" /> Express 48h</span>
                                    </div>
                                </div>
                            </div>

                            {/* Escrow Trust Banner */}
                            <div className="mt-8 p-8 rounded-[2rem] bg-primary/5 border-2 border-primary/10">
                                <p className="text-[9px] font-black text-primary uppercase tracking-[0.3em] mb-3 flex items-center gap-2.5">
                                    <AlertCircle className="size-3.5" /> Garantie BCA Guard
                                </p>
                                <p className="text-[10px] text-primary/70 font-bold leading-relaxed italic">
                                    Vos fonds sont conservés en séquestre sécurisé par BCA Connect jusqu'à confirmation de réception de vos articles.
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
                <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden p-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-t-2 border-slate-100 dark:border-slate-800 animate-in slide-in-from-bottom duration-500">
                    <div className="flex items-center justify-between gap-6 max-w-lg mx-auto">
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none">Total TTC</span>
                            <span className="text-xl font-black text-slate-900 dark:text-white mt-1.5 leading-none italic tracking-tight">{total.toLocaleString('fr-FR')} <span className="text-[9px] font-bold text-primary not-italic tracking-widest">GNF</span></span>
                        </div>
                        <Button 
                            onClick={handleCheckout}
                            className="flex-1 h-14 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-primary/20 gap-2 active:scale-[0.97] transition-all"
                        >
                            <Zap className="size-4" /> Commander
                        </Button>
                    </div>
                </div>
            )}
        </PublicLayout>
    );
};

export default CartPage;
