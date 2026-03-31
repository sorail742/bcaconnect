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
        <div className="flex min-h-screen bg-background text-foreground transition-all duration-700 selection:bg-primary/30 font-inter">
            {/* Theme Toggle Floating */}
            <div className="absolute top-8 right-8 z-50">
                <div className="bg-card/50 backdrop-blur-2xl border-2 border-border p-2 rounded-[1.5rem] shadow-premium hover:shadow-primary/20 transition-all hover:scale-105 active-press">
                    <ThemeToggle minimal className="hover:bg-transparent" />
                </div>
            </div>

            {/* Côté gauche : Formulaire (Style Executive Portal) */}
            <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-24 xl:px-40 relative z-10 bg-background">
                {/* Background decorative elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-40 pointer-events-none">
                    <div className="absolute -top-[20%] -left-[10%] size-[60%] bg-primary/10 blur-[150px] rounded-full mix-blend-screen" />
                </div>

                <div className="mx-auto w-full max-w-md">
                    {/* Header Logo */}
                    <div className="mb-14 flex flex-col items-start gap-10">
                        <Link to="/" className="flex items-center gap-6 group animate-in slide-in-from-left duration-1000">
                            <div className="size-16 rounded-[1.5rem] bg-foreground text-background flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-premium">
                                <BcaLogo className="size-8" />
                            </div>
                            <span className="text-2xl font-black tracking-tighter text-foreground uppercase italic underline decoration-primary/50 decoration-4 underline-offset-8">BCA Connect</span>
                        </Link>
                        <div className="animate-in slide-in-from-bottom duration-1000 delay-200">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="size-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(43,90,255,0.5)]" />
                                <span className="text-executive-label text-primary">Portail Exécutif Sécurisé</span>
                            </div>
                            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-foreground mb-6 italic leading-none uppercase">
                                Authentification
                            </h2>
                            <p className="text-executive-label opacity-50 max-w-sm italic">Accès hautement sécurisé à votre infrastructure d'approvisionnement B2B.</p>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-10 p-6 rounded-[1.5rem] bg-red-500/5 text-red-500 border-2 border-red-500/20 flex items-center gap-5 animate-in fade-in slide-in-from-top-4 duration-500 shadow-premium">
                            <ShieldCheck className="size-6 shrink-0" />
                            <p className="text-executive-label">{error}</p>
                        </div>
                    )}

                    <form className="space-y-8 animate-in fade-in duration-1000 delay-300" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <label className="text-executive-label opacity-40 ml-2" htmlFor="email">Identifiant Sécurisé</label>
                            <div className="relative group">
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-500">
                                    <Mail className="size-6" />
                                </div>
                                <input
                                    id="email"
                                    autoComplete="email"
                                    className="block w-full h-20 rounded-[1.5rem] border-2 border-border bg-accent/30 py-5 pl-16 pr-6 shadow-inner focus:border-primary focus:bg-background focus:outline-none placeholder:text-muted-foreground/30 text-base font-black italic transition-all duration-500"
                                    placeholder="direction@infrastructure.com"
                                    required
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between ml-2">
                                <label className="text-executive-label opacity-40" htmlFor="password">Clef d'Accès</label>
                                <button type="button" className="text-executive-label text-primary hover:text-foreground transition-colors italic">
                                    Protocole oublié ?
                                </button>
                            </div>
                            <div className="relative group">
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-500">
                                    <Lock className="size-6" />
                                </div>
                                <input
                                    id="password"
                                    autoComplete="current-password"
                                    className="block w-full h-20 rounded-[1.5rem] border-2 border-border bg-accent/30 py-5 pl-16 pr-16 shadow-inner focus:border-primary focus:bg-background focus:outline-none placeholder:text-muted-foreground/30 text-base font-black italic transition-all duration-500 tracking-[0.5em]"
                                    placeholder="••••••••"
                                    required
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="size-6" /> : <Eye className="size-6" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 py-2 ml-2">
                            <input
                                className="size-6 rounded-lg border-2 border-border bg-accent text-primary focus:ring-primary/20 transition-all cursor-pointer"
                                id="remember-me"
                                type="checkbox"
                            />
                            <label className="text-executive-label opacity-60 cursor-pointer select-none italic" htmlFor="remember-me">
                                Maintenir la session active
                            </label>
                        </div>

                        <Button
                            isLoading={isSubmitting}
                            type="submit"
                            className="w-full h-20 mt-6 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.4em] group shadow-premium relative overflow-hidden active-press transition-all hover:shadow-primary/40"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                            <span className="relative z-10 flex items-center justify-center gap-6">
                                DÉVERROUILLER L'ACCÈS
                                <ArrowRight className="size-5 group-hover:translate-x-3 transition-transform duration-500" />
                            </span>
                        </Button>
                    </form>

                    <div className="mt-16 animate-in fade-in duration-1000 delay-500">
                        <div className="relative flex items-center justify-center">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t-2 border-border"></div>
                            </div>
                            <span className="relative bg-background px-6 text-executive-label opacity-40 italic">
                                SSO EXTERNALLY VERIFIED
                            </span>
                        </div>

                        <div className="mt-10 grid grid-cols-2 gap-6">
                            <button className="flex w-full items-center justify-center gap-4 rounded-[1.5rem] border-2 border-border bg-accent/30 py-5 px-6 text-executive-label text-foreground shadow-sm hover:border-primary/20 transition-all duration-300 hover:scale-[1.02] active-press">
                                <Chrome className="size-5 text-[#4285F4]" />
                                <span>GOOGLE CLOUD</span>
                            </button>
                            <button className="flex w-full items-center justify-center gap-4 rounded-[1.5rem] border-2 border-border bg-accent/30 py-5 px-6 text-executive-label text-foreground shadow-sm hover:border-primary/20 transition-all duration-300 hover:scale-[1.02] active-press">
                                <Github className="size-5" />
                                <span>GITHUB GATEWAY</span>
                            </button>
                        </div>
                    </div>

                    <p className="mt-16 text-center text-executive-label opacity-50 animate-in fade-in duration-1000 delay-700 italic">
                        Aucune identité enregistrée ?{' '}
                        <Link className="text-primary hover:text-foreground transition-colors underline decoration-primary/30 underline-offset-8" to="/register">
                            Initier l'Inscription
                        </Link>
                    </p>
                </div>
            </div>

            {/* Côté droit : Visuel Executive Impactant */}
            <div className="hidden lg:relative lg:flex lg:flex-1 flex-col items-center justify-center overflow-hidden bg-black p-12">
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
                    
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter italic leading-[1.1]">
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
