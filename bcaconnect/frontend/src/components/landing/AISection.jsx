import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Terminal, Zap, Search, MessageSquare, Database, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../context/LanguageContext';



export const AISection = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { t } = useLanguage();
    const [logs, setLogs] = useState([]);
    const [metrics, setMetrics] = useState({ latency: 0, sync: 99.9 });

    const LOG_MESSAGES = [
        t('aiLog1'),
        t('aiLog2'),
        t('aiLog3'),
        t('aiLog4'),
        t('aiLog5'),
        t('aiLog6'),
        t('aiLog7'),
        t('aiLog8'),
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setLogs(prev => {
                const next = [LOG_MESSAGES[Math.floor(Math.random() * LOG_MESSAGES.length)], ...prev];
                return next.slice(0, 5);
            });
            setMetrics({
                latency: Math.floor(Math.random() * 20) + 5,
                sync: (99.8 + Math.random() * 0.2).toFixed(2)
            });
        }, 2500);
        return () => clearInterval(interval);
    }, [t]);

    const features = [
        { icon: Search, title: t('aiVisualSearch'), desc: t('aiVisualSearchDesc') },
        { icon: MessageSquare, title: t('aiChatbot'), desc: t('aiChatbotDesc') },
        { icon: Cpu, title: t('aiAnalysis'), desc: t('aiAnalysisDesc') },
    ];

    return (
        <section className="bg-slate-950 py-12 sm:py-16 overflow-hidden">
            <div className="container px-3 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-10 items-center">
                    
                    {/* Left: Capability Cards */}
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FF6600]/10 border border-[#FF6600]/20 rounded-full text-[#FF6600] text-[10px] font-black uppercase tracking-widest">
                                <Sparkles className="size-3" /> {t('aiBadge')}
                            </div>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                {t('aiTitle')}
                            </h2>
                            <p className="text-slate-400 text-sm sm:text-base max-w-lg mb-6">
                                {t('aiDesc')}
                            </p>
                        </div>

                        <div className="grid gap-4">
                            {features.map((f, i) => (
                                <motion.div key={i} whileHover={{ x: 5 }} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-[#FF6600]/30 transition-all">
                                    <div className="size-10 rounded-xl bg-[#FF6600]/20 flex items-center justify-center shrink-0">
                                        <f.icon className="size-5 text-[#FF6600]" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-sm mb-1">{f.title}</h3>
                                        <p className="text-slate-500 text-xs">{f.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <button
                            onClick={() => navigate(isAuthenticated ? '/marketplace' : '/register')}
                            className="flex items-center gap-3 h-12 px-8 bg-[#FF6600] text-white font-black text-sm rounded-xl hover:shadow-orange-500/25 transition-all group"
                        >
                            {t('ctaStart')} <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    {/* Right: Live Engine View */}
                    <div className="relative">
                        <div className="bg-[#0f172a] rounded-3xl border border-white/10 p-4 sm:p-6 shadow-2xl overflow-hidden">
                            {/* Terminal Header */}
                            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-1.5">
                                        <div className="size-2.5 rounded-full bg-rose-500" />
                                        <div className="size-2.5 rounded-full bg-amber-500" />
                                        <div className="size-2.5 rounded-full bg-emerald-500" />
                                    </div>
                                    <span className="text-[10px] text-slate-500 font-bold ml-2 uppercase tracking-widest">{t('aiEngineStatus')}</span>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-end">
                                        <span className="text-[8px] text-slate-500 uppercase">{t('aiLatency')}</span>
                                        <span className="text-xs font-black text-emerald-400 tabular-nums">{metrics.latency}ms</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[8px] text-slate-500 uppercase">{t('aiDBSync')}</span>
                                        <span className="text-xs font-black text-blue-400 tabular-nums">{metrics.sync}%</span>
                                    </div>
                                </div>
                            </div>

                            {/* Logs Container */}
                            <div className="space-y-2 h-[160px] font-mono text-[11px]">
                                <AnimatePresence mode="popLayout">
                                    {logs.map((log, i) => (
                                        <motion.div
                                            key={log + i}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: i === 0 ? 1 : 0.4, x: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="flex gap-3 text-slate-400"
                                        >
                                            <span className="text-emerald-500 shrink-0">bca@engine:~$</span>
                                            <span className="break-words">{log}</span>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            {/* Status Bar */}
                            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Database className="size-3 text-blue-400" />
                                    <span className="text-[10px] text-slate-500 uppercase font-bold">Node: Conakry-01</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="size-3 text-emerald-400" />
                                    <span className="text-[10px] text-emerald-400 uppercase font-black">Encrypted (TLS 1.3)</span>
                                </div>
                            </div>
                        </div>

                        {/* Glow Decorations */}
                        <div className="absolute -top-10 -right-10 size-40 bg-blue-500/10 blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-10 -left-10 size-40 bg-orange-500/10 blur-3xl pointer-events-none" />
                    </div>
                </div>
            </div>
        </section>
    );
};
