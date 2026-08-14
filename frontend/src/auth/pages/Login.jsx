import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Zap, Database, Activity } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../context/useLanguage';
import { motion, AnimatePresence } from 'framer-motion';
import { getDashboardRoute } from '../../constants/roles';
import { loginSchema } from '../../lib/validation';
import { useLandingStats } from '../../landing/hooks/useLandingStats';
import { formatCompact, formatPercent } from '../../landing/lib/landingStats';
import GeometricBackground from '../../components/ui/GeometricBackground';
import BcaLogo from '../../components/ui/BcaLogo';
import GoogleSignIn from '../components/GoogleSignIn';
import marketImg from '../../assets/auth/market.png';
import logisticsImg from '../../assets/auth/logistics.png';
import entrepreneurImg from '../../assets/auth/entrepreneur.png';


const SHOWCASE_IMAGES = [marketImg, logisticsImg, entrepreneurImg];

const Login = () => {
    const { t, lang } = useLanguage();
    const { stats: landingStats } = useLandingStats();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [localError, setLocalError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});


    const [step, setStep] = useState('LOGIN'); // 'LOGIN' | '2FA'
    const [verificationCode, setVerificationCode] = useState('');
    const [twoFactorUserId, setTwoFactorUserId] = useState(null);
    
    const { login, verify2FA, isAuthenticated, user, loading: authLoading, error: authError, setAuth } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {

        const timer = setInterval(() => {
            setCurrentImageIndex(prev => (prev + 1) % SHOWCASE_IMAGES.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    if (isAuthenticated && !authLoading) {
        return <Navigate to={getDashboardRoute(user?.role || 'client')} replace />;
    }

    const handleChange = (name, value) => {
        if (name === 'email') setEmail(value);
        if (name === 'password') setPassword(value);
        
        if (fieldErrors[name]) {
            setFieldErrors(prev => {
                const updated = { ...prev };
                delete updated[name];
                return updated;
            });
        }
        if (localError) setLocalError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');
        setFieldErrors({});

        // Zod Validation
        if (step === 'LOGIN') {
            const validation = loginSchema.safeParse({ email, password });
            if (!validation.success) {
                const errors = {};
                validation.error.errors.forEach(err => {
                    errors[err.path[0]] = err.message;
                });
                setFieldErrors(errors);
                return;
            }
        }

        try {
            if (step === 'LOGIN') {
                const res = await login(email, password);
                if (res?.require2FA) {
                    setTwoFactorUserId(res.userId);
                    setStep('2FA');
                    return;
                }
                const fallbackTarget = getDashboardRoute(res.role);
                const target = location.state?.from?.pathname || fallbackTarget;
                navigate(target, { replace: true });
            } else {
                const res = await verify2FA(twoFactorUserId, verificationCode);
                const fallbackTarget = getDashboardRoute(res.role);
                const target = location.state?.from?.pathname || fallbackTarget;
                navigate(target, { replace: true });
            }
        } catch (err) {
            console.error("Auth failed:", err);
        }
    };

    const isSubmitting = authLoading;
    const displayError = localError || authError;

    return (
        <div className="flex h-full min-h-0 bg-background text-foreground">
            {/* Left Side: Form — scroll interne (layout auth en h-svh) */}
            <div className="flex-1 min-h-0 flex flex-col overflow-y-auto overscroll-contain">
                <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12 max-w-xl w-full mx-auto">
                <motion.div 
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="w-full space-y-10"
                >
                    {/* Logo */}
                    <Link to="/" className="w-fit">
                        <BcaLogo type="full" size="h-12" />
                    </Link>

                    {/* Header */}
                    <div className="space-y-3">
                        <h1 className="text-3xl font-bold text-foreground">
                            {step === 'LOGIN' ? t('loginTitle') : 'Vérification 2FA'}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {step === 'LOGIN' 
                                ? t('loginSub')
                                : 'Veuillez entrer le code généré par votre application d\'authentification.'}
                        </p>
                    </div>

                    {/* Error Message (Global match/server errors) */}
                    {displayError && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 text-sm font-bold"
                        >
                            {displayError}
                        </motion.div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {step === 'LOGIN' ? (
                            <>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-foreground">Email</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 size-10 flex items-center justify-center">
                                            <Mail className={cn("size-5 transition-colors", fieldErrors.email ? "text-red-500" : "text-muted-foreground group-focus-within:text-primary")} />
                                        </div>
                                        <input
                                            type="email"
                                            required
                                            autoComplete="username"
                                            value={email}
                                            onChange={(e) => handleChange('email', e.target.value)}
                                            placeholder="votre@email.com"
                                            className={cn(
                                                "w-full h-14 rounded-2xl border bg-muted/80 pl-16 pr-4 text-sm font-bold transition-all placeholder:text-muted-foreground/70 focus:bg-background focus:outline-none",
                                                fieldErrors.email ? "border-red-500 focus:border-red-500" : "border-border focus:border-primary text-foreground"
                                            )}
                                        />
                                    </div>
                                    {fieldErrors.email && <p className="text-[10px] text-red-600 font-bold uppercase tracking-tight ml-4">{fieldErrors.email}</p>}
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-bold text-foreground">{t('registerPassword') || "Mot de passe"}</label>
                                        <Link to="/forgot-password" className="text-xs font-bold text-primary hover:text-primary/80">{t('loginForgot') || "Mot de passe oublié ?"}</Link>
                                    </div>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 size-10 flex items-center justify-center">
                                            <Lock className={cn("size-5 transition-colors", fieldErrors.password ? "text-red-500" : "text-muted-foreground group-focus-within:text-primary")} />
                                        </div>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            autoComplete="current-password"
                                            value={password}
                                            onChange={(e) => handleChange('password', e.target.value)}
                                            placeholder="••••••••"
                                            className={cn(
                                                "w-full h-14 rounded-2xl border bg-muted/80 pl-16 pr-12 text-sm font-bold transition-all placeholder:text-muted-foreground/70 focus:bg-background focus:outline-none",
                                                fieldErrors.password ? "border-red-500 focus:border-red-500" : "border-border focus:border-primary text-foreground"
                                            )}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                                        </button>
                                    </div>
                                    {fieldErrors.password && <p className="text-[10px] text-red-600 font-bold uppercase tracking-tight ml-4">{fieldErrors.password}</p>}
                                </div>
                            </>
                        ) : (
                            <div className="space-y-4">
                                <Link to="/" className="inline-flex mb-12">
                                    <BcaLogo type="full" size="h-10" />
                                </Link>
                                <div className="space-y-2 text-center pb-4">
                                    <div className="size-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary">
                                        <Zap className="size-8" />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-2">{t('secureModeOn') || "Mode sécurisé activé"}</p>
                                </div>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        maxLength={6}
                                        required
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                                        placeholder="000 000"
                                        className="w-full h-16 rounded-xl border-2 border-border bg-background text-center text-3xl font-black tracking-[0.5em] focus:border-primary focus:outline-none transition-all shadow-inner"
                                        autoFocus
                                    />
                                    <div className="absolute inset-0 rounded-xl bg-primary opacity-0 group-hover:opacity-[0.02] transition-opacity pointer-events-none" />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setStep('LOGIN')}
                                    className="w-full py-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors text-center uppercase tracking-widest"
                                >
                                    {t('backToLogin') || "Retour à la connexion"}
                                </button>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting || (step === '2FA' && verificationCode.length < 6)}
                            className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:shadow-xl hover:translate-y-[-2px] hover:bg-primary/90 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>{step === 'LOGIN' ? (t('loginSecure') || 'IDENTIFICATION') : (t('validateCode') || 'VALIDER LE CODE')}</span>
                                    <ArrowRight className="size-4" />
                                </>
                            )}
                        </button>
                    </form>


                    {/* Connexion Google — contrôle unique, géré entièrement par GoogleSignIn */}
                    {step === 'LOGIN' && <GoogleSignIn containerId="google-button-login" />}

                    {/* Sign Up Link — version unique */}
                    <div className="pt-2 pb-8 space-y-2">
                        <p className="text-center text-sm font-medium text-muted-foreground">
                            {t('loginNoAccount') ? t('loginNoAccount').split('?')[0] + '?' : "Pas encore de compte ?"}{' '}
                            <Link to="/register" className="text-primary font-bold hover:underline">
                                {t('register') || "Créer un compte"}
                            </Link>
                        </p>
                        <p className="text-center text-xs text-muted-foreground/80">
                            {t('buyerVendorDeliveryTech') || "Acheteur · Fournisseur · Livreur · Technicien"}
                        </p>
                    </div>

                </motion.div>
                </div>
            </div>

            {/* Right Side: Showcase (Carousel + Fixed Content) */}
            <div className="hidden lg:flex flex-1 relative items-center justify-center p-12 overflow-hidden border-l border-border">
                {/* 1. Background Layer (Animated Carousel + Geometric Background) */}
                <div className="absolute inset-0 z-0">
                    <GeometricBackground />
                    <AnimatePresence mode="wait">
                        <motion.img 
                            key={currentImageIndex}
                            src={SHOWCASE_IMAGES[currentImageIndex]} 
                            alt={`Showcase ${currentImageIndex}`}
                            initial={{ opacity: 0, scale: 1.2 }}
                            animate={{ opacity: 1, scale: 1.05 }}
                            exit={{ opacity: 0, scale: 1 }}
                            transition={{ duration: 2, ease: "easeOut" }}
                            className="w-full h-full object-cover"
                        />
                    </AnimatePresence>
                    {/* Immersive Dark Gradient Overlay with High Contrast */}
                    <div className="absolute inset-0 bg-black/50 lg:bg-[#0a0f1c]/80 flex flex-col justify-end backdrop-blur-[1px] z-10 pointer-events-none" />
                </div>

                {/* 2. Foreground Layer (Fixed Static Content) */}
                <div className="relative z-20 max-w-lg w-full space-y-12 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                    >
                        <div className="flex justify-center mb-8">
                            <BcaLogo type="full" variant="light" size="h-16" />
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-[0.9]">
                                {t('authShowcaseTitle1') || "L'EXCELLENCE"} <span className="text-primary italic">{t('authShowcaseTitle2') || "CONNECTÉE"}</span>
                            </h2>
                            <p className="text-sm text-white/70 leading-relaxed font-medium">
                                {t('authShowcaseDesc') || "La plateforme de commerce et de paiement conçue pour les entrepreneurs modernes en Guinée et en Afrique."}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-6 pt-12">
                            <div className="group p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 space-y-3 hover:border-primary/30 transition-all duration-500">
                                <Database className="size-6 text-primary mx-auto" />
                                <p className="font-black text-2xl text-white tracking-tighter">{formatCompact(landingStats.totalUsers)}</p>
                                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">{t('users') || "Utilisateurs"}</p>
                            </div>
                            <div className="group p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 space-y-3 hover:border-primary/30 transition-all duration-500">
                                <Activity className="size-6 text-emerald-500 mx-auto" />
                                <p className="font-black text-2xl text-white tracking-tighter">{formatPercent(landingStats.satisfactionRate, 1)}</p>
                                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">{t('satisfaction') || "Satisfaction"}</p>
                            </div>
                        </div>

                        <div className="pt-12 space-y-4">
                            <div className="flex items-center justify-between text-[10px] font-black text-white/50 uppercase tracking-widest">
                                <span>{t('syncBca') || "Synchronisation Réseau BCA"}</span>
                                <span className="text-emerald-500 flex items-center gap-1">
                                    <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    {t('optimal') || "Optimale"}
                                </span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                    animate={{ x: ['-100%', '200%'] }}
                                    transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                                    className="h-full w-1/3 bg-primary rounded-full shadow-[0_0_10px_rgba(28,160,219,0.5)]"
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Login;
