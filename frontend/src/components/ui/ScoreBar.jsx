import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const COLOR_STYLES = {
    primary: { bar: 'bg-primary', text: 'text-primary', glow: 'shadow-[0_0_10px_rgba(28,160,219,0.4)]' },
    rose: { bar: 'bg-rose-500', text: 'text-rose-500', glow: 'shadow-[0_0_10px_rgba(244,63,94,0.4)]' },
    amber: { bar: 'bg-amber-500', text: 'text-amber-500', glow: 'shadow-[0_0_10px_rgba(245,158,11,0.4)]' },
    emerald: { bar: 'bg-emerald-500', text: 'text-emerald-500', glow: 'shadow-[0_0_10px_rgba(16,185,129,0.4)]' },
};

/** Barre label + % + piste + remplissage — généralise le pattern répété dans les dashboards (score, disponibilité, stock...). */
const ScoreBar = ({ label, value = 0, size = 'default', color = 'primary', animated = true, className }) => {
    const styles = COLOR_STYLES[color] || COLOR_STYLES.primary;
    const clamped = Math.max(0, Math.min(100, value));
    const isDefault = size === 'default';

    return (
        <div className={cn('space-y-1', isDefault && 'space-y-2', className)}>
            {label && (
                <div className={cn('flex items-center justify-between font-black uppercase tracking-widest', isDefault ? 'text-[8px]' : 'text-[7px]')}>
                    <span className="text-muted-foreground/80">{label}</span>
                    <span className={cn(isDefault ? styles.text : 'text-foreground', 'tabular-nums')}>{Math.round(clamped)}%</span>
                </div>
            )}
            <div className={cn(
                'bg-muted rounded-full overflow-hidden border border-border',
                isDefault ? 'h-2.5 p-0.5' : 'h-1.5'
            )}>
                {animated ? (
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${clamped}%` }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                        className={cn('h-full rounded-full', styles.bar, isDefault && styles.glow)}
                    />
                ) : (
                    <div
                        className={cn('h-full rounded-full transition-all duration-1000', styles.bar, isDefault && styles.glow)}
                        style={{ width: `${clamped}%` }}
                    />
                )}
            </div>
        </div>
    );
};

export default ScoreBar;
