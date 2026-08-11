import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

const Modal = ({ isOpen, onClose, title, children, maxWidth = "max-w-xl", glass = false }) => {
    // Empêcher le défilement du body quand le modal est ouvert
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-[#020617]/60 backdrop-blur-md"
                        onClick={onClose}
                    />

                    {/* Modal Container */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", damping: 30, stiffness: 450 }}
                        className={cn(
                            "relative w-full max-h-[90vh] overflow-hidden flex flex-col",
                            glass
                                ? "bg-card/95 backdrop-blur-3xl border border-border shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] rounded-3xl max-w-2xl"
                                : cn("bg-card rounded-3xl shadow-2xl", maxWidth)
                        )}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header High-Tech */}
                        <div className={cn(
                            "flex items-center justify-between px-10 py-8 border-b border-border",
                            glass && "bg-card/40 border-border/60"
                        )}>
                            <div className="flex items-center gap-4">
                                <div className="size-3 rounded-full bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)] animate-pulse" />
                                <h3 className="text-sm font-black text-foreground uppercase tracking-[0.3em]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                    {title || "COMMAND_TERMINAL"}
                                </h3>
                            </div>
                            <button
                                onClick={onClose}
                                className="size-10 flex items-center justify-center rounded-xl bg-muted border border-border text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 hover:rotate-90 transition-all duration-500 shadow-sm"
                            >
                                <X className="size-5" />
                            </button>
                        </div>

                        {/* Body interactif avec scroll personnalisé */}
                        <div className={cn(
                            "overflow-y-auto custom-scrollbar flex-1",
                            glass ? "p-10 md:p-12" : "p-8 md:p-10"
                        )}>
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return createPortal(modalContent, document.body);
};

export default Modal;
