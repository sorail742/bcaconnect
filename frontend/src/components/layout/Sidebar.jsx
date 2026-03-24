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
                fixed inset-y-0 left-0 w-72 bg-card border-r border-border flex flex-col justify-between py-8 px-5 z-50
                transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:flex md:w-64
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* Close button mobile */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-muted-foreground hover:bg-muted rounded-xl md:hidden"
                >
                    <X className="size-5" />
                </button>

                <div className="flex flex-col gap-10">
                    {/* Logo Section */}
                    <div className="flex items-center gap-4 px-2" translate="no">
                        <div className="shrink-0">
                            <BcaLogo className="size-11" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <h1 className="text-foreground text-lg font-black leading-none tracking-tighter italic">BCA Connect</h1>
                            <p className="text-primary text-[10px] font-black uppercase tracking-[0.2em] mt-1 leading-none" translate="yes">
                                {user?.role || 'Membre'}
                            </p>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex flex-col gap-1">
                        {currentMenu.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => { if (window.innerWidth < 768) onClose(); }}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-muted-foreground hover:bg-muted font-medium'
                                    }`
                                }
                            >
                                <item.icon className="size-5" />
                                <span className="text-sm font-semibold">{item.label}</span>
                            </NavLink>
                        ))}

                        <NavLink
                            to="/notifications"
                            onClick={() => { if (window.innerWidth < 768) onClose(); }}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-muted-foreground hover:bg-muted font-medium'
                                }`
                            }
                        >
                            <Bell className="size-5" />
                            <span className="text-sm font-semibold">Notifications</span>
                        </NavLink>

                        <NavLink
                            to="/messages"
                            onClick={() => { if (window.innerWidth < 768) onClose(); }}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-muted-foreground hover:bg-muted font-medium'
                                }`
                            }
                        >
                            <MessageSquare className="size-5" />
                            <span className="text-sm font-semibold">Messages</span>
                        </NavLink>
                    </nav>
                </div>

                <div className="flex flex-col gap-4">
                    {can('manage_own_products') && (
                        <Button
                            onClick={() => {
                                window.location.href = '/vendor/products/add';
                                if (window.innerWidth < 768) onClose();
                            }}
                            className="w-full text-sm font-bold gap-2"
                        >
                            <Plus className="size-4" />
                            Ajouter un produit
                        </Button>
                    )}

                    <div className="pt-4 border-t border-border space-y-1">
                        <ThemeToggle className="w-full mb-2" />
                        <NavLink
                            to="/profile"
                            onClick={() => { if (window.innerWidth < 768) onClose(); }}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-muted-foreground hover:bg-muted font-medium'
                                }`
                            }
                        >
                            <User className="size-5" />
                            <span className="text-sm font-medium">Mon Profil</span>
                        </NavLink>
                        <NavLink
                            to="/settings"
                            onClick={() => { if (window.innerWidth < 768) onClose(); }}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-muted-foreground hover:bg-muted font-medium'
                                }`
                            }
                        >
                            <Settings className="size-5" />
                            <span className="text-sm font-medium">Paramètres</span>
                        </NavLink>
                        <button
                            onClick={() => {
                                logout();
                                if (window.innerWidth < 768) onClose();
                            }}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-destructive hover:bg-destructive/10 font-medium w-full text-left"
                        >
                            <LogOut className="size-5" />
                            <span className="text-sm font-medium">Déconnexion</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
