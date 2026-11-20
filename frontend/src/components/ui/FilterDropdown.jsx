import React, { useEffect, useRef, useState } from 'react';
import { Filter, ChevronDown, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * Bouton "Filtrer ▾" unique et réutilisable — remplace les rangées de pastilles de filtre
 * statiques. Au clic, ouvre un panneau listant les options ; la sélection ferme le panneau.
 * Un seul composant partagé pour tous les rôles (client/vendeur/admin/banque/transporteur/technicien).
 *
 * @param {string} label - libellé affiché quand aucune option non-défaut n'est sélectionnée
 * @param {{value: string, label: string, dot?: string, dotClassName?: string}[]} options -
 *   `dot` (couleur CSS inline) ou `dotClassName` (classe Tailwind, ex: "bg-amber-500") affiche une pastille avant le libellé
 * @param {string} value - valeur actuellement sélectionnée
 * @param {(value: string) => void} onChange
 * @param {string} [defaultValue] - valeur considérée comme "pas de filtre actif" (ex: 'TOUS')
 */
const FilterDropdown = ({ label = 'Filtrer', options = [], value, onChange, defaultValue, icon: Icon = Filter, className }) => {
    const [open, setOpen] = useState(false);
    const rootRef = useRef(null);

    useEffect(() => {
        if (!open) return;
        const handleClick = (e) => {
            if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
        };
        const handleKey = (e) => { if (e.key === 'Escape') setOpen(false); };
        document.addEventListener('mousedown', handleClick);
        document.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('mousedown', handleClick);
            document.removeEventListener('keydown', handleKey);
        };
    }, [open]);

    const selected = options.find(o => o.value === value);
    const isActive = selected && selected.value !== (defaultValue ?? options[0]?.value);
    const buttonText = selected ? selected.label : label;

    return (
        <div ref={rootRef} className={cn("relative shrink-0", className)}>
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className={cn(
                    "h-11 px-5 rounded-xl border text-[10px] font-black uppercase tracking-widest flex items-center gap-2.5 transition-all shadow-sm whitespace-nowrap",
                    isActive
                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white"
                        : "bg-card border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
            >
                {selected?.dot || selected?.dotClassName ? (
                    <span className={cn("size-2.5 rounded-full shrink-0", selected.dotClassName)} style={selected.dot ? { background: selected.dot } : undefined} />
                ) : (
                    <Icon className="size-3.5" />
                )}
                <span className="max-w-[160px] truncate">{buttonText}</span>
                <ChevronDown className={cn("size-3.5 transition-transform duration-200", open && "rotate-180")} />
            </button>

            <div
                className={cn(
                    "absolute z-[1100] top-full left-0 mt-2 min-w-[220px] max-h-72 overflow-y-auto custom-scrollbar rounded-2xl border border-border bg-card shadow-2xl shadow-black/10 p-2 origin-top-left transition-all duration-150",
                    open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
                )}
            >
                {options.map(opt => {
                    const isSelected = opt.value === value;
                    return (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => { onChange(opt.value); setOpen(false); }}
                            className={cn(
                                "w-full flex items-center justify-between gap-3 px-3.5 h-10 rounded-xl text-[11px] font-bold text-left transition-all",
                                isSelected ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <span className="flex items-center gap-2.5 min-w-0">
                                {(opt.dot || opt.dotClassName) && (
                                    <span className={cn("size-2.5 rounded-full shrink-0", opt.dotClassName)} style={opt.dot ? { background: opt.dot } : undefined} />
                                )}
                                <span className="truncate">{opt.label}</span>
                            </span>
                            {isSelected && <Check className="size-3.5 shrink-0" />}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default FilterDropdown;
