import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * Hook générique pour les mutations (POST, PUT, DELETE) avec React Query.
 * Gère automatiquement : loading, toast, invalidation de cache et optimistic UI.
 *
 * @param {Function} mutationFn - Fonction async de mutation (ex: orderService.create)
 * @param {Object} options
 * @param {string[]|Function} [options.invalidateKeys] - Clés de cache à invalider après succès
 * @param {string|Function} [options.successMessage] - Message de succès (toast)
 * @param {string} [options.errorMessage] - Message d'erreur par défaut (toast)
 * @param {Function} [options.onSuccess] - Callback post-succès
 * @param {Function} [options.onError] - Callback post-erreur
 * @param {Object} [options.optimistic] - Config pour l'Optimistic UI
 * @param {string} [options.optimistic.queryKey] - Clé à mettre à jour de manière optimiste
 * @param {Function} [options.optimistic.updater] - (oldData, newData) => newData
 */
const useApiMutation = (mutationFn, options = {}) => {
    const queryClient = useQueryClient();

    const {
        invalidateKeys = [],
        successMessage,
        errorMessage = 'Une erreur est survenue. Veuillez réessayer.',
        onSuccess,
        onError,
        optimistic,
    } = options;

    return useMutation({
        mutationFn,

        // ─── Optimistic UI ───────────────────────────────
        onMutate: optimistic ? async (variables) => {
            // Annuler les queries en cours pour éviter les conflits
            await queryClient.cancelQueries({ queryKey: optimistic.queryKey });
            const previousData = queryClient.getQueryData(optimistic.queryKey);

            // Appliquer la mise à jour optimiste
            if (optimistic.updater) {
                queryClient.setQueryData(optimistic.queryKey, (old) =>
                    optimistic.updater(old, variables)
                );
            }

            return { previousData };
        } : undefined,

        // ─── Succès ──────────────────────────────────────
        onSuccess: (data, variables, context) => {
            // Déterminer les clés à invalider (statique ou dynamique via fonction)
            const keysToInvalidate = typeof invalidateKeys === 'function' 
                ? invalidateKeys(data, variables) 
                : invalidateKeys;

            // Invalider toutes les clés de cache concernées
            keysToInvalidate.forEach(key => {
                queryClient.invalidateQueries({ queryKey: Array.isArray(key) ? key : [key] });
            });

            // Toast de succès
            if (successMessage) {
                toast.success(typeof successMessage === 'function' ? successMessage(data, variables) : successMessage);
            }

            // Callback personnalisé
            onSuccess?.(data, variables, context);
        },

        // ─── Erreur ──────────────────────────────────────
        onError: (error, variables, context) => {
            // Rollback optimistic UI
            if (optimistic && context?.previousData !== undefined) {
                queryClient.setQueryData(optimistic.queryKey, context.previousData);
            }

            // Extraction du message d'erreur structuré
            const message = error?.standardized?.message || 
                          error?.response?.data?.message || 
                          error?.response?.data?.error?.message || 
                          error?.message || 
                          errorMessage;
            
            // Logging structuré pour le monitoring
            import('../lib/logger').then(m => {
                m.default.error(`Mutation Failed: ${mutationFn.name || 'Anonymous'}`, error, { variables });
            });

            // Toast d'erreur (Standardisé)
            if (options.showToast !== false) {
                toast.error(message);
            }

            // Callback personnalisé
            onError?.(error, variables, context);
        },

        // ─── Toujours (settled) ──────────────────────────
        onSettled: () => {
            // Re-sync si optimistic
            if (optimistic) {
                queryClient.invalidateQueries({ queryKey: optimistic.queryKey });
            }
        },
    });
};

export default useApiMutation;
