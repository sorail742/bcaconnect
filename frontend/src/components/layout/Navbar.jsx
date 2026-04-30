import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, ShoppingCart, Menu, X, Search, Globe, LogIn,
    Bell, LayoutDashboard, Package, LogOut, Wallet, Mic, Loader2,
    Sun, Moon, Camera, Store, ShieldCheck, TrendingUp, Settings,
    CreditCard, HelpCircle, ChevronRight, Zap, Sparkles, ArrowRight,
    Star, Shirt, Headphones, Home, Trophy, Diamond, Palette, Flame
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLanguage } from '../../context/LanguageContext';
import useCart from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { useWallet, useCategories } from '../../hooks/useDomainData';
import { useTheme } from '../../context/ThemeContext';
import authService from '../../services/authService';
import BcaLogo from '../ui/BcaLogo';
import PrefetchLink from '../ui/PrefetchLink';
import { useQueryClient } from '@tanstack/react-query';
import orderService from '../../services/orderService';
import walletService from '../../services/walletService';
import categoryService from '../../services/categoryService';
import productService from '../../services/productService';
import { getCategoryIconComponent } from '../../lib/categoryConstants';
import aiService from '../../services/aiService';
import { toast } from 'sonner';
import { ROLES } from '../../constants/roles';
import AiSourcingModal from '../ui/AiSourcingModal';

// ─── Role-aware dashboard link ────────────────────────────────────────────────
function getDashboardLink(user) {
    if (!user) return '/dashboard';
    if (user.role === ROLES.ADMIN) return '/admin/dashboard';
    if (user.role === ROLES.FOURNISSEUR) return '/vendor/dashboard';
    if (user.role === ROLES.TRANSPORTEUR) return '/carrier/dashboard';
    if (user.role === ROLES.BANQUE) return '/bank/dashboard';
    return '/dashboard';
}

// ─── Role badge ───────────────────────────────────────────────────────────────
function RoleBadge({ role }) {
    const map = {
        [ROLES.ADMIN]: { label: 'Admin', color: 'bg-rose-500' },
        [ROLES.FOURNISSEUR]: { label: 'Fournisseur', color: 'bg-blue-500' },
        [ROLES.TRANSPORTEUR]: { label: 'Transporteur', color: 'bg-amber-500' },
        [ROLES.BANQUE]: { label: 'Banque', color: 'bg-emerald-600' },
    };
    const cfg = map[role] || { label: 'Client', color: 'bg-slate-400' };
    return (
        <span className={`${cfg.color} text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full`}>
            {cfg.label}
        </span>
    );
}

// Typical Alibaba Sub-items from Screenshot
const ALIBABA_MOCK_ITEMS = [
    { name: 'Chemises pour hommes', icon: '👔', badge: 'blue' },
    { name: 'Des boucles d\'oreilles', icon: '✨', badge: null },
    { name: 'Ensembles de bijoux', icon: '💍', badge: null },
    { name: 'Bras', icon: '👚', badge: 'blue' },
    { name: 'Abaya', icon: '👗', badge: null },
    { name: 'Jeans pour hommes', icon: '👖', badge: 'blue' },
    { name: 'Bracelet', icon: '📿', badge: null },
    { name: 'Sweats à capuche', icon: '🧥', badge: 'orange' },
    { name: 'T-shirts pour hommes', icon: '👕', badge: 'orange' },
    { name: 'Caméra', icon: '📷', badge: null },
    { name: 'Drones', icon: '🚁', badge: 'orange' },
    { name: 'Robes de mariée', icon: '👰', badge: 'orange' },
    { name: 'T-shirt', icon: '👕', badge: 'orange' },
    { name: 'Trottinettes électriques', icon: '🛴', badge: 'orange' },
];

// Dynamic sub-section generator based on category name
const getSubSectionsForCategory = (categoryName) => {
    // If it's the personalized section
    if (categoryName === 'Catégories pour vous') return ALIBABA_MOCK_ITEMS;
    
    // Map existing categories to Alibaba-style sub-items
    const mapping = {
        'Mode': ALIBABA_MOCK_ITEMS.filter(i => ['👔', '👗', '👖', '👕', '🧥', '👰'].includes(i.icon)),
        'Électronique': ALIBABA_MOCK_ITEMS.filter(i => ['📷', '🚁', '🛴', '🎧'].includes(i.icon)),
        'Bijoux': ALIBABA_MOCK_ITEMS.filter(i => ['💍', '✨', '📿'].includes(i.icon)),
        'Vêtements': ALIBABA_MOCK_ITEMS.filter(i => ['👔', '👗', '👖', '👕', '🧥'].includes(i.icon)),
    };

    // Try to find a match in the mapping
    const match = Object.entries(mapping).find(([k]) => categoryName.toLowerCase().includes(k.toLowerCase()));
    return match ? match[1] : ALIBABA_MOCK_ITEMS; // Fallback to all items for variety
};




const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();
    const { totalQuantity: cartCount } = useCart();
    const { user, logout } = useAuth();
    const { unreadCount: notificationCount } = useNotifications();
    const { data: walletData } = useWallet();
    const walletBalance = walletData ? parseFloat(walletData.solde_virtuel || 0) : null;
    
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    // Mega Menu States
    const { data: categoriesData } = useCategories();
    const categories = categoriesData || [];
    const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
    const [activeCategoryId, setActiveCategoryId] = useState(null);
    const megaMenuTimeoutRef = useRef(null);


    const { lang, changeLanguage } = useLanguage();
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';
    const userMenuRef = useRef(null);
    const dashboardLink = getDashboardLink(user);

    // ── Scroll shadow ──────────────────────────────────────────────────────
    useEffect(() => {
        const onScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // ── Close user menu on outside click ──────────────────────────────────
    useEffect(() => {
        const handler = (e) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // ── Close mobile menu on route change ─────────────────────────────────
    useEffect(() => { setIsMenuOpen(false); }, [location.pathname]);

    // ── Search ────────────────────────────────────────────────────────────
    const handleSearch = (e) => {
        if (e) e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    // ── Voice Search ──────────────────────────────────────────────────────
    const handleVoiceSearch = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            toast.error("Votre navigateur ne supporte pas la recherche vocale.");
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.lang = lang === 'FR' ? 'fr-FR' : 'en-US';
        recognition.start();
        setIsListening(true);
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setSearchQuery(transcript);
            setIsListening(false);
            navigate(`/search?q=${encodeURIComponent(transcript)}`);
        };
        recognition.onerror = () => {
            setIsListening(false);
            toast.error("Erreur lors de la capture vocale.");
        };
        recognition.onend = () => setIsListening(false);
    };

    // ── Image Search ──────────────────────────────────────────────────────
    const handleImageSearch = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsAnalyzing(true);
        try {
            const response = await aiService.analyzeImage(file);
            const { description, keywords } = response;
            const query = keywords?.[0] || description || "produit";
            navigate(`/search?q=${encodeURIComponent(query)}&type=image`);
        } catch (error) {
            console.error("Erreur image:", error);
            toast.error("Échec de l'analyse de l'image.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    // ── Prefetch on hover ─────────────────────────────────────────────────
    const prefetchUserData = () => {
        if (!user) return;
        setIsUserMenuOpen(true);
        queryClient.prefetchQuery({ queryKey: ['orders'], queryFn: () => orderService.getAll(), staleTime: 30_000 });
        queryClient.prefetchQuery({ queryKey: ['wallet'], queryFn: () => walletService.getWallet(), staleTime: 10_000 });
        queryClient.prefetchQuery({ queryKey: ['user-profile'], queryFn: () => authService.getMe(), staleTime: 2 * 60_000 });
    };

    // ── Logout ────────────────────────────────────────────────────────────
    const handleLogout = () => {
        logout();
        setIsUserMenuOpen(false);
        navigate('/');
        toast.success("Déconnecté avec succès.");
    };

    // ── Mega Menu Handlers ────────────────────────────────────────────────
    const handleMegaMenuOpen = () => {
        if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current);
        setIsMegaMenuOpen(true);
        if (categories.length > 0 && !activeCategoryId) {
            const topLevel = categories.filter(c => !c.parent_id);
            if (topLevel.length > 0) setActiveCategoryId(topLevel[0].id);
        }
    };

    const handleMegaMenuClose = () => {
        megaMenuTimeoutRef.current = setTimeout(() => {
            setIsMegaMenuOpen(false);
        }, 150);
    };

    const topLevelCategories = categories.filter(c => !c.parent_id).slice(0, 10);
    const activeCategory = activeCategoryId === 'for-you' 
        ? { id: 'for-you', nom_categorie: 'Catégories pour vous' }
        : (categories.find(c => c.id === activeCategoryId) || topLevelCategories[0]);
        
    const subItems = getSubSectionsForCategory(activeCategory?.nom_categorie || 'default');



    return (
        <header className={cn(
            "w-full font-sans bg-background border-b border-border/10 sticky top-0 z-50 transition-shadow duration-300",
            isScrolled && "shadow-[0_4px_30px_rgba(0,0,0,0.06)]"
        )}>
            
            {/* ── Promotional Banner ───────────────────────────────────────── */}
            <div className="bg-gradient-to-r from-[#b5f5ec] via-[#36cfc9] to-[#0050b3] h-10 flex items-center justify-center relative overflow-hidden">
                <div className="flex items-center gap-4 z-10 relative text-white">
                    <span className="font-extrabold text-sm">BCA Work</span>
                    <span className="opacity-40 hidden sm:block">|</span>
                    <span className="text-sm hidden sm:block">🤖 Une équipe d'agents IA à votre service, 24/7</span>
                    <Link
                        to="/register"
                        className="ml-3 underline font-bold text-sm hover:opacity-80 transition-opacity"
                    >
                        Essai gratuit →
                    </Link>
                </div>
                <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[#0050b3] skew-x-12 translate-x-12 z-0 opacity-40" />
            </div>

            {/* ── Main Header Row ──────────────────────────────────────────── */}
            <div className="container mx-auto px-4 lg:px-8 py-4 lg:py-5 flex items-center gap-4 lg:gap-6">

                {/* Logo */}
                <Link to="/" className="flex-shrink-0">
                    <BcaLogo size="h-14 md:h-16" className="py-1" />
                </Link>

                {/* Search Bar */}
                <div className="hidden md:flex flex-1 min-w-0 max-w-2xl items-center gap-4">
                    <form onSubmit={handleSearch} className="flex-1 flex items-center rounded-full border-2 border-[#FF6600] bg-background transition-shadow hover:shadow-md focus-within:shadow-md h-12 overflow-hidden">
                        <input
                            type="text"
                            placeholder="Que recherchez-vous ?"
                            className="flex-1 h-full pl-5 pr-2 text-sm text-foreground bg-transparent outline-none placeholder:text-muted-foreground min-w-0"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <div className="flex items-center gap-1 px-2 border-l border-border/10">
                            {/* Voice */}
                            <button
                                type="button"
                                onClick={handleVoiceSearch}
                                title="Recherche vocale"
                                className={cn(
                                    "p-2 rounded-full transition-all",
                                    isListening ? "bg-red-500 text-white animate-pulse" : "text-muted-foreground hover:text-[#FF6600] hover:bg-foreground/5"
                                )}
                            >
                                <Mic className="size-5" />
                            </button>
                            {/* Image */}
                            <label
                                className="p-2 rounded-full text-muted-foreground hover:text-[#FF6600] cursor-pointer hover:bg-foreground/5 transition-all"
                                title="Recherche par image"
                            >
                                {isAnalyzing ? <Loader2 className="size-5 animate-spin" /> : <Camera className="size-5" />}
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageSearch} disabled={isAnalyzing} />
                            </label>
                        </div>
                        <button type="submit" className="shrink-0 h-10 px-6 mx-1 bg-[#FF6600] text-white font-bold text-sm rounded-full hover:bg-[#e65c00] transition-colors whitespace-nowrap">
                            Rechercher
                        </button>
                    </form>

                    {/* Mode IA Button (Alibaba Style) */}
                    <button 
                        onClick={() => setIsAiModalOpen(true)}
                        className="shrink-0 flex items-center gap-2 h-12 px-5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all group"
                    >
                        <Sparkles className="size-4 group-hover:animate-spin" />
                        Mode IA
                    </button>
                </div>

                <AiSourcingModal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} />

                {/* Right Actions */}
                <div className="flex items-center gap-3 lg:gap-4 shrink-0 ml-auto">

                    {/* Delivery Location */}
                    <div className="hidden xl:flex flex-col cursor-default group">
                        <span className="text-[11px] text-muted-foreground">Livraison vers :</span>
                        <div className="flex items-center gap-1.5 font-bold text-sm text-foreground group-hover:text-[#FF6600] transition-colors">
                            <span className="text-base leading-none">🇬🇳</span>
                            Guinée
                        </div>
                    </div>

                    {/* Language Toggle */}
                    <button
                        onClick={() => changeLanguage(lang === 'FR' ? 'EN' : 'FR')}
                        className="hidden lg:flex items-center gap-2 group"
                        title="Changer de langue"
                    >
                        <Globe className="size-5 text-foreground/70 group-hover:text-[#FF6600] transition-colors" />
                        <span className="font-bold text-sm text-foreground group-hover:text-[#FF6600] transition-colors">
                            {lang === 'FR' ? 'FR · GNF' : 'EN · GNF'}
                        </span>
                    </button>

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full text-foreground/70 hover:text-[#FF6600] hover:bg-foreground/5 transition-all"
                        title={isDark ? "Passer au mode clair" : "Passer au mode sombre"}
                    >
                        {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
                    </button>

                    {/* Notifications (logged in only) */}
                    {user && (
                        <Link
                            to="/notifications"
                            className="relative p-2 rounded-full text-foreground/70 hover:text-[#FF6600] hover:bg-foreground/5 transition-all"
                            title="Notifications"
                        >
                            <Bell className="size-5" />
                            {notificationCount > 0 && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-1 -right-1 bg-[#FF6600] text-white text-[9px] font-black min-w-[18px] h-[18px] flex items-center justify-center rounded-full border-2 border-background tabular-nums"
                                >
                                    {notificationCount > 99 ? '99+' : notificationCount}
                                </motion.span>
                            )}
                        </Link>
                    )}

                    {/* Cart */}
                    <Link to="/cart" className="relative flex items-center group cursor-pointer" title="Mon panier">
                        <ShoppingCart className="size-6 text-foreground/70 group-hover:text-[#FF6600] transition-colors" />
                        <AnimatePresence>
                            {cartCount > 0 && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    className="absolute -top-1.5 -right-2 bg-[#FF6600] text-white text-[10px] font-bold px-1.5 rounded-full border-2 border-background tabular-nums"
                                >
                                    {cartCount}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </Link>

                    {/* ── Auth Section ──────────────────────────────────────── */}
                    {user ? (
                        <div ref={userMenuRef} className="relative">
                            <button
                                onMouseEnter={prefetchUserData}
                                onClick={() => setIsUserMenuOpen(v => !v)}
                                className="flex items-center gap-2 group cursor-pointer focus:outline-none"
                            >
                                {user.avatar_url ? (
                                    <img
                                        src={user.avatar_url}
                                        alt={user.nom_complet}
                                        className="size-9 rounded-full object-cover border-2 border-[#FF6600]/30 group-hover:border-[#FF6600] transition-colors"
                                    />
                                ) : (
                                    <div className="size-9 rounded-full bg-[#FF6600]/10 border-2 border-[#FF6600]/30 group-hover:border-[#FF6600] flex items-center justify-center transition-colors">
                                        <User className="size-5 text-[#FF6600]" />
                                    </div>
                                )}
                                <div className="hidden lg:block text-left">
                                    <span className="block text-[11px] text-muted-foreground">Bonjour, {user.nom_complet?.split(' ')[0]}</span>
                                    <span className="block font-bold text-sm text-foreground group-hover:text-[#FF6600] transition-colors">Mon Compte</span>
                                </div>
                            </button>

                            <AnimatePresence>
                                {isUserMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.97 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.97 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute top-full right-0 mt-3 w-72 bg-card border border-border rounded-2xl shadow-2xl shadow-black/10 z-50 overflow-hidden"
                                    >
                                        {/* User Header */}
                                        <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-800">
                                            <div className="flex items-center gap-3">
                                                {user.avatar_url ? (
                                                    <img src={user.avatar_url} alt="" className="size-12 rounded-xl object-cover border-2 border-white/20" />
                                                ) : (
                                                    <div className="size-12 rounded-xl bg-[#FF6600]/20 border border-[#FF6600]/30 flex items-center justify-center">
                                                        <User className="size-6 text-[#FF6600]" />
                                                    </div>
                                                )}
                                                <div className="overflow-hidden">
                                                    <p className="font-bold text-white truncate">{user.nom_complet}</p>
                                                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                                                    <div className="mt-1">
                                                        <RoleBadge role={user.role} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Wallet Balance */}
                                        {walletBalance !== null && (
                                            <Link
                                                to="/wallet"
                                                onClick={() => setIsUserMenuOpen(false)}
                                                className="flex items-center gap-3 p-4 bg-emerald-50 border-b border-emerald-100 hover:bg-emerald-100 transition-colors group"
                                            >
                                                <div className="size-9 rounded-xl bg-emerald-100 group-hover:bg-emerald-200 flex items-center justify-center transition-colors">
                                                    <Wallet className="size-5 text-emerald-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Solde Wallet</p>
                                                    <p className="text-base font-black text-emerald-800 tabular-nums">{walletBalance.toLocaleString()} GNF</p>
                                                </div>
                                                <ChevronRight className="size-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                                            </Link>
                                        )}

                                        {/* Nav Links */}
                                        <div className="p-3 space-y-0.5">
                                            {[
                                                { to: dashboardLink, icon: LayoutDashboard, label: 'Tableau de bord' },
                                                { to: '/orders', icon: Package, label: 'Mes commandes' },
                                                { to: '/wallet', icon: CreditCard, label: 'Mon portefeuille' },
                                                { to: '/notifications', icon: Bell, label: 'Notifications', badge: notificationCount },
                                                { to: '/profile', icon: Settings, label: 'Paramètres du compte' },
                                                { to: '/help', icon: HelpCircle, label: "Centre d'assistance" },
                                            ].map(item => (
                                                <Link
                                                    key={item.to}
                                                    to={item.to}
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-foreground hover:bg-foreground/5 hover:text-[#FF6600] transition-all group"
                                                >
                                                    <item.icon className="size-4 text-muted-foreground group-hover:text-[#FF6600] transition-colors" />
                                                    <span className="text-sm font-semibold flex-1">{item.label}</span>
                                                    {item.badge > 0 && (
                                                        <span className="bg-[#FF6600] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full tabular-nums">
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                </Link>
                                            ))}
                                        </div>

                                        {/* Logout */}
                                        <div className="p-3 border-t border-border">
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-all group"
                                            >
                                                <LogOut className="size-4 group-hover:scale-110 transition-transform" />
                                                <span className="text-sm font-bold">Déconnexion</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 shrink-0">
                            <Link to="/login" className="flex items-center gap-1.5 group whitespace-nowrap">
                                <User className="size-5 text-foreground/70 group-hover:text-[#FF6600] transition-colors shrink-0" />
                                <span className="hidden md:block font-bold text-sm text-foreground group-hover:text-[#FF6600] transition-colors">
                                    Se connecter
                                </span>
                            </Link>
                            <Link
                                to="/register"
                                className="flex items-center bg-[#FF6600] text-white px-4 py-2 rounded-full font-bold text-sm hover:bg-[#e65c00] transition-colors shadow-md whitespace-nowrap shrink-0 gap-2"
                            >
                                <Zap className="size-4" />
                                <span className="hidden sm:inline">Créer un compte</span>
                                <span className="sm:hidden">S'inscrire</span>
                            </Link>
                        </div>
                    )}

                    {/* Mobile hamburger */}
                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className="md:hidden text-foreground p-1"
                        aria-label="Ouvrir le menu"
                    >
                        <Menu className="size-7" />
                    </button>
                </div>
            </div>

            {/* ── Bottom Nav Row ────────────────────────────────────────────── */}
            <div className="hidden md:flex border-t border-border/5">
                <div className="container mx-auto px-4 lg:px-8 flex items-center h-12 gap-6 lg:gap-8">
                    <div 
                        className="relative h-full flex items-center"
                        onMouseEnter={handleMegaMenuOpen}
                        onMouseLeave={handleMegaMenuClose}
                    >
                        <div className="flex items-center gap-2 cursor-pointer group pr-4 border-r border-border/10 h-full">
                            <Menu className="size-5 text-foreground group-hover:text-[#FF6600] transition-colors" />
                            <span className="font-bold text-sm text-foreground group-hover:text-[#FF6600] transition-colors whitespace-nowrap">
                                Toutes les catégories
                            </span>
                        </div>

                        {/* Mega Menu Dropdown */}
                        <AnimatePresence>
                            {isMegaMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 5, scale: 0.98 }}
                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                    className="absolute top-full left-0 w-[1150px] bg-white border border-slate-200 rounded-b-2xl shadow-[0_30px_90px_rgba(0,0,0,0.15)] z-50 flex overflow-hidden"
                                >
                                    {/* Left Sidebar: Exact Alibaba Reproduction */}
                                    <div className="w-[280px] bg-white border-r border-slate-100 py-2 overflow-y-auto max-h-[650px] no-scrollbar">
                                        {/* For You Section */}
                                        <div
                                            onMouseEnter={() => setActiveCategoryId('for-you')}
                                            className={cn(
                                                "px-6 py-4 cursor-pointer flex items-center gap-4 transition-all border-l-4",
                                                activeCategoryId === 'for-you' || !activeCategoryId
                                                    ? "bg-slate-50 border-slate-900 text-slate-900 font-bold" 
                                                    : "border-transparent text-slate-600 hover:bg-slate-50"
                                            )}
                                        >
                                            <Star className={cn("size-5", activeCategoryId === 'for-you' ? "fill-slate-900 text-slate-900" : "text-slate-400")} />
                                            <span className="text-[15px]">Catégories pour vous</span>
                                        </div>

                                        {/* Dynamic Categories */}
                                        {topLevelCategories.map((cat) => {
                                            return (
                                                <div
                                                    key={cat.id}
                                                    onMouseEnter={() => setActiveCategoryId(cat.id)}
                                                    onClick={() => {
                                                        navigate(`/marketplace?category=${cat.id}`);
                                                        setIsMegaMenuOpen(false);
                                                    }}
                                                    className={cn(
                                                        "px-6 py-3.5 cursor-pointer flex items-center gap-4 transition-all border-l-4",
                                                        activeCategoryId === cat.id 
                                                            ? "bg-slate-50 border-slate-900 text-slate-900 font-bold" 
                                                            : "border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                                    )}
                                                >
                                                    {getCategoryIconComponent(cat.nom_categorie, { className: cn("size-5", activeCategoryId === cat.id ? "text-slate-900" : "text-slate-400") })}
                                                    <span className="text-[15px] leading-tight flex-1">{cat.nom_categorie}</span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Right Content: Alibaba Grid Style */}
                                    <div className="flex-1 p-10 bg-white overflow-y-auto max-h-[650px] no-scrollbar">
                                        {activeCategory && (
                                            <motion.div
                                                key={activeCategory.id}
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="h-full"
                                            >
                                                <h3 className="text-2xl font-bold text-slate-900 mb-10 px-4">
                                                    {activeCategory.nom_categorie}
                                                </h3>

                                                <div className="grid grid-cols-4 lg:grid-cols-7 gap-y-12 gap-x-6">
                                                    {subItems.map((item, idx) => (
                                                        <Link
                                                            key={idx}
                                                            to={`/search?q=${encodeURIComponent(item.name)}`}
                                                            onClick={() => setIsMegaMenuOpen(false)}
                                                            className="flex flex-col items-center gap-4 group"
                                                        >
                                                            <div className="relative size-24 lg:size-28 rounded-full bg-slate-50 flex items-center justify-center border border-slate-50 group-hover:bg-slate-100 transition-all duration-300">
                                                                <span className="text-4xl lg:text-5xl group-hover:scale-110 transition-transform duration-500 drop-shadow-sm">
                                                                    {item.icon || '📦'}
                                                                </span>
                                                                
                                                                {/* Alibaba Badges (Blue Arrow / Orange Flame) */}
                                                                {item.badge && (
                                                                    <div className="absolute -top-1 -right-1 size-7 bg-white rounded-full shadow-sm flex items-center justify-center border border-slate-100">
                                                                        {item.badge === 'blue' ? (
                                                                            <TrendingUp className="size-4 text-blue-500 stroke-[3]" />
                                                                        ) : (
                                                                            <Flame className="size-4 text-orange-500 fill-orange-500" />
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <span className="text-[13px] text-center font-medium text-slate-700 group-hover:text-orange-500 transition-colors px-2 leading-tight max-w-[110px]">
                                                                {item.name}
                                                            </span>
                                                        </Link>
                                                    ))}
                                                </div>
                                                
                                                <div className="mt-16 pt-10 border-t border-slate-100 flex items-center justify-between px-4">
                                                    <p className="text-[15px] text-slate-400 font-medium italic">Parcourez les sélections en vedette de {activeCategory.nom_categorie}</p>
                                                    <Link 
                                                        to={`/marketplace?category=${activeCategory.id}`}
                                                        className="flex items-center gap-2 text-base font-bold text-slate-900 hover:text-orange-500 transition-colors"
                                                    >
                                                        Voir plus <ArrowRight className="size-5" />
                                                    </Link>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>


                    </div>


                    <nav className="flex items-center gap-6 lg:gap-8 flex-1">
                        <button
                            onClick={() => setIsAiModalOpen(true)}
                            className="text-sm font-black text-slate-900 dark:text-white hover:text-orange-500 whitespace-nowrap transition-colors flex items-center gap-2 group relative"
                        >
                            <Sparkles className="size-4 text-orange-500 group-hover:animate-bounce" />
                            Mode IA
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300" />
                        </button>
                        <PrefetchLink
                            to="/vendors"
                            queryKey={['products']}
                            queryFn={() => productService.getAll()}
                            className="text-sm font-semibold text-muted-foreground hover:text-[#FF6600] hover:underline whitespace-nowrap transition-colors"
                        >
                            Fabricants Vérifiés
                        </PrefetchLink>
                        <Link
                            to="/help"
                            className="text-sm font-semibold text-muted-foreground hover:text-[#FF6600] hover:underline whitespace-nowrap transition-colors"
                        >
                            Protection des commandes
                        </Link>
                        <Link
                            to="/tracking"
                            className="text-sm font-semibold text-muted-foreground hover:text-[#FF6600] hover:underline whitespace-nowrap transition-colors"
                        >
                            Suivi Logistique
                        </Link>
                        <Link
                            to="/marketplace?filter=flash"
                            className="text-sm font-semibold text-muted-foreground hover:text-[#FF6600] hover:underline whitespace-nowrap transition-colors relative"
                        >
                            Meilleures Offres
                            <span className="absolute -top-3 text-[10px] text-[#FF6600] font-black animate-pulse">Hot</span>
                        </Link>
                        {user && (
                            <Link
                                to={dashboardLink}
                                className="text-sm font-semibold text-muted-foreground hover:text-[#FF6600] hover:underline whitespace-nowrap transition-colors"
                            >
                                Mon Espace
                            </Link>
                        )}
                        <Link
                            to="/contact"
                            className="text-sm font-semibold text-muted-foreground hover:text-[#FF6600] hover:underline whitespace-nowrap transition-colors"
                        >
                            Contactez-nous
                        </Link>
                        <Link
                            to="/about"
                            className="text-sm font-semibold text-muted-foreground hover:text-[#FF6600] hover:underline whitespace-nowrap transition-colors"
                        >
                            À propos
                        </Link>
                    </nav>

                    <div className="flex items-center pl-4 border-l border-border/10 shrink-0">
                        <Link
                            to="/register?role=fournisseur"
                            className="text-sm font-bold text-[#FF6600] hover:underline whitespace-nowrap transition-colors"
                        >
                            Devenir Fournisseur sur BCA Connect
                        </Link>
                    </div>
                </div>
            </div>

            {/* ── Mobile Search ─────────────────────────────────────────────── */}
            <div className="md:hidden px-4 pb-4">
                <form onSubmit={handleSearch} className="w-full flex items-center rounded-full border border-[#FF6600] bg-background h-10 overflow-hidden">
                    <input
                        type="text"
                        placeholder="Rechercher..."
                        className="flex-1 h-full px-4 text-sm outline-none bg-transparent text-foreground"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button type="submit" className="h-full px-5 bg-[#FF6600] text-white font-bold text-sm">
                        Go
                    </button>
                </form>
            </div>

            {/* ── Mobile Sidebar ─────────────────────────────────────────────── */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMenuOpen(false)}
                            className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-card z-50 flex flex-col md:hidden overflow-y-auto"
                        >
                            {/* Mobile Header */}
                            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {user?.avatar_url ? (
                                        <img src={user.avatar_url} alt="" className="size-12 rounded-xl object-cover border-2 border-white/20" />
                                    ) : (
                                        <div className="size-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                                            <User className="size-6 text-white" />
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-bold text-white">
                                            {user ? `Bonjour, ${user.nom_complet?.split(' ')[0]}` : 'Bienvenue'}
                                        </p>
                                        {user ? (
                                            <RoleBadge role={user.role} />
                                        ) : (
                                            <p className="text-xs text-slate-400">Connectez-vous pour plus</p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsMenuOpen(false)}
                                    className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                                >
                                    <X className="size-5" />
                                </button>
                            </div>

                            <div className="flex-1 p-4 flex flex-col gap-6">
                                {/* Auth Buttons (guest) */}
                                {!user && (
                                    <div className="flex gap-3">
                                        <Link to="/register" onClick={() => setIsMenuOpen(false)} className="flex-1 text-center bg-[#FF6600] text-white py-3 rounded-2xl font-bold text-sm">
                                            S'inscrire
                                        </Link>
                                        <Link to="/login" onClick={() => setIsMenuOpen(false)} className="flex-1 text-center bg-muted text-foreground py-3 rounded-2xl font-bold text-sm">
                                            Se connecter
                                        </Link>
                                    </div>
                                )}

                                {/* Wallet (logged in) */}
                                {user && walletBalance !== null && (
                                    <Link
                                        to="/wallet"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100"
                                    >
                                        <Wallet className="size-5 text-emerald-600" />
                                        <div>
                                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Mon Wallet</p>
                                            <p className="text-base font-black text-emerald-800 tabular-nums">{walletBalance.toLocaleString()} GNF</p>
                                        </div>
                                    </Link>
                                )}

                                 {/* Mode IA Mobile */}
                                 <button 
                                     onClick={() => { setIsAiModalOpen(true); setIsMenuOpen(false); }}
                                     className="w-full flex items-center gap-4 p-5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-[2rem] shadow-xl shadow-orange-500/20 active:scale-95 transition-all group"
                                 >
                                     <div className="size-12 rounded-2xl bg-white/20 flex items-center justify-center">
                                         <Sparkles className="size-6 text-white group-hover:animate-spin" />
                                     </div>
                                     <div className="text-left">
                                         <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Assistant de sourcing</p>
                                         <p className="text-base font-black uppercase tracking-tight">Activer Mode IA</p>
                                     </div>
                                 </button>

                                {/* Navigation Links */}
                                <div className="flex flex-col gap-1">
                                    <h4 className="font-black text-[10px] text-muted-foreground uppercase tracking-widest px-2 pb-2">Navigation</h4>
                                    {[
                                        { to: '/marketplace', icon: Store, label: 'Marketplace' },
                                        { to: '/vendors', icon: ShieldCheck, label: 'Fournisseurs Certifiés' },
                                        { to: '/marketplace?filter=flash', icon: TrendingUp, label: 'Meilleures Offres' },
                                        ...(user ? [
                                            { to: dashboardLink, icon: LayoutDashboard, label: 'Mon Tableau de bord' },
                                            { to: '/orders', icon: Package, label: 'Mes commandes' },
                                            { to: '/notifications', icon: Bell, label: 'Notifications', badge: notificationCount },
                                        ] : []),
                                    ].map(item => (
                                        <Link
                                            key={item.to}
                                            to={item.to}
                                            onClick={() => setIsMenuOpen(false)}
                                            className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-foreground/5 transition-colors group"
                                        >
                                            <item.icon className="size-5 text-muted-foreground group-hover:text-[#FF6600] transition-colors" />
                                            <span className="font-semibold text-foreground group-hover:text-[#FF6600] transition-colors flex-1">{item.label}</span>
                                            {item.badge > 0 && (
                                                <span className="bg-[#FF6600] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full tabular-nums">{item.badge}</span>
                                            )}
                                        </Link>
                                    ))}
                                </div>

                                <div className="flex flex-col gap-1">
                                    <h4 className="font-black text-[10px] text-muted-foreground uppercase tracking-widest px-2 pb-2">Aide & Services</h4>
                                    {[
                                        { to: '/help', icon: HelpCircle, label: "Centre d'assistance" },
                                        { to: '/contact', icon: Globe, label: 'Contactez-nous' },
                                        { to: '/about', icon: ShieldCheck, label: 'À propos de BCA' },
                                        { to: '/register?role=fournisseur', icon: Store, label: 'Devenir Fournisseur' },
                                    ].map(item => (
                                        <Link
                                            key={item.to}
                                            to={item.to}
                                            onClick={() => setIsMenuOpen(false)}
                                            className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-foreground/5 transition-colors group"
                                        >
                                            <item.icon className="size-5 text-muted-foreground group-hover:text-[#FF6600] transition-colors" />
                                            <span className="font-semibold text-foreground group-hover:text-[#FF6600] transition-colors">{item.label}</span>
                                        </Link>
                                    ))}
                                </div>

                                {/* Theme + Language toggles */}
                                <div className="flex gap-3 pt-2 border-t border-border">
                                    <button
                                        onClick={toggleTheme}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-muted hover:bg-foreground/10 transition-colors font-bold text-sm"
                                    >
                                        {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
                                        {isDark ? 'Mode Clair' : 'Mode Sombre'}
                                    </button>
                                    <button
                                        onClick={() => changeLanguage(lang === 'FR' ? 'EN' : 'FR')}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-muted hover:bg-foreground/10 transition-colors font-bold text-sm"
                                    >
                                        <Globe className="size-4" />
                                        {lang === 'FR' ? 'English' : 'Français'}
                                    </button>
                                </div>

                                {/* Logout */}
                                {user && (
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors font-bold"
                                    >
                                        <LogOut className="size-4" />
                                        Déconnexion
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Navbar;
