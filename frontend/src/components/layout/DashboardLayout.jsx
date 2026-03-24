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
                    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 md:px-8 shrink-0 z-20 shadow-sm">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="md:hidden p-2 text-muted-foreground hover:bg-muted rounded-xl transition-colors"
                            >
                                <Menu className="size-5" />
                            </button>
                            <h2 className="text-lg font-black italic tracking-tighter uppercase truncate max-w-[200px] md:max-w-none">
                                {title || 'Tableau de bord'}
                            </h2>
                        </div>

                        <div className="flex items-center gap-2 md:gap-4 font-inter">
                            <div className="hidden lg:flex relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Rechercher..."
                                    className="h-10 w-64 pl-10 pr-4 bg-muted/30 border border-border/50 rounded-full text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all font-medium"
                                />
                            </div>

                            <button
                                onClick={() => navigate('/notifications')}
                                className="relative p-2.5 text-muted-foreground hover:bg-muted hover:text-primary rounded-xl transition-all group"
                            >
                                <Bell className="size-5 group-hover:animate-bounce" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 size-4 bg-primary text-[10px] font-black text-white rounded-full border-2 border-background flex items-center justify-center animate-in zoom-in">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            <div className="h-8 w-px bg-border/50 mx-1 md:mx-2 hidden sm:block"></div>

                            <Link to="/profile" className="flex items-center gap-3 pl-1 md:pl-2 group cursor-pointer">
                                <div className="hidden sm:flex flex-col items-end">
                                    <p className="text-sm font-black leading-none group-hover:text-primary transition-colors italic">{user?.nom_complet || 'Invité'}</p>
                                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1.5 italic opacity-70">{user?.role || 'Membre'}</p>
                                </div>
                                <div className="size-10 rounded-2xl bg-muted border-2 border-primary/20 shadow-sm group-hover:border-primary transition-all overflow-hidden">
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
