import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useRequestIntervention } from '../../hooks/data/useSavData';
import { Wrench, Loader2, ArrowLeft, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const MaintenanceRequest = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const productId = searchParams.get('product');
    const guaranteeId = searchParams.get('guarantee');
    const [description, setDescription] = useState('');

    const { mutate, isPending } = useRequestIntervention();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!productId) {
            toast.error('Produit requis', { description: 'Sélectionnez un produit depuis vos garanties SAV.' });
            return;
        }
        if (!description.trim()) return;

        mutate(
            {
                produit_id: productId,
                guarantee_id: guaranteeId,
                description_probleme: description,
            },
            { onSuccess: () => navigate('/sav/interventions') },
        );
    };

    return (
        <DashboardLayout title="DEMANDE SAV">
            <div className="max-w-2xl mx-auto pb-24 animate-in fade-in duration-500">
                <Link
                    to="/sav/guarantees"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
                >
                    <ArrowLeft className="size-4" /> Retour aux garanties
                </Link>

                {!productId && (
                    <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-200">
                        <AlertTriangle className="size-5 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold">Aucun produit sélectionné</p>
                            <p className="mt-1 opacity-90">Retournez à vos garanties et cliquez sur « Demander une intervention » pour un produit couvert.</p>
                        </div>
                    </div>
                )}

                <div className="bg-card border border-border rounded-2xl shadow-sm p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Wrench className="size-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black uppercase tracking-tight">Demande d&apos;intervention</h1>
                            <p className="text-sm text-muted-foreground">Un technicien BCA sera notifié immédiatement.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-wide text-muted-foreground mb-2">
                                Description du problème *
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Décrivez le dysfonctionnement, les symptômes, la fréquence..."
                                className="w-full rounded-xl border border-border bg-background p-4 min-h-[150px] text-sm outline-none focus:border-primary/50 resize-none normal-case"
                                required
                                disabled={!productId}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isPending || !description.trim() || !productId}
                            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {isPending ? <Loader2 className="size-4 animate-spin" /> : 'Envoyer la demande SAV'}
                        </button>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default MaintenanceRequest;
