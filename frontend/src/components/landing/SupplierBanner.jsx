import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Globe, Zap, BadgeCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../constants/roles';

// Alibaba-style "Start Selling" / supplier onboarding promotional banner
export function SupplierBanner() {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const isVendor = isAuthenticated && user?.role === ROLES.FOURNISSEUR;

    const stats = [
        { val: '10K+', label: 'Acheteurs actifs' },
        { val: '180+', label: 'Villes couvertes' },
        { val: '99%', label: 'Satisfaction fournisseurs' },
        { val: '0 GNF', label: 'Inscription gratuite' },
    ];

    return (
        <section className="bg-white border-t border-slate-100 py-8 sm:py-10">
            <div className="max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8">

                {/* Main banner — orange gradient like Alibaba's "Start Selling" */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#FF6600] via-[#FF7A1A] to-[#FF9A3C] p-6 sm:p-8 lg:p-10"
                >
                    {/* Background decorations */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="absolute -right-12 -top-12 size-64 rounded-full bg-white/5" />
                        <div className="absolute -right-4 -bottom-20 size-80 rounded-full bg-white/5" />
                        <div className="absolute left-1/3 top-0 size-40 rounded-full bg-white/5" />
                    </div>

                    <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
                        {/* Left — Text block */}
                        <div className="flex-1 min-w-0 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-full text-white text-xs font-bold uppercase tracking-widest mb-4">
                                <BadgeCheck className="size-4" />
                                Devenez Fournisseur Certifié BCA
                            </div>
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                {isVendor
                                    ? 'Gérez Votre Boutique BCA Connect'
                                    : 'Développez Votre Activité\nen Ligne'}
                            </h2>
                            <p className="text-white/80 text-sm sm:text-base font-medium max-w-lg mx-auto lg:mx-0 mb-6">
                                {isVendor
                                    ? 'Accédez à votre tableau de bord fournisseur pour gérer vos produits, commandes et finances.'
                                    : 'Rejoignez des milliers de fournisseurs guinéens sur la première plateforme B2B de l\'Afrique de l\'Ouest. Inscription gratuite, paiements sécurisés.'}
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                                <button
                                    onClick={() => navigate(isVendor ? '/vendor/dashboard' : '/register?role=fournisseur')}
                                    className="flex items-center gap-2 h-12 sm:h-14 px-6 sm:px-8 bg-white text-[#FF6600] font-black text-sm rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all group"
                                >
                                    {isVendor ? 'Mon tableau de bord' : 'Commencer à vendre'}
                                    <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                                {!isVendor && (
                                    <button
                                        onClick={() => navigate('/help')}
                                        className="flex items-center gap-2 h-12 sm:h-14 px-6 sm:px-8 bg-white/10 border border-white/30 text-white font-bold text-sm rounded-xl sm:rounded-2xl hover:bg-white/20 transition-all"
                                    >
                                        En savoir plus
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Right — Stats grid */}
                        <div className="grid grid-cols-2 gap-3 shrink-0 w-full sm:w-auto sm:grid-cols-4 lg:grid-cols-2 lg:w-56">
                            {stats.map((s, i) => (
                                <div key={i} className="bg-white/10 border border-white/20 rounded-xl p-3 text-center backdrop-blur-sm">
                                    <p className="text-xl sm:text-2xl font-black text-white leading-none">{s.val}</p>
                                    <p className="text-[10px] sm:text-xs text-white/70 font-medium mt-1">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Trust badges row — Alibaba-style icon strip */}
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { icon: ShieldCheck, title: 'Protection Acheteur', desc: 'Escrow jusqu\'à livraison' },
                        { icon: Zap, title: 'Paiement Instantané', desc: 'Fournisseurs payés sous 24h' },
                        { icon: Globe, title: 'Réseau National', desc: 'Toutes les régions de Guinée' },
                        { icon: BadgeCheck, title: 'Fournisseurs Vérifiés', desc: 'Certifiés par BCA Connect' },
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
