import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useFinancialStats } from '../hooks/useDashboardData';
import { 
    ResponsiveContainer, 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip 
} from 'recharts';
import { 
    Landmark, TrendingUp, RefreshCcw, Download,
    FileText, PieChart, Wallet, CreditCard,
    Activity, Zap, ShieldCheck, History, Database, X
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { addPdfLetterhead } from '../../lib/pdfBranding';
import { useLanguage } from '../../context/useLanguage';
import DashboardCard from '../../components/ui/DashboardCard';
import ChartTooltip from '../../components/ui/ChartTooltip';
import FilterDropdown from '../../components/ui/FilterDropdown';

const FinancialReports = () => {
    const { t } = useLanguage();
    const { data, loading, error, refetch } = useFinancialStats();
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [filterPeriod, setFilterPeriod] = useState('7J');

    if (error && error.includes('403')) {
        return (
            <DashboardLayout title={t('finRefused')} noPadding>
                <div className="min-h-screen bg-background flex items-center justify-center p-6">
                    <div className="max-w-md w-full bg-card p-10 rounded-3xl border border-border shadow-2xl flex flex-col items-center text-center gap-6">
                        <div className="size-20 rounded-3xl bg-rose-50 flex items-center justify-center">
                            <ShieldCheck className="size-10 text-rose-500" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-foreground uppercase tracking-tighter">{t('finRefused')}</h2>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
                                {t('finRefusedDesc')}
                            </p>
                        </div>
                        <button 
                            onClick={() => window.location.href = '/dashboard'}
                            className="w-full h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all border-none"
                        >
                            {t('finBack')}
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (loading) return (
        <DashboardLayout title={t('finTreasury')} noPadding>
            <div className="min-h-screen bg-background flex items-center justify-center p-6">
                <div className="flex flex-col items-center gap-8">
                    <div className="size-20 rounded-3xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center animate-pulse">
                        <Zap className="size-10 text-primary shadow-glow" />
                    </div>
                    <div className="space-y-2 text-center">
                        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">{t('finLoading')}</p>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase italic">Version Alpha 4.2.0</p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );

    const stats = data?.stats || [];
    const transactions = data?.transactions || [];
    const chartData = data?.chartData || { timeseries: [] };

    const getExportData = () => {
        return transactions.map(t => ({
            "TYPE": t.type?.split('_').join(' ').toUpperCase() || 'N/A',
            "UTILISATEUR": t.user || 'SYSTÈME',
            "MONTANT": parseFloat(t.amount || 0),
            "STATUT": t.status?.toUpperCase() || 'N/A',
            "DATE": t.date || new Date().toLocaleDateString()
        }));
    };

    const handleExportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(getExportData());
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Trésorerie");
        XLSX.writeFile(workbook, `BCA_Financial_Audit_${Date.now()}.xlsx`);
        setShowExportMenu(false);
        toast.success(t('messageSuccess') || "EXCEL GÉNÉRÉ AVEC SUCCÈS.");
    };

    const handleExportCSV = () => {
        const worksheet = XLSX.utils.json_to_sheet(getExportData());
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `BCA_Finance_${Date.now()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setShowExportMenu(false);
        toast.success(t('messageSuccess') || "FICHIER CSV DÉPLOYÉ.");
    };

    const handleExportPDF = () => {
        const doc = new jsPDF('landscape');
        const headerY = addPdfLetterhead(doc, "RAPPORT DE TRÉSORERIE", `AUDIT RÉSEAU • GÉNÉRÉ LE: ${new Date().toLocaleString()} • SEGMENT: ${filterPeriod}`);

        autoTable(doc, {
            startY: headerY,
            head: [["TYPE", "UTILISATEUR", "MONTANT (GNF)", "STATUT", "DATE"]],
            body: getExportData().map(row => [
                row.TYPE,
                row.UTILISATEUR,
                row.MONTANT.toLocaleString() + " GNF",
                row.STATUT,
                row.DATE
            ]),
            theme: 'grid',
            headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
            styles: { fontSize: 8 },
            margin: { top: headerY }
        });
        
        doc.save(`BCA_Audit_Financial_${Date.now()}.pdf`);
        setShowExportMenu(false);
        toast.success(t('messageSuccess') || "AUDIT PDF PRÊT POUR ARCHIVAGE.");
    };

    return (
        <DashboardLayout title={t('finTitle')} noPadding>
            <div className="min-h-screen bg-background p-6 lg:p-12 space-y-12 custom-scrollbar">
                
                {/* HUD Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex items-start gap-6">
                        <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-2xl shadow-primary/10">
                            <Landmark className="size-8 text-primary shadow-glow" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                {t('finTitle')}
                            </h1>
                            <div className="flex items-center gap-2">
                                <div className="size-2 rounded-full bg-emerald-500 animate-pulse border-2 border-white shadow-sm" />
                                <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.3em]">
                                    {t('finSyncStatus')}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            className="h-12 px-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] flex items-center gap-4 shadow-[0_20px_40px_-15px_rgba(15,23,42,0.3)] hover:opacity-90 active:scale-95 transition-all text-white border-none"
                        >
                            <Download className="size-5" />
                            {t('finGenerate')}
                        </button>
                        <button onClick={refetch} className="size-12 rounded-2xl bg-card border border-border flex items-center justify-center hover:bg-muted transition-all shadow-xl shadow-slate-200/40">
                            <RefreshCcw className="size-6 text-muted-foreground" />
                        </button>
                    </div>
                </div>

                {/* Export HUD - Expanding Area */}
                <AnimatePresence>
                    {showExportMenu && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0, y: -20 }}
                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -20 }}
                            className="overflow-hidden"
                        >
                            <div className="bg-card p-8 rounded-3xl border border-primary/20 bg-primary/[0.01] grid grid-cols-1 md:grid-cols-4 gap-6 shadow-2xl shadow-primary/5">
                                <button onClick={handleExportExcel} className="p-8 rounded-3xl bg-card border border-border hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5 flex flex-col items-center gap-4 transition-all group">
                                    <div className="size-11 rounded-2xl bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <FileText className="size-7 text-emerald-500" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">{t('finExportExcel')}</p>
                                        <p className="text-[9px] font-bold text-muted-foreground mt-1">Audit Ledger .xlsx</p>
                                    </div>
                                </button>
                                <button onClick={handleExportPDF} className="p-8 rounded-3xl bg-card border border-border hover:border-rose-200 hover:shadow-xl hover:shadow-rose-500/5 flex flex-col items-center gap-4 transition-all group">
                                    <div className="size-11 rounded-2xl bg-rose-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <PieChart className="size-7 text-rose-500" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">{t('finExportPDF')}</p>
                                        <p className="text-[9px] font-bold text-muted-foreground mt-1">Report Generation .pdf</p>
                                    </div>
                                </button>
                                <button onClick={handleExportCSV} className="p-8 rounded-3xl bg-card border border-border hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 flex flex-col items-center gap-4 transition-all group">
                                    <div className="size-11 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Database className="size-7 text-blue-500" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">{t('finExportCSV')}</p>
                                        <p className="text-[9px] font-bold text-muted-foreground mt-1">Raw Ledger Data .csv</p>
                                    </div>
                                </button>
                                <button onClick={() => setShowExportMenu(false)} className="p-8 rounded-3xl bg-card border border-border hover:border-slate-300 hover:shadow-xl flex flex-col items-center gap-4 transition-all group">
                                    <div className="size-11 rounded-2xl bg-muted flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <X className="size-7 text-muted-foreground" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">{t('finCancelOp')}</p>
                                        <p className="text-[9px] font-bold text-muted-foreground mt-1">{t('finCloseExport')}</p>
                                    </div>
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Summary HUD */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {stats.map((s, i) => (
                        <DashboardCard
                            key={i}
                            title={t(s.titleKey) || s.title}
                            value={s.title.toLowerCase().includes('dépôts') || s.title.toLowerCase().includes('montant') ? `${parseFloat(s.value || 0).toLocaleString('fr-GN')} ${t('gnf')}` : parseFloat(s.value || 0).toLocaleString('fr-GN')}
                            trendValue={s.trendValue}
                            trend={s.trend}
                            icon={[CreditCard, Wallet, TrendingUp, History][i % 4]}
                            iconColor={["primary", "primary", "emerald", "amber"][i % 4]}
                        />
                    ))}
                </div>

                {/* Workspace area */}
                <div className="space-y-12">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Analyzer Chart */}
                        <div className="lg:col-span-8 flex flex-col gap-8">
                            <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-4">
                                    <Activity className="size-5 text-primary" />
                                    <FilterDropdown
                                        value={filterPeriod}
                                        onChange={setFilterPeriod}
                                        defaultValue="7J"
                                        options={['7J', '30J', 'MAX'].map(p => ({
                                            value: p,
                                            label: p === 'MAX' ? (t('year') || 'ANNÉE') : p,
                                        }))}
                                    />
                                </div>
                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Fin-Sync Intelligence v2.0</span>
                            </div>

                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-card p-10 rounded-3xl border border-border shadow-xl shadow-slate-200/30 h-[550px]"
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData.timeseries}>
                                        <defs>
                                            <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#1CA0DB" stopOpacity={0.15}/>
                                                <stop offset="95%" stopColor="#1CA0DB" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid vertical={false} stroke="currentColor" className="text-slate-100 dark:text-white/5" />
                                        <XAxis
                                            dataKey="day"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }}
                                            dy={15}
                                        />
                                        <YAxis axisLine={false} tickLine={false} width={44} tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                                        <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#1CA0DB', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                        <Area 
                                            type="monotone" 
                                            dataKey="val" 
                                            stroke="#1CA0DB" 
                                            fillOpacity={1} 
                                            fill="url(#colorVal)" 
                                            strokeWidth={6} 
                                            animationDuration={2500}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </motion.div>
                        </div>

                        {/* Recent Activity Ledger */}
                        <div className="lg:col-span-4 flex flex-col gap-8">
                            <h3 className="text-3xl font-black text-foreground uppercase tracking-tighter px-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                {t('finDirectFlow')}
                            </h3>

                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-card p-8 rounded-3xl border border-border shadow-xl shadow-slate-200/30 flex-1 min-h-[550px] overflow-y-auto no-scrollbar space-y-3"
                            >
                                {transactions.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center gap-6 opacity-40 text-muted-foreground py-32">
                                        <div className="size-20 rounded-2xl bg-muted flex items-center justify-center">
                                            <Database className="size-10" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[12px] font-black uppercase tracking-[0.3em] text-foreground">{t('finNoFlow')}</p>
                                            <p className="text-[10px] font-bold mt-2 uppercase tracking-widest">{t('finEmptyLedger')}</p>
                                        </div>
                                    </div>
                                ) : (
                                    transactions.map((tx, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-6 rounded-2xl hover:bg-muted/80 transition-all border border-transparent hover:border-border group">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[9px] font-black text-primary bg-primary/10 px-2.5 py-1 rounded-lg uppercase tracking-wider">{tx.type}</span>
                                                    <p className="text-[13px] font-black text-foreground uppercase tracking-tight truncate max-w-[120px]">{tx.user}</p>
                                                </div>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase italic opacity-60">{tx.date}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-base font-black text-foreground tabular-nums">
                                                    {(tx.amount || 0).toLocaleString()} <span className="text-[10px] text-muted-foreground ml-0.5">{t('gnf')}</span>
                                                </p>
                                                <div className="flex items-center justify-end gap-2 mt-1">
                                                    <div className={cn("size-2 rounded-full shadow-glow", tx.statusVariant === 'success' ? "bg-emerald-500 shadow-emerald-500/20" : "bg-primary shadow-primary/20")} />
                                                    <span className={cn(
                                                        "text-[10px] font-black uppercase tracking-widest",
                                                        tx.statusVariant === 'success' ? "text-emerald-500" : "text-primary"
                                                    )}>
                                                        {tx.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </motion.div>
                            
                            <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 flex items-center gap-6 overflow-hidden relative group shadow-2xl shadow-slate-900/40">
                                <div className="size-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                                    <Zap className="size-8 text-primary animate-pulse" />
                                </div>
                                <div className="space-y-1 relative z-10">
                                    <p className="text-[11px] font-black text-white uppercase tracking-[0.2em]">{t('finEncryptedSec')}</p>
                                    <p className="text-[9px] font-bold text-muted-foreground leading-relaxed uppercase italic opacity-60">
                                        {t('finAuditProtocol')}
                                    </p>
                                </div>
                                <History className="absolute -right-6 -bottom-6 size-24 text-white/[0.03] rotate-12" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default FinancialReports;
