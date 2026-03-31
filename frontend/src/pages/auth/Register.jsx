import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, Store, Truck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import BcaLogo from '../../components/ui/BcaLogo';
import ThemeToggle from '../../components/ui/ThemeToggle';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

const Register = () => {
    const [formData, setFormData] = useState({
        role: 'client',
        fullName: '',
        email: '',
        telephone: '',
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
                telephone: formData.telephone,
                mot_de_passe: formData.password,
                role: formData.role
            });

            toast.success("Compte créé avec succès ! Veuillez vous connecter.");
            navigate('/login');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Une erreur est survenue lors de l'inscription.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-background text-foreground transition-all duration-500 selection:bg-primary/30 font-inter">
            {/* Theme Toggle Floating */}
            <div className="absolute top-6 right-6 z-50">
                <div className="bg-card/50 backdrop-blur-xl border-2 border-border p-2 rounded-2xl shadow-premium hover:shadow-primary/10 transition-all hover:scale-105 active-press">
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
                    <div className="mb-10 inline-flex items-center justify-center rounded-[2.5rem] bg-white/10 p-10 backdrop-blur-2xl border border-white/20 shadow-2xl transition-transform hover:rotate-2 duration-500">
                        <BcaLogo className="size-24" />
                    </div>
                    <h1 className="text-5xl font-bold text-white mb-8 leading-tight tracking-tight">
                        Rejoignez la <br />
                        <span className="opacity-60">marketplace</span> de <br />
                        référence.
                    </h1>
                    <p className="text-lg text-white/70 leading-relaxed font-medium mb-12 max-w-sm mx-auto">
                        Accédez à un réseau exclusif de partenaires qualifiés pour développer votre activité en Afrique.
                    </p>

                    <div className="space-y-6 text-left max-w-xs mx-auto">
                        {[
                            "Membres vérifiés & certifiés",
                            "Paiements 100% sécurisés",
                            "Support prioritaire 24/7"
                        ].map((text, i) => (
                            <div key={i} className="flex items-center gap-4 text-white/90 animate-in slide-in-from-left duration-700" style={{ transitionDelay: `${i * 150}ms` }}>
                                <div className="p-1.5 rounded-full bg-white/10 border border-white/20">
                                    <CheckCircle2 className="size-4 text-emerald-400" />
                                </div>
                                <span className="text-[13px] font-bold tracking-wide">{text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Animated Orbs */}
                <div className="absolute top-[-10%] left-[-10%] size-96 bg-accent/20 blur-[120px] rounded-full animate-bounce duration-[10000ms]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] size-96 bg-white/10 blur-[120px] rounded-full animate-pulse duration-[8000ms]"></div>
            </div>

            {/* Côté droit : Formulaire d'inscription */}
            <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-24 xl:px-40 relative z-10 overflow-y-auto bg-background">
                {/* Background decorative elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-30 pointer-events-none">
                    <div className="absolute -top-[10%] -right-[10%] size-[40%] bg-primary/20 blur-[120px] rounded-full"></div>
                    <div className="absolute bottom-[10%] left-[10%] size-[30%] bg-accent/20 blur-[100px] rounded-full"></div>
                </div>

                <div className="mx-auto w-full max-w-md">
                    {/* Header */}
                    <div className="mb-12 flex flex-col items-start gap-10">
                        <Link to="/" className="flex items-center gap-6 group animate-in slide-in-from-left duration-700">
                            <div className="size-14 rounded-2xl bg-foreground text-background flex items-center justify-center group-hover:bg-primary transition-colors duration-300 shadow-premium">
                                <BcaLogo className="size-7" />
                            </div>
                            <span className="text-2xl font-black tracking-tighter text-foreground uppercase italic underline decoration-primary/50 decoration-4 underline-offset-8">BCA Connect</span>
                        </Link>
                        <div className="animate-in slide-in-from-bottom duration-700 delay-100">
                            <h2 className="text-6xl font-black tracking-tighter text-foreground mb-6 italic uppercase leading-none">Création <span className="text-primary italic">Compte</span></h2>
                            <p className="text-executive-label opacity-40 italic">Incorporez-vous dans l'écosystème B2B digital le plus performant d'Afrique.</p>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-8 p-4 rounded-2xl bg-red-50 dark:bg-red-500/5 text-red-600 dark:text-red-500 text-xs border border-red-100 dark:border-red-500/10 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
                            <ShieldCheck className="size-4 shrink-0" />
                            <p className="font-bold uppercase tracking-widest">{error}</p>
                        </div>
                    )}

                    <form className="space-y-8 animate-in fade-in duration-1000 delay-200" onSubmit={handleSubmit}>
                        {/* Type d'utilisateur */}
                        <div className="space-y-4">
                            <label className="text-executive-label opacity-40 ml-2">Configuration du Profil Executive :</label>
                            <div className="grid grid-cols-3 gap-5">
                                {[
                                    { id: 'client', label: 'ACHETEUR', icon: User },
                                    { id: 'fournisseur', label: 'VENDEUR', icon: Store },
                                    { id: 'transporteur', label: 'LOGISTIQUE', icon: Truck },
                                ].map((role) => (
                                    <label key={role.id} className="relative flex flex-col items-center gap-4 p-6 rounded-2xl border-2 border-border bg-accent/30 cursor-pointer overflow-hidden transition-all hover:bg-background has-[:checked]:border-primary has-[:checked]:bg-background has-[:checked]:shadow-premium group">
                                        <input
                                            type="radio"
                                            name="role"
                                            value={role.id}
                                            checked={formData.role === role.id}
                                            onChange={handleChange}
                                            className="sr-only"
                                        />
                                        <role.icon className={cn(
                                            "size-6 transition-colors duration-300",
                                            formData.role === role.id ? "text-primary" : "text-muted-foreground"
                                        )} />
                                        <span className={cn(
                                            "text-executive-label transition-colors italic",
                                            formData.role === role.id ? "text-primary" : "text-muted-foreground"
                                        )}>{role.label}</span>
                                        {formData.role === role.id && (
                                            <div className="absolute top-2 right-2">
                                                <div className="size-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(43,90,255,0.6)]" />
                                            </div>
                                        )}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Nom complet */}
                        <div className="space-y-3">
                            <label className="text-executive-label opacity-40 ml-2">Nom Complet Certifié</label>
                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-300">
                                    <User className="size-5" />
                                </div>
                                <input
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="block w-full h-16 rounded-[1.5rem] border-2 border-border bg-accent/30 py-4 pl-14 pr-4 shadow-inner focus:border-primary focus:bg-background focus:outline-none placeholder:text-muted-foreground/30 text-sm font-black italic transition-all duration-300"
                                    placeholder="Executive Name"
                                    type="text"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-3">
                            <label className="text-executive-label opacity-40 ml-2">Adresse Email</label>
                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-300">
                                    <Mail className="size-5" />
                                </div>
                                <input
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="block w-full h-16 rounded-[1.5rem] border-2 border-border bg-accent/30 py-4 pl-14 pr-4 shadow-inner focus:border-primary focus:bg-background focus:outline-none placeholder:text-muted-foreground/30 text-sm font-black italic transition-all duration-300"
                                    placeholder="corporate@email.com"
                                    type="email"
                                    required
                                />
                            </div>
                        </div>

                        {/* Telephone */}
                        <div className="space-y-3">
                            <label className="text-executive-label opacity-40 ml-2">Canal Téléphonique</label>
                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-300">
                                    <Truck className="size-5" />
                                </div>
                                <input
                                    name="telephone"
                                    value={formData.telephone}
                                    onChange={handleChange}
                                    className="block w-full h-16 rounded-[1.5rem] border-2 border-border bg-accent/30 py-4 pl-14 pr-4 shadow-inner focus:border-primary focus:bg-background focus:outline-none placeholder:text-muted-foreground/30 text-sm font-black italic transition-all duration-300"
                                    placeholder="+224 6XX XX XX XX"
                                    type="tel"
                                    required
                                />
                            </div>
                        </div>

                        {/* Passwords */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-executive-label opacity-40 ml-2">Clef d'Accès</label>
                                <div className="relative group">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-300">
                                        <Lock className="size-5" />
                                    </div>
                                    <input
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="block w-full h-16 rounded-[1.5rem] border-2 border-border bg-accent/30 py-4 pl-14 pr-12 shadow-inner focus:border-primary focus:bg-background focus:outline-none placeholder:text-muted-foreground/30 text-sm font-black italic transition-all duration-300 tracking-[0.3em]"
                                        placeholder="••••••••"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                    />
                                    <button
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-executive-label opacity-40 ml-2">Validation</label>
                                <div className="relative group">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-300">
                                        <ArrowRight className="size-5" />
                                    </div>
                                    <input
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="block w-full h-16 rounded-[1.5rem] border-2 border-border bg-accent/30 py-4 pl-14 pr-4 shadow-inner focus:border-primary focus:bg-background focus:outline-none placeholder:text-muted-foreground/30 text-sm font-black italic transition-all duration-300 tracking-[0.3em]"
                                        placeholder="••••••••"
                                        type="password"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-5 py-2 ml-1">
                            <input className="mt-1 size-6 shrink-0 rounded-lg border-2 border-border bg-accent text-primary focus:ring-primary/20 transition-all cursor-pointer" id="terms" type="checkbox" required />
                            <label className="text-executive-label opacity-60 leading-relaxed italic" htmlFor="terms">
                                J'accepte les <button type="button" className="text-primary font-black hover:text-foreground transition-colors underline decoration-primary/30 underline-offset-4">Protocoles d'Utilisation</button> et la <button type="button" className="text-primary font-black hover:text-foreground transition-colors underline decoration-primary/30 underline-offset-4">Politique de Confidentialité</button>.
                            </label>
                        </div>

                        <Button
                            type="submit"
                            isLoading={isSubmitting}
                            className="w-full h-20 rounded-2xl font-black text-sm uppercase tracking-[0.4em] group shadow-premium relative overflow-hidden active-press transition-transform"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-6">
                                {isSubmitting ? 'FINALISATION...' : 'CRÉER MON COMPTE'}
                                {!isSubmitting && <ArrowRight className="size-5 group-hover:translate-x-3 transition-transform duration-300" />}
                            </span>
                        </Button>
                    </form>

                    <p className="mt-12 text-center text-executive-label opacity-50 italic">
                        Déjà inscrit ?{' '}
                        <Link className="text-primary hover:text-foreground transition-all underline decoration-primary/30 underline-offset-8" to="/login">
                            Se connecter au Portail
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
