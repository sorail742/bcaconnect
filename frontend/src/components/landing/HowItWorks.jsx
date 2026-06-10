import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, PackageSearch, CreditCard, Truck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/useLanguage';
import { useAuth } from '../../hooks/useAuth';



export function HowItWorks() {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const STEPS = [
        {
            number: "01", icon: UserPlus,
            title: t('howStep1Title'),
            description: t('howStep1Desc'),
            color: "text-blue-600", bg: "bg-blue-50", link: "/register"
        },
        {
            number: "02", icon: PackageSearch,
            title: t('howStep2Title'),
            description: t('howStep2Desc'),
            color: "text-[#FF6600]", bg: "bg-orange-50", link: "/marketplace"
        },
        {
            number: "03", icon: CreditCard,
            title: t('howStep3Title'),
            description: t('howStep3Desc'),
            color: "text-emerald-600", bg: "bg-emerald-50", link: "/help"
        },
        {
            number: "04", icon: Truck,
            title: t('howStep4Title'),
            description: t('howStep4Desc'),
            color: "text-amber-600", bg: "bg-amber-50", link: "/tracking"
        },
    ];

    return (
        <section className="bg-white border-t border-slate-100 py-10 sm:py-16">
            <div className="container px-3 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 sm:mb-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-1 h-8 bg-[#FF6600] rounded-full" />
                            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                {t('howTitle')}
                            </h2>
                        </div>
                        <p className="text-slate-500 text-sm pl-4 ml-1 border-l-2 border-slate-100">
                            {t('howDesc')}
                        </p>
                    </div>
                    <button
                        onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
                        className="flex items-center gap-2 h-10 px-5 bg-[#FF6600] text-white font-bold text-sm rounded-xl hover:bg-orange-600 transition-colors shrink-0 self-start sm:self-auto"
                    >
                        {isAuthenticated ? t('myDashboard') : t('ctaStart')}
                        <ArrowRight className="size-4" />
                    </button>
                </div>

                {/* Steps */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 relative">
                    {/* Connector line — desktop only */}
                    <div className="absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-blue-200 via-orange-200 to-amber-200 hidden lg:block pointer-events-none z-0" />

                    {STEPS.map((step, i) => (
                        <motion.button
                            key={i}
                            onClick={() => navigate(step.link)}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.08, duration: 0.5 }}
                            className="group text-left relative z-10 bg-white border border-slate-100 rounded-2xl p-5 sm:p-6 hover:shadow-lg hover:border-[#FF6600]/20 transition-all duration-300"
                        >
                            {/* Step number + icon */}
                            <div className="flex items-center justify-between mb-4">
                                <div className={`size-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${step.bg}`}>
                                    <step.icon className={`size-6 ${step.color}`} />
                                </div>
                                <span className="text-4xl font-black text-slate-100 tabular-nums select-none leading-none">
                                    {step.number}
                                </span>
                            </div>

                            <h3 className={`text-base font-black text-slate-900 mb-2 group-hover:${step.color} transition-colors tracking-tight`}>
                                {step.title}
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                                {step.description}
                            </p>

                            {/* Arrow connector (desktop) */}
                            {i < STEPS.length - 1 && (
                                <div className="absolute -right-3 top-10 hidden lg:flex size-6 rounded-full bg-white border border-slate-200 items-center justify-center z-20 shadow-sm">
                                    <ArrowRight className="size-3 text-slate-400" />
                                </div>
                            )}

                            <div className={`mt-4 flex items-center gap-1.5 text-xs font-bold ${step.color} opacity-0 group-hover:opacity-100 transition-opacity`}>
                                <CheckCircle2 className="size-3.5" /> {t('learnMore')}
                            </div>
                        </motion.button>
                    ))}
                </div>

                {/* Mini CTA strip */}
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 p-5 sm:p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-sm font-bold text-slate-700">
                        {t('ctaDescLanding')}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => navigate('/register')}
                            className="h-9 px-5 bg-[#FF6600] text-white font-bold text-xs rounded-xl hover:bg-orange-600 transition-colors"
                        >
                            {t('register')}
                        </button>
                        <button
                            onClick={() => navigate('/marketplace')}
                            className="h-9 px-5 bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:border-[#FF6600] hover:text-[#FF6600] transition-colors"
                        >
                            {t('explore')}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
