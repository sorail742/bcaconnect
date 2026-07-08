import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Flame, TrendingUp } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { getSubSectionsForCategory } from '../../lib/bcaLandingContent';

const FOR_YOU_ID = 'for-you';

export function BcaCategoryMegaPanel({ category, categoryId }) {
    const { t } = useLanguage();
    const title = category?.nom || t('categoriesForYou') || 'Catégories pour vous';
    const subItems = getSubSectionsForCategory(title);
    const marketplaceLink = categoryId && categoryId !== FOR_YOU_ID
        ? `/marketplace?category=${categoryId}`
        : '/marketplace';

    return (
        <motion.div
            key={categoryId || FOR_YOU_ID}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="flex-1 p-6 sm:p-8 lg:p-10 bg-[#fafafa] min-h-[380px]"
        >
            <div className="flex items-center justify-between mb-8 px-1">
                <h2 className="text-xl sm:text-2xl font-bold text-[#333]">{title}</h2>
                <Link
                    to={marketplaceLink}
                    className="text-sm font-semibold text-[#333] hover:text-[#FF6600] transition-colors flex items-center gap-1"
                >
                    {t('browseFeatured') || 'Parcourir les sélections en vedette'}
                    <ArrowRight className="size-4" />
                </Link>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-y-8 gap-x-6">
                {subItems.map((item, idx) => {
                    const categoryParam = categoryId && categoryId !== FOR_YOU_ID ? `?category=${categoryId}` : '';
                    return (
                    <Link
                        key={idx}
                        to={`/marketplace${categoryParam}`}
                        className="flex flex-col items-center gap-3 group min-w-0"
                    >
                        <div className="relative size-20 sm:size-24 rounded-full bg-white border border-[#f0f0f0] flex items-center justify-center group-hover:border-[#ffd591] group-hover:shadow-md transition-all shrink-0">
                            <span className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform duration-300">
                                {item.icon || '📦'}
                            </span>
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
                        <span className="text-[11px] sm:text-[12px] text-center text-[#666] group-hover:text-[#FF6600] transition-colors leading-tight w-full px-1 line-clamp-2">
                            {item.name}
                        </span>
                    </Link>
                    );
                })}
            </div>
        </motion.div>
    );
}

export default BcaCategoryMegaPanel;
