import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

/**
 * PrefetchLink — Un composant Link amélioré qui précharge les données au survol.
 * Comprend un délai de 250ms pour éviter le spam réseau lors d'un survol rapide.
 */
const PrefetchLink = ({ to, queryKey, queryFn, children, ...props }) => {
    const queryClient = useQueryClient();
    const prefetchTimerRef = useRef(null);

    const handleMouseEnter = () => {
        if (!queryKey || !queryFn) return;

        // Éviter de précharger si déjà en cache et data non périmée
        const state = queryClient.getQueryState(queryKey);
        if (state && !state.isStale) return;

        prefetchTimerRef.current = setTimeout(() => {
            queryClient.prefetchQuery({
                queryKey,
                queryFn,
                staleTime: 60_000,
            });
        }, 250); // Délai de 250ms avant déclenchement
    };

    const handleMouseLeave = () => {
        if (prefetchTimerRef.current) {
            clearTimeout(prefetchTimerRef.current);
        }
    };

    return (
        <Link 
            to={to} 
            onMouseEnter={handleMouseEnter} 
            onMouseLeave={handleMouseLeave} 
            {...props}
        >
            {children}
        </Link>
    );
};

export default PrefetchLink;
