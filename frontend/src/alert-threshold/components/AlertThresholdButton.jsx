import React, { useState } from 'react';
import { Bell, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { useCreateOrUpdateAlertThreshold } from '../hooks/useAlertThresholdData';

/**
 * Bouton "Créer une alerte" sur une fiche produit — permet à un acheteur de
 * demander une notification dès que le prix ou le stock passe sous un
 * seuil qu'il choisit (cahier des charges 3.6 : seuils dynamiques, par
 * opposition au seuil fixe unique du cron de stock vendeur).
 */
const AlertThresholdButton = ({ productId, currentPrice, currentStock, className }) => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();
    const [open, setOpen] = useState(false);
    const [type, setType] = useState('prix_produit');
    const [valeur, setValeur] = useState('');
    const createOrUpdate = useCreateOrUpdateAlertThreshold();

    const handleOpen = () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        setValeur(type === 'prix_produit' ? String(Math.floor((currentPrice || 0) * 0.9)) : String(Math.max(0, (currentStock || 1) - 1)));
        setOpen(true);
    };

    const submit = (e) => {
        e.preventDefault();
        createOrUpdate.mutate(
            { produit_id: productId, type, operateur: 'inferieur_egal', valeur_seuil: parseFloat(valeur) },
            { onSuccess: () => setOpen(false) }
        );
    };

    return (
        <>
            <button
                type="button"
                onClick={handleOpen}
                title="Créer une alerte de prix ou de stock"
                className={cn("size-12 shrink-0 rounded border border-[#d9d9d9] flex items-center justify-center hover:border-primary/60 transition-colors text-[#666] hover:text-primary", className)}
            >
                <Bell className="size-5" />
            </button>

            {open && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60" onClick={() => setOpen(false)}>
                    <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-black text-foreground flex items-center gap-2"><Bell className="size-4 text-primary" /> Nouvelle alerte</h2>
                            <button type="button" onClick={() => setOpen(false)} className="border-none bg-transparent text-muted-foreground"><X className="size-4" /></button>
                        </div>

                        <div className="flex gap-2">
                            <button type="button" onClick={() => setType('prix_produit')}
                                className={cn("flex-1 h-9 rounded-lg text-xs font-bold border", type === 'prix_produit' ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground")}>
                                Baisse de prix
                            </button>
                            <button type="button" onClick={() => setType('stock_produit')}
                                className={cn("flex-1 h-9 rounded-lg text-xs font-bold border", type === 'stock_produit' ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground")}>
                                Stock faible
                            </button>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-muted-foreground uppercase">
                                {type === 'prix_produit' ? 'Me notifier si le prix descend à (GNF)' : 'Me notifier si le stock descend à'}
                            </label>
                            <input required type="number" min={0} value={valeur} onChange={(e) => setValeur(e.target.value)}
                                className="w-full h-10 mt-1.5 px-3 rounded-xl border border-border bg-background text-sm outline-none" />
                        </div>

                        <button type="submit" disabled={createOrUpdate.isPending} className="w-full h-10 rounded-xl bg-primary text-primary-foreground text-sm font-bold border-none disabled:opacity-50">
                            Activer l'alerte
                        </button>
                    </form>
                </div>
            )}
        </>
    );
};

export default AlertThresholdButton;
