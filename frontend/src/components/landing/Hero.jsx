import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "../ui/Button"
import { Search, Camera, ArrowRight, Zap, TrendingUp, Shield, Users, CreditCard, Activity, Globe, Cpu, Rocket } from "lucide-react"
import { Link } from "react-router-dom"
import statService from "../../services/statService"
import { useLanguage } from "../../context/LanguageContext"
import { HeroCarousel } from "./HeroCarousel"
import { cn } from "../../lib/utils"

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
        opacity: 1,
        transition: { staggerChildren: 0.15, delayChildren: 0.3 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        transition: { duration: 1, ease: [0.16, 1, 0.3, 1] }
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
                        satisfaction: "99%"
                    });
                }
            } catch (error) {
                console.error("Failed to fetch landing stats", error);
            }
        };
        fetchStats();
    }, []);

    return (
        <section className="relative w-full pt-20 pb-16 md:pt-32 md:pb-24 isolate overflow-hidden bg-background min-h-[80vh] flex items-center">
            {/* Background Effects */}
            <HeroCarousel />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,95,0,0.1)_0%,transparent_50%)] pointer-events-none z-10" />
            <div className="absolute inset-x-0 bottom-0 h-96 bg-gradient-to-t from-background to-transparent z-10" />

            <div className="container mx-auto px-8 md:px-12 relative z-20">
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col items-center text-center space-y-16"
                >
                    {/* Premium Badge */}
                    <motion.div
                        variants={itemVariants}
                        className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold uppercase tracking-wide shadow-lg cursor-pointer hover:bg-primary/90 transition-all"
                    >
                        <Activity className="size-4 animate-pulse" />
                        {t('badgeText') || "L'avenir du commerce connecté"}
                    </motion.div>

                    {/* Main Title */}
                    <motion.h1 
                        variants={itemVariants}
                        className="text-3xl md:text-5xl lg:text-7xl font-bold tracking-tight leading-tight mb-6 text-foreground max-w-5xl"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                        {t('heroTitle1') || "PROPULSEZ VOTRE"} <br />
                        <span className="text-primary italic relative inline-block">
                            {t('heroTitle2') || "BUSINESS_ALPHA"}
                            <motion.div 
                                className="absolute -bottom-4 left-0 w-full h-3 bg-primary shadow-sm"
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ delay: 1, duration: 1.5, ease: "circOut" }}
                            />
                        </span> <br />
                        <span className="text-foreground opacity-90">{t('heroTitle3') || "AVANT_GARDE_LATEST"}</span>
                    </motion.h1>

                    {/* Description */}
                    <motion.p
                        variants={itemVariants}
                        className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed border-l-4 border-primary/30 pl-4 text-left"
                    >
                        {t('heroDesc') || "Une plateforme tout-en-un pour la gestion, la croissance et l'excellence opérationnelle."}
                    </motion.p>

                    {/* Bento Stats Grid */}
                    <motion.div 
                        variants={itemVariants}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl mt-10"
                    >
                        {[
                            { label: t('users') || "Utilisateurs", val: stats.users, icon: Users, color: "text-foreground" },
                            { label: t('merchants') || "Marchands", val: stats.vendors, icon: Shield, color: "text-foreground" },
                            { label: t('transactions') || "Transactions", val: stats.transactions, icon: CreditCard, color: "text-foreground" },
                            { label: t('satisfaction') || "Satisfaction", val: stats.satisfaction, icon: TrendingUp, color: "text-primary", highlight: true },
                        ].map((stat, i) => (
                            <div 
                                key={i}
                                className="p-4 bg-card border border-border rounded-xl shadow-sm flex flex-col items-center gap-2"
                            >
                                <stat.icon className={cn("size-5", stat.highlight ? 'text-primary' : 'text-muted-foreground')} />
                                <h3 className={cn("text-xl font-bold tabular-nums", stat.color)}>{stat.val}</h3>
                                <p className="text-xs text-muted-foreground text-center">{stat.label}</p>
                            </div>
                        ))}
                    </motion.div>

                    {/* Floating Action Button */}
                    <motion.div 
                        variants={itemVariants}
                        className="mt-16"
                    >
                        <Link to="/register">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="h-12 px-8 bg-primary text-primary-foreground border-none font-bold text-sm rounded-xl shadow-lg flex items-center gap-3 hover:bg-primary/90 transition-all"
                            >
                                {t('getStarted') || "Commencer"}
                                <ArrowRight className="size-4" />
                            </motion.button>
                        </Link>
                    </motion.div>
                </motion.div>
            </div>
            
            {/* Ambient Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,95,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,95,0,0.03)_1px,transparent_1px)] bg-[size:100px_100px] pointer-events-none z-10 opacity-50" />
            
            {/* Corner Light Effects */}
            <div className="absolute -top-40 -left-40 size-[60rem] bg-primary/[0.04] blur-[200px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-40 -right-40 size-[60rem] bg-primary/[0.04] blur-[200px] rounded-full pointer-events-none" />
        </section>
    )
}
