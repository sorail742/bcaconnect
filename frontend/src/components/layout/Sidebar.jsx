import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Store,
    Receipt,
    Users,
    MessageSquare,
    User,
    Truck,
    Plus,
    Landmark,
    Folder,
    RotateCcw,
    Bell,
    Wallet,
    Settings,
    LogOut,
    Megaphone,
    Gavel,
    X
} from 'lucide-react';
import BcaLogo from '../ui/BcaLogo';
import Button from '../ui/Button';
import ThemeToggle from '../ui/ThemeToggle';
import { useAuth } from '../../hooks/useAuth';
import { useRBAC } from '../../hooks/useRBAC';

const Sidebar = ({ isOpen, onClose }) => {
    const { user, logout } = useAuth();
    const { can } = useRBAC();

    const menuItems = {
        admin: [
            { path: '/admin/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
            { path: '/admin/users', label: 'Utilisateurs', icon: Users, permission: 'manage_users' },
            { path: '/admin/products', label: 'Produits', icon: Package },
            { path: '/admin/categories', label: 'Gestion Catégories', icon: Folder, permission: 'manage_categories' },
            { path: '/admin/disputes', label: 'Médiation Litiges', icon: Gavel, permission: 'solve_disputes' },
            { path: '/admin/transactions', label: 'Transactions', icon: Receipt, permission: 'view_all_transactions' },
            { path: '/admin/ads', label: 'Gestion Pubs', icon: Megaphone, permission: 'manage_ads' },
            { path: '/bank/dashboard', label: 'Panel Financier', icon: Landmark, permission: 'view_all_transactions' },
        ],
        fournisseur: [
            { path: '/vendor/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
            { path: '/vendor/products', label: 'Mes Produits', icon: Package, permission: 'manage_own_products' },
            { path: '/vendor/orders', label: 'Commandes reçues', icon: ShoppingCart, permission: 'view_own_orders' },
            { path: '/admin/ads', label: 'Mes Publicités', icon: Megaphone, permission: 'manage_ads' },
            { path: '/vendor/store', label: 'Paramètres Boutique', icon: Store, permission: 'manage_own_store' },
        ],
        transporteur: [
            { path: '/carrier/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
            { path: '/tracking', label: 'Livraisons', icon: Truck, permission: 'view_available_deliveries' },
        ],
        client: [
            { path: '/dashboard', label: 'Mon Espace', icon: LayoutDashboard },
            { path: '/marketplace', label: 'Marché', icon: Store },
            { path: '/vendors', label: 'Vendeurs', icon: Users },
            { path: '/orders', label: 'Mes Commandes', icon: ShoppingCart, permission: 'view_own_history' },
            { path: '/payments', label: 'Paiements', icon: Wallet },
            { path: '/tracking', label: 'Livraisons', icon: Truck },
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
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300"
                    onClick={onClose}
                />
            )}

            <aside className={`
                fixed inset-y-0 left-0 w-80 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex flex-col justify-between py-10 px-6 z-50
                transition-all duration-500 ease-in-out md:relative md:translate-x-0 md:flex md:w-72
                ${isOpen ? 'translate-x-0 shadow-2xl shadow-black/20' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* Close button mobile */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl md:hidden transition-all active:scale-90"
                >
                    <X className="size-6" />
                </button>

                <div className="flex flex-col gap-12">
                    {/* Logo Section */}
                    <div className="flex items-center gap-4 px-2 group cursor-default" translate="no">
                        <div className="shrink-0">
                            <BcaLogo className="size-10 drop-shadow-sm" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <h1 className="text-slate-900 dark:text-white text-lg font-black leading-none tracking-tight">BCA Connect</h1>
                            <div className="flex items-center gap-1.5 mt-2">
                                <span className="size-1.5 rounded-full bg-primary animate-pulse"></span>
                                <p className="text-primary text-[10px] font-black uppercase tracking-[0.2em] leading-none" translate="yes">
                                    {user?.role === 'fournisseur' ? 'Marchand' : user?.role === 'admin' ? 'Super Admin' : user?.role === 'transporteur' ? 'Livreur Pro' : 'Client Privilège'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex flex-col gap-2">
                        {currentMenu.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => { if (window.innerWidth < 768) onClose(); }}
                                className={({ isActive }) =>
                                    cn(
                                        "flex items-center gap-3.5 px-5 py-3.5 rounded-2xl transition-all duration-500 group relative overflow-hidden",
                                        isActive
                                            ? "bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]"
                                            : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white"
                                    )
                                }
                            >
                                <item.icon className={cn("size-5 transition-transform duration-500 group-hover:scale-110")} />
                                <span className="text-[13px] font-semibold tracking-tight">{item.label}</span>
                                
                                {/* Active Indicator Dot */}
                                <span className={cn(
                                    "absolute right-4 size-1.5 rounded-full bg-white transition-all duration-500 scale-0",
                                    "group-[.active]:scale-100"
                                )}></span>
                            </NavLink>
                        ))}
                    </nav>
                </div>

                <div className="flex flex-col gap-8">
                    {can('manage_own_products') && (
                        <div className="px-2">
                             <Button
                                onClick={() => {
                                    window.location.href = '/vendor/products/add';
                                    if (window.innerWidth < 768) onClose();
                                }}
                                className="w-full text-xs font-black gap-3 h-14 rounded-2xl shadow-2xl shadow-primary/15 hover:-translate-y-1 transition-all duration-300"
                            >
                                <Plus className="size-5" />
                                Nouveau Produit
                            </Button>
                        </div>
                    )}

                    <div className="pt-8 border-t border-slate-100 dark:border-slate-800 space-y-2">
                        <div className="px-2 mb-6">
                            <ThemeToggle className="w-full h-11 rounded-2xl bg-slate-50 dark:bg-slate-800/50" />
                        </div>
                        
                        <NavLink
                            to="/profile"
                            onClick={() => { if (window.innerWidth < 768) onClose(); }}
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center gap-3.5 px-5 py-3 rounded-2xl transition-all group",
                                    isActive
                                        ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                                        : "text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/30 hover:text-slate-600 dark:hover:text-slate-300"
                                )
                            }
                        >
                            <User className="size-5" />
                            <span className="text-[14px] font-black">Mon Profil</span>
                        </NavLink>
                        
                        <button
                            onClick={() => {
                                logout();
                                if (window.innerWidth < 768) onClose();
                            }}
                            className="flex items-center gap-3.5 px-5 py-3 rounded-2xl transition-all text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 font-black w-full text-left group"
                        >
                            <LogOut className="size-5 group-hover:-translate-x-1 transition-transform" />
                            <span className="text-[14px]">Déconnexion</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
