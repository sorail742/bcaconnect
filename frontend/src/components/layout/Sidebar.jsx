import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Package, ShoppingCart, Store, Receipt,
    Users, MessageSquare, User, Truck, Plus, Landmark,
    Folder, RotateCcw, Bell, Wallet, Settings, LogOut,
    Megaphone, Gavel, X, Shield, Search, Satellite, Zap
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';
import { useRBAC } from '../../hooks/useRBAC';
import messageService from '../../services/messageService';
import socketService from '../../services/socketService';

const Sidebar = ({ isOpen, isCollapsed, onClose }) => {
    const { user, logout } = useAuth();
    const { can } = useRBAC();
    const navigate = useNavigate();
    const [unreadMessages, setUnreadMessages] = useState(0);

    // Charger le nombre de messages non lus
    useEffect(() => {
        const fetchUnread = async () => {
            const count = await messageService.getUnreadCount();
            setUnreadMessages(count);
        };
        fetchUnread();

        // Écouter les nouveaux messages via socket
        socketService.connect();
        const handleNewMsg = () => {
            setUnreadMessages(prev => prev + 1);
        };
        socketService.on('new_message', handleNewMsg);
        return () => socketService.off('new_message', handleNewMsg);
    }, []);

    const menuItems = {
        admin: [
            { path: '/admin/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
            { path: '/admin/users', label: 'Utilisateurs', icon: Users, permission: 'manage_users' },
            { path: '/admin/products', label: 'Produits', icon: Package },
            { path: '/admin/categories', label: 'Catégories', icon: Folder, permission: 'manage_categories' },
            { path: '/admin/disputes', label: 'Litiges', icon: Gavel, permission: 'solve_disputes' },
            { path: '/admin/transactions', label: 'Transactions', icon: Receipt, permission: 'view_all_transactions' },
            { path: '/admin/ads', label: 'Publicités', icon: Megaphone, permission: 'manage_ads' },
            { path: '/messages', label: 'Messages', icon: MessageSquare, badge: unreadMessages },
            { path: '/bank/dashboard', label: 'Panel Financier', icon: Landmark, permission: 'view_all_transactions' },
        ],
        fournisseur: [
            { path: '/vendor/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
            { path: '/vendor/products', label: 'Mes Produits', icon: Package, permission: 'manage_own_products' },
            { path: '/vendor/orders', label: 'Commandes', icon: ShoppingCart, permission: 'view_own_orders' },
            { path: '/admin/ads', label: 'Mes Publicités', icon: Megaphone, permission: 'manage_ads' },
            { path: '/vendor/store', label: 'Ma Boutique', icon: Store, permission: 'manage_own_store' },
            { path: '/messages', label: 'Messages', icon: MessageSquare, badge: unreadMessages },
        ],
        transporteur: [
            { path: '/carrier/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
            { path: '/tracking', label: 'Livraisons', icon: Truck, permission: 'view_available_deliveries' },
            { path: '/messages', label: 'Messages', icon: MessageSquare, badge: unreadMessages },
        ],
        client: [
            { path: '/dashboard', label: 'Mon Espace', icon: LayoutDashboard },
            { path: '/marketplace', label: 'Marché', icon: Store },
            { path: '/vendors', label: 'Vendeurs', icon: Users },
            { path: '/orders', label: 'Mes Commandes', icon: ShoppingCart, permission: 'view_own_history' },
            { path: '/payments', label: 'Paiements', icon: Wallet },
            { path: '/tracking', label: 'Livraisons', icon: Truck },
            { path: '/messages', label: 'Messages', icon: MessageSquare, badge: unreadMessages },
        ]
    };

    const currentMenu = (menuItems[user?.role] || menuItems.client).filter(item => {
        if (!item.permission) return true;
        return can(item.permission);
    });

    return (
        <>
            {/* Overlay Mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-background/40 backdrop-blur-md z-[60] md:hidden animate-in fade-in duration-500"
                    onClick={onClose}
                />
            )}

            <aside className={cn(
                "fixed inset-y-0 left-0 bg-card border-r border-border flex flex-col justify-between py-6 px-4 z-[70] sidebar-transition md:relative md:translate-x-0 md:flex shadow-sm h-screen overflow-hidden",
                isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
                isCollapsed ? "w-20" : "w-64"
            )}>
                {/* Branding Hub — Central Intelligence */}
                <div className="flex flex-col h-full overflow-hidden">
                    <div className={cn(
                        "flex items-center gap-4 px-2 mb-12 group cursor-default relative z-10 shrink-0",
                        isCollapsed ? "justify-center" : "justify-start"
                    )}>
                        <div className="shrink-0 relative">
                            <div className="absolute inset-0 bg-primary/10 blur-[24px] rounded-full scale-150 animate-pulse pointer-events-none" />
                            <div className="size-8 rounded-xl bg-primary flex items-center justify-center shadow-lg relative z-10 group-hover:scale-105 transition-transform duration-500">
                                <Zap className="size-5 text-primary-foreground fill-current" />
                            </div>
                        </div>
                        {!isCollapsed && (
                            <div className="flex flex-col min-w-0 animate-in text-left">
                                <h1 className="text-foreground text-sm font-bold tracking-tight uppercase">BCA Connect</h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="size-1.5 rounded-full bg-primary animate-pulse" />
                                    <p className="text-primary text-[8px] font-bold uppercase tracking-widest leading-none">
                                        {user?.role === 'admin' ? 'Administrateur' : 'Marchand'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Navigation Ledger — Execution Directives */}
                    <div data-lenis-prevent="true" className="flex-1 overflow-y-auto pb-10 space-y-6">
                        {/* Search Console */}
                        {!isCollapsed && (
                            <div className="px-2 animate-in" style={{ animationDelay: '0.1s' }}>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                    <input 
                                        className="w-full h-9 pl-9 pr-3 bg-muted border border-border rounded-lg text-xs placeholder:text-muted-foreground outline-none focus:border-primary/40 transition-all text-foreground" 
                                        placeholder="Rechercher..."
                                    />
                                </div>
                            </div>
                        )}

                        <nav className="flex flex-col gap-3">
                            {!isCollapsed && <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">Navigation</p>}
                            {currentMenu.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => { if (window.innerWidth < 768) onClose(); }}
                                    className={({ isActive }) =>
                                        cn(
                                            "flex items-center gap-3 h-10 rounded-lg transition-all duration-200 group relative overflow-hidden",
                                            isActive
                                                ? "bg-primary/10 text-primary font-semibold"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                            isCollapsed ? "justify-center px-0" : "px-3"
                                        )
                                    }
                                >
                                    <div className={cn(
                                        "size-7 rounded-lg flex items-center justify-center transition-all duration-200 shrink-0 relative",
                                        isCollapsed && "size-8"
                                    )}>
                                        <item.icon className="size-5" />
                                        {/* Badge non-lus */}
                                        {item.badge > 0 && (
                                            <span className="absolute -top-1 -right-1 size-4 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
                                                {item.badge > 9 ? '9+' : item.badge}
                                            </span>
                                        )}
                                    </div>
                                    
                                    {!isCollapsed && (
                                        <span className="text-[13px] font-medium whitespace-nowrap">
                                            {item.label}
                                        </span>
                                    )}

                                    {/* Signal Node Selector */}
                                    <div className={cn(
                                        "absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-primary transition-all duration-700 rounded-l-full shadow-[0_0_20px_rgba(255,95,0,0.5)]",
                                        "group-[.active]:opacity-100 opacity-0 translate-x-full group-[.active]:translate-x-0"
                                    )} />
                                </NavLink>
                            ))}
                        </nav>

                        {/* Infrastructure Monitoring Module — Discrete */}
                        {!isCollapsed && (
                            <div className="px-3 space-y-3 animate-in" style={{ animationDelay: '0.3s' }}>
                                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Infrastructure</p>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 p-2 rounded-lg bg-muted">
                                        <Satellite className="size-4 text-primary shrink-0" />
                                        <div>
                                            <p className="text-[10px] font-semibold text-foreground">Synchronisation</p>
                                            <p className="text-[10px] text-primary font-medium">Connecté</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-2 rounded-lg bg-muted">
                                        <Zap className="size-4 text-blue-500 shrink-0" />
                                        <div>
                                            <p className="text-[10px] font-semibold text-foreground">Charge CPU</p>
                                            <div className="w-20 h-1.5 bg-border rounded-full overflow-hidden mt-1">
                                                <div className="h-full bg-blue-500 w-2/3" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Protocol Termination Ledger — Executive Deck */}
                    <div className="flex flex-col gap-3 pt-4 border-t border-border bg-card shrink-0 mt-auto">
                        {can('manage_own_products') && (
                            <div className="px-2">
                                <button
                                    id="btn-sidebar-add-product"
                                    onClick={() => {
                                        navigate('/vendor/products/add');
                                        if (window.innerWidth < 768) onClose();
                                    }}
                                    className={cn(
                                        "w-full h-11 flex items-center justify-center gap-3 bg-foreground text-background rounded-xl font-bold text-xs transition-all hover:bg-primary hover:text-primary-foreground shadow-md hover:-translate-y-0.5",
                                        isCollapsed && "px-0"
                                    )}
                                >
                                    <Plus className="size-4" />
                                    {!isCollapsed && <span>Ajouter un Produit</span>}
                                </button>
                            </div>
                        )}

                        <div className="space-y-3">
                            <button
                                id="btn-sidebar-logout"
                                onClick={() => {
                                    logout();
                                    if (window.innerWidth < 768) onClose();
                                }}
                                className={cn(
                                    "flex items-center gap-4 px-4 h-11 rounded-xl transition-all text-rose-500 hover:bg-rose-500/10 font-bold w-full text-left group",
                                    isCollapsed && "justify-center px-0"
                                )}
                            >
                                <LogOut className="size-4 group-hover:-translate-x-1 transition-transform" />
                                {!isCollapsed && <span className="text-xs uppercase tracking-widest">Déconnexion</span>}
                            </button>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
