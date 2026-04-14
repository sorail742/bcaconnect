import React from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useTrends } from '../../hooks/useDomainData';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    LineChart, Line, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { Brain, TrendingUp, Target, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { LoadingState, ErrorState } from '../../components/ui/DataStates';

const COLORS = ['#FF6600', '#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

const AITrends = () => {
    const { data, loading, error } = useTrends();

    if (loading) return (
        <DashboardLayout title="IA Prédictions">
            <LoadingState message="L'intelligence artificielle analyse les données du marché..." />
        </DashboardLayout>
    );

    if (error) return (
        <DashboardLayout title="IA Prédictions">
            <ErrorState error={error} />
        </DashboardLayout>
    );

    const trends = data?.trends || [];
    const globalInsight = data?.globalInsight || "Analyse en attente de données supplémentaires.";

    return (
        <DashboardLayout title="IA Prédictions">
            <div className="space-y-8 pb-12">
                
                {/* AI Insight Header */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden bg-primary/10 border border-primary/20 rounded-3xl p-8"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Brain className="size-48" />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                        <div className="size-20 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                            <Sparkles className="size-10 animate-pulse" />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-2xl font-black text-foreground mb-2 flex items-center justify-center md:justify-start gap-3">
                                Analyse Prédictive BCA
                                <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full uppercase tracking-widest">Beta v2.0</span>
                            </h2>
                            <p className="text-lg text-muted-foreground font-medium leading-relaxed">
                                "{globalInsight}"
                            </p>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Market Forecast */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-card border border-border rounded-3xl p-6 shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <TrendingUp className="size-5 text-primary" />
                                <h3 className="font-bold text-lg">Prévisions par Catégorie</h3>
                            </div>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={trends}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                                    <YAxis hide />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '12px', color: '#fff' }}
                                        cursor={{ fill: 'rgba(255,102,0,0.05)' }}
                                    />
                                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                        {trends.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Confidence Score */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="bg-card border border-border rounded-3xl p-6 shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <Target className="size-5 text-emerald-500" />
                                <h3 className="font-bold text-lg">Indice de Confiance IA</h3>
                            </div>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trends}>
                                    <defs>
                                        <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                                    <YAxis hide domain={[0, 100]} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '12px', color: '#fff' }}
                                    />
                                    <Area type="monotone" dataKey="confidence" stroke="#10b981" fillOpacity={1} fill="url(#colorConfidence)" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>

                {/* Detailed Table */}
                <div className="bg-card border border-border rounded-3xl overflow-hidden">
                    <div className="p-6 border-b border-border">
                        <h3 className="font-bold">Analyse Détaillée de la Croissance</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-muted/50 text-left">
                                    <th className="px-6 py-4 font-bold">Catégorie</th>
                                    <th className="px-6 py-4 font-bold">Potentiel de Croissance</th>
                                    <th className="px-6 py-4 font-bold">Volume Actuel</th>
                                    <th className="px-6 py-4 font-bold">Confiance IA</th>
                                    <th className="px-6 py-4 font-bold text-right">Statut</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {trends.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 font-bold text-foreground">{item.name}</td>
                                        <td className="px-6 py-4">
                                            <span className={`flex items-center gap-1 font-black ${parseFloat(item.growth) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {parseFloat(item.growth) >= 0 ? '+' : ''}{item.growth}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground tabular-nums">
                                            {item.value.toLocaleString()} GNF
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-emerald-500 rounded-full"
                                                        style={{ width: `${item.confidence}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-bold w-8">{item.confidence}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                parseFloat(item.growth) > 10 ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                                parseFloat(item.growth) > 0 ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                                                'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                                            }`}>
                                                {parseFloat(item.growth) > 10 ? 'Haute Priorité' : 
                                                 parseFloat(item.growth) > 0 ? 'Stable' : 'Risque'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
};

export default AITrends;
