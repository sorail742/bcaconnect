import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ShieldCheck, CreditCard, Truck, Package, ArrowRight, Lock, CheckCircle2, ChevronRight, Home, Smartphone, Zap, ArrowLeft, Info, AlertCircle } from 'lucide-react';
import useCart from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import orderService from '../services/orderService';
import walletService from '../services/walletService';
import cartService from '../services/cartService';
import { useWallet } from '../hooks/useDomainData';
import useApiMutation from '../hooks/useApiMutation';
import { useLanguage } from '../context/LanguageContext';
import { checkoutStep1Schema } from '../lib/validation';

const DELIVERY_FEE = 50000;

const Field = ({ label, ...props }) => (
    <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</label>
        <input className="size-10 w-full px-3 bg-background border border-border rounded-xl text-sm outline-none focus:border-primary/50 transition-all text-foreground placeholder:text-muted-foreground" {...props} />
    </div>
);

const Checkout = () => {
    const { t } = useLanguage();
    const { cartItems, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    
    // React Query Hooks
    const { data: wallet, isLoading: walletLoading } = useWallet();
    
    const [formData, setFormData] = useState({
        prenom: '', nom: user?.nom_complet || '', email: user?.email || '',
        telephone: user?.telephone || '', adresse: '', ville: 'Conakry',
        quartier: '', notes: '', paymentMethod: 'wallet'
    });

    const total = (cartTotal || 0) + DELIVERY_FEE;

    useEffect(() => { if (cartItems.length === 0) navigate('/marketplace'); }, [cartItems, navigate]);

    // Mutation pour créer la commande
    const { mutate: createOrder, isPending: isSubmitting } = useApiMutation(
        (payload) => orderService.create(payload),
        {
            successMessage: 'PÉRIMÈTRE D\'ACQUISITION SÉCURISÉ : COMMANDE VALIDÉE.',
            invalidateKeys: ['wallet', 'orders', 'user-profile'],
            onSuccess: () => {
                clearCart();
                navigate('/dashboard/orders');
            }
        }
    );

    const handleChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

    const validateStep1 = () => {
        try {
            checkoutStep1Schema.parse(formData);
            return true;
        } catch (error) {
            if (error.errors && error.errors.length > 0) {
                toast.error(error.errors[0].message);
            } else {
                toast.error('Veuillez vérifier vos informations.');
            }
            return false;
        }
    };

    const handleProcessOrder = () => {
        // Sécurité supplémentaire : Vérifier si le panier n'est pas devenu vide
        if (cartItems.length === 0) {
            toast.error('Votre panier est vide. Veuillez ajouter des produits avant de commander.');
            navigate('/marketplace');
            return;
        }

        if (formData.paymentMethod === 'wallet') {
            const balance = wallet ? parseFloat(wallet.solde_virtuel) : 0;
            if (balance < total) { 
                toast.error('ERREUR : SOLDE_INSUFFISANT. VEUILLEZ ALIMENTER VOTRE WALLET.'); 
                return; 
            }
        }

        // Transformation via cartService
        const deliveryInfo = {
            nom: `${formData.prenom} ${formData.nom}`.trim(),
            telephone: formData.telephone,
            adresse: `${formData.adresse}, ${formData.quartier}, ${formData.ville}`
        };

        const orderPayload = cartService.formatOrderData(
            cartItems, 
            deliveryInfo, 
            formData.paymentMethod
        );

        // Exécution de la mutation
        createOrder(orderPayload);
    };

    if (cartItems.length === 0) return null;

    const isBalanceInsufficient = formData.paymentMethod === 'wallet' && wallet && parseFloat(wallet.solde_virtuel) < total;

    return (
        <div className="bg-background min-h-screen text-foreground pb-16">
            <div className="max-w-6xl mx-auto px-6 md:px-12 pt-24 space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
                    <div className="space-y-3">
                        <button onClick={() => navigate('/cart')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                            <ArrowLeft className="size-4" /> Retour au panier
                        </button>
                        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                            {t('ckSecureCheckout') || 'Paiement'} <span className="text-primary">sécurisé</span>
                        </h1>
                        <div className="flex items-center gap-3 text-sm">
                            {[{ n: 1, label: t('ckLogistics') || 'Livraison' }, { n: 2, label: t('ckTransaction') || 'Paiement' }].map(s => (
                                <React.Fragment key={s.n}>
                                    <span className={cn("flex items-center gap-2 font-medium transition-all font-black text-[10px] uppercase tracking-widest", step >= s.n ? "text-primary" : "text-muted-foreground")}>
                                        <span className={cn("size-6 rounded-lg flex items-center justify-center text-[10px] font-black", step >= s.n ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-muted text-muted-foreground border border-border")}>{s.n}</span>
                                        {s.label}
                                    </span>
                                    {s.n < 2 && <ChevronRight className="size-4 text-muted-foreground" />}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {step === 1 ? (
                            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
                                <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-6">
                                    <div className="flex items-center gap-3 pb-4 border-b border-border">
                                        <div className="size-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center"><Home className="size-5 text-primary" /></div>
                                        <h3 className="text-xs font-black text-foreground uppercase tracking-widest">{t('ckShippingCoords') || 'Coordonnées de livraison'}</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Field label={t('ckFirstName') || 'Prénom'} name="prenom" value={formData.prenom} onChange={handleChange} placeholder="SYLLA" />
                                        <Field label={`${t('ckLastName') || 'Nom'} *`} name="nom" value={formData.nom} onChange={handleChange} placeholder="OUMAR" />
                                        <Field label={`${t('ckPhone') || 'Téléphone'} *`} name="telephone" value={formData.telephone} onChange={handleChange} placeholder="+224 6XX XX XX XX" />
                                        <Field label={t('ckEmailOptional') || 'Email (optionnel)'} name="email" type="email" value={formData.email} onChange={handleChange} placeholder="alpha@bca.com" />
                                    </div>
                                </div>

                                <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-6">
                                    <div className="flex items-center gap-3 pb-4 border-b border-border">
                                        <div className="size-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center"><Truck className="size-5 text-primary" /></div>
                                        <h3 className="text-xs font-black text-foreground uppercase tracking-widest">{t('ckLogisticsProtocol') || 'Adresse de livraison'}</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t('ckCity') || 'Ville'}</label>
                                            <input disabled value={formData.ville} className="h-12 w-full px-4 bg-muted border border-border rounded-2xl text-[10px] font-black text-muted-foreground uppercase cursor-not-allowed" />
                                        </div>
                                        <Field label={`${t('ckDistrict') || 'Quartier'} *`} name="quartier" value={formData.quartier} onChange={handleChange} placeholder="KIPE / RATOMA" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{`${t('ckPreciseAddress') || 'Adresse précise'} *`}</label>
                                        <textarea name="adresse" value={formData.adresse} onChange={handleChange} placeholder="INDICATIONS PRÉCISES DU POINT D'ACQUISITION" rows={3}
                                            className="w-full px-4 py-3 bg-background border border-border rounded-2xl text-xs font-medium outline-none focus:border-primary/50 transition-all text-foreground placeholder:text-muted-foreground resize-none" />
                                    </div>
                                </div>

                                <Button onClick={() => validateStep1() && setStep(2)}
                                    className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest border-none hover:bg-primary/90 flex items-center justify-center gap-3 shadow-lg shadow-primary/20">
                                    {t('ckGoToPayment') || 'Continuer vers le paiement'} <ArrowRight className="size-5" />
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-6">
                                    <div className="flex items-center gap-3 pb-4 border-b border-border">
                                        <div className="size-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center"><CreditCard className="size-5 text-primary" /></div>
                                        <h3 className="text-xs font-black text-foreground uppercase tracking-widest">{t('ckPaymentMethod') || 'Mode de paiement'}</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[
                                            { key: 'wallet', icon: Zap, label: t('ckBcaWallet') || 'Portefeuille BCA', sub: wallet ? `Solde : ${parseFloat(wallet.solde_virtuel).toLocaleString()} GNF` : t('ckInstantSecure') || 'Paiement instantané', color: 'primary' },
                                            { key: 'cod', icon: Smartphone, label: t('ckCashAtBusiness') || 'Paiement à la livraison', sub: t('ckMobileMoney') || 'Mobile Money / Espèces', color: 'emerald' },
                                        ].map(opt => (
                                            <button key={opt.key} onClick={() => setFormData(p => ({ ...p, paymentMethod: opt.key }))}
                                                className={cn("p-5 rounded-3xl border-2 transition-all text-left flex items-start gap-4 relative overflow-hidden",
                                                    formData.paymentMethod === opt.key
                                                        ? opt.color === 'primary' ? "border-primary bg-primary/5 shadow-inner" : "border-emerald-500 bg-emerald-500/5 shadow-inner"
                                                        : "border-border bg-card hover:border-primary/30"
                                                )}>
                                                <div className={cn("size-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg",
                                                    formData.paymentMethod === opt.key
                                                        ? opt.color === 'primary' ? "bg-primary text-primary-foreground" : "bg-emerald-500 text-white"
                                                        : "bg-muted border border-border text-muted-foreground"
                                                )}>
                                                    <opt.icon className="size-5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-foreground uppercase tracking-tight">{opt.label}</p>
                                                    <p className="text-[10px] font-black text-muted-foreground mt-1 opacity-70 uppercase tracking-widest">{opt.sub}</p>
                                                </div>
                                                {formData.paymentMethod === opt.key && (
                                                    <CheckCircle2 className={cn("size-5 absolute top-4 right-4", opt.color === 'primary' ? "text-primary" : "text-emerald-500")} />
                                                )}
                                            </button>
                                        ))}
                                    </div>

                                    {isBalanceInsufficient && (
                                        <div className="flex items-center gap-3 p-4 bg-rose-500/5 border border-rose-500/20 rounded-2xl animate-pulse">
                                            <AlertCircle className="size-5 text-rose-500 shrink-0" />
                                            <div className="space-y-1">
                                                 <p className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest">SOLDE INSUFFISANT</p>
                                                 <p className="text-[9px] font-medium text-muted-foreground">Veuillez alimenter votre compte ou choisir un autre mode de paiement.</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-2xl">
                                        <Info className="size-5 text-primary shrink-0" />
                                        <p className="text-[10px] font-black text-muted-foreground uppercase opacity-70 tracking-widest">{t('ckAgreement') || 'En confirmant, vous acceptez nos conditions générales de vente.'}</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button onClick={() => setStep(1)} className="h-14 px-8 rounded-2xl border border-border text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all flex items-center gap-3">
                                        <ArrowLeft className="size-4" /> {t('ckBack') || 'Retour'}
                                    </button>
                                    <Button onClick={handleProcessOrder} disabled={isSubmitting || isBalanceInsufficient}
                                        className="flex-1 h-14 rounded-2xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest border-none hover:bg-primary/90 flex items-center justify-center gap-3 shadow-lg shadow-primary/20 disabled:opacity-50">
                                        {isSubmitting ? <><div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Traitement Alpha...</>
                                            : <><ShieldCheck className="size-5" /> {t('ckConfirmAcquisition') || 'Confirmer la commande'}</>}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Order summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm sticky top-24">
                            <div className="h-1 bg-primary" />
                            <div className="p-5 space-y-5">
                                <div className="flex items-center justify-between pb-4 border-b border-border">
                                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                        <Package className="size-4 text-primary" /> {t('ckAcquisitionBase') || 'Récapitulatif'}
                                    </h3>
                                    <span className="text-xs font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-lg">{cartItems.length} article(s)</span>
                                </div>

                                <div className="space-y-3 max-h-48 overflow-y-auto">
                                    {cartItems.map(item => (
                                        <div key={item.id} className="flex gap-3">
                                            <div className="size-12 rounded-lg bg-muted border border-border overflow-hidden shrink-0">
                                                <img src={item.image_url || item.image || (item.images?.[0]?.url_image)} alt="" className="w-full h-full object-cover" onError={e => e.target.style.display = 'none'} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold text-foreground truncate">{item.nom_produit || item.name}</p>
                                                <p className="text-xs text-muted-foreground">Qté : {item.quantity}</p>
                                            </div>
                                            <p className="text-xs font-bold text-foreground tabular-nums shrink-0">{(parseFloat(item.prix_unitaire || 0) * item.quantity).toLocaleString()} GNF</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-2 pt-4 border-t border-border text-sm">
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Sous-total</span>
                                        <span className="font-medium text-foreground tabular-nums">{(cartTotal || 0).toLocaleString()} GNF</span>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground">
                                        <span className="flex items-center gap-1.5"><Truck className="size-3.5 text-primary" /> Livraison</span>
                                        <span className="font-medium text-foreground tabular-nums">{DELIVERY_FEE.toLocaleString()} GNF</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
                                        <span className="text-foreground">Total</span>
                                        <span className="text-primary tabular-nums">{total.toLocaleString()} GNF</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                                    <ShieldCheck className="size-4 text-emerald-500 shrink-0" />
                                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{t('ckSecureTransac') || 'Transaction sécurisée'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
