import React from 'react';
import { Shield, Lock, Eye, Sparkles, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const PrivacyPage = () => {
    const { t, lang } = useLanguage();

    return (
        <div className="bg-white dark:bg-[#0A0D14] min-h-screen text-slate-900 dark:text-foreground font-jakarta">
            <div className="max-w-5xl mx-auto px-6 pt-44 pb-32 space-y-24 animate-in fade-in slide-in-from-bottom-12 duration-1000">
                
                {/* Header */}
                <div className="text-center space-y-8 py-16 relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 size-[50rem] bg-[#FF6600]/5 rounded-full blur-[150px] -z-10 mix-blend-screen pointer-events-none" />
                    <div className="flex flex-col items-center gap-6">
                        <div className="flex items-center gap-4">
                            <div className="size-2 rounded-full bg-[#FF6600] animate-pulse shadow-[0_0_15px_rgba(255,102,0,0.5)]" />
                            <span className="text-[10px] font-black text-[#FF6600] uppercase   leading-none pt-0.5">{lang === 'FR' ? "PROTECTION DES DONNÉES" : "DATA PROTECTION"}</span>
                        </div>
                        <h1 className="text-2xl md:text-2xl lg:text-xl font-semibold  tracking-tighter text-slate-900 dark:text-foreground uppercase leading-none mb-4">
                            {t('privacyTitle').split(' ').slice(0, -1).join(' ')} <br /> <span className="text-[#FF6600]">{t('privacyTitle').split(' ').slice(-1)}</span>
                        </h1>
                        <div className="w-24 h-1 bg-slate-100 dark:bg-foreground/10 rounded-full mx-auto" />
                        <p className="text-[10px] text-muted-foreground/80 font-bold uppercase tracking-widest  opacity-60 mt-4">{t('legalLastUpdate').toUpperCase()} : 21 MARS 2026</p>
                    </div>
                </div>

                {/* Highlights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { icon: Lock, label: lang === 'FR' ? "CHIFFREMENT TOTAL" : "FULL ENCRYPTION", desc: lang === 'FR' ? "Vos données sont cryptées." : "Your data is encrypted.", color: "text-[#FF6600]", bg: "bg-[#FF6600]/10" },
                        { icon: Eye, label: "ZÉRO PARTAGE", desc: lang === 'FR' ? "Pas de tiers impliqués." : "No third-party sharing.", color: "text-blue-500", bg: "bg-blue-500/10" },
                        { icon: Shield, label: lang === 'FR' ? "VOTRE CONTRÔLE" : "YOUR CONTROL", desc: lang === 'FR' ? "Contrôle total sur vos données." : "Total control over your data.", color: "text-emerald-500", bg: "bg-emerald-500/10" },
                    ].map((item, i) => (
                        <div key={i} className="p-8 rounded-3xl bg-white dark:bg-[#0F1219] border-2 border-slate-50 dark:border-foreground/5 space-y-6 shadow-xl hover:border-[#FF6600]/20 transition-all duration-500">
                            <div className={`size-10 rounded-xl ${item.bg} flex items-center justify-center ${item.color}`}>
                                <item.icon className="size-5" />
                            </div>
                            <h3 className="text-lg font-black  text-slate-900 dark:text-foreground uppercase tracking-tighter">{item.label}</h3>
                            <p className="text-[10px] text-muted-foreground/80 font-bold uppercase tracking-widest leading-relaxed  opacity-80">{item.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Content */}
                <div className="space-y-16 py-12">
                     <section className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="size-8 rounded-xl bg-slate-50 dark:bg-foreground/5 border-2 border-slate-50 dark:border-foreground/5 flex items-center justify-center text-[#FF6600]">
                                <Sparkles className="size-4" />
                            </div>
                            <h2 className="text-xl font-black  text-slate-900 dark:text-foreground uppercase tracking-tighter">1. {lang === 'FR' ? "Collecte des Informations" : "Information Collection"}</h2>
                        </div>
                        <div className="text-muted-foreground font-bold uppercase  text-[10px] leading-relaxed  border-l-4 border-[#FF6600]/20 pl-8 opacity-80">
                            {lang === 'FR' ? "Nous collectons uniquement les informations nécessaires au bon fonctionnement de vos transactions." : "We only collect information necessary for the smooth operation of your transactions."}
                        </div>
                     </section>

                     <section className="space-y-6 text-left">
                        <div className="flex items-center gap-4">
                            <div className="size-8 rounded-xl bg-slate-50 dark:bg-foreground/5 border-2 border-slate-50 dark:border-foreground/5 flex items-center justify-center text-emerald-500">
                                <ShieldCheck className="size-4" />
                            </div>
                            <h2 className="text-xl font-black  text-slate-900 dark:text-foreground uppercase tracking-tighter">2. {lang === 'FR' ? "Sécurité Bancaire" : "Bank-Grade Security"}</h2>
                        </div>
                        <div className="text-muted-foreground font-bold uppercase  text-[10px] leading-relaxed  border-l-4 border-emerald-500/20 pl-8 opacity-80">
                            {lang === 'FR' ? "Toutes les transactions financières sont chiffrées." : "All financial transactions are encrypted."}
                        </div>
                     </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPage;
