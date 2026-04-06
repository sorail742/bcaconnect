import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../context/LanguageContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import { cn } from '../lib/utils';
import {
    CalendarDays, BadgeCheck, Edit3, Trash2, Shield,
    User as UserIcon, ShieldAlert, Zap, RefreshCw,
    Clock, Lock, Settings, CheckCircle2, Globe,
    Activity, ArrowRight, Bell, Mail
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const Toggle = ({ enabled, onChange, id }) => (
    <button
        id={id}
        onClick={() => onChange(!enabled)}
        className={cn(
            "relative inline-flex h-7 w-14 shrink-0 cursor-pointer items-center rounded-full transition-all duration-300 border",
            enabled ? "bg-primary border-primary" : "bg-muted border-border"
        )}
    >
        <motion.div
            animate={{ x: enabled ? 28 : 2 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="size-5 rounded-full bg-white shadow-sm"
        />
    </button>
);

const FormField = ({ label, icon: Icon, ...props }) => (
    <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</label>
        <div className="relative">
            {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />}
            <input
                className={cn(
                    "h-10 w-full bg-background border border-border rounded-xl text-sm outline-none focus:border-primary/50 transition-all text-foreground placeholder:text-muted-foreground",
                    Icon ? "pl-10 pr-3" : "px-3"
                )}
                {...props}
            />
        </div>
    </div>
);

const UserProfile = () => {
    const { t } = useLanguage();
    const { user, updateProfile, deleteAccount } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState(location.pathname === '/settings' ? 'settings' : 'profile');

    useEffect(() => {
        setActiveTab(location.pathname === '/settings' ? 'settings' : 'profile');
    }, [location.pathname]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        navigate(tab === 'settings' ? '/settings' : '/profile');
    };

    const [nomComplet, setNomComplet] = useState(user?.nom_complet || '');
    const [telephone, setTelephone] = useState(user?.telephone || '');
    const [email, setEmail] = useState(user?.email || '');
    const [motDePasse, setMotDePasse] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [emailAlerts, setEmailAlerts] = useState(true);
    const [pushNotifs, setPushNotifs] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleUpdate = async (e) => {
        if (e) e.preventDefault();
        if (motDePasse && motDePasse !== confirmPassword) {
            toast.error('Les mots de passe ne correspondent pas.');
            return;
        }
        setIsUpdating(true);
        try {
            await updateProfile({ nom_complet: nomComplet, telephone, email, mot_de_passe: motDePasse || undefined });
            toast.success('Profil mis à jour avec succès.');
            setMotDePasse('');
            setConfirmPassword('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour.');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm("Confirmer la suppression du compte ? Cette action est irréversible.")) {
            try {
                await deleteAccount();
                toast.success("Compte supprimé.");
            } catch {
                toast.error('Erreur lors de la suppression.');
            }
        }
    };

    const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'BC';

    return (
        <DashboardLayout title={activeTab === 'profile' ? "Mon Profil" : "Paramètres"}>
            <div className="space-y-6 pb-10">

                {/* Header card */}
                <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                                <UserIcon className="size-6" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-foreground">Gestion du compte</h2>
                                <p className="text-xs text-muted-foreground">ID: {user?.id?.slice(0, 8).toUpperCase()}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Tabs */}
                            <div className="flex items-center bg-muted p-1 rounded-xl border border-border">
                                <button
                                    onClick={() => handleTabChange('profile')}
                                    className={cn("px-4 h-8 rounded-lg text-xs font-semibold transition-all", activeTab === 'profile' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
                                >
                                    Profil
                                </button>
                                <button
                                    onClick={() => handleTabChange('settings')}
                                    className={cn("px-4 h-8 rounded-lg text-xs font-semibold transition-all", activeTab === 'settings' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
                                >
                                    Paramètres
                                </button>
                            </div>
                            <button
                                onClick={handleUpdate}
                                disabled={isUpdating}
                                className="h-9 px-5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 disabled:opacity-60"
                            >
                                {isUpdating ? <RefreshCw className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                                {isUpdating ? 'Enregistrement...' : 'Enregistrer'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                    {/* Left — Avatar card */}
                    <div className="xl:col-span-1 space-y-4">
                        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                            {/* Avatar area */}
                            <div className="h-24 bg-gradient-to-br from-primary/10 to-muted relative">
                                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                            </div>
                            <div className="px-5 pb-5 -mt-10 relative">
                                <div className="relative w-fit">
                                    <div className="size-20 rounded-2xl border-4 border-card bg-muted flex items-center justify-center overflow-hidden shadow-md">
                                        {user?.photo_url
                                            ? <img src={user.photo_url} alt="" className="w-full h-full object-cover" />
                                            : <span className="text-2xl font-bold text-primary">{getInitials(user?.nom_complet)}</span>
                                        }
                                    </div>
                                    <button className="absolute -bottom-1 -right-1 size-7 bg-primary text-primary-foreground rounded-lg shadow-sm flex items-center justify-center hover:bg-primary/90 transition-colors">
                                        <Edit3 className="size-3.5" />
                                    </button>
                                </div>
                                <div className="mt-3 space-y-1">
                                    <h4 className="text-sm font-bold text-foreground">{user?.nom_complet}</h4>
                                    <div className="flex items-center gap-1.5">
                                        <BadgeCheck className="size-3.5 text-primary" />
                                        <span className="text-xs text-primary font-medium">
                                            {user?.role === 'fournisseur' ? 'Marchand certifié' : 'Membre vérifié'}
                                        </span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-4">
                                    <div className="bg-muted rounded-xl p-3 text-center border border-border">
                                        <p className="text-lg font-bold text-primary tabular-nums">{user?.points_fidelite || 0}</p>
                                        <p className="text-xs text-muted-foreground">Points</p>
                                    </div>
                                    <div className="bg-muted rounded-xl p-3 text-center border border-border">
                                        <p className="text-lg font-bold text-foreground">{new Date(user?.createdAt).getFullYear()}</p>
                                        <p className="text-xs text-muted-foreground">Membre depuis</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                                    <CalendarDays className="size-3.5 text-primary/60" />
                                    <span>Inscrit le {new Date(user?.createdAt).toLocaleDateString('fr-GN')}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex gap-3">
                            <Shield className="size-5 text-primary shrink-0 mt-0.5" />
                            <p className="text-xs text-primary/80 leading-relaxed">
                                Votre identité est chiffrée et sécurisée sur le réseau BCA Connect.
                            </p>
                        </div>
                    </div>

                    {/* Right — Forms */}
                    <div className="xl:col-span-3">
                        <AnimatePresence mode="wait">
                            {activeTab === 'profile' ? (
                                <motion.div
                                    key="profile"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="space-y-5"
                                >
                                    {/* Personal info */}
                                    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-5">
                                        <div className="flex items-center gap-3 pb-4 border-b border-border">
                                            <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                                                <UserIcon className="size-4 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-foreground">Informations personnelles</h3>
                                                <p className="text-xs text-muted-foreground">Mettez à jour vos informations de profil</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField label="Nom complet" icon={UserIcon} value={nomComplet} onChange={e => setNomComplet(e.target.value)} placeholder="Votre nom complet" />
                                            <FormField label="Téléphone" icon={Globe} type="tel" value={telephone} onChange={e => setTelephone(e.target.value)} placeholder="+224 ..." />
                                        </div>
                                        <FormField label="Adresse email" icon={Mail} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="votre@email.com" />
                                    </div>

                                    {/* Trust score */}
                                    <div className="bg-primary rounded-2xl p-5 flex items-center justify-between shadow-sm">
                                        <div className="space-y-1">
                                            <h4 className="text-sm font-bold text-primary-foreground">Score de confiance réseau</h4>
                                            <p className="text-xs text-primary-foreground/70">
                                                Stabilité : <span className="font-semibold text-primary-foreground">99% — Optimal</span>
                                            </p>
                                        </div>
                                        <div className="size-12 rounded-xl bg-primary-foreground/10 border border-primary-foreground/20 flex items-center justify-center">
                                            <Zap className="size-6 text-primary-foreground" />
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="settings"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="space-y-5"
                                >
                                    {/* Password */}
                                    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-5">
                                        <div className="flex items-center gap-3 pb-4 border-b border-border">
                                            <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                                                <Lock className="size-4 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-foreground">Sécurité du compte</h3>
                                                <p className="text-xs text-muted-foreground">Modifiez votre mot de passe</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField label="Nouveau mot de passe" type="password" value={motDePasse} onChange={e => setMotDePasse(e.target.value)} placeholder="••••••••" />
                                            <FormField label="Confirmer le mot de passe" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" />
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-muted rounded-xl border border-border">
                                            <Clock className="size-4 text-muted-foreground shrink-0" />
                                            <p className="text-xs text-muted-foreground">Laissez vide pour conserver le mot de passe actuel.</p>
                                        </div>
                                    </div>

                                    {/* Notifications */}
                                    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
                                        <div className="flex items-center gap-3 pb-4 border-b border-border">
                                            <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                                                <Bell className="size-4 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-foreground">Notifications</h3>
                                                <p className="text-xs text-muted-foreground">Gérez vos préférences de notification</p>
                                            </div>
                                        </div>
                                        {[
                                            { id: 'email', label: 'Alertes email', desc: 'Recevez un résumé de vos transactions par email', value: emailAlerts, onChange: setEmailAlerts },
                                            { id: 'push', label: 'Notifications push', desc: 'Notifications en temps réel sur vos commandes', value: pushNotifs, onChange: setPushNotifs },
                                        ].map(item => (
                                            <div key={item.id} className="flex items-center justify-between p-4 bg-muted rounded-xl border border-border hover:border-primary/30 transition-colors">
                                                <div>
                                                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                                                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                                                </div>
                                                <Toggle id={`toggle-${item.id}`} enabled={item.value} onChange={item.onChange} />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Danger zone */}
                                    <div className="bg-card border border-rose-500/20 rounded-2xl p-5 shadow-sm">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex items-start gap-3 border-l-4 border-rose-500 pl-4">
                                                <ShieldAlert className="size-5 text-rose-500 shrink-0 mt-0.5" />
                                                <div>
                                                    <h4 className="text-sm font-bold text-foreground">Zone dangereuse</h4>
                                                    <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                                                        La suppression de votre compte est définitive. Toutes vos données seront effacées.
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleDelete}
                                                className="flex items-center gap-2 h-9 px-5 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-white rounded-xl font-semibold text-sm transition-all shrink-0"
                                            >
                                                <Trash2 className="size-4" />
                                                Supprimer le compte
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default UserProfile;
