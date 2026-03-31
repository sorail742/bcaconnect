import React from 'react';
import { cn } from '../../lib/utils';

const DataTable = ({
    columns,
    data,
    title,
    actions,
    className,
    emptyMessage = "Aucune donnée disponible",
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
        <div className={cn("rounded-xl border border-slate-100 dark:border-white/5 bg-card overflow-hidden shadow-sm transition-all", className)}>
            {(title || actions || (selectable && selectedIds.length > 0)) && (
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50 dark:border-white/5 bg-slate-50/10 dark:bg-white/[0.01]">
                    <div className="flex items-center gap-4">
                        {title && <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{title}</h3>}
                        {selectable && selectedIds.length > 0 && (
                            <div className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-lg border border-primary/20 animate-in fade-in zoom-in duration-300">
                                {selectedIds.length} SÉLECTIONNÉS
                            </div>
                        )}
                    </div>
                    {actions && <div className="flex items-center gap-3">{actions}</div>}
                </div>
            )}
            <div className="overflow-x-auto text-[13px]">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01]">
                            {selectable && (
                                <th className="pl-6 py-3 w-10">
                                    <input 
                                        type="checkbox" 
                                        checked={allSelected}
                                        onChange={handleSelectAll}
                                        className="size-4 rounded border-border text-primary focus:ring-primary shadow-sm cursor-pointer"
                                    />
                                </th>
                            )}
                            {columns.map((col, idx) => (
                                <th key={idx} className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/60">
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                        {data.length > 0 ? (
                            data.map((row, rowIdx) => {
                                const rowId = row.id || row._id;
                                const isSelected = selectedIds.includes(rowId);
                                return (
                                    <tr 
                                        key={rowIdx} 
                                        className={cn(
                                            "hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors duration-200 group cursor-default",
                                            isSelected && "bg-primary/[0.02]"
                                        )}
                                    >
                                        {selectable && (
                                            <td className="pl-6 py-3">
                                                <input 
                                                    type="checkbox" 
                                                    checked={isSelected}
                                                    onChange={() => handleSelectRow(rowId)}
                                                    className="size-4 rounded border-border text-primary focus:ring-primary shadow-sm cursor-pointer"
                                                />
                                            </td>
                                        )}
                                        {columns.map((col, colIdx) => (
                                            <td key={colIdx} className={cn(
                                                "px-6 py-3 text-[13px] font-medium transition-colors",
                                                isSelected ? "text-primary" : "text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"
                                            )}>
                                                {col.render ? col.render(row) : <span>{row[col.key]}</span>}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-10 py-16 text-center text-muted-foreground text-sm font-medium opacity-70">
                                    {emptyMessage}
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
