import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Search, Package, Truck, CheckCircle2, Clock, MapPin, Radar, Activity, ShieldCheck, ArrowRight, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';
import useSocket from '../../hooks/useSocket';
import { toast } from 'sonner';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { QRCodeSVG } from 'qrcode.react';
import { useTrackOrder } from '../hooks/useDeliveryData';
import { formatRecordDateTime, formatRecordTime, getRecordTimestamp } from '../../lib/dateUtils';

const CONAKRY_DEFAULT = { lat: 9.5350, lng: -13.6773 };

// Fix leaflet icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom truck icon
const truckIcon = new L.DivIcon({
    html: `<div class="bg-emerald-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white" style="width: 30px; height: 30px;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5"/><path d="M14 17h1"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg></div>`,
    className: '',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
});

// Marqueur "vous" — position réelle du client (géolocalisation navigateur)
const userIcon = new L.DivIcon({
    html: `<div style="width: 20px; height: 20px; border-radius: 50%; background: #1CA0DB; border: 3px solid white; box-shadow: 0 0 0 4px rgba(37,99,235,0.25), 0 2px 6px rgba(0,0,0,0.3);"></div>`,
    className: '',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
});

// Component to center map on live location
function MapUpdater({ center }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom(), { animate: true });
    }, [center, map]);
    return null;
}

const DeliveryTracking = () => {
    const [searchParams] = useSearchParams();
    const urlOrderId = searchParams.get('orderId');
    
    const [trackingNumber, setTrackingNumber] = useState(urlOrderId || '');
    const [activeSearch, setActiveSearch] = useState(urlOrderId || '');
    const [liveLocation, setLiveLocation] = useState(CONAKRY_DEFAULT);
    const [myLocation, setMyLocation] = useState(null);
    const [geoDenied, setGeoDenied] = useState(false);

    // Géolocalisation temps réel du client (avec autorisation navigateur)
    useEffect(() => {
        if (!navigator.geolocation) return;
        const watchId = navigator.geolocation.watchPosition(
            (pos) => setMyLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            (err) => { if (err.code === err.PERMISSION_DENIED) setGeoDenied(true); },
            { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
        );
        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    const { data: trackingData, isFetching: isSearching, error: queryError, refetch } = useTrackOrder(activeSearch, !!activeSearch?.trim());
    const searchError = queryError?.response?.data?.message || (queryError ? 'Commande introuvable ou erreur de chargement.' : null);

    const { on, off } = useSocket();

    const isInTransit = useMemo(() => {
        const s = trackingData?.statut_livraison || trackingData?.statut;
        return ['en_route', 'en_cours', 'ramasse'].includes(s);
    }, [trackingData]);

    const isDelivered = useMemo(() => {
        const s = trackingData?.statut_livraison || trackingData?.statut;
        return s === 'livre';
    }, [trackingData]);

    const isLate = useMemo(() => {
        if (!trackingData?.date_livraison_prevue || isDelivered) return false;
        return new Date(trackingData.date_livraison_prevue) < new Date();
    }, [trackingData, isDelivered]);

    // Position réelle depuis l'API
    useEffect(() => {
        if (trackingData?.lastPosition) {
            setLiveLocation({
                lat: trackingData.lastPosition.latitude,
                lng: trackingData.lastPosition.longitude
            });
        } else if (trackingData?.history?.length) {
            const gpsLog = [...trackingData.history].reverse().find(h => h.latitude != null && h.longitude != null);
            if (gpsLog) {
                setLiveLocation({ lat: parseFloat(gpsLog.latitude), lng: parseFloat(gpsLog.longitude) });
            }
        }
    }, [trackingData]);

    const handleSearch = (id = trackingNumber) => {
        const targetId = id?.trim();
        if (!targetId) return;
        setActiveSearch(targetId);
    };

    // Socket temps réel GPS
    useEffect(() => {
        if (!on || !trackingData?.id) return;
        const handleTrackingUpdate = (payload) => {
            if (payload.orderId === trackingData.id && payload.latitude && payload.longitude) {
                setLiveLocation({ lat: payload.latitude, lng: payload.longitude });
            }
        };
        const handleNotif = (notif) => {
            if (notif.type === 'order' || notif.message?.includes(trackingData.id.slice(0, 8))) {
                refetch();
            }
        };
        on('delivery_tracking_update', handleTrackingUpdate);
        on('notification_received', handleNotif);
        return () => {
            off('delivery_tracking_update', handleTrackingUpdate);
            off('notification_received', handleNotif);
        };
    }, [on, off, trackingData?.id, refetch]);

    useEffect(() => {
        if (urlOrderId) handleSearch(urlOrderId);
    }, [urlOrderId]);

    useEffect(() => {
        if (queryError) toast.error(searchError);
    }, [queryError, searchError]);

    const getTimeline = () => {
        if (!trackingData) return [];
        const history = trackingData.history || [];

        // `key` = valeur(s) réelles de statut_livraison/historique associées à l'étape.
        // ⚠️ "En Transit" couvre 'ramasse' (pris en charge) ET 'en_route' (en déplacement) —
        // 'en_cours' n'est jamais réellement utilisé comme statut_livraison par le backend.
        const baseTimeline = [
            { label: 'Paiement Validé', desc: 'Commande confirmée', key: ['payé'], color: 'primary' },
            { label: 'En Préparation', desc: 'Préparation par le vendeur', key: ['en_préparation', 'pret'], color: 'primary' },
            { label: 'En Transit', desc: 'Pris en charge par BCA Logistics', key: ['ramasse', 'en_route'], color: 'primary' },
            { label: 'Livré', desc: 'Colis remis au destinataire', key: ['livre'], color: 'emerald' },
        ];

        return baseTimeline.map(step => {
            const historyLog = history.find(h => step.key.includes(h.statut));
            return {
                ...step,
                done: historyLog || (step.key.includes('payé') && trackingData.statut !== 'en_attente_paiement'),
                active: step.key.includes(trackingData.statut_livraison) || step.key.includes(trackingData.statut),
                date: historyLog ? formatRecordDateTime(historyLog) : null
            };
        });
    };

    return (
        <DashboardLayout 
            title="Suivi Logistique"
            noPadding={!trackingData && !isSearching}
            noFooter={!trackingData && !isSearching}
        >
            <div className={cn(
                "font-jakarta flex flex-col",
                (!trackingData && !isSearching) ? "h-[calc(100vh-56px)]" : "max-w-5xl mx-auto space-y-6 pb-20"
            )}>

                {/* Header Context */}
                <div className={cn(
                    "bg-card border border-border rounded-[2rem] p-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0",
                    (!trackingData && !isSearching) && "mx-4 md:mx-6 mt-4 md:mt-6"
                )}>
                    <div className="flex items-center gap-5">
                        <div className="size-16 rounded-2xl bg-[#1CA0DB]/10 border border-[#1CA0DB]/20 flex items-center justify-center text-[#1CA0DB]">
                            <Radar className="size-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-foreground leading-tight tracking-tighter uppercase">Terminal de Suivi Logistique</h2>
                            <div className="flex items-center gap-2 mt-2">
                                <Activity className="size-4 text-emerald-500 animate-pulse" />
                                <p className="text-[11px] text-muted-foreground font-black uppercase tracking-widest">Synchronisation active (Temps réel)</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search Engine */}
                <div className={cn(
                    "bg-card border border-border rounded-[2rem] p-8 shadow-2xl space-y-6 shrink-0",
                    (!trackingData && !isSearching) ? "mx-4 md:mx-6 mt-6" : ""
                )}>
                    <div>
                        <h3 className="text-xl font-black text-foreground tracking-tighter uppercase">Localiser un colis</h3>
                        <p className="text-sm text-muted-foreground mt-1 font-medium">Saisissez votre matricule de commande pour obtenir les informations de transit.</p>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-muted-foreground group-focus-within:text-[#1CA0DB] transition-colors" />
                            <input
                                className="w-full h-16 pl-14 pr-6 bg-muted/50 border-2 border-border rounded-2xl text-base outline-none focus:border-[#1CA0DB] transition-all text-foreground font-black tracking-widest uppercase placeholder:normal-case placeholder:font-medium placeholder:tracking-normal"
                                placeholder="Numéro de suivi (ex: ORD-569C42B5)"
                                value={trackingNumber}
                                onChange={e => setTrackingNumber(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <button
                            onClick={() => handleSearch()}
                            disabled={isSearching}
                            className="h-16 px-10 bg-[#1CA0DB] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-60 hover:scale-[1.02] active:scale-95"
                        >
                            {isSearching ? <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Radar className="size-6" />}
                            Rechercher
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                {trackingData ? (
                    <div className="mt-6 font-jakarta min-h-[400px]">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                        >
                            {/* Info Column */}
                            <div className="space-y-6">
                                <div className="bg-card border border-border rounded-[2rem] p-8 shadow-2xl space-y-8 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 size-32 bg-[#1CA0DB]/5 rounded-full -mr-16 -mt-16" />
                                    <div className="flex items-center justify-between pb-6 border-b border-border">
                                        <h4 className="text-lg font-black text-foreground uppercase tracking-tighter">Statut Actuel</h4>
                                        <span className={cn(
                                            "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md",
                                            trackingData.statut_livraison === 'livre' ? "bg-emerald-500 text-white" : "bg-[#1CA0DB] text-white"
                                        )}>
                                            {(trackingData.statut_livraison || trackingData.statut).replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="flex items-start gap-4">
                                            <div className="size-12 rounded-2xl bg-muted flex items-center justify-center shrink-0 border border-border">
                                                <MapPin className="size-5 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">Destinataire</p>
                                                <p className="text-base font-black text-foreground leading-tight">{trackingData.nom_destinataire}</p>
                                                <p className="text-sm text-muted-foreground mt-1 font-medium">{trackingData.adresse_livraison}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="size-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                                                <Truck className="size-5 text-emerald-500" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">Transporteur</p>
                                                <p className="text-base font-black text-foreground">BCA Logistics Hub</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-5 bg-muted/50 rounded-2xl border border-border text-center space-y-2">
                                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Référence Unique</p>
                                        <p className="text-lg font-black text-foreground uppercase tracking-widest">#{trackingData.trackingRef || trackingData.id.slice(0, 8)}</p>
                                    </div>

                                    {trackingData.date_livraison_prevue && !isDelivered && (
                                        <div className={cn(
                                            'p-5 rounded-2xl border text-center space-y-1.5',
                                            isLate ? 'bg-rose-500/10 border-rose-500/20' : 'bg-blue-500/10 border-blue-500/20'
                                        )}>
                                            <div className="flex justify-center mb-1">
                                                {isLate
                                                    ? <AlertTriangle className="size-6 text-rose-500" />
                                                    : <Clock className="size-6 text-blue-500" />}
                                            </div>
                                            <p className={cn(
                                                'text-[10px] font-black uppercase tracking-widest',
                                                isLate ? 'text-rose-600 dark:text-rose-400' : 'text-blue-600 dark:text-blue-400'
                                            )}>
                                                {isLate ? 'Livraison en retard' : 'Livraison prévue avant le'}
                                            </p>
                                            <p className="text-lg font-black text-foreground">
                                                {new Date(trackingData.date_livraison_prevue).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                            </p>
                                        </div>
                                    )}

                                    {trackingData.delivery_otp && (
                                        <div className="p-5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-center space-y-3 relative overflow-hidden">
                                            <div className="absolute -top-10 -right-10 size-24 bg-emerald-500/10 blur-xl rounded-full" />
                                            <div className="flex justify-center mb-1">
                                                <ShieldCheck className="size-6 text-emerald-500" />
                                            </div>
                                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-widest">Code de Livraison (OTP)</p>
                                            <p className="text-3xl font-black text-emerald-500 tracking-[0.5em] relative z-10">{trackingData.delivery_otp}</p>
                                            <div className="flex justify-center relative z-10">
                                                <div className="p-3 bg-white rounded-xl shadow-sm">
                                                    <QRCodeSVG value={trackingData.delivery_otp} size={128} />
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground font-medium mt-2 relative z-10">
                                                Présentez ce code (ou faites-le scanner) au livreur à la réception de votre colis.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Live Tracking Radar (En transit) */}
                                {isInTransit && (
                                    <div className="bg-card border border-border rounded-[2rem] p-6 shadow-2xl relative overflow-hidden flex flex-col items-center text-center space-y-4">
                                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent opacity-50" />
                                        <div className="flex items-center gap-2">
                                            <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <h4 className="text-xs font-black text-emerald-500 uppercase tracking-widest">Localisation GPS Active</h4>
                                        </div>
                                        
                                        {/* The Map */}
                                        <div className="w-full h-48 rounded-xl overflow-hidden shadow-inner my-2 border border-border relative z-10" style={{ zIndex: 10 }}>
                                            <MapContainer center={[liveLocation.lat, liveLocation.lng]} zoom={15} scrollWheelZoom={false} style={{ width: '100%', height: '100%', zIndex: 0 }}>
                                                <TileLayer
                                                    attribution='&copy; OpenStreetMap'
                                                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                                                />
                                                <Marker position={[liveLocation.lat, liveLocation.lng]} icon={truckIcon}>
                                                    <Popup>
                                                        <div className="text-center font-jakarta">
                                                            <p className="font-bold text-xs uppercase">BCA Transporteur</p>
                                                            <p className="text-[10px] text-muted-foreground mt-1">Colis en approche</p>
                                                        </div>
                                                    </Popup>
                                                </Marker>
                                                {myLocation && (
                                                    <Marker position={[myLocation.lat, myLocation.lng]} icon={userIcon}>
                                                        <Popup>
                                                            <div className="text-center font-jakarta">
                                                                <p className="font-bold text-xs uppercase">Vous</p>
                                                            </div>
                                                        </Popup>
                                                    </Marker>
                                                )}
                                                <MapUpdater center={[liveLocation.lat, liveLocation.lng]} />
                                            </MapContainer>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 w-full relative z-10">
                                            <div className="bg-muted/80 backdrop-blur-sm rounded-xl p-3 border border-border">
                                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">Coordonnées</p>
                                                <p className="text-xs font-black text-foreground font-mono">{liveLocation.lat.toFixed(4)}, {liveLocation.lng.toFixed(4)}</p>
                                            </div>
                                            <div className="bg-muted/80 backdrop-blur-sm rounded-xl p-3 border border-border">
                                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">Dernière MAJ</p>
                                                <p className="text-xs font-black text-foreground font-mono">
                                                    {getRecordTimestamp(trackingData.lastPosition)
                                                        ? formatRecordTime(trackingData.lastPosition)
                                                        : 'En direct'}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground font-medium relative z-10">Position transmise par le transporteur BCA</p>
                                    </div>
                                )}

                                {/* Fin Info Column */}
                            </div>

                            {/* Progression Column */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-card border border-border rounded-[2rem] p-8 shadow-2xl">
                                    <h4 className="text-xl font-black text-foreground uppercase tracking-tighter pb-6 border-b border-border mb-8">Flux d'Acheminement</h4>
                                    <div className="relative space-y-10 pl-2">
                                        <div className="absolute left-[29px] top-6 bottom-6 w-1 bg-muted rounded-full" />
                                        {getTimeline().map((step, idx) => (
                                            <div key={idx} className={cn("relative flex items-start gap-6 transition-all duration-500", !step.done && !step.active && "opacity-40")}>
                                                <div className={cn(
                                                    "size-12 rounded-2xl flex items-center justify-center border-4 relative z-10 shrink-0 shadow-lg",
                                                    step.active ? "bg-[#1CA0DB] border-[#1CA0DB]/20 text-white scale-110" :
                                                    step.done ? "bg-emerald-500 text-white border-transparent" :
                                                    "bg-muted border-transparent text-muted-foreground"
                                                )}>
                                                    {step.done ? <CheckCircle2 className="size-6" /> : <Clock className="size-5" />}
                                                </div>
                                                <div className="flex-1 pt-1.5">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                        <div>
                                                            <p className={cn("text-lg font-black uppercase tracking-tighter", step.active ? "text-[#1CA0DB]" : "text-foreground")}>{step.label}</p>
                                                            <p className="text-sm text-muted-foreground mt-1 font-medium">{step.desc}</p>
                                                        </div>
                                                        {step.date && (
                                                            <span className="text-[10px] font-black text-muted-foreground bg-muted px-4 py-2 rounded-xl whitespace-nowrap uppercase tracking-widest">
                                                                {step.date}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Detailed History Log */}
                                {trackingData.history && trackingData.history.length > 0 && (
                                    <div className="bg-card border border-border rounded-[2rem] p-8 shadow-2xl">
                                        <h4 className="text-xl font-black text-foreground uppercase tracking-tighter pb-4 border-b border-border mb-6">Logs du Système</h4>
                                        <div className="space-y-4">
                                            {[...trackingData.history].reverse().map((log) => (
                                                <div key={log.id || `${log.statut}-${getRecordTimestamp(log)?.getTime()}`} className="flex gap-5 p-5 rounded-2xl bg-muted/30 border border-border">
                                                    <div className="text-sm font-black text-[#1CA0DB] pt-0.5 w-14 shrink-0">
                                                        {formatRecordTime(log)}
                                                    </div>
                                                    <div>
                                                        <p className="text-base font-black text-foreground uppercase tracking-widest">{log.statut.replace(/_/g, ' ')}</p>
                                                        <p className="text-xs text-muted-foreground mt-1 font-medium">{log.commentaire || "Mise à jour automatique du point de contrôle."}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                ) : !isSearching && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="relative flex-1 w-full mt-6 bg-muted z-0 border-t border-border"
                    >
                        <div className="absolute inset-0">
                            <MapContainer center={[myLocation?.lat ?? liveLocation.lat, myLocation?.lng ?? liveLocation.lng]} zoom={myLocation ? 15 : 13} scrollWheelZoom={true} style={{ width: '100%', height: '100%', zIndex: 0 }}>
                                <TileLayer
                                    attribution='&copy; OpenStreetMap'
                                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                                />
                                {myLocation && (
                                    <Marker position={[myLocation.lat, myLocation.lng]} icon={userIcon}>
                                        <Popup>
                                            <div className="text-center font-jakarta">
                                                <p className="font-bold text-xs uppercase">Vous</p>
                                            </div>
                                        </Popup>
                                    </Marker>
                                )}
                                <MapUpdater center={[myLocation?.lat ?? liveLocation.lat, myLocation?.lng ?? liveLocation.lng]} />
                            </MapContainer>
                        </div>
                        {geoDenied && (
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-card border border-border rounded-xl px-4 py-2 shadow-lg text-[11px] font-bold text-muted-foreground flex items-center gap-2">
                                <MapPin className="size-3.5 text-amber-500" />
                                Localisation refusée — activez-la pour voir votre position sur la carte.
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default DeliveryTracking;
