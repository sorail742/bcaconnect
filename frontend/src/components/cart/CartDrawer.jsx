import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Minus, Plus } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { cn } from '../../lib/utils';
import Button from '../ui/Button';

export function CartDrawer({ isOpen, onClose }) {
    const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();

    return (
        <>
            {/* Backdrop */}
            <div 
                className={cn(
                    "fixed inset-0 bg-background/60 backdrop-blur-sm z-[100] transition-opacity duration-300",
                    isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            {/* Drawer */}
            <div 
                className={cn(
                    "fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white dark:bg-[#0F1219] z-[101] shadow-2xl transition-transform duration-500 ease-out flex flex-col",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-8 border-b border-slate-100 dark:border-foreground/5">
                    <div className="flex items-center gap-4">
                        <div className="size-12 rounded-xl bg-[#FF6600]/10 flex items-center justify-center text-[#FF6600]">
                            <ShoppingBag className="size-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 dark:text-foreground tracking-tight">Votre Panier</h2>
                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">{cartItems.length} Articles</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="size-10 rounded-full hover:bg-slate-100 dark:hover:bg-foreground/5 flex items-center justify-center text-muted-foreground/80 hover:text-slate-900 dark:hover:text-foreground transition-all">
                        <X className="size-6" />
                    </button>
                </div>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-thin">
                    {cartItems.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            <div className="size-20 rounded-full bg-slate-50 dark:bg-white/[0.03] flex items-center justify-center mb-6">
                                <ShoppingBag className="size-10 text-slate-200 dark:text-foreground/10" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-foreground mb-2">Votre panier est vide</h3>
                            <p className="text-muted-foreground dark:text-muted-foreground/80 text-sm max-w-xs mx-auto mb-8 font-medium">Découvrez nos produits exceptionnels et commencez vos achats dès maintenant.</p>
                            <Button onClick={onClose} className="bg-[#FF6600] px-8 rounded-full shadow-lg shadow-[#FF6600]/20">Explorer le catalogue</Button>
                        </div>
                    ) : (
                        cartItems.map((item) => (
                            <div key={item.id} className="flex gap-6 group animate-in slide-in-from-right-4 duration-300">
                                <div className="size-16 rounded-2xl overflow-hidden bg-slate-50 dark:bg-foreground/5 border border-slate-100 dark:border-foreground/5 shrink-0">
                                    <img src={item.image || '/placeholder-product.jpg'} alt={item.nom} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <div className="flex-1 flex flex-col justify-between py-1">
                                    <div>
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="text-base font-black text-slate-900 dark:text-foreground tracking-tight leading-tight">{item.nom}</h4>
                                            <button onClick={() => removeFromCart(item.id)} className="text-muted-foreground/80 hover:text-red-500 transition-colors p-1 translate-x-2">
                                                <Trash2 className="size-4" />
                                            </button>
                                        </div>
                                        <p className="text-xs text-muted-foreground font-bold mb-3 uppercase tracking-widest">{item.categorie || 'Multiservice'}</p>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center bg-slate-100 dark:bg-foreground/5 rounded-lg p-1 border border-slate-200 dark:border-foreground/5">
                                            <button 
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="size-8 flex items-center justify-center text-slate-600 dark:text-muted-foreground/80 hover:text-slate-900 dark:hover:text-foreground transition-all"
                                            >
                                                <Minus className="size-3" />
                                            </button>
                                            <span className="w-10 text-center text-xs font-black text-slate-900 dark:text-foreground">{item.quantity}</span>
                                            <button 
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="size-8 flex items-center justify-center text-slate-600 dark:text-muted-foreground/80 hover:text-slate-900 dark:hover:text-foreground transition-all"
                                            >
                                                <Plus className="size-3" />
                                            </button>
                                        </div>
                                        <p className="text-base font-black text-[#FF6600] tracking-tight">{(item.prix * item.quantity).toLocaleString()} GNF</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {cartItems.length > 0 && (
                    <div className="p-8 border-t border-slate-100 dark:border-foreground/5 bg-slate-50/50 dark:bg-white/[0.02]">
                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground font-bold uppercase tracking-widest">Sous-total</span>
                                <span className="font-black text-slate-900 dark:text-foreground">{cartTotal.toLocaleString()} GNF</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground font-bold uppercase tracking-widest">Livraison</span>
                                <span className="font-black text-emerald-500 uppercase tracking-widest">Calculé à l'étape suivante</span>
                            </div>
                            <div className="pt-4 border-t border-slate-200 dark:border-foreground/10 flex justify-between items-center">
                                <span className="text-lg font-black text-slate-900 dark:text-foreground tracking-tight">Total estimé</span>
                                <span className="text-2xl font-black text-[#FF6600] tracking-tight">{cartTotal.toLocaleString()} GNF</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            <Button className="w-full h-16 rounded-2xl bg-[#FF6600] text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-[#FF6600]/20 group">
                                <span className="flex items-center gap-3">
                                    Commander maintenant
                                    <ArrowRight className="size-4 group-hover:translate-x-2 transition-transform" />
                                </span>
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
