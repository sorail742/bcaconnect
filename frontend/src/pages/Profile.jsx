import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useUserProfile } from '../hooks/useDomainData';
import { useLanguage } from '../context/LanguageContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import { DataStateWrapper } from '../components/ui/DataStates';
import { cn } from '../lib/utils';
import {
    CalendarDays, BadgeCheck, Edit3, Trash2, Shield,
    User as UserIcon, ShieldAlert, Zap, RefreshCw,
    Clock, Lock, Settings, CheckCircle2, Globe,
    Activity, ArrowRight, Bell, Mail, Camera, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import authService from '../services/authService';
import uploadService from '../services/uploadService';
import useApiMutation from '../hooks/useApiMutation';
import { RefreshCcw as RefreshIcon, QrCode, X } from 'lucide-react';
import { profileUpdateSchema } from '../lib/validation';

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
    const { user, updateProfile, deleteAccount, refreshUser } = useAuth();
    const { data: profile, loading: profileLoading, error: profileError, refetch: refetchProfile } = useUserProfile();
    const displayUser = profile || user;
    const location = useLocation();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [activeTab, setActiveTab] = useState(location.pathname === '/settings' ? 'settings' : 'profile');

    useEffect(() => {
        setActiveTab(location.pathname === '/settings' ? 'settings' : 'profile');
    }, [location.pathname]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        navigate(tab === 'settings' ? '/settings' : '/profile');
    };

    const [nomComplet, setNomComplet] = useState('');
    const [telephone, setTelephone] = useState('');
    const [email, setEmail] = useState('');
    const [motDePasse, setMotDePasse] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [emailAlerts, setEmailAlerts] = useState(true);
    const [pushNotifs, setPushNotifs] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        const source = profile || user;
        if (!source) return;
        setNomComplet(source.nom_complet || '');
        setTelephone(source.telephone || '');
        setEmail(source.email || '');
        setEmailAlerts(source.settings?.emailAlerts ?? true);
        setPushNotifs(source.settings?.pushNotifs ?? false);
    }, [profile, user]);

    // 2FA States
    const [show2FASetup, setShow2FASetup] = useState(false);
    const [twoFactorData, setTwoFactorData] = useState(null);
    const [otpCode, setOtpCode] = useState('');

    // Mutations
    const { mutate: updateProfileMutation, isPending: isUpdating } = useApiMutation(
        (data) => updateProfile(data),
        {
            successMessage: 'Profil mis à jour avec succès.',
            invalidateKeys: ['user-profile'],
            onSuccess: () => {
                setMotDePasse('');
                setConfirmPassword('');
                refetchProfile();
            }
        }
    );

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error("Format d'image non supporté.");
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error("Image trop lourde (2MB max).");
            return;
        }

        try {
            setIsUploading(true);
            const { url } = await uploadService.uploadFile(file);
            await updateProfile({ avatar_url: url });
            await refetchProfile();
            if (refreshUser) await refreshUser();
            toast.success("Photo de profil mise à jour !");
        } catch (error) {
            console.error('Upload error:', error);
            toast.error("Échec du téléchargement de l'image.");
        } finally {
            setIsUploading(false);
        }
    };

    const { mutate: deleteAccountMutation } = useApiMutation(
        () => deleteAccount(),
        {
            successMessage: "Compte supprimé.",
            onSuccess: () => navigate('/')
        }
    );

    const { mutate: confirm2FAMutation, isPending: isConfiguring2FA } = useApiMutation(
        (code) => authService.confirm2FA(code),
        {
            successMessage: "Authentification 2FA activée !",
            invalidateKeys: ['user-profile'],
            onSuccess: async () => {
                setShow2FASetup(false);
                setOtpCode('');
                if (refreshUser) await refreshUser();
            }
        }
    );

    const handleSetup2FA = async () => {
        try {
            const data = await authService.setup2FA();
            setTwoFactorData(data);
            setShow2FASetup(true);
        } catch (error) {
            toast.error("Erreur lors de l'initialisation de la 2FA.");
        }
    };

    const handleConfirm2FA = () => {
        if (!otpCode) return toast.error("Veuillez entrer le code de vérification.");
        confirm2FAMutation(otpCode);
    };

    const handleUpdate = (e) => {
        if (e) e.preventDefault();
        
        try {
            profileUpdateSchema.parse({ nom_complet: nomComplet, telephone, email, mot_de_passe: motDePasse });
        } catch (error) {
            if (error.errors && error.errors.length > 0) {
                toast.error(error.errors[0].message);
            } else {
                toast.error("Données de formulaire invalides.");
            }
            return;
        }

        if (motDePasse && motDePasse !== confirmPassword) {
            toast.error('Les mots de passe ne correspondent pas.');
            return;
        }

        updateProfileMutation({ 
            nom_complet: nomComplet, 
            telephone, 
            email, 
            mot_de_passe: motDePasse || undefined 
        });
    };

    const handleDelete = () => {
        if (window.confirm("Confirmer la suppression du compte ? Cette action est irréversible.")) {
            deleteAccountMutation();
        }
    };

    const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'BC';

    return (
        <DashboardLayout title={activeTab === 'profile' ? t('profTitle') : t('profSettings')}>
            <div className="space-y-6 pb-10">

                {/* Hidden File Input */}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                />

                {/* Header card */}
                <div className="glass-card border border-white/20 rounded-2xl p-5 shadow-sm">
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                                <UserIcon className="size-6" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-foreground">{t('profAccountMgmt')}</h2>
                                <p className="text-xs text-muted-foreground">ID: {displayUser?.id?.slice(0, 8).toUpperCase()}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Tabs */}
                            <div className="flex items-center bg-muted p-1 rounded-xl border border-border">
                                <button
                                    onClick={() => handleTabChange('profile')}
                                    className={cn("px-4 h-8 rounded-lg text-xs font-semibold transition-all", activeTab === 'profile' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
                                >
                                    {t('profTitle')}
                                </button>
                                <button
                                    onClick={() => handleTabChange('settings')}
                                    className={cn("px-4 h-8 rounded-lg text-xs font-semibold transition-all", activeTab === 'settings' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
                                >
                                    {t('profSettings')}
                                </button>
                            </div>
                            <button
                                onClick={handleUpdate}
                                disabled={isUpdating}
                                className="h-9 px-5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 disabled:opacity-60"
                            >
                                {isUpdating ? <RefreshCw className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                                {isUpdating ? t('profSaving') : t('profSave')}
                            </button>
                        </div>
                    </div>
                </div>

                <DataStateWrapper
                    isLoading={profileLoading && !displayUser}
                    error={profileError}
                    onRetry={refetchProfile}
                    loadingVariant="default"
                >
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                    {/* Left — Avatar card */}
                    <div className="xl:col-span-1 space-y-4">
                        <div className="glass-card border border-white/20 rounded-2xl overflow-hidden shadow-sm">
                            {/* Avatar area */}
                            <div className="h-24 bg-gradient-to-br from-primary/10 to-muted relative">
                                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                            </div>
                            <div className="px-5 pb-5 -mt-10 relative">
                                <div className="relative w-fit">
                                    <div className="size-20 rounded-2xl border-4 border-card bg-muted flex items-center justify-center overflow-hidden shadow-md group relative">
                                        {isUploading ? (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 backdrop-blur-[2px]">
                                                <Loader2 className="size-8 text-white animate-spin" />
                                            </div>
                                        ) : null}
                                        {displayUser?.avatar_url
                                            ? <img src={displayUser.avatar_url} alt="" className="w-full h-full object-cover" />
                                            : <span className="text-2xl font-bold text-primary">{getInitials(displayUser?.nom_complet)}</span>
                                        }
                                    </div>
                                    <button 
                                        onClick={handleAvatarClick}
                                        disabled={isUploading}
                                        className="absolute -bottom-1 -right-1 size-7 bg-primary text-primary-foreground rounded-lg shadow-sm flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50"
                                        title={t('profAvatarUpdate')}
                                    >
                                        <Camera className="size-3.5" />
                                    </button>
                                </div>
                                <div className="mt-3 space-y-1">
                                    <h4 className="text-sm font-bold text-foreground">{displayUser?.nom_complet}</h4>
                                    <div className="flex items-center gap-1.5">
                                        <BadgeCheck className="size-3.5 text-primary" />
                                        <span className="text-xs text-primary font-medium">
                                            {displayUser?.role === 'fournisseur' ? t('profCertifiedMerchant') : t('profVerifiedMember')}
                                        </span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-4">
                                    <div className="bg-muted rounded-xl p-3 text-center border border-border">
                                        <p className="text-lg font-bold text-primary tabular-nums">{user?.points_fidelite || 0}</p>
                                        <p className="text-xs text-muted-foreground">{t('profLoyaltyPoints')}</p>
                                    </div>
                                    <div className="bg-muted rounded-xl p-3 text-center border border-border">
                                        <p className="text-lg font-bold text-foreground tabular-nums">
                                            {user?.createdAt ? new Date(user.createdAt).getFullYear() : new Date().getFullYear()}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{t('profMemberSince')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                                    <CalendarDays className="size-3.5 text-primary/60" />
                                    <span>
                                        {t('profRegisteredOn')} : {user?.createdAt 
                                            ? new Date(user.createdAt).toLocaleDateString('fr-GN', { day: 'numeric', month: 'long', year: 'numeric' }) 
                                            : t('profRecentAccount')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex gap-3">
                            <Shield className="size-5 text-primary shrink-0 mt-0.5" />
                            <p className="text-xs text-primary/80 leading-relaxed">
                                {t('profIdentityEncrypted')}
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
                                    <div className="glass-card border border-white/20 rounded-2xl p-5 shadow-sm space-y-5">
                                        <div className="flex items-center gap-3 pb-4 border-b border-border">
                                            <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                                                <UserIcon className="size-4 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-foreground">{t('profPersonalInfo')}</h3>
                                                <p className="text-xs text-muted-foreground">{t('profUpdateInfoDesc')}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField label={t('profFullName')} icon={UserIcon} value={nomComplet} onChange={e => setNomComplet(e.target.value)} placeholder={t('profFullNamePlaceholder')} />
                                            <FormField label={t('profPhone')} icon={Globe} type="tel" value={telephone} onChange={e => setTelephone(e.target.value)} placeholder="+224 ..." />
                                        </div>
                                        <FormField label={t('profEmail')} icon={Mail} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="votre@email.com" />
                                    </div>

                                    {/* Trust score */}
                                    <div className="bg-primary rounded-2xl p-5 flex items-center justify-between shadow-sm">
                                        <div className="space-y-1">
                                            <h4 className="text-sm font-bold text-primary-foreground">{t('profTrustScore')}</h4>
                                            <p className="text-xs text-primary-foreground/70">
                                                {t('profStability')} : <span className="font-semibold text-primary-foreground">
                                                {user?.score_confiance || 100}% — {user?.score_confiance >= 90 ? 'Optimal' : user?.score_confiance >= 70 ? 'Stable' : 'Vigilance'}
                                            </span>
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
                                    <div className="glass-card border border-white/20 rounded-2xl p-5 shadow-sm space-y-5">
                                        <div className="flex items-center gap-3 pb-4 border-b border-border">
                                            <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                                                <Lock className="size-4 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-foreground">{t('profAccountSecurity')}</h3>
                                                <p className="text-xs text-muted-foreground">{t('profChangePassword')}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField label={t('profNewPassword')} type="password" value={motDePasse} onChange={e => setMotDePasse(e.target.value)} placeholder="••••••••" />
                                            <FormField label={t('profConfirmPassword')} type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" />
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-muted rounded-xl border border-border">
                                            <Clock className="size-4 text-muted-foreground shrink-0" />
                                            <p className="text-xs text-muted-foreground">{t('profPasswordHint')}</p>
                                        </div>
                                    </div>

                                    {/* Two-Factor Authentication (2FA) */}
                                    <div className="glass-card border border-white/20 rounded-2xl p-5 shadow-sm space-y-4 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 size-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                                        
                                        <div className="flex items-center gap-3 pb-4 border-b border-border relative z-10">
                                            <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                                                <QrCode className="size-4 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-foreground">{t('prof2FA')}</h3>
                                                <p className="text-xs text-muted-foreground">{t('prof2FADesc')}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-muted rounded-xl border border-border hover:border-primary/30 transition-colors relative z-10">
                                            <div className="flex items-center gap-4">
                                                <div className={cn("size-2 rounded-full", user?.two_factor_enabled ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-muted-foreground")} />
                                                <div>
                                                    <p className="text-sm font-semibold text-foreground">{t('prof2FAStatus')} : {user?.two_factor_enabled ? t('prof2FAEnabled') : t('prof2FADisabled')}</p>
                                                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-0.5">Technologie TOTP (Google Authenticator, etc.)</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleSetup2FA}
                                                disabled={user?.two_factor_enabled}
                                                className={cn(
                                                    "h-9 px-5 rounded-xl text-xs font-bold transition-all",
                                                    user?.two_factor_enabled 
                                                        ? "bg-emerald-500/10 text-emerald-500 cursor-default border border-emerald-500/20"
                                                        : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
                                                )}
                                            >
                                                {user?.two_factor_enabled ? t('prof2FASecure') : t('prof2FASetup')}
                                            </button>
                                        </div>
                                    </div>

                                    {/* {t('profNotifications')} */}
                                    <div className="glass-card border border-white/20 rounded-2xl p-5 shadow-sm space-y-4">
                                        <div className="flex items-center gap-3 pb-4 border-b border-border">
                                            <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                                                <Bell className="size-4 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-foreground">{t('profNotifications')}</h3>
                                                <p className="text-xs text-muted-foreground">{t('profNotifDesc')}</p>
                                            </div>
                                        </div>
                                        {[
                                            { id: 'email', label: t('profEmailAlerts'), desc: t('profEmailAlertsDesc'), value: emailAlerts, onChange: setEmailAlerts },
                                            { id: 'push', label: `${t('profNotifications')} push`, desc: `${t('profNotifications')} en temps réel sur vos commandes`, value: pushNotifs, onChange: setPushNotifs },
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
                                                    <h4 className="text-sm font-bold text-foreground">{t('profDangerZone')}</h4>
                                                    <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                                                        {t('profDeleteDesc')}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleDelete}
                                                className="flex items-center gap-2 h-9 px-5 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-white rounded-xl font-semibold text-sm transition-all shrink-0"
                                            >
                                                <Trash2 className="size-4" />
                                                {t('profDeleteAccount')}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
                </DataStateWrapper>
            </div>

            {/* ── Modal {t('prof2FAConfigTitle')} ── */}
            <AnimatePresence>
                {show2FASetup && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-background/80 backdrop-blur-md"
                            onClick={() => setShow2FASetup(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-card border-2 border-border rounded-3xl w-full max-w-md shadow-2xl relative z-10 overflow-hidden"
                        >
                            <div className="p-6 border-b border-border bg-muted/50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                        <QrCode className="size-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-foreground uppercase tracking-tight">{t('prof2FAConfigTitle')}</h3>
                                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{t('prof2FASecurityLevel')}</p>
                                    </div>
                                </div>
                                <button onClick={() => setShow2FASetup(false)} className="size-8 rounded-lg bg-muted hover:bg-rose-500/10 hover:text-rose-500 flex items-center justify-center transition-colors">
                                    <X className="size-4" />
                                </button>
                            </div>

                            <div className="p-8 space-y-8 text-center">
                                <div className="space-y-3">
                                    <p className="text-xs text-muted-foreground leading-relaxed uppercase font-bold px-4">
                                        {t('prof2FAScanQR')}
                                    </p>
                                </div>

                                <div className="flex justify-center">
                                    <div className="p-4 bg-white rounded-2xl border-4 border-slate-100 dark:border-white/5 shadow-inner group">
                                        <img
                                            src={twoFactorData?.qrCode}
                                            alt="QR Code 2FA"
                                            className="size-48 object-contain"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-3 bg-muted rounded-xl border border-border">
                                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">{t('prof2FASecretFallback')}</p>
                                        <p className="text-xs font-mono font-bold text-primary tracking-[0.2em]">{twoFactorData?.secret}</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-foreground uppercase tracking-widest">{t('prof2FAEnterCode')}</label>
                                        <input
                                            type="text"
                                            maxLength={6}
                                            placeholder="000000"
                                            className="w-full h-12 bg-background border-2 border-border rounded-xl text-center text-xl font-mono tracking-[0.5em] focus:border-primary transition-all outline-none"
                                            value={otpCode}
                                            onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleConfirm2FA}
                                    disabled={otpCode.length < 6 || isConfiguring2FA}
                                    className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl font-bold text-sm transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-40"
                                >
                                    {isConfiguring2FA ? <RefreshIcon className="size-5 animate-spin" /> : <Shield className="size-5" />}
                                    {t('prof2FAActivate')}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
};

export default UserProfile;
