import React, { useEffect, useState } from 'react';
import { useIsFetching } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * NetworkProgressBar — Indicateur visuel discret de chargement en arrière-plan.
 * S'affiche uniquement lors des rafraîchissements (isFetching > 0).
 */
const NetworkProgressBar = () => {
    const isFetching = useIsFetching();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Ajouter un petit délai pour éviter les clignotements sur les requêtes ultra-rapides
        if (isFetching > 0) {
            const timer = setTimeout(() => setVisible(true), 150);
            return () => clearTimeout(timer);
        } else {
            setVisible(false);
        }
    }, [isFetching]);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed top-0 left-0 right-0 h-1 bg-primary/40 z-[9999] origin-left pointer-events-none"
                    style={{ 
                        boxShadow: '0 0 10px rgba(28,160,219,0.4)',
                        backgroundColor: '#1CA0DB' // Couleur de marque BCA
                    }}
                />
            )}
        </AnimatePresence>
    );
};

export default NetworkProgressBar;
