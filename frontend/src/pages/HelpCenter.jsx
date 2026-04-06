import React from 'react';
import { ShoppingBag, Truck, ShieldCheck, ArrowRight, Sparkles, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';
import { useLanguage } from '../context/LanguageContext';

const HelpCenter = () => {
    const { t, lang } = useLanguage();

    return (
        <div className="bg-white dark:bg-[#0A0D14] min-h-screen text-slate-900 dark:text-foreground font-jakarta">
                {/* ══ PREMIUM HERO ══ */}
                <section className="relative pt-44 pb-24 overflow-hidden text-center group">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 size-[65rem] bg-[#FF6600]/10 rounded-full blur-[220px] mix-blend-screen pointer-events-none group-hover:scale-110 transition-transform duration-[4s]" />
                    <div className="absolute inset-0 opacity-[0.02]" style={{
                        backgroundImage: `linear-gradient(to right, #64748b 1px, transparent 1px), linear-gradient(to bottom, #64748b 1px, transparent 1px)`,
                        backgroundSize: '4rem 4rem'
                    }} />

                    <div className="relative z-10 max-w-7xl mx-auto px-6 space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000">
                        <div className="flex flex-col items-center gap-6">
                            <div className="flex items-center gap-4">
                                <div className="size-2 rounded-full bg-[#FF6600] animate-pulse shadow-[0_0_15px_rgba(255,102,0,0.5)]" />
                                <span className="text-[10px] font-black text-[#FF6600] uppercase   leading-none pt-0.5">{t('help').toUpperCase()} • BCA CONNECT</span>
                            </div>
                            <h1 className="text-2xl md:text-2xl lg:text-xl font-semibold  tracking-tighter text-slate-900 dark:text-foreground uppercase leading-[0.85] mb-4">
                                {t('helpHero').split(' ').slice(0, -2).join(' ')} <br /> <span className="text-[#FF6600]">{t('helpHero').split(' ').slice(-2).join(' ')}</span>
                            </h1>
                        </div>
                        <p className="text-muted-foreground font-bold uppercase  text-sm leading-relaxed  border-x-4 border-[#FF6600]/20 px-8 max-w-4xl mx-auto opacity-80">
                            {t('helpSubHero')}
                        </p>
                    </div>
                </section>

                <div className="max-w-7xl mx-auto px-6 md:px-8 py-24 space-y-48 pb-64">
                    {/* ══ SECTION : ACHETER ══ */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center group/section">
                        <div className="space-y-12">
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="size-2 bg-[#FF6600] rounded-full shadow-[0_0_10px_rgba(255,102,0,0.4)]" />
                                    <span className="text-[10px] font-black text-[#FF6600] uppercase   pt-1">{t('buyerGuide')}</span>
                                </div>
                                <h2 className="text-2xl md:text-2xl lg:text-xl font-semibold  tracking-tighter text-slate-900 dark:text-foreground uppercase leading-[0.85]">
                                    {t('buyWithConfidence').split(' ').slice(0, -1).join(' ')} <br /> <span className="text-[#FF6600] not-">{t('buyWithConfidence').split(' ').slice(-1)}</span>
                                </h2>
                            </div>
                            <div className="space-y-10">
                                {[
                                    { title: lang === 'FR' ? "IDENTIFICATION D'ACTIFS" : "ASSET IDENTIFICATION", desc: lang === 'FR' ? "EXPLOREZ NOTRE CATALOGUE INTELLIGENT AVEC FILTRES PAR CATÉGORIE." : "EXPLORE OUR INTELLIGENT CATALOG WITH CATEGORY FILTERS.", icon: ShoppingBag, color: "text-[#FF6600]", bg: "bg-[#FF6600]/10" },
                                    { title: lang === 'FR' ? "PAIEMENT SÉQUESTRE" : "ESCROW PAYMENT", desc: lang === 'FR' ? "VOS FONDS SONT SÉCURISÉS JUSQU'À VALIDATION DE LIVRAISON." : "YOUR FUNDS ARE SECURED UNTIL DELIVERY VALIDATION.", icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                                    { title: lang === 'FR' ? "LOGISTIQUE TEMPS RÉEL" : "REAL-TIME LOGISTICS", desc: lang === 'FR' ? "SUIVI DE CHAQUE ÉTAPE DU COLIS JUSQU'À VOTRE PORTE." : "TRACK EVERY STEP OF YOUR PACKAGE TO YOUR DOOR.", icon: Truck, color: "text-blue-500", bg: "bg-blue-500/10" },
                                ].map((step, i) => (
                                    <div key={i} className="flex gap-8 p-8 rounded-3xl bg-white dark:bg-[#0F1219] border-2 border-slate-100 dark:border-foreground/5 hover:border-[#FF6600]/40 transition-all duration-700 group shadow-xl">
                                        <div className={cn("size-10 rounded-xl flex items-center justify-center shrink-0 group-hover:rotate-12 transition-all duration-700 shadow-lg border-2 border-slate-50 dark:border-foreground/5", step.bg, step.color)}>
                                            <step.icon className="size-6" />
                                        </div>
                                        <div className="flex flex-col justify-center">
                                            <h4 className="text-xl font-black  text-slate-900 dark:text-foreground tracking-tighter uppercase leading-none mb-3">{step.title}</h4>
                                            <p className="text-[10px] text-muted-foreground/80 font-bold uppercase tracking-widest leading-relaxed  border-l-4 border-slate-100 dark:border-foreground/10 pl-6 opacity-80">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="aspect-[4/5] lg:aspect-square rounded-3xl bg-slate-100 dark:bg-foreground/5 border-4 border-slate-200 dark:border-foreground/5 overflow-hidden relative shadow-3xl group/img">
                            <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=1200" alt="Expérience achat" className="w-full h-full object-cover opacity-60 mix-blend-luminosity group-hover/img:scale-110 group-hover/img:opacity-100 transition-all duration-[2s]" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D14] via-transparent to-transparent" />
                            <div className="absolute bottom-16 left-16 right-16">
                                <div className="p-6 bg-background/60 backdrop-blur-3xl border-4 border-[#FF6600]/20 rounded-lg shadow-3xl">
                                    <p className="text-[11px] font-bold uppercase tracking-widest text-[#FF6600]  mb-4">INFRASTRUCTURE</p>
                                    <p className="text-3xl font-bold  text-foreground uppercase tracking-tighter leading-none">{lang === 'FR' ? "SÉCURITÉ GARANTIE" : "GUARANTEED SECURITY"}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ══ SECTION : VENDRE ══ */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center group/section">
                        <div className="order-2 lg:order-1 aspect-[4/5] lg:aspect-square rounded-3xl bg-slate-100 dark:bg-foreground/5 border-4 border-slate-200 dark:border-foreground/5 overflow-hidden relative shadow-3xl group/img">
                            <img src="https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&q=80&w=1200" alt="Expérience vendeur" className="w-full h-full object-cover opacity-60 mix-blend-luminosity group-hover/img:scale-110 group-hover/img:opacity-100 transition-all duration-[2s]" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D14] via-transparent to-transparent" />
                            <div className="absolute bottom-16 left-16 right-16 text-right">
                                <div className="p-6 bg-background/60 backdrop-blur-3xl border-4 border-blue-500/20 rounded-lg shadow-3xl ml-auto inline-block text-left">
                                    <p className="text-[11px] font-bold uppercase tracking-widest text-blue-500  mb-4">ÉCOSYSTÈME</p>
                                    <p className="text-3xl font-bold  text-foreground uppercase tracking-tighter leading-none">{lang === 'FR' ? "BOOSTEZ VOS VENTES" : "BOOST YOUR SALES"}</p>
                                </div>
                            </div>
                        </div>
                        <div className="order-1 lg:order-2 space-y-16">
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="size-2 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.4)]" />
                                    <span className="text-[10px] font-black text-blue-500 uppercase   pt-1">{t('sellerGuide')}</span>
                                </div>
                                <h2 className="text-2xl md:text-2xl lg:text-xl font-semibold  tracking-tighter text-slate-900 dark:text-foreground uppercase leading-[0.85]">
                                    {t('growBusiness').split(' ').slice(0, -1).join(' ')} <br /> <span className="text-blue-500 not-">{t('growBusiness').split(' ').slice(-1)}</span>
                                </h2>
                            </div>
                            <div className="space-y-10">
                                {[
                                    { title: lang === 'FR' ? "VITRINE INSTANTANÉE" : "INSTANT STOREFRONT", desc: lang === 'FR' ? "CRÉEZ VOTRE BOUTIQUE ET COMMENCEZ À VENDRE IMMÉDIATEMENT." : "CREATE YOUR SHOP AND START SELLING IMMEDIATELY.", icon: ShoppingBag, color: "text-blue-500", bg: "bg-blue-500/10" },
                                    { title: lang === 'FR' ? "SCORE DE CONFIANCE IA" : "AI TRUST SCORE", desc: lang === 'FR' ? "AUGMENTEZ VOTRE VISIBILITÉ GRÂCE À NOTRE ALGORITHME DE CONFIANCE." : "INCREASE YOUR VISIBILITY THANKS TO OUR TRUST ALGORITHM.", icon: Sparkles, color: "text-amber-500", bg: "bg-amber-500/10" },
                                    { title: lang === 'FR' ? "REVERSEMENTS MOBILES" : "MOBILE PAYOUTS", desc: lang === 'FR' ? "RÉCUPÉREZ VOS GAINS DIRECTEMENT SUR VOTRE MOBILE MONEY." : "COLLECT YOUR EARNINGS DIRECTLY ON YOUR MOBILE MONEY.", icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                                ].map((step, i) => (
                                    <div key={i} className="flex gap-8 p-8 rounded-3xl bg-white dark:bg-[#0F1219] border-2 border-slate-100 dark:border-foreground/5 hover:border-blue-500/40 transition-all duration-700 group shadow-xl">
                                        <div className={cn("size-10 rounded-xl flex items-center justify-center shrink-0 group-hover:rotate-12 transition-all duration-700 shadow-lg border-2 border-slate-50 dark:border-foreground/5", step.bg, step.color)}>
                                            <step.icon className="size-6" />
                                        </div>
                                        <div className="flex flex-col justify-center">
                                            <h4 className="text-xl font-black  text-slate-900 dark:text-foreground tracking-tighter uppercase leading-none mb-3">{step.title}</h4>
                                            <p className="text-[10px] text-muted-foreground/80 font-bold uppercase tracking-widest leading-relaxed  border-l-4 border-slate-100 dark:border-foreground/10 pl-6 opacity-80">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Link to="/register" className="inline-block pt-8">
                                <Button className="h-12 px-14 rounded-2xl font-semibold text-[10px] bg-blue-600 text-foreground hover:scale-105 active:scale-95 transition-all group/btn relative overflow-hidden  leading-none border-0 shadow-lg shadow-blue-500/20">
                                    {t('deployShop').toUpperCase()} <ArrowRight className="size-5 ml-4 group-hover/btn:translate-x-2 transition-transform" />
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="relative p-8 md:p-24 rounded-2xl bg-slate-900 group border-2 border-foreground/5 text-center space-y-12 overflow-hidden shadow-3xl">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,102,0,0.1),transparent_70%)]" />
                        
                        <div className="relative z-10 space-y-8">
                            <h2 className="text-2xl md:text-2xl lg:text-xl font-semibold text-foreground  tracking-tighter uppercase leading-none">
                                {t('needSpecificHelp').split(' ').slice(0, -2).join(' ')} <br /> <span className="text-[#FF6600] not-">{t('needSpecificHelp').split(' ').slice(-2).join(' ')}</span>
                            </h2>
                            <p className="text-muted-foreground/80 font-bold uppercase  text-xs  max-w-3xl mx-auto leading-relaxed border-l-8 border-[#FF6600]/40 pl-12 text-left opacity-80">
                                {lang === 'FR' ? "Notre équipe de support est là pour vous accompagner." : "Our support team is here to assist you. Contact us for any question."}
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 relative z-10">
                            <Link to="/contact">
                                <Button className="h-14 px-14 rounded-2xl font-semibold text-[10px] bg-[#FF6600] text-foreground shadow-2xl shadow-[#FF6600]/20 hover:scale-105 active:scale-95 transition-all group/btn relative overflow-hidden  leading-none border-0">
                                    {t('contact').toUpperCase()} <MessageCircle className="size-5 ml-4" />
                                </Button>
                            </Link>
                            <Link to="/faq">
                                <Button variant="outline" className="h-14 px-14 rounded-2xl font-semibold text-[10px] border-2 border-foreground/10 text-foreground hover:bg-white hover:text-background transition-all hover:scale-105 active:scale-95  leading-none">
                                    {t('faq').toUpperCase()}
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
    );
};

export default HelpCenter;
