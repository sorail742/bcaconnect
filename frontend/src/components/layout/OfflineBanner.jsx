import React, { useState, useEffect } from 'react';
import { WifiOff, AlertCircle, RefreshCw } from 'lucide-react';
import { syncService } from '../../services/syncService';

const OfflineBanner = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleStatusChange = (status) => {
            setIsOnline(status);
        };

        syncService.init(handleStatusChange);

        return () => {
            // Nettoyage si nécessaire (bien que l'app soit single-page)
        };
    }, []);

    if (isOnline) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[9999] bg-orange-600 text-white px-4 py-2 flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-3 text-sm font-medium">
                <WifiOff className="size-4" />
                <span>Mode Hors-ligne : BCA Connect utilise vos données locales</span>
            </div>
            <div className="flex items-center gap-4">
                <button
                    onClick={() => window.location.reload()}
                    className="flex items-center gap-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs transition-colors"
                >
                    <RefreshCw className="size-3" />
                    Actualiser
                </button>
                <AlertCircle className="size-4 opacity-50" />
            </div>
        </div>
    );
};

export default OfflineBanner;
