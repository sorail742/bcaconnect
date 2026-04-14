import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "../ui/Button"
import { 
    Search, Camera, ArrowRight, Zap, TrendingUp, Shield, Users, 
    CreditCard, Activity, Globe, Cpu, Rocket, Sparkles, Star, Target
} from "lucide-react"
import { Link } from "react-router-dom"
import statService from "../../services/statService"
import { useLanguage } from "../../context/LanguageContext"
import GeometricBackground from '../ui/GeometricBackground';
import { HeroCarousel } from "./HeroCarousel"
import { cn } from "../../lib/utils"

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
        opacity: 1,
        transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 60, filter: "blur(10px)" },
    visible: { 
        opacity: 1, 
        y: 0, 
        filter: "blur(0px)",
        transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] }
    }
};

export function Hero() {
    const { t, lang } = useLanguage();
    const [stats, setStats] = useState({
        users: "10K+",
        vendors: "500+",
        transactions: "50K+",
        satisfaction: "99%"
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await statService.getAdminStats();
                if (data) {
                    setStats({
                        users: `${(data.totalUsers || 0).toLocaleString()}+`,
                        vendors: `${(data.totalVendors || 0).toLocaleString()}+`,
                        transactions: `${(data.totalOrders || 0).toLocaleString()}+`,
                        satisfaction: "99.8%"
                    });
                }
            } catch (error) {
                console.error("Failed to fetch landing stats", error);
            }
        };
        fetchStats();
    }, []);

    return (
        <section className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden bg-background">
            <GeometricBackground />
            
            {/* Immersive Backgrounds */}
            <div className="absolute inset-x-0 bottom-0 h-[30vh] bg-gradient-to-t from-background via-background/80 to-transparent z-10" />
            <HeroCarousel />

            <div className="container mx-auto px-6 md:px-12 relative z-20">
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col items-center text-center"
                >
                    {/* Floating Tech Badge */}
                    <motion.div
                        variants={itemVariants}
                        className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-2xl bg-primary/10 backdrop-blur-3xl border border-primary/20 text-primary mb-12 shadow-2xl shadow-primary/5"
                    >
                        <Sparkles className="size-4 animate-pulse fill-current" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] font-jakarta">{t('badgeText') || "Ecosysteme Industriel v4.0"}</span>
                    </motion.div>

                    {/* Master Narrative - Outfit Black */}
                    <motion.h1 
                        variants={itemVariants}
                        className="text-5xl md:text-8xl lg:text-[9rem] font-black tracking-[-0.05em] leading-[1.05] text-white max-w-7xl uppercase mb-10 text-center drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                        {t('heroTitle1')} <br />
                        <span className="text-primary italic drop-shadow-[0_0_20px_rgba(255,102,0,0.3)]">
                            {t('heroTitle2')}
                        </span> <br />
                        <span className="text-white">{t('heroTitle3')}</span>
                    </motion.h1>

                    {/* Description Architecture */}
                    <motion.div variants={itemVariants} className="max-w-3xl mx-auto space-y-8 mb-16">
                        <p className="text-xl md:text-2xl text-white/90 font-medium leading-[1.4] tracking-tight drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
                            {t('heroDesc') || "L'infrastructure technologique ultime fusionnant logistique prédictive, finance inclusive et commerce global."}
                        </p>
                        
                        <div className="flex flex-wrap justify-center gap-4">
                            {[
                                { label: "Performance IA", icon: Cpu },
                                { label: "Sécurité Militaire", icon: Shield },
                                { label: "Sync Temps Réel", icon: Activity },
                            ].map((tag, i) => (
                                <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
                                    <tag.icon className="size-3.5 text-primary" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white">{tag.label}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Action Hub */}
                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-24 w-full">
                        <Link to="/marketplace" className="w-full sm:w-auto">
                            <button className="w-full sm:w-auto h-20 px-12 bg-primary text-white font-black text-sm uppercase tracking-[0.3em] rounded-[1.5rem] shadow-[0_30px_60px_-15px_rgba(255,102,0,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 border border-white/20">
                                EXPLORER LE MARCHÉ
                                <ArrowRight className="size-5" />
                            </button>
                        </Link>
                        <Link to="/register" className="w-full sm:w-auto">
                            <button className="w-full sm:w-auto h-20 px-12 bg-white/5 border-2 border-white/10 backdrop-blur-3xl text-foreground font-black text-sm uppercase tracking-[0.3em] rounded-[1.5rem] hover:bg-white/10 hover:border-primary/20 transition-all flex items-center justify-center gap-3">
                                <Rocket className="size-5 text-primary" />
                                CRÉER UN COMPTE
                            </button>
                        </Link>
                    </motion.div>

                    {/* Bento Performance Grid */}
                    <motion.div 
                        variants={itemVariants}
                        className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 w-full max-w-6xl"
                    >
                        {[
                            { label: t('users') || "Utilisateurs Actifs", val: stats.users, icon: Users, sub: "Guinée & Diaspora" },
                            { label: t('merchants') || "Partenaires PME", val: stats.vendors, icon: Store, sub: "Vendeurs Certifiés" },
                            { label: t('transactions') || "Flux de Commandes", val: stats.transactions, icon: CreditCard, sub: "Volume Hebdomadaire" },
                            { label: t('satisfaction') || "Confiance Client", val: stats.satisfaction, icon: Target, sub: "SLA Garanti", highlight: true },
                        ].map((stat, i) => (
                            <div 
                                key={i}
                                className={cn(
                                    "relative p-8 rounded-[2.5rem] border transition-all duration-700 hover:-translate-y-4 group overflow-hidden",
                                    stat.highlight 
                                        ? "bg-primary border-primary shadow-2xl shadow-primary/20" 
                                        : "bg-card/40 backdrop-blur-3xl border-border hover:border-primary/30"
                                )}
                            >
                                {/* Static Ambient glow */}
                                <div className="absolute -right-4 -top-4 size-24 bg-white/5 blur-3xl rounded-full" />
                                
                                <div className={cn(
                                    "size-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500",
                                    stat.highlight ? "bg-white/20 text-white" : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white"
                                )}>
                                    <stat.icon className="size-7" />
                                </div>

                                <div className="text-left space-y-1">
                                    <h3 className={cn("text-3xl md:text-4xl font-black tracking-tighter tabular-nums", stat.highlight ? "text-white" : "text-foreground")}>
                                        {stat.val}
                                    </h3>
                                    <p className={cn("text-[11px] font-black uppercase tracking-widest", stat.highlight ? "text-white/80" : "text-foreground")}>
                                        {stat.label}
                                    </p>
                                    <div className={cn("flex items-center gap-2 pt-2 opacity-50", stat.highlight ? "text-white" : "text-muted-foreground")}>
                                        <div className="size-1 rounded-full bg-current animate-pulse" />
                                        <p className="text-[9px] font-bold uppercase tracking-tight">{stat.sub}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </motion.div>
            </div>
            
            {/* Structural Overlays */}
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent z-10" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,102,0,0.02)_0%,transparent_70%)] pointer-events-none" />
        </section>
    )
}

function Store({ className }) {
    return (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h18v2H3V3zm1 4h16l1 12H3L4 7zm4 4v2m4-2v2m4-2v2" />
        </svg>
    );
}
