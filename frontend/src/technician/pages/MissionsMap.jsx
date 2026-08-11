import React, { useMemo } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import RoleLocationMap from '../../components/maps/RoleLocationMap';
import { useMyMissionsMap } from '../../hooks/data/useMapData';
import { Wrench, RefreshCcw } from 'lucide-react';
import { cn } from '../../lib/utils';

const STATUS_LABELS = { en_attente: 'En attente', en_cours: 'En cours' };

const MissionsMap = () => {
    const { data, isLoading, refetch, isFetching } = useMyMissionsMap();

    const points = useMemo(() => data.map((m) => ({
        id: m.id,
        lat: m.location.lat,
        lng: m.location.lng,
        label: m.client,
        sublabel: m.nom_produit,
        commune: m.commune,
        role: 'technicien',
        precision: 'approx',
        extra: [{ label: 'Statut', value: STATUS_LABELS[m.status] || m.status }],
    })), [data]);

    return (
        <DashboardLayout title="CARTE DE MES MISSIONS" noPadding>
            <div className="w-full min-w-0 max-w-full overflow-x-hidden box-border px-4 md:px-6 py-4 md:py-6 space-y-6 pb-24">
                <div className="flex items-center justify-between gap-4 min-w-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="size-11 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Wrench className="size-5" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-base md:text-lg font-black uppercase tracking-tight truncate">
                                Où sont mes <span className="text-primary">missions</span>
                            </h2>
                            <p className="text-[9px] text-muted-foreground uppercase tracking-wide truncate">
                                {points.length} intervention(s) active(s) ou en attente positionnée(s)
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => refetch()}
                        className="size-10 shrink-0 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg"
                    >
                        <RefreshCcw className={cn('size-4', (isLoading || isFetching) && 'animate-spin')} />
                    </button>
                </div>

                <div className="w-full min-w-0 bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                    <RoleLocationMap
                        points={points}
                        height={480}
                        emptyMessage="Aucune mission active ou en attente n'est actuellement assignée. Les missions résolues n'apparaissent pas sur cette carte."
                    />
                </div>
            </div>
        </DashboardLayout>
    );
};

export default MissionsMap;
