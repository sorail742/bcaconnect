import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import {
    ShoppingBag,
    MessageSquare,
    Settings,
    Wallet,
    AlertTriangle,
    CheckCheck,
    Search,
    Clock,
    Trash2,
    Bell,
    Loader2
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { cn } from '../lib/utils';
import notificationService from '../services/notificationService';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const Notifications = () => {
    const [activeFilter, setActiveFilter] = useState('all');
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const filters = [
        { id: 'all', label: 'Toutes' },
        { id: 'order', label: 'Commandes' },
        { id: 'payment', label: 'Paiements' },
        { id: 'message', label: 'Messages' },
        { id: 'system', label: 'Alertes Système' }
    ];

    const fetchNotifications = useCallback(async (silent = false) => {
        if (!silent) setIsLoading(true);
        try {
            const data = await notificationService.getAll();
            setNotifications(data);
        } catch (error) {
            console.error(error);
        } finally {
            if (!silent) setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
        // Simuler le "temps réel" par un polling de 30 secondes
        const interval = setInterval(() => fetchNotifications(true), 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const handleMarkAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, est_lu: true } : n));
        } catch (error) {
            toast.error("Erreur lors du marquage.");
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, est_lu: true })));
            toast.success("Tout est marqué comme lu !");
        } catch (error) {
            toast.error("Une erreur est survenue.");
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        try {
            await notificationService.delete(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            toast.success("Notification supprimée.");
        } catch (error) {
            toast.error("Erreur lors de la suppression.");
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'order': return { icon: ShoppingBag, color: 'text-primary', bgColor: 'bg-primary/10' };
            case 'payment': return { icon: Wallet, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' };
            case 'message': return { icon: MessageSquare, color: 'text-blue-500', bgColor: 'bg-blue-500/10' };
            case 'dispute': return { icon: AlertTriangle, color: 'text-rose-500', bgColor: 'bg-rose-500/10' };
            default: return { icon: Bell, color: 'text-slate-500', bgColor: 'bg-slate-100' };
        }
    };

    const filteredNotifications = notifications
        .filter(n => activeFilter === 'all' || n.type === activeFilter)
        .filter(n =>
            n.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.message.toLowerCase().includes(searchQuery.toLowerCase())
        );

    return (
        <DashboardLayout title="Centre de Notifications">
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 font-inter pb-12">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-3xl font-black text-foreground italic tracking-tighter uppercase">Notifications</h2>
                        <p className="text-muted-foreground font-medium text-sm">Gérez vos alertes et activités récentes sur la plateforme.</p>
                    </div>
                    {notifications.some(n => !n.est_lu) && (
                        <Button
                            onClick={handleMarkAllRead}
                            variant="outline"
                            className="gap-2 font-black uppercase tracking-widest text-[10px] rounded-xl h-12 px-6 border-border shadow-sm"
                        >
                            <CheckCheck className="size-4 text-primary" />
                            Tout marquer comme lu
                        </Button>
                    )}
                </div>

                {/* Search & Filters */}
                <Card className="p-4 space-y-4 rounded-3xl border-border/60">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                        <div className="relative w-full lg:w-96 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground size-4 group-focus-within:text-primary transition-colors" />
                            <Input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Rechercher une notification..."
                                className="pl-11 h-12 bg-muted/30 border-transparent focus:bg-background transition-all rounded-2xl"
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto scrollbar-hide w-full lg:w-auto p-1 bg-muted/30 rounded-2xl">
                            {filters.map((filter) => (
                                <button
                                    key={filter.id}
                                    onClick={() => setActiveFilter(filter.id)}
                                    className={cn(
                                        "whitespace-nowrap px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                                        activeFilter === filter.id
                                            ? "bg-card shadow-lg text-primary"
                                            : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                                    )}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </Card>

                {/* Notifications List */}
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="size-10 text-primary animate-spin" />
                            <p className="text-sm font-black uppercase tracking-widest text-muted-foreground italic">Chargement des alertes...</p>
                        </div>
                    ) : filteredNotifications.length > 0 ? (
                        filteredNotifications.map((notif) => {
                            const iconStyle = getIcon(notif.type);
                            return (
                                <Card
                                    key={notif.id}
                                    onClick={() => !notif.est_lu && handleMarkAsRead(notif.id)}
                                    className={cn(
                                        "group relative p-6 transition-all duration-300 cursor-pointer overflow-hidden rounded-[2rem] border-border/60",
                                        !notif.est_lu
                                            ? "border-l-4 border-l-primary shadow-xl shadow-primary/5 bg-card"
                                            : "bg-muted/10 opacity-80 hover:opacity-100 hover:bg-card"
                                    )}
                                >
                                    <div className="flex items-start gap-6">
                                        <div className={`size-12 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-12 group-hover:scale-110 duration-500 shadow-lg ${iconStyle.bgColor} ${iconStyle.color}`}>
                                            <iconStyle.icon className="size-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className={cn(
                                                    "text-base font-black tracking-tight italic uppercase",
                                                    !notif.est_lu ? "text-foreground" : "text-muted-foreground"
                                                )}>
                                                    {notif.titre}
                                                </h4>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                                        <Clock className="size-3" />
                                                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: fr })}
                                                    </div>
                                                    <button
                                                        onClick={(e) => handleDelete(e, notif.id)}
                                                        className="size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <p
                                                className={cn(
                                                    "text-sm leading-relaxed",
                                                    !notif.est_lu ? "text-foreground font-medium" : "text-muted-foreground/80"
                                                )}
                                                dangerouslySetInnerHTML={{ __html: notif.message }}
                                            />
                                        </div>
                                    </div>

                                    {!notif.est_lu && (
                                        <div className="absolute -left-[3px] top-1/2 -translate-y-1/2 w-1.5 h-12 bg-primary/40 blur-md"></div>
                                    )}
                                </Card>
                            );
                        })
                    ) : (
                        <div className="py-20 flex flex-col items-center justify-center text-center gap-5 bg-muted/10 border border-dashed border-border rounded-[3rem]">
                            <div className="size-20 rounded-full bg-muted flex items-center justify-center">
                                <Bell className="size-10 text-muted-foreground/30" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black italic uppercase tracking-tight">Aucune notification</h3>
                                <p className="text-muted-foreground text-sm font-medium">Vous êtes à jour ! Vos alertes apparaîtront ici.</p>
                            </div>
                        </div>
                    )}
                </div>

                {filteredNotifications.length > 10 && (
                    <div className="flex justify-center pt-8">
                        <Button variant="outline" className="h-14 px-12 rounded-2xl border-border bg-card font-black uppercase tracking-widest text-[10px] hover:bg-muted transition-all shadow-sm">
                            Voir l'historique complet
                        </Button>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default Notifications;

