import React from 'react';
import { cn } from '../../lib/utils';

const DataTable = ({
    columns,
    data,
    title,
    actions,
    className,
    emptyMessage = "Aucune donnée disponible"
}) => {
    return (
        <div className={cn("rounded-xl border border-border bg-card overflow-hidden", className)}>
            {(title || actions) && (
                <div className="flex items-center justify-between p-6 border-b border-border">
                    {title && <h3 className="text-lg font-semibold text-foreground">{title}</h3>}
                    {actions && <div className="flex items-center gap-2">{actions}</div>}
                </div>
            )}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-border bg-muted/30">
                            {columns.map((col, idx) => (
                                <th key={idx} className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {data.length > 0 ? (
                            data.map((row, rowIdx) => (
                                <tr key={rowIdx} className="hover:bg-muted/30 transition-colors group">
                                    {columns.map((col, colIdx) => (
                                        <td key={colIdx} className="px-6 py-4 text-sm text-foreground">
                                            {col.render ? col.render(row) : row[col.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-12 text-center text-muted-foreground italic text-sm">
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
