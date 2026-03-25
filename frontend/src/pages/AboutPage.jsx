import React from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout';
import { Button } from '../components/ui/Button';
import {
    ShieldCheck, Zap, Users, TrendingUp, Heart,
    MapPin, ArrowRight, Star, Award, Globe, Smartphone
} from 'lucide-react';

const STATS = [
    { val: '50K+', label: 'Utilisateurs Actifs', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { val: '1.2K+', label: 'Boutiques Partenaires', icon: Award, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    { val: '98.4%', label: 'Taux de Satisfaction', icon: Star, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { val: '15M+', label: 'Transactions Sécurisées', icon: ShieldCheck, color: 'text-primary', bg: 'bg-primary/10 border-primary/20' },
];

const TEAM = [
    { name: 'Mamadou Keita', role: 'Fondateur & CEO', expertise: 'Fintech & Innovation', img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200' },
    { name: 'Fatoumata Diallo', role: 'Directrice Produit', expertise: 'UX & Marketplace', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200' },
    { name: 'Ibrahim Camara', role: 'CTO', expertise: 'Architecture & IA', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200' },
];

const VALUES = [
    { icon: ShieldCheck, title: 'Confiance & Transparence', desc: 'Chaque transaction est auditée et chaque marchand est rigoureusement vérifié avant d\'accéder à la plateforme.', color: 'text-emerald-400' },
    { icon: Zap, title: 'Innovation Africaine', desc: 'Nous construisons des solutions technologiques pensées pour les réalités africaines, incluant le mode hors-ligne.', color: 'text-primary' },
    { icon: Heart, title: 'Impact Local', desc: 'Notre mission est de créer 100 000 emplois indirects en numérisant le commerce informel en Guinée.', color: 'text-rose-400' },
    { icon: Globe, title: 'Inclusion Financière', desc: 'Notre portefeuille virtuel intégré permet à tous, bancarisés ou non, de participer à l\'économie numérique.', color: 'text-blue-400' },
];

const AboutPage = () => {
    return (
        <PublicLayout>
            <div className="font-inter pb-32 bg-slate-50 dark:bg-slate-950 animate-in fade-in duration-1000">

                {/* ══════════════════════════════════════════════════
                    EXECUTIVE HERO
                ══════════════════════════════════════════════════ */}
                <section className="relative min-h-[80vh] flex items-center overflow-hidden bg-slate-950 border-b-4 border-primary">
                    <div className="absolute inset-0 z-0">
                        {/* Dark radial gradient for contrast */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,theme(colors.primary.DEFAULT/0.15),transparent_70%)]" />
                        <div className="absolute top-[-20%] left-[-10%] size-[50rem] bg-primary/20 blur-[150px] rounded-full mix-blend-screen pointer-events-none" />
                        <div className="absolute bottom-[-20%] right-[-10%] size-[50rem] bg-blue-600/10 blur-[150px] rounded-full mix-blend-screen pointer-events-none" />
                        
                        {/* Premium Grid Pattern */}
                        <div className="absolute inset-0 opacity-[0.03]" style={{
                            backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
                            backgroundSize: '4rem 4rem'
                        }} />
                        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-950 to-transparent" />
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-32 text-center space-y-10 animate-in slide-in-from-bottom duration-1000 delay-200">
                        <span className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/5 border border-white/10 text-primary text-[9px] font-black uppercase tracking-[0.4em] rounded-full backdrop-blur-md shadow-2xl">
                            <MapPin className="size-3.5" /> Conakry, Guinée · Fondé en 2024
                        </span>
                        
                        <h1 className="text-6xl md:text-8xl lg:text-[7rem] font-black text-white tracking-tighter leading-[0.9] uppercase italic">
                            L'Avenir du <br />
                            <span className="text-primary italic">Commerce B2B.</span>
                        </h1>
                        
                        <p className="text-white/50 text-base md:text-lg font-bold tracking-widest uppercase max-w-3xl mx-auto leading-relaxed border-l-2 border-white/20 pl-6">
                            BCA Connect est la première marketplace Fintech de Guinée combinant un écosystème de paiement sécurisé,
                            une IA de confiance, et une infrastructure haute disponibilité. L'excellence pour les entrepreneurs modernes.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
                            <Link to="/register">
                                <Button className="h-16 px-12 rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl shadow-primary/30 gap-4 hover:shadow-primary/50 transition-all hover:scale-105 active:scale-95 group overflow-hidden relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                                    Rejoindre l'Élite <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                            <Link to="/catalog">
                                <Button variant="outline" className="h-16 px-12 rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-[11px] border-2 border-white/10 text-white hover:bg-white/5 hover:border-white/20 transition-all hover:scale-105 active:scale-95">
                                    Accéder au Catalogue Officiel
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════
                    EXECUTIVE STATS
                ══════════════════════════════════════════════════ */}
                <section className="bg-white dark:bg-slate-900 border-b-2 border-slate-100 dark:border-slate-800 py-20 relative z-20 shadow-xl shadow-slate-200/50 dark:shadow-none">
                    <div className="max-w-7xl mx-auto px-4 md:px-8">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                            {STATS.map((stat, i) => (
                                <div key={i} className="p-8 rounded-[2rem] bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 flex flex-col items-center text-center gap-4 hover:scale-105 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-primary/5 group">
                                    <div className={`size-14 rounded-2xl ${stat.bg} flex items-center justify-center group-hover:-translate-y-2 transition-transform duration-500`}>
                                        <stat.icon className={`size-7 ${stat.color}`} />
                                    </div>
                                    <div>
                                        <p className={`text-5xl font-black italic tracking-tighter ${stat.color} leading-none`}>{stat.val}</p>
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mt-2">{stat.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════
                    NOTRE HISTOIRE (EXECUTIVE LAYOUT)
                ══════════════════════════════════════════════════ */}
                <section className="py-32 max-w-7xl mx-auto px-4 md:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div className="space-y-10">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="size-2 rounded-full bg-primary animate-pulse" />
                                    <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em]">Genèse Mutuelle</span>
                                </div>
                                <h2 className="text-5xl md:text-6xl font-black italic tracking-tighter text-slate-900 dark:text-white leading-[0.9] uppercase">
                                    Une vision <br /> <span className="text-primary border-b-4 border-primary pb-2 inline-block mt-2">radicale.</span>
                                </h2>
                            </div>
                            
                            <div className="space-y-6 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px] leading-relaxed border-l-2 border-primary/20 pl-6">
                                <p>
                                    Fondée sur l'analyse approfondie des frictions de l'e-commerce en Afrique de l'Ouest, BCA Connect n'est pas qu'une plateforme, c'est une <strong>infrastructure de souveraineté numérique</strong>.
                                </p>
                                <p>
                                    Notre protocole d'ingénierie résout la volatilité des réseaux télécoms via un système de synchronisation asynchrone propriétaire, garantissant l'intégrité des transactions même hors-ligne.
                                </p>
                                <p className="text-slate-900 dark:text-white mt-4">
                                    Aujourd'hui, nous redéfinissons les standards : <strong className="text-primary italic">fluidité absolue, sécurité cryptographique, et architecture hautement résiliente.</strong>
                                </p>
                            </div>
                            <Link to="/register" className="inline-block mt-4">
                                <Button className="h-16 px-10 rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-[10px] gap-4 shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                                    Integrer l'Écosystème <ArrowRight className="size-4" />
                                </Button>
                            </Link>
                        </div>
                        
                        {/* Executive Image Container */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full group-hover:bg-primary/30 transition-colors duration-1000" />
                            <div className="aspect-[4/5] rounded-[3rem] bg-slate-950 border-2 border-slate-800 overflow-hidden relative z-10 shadow-2xl">
                                <img src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=800"
                                    alt="L'équipe fondatrice BCA Connect" 
                                    className="w-full h-full object-cover opacity-50 mix-blend-luminosity group-hover:scale-105 group-hover:opacity-70 transition-all duration-1000" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                                
                                {/* Overlay Content */}
                                <div className="absolute bottom-10 left-10 right-10">
                                    <div className="w-12 h-1 bg-primary mb-6" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Board Fondateur</p>
                                    <p className="text-3xl font-black italic text-white mt-2 leading-[1.1] tracking-tighter">Bâtir l'infrastructure de la confiance.</p>
                                </div>
                            </div>
                            
                            {/* Floating Executive Badge */}
                            <div className="absolute top-10 -right-10 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 shadow-2xl z-20 animate-bounce duration-[5000ms]">
                                <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400">Quartier Général</p>
                                <p className="font-black text-slate-900 dark:text-white italic text-xl mt-1 tracking-tighter">Conakry, GN</p>
                                <div className="mt-3 flex gap-1">
                                    {[1,2,3].map(i => <div key={i} className="size-1.5 rounded-full bg-primary" />)}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════
                    NOS VALEURS (EXECUTIVE)
                ══════════════════════════════════════════════════ */}
                <section className="bg-slate-50 dark:bg-slate-950 border-y-2 border-slate-100 dark:border-slate-800 py-32 relative overflow-hidden">
                     {/* Background Decorative */}
                     <div className="absolute right-0 top-1/2 -translate-y-1/2 size-[60rem] bg-slate-100 dark:bg-slate-900 rounded-full blur-[100px] -z-10" />
                     
                    <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-20 relative z-10">
                        <div className="text-center space-y-4">
                            <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em]">Principes Cardinaux</span>
                            <h2 className="text-5xl md:text-6xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
                                Fondations <br/> Inébranlables.
                            </h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {VALUES.map((v, i) => (
                                <div key={i} className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 hover:border-primary/50 transition-all duration-500 group hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 flex flex-col justify-between h-full">
                                    <div>
                                        <div className={`size-16 rounded-[1.5rem] bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 flex items-center justify-center mb-8 group-hover:bg-${v.color.split('-')[1]}-500/10 transition-colors`}>
                                            <v.icon className={`size-8 ${v.color}`} />
                                        </div>
                                        <h3 className="text-2xl font-black italic tracking-tight text-slate-900 dark:text-white mb-4 uppercase">{v.title}</h3>
                                        <div className="w-8 h-1 bg-slate-200 dark:bg-slate-700 mb-4 group-hover:bg-primary transition-colors" />
                                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-loose">{v.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════
                    L'ÉQUIPE DIRIGEANTE
                ══════════════════════════════════════════════════ */}
                <section className="py-32 max-w-7xl mx-auto px-4 md:px-8">
                    <div className="text-center space-y-4 mb-20">
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Directoire</span>
                        <h2 className="text-5xl md:text-6xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
                            L'Élite Opérationnelle.
                        </h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-8">
                        {TEAM.map((member, i) => (
                            <div key={i} className="group text-center">
                                <div className="relative mx-auto w-56 h-64 mb-8">
                                    {/* Abstract background shape */}
                                    <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800 rounded-[3rem] rotate-6 group-hover:rotate-12 transition-transform duration-700 pointer-events-none" />
                                    
                                    <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden border-4 border-white dark:border-slate-900 shadow-2xl z-10">
                                        <img src={member.img} alt={member.name} className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" />
                                    </div>
                                    
                                    {/* Role Badge */}
                                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 rounded-full z-20 shadow-xl whitespace-nowrap">
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em]">{member.role}</p>
                                    </div>
                                </div>
                                
                                <div>
                                    <h3 className="text-2xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase">{member.name}</h3>
                                    <div className="flex items-center justify-center gap-2 mt-2">
                                        <div className="w-4 h-0.5 bg-primary" />
                                        <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest">{member.expertise}</p>
                                        <div className="w-4 h-0.5 bg-primary" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════
                    EXECUTIVE CTA
                ══════════════════════════════════════════════════ */}
                <section className="relative bg-slate-950 py-32 overflow-hidden mx-4 md:mx-8 rounded-[4rem] mb-12 shadow-2xl border-2 border-slate-900">
                    <div className="absolute inset-0">
                        {/* Dark radial gradient for contrast */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,theme(colors.primary.DEFAULT/0.2),transparent_70%)]" />
                        <div className="absolute inset-0 opacity-[0.05]" style={{
                            backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
                            backgroundSize: '4rem 4rem'
                        }} />
                        <div className="absolute top-0 right-0 size-[40rem] bg-primary/20 rounded-full blur-[150px] mix-blend-screen" />
                    </div>
                    
                    <div className="relative z-10 text-center space-y-10 px-6 max-w-4xl mx-auto">
                        <span className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 text-white text-[9px] font-black uppercase tracking-[0.4em] rounded-full backdrop-blur-md">
                            <Smartphone className="size-4 text-primary" /> L'excellence n'attend pas
                        </span>
                        
                        <h2 className="text-6xl md:text-7xl font-black text-white italic tracking-tighter uppercase leading-[0.9]">
                            Déployez la puissance <br />
                            <span className="text-primary not-italic">Fintech.</span>
                        </h2>
                        
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
                            <Link to="/register">
                                <Button className="h-20 px-14 rounded-[2rem] font-black uppercase tracking-[0.3em] text-xs shadow-2xl shadow-primary/40 gap-4 hover:scale-105 transition-transform group relative overflow-hidden border-2 border-primary">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                                    Initialiser le Compte <ArrowRight className="size-5 group-hover:translate-x-2 transition-transform" />
                                </Button>
                            </Link>
                            <Link to="/contact">
                                <Button variant="outline" className="h-20 px-14 rounded-[2rem] font-black uppercase tracking-[0.3em] text-xs border-2 border-white/20 text-white hover:bg-white/10 transition-all hover:scale-105">
                                    Contacter le Support
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
