import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BcaCategorySidebar, FOR_YOU_ID } from './BcaCategorySidebar';
import { BcaCategoryMegaPanel } from './BcaCategoryMegaPanel';
import { BCA_CATEGORIES } from '../../lib/categoryConstants';
import categoryService from '../../services/categoryService';

/** Mega-menu BCA — panneau central au survol « Toutes les catégories » */
export function BcaMegaMenu({ isOpen, onMouseEnter, onMouseLeave, top = 140 }) {
    const [categories, setCategories] = useState(BCA_CATEGORIES);
    const [activeCategory, setActiveCategory] = useState({
        id: FOR_YOU_ID,
        nom: 'Catégories pour vous',
    });

    useEffect(() => {
        categoryService.getAll()
            .then((res) => {
                const raw = Array.isArray(res) ? res : (res?.data || res?.categories || []);
                if (raw.length > 0) {
                    setCategories(BCA_CATEGORIES.map((bcaCat) => {
                        const backendMatch = raw.find((c) => {
                            const name = (c.nom_categorie || c.nom || c.name || '').toLowerCase();
                            return bcaCat.filter.toLowerCase().split(' ').some((w) => name.includes(w));
                        });
                        return { ...bcaCat, id: backendMatch?.id || bcaCat.id, originalId: bcaCat.id };
                    }));
                }
            })
            .catch(() => {});
    }, []);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                    className="fixed left-[max(12px,calc(50vw-590px))] w-[min(calc(100vw-24px),1180px)] bg-white rounded-b-2xl border border-[#ebebeb] shadow-[0_24px_80px_rgba(0,0,0,0.15)] z-[200] flex overflow-hidden max-h-[min(70vh,560px)]"
                    style={{ top }}
                >
                    <div className="w-[260px] lg:w-[280px] shrink-0 border-r border-[#f0f0f0] overflow-hidden">
                        <BcaCategorySidebar
                            categories={categories}
                            activeId={activeCategory.id}
                            onHover={setActiveCategory}
                            maxHeight={520}
                            showSeeMore={false}
                            className="rounded-none shadow-none border-0 h-full"
                        />
                    </div>
                    <div className="flex-1 overflow-y-auto min-w-0">
                        <BcaCategoryMegaPanel
                            category={activeCategory}
                            categoryId={activeCategory.id}
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default BcaMegaMenu;
