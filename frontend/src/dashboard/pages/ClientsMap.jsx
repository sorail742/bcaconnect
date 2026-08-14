import React, { useMemo } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import RoleLocationMap from '../../components/maps/RoleLocationMap';
import { useMyClientsMap } from '../../hooks/data/useMapData';
import { Users, RefreshCcw } from 'lucide-react';
import { cn } from '../../lib/utils';

const ClientsMap = () => {
    const { data, isLoading, refetch, isFetching } = useMyClientsMap();

    const points = useMemo(() => data.map((c) => ({
        id: c.id,
        lat: c.location.lat,
        lng: c.location.lng,
        label: c.nom_complet,
        commune: c.commune,
        role: 'client',
        precision: 'approx',
        avatarUrl: c.avatar_url,
    })), [data]);

    return (
        <DashboardLayout title="CARTE DE MES CLIENTS" noPadding>
            <div className="w-full min-w-0 max-w-full overflow-x-hidden box-border px-4 md:px-6 py-4 md:py-6 space-y-6 pb-24">
                <div className="flex items-center justify-between gap-4 min-w-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="size-11 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Users className="size-5" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-base md:text-lg font-black uppercase tracking-tight truncate">
                                Où sont mes <span className="text-primary">clients</span>
                            </h2>
                            <p className="text-[9px] text-muted-foreground uppercase tracking-wide truncate">
                                {points.length} client(s) positionné(s) sur {data.length} acheteur(s) distinct(s)
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
                        emptyMessage="Aucun client positionné pour le moment. La position est estimée à partir de l'adresse déclarée par chaque acheteur."
                    />
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ClientsMap;
