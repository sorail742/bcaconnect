import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import walletService from '../services/walletService';

const POLL_INTERVAL_MS = 2500;
const MAX_ATTEMPTS = 24;

const PaymentReturn = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('polling');
    const transactionId = searchParams.get('tx');
    const paymentType = searchParams.get('type') || 'wallet';
    const orderId = searchParams.get('order_id');

    useEffect(() => {
        if (!transactionId) {
            setStatus('error');
            return;
        }

        let attempts = 0;
        let cancelled = false;

        const poll = async () => {
            if (cancelled) return;
            attempts += 1;

            try {
                const data = await walletService.getPaymentStatus(transactionId);

                if (data.statut === 'complete') {
                    setStatus('success');
                    toast.success(
                        paymentType === 'order'
                            ? 'Paiement confirmé — votre commande est activée.'
                            : 'Recharge confirmée — votre portefeuille a été crédité.',
                    );
                    setTimeout(() => {
                        navigate(paymentType === 'order' ? '/orders' : '/wallet', { replace: true });
                    }, 2000);
                    return;
                }

                if (data.statut === 'echoue') {
                    setStatus('error');
                    toast.error('Le paiement a échoué.');
                    return;
                }

                if (attempts >= MAX_ATTEMPTS) {
                    setStatus('pending');
                    toast.info('Paiement en cours de validation. Vérifiez votre portefeuille ou vos commandes dans quelques minutes.');
                    return;
                }

                setTimeout(poll, POLL_INTERVAL_MS);
            } catch {
                if (attempts >= MAX_ATTEMPTS) {
                    setStatus('error');
                } else {
                    setTimeout(poll, POLL_INTERVAL_MS);
                }
            }
        };

        poll();
        return () => { cancelled = true; };
    }, [transactionId, paymentType, navigate, orderId]);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-card border border-border rounded-3xl p-10 text-center space-y-6 shadow-xl">
                {status === 'polling' && (
                    <>
                        <Loader2 className="size-14 text-primary animate-spin mx-auto" />
                        <h1 className="text-xl font-bold text-foreground">Validation du paiement</h1>
                        <p className="text-sm text-muted-foreground">
                            Nous confirmons votre transaction avec CinetPay. Ne fermez pas cette page.
                        </p>
                        {transactionId && (
                            <p className="text-xs text-muted-foreground font-mono">#{transactionId.slice(0, 8)}</p>
                        )}
                    </>
                )}
                {status === 'success' && (
                    <>
                        <CheckCircle2 className="size-14 text-emerald-500 mx-auto" />
                        <h1 className="text-xl font-bold text-foreground">Paiement réussi</h1>
                        <p className="text-sm text-muted-foreground">Redirection en cours…</p>
                    </>
                )}
                {status === 'pending' && (
                    <>
                        <Loader2 className="size-14 text-amber-500 mx-auto" />
                        <h1 className="text-xl font-bold text-foreground">Paiement en attente</h1>
                        <p className="text-sm text-muted-foreground">
                            La confirmation peut prendre quelques minutes. Consultez votre {paymentType === 'order' ? 'historique de commandes' : 'portefeuille'}.
                        </p>
                        <button
                            type="button"
                            onClick={() => navigate(paymentType === 'order' ? '/orders' : '/wallet')}
                            className="text-sm font-semibold text-primary hover:underline"
                        >
                            Continuer
                        </button>
                    </>
                )}
                {status === 'error' && (
                    <>
                        <AlertTriangle className="size-14 text-destructive mx-auto" />
                        <h1 className="text-xl font-bold text-foreground">Paiement non confirmé</h1>
                        <button
                            type="button"
                            onClick={() => navigate(paymentType === 'order' ? '/orders' : '/wallet')}
                            className="text-sm font-semibold text-primary hover:underline"
                        >
                            Retour
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default PaymentReturn;
