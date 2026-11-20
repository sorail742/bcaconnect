import React, { useState } from 'react';
import { Plus, Trash2, Layers, Loader2 } from 'lucide-react';
import ModalOverlay from '../../components/ui/ModalOverlay';
import {
    useProductVariants, useCreateProductVariant, useUpdateProductVariant, useRemoveProductVariant,
} from '../hooks/useProductVariantData';

const emptyForm = { nom_variante: '', prix_unitaire: '', stock_quantite: '', sku: '' };

const ProductVariantManager = ({ product, onClose }) => {
    const [form, setForm] = useState(emptyForm);
    const { data: variants, loading } = useProductVariants(product?.id);
    const createMutation = useCreateProductVariant(product?.id);
    const updateMutation = useUpdateProductVariant(product?.id);
    const removeMutation = useRemoveProductVariant(product?.id);

    if (!product) return null;

    const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

    const handleCreate = () => {
        if (!form.nom_variante.trim() || form.stock_quantite === '') return;
        createMutation.mutate({
            nom_variante: form.nom_variante.trim(),
            prix_unitaire: form.prix_unitaire || undefined,
            stock_quantite: form.stock_quantite,
            sku: form.sku || undefined,
        }, { onSuccess: () => setForm(emptyForm) });
    };

    return (
        <ModalOverlay open onClose={onClose} title={`Variantes — ${product.nom_produit}`} maxWidth="max-w-lg">
            <div className="px-6 pb-6 space-y-5">
                <div className="p-4 rounded-xl border border-dashed border-border space-y-3">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                        <Plus className="size-3.5" /> Nouvelle variante
                    </p>
                    <input
                        value={form.nom_variante}
                        onChange={(e) => set('nom_variante', e.target.value)}
                        placeholder="Nom (ex. Taille L / Rouge)"
                        className="w-full h-10 px-3 border border-border rounded-xl bg-background text-sm outline-none focus:border-primary/50"
                    />
                    <div className="grid grid-cols-3 gap-2">
                        <input
                            type="number"
                            min={0}
                            value={form.prix_unitaire}
                            onChange={(e) => set('prix_unitaire', e.target.value)}
                            placeholder={`Prix (${product.prix_unitaire})`}
                            className="h-10 px-3 border border-border rounded-xl bg-background text-sm outline-none focus:border-primary/50"
                        />
                        <input
                            type="number"
                            min={0}
                            value={form.stock_quantite}
                            onChange={(e) => set('stock_quantite', e.target.value)}
                            placeholder="Stock *"
                            className="h-10 px-3 border border-border rounded-xl bg-background text-sm outline-none focus:border-primary/50"
                        />
                        <input
                            value={form.sku}
                            onChange={(e) => set('sku', e.target.value)}
                            placeholder="SKU"
                            className="h-10 px-3 border border-border rounded-xl bg-background text-sm outline-none focus:border-primary/50"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleCreate}
                        disabled={createMutation.isPending || !form.nom_variante.trim() || form.stock_quantite === ''}
                        className="w-full h-9 rounded-xl bg-primary text-primary-foreground text-sm font-bold disabled:opacity-50"
                    >
                        {createMutation.isPending ? 'Ajout...' : 'Ajouter la variante'}
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-6"><Loader2 className="size-5 animate-spin text-primary" /></div>
                ) : variants.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4 flex flex-col items-center gap-2">
                        <Layers className="size-6 opacity-40" />
                        Aucune variante — ce produit se vend en configuration unique.
                    </p>
                ) : (
                    <div className="space-y-2">
                        {variants.map((v) => (
                            <div key={v.id} className="flex items-center gap-3 p-3 rounded-xl border border-border">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-foreground">{v.nom_variante}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {v.prix_unitaire ? `${parseFloat(v.prix_unitaire).toLocaleString()} GNF` : 'Prix produit'} · Stock {v.stock_quantite}
                                        {v.sku ? ` · ${v.sku}` : ''}
                                    </p>
                                </div>
                                <label className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                                    <input
                                        type="checkbox"
                                        checked={v.actif}
                                        onChange={(e) => updateMutation.mutate({ id: v.id, payload: { actif: e.target.checked } })}
                                    />
                                    Actif
                                </label>
                                <button
                                    onClick={() => removeMutation.mutate(v.id)}
                                    disabled={removeMutation.isPending}
                                    className="p-1.5 text-muted-foreground hover:text-destructive transition-colors shrink-0"
                                >
                                    <Trash2 className="size-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </ModalOverlay>
    );
};

export default ProductVariantManager;
