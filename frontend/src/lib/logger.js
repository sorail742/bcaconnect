/**
 * Service de Logging Centralisé — BCA Connect
 * Permet de capturer les erreurs et évènements importants de manière structurée.
 * En production, ces logs peuvent être envoyés vers un service externe (Sentry, etc.).
 */

const IS_PROD = import.meta.env.PROD;

const logger = {
    info: (message, data = {}) => {
        if (!IS_PROD) {
            console.log(`%c[INFO] ${message}`, 'color: #00BAFF; font-weight: bold;', data);
        }
    },

    warn: (message, data = {}) => {
        console.warn(`[WARN] ${message}`, data);
    },

    error: (message, error = null, data = {}) => {
        console.error(`%c[CRITICAL ERROR] ${message}`, 'color: #FF0000; font-weight: bold;', {
            error,
            stack: error?.stack,
            ...data
        });
        
        // Emplacement futur pour l'envoi vers un service de monitoring (Sentry, etc.)
        // if (IS_PROD) Sentry.captureException(error);
    },

    query: (key, status, data = {}) => {
        if (!IS_PROD) {
            const color = status === 'error' ? '#FF4500' : '#32CD32';
            console.groupCollapsed(`%c[QUERY] ${key} - ${status.toUpperCase()}`, `color: ${color}; font-weight: bold;`);
            console.log('Context:', data);
            console.groupEnd();
        }
    }
};

export default logger;
