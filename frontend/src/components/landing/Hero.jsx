import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
    ArrowRight, Shield, Users, 
    CreditCard, Activity, Cpu, Rocket, Target, LayoutDashboard
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import statService from "../../services/statService"
import { useLanguage } from "../../context/LanguageContext"
import { useAuth } from "../../hooks/useAuth"
import GeometricBackground from '../ui/GeometricBackground';
import { HeroCarousel } from "./HeroCarousel"
import { cn } from "../../lib/utils"
import AnimatedCounter from "../ui/AnimatedCounter"

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
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
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
                if (data && data.stats && data.overview) {
                    const totalUsers = data.stats[0]?.value || 0;
                    const totalVendors = data.overview.totalFournisseurs || data.overview.storesCount || 0;
                    const totalOrders = data.overview.total_orders || 0;

                    setStats({
                        users: totalUsers > 0
                            ? `${totalUsers.toLocaleString()}+`
                            : "10K+",
                        vendors: totalVendors > 0
                            ? `${totalVendors.toLocaleString()}+`
                            : "500+",
                        transactions: totalOrders > 0
                            ? `${totalOrders.toLocaleString()}+`
                            : "50K+",
                        satisfaction: `${data.overview.satisfaction_rate || '99'}%`
                    });
                }
            } catch (error) {
                console.error("Failed to fetch landing stats", error);
            }
        };
        fetchStats();
    }, []);

    return (
        <section className="relative min-h-[110vh] flex items-center pt-32 pb-32 overflow-hidden bg-background">
            <GeometricBackground />
            
            {/* Immersive Backgrounds & Depth Layers */}
            <div className="absolute inset-x-0 bottom-0 h-[40vh] bg-gradient-to-t from-background via-background/90 to-transparent z-10" />
            <HeroCarousel />

            <div className="container mx-auto px-6 md:px-12 relative z-20">
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col items-center text-center"
                >
                    {/* Floating Tech Badge - Quantum Signature */}
                    <motion.div
                        variants={itemVariants}
                        className="inline-flex items-center gap-3 px-8 py-3 rounded-[2rem] bg-white/5 backdrop-blur-3xl border border-white/10 text-primary mb-16 shadow-[0_20px_50px_rgba(0,0,0,0.1)] group hover:border-primary/40 transition-all cursor-default"
                    >
                        <div className="size-2 rounded-full bg-primary animate-ping" />
                        <span className="text-[11px] font-black uppercase tracking-[0.4em] font-jakarta">{t('badgeText') || "Ecosysteme Industriel v5.0"}</span>
                    </motion.div>

                    {/* Master Narrative - Ultra High Density Typography */}
                    <motion.h1 
                        variants={itemVariants}
                        className="text-4xl sm:text-6xl md:text-8xl lg:text-[8rem] font-black tracking-[-0.07em] leading-[1.0] text-foreground dark:text-white max-w-[90rem] uppercase mb-12 text-center"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                        {t('heroTitle1')} <br />
                        <span className="text-primary italic relative inline-block">
                            {t('heroTitle2')}
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ delay: 1.5, duration: 1 }}
                                className="absolute -bottom-4 left-0 h-4 bg-primary/20 blur-xl -z-10" 
                            />
                        </span> <br />
                        <span className="text-foreground dark:text-white drop-shadow-2xl">{t('heroTitle3')}</span>
                    </motion.h1>

                    {/* Description Architecture - Precision Narrative */}
                    <motion.div variants={itemVariants} className="max-w-4xl mx-auto space-y-12 mb-20">
                        <p className="text-2xl md:text-3xl text-foreground/60 dark:text-white/70 font-medium leading-[1.3] tracking-tight max-w-2xl mx-auto">
                            {t('heroDesc') || "L'infrastructure technologique ultime fusionnant logistique prédictive, finance inclusive et commerce global."}
                        </p>
                        
                        <div className="flex flex-wrap justify-center gap-6">
                            {[
                                { label: "Performance IA", icon: Cpu, color: "text-blue-500" },
                                { label: "Sécurité Militaire", icon: Shield, color: "text-emerald-500" },
                                { label: "Sync Temps Réel", icon: Activity, color: "text-rose-500" },
                            ].map((tag, i) => (
                                <motion.div 
                                    key={i} 
                                    whileHover={{ y: -5 }}
                                    className="flex items-center gap-3 px-6 py-3 rounded-[1.5rem] bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl hover:border-white/20 transition-all"
                                >
                                    <tag.icon className={cn("size-4", tag.color)} />
                                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground dark:text-white">{tag.label}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Action Hub - High Contrast Decision Matrix */}
                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20 w-full">
                        <button
                            onClick={() => navigate('/marketplace')}
                            className="w-full sm:w-auto h-16 sm:h-24 px-12 sm:px-16 bg-primary text-primary-foreground font-black text-sm uppercase tracking-[0.4em] rounded-[1.5rem] sm:rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(255,102,0,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 border border-white/20 group"
                        >
                            EXPLORER LE MARCHÉ
                            <ArrowRight className="size-5 sm:size-6 group-hover:translate-x-2 transition-transform" />
                        </button>
                        {isAuthenticated ? (
                            <button
                                onClick={() => navigate(
                                    user?.role === 'admin' ? '/admin/dashboard'
                                    : user?.role === 'fournisseur' ? '/vendor/dashboard'
                                    : '/dashboard'
                                )}
                                className="w-full sm:w-auto h-16 sm:h-24 px-12 sm:px-16 bg-white/5 border-2 border-white/10 backdrop-blur-3xl text-foreground font-black text-sm uppercase tracking-[0.4em] rounded-[1.5rem] sm:rounded-[2.5rem] hover:bg-white/10 hover:border-primary/30 transition-all flex items-center justify-center gap-4 group"
                            >
                                <LayoutDashboard className="size-5 sm:size-6 text-primary group-hover:scale-110 transition-transform" />
                                MON ESPACE
                            </button>
                        ) : (
                            <button
                                onClick={() => navigate('/register')}
                                className="w-full sm:w-auto h-16 sm:h-24 px-12 sm:px-16 bg-white/5 border-2 border-white/10 backdrop-blur-3xl text-foreground font-black text-sm uppercase tracking-[0.4em] rounded-[1.5rem] sm:rounded-[2.5rem] hover:bg-white/10 hover:border-primary/30 transition-all flex items-center justify-center gap-4 group"
                            >
                                <Rocket className="size-5 sm:size-6 text-primary group-hover:-translate-y-1 transition-transform" />
                                CRÉER UN COMPTE
                            </button>
                        )}
                    </motion.div>

                    {/* Bento Performance Hub - Real-Time Validation */}
                    <motion.div 
                        variants={itemVariants}
                        className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10 w-full max-w-7xl"
                    >
                        {[
                            { label: t('users') || "Utilisateurs Actifs", val: stats.users, icon: Users, sub: "Guinée & Diaspora", trend: "+12%" },
                            { label: t('merchants') || "Fournisseurs Pro", val: stats.vendors, icon: StoreSVG, sub: "Fournisseurs Certifiés", trend: "Premium" },
                            { label: t('transactions') || "Flux de Commandes", val: stats.transactions, icon: CreditCard, sub: "Volume Hebdomadaire", trend: "Secure" },
                            { label: t('satisfaction') || "Confiance Client", val: stats.satisfaction, icon: Target, sub: "SLA Garanti", highlight: true },
                        ].map((stat, i) => (
                            <motion.div 
                                key={i}
                                whileHover={{ scale: 1.02 }}
                                className={cn(
                                    "relative p-6 md:p-8 rounded-[2rem] border transition-all duration-700 group overflow-hidden shadow-xl",
                                    stat.highlight 
                                        ? "bg-slate-900 border-slate-800 shadow-slate-900/40" 
                                        : "bg-white/5 backdrop-blur-3xl border-white/10 hover:border-primary/40 shadow-black/5"
                                )}
                            >
                                {/* Static Ambient glow */}
                                <div className="absolute -right-6 -top-6 size-24 bg-primary/5 blur-3xl rounded-full" />
                                
                                <div className={cn(
                                    "flex items-center justify-between mb-6",
                                    stat.highlight ? "text-white" : "text-primary"
                                )}>
                                    <div className={cn(
                                        "size-12 rounded-xl flex items-center justify-center transition-all duration-500",
                                        stat.highlight ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white"
                                    )}>
                                        <stat.icon className="size-6" />
                                    </div>
                                    {stat.trend && (
                                        <span className={cn(
                                            "text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border",
                                            stat.highlight ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/20" : "bg-white/5 text-slate-400 border-white/10"
                                        )}>
                                            {stat.trend}
                                        </span>
                                    )}
                                </div>

                                <div className="text-left space-y-2">
                                    <h3 className={cn("text-3xl md:text-4xl font-black tracking-tighter tabular-nums leading-none", stat.highlight ? "text-white" : "text-foreground")}>
                                        <AnimatedCounter value={stat.val} delay={i * 0.1} />
                                    </h3>
                                    <p className={cn("text-[10px] font-black uppercase tracking-[0.2em] pt-1", stat.highlight ? "text-white/60" : "text-foreground/40")}>
                                        {stat.label}
                                    </p>
                                    <div className={cn("flex items-center gap-3 pt-6 border-t mt-6", stat.highlight ? "border-white/10 text-white/40" : "border-white/5 text-muted-foreground/30")}>
                                        <div className={cn("size-2 rounded-full animate-pulse", stat.highlight ? "bg-primary" : "bg-emerald-500")} />
                                        <p className="text-[10px] font-bold uppercase tracking-widest">{stat.sub}</p>
                                    </div>
                                </div>
                            </motion.div>
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

function StoreSVG({ className }) {
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
