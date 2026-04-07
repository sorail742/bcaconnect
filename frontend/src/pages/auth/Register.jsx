import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, ArrowRight, Store, Truck, CheckCircle2, Zap, Briefcase, Activity, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';
import { useLanguage } from '../../context/LanguageContext';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

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
            const msg = 'Les mots de passe ne correspondent pas';
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

            toast.success('Compte créé avec succès!');
            navigate('/login');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Erreur lors de l\'inscription');
        } finally {
            setIsSubmitting(false);
        }
    };

    const roles = [
        { id: 'client', label: 'Acheteur', icon: User },
        { id: 'fournisseur', label: 'Vendeur', icon: Store },
        { id: 'transporteur', label: 'Livreur', icon: Truck },
    ];

    return (
        <div className="flex min-h-screen bg-background text-foreground overflow-hidden">
            {/* Left Side: Showcase */}
            <div className="hidden lg:flex flex-1 bg-gradient-to-tl from-primary/10 via-background to-background border-r border-border items-center justify-center p-12">
                <motion.div 
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-lg w-full space-y-12"
                >
                    <div className="inline-flex items-center justify-center size-20 rounded-2xl bg-primary/10 border border-primary/20">
                        <Briefcase className="size-10 text-primary" />
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-4xl font-bold text-foreground">
                            Rejoignez <span className="text-primary">BCA Connect</span>
                        </h2>
                        <p className="text-base text-muted-foreground leading-relaxed">
                            Première plateforme commerciale unifiée conçue pour la performance et la croissance accélérée.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {[
                            'Intégration en temps réel',
                            'Sécurité maximale',
                            'Expansion en Afrique'
                        ].map((text, i) => (
                            <motion.div 
                                key={i} 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 + (i * 0.1) }}
                                className="flex items-center gap-3"
                            >
                                <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                                    <CheckCircle2 className="size-4 text-primary" />
                                </div>
                                <span className="text-sm font-medium text-foreground">{text}</span>
                            </motion.div>
                        ))}
                    </div>

                    <div className="pt-8 space-y-4">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Optimisation des flux</span>
                            <span className="text-emerald-500 font-semibold">En ligne</span>
                        </div>
                        <div className="h-2 bg-border rounded-full overflow-hidden">
                            <motion.div 
                                animate={{ x: ['-100%', '200%'] }}
                                transition={{ repeat: Infinity, duration: 4 }}
                                className="h-full w-1/2 bg-emerald-500 rounded-full"
                            />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Right Side: Form */}
            <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-20 overflow-y-auto">
                <motion.div 
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-md w-full mx-auto space-y-10"
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
                        <h1 className="text-3xl font-bold text-foreground">Créer un compte</h1>
                        <p className="text-sm text-muted-foreground">Rejoignez l'écosystème BCA Connect</p>
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
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Role Selection */}
                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-foreground">Type de compte</label>
                            <div className="grid grid-cols-3 gap-3">
                                {roles.map((role) => (
                                    <label key={role.id} className="relative cursor-pointer">
                                        <input
                                            type="radio"
                                            name="role"
                                            value={role.id}
                                            checked={formData.role === role.id}
                                            onChange={handleChange}
                                            className="sr-only"
                                        />
                                        <div className={cn(
                                            "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                                            formData.role === role.id 
                                                ? "bg-primary/10 border-primary" 
                                                : "bg-background border-border hover:border-primary/30"
                                        )}>
                                            <role.icon className={cn("size-5", formData.role === role.id ? "text-primary" : "text-muted-foreground")} />
                                            <span className="text-xs font-medium text-center">{role.label}</span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Name and Email */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground">Nom complet</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                                    <input 
                                        name="fullName" 
                                        value={formData.fullName} 
                                        onChange={handleChange} 
                                        placeholder="Votre nom"
                                        className="w-full h-12 pl-12 pr-4 bg-background border-2 border-border text-sm font-medium rounded-lg focus:border-primary focus:outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                                    <input 
                                        name="email" 
                                        type="email" 
                                        value={formData.email} 
                                        onChange={handleChange} 
                                        placeholder="votre@email.com"
                                        className="w-full h-12 pl-12 pr-4 bg-background border-2 border-border text-sm font-medium rounded-lg focus:border-primary focus:outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground">Téléphone</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                                <input 
                                    name="telephone" 
                                    value={formData.telephone} 
                                    onChange={handleChange} 
                                    placeholder="+224 XX XX XX XX"
                                    className="w-full h-12 pl-12 pr-4 bg-background border-2 border-border text-sm font-medium rounded-lg focus:border-primary focus:outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Passwords */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground">Mot de passe</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                                    <input 
                                        name="password" 
                                        type="password" 
                                        value={formData.password} 
                                        onChange={handleChange} 
                                        placeholder="••••••••"
                                        className="w-full h-12 pl-12 pr-4 bg-background border-2 border-border text-sm font-medium rounded-lg focus:border-primary focus:outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground">Confirmer</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                                    <input 
                                        name="confirmPassword" 
                                        type="password" 
                                        value={formData.confirmPassword} 
                                        onChange={handleChange} 
                                        placeholder="••••••••"
                                        className="w-full h-12 pl-12 pr-4 bg-background border-2 border-border text-sm font-medium rounded-lg focus:border-primary focus:outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-12 rounded-lg bg-primary text-primary-foreground font-semibold text-sm shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <>
                                    <span>Créer un compte</span>
                                    <ArrowRight className="size-4" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Sign In Link */}
                    <p className="text-center text-sm text-muted-foreground">
                        Vous avez déjà un compte?{' '}
                        <Link to="/login" className="text-primary hover:text-primary/80 font-semibold">
                            Se connecter
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default Register;
