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
            "relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full transition-all duration-500 border-2",
            enabled ? "bg-primary border-primary shadow-[0_0_15px_rgba(43,90,255,0.4)]" : "bg-accent border-border shadow-inner"
        )}
    >
        <span
            className={cn(
                "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-premium transition-all duration-500",
                enabled ? "translate-x-7" : "translate-x-1"
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
        <DashboardLayout title={activeTab === 'profile' ? "IDENTITÉ EXECUTIVE" : "PARAMÈTRES RÉSEAU"}>
            <div className="max-w-7xl mx-auto space-y-16 animate-in fade-in duration-1000 pb-32 px-6 md:px-10">
                {/* ══════════════════════════════════════════════════
                    EXECUTIVE NAVIGATION — TAB SYSTEM
                ══════════════════════════════════════════════════ */}
                <div className="flex items-center gap-3 bg-accent/40 p-2 rounded-[2rem] border-2 border-border w-fit shadow-inner">
                    <button
                        onClick={() => handleTabChange('profile')}
                        className={cn(
                            "px-12 py-4 rounded-[1.5rem] text-executive-label font-black uppercase tracking-widest transition-all italic",
                            activeTab === 'profile' 
                                ? "bg-background text-primary shadow-premium border-2 border-border" 
                                : "text-muted-foreground hover:text-foreground opacity-60"
                        )}
                    >
                        STRUCTURE
                    </button>
                    <button
                        onClick={() => handleTabChange('settings')}
                        className={cn(
                            "px-12 py-4 rounded-[1.5rem] text-executive-label font-black uppercase tracking-widest transition-all italic",
                            activeTab === 'settings' 
                                ? "bg-background text-primary shadow-premium border-2 border-border" 
                                : "text-muted-foreground hover:text-foreground opacity-60"
                        )}
                    >
                        PROTOCOLES
                    </button>
                </div>

                {message.text && (
                    <div className={cn(
                        "p-8 rounded-[2.5rem] border-4 text-executive-label font-black uppercase tracking-widest animate-in slide-in-from-top-6 italic shadow-premium",
                        message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-destructive/10 border-destructive/20 text-destructive'
                    )}>
                        {message.text.toUpperCase()}
                    </div>
                )}

                {/* ══════════════════════════════════════════════════
                    SECTION 1 — THE IDENTITY HUB (AVATAR & STATS)
                ══════════════════════════════════════════════════ */}
                <div className="relative overflow-hidden p-14 border-4 border-foreground bg-foreground text-background rounded-[3.5rem] shadow-premium-lg">
                    <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_0%,rgba(43,90,255,0.3),transparent_60%)]"></div>
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[150px] -ml-64 -mb-64 opacity-60"></div>
                    
                    <div className="flex flex-col xl:flex-row items-center gap-16 relative z-10">
                        {/* THE MASTER AVATAR */}
                        <div className="relative group shrink-0">
                            <div className="size-52 rounded-[3.5rem] border-4 border-background/20 shadow-premium-lg overflow-hidden bg-background/10 flex items-center justify-center transition-all duration-1000 group-hover:scale-[1.08] group-hover:rotate-6">
                                <span className="text-7xl font-black text-primary italic tracking-tighter drop-shadow-2xl">{getInitials(user?.nom_complet)}</span>
                            </div>
                            <button className="absolute -bottom-4 -right-4 bg-primary text-background p-6 rounded-[2rem] shadow-premium-lg hover:bg-background hover:text-primary transition-all border-8 border-foreground flex items-center justify-center group/edit">
                                <Edit3 className="size-6 group-hover/edit:rotate-12 transition-transform" />
                            </button>
                        </div>

                        {/* EXECUTIVE SUMMARY */}
                        <div className="flex-1 text-center xl:text-left space-y-8 w-full">
                            <div className="flex flex-col xl:flex-row xl:items-center gap-8">
                                <h2 className="text-5xl md:text-8xl font-black text-background tracking-tighter italic uppercase leading-[0.85]">
                                    {user?.nom_complet}
                                </h2>
                                <div className="px-8 py-3 bg-primary/20 backdrop-blur-3xl rounded-[1.5rem] border-2 border-primary/30 text-executive-label font-black uppercase tracking-widest text-primary w-fit mx-auto xl:mx-0 shadow-premium italic">
                                    {user?.role === 'fournisseur' ? 'MARCHAND VÉRIFIÉ' : user?.role === 'admin' ? 'ELITE ADMIN' : 'INVESTISSEUR BCA'}
                                </div>
                            </div>
                            
                            <div className="flex flex-wrap items-center justify-center xl:justify-start gap-x-16 gap-y-10">
                                <div className="flex items-center gap-5 group/stat">
                                    <div className="size-14 rounded-[1.5rem] bg-background/10 border-2 border-background/20 flex items-center justify-center text-primary group-hover/stat:bg-primary group-hover/stat:text-background transition-all shadow-premium">
                                        <CalendarDays className="size-6" />
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-executive-label font-black text-background/40 uppercase italic tracking-widest opacity-60">ANCIENNETÉ ACCRÉDITÉE</span>
                                        <span className="text-lg font-black uppercase tracking-tight italic text-background">DEPUIS {new Date(user?.createdAt).getFullYear()}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-5 group/stat">
                                    <div className="size-14 rounded-[1.5rem] bg-emerald-500/20 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-premium">
                                        <BadgeCheck className="size-6" />
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-executive-label font-black text-background/40 uppercase italic tracking-widest opacity-60">SÛRETÉ DE RÉSEAU</span>
                                        <span className="text-lg font-black uppercase tracking-tight italic text-emerald-400">IDENTITÉ SCELLÉE</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-5 group/stat">
                                    <div className="size-14 rounded-[1.5rem] bg-background/10 border-2 border-background/20 flex items-center justify-center text-primary shadow-premium">
                                        <Shield className="size-6" />
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-executive-label font-black text-background/40 uppercase italic tracking-widest opacity-60">PROTOCOLE BCA</span>
                                        <span className="text-lg font-black uppercase tracking-tight italic text-background">PRIORITY PROTECT AA+</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* PRIMARY ACTION */}
                        <Button
                            onClick={handleUpdate}
                            disabled={isUpdating}
                            className="w-full xl:w-auto h-24 px-16 rounded-[2.5rem] bg-background text-foreground hover:bg-primary hover:text-background text-executive-label font-black uppercase italic tracking-widest shadow-premium-lg transition-all hover:scale-[1.05] active:scale-[0.95] shrink-0 border-transparent"
                        >
                            {isUpdating ? 'SYNCHRONISATION...' : 'SANCTUARISER'}
                        </Button>
                    </div>
                </div>

                {activeTab === 'profile' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                        {/* ══════════════════════════════════════════════════
                            SECTION 2 — PERSONAL DATA MATRIX
                        ══════════════════════════════════════════════════ */}
                        <div className="lg:col-span-2 space-y-12">
                            <div className="bg-card border-4 border-border rounded-[3.5rem] overflow-hidden shadow-premium group/matrix">
                                <div className="px-12 py-8 border-b-4 border-border bg-accent/20 flex items-center justify-between">
                                    <div className="flex items-center gap-5">
                                        <User className="size-6 text-primary group-hover/matrix:scale-110 transition-transform" />
                                        <h3 className="text-executive-label font-black uppercase tracking-widest text-foreground italic">MATRICE D'IDENTITÉ EXECUTIVE</h3>
                                    </div>
                                    <div className="size-3 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(43,90,255,0.5)]" />
                                </div>
                                <div className="p-12 space-y-12">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                        <div className="space-y-6">
                                            <label className="text-executive-label font-black uppercase italic tracking-widest text-muted-foreground/60 ml-2">DÉSIGNATION LÉGALE PRO</label>
                                            <div className="relative group/input">
                                                <Input 
                                                    className="h-20 px-8 rounded-2xl bg-accent/40 border-2 border-transparent focus:border-primary/40 focus:bg-background text-lg font-black italic uppercase transition-all shadow-inner"
                                                    value={nomComplet} 
                                                    onChange={(e) => setNomComplet(e.target.value)} 
                                                />
                                                <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover/input:opacity-100 transition-opacity">
                                                    <Edit3 className="size-5 text-primary" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <label className="text-executive-label font-black uppercase italic tracking-widest text-muted-foreground/60 ml-2">LIAISON MOBILE SÉCURISÉE</label>
                                            <div className="relative group/input">
                                                <Input 
                                                    type="tel" 
                                                    className="h-20 px-8 rounded-2xl bg-accent/40 border-2 border-transparent focus:border-primary/40 focus:bg-background text-lg font-black italic uppercase transition-all shadow-inner"
                                                    value={telephone} 
                                                    onChange={(e) => setTelephone(e.target.value)} 
                                                />
                                                <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover/input:opacity-100 transition-opacity">
                                                    <BadgeCheck className="size-5 text-emerald-500" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <label className="text-executive-label font-black uppercase italic tracking-widest text-muted-foreground/60 ml-2">CANAL DE CORRESPONDANCE ÉLITE</label>
                                        <Input 
                                            type="email" 
                                            className="h-20 px-8 rounded-2xl bg-accent/40 border-2 border-transparent focus:border-primary/40 focus:bg-background text-lg font-black italic uppercase transition-all shadow-inner"
                                            value={email} 
                                            onChange={(e) => setEmail(e.target.value)} 
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* PROGRESS BANNER */}
                            <div className="bg-foreground text-background rounded-[3.5rem] p-16 relative overflow-hidden group shadow-premium-lg">
                                <div className="absolute top-0 right-0 size-[400px] bg-primary/20 rounded-full blur-[120px] -mr-48 -mt-48 transition-all duration-1000 group-hover:bg-primary/30" />
                                <div className="absolute bottom-0 left-0 size-[300px] bg-background/10 rounded-full blur-[100px] -ml-32 -mb-32" />
                                
                                <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-16">
                                    <div className="space-y-8">
                                        <div className="px-6 py-3 bg-emerald-500/20 border-2 border-emerald-500/30 rounded-[1.5rem] w-fit shadow-premium">
                                            <p className="text-executive-label font-black uppercase italic tracking-widest text-emerald-400 leading-none">INDICATEUR DE PRESTIGE</p>
                                        </div>
                                        <div className="flex items-baseline gap-6">
                                            <span className="text-8xl font-black tracking-tighter italic leading-none">92</span>
                                            <span className="text-4xl font-black text-primary uppercase italic tracking-tighter">%</span>
                                            <span className="text-executive-label font-black text-background/40 uppercase italic tracking-widest ml-6 opacity-60">STATURE DE MARCHÉ GLOBAL</span>
                                        </div>
                                        <p className="text-lg text-background/60 font-bold max-w-lg leading-relaxed italic opacity-80">
                                            Votre influence commerciale est à son apogée. Optimisez vos protocoles logistiques pour sceller votre rang "DIAMOND PARTNER".
                                        </p>
                                    </div>
                                    <div className="w-full xl:w-96 space-y-8">
                                        <div className="flex justify-between items-end">
                                            <span className="text-executive-label font-black uppercase italic tracking-widest text-background/40">INTÉGRITÉ DU PROFIL</span>
                                            <span className="text-2xl font-black text-primary italic">92 / 100</span>
                                        </div>
                                        <div className="h-4 bg-background/10 rounded-full overflow-hidden border-2 border-background/20 p-1 shadow-inner">
                                            <div className="bg-primary h-full w-[92%] rounded-full shadow-[0_0_40px_rgba(43,90,255,1)] animate-pulse" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SIDEBAR WIDGETS */}
                        <div className="space-y-12">
                            <div className="bg-accent/40 border-4 border-border rounded-[3.5rem] p-12 space-y-8 shadow-premium group hover:border-primary/40 transition-all duration-700">
                                <div className="size-20 rounded-[2rem] bg-background flex items-center justify-center text-primary border-4 border-border shadow-premium group-hover:rotate-12 transition-transform">
                                    <Shield className="size-10" />
                                </div>
                                <h4 className="text-executive-title font-black text-foreground italic leading-none">ASSISTANCE GLOBAL ÉLITE</h4>
                                <p className="text-executive-label text-muted-foreground/60 font-bold leading-relaxed italic opacity-80">
                                    Votre inviolabilité est notre standard. En cas de suspicion de flux asymétriques ou d'usurpation, activez le protocole d'urgence BCA Guard immédiatement.
                                </p>
                                <Button variant="ghost" className="w-full justify-between h-20 px-10 bg-background rounded-[1.5rem] hover:bg-primary hover:text-background text-primary text-executive-label font-black uppercase italic tracking-widest transition-all shadow-premium border-2 border-border group/btn">
                                    CONTRÔLE PRIVACITÉ
                                    <ArrowRight className="size-6 group-hover/btn:translate-x-3 transition-transform" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                        {/* ══════════════════════════════════════════════════
                            SECTION 3 — SECURITY ARCHITECTURE
                        ══════════════════════════════════════════════════ */}
                        <div className="lg:col-span-2 space-y-16">
                            <div className="bg-card border-4 border-border rounded-[3.5rem] overflow-hidden shadow-premium group/matrix">
                                <div className="px-12 py-8 border-b-4 border-border bg-accent/20 flex items-center gap-5">
                                    <Shield className="size-6 text-primary group-hover/matrix:rotate-12 transition-transform" />
                                    <h3 className="text-executive-label font-black uppercase italic tracking-widest text-foreground">CLEFS D'ACCÈS SCELLÉES</h3>
                                </div>
                                <div className="p-12 space-y-12">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                        <div className="space-y-6">
                                            <label className="text-executive-label font-black uppercase italic tracking-widest text-muted-foreground/60 ml-2">PROTOCOLE D'AUTHENTIFICATION</label>
                                            <Input 
                                                type="password" 
                                                placeholder="NOUVEAU CODE MAÎTRE"
                                                className="h-20 px-8 rounded-2xl bg-accent/40 border-2 border-transparent focus:border-primary/40 focus:bg-background text-lg font-black italic tracking-[0.3em] transition-all shadow-inner placeholder:opacity-30"
                                                value={motDePasse} 
                                                onChange={(e) => setMotDePasse(e.target.value)} 
                                            />
                                        </div>
                                        <div className="space-y-6">
                                            <label className="text-executive-label font-black uppercase italic tracking-widest text-muted-foreground/60 ml-2">CONFIRMATION SYNCHRONE</label>
                                            <Input 
                                                type="password" 
                                                placeholder="RÉITÉRER LE CODE"
                                                className="h-20 px-8 rounded-2xl bg-accent/40 border-2 border-transparent focus:border-primary/40 focus:bg-background text-lg font-black italic tracking-[0.3em] transition-all shadow-inner placeholder:opacity-30"
                                                value={confirmPassword} 
                                                onChange={(e) => setConfirmPassword(e.target.value)} 
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-5 p-6 bg-primary/5 rounded-[1.5rem] border-2 border-primary/20">
                                         <Clock className="size-6 text-primary animate-pulse" />
                                         <p className="text-executive-label text-muted-foreground font-black uppercase italic tracking-widest leading-relaxed">
                                             MAINTENEZ CES CHAMPS VIERGES POUR CONSERVER LA STRUCTURE DE SÉCURITÉ ACTUELLE.
                                         </p>
                                    </div>
                                </div>
                            </div>

                            {/* DANGER ZONE — EXECUTIVE STYLE */}
                            <div className="pt-12 border-t-8 border-border">
                                <div className="flex flex-col md:flex-row items-center justify-between p-16 bg-destructive/5 rounded-[4rem] border-4 border-destructive/20 gap-16 relative overflow-hidden group shadow-premium">
                                    <div className="absolute top-0 right-0 size-[400px] bg-destructive/10 rounded-full blur-[120px] -mr-48 -mt-48 group-hover:scale-125 transition-transform duration-1000" />
                                    <div className="text-center md:text-left space-y-6 relative z-10">
                                        <div className="flex items-center justify-center md:justify-start gap-6">
                                            <div className="size-4 rounded-full bg-destructive animate-ping shadow-[0_0_20px_rgba(239,68,68,0.6)]" />
                                            <h3 className="text-executive-title font-black text-destructive uppercase italic tracking-widest">PROTOCOLE DE DISSOLUTION</h3>
                                        </div>
                                        <p className="text-lg text-muted-foreground/80 font-bold max-w-lg leading-relaxed italic opacity-80">
                                            L'initiation de cette commande est irréversible. L'intégralité de vos actifs, historiques de flux et privilèges seront définitivement scellés et inaccessibles.
                                        </p>
                                    </div>
                                    <Button 
                                        onClick={handleDelete} 
                                        variant="destructive" 
                                        className="h-24 px-16 text-executive-label font-black uppercase italic tracking-widest rounded-[2rem] shadow-premium-lg hover:scale-[1.05] active:scale-[0.95] transition-all flex items-center gap-6 shrink-0 relative z-10 border-transparent"
                                    >
                                        <Trash2 className="size-7" />
                                        LIQUIDER LE COMPTE
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* SIDEBAR — PREFERENCES MATRIX */}
                        <div className="space-y-16">
                            <div className="bg-card border-4 border-border rounded-[3.5rem] overflow-hidden shadow-premium group/flux">
                                <div className="px-12 py-8 border-b-4 border-border bg-accent/20 flex items-center gap-5">
                                    <BellRing className="size-6 text-primary group-hover/flux:rotate-12 transition-transform" />
                                    <h3 className="text-executive-label font-black uppercase italic tracking-widest text-foreground">FLUX D'ACCRÉDITATION</h3>
                                </div>
                                <div className="p-12 space-y-16">
                                    <div className="flex items-center justify-between gap-12 group/pref">
                                        <div className="space-y-3">
                                            <p className="text-lg font-black text-foreground uppercase italic tracking-tighter leading-none">CORRESPONDANCE GLOBALE</p>
                                            <p className="text-executive-label text-muted-foreground/60 font-black uppercase tracking-widest italic leading-none">RAPPORTS HEBDOMADAIRES BCA</p>
                                        </div>
                                        <Toggle enabled={emailAlerts} onChange={setEmailAlerts} />
                                    </div>

                                    <div className="flex items-center justify-between gap-12 group/pref">
                                        <div className="space-y-3">
                                            <p className="text-lg font-black text-foreground uppercase italic tracking-tighter leading-none">PUSH DE SÉCURITÉ</p>
                                            <p className="text-executive-label text-muted-foreground/60 font-black uppercase tracking-widest italic leading-none">ALERTES DE FLUX & LOGISTIQUE</p>
                                        </div>
                                        <Toggle enabled={pushNotifs} onChange={setPushNotifs} />
                                    </div>
                                    
                                    <div className="p-8 bg-accent/40 rounded-[2rem] border-2 border-border shadow-inner">
                                         <p className="text-executive-label text-muted-foreground/40 font-black uppercase italic tracking-widest leading-relaxed text-center">
                                             LES PARAMÈTRES DE SYNCHRONISATION SONT MIS À JOUR EN TEMPS RÉEL SUR LE CLOUD BCA CONNECT.
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
