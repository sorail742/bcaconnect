import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DashboardCard from '../../components/ui/DashboardCard';
import DataTable from '../../components/ui/DataTable';
import {
    ClipboardList,
    Truck,
    CheckCircle2,
    Hourglass,
    Activity,
    RefreshCcw,
    Shield,
    Globe,
    Box,
    PackageSearch,
    UserCheck,
    Play,
    Flag,
    Leaf
} from 'lucide-react';
import useSocket from '../../hooks/useSocket';
import OtpVerificationModal from '../../components/carrier/OtpVerificationModal';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { 
    useAvailableDeliveries, 
    useMyDeliveries,
    useCompletedDeliveries,
    useJourneyHistory,
    useAssignDelivery, 
    useUpdateTracking,
    useGroupOrders,
    useMyGroups,
    useCarrierStats
} from '../../hooks/data/useCarrierData';
import { DataStateWrapper } from '../../components/ui/DataStates';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useLanguage } from '../../context/LanguageContext';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const carrierIcon = new L.DivIcon({
    html: `<div class="bg-[#FF6600] rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-pulse" style="width: 28px; height: 28px;"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M10 17h4V5H2v12h3"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg></div>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14]
});

const DEFAULT_COORDS = { lat: 9.535, lng: -13.6773 };
const GPS_INTERVAL_MS = 30_000;
const GPS_MIN_METERS = 50;

const distanceMeters = (a, b) => {
    const R = 6371000;
    const dLat = (b.lat - a.lat) * Math.PI / 180;
    const dLng = (b.lng - a.lng) * Math.PI / 180;
    const x = Math.sin(dLat / 2) ** 2
        + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(x));
};

const MapRecenter = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
};

const CarrierDashboard = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('AVAILABLE');
    const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [selectedOrderIds, setSelectedOrderIds] = useState([]);
    const [carrierPosition, setCarrierPosition] = useState(DEFAULT_COORDS);
    const [activeJourneyId, setActiveJourneyId] = useState(null);
    const watchRef = useRef(null);
    const lastGpsRef = useRef({ time: 0, lat: 0, lng: 0 });

    const { data: availableDeliveries = [], isLoading: loadingAvailable, error: errorAvailable, refetch: refetchAvailable, isFetching: fetchingAvailable } = useAvailableDeliveries();
    const { data: myDeliveries = [], isLoading: loadingMine, error: errorMine, refetch: refetchMine, isFetching: fetchingMine } = useMyDeliveries();
    const { data: completedDeliveries = [], isLoading: loadingCompleted, refetch: refetchCompleted, isFetching: fetchingCompleted } = useCompletedDeliveries();
    const { data: myGroups = [], isLoading: loadingGroups, error: errorGroups, refetch: refetchGroups, isFetching: fetchingGroups } = useMyGroups();
    const { data: carrierStats, refetch: refetchStats } = useCarrierStats();
    const { data: journeyHistory = [] } = useJourneyHistory(activeJourneyId);

    const assignMutation = useAssignDelivery();
    const trackingMutation = useUpdateTracking();
    const groupMutation = useGroupOrders();
    const { on, off } = useSocket();

    const isLoading = loadingAvailable || loadingMine || loadingGroups || loadingCompleted;
    const isFetching = fetchingAvailable || fetchingMine || fetchingGroups || fetchingCompleted;
    const queryError = errorAvailable || errorMine || errorGroups;

    const refetchAll = useCallback(() => {
        refetchAvailable();
        refetchMine();
        refetchCompleted();
        refetchGroups();
        refetchStats();
    }, [refetchAvailable, refetchMine, refetchCompleted, refetchGroups, refetchStats]);

    const activeTabData = activeTab === 'AVAILABLE'
        ? availableDeliveries
        : activeTab === 'MINE'
            ? myDeliveries
            : activeTab === 'COMPLETED'
                ? completedDeliveries
                : myGroups;

    const activeMission = useMemo(
        () => myDeliveries.find((d) => d.id === activeJourneyId),
        [myDeliveries, activeJourneyId],
    );

    const routePoints = useMemo(() => journeyHistory
        .filter((h) => h.latitude != null && h.longitude != null)
        .map((h) => [parseFloat(h.latitude), parseFloat(h.longitude)]),
    [journeyHistory]);

    const stats = {
        assigned: String(carrierStats?.assigned ?? myDeliveries.length),
        inProgress: String(carrierStats?.inProgress ?? myDeliveries.filter(d => ['en_route', 'en_cours'].includes(d.statut_livraison)).length),
        completed: String(carrierStats?.completed ?? '0'),
        available: String(carrierStats?.available ?? availableDeliveries.length),
    };

    const getCurrentPosition = useCallback(() => new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Géolocalisation non supportée'));
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            reject,
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }), []);

    useEffect(() => {
        getCurrentPosition()
            .then(setCarrierPosition)
            .catch(() => toast.warning('GPS indisponible — position Conakry par défaut'));
    }, [getCurrentPosition]);

    useEffect(() => {
        if (!on) return;
        const handleUpdate = () => {
            refetchAvailable();
            refetchMine();
            refetchStats();
        };
        const handleNewDelivery = () => {
            toast.info('Nouvelle livraison disponible !');
            refetchAvailable();
            refetchStats();
        };
        on('notification_received', handleUpdate);
        on('order_status_updated', handleUpdate);
        on('delivery_available', handleNewDelivery);
        return () => {
            off('notification_received', handleUpdate);
            off('order_status_updated', handleUpdate);
            off('delivery_available', handleNewDelivery);
        };
    }, [on, off, refetchAvailable, refetchMine, refetchStats]);

    useEffect(() => () => {
        if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
    }, []);

    const pushTrackingUpdate = useCallback(async (orderId, status, commentaire) => {
        try {
            const coords = await getCurrentPosition();
            setCarrierPosition(coords);
            trackingMutation.mutate({
                orderId,
                latitude: coords.lat,
                longitude: coords.lng,
                status,
                commentaire
            });
        } catch {
            trackingMutation.mutate({ orderId, status, commentaire });
            toast.warning('Position GPS non transmise — statut mis à jour sans coordonnées');
        }
    }, [getCurrentPosition, trackingMutation]);

    const handleAssign = async (orderId) => {
        assignMutation.mutate(orderId, { onSuccess: () => setActiveTab('MINE') });
    };

    const handleGroupOrders = () => {
        if (selectedOrderIds.length < 2) {
            toast.error("Veuillez sélectionner au moins 2 livraisons pour les grouper.");
            return;
        }
        groupMutation.mutate(selectedOrderIds, {
            onSuccess: () => {
                setSelectedOrderIds([]);
                setActiveTab('MINE');
            }
        });
    };

    const maybeSendGps = useCallback((orderId, coords) => {
        const now = Date.now();
        const last = lastGpsRef.current;
        const moved = last.lat ? distanceMeters(last, coords) >= GPS_MIN_METERS : true;
        if (now - last.time < GPS_INTERVAL_MS && !moved) return;
        lastGpsRef.current = { time: now, ...coords };
        trackingMutation.mutate({
            orderId,
            latitude: coords.lat,
            longitude: coords.lng,
            status: 'en_route',
            commentaire: 'Position GPS en temps réel',
        });
    }, [trackingMutation]);

    const handleStartJourney = async (orderId) => {
        setActiveJourneyId(orderId);
        lastGpsRef.current = { time: 0, lat: 0, lng: 0 };
        await pushTrackingUpdate(orderId, 'en_route', 'Transporteur en route vers la destination');
        if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
        watchRef.current = navigator.geolocation.watchPosition(
            (pos) => {
                const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setCarrierPosition(coords);
                maybeSendGps(orderId, coords);
            },
            () => {},
            { enableHighAccuracy: true, maximumAge: 30000 }
        );
        toast.success('Trajet démarré — suivi GPS actif');
    };

    const openOtpModal = (orderId) => {
        if (watchRef.current) {
            navigator.geolocation.clearWatch(watchRef.current);
            watchRef.current = null;
        }
        setActiveJourneyId(null);
        setSelectedOrderId(orderId);
        setIsOtpModalOpen(true);
    };

    // Colonnes pour "DISPONIBLES"
    const availableColumns = [
        {
            label: t('carSourceUnit'),
            render: (row) => (
                <span className="font-black text-[#FF6600] uppercase text-[9px] tracking-wide bg-[#FF6600]/5 px-2 py-1 rounded-lg border border-[#FF6600]/10">
                    #{row.id.slice(0, 8).toUpperCase()}
                </span>
            )
        },
        {
            label: t('carPickupZone'),
            render: (row) => (
                <div className="flex flex-col gap-1">
                    <span className="font-black text-slate-800 dark:text-foreground text-[10px] uppercase">{t('carSourceShop')}</span>
                    <span className="text-[8px] text-muted-foreground font-black uppercase tracking-widest truncate max-w-[150px]">
                        {row.details?.[0]?.produit?.nom_produit || row.adresse_livraison?.split(',')[0] || 'ZONE N/A'}
                    </span>
                </div>
            )
        },
        {
            label: t('carTargetPerimeter'),
            render: (row) => (
                <div className="max-w-[200px] truncate font-black text-muted-foreground text-[9px] uppercase tracking-widest" title={row.adresse_livraison}>
                    {row.adresse_livraison}
                </div>
            )
        },
        {
            label: 'FRAIS',
            render: (row) => (
                <span className="text-[10px] font-black text-emerald-500 tabular-nums">
                    {parseFloat(row.frais_port || 0).toLocaleString('fr-GN')} GNF
                </span>
            ),
        },
        {
            label: t('actions') || 'ACTION',
            render: (row) => (
                <div className="text-right">
                    <button
                        onClick={() => handleAssign(row.id)}
                        disabled={assignMutation.isPending}
                        className="h-8 px-4 bg-[#FF6600] text-foreground text-[9px] font-black rounded-lg transition-all shadow-md active:scale-95 uppercase tracking-widest hover:brightness-110 flex items-center gap-2 ml-auto disabled:opacity-50"
                    >
                        {assignMutation.isPending ? <RefreshCcw className="size-3 animate-spin" /> : <UserCheck className="size-3" />} 
                        {t('carAccept')}
                    </button>
                </div>
            )
        }
    ];

    // Colonnes pour "MES MISSIONS"
    const myMissionsColumns = [
        {
            label: t('id') || 'ID MISSION',
            render: (row) => (
                <span className="font-black text-emerald-500 uppercase text-[9px] tracking-wide bg-emerald-500/5 px-2 py-1 rounded-lg border border-emerald-500/10">
                    #{row.id.slice(0, 8).toUpperCase()}
                </span>
            )
        },
        {
            label: t('carOperationTracking'),
            render: (row) => {
                const status = row.statut_livraison;
                return (
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            "size-1.5 rounded-full",
                            status === 'livre' ? "bg-emerald-500" :
                            status === 'en_route' ? "bg-amber-500 animate-pulse" : "bg-blue-500"
                        )} />
                        <span className={cn(
                            "text-[8px] font-black uppercase tracking-widest",
                            status === 'livre' ? "text-emerald-500" :
                            status === 'en_route' ? "text-amber-500" : "text-blue-500"
                        )}>
                            {status === 'ramasse' ? t('carPackagePicked') : status === 'en_route' ? t('carTransit') : t(`car${status?.charAt(0).toUpperCase() + status?.slice(1)}`) || status?.toUpperCase() || t('carAssigned')}
                        </span>
                    </div>
                );
            }
        },
        {
            label: t('governance') || 'GOUVERNANCE',
            render: (row) => (
                <div className="flex justify-end gap-2">
                    {row.statut_livraison !== 'en_route' && row.statut_livraison !== 'livre' ? (
                        <button
                            onClick={() => handleStartJourney(row.id)}
                            disabled={trackingMutation.isPending}
                            className="h-8 px-4 bg-slate-900 dark:bg-white text-foreground dark:text-slate-900 text-[9px] font-black rounded-lg transition-all uppercase tracking-widest flex items-center gap-2"
                        >
                            {trackingMutation.isPending ? <RefreshCcw className="size-3 animate-spin" /> : <Play className="size-3" />} 
                            {t('carStart')}
                        </button>
                    ) : row.statut_livraison === 'en_route' ? (
                        <button
                            onClick={() => openOtpModal(row.id)}
                            className="h-8 px-4 bg-emerald-500 text-slate-900 text-[9px] font-black rounded-lg transition-all uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-500/10"
                        >
                            <Flag className="size-3" /> {t('carFinish')}
                        </button>
                    ) : (
                        <span className="text-emerald-500 text-[8px] font-black uppercase tracking-widest">{t('carFlowFinished')}</span>
                    )}
                </div>
            )
        }
    ];

    // Colonnes pour "GROUPES"
    const myGroupsColumns = [
        {
            label: 'GROUPE ID',
            render: (row) => (
                <span className="font-black text-[#FF6600] uppercase text-[9px] tracking-wide bg-[#FF6600]/5 px-2 py-1 rounded-lg border border-[#FF6600]/10">
                    #{row.id.slice(0, 8).toUpperCase()}
                </span>
            )
        },
        {
            label: 'COMMANDES',
            render: (row) => (
                <span className="text-[10px] font-black text-foreground">
                    {row.commandes?.length || row.Orders?.length || 0} commandes
                </span>
            )
        },
        {
            label: 'CO2 ÉCONOMISÉ',
            render: (row) => (
                <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">
                    {row.co2_saved || row.carbon_saved_kg || 0} kg CO2
                </span>
            )
        },
        {
            label: t('carOperationTracking') || 'STATUT',
            render: (row) => {
                const status = row.statut;
                return (
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            "size-1.5 rounded-full",
                            status === 'termine' ? "bg-emerald-500" :
                            status === 'en_cours' ? "bg-amber-500 animate-pulse" : "bg-blue-500"
                        )} />
                        <span className={cn(
                            "text-[8px] font-black uppercase tracking-widest",
                            status === 'termine' ? "text-emerald-500" :
                            status === 'en_cours' ? "text-amber-500" : "text-blue-500"
                        )}>
                            {status === 'en_cours' ? t('carTransit') : status === 'termine' ? 'Terminé' : 'En attente'}
                        </span>
                    </div>
                );
            }
        }
    ];

    const completedColumns = [
        {
            label: 'MISSION',
            render: (row) => (
                <span className="font-black text-emerald-500 uppercase text-[9px] tracking-wide bg-emerald-500/5 px-2 py-1 rounded-lg border border-emerald-500/10">
                    #{row.id.slice(0, 8).toUpperCase()}
                </span>
            ),
        },
        {
            label: 'DESTINATION',
            render: (row) => (
                <span className="text-[9px] font-black text-muted-foreground uppercase truncate max-w-[180px] block">
                    {row.adresse_livraison}
                </span>
            ),
        },
        {
            label: 'GAIN',
            render: (row) => (
                <span className="text-[10px] font-black text-primary tabular-nums">
                    +{parseFloat(row.frais_port || 0).toLocaleString('fr-GN')} GNF
                </span>
            ),
        },
        {
            label: 'DATE',
            render: (row) => (
                <span className="text-[9px] text-muted-foreground">
                    {new Date(row.updated_at || row.date_commande).toLocaleDateString('fr-GN')}
                </span>
            ),
        },
    ];

    return (
        <DashboardLayout title={t('carLogCenter')}>
            <div className="space-y-8 animate-in fade-in duration-700 pb-24">

                {/* KPI Area */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <DashboardCard title={t('carMyAssignments')} value={stats.assigned} icon={ClipboardList} className="h-32 border-[#FF6600]/10" />
                    <DashboardCard title={t('carInTransit')} value={stats.inProgress} icon={Truck} className="h-32" />
                    <DashboardCard title={t('carHistory')} value={stats.completed} icon={CheckCircle2} className="h-32" />
                    <DashboardCard title={t('carFreeOffers')} value={stats.available} icon={Hourglass} className="h-32" />
                </div>

                {/* Main Control Panel */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Mission Terminal */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Tab Switcher */}
                        <div className="flex items-center gap-4 bg-white dark:bg-[#0F1219] p-2 rounded-2xl border border-slate-200 dark:border-foreground/5 shadow-sm">
                            <button
                                onClick={() => setActiveTab('AVAILABLE')}
                                className={cn(
                                    "flex-1 h-12 rounded-xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all",
                                    activeTab === 'AVAILABLE' 
                                        ? "bg-[#FF6600] text-foreground shadow-lg shadow-[#FF6600]/20" 
                                        : "text-muted-foreground hover:bg-slate-50 dark:hover:bg-foreground/5"
                                )}
                            >
                                <PackageSearch className="size-4" /> {t('carAvailableMissions')}
                            </button>
                            <button
                                onClick={() => setActiveTab('MINE')}
                                className={cn(
                                    "flex-1 h-12 rounded-xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all",
                                    activeTab === 'MINE' 
                                        ? "bg-slate-900 dark:bg-white text-foreground dark:text-slate-900 shadow-xl shadow-black/10" 
                                        : "text-muted-foreground hover:bg-slate-50 dark:hover:bg-foreground/5"
                                )}
                            >
                                <UserCheck className="size-4" /> {t('carMyLogbook')}
                            </button>
                            <button
                                onClick={() => setActiveTab('COMPLETED')}
                                className={cn(
                                    "flex-1 h-12 rounded-xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all",
                                    activeTab === 'COMPLETED'
                                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                                        : "text-muted-foreground hover:bg-slate-50 dark:hover:bg-foreground/5"
                                )}
                            >
                                <CheckCircle2 className="size-4" /> HISTORIQUE ({completedDeliveries.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('GROUPS')}
                                className={cn(
                                    "flex-1 h-12 rounded-xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all",
                                    activeTab === 'GROUPS' 
                                        ? "bg-slate-700 text-white shadow-lg" 
                                        : "text-muted-foreground hover:bg-slate-50 dark:hover:bg-foreground/5"
                                )}
                            >
                                <Box className="size-4" /> GROUPES ({myGroups.length})
                            </button>
                        </div>

                        {/* List Area */}
                        <div className="bg-white dark:bg-[#0F1219] border border-slate-200 dark:border-foreground/5 rounded-3xl shadow-sm overflow-hidden min-h-[400px]">
                            <div className="p-6 border-b border-slate-100 dark:border-foreground/5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Activity className="size-4 text-primary" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">
                                        {activeTab === 'AVAILABLE' ? t('carLogisticMarket') : t('carOperationTracking')}
                                    </span>
                                </div>
                                <button 
                                    onClick={refetchAll} 
                                    className="size-8 rounded-lg bg-slate-50 dark:bg-foreground/5 flex items-center justify-center text-muted-foreground hover:text-primary transition-all"
                                >
                                    <RefreshCcw className={cn("size-4", (isLoading || isFetching) && "animate-spin")} />
                                </button>
                            </div>

                            <div className="p-4">
                                {activeTab === 'AVAILABLE' && selectedOrderIds.length > 1 && (
                                    <div className="mb-4 flex justify-end">
                                        <button 
                                            onClick={handleGroupOrders}
                                            disabled={groupMutation.isPending}
                                            className="px-6 py-3 bg-[#FF6600] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg flex items-center gap-2"
                                        >
                                            {groupMutation.isPending ? <RefreshCcw className="size-4 animate-spin" /> : <Box className="size-4" />}
                                            Regrouper les commandes sélectionnées ({selectedOrderIds.length})
                                        </button>
                                    </div>
                                )}
                                <DataStateWrapper
                                    isLoading={isLoading}
                                    error={queryError}
                                    onRetry={refetchAll}
                                    isEmpty={!isLoading && !queryError && activeTabData.length === 0}
                                    loadingVariant="table"
                                    emptyMessage={t('carEmptyTerminal') || 'Aucune mission disponible'}
                                >
                                    <DataTable
                                        columns={
                                            activeTab === 'AVAILABLE' ? availableColumns
                                                : activeTab === 'MINE' ? myMissionsColumns
                                                    : activeTab === 'COMPLETED' ? completedColumns
                                                        : myGroupsColumns
                                        }
                                        data={activeTabData}
                                        isLoading={false}
                                        className="bg-transparent border-0"
                                        selectable={activeTab === 'AVAILABLE'}
                                        selectedIds={selectedOrderIds}
                                        onSelectionChange={setSelectedOrderIds}
                                    />
                                </DataStateWrapper>
                            </div>
                        </div>
                    </div>

                    {/* Side Info Panel — Carte GPS Live */}
                    <div className="lg:col-span-4 space-y-6">
                         <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-4 shadow-2xl relative overflow-hidden">
                            <div className="flex items-center justify-between relative z-10">
                                <Globe className="size-6 text-emerald-500" />
                                <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                     <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest animate-pulse">
                                        {activeJourneyId ? t('carGpsActive') : 'GPS STANDBY'}
                                     </span>
                                </div>
                            </div>
                            <div className="space-y-1 relative z-10">
                                <h4 className="text-sm font-black text-white uppercase">{t('carZoneConakry')}</h4>
                                <p className="text-[9px] font-mono text-emerald-400/80">
                                    {carrierPosition.lat.toFixed(5)}, {carrierPosition.lng.toFixed(5)}
                                </p>
                            </div>
                            <div className="aspect-[4/3] rounded-2xl border border-white/10 overflow-hidden relative z-10">
                                <MapContainer
                                    center={[carrierPosition.lat, carrierPosition.lng]}
                                    zoom={14}
                                    scrollWheelZoom={false}
                                    style={{ width: '100%', height: '100%' }}
                                >
                                    <TileLayer
                                        attribution='&copy; CartoDB'
                                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                    />
                                    <MapRecenter center={[carrierPosition.lat, carrierPosition.lng]} />
                                    {routePoints.length > 1 && (
                                        <Polyline positions={routePoints} color="#FF6600" weight={3} opacity={0.8} />
                                    )}
                                    <Marker position={[carrierPosition.lat, carrierPosition.lng]} icon={carrierIcon}>
                                        <Popup>Votre position actuelle</Popup>
                                    </Marker>
                                </MapContainer>
                            </div>
                            {activeMission && (
                                <p className="text-[9px] text-slate-400 relative z-10 truncate">
                                    → {activeMission.adresse_livraison}
                                </p>
                            )}
                            {carrierStats?.co2_saved_kg && (
                                <div className="flex items-center gap-2 text-emerald-400 relative z-10">
                                    <Leaf className="size-4" />
                                    <span className="text-[9px] font-black uppercase tracking-widest">
                                        {carrierStats.co2_saved_kg} kg CO₂ économisés
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Status Console */}
                        <div className="bg-[#FF6600]/5 border border-[#FF6600]/20 rounded-3xl p-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <Shield className="size-5 text-[#FF6600]" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#FF6600]">{t('carCarrierStatus')}</span>
                            </div>
                            <p className="text-[9px] font-black leading-relaxed text-muted-foreground uppercase opacity-80">
                                {t('carAccountInOrder')}
                            </p>
                            <div className="pt-2">
                                <button
                                    onClick={() => navigate('/messages')}
                                    className="w-full h-12 bg-slate-900 dark:bg-white text-foreground dark:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-[#FF6600] hover:text-foreground"
                                >
                                    {t('carContactHub')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de vérification OTP */}
            <OtpVerificationModal
                isOpen={isOtpModalOpen}
                onClose={() => setIsOtpModalOpen(false)}
                orderId={selectedOrderId}
                onSuccess={() => { refetchAvailable(); refetchMine(); refetchCompleted(); refetchStats(); }}
            />
        </DashboardLayout>
    );
};

export default CarrierDashboard;
