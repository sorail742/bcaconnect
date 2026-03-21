import React, { useState } from 'react';
import PublicLayout from '../components/layout/PublicLayout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
    Mail, Phone, MapPin, MessageSquare, Send, CheckCircle2,
    Clock, Headphones, Zap, ArrowRight, Loader2
} from 'lucide-react';
import { toast } from 'sonner';

const CONTACT_REASONS = [
    'Support technique',
    'Litige / Réclamation',
    'Demande de partenariat',
    'Devenir fournisseur',
    'Questions sur BCA Connect',
    'Autre',
];

const ContactPage = () => {
    const [form, setForm] = useState({
        nom: '', email: '', telephone: '', raison: '', message: ''
    });
    const [isSending, setIsSending] = useState(false);
    const [sent, setSent] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.nom || !form.email || !form.message) {
            return toast.error("Veuillez remplir tous les champs obligatoires.");
        }
        setIsSending(true);
        // Simulation d'envoi
        await new Promise(r => setTimeout(r, 1500));
        setIsSending(false);
        setSent(true);
        toast.success("Message envoyé ! Nous vous répondrons dans les 24h.");
    };

    return (
        <PublicLayout>
            <div className="font-inter pb-20">

                {/* ══ HERO ══ */}
                <section className="relative py-24 bg-slate-950 overflow-hidden text-center">
                    <div className="absolute top-0 left-1/3 size-96 bg-primary/10 rounded-full blur-[150px]" />
                    <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#ea580c_1px,transparent_1px)] bg-[size:32px_32px]" />
                    <div className="relative z-10 max-w-3xl mx-auto px-4 space-y-6">
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-primary/20">
                            <Headphones className="size-3" /> Support BCA Connect
                        </span>
                        <h1 className="text-6xl md:text-7xl font-black text-white tracking-tighter leading-none uppercase">
                            Parlons-nous. <br />
                            <span className="text-primary">Maintenant.</span>
                        </h1>
                        <p className="text-slate-400 text-lg font-medium">
                            Notre équipe basée à Conakry vous répond en moins de 24h. Que vous soyez client, fournisseur ou partenaire.
                        </p>
                    </div>
                </section>

                {/* ══ INFOS CONTACT + FORMULAIRE ══ */}
                <section className="max-w-7xl mx-auto px-4 md:px-8 py-20">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                        {/* Sidebar Infos */}
                        <div className="space-y-6">
                            <div>
                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Nos coordonnées</span>
                                <h2 className="text-3xl font-black italic tracking-tighter text-foreground mt-2 uppercase">Nous Trouver</h2>
                            </div>

                            {[
                                { icon: Mail, label: "Email", value: "support@bcaconnect.gn", sub: "Réponse sous 24h garantie" },
                                { icon: Phone, label: "Téléphone", value: "+224 621 000 000", sub: "Lun–Sam, 8h–18h (GMT)" },
                                { icon: MapPin, label: "Adresse", value: "Kaloum, Conakry", sub: "République de Guinée 🇬🇳" },
                                { icon: Clock, label: "Disponibilité", value: "Lun–Sam 8h–18h", sub: "Support chat 24/7" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-4 p-5 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all group">
                                    <div className="size-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                        <item.icon className="size-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{item.label}</p>
                                        <p className="font-black text-foreground italic mt-0.5">{item.value}</p>
                                        <p className="text-xs text-muted-foreground font-medium mt-0.5">{item.sub}</p>
                                    </div>
                                </div>
                            ))}

                            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 space-y-3">
                                <div className="flex items-center gap-2">
                                    <Zap className="size-4 text-primary" />
                                    <p className="text-sm font-black text-foreground uppercase tracking-widest">Réponse Rapide</p>
                                </div>
                                <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                                    Pour une assistance immédiate, utilisez le chat en direct disponible sur votre dashboard après connexion.
                                </p>
                            </div>
                        </div>

                        {/* Formulaire */}
                        <div className="lg:col-span-2">
                            {sent ? (
                                <div className="h-full flex flex-col items-center justify-center gap-6 text-center p-12 rounded-[2rem] bg-card border border-border">
                                    <div className="size-24 rounded-3xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                        <CheckCircle2 className="size-12 text-emerald-500" />
                                    </div>
                                    <h3 className="text-3xl font-black italic tracking-tighter text-foreground">Message envoyé !</h3>
                                    <p className="text-muted-foreground font-medium max-w-md">
                                        Merci, {form.nom}. Notre équipe vous répondra à l'adresse <strong className="text-foreground">{form.email}</strong> dans les 24 heures.
                                    </p>
                                    <Button onClick={() => setSent(false)} variant="outline" className="h-12 px-8 rounded-2xl font-black uppercase tracking-widest text-xs">
                                        Envoyer un autre message
                                    </Button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="p-8 rounded-[2rem] bg-card border border-border space-y-6">
                                    <div>
                                        <h3 className="text-2xl font-black italic tracking-tighter text-foreground uppercase">Envoyez-nous un message</h3>
                                        <p className="text-muted-foreground text-sm font-medium mt-1">Tous les champs marqués * sont obligatoires.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nom complet *</label>
                                            <Input name="nom" value={form.nom} onChange={handleChange} placeholder="Ex: Mamadou Diallo" className="h-12 rounded-xl" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email *</label>
                                            <Input name="email" type="email" value={form.email} onChange={handleChange} placeholder="votre@email.com" className="h-12 rounded-xl" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Téléphone</label>
                                            <Input name="telephone" value={form.telephone} onChange={handleChange} placeholder="+224 6xx xxx xxx" className="h-12 rounded-xl" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Raison du contact</label>
                                            <select
                                                name="raison"
                                                value={form.raison}
                                                onChange={handleChange}
                                                className="w-full h-12 rounded-xl border border-input bg-background px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
                                            >
                                                <option value="">Choisir une raison...</option>
                                                {CONTACT_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Message *</label>
                                        <textarea
                                            name="message"
                                            value={form.message}
                                            onChange={handleChange}
                                            placeholder="Décrivez votre demande en détail..."
                                            className="w-full min-h-[140px] rounded-xl border border-input bg-background px-5 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground resize-none"
                                        />
                                    </div>

                                    <Button type="submit" disabled={isSending} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-sm gap-3 shadow-xl shadow-primary/20">
                                        {isSending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                                        {isSending ? 'Envoi en cours...' : 'Envoyer le message'}
                                    </Button>
                                </form>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </PublicLayout>
    );
};

export default ContactPage;
