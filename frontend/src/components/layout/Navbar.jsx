import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, ShoppingCart, Menu, X, ChevronDown, Camera, Search, Globe, LogIn,
    MapPin, Bell, LayoutDashboard, Package, Cog, LogOut, Heart, Wallet, Mic, Loader2,
    Sun, Moon
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLanguage } from '../../context/LanguageContext';
import useCart from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { useWallet, useCategories, useOrders, useUserProfile } from '../../hooks/useDomainData';
import { useTheme } from '../../context/ThemeContext';
import authService from '../../services/authService';
import BcaLogo from '../ui/BcaLogo';
import PrefetchLink from '../ui/PrefetchLink';
import { useQueryClient } from '@tanstack/react-query';
import orderService from '../../services/orderService';
import walletService from '../../services/walletService';
import userService from '../../services/userService';
import categoryService from '../../services/categoryService';
import productService from '../../services/productService';
import aiService from '../../services/aiService';
import { toast } from 'sonner';
const Navbar = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { cartItems, totalQuantity: cartCount } = useCart();
    const { user, logout } = useAuth();
    const { unreadCount: notificationCount } = useNotifications();
    const { data: walletData } = useWallet();
    const { data: categoriesData } = useCategories();
    
    const walletBalance = walletData ? parseFloat(walletData.solde_virtuel || 0) : null;
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { lang, changeLanguage } = useLanguage();

    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    const [isListening, setIsListening] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

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
            // Auto search
            navigate(`/search?q=${encodeURIComponent(transcript)}`);
        };

        recognition.onerror = () => {
            setIsListening(false);
            toast.error("Erreur lors de la capture vocale.");
        };

        recognition.onend = () => setIsListening(false);
    };

    const handleImageSearch = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsAnalyzing(true);
        try {
            const response = await aiService.analyzeImage(file);
            const { description, keywords } = response.data;
            const query = keywords?.[0] || description || "produit";
            navigate(`/search?q=${encodeURIComponent(query)}&type=image`);
        } catch (error) {
            console.error("Image search error", error);
            toast.error("Échec de l'analyse de l'image.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Pré-chargement des données utilisateur pour une UX "Elite"
    const prefetchUserData = () => {
        if (!user) return;
        setIsUserMenuOpen(true);
        
        // Prefetch orders
        queryClient.prefetchQuery({
            queryKey: ['orders'],
            queryFn: () => orderService.getAll(),
            staleTime: 30_000,
        });

        // Prefetch wallet
        queryClient.prefetchQuery({
            queryKey: ['wallet'],
            queryFn: () => walletService.getWallet(),
            staleTime: 10_000,
        });

        // Prefetch profile (on utilise authService pour éviter le 403 de userRoutes)
        queryClient.prefetchQuery({
            queryKey: ['user-profile'],
            queryFn: () => authService.getMe(),
            staleTime: 2 * 60_000,
        });
    };

    return (
        <header className="w-full font-sans bg-background border-b border-border/10">
            {/* Top Promotional Banner (Optional / Similar to Accio Work) */}
            <div className="bg-gradient-to-r from-[#b5f5ec] via-[#87e8de] to-[#0050b3] text-[#0050b3] h-10 flex items-center justify-center text-sm font-semibold relative overflow-hidden">
                <div translate="no" className="flex items-center gap-4 z-10">
                    <span className="font-extrabold text-white">BCA Work</span>
                    <span className="text-white/40">|</span>
                    <span className="flex-1 text-white">🤖 Une équipe d'agents d'IA à votre service, 24/7</span>
                    <Link to="/register" className="ml-4 underline font-bold text-white">Essai gratuit</Link>
                </div>
                {/* Decorative slant */}
                <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[#0050b3] skew-x-12 translate-x-10 z-0 opacity-50"></div>
                <Link to="/register" className="absolute right-32 z-10 underline font-bold text-white text-sm">Essai gratuit</Link>
            </div>

            {/* Main Header Row */}
            <div className="container mx-auto px-4 lg:px-8 py-4 lg:py-5 flex items-center gap-4 lg:gap-6">
                
                <Link to="/" className="flex-shrink-0">
                    <BcaLogo size="h-14 md:h-16" className="py-1" />
                </Link>

                {/* Prominent Search Bar */}
                <div className="hidden md:flex flex-1 min-w-0 max-w-2xl relative group">
                    <form onSubmit={handleSearch} className="w-full flex items-center rounded-full border-2 border-[#FF6600] bg-background transition-shadow hover:shadow-md focus-within:shadow-md h-12 overflow-hidden">
                        <input
                            type="text"
                            placeholder="Que recherchez-vous ?"
                            className="flex-1 h-full pl-5 pr-2 text-sm text-foreground bg-transparent outline-none placeholder:text-muted-foreground min-w-0"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        
                        <div className="flex items-center gap-1 px-2 border-l border-border/10">
                            {/* Voice Search */}
                            <button 
                                type="button"
                                onClick={handleVoiceSearch}
                                className={cn(
                                    "p-2 rounded-full transition-all",
                                    isListening ? "bg-red-500 text-white animate-pulse" : "text-muted-foreground hover:text-[#FF6600] hover:bg-foreground/5"
                                )}
                                title="Recherche vocale"
                            >
                                <Mic className="size-5" />
                            </button>

                            {/* Image Search */}
                            <label className="p-2 rounded-full text-gray-400 hover:text-[#FF6600] cursor-pointer hover:bg-gray-50 transition-all" title="Recherche par image">
                                {isAnalyzing ? <Loader2 className="size-5 animate-spin" /> : <Camera className="size-5" />}
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageSearch} disabled={isAnalyzing} />
                            </label>
                        </div>

                        <button type="submit" className="shrink-0 h-10 px-6 mx-1 bg-[#FF6600] text-white font-bold text-sm rounded-full hover:bg-[#e65c00] transition-colors whitespace-nowrap">
                            Rechercher
                        </button>
                    </form>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-3 lg:gap-4 shrink-0 ml-auto">
                    
                    {/* Delivery Location */}
                    <div className="hidden xl:flex flex-col cursor-pointer group">
                        <span className="text-[11px] text-muted-foreground">Adresse de livraison :</span>
                        <div className="flex items-center gap-1.5 font-bold text-sm text-foreground group-hover:text-[#FF6600] transition-colors">
                            <span className="text-base leading-none">🇬🇳</span>
                            GN
                        </div>
                    </div>

                    {/* Language / Currency */}
                    <button onClick={() => changeLanguage(lang === 'FR' ? 'EN' : 'FR')} className="hidden lg:flex items-center gap-2 cursor-pointer group">
                        <Globe className="size-5 text-foreground/70 group-hover:text-[#FF6600] transition-colors" />
                        <span className="font-bold text-sm text-foreground group-hover:text-[#FF6600] transition-colors">Français-GNF</span>
                    </button>

                    {/* Theme Toggle (Sun/Moon) */}
                    <button 
                        onClick={toggleTheme} 
                        className="p-2 rounded-full text-foreground/70 hover:text-[#FF6600] hover:bg-foreground/5 transition-all"
                        title={isDark ? "Passer au mode clair" : "Passer au mode sombre"}
                    >
                        {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
                    </button>

                    {/* Cart */}
                    <Link to="/cart" className="relative flex items-center group cursor-pointer">
                        <ShoppingCart className="size-6 text-foreground/70 group-hover:text-[#FF6600] transition-colors" />
                        {cartCount > 0 && (
                            <span className="absolute -top-1.5 -right-2 bg-[#FF6600] text-white text-[10px] font-bold px-1.5 rounded-full border-2 border-background">
                                {cartCount}
                            </span>
                        )}
                    </Link>

                    {/* User Auth Section */}
                    {user ? (
                        <div 
                            className="relative"
                            onMouseEnter={prefetchUserData}
                            onMouseLeave={() => setIsUserMenuOpen(false)}
                        >
                            <Link to="/dashboard" className="flex items-center gap-2 group cursor-pointer">
                                <User className="size-6 text-foreground/70 group-hover:text-[#FF6600] transition-colors" />
                                <div className="hidden lg:block text-left">
                                    <span className="block text-[11px] text-muted-foreground">Bonjour, {user.nom_complet?.split(' ')[0]}</span>
                                    <span className="block font-bold text-sm text-foreground group-hover:text-[#FF6600] transition-colors">Mon Compte</span>
                                </div>
                            </Link>
                            
                            <AnimatePresence>
                                {isUserMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute top-full right-0 mt-4 w-60 bg-card border border-border rounded-xl shadow-xl z-50 p-4"
                                    >
                                        <div className="mb-4">
                                            <p className="font-bold text-foreground">{user.nom_complet}</p>
                                            <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            {walletBalance !== null && (
                                                <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg mb-1">
                                                    <Wallet className="size-4 text-emerald-600" />
                                                    <div>
                                                        <p className="text-[10px] text-gray-500">Solde Wallet</p>
                                                        <p className="text-sm font-bold text-emerald-700">{walletBalance.toLocaleString()} GNF</p>
                                                    </div>
                                                </div>
                                            )}
                                            <Link to="/dashboard" className="text-sm text-gray-700 hover:text-[#FF6600] py-1">Tableau de bord</Link>
                                            <Link to="/dashboard/orders" className="text-sm text-gray-700 hover:text-[#FF6600] py-1">Mes commandes</Link>
                                            <Link to="/wallet" className="text-sm text-gray-700 hover:text-[#FF6600] py-1">Mon portefeuille</Link>
                                            <Link to="/dashboard/profile" className="text-sm text-gray-700 hover:text-[#FF6600] py-1">Paramètres</Link>
                                            <Link to="/dashboard" className="text-sm text-foreground hover:text-[#FF6600] py-1">Tableau de bord</Link>
                                            <Link to="/dashboard/orders" className="text-sm text-foreground hover:text-[#FF6600] py-1">Mes commandes</Link>
                                            <Link to="/wallet" className="text-sm text-foreground hover:text-[#FF6600] py-1">Mon portefeuille</Link>
                                            <Link to="/dashboard/profile" className="text-sm text-foreground hover:text-[#FF6600] py-1">Paramètres</Link>
                                            <hr className="my-2 border-border" />
                                            <button onClick={() => logout()} className="text-sm text-left text-red-600 hover:text-red-700 py-1">Déconnexion</button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 shrink-0">
                            <Link to="/login" className="flex items-center gap-1.5 group whitespace-nowrap">
                                <User className="size-5 text-foreground/70 group-hover:text-[#FF6600] transition-colors shrink-0" />
                                <span className="hidden md:block font-bold text-sm text-foreground group-hover:text-[#FF6600] transition-colors">Se connecter</span>
                            </Link>
                            <Link to="/register" className="flex items-center bg-[#FF6600] text-primary-foreground px-4 py-2 rounded-full font-bold text-sm hover:bg-[#e65c00] transition-colors shadow-md whitespace-nowrap shrink-0">
                                <span className="hidden sm:inline">Créer un compte</span>
                                <span className="sm:hidden">S'inscrire</span>
                            </Link>
                        </div>
                    )}
                    
                    {/* Mobile Menu Toggle */}
                    <button onClick={() => setIsMenuOpen(true)} className="md:hidden text-foreground">
                        <Menu className="size-7" />
                    </button>
                </div>
            </div>

            {/* Bottom Navigation Row */}
            <div className="hidden md:flex border-t border-gray-100">
                <div className="container mx-auto px-4 lg:px-8 flex items-center h-12 overflow-x-auto no-scrollbar gap-6 lg:gap-8 cursor-default">
                    
                    <PrefetchLink 
                        to="/marketplace" 
                        queryKey={['categories']}
                        queryFn={() => categoryService.getAll()}
                        className="flex items-center gap-2 cursor-pointer group pr-4 border-r border-gray-200"
                    >
                        <Menu className="size-5 text-gray-900 group-hover:text-[#FF6600] transition-colors" />
                        <span className="font-bold text-sm text-gray-900 group-hover:text-[#FF6600] transition-colors whitespace-nowrap">Toutes les catégories</span>
                    </PrefetchLink>

                    <nav className="flex items-center gap-6 lg:gap-8 flex-1">
                        <PrefetchLink 
                            to="/marketplace" 
                            queryKey={['products']}
                            queryFn={() => productService.getAll()}
                            className="text-sm font-semibold text-gray-600 hover:text-[#FF6600] hover:underline whitespace-nowrap transition-colors"
                        >
                            Fabricants Vérifiés
                        </PrefetchLink>
                        <Link to="/marketplace" className="text-sm font-semibold text-gray-600 hover:text-[#FF6600] hover:underline whitespace-nowrap transition-colors">Protection des commandes</Link>
                        <Link to="/marketplace" className="text-sm font-semibold text-gray-600 hover:text-[#FF6600] hover:underline whitespace-nowrap transition-colors">Soutien Logistique</Link>
                        <Link 
                            to="/marketplace" 
                            className="text-sm font-semibold text-gray-600 hover:text-[#FF6600] hover:underline whitespace-nowrap transition-colors relative"
                        >
                            Meilleures Offres
                            <span className="absolute -top-3 text-[10px] text-[#FF6600] animate-pulse">Hot</span>
                        </Link>
                        <Link to="/dashboard" className="text-sm font-semibold text-gray-600 hover:text-[#FF6600] hover:underline whitespace-nowrap transition-colors">Mon Espace</Link>
                        <Link to="/contact" className="text-sm font-semibold text-gray-600 hover:text-[#FF6600] hover:underline whitespace-nowrap transition-colors">Contactez-nous</Link>
                        <Link to="/about" className="text-sm font-semibold text-gray-600 hover:text-[#FF6600] hover:underline whitespace-nowrap transition-colors">À propos</Link>
                    </nav>

                    <div className="flex items-center pl-4 border-l border-gray-200">
                        <Link to="/register?role=fournisseur" className="text-sm font-semibold text-gray-600 hover:text-[#FF6600] whitespace-nowrap transition-colors">
                            Vendre sur BCA Connect
                        </Link>
                    </div>
                </div>
            </div>

            {/* Mobile Search Input (Visible only on mobile) */}
            <div className="md:hidden px-4 pb-4">
                <form onSubmit={handleSearch} className="w-full flex items-center rounded-full border border-[#FF6600] bg-background h-10 overflow-hidden">
                    <input
                        type="text"
                        placeholder="Rechercher..."
                        className="flex-1 h-full px-4 text-sm outline-none bg-transparent text-foreground"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button type="submit" className="h-full px-5 bg-[#FF6600] text-primary-foreground font-bold text-sm">
                        Go
                    </button>
                </form>
            </div>

            {/* Mobile Sidebar Navigation */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMenuOpen(false)}
                            className="fixed inset-0 bg-black/60 z-40 md:hidden"
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 left-0 bottom-0 w-[85%] bg-card z-50 flex flex-col md:hidden overflow-y-auto"
                        >
                            <div className="bg-primary p-6 text-primary-foreground flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                        <User className="size-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold">{user ? `Bonjour, ${user.nom_complet?.split(' ')[0]}` : 'Bienvenue'}</p>
                                        {!user && <p className="text-xs opacity-90">Identifiez-vous ou créez un compte</p>}
                                    </div>
                                </div>
                                <button onClick={() => setIsMenuOpen(false)}><X className="size-6" /></button>
                            </div>

                            <div className="flex-1 p-4 flex flex-col gap-6">
                                {!user && (
                                    <div className="flex gap-2">
                                        <Link to="/register" onClick={() => setIsMenuOpen(false)} className="flex-1 text-center bg-primary text-primary-foreground py-2 rounded-full font-bold text-sm">S'inscrire</Link>
                                        <Link to="/login" onClick={() => setIsMenuOpen(false)} className="flex-1 text-center bg-muted text-foreground py-2 rounded-full font-bold text-sm">Se connecter</Link>
                                    </div>
                                )}

                                <div className="flex flex-col gap-4">
                                    <h4 className="font-bold text-foreground border-b border-border pb-2">Catégories Plébiscitées</h4>
                                    <Link to="/marketplace" onClick={() => setIsMenuOpen(false)} className="text-muted-foreground hover:text-primary">Tous les produits</Link>
                                    <Link to="/vendors" onClick={() => setIsMenuOpen(false)} className="text-muted-foreground hover:text-primary">Vendeurs Locaux</Link>
                                    <Link to="/marketplace?filter=flash" onClick={() => setIsMenuOpen(false)} className="text-muted-foreground hover:text-primary">Ventes Flash</Link>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <h4 className="font-bold text-foreground border-b border-border pb-2">Services & Aide</h4>
                                    <Link to="/help" onClick={() => setIsMenuOpen(false)} className="text-muted-foreground hover:text-primary">Protection des commandes</Link>
                                    <Link to="/help" onClick={() => setIsMenuOpen(false)} className="text-muted-foreground hover:text-primary">Centre d'assistance</Link>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Navbar;

