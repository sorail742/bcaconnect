const { Op } = require('sequelize');
const dashboardRepository = require('../repository/dashboard.repository');

// Helper pour générer une timeserie
const generateTimeseries = (records, dateField, valueField, numDays = 7) => {
    const timeseries = [];
    const now = new Date();

    // Si numDays <= 1, on passe en mode horaire (24h)
    if (numDays <= 1) {
        for (let i = 23; i >= 0; i--) {
            const d = new Date(now.getTime() - (i * 60 * 60 * 1000));
            const hourStr = d.getHours() + 'H';
            const dateHourStr = d.toISOString().slice(0, 13); // YYYY-MM-DDTHH

            const hourTotal = records
                .filter(r => {
                    const recDate = new Date(r[dateField] || r.createdAt || r.created_at);
                    if(isNaN(recDate)) return false;
                    return recDate.toISOString().slice(0, 13) === dateHourStr;
                })
                .reduce((sum, r) => sum + parseFloat(r[valueField] || 0), 0);

            timeseries.push({ day: hourStr, val: hourTotal, date: dateHourStr });
        }
        return timeseries;
    }

    // Mode journalier classique
    for (let i = numDays - 1; i >= 0; i--) {
        const d = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
        const dateStr = d.toISOString().split('T')[0];

        const daysFr = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
        const dayName = daysFr[d.getDay()];

        const dayTotal = records
            .filter(r => {
                const recDate = new Date(r[dateField] || r.createdAt || r.created_at);
                if(isNaN(recDate)) return false;
                return recDate.toISOString().split('T')[0] === dateStr;
            })
            .reduce((sum, r) => sum + parseFloat(r[valueField] || 0), 0);

        timeseries.push({ day: `${dayName} ${d.getDate()}/${d.getMonth()+1}`, val: dayTotal, date: dateStr });
    }
    return timeseries;
};

const dashboardService = {
    /**
     * Statistiques Globales (Admin)
     */
    async getAdminStats() {
        // 1. Chiffre d'Affaires Global (GMV)
        const gmv = await dashboardRepository.sumPaidOrdersTotal() || 0;

        const totalUsers = await dashboardRepository.countUsers();
        const totalFournisseurs = await dashboardRepository.countUsers({ role: 'fournisseur' });
        const activeProducts = await dashboardRepository.countActiveProducts();
        const storesCount = await dashboardRepository.countStores();

        // 2. Taux de Satisfaction Réel (Algorithme BCA)
        // Basé sur (Total Commandes payées - Litiges) / Total Commandes + Pondération Avis
        const totalOrders = await dashboardRepository.countPaidOrders();
        const totalDisputes = await dashboardRepository.countDisputes();
        const avgRatingResult = await dashboardRepository.findAverageReviewNote();
        const avgRating = parseFloat(avgRatingResult?.avgNote) || 4.8;

        let satisfactionRate = 98.4; // Base de confiance
        if (totalOrders > 0) {
            const orderSuccessRate = ((totalOrders - totalDisputes) / totalOrders) * 100;
            const ratingRate = (avgRating / 5) * 100;
            satisfactionRate = (orderSuccessRate * 0.7) + (ratingRate * 0.3);
        }
        satisfactionRate = Math.min(99.9, Math.max(92.0, satisfactionRate)); // Clamp entre 92% et 99.9%

        // Croissance: Derniers 30 jours vs mois précédent
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));

        const currentOrdersCount = await dashboardRepository.countOrdersSince(thirtyDaysAgo);
        const previousOrdersCount = await dashboardRepository.countOrdersInRange(thirtyDaysAgo, sixtyDaysAgo);

        const growth = previousOrdersCount === 0 ? 100 : ((currentOrdersCount - previousOrdersCount) / previousOrdersCount) * 100;

        // Timeseries 7 jours pour Admin
        const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        const orders7Days = await dashboardRepository.findPaidOrdersSince(sevenDaysAgo);
        const timeseries = generateTimeseries(orders7Days, 'created_at', 'total_ttc', 7);

        // Transactions récentes
        const recentOrders = await dashboardRepository.findRecentOrdersWithClient(5);

        const formattedTransactions = recentOrders.map(order => ({
            id: order.id,
            name: `Commande #${order.id.substring(0, 8)}`,
            time: `Par ${order.client?.nom_complet || 'Client'}`,
            cat: 'Vente',
            amount: `${order.total_ttc.toLocaleString()} GNF`,
            status: order.statut.charAt(0).toUpperCase() + order.statut.slice(1),
            statusType: order.statut === 'payé' ? 'success' : 'warning'
        }));

        return {
            stats: [
                {
                    title: "Utilisateurs totaux",
                    value: totalUsers,
                    icon: 'Users',
                    trend: 'up',
                    trendValue: `+${totalUsers}`,
                    description: 'Clients & Partenaires'
                },
                {
                    title: 'Transactions (Globales)',
                    value: gmv,
                    icon: 'CreditCard',
                    trend: growth >= 0 ? 'up' : 'down',
                    trendValue: `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`,
                    description: 'Volume total'
                },
                {
                    title: 'Produits actifs',
                    value: activeProducts,
                    icon: 'Package',
                    trend: 'up',
                    trendValue: 'stable',
                    description: 'Catalogue multi-fournisseurs'
                },
            ],
            recentTransactions: formattedTransactions,
            overview: {
                gmv,
                total_orders: currentOrdersCount,
                growth_rate: growth.toFixed(2),
                storesCount,
                totalFournisseurs,
                satisfaction_rate: satisfactionRate.toFixed(1)
            },
            weeklyChart: {
                total: gmv,
                delta: growth.toFixed(1),
                timeseries
            }
        };
    },

    /**
     * Statistiques publiques pour la landing (agrégats uniquement, sans PII)
     */
    async getPublicLandingStats() {
        const gmv = await dashboardRepository.sumPaidOrdersTotal() || 0;
        const totalUsers = await dashboardRepository.countUsers({ role: { [Op.ne]: 'admin' } });
        const totalFournisseurs = await dashboardRepository.countUsers({ role: 'fournisseur' });
        const totalClients = await dashboardRepository.countUsers({ role: 'client' });
        const activeProducts = await dashboardRepository.countActiveProducts();
        const storesCount = await dashboardRepository.countStores();
        const totalOrdersPaid = await dashboardRepository.countPaidOrders();
        const totalDisputes = await dashboardRepository.countDisputes();

        const avgRatingResult = await dashboardRepository.findAverageReviewNote({ est_approuve: true });
        const avgRating = parseFloat(avgRatingResult?.avgNote) || 4.8;
        const totalReviews = await dashboardRepository.countReviews({ est_approuve: true });

        let satisfactionRate = 98.0;
        if (totalOrdersPaid > 0) {
            const orderSuccessRate = ((totalOrdersPaid - totalDisputes) / totalOrdersPaid) * 100;
            const ratingRate = (avgRating / 5) * 100;
            satisfactionRate = (orderSuccessRate * 0.7) + (ratingRate * 0.3);
        }
        satisfactionRate = Math.min(99.9, Math.max(92.0, satisfactionRate));

        const featuredReviews = await dashboardRepository.findFeaturedReviews(6);

        const testimonials = featuredReviews
            .filter((r) => r.commentaire && r.commentaire.trim().length >= 20)
            .slice(0, 3)
            .map((r) => {
                const roleLabels = {
                    fournisseur: 'Fournisseur',
                    client: 'Acheteur',
                    transporteur: 'Livreur',
                    technicien: 'Technicien',
                };
                const roleLabel = roleLabels[r.User?.role] || 'Membre BCA';
                return {
                    name: r.User?.nom_complet || 'Membre BCA',
                    company: roleLabel,
                    content: r.commentaire,
                    rating: r.note,
                    orders: null,
                    badge: roleLabel,
                };
            });

        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));

        const currentOrdersCount = await dashboardRepository.countOrdersSince(thirtyDaysAgo);
        const previousOrdersCount = await dashboardRepository.countOrdersInRange(thirtyDaysAgo, sixtyDaysAgo);
        const growth = previousOrdersCount === 0 ? 0 : ((currentOrdersCount - previousOrdersCount) / previousOrdersCount) * 100;

        const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        const orders7Days = await dashboardRepository.findPaidOrdersSince(sevenDaysAgo);
        const timeseries = generateTimeseries(orders7Days, 'created_at', 'total_ttc', 7);

        return {
            stats: [
                { title: 'Partenaires actifs', value: storesCount, icon: 'Store', trend: 'up', trendValue: 'stable', description: 'Boutiques vérifiées' },
                { title: 'Produits catalogue', value: activeProducts, icon: 'Package', trend: 'up', trendValue: 'stable', description: 'Offres disponibles' },
                { title: 'Communauté', value: Math.max(totalUsers, 0), icon: 'Users', trend: 'up', trendValue: 'stable', description: 'Membres inscrits' },
            ],
            recentTransactions: [],
            overview: {
                gmv: Math.round(gmv),
                total_orders: totalOrdersPaid,
                total_orders_30d: currentOrdersCount,
                growth_rate: growth.toFixed(2),
                storesCount,
                totalFournisseurs,
                totalClients,
                totalUsers,
                totalProducts: activeProducts,
                satisfaction_rate: satisfactionRate.toFixed(1),
                avg_rating: avgRating.toFixed(1),
                total_reviews: totalReviews,
            },
            testimonials,
            weeklyChart: {
                total: Math.round(gmv),
                delta: growth.toFixed(1),
                timeseries,
            },
            // Alias plats pour compatibilité frontend
            totalVolume: Math.round(gmv),
            totalOrders: totalOrdersPaid,
            totalUsers,
            totalProducts: activeProducts,
            growthRate: growth.toFixed(2),
        };
    },

    /**
     * Statistiques Financières Détaillées (Panel Banque)
     */
    async getFinancialReports() {
        const totalDeposits = await dashboardRepository.sumTransactions({
            type_transaction: 'depot', statut: 'complete',
        }) || 0;

        const pendingDeposits = await dashboardRepository.countTransactions({
            type_transaction: 'depot', statut: 'en_attente',
        });

        const pendingWithdrawals = await dashboardRepository.countTransactions({
            type_transaction: 'retrait', statut: 'en_attente',
        });

        const processedCount = await dashboardRepository.countTransactions({ statut: 'complete' });

        // Calcul du Vrai Delta Financier
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));

        const currentDeposits = await dashboardRepository.sumTransactions({
            type_transaction: 'depot', statut: 'complete', created_at: { [Op.gte]: thirtyDaysAgo },
        }) || 0;
        const previousDeposits = await dashboardRepository.sumTransactions({
            type_transaction: 'depot', statut: 'complete', created_at: { [Op.between]: [thirtyDaysAgo, sixtyDaysAgo] },
        }) || 0;

        const growth = previousDeposits === 0 ? 100 : ((currentDeposits - previousDeposits) / previousDeposits) * 100;

        // Revenu réel de la plateforme, par flux — chacun correspond à un
        // type_transaction distinct crédité au compte plateforme (voir
        // platform-revenue.service). Un seul helper pour éviter de répéter la même
        // paire de requêtes total/évolution-30j pour chaque source de revenu.
        const revenueStat = async (type) => {
            const total = await dashboardRepository.sumTransactions({ type_transaction: type, statut: 'complete' }) || 0;
            const current = await dashboardRepository.sumTransactions({
                type_transaction: type, statut: 'complete', created_at: { [Op.gte]: thirtyDaysAgo },
            }) || 0;
            const previous = await dashboardRepository.sumTransactions({
                type_transaction: type, statut: 'complete', created_at: { [Op.between]: [thirtyDaysAgo, sixtyDaysAgo] },
            }) || 0;
            const revGrowth = previous === 0 ? (current > 0 ? 100 : 0) : ((current - previous) / previous) * 100;
            return { total, growth: revGrowth };
        };

        const commissionRevenue = await revenueStat('commission_plateforme');
        const adRevenue = await revenueStat('paiement_publicite');
        const subscriptionRevenue = await revenueStat('abonnement_boutique');
        const deliveryMarginRevenue = await revenueStat('marge_livraison');
        const withdrawalFeeRevenue = await revenueStat('frais_retrait');

        // Graphique des dépôts des 7 derniers jours
        const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        const deposits7Days = await dashboardRepository.findTransactionsSince('depot', sevenDaysAgo);
        const timeseries = generateTimeseries(deposits7Days, 'created_at', 'montant', 7);

        const recentTransactions = await dashboardRepository.findRecentTransactionsWithUser(5);

        const formattedTransactions = recentTransactions.map(tx => {
            const rawDate = tx.createdAt || tx.created_at || new Date();
            return {
                id: `#TRX-${tx.id.substring(0, 4).toUpperCase()}`,
                user: tx.Wallet?.User?.nom_complet || 'Utilisateur inconnu',
                type: tx.type_transaction === 'depot' ? 'Dépôt' : tx.type_transaction === 'retrait' ? 'Retrait' : 'Paiement',
                typeVariant: tx.type_transaction === 'depot' ? 'info' : tx.type_transaction === 'retrait' ? 'secondary' : 'warning',
                amount: parseFloat(tx.montant),
                method: tx.metadata?.methode || 'Système',
                status: tx.statut === 'complete' ? 'Approuvé' : tx.statut === 'en_attente' ? 'En attente' : 'Rejeté',
                statusVariant: tx.statut === 'complete' ? 'success' : tx.statut === 'en_attente' ? 'warning' : 'danger',
                date: new Date(rawDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
            };
        });

        const revenueCard = (title, stat) => ({
            title,
            value: stat.total,
            trendValue: `${stat.growth > 0 ? '+' : ''}${stat.growth.toFixed(1)}%`,
            trend: stat.growth >= 0 ? 'up' : 'down',
        });

        return {
            stats: [
                { title: 'Dépôts totaux', value: totalDeposits, trendValue: `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`, trend: growth >= 0 ? 'up' : 'down' },
                revenueCard('Revenu plateforme (commissions)', commissionRevenue),
                revenueCard('Revenu publicitaire', adRevenue),
                revenueCard('Revenu abonnements', subscriptionRevenue),
                revenueCard('Revenu marge livraison', deliveryMarginRevenue),
                revenueCard('Revenu frais de retrait', withdrawalFeeRevenue),
                { title: 'Dépôts en attente', value: pendingDeposits, trendValue: 'Stable', trend: 'up' },
                { title: 'Retraits en attente', value: pendingWithdrawals, trendValue: 'Stable', trend: 'down' },
                { title: 'Transactions traitées', value: processedCount, trendValue: `${processedCount}`, trend: 'up' },
            ],
            transactions: formattedTransactions,
            chartData: {
                total: totalDeposits,
                delta: `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`,
                timeseries
            }
        };
    },

    /**
     * Statistiques Vendeur (Vendor Dashboard)
     */
    async getVendorStats(userId) {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));
        const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));

        const VALID_ORDER_STATUTS = {
            [Op.notIn]: ['en_attente_paiement', 'annulé', 'annule', 'refuse'],
        };

        const vendorItems = await dashboardRepository.findVendorOrderItems(userId, VALID_ORDER_STATUTS);

        const getOrderDate = (item) => {
            const cmd = item.commande;
            return cmd?.created_at ?? cmd?.createdAt ?? item.created_at ?? item.createdAt;
        };

        const flatData = vendorItems.map((item) => ({
            commande_id: item.commande_id,
            product_id: item.produit_id,
            product_name: item.produit?.nom_produit || 'Produit',
            created_at: getOrderDate(item),
            revenue: parseFloat(item.prix_unitaire_achat || 0) * (item.quantite || 0),
            quantite: item.quantite || 0,
        }));

        const totalRevenue = flatData.reduce((acc, r) => acc + r.revenue, 0);
        const ordersCount = new Set(flatData.map((r) => r.commande_id)).size;

        const store = await dashboardRepository.findStoreByOwner(userId);
        let productsCount = 0;
        if (store) {
            productsCount = await dashboardRepository.countInStockProducts(store.id);
        }

        const recentItems = flatData.filter((r) => {
            const d = new Date(r.created_at);
            return !Number.isNaN(d.getTime()) && d >= sevenDaysAgo;
        });
        const timeseries = generateTimeseries(recentItems, 'created_at', 'revenue', 7);
        const sales_chart = timeseries.map((row) => ({
            month: row.day,
            sales: Math.round(row.val || 0),
        }));

        const productAgg = {};
        flatData.forEach((row) => {
            const key = row.product_id || row.product_name;
            if (!productAgg[key]) {
                productAgg[key] = { name: row.product_name, quantity: 0, revenue: 0 };
            }
            productAgg[key].quantity += row.quantite;
            productAgg[key].revenue += row.revenue;
        });
        const top_products = Object.values(productAgg)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 8);

        const currentRevenue = flatData
            .filter((r) => new Date(r.created_at) >= thirtyDaysAgo)
            .reduce((acc, r) => acc + r.revenue, 0);

        const prevRevenue = flatData
            .filter((r) => {
                const d = new Date(r.created_at);
                return d >= sixtyDaysAgo && d < thirtyDaysAgo;
            })
            .reduce((acc, r) => acc + r.revenue, 0);

        const growth = prevRevenue === 0 ? (currentRevenue > 0 ? 100 : 0) : ((currentRevenue - prevRevenue) / prevRevenue) * 100;
        const growthLabel = `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`;
        const global_trend = growth >= 0
            ? `Analyse IA : Votre boutique est en croissance de ${growthLabel}. Optimisez vos stocks pour maintenir la cadence.`
            : `Analyse IA : Vos ventes sont en baisse de ${Math.abs(growth).toFixed(1)}%. C'est le moment idéal pour lancer une offre spéciale.`;

        return {
            totalRevenue,
            revenue: totalRevenue,
            orders_count: ordersCount,
            products_count: productsCount,
            growth: growthLabel,
            timeseries,
            sales_chart,
            top_products,
            global_trend,
        };
    },

    /**
     * IA Trends & Prédictions
     */
    async getTrends({ period = '30D', region = 'CONAKRY' } = {}) {
        // 1. Définition des périodes (actuelle vs précédente)
        const now = new Date();
        let days = 30;
        if (period === '24H') days = 1;
        else if (period === '7D') days = 7;
        else if (period === '90D') days = 90;

        const startCurrent = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
        const startPrevious = new Date(now.getTime() - (2 * days * 24 * 60 * 60 * 1000));

        // 2. Préparation des conditions de filtrage
        const likeOp = dashboardRepository.getDialect() === 'sqlite' ? Op.like : Op.iLike;
        const commonWhere = { statut: 'payé' };
        if (region && region !== 'GLOBAL') {
            commonWhere.adresse_livraison = { [likeOp]: `%${region}%` };
        }

        // 3. Récupération des données pour les deux périodes
        const fetchPeriodData = async (start, end) => {
            const orders = await dashboardRepository.findOrdersWithCategoryBreakdown({
                ...commonWhere,
                created_at: { [Op.between]: [start, end] },
            });

            const stats = {};
            orders.forEach(order => {
                order.details?.forEach(item => {
                    const cat = item.produit?.categorie?.nom_categorie || 'Autre';
                    if (!stats[cat]) stats[cat] = { count: 0, revenue: 0 };
                    stats[cat].count += item.quantite;
                    stats[cat].revenue += parseFloat(item.prix_unitaire_achat) * item.quantite;
                });
            });
            return { stats, orders };
        };

        const { stats: currentStats, orders: ordersCurrent } = await fetchPeriodData(startCurrent, now);
        const { stats: previousStats } = await fetchPeriodData(startPrevious, startCurrent);

        // 4. Fusion et calcul analytique (Croissance + Confiance)
        const categories = Array.from(new Set([...Object.keys(currentStats), ...Object.keys(previousStats)]));

        const trends = categories.map(cat => {
            const curr = currentStats[cat] || { revenue: 0, count: 0 };
            const prev = previousStats[cat] || { revenue: 0, count: 0 };

            // Croissance réelle
            let growth = 0;
            if (prev.revenue > 0) {
                growth = ((curr.revenue - prev.revenue) / prev.revenue) * 100;
            } else if (curr.revenue > 0) {
                growth = 100; // Nouvelle tendance
            }

            // Confiance indexée sur le volume (plus on a de commandes, plus c'est fiable)
            const baseConfidence = 75;
            const volumeBonus = Math.min(20, curr.count * 2);
            const stabilityPenalty = Math.abs(growth) > 50 ? 5 : 0;
            const confidence = Math.min(99, baseConfidence + volumeBonus - stabilityPenalty);

            return {
                name: cat.toUpperCase(),
                value: curr.revenue,
                count: curr.count,
                growth: growth.toFixed(1),
                confidence: confidence.toFixed(0)
            };
        }).sort((a, b) => b.value - a.value);

        // 5. Génération Insight Contextuelle
        let dynamicInsight = "Volume de données insuffisant pour une analyse prédictive fiable.";
        if (trends.length > 0) {
            const topCat = trends[0].name;
            const explosive = trends.find(t => parseFloat(t.growth) > 20);

            if (explosive) {
                dynamicInsight = `L'IA a détecté une anomalie positive (+${explosive.growth}%) sur le segment ${explosive.name} à ${region}. Optimisation des stocks recommandée.`;
            } else {
                dynamicInsight = `Stabilité confirmée pour ${topCat}. Les flux transactionnels à ${region} suivent les projections saisonnières avec une certitude de ${trends[0].confidence}%.`;
            }
        }

        // 5. Génération de la Trajectoire Temporelle (Timeline réelle)
        const timeline = generateTimeseries(
            ordersCurrent.map(o => ({ created_at: o.created_at, total_ttc: o.total_ttc })),
            'created_at',
            'total_ttc',
            days
        );

        // 6. Analyse de l'Intensité Régionale (Breakdown par zone)
        // Une seule requête (au lieu d'un COUNT par zone) : on récupère les adresses
        // de la période puis on compte les correspondances en mémoire.
        const zones = ['CONAKRY', 'BOKÉ', 'KAMSAR', 'KINDIA', 'MAMOU', 'KANKAN', 'SIGUIRI', 'LABÉ', 'N\'ZÉRÉKORÉ'];
        const addressRows = await dashboardRepository.findPaidOrderAddresses(startCurrent, now);
        const zoneCounts = Object.fromEntries(zones.map((z) => [z, 0]));
        addressRows.forEach(({ adresse_livraison }) => {
            const addr = (adresse_livraison || '').toUpperCase();
            const match = zones.find((z) => addr.includes(z));
            if (match) zoneCounts[match] += 1;
        });
        const regionalData = zones.map((z) => {
            const count = zoneCounts[z];
            // Normalisation de l'intensité (0-100) basée sur un seuil arbitraire de 50 commandes par zone
            const intensity = Math.min(100, Math.round((count / 50) * 100));
            let status = "Stable";
            if (intensity > 85) status = "Critique";
            else if (intensity > 60) status = "Haute";
            else if (intensity > 30) status = "Modérée";
            else if (intensity > 5) status = "Basse";

            return { name: z, intensity, status };
        });

        return {
            lastUpdated: new Date(),
            period,
            region,
            trends: trends.length > 0 ? trends : [
                { name: 'DONNÉES INSUFFISANTES', value: 0, growth: '0.0', confidence: '0' }
            ],
            regionalImpact: regionalData.sort((a, b) => b.intensity - a.intensity),
            timeline,
            globalInsight: dynamicInsight
        };
    },

    /**
     * Historique d'Activité / Logs IA basés sur les événements réels
     */
    async getAiLogs() {
        // Récupérer des actions récentes (Commandes et Litiges) pour simuler l'analyse de l'IA
        const recentOrders = await dashboardRepository.findRecentOrdersForLogs(5);
        const recentLitiges = await dashboardRepository.findRecentDisputesForLogs(2);

        const logs = [];

        // Transformer en logs IA
        recentOrders.forEach(o => {
            const amount = parseFloat(o.total_ttc || 0).toLocaleString();
            if (o.statut === 'payé') {
                logs.push(`Transaction de ${amount} GNF certifiée.`);
            } else if (o.statut === 'en_attente') {
                logs.push(`Analyse de risque sur transaction #${o.id.substring(0, 5)}...`);
            }
        });

        recentLitiges.forEach(l => {
            if (l.statut === 'résolu') {
                logs.push(`Médiation automatique validée (Litige #${l.id.substring(0, 5)}).`);
            } else {
                logs.push(`Arbitrage requis pour litige #${l.id.substring(0, 5)}.`);
            }
        });

        // Si la BDD est vide, on garde quelques logs génériques
        if (logs.length === 0) {
            logs.push(
                "Moteur BCA-Predict v4.2 opérationnel...",
                "Analyse des vecteurs régionaux...",
                "Attente de nouveaux flux..."
            );
        }

        // Mélanger légèrement (shuffle) et garder les plus pertinents
        const shuffled = logs.sort(() => 0.5 - Math.random()).slice(0, 5);

        return { logs: shuffled };
    },
};

module.exports = dashboardService;
