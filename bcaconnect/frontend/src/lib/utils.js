import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Import local assets for product image mapping
import imgAgriculture from '../assets/Marche_fermier.jpg';
import imgBoutique from '../assets/boutique_veste.jpg';
import imgMecanique from '../assets/mecanicien_auto.jpg';
import imgTransport from '../assets/pizza-hut_en_mode_transport.jpg';

export function cn(...inputs) {
    return twMerge(clsx(inputs))
}

export const PUBLIC_PRODUCT_IMAGE_MAP = {
    'agriculture': imgAgriculture,
    'fermier': imgAgriculture,
    'mode': imgBoutique,
    'boutique': imgBoutique,
    'vetement': imgBoutique,
    'mecanique': imgMecanique,
    'auto': imgMecanique,
    'transport': imgTransport,
    'livraison': imgTransport,
    'default': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'
};

export const getImageUrl = (url, keyword = 'default') => {
    // If a keyword maps to a local asset, prefer it when URL is missing or fallback
    if (!url || url.includes('unsplash.com')) {
        const mappedImage = PUBLIC_PRODUCT_IMAGE_MAP[keyword.toLowerCase()] || PUBLIC_PRODUCT_IMAGE_MAP['default'];
        return mappedImage;
    }
    
    if (url.startsWith('http')) return url;
    
    // On récupère l'URL de base du serveur
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const serverUrl = apiUrl.replace('/api', '');
    
    // S'assurer que le chemin pointe vers /uploads/
    const cleanPath = url.startsWith('/uploads') ? url : `/uploads/${url.replace(/^\//, '')}`;
    return `${serverUrl}${cleanPath.startsWith('/') ? '' : '/'}${cleanPath}`;
};
