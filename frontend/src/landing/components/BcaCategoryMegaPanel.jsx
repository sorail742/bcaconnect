import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Flame, Package, TrendingUp } from 'lucide-react';
import { useLanguage } from '../../context/useLanguage';
import { FOR_YOU_ID } from '../../category/lib/categoryMegaMenu';
import productService from '../../product/services/productService';

export function BcaCategoryMegaPanel({ category, categoryId, subItems }) {
    const { t } = useLanguage();
    const title = category?.nom || t('categoriesForYou') || 'Catégories pour vous';
    const isForYou = !categoryId || categoryId === FOR_YOU_ID;

    // Produits réellement rattachés à cette catégorie (filtre serveur par categorie_id),
    // utilisés uniquement en repli quand la catégorie n'a pas encore de vraies
    // sous-catégories déclarées en base.
    const { data: productsData } = useQuery({
        queryKey: ['mega-menu-products', categoryId],
        queryFn: () => productService.getAll({ categorie_id: categoryId, limit: 10 }),
        enabled: !isForYou,
        staleTime: 5 * 60_000,
    });

    const realProducts = (productsData?.products || [])
        .filter((p) => p.image_url)
        .map((p) => ({
            id: p.id,
            name: p.nom_produit,
            image_url: p.image_url,
            link: `/product/${p.id}`,
        }));

    // Priorité stricte aux vraies sous-catégories de CETTE catégorie (avec leur
    // propre image). Si aucune n'existe encore en base, repli sur les produits
    // réellement rattachés à la catégorie. Jamais de contenu générique
    // appartenant à une autre catégorie.
    const items = subItems?.length
        ? subItems
        : (!isForYou && realProducts.length > 0 ? realProducts : []);

    const marketplaceLink = categoryId && categoryId !== FOR_YOU_ID
        ? `/marketplace?category=${categoryId}`
        : '/marketplace';

    return (
        <motion.div
            key={categoryId || FOR_YOU_ID}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="flex-1 p-6 sm:p-8 lg:p-10 bg-[#fafafa] dark:bg-gray-900/50 min-h-[380px]"
        >
            <div className="flex items-center justify-between mb-8 px-1">
                <h2 className="text-xl sm:text-2xl font-bold text-[#333] dark:text-gray-100">{title}</h2>
                <Link
                    to={marketplaceLink}
                    className="text-sm font-semibold text-[#333] dark:text-gray-300 hover:text-[#1CA0DB] transition-colors flex items-center gap-1 shrink-0"
                >
                    {t('browseFeatured') || 'Parcourir les sélections en vedette'}
                    <ArrowRight className="size-4" />
                </Link>
            </div>

            {items.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-y-8 gap-x-6">
                    {items.map((item, idx) => {
                        const categoryParam = categoryId && categoryId !== FOR_YOU_ID ? `?category=${categoryId}` : '';
                        return (
                        <Link
                            key={item.id || idx}
                            to={item.link || `/marketplace${categoryParam}`}
                            className="flex flex-col items-center gap-3 group min-w-0"
                        >
                            <div className="relative size-20 sm:size-24 rounded-full bg-white border border-[#f0f0f0] overflow-hidden flex items-center justify-center group-hover:border-primary/40 group-hover:shadow-md transition-all shrink-0">
                                {item.image_url ? (
                                    <img
                                        src={item.image_url}
                                        alt={item.name}
                                        className="size-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                ) : (
                                    <span className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform duration-300">
                                        {item.icon || '📦'}
                                    </span>
                                )}
                                {item.badge && (
                                    <div className="absolute -top-0.5 -right-0.5 size-6 bg-white rounded-full shadow border border-[#f0f0f0] flex items-center justify-center">
                                        {item.badge === 'blue' ? (
                                            <TrendingUp className="size-3.5 text-[#1CA0DB]" strokeWidth={2.5} />
                                        ) : (
                                            <Flame className="size-3.5 text-[#1CA0DB] fill-[#1CA0DB]" />
                                        )}
                                    </div>
                                )}
                            </div>
                            <span className="text-[11px] sm:text-[12px] text-center text-[#666] group-hover:text-[#1CA0DB] transition-colors leading-tight w-full px-1 line-clamp-2">
                                {item.name}
                            </span>
                        </Link>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                    <Package className="size-10 text-[#ccc]" />
                    <p className="text-sm font-medium text-[#999]">
                        {t('noProductsInCategory') || 'Aucun produit disponible pour le moment dans cette catégorie.'}
                    </p>
                    <Link to={marketplaceLink} className="text-[#1CA0DB] text-sm font-semibold hover:underline">
                        {t('explore') || 'Explorer le marketplace'} →
                    </Link>
                </div>
            )}
        </motion.div>
    );
}

export default BcaCategoryMegaPanel;
