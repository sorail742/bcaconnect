import React, { useState } from 'react';
import PublicLayout from '../components/layout/PublicLayout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
    Mail, Phone, MapPin, MessageSquare, Send, CheckCircle2,
    Clock, Headphones, Zap, ArrowRight, Loader2, ChevronDown
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
            return toast.error("Protocole incomplet. Veuillez renseigner les champs obligatoires.");
        }
        setIsSending(true);
        // Simulation d'envoi chiffré
        await new Promise(r => setTimeout(r, 2000));
        setIsSending(false);
        setSent(true);
        toast.success("Dossier transmis au Pôle Exécutif. Réponse sous 24h.");
    };

    return (
        <PublicLayout>
            <div className="font-inter pb-40 animate-in fade-in duration-1000">

                {/* ══════════════════════════════════════════════════
                    EXECUTIVE HERO
                ══════════════════════════════════════════════════ */}
                <section className="relative pt-40 pb-32 bg-foreground overflow-hidden text-center border-b-8 border-primary">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 size-[50rem] bg-primary/20 rounded-full blur-[180px] mix-blend-screen pointer-events-none" />
                    <div className="absolute inset-0 opacity-[0.05]" style={{
                        backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
                        backgroundSize: '5rem 5rem'
                    }} />
                    
                    <div className="relative z-10 max-w-5xl mx-auto px-6 space-y-12 animate-in slide-in-from-bottom duration-1000">
                        <span className="inline-flex items-center gap-4 px-6 py-3 bg-white/5 border border-white/10 text-primary text-executive-label font-black uppercase tracking-[0.5em] rounded-full backdrop-blur-3xl shadow-premium italic leading-none pt-0.5">
                            <Headphones className="size-4 animate-pulse" /> Support BCA Service Privilège v4.1
                        </span>
                        <h1 className="text-7xl md:text-9xl font-black text-background tracking-tighter leading-[0.85] uppercase italic drop-shadow-2xl">
                            Liaison <br />
                            <span className="text-primary not-italic underline decoration-primary/20 decoration-8 underline-offset-[-4px]">Directe.</span>
                        </h1>
                        <p className="text-background/40 text-sm font-black uppercase tracking-[0.4em] max-w-2xl mx-auto leading-relaxed italic border-l-4 border-primary/20 pl-8">
                            Notre directoire opérationnel basé à Conakry assure une veille stratégique 24/7. Assurance qualité certifiée ISO-9001.
                        </p>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════
                    CONTACT GRID
                ══════════════════════════════════════════════════ */}
                <section className="max-w-7xl mx-auto px-6 md:px-12 py-32">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">

                        {/* Sidebar Infos */}
                        <div className="lg:col-span-4 space-y-12">
                            <div className="mb-16">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="size-3 rounded-full bg-primary animate-ping shadow-[0_0_12px_rgba(37,99,235,0.4)]" />
                                    <span className="text-executive-label font-black text-primary uppercase tracking-[0.4em] italic leading-none pt-0.5">Directoire BCA</span>
                                </div>
                                <h2 className="text-5xl font-black italic tracking-tighter text-foreground uppercase leading-[0.9]">Localisations<br/>Stratégiques.</h2>
                            </div>

                            <div className="space-y-6">
                                {[
                                    { icon: Mail, label: "Canal Électronique", value: "SUPPORT@BCACONNECT.GN", sub: "RÉPONSE SOUS 24H GARANTIE" },
                                    { icon: Phone, label: "Ligne Directe Sécurisée", value: "+224 621 000 000", sub: "LUN–SAM, 8H–18H (GMT)" },
                                    { icon: MapPin, label: "Siège Social Exécutif", value: "KABOUM, CONAKRY", sub: "RÉPUBLIQUE DE GUINÉE 🇬🇳" },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-8 p-10 rounded-[3rem] bg-card border-4 border-border hover:border-primary/40 transition-all group shadow-premium hover:shadow-premium-lg duration-700 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                        <div className="size-20 rounded-[1.5rem] bg-background border-4 border-border flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 shadow-inner relative z-10">
                                            <item.icon className="size-8 text-muted-foreground/30 group-hover:text-white transition-colors" />
                                        </div>
                                        <div className="relative z-10 flex flex-col justify-center min-h-[5rem]">
                                            <p className="text-executive-label font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic leading-none mb-2">{item.label}</p>
                                            <p className="font-black text-foreground italic mt-2 text-xl tracking-tighter leading-none">{item.value}</p>
                                            <p className="text-[10px] text-primary font-black mt-3 uppercase tracking-widest leading-none italic">{item.sub}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-12 rounded-[4rem] bg-primary/5 border-4 border-primary/10 relative overflow-hidden group/card shadow-premium hover:shadow-premium-lg transition-all duration-700">
                                <div className="absolute top-0 right-0 size-48 bg-primary/10 rounded-full blur-[80px] -mr-24 -mt-24 group-hover/card:bg-primary/20 transition-colors duration-1000" />
                                <div className="relative z-10 space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-primary/10 rounded-2xl border-2 border-primary/20 shadow-inner">
                                            <Zap className="size-6 text-primary" />
                                        </div>
                                        <p className="text-executive-label font-black text-foreground uppercase tracking-[0.3em] italic leading-none pt-0.5">Assistance Live v2</p>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground font-black uppercase tracking-[0.2em] leading-loose italic border-l-4 border-primary pl-6">
                                        Pour une assistance immédiate, déverrouillez votre accès via le portail exécutif pour utiliser le protocole de chat sécurisé de bout en bout.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Formulaire (Executive Card) */}
                        <div className="lg:col-span-8">
                            {sent ? (
                                <div className="h-full flex flex-col items-center justify-center gap-12 text-center p-20 rounded-[4rem] bg-card border-4 border-emerald-500/20 shadow-premium-lg animate-in zoom-in duration-1000 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent" />
                                    <div className="size-40 rounded-[3rem] bg-emerald-500 text-white flex items-center justify-center shadow-premium-lg shadow-emerald-500/40 relative z-10 animate-bounce">
                                        <CheckCircle2 className="size-20" />
                                    </div>
                                    <div className="space-y-8 relative z-10">
                                        <h3 className="text-6xl font-black italic tracking-tighter text-foreground uppercase leading-tight">Transmission <br /> <span className="text-emerald-500 not-italic uppercase">Confirmée.</span></h3>
                                        <p className="text-muted-foreground/60 font-black uppercase tracking-[0.3em] text-sm max-w-xl mx-auto leading-loose italic border-l-8 border-emerald-500/20 pl-10">
                                            Protocole de sécurité initié. {form.nom.split(' ')[0]}, notre pôle exécutif a bien reçu votre dossier et vous répondra sur <strong className="text-primary italic border-b-2 border-primary/20">{form.email.toUpperCase()}</strong> d'ici la prochaine fenêtre opérationnelle de 24h.
                                        </p>
                                    </div>
                                    <Button onClick={() => setSent(false)} variant="outline" className="h-20 px-16 rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-xs shadow-premium border-4 border-border hover:border-primary/40 hover:scale-105 transition-all italic active:scale-95 leading-none pt-0.5">
                                        Initier un nouveau dossier
                                    </Button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="p-12 md:p-20 rounded-[4rem] bg-card border-4 border-border space-y-16 shadow-premium hover:shadow-premium-lg transition-all duration-1000 relative overflow-hidden group/form">
                                    <div className="absolute top-0 right-0 size-96 bg-primary/5 rounded-full blur-[150px] -mr-48 -mt-48 group-hover/form:bg-primary/10 transition-colors duration-1000" />
                                    <div className="absolute inset-x-0 top-0 h-2 bg-primary/0 group-hover/form:bg-primary transition-all duration-1000"></div>
                                    
                                    <div className="relative z-10">
                                        <h3 className="text-5xl lg:text-7xl font-black italic tracking-tighter text-foreground uppercase leading-[0.85]">Formulaire de<br/>Requête <span className="text-primary not-italic">Officielle.</span></h3>
                                        <p className="text-muted-foreground/30 text-executive-label font-black uppercase tracking-[0.4em] mt-8 italic leading-none pt-0.5">Phase III: Soumission des paramètres de contact et nature du dossier.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                                        <div className="space-y-4">
                                            <label className="text-executive-label font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-4 italic leading-none pt-0.5">Identité Légale Officielle *</label>
                                            <Input name="nom" value={form.nom} onChange={handleChange} placeholder="EX: ELHADJ MAMADOU DIALLO" className="h-20 rounded-[1.5rem] border-4 border-border bg-background focus:border-primary/50 focus:ring-8 focus:ring-primary/5 font-black text-base shadow-inner px-10 placeholder:text-muted-foreground/20 uppercase tracking-widest italic" />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-executive-label font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-4 italic leading-none pt-0.5">Contact Électronique Certifié *</label>
                                            <Input name="email" type="email" value={form.email} onChange={handleChange} placeholder="DIRECTION@ENTREPRISE.GN" className="h-20 rounded-[1.5rem] border-4 border-border bg-background focus:border-primary/50 focus:ring-8 focus:ring-primary/5 font-black text-base shadow-inner px-10 placeholder:text-muted-foreground/20 uppercase tracking-widest italic" />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-executive-label font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-4 italic leading-none pt-0.5">Ligne Téléphonique de Liaison</label>
                                            <Input name="telephone" value={form.telephone} onChange={handleChange} placeholder="+224 6XX XX XX XX" className="h-20 rounded-[1.5rem] border-4 border-border bg-background focus:border-primary/50 focus:ring-8 focus:ring-primary/5 font-black text-base shadow-inner px-10 placeholder:text-muted-foreground/20 uppercase tracking-widest italic" />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-executive-label font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-4 italic leading-none pt-0.5">Nature Stratégique du Dossier</label>
                                            <div className="relative group/select">
                                                <select
                                                    name="raison"
                                                    value={form.raison}
                                                    onChange={handleChange}
                                                    className="w-full h-20 rounded-[1.5rem] border-4 border-border bg-background px-10 text-base font-black italic focus:outline-none focus:border-primary/50 focus:ring-8 focus:ring-primary/5 shadow-inner appearance-none uppercase tracking-widest text-foreground transition-all"
                                                >
                                                    <option value="" className="bg-background">SÉLECTIONNER CLASSIFICATION...</option>
                                                    {CONTACT_REASONS.map(r => <option key={r} value={r} className="bg-background">{r.toUpperCase()}</option>)}
                                                </select>
                                                <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-primary group-hover/select:scale-125 transition-transform">
                                                    <ChevronDown className="size-6" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 relative z-10">
                                        <label className="text-executive-label font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-4 italic leading-none pt-0.5">Corps de la Requête / Exposé des Motifs *</label>
                                        <textarea
                                            name="message"
                                            value={form.message}
                                            onChange={handleChange}
                                            placeholder="Détaillez votre requête avec précision stratégique..."
                                            className="w-full min-h-[250px] rounded-[2.5rem] border-4 border-border bg-background px-10 py-10 text-base font-black italic focus:outline-none focus:border-primary/50 focus:ring-8 focus:ring-primary/5 shadow-inner placeholder:text-muted-foreground/20 resize-none leading-relaxed transition-all scrollbar-hide uppercase tracking-widest"
                                        />
                                    </div>

                                    <Button type="submit" isLoading={isSending} className="w-full h-24 rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-sm gap-8 shadow-premium-lg shadow-primary/40 relative overflow-hidden group/btn hover:scale-[1.02] active:scale-[0.98] transition-all border-4 border-primary bg-primary text-white">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_2s_infinite]" />
                                        <div className="relative z-10 flex items-center justify-center gap-8">
                                            {!isSending && <Send className="size-8 group-hover/btn:-translate-y-2 group-hover/btn:translate-x-2 transition-transform" />}
                                            <span className="leading-none pt-1">{isSending ? 'Transmission Chiffrée...' : 'Soumettre le Dossier'}</span>
                                        </div>
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
