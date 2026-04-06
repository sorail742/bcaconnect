import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ChevronDown, ChevronUp, Search, ArrowRight, MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils';
import { useLanguage } from '../context/LanguageContext';

const FaqItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className={cn(
            "bg-white dark:bg-[#0F1219] border-2 transition-all duration-700 shadow-xl group overflow-hidden rounded-3xl",
            isOpen ? "border-[#FF6600]/40 shadow-2xl shadow-[#FF6600]/10 bg-white/[0.04]" : "border-slate-100 dark:border-foreground/5 hover:border-slate-200 dark:border-foreground/10"
        )}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-8 text-left gap-8 hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-colors group/btn"
            >
                <span className="text-lg md:text-xl font-black text-slate-900 dark:text-foreground  tracking-tighter uppercase leading-tight group-hover/btn:translate-x-2 transition-transform duration-700">{question}</span>
                <div className={cn(
                    "size-8 rounded-xl flex items-center justify-center shrink-0 border-2 transition-all duration-700 shadow-lg",
                    isOpen ? "bg-[#FF6600] border-[#FF6600] text-slate-900 dark:text-foreground rotate-180" : "bg-slate-900/5 dark:bg-foreground/5 border-slate-100 dark:border-foreground/10 text-muted-foreground/80"
                )}>
                    {isOpen ? <ChevronUp className="size-6" /> : <ChevronDown className="size-6" />}
                </div>
            </button>
            <div className={cn(
                "grid transition-all duration-700 ease-in-out",
                isOpen ? "grid-rows-[1fr] opacity-100 pb-10" : "grid-rows-[0fr] opacity-0"
            )}>
                <div className="overflow-hidden">
                    <div className="px-10 pb-8 text-muted-foreground font-bold uppercase  text-[10px] leading-relaxed  border-l-4 border-l-[#FF6600]/20 ml-8 pr-12">
                        {answer}
                    </div>
                </div>
            </div>
        </div>
    );
};

const FaqPage = () => {
    const { t, lang } = useLanguage();
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState(null);

    const FAQ_CATEGORIES = [
        {
            label: lang === 'FR' ? 'Inscription & Compte' : 'Registration & Account',
            icon: '🔐',
            questions: [
                { q: lang === 'FR' ? "Comment créer un compte ?" : "How to create an account?", a: lang === 'FR' ? "Rendez-vous sur notre page d'inscription. Choisissez votre rôle (Acheteur, Vendeur ou Livreur), remplissez le formulaire et validez." : "Go to our registration page. Choose your role (Buyer, Seller or Carrier), fill out the form and validate." },
                { q: lang === 'FR' ? "J'ai oublié mon mot de passe ?" : "Forgotten my password?", a: lang === 'FR' ? "Cliquez sur 'Mot de passe oublié' sur la page de connexion pour le réinitialiser via votre email." : "Click on 'Forgot password' on the login page to reset it via your email." },
            ]
        },
        {
            label: lang === 'FR' ? 'Paiements' : 'Payments',
            icon: '💳',
            questions: [
                { q: lang === 'FR' ? "Quels moyens de paiement ?" : "Which payment methods?", a: lang === 'FR' ? "BCA Connect accepte le Mobile Money (Orange Money, MTN Money) et le portefeuille virtuel BCA." : "BCA Connect accepts Mobile Money (Orange Money, MTN Money) and the BCA virtual wallet." },
                { q: lang === 'FR' ? "Le système de séquestre ?" : "The escrow system?", a: lang === 'FR' ? "Les fonds sont bloqués jusqu'à confirmation de livraison pour protéger acheteur et vendeur." : "Funds are held until delivery confirmation to protect both buyer and seller." },
            ]
        }
    ];

    const filteredCategories = FAQ_CATEGORIES
        .map(cat => ({
            ...cat,
            questions: cat.questions.filter(q =>
                !search || q.q.toLowerCase().includes(search.toLowerCase()) || q.a.toLowerCase().includes(search.toLowerCase())
            )
        }))
        .filter(cat => (!activeCategory || cat.label === activeCategory) && cat.questions.length > 0);

    return (
        <div className="bg-white dark:bg-[#0A0D14] min-h-screen text-slate-900 dark:text-foreground font-jakarta">
            {/* ══ PREMIUM HERO ══ */}
            <section className="relative pt-44 pb-24 overflow-hidden text-center group">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 size-[65rem] bg-[#FF6600]/5 rounded-full blur-[220px] mix-blend-screen pointer-events-none group-hover:scale-110 transition-transform duration-[4s]" />
                <div className="absolute inset-0 opacity-[0.02]" style={{
                    backgroundImage: `linear-gradient(to right, #64748b 1px, transparent 1px), linear-gradient(to bottom, #64748b 1px, transparent 1px)`,
                    backgroundSize: '4rem 4rem'
                }} />

                <div className="relative z-10 max-w-7xl mx-auto px-6 space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000">
                    <div className="flex flex-col items-center gap-6">
                        <div className="flex items-center gap-4">
                            <div className="size-2 rounded-full bg-[#FF6600] animate-pulse shadow-[0_0_15px_rgba(255,102,0,0.5)]" />
                            <span className="text-[10px] font-black text-[#FF6600] uppercase   leading-none pt-0.5">{t('faq').toUpperCase()} • BCA CONNECT</span>
                        </div>
                        <h1 className="text-2xl md:text-2xl lg:text-xl font-semibold  tracking-tighter text-slate-900 dark:text-foreground uppercase leading-[0.85] mb-4">
                            {t('faqHero').split(' ').slice(0, -1).join(' ')} <br /> <span className="text-[#FF6600]">{t('faqHero').split(' ').slice(-1)}</span>
                        </h1>
                    </div>

                    {/* Search Hub */}
                    <div className="relative max-w-2xl mx-auto group/search">
                        <div className="absolute -inset-2 bg-[#FF6600]/10 rounded-2xl blur-xl opacity-0 group-focus-within/search:opacity-100 transition-opacity duration-1000" />
                        <div className="relative bg-slate-900/[0.03] dark:bg-white/[0.02] border-2 border-slate-200 dark:border-foreground/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-3xl">
                            <Search className="absolute left-10 top-1/2 -translate-y-1/2 size-8 text-muted-foreground/80 group-focus-within/search:text-[#FF6600] transition-colors" />
                            <input
                                type="text"
                                placeholder={t('searchPlaceholder').toUpperCase()}
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full h-12 pl-24 pr-12 bg-transparent border-none text-slate-900 dark:text-foreground placeholder:text-muted-foreground/80 font-bold text-sm  tracking-widest focus:ring-0 uppercase transition-all"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-6 md:px-8 py-24 space-y-28">
                {/* Categories */}
                <div className="flex flex-wrap items-center justify-center gap-8">
                    <button
                        onClick={() => setActiveCategory(null)}
                        className={cn(
                            "h-11 px-10 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border-2  leading-none pt-1 shadow-lg",
                            !activeCategory
                                ? "bg-[#FF6600] text-slate-900 dark:text-foreground border-[#FF6600] shadow-[#FF6600]/20 scale-105"
                                : "bg-slate-900/5 dark:bg-foreground/5 border-slate-200 dark:border-foreground/5 text-muted-foreground/80 hover:border-[#FF6600]/40 hover:text-slate-900 dark:text-foreground"
                        )}
                    >
                        {lang === 'FR' ? "ACCÈS TOTAL" : "ALL TOPICS"}
                    </button>
                    {FAQ_CATEGORIES.map(cat => (
                        <button
                            key={cat.label}
                            onClick={() => setActiveCategory(cat.label === activeCategory ? null : cat.label)}
                            className={cn(
                                "h-12 px-10 rounded-2xl font-bold text-[11px] uppercase  transition-all border-2 flex items-center gap-6  leading-none pt-1",
                                activeCategory === cat.label
                                    ? "bg-[#FF6600] text-slate-900 dark:text-foreground border-[#FF6600] shadow-3xl shadow-[#FF6600]/30 scale-110"
                                    : "bg-slate-900/5 dark:bg-foreground/5 border-slate-200 dark:border-foreground/5 text-muted-foreground hover:border-[#FF6600]/40 hover:text-slate-900 dark:text-foreground"
                            )}
                        >
                            <span className="text-2xl">{cat.icon}</span>
                            {cat.label}
                        </button>
                    ))}
                </div>

                <div className="space-y-32">
                    {filteredCategories.length > 0 ? (
                        filteredCategories.map(cat => (
                            <div key={cat.label} className="space-y-16 animate-in fade-in slide-in-from-bottom-12 duration-1000">
                                <div className="flex items-center gap-8 group/title">
                                    <div className="size-2 bg-[#FF6600] rounded-full opacity-40 shadow-[0_0_15px_rgba(255,102,0,0.5)]" />
                                    <h2 className="text-[10px] font-black uppercase  text-[#FF6600] flex items-center gap-6  leading-none pt-1">
                                        <span className="text-2xl">{cat.icon}</span> {cat.label}
                                    </h2>
                                    <div className="flex-1 h-[1px] bg-slate-100" />
                                </div>
                                <div className="grid grid-cols-1 gap-8">
                                    {cat.questions.map((item, i) => (
                                        <FaqItem key={i} question={item.q} answer={item.a} />
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-24 text-center space-y-10 bg-white dark:bg-[#0A0D14] border-4 border-dashed border-slate-100 dark:border-foreground/5 rounded-3xl">
                            <div className="size-16 rounded-3xl bg-slate-50 dark:bg-foreground/5 flex items-center justify-center mx-auto border-2 border-dashed border-slate-200 dark:border-foreground/10">
                                <Search className="size-10 text-slate-300 animate-pulse" />
                            </div>
                            <div className="space-y-4">
                                <p className="text-2xl font-black  tracking-tighter text-slate-900 dark:text-foreground uppercase leading-none">{lang === 'FR' ? "Aucun résultat" : "No results found"}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* CTA */}
                <div className="relative p-8 md:p-24 rounded-2xl bg-slate-900 group border-2 border-foreground/5 text-center space-y-10 overflow-hidden shadow-3xl">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,102,0,0.1),transparent_70%)]" />
                    
                    <div className="relative z-10 size-20 bg-foreground/5 rounded-2xl flex items-center justify-center mx-auto border border-foreground/10 group-hover:rotate-12 transition-transform duration-700">
                        <MessageSquare className="size-10 text-[#FF6600]" />
                    </div>
                    <div className="relative z-10 space-y-6">
                        <h3 className="text-2xl md:text-2xl font-black  tracking-tighter text-foreground uppercase leading-none">{t('needHelp')}</h3>
                        <p className="text-muted-foreground/80 font-bold uppercase  text-xs  max-w-2xl mx-auto leading-relaxed border-l-8 border-[#FF6600]/40 pl-10 text-left opacity-80">
                            {lang === 'FR' ? "Notre équipe de support est disponible pour répondre à vos questions." : "Our support team is available to answer all your specific questions."}
                        </p>
                    </div>
                    <Link to="/contact" className="relative z-10 inline-block">
                        <Button className="h-14 px-14 rounded-2xl font-semibold text-[10px] bg-[#FF6600] text-foreground shadow-2xl shadow-[#FF6600]/20 hover:scale-105 active:scale-95 transition-all group/btn relative overflow-hidden  leading-none border-0">
                            {t('contact')} <ArrowRight className="size-5 ml-4 group-hover/btn:translate-x-2 transition-transform" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default FaqPage;
