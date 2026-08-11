import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useTrends, useAiLogs } from '../hooks/useDashboardData';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { 
    Brain, TrendingUp, Target, Sparkles,
    Zap, Activity, ArrowUpRight,
    ArrowDownRight, ShieldCheck, Microscope, Layers,
    Clock, Globe2, RefreshCcw, Terminal, Cpu, Bell, Info
} from 'lucide-react';
import { cn, adaptiveValueSize } from '../../lib/utils';
import ChartTooltip from '../../components/ui/ChartTooltip';
import FilterDropdown from '../../components/ui/FilterDropdown';

const COLORS = ['#1ca0db', '#0ea5e9', '#10b981', '#7c3aed', '#f43f5e', '#f59e0b', '#06b6d4'];
// Référence stable pour éviter qu'un `data?.trends || []` recrée un nouveau tableau
// à chaque rendu, ce qui invaliderait inutilement les useMemo qui en dépendent.
const EMPTY_TRENDS = [];

const StatCard = ({ label, val, unit, icon: Icon, color, description }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card p-5 rounded-3xl border border-border shadow-sm flex items-center gap-4 group transition-all"
    >
        <div className={cn("size-10 rounded-xl bg-muted flex items-center justify-center transition-colors group-hover:bg-card border border-transparent group-hover:border-border", color)}>
            <Icon className="size-5" />
        </div>
        <div className="flex-1">
            <div className="flex items-center justify-between">
                <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">{label}</p>
                <div className="group/info relative">
                    <Info className="size-3 text-muted-foreground/40 hover:text-primary cursor-help transition-colors" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 p-4 bg-slate-900 rounded-2xl opacity-0 group-hover/info:opacity-100 pointer-events-none transition-all z-50 shadow-2xl">
                        <p className="text-[9px] font-bold text-white leading-relaxed uppercase tracking-tight">
                            {description}
                        </p>
                    </div>
                </div>
            </div>
            <h4 className={cn(adaptiveValueSize(val, 'text-2xl', 'text-base'), "font-black text-foreground tabular-nums leading-none")} style={{ fontFamily: "'Outfit', sans-serif" }}>
                {val}<span className="text-[10px] ml-1 text-muted-foreground font-bold uppercase">{unit}</span>
            </h4>
        </div>
    </motion.div>
);

const AITrends = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('30D');
    const [selectedRegion, setSelectedRegion] = useState('CONAKRY');
    const { data, loading, refetch, isFetching } = useTrends({ period: selectedPeriod, region: selectedRegion });
    const { data: logsData } = useAiLogs();
    const isUpdating = isFetching;
    
    const logs = logsData?.logs || [
        "Moteur BCA-Predict v4.2 opérationnel...",
        "Attente de synchronisation..."
    ];

    const handleFilterChange = (type, val) => {
        if (type === 'period') setSelectedPeriod(val);
        if (type === 'region') setSelectedRegion(val);
    };

    const trends = data?.trends || EMPTY_TRENDS;
    const globalInsight = data?.globalInsight || "Initialisation des analyses sectorielles...";

    // Ces useMemo doivent rester AVANT le `if (loading) return` ci-dessous : un hook
    // appelé après un retour conditionnel change le nombre de hooks entre le rendu
    // "chargement" et le rendu normal, ce que React interdit (crash "Rendered more
    // hooks than during the previous render").
    const avgConfidence = React.useMemo(
        () => trends.length > 0 ? (trends.reduce((s, t) => s + parseFloat(t.confidence), 0) / trends.length).toFixed(1) : "98.2",
        [trends]
    );
    const totalVolumeK = React.useMemo(
        () => (trends.reduce((s, t) => s + parseFloat(t.value || 0), 0) / 1000).toFixed(1),
        [trends]
    );

    if (loading) return (
        <DashboardLayout title="IA PRÉDICTIVE" noPadding>
            <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center">
                <div className="flex flex-col items-center gap-8">
                    <div className="size-20 rounded-3xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center animate-pulse">
                        <Brain className="size-10 text-primary shadow-glow" />
                    </div>
                    <div className="space-y-2">
                        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Synchronisation Moteur BCA...</p>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase italic">Version Alpha 4.2.0</p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout title="ANALYSE TEMPS RÉEL" noPadding>
            <div className="min-h-screen bg-background p-6 lg:p-8 space-y-8 custom-scrollbar">
                
                {/* HUD Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <div className="size-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-lg shadow-primary/5">
                            <Microscope className="size-7 text-primary" />
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-3xl font-black text-foreground uppercase tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                AI <span className="text-primary">Trends</span>
                            </h1>
                            <div className="flex items-center gap-2">
                                <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                                    Moteur Prédictif BCA • Certification V4.2
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="h-12 px-6 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl font-black text-[9px] uppercase tracking-widest flex items-center gap-3 border border-emerald-100 dark:border-emerald-500/20">
                            <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                            Flux Certifié
                        </div>
                    </div>
                </div>

                {/* Insight & Alert Banner */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="xl:col-span-8 bg-slate-900 p-6 rounded-3xl relative overflow-hidden flex items-center gap-8 shadow-2xl shadow-slate-200"
                    >
                        <Sparkles className="absolute -right-8 -top-8 size-40 text-white/[0.03] pointer-events-none rotate-12" />
                        <div className="size-12 rounded-3xl bg-primary flex items-center justify-center shadow-xl shadow-primary/20 shrink-0">
                            <Zap className="size-8 text-white fill-current" />
                        </div>
                        <div className="space-y-2 flex-1 relative z-10">
                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-2">
                                <Activity className="size-3" /> Master Insight Engine
                            </p>
                            <p className="text-xl font-black text-white uppercase tracking-tight italic leading-relaxed" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                "{globalInsight}"
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="xl:col-span-4 bg-rose-50 dark:bg-rose-500/10 p-6 rounded-3xl border border-rose-100 dark:border-rose-500/20 flex flex-col justify-center gap-4 relative overflow-hidden"
                    >
                        <div className="flex items-center gap-3 text-rose-500">
                            <Bell className="size-5 animate-bounce" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Alerte Critique IA</span>
                        </div>
                        <p className="text-sm font-bold text-rose-900 leading-snug italic uppercase tracking-tight">
                            {trends.length > 0 && parseFloat(trends[0].growth) > 10 
                                ? `Risque de rupture sur ${trends[0].name} identifié à ${selectedRegion}.`
                                : `Optimisation recommandée pour le segment ${trends[0]?.name || 'Alpha'}.`}
                        </p>
                    </motion.div>
                </div>

                {/* Main HUD Filters */}
                <div className="bg-card p-5 rounded-3xl border border-border shadow-sm flex flex-col xl:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 w-full xl:w-auto">
                        <FilterDropdown
                            icon={Clock}
                            label="Période"
                            value={selectedPeriod}
                            onChange={(p) => handleFilterChange('period', p)}
                            defaultValue="30D"
                            options={['24H', '7D', '30D', '90D'].map(p => ({ value: p, label: p }))}
                        />
                        <FilterDropdown
                            icon={Globe2}
                            label="Région"
                            value={selectedRegion}
                            onChange={(r) => handleFilterChange('region', r)}
                            defaultValue="CONAKRY"
                            options={['CONAKRY', 'KAMSAR', 'LABÉ'].map(r => ({ value: r, label: r }))}
                        />
                    </div>
                    <button
                        onClick={refetch}
                        disabled={isUpdating}
                        className="shrink-0 h-12 px-8 bg-primary/10 border border-primary/20 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:bg-primary/20 transition-all w-full xl:w-auto justify-center"
                    >
                        {isUpdating ? <RefreshCcw className="size-4 animate-spin" /> : <Layers className="size-4" />} 
                        Recalculer Vecteurs
                    </button>
                </div>

                {/* Dashboard Matrix */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    
                    {/* Left Column: Stats & Logs */}
                    <div className="lg:col-span-3 space-y-8">
                        <StatCard
                            label="Indice Certitude"
                            val={avgConfidence}
                            unit="%"
                            icon={ShieldCheck}
                            color="text-emerald-500"
                            description="Niveau de précision statistique des trajectoires calculées."
                        />
                        <StatCard
                            label="Volume Analytique"
                            val={totalVolumeK}
                            unit="K"
                            icon={Activity}
                            color="text-primary"
                            description="Total des flux transactionnels agrégés sur la période."
                        />

                        <div className="bg-card p-8 rounded-3xl border border-border shadow-sm space-y-4 h-[300px]">
                            <div className="flex items-center justify-between border-b border-border pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="size-2 rounded-full bg-primary animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Predict-Log</span>
                                </div>
                                <Terminal className="size-4 text-muted-foreground" />
                            </div>
                            <div className="space-y-4">
                                {logs.map((log, idx) => (
                                    <div key={idx} className="flex items-center gap-3 opacity-80 group">
                                        <Cpu className="size-3 text-primary group-hover:scale-110 transition-transform" />
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight truncate">{log}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Middle Column: Area Chart */}
                    <div className="lg:col-span-6 space-y-6">
                        <div className="bg-card p-8 rounded-3xl border border-border shadow-sm h-[600px] overflow-hidden flex flex-col">
                            <div className="flex items-start justify-between gap-3 mb-10">
                                <h3 className="text-xl font-black text-foreground uppercase tracking-tight min-w-0" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                    Trajectoire <span className="text-primary">Temporelle</span>
                                </h3>
                                <div className="hidden sm:flex items-center gap-3 shrink-0 pt-1">
                                    <div className="flex -space-x-1">
                                        {[1,2,3].map(i => <div key={i} className="size-1.5 rounded-full bg-blue-500/20" />)}
                                    </div>
                                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest whitespace-nowrap">Velocity Tracker</span>
                                </div>
                            </div>
                            <ResponsiveContainer width="100%" height="90%">
                                <AreaChart data={data?.timeline || []}>
                                    <defs>
                                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#1ca0db" stopOpacity={0.15}/>
                                            <stop offset="95%" stopColor="#1ca0db" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid vertical={false} stroke="currentColor" className="text-slate-100 dark:text-white/5" />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }} />
                                    <YAxis axisLine={false} tickLine={false} width={40} tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                                    <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#1ca0db', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                    <Area
                                        type="monotone"
                                        dataKey="val"
                                        stroke="#1ca0db"
                                        fillOpacity={1}
                                        fill="url(#colorVal)"
                                        strokeWidth={2}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Right Column: Sector Pie */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="bg-card p-6 rounded-3xl border border-border shadow-sm h-full flex flex-col items-center">
                            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-10 text-center">Répartition Segmentaire</h3>
                            <div className="w-full h-[250px] mb-10">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={trends}
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={8}
                                            dataKey="value"
                                        >
                                            {trends.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<ChartTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="w-full space-y-4 overflow-y-auto no-scrollbar max-h-[220px]">
                                {trends.map((t, i) => (
                                    <div key={i} className="flex items-center justify-between group p-3 rounded-2xl hover:bg-muted transition-all border border-transparent hover:border-border">
                                        <div className="flex items-center gap-3">
                                            <div className="size-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                            <span className="text-[10px] font-black uppercase text-foreground truncate max-w-[80px]">{t.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-black text-foreground tabular-nums">{t.confidence}%</span>
                                            {parseFloat(t.growth) > 0 ? <ArrowUpRight className="size-3 text-emerald-500" /> : <ArrowDownRight className="size-3 text-rose-500" />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Audit Grid */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-2xl font-black text-foreground uppercase tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>Audit de <span className="text-primary">Croissance</span></h3>
                        <span className="text-[9px] font-black text-muted-foreground uppercase italic">Alpha-Predict v4.2</span>
                    </div>

                    <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-muted border-b border-border">
                                        <th className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">Secteur</th>
                                        <th className="px-6 py-5 text-center text-[10px] font-black text-muted-foreground uppercase tracking-widest">Tendance</th>
                                        <th className="px-6 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">Valeur Marché</th>
                                        <th className="px-6 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">Fiabilité IA</th>
                                        <th className="px-8 py-5 text-right text-[10px] font-black text-muted-foreground uppercase tracking-widest">Statut</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {trends.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-muted/50 transition-all group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-10 rounded-2xl bg-card border border-border flex items-center justify-center font-black text-[11px] text-primary shadow-sm group-hover:scale-110 transition-transform">
                                                        {item.name[0]}
                                                    </div>
                                                    <span className="text-xs font-black text-foreground uppercase tabular-nums">{item.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 text-center">
                                                <div className={cn(
                                                    "inline-flex items-center gap-1.5 font-black text-[11px] px-3 py-1 rounded-full",
                                                    parseFloat(item.growth) >= 0 ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20" : "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20"
                                                )}>
                                                    {parseFloat(item.growth) >= 0 ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                                                    {item.growth}%
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <span className="text-sm font-black text-foreground tabular-nums">
                                                    {parseFloat(item.value || 0).toLocaleString()} <span className="text-[10px] text-muted-foreground">GNF</span>
                                                </span>
                                            </td>
                                            <td className="px-6 py-6 min-w-[200px]">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                                        <motion.div 
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${item.confidence}%` }}
                                                            className="h-full bg-emerald-500 rounded-full"
                                                        />
                                                    </div>
                                                    <span className="text-[10px] font-black text-muted-foreground tabular-nums">{item.confidence}%</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className={cn(
                                                    "inline-block px-4 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest",
                                                    parseFloat(item.growth) > 15 ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20" : "bg-muted text-muted-foreground border-border"
                                                )}>
                                                    {parseFloat(item.growth) > 15 ? 'Critique' : 'Stable'}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AITrends;
