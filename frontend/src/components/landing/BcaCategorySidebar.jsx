import React, { useState, useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useLanguage } from '../../context/LanguageContext';
import { BCA_ICONS, BCA_CATEGORIES } from '../../lib/categoryConstants';

export const FOR_YOU_ID = 'for-you';

/** Sidebar catégories BCA Connect */
export function BcaCategorySidebar({
    categories = BCA_CATEGORIES,
    activeId,
    onSelect,
    onHover,
    maxHeight = 420,
    showSeeMore = true,
    className = '',
}) {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [hoveredId, setHoveredId] = useState(null);

    const listItems = useMemo(() => {
        const forYou = {
            id: FOR_YOU_ID,
            nom: t('categoriesForYou') || 'Catégories pour vous',
            icon: BCA_ICONS.star,
            isForYou: true,
        };
        return [forYou, ...categories];
    }, [categories, t]);

    const resolvedActiveId = activeId ?? hoveredId ?? FOR_YOU_ID;

    const handleEnter = (cat) => {
        setHoveredId(cat.id);
        onHover?.(cat);
    };

    const handleClick = (cat) => {
        if (onSelect) {
            onSelect(cat);
            return;
        }
        if (cat.id === FOR_YOU_ID) {
            navigate('/marketplace');
        } else {
            navigate(`/marketplace?category=${cat.id}`);
        }
    };

    const isHighlighted = (id) => resolvedActiveId === id;

    return (
        <div className={cn('bca-category-panel relative h-full', className)}>
            <div
                className={cn('bca-category-scroll overflow-y-auto overflow-x-hidden py-1', showSeeMore && 'pb-14')}
                style={{ maxHeight }}
            >
                {listItems.map((cat, index) => {
                    const highlighted = isHighlighted(cat.id);
                    const Icon = cat.icon || BCA_ICONS.default;

                    return (
                        <button
                            key={cat.originalId || cat.id || index}
                            type="button"
                            onMouseEnter={() => handleEnter(cat)}
                            onClick={() => handleClick(cat)}
                            className={cn(
                                'bca-category-item w-full flex items-center gap-3 px-4 py-[11px] text-left transition-colors duration-150 group',
                                highlighted
                                    ? 'bg-[#fff7e6] text-[#FF6600]'
                                    : 'text-[#333] hover:bg-[#fff7e6] hover:text-[#FF6600]'
                            )}
                        >
                            <span className={cn('shrink-0 flex items-center justify-center', highlighted ? 'text-[#FF6600]' : 'text-[#333] group-hover:text-[#FF6600]')}>
                                <Icon className={cn('size-[22px]', highlighted ? 'text-[#FF6600]' : 'text-[#333] group-hover:text-[#FF6600]')} />
                            </span>
                            <span className={cn(
                                'flex-1 text-[14px] leading-snug pr-2',
                                highlighted ? 'font-semibold text-[#FF6600]' : 'font-normal text-[#333] group-hover:text-[#FF6600] group-hover:font-medium'
                            )}>
                                {cat.nom}
                            </span>
                            <ChevronRight className={cn(
                                'size-4 shrink-0 transition-colors',
                                highlighted ? 'text-[#FF6600]' : 'text-[#ccc] group-hover:text-[#FF6600]'
                            )} />
                        </button>
                    );
                })}
            </div>

            {showSeeMore && (
                <>
                    <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white via-white/90 to-transparent rounded-b-2xl" />
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center pointer-events-none">
                        <button
                            type="button"
                            onClick={() => navigate('/marketplace')}
                            className="pointer-events-auto bg-white text-[#333] text-[14px] font-medium px-6 py-2 rounded-full border border-[#ebebeb] shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] hover:border-[#d9d9d9] transition-all"
                        >
                            {t('seeMore') || 'Voir plus'}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default BcaCategorySidebar;
