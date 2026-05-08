import React from 'react';
import { BadgeCheck, Award, ShieldCheck, Sparkles, ShieldAlert, FileText } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const TermsPage = () => {
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
                            <span className="text-[10px] font-black text-[#FF6600] uppercase   leading-none pt-0.5">{lang === 'FR' ? "CADRE JURIDIQUE" : "LEGAL FRAMEWORK"}</span>
                        </div>
                        <h1 className="text-2xl md:text-2xl lg:text-xl font-semibold  tracking-tighter text-slate-900 dark:text-foreground uppercase leading-none mb-4">
                            {t('termsTitle').split(' ').slice(0, -1).join(' ')} <br /> <span className="text-[#FF6600]">{t('termsTitle').split(' ').slice(-1)}</span>
                        </h1>
                        <div className="w-24 h-1 bg-slate-100 dark:bg-foreground/10 rounded-full mx-auto" />
                        <p className="text-[10px] text-muted-foreground/80 font-bold uppercase tracking-widest  opacity-60 mt-4">{t('legalLastUpdate').toUpperCase()} : 21 MARS 2026</p>
                    </div>
                </div>

                {/* Trust Pillars */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { icon: BadgeCheck, label: lang === 'FR' ? "QUALITÉ GARANTIE" : "GUARANTEED QUALITY", desc: lang === 'FR' ? "Vérification systématique des vendeurs." : "Systematic verification of sellers.", color: "text-[#FF6600]", bg: "bg-[#FF6600]/10" },
                        { icon: Award, label: lang === 'FR' ? "ÉTHIQUE COMMERCIALE" : "BUSINESS ETHICS", desc: lang === 'FR' ? "Tolérance zéro pour la fraude." : "Zero tolerance for fraud.", color: "text-blue-500", bg: "bg-blue-500/10" },
                        { icon: ShieldCheck, label: lang === 'FR' ? "TRANSACTIONS SÛRES" : "SAFE TRANSACTIONS", desc: lang === 'FR' ? "Système de séquestre protégeant vos fonds." : "Escrow system protecting your funds.", color: "text-emerald-500", bg: "bg-emerald-500/10" },
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
                                <FileText className="size-4" />
                            </div>
                            <h2 className="text-xl font-black  text-slate-900 dark:text-foreground uppercase tracking-tighter">1. {lang === 'FR' ? "Objet du Service" : "Service Object"}</h2>
                        </div>
                        <div className="text-muted-foreground font-bold uppercase  text-[10px] leading-relaxed  border-l-4 border-[#FF6600]/20 pl-8 opacity-80">
                            {lang === 'FR' ? "BCA Connect est une plateforme de mise en relation facilitant les transactions commerciales sécurisées." : "BCA Connect is a connecting platform facilitating secure commercial transactions."}
                        </div>
                     </section>

                     <section className="space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="size-8 rounded-xl bg-slate-50 dark:bg-foreground/5 border-2 border-slate-50 dark:border-foreground/5 flex items-center justify-center text-blue-500">
                                <ShieldCheck className="size-4" />
                            </div>
                            <h2 className="text-xl font-black  text-slate-900 dark:text-foreground uppercase tracking-tighter">2. {lang === 'FR' ? "Engagements" : "Commitments"}</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pl-8">
                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-[#FF6600] uppercase tracking-widest">{t('roleSeller').split(' ')[0]}</p>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest  leading-relaxed">
                                    {lang === 'FR' ? "Garantir l'authenticité des produits." : "Guarantee product authenticity."}
                                </p>
                            </div>
                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-[#FF6600] uppercase tracking-widest">{t('roleBuyer').split(' ')[0]}</p>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest  leading-relaxed">
                                    {lang === 'FR' ? "S'engager à payer le prix convenu." : "Commit to pay the agreed price."}
                                </p>
                            </div>
                        </div>
                     </section>
                </div>
            </div>
        </div>
    );
};

export default TermsPage;
