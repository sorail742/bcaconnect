import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Rocket, ArrowLeft, Zap, Bell, CheckCircle2, Loader2, Sparkles, LayoutDashboard, Activity, RefreshCcw } from 'lucide-react';
import BcaLogo from '../components/ui/BcaLogo';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

/**
 * Page générique pour les routes en développement (Sleek Alibaba-inspired)
 */
const PAGE_LABELS = {
    '/careers':     { title: 'Carrières',              desc: 'Rejoignez notre équipe et participez à la révolution E-commerce.', icon: Rocket, color: 'from-blue-500 to-cyan-400' },
    '/ads':         { title: 'BCA Ads System',         desc: 'Touchez des millions de clients avec des campagnes hyper-ciblées propulsées par IA.', icon: Zap, color: 'from-[#FF6600] to-orange-400' },
    '/insights':    { title: 'BCA Insights',           desc: 'Votre centre de commandement Big Data. Prenez le contrôle de vos KPIs.', icon: LayoutDashboard, color: 'from-emerald-500 to-teal-400' },
    '/ai-trends':   { title: 'BCA AI Engine',          desc: 'Anticipez les ruptures et prédisez les tendances du marché Guinéen avec précision.', icon: Sparkles, color: 'from-violet-500 to-fuchsia-400' },
    '/consultant':  { title: 'Devenir Consultant',     desc: 'Accompagnez l\'écosystème BCA dans la transformation digitale.', icon: Rocket, color: 'from-blue-500 to-indigo-400' },
    '/logistics':   { title: 'BCA Logistique',         desc: 'Gérez vos flottes, optimisez les trajets et garantissez vos SLAs.', icon: CheckCircle2, color: 'from-blue-500 to-cyan-400' },
    '/carrier-join':{ title: 'Rejoindre le Réseau',    desc: 'Devenez transporteur agréé et rentabilisez tous vos déplacements.', icon: Activity, color: 'from-emerald-500 to-teal-400' },
    '/download':    { title: 'App Mobile BCA',         desc: 'Achetez, Vendez, Gérez. Tout BCA dans votre poche.', icon: Rocket, color: 'from-[#FF6600] to-[#FF9033]' },
    '/returns':     { title: 'Retours & Remboursements', desc: 'Gestion simplifiée de vos retours.', icon: RefreshCcw, color: 'from-amber-500 to-amber-400' },
    '/admin/returns': { title: 'Gestion des Retours', desc: 'Interface administrateur pour les retours.', icon: RefreshCcw, color: 'from-amber-500 to-amber-400' },
};

const DEFAULT_LABEL = {
    title: 'Bientôt disponible',
    desc: 'Ce module stratégique est en cours d\'assemblage dans nos laboratoires.',
    icon: Rocket,
    color: 'from-[#FF6600] to-orange-400'
};

export default function ComingSoon() {
    const location = useLocation();
    const page = PAGE_LABELS[location.pathname] || DEFAULT_LABEL;
    const Icon = page.icon;
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);

    const handleNotifyMe = async (e) => {
        e.preventDefault();
        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toast.error('Veuillez entrer une adresse email valide.');
            return;
        }

        setIsSubmitting(true);
        try {
            const subscriptions = JSON.parse(localStorage.getItem('bca-notify') || '[]');
            if (subscriptions.some(s => s.email === email && s.page === location.pathname)) {
                toast.info('Vous êtes déjà sur liste d\'attente VIP pour cette invite.');
                setIsSubscribed(true);
                return;
            }
            subscriptions.push({ email, page: location.pathname, date: new Date().toISOString() });
            localStorage.setItem('bca-notify', JSON.stringify(subscriptions));
            
            await new Promise(resolve => setTimeout(resolve, 800));
            setIsSubscribed(true);
            toast.success(`Accès prioritaire accordé pour "${page.title}" !`);
        } catch {
            toast.error('Erreur temporaire, veuillez réessayer.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col justify-center relative overflow-hidden font-sans">
            
            {/* Alibaba Industrial Dark Aesthetic Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute -top-[20%] -right-[10%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-b from-[#FF6600]/10 to-transparent blur-[150px] opacity-70" />
                <div className="absolute top-[40%] -left-[20%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-tr from-blue-500/10 to-transparent blur-[120px] opacity-50" />
                
                {/* Tech Grid Pattern */}
                <div 
                    className="absolute inset-0 opacity-[0.03]" 
                    style={{ 
                        backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
                        backgroundSize: '4rem 4rem' 
                    }} 
                />
            </div>

            <div className="container relative z-10 mx-auto px-6 py-20 flex flex-col max-w-4xl">
                
                {/* Header Back */}
                <Link to="/" className="w-fit flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-all group mb-16">
                    <ArrowLeft className="size-4 group-hover:-translate-x-2 transition-transform" /> Retour à l'accueil
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    
                    {/* Left: Content */}
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-8"
                    >
                        <div className="flex items-center gap-3">
                            <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2">
                                <span className={cn("size-2 rounded-full animate-pulse bg-gradient-to-r", page.color)} />
                                <span className="text-[10px] font-black tracking-widest text-white uppercase">Module Stratégique</span>
                            </div>
                        </div>

                        <div>
                            <h1 className="text-5xl sm:text-6xl font-black text-white tracking-tighter mb-4 leading-[1.1]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                {page.title}
                            </h1>
                            <p className="text-lg text-slate-400 font-medium leading-relaxed max-w-md">
                                {page.desc}
                            </p>
                        </div>

                        {/* Early Access Form */}
                        <div className="pt-4">
                            {!isSubscribed ? (
                                <form onSubmit={handleNotifyMe} className="relative group max-w-md">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-[#FF6600] to-orange-400 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
                                    <div className="relative flex items-center bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-2xl overflow-hidden transition-colors shadow-2xl">
                                        <div className="pl-5 shrink-0">
                                            <Bell className="size-5 text-slate-400" />
                                        </div>
                                        <input
                                            type="email"
                                            placeholder="Adresse email professionnelle..."
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            disabled={isSubmitting}
                                            className="w-full h-14 bg-transparent text-sm font-medium text-white px-4 outline-none placeholder:text-slate-500 disabled:opacity-50"
                                        />
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="m-1.5 h-11 px-6 bg-white text-slate-900 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 active:scale-95 transition-all disabled:opacity-50 shrink-0 flex items-center justify-center min-w-[120px]"
                                        >
                                            {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : "Accès VIP"}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="max-w-md flex items-center gap-4 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl"
                                >
                                    <div className="size-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="size-5 text-emerald-400" />
                                    </div>
                                    <p className="text-sm font-bold text-emerald-100 leading-tight">
                                        Invitation VIP confirmée. Vous serez notifié dès l'ouverture de l'accès anticipé.
                                    </p>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>

                    {/* Right: Glassmorphism Visual */}
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="hidden lg:flex justify-center relative"
                    >
                        <div className="relative w-full max-w-[400px] aspect-square rounded-[3rem] bg-white/[0.02] border border-white/5 backdrop-blur-3xl shadow-2xl flex items-center justify-center p-12 overflow-hidden group">
                           
                            {/* Inner Glow */}
                            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-20 pointer-events-none transition-transform duration-1000 group-hover:scale-110", page.color)} />
                            
                            {/* Central Element */}
                            <div className="relative z-10 size-40 rounded-full bg-slate-800/80 border border-white/10 shadow-2xl flex items-center justify-center">
                                <Icon className="size-16 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                            </div>

                            {/* Floating Stats/Badges to sell the "System" feel */}
                            <motion.div 
                                animate={{ y: [0, -10, 0] }} 
                                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                className="absolute top-12 right-6 bg-slate-800/80 backdrop-blur-xl border border-white/10 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3"
                            >
                                <div className="size-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                    <Activity className="size-4 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Statut</p>
                                    <p className="text-xs font-bold text-white">En déploiement</p>
                                </div>
                            </motion.div>

                            <motion.div 
                                animate={{ y: [0, 10, 0] }} 
                                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                                className="absolute bottom-16 left-6 bg-slate-800/80 backdrop-blur-xl border border-white/10 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3"
                            >
                                <div className="size-8 rounded-lg bg-[#FF6600]/20 flex items-center justify-center">
                                    <Zap className="size-4 text-[#FF6600]" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Performances</p>
                                    <p className="text-xs font-bold text-white">Pré-calculs en cours</p>
                                </div>
                            </motion.div>

                        </div>
                    </motion.div>

                </div>
            </div>
            
            {/* Absolute Logo Bottom */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-20 pointer-events-none">
                <BcaLogo variant="light" size="h-6" />
            </div>
            
        </div>
    );
}
