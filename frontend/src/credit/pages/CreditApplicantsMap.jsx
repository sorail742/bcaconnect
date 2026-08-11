import React, { useMemo } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import RoleLocationMap from '../../components/maps/RoleLocationMap';
import { useCreditApplicantsMap } from '../../hooks/data/useMapData';
import { Landmark, RefreshCcw } from 'lucide-react';
import { cn } from '../../lib/utils';

const CreditApplicantsMap = () => {
    const { data, isLoading, refetch, isFetching } = useCreditApplicantsMap();

    const points = useMemo(() => data.map((u) => ({
        id: u.id,
        lat: u.location.lat,
        lng: u.location.lng,
        label: u.nom_complet,
        commune: u.commune,
        role: 'banque',
        precision: 'approx',
        avatarUrl: u.avatar_url,
        extra: [{ label: 'Crédits', value: u.nb_credits }],
    })), [data]);

    return (
        <DashboardLayout title="CARTE DES EMPRUNTEURS" noPadding>
            <div className="w-full min-w-0 max-w-full overflow-x-hidden box-border px-4 md:px-6 py-4 md:py-6 space-y-6 pb-24">
                <div className="flex items-center justify-between gap-4 min-w-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="size-11 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Landmark className="size-5" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-base md:text-lg font-black uppercase tracking-tight truncate">
                                Répartition des <span className="text-primary">emprunteurs</span>
                            </h2>
                            <p className="text-[9px] text-muted-foreground uppercase tracking-wide truncate">
                                {points.length} client(s) positionné(s) — crédits en attente ou approuvés
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
                        emptyMessage="Aucun emprunteur positionné pour le moment."
                    />
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CreditApplicantsMap;
