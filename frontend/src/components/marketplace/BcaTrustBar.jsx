import React from 'react';
import { ShieldCheck, BadgeCheck, Lock, Headphones, Truck } from 'lucide-react';
import { useLanguage } from '../../context/useLanguage';

const TRUST_ITEMS = [
    { icon: ShieldCheck, labelKey: 'pdAuthenticity', fallback: 'Achat protégé (Escrow)' },
    { icon: BadgeCheck, labelKey: 'catCertifiedVendors', fallback: 'Fournisseurs vérifiés' },
    { icon: Lock, labelKey: null, fallback: 'Paiement Mobile Money sécurisé' },
    { icon: Truck, labelKey: null, fallback: 'Logistique Conakry & intérieur' },
    { icon: Headphones, labelKey: 'contactDesc', fallback: 'Support B2B 7j/7' },
];

const BcaTrustBar = ({ className = '' }) => {
    const { t } = useLanguage();

    return (
        <div className={`bca-trust-bar hidden md:block ${className}`}>
            <div className="container px-4 md:px-12">
                <div className="flex items-center justify-between h-12 text-xs font-medium text-[#666]">
                    {TRUST_ITEMS.map((item, i) => {
                        const Icon = item.icon;
                        const label = item.labelKey ? (t(item.labelKey) || item.fallback) : item.fallback;
                        return (
                            <span key={i} className="flex items-center gap-2 shrink-0">
                                <Icon className="size-4 text-[#FF6600]" strokeWidth={2.5} />
                                <span className="text-[#333] dark:text-slate-300">{label}</span>
                            </span>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default BcaTrustBar;
