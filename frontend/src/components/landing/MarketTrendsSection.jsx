import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  ArrowUpRight,
  Activity,
  RefreshCcw,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from '../../context/useLanguage';
import statService from "../../services/statService";
import { formatGmvLabel, formatGrowth, formatCount } from "../../lib/landingStats";

export const MarketTrendsSection = ({ stats }) => {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();

  const buildStatsFromProps = useCallback(() => ({
    volume: formatGmvLabel(stats?.gmv ?? 0, t("gnf")),
    growth: formatGrowth(stats?.growthRate ?? 0),
    active: formatCount(stats?.totalProducts ?? 0),
  }), [stats, t]);

  const [trends, setTrends] = useState([]);
  const [headlineStats, setHeadlineStats] = useState(() => buildStatsFromProps());
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [hasLiveTrends, setHasLiveTrends] = useState(false);

  useEffect(() => {
    setHeadlineStats(buildStatsFromProps());
  }, [buildStatsFromProps]);

  const fetchTrends = async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    try {
      const trendsResult = await statService.getTrends({ period: '30D', region: 'GLOBAL' });

      if (trendsResult?.trends?.length) {
        const mapped = trendsResult.trends
          .filter((tr) => tr.name && tr.name !== 'DONNÉES INSUFFISANTES')
          .slice(0, 6)
          .map((tr) => ({
            label: tr.name,
            growth: formatGrowth(tr.growth, 0),
            volume: Number(tr.value) > 0
              ? formatGmvLabel(tr.value, t("gnf"))
              : `${formatCount(tr.count || 0)} cmd`,
            tag: parseFloat(tr.growth) > 20 ? t("tagHighDemand") : t("tagTrend"),
            categoryId: tr.category_id || null,
          }));

        if (mapped.length > 0) {
          setTrends(mapped);
          setHasLiveTrends(true);
        } else {
          setTrends([]);
          setHasLiveTrends(false);
        }
      } else {
        setTrends([]);
        setHasLiveTrends(false);
      }

      setLastUpdated(new Date());
    } catch {
      setTrends([]);
      setHasLiveTrends(false);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTrends();
    const interval = setInterval(() => fetchTrends(), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [lang]); // eslint-disable-line react-hooks/exhaustive-deps

  const headlineItems = useMemo(() => [
    { label: t("globalFlow"), val: headlineStats.volume, color: "text-emerald-600 bg-emerald-50" },
    { label: t("growthIndex"), val: headlineStats.growth, color: "text-blue-600 bg-blue-50" },
    { label: t("refProducts"), val: headlineStats.active, color: "text-violet-600 bg-violet-50" },
  ], [headlineStats, t]);

  const handleClick = (item) => {
    navigate(
      item.categoryId
        ? `/marketplace?category=${item.categoryId}`
        : `/marketplace?q=${encodeURIComponent(item.label)}`,
    );
  };

  return (
    <section className="bg-slate-50 border-t border-slate-100 py-8 sm:py-12">
      <div className="container px-3 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-[#FF6600] rounded-full" />
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {t("marketTrends")}
              </h2>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                {t("aiAnalysis")}
                {!hasLiveTrends && !isLoading && (
                  <span className="text-amber-600">• {t("awaitingOrders") || "En attente de commandes"}</span>
                )}
                {lastUpdated && (
                  <span className="text-slate-300">
                    •{" "}
                    {lastUpdated.toLocaleTimeString(
                      lang === "FR" ? "fr-FR" : "en-US",
                      { hour: "2-digit", minute: "2-digit" },
                    )}
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => fetchTrends(true)}
              disabled={isRefreshing}
              className="flex items-center gap-2 h-9 px-4 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:border-[#FF6600] hover:text-[#FF6600] transition-all"
            >
              <RefreshCcw className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              {t("refresh")}
            </button>
            <button
              type="button"
              onClick={() => navigate("/marketplace")}
              className="flex items-center gap-1.5 text-[#FF6600] font-bold text-sm hover:underline"
            >
              {t("catViewAll")} <ArrowRight className="size-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          {headlineItems.map((s, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold ${s.color}`}
            >
              <Activity className="size-3.5" />
              <span className="whitespace-nowrap">{s.label}:</span>
              <span className="font-black tabular-nums leading-none">{s.val}</span>
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {[...Array(6)].map((_, idx) => (
              <div key={idx} className="h-32 rounded-xl bg-white border border-slate-100 animate-pulse" />
            ))}
          </div>
        ) : trends.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {trends.map((item, idx) => (
              <motion.button
                key={`${item.label}-${idx}`}
                type="button"
                onClick={() => handleClick(item)}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05, duration: 0.4 }}
                className="group text-left bg-white rounded-xl border border-slate-100 p-4 hover:shadow-md hover:border-[#FF6600]/30 transition-all duration-300 relative overflow-hidden"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="size-9 rounded-xl bg-orange-50 flex items-center justify-center group-hover:bg-[#FF6600] transition-colors">
                    <TrendingUp className="size-4 text-[#FF6600] group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {item.growth}
                  </span>
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-800 leading-snug mb-2 line-clamp-2 group-hover:text-[#FF6600] transition-colors">
                  {item.label}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-medium">{item.volume}</span>
                  <ArrowUpRight className="size-3.5 text-slate-300 group-hover:text-[#FF6600] group-hover:rotate-45 transition-all" />
                </div>
                <span className="absolute top-2 right-2 text-[9px] font-black text-[#FF6600] bg-orange-50 px-1.5 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.tag}
                </span>
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-[#FF6600] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 px-6 rounded-2xl border border-dashed border-slate-200 bg-white text-slate-500 text-sm">
            Les tendances par catégorie apparaîtront dès les premières commandes sur la plateforme.
          </div>
        )}
      </div>
    </section>
  );
};
