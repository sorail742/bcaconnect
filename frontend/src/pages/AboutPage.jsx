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
            <div className="font-inter pb-32 bg-background animate-in fade-in duration-1000">

                {/* ══════════════════════════════════════════════════
                    EXECUTIVE HERO
                ══════════════════════════════════════════════════ */}
                <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-background border-b-8 border-primary shadow-premium-lg">
                    <div className="absolute inset-0 z-0">
                        {/* Dark radial gradient for contrast */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,theme(colors.primary.DEFAULT/0.2),transparent_70%)] opacity-40" />
                        <div className="absolute top-[-20%] left-[-10%] size-[60rem] bg-primary/10 blur-[180px] rounded-full mix-blend-screen pointer-events-none" />
                        <div className="absolute bottom-[-20%] right-[-10%] size-[60rem] bg-blue-600/5 blur-[180px] rounded-full mix-blend-screen pointer-events-none" />
                        
                        {/* Premium Grid Pattern (Targeting Dark Mode Parity) */}
                        <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.02]" style={{
                            backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
                            backgroundSize: '5rem 5rem'
                        }} />
                        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-background to-transparent" />
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-40 text-center space-y-12 animate-in slide-in-from-bottom-12 duration-1000 delay-200">
                        <span className="inline-flex items-center gap-4 px-6 py-3 bg-card/40 border-2 border-border text-primary text-executive-label font-black uppercase tracking-[0.4em] rounded-full backdrop-blur-3xl shadow-premium italic">
                            <MapPin className="size-4 animate-bounce" /> CONAKRY, GUINÉE · PROTOCOLE ÉTABLI 2024
                        </span>
                        
                        <h1 className="text-7xl md:text-9xl lg:text-[10rem] font-black text-foreground tracking-tighter leading-[0.8] uppercase italic drop-shadow-2xl">
                            L'Avenir du <br />
                            <span className="text-primary not-italic underline decoration-border/20 decoration-8 underline-offset-[-4px]">Commerce B2B.</span>
                        </h1>
                        
                        <p className="text-muted-foreground/60 text-lg md:text-2xl font-bold tracking-widest uppercase max-w-4xl mx-auto leading-relaxed border-l-8 border-primary/20 pl-10 italic">
                            BCA Connect est la première marketplace Fintech de Guinée combinant un écosystème de paiement sécurisé,
                            une IA de confiance, et une infrastructure haute disponibilité. L'excellence pour les entrepreneurs modernes.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-12">
                            <Link to="/register">
                                <Button className="h-20 px-16 rounded-[2rem] font-black uppercase tracking-[0.3em] text-xs shadow-premium-lg shadow-primary/30 gap-6 hover:shadow-primary/50 transition-all hover:scale-105 active:scale-95 group overflow-hidden relative border-2 border-primary">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                                    Rejoindre l'Élite <ArrowRight className="size-6 group-hover:translate-x-2 transition-transform" />
                                </Button>
                            </Link>
                            <Link to="/catalog">
                                <Button variant="outline" className="h-20 px-16 rounded-[2rem] font-black uppercase tracking-[0.3em] text-xs border-4 border-border text-foreground hover:bg-card/40 hover:border-primary/40 transition-all hover:scale-105 active:scale-95 bg-card/20 backdrop-blur-xl">
                                    Accéder au Catalogue Officiel
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════
                    EXECUTIVE STATS
                ══════════════════════════════════════════════════ */}
                <section className="bg-background border-b-4 border-border py-28 relative z-20">
                    <div className="max-w-7xl mx-auto px-6 md:px-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                            {STATS.map((stat, i) => (
                                <div key={i} className="p-10 rounded-[3rem] bg-card border-4 border-border flex flex-col items-center text-center gap-6 hover:scale-105 transition-all duration-700 shadow-premium group relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className={`size-20 rounded-[1.5rem] ${stat.bg} flex items-center justify-center group-hover:-translate-y-4 transition-all duration-700 shadow-lg border-2 border-current/10 relative z-10`}>
                                        <stat.icon className={`size-10 ${stat.color}`} />
                                    </div>
                                    <div className="relative z-10">
                                        <p className={`text-6xl font-black italic tracking-tighter ${stat.color} leading-none`}>{stat.val}</p>
                                        <p className="text-executive-label font-black uppercase tracking-[0.3em] text-muted-foreground/40 mt-4 italic">{stat.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════
                    NOTRE HISTOIRE (EXECUTIVE LAYOUT)
                ══════════════════════════════════════════════════ */}
                <section className="py-40 max-w-7xl mx-auto px-6 md:px-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
                        <div className="space-y-12">
                            <div>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="size-4 rounded-full bg-primary animate-pulse shadow-[0_0_12px_rgba(43,90,255,0.6)]" />
                                    <span className="text-executive-label font-black text-primary uppercase tracking-[0.4em] italic">Genèse Mutuelle</span>
                                </div>
                                <h2 className="text-6xl md:text-8xl font-black italic tracking-tighter text-foreground leading-[0.85] uppercase">
                                    Une vision <br /> <span className="text-primary underline decoration-primary/20 decoration-8 underline-offset-4 inline-block mt-4">radicale.</span>
                                </h2>
                            </div>
                            
                            <div className="space-y-8 text-muted-foreground/60 font-bold uppercase tracking-widest text-sm leading-relaxed border-l-8 border-primary/20 pl-10 italic max-w-2xl">
                                <p>
                                    Fondée sur l'analyse approfondie des frictions de l'e-commerce en Afrique de l'Ouest, BCA Connect n'est pas qu'une plateforme, c'est une <strong className="text-foreground">infrastructure de souveraineté numérique</strong>.
                                </p>
                                <p>
                                    Notre protocole d'ingénierie résout la volatilité des réseaux télécoms via un système de synchronisation asynchrone propriétaire, garantissant l'intégrité des transactions même hors-ligne.
                                </p>
                                <p className="text-foreground mt-6 text-lg border-t-2 border-border pt-6">
                                    Aujourd'hui, nous redéfinissons les standards : <strong className="text-primary italic">fluidité absolue, sécurité cryptographique, et architecture hautement résiliente.</strong>
                                </p>
                            </div>
                            <Link to="/register" className="inline-block pt-6">
                                <Button className="h-20 px-12 rounded-[2rem] font-black uppercase tracking-[0.3em] text-xs gap-6 shadow-premium-lg shadow-primary/20 hover:scale-110 transition-transform bg-foreground text-background border-4 border-foreground hover:bg-background hover:text-foreground">
                                    Integrer l'Écosystème <ArrowRight className="size-6" />
                                </Button>
                            </Link>
                        </div>
                        
                        {/* Executive Image Container */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-primary/20 blur-[150px] rounded-full group-hover:bg-primary/30 transition-colors duration-1000 opacity-40" />
                            <div className="aspect-[4/5] rounded-[4rem] bg-card border-4 border-border overflow-hidden relative z-10 shadow-premium-lg">
                                <img src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=800"
                                    alt="L'équipe fondatrice BCA Connect" 
                                    className="w-full h-full object-cover opacity-60 mix-blend-luminosity group-hover:scale-105 group-hover:opacity-80 transition-all duration-1000" />
                                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                                
                                {/* Overlay Content */}
                                <div className="absolute bottom-16 left-16 right-16">
                                    <div className="w-20 h-2 bg-primary mb-8 rounded-full" />
                                    <p className="text-executive-label font-black uppercase tracking-[0.4em] text-primary italic">Board Fondateur</p>
                                    <p className="text-4xl font-black italic text-foreground mt-4 leading-[1.1] tracking-tighter uppercase underline decoration-primary/20 decoration-4">Bâtir l'infrastructure de la confiance.</p>
                                </div>
                            </div>
                            
                            {/* Floating Executive Badge */}
                            <div className="absolute top-12 -right-12 bg-card border-4 border-border rounded-[3rem] p-10 shadow-premium-lg z-20 animate-bounce duration-[6000ms] backdrop-blur-3xl">
                                <p className="text-executive-label font-black uppercase tracking-[0.4em] text-muted-foreground/30 italic">Quartier Général</p>
                                <p className="font-black text-foreground italic text-3xl mt-4 tracking-tighter uppercase leading-none">Conakry, GN</p>
                                <div className="mt-6 flex gap-2">
                                    {[1,2,3].map(i => <div key={i} className="size-2 rounded-full bg-primary" />)}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════
                    NOS VALEURS (EXECUTIVE)
                ══════════════════════════════════════════════════ */}
                <section className="bg-card border-y-8 border-border py-40 relative overflow-hidden">
                     {/* Background Decorative */}
                     <div className="absolute right-0 top-1/2 -translate-y-1/2 size-[70rem] bg-primary/5 rounded-full blur-[200px] -z-10" />
                     
                    <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-28 relative z-10">
                        <div className="text-center space-y-6">
                            <span className="text-executive-label font-black text-primary uppercase tracking-[0.4em] italic leading-none">Principes Cardinaux</span>
                            <h2 className="text-6xl md:text-9xl font-black italic tracking-tighter text-foreground uppercase leading-[0.8] drop-shadow-xl">
                                Fondations <br/> <span className="text-primary underline decoration-primary/10 decoration-8 underline-offset-[-8px]">Inébranlables.</span>
                            </h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                            {VALUES.map((v, i) => (
                                <div key={i} className="p-10 rounded-[3.5rem] bg-background border-4 border-border hover:border-primary/50 transition-all duration-700 group hover:shadow-premium-lg hover:-translate-y-4 flex flex-col justify-between h-full relative overflow-hidden">
                                    <div className="absolute inset-x-0 bottom-0 h-2 bg-primary/0 group-hover:bg-primary transition-all duration-700"></div>
                                    <div className="relative z-10">
                                        <div className={`size-20 rounded-[1.5rem] bg-card border-2 border-border flex items-center justify-center mb-10 group-hover:bg-primary/5 group-hover:border-primary/20 transition-all duration-700 shadow-inner`}>
                                            <v.icon className={`size-10 ${v.color} group-hover:scale-110 transition-transform`} />
                                        </div>
                                        <h3 className="text-3xl font-black italic tracking-tight text-foreground mb-6 uppercase leading-tight">{v.title}</h3>
                                        <div className="w-12 h-2 bg-primary/10 mb-8 rounded-full group-hover:w-20 group-hover:bg-primary transition-all duration-700" />
                                        <p className="text-muted-foreground/60 text-sm font-bold uppercase tracking-widest leading-loose italic">{v.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════
                    L'ÉQUIPE DIRIGEANTE
                ══════════════════════════════════════════════════ */}
                <section className="py-40 max-w-7xl mx-auto px-6 md:px-12">
                    <div className="text-center space-y-6 mb-32">
                        <span className="text-executive-label font-black text-primary uppercase tracking-[0.4em] italic leading-none">Directoire</span>
                        <h2 className="text-6xl md:text-9xl font-black italic tracking-tighter text-foreground uppercase leading-[0.8] drop-shadow-2xl">
                            L'Élite <br /> Opérationnelle.
                        </h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-12">
                        {TEAM.map((member, i) => (
                            <div key={i} className="group text-center">
                                <div className="relative mx-auto w-72 h-80 mb-12">
                                    {/* Abstract background shape */}
                                    <div className="absolute inset-0 bg-accent/20 rounded-[4rem] rotate-6 group-hover:rotate-12 transition-all duration-1000 border-4 border-border shadow-inner" />
                                    
                                    <div className="relative w-full h-full rounded-[3.5rem] overflow-hidden border-8 border-background shadow-premium-lg z-10">
                                        <img src={member.img} alt={member.name} className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000 brightness-90 group-hover:brightness-110" />
                                        <div className="absolute inset-0 bg-primary/10 opacity-40 mix-blend-overlay group-hover:opacity-0 transition-opacity"></div>
                                    </div>
                                    
                                    {/* Role Badge */}
                                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-foreground text-background px-10 py-4 rounded-[1.5rem] z-20 shadow-premium-lg whitespace-nowrap border-4 border-background italic tracking-[0.2em] font-black text-xs uppercase">
                                        {member.role}
                                    </div>
                                </div>
                                
                                <div className="pt-4">
                                    <h3 className="text-4xl font-black italic tracking-tighter text-foreground uppercase drop-shadow-sm leading-none">{member.name}</h3>
                                    <div className="flex items-center justify-center gap-4 mt-6">
                                        <div className="w-8 h-1 bg-primary rounded-full group-hover:w-12 transition-all" />
                                        <p className="text-muted-foreground/40 text-executive-label font-black uppercase tracking-widest italic">{member.expertise}</p>
                                        <div className="w-8 h-1 bg-primary rounded-full group-hover:w-12 transition-all" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════
                    EXECUTIVE CTA
                ══════════════════════════════════════════════════ */}
                <section className="relative bg-foreground py-40 overflow-hidden mx-6 md:mx-12 rounded-[5rem] mb-20 shadow-premium-lg border-x-8 border-primary/20">
                    <div className="absolute inset-0">
                        {/* Dark radial gradient for contrast */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,theme(colors.primary.DEFAULT/0.3),transparent_70%)] opacity-30" />
                        <div className="absolute inset-0 opacity-[0.05]" style={{
                            backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
                            backgroundSize: '6rem 6rem'
                        }} />
                        <div className="absolute top-0 right-0 size-[50rem] bg-primary/20 rounded-full blur-[200px] mix-blend-screen opacity-40" />
                    </div>
                    
                    <div className="relative z-10 text-center space-y-16 px-10 max-w-5xl mx-auto">
                        <span className="inline-flex items-center gap-4 px-8 py-4 bg-background/5 border-2 border-background/10 text-background text-executive-label font-black uppercase tracking-[0.5em] rounded-full backdrop-blur-3xl italic">
                            <Smartphone className="size-6 text-primary animate-pulse" /> L'EXCELLENCE N'ATTEND PAS
                        </span>
                        
                        <h2 className="text-7xl md:text-9xl font-black text-background italic tracking-tighter uppercase leading-[0.8] drop-shadow-2xl">
                            Déployez la <br />
                            <span className="text-primary not-italic underline decoration-primary/30 decoration-8 underline-offset-[-4px]">Puissance.</span>
                        </h2>
                        
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-10 pt-12">
                            <Link to="/register">
                                <Button className="h-24 px-20 rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-sm shadow-premium-lg shadow-primary/20 gap-8 hover:scale-110 transition-transform group relative overflow-hidden bg-background text-foreground border-4 border-background hover:bg-transparent hover:text-background active:scale-95 duration-500">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/30 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                                    Initialiser le Compte <ArrowRight className="size-8 group-hover:translate-x-4 transition-transform" />
                                </Button>
                            </Link>
                            <Link to="/contact">
                                <Button variant="outline" className="h-24 px-20 rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-sm border-4 border-background/20 text-background hover:bg-background/10 hover:border-background transition-all hover:scale-105 active:scale-95 duration-500 italic">
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
