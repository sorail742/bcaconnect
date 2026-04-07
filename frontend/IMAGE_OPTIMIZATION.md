/* IMAGE OPTIMIZATION GUIDE - BCA CONNECT */

/**
 * PRINCIPES POUR LES IMAGES
 * 
 * 1. CLARTÉ MAXIMALE
 *    - Pas d'overlays opaques (max 20% opacity)
 *    - Images haute résolution
 *    - Contraste suffisant
 * 
 * 2. PERFORMANCE
 *    - Compression optimale
 *    - Lazy loading
 *    - Formats modernes (WebP, AVIF)
 * 
 * 3. RESPONSIVE
 *    - Adapté à tous les écrans
 *    - object-cover pour les carrousels
 *    - Aspect ratio cohérent
 */

/* ─────────────────────────────────────────────────────────────────────────── */
/* COMPOSANTS D'IMAGE */
/* ─────────────────────────────────────────────────────────────────────────── */

/* Image optimisée */
.image-optimized {
  @apply w-full h-full object-cover;
  filter: brightness(1) contrast(1.05);
}

/* Carousel */
.carousel {
  @apply relative w-full overflow-hidden rounded-lg;
}

.carousel-image {
  @apply w-full h-full object-cover;
}

.carousel-overlay {
  @apply absolute inset-0 pointer-events-none;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.1),
    transparent 50%,
    rgba(0, 0, 0, 0.05)
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* OVERLAYS - À UTILISER AVEC MODÉRATION */
/* ─────────────────────────────────────────────────────────────────────────── */

/* Overlay très léger (10%) */
.overlay-light {
  background-color: rgba(0, 0, 0, 0.1);
}

/* Overlay léger (15%) */
.overlay-medium {
  background-color: rgba(0, 0, 0, 0.15);
}

/* Overlay modéré (20%) */
.overlay-heavy {
  background-color: rgba(0, 0, 0, 0.2);
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* FORMATS D'IMAGE */
/* ─────────────────────────────────────────────────────────────────────────── */

/* Préférence des formats */
/* 1. WebP (meilleure compression)
   2. AVIF (compression ultra)
   3. PNG (transparence)
   4. JPG (fallback)
*/

/* ─────────────────────────────────────────────────────────────────────────── */
/* TAILLES RECOMMANDÉES */
/* ─────────────────────────────────────────────────────────────────────────── */

/* Hero/Carousel */
/* - Desktop: 1920x1080 (16:9)
   - Mobile: 1080x1920 (9:16)
   - Taille fichier: < 500KB
*/

/* Cartes produits */
/* - 400x400 (1:1)
   - Taille fichier: < 200KB
*/

/* Thumbnails */
/* - 200x200 (1:1)
   - Taille fichier: < 50KB
*/

/* ─────────────────────────────────────────────────────────────────────────── */
/* OPTIMISATION */
/* ─────────────────────────────────────────────────────────────────────────── */

/* Lazy loading */
img {
  loading: lazy;
}

/* Responsive images */
img {
  @apply w-full h-auto;
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* À ÉVITER */
/* ─────────────────────────────────────────────────────────────────────────── */

/* ❌ Overlays opaques (> 50%) */
/* ❌ Images non compressées */
/* ❌ Formats obsolètes (BMP, TIFF) */
/* ❌ Images floues ou pixelisées */
/* ❌ Tailles énormes (> 1MB) */
/* ❌ Pas de lazy loading */

/* ─────────────────────────────────────────────────────────────────────────── */
/* BONNES PRATIQUES */
/* ─────────────────────────────────────────────────────────────────────────── */

/* ✅ Utiliser OptimizedImage component */
/* ✅ Overlays légers (< 20%) */
/* ✅ Formats modernes (WebP, AVIF) */
/* ✅ Lazy loading activé */
/* ✅ Responsive design */
/* ✅ Alt text descriptif */
/* ✅ Compression optimale */
