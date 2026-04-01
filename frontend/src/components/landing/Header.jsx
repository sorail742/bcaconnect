import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "../ui/Button"
import {
    Menu, X, ShoppingCart, Search, ChevronDown,
    Store, Users, Package, Truck, HelpCircle,
    BookOpen, MessageSquare, Info, FileText,
    ShieldCheck, User
} from "lucide-react"
import { useCart } from "../../context/CartContext"
import { useAuth } from "../../hooks/useAuth"
import ThemeToggle from "../ui/ThemeToggle"
import { cn } from "../../lib/utils"

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false)
    const [isSupportDropdownOpen, setIsSupportDropdownOpen] = useState(false)
    const { cartItems, cartTotal, removeFromCart } = useCart()
    const { user } = useAuth()
    const navigate = useNavigate()

    const cartCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0)

    const shopLinks = [
        { to: "/marketplace", label: "Catalogue Produits", icon: Package, desc: "Parcourir tous les produits" },
        { to: "/vendors", label: "Liste des Vendeurs", icon: Users, desc: "Trouver un marchand certifié" },
        { to: "/tracking", label: "Suivi de Colis", icon: Truck, desc: "Où est ma commande ?" },
    ]

    const supportLinks = [
        { to: "/faq", label: "FAQ", icon: HelpCircle, desc: "Réponses à vos questions" },
        { to: "/help", label: "Guide & Aide", icon: BookOpen, desc: "Ressources pour démarrer" },
        { to: "/contact", label: "Nous contacter", icon: MessageSquare, desc: "Support technique 24/7" },
    ]

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-all duration-300">
            <div className="container mx-auto px-4 flex items-center justify-between h-20">

                {/* Brand Logo */}
                <div className="flex items-center gap-10">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/10 group-hover:rotate-3 transition-all duration-500">
                            <span className="font-bold text-lg">BC</span>
                        </div>
                        <span className="font-bold text-xl text-slate-900 dark:text-white hidden sm:block tracking-tight">
                            BCA<span className="text-primary">Connect</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden xl:flex items-center gap-1">
                        {/* Marketplace Dropdown */}
                        <div
                            className="relative"
                            onMouseEnter={() => setIsShopDropdownOpen(true)}
                            onMouseLeave={() => setIsShopDropdownOpen(false)}
                        >
                            <button className={cn(
                                "flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-all duration-300",
                                isShopDropdownOpen ? "text-primary bg-primary/5" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                            )}>
                                <Store className="size-4.5" />
                                MARKETPLACE
                                <ChevronDown className={cn("size-4 opacity-50 transition-transform duration-300", isShopDropdownOpen && "rotate-180")} />
                            </button>
                            {isShopDropdownOpen && (
                                <div className="absolute top-full left-0 pt-2 w-80 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-2 overflow-hidden">
                                        {shopLinks.map(link => (
                                            <Link
                                                key={link.to}
                                                to={link.to}
                                                className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group/item"
                                            >
                                                <div className="size-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover/item:bg-primary group-hover/item:text-white transition-all">
                                                    <link.icon className="size-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{link.label}</p>
                                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">{link.desc}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Support Dropdown */}
                        <div
                            className="relative"
                            onMouseEnter={() => setIsSupportDropdownOpen(true)}
                            onMouseLeave={() => setIsSupportDropdownOpen(false)}
                        >
                            <button className={cn(
                                "flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-all duration-300",
                                isSupportDropdownOpen ? "text-primary bg-primary/5" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                            )}>
                                <HelpCircle className="size-4.5" />
                                AIDE
                                <ChevronDown className={cn("size-4 opacity-50 transition-transform duration-300", isSupportDropdownOpen && "rotate-180")} />
                            </button>
                            {isSupportDropdownOpen && (
                                <div className="absolute top-full left-0 pt-2 w-80 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-2 overflow-hidden">
                                        {supportLinks.map(link => (
                                            <Link
                                                key={link.to}
                                                to={link.to}
                                                className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group/item"
                                            >
                                                <div className="size-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover/item:bg-primary group-hover/item:text-white transition-all">
                                                    <link.icon className="size-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{link.label}</p>
                                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">{link.desc}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <a href="/#features" className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">FONCTIONNALITÉS</a>
                    </nav>
                </div>

                {/* Actions Section */}
                <div className="flex items-center gap-3 sm:gap-6">
                    <ThemeToggle minimal />

                    {/* Cart Button */}
                    <div className="relative group/cart">
                        <Link to="/cart" className="size-11 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-primary transition-all relative">
                            <ShoppingCart className="size-5 group-hover/cart:scale-110 transition-transform" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 size-5 bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-950">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                    </div>

                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

                    {/* Desktop Auth */}
                    <div className="hidden md:flex items-center gap-3">
                        {user ? (
                            <Link to="/dashboard" className="flex items-center gap-3 pl-2 h-11 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all group">
                                <div className="text-right hidden sm:block">
                                    <p className="text-xs font-bold leading-none">{user.nom_complet}</p>
                                    <p className="text-[10px] text-primary font-bold uppercase mt-1 leading-none">{user.role}</p>
                                </div>
                                <div className="size-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                    <User className="size-5" />
                                </div>
                            </Link>
                        ) : (
                            <>
                                <Link to="/login">
                                    <Button variant="ghost" className="font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 text-xs">CONNEXION</Button>
                                </Link>
                                <Link to="/register">
                                    <Button className="h-11 px-8 rounded-xl font-bold text-xs shadow-lg shadow-primary/15 hover:scale-105 active:scale-95 transition-all">DÉMARRER</Button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        className="xl:hidden size-11 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white active:scale-95 transition-all"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
                    </button>
                </div>

                {/* Mobile Drawer */}
                {isMenuOpen && (
                    <div className="absolute top-full left-0 right-0 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-900 p-4 space-y-6 animate-in slide-in-from-top-2 duration-300 xl:hidden">
                        <div className="space-y-2">
                            <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3">Marketplace</h5>
                            {shopLinks.map(link => (
                                <Link key={link.to} to={link.to} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-primary/5 text-slate-900 dark:text-white font-bold text-sm transition-all">
                                    <link.icon className="size-5 text-primary" />
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                        <div className="h-px bg-slate-100 dark:bg-slate-900 mx-2" />
                        <div className="px-2 space-y-3 pb-4">
                            {user ? (
                                <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                                    <Button className="w-full h-12 rounded-xl">Mon Dashboard</Button>
                                </Link>
                            ) : (
                                <>
                                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                                        <Button variant="outline" className="w-full h-12 rounded-xl">Se connecter</Button>
                                    </Link>
                                    <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                                        <Button className="w-full h-12 rounded-xl">Ouvrir un compte</Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    )
}
