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
            <div className="font-inter pb-32 animate-in fade-in duration-1000">

                {/* ══════════════════════════════════════════════════
                    EXECUTIVE HERO
                ══════════════════════════════════════════════════ */}
                <section className="relative pt-32 pb-24 bg-slate-950 overflow-hidden text-center border-b-4 border-primary">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 size-[40rem] bg-primary/20 rounded-full blur-[150px] mix-blend-screen pointer-events-none" />
                    <div className="absolute inset-0 opacity-[0.03]" style={{
                        backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
                        backgroundSize: '4rem 4rem'
                    }} />
                    
                    <div className="relative z-10 max-w-4xl mx-auto px-4 space-y-8 animate-in slide-in-from-bottom duration-1000 delay-200">
                        <span className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/5 border border-white/10 text-primary text-[9px] font-black uppercase tracking-[0.4em] rounded-full backdrop-blur-md shadow-2xl">
                            <Headphones className="size-3.5" /> Support BCA Service Privilège
                        </span>
                        <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.9] uppercase italic">
                            Parlons-nous. <br />
                            <span className="text-primary italic">Maintenant.</span>
                        </h1>
                        <p className="text-white/50 text-base font-bold tracking-widest uppercase max-w-2xl mx-auto leading-relaxed">
                            Notre équipe exécutive basée à Conakry vous répond en moins de 24h. Assurance qualité certifiée.
                        </p>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════
                    CONTACT GRID
                ══════════════════════════════════════════════════ */}
                <section className="max-w-7xl mx-auto px-4 md:px-8 py-24">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                        {/* Sidebar Infos */}
                        <div className="lg:col-span-4 space-y-8">
                            <div className="mb-12">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="size-2 rounded-full bg-primary animate-pulse" />
                                    <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em]">Directoire BCA</span>
                                </div>
                                <h2 className="text-4xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase leading-none">Nous<br/>Trouver.</h2>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { icon: Mail, label: "Canal Électronique", value: "support@bcaconnect.gn", sub: "Réponse sous 24h garantie" },
                                    { icon: Phone, label: "Ligne Directe", value: "+224 621 000 000", sub: "Lun–Sam, 8h–18h (GMT)" },
                                    { icon: MapPin, label: "Siège Social", value: "Kaloum, Conakry", sub: "République de Guinée 🇬🇳" },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-5 p-6 rounded-[2rem] bg-white dark:bg-slate-900 border-2 border-slate-50 dark:border-slate-800 hover:border-primary/30 transition-all group shadow-sm hover:shadow-xl hover:shadow-primary/5 duration-500">
                                        <div className="size-14 rounded-2xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white group-hover:scale-110 transition-all duration-500 shadow-inner">
                                            <item.icon className="size-6 text-slate-400 group-hover:text-white transition-colors" />
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400">{item.label}</p>
                                            <p className="font-black text-slate-900 dark:text-white italic mt-1 text-sm tracking-tight">{item.value}</p>
                                            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">{item.sub}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-8 rounded-[2.5rem] bg-primary/5 border-2 border-primary/10 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 size-32 bg-primary/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-primary/20 transition-colors" />
                                <div className="relative z-10 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-xl">
                                            <Zap className="size-5 text-primary" />
                                        </div>
                                        <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Assistance Live</p>
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-loose">
                                        Pour une assistance immédiate, déverrouillez votre accès via le portail exécutif pour utiliser le chat sécurisé.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Formulaire (Executive Card) */}
                        <div className="lg:col-span-8">
                            {sent ? (
                                <div className="h-full flex flex-col items-center justify-center gap-8 text-center p-16 rounded-[3rem] bg-white dark:bg-slate-900 border-2 border-emerald-500/20 shadow-2xl shadow-emerald-500/10 animate-in zoom-in duration-500">
                                    <div className="size-32 rounded-[2.5rem] bg-emerald-500 text-white flex items-center justify-center shadow-2xl shadow-emerald-500/30">
                                        <CheckCircle2 className="size-16" />
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-5xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase">Transmission Confirmée.</h3>
                                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] max-w-lg mx-auto leading-relaxed">
                                            Protocole sécurisé initié. {form.nom}, notre pôle exécutif a bien reçu votre dossier et vous répondra sur <strong className="text-primary italic">{form.email}</strong> d'ici la prochaine fenêtre de 24h.
                                        </p>
                                    </div>
                                    <Button onClick={() => setSent(false)} variant="outline" className="h-16 px-10 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-sm border-2">
                                        Initier un nouveau dossier
                                    </Button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="p-10 md:p-14 rounded-[3rem] bg-white dark:bg-slate-900 border-2 border-slate-50 dark:border-slate-800 space-y-10 shadow-2xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 size-64 bg-slate-100 dark:bg-slate-800/50 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-1000" />
                                    
                                    <div className="relative z-10">
                                        <h3 className="text-3xl lg:text-4xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase leading-none">Formulaire de<br/>Requête Officielle.</h3>
                                        <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.3em] mt-4">Les champs munis d'un astérisque (*) sont requis pour la procédure.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                                        <div className="space-y-3">
                                            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Identité Légale *</label>
                                            <Input name="nom" value={form.nom} onChange={handleChange} placeholder="Ex: Elhadj Mamadou Diallo" className="h-16 rounded-[1.5rem] border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-sm shadow-inner px-6" />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Contact Électronique *</label>
                                            <Input name="email" type="email" value={form.email} onChange={handleChange} placeholder="direction@entreprise.com" className="h-16 rounded-[1.5rem] border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-sm shadow-inner px-6 tracking-widest" />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Ligne Téléphonique</label>
                                            <Input name="telephone" value={form.telephone} onChange={handleChange} placeholder="+224 6XX XX XX XX" className="h-16 rounded-[1.5rem] border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-sm shadow-inner px-6" />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Nature du Dossier</label>
                                            <div className="relative">
                                                <select
                                                    name="raison"
                                                    value={form.raison}
                                                    onChange={handleChange}
                                                    className="w-full h-16 rounded-[1.5rem] border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-6 text-sm font-bold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-inner appearance-none uppercase tracking-widest text-slate-600 dark:text-slate-300"
                                                >
                                                    <option value="" className="bg-white dark:bg-slate-900">CLASSIFICATION...</option>
                                                    {CONTACT_REASONS.map(r => <option key={r} value={r} className="bg-white dark:bg-slate-900">{r}</option>)}
                                                </select>
                                                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                    ▼
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3 relative z-10">
                                        <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Corps de la Requête *</label>
                                        <textarea
                                            name="message"
                                            value={form.message}
                                            onChange={handleChange}
                                            placeholder="Détaillez votre requête avec précision..."
                                            className="w-full min-h-[200px] rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-8 py-6 text-sm font-bold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-inner placeholder:text-slate-300 resize-none leading-relaxed"
                                        />
                                    </div>

                                    <Button type="submit" disabled={isSending} className="w-full h-20 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[11px] gap-4 shadow-2xl shadow-primary/30 relative overflow-hidden group/btn hover:scale-[1.01] active:scale-[0.98] transition-all">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_2s_infinite]" />
                                        <div className="relative z-10 flex items-center gap-4">
                                            {isSending ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5 group-hover/btn:-translate-y-1 group-hover/btn:translate-x-1 transition-transform" />}
                                            {isSending ? 'Transmission Chiffrée...' : 'Soumettre le Dossier'}
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
