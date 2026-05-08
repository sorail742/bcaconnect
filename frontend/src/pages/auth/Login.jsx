import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Globe, Zap, Database, Activity, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { getDashboardRoute } from '../../constants/roles';
import { loginSchema } from '../../lib/validation';
import GeometricBackground from '../../components/ui/GeometricBackground';
import BcaLogo from '../../components/ui/BcaLogo';
import marketImg from '../../assets/auth/market.png';
import logisticsImg from '../../assets/auth/logistics.png';
import entrepreneurImg from '../../assets/auth/entrepreneur.png';
import authService from '../../services/authService';

const SHOWCASE_IMAGES = [marketImg, logisticsImg, entrepreneurImg];

const Login = () => {
    const { t, lang } = useLanguage();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [localError, setLocalError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    
    const [step, setStep] = useState('LOGIN'); // 'LOGIN' | '2FA'
    const [verificationCode, setVerificationCode] = useState('');
    const [twoFactorUserId, setTwoFactorUserId] = useState(null);
    
    const { login, verify2FA, isAuthenticated, user, loading: authLoading, error: authError, setAuth } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const handleGoogleResponse = async (response) => {
            try {
                setIsGoogleLoading(true);
                const data = await authService.googleLogin(response.credential);
                setAuth(data.user, data.accessToken);
                toast.success('Connexion Google réussie !');
                const dashboardRoute = getDashboardRoute(data.user.role);
                navigate(dashboardRoute);
            } catch (error) {
                const errorMsg = error?.response?.data?.message || error?.message || 'Erreur inconnue';
                console.error('❌ Google Auth Error:', error?.response?.data || error?.message);
                toast.error(`Échec de la connexion Google : ${errorMsg}`);
            } finally {
                setIsGoogleLoading(false);
            }
        };

        // Supprimer le script existant s'il y en a un pour éviter les doublons
        const existingScript = document.getElementById('google-gsi-script');
        if (existingScript) existingScript.remove();

        const script = document.createElement('script');
        script.id = 'google-gsi-script';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
            if (window.google) {
                window.google.accounts.id.initialize({
                    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                    callback: handleGoogleResponse,
                    auto_select: false,
                    cancel_on_tap_outside: true
                });

                // Rendu du bouton officiel dans le conteneur dédié
                const buttonDiv = document.getElementById('google-button-container');
                if (buttonDiv) {
                    window.google.accounts.id.renderButton(buttonDiv, {
                        theme: 'outline',
                        size: 'large',
                        width: buttonDiv.offsetWidth,
                        text: 'continue_with',
                        shape: 'rectangular',
                        logo_alignment: 'left'
                    });
                }
            }
        };
        document.body.appendChild(script);
        
        return () => { 
            const s = document.getElementById('google-gsi-script');
            if (s) document.body.removeChild(s); 
        };
    }, [navigate, setAuth]);

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
        <div className="flex min-h-screen bg-background text-foreground overflow-hidden">
            {/* Left Side: Form */}
            <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-20 overflow-y-auto">
                <motion.div 
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-md w-full mx-auto space-y-12"
                >
                    {/* Logo */}
                    <Link to="/" className="w-fit">
                        <BcaLogo size="h-12" />
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
                                    <BcaLogo size="h-10" />
                                </Link>
                                <div className="space-y-2 text-center pb-4">
                                    <div className="size-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary">
                                        <Zap className="size-8" />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-2">Mode sécurisé activé</p>
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
                                    Retour à la connexion
                                </button>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting || isGoogleLoading || (step === '2FA' && verificationCode.length < 6)}
                            className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:shadow-xl hover:translate-y-[-2px] hover:bg-primary/90 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {isSubmitting || isGoogleLoading ? (
                                <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>{step === 'LOGIN' ? (t('loginSecure') || 'IDENTIFICATION') : 'VALIDER LE CODE'}</span>
                                    <ArrowRight className="size-4" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative flex items-center">
                        <div className="flex-1 border-t border-border"></div>
                        <span className="px-3 text-xs text-muted-foreground">{t('loginOr') || "Ou continuer avec"}</span>
                        <div className="flex-1 border-t border-border"></div>
                    </div>

                    {/* Social Buttons */}
                    <div className="grid grid-cols-1 gap-3">
                        {/* Conteneur pour le bouton Google officiel */}
                        <div 
                            id="google-button-container" 
                            className="w-full h-[50px] overflow-hidden rounded-xl flex justify-center"
                        />
                    </div>

                    {/* Sign Up Link */}
                    <p className="text-center text-sm text-muted-foreground">
                        {t('loginNoAccount') ? t('loginNoAccount').split('?')[0] + '?' : "Pas de compte?"}{' '}
                        <Link to="/register" className="text-primary hover:text-primary/80 font-semibold">
                            {t('register') || "S'inscrire"}
                        </Link>
                    </p>
                </motion.div>
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
                    <div className="absolute inset-0 bg-black/50 lg:bg-[#0a0f1c]/80 flex flex-col justify-end backdrop-blur-[1px] z-10" />
                </div>

                {/* 2. Foreground Layer (Fixed Static Content) */}
                <div className="relative z-20 max-w-lg w-full space-y-12 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                    >
                        <div className="inline-flex items-center justify-center size-24 rounded-3xl bg-white text-primary mx-auto mb-8 shadow-[0_20px_50px_rgba(255,102,0,0.3)] border border-primary/10 relative group">
                            <div className="absolute inset-0 bg-primary/5 rounded-3xl animate-pulse group-hover:bg-primary/10 transition-colors" />
                            <Zap className="size-12 text-primary relative z-10 fill-primary/10" />
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-[0.9]">
                                L'EXCELLENCE <span className="text-primary italic">CONNECTÉE</span>
                            </h2>
                            <p className="text-sm text-white/70 leading-relaxed font-medium">
                                La plateforme de commerce et de paiement conçue pour les entrepreneurs modernes en Guinée et en Afrique.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-6 pt-12">
                            <div className="group p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 space-y-3 hover:border-primary/30 transition-all duration-500">
                                <Database className="size-6 text-primary mx-auto" />
                                <p className="font-black text-2xl text-white tracking-tighter">12.8K+</p>
                                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Utilisateurs</p>
                            </div>
                            <div className="group p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 space-y-3 hover:border-primary/30 transition-all duration-500">
                                <Activity className="size-6 text-emerald-500 mx-auto" />
                                <p className="font-black text-2xl text-white tracking-tighter">99.9%</p>
                                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Disponibilité</p>
                            </div>
                        </div>

                        <div className="pt-12 space-y-4">
                            <div className="flex items-center justify-between text-[10px] font-black text-white/50 uppercase tracking-widest">
                                <span>Synchronisation Réseau BCA</span>
                                <span className="text-emerald-500 flex items-center gap-1">
                                    <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Optimale
                                </span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                    animate={{ x: ['-100%', '200%'] }}
                                    transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                                    className="h-full w-1/3 bg-primary rounded-full shadow-[0_0_10px_rgba(255,102,0,0.5)]"
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
