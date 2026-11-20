import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DataTable from '../../components/ui/DataTable';
import { ModalOverlay } from '../../components/ui/ModalOverlay';
import auditLogService from '../services/auditLogService';
import {
    Activity, Search, RefreshCcw, Eye, User, Clock, Globe,
    AlertTriangle, AlertOctagon, Info, Monitor, CalendarRange, ArrowUpDown
} from 'lucide-react';
import { cn } from '../../lib/utils';

const NIVEAU_STYLES = {
    info: { label: 'Info', className: 'text-muted-foreground bg-muted border-border', icon: Info },
    warning: { label: 'Alerte', className: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20', icon: AlertTriangle },
    error: { label: 'Erreur', className: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20', icon: AlertOctagon },
};

const MOIS = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

const pad = (n) => String(n).padStart(2, '0');
const toISODate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// Calcule la plage {date_debut, date_fin} envoyée à l'API selon le préréglage choisi.
const computeDateRange = (period, specificMonth, specificYear) => {
    const now = new Date();
    switch (period) {
        case 'today':
            return { date_debut: toISODate(now), date_fin: toISODate(now) };
        case 'week': {
            const day = now.getDay();
            const diffToMonday = day === 0 ? 6 : day - 1;
            const monday = new Date(now);
            monday.setDate(now.getDate() - diffToMonday);
            return { date_debut: toISODate(monday), date_fin: toISODate(now) };
        }
        case 'month': {
            const first = new Date(now.getFullYear(), now.getMonth(), 1);
            return { date_debut: toISODate(first), date_fin: toISODate(now) };
        }
        case 'year': {
            const first = new Date(now.getFullYear(), 0, 1);
            return { date_debut: toISODate(first), date_fin: toISODate(now) };
        }
        case 'specific_month': {
            const first = new Date(specificYear, specificMonth - 1, 1);
            const last = new Date(specificYear, specificMonth, 0);
            return { date_debut: toISODate(first), date_fin: toISODate(last) };
        }
        case 'specific_year': {
            const first = new Date(specificYear, 0, 1);
            const last = new Date(specificYear, 11, 31);
            return { date_debut: toISODate(first), date_fin: toISODate(last) };
        }
        default:
            return { date_debut: '', date_fin: '' };
    }
};

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - i);

const AuditLogPage = () => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [adresseIp, setAdresseIp] = useState('');
    const [debouncedIp, setDebouncedIp] = useState('');
    const [niveau, setNiveau] = useState('');
    const [sort, setSort] = useState('recent');
    const [period, setPeriod] = useState('all');
    const [specificMonth, setSpecificMonth] = useState(new Date().getMonth() + 1);
    const [specificYear, setSpecificYear] = useState(CURRENT_YEAR);
    const [viewing, setViewing] = useState(null);

    // Débounce : on n'interroge le backend qu'une fois la frappe stabilisée
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search.trim()), 350);
        return () => clearTimeout(timer);
    }, [search]);
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedIp(adresseIp.trim()), 350);
        return () => clearTimeout(timer);
    }, [adresseIp]);

    const { date_debut, date_fin } = useMemo(
        () => computeDateRange(period, specificMonth, specificYear),
        [period, specificMonth, specificYear],
    );

    useEffect(() => { setPage(1); }, [debouncedSearch, debouncedIp, niveau, sort, period, specificMonth, specificYear]);

    const { data, isLoading, refetch, isFetching } = useQuery({
        queryKey: ['audit-logs', page, debouncedSearch, niveau, debouncedIp, sort, date_debut, date_fin],
        queryFn: () => auditLogService.getAll({
            page, limit: 30, search: debouncedSearch, niveau_alerte: niveau,
            adresse_ip: debouncedIp, sort, date_debut, date_fin,
        }),
        keepPreviousData: true,
    });

    const logs = data?.logs || [];

    return (
        <DashboardLayout title="Journal d'activité" noPadding>
            <div className="min-h-screen bg-background p-6 lg:p-10 space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <div className="size-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <Activity className="size-7 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-foreground dark:text-white uppercase tracking-tight">
                                Journal d'activité
                            </h1>
                            <p className="text-xs text-muted-foreground font-medium mt-1 max-w-xl">
                                Toutes les actions des utilisateurs sur la plateforme — auteur, adresse IP, appareil,
                                ressource concernée et résultat, y compris les tentatives échouées.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => refetch()}
                        className="h-11 px-5 rounded-xl bg-card dark:bg-white/5 border border-border dark:border-white/10 flex items-center gap-2 text-sm font-semibold text-muted-foreground dark:text-muted-foreground hover:bg-muted transition-all shrink-0"
                    >
                        <RefreshCcw className={cn("size-4", isFetching && "animate-spin")} />
                        Actualiser
                    </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Rechercher par action, ressource, contenu..."
                            className="w-full h-11 pl-11 pr-4 rounded-xl border border-border dark:border-white/10 bg-card dark:bg-white/5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                    <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
                        <input
                            value={adresseIp}
                            onChange={(e) => setAdresseIp(e.target.value)}
                            placeholder="Adresse IP"
                            className="w-full sm:w-48 h-11 pl-11 pr-4 rounded-xl border border-border dark:border-white/10 bg-card dark:bg-white/5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                    <select
                        value={niveau}
                        onChange={(e) => setNiveau(e.target.value)}
                        className="h-11 px-4 rounded-xl border border-border dark:border-white/10 bg-card dark:bg-white/5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        <option value="">Tous les niveaux</option>
                        <option value="info">Info</option>
                        <option value="warning">Alerte</option>
                        <option value="error">Erreur</option>
                    </select>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                    <div className="relative">
                        <CalendarRange className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground size-4 pointer-events-none" />
                        <select
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            className="h-11 pl-11 pr-4 rounded-xl border border-border dark:border-white/10 bg-card dark:bg-white/5 text-sm outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
                        >
                            <option value="all">Toutes les dates</option>
                            <option value="today">Aujourd'hui</option>
                            <option value="week">Cette semaine</option>
                            <option value="month">Ce mois-ci</option>
                            <option value="year">Cette année</option>
                            <option value="specific_month">Un mois précis...</option>
                            <option value="specific_year">Une année précise...</option>
                        </select>
                    </div>

                    {period === 'specific_month' && (
                        <div className="flex gap-2">
                            <select
                                value={specificMonth}
                                onChange={(e) => setSpecificMonth(parseInt(e.target.value, 10))}
                                className="h-11 px-4 rounded-xl border border-border dark:border-white/10 bg-card dark:bg-white/5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                {MOIS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                            </select>
                            <select
                                value={specificYear}
                                onChange={(e) => setSpecificYear(parseInt(e.target.value, 10))}
                                className="h-11 px-4 rounded-xl border border-border dark:border-white/10 bg-card dark:bg-white/5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                    )}

                    {period === 'specific_year' && (
                        <select
                            value={specificYear}
                            onChange={(e) => setSpecificYear(parseInt(e.target.value, 10))}
                            className="h-11 px-4 rounded-xl border border-border dark:border-white/10 bg-card dark:bg-white/5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                        </select>
                    )}

                    <div className="relative sm:ml-auto">
                        <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground size-4 pointer-events-none" />
                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            className="h-11 pl-11 pr-4 rounded-xl border border-border dark:border-white/10 bg-card dark:bg-white/5 text-sm outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
                        >
                            <option value="recent">Plus récent</option>
                            <option value="ancien">Plus ancien</option>
                        </select>
                    </div>
                </div>

                <DataTable
                    isLoading={isLoading}
                    emptyMessage="AUCUNE ACTIVITÉ TROUVÉE"
                    columns={[
                        {
                            label: 'Utilisateur',
                            render: (row) => (
                                <div className="flex items-center gap-2 py-2">
                                    <div className="size-8 rounded-full bg-muted dark:bg-white/10 flex items-center justify-center text-muted-foreground shrink-0">
                                        <User className="size-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-foreground dark:text-white truncate">
                                            {row.User?.nom_complet || 'Invité / non connecté'}
                                        </p>
                                        {row.User?.role && (
                                            <p className="text-[10px] text-muted-foreground capitalize">{row.User.role}</p>
                                        )}
                                    </div>
                                </div>
                            ),
                        },
                        {
                            label: 'Adresse IP',
                            render: (row) => (
                                <span className="font-mono text-[11px] bg-muted dark:bg-white/5 px-2 py-1 rounded border border-border dark:border-white/10">
                                    {row.adresse_ip || '—'}
                                </span>
                            ),
                        },
                        {
                            label: 'Action',
                            render: (row) => (
                                <div className="max-w-[280px]">
                                    <p className="text-xs font-bold text-foreground/80 dark:text-slate-200 truncate">{row.action}</p>
                                    <p className="text-[10px] text-muted-foreground truncate">{row.table_affectee}</p>
                                </div>
                            ),
                        },
                        {
                            label: 'Date',
                            render: (row) => (
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
                                    <Clock className="size-3.5" />
                                    {new Date(row.createdAt).toLocaleString('fr-FR')}
                                </div>
                            ),
                        },
                        {
                            label: 'Niveau',
                            render: (row) => {
                                const style = NIVEAU_STYLES[row.niveau_alerte] || NIVEAU_STYLES.info;
                                const Icon = style.icon;
                                return (
                                    <span className={cn("inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full border", style.className)}>
                                        <Icon className="size-3" /> {style.label}
                                    </span>
                                );
                            },
                        },
                        {
                            label: '',
                            render: (row) => (
                                <button
                                    onClick={() => setViewing(row)}
                                    title="Voir le détail"
                                    className="size-9 rounded-xl bg-muted dark:bg-white/5 border border-border dark:border-white/10 flex items-center justify-center text-muted-foreground hover:text-primary transition-all"
                                >
                                    <Eye className="size-4" />
                                </button>
                            ),
                        },
                    ]}
                    data={logs}
                />

                {data && data.pages > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        <button
                            disabled={page <= 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            className="h-9 px-4 rounded-lg bg-card dark:bg-white/5 border border-border dark:border-white/10 text-xs font-semibold disabled:opacity-40"
                        >
                            Précédent
                        </button>
                        <span className="text-xs text-muted-foreground font-medium">
                            Page {data.currentPage} / {data.pages} — {data.total} entrées
                        </span>
                        <button
                            disabled={page >= data.pages}
                            onClick={() => setPage((p) => p + 1)}
                            className="h-9 px-4 rounded-lg bg-card dark:bg-white/5 border border-border dark:border-white/10 text-xs font-semibold disabled:opacity-40"
                        >
                            Suivant
                        </button>
                    </div>
                )}
            </div>

            <ModalOverlay open={!!viewing} onClose={() => setViewing(null)} title="Détail de l'action" maxWidth="max-w-xl">
                {viewing && (
                    <div className="p-6 pt-4 space-y-4">
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div><span className="text-muted-foreground">Utilisateur</span><p className="font-bold">{viewing.User?.nom_complet || 'Invité / non connecté'}{viewing.User?.email ? ` (${viewing.User.email})` : ''}</p></div>
                            <div><span className="text-muted-foreground">Adresse IP</span><p className="font-mono">{viewing.adresse_ip || '—'}</p></div>
                            <div><span className="text-muted-foreground">Action</span><p className="font-bold">{viewing.action}</p></div>
                            <div><span className="text-muted-foreground">Ressource</span><p className="font-bold">{viewing.table_affectee}</p></div>
                            <div><span className="text-muted-foreground">Date</span><p className="font-bold">{new Date(viewing.createdAt).toLocaleString('fr-FR')}</p></div>
                            <div><span className="text-muted-foreground">Niveau</span><p className="font-bold capitalize">{viewing.niveau_alerte}</p></div>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1.5"><Monitor className="size-3.5" /> Appareil / navigateur</p>
                            <p className="text-[11px] font-mono bg-muted dark:bg-white/5 p-3 rounded-xl border border-border dark:border-white/10 break-all">
                                {viewing.agent_utilisateur || 'Non disponible'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-1.5">Détail de la requête</p>
                            <pre className="max-h-72 overflow-auto bg-slate-900 text-emerald-300 text-[11px] p-4 rounded-xl leading-relaxed whitespace-pre-wrap break-all">
                                {viewing.description}
                            </pre>
                        </div>
                    </div>
                )}
            </ModalOverlay>
        </DashboardLayout>
    );
};

export default AuditLogPage;
