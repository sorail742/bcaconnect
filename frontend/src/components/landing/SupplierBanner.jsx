import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Globe, Zap, BadgeCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../context/useLanguage';
import { ROLES } from '../../constants/roles';
import { formatPercent, formatCount } from '../../lib/landingStats';

export function SupplierBanner({ stats }) {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const { t } = useLanguage();
    const isVendor = isAuthenticated && user?.role === ROLES.FOURNISSEUR;

    const bannerStats = useMemo(() => [
        { val: formatCount(stats?.totalClients ?? stats?.totalUsers ?? 0), label: t('statsActiveBuyers') },
        { val: formatCount(stats?.storesCount ?? stats?.totalFournisseurs ?? 0), label: t('statsPartners') || t('statsCities') },
        { val: formatPercent(stats?.satisfactionRate ?? 98, 1), label: t('statsSatisfaction') },
        { val: '0 GNF', label: t('statsFreeReg') },
    ], [stats, t]);

    return (
        <section className="bg-white border-t border-slate-100 py-8 sm:py-10">
            <div className="container px-3 sm:px-6 lg:px-8">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#FF6600] via-[#FF7A1A] to-[#FF9A3C] p-6 sm:p-8 lg:p-10"
                >
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="absolute -right-12 -top-12 size-64 rounded-full bg-white/5" />
                        <div className="absolute -right-4 -bottom-20 size-80 rounded-full bg-white/5" />
                        <div className="absolute left-1/3 top-0 size-40 rounded-full bg-white/5" />
                    </div>

                    <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
                        <div className="flex-1 min-w-0 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-full text-white text-xs font-bold uppercase tracking-widest mb-4">
                                <BadgeCheck className="size-4" />
                                {t('vendorJoinBadge')}
                            </div>
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                {isVendor ? t('vendorDashboardTitle') : t('vendorJoinTitle')}
                            </h2>
                            <p className="text-white/80 text-sm sm:text-base font-medium max-w-lg mx-auto lg:mx-0 mb-6">
                                {isVendor ? t('vendorDashboardDesc') : t('vendorJoinDesc')}
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                                <button
                                    onClick={() => navigate(isVendor ? '/vendor/dashboard' : '/register?role=fournisseur')}
                                    className="flex items-center gap-2 h-12 sm:h-14 px-6 sm:px-8 bg-white text-[#FF6600] font-black text-sm rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all group"
                                >
                                    {isVendor ? t('myDashboard') : t('startSelling')}
                                    <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                                {!isVendor && (
                                    <button
                                        onClick={() => navigate('/help')}
                                        className="flex items-center gap-2 h-12 sm:h-14 px-6 sm:px-8 bg-white/10 border border-white/30 text-white font-bold text-sm rounded-xl sm:rounded-2xl hover:bg-white/20 transition-all"
                                    >
                                        {t('learnMore')}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 shrink-0 w-full sm:w-auto sm:grid-cols-4 lg:grid-cols-2 lg:w-56">
                            {bannerStats.map((s, i) => (
                                <div key={i} className="bg-white/10 border border-white/20 rounded-xl p-3 text-center backdrop-blur-sm">
                                    <p className="text-xl sm:text-2xl font-black text-white leading-none">{s.val}</p>
                                    <p className="text-[10px] sm:text-xs text-white/70 font-medium mt-1">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { icon: ShieldCheck, title: t('buyerProtection'), desc: t('escrowUntilDelivery') },
                        { icon: Zap, title: t('instantPayment'), desc: t('paidWithin24h') },
                        { icon: Globe, title: t('footerCoverageTitle'), desc: t('footerCoverageDesc') },
                        { icon: BadgeCheck, title: t('verifiedSuppliers'), desc: t('certifiedByBca') },
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.05 }}
                            className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-100 hover:border-[#FF6600]/20 hover:shadow-sm transition-all"
                        >
                            <div className="size-9 sm:size-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                                <item.icon className="size-5 text-[#FF6600]" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-800">{item.title}</p>
                                <p className="text-xs text-slate-400">{item.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
