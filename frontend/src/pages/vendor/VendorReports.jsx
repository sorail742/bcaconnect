import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Activity, DollarSign, Loader2 } from 'lucide-react';

export default function VendorReports() {
    const { data, isLoading } = useQuery({
        queryKey: ['vendor-stats'],
        queryFn: async () => {
            const res = await api.get('/stats/vendor');
            return res.data;
        }
    });

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="size-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold mb-2">Rapports et Analyses</h1>
                <p className="text-gray-500 dark:text-gray-400">Vue détaillée de vos performances commerciales.</p>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl">
                            <DollarSign className="size-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-bold">Chiffre d'Affaires</p>
                            <h3 className="text-2xl font-black">{data.totalRevenue?.toLocaleString()} GNF</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-green-50 dark:bg-green-900/30 text-green-600 rounded-xl">
                            <TrendingUp className="size-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-bold">Croissance (30 jours)</p>
                            <h3 className="text-2xl font-black text-green-600">{data.growth}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 rounded-xl">
                            <Activity className="size-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-bold">Insight IA</p>
                            <p className="text-sm font-semibold line-clamp-2 mt-1">{data.global_trend}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Evolution des revenus (Line Chart) */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <h3 className="text-lg font-bold mb-6">Évolution des Revenus (7 jours)</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.timeseries}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dx={-10} tickFormatter={(value) => `${value / 1000}k`} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                                    formatter={(value) => [`${value.toLocaleString()} GNF`, 'Revenus']}
                                />
                                <Line type="monotone" dataKey="val" stroke="#FF6600" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6, stroke: '#FF6600', strokeWidth: 2, fill: '#fff' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Performance en Bar Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <h3 className="text-lg font-bold mb-6">Volume Journalier</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.timeseries}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dx={-10} tickFormatter={(value) => `${value / 1000}k`} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                                    formatter={(value) => [`${value.toLocaleString()} GNF`, 'Volume']}
                                />
                                <Bar dataKey="val" fill="#FF6600" radius={[4, 4, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
