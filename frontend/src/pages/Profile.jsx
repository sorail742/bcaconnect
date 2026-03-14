import React, { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
    CalendarDays,
    BadgeCheck,
    Edit3,
    ArrowRight,
    Trash2,
    Shield,
    User,
    BellRing
} from 'lucide-react';

const Toggle = ({ enabled, onChange }) => (
    <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex w-11 h-6 items-center rounded-full transition-colors focus:outline-none ${enabled ? 'bg-primary' : 'bg-muted'
            }`}
    >
        <span
            className={`inline-block w-4 h-4 transform rounded-full bg-background shadow transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
        />
    </button>
);

const UserProfile = () => {
    const [prenom, setPrenom] = useState('Mamadou');
    const [telephone, setTelephone] = useState('+224 625 00 12 34');
    const [email, setEmail] = useState('m.diallo@bcaconnect.gn');

    const [emailAlerts, setEmailAlerts] = useState(true);
    const [pushNotifs, setPushNotifs] = useState(false);
    const [marketNews, setMarketNews] = useState(true);

    return (
        <DashboardLayout title="Mon Profil">
            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
                <Card className="relative overflow-hidden p-8 border-border bg-card shadow-sm">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -mr-8 -mt-8"></div>
                    <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                        {/* Avatar */}
                        <div className="relative group">
                            <div className="size-28 rounded-3xl border-4 border-background shadow-xl overflow-hidden bg-muted flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform duration-300">
                                <span className="text-4xl font-black text-primary italic">MD</span>
                            </div>
                            <button className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground p-2.5 rounded-xl shadow-lg hover:scale-110 active:scale-95 transition-all">
                                <Edit3 className="size-4" />
                            </button>
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-col md:flex-row md:items-center gap-3">
                                <h2 className="text-3xl font-black text-foreground tracking-tight uppercase italic">
                                    Mamadou Diallo
                                </h2>
                                <Badge variant="outline" className="text-[10px] text-primary border-primary/20 bg-primary/5">
                                    Marchand Vérifié
                                </Badge>
                            </div>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 mt-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                <span className="flex items-center gap-2">
                                    <CalendarDays className="size-4 text-primary" />
                                    Depuis Janvier 2024
                                </span>
                                <span className="flex items-center gap-2 text-emerald-500">
                                    <BadgeCheck className="size-4" />
                                    Compte Certifié
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button variant="outline" className="rounded-xl uppercase tracking-widest text-xs font-black">
                                Aperçu public
                            </Button>
                            <Button className="rounded-xl uppercase tracking-widest text-xs font-black shadow-xl shadow-primary/20">
                                Enregistrer
                            </Button>
                        </div>
                    </div>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <Card>
                            <CardHeader className="flex flex-row items-center gap-3 border-b border-border py-4">
                                <User className="size-5 text-primary" />
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-foreground">Informations personnelles</CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Prénom & Nom</label>
                                        <Input value={prenom} onChange={(e) => setPrenom(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ligne mobile</label>
                                        <Input type="tel" value={telephone} onChange={(e) => setTelephone(e.target.value)} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Adresse E-mail professionnelle</label>
                                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row justify-between items-center border-b border-border py-4">
                                <div className="flex items-center gap-3">
                                    <Shield className="size-5 text-primary" />
                                    <CardTitle className="text-sm font-black uppercase tracking-widest text-foreground">Sécurité & Accès</CardTitle>
                                </div>
                                <Badge className="bg-emerald-500 hover:bg-emerald-600 text-[9px] uppercase tracking-widest text-white">
                                    Double Auth. (2FA) Activé
                                </Badge>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Mot de passe actuel</label>
                                    <Input type="password" placeholder="••••••••••••" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nouveau code secret</label>
                                        <Input type="password" placeholder="Min. 8 caractères" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Confirmation</label>
                                        <Input type="password" placeholder="Repéter le code" />
                                    </div>
                                </div>
                                <div className="pt-2 flex justify-end">
                                    <button className="text-primary text-[11px] font-black uppercase tracking-widest flex items-center gap-2 hover:translate-x-1 transition-transform">
                                        Gestion avancée des accès
                                        <ArrowRight className="size-4" />
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-8">
                        <Card>
                            <CardHeader className="flex flex-row items-center gap-3 border-b border-border py-4">
                                <BellRing className="size-5 text-primary" />
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-foreground">Préférences</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-8">
                                <div className="flex items-center justify-between group">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs font-black uppercase tracking-widest text-foreground">Rapports E-mail</span>
                                        <span className="text-[10px] text-muted-foreground font-bold max-w-[140px]">Résumé hebdomadaire de vos ventes</span>
                                    </div>
                                    <Toggle enabled={emailAlerts} onChange={setEmailAlerts} />
                                </div>

                                <div className="flex items-center justify-between group">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs font-black uppercase tracking-widest text-foreground">Alertes Mobiles</span>
                                        <span className="text-[10px] text-muted-foreground font-bold max-w-[140px]">Notifications instantanées (Push)</span>
                                    </div>
                                    <Toggle enabled={pushNotifs} onChange={setPushNotifs} />
                                </div>

                                <div className="flex items-center justify-between group">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs font-black uppercase tracking-widest text-foreground">Market Insights</span>
                                        <span className="text-[10px] text-muted-foreground font-bold max-w-[140px]">Conseils et opportunités de marché</span>
                                    </div>
                                    <Toggle enabled={marketNews} onChange={setMarketNews} />
                                </div>
                            </CardContent>
                        </Card>

                        <div className="bg-gradient-to-br from-primary/10 to-transparent dark:from-primary/20 rounded-2xl p-8 border border-primary/20 relative group">
                            <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-6">Force du profil digital</h4>
                            <div className="flex items-end gap-3 mb-6">
                                <span className="text-4xl font-black text-primary italic leading-none">85%</span>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pb-1">Excellent</span>
                            </div>
                            <div className="h-2.5 bg-muted rounded-full overflow-hidden mb-6 p-0.5 shadow-inner">
                                <div className="bg-primary h-full w-[85%] rounded-full shadow-[0_0_12px_rgba(43,108,238,0.5)] transition-all duration-1000" />
                            </div>
                            <p className="text-[11px] text-muted-foreground font-medium leading-relaxed mb-6 italic">
                                "Un profil complet à 100% augmente votre visibilité auprès des partenaires de 40%."
                            </p>
                            <Button className="w-full py-3.5 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all">
                                Atteindre les 100%
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-border">
                    <div className="flex flex-col md:flex-row items-center justify-between bg-card p-8 rounded-2xl border border-destructive/20 shadow-sm gap-6">
                        <div className="text-center md:text-left">
                            <h3 className="text-lg font-black text-destructive uppercase italic">Action irréversible</h3>
                            <p className="text-sm text-muted-foreground mt-2 font-medium">Les données supprimées ne pourront pas être récupérées. Pensez à exporter vos données avant.</p>
                        </div>
                        <Button variant="destructive" className="flex items-center gap-3 px-8 py-3.5 text-xs font-black uppercase tracking-widest rounded-xl shadow-xl shadow-destructive/20 group">
                            <Trash2 className="size-4 group-hover:animate-bounce" />
                            Fermer mon compte
                        </Button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default UserProfile;
