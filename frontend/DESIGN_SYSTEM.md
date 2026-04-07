/* DESIGN SYSTEM - BCA CONNECT */

/**
 * PRINCIPES DE DESIGN
 * 
 * 1. CLARTÉ : Pas de flou excessif, bordures nettes
 * 2. LISIBILITÉ : Texte clair, contraste suffisant
 * 3. COHÉRENCE : Même style sur toutes les pages
 * 4. PERFORMANCE : Animations fluides, pas de lag
 */

/* ─────────────────────────────────────────────────────────────────────────── */
/* COULEURS */
/* ─────────────────────────────────────────────────────────────────────────── */

/* Mode Clair */
:root {
  --bg-light: #ffffff;        /* Blanc pur */
  --fg-light: #1a1a1a;        /* Noir profond */
  --border-light: #e5e5e5;    /* Gris clair */
  --accent-light: #ff6600;    /* Orange BCA */
}

/* Mode Sombre */
:root.dark {
  --bg-dark: #141414;         /* Noir doux */
  --fg-dark: #f5f5f5;         /* Blanc cassé */
  --border-dark: #2a2a2a;     /* Gris foncé */
  --accent-dark: #ff6600;     /* Orange BCA */
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* COMPOSANTS */
/* ─────────────────────────────────────────────────────────────────────────── */

/* Cartes */
.card {
  @apply bg-card border border-border rounded-lg p-4 transition-all duration-300;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.card:hover {
  @apply border-primary/40;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

/* Boutons */
.btn {
  @apply px-4 py-2 rounded-lg font-semibold transition-all duration-300;
  @apply focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2;
}

.btn-primary {
  @apply bg-primary text-primary-foreground hover:bg-primary/90;
}

.btn-secondary {
  @apply bg-secondary text-secondary-foreground hover:bg-secondary/90;
}

.btn-outline {
  @apply border-2 border-primary text-primary hover:bg-primary/10;
}

/* Champs de saisie */
.input {
  @apply w-full px-4 py-2 rounded-lg border-2 border-border;
  @apply bg-background text-foreground placeholder:text-muted-foreground;
  @apply focus:border-primary focus:outline-none transition-all duration-300;
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* ESPACEMENTS */
/* ─────────────────────────────────────────────────────────────────────────── */

/* Sections */
.section {
  @apply py-16 md:py-24 px-4 md:px-8 lg:px-16;
}

.section-sm {
  @apply py-8 md:py-12 px-4 md:px-8;
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* TYPOGRAPHIE */
/* ─────────────────────────────────────────────────────────────────────────── */

h1 {
  @apply text-4xl md:text-5xl font-bold tracking-tight;
}

h2 {
  @apply text-3xl md:text-4xl font-bold tracking-tight;
}

h3 {
  @apply text-2xl md:text-3xl font-bold tracking-tight;
}

p {
  @apply text-base leading-relaxed;
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* À ÉVITER */
/* ─────────────────────────────────────────────────────────────────────────── */

/* ❌ Pas de blur excessif */
/* ❌ Pas de backdrop-blur-[100px] */
/* ❌ Pas de texte en majuscules partout */
/* ❌ Pas de couleurs trop transparentes (opacity < 0.1) */
/* ❌ Pas d'animations infinies qui ralentissent */
/* ❌ Pas de bordures trop fines (< 1px) */

/* ─────────────────────────────────────────────────────────────────────────── */
/* BONNES PRATIQUES */
/* ─────────────────────────────────────────────────────────────────────────── */

/* ✅ Utiliser les variables CSS */
/* ✅ Bordures nettes (2px minimum) */
/* ✅ Ombres subtiles (0 2px 8px) */
/* ✅ Animations courtes (300ms) */
/* ✅ Contraste suffisant (WCAG AA) */
/* ✅ Espacements cohérents (multiples de 4px) */
