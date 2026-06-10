const DEFAULT_STATS = {
    totalUsers: 0,
    totalClients: 0,
    totalFournisseurs: 0,
    storesCount: 0,
    totalProducts: 0,
    totalOrders: 0,
    gmv: 0,
    growthRate: 0,
    satisfactionRate: 98,
    avgRating: 4.8,
    totalReviews: 0,
    testimonials: [],
};

export function normalizeLandingStats(data) {
    if (!data) return { ...DEFAULT_STATS };

    const overview = data.overview || {};
    const statsArr = data.stats || [];

    const communityStat = statsArr.find((s) => s.icon === 'Users');
    const productsStat = statsArr.find((s) => s.icon === 'Package');
    const storesStat = statsArr.find((s) => s.icon === 'Store');

    return {
        totalUsers: data.totalUsers ?? communityStat?.value ?? overview.totalUsers ?? 0,
        totalClients: overview.totalClients ?? 0,
        totalFournisseurs: overview.totalFournisseurs ?? 0,
        storesCount: overview.storesCount ?? storesStat?.value ?? 0,
        totalProducts: data.totalProducts ?? productsStat?.value ?? overview.totalProducts ?? 0,
        totalOrders: data.totalOrders ?? overview.total_orders ?? 0,
        gmv: data.totalVolume ?? overview.gmv ?? 0,
        growthRate: parseFloat(data.growthRate ?? overview.growth_rate) || 0,
        satisfactionRate: parseFloat(overview.satisfaction_rate) || 98,
        avgRating: parseFloat(overview.avg_rating) || 4.8,
        totalReviews: overview.total_reviews ?? 0,
        testimonials: data.testimonials || [],
    };
}

export function formatPlusDe(value) {
    const n = Number(value) || 0;
    if (n <= 0) return '0';
    return `Plus de ${n.toLocaleString('fr-FR')}`;
}

export function formatCompact(value) {
    const n = Number(value) || 0;
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M+`;
    if (n >= 10_000) return `${Math.floor(n / 1000)}K+`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K+`;
    return `${n}+`;
}

export function formatPercent(value, decimals = 0) {
    const n = parseFloat(value);
    if (Number.isNaN(n)) return '98%';
    return `${n.toFixed(decimals)}%`;
}

export function formatGmv(value) {
    const n = Number(value) || 0;
    if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    return n.toLocaleString('fr-FR');
}

export function formatGmvLabel(value, currency = 'GNF') {
    return `${formatGmv(value)} ${currency}`;
}

export function formatGrowth(value, decimals = 1) {
    const n = parseFloat(value);
    if (Number.isNaN(n)) return '+0%';
    return `${n >= 0 ? '+' : ''}${n.toFixed(decimals)}%`;
}

export function formatCount(value) {
    const n = Number(value) || 0;
    return n.toLocaleString('fr-FR');
}

export { DEFAULT_STATS };
