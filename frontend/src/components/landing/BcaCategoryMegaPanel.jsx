import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Flame, TrendingUp } from 'lucide-react';
import { useLanguage } from '../../context/useLanguage';
import { getSubSectionsForCategory } from '../../lib/bcaLandingContent';
import { FOR_YOU_ID } from '../../lib/categoryMegaMenu';

export function BcaCategoryMegaPanel({ category, categoryId, subItems }) {
    const { t } = useLanguage();
    const title = category?.nom || t('categoriesForYou') || 'Catégories pour vous';
    const items = subItems?.length
        ? subItems
        : getSubSectionsForCategory(title).map((item) => ({
            ...item,
            link: `/search?q=${encodeURIComponent(item.name)}`,
        }));

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
                    className="text-sm font-semibold text-[#333] dark:text-gray-300 hover:text-[#FF6600] transition-colors flex items-center gap-1 shrink-0"
                >
                    {t('browseFeatured') || 'Parcourir les sélections en vedette'}
                    <ArrowRight className="size-4" />
                </Link>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-y-8 gap-x-4">
                {items.map((item, idx) => (
                    <Link
                        key={item.id || idx}
                        to={item.link || `/search?q=${encodeURIComponent(item.name)}`}
                        className="flex flex-col items-center gap-3 group"
                    >
                        <div className="relative size-20 sm:size-24 rounded-full bg-white dark:bg-gray-800 border border-[#f0f0f0] dark:border-gray-600 flex items-center justify-center group-hover:border-[#ffd591] group-hover:shadow-md transition-all overflow-hidden">
                            {item.image_url ? (
                                <img
                                    src={item.image_url}
                                    alt={item.name}
                                    className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            ) : (
                                <span className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform duration-300">
                                    {item.icon || '📦'}
                                </span>
                            )}
                            {item.badge && (
                                <div className="absolute -top-0.5 -right-0.5 size-6 bg-white rounded-full shadow border border-[#f0f0f0] flex items-center justify-center">
                                    {item.badge === 'blue' ? (
                                        <TrendingUp className="size-3.5 text-[#1677ff]" strokeWidth={2.5} />
                                    ) : (
                                        <Flame className="size-3.5 text-[#FF6600] fill-[#FF6600]" />
                                    )}
                                </div>
                            )}
                        </div>
                        <span className="text-[12px] sm:text-[13px] text-center text-[#666] dark:text-gray-400 group-hover:text-[#FF6600] transition-colors leading-tight max-w-[100px]">
                            {item.name}
                        </span>
                    </Link>
                ))}
            </div>
        </motion.div>
    );
}

export default BcaCategoryMegaPanel;
