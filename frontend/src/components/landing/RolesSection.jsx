import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Store, ArrowRight, ShieldCheck, Zap, Star, LayoutDashboard, Truck, Landmark } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from '../../context/useLanguage';
import { useAuth } from "../../hooks/useAuth";
import { ROLES } from "../../constants/roles";
import { cn } from "../../lib/utils";

export function RolesSection() {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const getDashboardLink = (role) => {
        if (!isAuthenticated) return `/register?role=${role}`;
        if (user.role === role) {
            if (role === ROLES.ADMIN) return '/admin/dashboard';
            if (role === ROLES.FOURNISSEUR) return '/vendor/dashboard';
            if (role === ROLES.TRANSPORTEUR) return '/carrier/dashboard';
            if (role === ROLES.BANQUE) return '/bank/dashboard';
            return '/dashboard';
        }
        return '/dashboard'; // Fallback
    };

    const roles = useMemo(() => [
        {
            id: 'client',
            title: t('roleBuyerTitle') || "Acheteur Certifié",
            desc: t('roleBuyerDesc') || "Accédez au marché avec protection Escrow et suivi logistique.",
            icon: ShoppingBag,
            color: "text-blue-600",
            bg: "bg-blue-50",
            features: [
                t('roleBuyerFeat1') || "Paiements sécurisés",
                t('roleBuyerFeat2') || "Suivi temps réel",
                t('roleBuyerFeat3') || "Support 24/7"
            ]
        },
        {
            id: 'fournisseur',
            title: t('roleVendorTitle') || "Fournisseur Pro",
            desc: t('roleVendorDesc') || "Ouvrez votre espace fournisseur, gérez vos stocks et boostez vos ventes.",
            icon: Store,
            color: "text-[#FF6600]",
            bg: "bg-orange-50",
            features: [
                t('roleVendorFeat1') || "Tableau de bord IA",
                t('roleVendorFeat2') || "Gestion de stock",
                t('roleVendorFeat3') || "Règlements rapides"
            ]
        },
        {
            id: 'transporteur',
            title: t('roleCarrierTitle') || "Transporteur",
            desc: t('roleCarrierDesc') || "Optimisez vos trajets et livrez les commandes du réseau BCA.",
            icon: Truck,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            features: [
                t('roleCarrierFeat1') || "Gestion de flotte",
                t('roleCarrierFeat2') || "Preuve de livraison",
                t('roleCarrierFeat3') || "Paiements garantis"
            ]
        }
    ], [t]);

    return (
        <section className="bg-white py-10 sm:py-16 border-t border-slate-100">
            <div className="container px-3 sm:px-6 lg:px-8">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="w-1 h-8 bg-[#FF6600] rounded-full" />
                            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
                                {t('rolesUnifiedEcosystem') || "Un Écosystème Unifié"}
                            </h2>
                        </div>
                        <p className="text-slate-500 text-sm pl-4 ml-1 border-l-2 border-slate-100 italic">
                            {t('rolesUnifiedEcosystemDesc') || "Choisissez votre rôle et commencez à transformer le commerce en Guinée."}
                        </p>
                    </div>
                </div>

                {/* Roles Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {roles.map((role, idx) => (
                        <motion.div
                            key={role.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="group relative bg-white border border-slate-100 rounded-3xl p-6 hover:shadow-xl hover:border-[#FF6600]/20 transition-all duration-300 overflow-hidden"
                        >
                            {/* Icon & Title */}
                            <div className="flex items-center gap-4 mb-4">
                                <div className={cn("size-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", role.bg)}>
                                    <role.icon className={cn("size-7", role.color)} />
                                </div>
                                <h3 className="text-lg font-black text-slate-900 leading-tight">
                                    {role.title}
                                </h3>
                            </div>

                            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                                {role.desc}
                            </p>

                            {/* Feature Pills */}
                            <div className="flex flex-wrap gap-2 mb-8">
                                {role.features.map(f => (
                                    <span key={f} className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                                        • {f}
                                    </span>
                                ))}
                            </div>

                            {/* Action Button */}
                            <button
                                onClick={() => navigate(getDashboardLink(role.id === 'fournisseur' ? ROLES.FOURNISSEUR : role.id === 'transporteur' ? ROLES.TRANSPORTEUR : role.id === 'banque' ? ROLES.BANQUE : ROLES.CLIENT))}
                                className={cn(
                                    "w-full flex items-center justify-center gap-2 h-12 rounded-xl text-sm font-black transition-all",
                                    isAuthenticated && user?.role === (role.id === 'fournisseur' ? ROLES.FOURNISSEUR : role.id === 'transporteur' ? ROLES.TRANSPORTEUR : role.id === 'banque' ? ROLES.BANQUE : ROLES.CLIENT)
                                        ? "bg-slate-900 text-white shadow-lg"
                                        : "bg-slate-50 text-slate-600 hover:bg-[#FF6600] hover:text-white"
                                )}
                            >
                                {isAuthenticated && user?.role === (role.id === 'fournisseur' ? ROLES.FOURNISSEUR : role.id === 'transporteur' ? ROLES.TRANSPORTEUR : role.id === 'banque' ? ROLES.BANQUE : ROLES.CLIENT)
                                    ? (t('myDashboard') || "Mon Dashboard")
                                    : (t('join') || "Rejoindre")}
                                <ArrowRight className="size-4" />
                            </button>

                            {/* Background decoration */}
                            <div className={cn("absolute -bottom-6 -right-6 size-24 rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity", role.bg.replace('bg-', 'bg-'))} />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
