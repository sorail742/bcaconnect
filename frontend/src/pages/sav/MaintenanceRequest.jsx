import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import savService from '../../services/savService';
import { toast } from 'sonner';
import { Wrench, Loader2 } from 'lucide-react';

export default function MaintenanceRequest() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const productId = searchParams.get('product');
    const guaranteeId = searchParams.get('guarantee');
    
    const [description, setDescription] = useState('');

    const mutation = useMutation({
        mutationFn: savService.requestIntervention,
        onSuccess: () => {
            toast.success("Demande d'intervention envoyée avec succès.");
            navigate('/sav/guarantees'); // Ou vers une page listant les interventions
        },
        onError: () => {
            toast.error("Erreur lors de l'envoi de la demande.");
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!productId) {
            toast.error("Produit non spécifié.");
            return;
        }
        if (!description.trim()) {
            toast.error("Veuillez décrire le problème.");
            return;
        }

        mutation.mutate({
            produit_id: productId,
            guarantee_id: guaranteeId,
            description_probleme: description
        });
    };

    return (
        <div className="max-w-2xl mx-auto p-4 py-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-primary/10 rounded-xl">
                        <Wrench className="size-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Demander une intervention</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Remplissez ce formulaire pour solliciter le SAV BCA.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold mb-2">Description du problème *</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Décrivez en détail le dysfonctionnement constaté..."
                            className="w-full rounded-xl border-gray-300 dark:border-gray-600 bg-transparent p-4 min-h-[150px] focus:ring-primary focus:border-primary"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={mutation.isPending}
                        className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors disabled:opacity-50"
                    >
                        {mutation.isPending ? <Loader2 className="animate-spin" /> : 'Envoyer la demande'}
                    </button>
                </form>
            </div>
        </div>
    );
}
