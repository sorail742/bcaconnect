import React from 'react';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, ReferenceArea, ReferenceDot,
} from 'recharts';
import { cn } from '../../lib/utils';
import ChartTooltip from './ChartTooltip';

/** Callout annoté sur un point remarquable (ex: pic hebdomadaire) — trait + étiquette, données réelles uniquement. */
const PeakCallout = ({ viewBox, value, badge, formatLabel, color }) => {
    if (!viewBox) return null;
    const x = viewBox.x + viewBox.width / 2;
    const y = viewBox.y + viewBox.height / 2;
    const label = formatLabel ? formatLabel(value) : String(value);
    return (
        <g>
            <line x1={x} y1={y - 8} x2={x} y2={y - 24} stroke={color} strokeWidth={1.5} />
            <text x={x} y={y - 30} textAnchor="middle" fontSize={7} fontWeight={900} letterSpacing="0.5" fill={color}>
                {badge}
            </text>
            <text x={x} y={y - 40} textAnchor="middle" fontSize={9} fontWeight={900} fill="#fff">
                {label}
            </text>
        </g>
    );
};

/**
 * Card "hero chart" partagée entre tous les dashboards par rôle — style "terminal"
 * (fond sombre par défaut, quel que soit le thème de la page), zone surlignée optionnelle
 * et callout de pic optionnel. Généralise le chart du dashboard client.
 *
 * @param {'area'|'bar'} variant
 * @param {boolean} forceDark - applique une classe `dark` locale (cascade via les tokens CSS) ; true par défaut
 * @param {{start, end, label}} [zone] - bande ReferenceArea optionnelle
 * @param {{entry, badge, formatLabel}} [peak] - callout ReferenceDot optionnel
 * @param {{icon, message}} [emptyState]
 */
const HeroChartCard = ({
    title,
    subtitle,
    icon: Icon,
    variant = 'area',
    forceDark = true,
    data = [],
    xKey,
    yKey,
    unit = 'GNF',
    height = 280,
    zone,
    peak,
    color = '#1CA0DB',
    emptyState,
    headerExtra,
    footer,
    className,
}) => {
    const hasData = data.some((d) => Number(d[yKey]) > 0);
    const gradientId = React.useId().replace(/[:]/g, '');
    const EmptyIcon = emptyState?.icon;

    const sharedAxisProps = {
        x: (
            <XAxis
                dataKey={xKey}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 8, fontWeight: 900, letterSpacing: '0.1em' }}
            />
        ),
        y: (
            <YAxis
                axisLine={false}
                tickLine={false}
                width={44}
                domain={[0, (max) => Math.ceil(max * 1.3)]}
                tick={{ fill: '#94a3b8', fontSize: 8, fontWeight: 900 }}
                tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
            />
        ),
    };

    const hasZone = zone && zone.start !== null && zone.start !== undefined && zone.end !== null && zone.end !== undefined;
    const zoneEl = hasZone && (
        <ReferenceArea
            x1={zone.start}
            x2={zone.end}
            fill={color}
            fillOpacity={0.06}
            stroke={color}
            strokeOpacity={0.15}
            strokeDasharray="3 3"
            label={{ value: zone.label, position: 'insideBottom', fill: color, fontSize: 7, fontWeight: 900, letterSpacing: 0.5 }}
        />
    );

    const peakEl = peak?.entry && (
        <ReferenceDot
            x={peak.entry[xKey]}
            y={peak.entry[yKey]}
            r={4}
            fill={color}
            stroke="#fff"
            strokeWidth={2}
            isFront
            label={<PeakCallout value={peak.entry[yKey]} badge={peak.badge} formatLabel={peak.formatLabel} color={color} />}
        />
    );

    return (
        <div className={cn(
            forceDark && 'dark',
            'bg-card border border-border rounded-2xl p-4 shadow-2xl shadow-black/30 relative overflow-hidden group',
            className
        )}>
            <div className="flex items-center justify-between mb-10 relative z-10">
                <div className="flex items-center gap-4">
                    {Icon && (
                        <div className="size-6 rounded-xl bg-foreground/5 flex items-center justify-center border border-border shadow-md" style={{ color }}>
                            <Icon className="size-5" />
                        </div>
                    )}
                    <div className="space-y-1">
                        {title && <h3 className="text-[10px] font-black text-foreground uppercase">{title}</h3>}
                        {subtitle && <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">{subtitle}</p>}
                    </div>
                </div>
                {headerExtra}
            </div>

            <div className="relative z-10 w-full mb-4" style={{ height }}>
                {hasData ? (
                    <ResponsiveContainer width="100%" height="100%">
                        {variant === 'bar' ? (
                            <BarChart data={data} margin={{ top: peak ? 44 : 8, right: 8, left: 0, bottom: 0 }}>
                                <CartesianGrid vertical={false} stroke="currentColor" className="text-white/5" strokeWidth={1} />
                                {zoneEl}
                                {sharedAxisProps.x}
                                {sharedAxisProps.y}
                                <Tooltip content={<ChartTooltip unit={unit} />} cursor={{ fill: color, fillOpacity: 0.06 }} />
                                <Bar dataKey={yKey} name={title} fill={color} radius={[4, 4, 0, 0]} maxBarSize={24} />
                                {peakEl}
                            </BarChart>
                        ) : (
                            <AreaChart data={data} margin={{ top: peak ? 44 : 8, right: 8, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} stroke="currentColor" className="text-white/5" strokeWidth={1} />
                                {zoneEl}
                                {sharedAxisProps.x}
                                {sharedAxisProps.y}
                                <Tooltip content={<ChartTooltip unit={unit} />} cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '4 4' }} />
                                <Area
                                    name={title}
                                    type="monotone"
                                    dataKey={yKey}
                                    stroke={color}
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill={`url(#${gradientId})`}
                                    dot={false}
                                    activeDot={{ r: 4, fill: color, stroke: 'white', strokeWidth: 2 }}
                                />
                                {peakEl}
                            </AreaChart>
                        )}
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center gap-2 text-white/20">
                        {EmptyIcon && <EmptyIcon className="size-8" />}
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30">
                            {emptyState?.message || 'Aucune donnée pour le moment'}
                        </p>
                    </div>
                )}
            </div>
            {footer}
        </div>
    );
};

export default HeroChartCard;
