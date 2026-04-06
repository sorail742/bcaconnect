import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
    Mail, Phone, MapPin, Send, CheckCircle2,
    ArrowRight, ChevronDown, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '../context/LanguageContext';

const ContactPage = () => {
    const { t } = useLanguage();
    
    const CONTACT_REASONS = [
        t('formReason'),
        'Support technique',
        'Litige / Réclamation',
        'Demande de partenariat',
        'Devenir fournisseur',
        'Questions sur BCA Connect',
        'Autre',
    ];

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
            return toast.error(t('lang') === 'FR' ? "Veuillez renseigner les champs obligatoires." : "Please fill in all required fields.");
        }
        setIsSending(true);
        await new Promise(r => setTimeout(r, 1500));
        setIsSending(false);
        setSent(true);
        toast.success(t('messageSuccess'));
    };

    return (
        <div className="bg-white dark:bg-[#0A0D14] min-h-screen text-slate-900 dark:text-foreground font-jakarta">
            {/* ══ PREMIUM HERO ══ */}
            <section className="relative pt-44 pb-24 overflow-hidden text-center group">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 size-[60rem] bg-[#FF6600]/5 rounded-full blur-[200px] mix-blend-screen pointer-events-none group-hover:scale-110 transition-transform duration-[4s]" />
                <div className="absolute inset-0 opacity-[0.02]" style={{
                    backgroundImage: `linear-gradient(to right, #64748b 1px, transparent 1px), linear-gradient(to bottom, #64748b 1px, transparent 1px)`,
                    backgroundSize: '4rem 4rem'
                }} />

                <div className="relative z-10 max-w-7xl mx-auto px-6 space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000">
                    <div className="flex flex-col items-center gap-6">
                        <div className="flex items-center gap-4">
                            <div className="size-2 rounded-full bg-[#FF6600] animate-pulse shadow-[0_0_15px_rgba(255,102,0,0.5)]" />
                            <span className="text-[10px] font-black text-[#FF6600] uppercase   leading-none pt-0.5">{t('contact').toUpperCase()} • BCA CONNECT</span>
                        </div>
                        <h1 className="text-2xl md:text-2xl lg:text-xl font-semibold  tracking-tighter text-slate-900 dark:text-foreground uppercase leading-[0.85] mb-4">
                            {t('contactHero').split(' ').slice(0, -2).join(' ')} <br /> <span className="text-[#FF6600]">{t('contactHero').split(' ').slice(-2).join(' ')}</span>
                        </h1>
                    </div>
                    <p className="text-muted-foreground font-bold uppercase  text-sm leading-relaxed  border-x-4 border-[#FF6600]/20 px-8 max-w-4xl mx-auto opacity-80">
                        {t('contactSubHero')}
                    </p>
                </div>
            </section>

            {/* ══ CONTACT CONTENT ══ */}
            <section className="max-w-7xl mx-auto px-6 md:px-8 py-16 pb-32">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Sidebar Infos */}
                    <div className="lg:col-span-4 space-y-12">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="size-2 rounded-full bg-[#FF6600]" />
                                <span className="text-[10px] font-black text-[#FF6600] uppercase tracking-widest">{t('contactInfo')}</span>
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-foreground tracking-tighter uppercase ">{t('whereToFind')}</h2>
                        </div>

                        <div className="space-y-6">
                            {[
                                { icon: Mail, label: "EMAIL", value: "support@bcaconnect.gn", sub: t('lang') === 'FR' ? "Réponse sous 24h" : "Reply within 24h" },
                                { icon: Phone, label: t('formPhone').toUpperCase(), value: "+224 621 00 00 00", sub: t('lang') === 'FR' ? "Lun-Sam, 8h-18h" : "Mon-Sat, 8am-6pm" },
                                { icon: MapPin, label: "ADRESSE", value: "Kaloum, Conakry", sub: "Guinée" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-8 p-8 rounded-3xl bg-white dark:bg-[#0F1219] border-2 border-slate-100 dark:border-foreground/5 hover:border-[#FF6600]/40 transition-all group shadow-sm hover:shadow-xl duration-500 relative overflow-hidden">
                                    <div className="size-10 rounded-xl bg-[#FF6600]/5 border-2 border-[#FF6600]/10 flex items-center justify-center shrink-0 group-hover:bg-[#FF6600] group-hover:text-foreground transition-all duration-500">
                                        <item.icon className="size-5 text-[#FF6600] group-hover:text-foreground" />
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <p className="text-[9px] font-semibold text-muted-foreground/80  mb-2">{item.label}</p>
                                        <p className="font-black text-slate-900 dark:text-foreground  text-lg tracking-tighter leading-none">{item.value}</p>
                                        <p className="text-[9px] text-[#FF6600] font-black mt-2 uppercase  opacity-80">{item.sub}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-8 rounded-3xl bg-slate-900 dark:bg-foreground/5 text-foreground space-y-6 relative overflow-hidden group shadow-2xl">
                             <div className="flex items-center gap-4">
                                <Sparkles className="size-6 text-[#FF6600]" />
                                <span className="text-[10px] font-black uppercase tracking-widest">{t('liveSupport')}</span>
                             </div>
                             <p className="text-xs font-medium leading-relaxed opacity-70  border-l-4 border-[#FF6600] pl-6">
                                {t('liveSupportDesc')}
                             </p>
                        </div>
                    </div>

                    {/* Form Hub */}
                    <div className="lg:col-span-8">
                        {sent ? (
                            <div className="h-full flex flex-col items-center justify-center gap-8 text-center p-24 rounded-3xl bg-white dark:bg-[#0F1219] border-2 border-emerald-500/20 shadow-xl animate-in zoom-in duration-1000">
                                <div className="size-16 rounded-2xl bg-emerald-500 text-foreground flex items-center justify-center shadow-xl shadow-emerald-500/20 relative z-10 animate-bounce">
                                    <CheckCircle2 className="size-12" />
                                </div>
                                <div className="space-y-6">
                                    <h3 className="text-2xl md:text-xl font-semibold  tracking-tighter text-slate-900 dark:text-foreground uppercase leading-none">{t('messageSent').split(' ')[0]} <span className="text-emerald-500 not-">{t('messageSent').split(' ')[1]}</span></h3>
                                    <p className="text-muted-foreground/80 font-bold uppercase  text-[10px] max-w-lg mx-auto leading-relaxed  border-l-8 border-emerald-500/20 pl-10 text-left opacity-80">
                                        {t('messageSuccess')}
                                    </p>
                                </div>
                                <Button onClick={() => setSent(false)} className="h-12 px-14 rounded-2xl font-semibold text-[10px] bg-slate-900 text-foreground hover:scale-105 active:scale-95 transition-all  border-0">
                                    {t('lang') === 'FR' ? "NOUVEAU MESSAGE" : "NEW MESSAGE"}
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="p-8 md:p-20 rounded-3xl bg-white dark:bg-[#0F1219] border-2 border-slate-100 dark:border-foreground/5 space-y-12 shadow-xl hover:shadow-2xl transition-all duration-1000 relative overflow-hidden group/form">
                                <div className="absolute top-0 right-0 size-[35rem] bg-[#FF6600]/5 rounded-full blur-[120px] -mr-32 -mt-24 opacity-40 group-hover/form:opacity-100 transition-opacity duration-1000" />
                                
                                <div className="space-y-4">
                                    <h3 className="text-2xl font-black  tracking-tighter text-slate-900 dark:text-foreground uppercase leading-none">{t('leaveMessage').split(' ').slice(0, -1).join(' ')} <span className="text-[#FF6600] not-">{t('leaveMessage').split(' ').slice(-1)}</span></h3>
                                    <p className="text-muted-foreground/80 text-[10px] font-bold uppercase tracking-widest  leading-none opacity-60">{t('lang') === 'FR' ? "Notre équipe reviendra vers vous dans les plus brefs délais." : "Our team will get back to you as soon as possible."}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[9px] font-semibold text-muted-foreground/80 ml-4">{t('formName')} *</label>
                                        <Input name="nom" value={form.nom} onChange={handleChange} placeholder="Mamadou Diallo" className="h-14 rounded-2xl border-2 border-slate-100 dark:border-foreground/5 bg-slate-50 dark:bg-white/[0.01] focus:border-[#FF6600]/40 focus:ring-0 font-bold text-sm px-8 placeholder:text-slate-300  transition-all" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[9px] font-semibold text-muted-foreground/80 ml-4">{t('formEmail')} *</label>
                                        <Input name="email" type="email" value={form.email} onChange={handleChange} placeholder="votre@email.com" className="h-14 rounded-2xl border-2 border-slate-100 dark:border-foreground/5 bg-slate-50 dark:bg-white/[0.01] focus:border-[#FF6600]/40 focus:ring-0 font-bold text-sm px-8 placeholder:text-slate-300  transition-all" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[9px] font-semibold text-muted-foreground/80 ml-4">{t('formPhone')}</label>
                                        <Input name="telephone" value={form.telephone} onChange={handleChange} placeholder="+224 6XX XX XX XX" className="h-14 rounded-2xl border-2 border-slate-100 dark:border-foreground/5 bg-slate-50 dark:bg-white/[0.01] focus:border-[#FF6600]/40 focus:ring-0 font-bold text-sm px-8 placeholder:text-slate-300  transition-all" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[9px] font-semibold text-muted-foreground/80 ml-4">{t('formReason')}</label>
                                        <div className="relative group/select">
                                            <select
                                                name="raison"
                                                value={form.raison}
                                                onChange={handleChange}
                                                className="w-full h-14 rounded-2xl border-2 border-slate-100 dark:border-foreground/5 bg-slate-50 dark:bg-white/[0.02] px-8 text-sm font-bold  focus:outline-none focus:border-[#FF6600]/40 shadow-sm appearance-none tracking-widest text-slate-900 dark:text-foreground transition-all cursor-pointer"
                                            >
                                                <option value="" className="bg-white dark:bg-[#0A0D14] text-muted-foreground/80 ">{t('lang') === 'FR' ? "Sélectionner..." : "Select..."}</option>
                                                {CONTACT_REASONS.map(r => <option key={r} value={r} className="bg-white dark:bg-[#0A0D14] text-slate-900 dark:text-foreground">{r}</option>)}
                                            </select>
                                            <ChevronDown className="absolute right-8 top-1/2 -translate-y-1/2 size-5 text-slate-300 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[9px] font-semibold text-muted-foreground/80 ml-4">{t('formMessage')} *</label>
                                    <textarea
                                        name="message"
                                        value={form.message}
                                        onChange={handleChange}
                                        placeholder={t('formPlaceholderMessage')}
                                        className="w-full min-h-[160px] rounded-2xl border-2 border-slate-100 dark:border-foreground/5 bg-slate-50 dark:bg-white/[0.01] px-8 py-6 text-sm font-bold  focus:outline-none focus:border-[#FF6600]/40 shadow-sm placeholder:text-slate-300 resize-none leading-relaxed transition-all"
                                    />
                                </div>

                                <Button type="submit" isLoading={isSending} className="w-full h-14 rounded-2xl font-semibold text-[10px] bg-[#FF6600] text-foreground shadow-xl shadow-[#FF6600]/20 hover:scale-105 active:scale-95 transition-all border-0  mt-8">
                                    <div className="relative z-10 flex items-center justify-center gap-4">
                                        {!isSending && <Send className="size-5 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />}
                                        <span>{isSending ? t('sending') : t('sendMessage')}</span>
                                    </div>
                                </Button>
                            </form>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ContactPage;
