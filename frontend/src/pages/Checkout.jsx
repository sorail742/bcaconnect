import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ShieldCheck, CreditCard, Truck, Package, ArrowRight, Lock, CheckCircle2, ChevronRight, Home, Smartphone, Zap, ArrowLeft, Info, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import orderService from '../services/orderService';
import walletService from '../services/walletService';
import { useLanguage } from '../context/LanguageContext';

const DELIVERY_FEE = 50000;

const Field = ({ label, ...props }) => (
    <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</label>
        <input className="h-10 w-full px-3 bg-background border border-border rounded-xl text-sm outline-none focus:border-primary/50 transition-all text-foreground placeholder:text-muted-foreground" {...props} />
    </div>
);

const Checkout = () => {
    const { t } = useLanguage();
    const { cartItems, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [step, setStep] = useState(1);
    const [wallet, setWallet] = useState(null);

    const [formData, setFormData] = useState({
        prenom: '', nom: user?.nom_complet || '', email: user?.email || '',
        telephone: user?.telephone || '', adresse: '', ville: 'Conakry',
        quartier: '', notes: '', paymentMethod: 'wallet'
    });

    const total = (cartTotal || 0) + DELIVERY_FEE;

    useEffect(() => { if (cartItems.length === 0) navigate('/marketplace'); }, [cartItems, navigate]);
    useEffect(() => {
        walletService.getMyWallet().then(setWallet).catch(() => {});
    }, []);

    const handleChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

    const validateStep1 = () => {
        if (!formData.nom || !formData.telephone || !formData.adresse || !formData.quartier) {
            toast.error('Veuillez remplir tous les champs obligatoires.');
            return false;
        }
        return true;
    };

    const handleProcessOrder = async () => {
        try {
            setIsSubmitting(true);
            if (formData.paymentMethod === 'wallet') {
                const balance = wallet ? parseFloat(wallet.solde_virtuel) : 0;
                if (balance < total) { toast.error('Solde insuffisant.'); setIsSubmitting(false); return; }
            }
            const response = await orderService.createOrder({
                items: cartItems.map(item => ({ produit_id: item.id, quantite: item.quantity, prix_unitaire: parseFloat(item.prix_unitaire || 0) })),
                shipping_address: `${formData.adresse}, ${formData.quartier}, ${formData.ville}`,
                total_amount: total, payment_method: formData.paymentMethod,
                customer_phone: formData.telephone,
                customer_name: `${formData.prenom} ${formData.nom}`.trim()
            });
            if (response.success || response.id) {
                toast.success('Commande validée avec succès !');
                clearCart();
                navigate('/orders');
            }
        } catch (error) {
            toast.error(error.message || 'Erreur lors de la validation.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (cartItems.length === 0) return null;

    return (
        <div className="bg-background min-h-screen text-foreground pb-16">
            <div className="max-w-6xl mx-auto px-6 md:px-12 pt-24 space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
                    <div className="space-y-3">
                        <button onClick={() => navigate('/cart')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                            <ArrowLeft className="size-4" /> Modifier le panier
                        </button>
                        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                            {t('ckSecureCheckout') || 'Paiement'} <span className="text-primary">sécurisé</span>
                        </h1>
                        <div className="flex items-center gap-3 text-sm">
                            {[{ n: 1, label: t('ckLogistics') || 'Livraison' }, { n: 2, label: t('ckTransaction') || 'Paiement' }].map(s => (
                                <React.Fragment key={s.n}>
                                    <span className={cn("flex items-center gap-2 font-medium transition-all", step >= s.n ? "text-primary" : "text-muted-foreground")}>
                                        <span className={cn("size-6 rounded-full flex items-center justify-center text-xs font-bold", step >= s.n ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground border border-border")}>{s.n}</span>
                                        {s.label}
                                    </span>
                                    {s.n < 2 && <ChevronRight className="size-4 text-muted-foreground" />}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                        <Lock className="size-4 text-emerald-500" />
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{t('ckDataProtection') || 'Données protégées'}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {step === 1 ? (
                            <div className="space-y-6">
                                <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-5">
                                    <div className="flex items-center gap-3 pb-4 border-b border-border">
                                        <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center"><Home className="size-4 text-primary" /></div>
                                        <h3 className="text-sm font-bold text-foreground">{t('ckShippingCoords') || 'Coordonnées de livraison'}</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Field label={t('ckFirstName') || 'Prénom'} name="prenom" value={formData.prenom} onChange={handleChange} placeholder="Jean" />
                                        <Field label={`${t('ckLastName') || 'Nom'} *`} name="nom" value={formData.nom} onChange={handleChange} placeholder="Sylla" />
                                        <Field label={`${t('ckPhone') || 'Téléphone'} *`} name="telephone" value={formData.telephone} onChange={handleChange} placeholder="+224 6XX XX XX XX" />
                                        <Field label={t('ckEmailOptional') || 'Email (optionnel)'} name="email" type="email" value={formData.email} onChange={handleChange} placeholder="email@exemple.com" />
                                    </div>
                                </div>

                                <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-5">
                                    <div className="flex items-center gap-3 pb-4 border-b border-border">
                                        <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center"><Truck className="size-4 text-primary" /></div>
                                        <h3 className="text-sm font-bold text-foreground">{t('ckLogisticsProtocol') || 'Adresse de livraison'}</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t('ckCity') || 'Ville'}</label>
                                            <input disabled value={formData.ville} className="h-10 w-full px-3 bg-muted border border-border rounded-xl text-sm text-muted-foreground cursor-not-allowed" />
                                        </div>
                                        <Field label={`${t('ckDistrict') || 'Quartier'} *`} name="quartier" value={formData.quartier} onChange={handleChange} placeholder="Kipe / Ratoma" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{`${t('ckPreciseAddress') || 'Adresse précise'} *`}</label>
                                        <textarea name="adresse" value={formData.adresse} onChange={handleChange} placeholder="Bureau / Domicile - Indications spécifiques" rows={3}
                                            className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm outline-none focus:border-primary/50 transition-all text-foreground placeholder:text-muted-foreground resize-none" />
                                    </div>
                                </div>

                                <Button onClick={() => validateStep1() && setStep(2)}
                                    className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-bold text-sm border-none hover:bg-primary/90 flex items-center justify-center gap-2">
                                    {t('ckGoToPayment') || 'Continuer vers le paiement'} <ArrowRight className="size-4" />
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-5">
                                    <div className="flex items-center gap-3 pb-4 border-b border-border">
                                        <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center"><CreditCard className="size-4 text-primary" /></div>
                                        <h3 className="text-sm font-bold text-foreground">{t('ckPaymentMethod') || 'Mode de paiement'}</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[
                                            { key: 'wallet', icon: Zap, label: t('ckBcaWallet') || 'Portefeuille BCA', sub: wallet ? `Solde : ${parseFloat(wallet.solde_virtuel).toLocaleString()} GNF` : t('ckInstantSecure') || 'Paiement instantané', color: 'primary' },
                                            { key: 'cod', icon: Smartphone, label: t('ckCashAtBusiness') || 'Paiement à la livraison', sub: t('ckMobileMoney') || 'Mobile Money / Espèces', color: 'emerald' },
                                        ].map(opt => (
                                            <button key={opt.key} onClick={() => setFormData(p => ({ ...p, paymentMethod: opt.key }))}
                                                className={cn("p-4 rounded-xl border-2 transition-all text-left flex items-start gap-3 relative",
                                                    formData.paymentMethod === opt.key
                                                        ? opt.color === 'primary' ? "border-primary bg-primary/5" : "border-emerald-500 bg-emerald-500/5"
                                                        : "border-border bg-muted hover:border-primary/30"
                                                )}>
                                                <div className={cn("size-9 rounded-lg flex items-center justify-center shrink-0",
                                                    formData.paymentMethod === opt.key
                                                        ? opt.color === 'primary' ? "bg-primary text-primary-foreground" : "bg-emerald-500 text-white"
                                                        : "bg-background border border-border text-muted-foreground"
                                                )}>
                                                    <opt.icon className="size-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-foreground">{opt.label}</p>
                                                    <p className="text-xs text-muted-foreground mt-0.5">{opt.sub}</p>
                                                </div>
                                                {formData.paymentMethod === opt.key && (
                                                    <CheckCircle2 className={cn("size-4 absolute top-3 right-3", opt.color === 'primary' ? "text-primary" : "text-emerald-500")} />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl">
                                        <Info className="size-4 text-primary shrink-0" />
                                        <p className="text-xs text-muted-foreground">{t('ckAgreement') || 'En confirmant, vous acceptez nos conditions générales de vente.'}</p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button onClick={() => setStep(1)} className="h-11 px-5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all flex items-center gap-2">
                                        <ArrowLeft className="size-4" /> {t('ckBack') || 'Retour'}
                                    </button>
                                    <Button onClick={handleProcessOrder} disabled={isSubmitting}
                                        className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground font-bold text-sm border-none hover:bg-primary/90 flex items-center justify-center gap-2 disabled:opacity-60">
                                        {isSubmitting ? <><div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Traitement...</>
                                            : <><ShieldCheck className="size-4" /> {t('ckConfirmAcquisition') || 'Confirmer la commande'}</>}
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
