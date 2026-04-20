import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

const Modal = ({ isOpen, onClose, title, children, maxWidth = "max-w-xl", glass = false }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 xl:p-8">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-[#020617]/40 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal Content */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: "spring", damping: 25, stiffness: 400 }}
                        className={cn(
                            "relative w-full overflow-hidden",
                            glass 
                                ? "bg-white/90 backdrop-blur-3xl border border-white shadow-2xl rounded-[2.5rem] max-w-2xl" 
                                : cn("bg-white rounded-[2rem] shadow-xl", maxWidth)
                        )}
                    >
                        {/* Header */}
                        <div className={cn(
                            "flex items-center justify-between px-8 py-6 border-b border-slate-100",
                            glass && "bg-white/20 border-white/40"
                        )}>
                            <div className="flex items-center gap-3">
                                <div className="size-2 rounded-full bg-primary animate-pulse" />
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                    {title || "Action_Required"}
                                </h3>
                            </div>
                            <button
                                onClick={onClose}
                                className="size-10 flex items-center justify-center rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 transition-all duration-300"
                            >
                                <X className="size-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className={cn(
                            "max-h-[80vh] overflow-y-auto custom-scrollbar",
                            glass ? "p-10" : "p-8"
                        )}>
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default Modal;
