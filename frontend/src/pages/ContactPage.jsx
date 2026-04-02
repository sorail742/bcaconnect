import React, { useState } from 'react';
import PublicLayout from '../components/layout/PublicLayout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
    Mail, Phone, MapPin, MessageSquare, Send, CheckCircle2,
    Clock, Headphones, Zap, ArrowRight, Loader2, ChevronDown,
    ShieldCheck, Sparkles
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
            <div className="bg-[#0A0D14] min-h-screen text-white font-inter">

                {/* ══════════════════════════════════════════════════
                    EXECUTIVE HERO
                ══════════════════════════════════════════════════ */}
                <section className="relative pt-48 pb-32 overflow-hidden text-center border-b-8 border-white/5">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 size-[60rem] bg-[#FF6600]/10 rounded-full blur-[200px] mix-blend-screen pointer-events-none" />
                    <div className="absolute inset-0 opacity-[0.03]" style={{
                        backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
                        backgroundSize: '5rem 5rem'
                    }} />

                    <div className="relative z-10 max-w-7xl mx-auto px-6 space-y-16 animate-in slide-in-from-bottom duration-1000">
                        <span className="inline-flex items-center gap-6 px-10 py-4 bg-white/5 border-2 border-white/10 text-[#FF6600] text-[11px] font-black uppercase tracking-[0.6em] rounded-full backdrop-blur-3xl shadow-2xl italic leading-none">
                            <Headphones className="size-5" /> SUPPORT BCA SERVICE PRIVILÈGE v4.1
                        </span>
                        <h1 className="text-7xl md:text-[10rem] font-black tracking-tighter leading-[0.8] uppercase italic text-white drop-shadow-2xl">
                            LIAISON <br />
                            <span className="text-[#FF6600] not-italic underline decoration-white/10 decoration-8 underline-offset-[-4px]">DIRECTE.</span>
                        </h1>
                        <p className="text-slate-500 text-sm md:text-lg font-black uppercase tracking-[0.4em] max-w-3xl mx-auto leading-relaxed italic border-l-8 border-[#FF6600]/20 pl-12">
                            NOTRE DIRECTOIRE OPÉRATIONNEL BASÉ À CONAKRY ASSURE UNE VEILLE STRATÉGIQUE 24/7. RÉPONSE GARANTIE DANS LES FENÊTRES DE TRANSMISSION OFFICIELLES.
                        </p>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════
                    CONTACT GRID
                ══════════════════════════════════════════════════ */}
                <section className="max-w-7xl mx-auto px-6 md:px-12 py-32 pb-48">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-24">

                        {/* Sidebar Infos */}
                        <div className="lg:col-span-4 space-y-16">
                            <div>
                                <div className="flex items-center gap-6 mb-10">
                                    <div className="size-4 rounded-full bg-[#FF6600] animate-pulse shadow-[0_0_20px_rgba(255,102,0,0.4)]" />
                                    <span className="text-[11px] font-black text-[#FF6600] uppercase tracking-[0.6em] italic">DIRECTOIRE BCA</span>
                                </div>
                                <h2 className="text-6xl font-black italic tracking-tighter text-white uppercase leading-[0.9]">POINTS DE<br />LIAISON.</h2>
                            </div>

                            <div className="space-y-8">
                                {[
                                    { icon: Mail, label: "CANAL ÉLECTRONIQUE", value: "SUPPORT@BCACONNECT.GN", sub: "RÉPONSE SOUS 24H GARANTIE" },
                                    { icon: Phone, label: "LIGNE DIRECTE SÉCURISÉE", value: "+224 621 000 000", sub: "LUN–SAM, 8H–18H (GMT)" },
                                    { icon: MapPin, label: "SIÈGE SOCIAL EXÉCUTIF", value: "KABOUM, CONAKRY", sub: "RÉPUBLIQUE DE GUINÉE 🇬🇳" },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-10 p-12 rounded-[4rem] bg-white/[0.02] border-4 border-white/5 hover:border-[#FF6600]/40 transition-all group shadow-2xl hover:shadow-3xl duration-1000 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-[#FF6600]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                                        <div className="size-20 rounded-[1.5rem] bg-white/5 border-2 border-white/5 flex items-center justify-center shrink-0 group-hover:bg-[#FF6600] group-hover:text-white group-hover:scale-110 group-hover:rotate-6 transition-all duration-1000 shadow-inner relative z-10">
                                            <item.icon className="size-8 text-slate-700 group-hover:text-white transition-colors" />
                                        </div>
                                        <div className="relative z-10 flex flex-col justify-center min-h-[5rem]">
                                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 italic mb-4">{item.label}</p>
                                            <p className="font-black text-white italic text-xl tracking-tighter leading-none">{item.value}</p>
                                            <p className="text-[11px] text-[#FF6600] font-black mt-4 uppercase tracking-[0.1em] leading-none italic">{item.sub}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-12 rounded-[4.5rem] bg-[#FF6600]/5 border-4 border-[#FF6600]/10 relative overflow-hidden group/card shadow-2xl hover:shadow-3xl transition-all duration-1000">
                                <div className="absolute top-0 right-0 size-64 bg-[#FF6600]/10 rounded-full blur-[100px] -mr-32 -mt-32 group-hover/card:bg-[#FF6600]/20 transition-colors duration-1000" />
                                <div className="relative z-10 space-y-8">
                                    <div className="flex items-center gap-6">
                                        <div className="p-4 bg-[#FF6600]/10 rounded-2xl border-2 border-[#FF6600]/20 shadow-inner">
                                            <Sparkles className="size-7 text-[#FF6600]" />
                                        </div>
                                        <p className="text-[11px] font-black text-white uppercase tracking-[0.4em] italic leading-none pt-0.5">ASSISTANCE LIVE v2.0</p>
                                    </div>
                                    <p className="text-[11px] text-slate-500 font-extrabold uppercase tracking-[0.2em] leading-loose italic border-l-8 border-[#FF6600]/40 pl-8">
                                        POUR UNE ASSISTANCE IMMÉDIATE, UTILISEZ LE PROTOCOLE DE CHAT SÉCURISÉ ANALYTIQUE DISPONIBLE DIRECTEMENT SUR LE TABLEAU DE BORD.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Formulaire (Executive Card) */}
                        <div className="lg:col-span-8">
                            {sent ? (
                                <div className="h-full flex flex-col items-center justify-center gap-16 text-center p-24 rounded-[5rem] bg-white/[0.02] border-4 border-emerald-500/20 shadow-3xl animate-in zoom-in duration-1000 relative overflow-hidden">
                                    <div className="absolute inset-x-0 top-0 h-4 bg-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.4)]"></div>
                                    <div className="size-48 rounded-[3rem] bg-emerald-500 text-white flex items-center justify-center shadow-3xl shadow-emerald-500/40 relative z-10 animate-bounce">
                                        <CheckCircle2 className="size-24" />
                                    </div>
                                    <div className="space-y-10 relative z-10">
                                        <h3 className="text-7xl font-black italic tracking-tighter text-white uppercase leading-tight">DOSSIER <br /> <span className="text-emerald-500 not-italic uppercase">TRANSMIS.</span></h3>
                                        <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-sm max-w-2xl mx-auto leading-loose italic border-l-8 border-emerald-500/20 pl-12">
                                            PROTOCOLE DE RÉCEPTION VALIDÉ. {form.nom.split(' ')[0]}, NOTRE PÔLE EXÉCUTIF EXAMINE VOTRE REQUÊTE. UNE NOTIFICATION DE LIAISON SERA ENVOYÉE À <span className="text-white border-b-4 border-[#FF6600]/30">{form.email.toUpperCase()}</span>.
                                        </p>
                                    </div>
                                    <Button onClick={() => setSent(false)} variant="outline" className="h-24 px-20 rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-xs shadow-2xl border-4 border-white/5 hover:border-[#FF6600]/40 hover:scale-110 transition-all italic bg-white/5">
                                        INITIER UN NOUVEAU PROTOCOLE
                                    </Button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="p-16 md:p-24 rounded-[5rem] bg-white/[0.02] border-4 border-white/5 space-y-20 shadow-3xl hover:shadow-[#FF6600]/5 transition-all duration-1000 relative overflow-hidden group/form">
                                    <div className="absolute top-0 right-0 size-[40rem] bg-[#FF6600]/5 rounded-full blur-[150px] -mr-48 -mt-48 group-hover/form:bg-[#FF6600]/10 transition-colors duration-1000" />
                                    <div className="absolute inset-x-0 top-0 h-4 bg-[#FF6600]/0 group-hover/form:bg-[#FF6600] transition-all duration-1000"></div>

                                    <div className="relative z-10 space-y-8">
                                        <h3 className="text-6xl lg:text-8xl font-black italic tracking-tighter text-white uppercase leading-[0.85]">PROTOCOLE DE<br />COMMUNICATION <span className="text-[#FF6600] not-italic">SÉCURISÉ.</span></h3>
                                        <p className="text-slate-700 text-[11px] font-black uppercase tracking-[0.5em] italic leading-none pt-2">PHASE III : TRANSMISSION DES PARAMÈTRES ET NATURE DU DOSSIER.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                                        <div className="space-y-6">
                                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 ml-6 italic">NOM COMPLET CERTIFIÉ *</label>
                                            <Input name="nom" value={form.nom} onChange={handleChange} placeholder="ELHADJ MAMADOU DIALLO" className="h-24 rounded-[2.5rem] border-4 border-white/5 bg-white/[0.02] focus:border-[#FF6600]/40 focus:ring-0 font-black text-base px-12 placeholder:text-slate-800 uppercase tracking-widest italic transition-all" />
                                        </div>
                                        <div className="space-y-6">
                                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 ml-6 italic">LIAISON ÉLECTRONIQUE *</label>
                                            <Input name="email" type="email" value={form.email} onChange={handleChange} placeholder="DIRECTION@SOCIETE.GN" className="h-24 rounded-[2.5rem] border-4 border-white/5 bg-white/[0.02] focus:border-[#FF6600]/40 focus:ring-0 font-black text-base px-12 placeholder:text-slate-800 uppercase tracking-widest italic transition-all" />
                                        </div>
                                        <div className="space-y-6">
                                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 ml-6 italic">LIGNE TÉLÉPHONIQUE DIRECTE</label>
                                            <Input name="telephone" value={form.telephone} onChange={handleChange} placeholder="+224 6XX XX XX XX" className="h-24 rounded-[2.5rem] border-4 border-white/5 bg-white/[0.02] focus:border-[#FF6600]/40 focus:ring-0 font-black text-base px-12 placeholder:text-slate-800 uppercase tracking-widest italic transition-all" />
                                        </div>
                                        <div className="space-y-6">
                                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 ml-6 italic">CLASSIFICATION STRATÉGIQUE</label>
                                            <div className="relative group/select">
                                                <select
                                                    name="raison"
                                                    value={form.raison}
                                                    onChange={handleChange}
                                                    className="w-full h-24 rounded-[2.5rem] border-4 border-white/5 bg-white/[0.02] px-12 text-base font-black italic focus:outline-none focus:border-[#FF6600]/40 shadow-inner appearance-none uppercase tracking-widest text-white transition-all cursor-pointer"
                                                >
                                                    <option value="" className="bg-[#0A0D14] text-slate-500 italic">SÉLECTIONNER CATEGORIE...</option>
                                                    {CONTACT_REASONS.map(r => <option key={r} value={r} className="bg-[#0A0D14] text-white">{r.toUpperCase()}</option>)}
                                                </select>
                                                <div className="absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none text-[#FF6600] group-hover/select:scale-125 transition-transform">
                                                    <ChevronDown className="size-7" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6 relative z-10">
                                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 ml-6 italic">EXPOSÉ DES MOTIFS / REQUÊTE PRÉCISE *</label>
                                        <textarea
                                            name="message"
                                            value={form.message}
                                            onChange={handleChange}
                                            placeholder="DÉTAILLEZ VOTRE REQUÊTE AVEC PRÉCISION STRATÉGIQUE..."
                                            className="w-full min-h-[300px] rounded-[3rem] border-4 border-white/5 bg-white/[0.02] px-12 py-12 text-base font-black italic focus:outline-none focus:border-[#FF6600]/40 shadow-inner placeholder:text-slate-800 resize-none leading-relaxed transition-all uppercase tracking-widest"
                                        />
                                    </div>

                                    <Button type="submit" isLoading={isSending} className="w-full h-28 rounded-[3rem] font-black uppercase tracking-[0.5em] text-sm gap-10 shadow-3xl shadow-[#FF6600]/20 relative overflow-hidden group/btn hover:scale-105 active:scale-95 transition-all border-4 border-[#FF6600] bg-[#FF6600] text-white italic">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_2s_infinite]" />
                                        <div className="relative z-10 flex items-center justify-center gap-10">
                                            {!isSending && <Send className="size-8 group-hover/btn:-translate-y-2 group-hover/btn:translate-x-2 transition-transform" />}
                                            <span>{isSending ? 'TRANSMISSION CHIFFRÉE...' : 'SOUMETTRE LE DOSSIER'}</span>
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
