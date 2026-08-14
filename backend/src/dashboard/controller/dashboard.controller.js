const catchAsync = require('../../utils/catchAsync');
const dashboardService = require('../service/dashboard.service');

const dashboardController = {
    /**
     * Statistiques Globales (Admin)
     */
    getAdminStats: catchAsync(async (req, res) => {
        const result = await dashboardService.getAdminStats();
        res.json(result);
    }),

    /**
     * Statistiques publiques pour la landing (agrégats uniquement, sans PII)
     */
    getPublicLandingStats: catchAsync(async (req, res) => {
        const result = await dashboardService.getPublicLandingStats();
        res.json(result);
    }),

    /**
     * Statistiques Financières Détaillées (Panel Banque)
     */
    getFinancialReports: catchAsync(async (req, res) => {
        const result = await dashboardService.getFinancialReports();
        res.json(result);
    }),

    /**
     * Statistiques Vendeur (Vendor Dashboard)
     */
    getVendorStats: catchAsync(async (req, res) => {
        const result = await dashboardService.getVendorStats(req.user.id);
        res.json(result);
    }),

    /**
     * IA Trends & Prédictions
     */
    getTrends: catchAsync(async (req, res) => {
        const { period = '30D', region = 'CONAKRY' } = req.query;
        const result = await dashboardService.getTrends({ period, region });
        res.json(result);
    }),

    /**
     * Historique d'Activité / Logs IA basés sur les événements réels
     */
    getAiLogs: catchAsync(async (req, res) => {
        const result = await dashboardService.getAiLogs();
        res.json(result);
    }),
};

module.exports = dashboardController;
