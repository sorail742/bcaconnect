import React from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useMyGuarantees } from '../hooks/useSavData';
import { DataStateWrapper } from '../../components/ui/DataStates';
import { ShieldCheck, Calendar, Clock, ArrowRight, Wrench } from 'lucide-react';
import { cn } from '../../lib/utils';

const MyGuarantees = () => {
    const { data: guarantees, loading, error, refetch } = useMyGuarantees();

    return (
        <DashboardLayout title="MES GARANTIES">
            <div className="space-y-6 pb-24 animate-in fade-in duration-500">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                            <ShieldCheck className="size-6 text-primary" />
                            Garanties <span className="text-primary">BCA</span>
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Produits couverts — demandez une intervention en un clic.
                        </p>
                    </div>
                    <Link
                        to="/sav/interventions"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-xs font-black uppercase hover:border-primary/30 transition-colors"
                    >
                        <Wrench className="size-4" /> Mes interventions
                    </Link>
                </div>

                <DataStateWrapper
                    isLoading={loading}
                    error={error}
                    onRetry={refetch}
                    isEmpty={!loading && !error && guarantees.length === 0}
                    emptyMessage="Aucune garantie active — vos achats livrés apparaîtront ici."
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {guarantees.map((guarantee) => {
                            const product = guarantee.produit || guarantee.Product;
                            const isActive = guarantee.status === 'active';
                            return (
                                <div
                                    key={guarantee.id}
                                    className="bg-card border border-border rounded-2xl p-5 flex flex-col shadow-sm hover:border-primary/20 transition-colors"
                                >
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="size-16 rounded-xl bg-muted border border-border overflow-hidden shrink-0 flex items-center justify-center">
                                            {product?.image_url ? (
                                                <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <ShieldCheck className="size-6 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-bold truncate">{product?.nom_produit || 'Produit'}</h3>
                                            {product?.marque && (
                                                <p className="text-[10px] text-muted-foreground uppercase">{product.marque}</p>
                                            )}
                                            <span className={cn(
                                                'inline-block mt-2 px-2 py-0.5 text-[9px] font-black rounded-lg uppercase',
                                                isActive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600',
                                            )}>
                                                {guarantee.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-sm text-muted-foreground mt-auto">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="flex items-center gap-1 text-xs"><Calendar className="size-3.5" /> Expire</span>
                                            <strong className="text-foreground text-xs">
                                                {new Date(guarantee.date_fin).toLocaleDateString('fr-GN')}
                                            </strong>
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="flex items-center gap-1 text-xs"><Clock className="size-3.5" /> Durée</span>
                                            <strong className="text-foreground text-xs">{guarantee.duree_mois} mois</strong>
                                        </div>
                                    </div>

                                    {isActive && (
                                        <Link
                                            to={`/sav/maintenance/new?product=${product?.id || guarantee.produit_id}&guarantee=${guarantee.id}`}
                                            className="mt-4 w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-xl text-xs font-black uppercase hover:bg-primary/90 transition-colors"
                                        >
                                            Demander intervention <ArrowRight className="size-4" />
                                        </Link>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </DataStateWrapper>
            </div>
        </DashboardLayout>
    );
};

export default MyGuarantees;
