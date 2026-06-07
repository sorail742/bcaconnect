import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DashboardCard from '../../components/ui/DashboardCard';
import { useAdminLogistics } from '../../hooks/data/useCarrierData';
import { cn } from '../../lib/utils';
import {
    Truck, Package, CheckCircle2, Users, MapPin,
    RefreshCcw, ArrowLeft, Satellite, Activity,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const carrierIcon = (active) => new L.DivIcon({
    html: `<div class="${active ? 'bg-[#FF6600] animate-pulse' : 'bg-blue-500'} rounded-full flex items-center justify-center shadow-lg border-2 border-white" style="width:24px;height:24px;"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M10 17h4V5H2v12h3"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg></div>`,
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
});

const deliveryIcon = new L.DivIcon({
    html: '<div class="bg-emerald-500 rounded-full border-2 border-white shadow-lg" style="width:14px;height:14px;"></div>',
    className: '',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
});

const DEFAULT_CENTER = [9.535, -13.6773];

const STATUS_LABELS = {
    pret: 'En attente',
    ramasse: 'Ramassé',
    en_route: 'En route',
    en_cours: 'En cours',
    livre: 'Livré',
};

const AdminLogistics = () => {
    const navigate = useNavigate();
    const { data, isLoading, refetch, isFetching } = useAdminLogistics();

    const stats = data?.stats || {};
    const carriers = data?.carriers || [];
    const activeOrders = data?.active_orders || [];
    const pendingOrders = data?.pending_orders || [];

    const mapCenter = useMemo(() => {
        const positioned = carriers.filter((c) => c.location);
        if (positioned.length === 0) return DEFAULT_CENTER;
        const lat = positioned.reduce((s, c) => s + c.location.lat, 0) / positioned.length;
        const lng = positioned.reduce((s, c) => s + c.location.lng, 0) / positioned.length;
        return [lat, lng];
    }, [carriers]);

    const kpiCards = [
        { title: 'En attente', value: String(stats.pret ?? 0), icon: Package },
        { title: 'En transit', value: String(stats.active ?? 0), icon: Truck },
        { title: 'Livrées jour', value: String(stats.livre_today ?? 0), icon: CheckCircle2 },
        { title: 'GPS actifs', value: `${stats.carriers_online ?? 0}/${stats.total_carriers ?? 0}`, icon: Users },
    ];

    return (
        <DashboardLayout title="LOGISTIQUE RÉSEAU" noPadding>
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
                            <Satellite className="size-5" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-base md:text-lg font-black uppercase tracking-tight truncate">
                                Centre <span className="text-primary">Logistique</span>
                            </h2>
                            <p className="text-[9px] text-muted-foreground uppercase tracking-wide truncate">
                                Flotte temps réel · refresh 30 s
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

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 min-w-0">
                    {kpiCards.map((card, i) => (
                        <DashboardCard key={i} {...card} className="min-w-0" />
                    ))}
                </div>

                {/* Carte pleine largeur */}
                <div className="w-full min-w-0 bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                    <div className="px-4 py-3 border-b border-border flex flex-wrap items-center gap-2 min-w-0">
                        <MapPin className="size-4 text-primary shrink-0" />
                        <span className="text-[10px] font-black uppercase tracking-wide truncate">Carte flotte Conakry</span>
                        <span className="text-[9px] text-muted-foreground ml-auto shrink-0">
                            {carriers.filter((c) => c.location).length} GPS
                        </span>
                    </div>
                    <div className="h-[360px] md:h-[420px] w-full max-w-full overflow-hidden relative [&_.leaflet-container]:!w-full [&_.leaflet-container]:!max-w-full [&_.leaflet-control-container]:!max-w-full">
                        <MapContainer
                            center={mapCenter}
                            zoom={12}
                            className="h-full w-full"
                            style={{ height: '100%', width: '100%' }}
                        >
                            <TileLayer
                                attribution='&copy; OpenStreetMap'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {carriers.filter((c) => c.location).map((carrier) => (
                                <Marker
                                    key={carrier.id}
                                    position={[carrier.location.lat, carrier.location.lng]}
                                    icon={carrierIcon(carrier.active_deliveries > 0)}
                                >
                                    <Popup>
                                        <strong>{carrier.nom_complet}</strong><br />
                                        Missions : {carrier.active_deliveries}<br />
                                        Livrées : {carrier.completed}
                                    </Popup>
                                </Marker>
                            ))}
                            {activeOrders.filter((o) => o.lastPosition).map((order) => (
                                <Marker
                                    key={`pos-${order.id}`}
                                    position={[order.lastPosition.lat, order.lastPosition.lng]}
                                    icon={deliveryIcon}
                                >
                                    <Popup>
                                        #{order.id.slice(0, 8)}<br />
                                        {STATUS_LABELS[order.statut_livraison]}
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </div>
                </div>

                {/* Panneaux empilés — plus de colonne étroite */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
                    <div className="min-w-0 bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                            <Users className="size-4 text-primary shrink-0" />
                            <span className="text-[10px] font-black uppercase">Transporteurs</span>
                        </div>
                        <div className="p-3 space-y-2 max-h-[280px] overflow-y-auto">
                            {carriers.length === 0 && (
                                <p className="text-center text-[10px] text-muted-foreground py-6">Aucun transporteur</p>
                            )}
                            {carriers.map((c) => (
                                <div key={c.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 p-3 rounded-xl bg-muted/50">
                                    <div className="min-w-0 overflow-hidden">
                                        <p className="text-xs font-bold truncate">{c.nom_complet}</p>
                                        <p className="text-[9px] text-muted-foreground truncate">
                                            {c.metadata_transporteur?.type_vehicule || 'Véhicule N/A'}
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className={cn(
                                            'text-[9px] font-black uppercase',
                                            c.location ? 'text-emerald-500' : 'text-muted-foreground',
                                        )}>
                                            {c.location ? 'GPS' : 'Off'}
                                        </p>
                                        <p className="text-[9px] text-muted-foreground">
                                            {c.active_deliveries}/{c.completed}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="min-w-0 bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                            <Activity className="size-4 text-amber-500 shrink-0" />
                            <span className="text-[10px] font-black uppercase">En attente</span>
                        </div>
                        <div className="p-3 space-y-2 max-h-[280px] overflow-y-auto">
                            {!isLoading && pendingOrders.length === 0 && (
                                <p className="text-center text-[10px] text-muted-foreground py-6">Aucune commande</p>
                            )}
                            {pendingOrders.map((order) => (
                                <div key={order.id} className="p-3 rounded-xl bg-muted/30 space-y-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 min-w-0">
                                        <span className="text-[9px] font-black text-amber-500 uppercase shrink-0">
                                            #{order.id?.slice(0, 8)}
                                        </span>
                                        <span className="text-[9px] font-bold tabular-nums shrink-0">
                                            {parseFloat(order.frais_port || 0).toLocaleString('fr-GN')} GNF
                                        </span>
                                    </div>
                                    <p className="text-[9px] text-muted-foreground truncate normal-case">
                                        {order.adresse_livraison}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="min-w-0 bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                        <Truck className="size-4 text-primary shrink-0" />
                        <span className="text-[10px] font-black uppercase">Livraisons en cours</span>
                        <span className="ml-auto text-[9px] text-muted-foreground">{activeOrders.length}</span>
                    </div>
                    <div className="p-3 space-y-2">
                        {!isLoading && activeOrders.length === 0 && (
                            <p className="text-center text-[10px] text-muted-foreground py-12">Aucune livraison active</p>
                        )}
                        {activeOrders.map((order) => (
                            <div key={order.id} className="grid grid-cols-1 sm:grid-cols-[auto_1fr_auto] gap-2 sm:gap-4 p-3 rounded-xl bg-muted/30 items-start sm:items-center min-w-0">
                                <span className="text-[9px] font-black text-primary uppercase shrink-0">
                                    #{order.id?.slice(0, 8)}
                                </span>
                                <div className="min-w-0 overflow-hidden">
                                    <p className="text-[10px] font-semibold truncate">
                                        {order.transporteur?.nom_complet || '—'}
                                    </p>
                                    <p className="text-[9px] text-muted-foreground truncate normal-case">
                                        {order.adresse_livraison}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0 sm:text-right">
                                    <span className={cn(
                                        'text-[9px] font-black uppercase',
                                        order.statut_livraison === 'en_route' ? 'text-amber-500' : 'text-blue-500',
                                    )}>
                                        {STATUS_LABELS[order.statut_livraison] || order.statut_livraison}
                                    </span>
                                    {order.lastPosition && (
                                        <span className="text-[8px] text-emerald-500 font-mono">GPS</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminLogistics;
