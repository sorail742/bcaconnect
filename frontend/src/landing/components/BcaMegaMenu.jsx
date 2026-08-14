import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BcaCategorySidebar } from './BcaCategorySidebar';
import { BcaCategoryMegaPanel } from './BcaCategoryMegaPanel';
import categoryService from '../../category/services/categoryService';
import { mergeBackendCategories, getMegaMenuSubItems, FOR_YOU_ID } from '../../category/lib/categoryMegaMenu';

/** Mega-menu BCA — panneau centré sous le header fixe (style Alibaba) */
export function BcaMegaMenu({ isOpen, onMouseEnter, onMouseLeave, top = 140 }) {
    const [rawBackend, setRawBackend] = useState([]);
    const [categories, setCategories] = useState(() => mergeBackendCategories());
    const [activeCategory, setActiveCategory] = useState({
        id: FOR_YOU_ID,
        nom: 'Catégories pour vous',
    });

    useEffect(() => {
        categoryService.getAll()
            .then((res) => {
                const raw = Array.isArray(res) ? res : (res?.data || res?.categories || []);
                if (raw.length > 0) {
                    setRawBackend(raw);
                    setCategories(mergeBackendCategories(raw));
                }
            })
            .catch(() => {});
    }, []);

    const subItems = getMegaMenuSubItems(activeCategory, rawBackend);

    if (typeof document === 'undefined') return null;

    return createPortal(
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
                            subItems={subItems}
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body,
    );
}

export default BcaMegaMenu;
