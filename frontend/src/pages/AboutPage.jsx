import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useSpring, useTransform, animate } from 'framer-motion';
import { Button } from '../components/ui/Button';
import {
    ShieldCheck, Zap, Users, Heart,
    Globe, ArrowRight, Star, Award, Building2
} from 'lucide-react';
import { useLanguage } from '../context/useLanguage';
import BcaLogo from '../components/ui/BcaLogo';
import { cn } from '../lib/utils';
import statService from '../services/statService';
import AnimatedCounter from '../components/ui/AnimatedCounter';

const AboutPage = () => {
    const { t } = useLanguage();
    const [dynamicStats, setDynamicStats] = useState({
        users: '50K+',
        vendors: '1.2K+',
        satisfaction: '98.4%',
        transactions: '15M+'
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await statService.getAdminStats();
                if (data && data.stats && data.overview) {
                    const totalUsers = data.stats[0]?.value || 0;
                    const totalVendors = data.overview.totalFournisseurs || data.overview.storesCount || 0;
                    const totalOrders = data.overview.total_orders || 0;

                    setDynamicStats({
                        users: totalUsers > 1000 ? `${(totalUsers/1000).toFixed(0)}K+` : `${totalUsers}+`,
                        vendors: totalVendors > 1000 ? `${(totalVendors/1000).toFixed(1)}K+` : `${totalVendors}+`,
                        transactions: totalOrders > 1000000 ? `${(totalOrders/1000000).toFixed(1)}M+` : 
                                     totalOrders > 1000 ? `${(totalOrders/1000).toFixed(0)}K+` : `${totalOrders}+`,
                        satisfaction: `${data.overview.satisfaction_rate || '98.4'}%`
                    });
                }
            } catch (error) {
                console.error("Failed to fetch about stats", error);
            }
        };
        fetchStats();
    }, []);

    const STATS = [
        { val: dynamicStats.users, label: "Utilisateurs Actifs", icon: Users },
        { val: dynamicStats.vendors, label: "Boutiques Partenaires", icon: Building2 },
        { val: dynamicStats.satisfaction, label: "Taux de Satisfaction", icon: Star },
        { val: dynamicStats.transactions, label: "Transactions Sécurisées", icon: ShieldCheck },
    ];

    const TEAM = [
        { name: 'Mamadou Keita', role: 'CEO & Fondateur', img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400' },
        { name: 'Fatoumata Diallo', role: 'Directrice Opérations', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400' },
        { name: 'Ibrahim Camara', role: 'CTO', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400' },
    ];

    const VALUES = [
        { icon: ShieldCheck, title: "Sécurité Absolue", desc: "Notre système de séquestre protège 100% des transactions sur la plateforme.", color: "text-emerald-500", bg: "bg-emerald-50" },
        { icon: Zap, title: "Innovation", desc: "Nous utilisons l'IA et le Big Data pour optimiser chaque chaîne de valeur.", color: "text-[#FF6600]", bg: "bg-orange-50" },
        { icon: Heart, title: "Inclusion", desc: "Nous démocratisons l'accès au e-commerce pour tous les guinéens.", color: "text-rose-500", bg: "bg-rose-50" },
        { icon: Globe, title: "Standard Global", desc: "Une qualité de service comparable aux plus grands hubs mondiaux.", color: "text-blue-500", bg: "bg-blue-50" },
    ];

    const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

    return (
        <div className="bg-background min-h-screen font-jakarta text-foreground">
            {/* ══ HERO SECTION ══ */}
            <section className="relative pt-32 pb-24 overflow-hidden border-b border-border bg-muted/20">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-5xl mx-auto px-6 text-center space-y-8 relative z-10"
                >
                    <div className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-black text-[10px] uppercase tracking-[0.2em] shadow-lg">
                        <Globe className="size-3.5" /> Écosystème Global
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-foreground leading-[0.9]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Hub E-commerce Unifié <br className="hidden md:block"/>
                        de <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-[#FF6600] to-rose-500">Guinée.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-medium">
                        BCA Connect n'est pas qu'une simple place de marché. C'est une infrastructure 
                        technologique complète qui connecte acheteurs, vendeurs, transporteurs et banques 
                        sur un réseau transactionnel hautement sécurisé.
                    </p>
                </motion.div>
            </section>

            {/* ══ STATS SECTION ══ */}
            <section className="py-16 relative z-20 -mt-12">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-6"
                    >
                        {STATS.map((stat, i) => (
                            <motion.div key={i} variants={itemVariants} className="bg-card p-8 rounded-[2rem] shadow-2xl border border-border flex flex-col items-center text-center hover:-translate-y-2 hover:shadow-primary/20 transition-all duration-300 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 size-24 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
                                <div className="text-5xl font-black text-foreground mb-3 tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                    <AnimatedCounter value={stat.val} delay={i * 0.1} />
                                </div>
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ══ VALUES ══ */}
            <section className="py-24 bg-background">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-4xl font-black text-foreground uppercase tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>Nos Valeurs Technologiques</h2>
                        <p className="text-base font-medium text-muted-foreground">Ce qui fait de BCA Connect un standard de classe mondiale.</p>
                    </div>

                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                    >
                        {VALUES.map((v, i) => (
                            <motion.div key={i} variants={itemVariants} className="p-8 rounded-[2rem] bg-card border border-border hover:shadow-2xl hover:border-primary/30 transition-all group overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className={cn(`size-16 rounded-2xl flex items-center justify-center mb-8 shadow-inner border relative z-10`, v.bg === 'bg-emerald-50' ? 'bg-emerald-500/10 border-emerald-500/20' : v.bg === 'bg-orange-50' ? 'bg-[#FF6600]/10 border-[#FF6600]/20' : v.bg === 'bg-rose-50' ? 'bg-rose-500/10 border-rose-500/20' : 'bg-blue-500/10 border-blue-500/20')}>
                                    <v.icon className={cn(`size-8`, v.color)} />
                                </div>
                                <h3 className="text-xl font-black text-foreground mb-4 uppercase tracking-tighter relative z-10">{v.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed font-medium relative z-10">{v.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ══ TEAM ══ */}
            <section className="py-24 bg-muted/20 border-t border-border">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-4xl font-black text-foreground uppercase tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>Notre Équipe Dirigeante</h2>
                        <p className="text-base font-medium text-muted-foreground">Des experts dédiés à la réussite de l'écosystème numérique africain.</p>
                    </div>

                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8"
                    >
                        {TEAM.map((member, i) => (
                            <motion.div key={i} variants={itemVariants} className="group cursor-pointer">
                                <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden mb-6 shadow-2xl border border-border">
                                    <img src={member.img} alt={member.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                                </div>
                                <div className="px-2 text-center md:text-left">
                                    <h3 className="text-2xl font-black text-foreground tracking-tighter uppercase">{member.name}</h3>
                                    <p className="text-[11px] font-black text-primary mt-1.5 uppercase tracking-[0.2em]">{member.role}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ══ CALL TO ACTION ══ */}
            <section className="py-32 bg-background relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
                <div className="max-w-5xl mx-auto px-6 relative z-10">
                    <div className="bg-foreground rounded-[3rem] p-12 md:p-20 text-center shadow-2xl border border-border relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay" />
                        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                        
                        <div className="relative z-10 space-y-10">
                            <h2 className="text-4xl md:text-6xl font-black text-background tracking-tighter leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                Prêt à rejoindre <br/> l'avenir du commerce ?
                            </h2>
                            <p className="text-lg text-background/70 max-w-2xl mx-auto font-medium">
                                Que vous soyez acheteur, vendeur ou transporteur, notre infrastructure est conçue pour propulser votre croissance à l'échelle mondiale.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
                                <Link to="/register">
                                    <Button className="h-16 px-10 bg-primary text-white hover:bg-primary/90 hover:scale-105 active:scale-95 rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all text-xs">
                                        Créer un compte
                                    </Button>
                                </Link>
                                <Link to="/contact">
                                    <Button variant="outline" className="h-16 px-10 bg-transparent text-background border-background/20 hover:bg-background/10 hover:border-background/50 rounded-2xl font-black uppercase tracking-widest transition-all text-xs">
                                        Nous contacter
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;
