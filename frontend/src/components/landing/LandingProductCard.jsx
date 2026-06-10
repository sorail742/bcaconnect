import React from 'react';
import { Link } from 'react-router-dom';
import { Search, BadgeCheck } from 'lucide-react';
import { cn, getImageUrl } from '../../lib/utils';
import LazyImage from '../ui/LazyImage';
import { useLanguage } from '../../context/useLanguage';

const FALLBACK = 'https://images.unsplash.com/photo-1523275319145-80b01958f7a2?auto=format&fit=crop&q=80&w=400';

const getMoq = (product) => {
    const attrs = product?.attributs_produit || product?.attributs || {};
    const moq = attrs.quantite_min ?? attrs.moq ?? attrs.min_order;
    return moq ? parseInt(moq, 10) : 1;
};

/**
 * Carte produit landing — style BCA discovery (clic → fiche, sans boutons)
 */
export default function LandingProductCard({ product, className }) {
    const { t } = useLanguage();
    const price = parseFloat(product.prix_unitaire || 0).toLocaleString();
    const moq = getMoq(product);
    const sold = product.nb_ventes || product.vues || 0;
    const verified = product?.boutique?.is_verified || product?.boutique?.proprietaire?.is_verified;

    return (
        <Link
            to={`/product/${product.id}`}
            className={cn(
                'group block bg-white rounded-lg overflow-hidden border border-[#f0f0f0] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:border-[#e8e8e8] transition-all duration-200',
                className
            )}
        >
            <div className="relative aspect-square bg-[#fafafa] overflow-hidden">
                <LazyImage
                    src={getImageUrl(product.image_url)}
                    alt={product.nom_produit}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                />
                <div className="absolute bottom-2 left-2 size-7 rounded-full bg-white/95 border border-[#ebebeb] flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <Search className="size-3.5 text-[#666]" />
                </div>
            </div>

            <div className="p-2.5 sm:p-3">
                <h3 className="text-[13px] text-[#333] leading-snug line-clamp-2 min-h-[2.5rem] group-hover:text-[#FF6600] transition-colors">
                    {product.nom_produit}
                </h3>

                <p className="text-[15px] font-bold text-[#333] mt-1 tabular-nums">
                    {price} <span className="text-[11px] font-semibold">{t('gnf')}</span>
                </p>

                <p className="text-[11px] text-[#999] mt-0.5">
                    MOQ: {moq} {t('pieces') || 'pièces'} · {sold} {t('sold') || 'vendus'}
                </p>

                <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {verified && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-[#1677ff] bg-[#e6f4ff] px-1.5 py-0.5 rounded-sm">
                            <BadgeCheck className="size-3" />
                            Verified
                        </span>
                    )}
                    <span className="text-[10px] text-[#999]">
                        {product.boutique?.nom_boutique ? `${product.boutique.nom_boutique.slice(0, 12)} · GN` : 'GN'}
                    </span>
                </div>
            </div>
        </Link>
    );
}
