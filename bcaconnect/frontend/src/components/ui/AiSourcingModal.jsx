import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, TrendingUp, Search, MessageSquare, Zap, Target, Globe } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

const AiSourcingModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    if (!isOpen) return null;

    const handleStart = () => {
        onClose();
        navigate('/ai-mode');
    };

    const features = [
        {
            title: "Analyse des tendances",
            desc: "Identifiez les produits gagnants avant tout le monde grâce à nos algorithmes prédictifs.",
            icon: TrendingUp,
            color: "text-blue-500",
            bg: "bg-blue-50"
        },
        {
            title: "Analyse comparative",
            desc: "Comparez instantanément les prix, délais et certifications de milliers de fournisseurs.",
            icon: Target,
            color: "text-amber-500",
            bg: "bg-amber-50"
        },
        {
            title: "Conception de produits",
            desc: "Générez des maquettes 3D et des spécifications techniques en quelques secondes avec l'IA.",
            icon: Sparkles,
            color: "text-purple-500",
            bg: "bg-purple-50"
        },
        {
            title: "Communication efficace",
            desc: "Traduisez et optimisez vos messages pour garantir une compréhension parfaite avec les usines.",
            icon: MessageSquare,
            color: "text-emerald-500",
            bg: "bg-emerald-50"
        }
    ];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex flex-col items-center justify-start md:justify-center p-4 md:p-10 overflow-y-auto bg-slate-900/60 backdrop-blur-md">
                {/* Backdrop (Static) */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 z-0"
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 30 }}
                    className="relative z-10 w-full max-w-5xl bg-white dark:bg-slate-950 rounded-[2rem] md:rounded-[3.5rem] shadow-[0_32px_120px_-20px_rgba(0,0,0,0.5)] border border-white/20 my-auto flex flex-col max-h-[90vh]"
                >
                    {/* Decorative Elements */}
                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden rounded-[inherit]">
                        <div className="absolute -top-24 -left-24 size-96 bg-orange-500/10 rounded-full blur-3xl" />
                        <div className="absolute top-1/2 -right-24 size-96 bg-blue-500/5 rounded-full blur-3xl" />
                    </div>

                    <button 
                        onClick={onClose}
                        className="absolute top-6 right-6 z-50 p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 transition-all group"
                    >
                        <X className="size-5 text-slate-400 group-hover:text-slate-900 transition-all" />
                    </button>

                    {/* Scrollable Area */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-14 space-y-10">
                        {/* Header Section */}
                        <div className="text-center space-y-6">
                            <div className="flex flex-col items-center gap-4">
                                <motion.div 
                                    animate={{ y: [0, -5, 0] }}
                                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                    className="size-16 rounded-[1.5rem] bg-orange-500 flex items-center justify-center shadow-lg relative"
                                >
                                    <Zap className="size-8 text-white fill-current" />
                                </motion.div>
                                
                                <div className="space-y-3">
                                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-[1.1]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                        Découvrez votre <span className="text-orange-500">Agent de Sourcing</span> <br className="hidden md:block" />
                                        par Intelligence Artificielle
                                    </h2>
                                    <p className="text-sm font-black text-orange-500 uppercase tracking-[0.2em]">Mode IA BCA</p>
                                </div>

                                <p className="max-w-2xl mx-auto text-slate-500 dark:text-slate-400 text-sm md:text-base font-medium leading-relaxed italic">
                                    "Identifiez les tendances du marché. Concevez plus rapidement. Trouvez les meilleurs fournisseurs et communiquez plus efficacement."
                                </p>
                            </div>
                        </div>

                        {/* Features Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {features.map((f, i) => (
                                <motion.div
                                    key={i}
                                    className="flex gap-6 p-6 rounded-[2rem] bg-slate-50 dark:bg-white/5 border border-transparent hover:border-orange-500/30 transition-all"
                                >
                                    <div className={cn("size-16 shrink-0 rounded-2xl flex items-center justify-center shadow-inner", f.bg)}>
                                        <f.icon className={cn("size-7", f.color)} />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-base">{f.title}</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                            {f.desc}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Footer / CTA - Fixed at bottom of modal */}
                    <div className="p-8 md:p-10 text-center bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-white/5 shrink-0">
                        <button 
                            onClick={handleStart}
                            className="group relative h-16 px-16 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all overflow-hidden w-full md:w-auto"
                        >
                            <div className="absolute inset-0 bg-orange-500 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                            <span className="relative z-10 group-hover:text-white transition-colors">Démarrez l'expérience</span>
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AiSourcingModal;
