import React from 'react';
import { useQuery } from '@tanstack/react-query';
import savService from '../../services/savService';
import { ShieldCheck, Calendar, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MyGuarantees() {
    const { data: guarantees, isLoading } = useQuery({
        queryKey: ['my-guarantees'],
        queryFn: savService.getMyGuarantees,
    });

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Chargement de vos garanties...</div>;
    }

    if (!guarantees || guarantees.length === 0) {
        return (
            <div className="p-8 text-center bg-gray-50 dark:bg-gray-800 rounded-xl">
                <ShieldCheck className="size-12 mx-auto text-gray-400 mb-4" />
                <h2 className="text-xl font-bold mb-2">Aucune garantie active</h2>
                <p className="text-gray-500 dark:text-gray-400">Vos produits avec garantie BCA apparaîtront ici.</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-4 space-y-6">
            <h1 className="text-2xl font-bold flex items-center gap-2">
                <ShieldCheck className="text-primary" /> Mes Garanties
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {guarantees.map(guarantee => (
                    <div key={guarantee.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 flex flex-col">
                        <div className="flex items-start gap-4 mb-4">
                            {guarantee.produit?.image_url ? (
                                <img src={guarantee.produit.image_url} alt="" className="size-16 rounded-lg object-cover bg-gray-100" />
                            ) : (
                                <div className="size-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
                                    <ShieldCheck className="text-gray-400" />
                                </div>
                            )}
                            <div>
                                <h3 className="font-bold line-clamp-2">{guarantee.produit?.nom_produit || 'Produit inconnu'}</h3>
                                <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-bold rounded-full ${
                                    guarantee.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                    {guarantee.status.toUpperCase()}
                                </span>
                            </div>
                        </div>

                        <div className="mt-auto space-y-2 text-sm text-gray-600 dark:text-gray-300">
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1"><Calendar className="size-4" /> Fin de validité:</span>
                                <strong>{new Date(guarantee.date_fin).toLocaleDateString()}</strong>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1"><Clock className="size-4" /> Durée:</span>
                                <strong>{guarantee.duree_mois} mois</strong>
                            </div>
                        </div>

                        {guarantee.status === 'active' && (
                            <Link 
                                to={`/sav/maintenance/new?product=${guarantee.produit_id}&guarantee=${guarantee.id}`}
                                className="mt-4 w-full flex items-center justify-center gap-2 bg-primary/10 text-primary py-2 rounded-xl font-bold hover:bg-primary/20 transition-colors"
                            >
                                Demander une intervention <ArrowRight className="size-4" />
                            </Link>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
