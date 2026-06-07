import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw, CloudUpload } from 'lucide-react';
import { syncService } from '../../services/syncService';
import { cn } from '../../lib/utils';

const OfflineBanner = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [pendingCount, setPendingCount] = useState(0);
    const [syncing, setSyncing] = useState(false);

    const refreshCount = async () => {
        const count = await syncService.getPendingCount();
        setPendingCount(count);
    };

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        refreshCount();
        const unsub = syncService.subscribe(refreshCount);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            unsub();
        };
    }, []);

    const handleSync = async () => {
        setSyncing(true);
        await syncService.syncAll();
        await refreshCount();
        setSyncing(false);
    };

    if (isOnline && pendingCount === 0) return null;

    return (
        <div className={cn(
            'fixed top-0 left-0 right-0 z-[9999] px-4 py-2 flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-4',
            isOnline ? 'bg-emerald-600 text-white' : 'bg-orange-600 text-white',
        )}>
            <div className="flex items-center gap-3 text-sm font-medium">
                {isOnline ? <Wifi className="size-4" /> : <WifiOff className="size-4" />}
                <span>
                    {isOnline
                        ? `${pendingCount} élément(s) en attente de synchronisation`
                        : 'Mode hors ligne — catalogue et panier disponibles localement'}
                </span>
            </div>
            <div className="flex items-center gap-2">
                {isOnline && pendingCount > 0 && (
                    <button
                        onClick={handleSync}
                        disabled={syncing}
                        className="flex items-center gap-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                    >
                        <CloudUpload className={cn('size-3', syncing && 'animate-pulse')} />
                        {syncing ? 'Sync...' : 'Synchroniser'}
                    </button>
                )}
                {!isOnline && (
                    <button
                        onClick={() => window.location.reload()}
                        className="flex items-center gap-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs transition-colors"
                    >
                        <RefreshCw className="size-3" />
                        Actualiser
                    </button>
                )}
            </div>
        </div>
    );
};

export default OfflineBanner;
