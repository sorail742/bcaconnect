import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import reviewService from '../../services/reviewService';
import { Button } from '../ui/Button';

const ReviewForm = ({ productId, eligibleOrders = [], onSuccess }) => {
    const [commandeId, setCommandeId] = useState(eligibleOrders[0]?.id || '');
    const [note, setNote] = useState(5);
    const [commentaire, setCommentaire] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (!eligibleOrders.length) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!commandeId || !commentaire.trim()) {
            toast.error('Sélectionnez une commande et rédigez un commentaire.');
            return;
        }
        setSubmitting(true);
        try {
            await reviewService.create({
                produit_id: productId,
                commande_id: commandeId,
                note,
                commentaire: commentaire.trim(),
            });
            toast.success('Merci ! Votre avis a été publié.');
            setCommentaire('');
            onSuccess?.();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Impossible de publier l\'avis.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 rounded-[2rem] bg-primary/5 border border-primary/20 space-y-5">
            <h4 className="text-sm font-black uppercase tracking-tight text-foreground">
                Laisser un avis
            </h4>

            {eligibleOrders.length > 1 && (
                <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Commande concernée
                    </label>
                    <select
                        value={commandeId}
                        onChange={(e) => setCommandeId(e.target.value)}
                        className="mt-2 w-full h-10 px-3 bg-background border border-border rounded-xl text-sm outline-none focus:border-primary/50"
                    >
                        {eligibleOrders.map((o) => (
                            <option key={o.id} value={o.id}>{o.label}</option>
                        ))}
                    </select>
                </div>
            )}

            <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Note
                </label>
                <div className="flex gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                        <button
                            key={n}
                            type="button"
                            onClick={() => setNote(n)}
                            className="p-1 transition-transform hover:scale-110"
                        >
                            <Star className={cn(
                                'size-6',
                                n <= note ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30',
                            )} />
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Commentaire
                </label>
                <textarea
                    value={commentaire}
                    onChange={(e) => setCommentaire(e.target.value)}
                    rows={4}
                    placeholder="Partagez votre expérience avec ce produit..."
                    className="mt-2 w-full px-4 py-3 bg-background border border-border rounded-2xl text-sm outline-none focus:border-primary/50 resize-none"
                />
            </div>

            <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? 'Publication...' : 'Publier mon avis'}
            </Button>
        </form>
    );
};

export default ReviewForm;
