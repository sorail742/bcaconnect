import React, { useState } from 'react';
import { Plus, Trash2, Warehouse, RefreshCw } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import { usePartnerStockTotal, useCreatePartnerStock, useDeletePartnerStock } from '../hooks/usePartnerStock';

const TYPE_LABELS = {
    consigne: 'Consigne',
    entrepot_tiers: 'Entrepôt tiers',
    dropshipping: 'Dropshipping',
};

const EMPTY_FORM = { partenaire_nom: '', partenaire_contact: '', type_stock: 'entrepot_tiers', quantite: '', localisation: '' };

/**
 * Gestion du stock partenaire/entrepôt tiers d'un produit (cahier des charges 2.5) —
 * distinct du stock propre affiché/édité via StockEditor.
 */
const PartnerStockModal = ({ product, isOpen, onClose }) => {
    const [form, setForm] = useState(EMPTY_FORM);
    const { data, loading, refetch } = usePartnerStockTotal(product?.id, { enabled: isOpen });
    const createMutation = useCreatePartnerStock();
    const deleteMutation = useDeletePartnerStock();

    const handleAdd = (e) => {
        e.preventDefault();
        if (!form.partenaire_nom.trim() || form.quantite === '') return;
        createMutation.mutate(
            { produitId: product.id, ...form, quantite: parseInt(form.quantite, 10) },
            { onSuccess: () => { setForm(EMPTY_FORM); refetch(); } }
        );
    };

    const handleDelete = (id) => {
        deleteMutation.mutate({ id, produitId: product.id }, { onSuccess: () => refetch() });
    };

    if (!product) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Stock partenaire — ${product.nom_produit}`} maxWidth="max-w-2xl">
            <div className="space-y-6">
                <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-2xl bg-slate-50 dark:bg-white/5 p-4 text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Stock propre</p>
                        <p className="text-xl font-black text-slate-900 dark:text-white tabular-nums">{loading ? '…' : data?.stock_propre ?? product.stock_quantite}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 dark:bg-white/5 p-4 text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Partenaires</p>
                        <p className="text-xl font-black text-slate-900 dark:text-white tabular-nums">{loading ? '…' : data?.stock_partenaires ?? 0}</p>
                    </div>
                    <div className="rounded-2xl bg-primary/10 p-4 text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary">Total</p>
                        <p className="text-xl font-black text-primary tabular-nums">{loading ? '…' : data?.stock_total ?? product.stock_quantite}</p>
                    </div>
                </div>

                <div className="space-y-2">
                    {(data?.detail || []).length === 0 && !loading && (
                        <p className="text-xs text-slate-400 text-center py-6">Aucune entrée de stock partenaire pour ce produit.</p>
                    )}
                    {(data?.detail || []).map((entry) => (
                        <div key={entry.id} className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-xl p-3">
                            <div className="flex items-center gap-3 min-w-0">
                                <Warehouse className="size-4 text-slate-300 shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{entry.partenaire_nom}</p>
                                    <p className="text-[10px] text-slate-400">{TYPE_LABELS[entry.type_stock]}{entry.localisation ? ` · ${entry.localisation}` : ''}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                <span className="text-sm font-black tabular-nums text-slate-700 dark:text-slate-200">{entry.quantite}</span>
                                <button onClick={() => handleDelete(entry.id)} className="text-slate-300 hover:text-rose-500 transition-colors border-none bg-transparent">
                                    <Trash2 className="size-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <form onSubmit={handleAdd} className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-white/10">
                    <input required placeholder="Nom du partenaire" value={form.partenaire_nom}
                        onChange={e => setForm(f => ({ ...f, partenaire_nom: e.target.value }))}
                        className="col-span-2 h-10 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-transparent text-sm outline-none focus:border-primary/50" />
                    <select value={form.type_stock} onChange={e => setForm(f => ({ ...f, type_stock: e.target.value }))}
                        className="h-10 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-transparent text-sm outline-none">
                        {Object.entries(TYPE_LABELS).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
                    </select>
                    <input required type="number" min={0} placeholder="Quantité" value={form.quantite}
                        onChange={e => setForm(f => ({ ...f, quantite: e.target.value }))}
                        className="h-10 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-transparent text-sm outline-none focus:border-primary/50" />
                    <input placeholder="Localisation (optionnel)" value={form.localisation}
                        onChange={e => setForm(f => ({ ...f, localisation: e.target.value }))}
                        className="h-10 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-transparent text-sm outline-none focus:border-primary/50" />
                    <button type="submit" disabled={createMutation.isPending}
                        className="h-10 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 border-none disabled:opacity-50">
                        {createMutation.isPending ? <RefreshCw className="size-4 animate-spin" /> : <Plus className="size-4" />}
                        Ajouter
                    </button>
                </form>
            </div>
        </Modal>
    );
};

export default PartnerStockModal;
