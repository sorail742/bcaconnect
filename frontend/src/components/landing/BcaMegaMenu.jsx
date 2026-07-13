import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BcaCategorySidebar } from './BcaCategorySidebar';
import { BcaCategoryMegaPanel } from './BcaCategoryMegaPanel';
import categoryService from '../../services/categoryService';
import { mergeBackendCategories, getMegaMenuSubItems, FOR_YOU_ID } from '../../lib/categoryMegaMenu';

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
<<<<<<< HEAD
                setRawBackend(raw);
                setCategories(mergeBackendCategories(raw));
=======
                if (raw.length > 0) {
                    setCategories(BCA_CATEGORIES.map((bcaCat) => {
                        const backendMatch = raw.find((c) => {
                            const name = (c.nom_categorie || c.nom || c.name || '').toLowerCase();
                            return bcaCat.filter.toLowerCase().split(' ').some((w) => name.includes(w));
                        });
                        return { ...bcaCat, id: backendMatch?.id || bcaCat.id, originalId: bcaCat.id };
                    }));
                }
>>>>>>> cc9e8c22a12230e3e9d0244ad41cdcde74833070
            })
            .catch(() => {});
    }, []);

    const subItems = getMegaMenuSubItems(activeCategory, rawBackend);

    if (typeof document === 'undefined') return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
<<<<<<< HEAD
                <>
                    {/* Voile léger — pleine largeur sous le header */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="fixed inset-x-0 bottom-0 z-[199] bg-black/10"
                        style={{ top }}
                        onMouseEnter={onMouseEnter}
                        onMouseLeave={onMouseLeave}
                        aria-hidden
                    />

                    {/* Panneau centré — aligné sur le conteneur site (max 1440px) */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="fixed inset-x-0 z-[200]"
                        style={{ top }}
                        onMouseEnter={onMouseEnter}
                        onMouseLeave={onMouseLeave}
                    >
                        <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-12">
                            <div className="bca-mega-menu bg-white dark:bg-gray-900 rounded-b-2xl border border-[#ebebeb] dark:border-gray-700 shadow-[0_24px_80px_rgba(0,0,0,0.15)] flex overflow-hidden max-h-[min(70vh,560px)]">
                                <div className="w-[260px] lg:w-[280px] shrink-0 border-r border-[#f0f0f0] dark:border-gray-700 overflow-hidden">
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
                            </div>
                        </div>
                    </motion.div>
                </>
=======
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
>>>>>>> cc9e8c22a12230e3e9d0244ad41cdcde74833070
            )}
        </AnimatePresence>,
        document.body,
    );
}

export default BcaMegaMenu;
