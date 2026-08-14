import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { cn, adaptiveValueSize } from '../../lib/utils';
import { TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import AnimatedCounter from './AnimatedCounter';

const BADGE_STYLES = {
    rose: "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
    amber: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
    default: "bg-primary/10 text-primary border-primary/20",
};

/** Palette de l'icône — même familles de teintes que BADGE_STYLES pour rester cohérent visuellement. */
const ICON_STYLES = {
    primary: "from-primary/15 to-primary/5 text-primary border-primary/10",
    rose: "from-rose-500/15 to-rose-500/5 text-rose-600 dark:text-rose-400 border-rose-500/10",
    amber: "from-amber-500/15 to-amber-500/5 text-amber-600 dark:text-amber-400 border-amber-500/10",
    emerald: "from-emerald-500/15 to-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/10",
};

/** Mini sparkline — 12 points, de-emphasis hue with the current point in the accent (dataviz skill: figures). */
const Sparkline = ({ points = [], positive = true }) => {
    if (!points || points.length < 2) return null;
    const w = 64;
    const h = 22;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const stepX = w / (points.length - 1);
    const coords = points.map((p, i) => [i * stepX, h - ((p - min) / range) * h]);
    const path = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
    const [lastX, lastY] = coords[coords.length - 1];
    const color = positive ? 'rgb(16 185 129)' : 'rgb(244 63 94)';

    return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0 overflow-visible">
            <path d={path} fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
            <circle cx={lastX} cy={lastY} r="2.5" fill={color} stroke="var(--card, #fff)" strokeWidth="1.5" />
        </svg>
    );
};

const DashboardCard = ({
    title,
    value,
    description,
    trend,
    trendValue,
    icon: Icon,
    iconColor = "primary",
    className,
    badge,
    impact,
    sparkline,
    variant = "default",
    onClick,
    href,
}) => {
    const navigate = useNavigate();
    const isPositive = trend === "up";
    // N'anime que les valeurs "propres" (un seul groupe de chiffres + suffixe éventuel).
    // Les valeurs déjà formatées avec séparateur de milliers (ex. "1 234 567 GNF" via
    // toLocaleString) sont affichées telles quelles plutôt que cassées par le compteur.
    const isAnimatable = typeof value === 'number' || /^\d+(\.\d+)?\D*$/.test(String(value ?? '').trim());
    const isClickable = Boolean(onClick || href);
    const handleClick = isClickable
        ? (onClick || (() => navigate(href)))
        : undefined;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -3 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onClick={handleClick}
            role={isClickable ? "button" : undefined}
            tabIndex={isClickable ? 0 : undefined}
            onKeyDown={isClickable ? (e) => (e.key === 'Enter' || e.key === ' ') && handleClick(e) : undefined}
            className={cn(
                "group relative overflow-hidden rounded-2xl border border-border bg-card text-card-foreground",
                "shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:shadow-[0_12px_32px_-8px_rgba(15,23,42,0.16)]",
                "hover:border-primary/30 transition-shadow duration-300",
                isClickable && "cursor-pointer",
                className
            )}
        >
            {/* Corner glow — soft accent wash that appears on hover, never a hue on plain data ink */}
            <div className="pointer-events-none absolute -top-10 -right-10 size-28 rounded-full bg-primary/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative p-4 flex flex-col h-full gap-2.5">
                <div className="flex items-start justify-between gap-2">
                    <div className={cn(
                        "size-9 rounded-xl bg-gradient-to-br border flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110",
                        ICON_STYLES[iconColor] || ICON_STYLES.primary
                    )}>
                        {Icon && <Icon className="size-4" />}
                    </div>

                    {badge ? (
                        <span className={cn(
                            "px-1.5 py-0.5 rounded-md text-[10px] font-semibold border leading-none",
                            BADGE_STYLES[badge.color] || BADGE_STYLES.default
                        )}>
                            {badge.label}
                        </span>
                    ) : trendValue && (
                        <span className={cn(
                            "flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-semibold border leading-none",
                            isPositive
                                ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                                : "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                        )}>
                            {isPositive ? <TrendingUp className="size-2.5" /> : <TrendingDown className="size-2.5" />}
                            {trendValue}
                        </span>
                    )}
                </div>

                <div className="flex items-end justify-between gap-2">
                    <div className="space-y-0.5 min-w-0">
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide truncate">
                            {title}
                        </p>
                        <p className={cn(adaptiveValueSize(value), "font-bold text-foreground tracking-tight tabular-nums leading-tight")}>
                            {isAnimatable ? <AnimatedCounter value={value} duration={1.2} /> : value}
                        </p>
                    </div>
                    {sparkline && <Sparkline points={sparkline} positive={isPositive} />}
                </div>

                {(description || impact) && (
                    <div className="pt-2 border-t border-border space-y-1.5">
                        {impact && (
                            <div className={cn(
                                "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium border",
                                impact.type === 'risk' ? "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20" :
                                impact.type === 'growth' ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" :
                                "bg-muted text-muted-foreground border-border"
                            )}>
                                <Sparkles className="size-2.5 opacity-60" />
                                <span className="opacity-70">{impact.label}:</span>
                                <span className="font-semibold">{impact.value}</span>
                            </div>
                        )}
                        {description && (
                            <p className="text-[11px] text-muted-foreground leading-snug">
                                {description}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export { DashboardCard };
export default DashboardCard;
