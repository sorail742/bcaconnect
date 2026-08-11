import React from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useMyInterventions } from '../hooks/useSavData';
import { DataStateWrapper } from '../../components/ui/DataStates';
import { Wrench, Clock, CheckCircle2, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { cn } from '../../lib/utils';

const STATUS = {
    en_attente: { label: 'En attente', color: 'text-amber-500', bg: 'bg-amber-500/10', icon: Clock },
    en_cours: { label: 'En cours', color: 'text-blue-500', bg: 'bg-blue-500/10', icon: Wrench },
    resolu: { label: 'Résolu', color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: CheckCircle2 },
    rejete: { label: 'Rejeté', color: 'text-rose-500', bg: 'bg-rose-500/10', icon: Clock },
};

const MyInterventions = () => {
    const { data: interventions, loading, error, refetch } = useMyInterventions();

    return (
        <DashboardLayout title="MES INTERVENTIONS SAV">
            <div className="space-y-6 pb-24 animate-in fade-in duration-500">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tight">
                            Suivi <span className="text-primary">SAV</span>
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Statut de vos demandes d&apos;intervention technique.
                        </p>
                    </div>
                    <Link
                        to="/sav/guarantees"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-xs font-black uppercase hover:bg-primary/20 transition-colors"
                    >
                        <ShieldCheck className="size-4" /> Mes garanties
                    </Link>
                </div>

                <DataStateWrapper
                    isLoading={loading}
                    error={error}
                    onRetry={refetch}
                    isEmpty={!loading && !error && interventions.length === 0}
                    emptyMessage="Aucune intervention demandée"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {interventions.map((inv) => {
                            const cfg = STATUS[inv.status] || STATUS.en_attente;
                            const Icon = cfg.icon;
                            const product = inv.Product || inv.produit;
                            return (
                                <div key={inv.id} className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-sm">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={cn('size-10 rounded-xl flex items-center justify-center shrink-0', cfg.bg)}>
                                                <Icon className={cn('size-5', cfg.color)} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold truncate">{product?.nom_produit || 'Produit'}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase">
                                                    #{inv.id.slice(0, 8)}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={cn('text-[9px] font-black uppercase px-2 py-1 rounded-lg shrink-0', cfg.bg, cfg.color)}>
                                            {cfg.label}
                                        </span>
                                    </div>

                                    <p className="text-sm text-muted-foreground line-clamp-3 normal-case">
                                        {inv.description_probleme}
                                    </p>

                                    {/* Photos du problème */}
                                    {inv.photos_urls?.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {inv.photos_urls.map((url, i) => (
                                                <a
                                                    key={i}
                                                    href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || ''}${url}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="block size-16 rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-colors"
                                                >
                                                    <img
                                                        src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || ''}${url}`}
                                                        alt={`Photo ${i + 1}`}
                                                        className="w-full h-full object-cover hover:scale-110 transition-transform"
                                                    />
                                                </a>
                                            ))}
                                        </div>
                                    )}

                                    {inv.technicien && (
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <User className="size-3.5 text-primary" />
                                            <span>Technicien : <strong className="text-foreground">{inv.technicien.nom_complet}</strong></span>
                                        </div>
                                    )}

                                    {inv.status === 'resolu' && inv.rapport_technique && (
                                        <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-xs normal-case">
                                            <p className="font-bold text-emerald-600 mb-1">Rapport technique</p>
                                            <p className="text-muted-foreground">{inv.rapport_technique}</p>
                                        </div>
                                    )}

                                    <p className="text-[10px] text-muted-foreground">
                                        Demandé le {new Date(inv.created_at || inv.createdAt).toLocaleDateString('fr-GN')}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </DataStateWrapper>

                {!loading && interventions.length === 0 && (
                    <Link
                        to="/sav/guarantees"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                    >
                        Voir mes garanties <ArrowRight className="size-4" />
                    </Link>
                )}
            </div>
        </DashboardLayout>
    );
};

export default MyInterventions;
