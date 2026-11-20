import React from 'react';

/**
 * Tooltip Recharts partagée, conforme aux règles dataviz : la valeur est
 * l'élément fort (grand, contrasté), le nom de série est secondaire ; chaque
 * ligne est repérée par un trait de couleur (line-key), jamais une pastille pleine.
 */
const ChartTooltip = ({ active, payload, label, unit = 'GNF', formatter }) => {
    if (!active || !payload?.length) return null;

    return (
        <div className="min-w-[140px] rounded-xl border border-border bg-card/95 backdrop-blur-sm p-3 shadow-xl shadow-black/10 animate-in fade-in zoom-in-95 duration-150">
            {label && (
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 pb-2 border-b border-border/60">
                    {label}
                </p>
            )}
            <div className="space-y-1.5">
                {payload.map((entry, i) => {
                    const isQty = entry.name?.toLowerCase().includes('qt') || entry.name?.toLowerCase().includes('unit');
                    const [displayValue, displayUnit] = formatter
                        ? formatter(entry.value, entry.name, entry)
                        : [Number(entry.value).toLocaleString('fr-GN'), isQty ? 'unités' : unit];
                    return (
                        <div key={i} className="flex items-center justify-between gap-4">
                            <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground min-w-0 truncate">
                                <span className="inline-block w-2.5 h-0.5 rounded-full shrink-0" style={{ backgroundColor: entry.color || entry.fill }} />
                                {entry.name}
                            </span>
                            <span className="text-sm font-bold text-foreground tabular-nums whitespace-nowrap">
                                {displayValue}{displayUnit ? ` ${displayUnit}` : ''}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ChartTooltip;
