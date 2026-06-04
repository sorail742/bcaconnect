import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, Sparkles, History, Home, TrendingUp,
    ChevronDown, Send, Loader2,
    Filter, LayoutGrid, List, PanelLeft, Camera, X,
    Target, Zap, ShieldCheck, CheckCircle2, Star, Paperclip,
    BarChart2, Trash2
} from 'lucide-react';
import { cn } from '../lib/utils';
import ProductCard from '../components/produits/ProductCard';
import { useQuery } from '@tanstack/react-query';
import productService from '../services/productService';
import aiService from '../services/aiService';
import { toast } from 'sonner';

// ─── Persistance de l'historique dans localStorage ───────────────────────────
const HISTORY_KEY = 'bca_ai_history';
const getStoredHistory = () => {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); }
    catch { return []; }
};
const saveHistory = (items) => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, 20)));
};

// ─── Vues de la sidebar ───────────────────────────────────────────────────────
const VIEWS = { home: 'home', history: 'history', trends: 'trends', verify: 'verify' };

const CHAT_HISTORY_KEY = 'bca_ai_chat_history';
const getStoredChatHistory = () => {
    try { return JSON.parse(localStorage.getItem(CHAT_HISTORY_KEY) || '[]'); }
    catch { return []; }
};

const AiMode = () => {
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [hasSearched, setHasSearched] = useState(false);
    const [view, setView] = useState('grid');
    const [activeView, setActiveView] = useState(VIEWS.home);
    const [selectedImage, setSelectedImage] = useState(null);
    const [results, setResults] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [searchHistory, setSearchHistory] = useState(getStoredHistory);
    const [isTrendsLoading, setIsTrendsLoading] = useState(false);
    const [trendsData, setTrendsData] = useState(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState(getStoredChatHistory);
    const [chatInput, setChatInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    
    const fileInputRef = useRef(null);
    const chatEndRef = useRef(null);

    // Ajouter une entrée à l'historique
    const addToHistory = useCallback((q) => {
        if (!q?.trim()) return;
        setSearchHistory(prev => {
            const updated = [q, ...prev.filter(h => h !== q)].slice(0, 20);
            saveHistory(updated);
            return updated;
        });
    }, []);

    // Vider l'historique
    const clearHistory = useCallback(() => {
        localStorage.removeItem(HISTORY_KEY);
        localStorage.removeItem(CHAT_HISTORY_KEY);
        setSearchHistory([]);
        setChatMessages([]);
        toast.success('Historique effacé');
    }, []);

    // Charger les tendances du marché
    const loadTrends = useCallback(async () => {
        setActiveView(VIEWS.trends);
        if (trendsData) return;
        setIsTrendsLoading(true);
        try {
            const data = await aiService.getMarketTrends();
            setTrendsData(data);
        } catch (e) {
            toast.error("Impossible de charger les tendances.");
        } finally {
            setIsTrendsLoading(false);
        }
    }, [trendsData]);

    const { data: rawData, isLoading } = useQuery({
        queryKey: ['ai-products', query, results, hasSearched],
        queryFn: async () => {
            if (!hasSearched) return [];
            if (results?.products) return results.products;
            return productService.getAll({ search: query, limit: 20 });
        },
        enabled: hasSearched
    });

    const products = Array.isArray(rawData) ? rawData : (rawData?.products || rawData?.data || []);

    const handleSearch = async (e, overrideQuery) => {
        if (e) e.preventDefault();
        const q = overrideQuery ?? query;
        if (!q.trim() && !selectedImage) return;
        if (overrideQuery) setQuery(overrideQuery);
        
        setIsSearching(true);
        setHasSearched(true);
        setActiveView(VIEWS.home);
        setSuggestions([]);
        
        try {
            toast.info("L'IA analyse votre requête...");
            const data = await aiService.interpretSearch(q);
            setResults(data);
            addToHistory(q);
            
            if (data.products?.length > 0) {
                toast.success("Produits trouvés !");
            } else if (!data.is_greeting) {
                const trending = await productService.getAll({ limit: 10, sort: 'popular' });
                setSuggestions(trending.products || trending || []);
                toast.warning("Aucun résultat exact pour cette recherche.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de la recherche intelligente.");
        } finally {
            setIsSearching(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => setSelectedImage(reader.result);
        reader.readAsDataURL(file);

        setIsAnalyzing(true);
        setHasSearched(true);
        try {
            toast.info("L'IA analyse votre image...");
            const data = await aiService.analyzeImage(file);
            setResults(data);
            if (data.keywords) setQuery(data.keywords[0] || "");
            toast.success("Analyse terminée ! Voici les produits correspondants.");
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de l'analyse de l'image");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const removeImage = () => {
        setSelectedImage(null);
        setResults(null);
        setHasSearched(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    React.useEffect(() => {
        localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(chatMessages.slice(-50)));
    }, [chatMessages]);

    const handleChatSend = async () => {
        if (!chatInput.trim() || isChatLoading) return;
        
        const messageText = chatInput.trim();
        const newMessage = { role: 'user', content: messageText };
        
        setChatMessages(prev => [...prev, newMessage]);
        setChatInput('');
        setIsChatLoading(true);
        addToHistory(messageText);

        try {
            // Optionnel : l'API Groq peut avoir un endpoint de chat régulier, 
            // ou on peut réutiliser interpretSearchLocally comme fallback pour l'instant
            const response = await aiService.interpretSearch(messageText);
            
            // Construire une réponse textuelle en fonction des résultats
            let responseText = response.message || "Voici ce que j'ai trouvé.";
            if (response.products?.length > 0) {
                responseText = `J'ai trouvé ${response.products.length} produits correspondant à votre demande. Ils sont affichés en arrière-plan.`;
                setResults(response);
                setHasSearched(true);
            }
            
            setChatMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
        } catch (error) {
            console.error("Erreur de chat:", error);
            setChatMessages(prev => [...prev, { role: 'assistant', content: "Désolé, je rencontre des difficultés techniques pour répondre à votre demande. Veuillez réessayer." }]);
        } finally {
            setIsChatLoading(false);
            setTimeout(() => {
                chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] bg-[#f7f8fa] dark:bg-slate-950 flex overflow-hidden selection:bg-orange-500/30">
            
            {/* Hidden Input */}
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleImageUpload}
            />

            {/* Sidebar */}
            <motion.aside 
                initial={false}
                animate={{ 
                    width: isSidebarOpen ? 280 : 0,
                    opacity: isSidebarOpen ? 1 : 0,
                    x: isSidebarOpen ? 0 : -280
                }}
                className="bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-white/5 hidden lg:flex flex-col relative h-full z-50 overflow-hidden"
            >
                <div className="w-[280px] flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-8 pb-4">
                        <div className="flex items-center gap-3 text-orange-500 font-black text-2xl tracking-tighter">
                            <div className="size-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                                <Sparkles className="size-6 text-white fill-current" />
                            </div>
                            <span>BCA IA</span>
                        </div>
                    </div>

                    {/* Nav */}
                    <nav className="px-4 space-y-1">
                        {[
                            { id: VIEWS.home, icon: Home, label: "Accueil" },
                            { id: VIEWS.history, icon: History, label: "Historique", badge: searchHistory.length || null },
                            { id: VIEWS.trends, icon: BarChart2, label: "Analyse Trends" },
                            { id: VIEWS.verify, icon: ShieldCheck, label: "Vérification" }
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => item.id === VIEWS.trends ? loadTrends() : setActiveView(item.id)}
                                className={cn(
                                    "w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300",
                                    activeView === item.id
                                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900" 
                                        : "text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5"
                                )}
                            >
                                <item.icon className="size-5 shrink-0" />
                                <span className="flex-1 text-left">{item.label}</span>
                                {item.badge > 0 && (
                                    <span className={cn(
                                        "text-[10px] font-black px-2 py-0.5 rounded-full",
                                        activeView === item.id ? "bg-white/20 text-white" : "bg-orange-500/10 text-orange-500"
                                    )}>{item.badge}</span>
                                )}
                            </button>
                        ))}
                    </nav>

                    {/* Dynamic Panel */}
                    <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2">

                        {/* HOME: récents */}
                        {activeView === VIEWS.home && (
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-5 py-3">Récent</p>
                                {searchHistory.length === 0 ? (
                                    <p className="px-5 py-3 text-xs text-slate-400 italic">Aucune recherche récente.</p>
                                ) : searchHistory.slice(0, 8).map((h, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSearch(null, h)}
                                        className="w-full text-left px-5 py-2.5 text-xs font-bold text-slate-500 hover:text-orange-500 hover:bg-slate-50 dark:hover:bg-white/5 transition-all truncate flex items-center gap-2 group rounded-xl"
                                    >
                                        <Search className="size-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-orange-500" />
                                        {h}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* HISTORY: liste complète + bouton effacer */}
                        {activeView === VIEWS.history && (
                            <div className="space-y-1">
                                <div className="flex items-center justify-between px-5 py-3">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Historique ({searchHistory.length})</p>
                                    {searchHistory.length > 0 && (
                                        <button onClick={clearHistory} className="flex items-center gap-1 text-[10px] text-red-400 hover:text-red-600 font-black uppercase transition-colors">
                                            <Trash2 className="size-3" /> Vider
                                        </button>
                                    )}
                                </div>
                                {searchHistory.length === 0 ? (
                                    <div className="px-5 py-8 text-center">
                                        <History className="size-10 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                                        <p className="text-xs text-slate-400">L'historique apparaîtra ici après vos recherches.</p>
                                    </div>
                                ) : searchHistory.map((h, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSearch(null, h)}
                                        className="w-full text-left px-5 py-2.5 text-xs font-bold text-slate-500 hover:text-orange-500 hover:bg-slate-50 dark:hover:bg-white/5 transition-all flex items-center gap-2 group rounded-xl"
                                    >
                                        <Search className="size-3 shrink-0 opacity-40 group-hover:opacity-100 group-hover:text-orange-500 transition-all" />
                                        <span className="truncate">{h}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* TRENDS: données réelles de l'API */}
                        {activeView === VIEWS.trends && (
                            <div className="space-y-2 px-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4 py-3">Tendances du marché</p>
                                {isTrendsLoading ? (
                                    <div className="flex flex-col items-center py-8 gap-3">
                                        <Loader2 className="size-6 animate-spin text-orange-500" />
                                        <p className="text-xs text-slate-400">Analyse en cours...</p>
                                    </div>
                                ) : trendsData?.trends ? (
                                    trendsData.trends.slice(0, 8).map((t, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSearch(null, t.category)}
                                            className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-orange-500/10 hover:border-orange-500/30 border border-transparent transition-all text-left group"
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs font-black text-slate-700 dark:text-white group-hover:text-orange-600 truncate">{t.category}</span>
                                                <span className="text-[10px] font-black text-orange-500 shrink-0 ml-2">{t.demand_score}%</span>
                                            </div>
                                            <div className="w-full bg-slate-200 dark:bg-white/10 rounded-full h-1">
                                                <div className="bg-orange-500 h-1 rounded-full transition-all" style={{ width: `${t.demand_score}%` }} />
                                            </div>
                                            <p className="text-[10px] text-slate-400 mt-1 truncate">{t.periode}</p>
                                        </button>
                                    ))
                                ) : (
                                    <p className="px-4 text-xs text-slate-400">Cliquez sur "Analyse Trends" pour charger.</p>
                                )}
                            </div>
                        )}

                        {/* VERIFY: placeholder */}
                        {activeView === VIEWS.verify && (
                            <div className="px-5 py-8 text-center space-y-4">
                                <div className="size-14 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto">
                                    <ShieldCheck className="size-7 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-900 dark:text-white">Vérification Fournisseur</p>
                                    <p className="text-xs text-slate-400 mt-1">Entrez le nom d'un fournisseur dans la barre de recherche pour vérifier son statut et ses avis.</p>
                                </div>
                                <button
                                    onClick={() => { setQuery('cherche fournisseurs vérifiés'); handleSearch(null, 'cherche fournisseurs vérifiés'); }}
                                    className="w-full py-2.5 px-4 bg-green-500/10 hover:bg-green-500 hover:text-white text-green-600 text-xs font-black rounded-xl transition-all"
                                >
                                    Voir les fournisseurs vérifiés
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Pro button */}
                    <div className="p-6 border-t border-slate-100 dark:border-white/5">
                        <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-black text-xs shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all hover:scale-[1.02]">
                            <Zap className="size-4 fill-current" />
                            Passer à Pro
                        </button>
                    </div>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative h-full">
                
                {/* Header Row */}
                <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5 px-8 py-5 flex items-center justify-between z-40 shrink-0">
                    <div className="flex items-center gap-8">
                        <button 
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="size-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-orange-500 transition-all"
                        >
                            <PanelLeft className={cn("size-5 transition-transform duration-500", !isSidebarOpen && "rotate-180")} />
                        </button>

                        <div className="flex items-center gap-2">
                            <h1 className="text-sm font-black text-slate-400 uppercase tracking-widest">
                                Assistant <span className="text-slate-900 dark:text-white">IA Sourcing</span>
                            </h1>
                            <div className="size-1 bg-slate-300 rounded-full" />
                            <span className="text-xs font-bold text-slate-500 truncate max-w-[200px]">
                                {query || "Mode Intelligent"}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 rounded-xl p-1">
                            <button onClick={() => setView('grid')} className={cn("p-2 rounded-lg transition-all", view === 'grid' ? "bg-white dark:bg-slate-800 shadow text-orange-500" : "text-slate-400")}>
                                <LayoutGrid className="size-4" />
                            </button>
                            <button onClick={() => setView('list')} className={cn("p-2 rounded-lg transition-all", view === 'list' ? "bg-white dark:bg-slate-800 shadow text-orange-500" : "text-slate-400")}>
                                <List className="size-4" />
                            </button>
                        </div>
                        <button 
                            onClick={() => window.history.back()}
                            className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-bold uppercase tracking-widest"
                        >
                            Quitter
                        </button>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-12 pb-40">
                    <div className="container w-full space-y-10">
                        {/* Empty State */}
                        {!hasSearched && (
                            <div className="flex flex-col items-center justify-center py-20 text-center space-y-8">
                                <div className="size-32 rounded-[2.5rem] bg-orange-500/10 flex items-center justify-center relative">
                                    <Sparkles className="size-16 text-orange-500" />
                                    <motion.div 
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                        className="absolute -top-2 -right-2 size-8 rounded-full bg-orange-500 border-4 border-white dark:border-slate-950"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                        Recherche <span className="text-orange-500">Intelligente</span>
                                    </h2>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium max-w-lg mx-auto leading-relaxed">
                                        Importez une photo ou décrivez votre besoin. Notre IA s'occupe de trouver les meilleurs fournisseurs.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Interpretation & Chat Bubble */}
                        {hasSearched && (
                            <div className="space-y-8">
                                {results?.message && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="max-w-4xl"
                                    >
                                        <div className="flex gap-6">
                                            <div className="size-12 rounded-2xl bg-orange-500 flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20">
                                                <Sparkles className="size-6 text-white" />
                                            </div>
                                            <div className="flex-1 space-y-4">
                                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-8 rounded-[2.5rem] rounded-tl-none shadow-2xl space-y-6 relative overflow-hidden group">
                                                    <div className="absolute top-0 right-0 size-64 bg-orange-500/5 rounded-full blur-3xl -mr-32 -mt-32 transition-transform group-hover:scale-150 duration-1000" />
                                                    
                                                    {/* Thought Process Toggle */}
                                                    {results.thought_process && (
                                                        <details className="group/details">
                                                            <summary className="list-none cursor-pointer flex items-center gap-2 text-[10px] font-black text-orange-500 uppercase tracking-widest hover:opacity-80 transition-opacity">
                                                                <ChevronDown className="size-3 transition-transform group-open/details:rotate-180" />
                                                                Voir le processus de réflexion
                                                            </summary>
                                                            <div className="mt-4 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl text-[11px] text-slate-500 italic leading-relaxed border-l-2 border-orange-500/30">
                                                                {results.thought_process}
                                                            </div>
                                                        </details>
                                                    )}

                                                    <p className="text-slate-700 dark:text-slate-300 text-lg font-bold leading-relaxed whitespace-pre-line relative z-10">
                                                        {results.message}
                                                    </p>
                                                    
                                                    {results.is_greeting && (
                                                        <div className="pt-6 border-t border-slate-100 dark:border-white/5 space-y-4 relative z-10">
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Essayez un exemple :</p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {[
                                                                    "Trouver des fournisseurs d'énergie solaire",
                                                                    "Chercher des grossistes en textile",
                                                                    "Analyse du marché agricole"
                                                                ].map(ex => (
                                                                    <button 
                                                                        key={ex}
                                                                        onClick={() => { setQuery(ex); handleSearch(null); }}
                                                                        className="px-5 py-2.5 bg-slate-50 dark:bg-white/5 hover:bg-orange-500 hover:text-white rounded-2xl text-[11px] font-black uppercase tracking-tight transition-all border-none"
                                                                    >
                                                                        {ex}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {!results?.is_greeting && (
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex items-center gap-4">
                                            <button className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-black shadow-sm">
                                                <Filter className="size-4" />
                                                Filtres
                                            </button>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                                {products.length + (results?.suppliers?.length || 0)} Résultats trouvés
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Results Matrix */}
                        <div className="space-y-16">
                            {/* Suppliers Section */}
                            {results?.suppliers?.length > 0 && (
                                <div className="space-y-8">
                                    <div className="flex items-center gap-4">
                                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Fournisseurs Trouvés</h3>
                                        <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
                                    </div>
                                    <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                        {results.suppliers.map(s => (
                                            <div key={s.id} className="premium-card p-6 flex items-center gap-6 group hover:border-orange-500/50 transition-all duration-500">
                                                <div className="size-20 rounded-3xl bg-slate-100 dark:bg-white/5 overflow-hidden border border-slate-200 dark:border-white/10 shrink-0">
                                                    <img src={s.logo_url || '/placeholder-store.png'} className="size-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                                                </div>
                                                <div className="space-y-2 flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-black text-slate-900 dark:text-white uppercase truncate">{s.nom_boutique}</h4>
                                                        {s.is_verified && <CheckCircle2 className="size-4 text-orange-500 shrink-0" />}
                                                    </div>
                                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                                        {s.description || 'Fournisseur vérifié sur BCA Connect'}
                                                    </p>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center gap-1">
                                                            <Star className="size-3 text-orange-500 fill-orange-500" />
                                                            <span className="text-[10px] font-black">{s.rating || '4.5'}</span>
                                                        </div>
                                                        <button className="text-[10px] font-black text-orange-500 uppercase tracking-widest hover:underline">Voir Boutique</button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Products Section */}
                            {products.length > 0 ? (
                                <div className={cn(
                                    "grid gap-8",
                                    view === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5" : "grid-cols-1"
                                )}>
                                    {(isLoading || isSearching || isAnalyzing) ? (
                                        Array(10).fill(0).map((_, i) => (
                                            <div key={i} className="h-[400px] bg-white dark:bg-slate-900/50 animate-pulse rounded-[2.5rem]" />
                                        ))
                                    ) : (
                                        <>
                                            {products.map(p => (
                                                <ProductCard key={p.id} product={p} />
                                            ))}
                                        </>
                                    )}
                                </div>
                            ) : (hasSearched && !results?.is_greeting && (!results?.suppliers || results.suppliers.length === 0) && !isLoading && !isSearching && !isAnalyzing) ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 bg-white/50 dark:bg-white/5 rounded-[3rem] border border-dashed border-slate-200 dark:border-white/10">
                                    <div className="size-20 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                                        <X className="size-10 text-slate-300" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Aucun article trouvé</h3>
                                        <p className="text-sm text-slate-500 max-w-sm mx-auto font-medium">
                                            Je n'ai pas trouvé de produits ou de fournisseurs correspondant exactement à votre recherche.
                                        </p>
                                    </div>
                                </div>
                            ) : null}

                            {/* Trends Section */}
                            {suggestions.length > 0 && products.length === 0 && (!results?.suppliers || results.suppliers.length === 0) && !results?.is_greeting && (
                                <div className="space-y-10 pt-10">
                                    <div className="flex items-center gap-6">
                                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] whitespace-nowrap">Tendances du moment</h3>
                                        <div className="h-px w-full bg-slate-200 dark:bg-white/5" />
                                    </div>
                                    <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                                        {suggestions.map(p => (
                                            <ProductCard key={p.id} product={p} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Search Bar + Chat */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-5xl px-8 z-50">
                    <div className="relative">
                        <AnimatePresence>
                            {isAnalyzing && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute -top-16 left-0 w-full flex justify-center"
                                >
                                    <div className="bg-slate-900 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-2xl">
                                        <Loader2 className="size-3 animate-spin text-orange-500" />
                                        Analyse en cours...
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex items-center gap-3">
                            {/* Discuter en ligne button — style BCA */}
                            <button
                                onClick={() => setIsChatOpen(o => !o)}
                                className={cn(
                                    "shrink-0 flex items-center gap-2 px-5 h-14 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg border",
                                    isChatOpen
                                        ? "bg-emerald-500 text-white border-emerald-500 shadow-emerald-500/30"
                                        : "bg-white dark:bg-slate-900 text-emerald-600 border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 shadow-slate-200/60"
                                )}
                            >
                                <span className="relative flex size-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
                                </span>
                                Discuter
                            </button>

                            {/* Search Bar */}
                            <div className="flex-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[2rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] border border-white/20 p-2 flex items-center gap-2 ring-1 ring-slate-900/5">
                                <div className="flex items-center gap-1 pl-1">
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="size-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-orange-500 transition-all"
                                    >
                                        <Camera className="size-4" />
                                    </button>
                                    <button className="size-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
                                        <Paperclip className="size-4" />
                                    </button>
                                </div>

                                <div className="flex-1 flex items-center gap-3 h-10 bg-slate-50 dark:bg-white/5 rounded-full px-4">
                                    {selectedImage && (
                                        <div className="relative shrink-0">
                                            <img src={selectedImage} alt="Preview" className="size-6 rounded-lg object-cover ring-2 ring-orange-500/20" />
                                            <button onClick={removeImage} className="absolute -top-2 -right-2 size-4 bg-slate-900 text-white rounded-full flex items-center justify-center"><X className="size-2" /></button>
                                        </div>
                                    )}
                                    <input 
                                        type="text"
                                        placeholder="Décrivez votre besoin..."
                                        className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400 font-bold text-sm p-0 outline-none shadow-none"
                                        style={{ boxShadow: 'none', border: 'none', outline: 'none' }}
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                </div>

                                <button 
                                    onClick={handleSearch}
                                    disabled={(!query.trim() && !selectedImage) || isSearching || isAnalyzing}
                                    className={cn(
                                        "h-10 px-6 rounded-full flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest transition-all",
                                        (query.trim() || selectedImage) ? "bg-orange-500 text-white shadow-lg" : "bg-slate-100 dark:bg-white/5 text-slate-300"
                                    )}
                                >
                                    {isSearching ? <Loader2 className="size-4 animate-spin" /> : <><span>Lancer</span><Send className="size-3.5" /></>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chat Panel — slide up depuis le bas style BCA */}
                <AnimatePresence>
                    {isChatOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 40 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="absolute bottom-32 right-8 w-[360px] bg-white dark:bg-slate-900 rounded-3xl shadow-[0_30px_80px_-10px_rgba(0,0,0,0.4)] border border-slate-200 dark:border-white/10 overflow-hidden z-50 flex flex-col"
                            style={{ height: 440 }}
                        >
                            {/* Chat Header */}
                            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-4 flex items-center gap-3">
                                <div className="size-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                                    <Sparkles className="size-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-black text-sm">BCA Assistant</p>
                                    <div className="flex items-center gap-1.5">
                                        <span className="size-1.5 rounded-full bg-emerald-300 animate-pulse" />
                                        <p className="text-white/80 text-[10px] font-bold">En ligne · Répond en quelques secondes</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsChatOpen(false)} className="size-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
                                    <X className="size-4 text-white" />
                                </button>
                            </div>

                            {/* Chat Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-950/50">
                                <div className="flex gap-2">
                                    <div className="size-7 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                        <Sparkles className="size-3.5 text-emerald-600" />
                                    </div>
                                    <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm max-w-[80%]">
                                        <p className="text-sm text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
                                            Bonjour ! Je suis votre assistant BCA. Comment puis-je vous aider à trouver des fournisseurs ou des produits aujourd'hui ?
                                        </p>
                                    </div>
                                </div>
                                {chatMessages.map((msg, i) => (
                                    <div key={i} className={cn("flex gap-2", msg.role === 'user' && "flex-row-reverse")}>
                                        {msg.role === 'assistant' && (
                                            <div className="size-7 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                                <Sparkles className="size-3.5 text-emerald-600" />
                                            </div>
                                        )}
                                        <div className={cn(
                                            "rounded-2xl px-4 py-3 shadow-sm max-w-[80%] text-sm font-medium leading-relaxed",
                                            msg.role === 'user'
                                                ? "bg-orange-500 text-white rounded-tr-none"
                                                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-none"
                                        )}>
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}
                                {isChatLoading && (
                                    <div className="flex gap-2">
                                        <div className="size-7 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                            <Sparkles className="size-3.5 text-emerald-600" />
                                        </div>
                                        <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                                            <div className="flex gap-1 items-center h-4">
                                                <span className="size-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <span className="size-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <span className="size-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            {/* Chat Input */}
                            <div className="p-3 border-t border-slate-100 dark:border-white/5 bg-white dark:bg-slate-900">
                                <div className="flex items-center gap-2 bg-slate-50 dark:bg-white/5 rounded-2xl px-4 py-2">
                                    <input
                                        type="text"
                                        value={chatInput}
                                        onChange={e => setChatInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleChatSend()}
                                        placeholder="Écrire un message..."
                                        className="flex-1 bg-transparent border-none outline-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400 font-medium"
                                        style={{ boxShadow: 'none' }}
                                    />
                                    <button
                                        onClick={handleChatSend}
                                        disabled={!chatInput.trim() || isChatLoading}
                                        className="size-8 rounded-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 flex items-center justify-center transition-all shadow-sm"
                                    >
                                        <Send className="size-3.5 text-white" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default AiMode;

