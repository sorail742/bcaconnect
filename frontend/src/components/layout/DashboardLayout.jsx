import React from 'react';
import Sidebar from './Sidebar';
import { Bell, Search, Menu } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import AdBanner from '../ads/AdBanner';

const DashboardLayout = ({ children, title, noPadding }) => {
    const { user } = useAuth();

    return (
        <div className="flex h-screen overflow-hidden bg-background font-sans text-foreground">
            {/* Sidebar Desktop */}
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header / Topbar */}
                <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 md:px-8 shrink-0 z-10">
                    <div className="flex items-center gap-4">
                        {/* Mobile Menu Toggle (can be implemented later) */}
                        <button className="md:hidden p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors">
                            <Menu className="size-5" />
                        </button>
                        <h2 className="text-lg font-bold truncate max-w-[200px] md:max-w-none">
                            {title || 'Tableau de bord'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4 font-inter">
                        <div className="hidden lg:flex relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                className="h-10 w-64 pl-10 pr-4 bg-muted/50 border-none rounded-full text-sm focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                            />
                        </div>

                        <button className="relative p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors">
                            <Bell className="size-5" />
                            <span className="absolute top-2 right-2 size-2 bg-destructive rounded-full border-2 border-background"></span>
                        </button>

                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1 md:mx-2 hidden sm:block"></div>

                        <div className="flex items-center gap-3 pl-1 md:pl-2">
                            <div className="hidden sm:flex flex-col items-end">
                                <p className="text-sm font-bold leading-none">{user?.nom_complet || 'Invité'}</p>
                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1 italic">{user?.role || 'Membre'}</p>
                            </div>
                            <div className="size-10 rounded-full bg-slate-200 dark:bg-slate-700 bg-[url('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80')] bg-cover border-2 border-primary/20 shadow-sm" />
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className={`flex-1 overflow-y-auto scrollbar-hide ${noPadding ? '' : 'p-4 md:p-8'}`}>
                    <AdBanner format="banner" className="mb-6" />
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
