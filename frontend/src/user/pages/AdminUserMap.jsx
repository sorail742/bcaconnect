import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import RoleLocationMap, { ROLE_COLORS } from '../../components/maps/RoleLocationMap';
import { useUserLocations } from '../../hooks/data/useMapData';
import { ROLES, ROLE_LABELS } from '../../constants/roles';
import { cn } from '../../lib/utils';
import { ArrowLeft, Globe2, RefreshCcw, Satellite } from 'lucide-react';
import FilterDropdown from '../../components/ui/FilterDropdown';

const ROLE_FILTERS = ['all', ROLES.ADMIN, ROLES.FOURNISSEUR, ROLES.TRANSPORTEUR, ROLES.CLIENT, ROLES.TECHNICIEN, ROLES.BANQUE];

const AdminUserMap = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState('all');
    const { data, isLoading, refetch, isFetching } = useUserLocations(role === 'all' ? '' : role);

    const points = useMemo(() => data.map((u) => ({
        id: u.id,
        lat: u.location.lat,
        lng: u.location.lng,
        label: u.nom_complet,
        sublabel: ROLE_LABELS[u.role] || u.role,
        role: u.role,
        precision: u.precision,
        avatarUrl: u.avatar_url,
        extra: [
            ...(u.detail ? [{ label: 'Détail', value: u.detail }] : []),
            ...(Number.isFinite(u.score_confiance) ? [{ label: 'Confiance', value: `${u.score_confiance}%` }] : []),
        ],
    })), [data]);

    const gpsCount = points.filter((p) => p.precision === 'gps').length;

    return (
        <DashboardLayout title="CARTE DES UTILISATEURS" noPadding>
            <div className="w-full min-w-0 max-w-full overflow-x-hidden box-border px-4 md:px-6 py-4 md:py-6 space-y-6 pb-24">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 min-w-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <button
                            onClick={() => navigate('/admin/dashboard')}
                            className="size-9 shrink-0 rounded-xl border border-border flex items-center justify-center hover:text-primary transition-colors"
                        >
                            <ArrowLeft className="size-4" />
                        </button>
                        <div className="size-11 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Globe2 className="size-5" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-base md:text-lg font-black uppercase tracking-tight truncate">
                                Carte des <span className="text-primary">utilisateurs</span>
                            </h2>
                            <p className="text-[9px] text-muted-foreground uppercase tracking-wide truncate">
                                {points.length} positionnés · {gpsCount} GPS live · {points.length - gpsCount} approx.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => refetch()}
                        className="size-10 shrink-0 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg self-end sm:self-auto"
                    >
                        <RefreshCcw className={cn('size-4', (isLoading || isFetching) && 'animate-spin')} />
                    </button>
                </div>

                <FilterDropdown
                    label="Tous les rôles"
                    value={role}
                    onChange={setRole}
                    defaultValue="all"
                    icon={Globe2}
                    options={ROLE_FILTERS.map((r) => ({
                        value: r,
                        label: r === 'all' ? 'Tous les rôles' : ROLE_LABELS[r],
                        dot: r !== 'all' ? ROLE_COLORS[r] : undefined,
                    }))}
                />

                <div className="w-full min-w-0 bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                    <div className="px-4 py-3 border-b border-border flex flex-wrap items-center gap-2 min-w-0">
                        <Satellite className="size-4 text-primary shrink-0" />
                        <span className="text-[10px] font-black uppercase tracking-wide truncate">Répartition géographique</span>
                    </div>
                    <RoleLocationMap points={points} height={480} emptyMessage="Aucun utilisateur positionné pour ce filtre. Les positions sont dérivées du GPS réel des transporteurs ou de l'adresse déclarée des autres rôles." />
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminUserMap;
