import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';
import {
    CalendarDays,
    BadgeCheck,
    Edit3,
    ArrowRight,
    Trash2,
    Shield,
    User,
    BellRing,
    Clock
} from 'lucide-react';

const Toggle = ({ enabled, onChange }) => (
    <button
        onClick={() => onChange(!enabled)}
        className={cn(
            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            enabled ? "bg-primary" : "bg-slate-200 dark:bg-slate-800"
        )}
    >
        <span
            className={cn(
                "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform",
                enabled ? "translate-x-6" : "translate-x-1"
            )}
        />
    </button>
);

const UserProfile = () => {
    const { user, updateProfile, deleteAccount } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // Onglet actif basé sur l'URL
    const [activeTab, setActiveTab] = useState(location.pathname === '/settings' ? 'settings' : 'profile');

    // Synchronisation de l'onglet si l'URL change (ex: via la sidebar)
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
    const [marketNews, setMarketNews] = useState(true);

    const [isUpdating, setIsUpdating] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleUpdate = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (motDePasse && motDePasse !== confirmPassword) {
            setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas.' });
            return;
        }

        setIsUpdating(true);
        try {
            await updateProfile({
                nom_complet: nomComplet,
                telephone,
                email,
                mot_de_passe: motDePasse || undefined
            });
            setMessage({ type: 'success', text: 'Profil mis à jour avec succès !' });
            setMotDePasse('');
            setConfirmPassword('');
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Erreur lors de la mise à jour.' });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) {
            try {
                await deleteAccount();
            } catch (error) {
                setMessage({ type: 'error', text: 'Erreur lors de la suppression du compte.' });
            }
        }
    };

    const getInitials = (name) => {
        return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'BC';
    };

    return (
        <DashboardLayout title={activeTab === 'profile' ? "Identité Executive" : "Paramètres de Sécurité"}>
            <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-1000 pb-24 px-4 md:px-8">
                {/* ══════════════════════════════════════════════════
                    EXECUTIVE NAVIGATION — TAB SYSTEM
                ══════════════════════════════════════════════════ */}
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-1.5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 w-fit">
                    <button
                        onClick={() => handleTabChange('profile')}
                        className={cn(
                            "px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] transition-all italic",
                            activeTab === 'profile' 
                                ? "bg-white dark:bg-slate-800 text-primary shadow-[0_10px_20px_-5px_rgba(0,0,0,0.1)] border border-slate-100 dark:border-slate-700" 
                                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        )}
                    >
                        Identité
                    </button>
                    <button
                        onClick={() => handleTabChange('settings')}
                        className={cn(
                            "px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] transition-all italic",
                            activeTab === 'settings' 
                                ? "bg-white dark:bg-slate-800 text-primary shadow-[0_10px_20px_-5px_rgba(0,0,0,0.1)] border border-slate-100 dark:border-slate-700" 
                                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        )}
                    >
                        Paramètres
                    </button>
                </div>

                {message.text && (
                    <div className={cn(
                        "p-6 rounded-[2rem] border-2 text-[10px] font-black uppercase tracking-widest animate-in slide-in-from-top-4 italic shadow-2xl",
                        message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'
                    )}>
                        {message.text}
                    </div>
                )}

                {/* ══════════════════════════════════════════════════
                    SECTION 1 — THE IDENTITY HUB (AVATAR & STATS)
                ══════════════════════════════════════════════════ */}
                <div className="relative overflow-hidden p-12 border-2 border-slate-900 dark:border-white bg-slate-950 text-white rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)]">
                    <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_0%,rgba(43,90,255,0.2),transparent_60%)]"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[150px] -ml-48 -mb-48 opacity-50"></div>
                    
                    <div className="flex flex-col xl:flex-row items-center gap-12 relative z-10">
                        {/* THE MASTER AVATAR */}
                        <div className="relative group shrink-0">
                            <div className="size-44 rounded-[3rem] border-4 border-white/10 shadow-2xl overflow-hidden bg-white/5 flex items-center justify-center transition-all duration-700 group-hover:scale-[1.05] group-hover:rotate-3">
                                <span className="text-6xl font-black text-primary italic tracking-tighter">{getInitials(user?.nom_complet)}</span>
                            </div>
                            <button className="absolute -bottom-2 -right-2 bg-primary text-white p-4 rounded-3xl shadow-2xl hover:bg-white hover:text-primary transition-all border-4 border-slate-950 flex items-center justify-center">
                                <Edit3 className="size-5" />
                            </button>
                        </div>

                        {/* EXECUTIVE SUMMARY */}
                        <div className="flex-1 text-center xl:text-left space-y-6 w-full">
                            <div className="flex flex-col xl:flex-row xl:items-center gap-6">
                                <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter italic uppercase leading-none">
                                    {user?.nom_complet}
                                </h2>
                                <div className="px-6 py-2 bg-primary/20 backdrop-blur-md rounded-xl border border-primary/30 text-[9px] font-black uppercase tracking-[0.4em] text-primary w-fit mx-auto xl:mx-0 shadow-lg italic">
                                    {user?.role === 'fournisseur' ? 'Marchand Vérifié' : user?.role === 'admin' ? 'Elite Admin' : 'Investisseur BCA'}
                                </div>
                            </div>
                            
                            <div className="flex flex-wrap items-center justify-center xl:justify-start gap-x-12 gap-y-6">
                                <div className="flex items-center gap-4 group/stat">
                                    <div className="size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary group-hover/stat:bg-primary group-hover/stat:text-white transition-all">
                                        <CalendarDays className="size-5" />
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Ancienneté</span>
                                        <span className="text-xs font-black uppercase tracking-tight italic">Depuis {new Date(user?.createdAt).getFullYear()}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 group/stat">
                                    <div className="size-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                                        <BadgeCheck className="size-5" />
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Sûreté</span>
                                        <span className="text-xs font-black uppercase tracking-tight italic text-emerald-400">Identité Scellée</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 group/stat">
                                    <div className="size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary">
                                        <Shield className="size-5" />
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Protection</span>
                                        <span className="text-xs font-black uppercase tracking-tight italic">BCA Protocol AA+</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* PRIMARY ACTION */}
                        <Button
                            onClick={handleUpdate}
                            disabled={isUpdating}
                            className="w-full xl:w-auto h-20 px-12 rounded-[2rem] bg-white text-slate-900 hover:bg-primary hover:text-white font-black uppercase tracking-[0.3em] text-[12px] shadow-2xl transition-all hover:scale-[1.03] active:scale-[0.97] shrink-0"
                        >
                            {isUpdating ? 'Synchronisation...' : 'Sanctuariser'}
                        </Button>
                    </div>
                </div>

                {activeTab === 'profile' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* ══════════════════════════════════════════════════
                            SECTION 2 — PERSONAL DATA MATRIX
                        ══════════════════════════════════════════════════ */}
                        <div className="lg:col-span-2 space-y-10">
                            <div className="bg-white dark:bg-slate-900 border-2 border-slate-50 dark:border-slate-800 rounded-[3rem] overflow-hidden shadow-[0_30px_60px_-20px_rgba(0,0,0,0.05)]">
                                <div className="px-10 py-6 border-b-2 border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <User className="size-5 text-primary" />
                                        <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-900 dark:text-white mt-0.5">Base d'Identité</h3>
                                    </div>
                                    <div className="size-2 rounded-full bg-primary animate-pulse" />
                                </div>
                                <div className="p-10 space-y-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-4">
                                            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Désignation Légale</label>
                                            <div className="relative group">
                                                <Input 
                                                    className="h-16 px-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-4 focus:ring-primary/10 text-sm font-black italic uppercase transition-all"
                                                    value={nomComplet} 
                                                    onChange={(e) => setNomComplet(e.target.value)} 
                                                />
                                                <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Edit3 className="size-4 text-primary" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Liaison Mobile Sécurisée</label>
                                            <div className="relative group">
                                                <Input 
                                                    type="tel" 
                                                    className="h-16 px-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-4 focus:ring-primary/10 text-sm font-black italic uppercase transition-all"
                                                    value={telephone} 
                                                    onChange={(e) => setTelephone(e.target.value)} 
                                                />
                                                <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <BadgeCheck className="size-4 text-emerald-500" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Canal de Correspondance Elite</label>
                                        <Input 
                                            type="email" 
                                            className="h-16 px-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-4 focus:ring-primary/10 text-sm font-black italic uppercase transition-all"
                                            value={email} 
                                            onChange={(e) => setEmail(e.target.value)} 
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* PROGRESS BANNER */}
                            <div className="bg-slate-950 text-white rounded-[3rem] p-12 relative overflow-hidden group shadow-2xl border-2 border-slate-900">
                                <div className="absolute top-0 right-0 size-80 bg-primary/10 rounded-full blur-[100px] -mr-40 -mt-40 transition-all duration-1000 group-hover:bg-primary/20" />
                                <div className="absolute bottom-0 left-0 size-60 bg-white/5 rounded-full blur-[80px] -ml-30 -mb-30" />
                                
                                <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-12">
                                    <div className="space-y-6">
                                        <div className="px-5 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl w-fit">
                                            <p className="text-[8px] font-black uppercase tracking-[0.4em] text-emerald-400 leading-none">Indicateur de Confiance</p>
                                        </div>
                                        <div className="flex items-baseline gap-4">
                                            <span className="text-7xl font-black tracking-tighter italic">92</span>
                                            <span className="text-2xl font-black text-primary uppercase italic tracking-tighter">%</span>
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Stature de Marché</span>
                                        </div>
                                        <p className="text-xs text-slate-400 font-bold max-w-sm leading-relaxed italic opacity-80">
                                            Votre prestige commercial est à un niveau critique. Complétez vos références logistiques pour atteindre le rang "DIAMOND PARTNER".
                                        </p>
                                    </div>
                                    <div className="w-full xl:w-72 space-y-6">
                                        <div className="flex justify-between items-end">
                                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Intégrité Profil</span>
                                            <span className="text-sm font-black text-primary italic">92 / 100</span>
                                        </div>
                                        <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                                            <div className="bg-primary h-full w-[92%] rounded-full shadow-[0_0_30px_rgba(43,90,255,0.6)] animate-pulse" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SIDEBAR WIDGETS */}
                        <div className="space-y-10">
                            <div className="bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[3rem] p-10 space-y-6 shadow-sm group">
                                <div className="size-16 rounded-[1.5rem] bg-white dark:bg-slate-800 flex items-center justify-center text-primary border border-slate-100 dark:border-slate-700 shadow-xl group-hover:rotate-12 transition-transform">
                                    <Shield className="size-8" />
                                </div>
                                <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-900 dark:text-white italic">Assistance Elite</h4>
                                <p className="text-[11px] text-slate-400 font-bold leading-relaxed italic opacity-80">
                                    Votre sécurité est notre priorité absolue. En cas de suspicion de détournement d'identité, contactez immédiatement la cellule de crise BCA Guard.
                                </p>
                                <Button variant="ghost" className="w-full justify-between h-14 px-6 bg-white dark:bg-slate-800 rounded-2xl hover:bg-primary hover:text-white text-primary text-[9px] font-black uppercase tracking-[0.2em] transition-all shadow-sm border border-slate-100 dark:border-slate-700">
                                    Accès Protocole Vie Privée
                                    <ArrowRight className="size-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* ══════════════════════════════════════════════════
                            SECTION 3 — SECURITY ARCHITECTURE
                        ══════════════════════════════════════════════════ */}
                        <div className="lg:col-span-2 space-y-12">
                            <div className="bg-white dark:bg-slate-900 border-2 border-slate-50 dark:border-slate-800 rounded-[3rem] overflow-hidden shadow-[0_30px_60px_-20px_rgba(0,0,0,0.05)]">
                                <div className="px-10 py-6 border-b-2 border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 flex items-center gap-4">
                                    <Shield className="size-5 text-primary" />
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-900 dark:text-white mt-0.5">Clefs d'Accès Scellées</h3>
                                </div>
                                <div className="p-10 space-y-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-4">
                                            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Protocole d'Authentification</label>
                                            <Input 
                                                type="password" 
                                                placeholder="Nouveau Code Maître"
                                                className="h-16 px-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-4 focus:ring-primary/10 text-sm font-black italic tracking-widest transition-all"
                                                value={motDePasse} 
                                                onChange={(e) => setMotDePasse(e.target.value)} 
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Confirmation Synchrone</label>
                                            <Input 
                                                type="password" 
                                                placeholder="Réitérer le Code"
                                                className="h-16 px-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-4 focus:ring-primary/10 text-sm font-black italic tracking-widest transition-all"
                                                value={confirmPassword} 
                                                onChange={(e) => setConfirmPassword(e.target.value)} 
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                                         <Clock className="size-4 text-primary" />
                                         <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest italic leading-relaxed">
                                             Laisser ces champs vierges pour maintenir la configuration de sécurité actuelle.
                                         </p>
                                    </div>
                                </div>
                            </div>

                            {/* DANGER ZONE — EXECUTIVE STYLE */}
                            <div className="pt-8 border-t-2 border-slate-50 dark:border-slate-800">
                                <div className="flex flex-col md:flex-row items-center justify-between p-12 bg-red-500/5 dark:bg-red-500/[0.03] rounded-[3.5rem] border-2 border-red-500/10 gap-10 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 size-60 bg-red-500/5 rounded-full blur-[80px] -mr-30 -mt-30 group-hover:scale-150 transition-transform duration-1000" />
                                    <div className="text-center md:text-left space-y-4 relative z-10">
                                        <div className="flex items-center justify-center md:justify-start gap-4">
                                            <div className="size-2 rounded-full bg-red-500 animate-ping" />
                                            <h3 className="text-[11px] font-black text-red-600 dark:text-red-500 uppercase tracking-[0.4em]">Protocole de Dissolution</h3>
                                        </div>
                                        <p className="text-xs text-slate-500 font-bold max-w-sm leading-relaxed italic opacity-80">
                                            L'initiation de cette commande est irréversible. L'intégralité de vos actifs, historiques et privilèges seront définitivement scellés et inaccessibles.
                                        </p>
                                    </div>
                                    <Button 
                                        onClick={handleDelete} 
                                        variant="destructive" 
                                        className="h-20 px-10 text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl shadow-2xl hover:scale-[1.03] active:scale-[0.97] transition-all flex items-center gap-4 shrink-0 relative z-10"
                                    >
                                        <Trash2 className="size-5" />
                                        Liquider le Compte
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* SIDEBAR — PREFERENCES MATRIX */}
                        <div className="space-y-12">
                            <div className="bg-white dark:bg-slate-900 border-2 border-slate-50 dark:border-slate-800 rounded-[3rem] overflow-hidden shadow-sm">
                                <div className="px-10 py-6 border-b-2 border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 flex items-center gap-4">
                                    <BellRing className="size-5 text-primary" />
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-900 dark:text-white mt-0.5">Flux d'Information</h3>
                                </div>
                                <div className="p-10 space-y-12">
                                    <div className="flex items-center justify-between gap-8 group/pref">
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight italic">Correspondance Globale</p>
                                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest leading-none">Rapports Hebdomadaires BCA</p>
                                        </div>
                                        <Toggle enabled={emailAlerts} onChange={setEmailAlerts} />
                                    </div>

                                    <div className="flex items-center justify-between gap-8 group/pref">
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight italic">Push de Sécurité</p>
                                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest leading-none">Alertes de Flux & Logistique</p>
                                        </div>
                                        <Toggle enabled={pushNotifs} onChange={setPushNotifs} />
                                    </div>
                                    
                                    <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                                         <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed italic text-center">
                                             Les paramètres de synchronisation sont mis à jour en temps réel sur le cloud BCA.
                                         </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default UserProfile;
