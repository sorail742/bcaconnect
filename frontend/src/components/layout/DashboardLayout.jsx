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
                    <header className="h-20 bg-background/80 border-b border-border flex items-center justify-between px-6 md:px-10 shrink-0 z-50 sticky top-0 backdrop-blur-2xl transition-all duration-500">
                        <div className="flex items-center gap-8">
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="md:hidden p-3 text-muted-foreground hover:bg-accent rounded-2xl transition-all active:scale-95 border-2 border-border"
                            >
                                <Menu className="size-6" />
                            </button>
                            <div className="flex flex-col">
                                <h2 className="text-lg font-bold text-foreground tracking-tight leading-none">
                                    {title || 'Dashboard'}
                                </h2>
                                <p className="text-[11px] text-muted-foreground mt-1 font-medium">BCA Connect</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 md:gap-6 font-inter">
                            <div className="hidden lg:flex relative group">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-all duration-300" />
                                <input
                                    type="text"
                                    placeholder="Rechercher sur le réseau BCA..."
                                    className="h-12 w-80 pl-12 pr-6 bg-accent/50 border-2 border-transparent focus:border-primary/20 focus:bg-background rounded-2xl text-[13px] font-bold focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all placeholder:text-muted-foreground/50 shadow-inner"
                                />
                            </div>

                            <button
                                onClick={() => navigate('/notifications')}
                                className="relative p-3 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-2xl transition-all group border-2 border-transparent hover:border-primary/20"
                            >
                                <Bell className="size-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-2 right-2 size-4 bg-primary text-[9px] font-bold text-white rounded-full border-2 border-background flex items-center justify-center">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            <div className="h-10 w-px bg-border mx-2 hidden sm:block"></div>

                            <Link to="/profile" className="flex items-center gap-4 pl-2 group cursor-pointer p-1.5 rounded-2xl hover:bg-accent transition-all border-2 border-transparent hover:border-border">
                                <div className="hidden sm:flex flex-col items-end">
                                    <p className="text-sm font-semibold text-foreground leading-none group-hover:text-primary transition-colors">{user?.nom_complet || 'Utilisateur'}</p>
                                    <p className="text-[11px] text-muted-foreground mt-1">{user?.role || 'Membre'}</p>
                                </div>
                                <div className="size-12 rounded-[1.2rem] border-2 border-border group-hover:border-primary/30 transition-all overflow-hidden bg-accent ring-4 ring-transparent group-hover:ring-primary/5">
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
