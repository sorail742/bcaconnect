import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { ErrorState } from '../../components/ui/DataStates';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import {
    TrendingUp, Activity, DollarSign, Loader2, RefreshCw, Package, Sparkles,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';

export default function VendorReports() {
    const { data, isLoading, isFetching, error, refetch } = useQuery({
        queryKey: ['vendor-stats'],
        queryFn: async () => {
            const res = await api.get('/stats/vendor');
            return res.data;
        },
        staleTime: 5_000,
        refetchInterval: 30_000,
    });

    const chartData = useMemo(() => {
        if (data?.sales_chart?.length) return data.sales_chart;
        return (data?.timeseries || []).map((row) => ({
            month: row.day,
            sales: Math.round(row.val || 0),
        }));
    }, [data]);

    const handleRefresh = async () => {
        try {
            await refetch();
            toast.success('Rapports actualisés');
        } catch {
            toast.error('Échec de l\'actualisation');
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout title="Rapports">
                <div className="flex h-[50vh] items-center justify-center">
                    <Loader2 className="size-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    if (error || !data) {
        return (
            <DashboardLayout title="Rapports">
                <ErrorState message="Impossible de charger vos statistiques." onRetry={refetch} />
            </DashboardLayout>
        );
    }

    const revenue = data.revenue ?? data.totalRevenue ?? 0;
    const growth = data.growth;

    return (
        <DashboardLayout title="Rapports & Analyses">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <p className="text-muted-foreground">Vue détaillée de vos performances commerciales.</p>
                        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1 flex items-center gap-1.5">
                            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Synchronisation temps réel
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleRefresh}
                        disabled={isFetching}
                        className="h-10 px-4 rounded-xl bg-muted border border-border text-sm font-bold flex items-center gap-2 hover:bg-muted/80 disabled:opacity-60"
                    >
                        <RefreshCw className={cn('size-4', isFetching && 'animate-spin')} />
                        Actualiser
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <DollarSign className="size-5 text-primary" />
                                <h3 className="font-semibold text-foreground">Chiffre d&apos;affaires</h3>
                            </div>
                            {growth && (
                                <span className={cn(
                                    'text-[10px] font-black px-2 py-1 rounded-lg',
                                    growth.startsWith('+') || growth.startsWith('0')
                                        ? 'bg-emerald-500/10 text-emerald-600'
                                        : 'bg-red-500/10 text-red-600',
                                )}
                                >
                                    {growth}
                                </span>
                            )}
                        </div>
                        <p className="text-3xl font-bold text-foreground tabular-nums">
                            {Math.round(revenue).toLocaleString('fr-GN')} GNF
                        </p>
                    </div>
                    <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <Activity className="size-5 text-emerald-500" />
                            <h3 className="font-semibold text-foreground">Commandes</h3>
                        </div>
                        <p className="text-3xl font-bold text-foreground tabular-nums">{data.orders_count ?? 0}</p>
                    </div>
                    <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <TrendingUp className="size-5 text-blue-500" />
                            <h3 className="font-semibold text-foreground">Produits actifs</h3>
                        </div>
                        <p className="text-3xl font-bold text-foreground tabular-nums">{data.products_count ?? 0}</p>
                    </div>
                </div>

                {data.global_trend && (
                    <div className="bg-gradient-to-r from-primary/5 to-amber-500/5 border border-primary/20 rounded-2xl p-5 flex gap-4 items-start">
                        <Sparkles className="size-5 text-primary shrink-0 mt-0.5" />
                        <p className="text-sm text-foreground font-medium leading-relaxed">{data.global_trend}</p>
                    </div>
                )}

                <div className="bg-card p-6 rounded-2xl border border-border">
                    <h3 className="font-semibold mb-6 text-foreground">Évolution des ventes (7 jours)</h3>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.2)" />
                                <XAxis dataKey="month" stroke="currentColor" fontSize={12} />
                                <YAxis stroke="currentColor" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                                <Tooltip formatter={(v) => [`${Number(v).toLocaleString('fr-GN')} GNF`, 'Ventes']} />
                                <Legend />
                                <Line type="monotone" dataKey="sales" stroke="#FF6600" strokeWidth={2} name="Ventes (GNF)" dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground gap-2">
                            <Package className="size-8 opacity-40" />
                            <p className="text-sm">Pas encore de ventes sur les 7 derniers jours.</p>
                        </div>
                    )}
                </div>

                <div className="bg-card p-6 rounded-2xl border border-border">
                    <h3 className="font-semibold mb-6 text-foreground">Top produits</h3>
                    {data.top_products?.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data.top_products}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.2)" />
                                <XAxis dataKey="name" stroke="currentColor" fontSize={11} interval={0} angle={-20} textAnchor="end" height={70} />
                                <YAxis stroke="currentColor" fontSize={12} />
                                <Tooltip />
                                <Bar dataKey="quantity" fill="#FF6600" name="Quantité vendue" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground gap-2">
                            <Package className="size-8 opacity-40" />
                            <p className="text-sm">Aucun produit vendu pour le moment.</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
