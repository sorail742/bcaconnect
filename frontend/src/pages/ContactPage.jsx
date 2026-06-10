import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
    Mail, Phone, MapPin, Send, CheckCircle2,
    ChevronDown, Sparkles
} from 'lucide-react';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import { useLanguage } from '../context/useLanguage';
import supportService from '../services/supportService';

const ContactPage = () => {
    const { t, lang } = useLanguage();
    
    const CONTACT_REASONS = [
        t('formReason'),
        'Support technique',
        'Litige / Réclamation',
        'Demande de partenariat',
        // 'Devenir fournisseur', // Removed per user request
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
            return toast.error(lang === 'FR' ? "Veuillez renseigner les champs obligatoires." : "Please fill in all required fields.");
        }
        setIsSending(true);
        try {
            await supportService.createTicket({
                sujet: form.raison || "Demande de contact",
                description: `Message de ${form.nom} (${form.telephone}): ${form.message}`,
                type_sav: form.raison === 'Litige / Réclamation' ? 'litige' : 'assistance',
                priorite: 'moyenne'
            });
            setSent(true);
            toast.success(t('messageSuccess'));
        } catch (error) {
            toast.error(lang === 'FR' ? "Erreur lors de l'envoi du message." : "Error sending message.");
            console.error(error);
        } finally {
            setIsSending(false);
        }
    };

    const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

    return (
        <div className="bg-slate-50 dark:bg-[#0A0D14] min-h-screen font-sans">
            {/* ══ HERO ══ */}
            <section className="relative pt-32 pb-20 overflow-hidden bg-white dark:bg-[#0F1219] border-b border-border">
                <div className="absolute inset-0 bg-gradient-to-b from-[#FF6600]/5 to-transparent pointer-events-none" />
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-5xl mx-auto px-6 text-center space-y-6 relative z-10"
                >
                    <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-[#FF6600]/10 border border-[#FF6600]/20 text-[#FF6600] font-bold text-sm mb-4">
                        <Phone className="size-4" /> {t('contact').toUpperCase()}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                        Discutons de <br className="hidden md:block"/>
                        <span className="text-[#FF6600]">votre projet</span> 
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
                        {t('contactSubHero')}
                    </p>
                </motion.div>
            </section>

            {/* ══ CONTENT ══ */}
            <section className="max-w-7xl mx-auto px-6 py-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    
                    {/* Sidebar Infos */}
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="lg:col-span-4 space-y-8"
                    >
                        <motion.div variants={itemVariants} className="space-y-6">
                            {[
                                { icon: Mail, label: "EMAIL", value: "support@bcaconnect.gn", sub: lang === 'FR' ? "Réponse sous 24h" : "Reply within 24h" },
                                { icon: Phone, label: "TÉLÉPHONE", value: "+224 621 00 00 00", sub: lang === 'FR' ? "Lun-Sam, 8h-18h" : "Mon-Sat, 8am-6pm" },
                                { icon: MapPin, label: "ADRESSE", value: "Kaloum, Conakry", sub: "Guinée" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-5 p-6 rounded-2xl bg-white dark:bg-slate-800 border border-border hover:shadow-md hover:border-[#FF6600]/40 transition-all group">
                                    <div className="size-12 rounded-xl bg-slate-50 dark:bg-slate-700 flex items-center justify-center shrink-0 border border-black/5 dark:border-white/5 group-hover:bg-[#FF6600] transition-colors">
                                        <item.icon className="size-5 text-[#FF6600] group-hover:text-white transition-colors" />
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <p className="text-xs font-semibold text-slate-500 mb-1 tracking-wider">{item.label}</p>
                                        <p className="text-lg font-bold text-slate-900 dark:text-white">{item.value}</p>
                                        <p className="text-xs text-[#FF6600] font-medium mt-1">{item.sub}</p>
                                    </div>
                                </div>
                            ))}
                        </motion.div>

                        <motion.div variants={itemVariants} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-white space-y-4 shadow-xl">
                            <div className="flex items-center gap-3">
                                <Sparkles className="size-5 text-[#FF6600]" />
                                <span className="text-sm font-bold tracking-wider">SUPPORT PRIORITAIRE</span>
                            </div>
                            <p className="text-sm text-slate-300 leading-relaxed font-medium">
                                Les utilisateurs disposant d'un compte professionnel bénéficient d'un traitement express de leurs requêtes (H24).
                            </p>
                        </motion.div>
                    </motion.div>

                    {/* Form Hub */}
                    <div className="lg:col-span-8">
                        {sent ? (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="h-full flex flex-col items-center justify-center gap-6 text-center p-16 rounded-3xl bg-white dark:bg-slate-800 border border-border shadow-md"
                            >
                                <div className="size-20 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                                    <CheckCircle2 className="size-10" />
                                </div>
                                <h3 className="text-3xl font-bold text-slate-900 dark:text-white">Message Envoyé !</h3>
                                <p className="text-base text-slate-500 max-w-sm">
                                    Notre équipe a bien reçu votre demande et vous répondra dans les plus brefs délais.
                                </p>
                                <Button onClick={() => setSent(false)} className="mt-6 px-10 h-12 bg-slate-900 text-white hover:bg-slate-800 rounded-xl">
                                    Nouveau Message
                                </Button>
                            </motion.div>
                        ) : (
                            <motion.form 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                onSubmit={handleSubmit} 
                                className="p-8 md:p-12 rounded-3xl bg-white dark:bg-[#0F1219] border border-border space-y-8 shadow-xl"
                            >
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Laissez-nous un message</h3>
                                    <p className="text-sm text-slate-500">Remplissez les champs ci-dessous pour contacter le bon département.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nom complet *</label>
                                        <Input name="nom" value={form.nom} onChange={handleChange} placeholder="Mamadou Diallo" className="h-12 bg-transparent" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Adresse Email *</label>
                                        <Input name="email" type="email" value={form.email} onChange={handleChange} placeholder="votre@email.com" className="h-12 bg-transparent" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Téléphone (Optionnel)</label>
                                        <Input name="telephone" value={form.telephone} onChange={handleChange} placeholder="+224 6XX XX XX XX" className="h-12 bg-transparent" />
                                    </div>
                                    <div className={cn(
                                         "h-16 px-6 rounded-2xl flex items-center justify-center shadow-lg border border-border bg-white transition-all duration-500 hover:scale-105 hover:shadow-primary/20",
                                         "overflow-hidden mb-4"
                                     )}>
                                        <div className="relative w-full">
                                            <select
                                                name="raison"
                                                value={form.raison}
                                                onChange={handleChange}
                                                className="w-full h-12 rounded-xl border border-border bg-slate-50 dark:bg-slate-800/50 px-4 text-sm font-medium focus:outline-none focus:border-[#FF6600]/40 appearance-none text-slate-900 dark:text-white transition-all cursor-pointer"
                                            >
                                                <option value="">Sélectionner une option...</option>
                                                {CONTACT_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Votre message *</label>
                                    <textarea
                                        name="message"
                                        value={form.message}
                                        onChange={handleChange}
                                        placeholder="Comment pouvons-nous vous aider aujourd'hui ?"
                                        className="w-full min-h-[140px] rounded-xl border border-border bg-slate-50 dark:bg-slate-800/50 p-4 text-sm font-medium focus:outline-none focus:border-[#FF6600]/40 text-slate-900 dark:text-white placeholder:text-slate-400 resize-none transition-all"
                                    />
                                </div>

                                <Button type="submit" isLoading={isSending} className="w-full h-14 bg-[#FF6600] text-white rounded-xl text-base font-bold hover:shadow-lg hover:shadow-[#FF6600]/20 transition-all">
                                    <Send className="size-5 mr-2" />
                                    {isSending ? t('sending') : t('sendMessage')}
                                </Button>
                            </motion.form>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ContactPage;
