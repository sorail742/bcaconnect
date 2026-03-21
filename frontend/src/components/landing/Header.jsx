import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "../ui/Button"
import { Menu, X, ShoppingCart, Search, Bell, ChevronDown, Store, Users, Package, Truck, Sparkles, User, LogIn } from "lucide-react"
import { useCart } from "../../context/CartContext"
import { useAuth } from "../../hooks/useAuth"
import ThemeToggle from "../ui/ThemeToggle"

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isCartOpen, setIsCartOpen] = useState(false)
    const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false)
    const { cartItems, cartTotal, removeFromCart } = useCart()
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const cartCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0)

    const shopLinks = [
        { to: "/marketplace", label: "Catalogue Produits", icon: Package, desc: "Parcourir tous les produits" },
        { to: "/vendors", label: "Liste des Vendeurs", icon: Users, desc: "Trouver un marchand certifié" },
        { to: "/tracking", label: "Suivi de Colis", icon: Truck, desc: "Où est ma commande ?" },
    ]

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border shadow-sm">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5 group" translate="no">
                        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                            <span className="text-primary-foreground font-black text-sm italic">BC</span>
                        </div>
                        <span className="font-black text-xl text-foreground italic tracking-tight">BCA Connect</span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-1">
                        {/* Shop Mega-Dropdown */}
                        <div
                            className="relative"
                            onMouseEnter={() => setIsShopDropdownOpen(true)}
                            onMouseLeave={() => setIsShopDropdownOpen(false)}
                        >
                            <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-primary hover:bg-primary/10 transition-all">
                                <Store className="size-4" />
                                Marketplace
                                <ChevronDown className={`size-3.5 transition-transform duration-300 ${isShopDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isShopDropdownOpen && (
                                <div className="absolute top-full left-0 pt-2 w-72 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl shadow-slate-900/20 p-2 overflow-hidden">
                                        <div className="px-3 py-2 mb-1">
                                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground">Explorer</span>
                                        </div>
                                        {shopLinks.map(link => (
                                            <Link
                                                key={link.to}
                                                to={link.to}
                                                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-muted/60 transition-all group/item"
                                            >
                                                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover/item:bg-primary group-hover/item:text-white transition-all">
                                                    <link.icon className="size-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-foreground">{link.label}</p>
                                                    <p className="text-[10px] text-muted-foreground font-medium">{link.desc}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <a href="#features" className="px-4 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all font-medium">
                            Fonctionnalités
                        </a>
                        <a href="#how-it-works" className="px-4 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all font-medium">
                            Comment ça marche
                        </a>
                    </nav>

                    {/* Right Side Actions */}
                    <div className="hidden md:flex items-center gap-2">
                        <ThemeToggle minimal />

                        {/* Cart Button */}
                        <div className="relative">
                            <button
                                onClick={() => setIsCartOpen(!isCartOpen)}
                                className="relative flex items-center gap-2 px-4 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all group"
                            >
                                <ShoppingCart className="size-5 group-hover:scale-110 transition-transform" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 size-5 bg-primary text-primary-foreground text-[9px] font-black rounded-full flex items-center justify-center shadow-md shadow-primary/30 border-2 border-background animate-bounce">
                                        {cartCount}
                                    </span>
                                )}
                            </button>

                            {/* Cart Dropdown */}
                            {isCartOpen && (
                                <div className="absolute top-full right-0 pt-2 w-80 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl shadow-slate-900/20 overflow-hidden">
                                        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                                            <div>
                                                <p className="text-[10px] font-black text-primary uppercase tracking-widest">Panier</p>
                                                <p className="text-sm font-black text-foreground italic">{cartCount} article(s)</p>
                                            </div>
                                            <button onClick={() => setIsCartOpen(false)} className="p-1 rounded-lg hover:bg-muted transition-all">
                                                <X className="size-4 text-muted-foreground" />
                                            </button>
                                        </div>

                                        {cartItems.length === 0 ? (
                                            <div className="py-12 text-center space-y-3">
                                                <div className="size-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                                                    <ShoppingCart className="size-7 text-muted-foreground/40" />
                                                </div>
                                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Panier vide</p>
                                            </div>
                                        ) : (
                                            <div className="max-h-64 overflow-y-auto">
                                                {cartItems.map((item, i) => {
                                                    const name = item.nom_produit || item.name || 'Produit';
                                                    const price = parseFloat(item.prix_unitaire || item.price || 0);
                                                    const img = item.image || 'https://images.unsplash.com/photo-1523275319145-80b01958f7a2?auto=format&fit=crop&q=80&w=60';
                                                    return (
                                                        <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-all group border-b border-border/30 last:border-0">
                                                            <img src={img} className="size-12 rounded-xl object-cover border border-border" alt={name} />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-black text-foreground truncate">{name}</p>
                                                                <p className="text-[10px] text-primary font-black italic">{(price * (item.quantity || 1)).toLocaleString('fr-FR')} GNF</p>
                                                            </div>
                                                            <button onClick={() => removeFromCart(item.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-destructive/10 text-destructive transition-all">
                                                                <X className="size-3" />
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {cartItems.length > 0 && (
                                            <div className="p-4 border-t border-border bg-muted/30 space-y-2">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total</span>
                                                    <span className="text-sm font-black text-foreground italic">{cartTotal.toLocaleString('fr-FR')} GNF</span>
                                                </div>
                                                <div className="grid grid-cols-1 gap-2">
                                                    <Link to="/cart" onClick={() => setIsCartOpen(false)}>
                                                        <Button variant="outline" className="w-full h-10 rounded-xl font-black uppercase tracking-widest text-[9px] border-border hover:bg-muted transition-all">
                                                            Voir le panier
                                                        </Button>
                                                    </Link>
                                                    <Link to="/checkout" onClick={() => setIsCartOpen(false)}>
                                                        <Button className="w-full h-11 rounded-xl font-black uppercase tracking-widest text-[9px] shadow-lg shadow-primary/20">
                                                            Paiement sécurisé
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Auth Buttons */}
                        {user ? (
                            <div className="flex items-center gap-2 pl-2 border-l border-border">
                                <div className="hidden sm:flex flex-col items-end">
                                    <p className="text-[10px] font-black text-foreground leading-none">{user.nom_complet?.split(' ')[0]}</p>
                                    <p className="text-[9px] text-primary font-black uppercase tracking-widest mt-0.5 italic">{user.role}</p>
                                </div>
                                <Link to="/dashboard">
                                    <div className="size-9 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary hover:border-primary hover:bg-primary hover:text-white transition-all">
                                        <User className="size-4" />
                                    </div>
                                </Link>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 pl-2 border-l border-border">
                                <Link to="/login">
                                    <Button variant="ghost" size="sm" className="font-bold rounded-xl gap-2">
                                        <LogIn className="size-4" />
                                        Connexion
                                    </Button>
                                </Link>
                                <Link to="/register">
                                    <Button size="sm" className="font-black rounded-xl shadow-lg shadow-primary/20">
                                        S'inscrire
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="md:hidden flex items-center gap-2">
                        {/* Mobile Cart */}
                        <button
                            onClick={() => setIsCartOpen(!isCartOpen)}
                            className="relative p-2 text-muted-foreground hover:text-foreground"
                        >
                            <ShoppingCart className="size-5" />
                            {cartCount > 0 && (
                                <span className="absolute top-0.5 right-0.5 size-4 bg-primary text-white text-[8px] font-black rounded-full flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                        <button
                            className="p-2 text-foreground"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Drawer */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 border-t border-border">
                        <nav className="flex flex-col gap-1">
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground px-3 py-2">Marketplace</p>
                            {shopLinks.map(link => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                                >
                                    <link.icon className="size-4 text-primary" />
                                    <span className="text-sm font-bold">{link.label}</span>
                                </Link>
                            ))}
                            <div className="h-px bg-border my-2 mx-3"></div>
                            <a href="#features" className="px-3 py-3 rounded-xl text-sm text-muted-foreground hover:bg-muted transition-all font-medium">Fonctionnalités</a>
                            <a href="#how-it-works" className="px-3 py-3 rounded-xl text-sm text-muted-foreground hover:bg-muted transition-all font-medium">Comment ça marche</a>
                            <div className="flex flex-col gap-2 pt-4 px-3">
                                {user ? (
                                    <Link to="/dashboard">
                                        <Button className="w-full font-black">Mon Dashboard</Button>
                                    </Link>
                                ) : (
                                    <>
                                        <Link to="/login">
                                            <Button variant="ghost" size="sm" className="w-full font-bold">Se connecter</Button>
                                        </Link>
                                        <Link to="/register">
                                            <Button size="sm" className="w-full font-black">Commencer</Button>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    )
}
