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
            <div className="font-inter pb-20">

                {/* ══ HERO ══ */}
                <section className="relative min-h-[70vh] flex items-center overflow-hidden bg-slate-950">
                    <div className="absolute inset-0">
                        <div className="absolute top-0 left-1/4 size-[600px] bg-primary/10 rounded-full blur-[150px]" />
                        <div className="absolute bottom-0 right-1/4 size-[400px] bg-blue-600/8 rounded-full blur-[120px]" />
                        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#ea580c_1px,transparent_1px)] bg-[size:32px_32px]" />
                    </div>
                    <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-24 text-center space-y-8">
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-primary/20">
                            <MapPin className="size-3" /> Conakry, Guinée · Fondé en 2024
                        </span>
                        <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none uppercase">
                            Le Commerce <br />
                            <span className="bg-gradient-to-r from-primary to-amber-400 bg-clip-text text-transparent">Guinéen</span>
                            <br /> Réinventé.
                        </h1>
                        <p className="text-slate-400 text-lg md:text-xl font-medium max-w-3xl mx-auto leading-relaxed">
                            BCA Connect est la première marketplace Fintech de Guinée combinant un système de paiement sécurisé,
                            une IA de confiance, et une infrastructure hors-ligne. Notre mission: donner à chaque entrepreneur guinéen
                            les outils d'une entreprise moderne.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to="/register">
                                <Button className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-sm shadow-2xl shadow-primary/30 gap-2">
                                    Rejoindre la communauté <ArrowRight className="size-4" />
                                </Button>
                            </Link>
                            <Link to="/catalog">
                                <Button variant="outline" className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-xs border-white/10 text-white hover:bg-white/10">
                                    Explorer le catalogue
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ══ STATISTIQUES ══ */}
                <section className="bg-card border-y border-border py-16">
                    <div className="max-w-7xl mx-auto px-4 md:px-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {STATS.map((stat, i) => (
                                <div key={i} className={`p-6 rounded-[1.5rem] border ${stat.bg} flex flex-col items-center text-center gap-3 hover:scale-105 transition-transform duration-300`}>
                                    <div className={`size-12 rounded-2xl ${stat.bg} border flex items-center justify-center`}>
                                        <stat.icon className={`size-6 ${stat.color}`} />
                                    </div>
                                    <div>
                                        <p className={`text-4xl font-black italic tracking-tighter ${stat.color}`}>{stat.val}</p>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-1">{stat.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ══ NOTRE HISTOIRE ══ */}
                <section className="py-24 max-w-7xl mx-auto px-4 md:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <div>
                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Notre Histoire</span>
                                <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter text-foreground leading-none mt-2 uppercase">
                                    Nés d'un problème <br /> <span className="text-primary">réel.</span>
                                </h2>
                            </div>
                            <div className="space-y-5 text-muted-foreground font-medium leading-relaxed">
                                <p>
                                    En 2024, face à la difficulté des entrepreneurs guinéens d'accéder à des outils de vente en ligne fiables,
                                    une équipe de développeurs locaux a créé BCA Connect.
                                </p>
                                <p>
                                    Le défi était double : créer une plateforme capable de fonctionner avec des connexions instables (mode hors-ligne),
                                    tout en intégrant un système financier sécurisé adapté aux réalités locales (Mobile Money, espèces).
                                </p>
                                <p>
                                    Aujourd'hui, BCA Connect est la première solution africaine à combiner <strong className="text-foreground">marketplace,
                                        portefeuille virtuel sécurisé, et intelligence artificielle de détection de fraude</strong> dans une même plateforme.
                                </p>
                            </div>
                            <Link to="/register">
                                <Button className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-sm gap-2 shadow-xl shadow-primary/20">
                                    Faire partie de l'histoire <ArrowRight className="size-4" />
                                </Button>
                            </Link>
                        </div>
                        <div className="relative">
                            <div className="aspect-square rounded-[3rem] bg-gradient-to-br from-primary/20 via-slate-900 to-slate-800 border border-border overflow-hidden relative">
                                <img src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=600"
                                    alt="L'équipe BCA Connect" className="w-full h-full object-cover opacity-60 mix-blend-luminosity" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent" />
                                <div className="absolute bottom-8 left-8 right-8">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">BCA Connect</p>
                                    <p className="text-2xl font-black italic text-white mt-1 leading-tight">L'équipe fondatrice, Conakry 2024</p>
                                </div>
                            </div>
                            {/* Floating badge */}
                            <div className="absolute -top-5 -right-5 bg-card border border-border rounded-2xl px-5 py-4 shadow-2xl">
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Basé à</p>
                                <p className="font-black text-foreground italic text-lg mt-0.5">Conakry, GN 🇬🇳</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══ NOS VALEURS ══ */}
                <section className="bg-muted/20 border-y border-border py-24">
                    <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-14">
                        <div className="text-center space-y-3">
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Ce qui nous anime</span>
                            <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter text-foreground uppercase">
                                Nos Valeurs
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {VALUES.map((v, i) => (
                                <div key={i} className="p-8 rounded-[2rem] bg-card border border-border hover:border-primary/30 transition-all duration-300 group hover:shadow-2xl hover:shadow-primary/5">
                                    <div className={`size-14 rounded-2xl bg-card border border-border flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                        <v.icon className={`size-7 ${v.color}`} />
                                    </div>
                                    <h3 className="text-xl font-black italic tracking-tight text-foreground mb-3">{v.title}</h3>
                                    <p className="text-muted-foreground font-medium leading-relaxed">{v.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ══ L'ÉQUIPE ══ */}
                <section className="py-24 max-w-7xl mx-auto px-4 md:px-8">
                    <div className="text-center space-y-3 mb-14">
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Les bâtisseurs</span>
                        <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter text-foreground uppercase">L'Équipe</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {TEAM.map((member, i) => (
                            <div key={i} className="group text-center space-y-5">
                                <div className="relative mx-auto w-40 h-40">
                                    <div className="w-full h-full rounded-[2rem] overflow-hidden border-4 border-border group-hover:border-primary/40 transition-all duration-500 shadow-2xl">
                                        <img src={member.img} alt={member.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 size-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                                        <Award className="size-5 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black italic tracking-tight text-foreground">{member.name}</h3>
                                    <p className="text-primary text-[10px] font-black uppercase tracking-widest mt-1">{member.role}</p>
                                    <p className="text-muted-foreground text-xs font-medium mt-2">{member.expertise}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ══ CTA ══ */}
                <section className="relative bg-slate-950 py-24 overflow-hidden mx-4 md:mx-8 rounded-[3rem] mb-8">
                    <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#ea580c_1px,transparent_1px)] bg-[size:24px_24px] rounded-[3rem]" />
                    <div className="absolute top-0 left-1/3 size-80 bg-primary/10 rounded-full blur-[120px]" />
                    <div className="relative z-10 text-center space-y-8 px-4">
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.25em] rounded-full border border-primary/20">
                            <Smartphone className="size-3" /> Disponible maintenant
                        </span>
                        <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none">
                            Prêt à transformer <br />
                            <span className="text-primary not-italic">votre business ?</span>
                        </h2>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to="/register">
                                <Button className="h-16 px-12 rounded-2xl font-black uppercase tracking-widest text-sm shadow-2xl shadow-primary/30 gap-2">
                                    Créer mon compte gratuit <ArrowRight className="size-4" />
                                </Button>
                            </Link>
                            <Link to="/contact">
                                <Button variant="outline" className="h-16 px-12 rounded-2xl font-black uppercase tracking-widest text-xs border-white/10 text-white hover:bg-white/10">
                                    Nous contacter
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
