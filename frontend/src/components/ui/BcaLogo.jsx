import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { cn } from '../../lib/utils';

import { useLanguage } from '../../context/useLanguage';

const BcaLogo = ({ className, size = "h-10", variant = "color", hideText = false }) => {
    const { t } = useLanguage();
    // Brand colors from screenshot
    const orangeBrand = "#FF6600";
    
    return (
        <div translate="no" className={cn("inline-flex items-center gap-3 select-none group", className)}>
            {/* Logo Icon: Orange Square with White Zap */}
            <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                    "flex items-center justify-center rounded-xl transition-shadow",
                    size, "aspect-square shadow-lg shadow-orange-500/20"
                )}
                style={{ backgroundColor: orangeBrand }}
            >
                <Zap className="size-1/2 text-white fill-white" />
            </motion.div>

            {!hideText && (
                <div className="flex flex-col leading-none">
                    <span className="text-xl md:text-2xl font-black tracking-tighter flex items-center">
                        <span className="text-foreground">BCA</span>
                        <span style={{ color: orangeBrand }} className="ml-1 uppercase">CONNECT</span>
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 mt-0.5">
                        {t('logoSubtitle') || "Premier Hub de Guinée"}
                    </span>
                </div>
            )}
        </div>
    );
};

export default BcaLogo;
