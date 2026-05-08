/**
 * GrowthMetrics Utility
 * 
 * Logic to transform raw operational data into financial impact metrics.
 * Designed for African Fintech context (Revenue at Risk, Scaling Potential).
 */

export const calculateRevenueAtRisk = (product, avgDailySales = 5) => {
    if (product.stock_quantite > 5) return 0;
    
    const price = parseFloat(product.prix_unitaire);
    const shortage = 5 - product.stock_quantite;
    
    // Simple model: (Shortage Gap) * Price * Probability of immediate loss
    // In a growth context, we also consider the average daily velocity
    return shortage * price * 1.2; // 1.2 multiplier for "growth overhead"
};

export const formatGrowthCurrency = (amount) => {
    if (amount >= 1000000) {
        return `${(amount / 1000000).toFixed(1)}M GNF`;
    }
    return `${amount.toLocaleString()} GNF`;
};

export const getGrowthTrend = (todayVal, yesterdayVal) => {
    if (!yesterdayVal || yesterdayVal === 0) return { delta: 100, status: 'new' };
    const delta = ((todayVal - yesterdayVal) / yesterdayVal) * 100;
    return {
        delta: Math.abs(delta).toFixed(1),
        isUp: delta >= 0,
        status: delta >= 5 ? 'surging' : delta <= -5 ? 'declining' : 'stable'
    };
};

export const getLogisticsRisk = (orderStatus, delayHours) => {
    if (orderStatus === 'en_attente' && delayHours > 24) return 'critical';
    if (orderStatus === 'confirme' && delayHours > 48) return 'high';
    return 'nominal';
};
