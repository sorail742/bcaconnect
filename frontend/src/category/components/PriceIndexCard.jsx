import React from 'react';
import { TrendingUp, TrendingDown, LineChart } from 'lucide-react';
import HeroChartCard from '../../components/ui/HeroChartCard';
import { usePriceIndexByProduct } from '../hooks/usePriceIndex';

const MONTH_LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

/**
 * Indice de prix (analyse concurrentielle #8) — transparence marché : moyenne
 * des prix réellement payés (commandes confirmées) sur les derniers mois.
 */
const PriceIndexCard = ({ produitId, months = 6 }) => {
    const { data, loading } = usePriceIndexByProduct(produitId, months);

    if (loading || !data || data.points.length < 2) return null;

    const chartData = data.points.map((p) => ({
        ...p,
        label: MONTH_LABELS[parseInt(p.periode.split('-')[1], 10) - 1],
    }));

    const lastVariation = chartData[chartData.length - 1].variation_pct;
    const isUp = lastVariation > 0;

    return (
        <HeroChartCard
            title="Indice de prix"
            subtitle={`Moyenne des ${data.echantillon_total} dernières commandes confirmées`}
            icon={LineChart}
            data={chartData}
            xKey="label"
            yKey="prix_moyen"
            unit="GNF"
            height={160}
            color={isUp ? '#e0685a' : '#2e9d63'}
            forceDark={false}
            headerExtra={lastVariation !== null && (
                <span className={`flex items-center gap-1 text-[10px] font-black ${isUp ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {isUp ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                    {isUp ? '+' : ''}{lastVariation}%
                </span>
            )}
        />
    );
};

export default PriceIndexCard;
