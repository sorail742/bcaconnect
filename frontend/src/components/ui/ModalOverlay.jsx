import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * Modal plein écran via portal — évite les bugs fixed/transform dans DashboardLayout
 */
export function ModalOverlay({
    open,
    onClose,
    title,
    children,
    maxWidth = 'max-w-lg',
    className,
}) {
    if (typeof document === 'undefined') return null;

    return createPortal(
        <AnimatePresence>
            {open && (
                <>
                    <motion.button
                        type="button"
                        aria-label="Fermer"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm cursor-default"
                        onClick={onClose}
                    />
                    <div className="fixed inset-0 z-[301] flex items-center justify-center p-4 overflow-y-auto pointer-events-none">
                        <motion.div
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby={title ? 'modal-title' : undefined}
                            initial={{ opacity: 0, scale: 0.97, y: 8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.97, y: 8 }}
                            transition={{ duration: 0.18, ease: 'easeOut' }}
                            className={cn(
                                'pointer-events-auto w-full bg-card border border-border rounded-2xl shadow-2xl my-auto',
                                maxWidth,
                                className,
                            )}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {title && (
                                <div className="flex items-start justify-between gap-3 p-6 pb-0">
                                    <h3 id="modal-title" className="font-bold text-lg text-foreground">{title}</h3>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="p-1.5 rounded-lg hover:bg-muted transition-colors shrink-0"
                                    >
                                        <X className="size-5" />
                                    </button>
                                </div>
                            )}
                            {children}
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>,
        document.body,
    );
}

export default ModalOverlay;
