import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Sparkles, History, Home, TrendingUp,
    ChevronDown, Send, Loader2,
    Filter, LayoutGrid, List, PanelLeft, Camera, X,
    Target, Zap, ShieldCheck, CheckCircle2, Star, Paperclip,
    BarChart2, Trash2, Plus, MessageSquare
} from 'lucide-react';
import { cn } from '../../lib/utils';
import ProductCard from '../../product/components/ProductCard';
import ConfirmDeleteModal from '../../components/ui/ConfirmDeleteModal';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import productService from '../../product/services/productService';
import aiService from '../services/aiService';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';

// ─── Vues de la sidebar ───────────────────────────────────────────────────────
const VIEWS = { home: 'home', history: 'history', trends: 'trends', verify: 'verify' };

const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'à l\'instant';
    if (mins < 60) return `il y a ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `il y a ${hours} h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `il y a ${days} j`;
    return new Date(dateStr).toLocaleDateString('fr-FR');
};

const AiMode = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const queryClient = useQueryClient();
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
    const [isTrendsLoading, setIsTrendsLoading] = useState(false);
    const [trendsData, setTrendsData] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isLoadingConversation, setIsLoadingConversation] = useState(false);

    // Conversation IA unique et continue (mémoire réelle côté backend) — tant qu'on ne
    // clique pas sur « Nouvelle discussion », chaque message reste dans le même fil.
    const [conversation, setConversation] = useState([]);
    const [conversationId, setConversationId] = useState(null);

    const fileInputRef = useRef(null);
    const chatEndRef = useRef(null);

    // Historique réel des discussions IA (persistées côté backend, table ai_conversations)
    const { data: aiConversations = [] } = useQuery({
        queryKey: ['ai-conversations'],
        queryFn: () => aiService.getConversations(),
        enabled: !!user,
        staleTime: 15_000,
    });

    // Démarre une toute nouvelle discussion — tant que ce n'est pas appelé,
    // tous les échanges restent dans la même conversation continue.
    const handleNewDiscussion = useCallback(() => {
        setConversation([]);
        setConversationId(null);
        setResults(null);
        setHasSearched(false);
        setSuggestions([]);
        setQuery('');
        setSelectedImage(null);
        setActiveView(VIEWS.home);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }, []);

    // Recharge une discussion existante depuis la base (façon ChatGPT/Gemini)
    const loadConversation = useCallback(async (conv) => {
        setIsLoadingConversation(true);
        try {
            const data = await aiService.getConversationMessages(conv.id);
            setConversation(data.messages.map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.contenu })));
            setConversationId(conv.id);
            setResults(null);
            setSuggestions([]);
            setQuery('');
            setHasSearched(true);
            setActiveView(VIEWS.home);
        } catch {
            toast.error("Impossible de charger cette discussion.");
        } finally {
            setIsLoadingConversation(false);
        }
    }, []);

    const confirmDeleteConversation = useCallback(async (confirmationText) => {
        try {
            await aiService.deleteConversation(deleteTarget.id, confirmationText);
            if (conversationId === deleteTarget.id) handleNewDiscussion();
            queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
            toast.success('Discussion supprimée.');
            setDeleteTarget(null);
        } catch {
            toast.error('Impossible de supprimer cette discussion.');
        }
    }, [deleteTarget, conversationId, handleNewDiscussion, queryClient]);

    const handleUpgradeToPro = useCallback(() => {
        if (user?.role === 'fournisseur') {
            navigate('/vendor/store');
        } else {
            toast.info("Abonnement Pro", { description: "Les plans Pro sont actuellement proposés aux comptes vendeurs. Créez une boutique pour y accéder." });
        }
    }, [user, navigate]);

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
        setConversation(prev => [...prev, { role: 'user', content: q }]);
        setQuery('');

        try {
            // Deux appels en parallèle : un vrai échange conversationnel avec mémoire
            // (le texte affiché, avec le contexte des tours précédents), et l'interprétation
            // de recherche (produits/fournisseurs). Les deux partagent la même requête.
            const [chatData, searchData] = await Promise.all([
                aiService.chat(q, conversationId),
                aiService.interpretSearch(q),
            ]);

            if (chatData?.conversation_id) setConversationId(chatData.conversation_id);

            setConversation(prev => [...prev, {
                role: 'assistant',
                content: chatData?.response || searchData.message || "Voici ce que j'ai trouvé.",
                thought_process: searchData.thought_process,
                is_greeting: searchData.is_greeting,
            }]);

            setResults(searchData);
            queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });

            if (searchData.products?.length > 0) {
                toast.success("Produits trouvés !");
            } else if (!searchData.is_greeting) {
                const trending = await productService.getAll({ limit: 10, sort: 'popular' });
                setSuggestions(trending.products || trending || []);
                toast.warning("Aucun résultat exact pour cette recherche.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de la recherche intelligente.");
            setConversation(prev => [...prev, { role: 'assistant', content: "Désolé, je rencontre des difficultés techniques. Veuillez réessayer." }]);
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
        setConversation(prev => [...prev, { role: 'user', content: '📷 Image envoyée pour analyse' }]);
        try {
            const data = await aiService.analyzeImage(file);
            setResults(data);
            if (data.keywords) setQuery(data.keywords[0] || "");
            setConversation(prev => [...prev, { role: 'assistant', content: data.message || data.description || "Analyse terminée ! Voici les produits correspondants." }]);
            toast.success("Analyse terminée ! Voici les produits correspondants.");
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de l'analyse de l'image");
            setConversation(prev => [...prev, { role: 'assistant', content: "Désolé, je n'ai pas pu analyser cette image." }]);
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

    return (
        <div className="fixed inset-0 z-[60] bg-[#f7f8fa] dark:bg-slate-950 flex overflow-hidden selection:bg-blue-500/30">
            
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
                        <div className="flex items-center gap-3 text-blue-500 font-black text-2xl tracking-tighter">
                            <div className="size-10 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <Sparkles className="size-6 text-white fill-current" />
                            </div>
                            <span>BCA IA</span>
                        </div>
                    </div>

                    {/* Nouvelle discussion — toujours visible, comme ChatGPT/Gemini */}
                    <div className="px-4 pb-3">
                        <button
                            onClick={handleNewDiscussion}
                            className="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl font-bold text-sm border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                        >
                            <Plus className="size-5 shrink-0 text-blue-500" />
                            Nouvelle discussion
                        </button>
                    </div>

                    {/* Nav */}
                    <nav className="px-4 space-y-1">
                        {[
                            { id: VIEWS.home, icon: Home, label: "Accueil" },
                            { id: VIEWS.history, icon: History, label: "Historique", badge: aiConversations.length || null },
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
                                        : "text-muted-foreground hover:bg-slate-100 dark:hover:bg-white/5"
                                )}
                            >
                                <item.icon className="size-5 shrink-0" />
                                <span className="flex-1 text-left">{item.label}</span>
                                {item.badge > 0 && (
                                    <span className={cn(
                                        "text-[10px] font-black px-2 py-0.5 rounded-full",
                                        activeView === item.id ? "bg-white/20 dark:bg-slate-900/20 text-white dark:text-slate-900" : "bg-blue-500/10 text-blue-500"
                                    )}>{item.badge}</span>
                                )}
                            </button>
                        ))}
                    </nav>

                    {/* Dynamic Panel */}
                    <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2">

                        {/* HOME: discussions récentes (réelles, DB) */}
                        {activeView === VIEWS.home && (
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-5 py-3">Récent</p>
                                {!user ? (
                                    <p className="px-5 py-3 text-xs text-muted-foreground italic">Connectez-vous pour conserver votre historique.</p>
                                ) : aiConversations.length === 0 ? (
                                    <p className="px-5 py-3 text-xs text-muted-foreground italic">Aucune discussion récente.</p>
                                ) : aiConversations.slice(0, 8).map((c) => (
                                    <button
                                        key={c.id}
                                        onClick={() => loadConversation(c)}
                                        disabled={isLoadingConversation}
                                        className={cn(
                                            "w-full text-left px-5 py-2.5 text-xs font-bold transition-all truncate flex items-center gap-2 group rounded-xl",
                                            conversationId === c.id ? "text-blue-600 bg-blue-500/5" : "text-muted-foreground hover:text-blue-500 hover:bg-slate-50 dark:hover:bg-white/5"
                                        )}
                                    >
                                        <MessageSquare className="size-3 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" />
                                        <span className="truncate flex-1">{c.titre}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* HISTORY: liste complète des discussions IA (réelles, DB) */}
                        {activeView === VIEWS.history && (
                            <div className="space-y-1">
                                <div className="flex items-center justify-between px-5 py-3">
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Historique ({aiConversations.length})</p>
                                </div>
                                {aiConversations.length === 0 ? (
                                    <div className="px-5 py-8 text-center">
                                        <History className="size-10 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                                        <p className="text-xs text-muted-foreground">L'historique apparaîtra ici après vos discussions.</p>
                                    </div>
                                ) : aiConversations.map((c) => (
                                    <div
                                        key={c.id}
                                        className={cn(
                                            "w-full px-5 py-2.5 rounded-xl flex items-center gap-2 group transition-all",
                                            conversationId === c.id ? "text-blue-600 bg-blue-500/5" : "text-muted-foreground hover:bg-slate-50 dark:hover:bg-white/5"
                                        )}
                                    >
                                        <button onClick={() => loadConversation(c)} disabled={isLoadingConversation} className="flex-1 min-w-0 text-left flex items-center gap-2">
                                            <MessageSquare className="size-3 shrink-0 opacity-40 group-hover:opacity-100 transition-all" />
                                            <span className="min-w-0 flex-1">
                                                <span className="block truncate text-xs font-bold">{c.titre}</span>
                                                <span className="block truncate text-[10px] text-muted-foreground font-medium">{timeAgo(c.derniere_activite)}</span>
                                            </span>
                                        </button>
                                        <button
                                            onClick={() => setDeleteTarget(c)}
                                            title="Supprimer cette discussion"
                                            className="shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 className="size-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* TRENDS: données réelles de l'API */}
                        {activeView === VIEWS.trends && (
                            <div className="space-y-2 px-1">
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-4 py-3">Tendances du marché</p>
                                {isTrendsLoading ? (
                                    <div className="flex flex-col items-center py-8 gap-3">
                                        <Loader2 className="size-6 animate-spin text-blue-500" />
                                        <p className="text-xs text-muted-foreground">Analyse en cours...</p>
                                    </div>
                                ) : trendsData?.trends ? (
                                    trendsData.trends.slice(0, 8).map((t, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSearch(null, t.category)}
                                            className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-blue-500/10 hover:border-blue-500/30 border border-transparent transition-all text-left group"
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs font-black text-slate-700 dark:text-white group-hover:text-blue-600 truncate">{t.category}</span>
                                                <span className="text-[10px] font-black text-blue-500 shrink-0 ml-2">{t.demand_score}%</span>
                                            </div>
                                            <div className="w-full bg-slate-200 dark:bg-white/10 rounded-full h-1">
                                                <div className="bg-blue-500 h-1 rounded-full transition-all" style={{ width: `${t.demand_score}%` }} />
                                            </div>
                                            <p className="text-[10px] text-muted-foreground mt-1 truncate">{t.periode}</p>
                                        </button>
                                    ))
                                ) : (
                                    <p className="px-4 text-xs text-muted-foreground">Cliquez sur "Analyse Trends" pour charger.</p>
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
                                    <p className="text-xs text-muted-foreground mt-1">Entrez le nom d'un fournisseur dans la barre de recherche pour vérifier son statut et ses avis.</p>
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
                        <button
                            onClick={handleUpgradeToPro}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-black text-xs shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all hover:scale-[1.02]"
                        >
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
                            className="size-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 text-muted-foreground hover:text-blue-500 transition-all"
                        >
                            <PanelLeft className={cn("size-5 transition-transform duration-500", !isSidebarOpen && "rotate-180")} />
                        </button>

                        <div className="flex items-center gap-2">
                            <h1 className="text-sm font-black text-muted-foreground uppercase tracking-widest">
                                Assistant <span className="text-slate-900 dark:text-white">IA Sourcing</span>
                            </h1>
                            <div className="size-1 bg-muted-foreground/40 rounded-full" />
                            <span className="text-xs font-bold text-muted-foreground truncate max-w-[200px]">
                                {query || "Mode Intelligent"}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {hasSearched && (
                            <button
                                onClick={handleNewDiscussion}
                                title="Nouvelle discussion"
                                className="flex items-center gap-2 px-4 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500 hover:text-white transition-all text-[11px] font-black uppercase tracking-widest"
                            >
                                <Trash2 className="size-3.5" />
                                Nouvelle discussion
                            </button>
                        )}
                        <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 rounded-xl p-1">
                            <button onClick={() => setView('grid')} className={cn("p-2 rounded-lg transition-all", view === 'grid' ? "bg-white dark:bg-slate-800 shadow text-blue-500" : "text-muted-foreground")}>
                                <LayoutGrid className="size-4" />
                            </button>
                            <button onClick={() => setView('list')} className={cn("p-2 rounded-lg transition-all", view === 'list' ? "bg-white dark:bg-slate-800 shadow text-blue-500" : "text-muted-foreground")}>
                                <List className="size-4" />
                            </button>
                        </div>
                        <button
                            onClick={() => window.history.back()}
                            className="p-2 text-muted-foreground hover:text-slate-900 dark:hover:text-white text-xs font-bold uppercase tracking-widest"
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
                                <div className="size-32 rounded-[2.5rem] bg-blue-500/10 flex items-center justify-center relative">
                                    <Sparkles className="size-16 text-blue-500" />
                                    <motion.div 
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                        className="absolute -top-2 -right-2 size-8 rounded-full bg-blue-500 border-4 border-white dark:border-slate-950"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                        Recherche <span className="text-blue-500">Intelligente</span>
                                    </h2>
                                    <p className="text-muted-foreground dark:text-muted-foreground font-medium max-w-lg mx-auto leading-relaxed">
                                        Importez une photo ou décrivez votre besoin. Notre IA s'occupe de trouver les meilleurs fournisseurs.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Fil de discussion — mémoire réelle, continue tant qu'on ne démarre pas une nouvelle discussion */}
                        {hasSearched && (
                            <div className="space-y-8">
                                {conversation.length > 0 && (
                                    <div className="max-w-4xl space-y-6">
                                        {conversation.map((turn, i) => {
                                            const isLastAssistant = turn.role === 'assistant' && i === conversation.length - 1;
                                            if (turn.role === 'user') {
                                                return (
                                                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
                                                        <div className="max-w-[80%] bg-blue-500 text-white px-6 py-3 rounded-[1.5rem] rounded-br-none font-bold text-sm shadow-lg shadow-blue-500/20">
                                                            {turn.content}
                                                        </div>
                                                    </motion.div>
                                                );
                                            }
                                            return (
                                                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                                    <div className="flex gap-6">
                                                        <div className="size-12 rounded-2xl bg-blue-500 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                                                            <Sparkles className="size-6 text-white" />
                                                        </div>
                                                        <div className="flex-1 space-y-4">
                                                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-8 rounded-[2.5rem] rounded-tl-none shadow-2xl space-y-6 relative overflow-hidden group">
                                                                <div className="absolute top-0 right-0 size-64 bg-blue-500/5 rounded-full blur-3xl -mr-32 -mt-32 transition-transform group-hover:scale-150 duration-1000" />

                                                                {/* Thought Process Toggle */}
                                                                {turn.thought_process && (
                                                                    <details className="group/details">
                                                                        <summary className="list-none cursor-pointer flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-widest hover:opacity-80 transition-opacity">
                                                                            <ChevronDown className="size-3 transition-transform group-open/details:rotate-180" />
                                                                            Voir le processus de réflexion
                                                                        </summary>
                                                                        <div className="mt-4 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl text-[11px] text-muted-foreground italic leading-relaxed border-l-2 border-blue-500/30">
                                                                            {turn.thought_process}
                                                                        </div>
                                                                    </details>
                                                                )}

                                                                <p className="text-slate-700 dark:text-muted-foreground text-lg font-bold leading-relaxed whitespace-pre-line relative z-10">
                                                                    {turn.content}
                                                                </p>

                                                                {isLastAssistant && turn.is_greeting && (
                                                                    <div className="pt-6 border-t border-slate-100 dark:border-white/5 space-y-4 relative z-10">
                                                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Essayez un exemple :</p>
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {[
                                                                                "Trouver des fournisseurs d'énergie solaire",
                                                                                "Chercher des grossistes en textile",
                                                                                "Analyse du marché agricole"
                                                                            ].map(ex => (
                                                                                <button
                                                                                    key={ex}
                                                                                    onClick={() => handleSearch(null, ex)}
                                                                                    className="px-5 py-2.5 bg-slate-50 dark:bg-white/5 hover:bg-blue-500 hover:text-white rounded-2xl text-[11px] font-black uppercase tracking-tight transition-all border-none"
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
                                            );
                                        })}
                                        {isSearching && (
                                            <div className="flex gap-6">
                                                <div className="size-12 rounded-2xl bg-blue-500 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                                                    <Sparkles className="size-6 text-white animate-pulse" />
                                                </div>
                                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-6 rounded-[2.5rem] rounded-tl-none shadow-2xl flex items-center gap-1.5">
                                                    <span className="size-2 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                                                    <span className="size-2 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                                                    <span className="size-2 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                                                </div>
                                            </div>
                                        )}
                                        <div ref={chatEndRef} />
                                    </div>
                                )}

                                {!results?.is_greeting && (
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex items-center gap-4">
                                            <button className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-black shadow-sm">
                                                <Filter className="size-4" />
                                                Filtres
                                            </button>
                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
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
                                            <div key={s.id} className="premium-card p-6 flex items-center gap-6 group hover:border-blue-500/50 transition-all duration-500">
                                                <div className="size-20 rounded-3xl bg-slate-100 dark:bg-white/5 overflow-hidden border border-slate-200 dark:border-white/10 shrink-0">
                                                    <img src={s.logo_url || '/placeholder-store.png'} className="size-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                                                </div>
                                                <div className="space-y-2 flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-black text-slate-900 dark:text-white uppercase truncate">{s.nom_boutique}</h4>
                                                        {s.is_verified && <CheckCircle2 className="size-4 text-blue-500 shrink-0" />}
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground dark:text-muted-foreground line-clamp-2 leading-relaxed">
                                                        {s.description || 'Fournisseur vérifié sur BCA Connect'}
                                                    </p>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center gap-1">
                                                            {s.rating !== null && s.rating !== undefined ? (
                                                                <>
                                                                    <Star className="size-3 text-blue-500 fill-blue-500" />
                                                                    <span className="text-[10px] font-black">{s.rating} ({s.nb_avis})</span>
                                                                </>
                                                            ) : (
                                                                <span className="text-[10px] font-bold text-muted-foreground">Nouveau</span>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={() => s.slug && navigate(`/shop/${s.slug}`)}
                                                            disabled={!s.slug}
                                                            className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:underline disabled:opacity-40 disabled:no-underline disabled:cursor-not-allowed"
                                                        >
                                                            Voir Boutique
                                                        </button>
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
                                        <X className="size-10 text-muted-foreground" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Aucun article trouvé</h3>
                                        <p className="text-sm text-muted-foreground max-w-sm mx-auto font-medium">
                                            Je n'ai pas trouvé de produits ou de fournisseurs correspondant exactement à votre recherche.
                                        </p>
                                    </div>
                                </div>
                            ) : null}

                            {/* Trends Section */}
                            {suggestions.length > 0 && products.length === 0 && (!results?.suppliers || results.suppliers.length === 0) && !results?.is_greeting && (
                                <div className="space-y-10 pt-10">
                                    <div className="flex items-center gap-6">
                                        <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.3em] whitespace-nowrap">Tendances du moment</h3>
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
                                        <Loader2 className="size-3 animate-spin text-blue-500" />
                                        Analyse en cours...
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex items-center gap-3">
                            {/* Search Bar */}
                            <div className="flex-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[2rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] border border-white/20 p-2 flex items-center gap-2 ring-1 ring-slate-900/5">
                                <div className="flex items-center gap-1 pl-1">
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="size-10 rounded-full flex items-center justify-center text-muted-foreground hover:bg-slate-100 dark:hover:bg-white/5 hover:text-blue-500 transition-all"
                                    >
                                        <Camera className="size-4" />
                                    </button>
                                    <button className="size-10 rounded-full flex items-center justify-center text-muted-foreground hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
                                        <Paperclip className="size-4" />
                                    </button>
                                </div>

                                <div className="flex-1 flex items-center gap-3 h-10 bg-slate-50 dark:bg-white/5 rounded-full px-4">
                                    {selectedImage && (
                                        <div className="relative shrink-0">
                                            <img src={selectedImage} alt="Preview" className="size-6 rounded-lg object-cover ring-2 ring-blue-500/20" />
                                            <button onClick={removeImage} className="absolute -top-2 -right-2 size-4 bg-slate-900 text-white rounded-full flex items-center justify-center"><X className="size-2" /></button>
                                        </div>
                                    )}
                                    <input 
                                        type="text"
                                        placeholder="Décrivez votre besoin..."
                                        className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white placeholder:text-muted-foreground font-bold text-sm p-0 outline-none shadow-none"
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
                                        (query.trim() || selectedImage) ? "bg-blue-500 text-white shadow-lg" : "bg-slate-100 dark:bg-white/5 text-muted-foreground"
                                    )}
                                >
                                    {isSearching ? <Loader2 className="size-4 animate-spin" /> : <><span>Lancer</span><Send className="size-3.5" /></>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </main>

            <ConfirmDeleteModal
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                itemName={deleteTarget?.titre}
                itemLabel="cette discussion"
                onConfirm={confirmDeleteConversation}
            />
        </div>
    );
};

export default AiMode;

