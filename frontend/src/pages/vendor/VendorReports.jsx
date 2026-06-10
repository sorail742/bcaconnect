import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { ErrorState } from '../../components/ui/DataStates';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Activity, DollarSign, Loader2 } from 'lucide-react';

export default function VendorReports() {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['vendor-stats'],
        queryFn: async () => {
            const res = await api.get('/stats/vendor');
            return res.data;
        },
    });

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

    return (
        <DashboardLayout title="Rapports & Analyses">
            <div className="max-w-7xl mx-auto space-y-8">
                <div>
                    <p className="text-muted-foreground">Vue détaillée de vos performances commerciales.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <DollarSign className="size-5 text-primary" />
                            <h3 className="font-semibold text-foreground">Chiffre d&apos;affaires</h3>
                        </div>
                        <p className="text-3xl font-bold text-foreground">{data.revenue?.toLocaleString('fr-GN') || 0} GNF</p>
                    </div>
                    <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <Activity className="size-5 text-emerald-500" />
                            <h3 className="font-semibold text-foreground">Commandes</h3>
                        </div>
                        <p className="text-3xl font-bold text-foreground">{data.orders_count || 0}</p>
                    </div>
                    <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <TrendingUp className="size-5 text-blue-500" />
                            <h3 className="font-semibold text-foreground">Produits actifs</h3>
                        </div>
                        <p className="text-3xl font-bold text-foreground">{data.products_count || 0}</p>
                    </div>
                </div>

                {data.sales_chart?.length > 0 && (
                    <div className="bg-card p-6 rounded-2xl border border-border">
                        <h3 className="font-semibold mb-6 text-foreground">Évolution des ventes</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={data.sales_chart}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.2)" />
                                <XAxis dataKey="month" stroke="currentColor" fontSize={12} />
                                <YAxis stroke="currentColor" fontSize={12} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="sales" stroke="#FF6600" strokeWidth={2} name="Ventes" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {data.top_products?.length > 0 && (
                    <div className="bg-card p-6 rounded-2xl border border-border">
                        <h3 className="font-semibold mb-6 text-foreground">Top produits</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data.top_products}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.2)" />
                                <XAxis dataKey="name" stroke="currentColor" fontSize={12} />
                                <YAxis stroke="currentColor" fontSize={12} />
                                <Tooltip />
                                <Bar dataKey="quantity" fill="#FF6600" name="Quantité vendue" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
