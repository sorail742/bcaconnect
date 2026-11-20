import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Loader2, QrCode, Keyboard } from 'lucide-react';
import { toast } from 'sonner';
import deliveryService from '../services/deliveryService';
import { useLanguage } from '../../context/useLanguage';

const QR_READER_ID = 'otp-qr-reader';

const OtpVerificationModal = ({ isOpen, onClose, orderId, onSuccess }) => {
    const { t } = useLanguage();
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [scanMode, setScanMode] = useState(false);
    const scannerRef = useRef(null);

    const submitOtp = async (code) => {
        if (!code || code.length < 6) {
            toast.error(t('otpInvalid'));
            return;
        }
        setLoading(true);
        try {
            await deliveryService.verifyDelivery(orderId, code);
            toast.success(t('otpSuccess'));
            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || t('otpError'));
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await submitOtp(otp);
    };

    // Scanner caméra : démarre/arrête proprement avec le mode scan et la fermeture du modal.
    useEffect(() => {
        if (!isOpen || !scanMode) return undefined;
        let isMounted = true;

        import('html5-qrcode').then(({ Html5Qrcode }) => {
            if (!isMounted) return;
            const scanner = new Html5Qrcode(QR_READER_ID);
            scannerRef.current = scanner;

            scanner.start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: { width: 220, height: 220 } },
                (decodedText) => {
                    const code = decodedText.replace(/\D/g, '').slice(0, 6);
                    if (code.length === 6) {
                        setOtp(code);
                        setScanMode(false);
                        submitOtp(code);
                    }
                },
                () => { /* frame sans QR détecté — silencieux */ },
            ).catch(() => {
                toast.error("Impossible d'accéder à la caméra. Utilisez la saisie manuelle.");
                setScanMode(false);
            });
        });

        return () => {
            isMounted = false;
            const scanner = scannerRef.current;
            if (scanner) {
                scanner.stop().then(() => scanner.clear()).catch(() => {});
                scannerRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, scanMode, orderId]);

    useEffect(() => {
        if (!isOpen) setScanMode(false);
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />
                    
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl overflow-hidden"
                    >
                        {/* Glow Effect */}
                        <div className="absolute -top-24 -left-24 size-48 bg-emerald-500/10 blur-[100px]" />
                        
                        <button 
                            onClick={onClose}
                            className="absolute top-6 right-6 text-muted-foreground hover:text-white transition-colors"
                        >
                            <X className="size-5" />
                        </button>

                        <div className="flex flex-col items-center text-center space-y-6">
                            <div className="size-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                                <ShieldCheck className="size-8" />
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-xl font-black text-white uppercase tracking-tight">
                                    {t('otpTitle').split(' ')[0]} <span className="text-emerald-500">{t('otpTitle').split(' ')[1] || 'OTP'}</span>.
                                </h2>
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-relaxed">
                                    {t('otpDesc')}
                                </p>
                            </div>

                            {/* Bascule saisie manuelle / scan QR — le QR encode le même code OTP,
                                c'est juste une méthode de saisie plus rapide. */}
                            <div className="w-full grid grid-cols-2 gap-2 p-1 bg-black/40 rounded-2xl border border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setScanMode(false)}
                                    className={`h-10 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${!scanMode ? 'bg-emerald-500 text-slate-900' : 'text-muted-foreground'}`}
                                >
                                    <Keyboard className="size-4" /> Saisie
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setScanMode(true)}
                                    className={`h-10 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${scanMode ? 'bg-emerald-500 text-slate-900' : 'text-muted-foreground'}`}
                                >
                                    <QrCode className="size-4" /> Scanner QR
                                </button>
                            </div>

                            {scanMode ? (
                                <div className="w-full space-y-3">
                                    <div id={QR_READER_ID} className="w-full rounded-2xl overflow-hidden border-2 border-slate-800 [&_video]:!w-full" />
                                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                                        Visez le QR code affiché par le client
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="w-full space-y-6">
                                    <input
                                        type="text"
                                        maxLength={6}
                                        placeholder="000000"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                        className="w-full h-16 bg-black/50 border-2 border-slate-800 rounded-2xl text-center text-3xl font-black tracking-[0.5em] text-emerald-500 focus:border-emerald-500/50 focus:ring-0 transition-all placeholder:text-slate-800 placeholder:tracking-normal"
                                        autoFocus
                                    />

                                    <button
                                        type="submit"
                                        disabled={loading || otp.length < 6}
                                        className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-500 text-slate-900 font-black text-[11px] rounded-2xl transition-all shadow-lg shadow-emerald-500/20 uppercase tracking-widest flex items-center justify-center gap-3"
                                    >
                                        {loading ? (
                                            <Loader2 className="size-5 animate-spin" />
                                        ) : (
                                            <>
                                                <ShieldCheck className="size-5" />
                                                {t('otpConfirm')}
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}

                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-50 underline decoration-emerald-500/20 underline-offset-4">
                                {t('otpProtocol')}
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default OtpVerificationModal;
