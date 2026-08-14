import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DashboardCard from '../../components/ui/DashboardCard';
import DataTable from '../../components/ui/DataTable';
import { Landmark, Hourglass, CreditCard, CheckCircle2, TrendingUp, Activity, Zap, RefreshCcw, Landmark as Bank, Search, Shield, ArrowRight, FileText, Download, FileSpreadsheet, FileType } from 'lucide-react';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { addPdfLetterhead } from '../../lib/pdfBranding';
import HeroChartCard from '../../components/ui/HeroChartCard';

import { useFinancialStats } from '../hooks/useDashboardData';
import { usePendingCredits } from '../../credit/hooks/useCreditData';
import { ROUTES } from '../../constants/routes';

const BankDashboard = () => {
    const { data: dashboardData, loading, refetch } = useFinancialStats();
    const { data: pendingCredits, loading: creditsLoading } = usePendingCredits();
    const [showExportMenu, setShowExportMenu] = useState(false);


    const stats = [
        { title: 'Dépôts Cumulés', value: dashboardData?.stats?.[0]?.value || '0 GNF', icon: Landmark, trend: 'up', trendValue: 'Optimal' },
        { title: 'Opérations en Attente', value: dashboardData?.stats?.[1]?.value || '0', icon: Hourglass, trend: 'up', trendValue: 'Sync' },
        { title: 'Retraits Actifs', value: dashboardData?.stats?.[2]?.value || '0', icon: CreditCard, trend: 'down', trendValue: 'Sécurisé' },
        { title: 'Volume Traité', value: dashboardData?.stats?.[3]?.value || '0', icon: CheckCircle2, trend: 'up', trendValue: 'Total' },
    ];

    const transactions = dashboardData?.transactions || [];

    const transactionColumns = [
        {
            label: 'ID TX SOURCE',
            render: (row) => (
                <span className="font-black text-[#1CA0DB] uppercase text-[9px] tracking-widest bg-[#1CA0DB]/5 px-2 py-1 rounded-lg border border-[#1CA0DB]/10 shadow-sm">
                    #{row.id?.toString().toUpperCase().slice(0, 8) || 'TX-ALPHA'}
                </span>
            )
        },
        {
            label: 'ACTEUR RÉSEAU',
            render: (row) => (
                <div className="flex items-center gap-4 py-1 group/actor">
                    <div className="size-6 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-foreground/5 flex items-center justify-center overflow-hidden shrink-0 shadow-sm relative">
                        <img alt="" src={row.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${row.user}`} className="size-full object-cover relative z-10 group-hover/actor:scale-110 transition-transform" />
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#1CA0DB]/10 to-transparent" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-black text-slate-800 dark:text-foreground uppercase truncate tracking-tight leading-none pt-0.5">{row.user?.toUpperCase() || 'MEMBRE'}</p>
                        <p className="text-[8px] font-black text-muted-foreground/80 uppercase tracking-widest leading-none mt-1 opacity-70">UID: {row.userId?.slice(0, 5).toUpperCase() || 'N/A'}</p>
                    </div>
                </div>
            )
        },
        {
            label: 'FLUX COMPTA',
            render: (row) => (
                <span className={cn(
                    "px-4 h-8 rounded-xl text-[8px] font-black uppercase tracking-widest flex items-center gap-2 border w-fit",
                    row.typeVariant === 'emerald' ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-500 shadow-sm shadow-emerald-500/5" :
                        row.typeVariant === 'rose' ? "bg-rose-500/5 border-rose-500/10 text-rose-500 shadow-sm shadow-rose-500/5" :
                            "bg-[#1CA0DB]/5 border-[#1CA0DB]/10 text-[#1CA0DB] shadow-sm shadow-[#1CA0DB]/5"
                )}>
                    <Activity className="size-3" />
                    {row.type?.toUpperCase() || 'TRANSFERT'}
                </span>
            )
        },
        {
            label: 'VOLUME GNF',
            render: (row) => (
                <span className="text-[12px] font-black text-slate-900 dark:text-foreground tracking-tighter tabular-nums uppercase">
                    {row.amount} <small className="text-[8px] font-black text-[#1CA0DB]">GNF</small>
                </span>
            )
        },
        {
            label: 'INFRA INFOS',
            render: (row) => (
                <span className="font-black text-muted-foreground/80 dark:text-muted-foreground text-[9px] uppercase tracking-widest leading-relaxed pt-0.5">{row.method?.toUpperCase() || 'CANAL RÉSEAU'}</span>
            )
        },
        {
            label: 'AUDIT STATUT',
            render: (row) => {
                const status = row.status;
                return (
                    <div className="flex items-center gap-3">
                         <div className={cn(
                            "size-1.5 rounded-full",
                            status === 'Validé' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" :
                                status === 'En attente' ? "bg-amber-500 animate-pulse" : "bg-rose-500"
                        )} />
                        <span className={cn(
                            "text-[8px] font-black uppercase tracking-widest",
                            status === 'Validé' ? "text-emerald-500" :
                                status === 'En attente' ? "text-amber-500" : "text-rose-500"
                        )}>
                            {status?.toUpperCase() || 'INDEXÉ'}
                        </span>
                    </div>
                );
            }
        },
        {
            label: 'ACTION',
            render: (row) => (
                <div className="text-right pr-4">
                    {row.status === 'En attente' ? (
                        <Link
                            to={ROUTES.BANK.CREDITS}
                            className="h-8 px-4 inline-flex items-center gap-2 bg-[#1CA0DB]/10 border border-[#1CA0DB]/20 text-[#1CA0DB] hover:bg-[#1CA0DB] hover:text-white rounded-xl text-[8px] font-black uppercase tracking-widest transition-all"
                        >
                            <FileText className="size-3" />
                            Crédits
                        </Link>
                    ) : (
                        <Link
                            to={ROUTES.BANK.CREDITS}
                            className="h-8 px-4 inline-flex items-center text-muted-foreground/80 hover:text-[#1CA0DB] text-[8px] font-black uppercase tracking-widest transition-all"
                        >
                            Détails
                        </Link>
                    )}
                </div>
            )
        }
    ];

    const getExportData = () => transactions.map((row) => ({
        "ID TRANSACTION": row.id?.toString().toUpperCase().slice(0, 8) || 'N/A',
        "UTILISATEUR": row.user || 'N/A',
        "TYPE": row.type || 'N/A',
        "MONTANT (GNF)": Math.round(parseFloat(row.amount) || 0),
        "MÉTHODE": row.method || 'N/A',
        "STATUT": row.status || 'N/A',
    }));

    const handleExportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(getExportData());
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Registre Banque");
        XLSX.writeFile(workbook, `BCA_Registre_Banque_${Date.now()}.xlsx`);
        setShowExportMenu(false);
        toast.success("Excel généré avec succès.");
    };

    const handleExportCSV = () => {
        const worksheet = XLSX.utils.json_to_sheet(getExportData());
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `BCA_Registre_Banque_${Date.now()}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setShowExportMenu(false);
        toast.success("Fichier CSV généré.");
    };

    const handleExportPDF = () => {
        const doc = new jsPDF("landscape");
        const headerY = addPdfLetterhead(
            doc,
            "REGISTRE D'AUDIT TRANSACTIONNEL — BANQUE",
            `GÉNÉRÉ LE : ${new Date().toLocaleString()} • VOLUME INDEXÉ : ${(dashboardData?.chartData?.total || 0).toLocaleString('fr-GN')} GNF`,
        );

        autoTable(doc, {
            startY: headerY,
            head: [["ID transaction", "Utilisateur", "Type", "Montant (GNF)", "Méthode", "Statut"]],
            body: getExportData().map((row) => [
                row["ID TRANSACTION"],
                row["UTILISATEUR"],
                row["TYPE"],
                row["MONTANT (GNF)"].toLocaleString("fr-GN"),
                row["MÉTHODE"],
                row["STATUT"],
            ]),
            theme: "grid",
            headStyles: { fillColor: [28, 160, 219], textColor: [255, 255, 255] },
            styles: { fontSize: 8 },
            margin: { top: headerY },
        });

        doc.save(`BCA_Registre_Banque_${Date.now()}.pdf`);
        setShowExportMenu(false);
        toast.success("Rapport PDF prêt.");
    };

    return (
        <DashboardLayout title="CENTRE BANQUE RÉSEAU">
            <div className="space-y-4 animate-in fade-in duration-700 pb-24">

                {/* Compact Command Bar */}
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 bg-white dark:bg-[#0F1219] p-4 rounded-2xl border border-slate-200 dark:border-foreground/5 shadow-sm overflow-hidden relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#1CA0DB]/[0.01] to-transparent pointer-events-none" />
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="size-6 rounded-xl bg-[#1CA0DB]/10 flex items-center justify-center text-[#1CA0DB] border border-[#1CA0DB]/5 group-hover:rotate-6 transition-transform">
                            <Bank className="size-6 shadow-sm" />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-sm font-black text-slate-900 dark:text-foreground uppercase tracking-tight leading-none pt-0.5">
                                OPS <span className="text-[#1CA0DB]">FINANCIÈRES</span>.
                            </h2>
                            <p className="text-[9px] font-black text-muted-foreground/80 uppercase tracking-widest opacity-80 decoration-[#1CA0DB]/20 underline underline-offset-4">
                                TERMINAL BANQUE — SYNC : {new Date().toLocaleTimeString('fr-GN', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 relative z-10">
                        <button onClick={() => refetch()} className="size-6 rounded-xl bg-slate-50 dark:bg-foreground/5 border border-slate-100 dark:border-foreground/5 flex items-center justify-center text-muted-foreground/80 hover:text-[#1CA0DB] transition-all shadow-sm">
                            <RefreshCcw className={cn("size-5", loading && "animate-spin")} />
                        </button>
                        <div className="flex items-center gap-3 px-5 h-10 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                            <Shield className="size-4 text-emerald-500" />
                            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest pt-0.5">VAULT SECURE</span>
                        </div>
                    </div>
                </div>

                {/* KPI Area — Strategic Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {stats.map((stat, idx) => (
                        <DashboardCard key={idx} {...stat} className="h-32" />
                    ))}
                </div>

                {/* Demandes de crédit en attente */}
                <Link
                    to={ROUTES.BANK.CREDITS}
                    className="block bg-white dark:bg-[#0F1219] border border-slate-200 dark:border-foreground/5 rounded-2xl p-4 shadow-sm hover:border-primary/30 transition-all group"
                >
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="size-11 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/10">
                                <FileText className="size-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-tight">Demandes de financement</h3>
                                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                                    {creditsLoading ? 'Chargement...' : `${pendingCredits.length} en attente d'approbation`}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-primary">
                            <span className="text-[10px] font-black uppercase tracking-widest">Traiter</span>
                            <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </Link>

                {/* Financial Activity — Strategic Matrix */}
                <HeroChartCard
                    title="FLUX TRANSACTIONNEL RÉSEAU"
                    subtitle="Synchronisation bancaire — Historique 7 jours"
                    icon={Activity}
                    variant="bar"
                    data={dashboardData?.chartData?.timeseries || []}
                    xKey="day"
                    yKey="val"
                    unit="GNF"
                    height={300}
                    emptyState={{ icon: Activity, message: 'Aucun flux sur la période' }}
                    headerExtra={
                        <div className="flex items-center gap-3 bg-foreground/5 border border-border px-8 py-4 rounded-xl shadow-inner group/val">
                            <div className="text-right">
                                <p className="text-[7px] font-black text-muted-foreground uppercase tracking-widest mb-1">VOLUME INDEXÉ</p>
                                <p className="text-sm font-black text-foreground tracking-tighter uppercase tabular-nums leading-none">{dashboardData?.chartData?.total?.toLocaleString() || '0'} <small className="text-[10px] font-black text-[#1CA0DB]">GNF</small></p>
                            </div>
                            <div className="h-10 w-px bg-border" />
                            <div className="flex items-center gap-3">
                                <TrendingUp className="size-4 text-emerald-500 group-hover/val:scale-125 transition-transform" />
                                <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest pt-1">{dashboardData?.chartData?.delta || '+14.2%'}</span>
                            </div>
                        </div>
                    }
                />

                {/* Audited Transaction Surface */}
                <div className="bg-white dark:bg-[#0F1219] border border-slate-200 dark:border-foreground/5 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-slate-100 dark:border-foreground/5 bg-slate-50/20 dark:bg-white/[0.01] flex flex-col xl:flex-row xl:items-center justify-between gap-3">
                         <div className="flex items-center gap-3 text-muted-foreground/80">
                             <Shield className="size-4" />
                             <span className="text-[9px] font-semibold pt-0.5">REGISTRE D'AUDIT TRANSACTIONNEL</span>
                         </div>
                         <div className="flex items-center gap-3 w-full xl:w-auto">
                             <div className="relative group flex-1 xl:w-80">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/80 size-4 group-focus-within:text-[#1CA0DB] transition-colors z-10" />
                                <input
                                    className="w-full pl-11 pr-4 h-9 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-foreground/10 rounded-xl text-[9px] font-black tracking-widest placeholder:text-muted-foreground/80 outline-none transition-all focus:border-[#1CA0DB]/30"
                                    placeholder="Rechercher une transaction..."
                                />
                             </div>
                             <div className="relative shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setShowExportMenu((v) => !v)}
                                    className="h-9 px-4 rounded-xl border border-slate-200 dark:border-foreground/10 bg-slate-50 dark:bg-white/[0.03] text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:text-[#1CA0DB] transition-colors"
                                >
                                    <Download className="size-3.5" />
                                    Exporter
                                </button>
                                {showExportMenu && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />
                                        <div className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 dark:border-foreground/10 bg-white dark:bg-[#0F1219] shadow-xl z-20 overflow-hidden">
                                            <button
                                                type="button"
                                                onClick={handleExportExcel}
                                                className="w-full flex items-center gap-2 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors"
                                            >
                                                <FileSpreadsheet className="size-4 text-emerald-600" />
                                                Excel (.xlsx)
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleExportCSV}
                                                className="w-full flex items-center gap-2 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors"
                                            >
                                                <FileType className="size-4 text-blue-600" />
                                                CSV
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleExportPDF}
                                                className="w-full flex items-center gap-2 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors"
                                            >
                                                <FileText className="size-4 text-red-600" />
                                                PDF
                                            </button>
                                        </div>
                                    </>
                                )}
                             </div>
                         </div>
                    </div>

                    <div className="p-2">
                        <DataTable
                            columns={transactionColumns}
                            data={transactions}
                            isLoading={loading}
                            className="bg-transparent border-0"
                        />
                        {!loading && transactions.length === 0 && (
                            <div className="py-24 text-center opacity-20 flex flex-col items-center gap-3">
                                <CreditCard className="size-6 animate-pulse text-muted-foreground/80" />
                                <p className="text-[10px] font-black uppercase ">Aucun flux financier détecté</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default BankDashboard;
