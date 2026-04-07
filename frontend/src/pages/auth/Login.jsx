import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Globe, Zap, Database, Activity, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../context/LanguageContext';
import { motion } from 'framer-motion';
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const user = await login(email, password);
            navigate(getDashboardRoute(user.role), { replace: true });
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Erreur de connexion');
        } finally {
            setIsSubmitting(false);
        }
    };

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
                    <Link to="/" className="inline-flex items-center gap-3 group">
                        <div className="size-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
                            <Zap className="size-6" />
                        </div>
                        <div>
                            <span className="text-2xl font-bold text-foreground">BCA<span className="text-primary">CONNECT</span></span>
                        </div>
                    </Link>

                    {/* Header */}
                    <div className="space-y-3">
                        <h1 className="text-3xl font-bold text-foreground">Se connecter</h1>
                        <p className="text-sm text-muted-foreground">Accédez à votre compte BCA Connect</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 text-sm"
                        >
                            {error}
                        </motion.div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="votre@email.com"
                                    className="w-full h-12 rounded-lg border-2 border-border bg-background pl-12 pr-4 text-sm font-medium focus:border-primary focus:outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-semibold text-foreground">Mot de passe</label>
                                <Link to="/forgot-password" className="text-xs text-primary hover:text-primary/80">Oublié?</Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full h-12 rounded-lg border-2 border-border bg-background pl-12 pr-12 text-sm font-medium focus:border-primary focus:outline-none transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-12 rounded-lg bg-primary text-primary-foreground font-semibold text-sm shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <>
                                    <span>Se connecter</span>
                                    <ArrowRight className="size-4" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative flex items-center">
                        <div className="flex-1 border-t border-border"></div>
                        <span className="px-3 text-xs text-muted-foreground">Ou continuer avec</span>
                        <div className="flex-1 border-t border-border"></div>
                    </div>

                    {/* Social Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                        <button className="h-11 rounded-lg border-2 border-border bg-background hover:bg-accent transition-colors font-medium text-sm flex items-center justify-center gap-2">
                            <Globe className="size-4" />
                            <span>Google</span>
                        </button>
                        <button className="h-11 rounded-lg border-2 border-border bg-background hover:bg-accent transition-colors font-medium text-sm flex items-center justify-center gap-2">
                            <Globe className="size-4" />
                            <span>GitHub</span>
                        </button>
                    </div>

                    {/* Sign Up Link */}
                    <p className="text-center text-sm text-muted-foreground">
                        Pas de compte?{' '}
                        <Link to="/register" className="text-primary hover:text-primary/80 font-semibold">
                            S'inscrire
                        </Link>
                    </p>
                </motion.div>
            </div>

            {/* Right Side: Showcase */}
            <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/10 via-background to-background border-l border-border items-center justify-center p-12">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="max-w-lg w-full space-y-12 text-center"
                >
                    <div className="inline-flex items-center justify-center size-20 rounded-2xl bg-primary/10 border border-primary/20 mx-auto">
                        <Zap className="size-10 text-primary" />
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-4xl font-bold text-foreground">
                            Bienvenue sur <span className="text-primary">BCA Connect</span>
                        </h2>
                        <p className="text-base text-muted-foreground leading-relaxed">
                            La plateforme de commerce et de paiement conçue pour les entrepreneurs modernes en Guinée et en Afrique.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-6 pt-8">
                        <div className="p-6 rounded-xl bg-background/50 border border-border space-y-3 hover:border-primary/30 transition-colors">
                            <Database className="size-6 text-primary mx-auto" />
                            <p className="font-bold text-lg text-foreground">12,8K+</p>
                            <p className="text-xs text-muted-foreground">Utilisateurs actifs</p>
                        </div>
                        <div className="p-6 rounded-xl bg-background/50 border border-border space-y-3 hover:border-primary/30 transition-colors">
                            <Activity className="size-6 text-emerald-500 mx-auto" />
                            <p className="font-bold text-lg text-foreground">99.9%</p>
                            <p className="text-xs text-muted-foreground">Disponibilité</p>
                        </div>
                    </div>

                    <div className="pt-8 space-y-4">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Synchronisation en temps réel</span>
                            <span className="text-emerald-500 font-semibold">Optimal</span>
                        </div>
                        <div className="h-2 bg-border rounded-full overflow-hidden">
                            <motion.div 
                                animate={{ x: ['-100%', '200%'] }}
                                transition={{ repeat: Infinity, duration: 3 }}
                                className="h-full w-1/3 bg-primary rounded-full"
                            />
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
