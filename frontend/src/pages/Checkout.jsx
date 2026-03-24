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
import orderService from '../services/orderService';
import { useNavigate } from 'react-router-dom';
import walletService from '../services/walletService';
import { offlineStorage } from '../lib/db';
import { toast } from 'sonner';

const Checkout = () => {
    const { cartItems, cartTotal, clearCart } = useCart();
    const navigate = useNavigate();
    const [paymentMethod, setPaymentMethod] = useState('wallet');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [wallet, setWallet] = useState(null);
    const [formData, setFormData] = useState({
        nom: '',
        telephone: '',
        adresse: ''
    });

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
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
                    <div className="size-24 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 animate-bounce">
                        <CheckCircle2 className="size-16" />
                    </div>
                    <h2 className="text-4xl font-black italic tracking-tighter">Merci pour votre confiance !</h2>
                    <p className="text-muted-foreground font-medium max-w-md">Votre commande a été enregistrée avec succès. Vous allez être redirigé vers votre historique.</p>
                </div>
            </PublicLayout>
        );
    }

    return (
        <PublicLayout>
            <div className="w-full space-y-10 animate-in fade-in duration-700 font-inter pb-20 px-4 md:px-8">
                {/* Header Section */}
                <div className="flex flex-col gap-2">
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-primary/20 w-fit">Tunnel d'Achat Sécurisé</span>
                    <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tighter italic leading-none">
                        Finalisez votre commande <br />
                        <span className="text-primary not-italic text-3xl md:text-4xl">en toute sécurité.</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Forms and Payment */}
                    <div className="lg:col-span-8 flex flex-col gap-8">
                        {/* Section: Livraison */}
                        <Card className="rounded-[2rem] border-border overflow-hidden shadow-xl bg-card">
                            <CardHeader className="p-6 border-b border-border bg-muted/20 flex flex-row items-center gap-4">
                                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <Truck className="size-5" />
                                </div>
                                <CardTitle className="text-sm font-black uppercase tracking-widest">Informations de livraison</CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nom complet du destinataire</label>
                                    <Input
                                        placeholder="Ibrahima Bah"
                                        value={formData.nom}
                                        onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Numéro de téléphone GN</label>
                                    <Input
                                        placeholder="+224 6XX XX XX XX"
                                        value={formData.telephone}
                                        onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Adresse précise (Commune, Quartier)</label>
                                    <Input
                                        placeholder="Ex: Dixinn, Landreah, Villa 45"
                                        value={formData.adresse}
                                        onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Section: Mode de paiement */}
                        <Card className="rounded-[2rem] border-border overflow-hidden shadow-xl bg-card">
                            <CardHeader className="p-6 border-b border-border bg-muted/20 flex flex-row items-center gap-4">
                                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <CreditCard className="size-5" />
                                </div>
                                <CardTitle className="text-sm font-black uppercase tracking-widest">Mode de paiement préféré</CardTitle>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {[
                                        { id: 'wallet', label: 'Portefeuille BCA', icon: Wallet, sub: 'Direct & Rapide' },
                                        { id: 'mobile', label: 'Mobile Money', icon: Smartphone, sub: 'Orange / MTN' },
                                        { id: 'card', label: 'Carte Bancaire', icon: CreditCard, sub: 'Visa / Mastercard' }
                                    ].map((method) => (
                                        <div
                                            key={method.id}
                                            onClick={() => setPaymentMethod(method.id)}
                                            className={cn(
                                                "relative cursor-pointer border-2 rounded-[1.5rem] p-6 flex flex-col gap-3 transition-all duration-300",
                                                paymentMethod === method.id
                                                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/5"
                                                    : "border-border bg-muted/10 hover:border-primary/40"
                                            )}
                                        >
                                            <div className="flex justify-between items-start">
                                                <method.icon className={cn("size-6", paymentMethod === method.id ? "text-primary" : "text-muted-foreground")} />
                                                <div className={cn(
                                                    "size-5 rounded-full border-2 flex items-center justify-center",
                                                    paymentMethod === method.id ? "border-primary" : "border-border"
                                                )}>
                                                    {paymentMethod === method.id && <div className="size-2.5 rounded-full bg-primary" />}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="font-black text-foreground italic tracking-tight">{method.label}</p>
                                                {method.id === 'wallet' && wallet && (
                                                    <p className={cn(
                                                        "text-[9px] font-black uppercase tracking-widest mt-0.5",
                                                        parseFloat(wallet.solde_virtuel) < total ? "text-destructive" : "text-emerald-500"
                                                    )}>
                                                        Solde: {parseFloat(wallet.solde_virtuel).toLocaleString('fr-GN')} GNF
                                                    </p>
                                                )}
                                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">{method.sub}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Order Summary */}
                    <aside className="lg:col-span-4 sticky top-8">
                        <Card className="rounded-[2rem] border-border overflow-hidden shadow-2xl bg-card">
                            <div className="p-8 border-b border-border bg-muted/20">
                                <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Synthèse du Panier</h3>
                            </div>
                            <div className="p-8 space-y-6 max-h-[400px] overflow-y-auto scrollbar-hide">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex gap-4 group">
                                        <div className="size-20 rounded-2xl bg-muted overflow-hidden border border-border shrink-0">
                                            <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                                <ShoppingBag className="text-slate-400 size-8" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col justify-center flex-1 min-w-0">
                                            <p className="font-bold text-sm text-foreground truncate">{item.nom_produit}</p>
                                            <div className="flex items-center justify-between mt-1">
                                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Qté: {item.quantity}</span>
                                                <span className="font-black text-primary italic text-sm">{(parseFloat(item.prix || item.prix_unitaire || item.price || 0)).toLocaleString('fr-GN')} GNF</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-8 bg-muted/10 border-t border-border space-y-4">
                                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                    <span>Sous-total</span>
                                    <span className="text-foreground">{cartTotal.toLocaleString('fr-GN')} GNF</span>
                                </div>
                                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                    <span>Livraison Rush</span>
                                    <span className="text-foreground">{deliveryFee.toLocaleString('fr-GN')} GNF</span>
                                </div>
                                <div className="pt-4 border-t border-border flex justify-between items-end">
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Total Final</span>
                                    <div className="flex flex-col items-end leading-none">
                                        <span className="text-3xl font-black italic tracking-tighter text-foreground">{total.toLocaleString('fr-GN')} GNF</span>
                                        <span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.5em] mt-1">TVA Incluse</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-8 pt-0">
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || cartItems.length === 0}
                                    className="w-full py-8 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-sm shadow-2xl shadow-primary/30 group"
                                >
                                    {isSubmitting ? "Traitement..." : "Valider le paiement"}
                                    <Lock className="size-4 ml-2 group-hover:animate-bounce" />
                                </Button>
                            </div>
                        </Card>
                    </aside>
                </div>
            </div>
        </PublicLayout>
    );
};

export default Checkout;
