import React, { useEffect, useState } from 'react';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { ModalOverlay } from './ModalOverlay';
import { cn } from '../../lib/utils';

/**
 * Confirmation de suppression façon Vercel : le bouton ne s'active que si
 * l'utilisateur retape exactement le nom de l'élément visé — un clic seul
 * (potentiellement accidentel) ne suffit jamais pour une action destructive.
 * La valeur saisie est renvoyée à `onConfirm` pour être conservée comme
 * preuve côté serveur (historique des suppressions).
 */
export default function ConfirmDeleteModal({
    open,
    onClose,
    onConfirm,
    itemName,
    itemLabel = 'cet élément',
    title = 'Confirmer la suppression',
    description,
    confirmButtonText = 'Supprimer définitivement',
}) {
    const [typed, setTyped] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            setTyped('');
            setIsSubmitting(false);
        }
    }, [open]);

    const isMatch = itemName !== null && itemName !== undefined && typed.trim() === String(itemName).trim();

    const handleConfirm = async () => {
        if (!isMatch || isSubmitting) return;
        setIsSubmitting(true);
        try {
            await onConfirm(typed.trim());
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ModalOverlay open={open} onClose={isSubmitting ? () => {} : onClose} title={title} maxWidth="max-w-md">
            <div className="p-6 pt-4 space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20">
                    <AlertTriangle className="size-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-rose-700 dark:text-rose-300 leading-relaxed">
                        {description || `Cette action supprimera ${itemLabel} de la plateforme. Un historique complet est conservé pour l'équipe admin, mais cette suppression est irréversible pour vous.`}
                    </p>
                </div>

                <div className="space-y-1.5">
                    <p className="text-sm text-muted-foreground">
                        Pour confirmer, tapez <span className="font-mono font-bold text-foreground bg-muted px-1.5 py-0.5 rounded">{itemName}</span> ci-dessous :
                    </p>
                    <input
                        type="text"
                        value={typed}
                        onChange={(e) => setTyped(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleConfirm(); }}
                        placeholder={itemName}
                        autoFocus
                        disabled={isSubmitting}
                        className="w-full h-11 px-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 disabled:opacity-60"
                    />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="h-10 px-4 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                    >
                        Annuler
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={!isMatch || isSubmitting}
                        className={cn(
                            'h-10 px-4 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors',
                            isMatch && !isSubmitting
                                ? 'bg-rose-600 text-white hover:bg-rose-700'
                                : 'bg-muted text-muted-foreground cursor-not-allowed',
                        )}
                    >
                        {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                        {confirmButtonText}
                    </button>
                </div>
            </div>
        </ModalOverlay>
    );
}
