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
    Clock,
    Zap,
    Sparkles,
    Satellite,
    Fingerprint,
    ShieldAlert
} from 'lucide-react';
import { toast } from 'sonner';

const Toggle = ({ enabled, onChange }) => (
    <button
        onClick={() => onChange(!enabled)}
        className={cn(
            "relative inline-flex h-8 w-16 shrink-0 cursor-pointer items-center rounded-2xl transition-all duration-700 border-2",
            enabled ? "bg-[#FF6600] border-[#FF6600] shadow-[0_0_15px_rgba(255,102,0,0.4)]" : "bg-white/5 border-white/10"
        )}
    >
        <div
            className={cn(
                "pointer-events-none block h-5 w-5 rounded-lg bg-white shadow-xl transition-all duration-700",
                enabled ? "translate-x-9 rotate-45" : "translate-x-1.5"
            )}
        />
    </button>
);

const UserProfile = () => {
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
            toast.error('LES MOTS DE PASSE NE CORRESPONDENT PAS.');
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
            toast.success('PROFIL EXÉCUTIF MIS À JOUR AVEC SUCCÈS !');
            setMotDePasse('');
            setConfirmPassword('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'ERREUR LORS DE LA MISE À JOUR.');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm("ÊTES-VOUS SÛR DE VOULOIR SUPPRIMER VOTRE COMPTE EXÉCUTIF ? CETTE ACTION EST IRRÉVERSIBLE.")) {
            try {
                await deleteAccount();
                toast.success("COMPTE RÉSEAU SUPPRIMÉ.");
            } catch (error) {
                toast.error('ERREUR LORS DE LA SUPPRESSION DU COMPTE.');
            }
        }
    };

    const getInitials = (name) => {
        return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'BC';
    };

    return (
        <DashboardLayout title={activeTab === 'profile' ? "PROFIL EXÉCUTIF" : "PARAMÈTRES RÉSEAU"}>
            <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-32">

                {/* Tab Navigation */}
                <div className="flex items-center gap-4 bg-white/[0.02] p-2 rounded-[2rem] border-4 border-white/5 w-fit">
                    <button
                        onClick={() => handleTabChange('profile')}
                        className={cn(
                            "px-10 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.4em] italic transition-all duration-700",
                            activeTab === 'profile'
                                ? "bg-[#FF6600] text-white shadow-3xl shadow-[#FF6600]/20 scale-105"
                                : "text-slate-500 hover:text-white"
                        )}
                    >
                        IDENTITÉ
                    </button>
                    <button
                        onClick={() => handleTabChange('settings')}
                        className={cn(
                            "px-10 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.4em] italic transition-all duration-700",
                            activeTab === 'settings'
                                ? "bg-[#FF6600] text-white shadow-3xl shadow-[#FF6600]/20 scale-105"
                                : "text-slate-500 hover:text-white"
                        )}
                    >
                        PRÉFÉRENCES
                    </button>
                </div>

                {/* Hero Profile */}
                <div className="relative overflow-hidden p-12 md:p-20 bg-white group border-x-[16px] border-[#FF6600] rounded-[4rem] shadow-3xl">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,102,0,0.1),transparent_70%)] opacity-50" />
                    <div className="absolute top-0 right-0 size-[50rem] bg-[#FF6600]/5 rounded-full blur-[200px] -mt-64 -mr-64 group-hover:scale-125 transition-transform duration-[4s]" />

                    <div className="flex flex-col md:flex-row items-center gap-16 relative z-10">
                        <div className="relative shrink-0">
                            <div className="size-48 rounded-[3rem] border-8 border-black shadow-3xl overflow-hidden bg-black flex items-center justify-center group/avatar transition-all duration-1000 hover:scale-105 hover:rotate-3">
                                <div className="absolute inset-0 bg-gradient-to-tr from-[#FF6600]/40 via-transparent to-transparent opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-1000" />
                                {user?.photo_url ? (
                                    <img src={user.photo_url} alt="" className="w-full h-full object-cover relative z-10" />
                                ) : (
                                    <span className="text-6xl font-black text-[#FF6600] italic uppercase tracking-tighter relative z-10">{getInitials(user?.nom_complet)}</span>
                                )}
                            </div>
                            <button className="absolute -bottom-4 -right-4 bg-[#FF6600] text-white p-5 rounded-2xl shadow-3xl hover:scale-110 hover:rotate-12 transition-all border-8 border-white group-hover:bg-black group-hover:text-[#FF6600] duration-500">
                                <Edit3 className="size-6" />
                            </button>
                        </div>

                        <div className="flex-1 text-center md:text-left space-y-8">
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-4 px-6 py-2 bg-[#FF6600]/10 border-2 border-[#FF6600]/20 rounded-2xl text-[#FF6600] text-[10px] font-black uppercase tracking-[0.4em] italic leading-none pt-1 shadow-lg">
                                    <div className="size-2 rounded-full bg-[#FF6600] animate-pulse" />
                                    {user?.role === 'fournisseur' ? 'MARCHAND CERTIFIÉ ELITE' : user?.role === 'admin' ? 'ADMINISTRATEUR RÉSEAU' : 'MEMBRE PRIVILÈGE BCA'}
                                </div>
                                <h2 className="text-6xl md:text-8xl font-black text-black tracking-tighter leading-[0.8] uppercase italic">
                                    {user?.nom_complet?.split(' ')[0]} <br />
                                    <span className="text-[#FF6600] not-italic underline decoration-black/10 decoration-8 underline-offset-[-15px]">{user?.nom_complet?.split(' ').slice(1).join(' ')}</span>
                                </h2>
                            </div>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-12 opacity-60">
                                <div className="flex items-center gap-4 group/info">
                                    <CalendarDays className="size-6 text-[#FF6600] group-hover/info:rotate-12 transition-transform" />
                                    <span className="text-[11px] font-black text-black uppercase tracking-[0.3em] italic pt-1 border-b-2 border-black/5 pb-1">INSCRIT EN {new Date(user?.createdAt).getFullYear()}</span>
                                </div>
                                <div className="flex items-center gap-4 group/info">
                                    <BadgeCheck className="size-6 text-[#FF6600] group-hover/info:rotate-12 transition-transform" />
                                    <span className="text-[11px] font-black text-black uppercase tracking-[0.3em] italic pt-1 border-b-2 border-black/5 pb-1">COMPTE CERTIFIÉ</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleUpdate}
                            disabled={isUpdating}
                            className="h-24 px-12 rounded-[2rem] bg-black text-white hover:bg-[#FF6600] font-black text-xs uppercase tracking-[0.4em] shadow-3xl transition-all duration-700 active:scale-95 shrink-0 border-0 italic group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                            <span className="relative z-10 pt-1">{isUpdating ? 'SYNCHRONISATION...' : 'METTRE À JOUR'}</span>
                        </button>
                    </div>
                </div>

                {activeTab === 'profile' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-2 space-y-12">
                            <div className="bg-white/[0.01] border-4 border-white/5 rounded-[4rem] overflow-hidden shadow-3xl group relative">
                                <div className="absolute top-0 right-0 size-80 bg-[#FF6600]/5 rounded-full blur-[120px] -mr-40 -mt-40 group-hover:bg-[#FF6600]/10 transition-colors duration-1000" />

                                <div className="px-10 py-8 border-b-4 border-white/5 bg-white/[0.02] flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-6">
                                        <div className="size-12 rounded-xl bg-[#FF6600]/10 flex items-center justify-center border-2 border-[#FF6600]/20 shadow-3xl">
                                            <Fingerprint className="size-6 text-[#FF6600]" />
                                        </div>
                                        <h3 className="text-[12px] font-black text-white uppercase tracking-[0.4em] italic pt-1">INFORMATIONS D'IDENTITÉ</h3>
                                    </div>
                                </div>
                                <div className="p-12 md:p-16 space-y-12 relative z-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 ml-2">
                                                <div className="size-2 rounded-full bg-[#FF6600] animate-pulse" />
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic">NOM COMPLET</label>
                                            </div>
                                            <input
                                                className="h-16 w-full px-8 rounded-2xl bg-white/[0.03] border-4 border-white/5 focus:border-[#FF6600]/40 text-sm font-black uppercase tracking-widest italic text-white transition-all outline-none"
                                                value={nomComplet}
                                                onChange={(e) => setNomComplet(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 ml-2">
                                                <div className="size-2 rounded-full bg-[#FF6600] animate-pulse" />
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic">TÉLÉPHONE RÉSEAU</label>
                                            </div>
                                            <input
                                                type="tel"
                                                className="h-16 w-full px-8 rounded-2xl bg-white/[0.03] border-4 border-white/5 focus:border-[#FF6600]/40 text-sm font-black uppercase tracking-widest italic text-white transition-all outline-none"
                                                value={telephone}
                                                onChange={(e) => setTelephone(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 ml-2">
                                            <div className="size-2 rounded-full bg-[#FF6600] animate-pulse" />
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic">ADRESSE EMAIL SÉCURISÉE</label>
                                        </div>
                                        <input
                                            type="email"
                                            className="h-16 w-full px-8 rounded-2xl bg-white/[0.03] border-4 border-white/5 focus:border-[#FF6600]/40 text-sm font-black uppercase tracking-widest italic text-white transition-all outline-none"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Activity Card */}
                            <div className="bg-white group rounded-[4rem] border-x-[16px] border-[#FF6600] p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 shadow-3xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 size-96 bg-[#FF6600]/10 rounded-full blur-[100px] -mr-48 -mt-48 transition-transform group-hover:scale-125 duration-[4s]" />

                                <div className="space-y-8 text-center md:text-left relative z-10">
                                    <div className="inline-flex items-center gap-3 px-6 py-2 bg-[#FF6600]/10 border-2 border-[#FF6600]/20 rounded-xl">
                                        <Sparkles className="size-4 text-[#FF6600]" />
                                        <p className="text-[10px] font-black text-[#FF6600] uppercase tracking-[0.4em] italic pt-0.5">SCORE DE FIDÉLITÉ EXÉCUTIF</p>
                                    </div>
                                    <div className="flex items-baseline justify-center md:justify-start gap-6">
                                        <span className="text-8xl font-black text-black italic tracking-tighter uppercase leading-none">{user?.points_fidelite || 0}</span>
                                        <div className="flex flex-col">
                                            <span className="text-2xl font-black text-[#FF6600] italic uppercase tracking-tighter leading-none">POINTS</span>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic mt-2">ACTIVE NODE</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-500 font-extrabold max-w-sm uppercase tracking-widest leading-relaxed italic">CONTINUEZ À UTILISER L'INFRASTRUCTURE BCA POUR DÉBLOQUER DE NOUVEAUX PRIVILÈGES RÉSEAU.</p>
                                </div>
                                <div className="flex-1 max-w-sm w-full space-y-6 relative z-10">
                                    <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.4em] italic border-b-2 border-black/5 pb-2">
                                        <span className="text-slate-400">PROCHAIN PALIER</span>
                                        <span className="text-[#FF6600]">85% SYNC</span>
                                    </div>
                                    <div className="h-6 bg-black/5 rounded-full overflow-hidden border-4 border-white shadow-inner p-1">
                                        <div className="bg-[#FF6600] h-full w-[85%] rounded-full shadow-[0_0_20px_rgba(255,102,0,0.4)] transition-all duration-[2s] animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-10">
                            <div className="bg-white group rounded-[4rem] border-x-[16px] border-black p-10 space-y-8 shadow-3xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 size-64 bg-black/10 rounded-full blur-[80px] -mr-32 -mt-32" />

                                <div className="size-20 rounded-[2rem] bg-black flex items-center justify-center text-[#FF6600] shadow-3xl group-hover:rotate-12 transition-transform duration-700 relative z-10">
                                    <ShieldAlert className="size-10" />
                                </div>
                                <div className="space-y-6 relative z-10">
                                    <h4 className="text-2xl font-black text-black uppercase leading-tight italic tracking-tighter">APPUI <br /> SÉCURITÉ</h4>
                                    <p className="text-sm text-slate-500 font-extrabold leading-relaxed italic uppercase tracking-widest border-l-4 border-black/10 pl-6">
                                        VOTRE INTÉGRITÉ EST NOTRE PRIORITÉ. POUR TOUTE ACTIVITÉ ATYPIQUE, CONTACTEZ NOTRE CENTRE DE RÉPONSE D'ÉLITE.
                                    </p>
                                </div>
                                <button className="w-full h-16 rounded-2xl bg-black text-white hover:bg-[#FF6600] text-[10px] font-black uppercase tracking-[0.4em] transition-all duration-700 flex items-center justify-between px-8 italic shadow-3xl relative z-10">
                                    SUPPORT EXÉCUTIF
                                    <Satellite className="size-5 animate-pulse" />
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-2 space-y-16">
                            <div className="bg-white/[0.01] border-4 border-white/5 rounded-[4rem] overflow-hidden shadow-3xl group relative">
                                <div className="absolute top-0 right-0 size-80 bg-[#FF6600]/5 rounded-full blur-[120px] -mr-40 -mt-40 group-hover:bg-[#FF6600]/10 transition-colors duration-1000" />

                                <div className="px-10 py-8 border-b-4 border-white/5 bg-white/[0.02] flex items-center gap-6 relative z-10">
                                    <div className="size-12 rounded-xl bg-[#FF6600]/10 flex items-center justify-center border-2 border-[#FF6600]/20 shadow-3xl">
                                        <BadgeCheck className="size-6 text-[#FF6600]" />
                                    </div>
                                    <h3 className="text-[12px] font-black text-white uppercase tracking-[0.4em] italic pt-1">SÉCURITÉ DU CANAL ALPHA</h3>
                                </div>
                                <div className="p-12 md:p-16 space-y-12 relative z-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 ml-2">
                                                <div className="size-2 rounded-full bg-[#FF6600] animate-pulse" />
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic">NOUVEAU CODE D'ACCÈS</label>
                                            </div>
                                            <input
                                                type="password"
                                                placeholder="••••••••"
                                                className="h-16 w-full px-8 rounded-2xl bg-white/[0.03] border-4 border-white/5 focus:border-[#FF6600]/40 text-sm font-black transition-all outline-none text-white"
                                                value={motDePasse}
                                                onChange={(e) => setMotDePasse(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 ml-2">
                                                <div className="size-2 rounded-full bg-[#FF6600] animate-pulse" />
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic">CONFIRMATION</label>
                                            </div>
                                            <input
                                                type="password"
                                                placeholder="••••••••"
                                                className="h-16 w-full px-8 rounded-2xl bg-white/[0.03] border-4 border-white/5 focus:border-[#FF6600]/40 text-sm font-black transition-all outline-none text-white"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6 p-8 bg-white/[0.02] rounded-[2rem] border-2 border-white/5 italic">
                                        <div className="size-10 rounded-xl bg-[#FF6600]/10 flex items-center justify-center border-2 border-[#FF6600]/20">
                                            <Clock className="size-5 text-[#FF6600]" />
                                        </div>
                                        <p className="text-[11px] text-slate-500 font-extrabold uppercase tracking-[0.2em] italic">LAISSEZ LE CHAMP VIDE POUR CONSERVER L'INDEXATION ACTUELLE.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-12 md:p-16 bg-white rounded-[4rem] border-x-[16px] border-rose-600 flex flex-col md:flex-row items-center justify-between gap-12 shadow-3xl group relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 via-transparent to-transparent opacity-50" />

                                <div className="space-y-4 text-center md:text-left relative z-10">
                                    <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-rose-500/10 rounded-lg">
                                        <ShieldAlert className="size-4 text-rose-500" />
                                        <h3 className="text-[10px] font-black text-rose-600 uppercase tracking-[0.4em] italic pt-0.5">TERMINAL DE SUPPRESSION</h3>
                                    </div>
                                    <h3 className="text-4xl font-black text-black uppercase tracking-tighter italic">ZONE DE <br /> DANGER CRITIQUE</h3>
                                    <p className="text-sm text-slate-500 font-extrabold max-w-sm italic uppercase tracking-widest border-l-4 border-rose-500/20 pl-6">LA SUPPRESSION DE VOTRE COMPTE EST DÉFINITIVE ET EFFACE TOUT VOTRE INDEX RÉSEAU.</p>
                                </div>
                                <button
                                    onClick={handleDelete}
                                    className="h-24 px-12 rounded-[2rem] bg-black text-white hover:bg-rose-600 font-black text-xs uppercase tracking-[0.4em] shadow-3xl flex items-center gap-6 border-0 transition-all duration-700 hover:scale-110 active:scale-95 italic group/delete relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/delete:animate-[shimmer_2s_infinite]" />
                                    <Trash2 className="size-6 relative z-10" />
                                    <span className="relative z-10 pt-1">ÉJECTER LE COMPTE</span>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-10">
                            <div className="bg-white/[0.01] border-4 border-white/5 rounded-[4rem] p-12 shadow-3xl group relative overflow-hidden">
                                <div className="absolute top-0 right-0 size-64 bg-[#FF6600]/5 rounded-full blur-[100px] -mr-32 -mt-32 group-hover:bg-[#FF6600]/10 transition-colors duration-1000" />

                                <h3 className="text-[12px] font-black text-white uppercase tracking-[0.5em] border-b-4 border-white/5 pb-8 mb-12 italic relative z-10">CANAUX DE FLUX</h3>
                                <div className="space-y-12 relative z-10">
                                    <div className="flex items-center justify-between gap-10 group/item">
                                        <div className="space-y-2">
                                            <p className="text-sm font-black text-white uppercase tracking-widest italic group-hover/item:text-[#FF6600] transition-colors">ALERTES EMAIL</p>
                                            <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em] italic leading-none">RAPPORTS & ACTIVITÉ QUANTUM</p>
                                        </div>
                                        <Toggle enabled={emailAlerts} onChange={setEmailAlerts} />
                                    </div>
                                    <div className="flex items-center justify-between gap-10 group/item">
                                        <div className="space-y-2">
                                            <p className="text-sm font-black text-white uppercase tracking-widest italic group-hover/item:text-[#FF6600] transition-colors">NOTIFICATIONS PUSH</p>
                                            <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em] italic leading-none">ÉTAT DES COMMANDES RÉSEAU</p>
                                        </div>
                                        <Toggle enabled={pushNotifs} onChange={setPushNotifs} />
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
