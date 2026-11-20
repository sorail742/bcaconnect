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

const TEXT_SIZE_SCALE = ['text-4xl', 'text-3xl', 'text-2xl', 'text-xl', 'text-lg', 'text-base', 'text-sm', 'text-xs'];

/**
 * Taille de texte Tailwind qui rétrécit avec la longueur de la valeur affichée, pour
 * qu'un chiffre de statistique ne déborde jamais de sa carte quel que soit son nombre
 * de chiffres. `maxSize`/`minSize` bornent l'échelle (valeurs courtes → maxSize).
 */
export function adaptiveValueSize(value, maxSize = 'text-xl', minSize = 'text-sm') {
    const len = String(value ?? '').trim().length;
    const maxIdx = TEXT_SIZE_SCALE.indexOf(maxSize);
    const minIdx = TEXT_SIZE_SCALE.indexOf(minSize);
    if (maxIdx === -1 || minIdx === -1 || len <= 4) return maxSize;
    const steps = Math.min(minIdx - maxIdx, Math.floor((len - 4) / 2));
    return TEXT_SIZE_SCALE[maxIdx + steps];
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
    // If a keyword maps to a local asset, prefer it when URL is missing
    if (!url) {
        const mappedImage = PUBLIC_PRODUCT_IMAGE_MAP[keyword.toLowerCase()] || PUBLIC_PRODUCT_IMAGE_MAP['default'];
        return mappedImage;
    }
    
    let processedUrl = url;
    // Already a full URL — return as-is
    if (processedUrl.startsWith('http')) return processedUrl;
    
    // Build the server origin from VITE_API_URL.
    // If it is a relative path like "/api", fall back to the known dev backend port.
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    let serverUrl;
    if (apiUrl.startsWith('http')) {
        serverUrl = apiUrl.replace(/\/api$/, '');
    } else {
        // relative path (/api) — use the Vite proxy target directly
        serverUrl = 'http://localhost:5000';
    }
    
    // Ensure the path points to /uploads/
    const cleanPath = processedUrl.startsWith('/uploads') ? processedUrl : `/uploads/${processedUrl.replace(/^\//, '')}`;
    return `${serverUrl}${cleanPath}`;
};

