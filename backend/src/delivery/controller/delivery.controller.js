const catchAsync = require('../../utils/catchAsync');
const deliveryService = require('../service/delivery.service');

const deliveryController = {
    // 1. Lister les commandes disponibles pour ramassage
    getAvailableOrders: catchAsync(async (req, res) => {
        const orders = await deliveryService.getAvailableOrders();
        res.json(orders);
    }),

    // 2. Accepter une livraison + Générer OTP
    assignOrder: catchAsync(async (req, res) => {
        const io = req.app.get('socketio');
        const result = await deliveryService.assignOrder(req.body.orderId, req.user.id, io);
        res.json(result);
    }),

    // 3. Mise à jour de la position GPS & Statut (Live Tracking)
    updateTracking: catchAsync(async (req, res) => {
        const io = req.app.get('socketio');
        const result = await deliveryService.updateTracking(req.body, req.user, io);
        res.json(result);
    }),

    // 4. Finaliser la livraison avec vérification OTP
    verifyDelivery: catchAsync(async (req, res) => {
        const io = req.app.get('socketio');
        const result = await deliveryService.verifyDelivery(req.body, req.user.id, io);
        res.json(result);
    }),

    // 5. Récupérer les livraisons assignées au transporteur connecté
    getMyDeliveries: catchAsync(async (req, res) => {
        const history = await deliveryService.getMyDeliveries(req.user.id);
        res.json(history);
    }),

    // 5b. Optimiser la tournée du transporteur (ordre de passage + distance/durée)
    optimizeMyRoute: catchAsync(async (req, res) => {
        const returnToStart = req.body?.returnToStart === true || req.query?.returnToStart === 'true';
        const result = await deliveryService.optimizeMyRoute(req.user.id, returnToStart);
        res.json(result);
    }),

    // 6. Récupérer l'historique de tracking (propriétaire, transporteur ou admin)
    getTrackingHistory: catchAsync(async (req, res) => {
        const history = await deliveryService.getTrackingHistory(req.params.orderId, req.user);
        res.json(history);
    }),

    // 6b. Livraisons terminées du transporteur
    getCompletedDeliveries: catchAsync(async (req, res) => {
        const completed = await deliveryService.getCompletedDeliveries(req.user.id);
        res.json(completed);
    }),

    // 7. Suivi PUBLIC par numéro de commande (sans authentification, données masquées RGPD)
    trackOrderPublic: catchAsync(async (req, res) => {
        const publicData = await deliveryService.trackOrderPublic(req.params.trackingNumber);
        res.json(publicData);
    }),

    // 8. Regrouper des livraisons (Livraisons Groupées)
    groupOrders: catchAsync(async (req, res) => {
        const io = req.app.get('socketio');
        const result = await deliveryService.groupOrders(req.body.orderIds, req.user.id, io);
        res.json(result);
    }),

    // 9. Récupérer les groupes de livraison du transporteur
    getMyGroups: catchAsync(async (req, res) => {
        const groups = await deliveryService.getMyGroups(req.user.id);
        res.json(groups);
    }),

    // 10. Vue logistique admin (flotte + livraisons actives)
    getAdminLogisticsOverview: catchAsync(async (req, res) => {
        const result = await deliveryService.getAdminLogisticsOverview();
        res.json(result);
    }),

    // 11. Statistiques transporteur (Dashboard Carrier)
    getCarrierStats: catchAsync(async (req, res) => {
        const result = await deliveryService.getCarrierStats(req.user.id);
        res.json(result);
    }),

    // 12. Optimisation d'Itinéraire (Génération lien Google Maps)
    optimizeRoute: catchAsync(async (req, res) => {
        const result = await deliveryService.optimizeRoute(req.params.group_id, req.user.id);
        res.json(result);
    }),
};

module.exports = deliveryController;
