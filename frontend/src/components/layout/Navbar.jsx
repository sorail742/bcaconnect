import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, ShoppingCart, Menu, X, ChevronDown, Store, Users, Package, Truck, HelpCircle, BookOpen,
    MessageSquare, Info, FileText, ShieldCheck, LogOut, LayoutDashboard,
    Moon, Sun, LogIn, Zap, Cog, Bell, Globe, Radar
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';
import { CartDrawer } from '../cart/CartDrawer';
import AdvancedSearchBar from '../AdvancedSearchBar';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { cartItems } = useCart();
    const { user } = useAuth();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const { lang, changeLanguage, t } = useLanguage();

    const cartCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

    const navStructure = [
        {
            label: t('marketplace'),
            icon: Store,
            children: [
                { to: "/marketplace", label: t('catalog').toUpperCase(), icon: Package, desc: "Accéder au catalogue" },
                { to: "/vendors", label: t('vendors').toUpperCase(), icon: Users, desc: "Voir les vendeurs" },
                { to: "/tracking", label: t('tracking').toUpperCase(), icon: Truck, desc: "Suivi logistique" },
            ]
        },
        {
            label: t('help'),
            icon: HelpCircle,
            children: [
                { to: "/faq", label: t('faq').toUpperCase(), icon: HelpCircle, desc: "Questions fréquentes" },
                { to: "/help", label: t('guide').toUpperCase(), icon: BookOpen, desc: "Guide d'utilisation" },
                { to: "/contact", label: t('contact').toUpperCase(), icon: MessageSquare, desc: "Nous contacter" },
            ]
        }
    ];

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-sm border-b border-border transition-all duration-300 shadow-sm">
            {/* Main Header - Agrandi */}
            <div className="container mx-auto px-6 py-4 flex items-center justify-between gap-6">
                
                {/* Logo - Plus grand */}
                <Link to="/" className="flex items-center gap-3 shrink-0 group">
                    <div className="size-10 rounded-xl bg-primary flex items-center justify-center text-foreground shadow-lg group-hover:rotate-6 transition-transform duration-500">
                        <Zap className="size-6" />
                    </div>
                    <div>
                        <span className="text-2xl font-bold text-foreground tracking-tight">BCA<span className="text-primary">CONNECT</span></span>
                        <p className="text-xs text-muted-foreground">Plateforme Commerce</p>
                    </div>
                </Link>

                {/* Advanced Search Bar - Barre de recherche avancée */}
                <div className="hidden lg:flex flex-1 max-w-2xl">
                    <AdvancedSearchBar 
                        placeholder="Rechercher produits, services..."
                        onSearch={(result) => {
                            if (result.type === 'text') {
                                navigate(`/search?q=${encodeURIComponent(result.query)}`);
                            } else if (result.type === 'image') {
                                navigate(`/search/image`, { state: { results: result.results } });
                            } else if (result.type === 'voice') {
                                navigate(`/search?q=${encodeURIComponent(result.query)}&type=voice`);
                            }
                        }}
                    />
                </div>

                {/* Control Hub */}
                <div className="flex items-center gap-4">
                    {/* Language Switcher */}
                    <div className="hidden sm:flex items-center bg-muted border border-border rounded-lg p-1">
                        <button 
                            onClick={() => changeLanguage('FR')} 
                            className={cn(
                                "px-3 py-1.5 text-sm font-semibold rounded transition-all",
                                lang === 'FR' ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            FR
                        </button>
                        <button 
                            onClick={() => changeLanguage('EN')} 
                            className={cn(
                                "px-3 py-1.5 text-sm font-semibold rounded transition-all",
                                lang === 'EN' ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            EN
                        </button>
                    </div>

                    {/* Theme Toggle */}
                    <button 
                        onClick={toggleTheme} 
                        className="p-2.5 rounded-lg bg-muted border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                    >
                        {theme === 'dark' ? <Moon className="size-5" /> : <Sun className="size-5 text-primary" />}
                    </button>

                    {/* Cart */}
                    <button 
                        onClick={() => setIsCartOpen(true)}
                        className="p-2.5 rounded-lg bg-muted border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-all relative"
                    >
                        <ShoppingCart className="size-5" />
                        {cartCount > 0 && (
                            <span className="absolute -top-2 -right-2 size-6 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                                {cartCount}
                            </span>
                        )}
                    </button>

                    <div className="w-px h-6 bg-border hidden sm:block" />

                    {/* User Section */}
                    {user ? (
                        <Link to={user.role === 'admin' ? '/admin/dashboard' : user.role === 'fournisseur' ? '/vendor/dashboard' : '/dashboard'} className="flex items-center gap-3 group">
                            <div className="hidden md:block text-right">
                                <p className="text-sm font-semibold text-foreground">{user.nom_complet?.split(' ')[0] || 'Utilisateur'}</p>
                                <p className="text-xs text-primary font-medium">Dashboard</p>
                            </div>
                            <div className="size-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <User className="size-5" />
                            </div>
                        </Link>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link to="/login" className="hidden sm:block text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
                                Connexion
                            </Link>
                            <Link to="/register">
                                <button className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold text-sm shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all">
                                    S'inscrire
                                </button>
                            </Link>
                        </div>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)} 
                        className="lg:hidden p-2.5 rounded-lg bg-muted border border-border text-foreground"
                    >
                        {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                    </button>
                </div>
            </div>

            {/* Sub-Navigation */}
            <div className="hidden lg:block w-full border-t border-border bg-background/50">
                <div className="container mx-auto px-6 h-12 flex items-center justify-center gap-8">
                    <Link to="/marketplace" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
                        Catalogue
                    </Link>
                    <Link to="/vendors" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
                        Vendeurs
                    </Link>
                    <Link to="/tracking" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
                        Suivi
                    </Link>
                    
                    <div className="h-4 w-px bg-border" />

                    {navStructure.map(menu => (
                        <div 
                            key={menu.label} 
                            className="relative h-full flex items-center group"
                            onMouseEnter={() => setActiveDropdown(menu.label)}
                            onMouseLeave={() => setActiveDropdown(null)}
                        >
                            <button className="flex items-center gap-2 text-sm font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                                {menu.label}
                                <ChevronDown className={cn("size-4 transition-transform duration-300", activeDropdown === menu.label && "rotate-180")} />
                            </button>
                            
                            <AnimatePresence>
                                {activeDropdown === menu.label && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-80"
                                    >
                                        <div className="bg-card border border-border rounded-lg shadow-lg p-2 space-y-1">
                                            {menu.children.map(child => (
                                                <Link key={child.to} to={child.to} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                                                    <div className="size-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                                                        <child.icon className="size-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-foreground">{child.label}</p>
                                                        <p className="text-xs text-muted-foreground">{child.desc}</p>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>

            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden absolute top-full left-0 right-0 bg-background border-b border-border p-4 space-y-4 shadow-lg"
                    >
                        <div className="lg:hidden mb-4">
                            <AdvancedSearchBar 
                                placeholder="Rechercher..."
                                onSearch={(result) => {
                                    navigate(`/search?q=${encodeURIComponent(result.query)}`);
                                    setIsMenuOpen(false);
                                }}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Link to="/marketplace" onClick={() => setIsMenuOpen(false)} className="bg-muted p-4 rounded-lg border border-border text-center space-y-2 hover:border-primary/40 transition-colors">
                                <Package className="size-5 mx-auto text-primary" />
                                <p className="text-sm font-semibold text-foreground">Catalogue</p>
                            </Link>
                            <Link to="/tracking" onClick={() => setIsMenuOpen(false)} className="bg-muted p-4 rounded-lg border border-border text-center space-y-2 hover:border-primary/40 transition-colors">
                                <Radar className="size-5 mx-auto text-primary" />
                                <p className="text-sm font-semibold text-foreground">Suivi</p>
                            </Link>
                        </div>

                        <div className="space-y-2 border-t border-border pt-4">
                            {user ? (
                                <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="h-11 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-semibold hover:bg-primary/90 transition-colors">
                                    Mon Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link to="/login" onClick={() => setIsMenuOpen(false)} className="h-11 bg-muted text-foreground rounded-lg flex items-center justify-center font-semibold border border-border hover:border-primary/40 transition-colors">
                                        Connexion
                                    </Link>
                                    <Link to="/register" onClick={() => setIsMenuOpen(false)} className="h-11 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-semibold hover:bg-primary/90 transition-colors">
                                        S'inscrire
                                    </Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Navbar;
