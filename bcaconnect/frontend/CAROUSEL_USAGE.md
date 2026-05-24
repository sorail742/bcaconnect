/**
 * EXEMPLE D'UTILISATION DU CAROUSEL OPTIMISÉ
 * 
 * Importe le composant Carousel et utilise-le comme suit:
 */

import Carousel from '../components/ui/Carousel';

// Exemple 1: Carousel simple
const images = [
    { src: '/images/hero-1.webp', alt: 'Hero 1' },
    { src: '/images/hero-2.webp', alt: 'Hero 2' },
    { src: '/images/hero-3.webp', alt: 'Hero 3' },
];

export function HeroSection() {
    return (
        <Carousel
            images={images}
            autoPlay={true}
            autoPlayInterval={8000}
            showControls={true}
            showIndicators={true}
            className="h-96 md:h-screen"
        />
    );
}

// Exemple 2: Carousel produits
const productImages = [
    { src: '/images/product-1.webp', alt: 'Produit vue 1' },
    { src: '/images/product-2.webp', alt: 'Produit vue 2' },
    { src: '/images/product-3.webp', alt: 'Produit vue 3' },
];

export function ProductCarousel() {
    return (
        <Carousel
            images={productImages}
            autoPlay={false}
            showControls={true}
            showIndicators={true}
            className="h-96"
        />
    );
}

// Exemple 3: Utiliser OptimizedImage
import OptimizedImage from '../components/ui/OptimizedImage';

export function ProductImage() {
    return (
        <OptimizedImage
            src="/images/product.webp"
            alt="Produit"
            className="h-96 rounded-lg"
            overlay={true}
            overlayOpacity={0.1}
        />
    );
}
