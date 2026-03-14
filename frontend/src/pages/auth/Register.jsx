import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, Store, Truck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import BcaLogo from '../../components/ui/BcaLogo';
import ThemeToggle from '../../components/ui/ThemeToggle';

const Register = () => {
    const [formData, setFormData] = useState({
        role: 'client',
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
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
            setError('Les mots de passe ne correspondent pas.');
            return;
        }

        setIsSubmitting(true);

        try {
            await register({
                nom_complet: formData.fullName,
                email: formData.email,
                mot_de_passe: formData.password,
                role: formData.role
            });
            navigate('/login');
        } catch (error) {
            console.error(error);
            console.log("Mode développement : Simulation d'inscription réussie");
            setTimeout(() => {
                navigate('/login');
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

            {/* Côté gauche : Visuel branding (Style Landing Page) */}
            <div className="hidden lg:relative lg:flex lg:flex-1 flex-col items-center justify-center overflow-hidden bg-primary/20">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-primary mix-blend-multiply opacity-90"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-accent/40"></div>
                    <div className="absolute inset-0 opacity-20" style={{
                        backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                    }}></div>
                </div>

                <div className="relative z-10 max-w-lg text-center px-12 animate-in zoom-in-95 duration-1000">
                    <div className="mb-10 inline-flex items-center justify-center rounded-[2.5rem] bg-white/10 p-8 backdrop-blur-2xl border border-white/20 shadow-[-20px_20px_60px_rgba(0,0,0,0.3)] rotate-3">
                        <BcaLogo className="size-20" />
                    </div>
                    <h1 className="text-5xl font-black text-white mb-8 leading-tight tracking-tight">
                        Rejoignez la <br />
                        <span className="text-secondary-foreground italic">marketplace</span> de référence
                    </h1>
                    <p className="text-xl text-white/80 leading-relaxed font-medium mb-12">
                        Accédez à un réseau exclusif de fournisseurs et d'acheteurs qualifiés pour faire passer votre business au niveau supérieur.
                    </p>

                    <div className="space-y-6 text-left max-w-md mx-auto">
                        {[
                            "Vérification rigoureuse des membres",
                            "Transactions sécurisées et garanties",
                            "Support dédié 24/7 pour vos opérations"
                        ].map((text, i) => (
                            <div key={i} className="flex items-center gap-4 text-white animate-in slide-in-from-left duration-700" style={{ delay: `${i * 150}ms` }}>
                                <div className="p-1.5 rounded-full bg-accent/20 border border-accent/30">
                                    <CheckCircle2 className="size-5 text-accent" />
                                </div>
                                <span className="font-bold tracking-wide">{text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Animated Orbs */}
                <div className="absolute top-[-10%] left-[-10%] size-96 bg-accent/20 blur-[120px] rounded-full animate-bounce duration-[10000ms]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] size-96 bg-white/10 blur-[120px] rounded-full animate-pulse duration-[8000ms]"></div>
            </div>

            {/* Côté droit : Formulaire d'inscription */}
            <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-24 xl:px-40 relative z-10 overflow-y-auto">
                {/* Background decorative elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-30 pointer-events-none">
                    <div className="absolute -top-[10%] -right-[10%] size-[40%] bg-primary/20 blur-[120px] rounded-full"></div>
                    <div className="absolute bottom-[10%] left-[10%] size-[30%] bg-accent/20 blur-[100px] rounded-full"></div>
                </div>

                <div className="mx-auto w-full max-w-md">
                    {/* Header */}
                    <div className="mb-8 flex flex-col items-start gap-6">
                        <Link to="/" className="flex items-center gap-3 group animate-in slide-in-from-left duration-700">
                            <div className="p-2.5 rounded-2xl bg-primary/10 border border-primary/20 group-hover:scale-110 transition-transform duration-300">
                                <BcaLogo className="size-8" />
                            </div>
                            <span className="text-2xl font-black tracking-tighter italic text-primary">BCA Connect</span>
                        </Link>
                        <div className="animate-in slide-in-from-bottom duration-700 delay-100">
                            <h2 className="text-4xl font-black tracking-tight text-foreground mb-3">Créer un compte</h2>
                            <p className="text-muted-foreground font-medium">Rejoignez la plus grande communauté B2B de Guinée.</p>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-2xl bg-destructive/10 text-destructive text-sm border border-destructive/20 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
                            <ShieldCheck className="size-5 shrink-0" />
                            <p className="font-semibold">{error}</p>
                        </div>
                    )}

                    <form className="space-y-6 animate-in fade-in duration-1000 delay-200" onSubmit={handleSubmit}>
                        {/* Type d'utilisateur */}
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-foreground/80 ml-1">Je souhaite être :</label>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { id: 'client', label: 'Acheteur', icon: User },
                                    { id: 'fournisseur', label: 'Vendeur', icon: Store },
                                    { id: 'transporteur', label: 'Livreur', icon: Truck },
                                ].map((role) => (
                                    <label key={role.id} className="relative flex flex-col items-center gap-3 p-4 rounded-2xl border-2 border-border bg-muted/20 cursor-pointer hover:border-primary/50 transition-all has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:checked]:ring-2 has-[:checked]:ring-primary/20 group">
                                        <input
                                            type="radio"
                                            name="role"
                                            value={role.id}
                                            checked={formData.role === role.id}
                                            onChange={handleChange}
                                            className="sr-only"
                                        />
                                        <role.icon className="size-6 text-muted-foreground group-has-[:checked]:text-primary group-hover:scale-110 transition-transform duration-300" />
                                        <span className="text-xs font-black uppercase tracking-wider">{role.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Nom complet */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-foreground/80 ml-1">Nom complet</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-300">
                                    <User className="size-5" />
                                </div>
                                <input
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="block w-full rounded-2xl border-border bg-muted/30 py-4 pl-12 pr-4 shadow-sm ring-1 ring-inset ring-border placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm transition-all duration-300"
                                    placeholder="Prénom Nom"
                                    type="text"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-foreground/80 ml-1">Adresse Email</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-300">
                                    <Mail className="size-5" />
                                </div>
                                <input
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="block w-full rounded-2xl border-border bg-muted/30 py-4 pl-12 pr-4 shadow-sm ring-1 ring-inset ring-border placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm transition-all duration-300"
                                    placeholder="m.diallo@exemple.com"
                                    type="email"
                                    required
                                />
                            </div>
                        </div>

                        {/* Passwords */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-foreground/80 ml-1">Mot de passe</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-300">
                                        <Lock className="size-5" />
                                    </div>
                                    <input
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="block w-full rounded-2xl border-border bg-muted/30 py-4 pl-12 pr-12 shadow-sm ring-1 ring-inset ring-border placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm transition-all duration-300"
                                        placeholder="••••••••"
                                        type={showPassword ? 'text' : 'password'}
                                        required
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
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-foreground/80 ml-1">Confirmer</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-300">
                                        <ArrowRight className="size-5" />
                                    </div>
                                    <input
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="block w-full rounded-2xl border-border bg-muted/30 py-4 pl-12 pr-4 shadow-sm ring-1 ring-inset ring-border placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm transition-all duration-300"
                                        placeholder="••••••••"
                                        type="password"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 py-2 ml-1">
                            <input className="mt-1 size-5 shrink-0 rounded-lg border-border bg-muted/30 text-primary focus:ring-primary/20 transition-all cursor-pointer" id="terms" type="checkbox" required />
                            <label className="text-xs text-muted-foreground font-semibold leading-relaxed" htmlFor="terms">
                                J'accepte les <button type="button" className="text-primary font-black hover:text-accent transition-colors hover:underline">Conditions d'Utilisation</button> et la <button type="button" className="text-primary font-black hover:text-accent transition-colors hover:underline">Politique de Confidentialité</button>.
                            </label>
                        </div>

                        <Button
                            type="submit"
                            className="w-full py-7 rounded-2xl font-black text-lg group shadow-xl shadow-primary/25 relative overflow-hidden active:scale-[0.98] transition-transform"
                            disabled={isSubmitting}
                        >
                            <span className="relative z-10 flex items-center justify-center gap-3">
                                {isSubmitting ? 'Création...' : 'Créer mon compte'}
                                {!isSubmitting && <ArrowRight className="size-6 group-hover:translate-x-2 transition-transform duration-300" />}
                            </span>
                        </Button>
                    </form>

                    <p className="mt-10 text-center text-sm font-semibold text-muted-foreground">
                        Déjà inscrit ?{' '}
                        <Link className="text-primary font-black hover:text-accent transition-all hover:underline underline-offset-4 decoration-2" to="/login">
                            Se connecter
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
