import { useState, useEffect } from "react"
import { Button } from "../ui/Button"
import { Search, Camera, ArrowRight, Zap } from "lucide-react"
import { Link } from "react-router-dom"
import statService from "../../services/statService"

export function Hero() {
    const [stats, setStats] = useState({
        users: "10K+",
        vendors: "500+",
        transactions: "50K+",
        satisfaction: "99%"
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Since this is public, we might not have full access to admin stats
                // But we can try to get public-facing metrics if they exist
                // For now, let's keep the high-end targets as default but allow dynamic override if statService provides it
                const data = await statService.getAdminStats();
                if (data) {
                    setStats({
                        users: `${(data.totalUsers || 0).toLocaleString()}+`,
                        vendors: `${(data.totalVendors || 0).toLocaleString()}+`,
                        transactions: `${(data.totalOrders || 0).toLocaleString()}+`,
                        satisfaction: "99%" // Keep high as a marketing metric
                    });
                }
            } catch (error) {
                console.error("Failed to fetch landing stats", error);
            }
        };
        fetchStats();
    }, []);

    return (
        <section className="relative w-full pt-20 pb-16 md:pt-40 md:pb-24 isolate overflow-hidden">
            {/* High-Impact Atmospheric Glows - Orange focus */}
            <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#FF6600]/10 blur-[140px] rounded-full pointer-events-none -z-10 animate-pulse" />
            <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none -z-10" />

            {/* Premium Grid Pattern - Darker for more contrast */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_70%,transparent_110%)] pointer-events-none" />

            <div className="container mx-auto px-4 relative">
                <div className="max-w-[1000px] mx-auto text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FF6600]/10 border border-[#FF6600]/20 text-[10px] font-black text-[#FF6600] mb-12 uppercase tracking-[0.2em] animate-fade-in">
                        <Zap className="size-3 fill-current" />
                        Élevez votre écosystème commercial
                    </div>

                    <h1 className="text-5xl md:text-[92px] font-black tracking-[-0.04em] leading-[0.95] mb-10 text-white animate-fade-in-up">
                        Le portail moderne <br />
                        <span className="text-[#FF6600] italic">Passerelle</span> <br />
                        <span className="text-white">du commerce africain.</span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-16 font-medium leading-relaxed animate-fade-in-up" style={{ animationDelay: '150ms' }}>
                        La première marketplace en Guinée qui allie confiance,
                        rapidité et technologie IA.
                    </p>

                    {/* Futuristic Search Bar - XXL */}
                    <div className="max-w-3xl mx-auto mb-20 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-[#FF6600]/20 to-blue-500/10 rounded-[2.5rem] blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
                            <div className="relative flex items-center bg-[#11161D]/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-3 shadow-2xl">
                                <div className="flex-1 flex items-center px-6 gap-4">
                                    <Search className="size-6 text-[#FF6600]" />
                                    <input
                                        type="text"
                                        placeholder="Que recherchez-vous aujourd'hui ?"
                                        className="w-full bg-transparent border-none text-white text-lg font-bold placeholder:text-slate-600 focus:ring-0"
                                    />
                                </div>
                                <div className="h-10 w-px bg-white/10 mx-2 hidden sm:block" />
                                <button className="hidden sm:flex items-center gap-3 px-6 py-2 text-slate-400 hover:text-white transition-all group/visual">
                                    <Camera className="size-6 group-hover/visual:text-[#FF6600] transition-colors" />
                                    <span className="text-xs font-black uppercase tracking-widest">Recherche visuelle</span>
                                </button>
                                <Button className="h-14 px-10 rounded-[1.8rem] bg-[#FF6600] shadow-xl shadow-[#FF6600]/20 hover:scale-[1.03] active:scale-95 transition-all text-xs font-black uppercase tracking-widest border-none ml-2">
                                    Explorer
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 max-w-4xl mx-auto">
                        {[
                            { label: "Utilisateurs", val: stats.users },
                            { label: "Vendeurs", val: stats.vendors },
                            { label: "Transactions", val: stats.transactions },
                            { label: "Satisfaction", val: stats.satisfaction, highlight: true },
                        ].map((stat, i) => (
                            <div key={i} className="text-center group animate-fade-in-up" style={{ animationDelay: `${450 + i * 100}ms` }}>
                                <p className={`text-4xl md:text-6xl font-black tabular-nums tracking-tighter pb-1 transition-all duration-700 ${stat.highlight ? 'text-[#FF6600]' : 'text-white group-hover:text-[#FF6600]'}`}>
                                    {stat.val || "0"}
                                </p>
                                <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 mt-2">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
