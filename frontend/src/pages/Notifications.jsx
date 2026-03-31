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
            default: return { icon: Bell, color: 'text-muted-foreground/40', bgColor: 'bg-accent/40' };
        }
    };

    const filteredNotifications = notifications
        .filter(n => activeFilter === 'all' || n.type === activeFilter)
        .filter(n =>
            n.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.message.toLowerCase().includes(searchQuery.toLowerCase())
        );

    return (
        <DashboardLayout title="CENTRE D'ALERTES SCELLÉES">
            <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20 px-4 md:px-0">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                            <div className="size-3 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(43,90,255,0.6)]" />
                            <span className="text-executive-label font-black text-primary uppercase tracking-widest italic leading-none">Vigilance Réseau BCA</span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black text-foreground italic tracking-tighter uppercase leading-[0.85]">Centre de <br /><span className="text-primary underline decoration-primary/20 decoration-8 underline-offset-[-2px]">Signaux Critiques</span></h2>
                        <p className="text-muted-foreground/60 font-medium text-lg leading-relaxed italic border-l-4 border-primary/20 pl-6 max-w-xl opacity-80">Gérez vos alertes stratégiques et flux d'activité scellés sur le protocole d'échange BCA.</p>
                    </div>
                    {notifications.some(n => !n.est_lu) && (
                        <Button
                            onClick={handleMarkAllRead}
                            variant="outline"
                            className="gap-4 font-black uppercase tracking-widest text-executive-label rounded-[1.25rem] h-16 px-10 border-2 border-border shadow-premium group transition-all"
                        >
                            <CheckCheck className="size-5 text-primary group-hover:scale-110 transition-transform" />
                            Tout marquer comme lu
                        </Button>
                    )}
                </div>

                {/* Search & Filters */}
                <Card className="p-8 space-y-8 rounded-[2.5rem] border-4 border-border shadow-premium-lg bg-card/40 backdrop-blur-3xl">
                    <div className="flex flex-col xl:flex-row items-center justify-between gap-10">
                        <div className="relative w-full xl:w-[450px] group/search">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/30 size-5 group-focus-within/search:text-primary transition-all" />
                            <Input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="FILTRER LES SIGNAUX..."
                                className="pl-14 h-16 bg-accent/40 border-4 border-transparent focus:border-primary/50 focus:bg-background transition-all rounded-[1.5rem] text-sm font-black italic shadow-inner placeholder:text-muted-foreground/20"
                            />
                        </div>
                        <div className="flex gap-3 overflow-x-auto scrollbar-hide w-full xl:w-auto p-2 bg-accent/20 rounded-[1.5rem] border-2 border-border shadow-inner">
                            {filters.map((filter) => (
                                <button
                                    key={filter.id}
                                    onClick={() => setActiveFilter(filter.id)}
                                    className={cn(
                                        "whitespace-nowrap px-8 py-4 text-executive-label font-black uppercase tracking-widest rounded-xl transition-all italic",
                                        activeFilter === filter.id
                                            ? "bg-foreground shadow-premium text-background scale-105"
                                            : "text-muted-foreground/40 hover:text-foreground hover:bg-card/40 opacity-80"
                                    )}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </Card>

                {/* Notifications List */}
                <div className="space-y-6">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-32 gap-6 animate-in fade-in duration-500">
                            <div className="relative">
                                <Loader2 className="size-16 text-primary animate-spin opacity-40" />
                                <div className="absolute inset-0 size-16 rounded-full border-4 border-primary/10 border-t-primary animate-pulse"></div>
                            </div>
                            <p className="text-executive-label font-black uppercase tracking-widest text-primary italic drop-shadow-[0_0_8px_rgba(43,90,255,0.4)]">Synchronisation des flux...</p>
                        </div>
                    ) : filteredNotifications.length > 0 ? (
                        filteredNotifications.map((notif) => {
                            const iconStyle = getIcon(notif.type);
                            return (
                                <Card
                                    key={notif.id}
                                    onClick={() => !notif.est_lu && handleMarkAsRead(notif.id)}
                                    className={cn(
                                        "group relative p-8 transition-all duration-500 cursor-pointer overflow-hidden rounded-[2.5rem] border-4",
                                        !notif.est_lu
                                            ? "border-primary/40 bg-card shadow-premium-lg hover:border-primary/60 scale-[1.01]"
                                            : "border-border/30 bg-accent/20 opacity-60 hover:opacity-100 hover:bg-card hover:border-border/60"
                                    )}
                                >
                                    <div className="flex items-start gap-8">
                                        <div className={`size-16 rounded-[1.5rem] flex items-center justify-center transition-all group-hover:rotate-12 group-hover:scale-110 duration-700 shadow-premium shrink-0 border-2 border-border/10 ${iconStyle.bgColor} ${iconStyle.color}`}>
                                            <iconStyle.icon className="size-8" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className={cn(
                                                    "text-xl font-black tracking-tight italic uppercase drop-shadow-sm",
                                                    !notif.est_lu ? "text-foreground" : "text-muted-foreground/60"
                                                )}>
                                                    {notif.titre}
                                                </h4>
                                                <div className="flex items-center gap-6">
                                                    <div className="flex items-center gap-3 text-executive-label font-black text-muted-foreground/30 uppercase tracking-widest italic">
                                                        <Clock className="size-4" />
                                                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: fr })}
                                                    </div>
                                                    <button
                                                        onClick={(e) => handleDelete(e, notif.id)}
                                                        className="size-12 rounded-[1rem] flex items-center justify-center text-muted-foreground/20 hover:text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all border-2 border-transparent hover:border-rose-500/20"
                                                    >
                                                        <Trash2 className="size-5" />
                                                    </button>
                                                </div>
                                            </div>
                                            <p
                                                className={cn(
                                                    "text-lg leading-relaxed font-bold italic",
                                                    !notif.est_lu ? "text-foreground/80" : "text-muted-foreground/40"
                                                )}
                                                dangerouslySetInnerHTML={{ __html: notif.message }}
                                            />
                                        </div>
                                    </div>

                                    {!notif.est_lu && (
                                        <div className="absolute -left-1 top-[20%] bottom-[20%] w-2 bg-primary/40 blur-[4px] rounded-full"></div>
                                    )}
                                    
                                    {/* Shimmer Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[1500ms] pointer-events-none"></div>
                                </Card>
                            );
                        })
                    ) : (
                        <div className="py-32 flex flex-col items-center justify-center text-center gap-10 bg-accent/20 border-4 border-dashed border-border rounded-[3.5rem] shadow-inner animate-in fade-in zoom-in duration-700">
                            <div className="size-28 rounded-[2rem] bg-card border-2 border-border flex items-center justify-center shadow-premium rotate-3">
                                <Bell className="size-12 text-muted-foreground/10" />
                            </div>
                            <div className="space-y-4 max-w-md">
                                <h3 className="text-3xl font-black italic uppercase tracking-tighter text-foreground decoration-primary/20 underline decoration-8 underline-offset-4">Signaux Néant</h3>
                                <p className="text-muted-foreground/40 text-lg font-bold italic border-l-4 border-border pl-6">Le ledger d'activité est vierge. Vos alertes critiques apparaîtront ici dès détection.</p>
                            </div>
                        </div>
                    )}
                </div>

                {filteredNotifications.length > 10 && (
                    <div className="flex justify-center pt-16">
                        <Button variant="outline" className="h-20 px-16 rounded-[1.5rem] border-4 border-border bg-card font-black uppercase tracking-widest text-executive-label hover:bg-accent/40 hover:text-foreground transition-all shadow-premium italic group">
                            Voir l'historique complet <ChevronRight className="size-4 ml-4 group-hover:translate-x-2 transition-transform" />
                        </Button>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default Notifications;

