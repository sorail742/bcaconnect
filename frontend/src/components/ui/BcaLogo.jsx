import React from 'react';
import { cn } from '../../lib/utils';

// Recadrages du logo officiel (frontend/public/logo-BCA.png) :
const ASSETS = {
    icon: '/logo-BCA-icon.png',  // Pictogramme seul (carré bleu + chariot blanc)
    mark: '/logo-BCA-mark.png',  // Pictogramme + « BCA » — usage compact (navbar, header)
    full: '/logo-BCA-full.png',  // Pictogramme + « BCA » + « Best Centrale d'Achat »
};

/**
 * Logo officiel BCA Connect. `variant="light"` force un rendu blanc monochrome,
 * à réserver aux surfaces toujours sombres (fond fixe type slate-900) — sur les
 * surfaces qui suivent le thème (bg-background), laisser la valeur par défaut :
 * l'inversion se fait automatiquement en mode sombre.
 */
const BcaLogo = ({ className, size = 'h-10', variant = 'color', type = 'mark' }) => {
    const forceLight = variant === 'light';

    return (
        <img
            src={ASSETS[type] || ASSETS.mark}
            alt="BCA Connect — Best Centrale d'Achat"
            translate="no"
            draggable={false}
            className={cn(
                size,
                'w-auto object-contain select-none',
                forceLight ? 'brightness-0 invert' : 'dark:brightness-0 dark:invert',
                className
            )}
        />
    );
};

export default BcaLogo;
