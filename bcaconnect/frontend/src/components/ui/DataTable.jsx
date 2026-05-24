import React from 'react';
import { cn } from '../../lib/utils';

const DataTable = ({
    columns,
    data,
    title,
    actions,
    className,
    emptyMessage = "AUCUNE DONNÉE DISPONIBLE",
    selectable = false,
    selectedIds = [],
    onSelectionChange
}) => {
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            onSelectionChange?.(data.map(item => item.id || item._id));
        } else {
            onSelectionChange?.([]);
        }
    };

    const handleSelectRow = (id) => {
        if (selectedIds.includes(id)) {
            onSelectionChange?.(selectedIds.filter(selectedId => selectedId !== id));
        } else {
            onSelectionChange?.([...selectedIds, id]);
        }
    };

    const allSelected = data.length > 0 && selectedIds.length === data.length;

    return (
        <div className={cn("rounded-2xl border border-slate-200 dark:border-foreground/5 bg-white dark:bg-[#0F1219] overflow-hidden transition-all font-jakarta shadow-sm", className)}>
            {(title || actions || (selectable && selectedIds.length > 0)) && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-6 border-b border-slate-100 dark:border-foreground/5 bg-slate-50/20 dark:bg-white/[0.01] gap-5">
                    <div className="flex items-center gap-4">
                        {title && (
                            <div className="flex items-center gap-3">
                                <div className="size-1.5 bg-[#FF6600] rounded-full shadow-md" />
                                <h3 className="text-[9px] font-black text-slate-900 dark:text-foreground tracking-[0.2em] uppercase pt-0.5">{title}</h3>
                            </div>
                        )}
                        {selectable && selectedIds.length > 0 && (
                            <div className="px-3 py-1 bg-[#FF6600]/10 text-[#FF6600] text-[7px] font-black rounded-lg border border-[#FF6600]/10 animate-in fade-in zoom-in duration-300 uppercase tracking-widest leading-none">
                                {selectedIds.length} SÉLECTIONNÉS
                            </div>
                        )}
                    </div>
                    {actions && <div className="flex items-center gap-4">{actions}</div>}
                </div>
            )}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-100 dark:border-foreground/5 bg-slate-50/30 dark:bg-white/[0.02]">
                            {selectable && (
                                <th className="pl-6 py-4 w-10">
                                    <input 
                                        type="checkbox" 
                                        checked={allSelected}
                                        onChange={handleSelectAll}
                                        className="size-4 rounded-md border border-slate-200 dark:border-foreground/10 text-[#FF6600] focus:ring-[#FF6600] shadow-sm cursor-pointer dark:bg-foreground/5"
                                    />
                                </th>
                            )}
                            {columns.map((col, idx) => (
                                <th key={idx} className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {data.length > 0 ? (
                            data.map((row, rowIdx) => {
                                const rowId = row.id || row._id;
                                const isSelected = selectedIds.includes(rowId);
                                return (
                                    <tr 
                                        key={rowIdx} 
                                        className={cn(
                                            "hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors duration-300 group cursor-default",
                                            isSelected && "bg-[#FF6600]/[0.02]"
                                        )}
                                    >
                                        {selectable && (
                                            <td className="pl-6 py-4">
                                                <input 
                                                    type="checkbox" 
                                                    checked={isSelected}
                                                    onChange={() => handleSelectRow(rowId)}
                                                    className="size-4 rounded-md border border-slate-200 dark:border-foreground/10 text-[#FF6600] focus:ring-[#FF6600] shadow-sm cursor-pointer dark:bg-foreground/5"
                                                />
                                            </td>
                                        )}
                                        {columns.map((col, colIdx) => (
                                            <td key={colIdx} className={cn(
                                                "px-6 py-4 text-[10px] font-bold transition-all duration-300 uppercase tracking-widest",
                                                isSelected ? "text-[#FF6600]" : "text-slate-600 dark:text-muted-foreground/80 group-hover:text-slate-900 dark:group-hover:text-foreground"
                                            )}>
                                                {col.render ? col.render(row) : <span>{row[col.key]}</span>}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-8 py-20 text-center">
                                    <div className="flex flex-col items-center gap-4 opacity-20">
                                        <div className="size-1 w-px h-10 bg-slate-400 animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                            {emptyMessage}
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export { DataTable };
export default DataTable;
