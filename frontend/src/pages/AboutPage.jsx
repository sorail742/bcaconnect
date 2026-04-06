import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import {
    ShieldCheck, Zap, Users, Heart,
    MapPin, ArrowRight, Star, Award, Globe,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const AboutPage = () => {
    const { t } = useLanguage();

    const STATS = [
        { val: '50K+', label: t('statsActive'), icon: Users, color: 'text-orange-500', bg: 'bg-orange-500/10' },
        { val: '1.2K+', label: t('statsShops'), icon: Award, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { val: '98.4%', label: t('statsSatisfaction'), icon: Star, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { val: '15M+', label: t('statsSecured'), icon: ShieldCheck, color: 'text-[#FF6600]', bg: 'bg-[#FF6600]/10' },
    ];

    const TEAM = [
        { name: 'Mamadou Keita', role: t('about'), img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400' },
        { name: 'Fatoumata Diallo', role: t('about'), img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400' },
        { name: 'Ibrahim Camara', role: t('about'), img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400' },
    ];

    const VALUES = [
        { icon: ShieldCheck, title: t('privacy'), desc: t('privacyDesc'), color: 'text-emerald-500' },
        { icon: Zap, title: t('features'), desc: t('aboutDesc'), color: 'text-[#FF6600]' },
        { icon: Heart, title: t('about'), desc: t('aboutDesc'), color: 'text-rose-500' },
        { icon: Globe, title: t('lang'), desc: t('aboutDesc'), color: 'text-blue-500' },
    ];

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
                            <span className="text-[10px] font-black text-[#FF6600] uppercase   leading-none pt-0.5">{t('about')} • BCA CONNECT</span>
                        </div>
                        <h1 className="text-2xl md:text-2xl lg:text-xl font-semibold  tracking-tighter text-slate-900 dark:text-foreground uppercase leading-[0.85] mb-4">
                            {t('aboutHero').split(' ')[0]} {t('aboutHero').split(' ')[1]} <br /> <span className="text-[#FF6600]">{t('aboutHero').split(' ').slice(2).join(' ')}</span>
                        </h1>
                    </div>
                    <p className="text-muted-foreground font-bold uppercase  text-sm leading-relaxed  border-x-4 border-[#FF6600]/20 px-8 max-w-4xl mx-auto opacity-80">
                        {t('aboutDescHero')}
                    </p>
                </div>
            </section>

            {/* ══ STATS ══ */}
            <section className="py-16 pb-32">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {STATS.map((stat, i) => (
                            <div key={i} className="p-8 rounded-3xl bg-white dark:bg-[#0F1219] border-2 border-slate-100 dark:border-foreground/5 flex flex-col items-center text-center gap-6 hover:border-[#FF6600]/30 transition-all duration-500 shadow-xl group">
                                <div className={`size-12 rounded-xl ${stat.bg} flex items-center justify-center border-2 border-slate-50 dark:border-foreground/5`}>
                                    <stat.icon className={`size-6 ${stat.color}`} />
                                </div>
                                <div>
                                    <p className="text-xl font-semibold  tracking-tighter text-slate-900 dark:text-foreground leading-none">{stat.val}</p>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 mt-3 ">{stat.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ HISTORY ══ */}
            <section className="py-24 max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <div className="space-y-12">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="size-2 rounded-full bg-[#FF6600]" />
                                <span className="text-[10px] font-black text-[#FF6600] uppercase tracking-widest ">{t('missionTitle').split(' ')[0]} {t('missionTitle').split(' ')[1]}</span>
                            </div>
                            <h2 className="text-2xl md:text-2xl lg:text-xl font-semibold  tracking-tighter text-slate-900 dark:text-foreground uppercase leading-none">
                                {t('missionTitle').split(' ').slice(2, 4).join(' ')} <br /> <span className="text-[#FF6600] not-">{t('missionTitle').split(' ').slice(4).join(' ')}</span>
                            </h2>
                        </div>

                        <div className="space-y-8 text-muted-foreground font-bold uppercase  text-[10px] leading-relaxed border-l-8 border-[#FF6600]/20 pl-10  opacity-80">
                            <p>{t('missionDesc1')}</p>
                            <p>{t('missionDesc2')}</p>
                        </div>
                        
                        <div className="pt-6">
                            <Link to="/register">
                                <Button className="h-12 px-10 rounded-2xl font-semibold text-[10px] bg-slate-900 text-foreground hover:scale-105 active:scale-95 transition-all  border-0 shadow-xl">
                                    {t('joinUs')} <ArrowRight className="size-5 ml-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="relative group">
                         <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl relative">
                            <img src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=1200" 
                                 className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" 
                                 alt="BCA Connect Team" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                            <div className="absolute bottom-8 left-8 right-8 text-foreground">
                                <p className="text-[9px] font-black uppercase tracking-widest text-[#FF6600] mb-2 font-jakarta">BOARD EXÉCUTIF</p>
                                <p className="text-xl font-black  tracking-tighter uppercase font-jakarta">Bâtir la confiance numérique.</p>
                            </div>
                         </div>
                    </div>
                </div>
            </section>

            {/* ══ VALUES ══ */}
            <section className="py-24 bg-slate-50/50 dark:bg-white/[0.01]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center space-y-6 mb-24">
                        <span className="text-[10px] font-black text-[#FF6600] uppercase  ">{t('valuesTitle').split(' ')[0]} {t('valuesTitle').split(' ')[1]}</span>
                        <h2 className="text-2xl md:text-xl font-semibold  tracking-tighter text-slate-900 dark:text-foreground uppercase leading-none">{t('valuesTitle').split(' ').slice(2).join(' ')}</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {VALUES.map((v, i) => (
                            <div key={i} className="p-8 rounded-3xl bg-white dark:bg-[#0F1219] border-2 border-slate-100 dark:border-foreground/5 hover:border-[#FF6600]/40 transition-all duration-500 group shadow-xl">
                                <div className="size-10 rounded-xl bg-slate-50 dark:bg-foreground/5 border-2 border-slate-50 dark:border-foreground/5 flex items-center justify-center mb-8 group-hover:bg-[#FF6600]/10 transition-all">
                                    <v.icon className={`size-5 ${v.color}`} />
                                </div>
                                <h3 className="text-xl font-black  text-slate-900 dark:text-foreground mb-4 uppercase tracking-tighter">{v.title}</h3>
                                <p className="text-muted-foreground/80 text-[10px] font-bold uppercase tracking-widest leading-relaxed  opacity-80">{v.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ TEAM ══ */}
            <section className="py-24 max-w-7xl mx-auto px-6">
                <div className="text-center space-y-6 mb-24">
                    <span className="text-[10px] font-black text-[#FF6600] uppercase  ">{t('teamTitle').split(' ')[0]} {t('teamTitle').split(' ')[1]}</span>
                    <h2 className="text-2xl md:text-xl font-semibold  tracking-tighter text-slate-900 dark:text-foreground uppercase leading-none">{t('teamTitle').split(' ').slice(2).join(' ')}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {TEAM.map((member, i) => (
                        <div key={i} className="group flex flex-col items-center">
                            <div className="relative w-full aspect-[4/5] mb-8 rounded-3xl overflow-hidden shadow-xl">
                                <img src={member.img} alt={member.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="absolute bottom-6 left-6 right-6 text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-y-4 group-hover:translate-y-0">
                                    <p className="text-[10px] font-black uppercase tracking-widest">{member.role}</p>
                                </div>
                            </div>
                            <h3 className="text-xl font-black  text-slate-900 dark:text-foreground uppercase tracking-tighter">{member.name}</h3>
                            <div className="w-8 h-1 bg-[#FF6600] mt-4 rounded-full group-hover:w-16 transition-all duration-500" />
                        </div>
                    ))}
                </div>
            </section>

            {/* ══ CTA ══ */}
            <section className="py-24 px-6 md:px-12 bg-slate-900 dark:bg-[#0F1219] rounded-2xl mx-6 md:mx-12 mb-24 text-center space-y-12 shadow-3xl overflow-hidden relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,102,0,0.1),transparent_70%)]" />
                
                <div className="relative z-10 space-y-6">
                    <h2 className="text-2xl md:text-xl font-semibold text-foreground  tracking-tighter uppercase leading-none">{t('ctaReady').split(' ').slice(0, 3).join(' ')} <br /> <span className="text-[#FF6600]">{t('ctaReady').split(' ').slice(3).join(' ')}</span></h2>
                    <p className="text-muted-foreground/80 font-bold uppercase  text-[10px] max-w-lg mx-auto  opacity-80 leading-relaxed">
                        {t('ctaDesc')}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-8 relative z-10">
                    <Link to="/register">
                        <Button className="h-14 px-14 rounded-2xl font-semibold text-[10px] bg-[#FF6600] text-foreground shadow-2xl shadow-[#FF6600]/20 hover:scale-105 transition-all  border-0">
                            {t('createAccount')} <ArrowRight className="size-5 ml-4" />
                        </Button>
                    </Link>
                    <Link to="/contact">
                        <Button variant="outline" className="h-14 px-14 rounded-2xl font-semibold text-[10px] border-2 border-foreground/10 text-foreground hover:bg-white hover:text-background transition-all ">
                            {t('contact')}
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;
