import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, ShieldCheck, ArrowRight, Store, Truck, CheckCircle2, Phone, Lock, Zap, Briefcase, Globe, Activity, Satellite } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import { toast } from 'sonner';
import { useLanguage } from '../../context/LanguageContext';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const Register = () => {
    const { t, lang } = useLanguage();
    const [formData, setFormData] = useState({
        role: 'client',
        fullName: '',
        email: '',
        telephone: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            const msg = lang === 'FR' ? 'LES MOTS DE PASSE NE CORRESPONDENT PAS.' : 'PASSWORDS DO NOT MATCH.';
            setError(msg);
            toast.error(msg);
            return;
        }

        setIsSubmitting(true);

        try {
            await register({
                nom_complet: formData.fullName,
                email: formData.email,
                telephone: formData.telephone,
                mot_de_passe: formData.password,
                role: formData.role
            });

            toast.success(lang === 'FR' ? "COMPTE CRÉÉ AVEC SUCCÈS ! BIENVENUE." : "ACCOUNT CREATED SUCCESSFULLY! WELCOME.");
            navigate('/login');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || (lang === 'FR' ? "ERREUR LORS DE L'INSCRIPTION." : "ERROR DURING REGISTRATION."));
        } finally {
            setIsSubmitting(false);
        }
    };    return (
        <div className="flex min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-foreground overflow-hidden relative antialiased">
            {/* Design Element: Cyber Grain & Background Matrix */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

            {/* Left Side: Visual Intelligence Hub — Cinematic */}
            <div className="hidden lg:flex flex-1 relative bg-background overflow-hidden items-center justify-center border-r border-white/[0.03]">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-tl from-primary/10 via-transparent to-transparent" />
                    <div className="absolute inset-0 opacity-[0.03]" style={{
                        backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
                        backgroundSize: '4rem 4rem'
                    }} />
                </div>

                <motion.div 
                    initial={{ opacity: 0, x: -60 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="relative z-10 max-w-xl w-full px-16 space-y-16"
                >
                    <div className="inline-flex items-center gap-8 p-8 rounded-3xl bg-white/[0.02] border border-foreground/5 backdrop-blur-xl shadow-2xl skew-x-[4deg] hover:skew-x-0 transition-all duration-1000 cursor-default group overflow-hidden relative">
                         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                         <div className="size-16 rounded-2xl bg-primary text-background flex items-center justify-center shadow-2xl group-hover:rotate-12 transition-transform duration-700">
                            <Briefcase className="size-9 fill-current" />
                         </div>
                         <div className="space-y-2">
                             <p className="text-[12px] font-black text-foreground uppercase " style={{ fontFamily: "'Outfit', sans-serif" }}>{t('registerEcosystem')?.toUpperCase() || "ÉCOSYSTÈME_GOUVERNANCE"}</p>
                             <div className="flex items-center gap-3">
                                 <Activity className="size-3 text-emerald-500 animate-pulse" />
                                 <p className="text-[10px] font-black text-muted-foreground uppercase ">{t('loginJoinBusinesses')?.toUpperCase() || "REJOIGNEZ_LE_RÉSEAU_MONDIAL"}</p>
                             </div>
                         </div>
                    </div>

                    <div className="space-y-10">
                        <h2 className="text-4xl md:text-5xl font-semibold text-foreground tracking-tighter  leading-[0.85]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            INITIALISEZ <br /> <span className="text-primary italic">VOTRE_RÉSEAU</span>.
                        </h2>
                        <p className="text-[13px] font-black text-muted-foreground uppercase  leading-loose border-l-2 border-primary pl-10 opacity-90">
                             PREMIÈRE PLATEFORME COMMERCIALE UNIFIÉE CONÇUE POUR LA PERFORMANCE RÉSEAU ET LA CROISSANCE ACCÉLÉRÉE_V5.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {[
                            t('registerFeature1') || "INTÉGRATION_FLUX_RÉEL",
                            t('registerFeature2') || "SÉCURITÉ_NODALE_MAXIMUM",
                            t('registerFeature3') || "EXPANSION_AFRIQUE_ALPHA"
                        ].map((text, i) => (
                            <motion.div 
                                key={i} 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 + (i * 0.1) }}
                                className="flex items-center gap-8 text-foreground/80 group cursor-default"
                            >
                                <div className="size-8 rounded-xl bg-foreground/5 border border-foreground/10 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-500">
                                    <CheckCircle2 className="size-4 text-primary group-hover:text-background transition-colors" />
                                </div>
                                <span className="text-[11px] font-black  group-hover:text-foreground transition-colors uppercase">{text}</span>
                            </motion.div>
                        ))}
                    </div>

                    {/* Progress Visualization */}
                    <div className="pt-8 space-y-4">
                         <div className="flex items-center justify-between px-2">
                             <span className="text-[8px] font-black text-slate-700 uppercase ">CANAL_OPTIMISATION_FLUX</span>
                             <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest animate-pulse">ONLINE</span>
                         </div>
                         <div className="h-1.5 bg-foreground/5 rounded-full overflow-hidden w-full relative">
                             <motion.div 
                                animate={{ x: ["-100%", "200%"] }}
                                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                                className="absolute inset-y-0 left-0 bg-emerald-500/40 w-1/2 shadow-[0_0_10px_#10b981]" 
                             />
                         </div>
                    </div>
                </motion.div>
            </div>

            {/* Right Side: Identity Terminal Form */}
            <div className="flex-1 flex flex-col justify-center px-10 md:px-20 lg:px-32 xl:px-48 relative z-10 overflow-y-auto py-24">
                <motion.div 
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-md w-full mx-auto space-y-12"
                >
                    
                    {/* Brand Header */}
                    <div className="space-y-12">
                         <Link to="/" className="inline-flex items-center gap-5 transition-all hover:scale-105 active:scale-95 duration-500 group">
                            <div className="size-14 rounded-2xl bg-primary text-background flex items-center justify-center shadow-2xl shadow-primary/20 group-hover:rotate-12 transition-transform duration-700">
                                <Zap className="size-8 fill-current" />
                            </div>
                            <div className="space-y-1">
                                <span className="text-[28px] font-black tracking-tighter uppercase text-foreground block leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                    BCA<span className="text-primary italic">CONNECT</span>
                                </span>
                                <span className="text-[10px] font-black  text-primary opacity-80 leading-none block pt-1">INSCRIPTION_PORTAL_V5</span>
                            </div>
                        </Link>
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="size-2 rounded-full bg-primary animate-pulse shadow-[0_0_12px_#FF5F00]" />
                                <span className="text-[10px] font-black text-primary uppercase  pt-0.5">INTÉGRATION_UNITÉ_RÉSEAU</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-semibold tracking-tighter  leading-[1.1] text-foreground" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                {t('register')?.toUpperCase() || "CRÉER"} <br /> <span className="text-primary italic">IDENTITÉ_NODALE.</span>
                            </h1>
                            <p className="text-[12px] text-muted-foreground font-black uppercase  leading-relaxed border-l-2 border-primary/20 pl-8 opacity-90 max-w-sm">
                                {t('registerSubText')?.toUpperCase() || "SYNCHRONISATION_UNITÉ_POUR_FLUX_DÉCENTRALIŚE"}
                            </p>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="p-6 rounded-2xl bg-rose-500/5 text-rose-500 border border-rose-500/10 flex items-center gap-5 shadow-2xl shadow-rose-500/5"
                            >
                                 <ShieldCheck className="size-6 shrink-0" />
                                 <p className="text-[11px] font-black uppercase tracking-widest leading-none pt-0.5">{error}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-10">
                        {/* Profile Matrix Selection — Ultra Density */}
                        <div className="space-y-4">
                            <label className="text-[9px] font-black uppercase  text-muted-foreground ml-4">CARACTÉRISTIQUES_PROTOCOLE</label>
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { id: 'client', label: t('roleBuyer') || "ACHETEUR", icon: User },
                                    { id: 'fournisseur', label: t('roleSeller') || "VENDEUR", icon: Store },
                                    { id: 'transporteur', label: t('roleCarrier') || "DRIVER", icon: Truck },
                                ].map((role) => (
                                    <label key={role.id} className="relative group/role cursor-pointer">
                                        <input
                                            type="radio"
                                            name="role"
                                            value={role.id}
                                            checked={formData.role === role.id}
                                            onChange={handleChange}
                                            className="sr-only"
                                        />
                                        <div className={cn(
                                            "flex flex-col items-center gap-4 p-5 rounded-2xl border transition-all duration-700  shadow-2xl",
                                            formData.role === role.id 
                                                ? "bg-white text-background border-transparent shadow-primary/20" 
                                                : "bg-white/[0.01] text-slate-600 border-foreground/5 hover:border-primary/40 hover:bg-white/[0.03]"
                                        )}>
                                            <role.icon className={cn("size-5", formData.role === role.id ? "text-primary" : "")} />
                                            <span className="text-[9px] font-black uppercase  text-center leading-none">{role.label}</span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Fields Matrix */}
                        <div className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black uppercase  text-muted-foreground ml-4">DÉSIGNATION_NOM</label>
                                    <div className="relative group/field focus-within:ring-2 ring-primary/10 rounded-2xl overflow-hidden">
                                         <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/field:text-primary size-5 z-10" />
                                         <input name="fullName" value={formData.fullName} onChange={handleChange} placeholder="NOM_COMPLET" className="w-full h-14 pl-14 pr-6 bg-white/[0.02] border border-foreground/5 text-[11px] font-black tracking-widest focus:border-primary/40 outline-none transition-all placeholder:text-slate-800 text-foreground uppercase" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black uppercase  text-muted-foreground ml-4">CANAL_E-MAIL</label>
                                    <div className="relative group/field focus-within:ring-2 ring-primary/10 rounded-2xl overflow-hidden">
                                         <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/field:text-primary size-5 z-10" />
                                         <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="UNITÉ@MAIL.COM" className="w-full h-14 pl-14 pr-6 bg-white/[0.02] border border-foreground/5 text-[11px] font-black tracking-widest focus:border-primary/40 outline-none transition-all placeholder:text-slate-800 text-foreground uppercase" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 text-left">
                                <label className="text-[9px] font-black uppercase  text-muted-foreground ml-4">INDEX_COMMUNICATION</label>
                                <div className="relative group/field focus-within:ring-2 ring-primary/10 rounded-2xl overflow-hidden">
                                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/field:text-primary size-5 z-10" />
                                    <input name="telephone" value={formData.telephone} onChange={handleChange} placeholder="+224 XX XX XX XX" className="w-full h-14 pl-14 pr-6 bg-white/[0.02] border border-foreground/5 text-[11px] font-black tracking-widest focus:border-primary/40 outline-none transition-all placeholder:text-slate-800 text-foreground" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black uppercase  text-muted-foreground ml-4">PASSPHRASE</label>
                                    <div className="relative group/field focus-within:ring-2 ring-primary/10 rounded-2xl overflow-hidden">
                                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/field:text-primary size-5 z-10" />
                                        <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className="w-full h-14 pl-14 pr-6 bg-white/[0.02] border border-foreground/5 text-[11px] font-black  focus:border-primary/40 outline-none transition-all text-foreground placeholder:tracking-normal" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black uppercase  text-muted-foreground ml-4">CONFIRMATION</label>
                                    <div className="relative group/field focus-within:ring-2 ring-primary/10 rounded-2xl overflow-hidden">
                                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/field:text-primary size-5 z-10" />
                                        <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" className="w-full h-14 pl-14 pr-6 bg-white/[0.02] border border-foreground/5 text-[11px] font-black  focus:border-primary/40 outline-none transition-all text-foreground placeholder:tracking-normal" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-18 rounded-2xl bg-white text-background font-black uppercase  text-[11px] shadow-2xl  transition-all flex items-center justify-center gap-6 group/btn disabled:opacity-50 hover:bg-primary hover:text-foreground"
                        >
                            {isSubmitting ? (
                                <Zap className="size-6 animate-spin text-primary group-hover:text-background transition-colors" />
                            ) : (
                                <>
                                    <span>{t('register')?.toUpperCase() || "SÉCURISER_L_UNITÉ"}</span>
                                    <ArrowRight className="size-5 group-hover/btn:translate-x-3 transition-transform duration-700" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-[11px] font-black uppercase  text-slate-700 pb-12">
                        {t('loginHasAccount')?.toUpperCase() || "SYNC_NOM_DÉJÀ_ACTIF?"}{' '}
                        <Link to="/login" className="text-primary hover:text-foreground transition-colors underline underline-offset-8 decoration-primary/20">
                            {t('login')?.toUpperCase() || "ENTRÉE"}
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default Register;
