import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { Bell, Search, Menu } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import AdBanner from '../ads/AdBanner';
import { useNavigate, Link } from 'react-router-dom';
import notificationService from '../../services/notificationService';
import socketService from '../../services/socketService';
import { toast } from 'sonner';

const DashboardLayout = ({ children, title, noPadding }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnreadCount = async () => {
        try {
            const notifs = await notificationService.getAll();
            const unread = notifs.filter(n => !n.est_lu).length;
            setUnreadCount(unread);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchUnreadCount();

        // Temps réel
        socketService.connect();

        // Rejoindre sa propre "room" pour recevoir les notifications et messages privés
        if (user?.id) {
            socketService.on('connect', () => {
                socketService.socket.emit('join', user.id);
            });
            // Si déjà connecté
            if (socketService.socket?.connected) {
                socketService.socket.emit('join', user.id);
            }
        }

        const handleNewNotification = (notif) => {
            setUnreadCount(prev => prev + 1);
            toast.message(notif.titre || "Nouvelle alerte", {
                description: notif.message,
                action: {
                    label: "Voir",
                    onClick: () => navigate('/notifications')
                }
            });
        };

        socketService.on('notification_received', handleNewNotification);

        return () => {
            socketService.off('notification_received', handleNewNotification);
        };
    }, [navigate, user?.id]);

    return (
        <>
            <div className="flex h-screen overflow-hidden bg-background font-sans text-foreground">
                {/* Sidebar with Mobile Toggle */}
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    {/* Header / Topbar */}
                    <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-6 md:px-10 shrink-0 z-20 sticky top-0">
                        <div className="flex items-center gap-6">
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="md:hidden p-2.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all active:scale-95"
                            >
                                <Menu className="size-6" />
                            </button>
                            <div className="flex flex-col">
                                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                                    {title || 'Dashboard'}
                                </h2>
                                <p className="text-[10px] text-primary font-bold uppercase tracking-[0.2em] mt-1.5 opacity-80">BCA Connect Platform</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 md:gap-5 font-inter">
                            <div className="hidden lg:flex relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-primary transition-all duration-300" />
                                <input
                                    type="text"
                                    placeholder="Rechercher une commande, un produit..."
                                    className="h-11 w-72 pl-11 pr-4 bg-slate-100/50 dark:bg-slate-800/40 border-transparent focus:border-primary/20 focus:bg-white dark:focus:bg-slate-900 rounded-2xl text-[13px] font-semibold focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all placeholder:text-slate-400"
                                />
                            </div>

                            <button
                                onClick={() => navigate('/notifications')}
                                className="relative p-2.5 text-slate-500 dark:text-slate-400 hover:bg-primary/10 hover:text-primary rounded-2xl transition-all group border border-transparent"
                            >
                                <Bell className="size-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-2.5 right-2.5 size-4 bg-primary text-[9px] font-black text-white rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center animate-pulse">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            <div className="h-10 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block"></div>

                            <Link to="/profile" className="flex items-center gap-3.5 pl-1 md:pl-2 group cursor-pointer p-1 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                                <div className="hidden sm:flex flex-col items-end">
                                    <p className="text-sm font-black text-slate-900 dark:text-white leading-none group-hover:text-primary transition-colors">{user?.nom_complet || 'Utilisateur'}</p>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1.5 opacity-60">{user?.role || 'Membre'}</p>
                                </div>
                                <div className="size-11 rounded-2xl border-2 border-transparent group-hover:border-primary/30 transition-all overflow-hidden bg-slate-100 dark:bg-slate-800 ring-2 ring-slate-100 dark:ring-slate-800 group-hover:ring-primary/10">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id || 'guest'}`} alt="avatar" className="w-full h-full object-cover" />
                                </div>
                            </Link>
                        </div>
                    </header>

                    {/* Main Content Area */}
                    <main className={`flex-1 overflow-y-auto ${noPadding ? '' : 'p-4 md:p-10'}`}>
                        <AdBanner format="banner" className="mb-6 rounded-[2rem] overflow-hidden shadow-xl shadow-primary/5" />
                        <div className="max-w-7xl mx-auto">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
};

export default DashboardLayout;
