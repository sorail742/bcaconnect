import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
    return twMerge(clsx(inputs))
}

export const getImageUrl = (url) => {
    const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400';
    if (!url) return FALLBACK_IMAGE;
    if (url.startsWith('http')) return url;
    
    // On récupère l'URL de base du serveur
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const serverUrl = apiUrl.replace('/api', '');
    
    // S'assurer que le chemin pointe vers /uploads/
    const cleanPath = url.startsWith('/uploads') ? url : `/uploads/${url.replace(/^\//, '')}`;
    return `${serverUrl}${cleanPath.startsWith('/') ? '' : '/'}${cleanPath}`;
};
