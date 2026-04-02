import React from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout';
import { Button } from '../components/ui/Button';
import {
    ShieldCheck, Zap, Users, TrendingUp, Heart,
    MapPin, ArrowRight, Star, Award, Globe, Smartphone,
    ChevronRight, Sparkles
} from 'lucide-react';

const STATS = [
    { val: '50K+', label: 'Utilisateurs Actifs', icon: Users, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
    { val: '1.2K+', label: 'Boutiques Partenaires', icon: Award, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
    { val: '98.4%', label: 'Taux de Satisfaction', icon: Star, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { val: '15M+', label: 'Transactions Sécurisées', icon: ShieldCheck, color: 'text-[#FF6600]', bg: 'bg-[#FF6600]/10 border-[#FF6600]/20' },
];

const TEAM = [
    { name: 'Mamadou Keita', role: 'Fondateur & CEO', expertise: 'Fintech & Innovation', img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400' },
    { name: 'Fatoumata Diallo', role: 'Directrice Produit', expertise: 'UX & Marketplace', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400' },
    { name: 'Ibrahim Camara', role: 'CTO', expertise: 'Architecture & IA', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400' },
];

const VALUES = [
    { icon: ShieldCheck, title: 'Confiance & Transparence', desc: 'Chaque transaction est auditée et chaque marchand est rigoureusement vérifié avant d\'accéder à la plateforme.', color: 'text-emerald-400' },
    { icon: Zap, title: 'Innovation Africaine', desc: 'Nous construisons des solutions technologiques pensées pour les réalités africaines, incluant le mode hors-ligne.', color: 'text-[#FF6600]' },
    { icon: Heart, title: 'Impact Local', desc: 'Notre mission est de créer 100 000 emplois indirects en numérisant le commerce informel en Guinée.', color: 'text-rose-400' },
    { icon: Globe, title: 'Inclusion Financière', desc: 'Notre portefeuille virtuel intégré permet à tous, bancarisés ou non, de participer à l\'économie numérique.', color: 'text-blue-400' },
];

const AboutPage = () => {
    return (
        <PublicLayout>
            <div className="bg-[#0A0D14] min-h-screen text-white font-inter">

                {/* ══════════════════════════════════════════════════
                    EXECUTIVE HERO
                ══════════════════════════════════════════════════ */}
                <section className="relative min-h-[90vh] flex items-center overflow-hidden border-b-8 border-white/5">
                    <div className="absolute inset-0 z-0">
                        <div className="absolute top-[-10%] left-[-10%] size-[60rem] bg-[#FF6600]/10 blur-[180px] rounded-full mix-blend-screen pointer-events-none" />
                        <div className="absolute bottom-[-10%] right-[-10%] size-[60rem] bg-[#FF6600]/5 blur-[180px] rounded-full mix-blend-screen pointer-events-none" />

                        {/* Premium Grid Pattern */}
                        <div className="absolute inset-0 opacity-[0.03]" style={{
                            backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
                            backgroundSize: '5rem 5rem'
                        }} />
                        <div className="absolute inset-x-0 bottom-0 h-96 bg-gradient-to-t from-[#0A0D14] to-transparent" />
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-40 text-center space-y-16 animate-in slide-in-from-bottom-12 duration-1000 delay-200">
                        <span className="inline-flex items-center gap-4 px-8 py-3 bg-white/5 border-2 border-white/10 text-[#FF6600] text-[11px] font-black uppercase tracking-[0.5em] rounded-full backdrop-blur-3xl italic">
                            <MapPin className="size-4" /> CONAKRY · GUINÉE · PROTOCOLE EST. 2024
                        </span>

                        <h1 className="text-7xl md:text-9xl lg:text-[11rem] font-black tracking-tighter leading-[0.8] uppercase italic text-white drop-shadow-2xl">
                            L'AVENIR DU <br />
                            <span className="text-[#FF6600] not-italic">COMMERCE B2B.</span>
                        </h1>

                        <p className="text-slate-400 text-lg md:text-2xl font-bold tracking-widest uppercase max-w-4xl mx-auto leading-relaxed border-l-8 border-[#FF6600]/20 pl-10 italic">
                            BCA Connect est la première marketplace Fintech de Guinée combinant un écosystème de paiement sécurisé,
                            une IA de confiance, et une infrastructure haute disponibilité.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-10 pt-8">
                            <Link to="/register">
                                <Button className="h-24 px-16 rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-xs bg-[#FF6600] border-4 border-[#FF6600] shadow-2xl shadow-[#FF6600]/30 gap-8 hover:scale-110 active:scale-95 transition-all group overflow-hidden relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                                    Initialiser l'Adhésion <ArrowRight className="size-6 group-hover:translate-x-2 transition-transform" />
                                </Button>
                            </Link>
                            <Link to="/catalog">
                                <Button variant="outline" className="h-24 px-16 rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-xs border-4 border-white/5 text-white hover:border-[#FF6600]/40 transition-all hover:scale-105 active:scale-95 bg-white/5 backdrop-blur-3xl italic">
                                    Accéder au Catalogue
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════
                    EXECUTIVE STATS
                ══════════════════════════════════════════════════ */}
                <section className="py-32 relative z-20 border-b-8 border-white/5">
                    <div className="max-w-7xl mx-auto px-6 md:px-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                            {STATS.map((stat, i) => (
                                <div key={i} className="p-12 rounded-[4rem] bg-white/[0.02] border-4 border-white/5 flex flex-col items-center text-center gap-8 hover:scale-105 hover:bg-white/[0.04] transition-all duration-700 shadow-2xl group relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#FF6600]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className={`size-20 rounded-[1.5rem] ${stat.bg} flex items-center justify-center group-hover:-translate-y-4 transition-all duration-700 shadow-xl border-2 border-current/10 relative z-10`}>
                                        <stat.icon className={`size-10 ${stat.color}`} />
                                    </div>
                                    <div className="relative z-10">
                                        <p className="text-6xl font-black italic tracking-tighter text-white leading-none">{stat.val}</p>
                                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mt-6 italic">{stat.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════
                    NOTRE HISTOIRE
                ══════════════════════════════════════════════════ */}
                <section className="py-48 max-w-7xl mx-auto px-6 md:px-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-40 items-center">
                        <div className="space-y-16">
                            <div>
                                <div className="flex items-center gap-6 mb-8">
                                    <div className="size-4 rounded-full bg-[#FF6600] animate-pulse shadow-[0_0_20px_rgba(255,102,0,0.4)]" />
                                    <span className="text-[10px] font-black text-[#FF6600] uppercase tracking-[0.5em] italic">NOTRE PHILOSOPHIE</span>
                                </div>
                                <h2 className="text-6xl md:text-9xl font-black italic tracking-tighter text-white leading-[0.8] uppercase">
                                    UNE VISION <br /> <span className="text-[#FF6600] not-italic">RADICALE.</span>
                                </h2>
                            </div>

                            <div className="space-y-10 text-slate-400 font-bold uppercase tracking-[0.2em] text-sm leading-relaxed border-l-8 border-[#FF6600]/20 pl-12 italic max-w-2xl">
                                <p>
                                    Fondée sur l'analyse approfondie des frictions de l'e-commerce en Afrique de l'Ouest, BCA Connect n'est pas qu'une plateforme, c'est une <strong className="text-white">infrastructure de souveraineté numérique</strong>.
                                </p>
                                <p>
                                    Notre protocole d'ingénierie résout la volatilité des réseaux télécoms via un système de synchronisation asynchrone propriétaire, garantissant l'intégrité des transactions même hors-ligne.
                                </p>
                                <p className="text-white mt-10 text-lg border-t-4 border-white/5 pt-10">
                                    NOUS REDÉFINISSONS LES STANDARDS : <span className="text-[#FF6600] italic">FLUIDITÉ ABSOLUE, SÉCURITÉ CRYPTOGRAPHIQUE ET RÉSILIENCE.</span>
                                </p>
                            </div>
                            <Link to="/register" className="inline-block">
                                <Button className="h-24 px-16 rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-xs gap-8 shadow-2xl shadow-[#FF6600]/20 hover:scale-110 transition-all bg-white text-black border-4 border-white hover:bg-transparent hover:text-white">
                                    INFILTRER L'ÉCOSYSTÈME <ArrowRight className="size-7" />
                                </Button>
                            </Link>
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-0 bg-[#FF6600]/10 blur-[150px] rounded-full group-hover:bg-[#FF6600]/20 transition-all duration-1000 opacity-40" />
                            <div className="aspect-[4/5] rounded-[5rem] bg-white/[0.02] border-4 border-white/5 overflow-hidden relative z-10 shadow-3xl">
                                <img src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=1200"
                                    alt=""
                                    className="w-full h-full object-cover mix-blend-luminosity grayscale group-hover:grayscale-0 group-hover:scale-110 group-hover:rotate-1 transition-all duration-1000" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D14] via-transparent to-transparent" />

                                <div className="absolute bottom-16 left-16 right-16">
                                    <div className="w-24 h-3 bg-[#FF6600] mb-10 rounded-full" />
                                    <p className="text-[11px] font-black uppercase tracking-[0.5em] text-[#FF6600] italic mb-4">BOARD FONDATEUR</p>
                                    <p className="text-4xl font-black italic text-white leading-tight tracking-tighter uppercase underline decoration-[#FF6600]/20 decoration-8 underline-offset-4">BÂTIR L'INFRASTRUCTURE DE LA CONFIANCE.</p>
                                </div>
                            </div>

                            <div className="absolute top-12 -right-12 bg-[#0A0D14] border-4 border-white/5 rounded-[4rem] p-12 shadow-3xl z-20 animate-bounce duration-[8s] backdrop-blur-3xl">
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 italic mb-4">QUARTIER GÉNÉRAL</p>
                                <p className="font-black text-white italic text-3xl mt-4 tracking-tighter uppercase leading-none">CONAKRY, GN</p>
                                <div className="mt-8 flex gap-4">
                                    {[1, 2, 3].map(i => <div key={i} className="size-2 rounded-full bg-[#FF6600]" />)}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════
                    NOS VALEURS (EXECUTIVE)
                ══════════════════════════════════════════════════ */}
                <section className="bg-white/[0.01] border-y-8 border-white/5 py-48 relative overflow-hidden">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 size-[70rem] bg-[#FF6600]/5 rounded-full blur-[200px] -z-10" />

                    <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-32 relative z-10">
                        <div className="text-center space-y-8">
                            <span className="text-[11px] font-black text-[#FF6600] uppercase tracking-[0.6em] italic leading-none">PRINCIPES CARDINAUX</span>
                            <h2 className="text-6xl md:text-[8rem] font-black italic tracking-tighter text-white uppercase leading-[0.8] drop-shadow-2xl">
                                FONDATIONS <br /> <span className="text-[#FF6600]">INÉBRANLABLES.</span>
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                            {VALUES.map((v, i) => (
                                <div key={i} className="p-12 rounded-[4.5rem] bg-[#0A0D14] border-4 border-white/5 hover:border-[#FF6600]/40 transition-all duration-700 group hover:shadow-3xl hover:-translate-y-6 flex flex-col justify-between h-full relative overflow-hidden">
                                    <div className="absolute inset-x-0 bottom-0 h-2 bg-[#FF6600]/0 group-hover:bg-[#FF6600] transition-all duration-700"></div>
                                    <div className="relative z-10">
                                        <div className={`size-20 rounded-2xl bg-white/5 border-2 border-white/5 flex items-center justify-center mb-12 group-hover:bg-[#FF6600]/10 group-hover:border-[#FF6600]/20 transition-all duration-700 shadow-inner`}>
                                            <v.icon className={`size-10 ${v.color} group-hover:scale-110 transition-transform`} />
                                        </div>
                                        <h3 className="text-3xl font-black italic tracking-tight text-white mb-8 uppercase leading-tight">{v.title}</h3>
                                        <div className="w-16 h-2 bg-[#FF6600]/10 mb-10 rounded-full group-hover:w-24 group-hover:bg-[#FF6600] transition-all duration-700" />
                                        <p className="text-slate-500 text-sm font-bold uppercase tracking-[0.1em] leading-loose italic">{v.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════
                    L'ÉQUIPE (EXECUTIVE)
                ══════════════════════════════════════════════════ */}
                <section className="py-48 max-w-7xl mx-auto px-6 md:px-12">
                    <div className="text-center space-y-10 mb-40">
                        <span className="text-[11px] font-black text-[#FF6600] uppercase tracking-[0.6em] italic leading-none">LE CONSEIL</span>
                        <h2 className="text-6xl md:text-9xl font-black italic tracking-tighter text-white uppercase leading-[0.8] drop-shadow-2xl">
                            L'ÉLITE <br /> OPÉRATIONNELLE.
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
                        {TEAM.map((member, i) => (
                            <div key={i} className="group text-center">
                                <div className="relative mx-auto w-80 h-96 mb-16">
                                    <div className="absolute inset-0 bg-[#FF6600]/20 rounded-[5rem] rotate-6 group-hover:rotate-12 transition-all duration-1000 border-4 border-white/5" />
                                    <div className="relative w-full h-full rounded-[4.5rem] overflow-hidden border-8 border-[#0A0D14] shadow-3xl z-10">
                                        <img src={member.img} alt={member.name} className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000 brightness-75 group-hover:brightness-100" />
                                        <div className="absolute inset-0 bg-[#FF6600]/10 mix-blend-overlay group-hover:opacity-0 transition-opacity"></div>
                                    </div>
                                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white text-black px-12 py-5 rounded-[2rem] z-20 shadow-3xl whitespace-nowrap border-4 border-[#0A0D14] italic tracking-[0.3em] font-black text-[10px] uppercase">
                                        {member.role}
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <h3 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none drop-shadow-sm">{member.name}</h3>
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mt-8 italic flex items-center justify-center gap-4">
                                        <div className="w-8 h-px bg-[#FF6600]/40" />
                                        {member.expertise}
                                        <div className="w-8 h-px bg-[#FF6600]/40" />
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════
                    ULTIMATE CTA
                ══════════════════════════════════════════════════ */}
                <section className="relative py-48 overflow-hidden mx-6 md:mx-12 rounded-[6rem] mb-20 bg-white group border-x-[12px] border-[#FF6600]">
                    <div className="absolute inset-0">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,102,0,0.1),transparent_70%)]" />
                        <div className="absolute inset-0 opacity-[0.03]" style={{
                            backgroundImage: `linear-gradient(to right, black 1px, transparent 1px), linear-gradient(to bottom, black 1px, transparent 1px)`,
                            backgroundSize: '5rem 5rem'
                        }} />
                    </div>

                    <div className="relative z-10 text-center space-y-16 px-10 max-w-5xl mx-auto">
                        <span className="inline-flex items-center gap-6 px-10 py-5 bg-black/5 border-2 border-black/10 text-black text-[11px] font-black uppercase tracking-[0.6em] rounded-full backdrop-blur-3xl italic">
                            <Sparkles className="size-6 text-[#FF6600] animate-pulse" /> L'EXCELLENCE VOUS ATTEND
                        </span>

                        <h2 className="text-7xl md:text-[10rem] font-black text-black italic tracking-tighter uppercase leading-[0.8] drop-shadow-2xl">
                            DÉPLOYEZ LA <br />
                            <span className="text-[#FF6600] not-italic underline decoration-black/10 decoration-8 underline-offset-[-4px]">PUISSANCE.</span>
                        </h2>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-12 pt-12">
                            <Link to="/register">
                                <Button className="h-28 px-20 rounded-[3rem] font-black uppercase tracking-[0.5em] text-sm shadow-3xl shadow-[#FF6600]/20 gap-10 hover:scale-110 active:scale-95 transition-all bg-black text-white border-4 border-black group relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                                    INITIALISER LE COMPTE <ArrowRight className="size-8 group-hover:translate-x-4 transition-transform" />
                                </Button>
                            </Link>
                            <Link to="/contact">
                                <Button variant="outline" className="h-28 px-20 rounded-[3rem] font-black uppercase tracking-[0.5em] text-sm border-4 border-black/10 text-black hover:border-black transition-all hover:scale-105 active:scale-95 italic">
                                    CONTACT CONSULAIRE
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </PublicLayout>
    );
};

export default AboutPage;
