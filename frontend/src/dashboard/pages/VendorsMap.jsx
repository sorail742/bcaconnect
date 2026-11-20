import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import RoleLocationMap from '../../components/maps/RoleLocationMap';
import { useMyVendorsMap } from '../../hooks/data/useMapData';
import { Store, RefreshCcw } from 'lucide-react';
import { cn } from '../../lib/utils';

const VendorsMap = () => {
    const { data, isLoading, refetch, isFetching } = useMyVendorsMap();

    const points = useMemo(() => data.map((s) => ({
        id: s.id,
        lat: s.location.lat,
        lng: s.location.lng,
        label: s.nom_boutique,
        sublabel: s.is_verified ? 'Boutique certifiée' : undefined,
        commune: s.commune,
        role: 'fournisseur',
        precision: 'approx',
        avatarUrl: s.logo_url,
        extra: s.categorie_principale ? [{ label: 'Catégorie', value: s.categorie_principale }] : [],
    })), [data]);

    return (
        <DashboardLayout title="CARTE DE MES MARCHANDS" noPadding>
            <div className="w-full min-w-0 max-w-full overflow-x-hidden box-border px-4 md:px-6 py-4 md:py-6 space-y-6 pb-24">
                <div className="flex items-center justify-between gap-4 min-w-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="size-11 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Store className="size-5" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-base md:text-lg font-black uppercase tracking-tight truncate">
                                Où sont mes <span className="text-primary">marchands</span>
                            </h2>
                            <p className="text-[9px] text-muted-foreground uppercase tracking-wide truncate">
                                {points.length} boutique(s) positionnée(s) sur {data.length} chez qui vous avez commandé
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
                        emptyMessage="Aucun marchand positionné pour le moment. Passez une première commande pour voir vos fournisseurs apparaître ici."
                    />
                </div>

                {data.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
                        {data.map((s) => (
                            <Link
                                key={s.id}
                                to={`/shop/${s.slug}`}
                                className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl hover:border-primary/40 transition-colors min-w-0"
                            >
                                <div className="size-10 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                                    {s.logo_url ? <img src={s.logo_url} alt="" className="size-full object-contain" /> : <Store className="size-4 text-muted-foreground" />}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold truncate">{s.nom_boutique}</p>
                                    <p className="text-[10px] text-muted-foreground truncate">{s.commune || 'Zone inconnue'}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default VendorsMap;
