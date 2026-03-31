import React, { useState, useEffect } from 'react';
import PublicLayout from '../components/layout/PublicLayout';
import {
    Truck,
    CreditCard,
    Smartphone,
    Wallet,
    ShieldCheck,
    Lock,
    ShoppingBag,
    CheckCircle2
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { cn } from '../lib/utils';
import { useCart } from '../context/CartContext';
import { useAuth } from '../hooks/useAuth';
import orderService from '../services/orderService';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import walletService from '../services/walletService';
import { offlineStorage } from '../lib/db';
import { toast } from 'sonner';

const Checkout = () => {
    const { cartItems, cartTotal, clearCart } = useCart();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [paymentMethod, setPaymentMethod] = useState('wallet');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [wallet, setWallet] = useState(null);
    const [showMobileDetails, setShowMobileDetails] = useState(false);
    const [formData, setFormData] = useState({
        nom: user?.nom_complet || '',
        telephone: user?.telephone || '',
        adresse: user?.adresse || ''
    });
    const [touched, setTouched] = useState({});

    const deliveryFee = 50000;
    const total = cartTotal + deliveryFee;

    useEffect(() => {
        if (cartItems.length === 0 && !isSuccess) {
            navigate('/cart');
        }
    }, [cartItems, navigate, isSuccess]);

    useEffect(() => {
        const fetchWallet = async () => {
            try {
                const data = await walletService.getMyWallet();
                setWallet(data);
            } catch (error) {
                console.error("Erreur chargement portefeuille:", error);
            }
        };
        fetchWallet();
    }, []);

    const handleSubmit = async () => {
        if (!formData.nom || !formData.telephone || !formData.adresse) {
            toast.error("Veuillez remplir toutes les informations de livraison.");
            return;
        }

        if (paymentMethod === 'wallet' && wallet && parseFloat(wallet.solde_virtuel) < total) {
            toast.error("Solde insuffisant dans votre portefeuille BCA Connect.");
            navigate('/wallet');
            return;
        }

        if (cartItems.length === 0) {
            toast.error("Votre panier est vide.");
            return;
        }

        setIsSubmitting(true);
        const orderData = {
            items: cartItems.map(item => ({
                id: item.id,
                productId: item.id,
                quantity: item.quantity,
                nom: item.nom_produit,
                prix: item.prix
            })),
            deliveryInfo: formData,
            paymentMethod,
            total_ttc: total
        };

        if (!navigator.onLine) {
            try {
                await offlineStorage.queueOrder(orderData);
                setIsSuccess(true);
                clearCart();
                toast.success("Commande enregistrée hors-ligne !");
                setTimeout(() => navigate('/orders'), 3000);
            } catch (err) {
                console.error("Erreur stockage offline:", err);
                toast.error("Impossible d'enregistrer la commande hors-ligne.");
            } finally {
                setIsSubmitting(false);
            }
            return;
        }

        try {
            await orderService.createOrder(orderData);
            setIsSuccess(true);
            clearCart();
            setTimeout(() => navigate('/orders'), 3000);
        } catch (err) {
            console.error("Erreur commande:", err);
            toast.error(err.response?.data?.message || "Une erreur est survenue lors de la validation.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <PublicLayout>
                <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6 py-20 animate-in fade-in duration-1000">
                    <div className="size-32 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-12 border-4 border-emerald-500/20 shadow-premium animate-in zoom-in duration-700">
                        <CheckCircle2 className="size-16" />
                    </div>
                    <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-foreground italic uppercase leading-tight drop-shadow-sm">
                        Acquisition <span className="text-emerald-500 not-italic underline decoration-emerald-500/10 decoration-8 underline-offset-4">Confirmée.</span>
                    </h2>
                    <p className="text-muted-foreground/60 text-lg font-bold mt-8 max-w-xl mx-auto leading-loose italic uppercase tracking-widest border-l-8 border-emerald-500/20 pl-10">
                        Votre commande a été scellée avec succès. Une notification de confirmation a été transmise au centre logistique. Redirection vers votre registre d'ordres...
                    </p>
                    <div className="mt-16 flex flex-col sm:flex-row gap-8">
                        <Button onClick={() => navigate('/orders')} variant="outline" className="h-20 px-12 rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-xs border-4 border-border hover:border-primary/40 hover:scale-105 transition-all active:scale-95 italic">
                            Accéder au Registre
                        </Button>
                        <Button onClick={() => navigate('/catalog')} className="h-20 px-12 rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-xs shadow-premium-lg shadow-primary/20 hover:scale-110 transition-all active:scale-95 border-4 border-primary">
                            Nouvelle Acquisition
                        </Button>
                    </div>
                </div>
            </PublicLayout>
        );
    }

    return (
        <PublicLayout>
            <div className="max-w-7xl mx-auto space-y-16 animate-in fade-in duration-1000 font-inter pb-40 px-6 md:px-12 pt-20 relative">
                
                {/* ══════════════════════════════════════════════════
                    EXECUTIVE HEADER & STEPPER
                ══════════════════════════════════════════════════ */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 border-b-8 border-border pb-16 relative">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="size-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.4)]" />
                            <span className="text-executive-label font-black text-emerald-500 uppercase tracking-[0.5em] italic leading-none">Protocole Sécurisé SSL v4.0</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black text-foreground tracking-tighter italic uppercase leading-[0.85] drop-shadow-2xl">
                            Validation <br /> <span className="text-primary not-italic underline decoration-primary/10 decoration-8 underline-offset-[-4px]">Finale.</span>
                        </h1>
                        <p className="text-muted-foreground/40 text-sm font-black uppercase tracking-[0.3em] max-w-lg italic border-l-4 border-primary/20 pl-6">Vérifiez vos paramètres de réception et activez votre mode de règlement préféré.</p>
                    </div>

                    {/* Premium Executive Stepper */}
                    <div className="flex items-center gap-6 bg-card p-4 rounded-[3rem] border-4 border-border shadow-inner backdrop-blur-3xl">
                        {[
                            { step: 1, label: 'Livraison', active: true },
                            { step: 2, label: 'Paiement', active: false },
                            { step: 3, label: 'Accord', active: false }
                        ].map((s, i) => (
                            <div key={i} className="flex items-center gap-6">
                                <div className={cn(
                                    "flex items-center gap-6 px-8 py-4 rounded-[2rem] transition-all duration-700 relative overflow-hidden group/step",
                                    s.active 
                                        ? "bg-primary text-white shadow-premium-lg shadow-primary/30 scale-105 border-2 border-primary/20" 
                                        : "text-muted-foreground/20 italic"
                                )}>
                                    {s.active && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/step:animate-[shimmer_2s_infinite]" />}
                                    <span className="text-lg font-black italic leading-none">{s.step}</span>
                                    <span className="text-executive-label font-black uppercase tracking-[0.3em] leading-none pt-0.5">{s.label}</span>
                                </div>
                                {i < 2 && <div className="w-12 h-1 bg-border rounded-full" />}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mobile Floating Recap (High Contrast Executive) */}
                <div className="lg:hidden sticky top-24 z-50">
                    <button 
                         onClick={() => setShowMobileDetails(!showMobileDetails)}
                         className="w-full flex items-center justify-between p-8 rounded-[3rem] bg-foreground text-background shadow-premium-lg border-4 border-primary/20 active:scale-95 transition-all overflow-hidden relative group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent group-hover:via-primary/5 transition-all duration-1000" />
                        <div className="flex items-center gap-6 relative z-10">
                            <div className="size-16 rounded-[1.5rem] bg-primary flex items-center justify-center shadow-lg border-2 border-white/10">
                                <ShoppingBag className="size-8 text-white" />
                            </div>
                            <div className="text-left">
                                <p className="text-executive-label font-black text-primary uppercase tracking-[0.4em] italic mb-1">Panier Élite</p>
                                <p className="text-3xl font-black italic tracking-tighter leading-none">{total.toLocaleString('fr-FR')} <span className="text-[10px] not-italic text-muted-foreground/40 uppercase tracking-widest ml-2">GNF</span></p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-background/5 py-3 px-6 rounded-full border border-background/10 backdrop-blur-md relative z-10">
                             <span className="text-executive-label font-black uppercase tracking-widest leading-none pt-0.5">{showMobileDetails ? 'Fermer' : 'Détails'}</span>
                             {showMobileDetails ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                        </div>
                    </button>
                    
                    {showMobileDetails && (
                        <div className="absolute top-full left-0 right-0 mt-6 p-10 rounded-[3.5rem] border-4 border-border bg-card/95 backdrop-blur-3xl shadow-premium-lg animate-in slide-in-from-top-6 duration-700">
                            <div className="space-y-8">
                                {cartItems.map(item => (
                                    <div key={item.id} className="flex justify-between items-center group/item">
                                        <div className="flex flex-col">
                                            <span className="text-lg font-black text-foreground italic tracking-tight truncate max-w-[200px] uppercase leading-none">{item.nom_produit}</span>
                                            <span className="text-executive-label font-black text-muted-foreground/30 uppercase tracking-widest mt-2 italic">Unité x {item.quantity}</span>
                                        </div>
                                        <span className="font-black text-foreground italic text-xl tracking-tighter">
                                            {(parseFloat(item.prix || 0) * item.quantity).toLocaleString('fr-FR')} <span className="text-[10px] not-italic text-primary ml-2 uppercase">GNF</span>
                                        </span>
                                    </div>
                                ))}
                                <div className="pt-8 border-t-4 border-border flex justify-between items-end">
                                    <span className="text-executive-label font-black uppercase tracking-[0.4em] text-primary italic mb-2">Total TTC</span>
                                    <span className="text-4xl font-black text-foreground italic tracking-tighter leading-none uppercase">{total.toLocaleString('fr-FR')} <span className="text-[10px] not-italic text-muted-foreground/20 uppercase tracking-widest ml-2">GNF</span></span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                    {/* Left Column: Forms and Payment */}
                    <div className="lg:col-span-8 flex flex-col gap-16">
                        {/* Section: Livraison (Executive Card) */}
                        <div className="rounded-[4rem] border-4 border-border bg-card overflow-hidden shadow-premium hover:shadow-premium-lg transition-all duration-700 relative group/card">
                            <div className="absolute top-0 right-0 size-64 bg-primary/5 rounded-full blur-[120px] -mr-32 -mt-32 group-hover/card:bg-primary/10 transition-colors duration-1000" />
                            <div className="absolute inset-x-0 top-0 h-1 bg-primary/0 group-hover/card:bg-primary transition-all duration-700"></div>
                            
                            <div className="p-10 border-b-4 border-border bg-background/40 backdrop-blur-xl flex items-center justify-between">
                                <div className="flex items-center gap-8">
                                    <div className="size-20 rounded-[1.5rem] bg-card border-4 border-border flex items-center justify-center text-primary shadow-inner group-hover/card:scale-110 group-hover/card:border-primary/20 transition-all duration-700">
                                        <Truck className="size-10" />
                                    </div>
                                    <div>
                                         <h3 className="text-3xl font-black italic tracking-tighter text-foreground uppercase leading-tight">Logistique de Réception</h3>
                                         <p className="text-executive-label font-black text-muted-foreground/30 uppercase tracking-[0.4em] mt-2 italic">Phase I: Localisation de Livraison</p>
                                    </div>
                                </div>
                                <div className="hidden sm:flex items-center gap-4 px-6 py-3 bg-emerald-500/10 rounded-full border-2 border-emerald-500/20 italic">
                                    <Lock className="size-4 text-emerald-500" />
                                    <span className="text-executive-label font-black text-emerald-500 uppercase tracking-widest leading-none pt-0.5">Scellé Cryptographique</span>
                                </div>
                            </div>

                            <div className="p-12 grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center ml-2">
                                        <label className="text-executive-label font-black text-muted-foreground/40 uppercase tracking-[0.3em] italic">Destinataire Officiel</label>
                                        {touched.nom && !formData.nom && <span className="text-[10px] font-black text-destructive uppercase tracking-widest animate-pulse leading-none italic pb-1">Protocole Requis</span>}
                                    </div>
                                    <Input
                                        className={cn("h-18 rounded-[1.5rem] border-4 border-border bg-background focus:border-primary/50 focus:ring-8 focus:ring-primary/5 text-base font-black italic shadow-inner transition-all px-8 placeholder:text-muted-foreground/20 uppercase tracking-widest", touched.nom && !formData.nom && "border-destructive bg-destructive/5")}
                                        placeholder="EX: ELHADJ MAMADOU DIALLO"
                                        value={formData.nom}
                                        onBlur={() => setTouched(prev => ({ ...prev, nom: true }))}
                                        onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center ml-2">
                                        <label className="text-executive-label font-black text-muted-foreground/40 uppercase tracking-[0.3em] italic">Liaison GSM Directe</label>
                                        {touched.telephone && !formData.telephone && <span className="text-[10px] font-black text-destructive uppercase tracking-widest animate-pulse leading-none italic pb-1">Canal Requis</span>}
                                    </div>
                                    <Input
                                        className={cn("h-18 rounded-[1.5rem] border-4 border-border bg-background focus:border-primary/50 focus:ring-8 focus:ring-primary/5 text-base font-black italic shadow-inner transition-all px-8 placeholder:text-muted-foreground/20 uppercase tracking-widest", touched.telephone && !formData.telephone && "border-destructive bg-destructive/5")}
                                        placeholder="+224 6XX XX XX XX"
                                        value={formData.telephone}
                                        onBlur={() => setTouched(prev => ({ ...prev, telephone: true }))}
                                        onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-4 md:col-span-2">
                                    <div className="flex justify-between items-center ml-2">
                                        <label className="text-executive-label font-black text-muted-foreground/40 uppercase tracking-[0.3em] italic">Localisation Précise d'Acquisition</label>
                                        {touched.adresse && !formData.adresse && <span className="text-[10px] font-black text-destructive uppercase tracking-widest animate-pulse leading-none italic pb-1">Adresse Requise</span>}
                                    </div>
                                    <Input
                                        className={cn("h-18 rounded-[1.5rem] border-4 border-border bg-background focus:border-primary/50 focus:ring-8 focus:ring-primary/5 text-base font-black italic shadow-inner transition-all px-8 placeholder:text-muted-foreground/20 uppercase tracking-widest", touched.adresse && !formData.adresse && "border-destructive bg-destructive/5")}
                                        placeholder="EX: RATOMA, KIPÉ 2, FACE STATION TOTAL"
                                        value={formData.adresse}
                                        onBlur={() => setTouched(prev => ({ ...prev, adresse: true }))}
                                        onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section: Mode de paiement (Premium Executive Selection) */}
                        <div className="rounded-[4rem] border-4 border-border bg-card overflow-hidden shadow-premium hover:shadow-premium-lg transition-all duration-700 relative group/card">
                            <div className="absolute top-0 right-0 size-64 bg-amber-500/5 rounded-full blur-[120px] -mr-32 -mt-32 group-hover/card:bg-amber-500/10 transition-colors duration-1000" />
                            
                            <div className="p-10 border-b-4 border-border bg-background/40 backdrop-blur-xl flex items-center justify-between">
                                <div className="flex items-center gap-8">
                                    <div className="size-20 rounded-[1.5rem] bg-card border-4 border-border flex items-center justify-center text-amber-500 shadow-inner group-hover/card:scale-110 group-hover/card:border-amber-500/20 transition-all duration-700">
                                        <CreditCard className="size-10" />
                                    </div>
                                    <div>
                                         <h3 className="text-3xl font-black italic tracking-tighter text-foreground uppercase leading-tight">Architecture de Règlement</h3>
                                         <p className="text-executive-label font-black text-muted-foreground/30 uppercase tracking-[0.4em] mt-2 italic">Phase II: Sélection du Canal de Transfert</p>
                                    </div>
                                </div>
                                <div className="size-14 rounded-full bg-border/20 flex items-center justify-center text-muted-foreground/40 border-2 border-border/40">
                                     <Lock className="size-6" />
                                </div>
                            </div>

                            <div className="p-12">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                    {[
                                        { id: 'wallet', label: 'BCA Wallet', icon: Wallet, sub: 'Instanté & Sécurisé', color: 'text-primary' },
                                        { id: 'mobile', label: 'Mobile Money', icon: Smartphone, sub: 'Orange / MTN', color: 'text-orange-500' },
                                        { id: 'card', label: 'International', icon: CreditCard, sub: 'Visa / Mastercard', color: 'text-blue-500' }
                                    ].map((method) => (
                                        <div
                                            key={method.id}
                                            onClick={() => setPaymentMethod(method.id)}
                                            className={cn(
                                                "relative cursor-pointer border-4 rounded-[3rem] p-10 flex flex-col gap-10 transition-all duration-700 transform hover:-translate-y-4 overflow-hidden",
                                                paymentMethod === method.id
                                                    ? "border-primary bg-primary/[0.03] shadow-premium-lg scale-105 z-10"
                                                    : "border-border bg-background/40 opacity-60 hover:opacity-100 hover:border-primary/30"
                                            )}
                                        >
                                            {paymentMethod === method.id && <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent animate-in fade-in duration-1000" />}
                                            
                                            <div className="flex justify-between items-start relative z-10">
                                                <div className={cn(
                                                    "size-20 rounded-[1.5rem] flex items-center justify-center transition-all duration-700 shadow-premium",
                                                    paymentMethod === method.id 
                                                        ? "bg-primary text-white scale-110 rotate-6 border-2 border-white/20" 
                                                        : "bg-card text-muted-foreground/30 border-4 border-border"
                                                )}>
                                                    <method.icon className="size-10" />
                                                </div>
                                                <div className={cn(
                                                    "size-8 rounded-full border-4 flex items-center justify-center transition-all duration-700 mt-2",
                                                    paymentMethod === method.id ? "border-primary bg-primary shadow-premium" : "border-border"
                                                )}>
                                                    {paymentMethod === method.id && <div className="size-2 rounded-full bg-white animate-in zoom-in" />}
                                                </div>
                                            </div>
                                            <div className="relative z-10">
                                                <p className="font-black text-foreground text-2xl tracking-tighter italic uppercase leading-none">{method.label}</p>
                                                {method.id === 'wallet' && wallet && (
                                                    <div className="mt-6 inline-flex items-center gap-3 px-5 py-2.5 bg-background rounded-full border-2 border-border shadow-inner">
                                                        <div className={cn("size-2 rounded-full animate-pulse", parseFloat(wallet.solde_virtuel) < total ? "bg-rose-500" : "bg-emerald-500")} />
                                                        <span className={cn("text-executive-label font-black uppercase tracking-[0.2em] leading-none pt-0.5", parseFloat(wallet.solde_virtuel) < total ? "text-rose-500" : "text-emerald-500")}>
                                                            {parseFloat(wallet.solde_virtuel).toLocaleString('fr-FR')} GNF ACCESSIBLES
                                                        </span>
                                                    </div>
                                                )}
                                                {! (method.id === 'wallet' && wallet) && (
                                                    <p className="text-executive-label text-muted-foreground/40 font-black uppercase tracking-[0.3em] mt-4 italic leading-none">{method.sub}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Order Summary (Elite Executive Sidebar) */}
                    <aside className="lg:col-span-4 sticky top-32">
                        <div className="rounded-[4rem] border-4 border-border bg-card overflow-hidden shadow-premium-lg relative group/sidebar">
                            <div className="absolute inset-x-0 top-0 h-2 bg-primary"></div>
                            
                            <div className="p-10 border-b-4 border-border bg-background/50 backdrop-blur-xl">
                                <h3 className="text-executive-label font-black uppercase tracking-[0.4em] text-foreground flex items-center gap-6 italic leading-none pt-0.5">
                                    <ShoppingBag className="size-6 text-primary" /> Inventaire <span className="text-[10px] text-muted-foreground/20 font-black tracking-widest italic pt-0.5 ml-2">[{cartItems.length} ARTICLES]</span>
                                </h3>
                            </div>
                            
                            <div className="p-10 space-y-10 max-h-[450px] overflow-y-auto scrollbar-hide">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex gap-8 group/item">
                                        <div className="size-24 rounded-[2rem] bg-background overflow-hidden border-4 border-border shrink-0 transition-transform group-hover/item:scale-110 group-hover/item:border-primary/20 shadow-inner">
                                            {item.image_url ? (
                                                <img src={item.image_url} alt={item.nom_produit} className="w-full h-full object-cover mix-blend-luminosity hover:mix-blend-normal transition-all duration-700" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-muted-foreground/10">
                                                    <ShoppingBag className="size-10" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col justify-center flex-1 min-w-0">
                                            <p className="font-black text-xl text-foreground truncate uppercase italic tracking-tighter leading-none group-hover/item:text-primary transition-colors">{item.nom_produit}</p>
                                            <div className="flex items-center justify-between mt-4">
                                                <span className="text-executive-label font-black text-primary uppercase tracking-[0.3em] bg-background px-4 py-2 rounded-full border-2 border-border italic leading-none pt-0.5 shadow-sm">U x {item.quantity}</span>
                                                <span className="font-black text-foreground italic text-lg tracking-tighter leading-none pt-0.5">{(parseFloat(item.prix || 0) * item.quantity).toLocaleString('fr-FR')} <span className="text-[10px] not-italic text-muted-foreground/20 ml-2 uppercase">GNF</span></span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-10 border-t-4 border-border bg-background/30 backdrop-blur-xl space-y-8">
                                <div className="flex justify-between items-center group/spec">
                                    <span className="text-executive-label text-muted-foreground/40 font-black uppercase tracking-[0.4em] italic group-hover/spec:text-foreground transition-colors leading-none">Valeur Marchande</span>
                                    <span className="text-foreground font-black italic tracking-tighter text-xl leading-none group-hover/spec:text-primary transition-colors">{cartTotal.toLocaleString('fr-FR')} <span className="text-[10px] not-italic text-muted-foreground/20 ml-2">GNF</span></span>
                                </div>
                                <div className="flex justify-between items-center group/spec">
                                    <span className="text-executive-label text-muted-foreground/40 font-black uppercase tracking-[0.4em] flex items-center gap-4 italic group-hover/spec:text-foreground transition-colors leading-none">
                                        <Truck className="size-5 text-primary" /> Flux Logistique
                                    </span>
                                    <span className="text-foreground font-black italic tracking-tighter text-xl leading-none group-hover/spec:text-primary transition-colors">{deliveryFee.toLocaleString('fr-FR')} <span className="text-[10px] not-italic text-muted-foreground/20 ml-2">GNF</span></span>
                                </div>
                                
                                <div className="pt-10 border-t-4 border-border flex justify-between items-end">
                                    <div className="flex flex-col">
                                         <span className="text-executive-label font-black uppercase tracking-[0.5em] text-primary italic leading-none mb-3">Engagement Final</span>
                                         <span className="text-executive-label font-black text-muted-foreground/20 uppercase tracking-[0.3em] leading-none pt-0.5 italic">TAXES GOUVERNEMENTALES INCLUSES (18%)</span>
                                    </div>
                                    <div className="flex flex-col items-end leading-none">
                                        <span className="text-5xl font-black tracking-tighter text-foreground italic drop-shadow-2xl leading-none">{total.toLocaleString('fr-FR')}</span>
                                        <span className="text-executive-label font-black text-primary uppercase tracking-[0.4em] mt-4 italic leading-none">GNF REGLEMENTAIRE</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-10 pt-0">
                                <Button
                                    onClick={handleSubmit}
                                    isLoading={isSubmitting}
                                    disabled={cartItems.length === 0}
                                    className="w-full h-24 rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-sm shadow-premium-lg shadow-primary/40 group relative overflow-hidden flex items-center justify-center gap-10 transition-all hover:scale-105 active:scale-95 border-4 border-primary bg-primary text-white"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                                    <span>VALIDER L'ACCORD</span>
                                    <div className="size-12 rounded-2xl bg-white/10 flex items-center justify-center group-hover:rotate-12 transition-transform shadow-inner border border-white/10">
                                        <Lock className="size-6 text-white" />
                                    </div>
                                </Button>
                                
                                <div className="mt-10 p-6 rounded-[2.5rem] bg-emerald-500/5 border-4 border-emerald-500/10 flex items-center justify-center gap-6 italic group/guard hover:bg-emerald-500/10 transition-colors">
                                    <ShieldCheck className="size-6 text-emerald-500 group-hover:animate-pulse" />
                                    <span className="text-executive-label font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] leading-none pt-0.5">Scellé par protocole BCA SÉQUESTRE v2.1</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Trust Badges Sidebar (Executive Style) */}
                        <div className="mt-12 grid grid-cols-3 gap-8">
                             {[
                                 { icon: ShieldCheck, label: 'Audité 2024' },
                                 { icon: Truck, label: 'Swift Delivery' },
                                 { icon: Lock, label: 'Chiffré AES-256' }
                             ].map((b, i) => (
                                 <div key={i} className="flex flex-col items-center gap-4 p-8 rounded-[2.5rem] border-4 border-border bg-card/40 opacity-40 hover:opacity-100 hover:border-primary/20 transition-all duration-700 shadow-premium group">
                                     <b.icon className="size-8 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                                     <span className="text-executive-label font-black uppercase tracking-widest text-muted-foreground/30 group-hover:text-foreground transition-colors italic leading-none">{b.label}</span>
                                 </div>
                             ))}
                        </div>
                    </aside>
                </div>
            </div>
        </PublicLayout>
    );
};

export default Checkout;
