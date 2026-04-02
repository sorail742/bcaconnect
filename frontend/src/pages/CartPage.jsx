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
    const total = (cartTotal || 0) + DELIVERY_FEE;

    const handleRemove = (item) => {
        removeFromCart(item.id);
        toast.info(`"${item.nom_produit}" retiré de la session.`);
    };

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            toast.error("Votre session d'acquisition est vide.");
            return;
        }
        navigate('/checkout');
    };

    return (
        <PublicLayout>
            <div className="bg-[#0A0D14] min-h-screen text-white font-inter pb-40">
                <div className="max-w-7xl mx-auto px-6 md:px-12 pt-32 space-y-20 animate-in fade-in duration-1000">

                    {/* ══════════════════════════════════════════════════
                        EXECUTIVE HEADER
                    ══════════════════════════════════════════════════ */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
                        <div className="space-y-8">
                            <button
                                onClick={() => navigate(-1)}
                                className="flex items-center gap-4 text-slate-500 hover:text-[#FF6600] text-[10px] font-black uppercase tracking-[0.5em] transition-all group italic"
                            >
                                <ArrowLeft className="size-4 group-hover:-translate-x-2 transition-transform" /> RETOUR AU CATALOGUE
                            </button>
                            <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-white italic uppercase leading-[0.8]">
                                VOTRE <span className="text-[#FF6600] not-italic">HUB.</span>
                            </h1>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic flex items-center gap-4">
                                <div className="size-2 rounded-full bg-[#FF6600] animate-pulse" />
                                {cartItems.reduce((a, i) => a + i.quantity, 0)} ACTIF{cartItems.reduce((a, i) => a + i.quantity, 0) > 1 ? 'S' : ''} SUR LE TERMINAL
                            </p>
                        </div>
                        {cartItems.length > 0 && (
                            <button
                                onClick={() => { clearCart(); toast.info("Terminal réinitialisé."); }}
                                className="text-[10px] font-black text-red-500 hover:bg-red-500/10 px-8 py-5 rounded-2xl border-2 border-red-500/20 hover:border-red-500/40 uppercase tracking-[0.3em] flex items-center gap-4 transition-all hover:scale-105 active:scale-95 italic"
                            >
                                <Trash2 className="size-4" /> RÉINITIALISER LE PANIER
                            </button>
                        )}
                    </div>

                    {cartItems.length === 0 ? (
                        /* ══ EMPTY STATE ══ */
                        <div className="py-48 flex flex-col items-center text-center bg-white/[0.02] rounded-[4rem] border-4 border-white/5 shadow-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#FF6600]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-[2s]" />
                            <div className="size-40 rounded-[3rem] bg-white/5 flex items-center justify-center mb-12 border-4 border-white/5 shadow-inner relative z-10 group-hover:rotate-12 transition-transform duration-1000">
                                <ShoppingCart className="size-16 text-slate-800" />
                            </div>
                            <div className="space-y-6 relative z-10">
                                <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter">Terminal Vierge</h2>
                                <p className="text-xs text-slate-500 font-bold max-w-sm mx-auto leading-relaxed italic uppercase tracking-[0.3em] border-l-8 border-[#FF6600]/20 pl-8 text-left">
                                    Aucun actif en attente de validation. Explorez notre catalogue pour constituer votre portefeuille de commandes.
                                </p>
                            </div>
                            <Link to="/marketplace" className="mt-20 relative z-10">
                                <Button className="rounded-2xl px-16 h-20 shadow-2xl shadow-[#FF6600]/30 font-black text-xs uppercase tracking-[0.4em] gap-6 bg-[#FF6600] hover:bg-[#FF6600] border-4 border-[#FF6600] hover:scale-110 transition-all italic">
                                    OUVRIR LE CATALOGUE
                                    <ArrowRight className="size-6 transition-transform" />
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

                            {/* ══════════════════════════════════════════════════
                                CART ITEMS LIST
                            ══════════════════════════════════════════════════ */}
                            <div className="lg:col-span-8 space-y-8">
                                {cartItems.map((item) => {
                                    const price = parseFloat(item.prix_unitaire || item.prix || item.price || 0);
                                    const name = item.nom_produit || item.name || 'PRODUIT ALPHA';
                                    const img = item.image_url || item.image || null;

                                    return (
                                        <div key={item.id} className="flex flex-col sm:flex-row gap-10 p-10 rounded-[3.5rem] bg-white/[0.02] border-4 border-white/5 hover:border-[#FF6600]/40 transition-all group shadow-2xl duration-700 relative overflow-hidden">
                                            <div className="absolute inset-x-0 top-0 h-1 bg-[#FF6600]/0 group-hover:bg-[#FF6600] transition-all duration-700" />

                                            {/* Image Container */}
                                            <div className="size-48 rounded-[2.5rem] bg-[#0F1219] border-4 border-white/5 overflow-hidden shrink-0 shadow-inner group-hover:border-[#FF6600]/20 transition-all duration-700">
                                                {img
                                                    ? <img src={img} alt={name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s] mix-blend-luminosity hover:mix-blend-normal" />
                                                    : <div className="w-full h-full flex items-center justify-center"><Package className="size-16 text-slate-800" /></div>
                                                }
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0 flex flex-col justify-between py-2">
                                                <div className="space-y-6">
                                                    <div className="flex justify-between items-start gap-8">
                                                        <h3 className="font-black text-white text-4xl tracking-tighter group-hover:text-[#FF6600] transition-colors italic uppercase leading-[0.8]">{name}</h3>
                                                        <button
                                                            onClick={() => handleRemove(item)}
                                                            className="size-14 rounded-2xl text-slate-700 hover:text-red-500 hover:bg-red-500/10 flex items-center justify-center transition-all shrink-0 border-4 border-transparent hover:border-red-500/20 active:scale-90"
                                                        >
                                                            <Trash2 className="size-6" />
                                                        </button>
                                                    </div>
                                                    {item.categorie?.nom_categorie && (
                                                        <span className="text-[10px] font-black text-[#FF6600] uppercase tracking-[0.4em] italic leading-none inline-flex items-center gap-4">
                                                            <div className="size-2 rounded-full bg-[#FF6600]" /> {item.categorie.nom_categorie}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between flex-wrap gap-10 mt-12">
                                                    {/* Quantity Controls */}
                                                    <div className="flex items-center gap-3 bg-white/[0.02] rounded-2xl p-2 border-4 border-white/5 group-hover:border-[#FF6600]/20 transition-colors shadow-inner">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                            disabled={item.quantity <= 1}
                                                            className="size-12 rounded-xl flex items-center justify-center text-slate-500 hover:text-[#FF6600] hover:bg-white/5 transition-all disabled:opacity-10 active:scale-90"
                                                        >
                                                            <Minus className="size-5" />
                                                        </button>
                                                        <span className="w-16 text-center text-2xl font-black text-white italic">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            className="size-12 rounded-xl flex items-center justify-center text-slate-500 hover:text-[#FF6600] hover:bg-white/5 transition-all active:scale-90"
                                                        >
                                                            <Plus className="size-5" />
                                                        </button>
                                                    </div>

                                                    {/* Price */}
                                                    <div className="text-right">
                                                        <p className="text-4xl font-black text-white tracking-tighter italic leading-none">
                                                            {(price * item.quantity).toLocaleString('fr-FR')} <span className="text-[10px] font-black text-[#FF6600] not-italic tracking-[0.2em] ml-2">GNF</span>
                                                        </p>
                                                        {item.quantity > 1 && (
                                                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.3em] mt-3 italic underline decoration-[#FF6600]/20 decoration-2 underline-offset-4">
                                                                {price.toLocaleString('fr-FR')} GNF / UNITÉ
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                <Link to="/marketplace" className="inline-flex items-center gap-6 text-[#FF6600] text-[11px] font-black uppercase tracking-[0.5em] hover:tracking-[0.6em] transition-all py-12 group italic">
                                    <ArrowLeft className="size-5 group-hover:-translate-x-4 transition-transform" /> POURSUIVRE L'INVENTAIRE
                                </Link>
                            </div>

                            {/* ══════════════════════════════════════════════════
                                ORDER SUMMARY SIDEBAR
                            ══════════════════════════════════════════════════ */}
                            <div className="lg:col-span-4 sticky top-32">
                                <div className="rounded-[4rem] bg-white/[0.02] border-4 border-white/5 overflow-hidden shadow-2xl relative">
                                    <div className="absolute inset-x-0 top-0 h-2 bg-[#FF6600]"></div>

                                    {/* Header */}
                                    <div className="p-10 border-b-4 border-white/5 bg-white/[0.01] backdrop-blur-3xl">
                                        <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-white flex items-center gap-6 italic leading-none">
                                            <Tag className="size-5 text-[#FF6600]" /> RÉSUMÉ FINANCIER
                                        </h3>
                                    </div>

                                    {/* Breakdown */}
                                    <div className="p-10 space-y-10">
                                        <div className="flex justify-between items-center group/item">
                                            <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] italic group-hover/item:text-white transition-colors">SOUS-TOTAL D'ACTIFS</span>
                                            <span className="font-black text-2xl text-white italic tracking-tighter group-hover/item:text-[#FF6600] transition-colors">{cartTotal.toLocaleString('fr-FR')}<span className="text-[10px] font-black text-slate-700 ml-2">GNF</span></span>
                                        </div>
                                        <div className="flex justify-between items-center group/item">
                                            <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] flex items-center gap-5 italic group-hover/item:text-white transition-colors">
                                                <Truck className="size-5 text-[#FF6600]" /> LOGISTIQUE EXPRESS
                                            </span>
                                            <span className="font-black text-2xl text-white italic tracking-tighter group-hover/item:text-[#FF6600] transition-colors">{DELIVERY_FEE.toLocaleString('fr-FR')}<span className="text-[10px] font-black text-slate-700 ml-2">GNF</span></span>
                                        </div>

                                        <div className="pt-12 border-t-4 border-white/5">
                                            <div className="flex flex-col gap-4">
                                                <span className="text-[11px] font-black uppercase tracking-[0.5em] text-[#FF6600] italic leading-none">TOTAL GLOBAL TTC</span>
                                                <div className="flex items-end justify-between">
                                                    <div className="space-y-1">
                                                        <p className="text-6xl font-black tracking-tighter text-white italic leading-none">{total.toLocaleString('fr-FR')}</p>
                                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] italic">FRANCS GUINÉENS (GNF)</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* CTA */}
                                    <div className="p-10 pt-0 space-y-10">
                                        <Button
                                            onClick={handleCheckout}
                                            className="w-full h-24 rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-xs gap-8 shadow-2xl shadow-[#FF6600]/40 hover:scale-105 active:scale-95 transition-all bg-[#FF6600] hover:bg-[#FF6600] text-white border-4 border-[#FF6600] group relative overflow-hidden italic"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                                            <Zap className="size-7 text-white" /> FINALISER L'ACQUISITION
                                        </Button>

                                        <div className="py-8 px-10 rounded-[3rem] bg-white/[0.02] border-4 border-white/5 flex flex-col gap-6">
                                            <div className="flex items-center justify-between text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] italic">
                                                <span className="flex items-center gap-4"><ShieldCheck className="size-4 text-emerald-500" /> SÉCURITÉ SSL</span>
                                                <span className="flex items-center gap-4"><Truck className="size-4 text-[#FF6600]" /> EXPRESS 24H</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Trust Section */}
                                <div className="mt-12 p-10 rounded-[4rem] bg-white/[0.02] border-4 border-white/5 shadow-2xl group hover:border-[#FF6600]/20 transition-all">
                                    <p className="text-[11px] font-black text-[#FF6600] uppercase tracking-[0.5em] mb-6 flex items-center gap-5 italic leading-none group-hover:tracking-[0.6em] transition-all">
                                        <AlertCircle className="size-6 animate-pulse" /> GARANTIE BCA GUARD
                                    </p>
                                    <p className="text-xs text-slate-500 font-black leading-relaxed italic uppercase tracking-[0.1em]">
                                        VOS FONDS SONT SÉQUESTRÉS PAR LE PROTOCOLE <span className="text-white underline decoration-[#FF6600]/40 decoration-2 underline-offset-4">BCA CONNECT</span> JUSQU'À RÉCEPTION CONFORME DES ACTIFS.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ══════════════════════════════════════════════════
                STICKY MOBILE CTA BAR
            ══════════════════════════════════════════════════ */}
            {cartItems.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden p-8 bg-[#0D1016]/95 backdrop-blur-3xl border-t-8 border-white/5 animate-in slide-in-from-bottom-20 duration-700 shadow-2xl">
                    <div className="flex items-center justify-between gap-10 max-w-lg mx-auto">
                        <div className="flex flex-col gap-2">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] leading-none italic">TOTAL TTC</span>
                            <span className="text-4xl font-black text-white leading-none italic tracking-tighter">{total.toLocaleString('fr-FR')} <span className="text-[10px] font-black text-[#FF6600] not-italic tracking-widest ml-2">GNF</span></span>
                        </div>
                        <Button
                            onClick={handleCheckout}
                            className="flex-1 h-20 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl shadow-[#FF6600]/30 gap-6 active:scale-95 transition-all bg-[#FF6600] border-4 border-[#FF6600] italic"
                        >
                            <Zap className="size-5" /> COMMANDER
                        </Button>
                    </div>
                </div>
            )}
        </PublicLayout>
    );
};

export default CartPage;
