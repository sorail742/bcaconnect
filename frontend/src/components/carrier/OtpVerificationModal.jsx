import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import deliveryService from '../../services/deliveryService';
import { useLanguage } from '../../context/useLanguage';

const OtpVerificationModal = ({ isOpen, onClose, orderId, onSuccess }) => {
    const { t } = useLanguage();
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!otp || otp.length < 6) {
            toast.error(t('otpInvalid'));
            return;
        }

        setLoading(true);
        try {
            await deliveryService.verifyDelivery(orderId, otp);
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
