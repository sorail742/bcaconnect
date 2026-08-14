import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Smartphone, ArrowRight, Loader2, CheckCircle2, AlertTriangle, Zap } from 'lucide-react';
import { toast } from 'sonner';
import walletService from '../services/walletService';
import { getOrdersRoute } from '../../constants/roles';
import useAuthStore from '../../store/authStore';

const PaymentSimulation = () => {
    const { transactionId } = useParams();
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);
    const [status, setStatus] = useState('pending');
    const [amount, setAmount] = useState(0);
    const [isOrderPayment, setIsOrderPayment] = useState(false);

    useEffect(() => {
        if (!transactionId) return;
        walletService.getPaymentStatus(transactionId)
            .then((data) => {
                if (data.montant) setAmount(data.montant);
                setIsOrderPayment(Boolean(data.order_id || data.type === 'order'));
            })
            .catch(() => {
                setAmount(150000);
            });
    }, [transactionId]);

    const successRoute = isOrderPayment
        ? getOrdersRoute(user?.role)
        : (user?.role === 'technicien' ? '/technician/wallet' : '/wallet');

    const handleConfirm = async () => {
        try {
            setStatus('processing');
            const result = await walletService.captureSimulation(transactionId);
            const paidOrder = Boolean(result.order_id);

            setTimeout(() => {
                setStatus('success');
                toast.success(
                    paidOrder
                        ? 'Paiement commande confirmé — séquestre activé !'
                        : 'Paiement confirmé ! Votre portefeuille a été crédité.',
                );
                setTimeout(() => navigate(paidOrder ? getOrdersRoute(user?.role) : successRoute), 2500);
            }, 1500);
        } catch {
            setStatus('error');
            toast.error('Erreur lors de la confirmation du paiement.');
        }
    };

    return (
        <div className="min-h-screen bg-muted flex items-center justify-center p-4 font-sans antialiased">
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-card rounded-2xl shadow-2xl shadow-slate-200/50 border border-border overflow-hidden relative z-10"
            >
                <div className="bg-[#1CA0DB] p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Zap className="size-24 rotate-12" />
                    </div>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="size-10 rounded-xl bg-card/20 backdrop-blur-md flex items-center justify-center">
                            <Smartphone className="size-6" />
                        </div>
                        <h1 className="font-black uppercase tracking-widest text-sm">BCA Secure Pay</h1>
                    </div>
                    <div className="space-y-1">
                        <p className="text-white/80 text-xs font-bold uppercase tracking-wider">Montant à régler</p>
                        <p className="text-4xl font-black">{amount.toLocaleString()} <span className="text-xl opacity-80">GNF</span></p>
                    </div>
                </div>

                <div className="p-8 space-y-8">
                    {status === 'pending' && (
                        <>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-muted rounded-2xl border border-border">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                            <ShieldCheck className="size-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Transaction ID</p>
                                            <p className="text-xs font-black text-foreground/80">#{transactionId?.substring(0, 8).toUpperCase()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Type</p>
                                        <p className="text-xs font-black text-foreground/80">{isOrderPayment ? 'Commande' : 'Recharge wallet'}</p>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed px-2 text-center">
                                    Simulation de passerelle Mobile Money (Orange / Wave).
                                </p>
                            </div>

                            <button
                                onClick={handleConfirm}
                                className="w-full h-12 bg-[#1CA0DB] hover:bg-[#0e86b4] text-white rounded-2xl font-black text-lg transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-3 group active:scale-[0.98]"
                            >
                                Confirmer le paiement
                                <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </>
                    )}

                    {status === 'processing' && (
                        <div className="py-12 flex flex-col items-center justify-center space-y-6 text-center">
                            <Loader2 className="size-12 text-blue-500 animate-spin" />
                            <div className="space-y-2">
                                <h2 className="text-xl font-black text-foreground tracking-tight">Traitement en cours</h2>
                                <p className="text-sm text-muted-foreground">Vérification avec l&apos;opérateur...</p>
                            </div>
                        </div>
                    )}

                    {status === 'success' && (
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="py-12 flex flex-col items-center justify-center space-y-6 text-center"
                        >
                            <div className="size-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-2">
                                <CheckCircle2 className="size-10" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-black text-foreground tracking-tight">Paiement réussi !</h2>
                                <p className="text-sm text-muted-foreground px-8">
                                    {isOrderPayment
                                        ? 'Votre commande est confirmée.'
                                        : 'Votre portefeuille BCA est crédité.'}
                                </p>
                            </div>
                            <button 
                                onClick={() => navigate(successRoute)}
                                className="px-8 h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
                            >
                                {isOrderPayment ? 'Voir mes commandes' : 'Retour au portefeuille'}
                            </button>
                        </motion.div>
                    )}

                    {status === 'error' && (
                        <div className="py-12 flex flex-col items-center justify-center space-y-6 text-center">
                            <div className="size-20 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                                <AlertTriangle className="size-10" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-xl font-black text-foreground">Échec du paiement</h2>
                                <p className="text-sm text-muted-foreground">Une erreur technique est survenue.</p>
                            </div>
                            <button
                                onClick={() => setStatus('pending')}
                                className="text-sm font-bold text-blue-600 hover:underline"
                            >
                                Réessayer
                            </button>
                        </div>
                    )}
                </div>

                <div className="p-6 bg-muted border-t border-border flex items-center justify-center gap-2">
                    <div className="size-1.5 rounded-full bg-emerald-500" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Certifié BCA Connect</p>
                </div>
            </motion.div>
        </div>
    );
};

export default PaymentSimulation;
