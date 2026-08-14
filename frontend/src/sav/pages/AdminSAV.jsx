import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { DataStateWrapper } from '../../components/ui/DataStates';
import { Wrench, Eye, CheckCircle2, Clock, XCircle, AlertCircle, RefreshCcw, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { cn, adaptiveValueSize } from '../../lib/utils';
import api from '../../services/api';

const STATUS_CONFIG = {
    en_attente:  { label: 'En attente',  icon: Clock,         cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    en_cours:    { label: 'En cours',    icon: Wrench,        cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    resolu:      { label: 'Résolu',      icon: CheckCircle2,  cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    rejete:      { label: 'Rejeté',      icon: XCircle,       cls: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
};

const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || { label: status, icon: AlertCircle, cls: 'bg-muted text-muted-foreground' };
    const Icon = cfg.icon;
    return (
        <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide', cfg.cls)}>
            <Icon className="size-3" /> {cfg.label}
        </span>
    );
};

const AdminSAV = () => {
    const queryClient = useQueryClient();
    const [selectedIntervention, setSelectedIntervention] = useState(null);
    const [filter, setFilter] = useState('all');

    const { data: interventions = [], isLoading, error, refetch, isFetching } = useQuery({
        queryKey: ['admin-interventions'],
        queryFn: async () => {
            const res = await api.get('/sav/admin/interventions');
            return res.data;
        },
        staleTime: 30_000,
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => api.patch(`/sav/admin/interventions/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-interventions'] });
            toast.success('Intervention mise à jour.');
        },
        onError: () => toast.error('Erreur lors de la mise à jour.'),
    });

    const handleStatusChange = (id, status) => {
        updateMutation.mutate({ id, data: { status } });
    };

    const filtered = filter === 'all' ? interventions : interventions.filter(i => i.status === filter);

    const stats = {
        total: interventions.length,
        en_attente: interventions.filter(i => i.status === 'en_attente').length,
        en_cours: interventions.filter(i => i.status === 'en_cours').length,
        resolu: interventions.filter(i => i.status === 'resolu').length,
    };

    return (
        <DashboardLayout title="Administration SAV">
            <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <Wrench className="size-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black uppercase tracking-tight">Gestion SAV</h1>
                            <p className="text-sm text-muted-foreground">{interventions.length} demande(s) d'intervention au total</p>
                        </div>
                    </div>
                    <button
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card text-sm font-semibold hover:border-primary/30 transition-colors"
                    >
                        <RefreshCcw className={cn('size-4', isFetching && 'animate-spin')} />
                        Actualiser
                    </button>
                </div>

                {/* KPI Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { key: 'all', label: 'Total', value: stats.total, color: 'text-foreground' },
                        { key: 'en_attente', label: 'En attente', value: stats.en_attente, color: 'text-amber-600' },
                        { key: 'en_cours', label: 'En cours', value: stats.en_cours, color: 'text-blue-600' },
                        { key: 'resolu', label: 'Résolus', value: stats.resolu, color: 'text-emerald-600' },
                    ].map(s => (
                        <button
                            key={s.key}
                            onClick={() => setFilter(s.key)}
                            className={cn(
                                'bg-card border rounded-2xl p-4 text-left transition-all hover:shadow-md',
                                filter === s.key ? 'border-primary shadow-md shadow-primary/10' : 'border-border'
                            )}
                        >
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{s.label}</p>
                            <p className={cn(adaptiveValueSize(s.value, 'text-2xl', 'text-base'), 'font-black mt-1', s.color)}>{s.value}</p>
                        </button>
                    ))}
                </div>

                {/* Table */}
                <DataStateWrapper isLoading={isLoading} error={error?.message} onRetry={refetch}>
                    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[900px]">
                                <thead>
                                    <tr className="border-b border-border bg-muted/50">
                                        {['Produit', 'Client', 'Technicien', 'Description', 'Photos', 'Statut', 'Date', 'Actions'].map(h => (
                                            <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="py-16 text-center text-muted-foreground text-sm">
                                                Aucune intervention trouvée
                                            </td>
                                        </tr>
                                    ) : filtered.map(inv => (
                                        <tr key={inv.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-3">
                                                <p className="text-sm font-semibold">{inv.Product?.nom_produit || '—'}</p>
                                                <p className="text-xs text-muted-foreground">{inv.Product?.marque || ''}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-sm font-semibold">{inv.demandeur?.nom_complet || '—'}</p>
                                                <p className="text-xs text-muted-foreground">{inv.demandeur?.telephone || ''}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-sm text-muted-foreground">
                                                    {inv.technicien?.nom_complet || <span className="italic opacity-40">Non assigné</span>}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3 max-w-[220px]">
                                                <p className="text-xs text-muted-foreground line-clamp-2">{inv.description_probleme}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                {inv.photos_urls?.length > 0 ? (
                                                    <div className="flex gap-1">
                                                        {inv.photos_urls.slice(0, 2).map((url, i) => (
                                                            <a
                                                                key={i}
                                                                href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || ''}${url}`}
                                                                target="_blank" rel="noopener noreferrer"
                                                                className="block size-10 rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-colors"
                                                            >
                                                                <img
                                                                    src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || ''}${url}`}
                                                                    alt="" className="w-full h-full object-cover"
                                                                />
                                                            </a>
                                                        ))}
                                                        {inv.photos_urls.length > 2 && (
                                                            <span className="size-10 rounded-lg border border-border bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                                                                +{inv.photos_urls.length - 2}
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground/40 flex items-center gap-1">
                                                        <Camera className="size-3" /> —
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatusBadge status={inv.status} />
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-xs text-muted-foreground whitespace-nowrap">
                                                    {new Date(inv.created_at || inv.createdAt).toLocaleDateString('fr-FR')}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <select
                                                    value={inv.status}
                                                    onChange={e => handleStatusChange(inv.id, e.target.value)}
                                                    className="text-xs px-2 py-1.5 rounded-lg border border-border bg-background focus:border-primary outline-none cursor-pointer"
                                                    disabled={updateMutation.isPending}
                                                >
                                                    {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                                                        <option key={k} value={k}>{v.label}</option>
                                                    ))}
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </DataStateWrapper>
            </div>
        </DashboardLayout>
    );
};

export default AdminSAV;
