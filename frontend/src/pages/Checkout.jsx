import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout';
import { Button } from '../components/ui/Button';
import {
    ShieldCheck, CreditCard, Truck, Package, ArrowRight,
    Lock, CheckCircle2, ChevronRight, Home, Smartphone,
    Zap, ArrowLeft, Info, AlertCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import orderService from '../services/orderService';
import walletService from '../services/walletService';

const DELIVERY_FEE = 50000;

const Checkout = () => {
    const { cartItems, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [step, setStep] = useState(1); // 1: Expédition, 2: Paiement
    const [wallet, setWallet] = useState(null);

    const [formData, setFormData] = useState({
        prenom: '',
        nom: user?.nom_complet || '',
        email: user?.email || '',
        telephone: user?.telephone || '',
        adresse: user?.adresse || '',
        ville: 'Conakry',
        quartier: '',
        notes: '',
        paymentMethod: 'wallet'
    });

    const total = (cartTotal || 0) + DELIVERY_FEE;

    useEffect(() => {
        if (cartItems.length === 0) {
            navigate('/catalog');
        }
    }, [cartItems, navigate]);

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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateStep1 = () => {
        const required = ['nom', 'telephone', 'adresse', 'quartier'];
        const missing = required.filter(field => !formData[field]);
        if (missing.length > 0) {
            toast.error("Veuillez renseigner tous les champs obligatoires.");
            return false;
        }
        return true;
    };

    const handleProcessOrder = async () => {
        try {
            setIsSubmitting(true);

            if (formData.paymentMethod === 'wallet') {
                const balance = wallet ? parseFloat(wallet.solde_virtuel) : 0;
                if (balance < total) {
                    toast.error("Solde BCA Wallet insuffisant pour cette acquisition.");
                    setIsSubmitting(false);
                    return;
                }
            }

            const orderData = {
                items: cartItems.map(item => ({
                    produit_id: item.id,
                    quantite: item.quantity,
                    prix_unitaire: parseFloat(item.prix_unitaire || item.prix || 0)
                })),
                shipping_address: `${formData.adresse}, ${formData.quartier}, ${formData.ville}`,
                total_amount: total,
                payment_method: formData.paymentMethod,
                customer_phone: formData.telephone,
                customer_name: `${formData.prenom} ${formData.nom}`.trim()
            };

            const response = await orderService.createOrder(orderData);

            if (response.success || response.id) {
                toast.success("Protocole d'acquisition validé avec succès !");
                clearCart();
                navigate('/orders');
            }
        } catch (error) {
            console.error("Erreur commande:", error);
            toast.error(error.message || "Échec de la validation du protocole.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (cartItems.length === 0) return null;

    return (
        <PublicLayout>
            <div className="bg-[#0A0D14] min-h-screen text-white font-inter pb-40">
                <div className="max-w-7xl mx-auto px-6 md:px-12 pt-32 space-y-20 animate-in fade-in duration-1000">

                    {/* ══ EXECUTIVE HEADER ══ */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 border-b-8 border-white/5 pb-16">
                        <div className="space-y-8">
                            <button
                                onClick={() => navigate(-1)}
                                className="flex items-center gap-4 text-slate-500 hover:text-[#FF6600] text-[10px] font-black uppercase tracking-[0.5em] transition-all group italic"
                            >
                                <ArrowLeft className="size-4 group-hover:-translate-x-2 transition-transform" /> MODIFIER LA SESSION
                            </button>
                            <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-white italic uppercase leading-[0.8]">
                                FINALISATION <br /> <span className="text-[#FF6600] not-italic">SÉCURISÉE.</span>
                            </h1>
                            <div className="flex items-center gap-8 text-[11px] font-black uppercase tracking-[0.4em] italic text-slate-500 mt-10">
                                <span className={cn("flex items-center gap-4 transition-colors", step >= 1 ? "text-[#FF6600]" : "")}>
                                    <div className={cn("size-6 rounded-lg flex items-center justify-center text-[10px] border-2 transition-all", step >= 1 ? "bg-[#FF6600] border-[#FF6600] text-white" : "border-white/10")}>1</div>
                                    LOGISTIQUE
                                </span>
                                <ChevronRight className="size-4 opacity-20" />
                                <span className={cn("flex items-center gap-4 transition-colors", step >= 2 ? "text-[#FF6600]" : "")}>
                                    <div className={cn("size-6 rounded-lg flex items-center justify-center text-[10px] border-2 transition-all", step >= 2 ? "bg-[#FF6600] border-[#FF6600] text-white" : "border-white/10")}>2</div>
                                    TRANSAC
                                </span>
                            </div>
                        </div>
                        <div className="hidden lg:flex items-center gap-10">
                            <div className="flex flex-col items-end gap-2">
                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">PROTECTION DES DONNÉES</span>
                                <span className="text-xs font-black text-emerald-500 uppercase tracking-widest flex items-center gap-3 italic">
                                    <Lock className="size-4" /> CRYPTAGE AES-256 BIT
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
                        {/* ══ FORM CONTENT ══ */}
                        <div className="lg:col-span-8 space-y-16">

                            {step === 1 ? (
                                <div className="space-y-16 animate-in slide-in-from-right-10 duration-700">
                                    <div className="space-y-10">
                                        <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white flex items-center gap-6">
                                            <Home className="size-8 text-[#FF6600]" /> COORDONNÉES D'EXPÉDITION
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">PRÉNOM</label>
                                                <input
                                                    name="prenom"
                                                    value={formData.prenom}
                                                    onChange={handleInputChange}
                                                    placeholder="JEAN"
                                                    className="w-full h-20 bg-white/[0.02] border-4 border-white/5 rounded-3xl px-8 font-black uppercase text-sm tracking-widest focus:border-[#FF6600]/40 focus:ring-0 transition-all placeholder:text-slate-800"
                                                />
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">NOM / NOM COMPLET</label>
                                                <input
                                                    name="nom"
                                                    value={formData.nom}
                                                    onChange={handleInputChange}
                                                    placeholder="SYLLA"
                                                    className="w-full h-20 bg-white/[0.02] border-4 border-white/5 rounded-3xl px-8 font-black uppercase text-sm tracking-widest focus:border-[#FF6600]/40 focus:ring-0 transition-all placeholder:text-slate-800"
                                                />
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">TÉLÉPHONE DE CONTACT</label>
                                                <input
                                                    name="telephone"
                                                    value={formData.telephone}
                                                    onChange={handleInputChange}
                                                    placeholder="+224 6XX XX XX XX"
                                                    className="w-full h-20 bg-white/[0.02] border-4 border-white/5 rounded-3xl px-8 font-black uppercase text-sm tracking-widest focus:border-[#FF6600]/40 focus:ring-0 transition-all placeholder:text-slate-800"
                                                />
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">EMAIL (OPTIONNEL)</label>
                                                <input
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    placeholder="EXECUTIVE@BCA.COM"
                                                    className="w-full h-20 bg-white/[0.02] border-4 border-white/5 rounded-3xl px-8 font-black uppercase text-sm tracking-widest focus:border-[#FF6600]/40 focus:ring-0 transition-all placeholder:text-slate-800"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-10">
                                        <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white flex items-center gap-6">
                                            <Truck className="size-8 text-[#FF6600]" /> PROTOCOLE LOGISTIQUE
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">VILLE</label>
                                                <input
                                                    name="ville"
                                                    value={formData.ville}
                                                    disabled
                                                    className="w-full h-20 bg-white/[0.01] border-4 border-white/5 rounded-3xl px-8 font-black uppercase text-sm tracking-widest text-slate-500 cursor-not-allowed italic"
                                                />
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">QUARTIER</label>
                                                <input
                                                    name="quartier"
                                                    value={formData.quartier}
                                                    onChange={handleInputChange}
                                                    placeholder="KIPE / RATOMA"
                                                    className="w-full h-20 bg-white/[0.02] border-4 border-white/5 rounded-3xl px-8 font-black uppercase text-sm tracking-widest focus:border-[#FF6600]/40 focus:ring-0 transition-all placeholder:text-slate-800"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">ADRESSE PRÉCISE</label>
                                            <textarea
                                                name="adresse"
                                                value={formData.adresse}
                                                onChange={handleInputChange}
                                                placeholder="BUREAU / DOMICILE - INDICATIONS SPÉCIFIQUES"
                                                rows={3}
                                                className="w-full bg-white/[0.02] border-4 border-white/5 rounded-3xl p-8 font-black uppercase text-sm tracking-widest focus:border-[#FF6600]/40 focus:ring-0 transition-all placeholder:text-slate-800 resize-none"
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => validateStep1() && setStep(2)}
                                        className="w-full h-24 rounded-[2.5rem] bg-[#FF6600] font-black uppercase tracking-[0.4em] text-xs gap-6 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-[#FF6600]/30 border-4 border-[#FF6600] italic group relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                                        PASSER AU PAIEMENT SÉCURISÉ
                                        <ArrowRight className="size-6 transition-transform group-hover:translate-x-2" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-16 animate-in slide-in-from-right-10 duration-700">
                                    <div className="space-y-10">
                                        <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white flex items-center gap-6">
                                            <CreditCard className="size-8 text-[#FF6600]" /> MÉTHODE DE RÈGLEMENT
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            <button
                                                onClick={() => setFormData(p => ({ ...p, paymentMethod: 'wallet' }))}
                                                className={cn(
                                                    "p-10 rounded-[3rem] border-4 transition-all flex flex-col items-center text-center gap-6 group relative overflow-hidden",
                                                    formData.paymentMethod === 'wallet' ? "border-[#FF6600] bg-[#FF6600]/10 shadow-2xl shadow-[#FF6600]/20" : "border-white/5 bg-white/[0.02] hover:border-white/20"
                                                )}
                                            >
                                                <div className={cn("size-20 rounded-[1.5rem] flex items-center justify-center transition-all", formData.paymentMethod === 'wallet' ? "bg-[#FF6600] text-white" : "bg-white/5 text-slate-700")}>
                                                    <Zap className="size-10" />
                                                </div>
                                                <div className="space-y-2 relative z-10">
                                                    <p className="text-xl font-black italic uppercase text-white tracking-tighter">BCA WALLET</p>
                                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">INSTANTANÉ • SÉCURISÉ</p>
                                                </div>
                                                {formData.paymentMethod === 'wallet' && (
                                                    <div className="absolute top-6 right-6">
                                                        <CheckCircle2 className="size-8 text-[#FF6600]" />
                                                    </div>
                                                )}
                                            </button>

                                            <button
                                                onClick={() => setFormData(p => ({ ...p, paymentMethod: 'cod' }))}
                                                className={cn(
                                                    "p-10 rounded-[3rem] border-4 transition-all flex flex-col items-center text-center gap-6 group relative overflow-hidden",
                                                    formData.paymentMethod === 'cod' ? "border-emerald-500 bg-emerald-500/10 shadow-2xl shadow-emerald-500/20" : "border-white/5 bg-white/[0.02] hover:border-white/20"
                                                )}
                                            >
                                                <div className={cn("size-20 rounded-[1.5rem] flex items-center justify-center transition-all", formData.paymentMethod === 'cod' ? "bg-emerald-500 text-white" : "bg-white/5 text-slate-700")}>
                                                    <Smartphone className="size-10" />
                                                </div>
                                                <div className="space-y-2 relative z-10">
                                                    <p className="text-xl font-black italic uppercase text-white tracking-tighter">CASH À LIVRAISON</p>
                                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">MOBILE MONEY • ESPÈCES</p>
                                                </div>
                                                {formData.paymentMethod === 'cod' && (
                                                    <div className="absolute top-6 right-6">
                                                        <CheckCircle2 className="size-8 text-emerald-500" />
                                                    </div>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-10 rounded-[3rem] bg-white/[0.02] border-4 border-white/5 space-y-8 italic">
                                        <div className="flex items-center gap-6 text-[#FF6600]">
                                            <Info className="size-8 shrink-0" />
                                            <p className="text-[11px] font-black uppercase tracking-widest leading-loose">
                                                EN CLIQUANT SUR "CONFIRMER L'ACQUISITION", VOUS ACCEPTEZ LES PROTOCOLES DE SÉQUESTRE ET LES CONDITIONS GÉNÉRALES DE TRANSACTION DE BCA CONNECT.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-8">
                                        <button
                                            onClick={() => setStep(1)}
                                            className="h-24 px-12 rounded-[2.5rem] border-4 border-white/5 bg-white/[0.02] font-black uppercase tracking-[0.4em] text-[10px] text-slate-500 hover:text-white hover:border-white/10 transition-all italic flex items-center justify-center gap-6"
                                        >
                                            <ArrowLeft className="size-5" /> RETOUR LOGISTIQUE
                                        </button>
                                        <Button
                                            onClick={handleProcessOrder}
                                            disabled={isSubmitting}
                                            className="flex-1 h-24 rounded-[2.5rem] bg-[#FF6600] font-black uppercase tracking-[0.4em] text-xs gap-8 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-[#FF6600]/30 border-4 border-[#FF6600] italic group relative overflow-hidden"
                                        >
                                            {isSubmitting ? (
                                                <div className="flex items-center gap-6">
                                                    <div className="size-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                                                    TRAITEMENT DU PROTOCOLE...
                                                </div>
                                            ) : (
                                                <>
                                                    <ShieldCheck className="size-7" />
                                                    CONFIRMER L'ACQUISITION
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* ══ SUMMARY SIDEBAR ══ */}
                        <div className="lg:col-span-4 sticky top-32">
                            <div className="rounded-[4rem] bg-white/[0.02] border-4 border-white/5 overflow-hidden shadow-2xl relative">
                                <div className="absolute inset-x-0 top-0 h-2 bg-[#FF6600]"></div>

                                <div className="p-10 border-b-4 border-white/5 bg-white/[0.01] backdrop-blur-3xl flex items-center justify-between">
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-white flex items-center gap-6 italic leading-none">
                                        <Package className="size-5 text-[#FF6600]" /> RÉSUMÉ D'ACTIFS
                                    </h3>
                                    <span className="bg-white/5 px-4 py-1.5 rounded-full text-[9px] font-black text-slate-500 italic uppercase">
                                        {cartItems.length} ITEM{cartItems.length > 1 ? 'S' : ''}
                                    </span>
                                </div>

                                <div className="p-10 space-y-8 max-h-[40vh] overflow-y-auto custom-scrollbar">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="flex gap-6 group">
                                            <div className="size-20 rounded-2xl bg-white/5 border-2 border-white/5 overflow-hidden shrink-0 group-hover:border-[#FF6600]/20 transition-all">
                                                <img src={item.image_url || item.image || '/placeholder.png'} alt="" className="w-full h-full object-cover mix-blend-luminosity group-hover:mix-blend-normal transition-all" />
                                            </div>
                                            <div className="flex-1 min-w-0 flex flex-col justify-center gap-2">
                                                <p className="text-sm font-black italic uppercase text-white truncate group-hover:text-[#FF6600] transition-colors">{item.nom_produit || item.name}</p>
                                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic flex justify-between items-center">
                                                    <span>QTE: {item.quantity}</span>
                                                    <span className="text-white">{(parseFloat(item.prix_unitaire || item.prix || 0) * item.quantity).toLocaleString()} GNF</span>
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-10 pt-0 bg-white/[0.01] border-t-4 border-white/5 space-y-10">
                                    <div className="pt-10 space-y-6">
                                        <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic">
                                            <span>BASE D'ACQUISITION</span>
                                            <span className="text-white text-lg tracking-tighter">{(cartTotal || 0).toLocaleString()} <span className="text-[8px] text-slate-700 ml-1">GNF</span></span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic">
                                            <span className="flex items-center gap-4"><Truck className="size-4 text-[#FF6600]" /> LOGISTIQUE</span>
                                            <span className="text-white text-lg tracking-tighter">{DELIVERY_FEE.toLocaleString()} <span className="text-[8px] text-slate-700 ml-1">GNF</span></span>
                                        </div>
                                    </div>

                                    <div className="pt-10 border-t-4 border-white/5">
                                        <div className="space-y-4">
                                            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-[#FF6600] italic leading-none">TOTAL GLOBAL DÉBITÉ</p>
                                            <div className="flex items-baseline gap-4">
                                                <p className="text-6xl font-black tracking-tighter text-white italic leading-none">{total.toLocaleString()}</p>
                                                <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.4em] italic leading-none mb-1">GNF</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="py-8 px-8 rounded-[2.5rem] bg-emerald-500/5 border-2 border-emerald-500/20 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <ShieldCheck className="size-5 text-emerald-500" />
                                            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest italic leading-none">TRANSACTION SÉCURISÉE</span>
                                        </div>
                                        <Lock className="size-4 text-emerald-500 opacity-40" />
                                    </div>
                                </div>
                            </div>

                            {/* Alert Box */}
                            <div className="mt-12 p-8 rounded-[3rem] bg-[#FF6600]/5 border-2 border-[#FF6600]/20 flex gap-6 italic">
                                <AlertCircle className="size-6 text-[#FF6600] shrink-0 animate-pulse" />
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-loose">
                                    ASSUREZ-VOUS QUE VOS COORDONNÉES SONT EXACTES. UNE FOIS LE PROTOCOLE LANCÉ, LA LOGISTIQUE S'ACTIVE DANS LES <span className="text-white">60 MINUTES</span> SUIVANTES.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};

export default Checkout;
