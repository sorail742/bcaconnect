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
            alert("Veuillez remplir toutes les informations de livraison.");
            return;
        }

        if (paymentMethod === 'wallet' && wallet && parseFloat(wallet.solde_virtuel) < total) {
            alert("Solde insuffisant dans votre portefeuille BCA Connect.");
            navigate('/wallet');
            return;
        }

        if (cartItems.length === 0) {
            alert("Votre panier est vide.");
            return;
        }

        setIsSubmitting(true);
        const orderData = {
            items: cartItems.map(item => ({
                id: item.id, // Adaptation pour correspondre au format backend si besoin
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
                toast.success("Commande enregistrée hors-ligne ! Elle sera synchronisée dès le retour du réseau.");
                setTimeout(() => navigate('/orders'), 3000);
            } catch (err) {
                console.error("Erreur stockage offline:", err);
                alert("Impossible d'enregistrer la commande hors-ligne.");
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
            alert(err.response?.data?.message || "Une erreur est survenue lors de la validation.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <PublicLayout>
                <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
                    <div className="size-24 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-500 mb-8 border border-emerald-100 dark:border-emerald-800 animate-in zoom-in duration-500">
                        <CheckCircle2 className="size-12" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">Merci pour votre commande !</h2>
                    <p className="text-slate-500 font-medium mt-4 max-w-md mx-auto leading-relaxed">
                        Votre commande a été enregistrée avec succès. Vous recevrez une confirmation par SMS sous peu. Vous allez être redirigé vers vos commandes.
                    </p>
                    <div className="mt-10 flex gap-4">
                        <Button onClick={() => navigate('/orders')} variant="outline" className="rounded-xl px-8">
                            Voir mes commandes
                        </Button>
                        <Button onClick={() => navigate('/catalog')} className="rounded-xl px-8 shadow-xl shadow-primary/20">
                            Continuer mes achats
                        </Button>
                    </div>
                </div>
            </PublicLayout>
        );
    }

    return (
        <PublicLayout>
            <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-1000 font-inter pb-32 px-6 md:px-10 pt-16 relative">
                {/* ══════════════════════════════════════════════════
                    SECTION 1 — EXECUTIVE HEADER & STEPPER
                ══════════════════════════════════════════════════ */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 border-b border-slate-100 dark:border-slate-800 pb-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="size-2 rounded-full bg-emerald-500 animate-ping" />
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em]">Checkout Sécurisé SSL Level 4</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter italic">
                            Finalisation <span className="text-primary italic">Achat</span>
                        </h1>
                        <p className="text-slate-500 text-sm font-bold max-w-md">Vérifiez vos informations et choisissez votre mode de règlement préféré.</p>
                    </div>

                    {/* Premium Stepper */}
                    <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-inner">
                        {[
                            { step: 1, label: 'Livraison', active: true },
                            { step: 2, label: 'Paiement', active: false },
                            { step: 3, label: 'Confirmation', active: false }
                        ].map((s, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className={cn(
                                    "flex items-center gap-3 px-6 py-3 rounded-[1.5rem] transition-all duration-500",
                                    s.active ? "bg-primary text-white shadow-xl shadow-primary/20 scale-105" : "text-slate-400 opacity-60"
                                )}>
                                    <span className="text-xs font-black italic">{s.step}</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest">{s.label}</span>
                                </div>
                                {i < 2 && <div className="w-10 h-px bg-slate-200 dark:bg-slate-800" />}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mobile Floating Recap (High Contrast) */}
                <div className="lg:hidden sticky top-20 z-50">
                    <button 
                         onClick={() => setShowMobileDetails(!showMobileDetails)}
                         className="w-full flex items-center justify-between p-6 rounded-[2rem] bg-slate-950 text-white shadow-2xl border border-white/10 active:scale-95 transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
                                <ShoppingBag className="size-6 text-white" />
                            </div>
                            <div className="text-left">
                                <p className="text-[9px] font-black text-primary uppercase tracking-[0.3em]">Panier Executive</p>
                                <p className="text-xl font-black italic mt-0.5">{total.toLocaleString('fr-FR')} <span className="text-xs not-italic text-slate-400">GNF</span></p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-white/5 py-2 px-5 rounded-full border border-white/10">
                             <span className="text-[9px] font-black uppercase tracking-widest">{showMobileDetails ? 'Réduire' : 'Détails'}</span>
                             {showMobileDetails ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                        </div>
                    </button>
                    
                    {showMobileDetails && (
                        <div className="absolute top-full left-0 right-0 mt-4 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)] animate-in slide-in-from-top-4">
                            <div className="space-y-6">
                                {cartItems.map(item => (
                                    <div key={item.id} className="flex justify-between items-center">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-slate-900 dark:text-white truncate max-w-[180px]">{item.nom_produit}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quantité: {item.quantity}</span>
                                        </div>
                                        <span className="font-black text-slate-900 dark:text-white italic">
                                            {(parseFloat(item.prix || 0) * item.quantity).toLocaleString('fr-FR')} <span className="text-[9px] not-italic text-primary">GNF</span>
                                        </span>
                                    </div>
                                ))}
                                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-end">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Total TTC</span>
                                    <span className="text-2xl font-black text-slate-900 dark:text-white italic">{total.toLocaleString('fr-FR')} <span className="text-xs not-italic text-slate-400 uppercase">GNF</span></span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    {/* Left Column: Forms and Payment */}
                    <div className="lg:col-span-8 flex flex-col gap-12">
                        {/* Section: Livraison (Executive Card) */}
                        <div className="rounded-[2.5rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xl shadow-slate-200/40 dark:shadow-none relative group">
                            <div className="absolute top-0 right-0 size-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
                            
                            <div className="p-8 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20 flex items-center justify-between">
                                <div className="flex items-center gap-5">
                                    <div className="size-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10 transition-transform group-hover:scale-110">
                                        <Truck className="size-7" />
                                    </div>
                                    <div>
                                         <h3 className="text-base font-black italic tracking-tight text-slate-900 dark:text-white">Informations Logistiques</h3>
                                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Étape 1 sur 2</p>
                                    </div>
                                </div>
                                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/10">
                                    <Lock className="size-3 text-emerald-500" />
                                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Données chiffrées</span>
                                </div>
                            </div>

                            <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center ml-1">
                                        <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Destinataire</label>
                                        {touched.nom && !formData.nom && <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest animate-pulse">Champ requis</span>}
                                    </div>
                                    <Input
                                        className={cn("h-14 rounded-2xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 text-sm font-bold shadow-sm transition-all", touched.nom && !formData.nom && "border-rose-500 bg-rose-50/5")}
                                        placeholder="Ex: Elhadj Mamadou Diallo"
                                        value={formData.nom}
                                        onBlur={() => setTouched(prev => ({ ...prev, nom: true }))}
                                        onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center ml-1">
                                        <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Contact GSM</label>
                                        {touched.telephone && !formData.telephone && <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest animate-pulse">Champ requis</span>}
                                    </div>
                                    <Input
                                        className={cn("h-14 rounded-2xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 text-sm font-bold shadow-sm transition-all", touched.telephone && !formData.telephone && "border-rose-500 bg-rose-50/5")}
                                        placeholder="+224 6XX XX XX XX"
                                        value={formData.telephone}
                                        onBlur={() => setTouched(prev => ({ ...prev, telephone: true }))}
                                        onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-3 md:col-span-2">
                                    <div className="flex justify-between items-center ml-1">
                                        <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Lieu de livraison précis</label>
                                        {touched.adresse && !formData.adresse && <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest animate-pulse">Champ requis</span>}
                                    </div>
                                    <Input
                                        className={cn("h-14 rounded-2xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 text-sm font-bold shadow-sm transition-all", touched.adresse && !formData.adresse && "border-rose-500 bg-rose-50/5")}
                                        placeholder="Ex: Ratoma, Kipé 2, Ruelle Face Station Total"
                                        value={formData.adresse}
                                        onBlur={() => setTouched(prev => ({ ...prev, adresse: true }))}
                                        onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section: Mode de paiement (Premium Method Selection) */}
                        <div className="rounded-[2.5rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xl shadow-slate-200/40 dark:shadow-none relative group">
                            <div className="p-8 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20 flex items-center justify-between">
                                <div className="flex items-center gap-5">
                                    <div className="size-14 rounded-2xl bg-amber-500/5 flex items-center justify-center text-amber-500 border border-amber-500/10 transition-transform group-hover:scale-110">
                                        <CreditCard className="size-7" />
                                    </div>
                                    <div>
                                         <h3 className="text-base font-black italic tracking-tight text-slate-900 dark:text-white">Canal de Règlement</h3>
                                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Étape 2 sur 2</p>
                                    </div>
                                </div>
                                <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                     <Lock className="size-4" />
                                </div>
                            </div>

                            <div className="p-10">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {[
                                        { id: 'wallet', label: 'BCA Wallet', icon: Wallet, sub: 'Instanté & Sécurisé', color: 'text-primary' },
                                        { id: 'mobile', label: 'Mobile Money', icon: Smartphone, sub: 'Orange / MTN', color: 'text-orange-500' },
                                        { id: 'card', label: 'International', icon: CreditCard, sub: 'Visa / Mastercard', color: 'text-blue-500' }
                                    ].map((method) => (
                                        <div
                                            key={method.id}
                                            onClick={() => setPaymentMethod(method.id)}
                                            className={cn(
                                                "relative cursor-pointer border-2 rounded-[2rem] p-8 flex flex-col gap-6 transition-all duration-500 transform hover:-translate-y-2",
                                                paymentMethod === method.id
                                                    ? "border-primary bg-primary/[0.03] shadow-2xl shadow-primary/10 scale-105 z-10"
                                                    : "border-slate-50 dark:border-slate-800/50 bg-slate-50/30 dark:bg-slate-950/20 opacity-70 hover:opacity-100 hover:border-primary/30"
                                            )}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className={cn(
                                                    "size-14 rounded-2xl flex items-center justify-center transition-all duration-500",
                                                    paymentMethod === method.id 
                                                        ? "bg-primary text-white shadow-lg rotate-3" 
                                                        : "bg-white dark:bg-slate-900 text-slate-300 border border-slate-100 dark:border-slate-800"
                                                )}>
                                                    <method.icon className="size-7" />
                                                </div>
                                                <div className={cn(
                                                    "size-6 rounded-full border-2 flex items-center justify-center transition-all duration-500",
                                                    paymentMethod === method.id ? "border-primary bg-primary scale-110" : "border-slate-200 dark:border-slate-800"
                                                )}>
                                                    {paymentMethod === method.id && <div className="size-2 rounded-full bg-white animate-in zoom-in" />}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 dark:text-white text-lg tracking-tight italic uppercase">{method.label}</p>
                                                {method.id === 'wallet' && wallet && (
                                                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-white/80 dark:bg-slate-800 rounded-full border border-slate-100 dark:border-slate-700 shadow-sm">
                                                        <div className={cn("size-1.5 rounded-full animate-pulse", parseFloat(wallet.solde_virtuel) < total ? "bg-rose-500" : "bg-emerald-500")} />
                                                        <span className={cn("text-[9px] font-black uppercase tracking-widest", parseFloat(wallet.solde_virtuel) < total ? "text-rose-500" : "text-emerald-500")}>
                                                            {parseFloat(wallet.solde_virtuel).toLocaleString('fr-FR')} GNF dispo.
                                                        </span>
                                                    </div>
                                                )}
                                                {! (method.id === 'wallet' && wallet) && (
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">{method.sub}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Order Summary (Elite Sidebar) */}
                    <aside className="lg:col-span-4 sticky top-24">
                        <div className="rounded-[2.5rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xl shadow-slate-200/40 dark:shadow-none relative group">
                            <div className="p-8 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white flex items-center gap-3">
                                    <ShoppingBag className="size-4 text-primary" /> Récapitulatif <span className="text-[10px] text-slate-400 font-bold tracking-normal italic">( {cartItems.length} articles )</span>
                                </h3>
                            </div>
                            
                            <div className="p-8 space-y-6 max-h-[400px] overflow-y-auto scrollbar-hide">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex gap-5 group/item">
                                        <div className="size-20 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800 overflow-hidden border border-slate-100 dark:border-slate-800 shrink-0 transition-transform group-hover/item:scale-105">
                                            {item.image_url ? (
                                                <img src={item.image_url} alt={item.nom_produit} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-200">
                                                    <ShoppingBag className="size-8" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col justify-center flex-1 min-w-0">
                                            <p className="font-black text-sm text-slate-900 dark:text-white truncate group-hover/item:text-primary transition-colors">{item.nom_produit}</p>
                                            <div className="flex items-center justify-between mt-1.5">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg">Qté: {item.quantity}</span>
                                                <span className="font-black text-slate-900 dark:text-white italic text-xs">{(parseFloat(item.prix || 0) * item.quantity).toLocaleString('fr-FR')} <span className="text-[9px] not-italic text-primary">GNF</span></span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-8 border-t border-slate-50 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/50 space-y-4">
                                <div className="flex justify-between text-xs font-bold tracking-tight text-slate-500">
                                    <span className="uppercase tracking-widest text-[10px]">Sous-total</span>
                                    <span className="text-slate-900 dark:text-white font-black italic">{cartTotal.toLocaleString('fr-FR')} GNF</span>
                                </div>
                                <div className="flex justify-between text-xs font-bold tracking-tight text-slate-500">
                                    <span className="uppercase tracking-widest text-[10px]">Logistique Express</span>
                                    <span className="text-slate-900 dark:text-white font-black italic">{deliveryFee.toLocaleString('fr-FR')} GNF</span>
                                </div>
                                
                                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-end">
                                    <div className="flex flex-col">
                                         <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Total Final</span>
                                         <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">TVA (18%) Incluse</span>
                                    </div>
                                    <div className="flex flex-col items-end leading-none">
                                        <span className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white italic">{total.toLocaleString('fr-FR')}</span>
                                        <span className="text-xs font-black text-primary uppercase tracking-[0.2em] mt-1">GNF</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 pt-0">
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || cartItems.length === 0}
                                    className="w-full h-18 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-primary/30 group relative overflow-hidden flex items-center justify-center gap-3 transition-all hover:scale-[1.02]"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                                    {isSubmitting ? "Traitement Bancaire..." : "Valider le Paiement"}
                                    <div className="size-8 rounded-xl bg-white/20 flex items-center justify-center group-hover:rotate-12 transition-transform">
                                        <Lock className="size-4" />
                                    </div>
                                </Button>
                                
                                <div className="mt-6 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center gap-3">
                                    <ShieldCheck className="size-4 text-emerald-500 animate-pulse" />
                                    <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em]">Transaction Sécurisée par BCA Séquestre</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Trust Badges Sidebar */}
                        <div className="mt-8 grid grid-cols-3 gap-4">
                             {[
                                 { icon: ShieldCheck, label: 'Garantie' },
                                 { icon: Truck, label: 'Express' },
                                 { icon: Lock, label: 'Sécurité' }
                             ].map((b, i) => (
                                 <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 opacity-60">
                                     <b.icon className="size-4 text-slate-400" />
                                     <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">{b.label}</span>
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
