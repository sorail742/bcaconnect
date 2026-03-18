import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ExternalLink, X } from 'lucide-react';
import { cn } from '../../lib/utils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdBanner = ({ format = 'banner', className }) => {
    const [ads, setAds] = useState([]);
    const [isVisible, setIsVisible] = useState(true);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAds = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
                const response = await axios.get(`${API_URL}/ads/serve`, config);

                // Filtrer par format si spécifié
                const filteredAds = response.data.filter(ad => ad.format === format);
                setAds(filteredAds);
            } catch (error) {
                console.error("Erreur chargement publicités:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAds();
    }, [format]);

    const handleAdClick = async (adId) => {
        try {
            await axios.post(`${API_URL}/ads/${adId}/click`);
        } catch (error) {
            console.error("Erreur enregistrement clic:", error);
        }
    };

    if (!isVisible || loading || ads.length === 0) return null;

    // Pour l'instant on affiche la plus récente correspondant au format
    const ad = ads[0];

    return (
        <div className={cn(
            "relative group overflow-hidden rounded-[1.5rem] border border-primary/20 bg-gradient-to-r from-primary/5 to-transparent",
            format === 'banner' ? "h-24 px-6 flex items-center gap-6" : "p-6 flex flex-col gap-4",
            className
        )}>
            <button
                onClick={() => setIsVisible(false)}
                className="absolute top-2 right-2 p-1 rounded-full bg-white/10 hover:bg-white/20 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <X className="size-3" />
            </button>

            {ad.url_image && (
                <div className={cn(
                    "rounded-xl overflow-hidden shrink-0",
                    format === 'banner' ? "size-16" : "w-full aspect-video"
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
                    "inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform",
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
