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
import { useLanguage } from '../../context/useLanguage';
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
import { ROLES, getDashboardRoute, getOrdersRoute, getWalletRoute, canUseCart } from '../../constants/roles';
import AiSourcingModal from '../ui/AiSourcingModal';
import { BcaMegaMenu } from '../landing/BcaMegaMenu';

// ─── Role badge ───────────────────────────────────────────────────────────────
function RoleBadge({ role, t }) {
    const map = {
        [ROLES.ADMIN]: { label: t('roleAdmin') || 'Admin', color: 'bg-rose-500' },
        [ROLES.FOURNISSEUR]: { label: t('roleSeller') || 'Fournisseur', color: 'bg-blue-500' },
        [ROLES.TRANSPORTEUR]: { label: t('roleCarrier') || 'Transporteur', color: 'bg-amber-500' },
        [ROLES.BANQUE]: { label: t('roleBank') || 'Banque', color: 'bg-emerald-600' },
    };
    const cfg = map[role] || { label: t('roleBuyer') || 'Client', color: 'bg-slate-400' };
    return (
        <span className={`${cfg.color} text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full`}>
            {cfg.label}
        </span>
    );
}

// Mega menu sub-items — voir lib/bcaLandingContent.js (utilisé par BcaMegaMenu)

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
    const userMenuRef = useRef(null);
    const headerRef = useRef(null);
    const megaMenuTimeoutRef = useRef(null);
    const [megaMenuTop, setMegaMenuTop] = useState(140);

    const { lang, changeLanguage, t } = useLanguage();
    const { theme, toggleTheme } = useTheme();
const isDark = theme === 'dark';
    const hideLayout = ['/login', '/register', '/onboarding', '/forgot-password', '/reset-password', '/ai-mode'].includes(location.pathname);

    const dashboardLink = user ? getDashboardRoute(user.role) : '/login';
    const ordersLink = user ? getOrdersRoute(user.role) : '/orders';
    const walletLink = user ? getWalletRoute(user.role) : '/wallet';
    const isBuyerLike = user && [ROLES.CLIENT, ROLES.ADMIN].includes(user.role);

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

    // ── Network Status ───────────────────────────────────────────────────
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // ── Close mobile menu on route change ─────────────────────────────────
    useEffect(() => { setIsMenuOpen(false); }, [location.pathname]);

    useEffect(() => {
        const syncMegaTop = () => {
            if (headerRef.current) {
                setMegaMenuTop(headerRef.current.getBoundingClientRect().bottom);
            }
        };
        syncMegaTop();
        window.addEventListener('resize', syncMegaTop);
        window.addEventListener('scroll', syncMegaTop, { passive: true });
        return () => {
            window.removeEventListener('resize', syncMegaTop);
            window.removeEventListener('scroll', syncMegaTop);
        };
    }, []);

    useEffect(() => {
        if (isMegaMenuOpen && headerRef.current) {
            setMegaMenuTop(headerRef.current.getBoundingClientRect().bottom);
        }
    }, [isMegaMenuOpen]);

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
        
        // Configuration de la langue de reconnaissance
        const langMap = {
            'FR': 'fr-FR',
            'EN': 'en-US',
            'SO': 'fr-FR', // On utilise le français comme base pour les langues locales si non supportées
            'PE': 'fr-FR',
            'MA': 'fr-FR'
        };
        
        recognition.lang = langMap[lang] || 'fr-FR';
        recognition.interimResults = true;
        recognition.start();
        setIsListening(true);
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setSearchQuery(transcript);
            if (event.results[0].isFinal) {
                setIsListening(false);
                navigate(`/search?q=${encodeURIComponent(transcript.trim())}`);
            }
        };

        recognition.onerror = (e) => {
            console.error("Voice search error:", e.error);
            setIsListening(false);
            if (e.error !== 'no-speech') {
                toast.error("Erreur lors de la capture vocale : " + e.error);
            }
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
    };

    const handleMegaMenuClose = () => {
        megaMenuTimeoutRef.current = setTimeout(() => {
            setIsMegaMenuOpen(false);
        }, 150);
    };

    return (
        <>
            <header ref={headerRef} className={cn(
                "w-full font-sans bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-[100] transition-shadow duration-300",
                isScrolled && "shadow-[0_4px_30px_rgba(0,0,0,0.06)]"
            )}>
            {/* ── Promotional Banner ───────────────────────────────────────── */}
            <div className="banner-gradient glass h-10 flex items-center justify-center relative overflow-hidden">
                <div className="flex items-center gap-4 z-10 relative text-white">
                    <span className="font-extrabold text-sm">BCA Work</span>
                    <span className="opacity-40 hidden sm:block">|</span>
                    <span className="text-sm hidden sm:block">🤖 {t('aiTeamBanner') || "Une équipe d'agents IA à votre service, 24/7"}</span>
                    <Link
                        to="/register"
                        className="ml-3 underline font-bold text-sm hover:opacity-80 transition-opacity"
                    >
                        {t('freeTrial') || "Essai gratuit"} →
                    </Link>
                </div>
                <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[#0050b3] skew-x-12 translate-x-12 z-0 opacity-40" />
            </div>

            {/* ── Main Header Row ──────────────────────────────────────────── */}
            <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-12 flex flex-wrap items-center gap-4 lg:gap-5">

                {/* Logo */}
                <Link to="/" className="flex-shrink-0">
                    <BcaLogo size="h-14 md:h-16" className="py-1" />
                </Link>

                {/* Search Bar */}
                <div className="hidden md:flex flex-1 min-w-0 max-w-none items-center gap-4">
                    <form onSubmit={handleSearch} className="flex-1 flex items-center rounded-full border-2 border-[#FF6600] bg-background transition-shadow hover:shadow-md focus-within:shadow-md h-12 overflow-hidden">
                        <input
                            type="text"
                            placeholder={t('searchPlaceholder')}
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
                            {t('explore')}
                        </button>
                    </form>

                    {/* Mode IA Button (BCA Style) */}
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
                        <span className="text-[11px] text-muted-foreground">{t('deliveryTo') || "Livraison vers :"}</span>
                        <div className="flex items-center gap-1.5 font-bold text-sm text-foreground group-hover:text-[#FF6600] transition-colors">
                            <span className="text-base leading-none">🇬🇳</span>
                            {t('guinea') || "Guinée"}
                        </div>
                    </div>

                    {/* Language Dropdown */}
                    <div className="hidden lg:relative lg:block group">
                        <button className="flex items-center gap-2 py-2 px-3 hover:bg-foreground/5 rounded-xl transition-all cursor-pointer">
                            <Globe className="size-5 text-foreground/70 group-hover:text-[#FF6600]" />
                            <span className="font-bold text-sm text-foreground group-hover:text-[#FF6600]">
                                {lang} · GNF
                            </span>
                        </button>
                        
                        <div className="absolute top-full right-0 mt-1 w-44 bg-card border border-border rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-1">
                            {[
                                { id: 'FR', label: 'Français', flag: '🇫🇷' },
                                { id: 'EN', label: 'English', flag: '🇺🇸' },
                                { id: 'SO', label: 'Soussou', flag: '🇬🇳' },
                                { id: 'PE', label: 'Pular', flag: '🇬🇳' },
                                { id: 'MA', label: 'Maninka', flag: '🇬🇳' },
                            ].map(l => (
                                <button
                                    key={l.id}
                                    onClick={() => changeLanguage(l.id)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-bold transition-all",
                                        lang === l.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                                    )}
                                >
                                    <span className="text-base">{l.flag}</span>
                                    {l.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Network Status Badge (Offline only) */}
                    {!isOnline && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-full animate-pulse">
                            <div className="size-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                            <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">
                                Mode Résilience
                            </span>
                        </div>
                    )}

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full text-foreground/70 hover:text-[#FF6600] hover:bg-foreground/5 transition-all"
                        title={isDark ? (t('lightMode') || "Passer au mode clair") : (t('darkMode') || "Passer au mode sombre")}
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

                    {/* Cart — clients uniquement */}
                    {(!user || canUseCart(user.role)) && (
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
                    )}

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
                                    <span className="block text-[11px] text-muted-foreground">{t('hello') || "Bonjour"}, {user.nom_complet?.split(' ')[0]}</span>
                                    <span className="block font-bold text-sm text-foreground group-hover:text-[#FF6600] transition-colors">{t('myAccount') || "Mon Compte"}</span>
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
                                                        <RoleBadge role={user.role} t={t} />
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
                                                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mb-0.5">{t('walletBalanceLabel') || "Solde Wallet"}</p>
                                                    <p className="text-base font-black text-emerald-800 tabular-nums leading-none">{walletBalance.toLocaleString(lang === 'FR' ? 'fr-GN' : 'en-US')} GNF</p>
                                                </div>
                                                <ChevronRight className="size-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                                            </Link>
                                        )}

                                        {/* Nav Links */}
                                        <div className="p-3 space-y-0.5">
                                            {[
                                                { to: dashboardLink, icon: LayoutDashboard, label: t('dashboard') },
                                                ...(isBuyerLike ? [
                                                    { to: ordersLink, icon: Package, label: t('myOrders') || 'Mes commandes' },
                                                    { to: walletLink, icon: CreditCard, label: t('myWallet') || 'Mon portefeuille' },
                                                ] : user?.role === ROLES.FOURNISSEUR ? [
                                                    { to: '/vendor/orders', icon: Package, label: 'Mes commandes' },
                                                ] : user?.role === ROLES.TECHNICIEN ? [
                                                    { to: '/technician/wallet', icon: CreditCard, label: 'Mon portefeuille' },
                                                ] : []),
                                                { to: '/notifications', icon: Bell, label: t('notifications') || 'Notifications', badge: notificationCount },
                                                { to: '/profile', icon: Settings, label: t('accountSettings') || 'Paramètres du compte' },
                                                { to: '/help', icon: HelpCircle, label: t('helpCenter') || "Centre d'assistance" },
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
                                                <span className="text-sm font-bold">{t('logout') || "Déconnexion"}</span>
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
                                    {t('login')}
                                </span>
                            </Link>
                            <Link
                                to="/register"
                                className="hidden md:flex items-center bg-[#FF6600] text-white px-4 py-2 rounded-full font-bold text-sm hover:bg-[#e65c00] transition-colors shadow-md whitespace-nowrap shrink-0 gap-2"
                            >
                                <Zap className="size-4" />
                                <span>{t('register')}</span>
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

            {/* ── Bottom Nav Row — alignée sous le header fixe (style Alibaba) ─ */}
            <div className="hidden md:block border-t border-border/5 bg-white dark:bg-gray-900">
                <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-12 flex items-center h-12">
                    <div
                        className="relative shrink-0 h-full flex items-center border-r border-border/10 pr-5 mr-5 lg:mr-8"
                        onMouseEnter={handleMegaMenuOpen}
                        onMouseLeave={handleMegaMenuClose}
                    >
                        <div className={cn(
                            'flex items-center gap-2 cursor-pointer group h-full transition-colors',
                            isMegaMenuOpen && 'text-[#FF6600]',
                        )}>
                            <Menu className={cn('size-5 transition-colors', isMegaMenuOpen ? 'text-[#FF6600]' : 'text-foreground group-hover:text-[#FF6600]')} />
                            <span className={cn('font-bold text-sm transition-colors whitespace-nowrap', isMegaMenuOpen ? 'text-[#FF6600]' : 'text-foreground group-hover:text-[#FF6600]')}>
                                {t('allCategories') || 'Toutes les catégories'}
                            </span>
                        </div>

                        <BcaMegaMenu
                            isOpen={isMegaMenuOpen}
                            top={megaMenuTop}
                            onMouseEnter={handleMegaMenuOpen}
                            onMouseLeave={handleMegaMenuClose}
                        />
                    </div>

                    <nav className="flex items-center gap-5 lg:gap-8 flex-1 min-w-0 overflow-x-auto scrollbar-none">
                        <PrefetchLink
                            to="/vendors"
                            queryKey={['products']}
                            queryFn={() => productService.getAll()}
                            className="text-sm font-semibold text-muted-foreground hover:text-[#FF6600] hover:underline whitespace-nowrap transition-colors"
                        >
                            {t('vendors')}
                        </PrefetchLink>
                        <Link
                            to="/help"
                            className="text-sm font-semibold text-muted-foreground hover:text-[#FF6600] hover:underline whitespace-nowrap transition-colors"
                        >
                            {t('orderProtection') || "Protection des commandes"}
                        </Link>
                        <Link
                            to="/tracking"
                            className="text-sm font-semibold text-muted-foreground hover:text-[#FF6600] hover:underline whitespace-nowrap transition-colors"
                        >
                            {t('tracking')}
                        </Link>
                        <Link
                            to="/marketplace?filter=flash"
                            className="text-sm font-semibold text-muted-foreground hover:text-[#FF6600] hover:underline whitespace-nowrap transition-colors relative"
                        >
                            {t('hotDeals') || "Meilleures Offres"}
                            <span className="absolute -top-3 text-[10px] text-[#FF6600] font-black animate-pulse">Hot</span>
                        </Link>
                        {user && (
                            <Link
                                to={dashboardLink}
                                className="text-sm font-semibold text-muted-foreground hover:text-[#FF6600] hover:underline whitespace-nowrap transition-colors"
                            >
                                {t('myDashboard') || "Mon Espace"}
                            </Link>
                        )}
                        <Link
                            to="/contact"
                            className="text-sm font-semibold text-muted-foreground hover:text-[#FF6600] hover:underline whitespace-nowrap transition-colors"
                        >
                            {t('contactUs') || "Contactez-nous"}
                        </Link>
                        <Link
                            to="/about"
                            className="text-sm font-semibold text-muted-foreground hover:text-[#FF6600] hover:underline whitespace-nowrap transition-colors"
                        >
                            {t('about')}
                        </Link>
                    </nav>

                    <Link
                        to="/register?role=fournisseur"
                        className="shrink-0 ml-4 text-sm font-bold text-[#FF6600] hover:underline whitespace-nowrap transition-colors hidden lg:flex items-center gap-1"
                    >
                        {t('sellOnBca') || 'Vendre sur BCA'}
                        <ArrowRight className="size-3.5" />
                    </Link>
                </div>
            </div>

            {/* ── Mobile Search ─────────────────────────────────────────────── */}
            <div className="md:hidden px-4 pb-4">
                <form onSubmit={handleSearch} className="w-full flex items-center rounded-full border border-[#FF6600] bg-background h-10 overflow-hidden">
                    <input
                        type="text"
                        placeholder={t('searchDots') || "Rechercher..."}
                        className="flex-1 h-full px-4 text-sm outline-none bg-transparent text-foreground"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button type="submit" className="h-full px-5 bg-[#FF6600] text-white font-bold text-sm">
                        Go
                    </button>
                </form>
            </div>
        </header>

            {/* ── Mobile Sidebar ─────────────────────────────────────────────── */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMenuOpen(false)}
                            className="fixed inset-0 bg-black/60 z-[110] md:hidden backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-card z-[120] flex flex-col md:hidden overflow-y-auto"
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
                                            ...(isBuyerLike ? [
                                                { to: ordersLink, icon: Package, label: 'Mes commandes' },
                                            ] : user.role === ROLES.FOURNISSEUR ? [
                                                { to: '/vendor/orders', icon: Package, label: 'Mes commandes' },
                                            ] : []),
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
        </>
    );
};

export default Navbar;
