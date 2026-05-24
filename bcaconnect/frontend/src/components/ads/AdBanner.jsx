import React, { useState, useEffect } from 'react';
import { useAds } from '../../hooks/useDomainData';
import useApiMutation from '../../hooks/useApiMutation';
import api from '../../services/api';
import { ExternalLink, X } from 'lucide-react';
import { cn } from '../../lib/utils';

const AdBanner = ({ format = 'banner', className }) => {
    const [isVisible, setIsVisible] = useState(true);
    const { data: ads = [], loading } = useAds();

    const { mutate: recordClick } = useApiMutation(
        (adId) => api.post(`/ads/${adId}/click`),
        { showToast: false } // Muet UX
    );

    const filteredAds = (ads || []).filter(ad => ad.format === format);

    const handleAdClick = (adId) => {
        recordClick(adId);
    };

    if (!isVisible || loading || filteredAds.length === 0) return null;

    // Pour l'instant on affiche la plus récente correspondant au format
    const ad = filteredAds[0];

    return (
        <div className={cn(
            "relative group overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 to-transparent",
            format === 'banner' ? "h-14 px-6 flex items-center gap-6" : "p-6 flex flex-col gap-4",
            className
        )}>
            <button
                onClick={() => setIsVisible(false)}
                className="absolute top-2 right-2 p-1 rounded-full bg-foreground/10 hover:bg-foreground/20 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <X className="size-3" />
            </button>

            {ad.url_image && (
                <div className={cn(
                    "rounded-lg overflow-hidden shrink-0",
                    format === 'banner' ? "size-10" : "w-full aspect-video"
                )}>
                    <img src={ad.url_image} alt={ad.titre} className="w-full h-full object-cover" />
                </div>
            )}

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-[8px] font-black uppercase tracking-widest text-primary px-1.5 py-0.5 bg-primary/10 rounded border border-primary/20">Sponsorisé</span>
                    <h4 className="text-sm font-black text-foreground truncate">{ad.titre}</h4>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{ad.contenu}</p>
            </div>

            <a
                href={ad.url_destination || '#'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleAdClick(ad.id)}
                className={cn(
                    "inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-slate-900 dark:text-foreground text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform",
                    format === 'banner' ? "ml-4" : "w-full justify-center"
                )}
            >
                En savoir plus
                <ExternalLink className="size-3" />
            </a>
        </div>
    );
};

export default AdBanner;
