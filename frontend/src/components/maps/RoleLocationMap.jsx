import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Maximize2, Minimize2, LocateFixed } from 'lucide-react';
import { cn } from '../../lib/utils';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export const ROLE_COLORS = {
    admin: '#a855f7',
    fournisseur: '#f59e0b',
    transporteur: '#1CA0DB',
    client: '#10b981',
    banque: '#ef4444',
    technicien: '#6366f1',
};

const makeIcon = (color) => new L.DivIcon({
    html: `<div style="width:16px;height:16px;background:${color};border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.5)"></div>`,
    className: '',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
});

const DEFAULT_CENTER = [9.535, -13.6773]; // Conakry

/** Cadre automatiquement la vue sur tous les points visibles (à chaque changement de la liste). */
const FitBounds = ({ points }) => {
    const map = useMap();
    useEffect(() => {
        if (points.length === 0) return;
        if (points.length === 1) {
            map.setView([points[0].lat, points[0].lng], 13);
            return;
        }
        const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }, [points, map]);
    return null;
};

/** Recentre la carte sur l'ensemble des points au clic. */
const RecenterControl = ({ points }) => {
    const map = useMap();
    if (points.length === 0) return null;
    return (
        <button
            type="button"
            onClick={() => {
                if (points.length === 1) {
                    map.setView([points[0].lat, points[0].lng], 13);
                } else {
                    map.fitBounds(L.latLngBounds(points.map((p) => [p.lat, p.lng])), { padding: [40, 40], maxZoom: 14 });
                }
            }}
            className="absolute bottom-4 right-4 z-[1000] size-9 rounded-xl bg-white text-slate-700 shadow-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
            title="Recentrer sur tous les points"
        >
            <LocateFixed className="size-4" />
        </button>
    );
};

/**
 * Carte réutilisable affichant des points {id, lat, lng, label, sublabel?, role?,
 * precision?, avatarUrl?, extra?: [{label, value}]}. `precision` ('gps' | 'approx')
 * pilote la mention affichée dans le popup — la position est soit un point GPS réel,
 * soit une approximation dérivée de la commune déclarée. Un bouton permet d'agrandir
 * la carte en plein écran pour une meilleure visibilité et un déplacement plus aisé.
 */
const RoleLocationMap = ({ points = [], height = 420, emptyMessage = 'Aucune position disponible pour le moment.' }) => {
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        if (!isFullscreen) return undefined;
        const onKeyDown = (e) => { if (e.key === 'Escape') setIsFullscreen(false); };
        window.addEventListener('keydown', onKeyDown);
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = '';
        };
    }, [isFullscreen]);

    const center = useMemo(() => {
        if (points.length === 0) return DEFAULT_CENTER;
        const lat = points.reduce((s, p) => s + p.lat, 0) / points.length;
        const lng = points.reduce((s, p) => s + p.lng, 0) / points.length;
        return [lat, lng];
    }, [points]);

    if (points.length === 0) {
        return (
            <div style={{ height }} className="w-full rounded-2xl border border-dashed border-border bg-muted/30 flex flex-col items-center justify-center gap-2 text-center px-6">
                <MapPin className="size-6 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">{emptyMessage}</p>
            </div>
        );
    }

    const mapBody = (
        <MapContainer
            center={center}
            zoom={11}
            scrollWheelZoom
            className="h-full w-full"
            style={{ height: '100%', width: '100%' }}
        >
            <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <FitBounds points={points} />
            <RecenterControl points={points} />
            {points.map((p) => (
                <Marker key={p.id} position={[p.lat, p.lng]} icon={makeIcon(ROLE_COLORS[p.role] || '#64748b')}>
                    <Popup>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            {p.avatarUrl && (
                                <img
                                    src={p.avatarUrl}
                                    alt=""
                                    style={{ width: 28, height: 28, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                                />
                            )}
                            <strong>{p.label}</strong>
                        </div>
                        {p.sublabel && <div>{p.sublabel}</div>}
                        {p.extra?.map((e, i) => (
                            <div key={i} style={{ fontSize: 11, opacity: 0.8 }}>{e.label} : {e.value}</div>
                        ))}
                        {p.commune && <div style={{ fontSize: 11, opacity: 0.7 }}>Zone : {p.commune}</div>}
                        <div style={{ fontSize: 10, opacity: 0.6, marginTop: 2 }}>
                            {p.precision === 'gps' ? 'Position GPS en direct' : 'Position approximative (commune déclarée)'}
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );

    if (isFullscreen) {
        return (
            <div className="fixed inset-0 z-[1000] bg-black/60 p-3 sm:p-6 flex flex-col">
                <div className="flex-1 min-h-0 rounded-2xl overflow-hidden relative bg-white shadow-2xl [&_.leaflet-control-container]:!max-w-full">
                    {mapBody}
                    <button
                        type="button"
                        onClick={() => setIsFullscreen(false)}
                        className="absolute top-4 right-4 z-[1000] h-10 px-4 rounded-xl bg-white text-slate-700 shadow-lg border border-slate-200 flex items-center gap-2 text-xs font-bold hover:bg-slate-50 transition-colors"
                    >
                        <Minimize2 className="size-4" /> Réduire
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            style={{ height }}
            className="w-full rounded-2xl overflow-hidden relative [&_.leaflet-container]:!w-full [&_.leaflet-control-container]:!max-w-full"
        >
            {mapBody}
            <button
                type="button"
                onClick={() => setIsFullscreen(true)}
                className={cn(
                    'absolute top-4 right-4 z-[1000] size-9 rounded-xl bg-white text-slate-700 shadow-lg border border-slate-200',
                    'flex items-center justify-center hover:bg-slate-50 transition-colors',
                )}
                title="Agrandir la carte"
            >
                <Maximize2 className="size-4" />
            </button>
        </div>
    );
};

export default RoleLocationMap;
