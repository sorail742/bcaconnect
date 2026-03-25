import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, Github, Chrome } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import BcaLogo from '../../components/ui/BcaLogo';
import ThemeToggle from '../../components/ui/ThemeToggle';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Récupérer la page d'où l'utilisateur vient, ou aller au dashboard par défaut
    const from = location.state?.from?.pathname || "/dashboard";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const user = await login(email, password);

            // Redirection intelligente basée sur le rôle
            if (user.role === 'admin') {
                navigate('/admin/dashboard', { replace: true });
            } else if (user.role === 'fournisseur') {
                navigate('/vendor/dashboard', { replace: true });
            } else if (user.role === 'transporteur') {
                navigate('/carrier/dashboard', { replace: true });
            } else if (user.role === 'banque') {
                navigate('/bank/dashboard', { replace: true });
            } else {
                navigate(from, { replace: true });
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Erreur de connexion. Vérifiez vos identifiants.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-all duration-700 selection:bg-primary/30 font-inter">
            {/* Theme Toggle Floating */}
            <div className="absolute top-8 right-8 z-50">
                <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-800/50 p-2 rounded-[1.5rem] shadow-2xl hover:shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                    <ThemeToggle minimal className="hover:bg-transparent" />
                </div>
            </div>

            {/* Côté gauche : Formulaire (Style Executive Portal) */}
            <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-24 xl:px-40 relative z-10 bg-white dark:bg-slate-950">
                {/* Background decorative elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-40 pointer-events-none">
                    <div className="absolute -top-[20%] -left-[10%] size-[60%] bg-primary/10 blur-[150px] rounded-full mix-blend-screen" />
                </div>

                <div className="mx-auto w-full max-w-md">
                    {/* Header Logo */}
                    <div className="mb-14 flex flex-col items-start gap-8">
                        <Link gap-4 to="/" className="flex items-center gap-4 group animate-in slide-in-from-left duration-1000">
                            <div className="size-12 rounded-[1.2rem] bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 group-hover:scale-110 transition-transform duration-500 shadow-2xl shadow-primary/20">
                                <BcaLogo className="size-6" />
                            </div>
                            <span className="text-xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">BCA Connect</span>
                        </Link>
                        <div className="animate-in slide-in-from-bottom duration-1000 delay-200">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="size-2 rounded-full bg-primary animate-pulse" />
                                <span className="text-[9px] font-black text-primary uppercase tracking-[0.4em]">Portail Exécutif</span>
                            </div>
                            <h2 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white mb-4 italic leading-none">
                                Authentification
                            </h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed mt-4">Accès sécurisé à votre espace d'approvisionnement et de gestion B2B.</p>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-8 p-5 rounded-[1.5rem] bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500 shadow-lg shadow-red-500/5">
                            <ShieldCheck className="size-5 shrink-0" />
                            <p className="font-black text-[10px] uppercase tracking-[0.2em]">{error}</p>
                        </div>
                    )}

                    <form className="space-y-6 animate-in fade-in duration-1000 delay-300" onSubmit={handleSubmit}>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2" htmlFor="email">Identifiant Sécurisé</label>
                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors duration-500">
                                    <Mail className="size-5" />
                                </div>
                                <input
                                    id="email"
                                    autoComplete="email"
                                    className="block w-full h-16 rounded-[1.5rem] border-2 border-slate-100 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/50 overflow-hidden py-4 pl-14 pr-4 shadow-inner focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none placeholder:text-slate-300 text-sm font-bold transition-all duration-500"
                                    placeholder="Ex: direction@entreprise.com"
                                    required
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between ml-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400" htmlFor="password">Clef d'Accès</label>
                                <button type="button" className="text-[9px] font-black text-primary uppercase tracking-[0.2em] hover:text-slate-900 dark:hover:text-white transition-colors">
                                    Protocole oublié ?
                                </button>
                            </div>
                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors duration-500">
                                    <Lock className="size-5" />
                                </div>
                                <input
                                    id="password"
                                    autoComplete="current-password"
                                    className="block w-full h-16 rounded-[1.5rem] border-2 border-slate-100 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/50 overflow-hidden py-4 pl-14 pr-14 shadow-inner focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none placeholder:text-slate-300 text-sm font-bold transition-all duration-500 tracking-widest"
                                    placeholder="••••••••"
                                    required
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-primary transition-colors"
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 py-2 ml-2">
                            <input
                                className="size-4.5 rounded-md border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-primary focus:ring-primary/30 transition-all cursor-pointer"
                                id="remember-me"
                                type="checkbox"
                            />
                            <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest cursor-pointer select-none relative top-0.5" htmlFor="remember-me">
                                Maintenir la session active
                            </label>
                        </div>

                        <Button
                            disabled={isSubmitting}
                            type="submit"
                            className="w-full h-16 mt-4 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.3em] group shadow-2xl shadow-primary/30 relative overflow-hidden active:scale-[0.98] transition-all hover:shadow-primary/50"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                            <span className="relative z-10 flex items-center justify-center gap-4">
                                {isSubmitting ? 'Déchiffrement...' : 'Déverrouiller l\'Accès'}
                                {!isSubmitting && <ArrowRight className="size-4 group-hover:translate-x-2 transition-transform duration-500" />}
                            </span>
                        </Button>
                    </form>

                    <div className="mt-14 animate-in fade-in duration-1000 delay-500">
                        <div className="relative flex items-center justify-center">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                            </div>
                            <span className="relative bg-white dark:bg-slate-950 px-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">
                                Ou via SSO Externe
                            </span>
                        </div>

                        <div className="mt-8 grid grid-cols-2 gap-5">
                            <button className="flex w-full items-center justify-center gap-3 rounded-[1.5rem] border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white shadow-sm hover:border-primary/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                                <Chrome className="size-4 text-[#4285F4]" />
                                <span>Google</span>
                            </button>
                            <button className="flex w-full items-center justify-center gap-3 rounded-[1.5rem] border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white shadow-sm hover:border-primary/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                                <Github className="size-4" />
                                <span>GitHub</span>
                            </button>
                        </div>
                    </div>

                    <p className="mt-16 text-center text-[10px] font-black text-slate-400 animate-in fade-in duration-1000 delay-700 uppercase tracking-[0.2em]">
                        Aucune identité enregistrée ?{' '}
                        <Link className="text-primary hover:text-slate-900 dark:hover:text-white transition-colors underline-offset-8 decoration-2 decoration-primary/30 hover:underline" to="/register">
                            Initier l'Inscription
                        </Link>
                    </p>
                </div>
            </div>

            {/* Côté droit : Visuel Executive Impactant */}
            <div className="hidden lg:relative lg:flex lg:flex-1 flex-col items-center justify-center overflow-hidden bg-slate-950 p-12">
                <div className="absolute inset-0 z-0">
                    {/* Dark radial gradient for contrast */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,theme(colors.primary.DEFAULT/0.15),transparent_70%)]" />
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 opacity-90" />
                    {/* Premium Grid Pattern from Profile */}
                    <div className="absolute inset-0 opacity-[0.03]" style={{
                        backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
                        backgroundSize: '4rem 4rem'
                    }} />
                </div>

                <div className="relative z-10 w-full max-w-xl text-left animate-in fade-in slide-in-from-right-8 duration-1000">
                    <div className="mb-12 inline-flex items-center justify-center rounded-[3rem] bg-white/5 p-8 backdrop-blur-3xl border border-white/10 shadow-2xl transition-transform hover:-rotate-3 hover:scale-105 duration-700">
                        <ShieldCheck className="size-20 text-white" />
                    </div>
                    
                    <h1 className="text-6xl font-black text-white mb-8 tracking-tighter italic leading-[1.1]">
                        Architecture <br />
                        <span className="text-primary border-b-4 border-primary pb-2">Sécurisée</span> <br />
                        Classe A.
                    </h1>
                    
                    <p className="text-sm font-bold text-white/50 uppercase tracking-widest leading-relaxed mb-16 max-w-md border-l-2 border-white/20 pl-6">
                        Plateforme d'approvisionnement B2B certifiée. Protégez vos actifs et gérez votre supply chain avec une fiabilité absolue.
                    </p>

                    <div className="grid grid-cols-2 gap-6 mb-12">
                         <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-md">
                             <p className="text-3xl font-black text-white italic tracking-tighter">99.9%</p>
                             <p className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em] mt-2">Uptime Garanti</p>
                         </div>
                         <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-md">
                             <p className="text-3xl font-black text-white italic tracking-tighter">BCA</p>
                             <p className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em] mt-2">Guard Shield™</p>
                         </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex -space-x-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className={`size-12 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center shadow-2xl overflow-hidden`}>
                                    <div className="size-full bg-gradient-to-br from-white/20 to-white/5"></div>
                                </div>
                            ))}
                        </div>
                        <p className="text-[9px] font-black text-white/60 uppercase tracking-[0.2em]">+5,000 Entreprises Connectées</p>
                    </div>
                </div>

                {/* Animated Light Orbs */}
                <div className="absolute top-1/4 right-0 size-[40rem] bg-primary/20 blur-[150px] rounded-full mix-blend-screen pointer-events-none" />
                <div className="absolute bottom-0 left-1/4 size-[30rem] bg-emerald-500/10 blur-[150px] rounded-full mix-blend-screen pointer-events-none" />
            </div>
        </div>
    );
};

export default Login;
