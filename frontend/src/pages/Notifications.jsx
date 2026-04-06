import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { ShoppingBag, MessageSquare, Wallet, AlertTriangle, CheckCheck, Search, Clock, Trash2, Bell, CheckCircle2, Inbox } from 'lucide-react';
import { cn } from '../lib/utils';
import notificationService from '../services/notificationService';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const FILTERS = [
    { id: 'all', label: 'Tout' },
    { id: 'order', label: 'Commandes' },
    { id: 'payment', label: 'Paiements' },
    { id: 'message', label: 'Messages' },
    { id: 'system', label: 'Système' },
];

const getIcon = (type) => {
    switch (type) {
        case 'order': return { icon: ShoppingBag, color: 'text-primary', bg: 'bg-primary/10' };
        case 'payment': return { icon: Wallet, color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
        case 'message': return { icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-500/10' };
        case 'dispute': return { icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-500/10' };
        default: return { icon: Bell, color: 'text-muted-foreground', bg: 'bg-muted' };
    }
};

const Notifications = () => {
    const [activeFilter, setActiveFilter] = useState('all');
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchNotifications = useCallback(async (silent = false) => {
        if (!silent) setIsLoading(true);
        try {
            const data = await notificationService.getAll();
            setNotifications(data);
        } catch { /* silent */ }
        finally { if (!silent) setIsLoading(false); }
    }, []);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(() => fetchNotifications(true), 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const handleMarkAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, est_lu: true } : n));
        } catch { toast.error('Erreur.'); }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, est_lu: true })));
            toast.success('Toutes les notifications marquées comme lues.');
        } catch { toast.error('Erreur.'); }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        try {
            await notificationService.delete(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            toast.success('Notification supprimée.');
        } catch { toast.error('Erreur.'); }
    };

    const filtered = notifications
        .filter(n => activeFilter === 'all' || n.type === activeFilter)
        .filter(n => n.titre.toLowerCase().includes(searchQuery.toLowerCase()) || n.message.toLowerCase().includes(searchQuery.toLowerCase()));

    const unreadCount = notifications.filter(n => !n.est_lu).length;

    return (
        <DashboardLayout title="Notifications">
            <div className="max-w-4xl mx-auto space-y-5 pb-10">

                {/* Header */}
                <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary relative">
                            <Bell className="size-5" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 size-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-foreground">Centre de notifications</h2>
                            <p className="text-xs text-muted-foreground">{unreadCount} non lue(s)</p>
                        </div>
                    </div>
                    {unreadCount > 0 && (
                        <button onClick={handleMarkAllRead}
                            className="flex items-center gap-2 h-9 px-4 bg-muted border border-border rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all">
                            <CheckCheck className="size-4" /> Tout marquer lu
                        </button>
                    )}
                </div>

                {/* Filters + search */}
                <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-3">
                    <div className="flex flex-wrap gap-2">
                        {FILTERS.map(f => (
                            <button key={f.id} onClick={() => setActiveFilter(f.id)}
                                className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border",
                                    activeFilter === f.id ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border hover:text-foreground hover:border-primary/40"
                                )}>
                                {f.label}
                            </button>
                        ))}
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <input
                            className="w-full h-9 pl-9 pr-3 bg-background border border-border rounded-xl text-sm outline-none focus:border-primary/50 transition-all text-foreground placeholder:text-muted-foreground"
                            placeholder="Rechercher une notification..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* List */}
                <div className="space-y-2">
                    {isLoading ? (
                        <div className="py-12 flex flex-col items-center gap-3">
                            <div className="size-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                            <p className="text-sm text-muted-foreground">Chargement...</p>
                        </div>
                    ) : filtered.length > 0 ? (
                        filtered.map(notif => {
                            const { icon: Icon, color, bg } = getIcon(notif.type);
                            return (
                                <div
                                    key={notif.id}
                                    onClick={() => !notif.est_lu && handleMarkAsRead(notif.id)}
                                    className={cn(
                                        "group relative flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer",
                                        !notif.est_lu
                                            ? "bg-card border-primary/20 shadow-sm hover:border-primary/40"
                                            : "bg-muted/30 border-border opacity-60 hover:opacity-100 hover:bg-card"
                                    )}
                                >
                                    {/* Unread indicator */}
                                    {!notif.est_lu && <div className="absolute left-0 top-3 bottom-3 w-1 bg-primary rounded-r-full" />}

                                    <div className={cn("size-10 rounded-xl flex items-center justify-center shrink-0 border border-border", bg)}>
                                        <Icon className={cn("size-5", color)} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-2">
                                                {!notif.est_lu && <div className="size-2 rounded-full bg-primary shrink-0" />}
                                                <h4 className="text-sm font-semibold text-foreground">{notif.titre}</h4>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Clock className="size-3" />
                                                    {formatDistanceToNow(new Date(notif.createdAt), { locale: fr, addSuffix: true })}
                                                </span>
                                                <button
                                                    onClick={e => handleDelete(e, notif.id)}
                                                    className="size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed border-l-2 border-primary/30 pl-3"
                                            dangerouslySetInnerHTML={{ __html: notif.message }} />
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-16 flex flex-col items-center text-center gap-4 bg-card rounded-2xl border border-border">
                            <Inbox className="size-10 text-muted-foreground/30" />
                            <div>
                                <h3 className="text-sm font-bold text-foreground">Aucune notification</h3>
                                <p className="text-xs text-muted-foreground mt-1">Vous n'avez aucune notification pour le moment.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Notifications;
