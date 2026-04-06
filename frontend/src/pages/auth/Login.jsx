import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, Globe, Zap, Database, Terminal, Cpu, Activity } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import { useLanguage } from '../../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { getDashboardRoute } from '../../constants/roles';

const Login = () => {
    const { t, lang } = useLanguage();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || "/dashboard";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const user = await login(email, password);
            navigate(getDashboardRoute(user.role), { replace: true });
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || (lang === 'FR' ? "IDENTIFIANTS_RÉSEAU_SYNTAXE_ERREUR." : "NETWORK_AUTH_PROTOCOL_FAILURE."));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-foreground overflow-hidden relative antialiased">
            {/* Design Element: Cyber Grain & Ambient Glow */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
            <div className="absolute top-[-10%] left-[-10%] size-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] size-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />

            {/* Left Side: Auth Terminal Hub */}
            <div className="flex-1 flex flex-col justify-center px-10 md:px-20 lg:px-32 xl:px-48 relative z-10 py-24 overflow-y-auto">
                <motion.div 
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-md w-full mx-auto space-y-16"
                >
                    {/* Header — Absolute Precision Meta */}
                    <div className="space-y-12">
                        <Link to="/" className="inline-flex items-center gap-5 transition-all hover:scale-105 active:scale-95 duration-500 group">
                            <div className="size-14 rounded-2xl bg-primary text-background flex items-center justify-center shadow-2xl shadow-primary/20 group-hover:rotate-12 transition-transform duration-700">
                                <Zap className="size-8 fill-current" />
                            </div>
                            <div className="space-y-1">
                                <span className="text-[28px] font-black tracking-tighter uppercase text-foreground block leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                    BCA<span className="text-primary italic">CONNECT</span>
                                </span>
                                <span className="text-[10px] font-black  text-primary opacity-80 leading-none">TERMINAL_ALPHA_V5</span>
                            </div>
                        </Link>

                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="size-2 rounded-full bg-primary animate-pulse shadow-[0_0_12px_#FF5F00]" />
                                <span className="text-[10px] font-black text-primary uppercase  pt-0.5">AUTH_NETWORK_ENCRYPTION_ACTIVE</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-semibold tracking-tighter  leading-[0.9] text-foreground" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                {t('loginTitle')?.split(' ').slice(0, -1).join(' ') || "ACCÉDER"} <br /> <span className="text-primary italic">{t('loginTitle')?.split(' ').slice(-1) || "RÉSEAU"}.</span>
                            </h1>
                            <p className="text-[12px] text-muted-foreground font-black uppercase  leading-relaxed border-l-2 border-primary/20 pl-8 opacity-80">
                                {t('loginSub')?.toUpperCase() || "IDENTIFICATION_NODALE_POUR_ÉCOSYSTÈME_MARCHAND"}
                            </p>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="p-6 rounded-2xl bg-rose-500/5 text-rose-500 border border-rose-500/10 flex items-center gap-5"
                            >
                                 <ShieldCheck className="size-6 shrink-0" />
                                 <p className="text-[11px] font-black uppercase tracking-widest leading-none pt-0.5">{error}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Terminal Advanced Form */}
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-[9px] font-black uppercase  text-muted-foreground ml-4">IDENTIFIANT_UNITÉ</label>
                            <div className="relative group/field">
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/field:text-primary transition-colors z-10">
                                    <Mail className="size-5" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="CANAL@RÉSEAU.COM"
                                    className="w-full h-18 rounded-2xl border border-foreground/5 bg-white/[0.02] pl-16 pr-8 text-[12px] font-black  focus:border-primary/40 focus:bg-white/[0.04] outline-none transition-all placeholder:text-slate-800 text-foreground relative z-0 uppercase"
                                />
                                <div className="absolute inset-0 rounded-2xl bg-primary/[0.01] opacity-0 group-focus-within/field:opacity-100 transition-opacity pointer-events-none shadow-inner" />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between mx-4">
                                <label className="text-[9px] font-black uppercase  text-muted-foreground">CLÉ_D_ACCÈS_SÉQUENTIELLE</label>
                                <button type="button" className="text-[9px] font-black text-primary uppercase tracking-widest transition-opacity hover:opacity-50">RÉINITIALISER?</button>
                            </div>
                            <div className="relative group/field">
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/field:text-primary transition-colors z-10">
                                    <Lock className="size-5" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full h-18 rounded-2xl border border-foreground/5 bg-white/[0.02] pl-16 pr-16 text-[12px] font-black  focus:border-primary/40 focus:bg-white/[0.04] outline-none transition-all placeholder:text-slate-800 text-foreground relative z-0"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 hover:text-foreground transition-colors z-20"
                                >
                                    {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                                </button>
                                <div className="absolute inset-0 rounded-2xl bg-primary/[0.01] opacity-0 group-focus-within/field:opacity-100 transition-opacity pointer-events-none shadow-inner" />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-18 rounded-2xl bg-white text-background font-black uppercase  text-[11px] shadow-2xl  transition-all flex items-center justify-center gap-6 group/btn disabled:opacity-50 hover:bg-primary hover:text-foreground"
                        >
                            {isSubmitting ? (
                                <Zap className="size-6 animate-spin" />
                            ) : (
                                <>
                                    <span>{t('login')?.toUpperCase() || "INITIALISER_SESSION"}</span>
                                    <ArrowRight className="size-5 group-hover/btn:translate-x-3 transition-transform duration-700" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Social Hub Nodes */}
                    <div className="space-y-10">
                        <div className="relative flex items-center justify-center">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-foreground/5"></div>
                            </div>
                            <span className="relative bg-background px-6 text-[10px] font-black text-slate-700 uppercase ">{t('loginOr')?.toUpperCase() || "CANAUX_EXTERNES"}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-5">
                            <button className="flex items-center justify-center gap-4 h-16 rounded-2xl border border-foreground/5 bg-white/[0.01] hover:border-primary/20 hover:bg-white/[0.03] transition-all font-black text-[10px] uppercase  ">
                                <Globe className="size-5 text-primary" />
                                <span>GOOGLE_API</span>
                            </button>
                            <button className="flex items-center justify-center gap-4 h-16 rounded-2xl border border-foreground/5 bg-white/[0.01] hover:border-primary/20 hover:bg-white/[0.03] transition-all font-black text-[10px] uppercase  ">
                                <Globe className="size-5 text-foreground" />
                                <span>GITHUB_NODE</span>
                            </button>
                        </div>
                    </div>

                    <p className="text-center text-[10px] font-black uppercase  text-slate-600">
                        {t('loginNoAccount')?.toUpperCase() || "NOUVELLE_UNITÉ?"}{' '}
                        <Link to="/register" className="text-primary hover:text-foreground transition-colors underline underline-offset-8 decoration-primary/20">
                            {t('register')?.toUpperCase() || "CRÉER_NOEUD"}
                        </Link>
                    </p>
                </motion.div>
            </div>

            {/* Right Side: Visual Cyber Core */}
            <div className="hidden lg:flex flex-1 relative bg-background overflow-hidden items-center justify-center border-l border-white/[0.03]">
                {/* Advanced Tactical Overlays */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
                    <div className="absolute inset-0 opacity-[0.03]" style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                        backgroundSize: '32px 32px'
                    }} />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                         <div className="size-[800px] bg-primary/[0.02] rounded-full blur-[150px] animate-pulse" />
                    </div>
                </div>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                    className="relative z-10 max-w-xl w-full px-16 space-y-16"
                >
                    {/* Floating Status Node Central */}
                    <div className="flex items-center gap-8 p-8 rounded-3xl bg-white/[0.02] border border-foreground/5 backdrop-blur-[100px] shadow-2xl skew-x-[-4deg] hover:skew-x-0 transition-all duration-1000 group cursor-pointer overflow-hidden relative">
                         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                         <div className="size-16 rounded-2xl bg-primary text-background flex items-center justify-center shadow-2xl group-hover:rotate-12 transition-transform duration-700">
                            <ShieldCheck className="size-9 fill-current" />
                         </div>
                         <div className="space-y-2">
                             <p className="text-[12px] font-black text-foreground uppercase " style={{ fontFamily: "'Outfit', sans-serif" }}>{t('loginSecurityCertified')?.toUpperCase() || "INFRASTRUCTURE_SÉCURISÉE"}</p>
                             <div className="flex items-center gap-3">
                                 <Activity className="size-3 text-emerald-500 animate-pulse" />
                                 <p className="text-[9px] font-black text-muted-foreground uppercase ">CERTIFICAT_PROTCOLE_V5_ACTIF</p>
                             </div>
                         </div>
                    </div>

                    <div className="space-y-10">
                        <h2 className="text-4xl md:text-5xl font-semibold text-foreground tracking-tighter  leading-[0.85]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            INDEXEZ <br /> <span className="text-primary italic">VOS_ACTIFS</span>.
                        </h2>
                        <p className="text-[13px] font-black text-muted-foreground uppercase  leading-loose border-l-2 border-primary pl-10 opacity-90 max-w-lg">
                            {lang === 'FR' 
                                ? "PREMIÈRE INFRASTRUCTURE DE PAIEMENT ET DE COMMERCE EN GUINEE CONÇUE POUR LES ENTREPRENEURS MODERNES." 
                                : "GUINEA'S PREMIER COMMERCE & PAYMENT INFRASTRUCTURE DESIGNED FOR MODERN ENTREPRENEURS."}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-8 pb-12">
                         <div className="p-8 rounded-2xl bg-white/[0.01] border border-foreground/5 backdrop-blur-md space-y-4 hover:border-primary/20 transition-all group">
                             <div className="flex items-center gap-4">
                                 <Database className="size-5 text-primary group-hover:rotate-12 transition-transform" />
                                 <p className="text-[10px] font-black text-slate-600 uppercase ">UNITÉS_TOTALES</p>
                             </div>
                             <p className="text-2xl md:text-3xl font-semibold text-foreground tracking-tighter tabular-nums " style={{ fontFamily: "'Outfit', sans-serif" }}>12,8K+</p>
                         </div>
                         <div className="p-8 rounded-2xl bg-white/[0.01] border border-foreground/5 backdrop-blur-md space-y-4 hover:border-primary/20 transition-all group">
                             <div className="flex items-center gap-4">
                                 <Terminal className="size-5 text-emerald-500 group-hover:rotate-12 transition-transform" />
                                 <p className="text-[10px] font-black text-slate-600 uppercase ">RÉPONSE_MS</p>
                             </div>
                             <p className="text-2xl md:text-3xl font-semibold text-foreground tracking-tighter tabular-nums " style={{ fontFamily: "'Outfit', sans-serif" }}>048MS</p>
                         </div>
                    </div>

                    {/* Matrix Progress Visualization */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                             <span className="text-[8px] font-black text-slate-700 uppercase ">SYNCHRONISATION_FLUX_RÉEL</span>
                             <span className="text-[8px] font-black text-primary uppercase tracking-widest animate-pulse">OPTIMAL</span>
                        </div>
                        <div className="h-1.5 bg-foreground/5 rounded-full overflow-hidden w-full relative">
                             <motion.div 
                                animate={{ x: ["-100%", "300%"] }}
                                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                                className="absolute inset-y-0 left-0 bg-primary w-1/4 shadow-[0_0_15px_#FF5F00]" 
                             />
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
