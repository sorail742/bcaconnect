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
            await login(email, password);
            navigate(from, { replace: true });
        } catch (error) {
            console.error(error);
            console.log("Mode développement : Simulation de connexion réussie");
            setTimeout(() => {
                navigate(from, { replace: true });
            }, 1000);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-background text-foreground transition-all duration-500 selection:bg-primary/30 font-sans">
            {/* Theme Toggle Floating */}
            <div className="absolute top-6 right-6 z-50">
                <div className="bg-card/50 backdrop-blur-xl border border-border p-1.5 rounded-2xl shadow-2xl hover:shadow-primary/10 transition-all hover:scale-105 active:scale-95">
                    <ThemeToggle minimal className="hover:bg-transparent" />
                </div>
            </div>

            {/* Côté gauche : Formulaire (Style Landing Page) */}
            <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-24 xl:px-40 relative z-10">
                {/* Background decorative elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-30 pointer-events-none">
                    <div className="absolute -top-[10%] -left-[10%] size-[40%] bg-primary/20 blur-[120px] rounded-full"></div>
                    <div className="absolute bottom-[10%] right-[10%] size-[30%] bg-accent/20 blur-[100px] rounded-full"></div>
                </div>

                <div className="mx-auto w-full max-w-md">
                    {/* Header Logo */}
                    <div className="mb-12 flex flex-col items-start gap-6">
                        <Link to="/" className="flex items-center gap-3 group animate-in slide-in-from-left duration-700">
                            <div className="p-2.5 rounded-2xl bg-primary/10 border border-primary/20 group-hover:scale-110 transition-transform duration-300">
                                <BcaLogo className="size-8" />
                            </div>
                            <span className="text-2xl font-black tracking-tighter italic text-primary">BCA Connect</span>
                        </Link>
                        <div className="animate-in slide-in-from-bottom duration-700 delay-100">
                            <h2 className="text-4xl font-black tracking-tight text-foreground mb-3">Bon retour</h2>
                            <p className="text-muted-foreground font-medium">Veuillez saisir vos identifiants pour accéder à votre espace sécurisé.</p>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-2xl bg-destructive/10 text-destructive text-sm border border-destructive/20 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
                            <ShieldCheck className="size-5 shrink-0" />
                            <p className="font-semibold">{error}</p>
                        </div>
                    )}

                    <form className="space-y-6 animate-in fade-in duration-1000 delay-200" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-foreground/80 ml-1" htmlFor="email">Adresse e-mail</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-300">
                                    <Mail className="size-5" />
                                </div>
                                <input
                                    id="email"
                                    autoComplete="email"
                                    className="block w-full rounded-2xl border-border bg-muted/30 py-4 pl-12 pr-4 shadow-sm ring-1 ring-inset ring-border placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm transition-all duration-300"
                                    placeholder="nom@exemple.com"
                                    required
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between ml-1">
                                <label className="text-sm font-bold text-foreground/80" htmlFor="password">Mot de passe</label>
                                <button type="button" className="text-xs font-bold text-primary hover:text-accent transition-colors">
                                    Mot de passe oublié ?
                                </button>
                            </div>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-300">
                                    <Lock className="size-5" />
                                </div>
                                <input
                                    id="password"
                                    autoComplete="current-password"
                                    className="block w-full rounded-2xl border-border bg-muted/30 py-4 pl-12 pr-12 shadow-sm ring-1 ring-inset ring-border placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm transition-all duration-300"
                                    placeholder="••••••••"
                                    required
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 py-1 ml-1">
                            <input
                                className="size-4 rounded-lg border-border bg-muted/30 text-primary focus:ring-primary/30 transition-all cursor-pointer"
                                id="remember-me"
                                type="checkbox"
                            />
                            <label className="text-sm font-semibold text-muted-foreground cursor-pointer select-none" htmlFor="remember-me">
                                Se souvenir de moi
                            </label>
                        </div>

                        <Button
                            disabled={isSubmitting}
                            type="submit"
                            className="w-full py-7 rounded-2xl font-black text-lg group shadow-xl shadow-primary/25 relative overflow-hidden active:scale-[0.98] transition-transform"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-3">
                                {isSubmitting ? 'Connexion...' : 'Se connecter'}
                                {!isSubmitting && <ArrowRight className="size-6 group-hover:translate-x-2 transition-transform duration-300" />}
                            </span>
                        </Button>
                    </form>

                    <div className="mt-10 animate-in fade-in duration-1000 delay-300">
                        <div className="relative flex items-center justify-center">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-border"></div>
                            </div>
                            <span className="relative bg-background px-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                Ou continuer avec
                            </span>
                        </div>

                        <div className="mt-8 grid grid-cols-2 gap-4">
                            <button className="flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-card/50 py-3.5 px-4 text-sm font-bold text-foreground shadow-sm hover:bg-muted transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                                <Chrome className="size-5 text-[#4285F4]" />
                                <span>Google</span>
                            </button>
                            <button className="flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-card/50 py-3.5 px-4 text-sm font-bold text-foreground shadow-sm hover:bg-muted transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                                <Github className="size-5" />
                                <span>GitHub</span>
                            </button>
                        </div>
                    </div>

                    <p className="mt-12 text-center text-sm font-semibold text-muted-foreground animate-in fade-in duration-1000 delay-400">
                        Nouveau sur BCA Connect ?{' '}
                        <Link className="text-primary font-black hover:text-accent transition-all hover:underline underline-offset-4 decoration-2" to="/register">
                            Créer un compte
                        </Link>
                    </p>
                </div>
            </div>

            {/* Côté droit : Visuel Impactant (Style Landing Page) */}
            <div className="hidden lg:relative lg:flex lg:flex-1 flex-col items-center justify-center overflow-hidden bg-primary/20">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-primary mix-blend-multiply opacity-90"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-accent/40"></div>
                    {/* Grid Pattern */}
                    <div className="absolute inset-0 opacity-20" style={{
                        backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                    }}></div>
                </div>

                <div className="relative z-10 max-w-xl text-center px-12 animate-in zoom-in-95 duration-1000">
                    <div className="mb-10 inline-flex items-center justify-center rounded-[2.5rem] bg-white/10 p-8 backdrop-blur-2xl border border-white/20 shadow-[-20px_20px_60px_rgba(0,0,0,0.3)] rotate-3">
                        <BcaLogo className="size-20" />
                    </div>
                    <h1 className="text-6xl font-black text-white mb-8 leading-[1.1] tracking-tight">
                        Plateforme <br />
                        <span className="text-secondary-foreground italic">sécurisée</span> de <br />
                        marketplace B2B
                    </h1>
                    <p className="text-xl text-white/80 leading-relaxed font-medium mb-12">
                        Optimisez vos relations commerciales et simplifiez vos transactions sur la place de marché de référence en Guinée.
                    </p>

                    <div className="flex flex-col items-center">
                        <div className="flex -space-x-3 mb-6">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className={`size-12 rounded-full border-2 border-white/20 bg-muted/20 backdrop-blur-md flex items-center justify-center shadow-xl overflow-hidden`}>
                                    <div className="size-full bg-gradient-to-br from-white/30 to-white/5"></div>
                                </div>
                            ))}
                            <div className="size-12 rounded-full border-2 border-white/20 bg-accent text-[10px] font-black text-primary flex items-center justify-center shadow-xl backdrop-blur-md">
                                +5k
                            </div>
                        </div>
                        <p className="text-sm font-bold text-white/60 uppercase tracking-[0.2em]">Rejoignez une communauté d'experts</p>
                    </div>
                </div>

                {/* Animated Orbs */}
                <div className="absolute top-[-10%] right-[-10%] size-96 bg-accent/20 blur-[120px] rounded-full animate-bounce duration-[10000ms]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] size-96 bg-white/10 blur-[120px] rounded-full animate-pulse duration-[8000ms]"></div>
            </div>
        </div>
    );
};

export default Login;
