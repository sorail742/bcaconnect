import React, { useState } from 'react';
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
    Plus
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { cn } from '../lib/utils';

const Notifications = () => {
    const [activeFilter, setActiveFilter] = useState('all');

    const filters = [
        { id: 'all', label: 'Toutes' },
        { id: 'orders', label: 'Commandes' },
        { id: 'payments', label: 'Paiements' },
        { id: 'messages', label: 'Messages' },
        { id: 'system', label: 'Alertes Système' }
    ];

    const notifications = [
        {
            id: 1,
            type: 'orders',
            title: 'Commande livrée',
            message: `Votre commande <span class="font-black text-primary">#BC-9821</span> a été livrée avec succès à l'adresse indiquée.`,
            time: 'Il y a 2 heures',
            unread: true,
            icon: ShoppingBag,
            color: 'text-primary',
            bgColor: 'bg-primary/10'
        },
        {
            id: 2,
            type: 'messages',
            title: 'Nouveau message',
            message: 'Jean Dupont vous a envoyé une question concernant le produit <span class="font-black">Ordinateur Portable XPS</span>.',
            time: 'Il y a 3 heures',
            unread: true,
            icon: MessageSquare,
            color: 'text-primary',
            bgColor: 'bg-primary/10'
        },
        {
            id: 3,
            type: 'system',
            title: 'Mise à jour système',
            message: 'La plateforme BCA Connect a été mise à jour vers la version 2.4.5. Découvrez les nouveautés.',
            time: 'Hier à 14:30',
            unread: false,
            icon: Settings,
            color: 'text-slate-500',
            bgColor: 'bg-slate-100'
        },
        {
            id: 4,
            type: 'payments',
            title: 'Paiement reçu',
            message: 'Un versement de <span class="font-black text-emerald-600 italic">1.240.500 GNF</span> a été confirmé pour vos ventes de la semaine.',
            time: 'Hier à 10:15',
            unread: true,
            icon: Wallet,
            color: 'text-emerald-500',
            bgColor: 'bg-emerald-500/10'
        },
        {
            id: 5,
            type: 'orders',
            title: 'Nouvelle commande',
            message: 'Vous avez reçu une nouvelle commande <span class="font-black text-primary italic">#BC-9810</span> de la part de Marie Lefebvre.',
            time: 'Le 12 Mai à 18:45',
            unread: false,
            icon: ShoppingBag,
            color: 'text-slate-500',
            bgColor: 'bg-slate-100'
        },
        {
            id: 6,
            type: 'system',
            title: 'Stock épuisé',
            message: 'Attention : Le stock pour le produit <span class="font-black text-rose-600">Casque Bluetooth Sony</span> est épuisé.',
            time: 'Le 11 Mai à 09:20',
            unread: false,
            icon: AlertTriangle,
            color: 'text-rose-500',
            bgColor: 'bg-rose-500/10'
        }
    ];

    const filteredNotifications = activeFilter === 'all'
        ? notifications
        : notifications.filter(n => n.type === activeFilter);

    return (
        <DashboardLayout title="Centre de Notifications">
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 font-inter pb-12">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-3xl font-bold text-foreground italic tracking-tight">Notifications</h2>
                        <p className="text-muted-foreground font-medium">Gérez vos alertes et activités récentes sur la plateforme.</p>
                    </div>
                    <Button variant="outline" className="gap-2 font-bold rounded-xl h-12 px-6 border-border">
                        <CheckCheck className="size-4" />
                        Tout marquer comme lu
                    </Button>
                </div>

                {/* Search & Filters */}
                <Card className="p-4 space-y-4">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                        <div className="relative w-full lg:w-96 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground size-4 group-focus-within:text-primary transition-colors" />
                            <Input
                                type="text"
                                placeholder="Rechercher une notification..."
                                className="pl-11 h-12 bg-muted/30 border-transparent focus:bg-background transition-all"
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto scrollbar-hide w-full lg:w-auto p-1 bg-muted rounded-xl">
                            {filters.map((filter) => (
                                <button
                                    key={filter.id}
                                    onClick={() => setActiveFilter(filter.id)}
                                    className={cn(
                                        "whitespace-nowrap px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all",
                                        activeFilter === filter.id
                                            ? "bg-card shadow-sm text-primary"
                                            : "text-muted-foreground hover:text-foreground"
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
                    {filteredNotifications.map((notif) => (
                        <Card
                            key={notif.id}
                            className={cn(
                                "group relative p-6 transition-all duration-300 cursor-pointer overflow-hidden",
                                notif.unread
                                    ? "border-l-4 border-l-primary shadow-md"
                                    : "opacity-70 hover:opacity-100"
                            )}
                        >
                            <div className="flex items-start gap-6">
                                <div className={`size-12 rounded-xl flex items-center justify-center transition-transform group-hover:rotate-12 ${notif.bgColor} ${notif.color}`}>
                                    <notif.icon className="size-6 shadow-sm" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className={cn(
                                            "text-sm font-bold tracking-tight italic",
                                            notif.unread ? "text-foreground" : "text-muted-foreground"
                                        )}>
                                            {notif.title}
                                        </h4>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-sans">
                                            <Clock className="size-3" />
                                            {notif.time}
                                        </div>
                                    </div>
                                    <p
                                        className={cn(
                                            "text-sm leading-relaxed",
                                            notif.unread ? "text-foreground font-medium" : "text-muted-foreground italic"
                                        )}
                                        dangerouslySetInnerHTML={{ __html: notif.message }}
                                    />
                                </div>
                            </div>

                            {/* Unread dot */}
                            {notif.unread && (
                                <div className="absolute -left-[3px] top-1/2 -translate-y-1/2 w-1.5 h-10 bg-primary/40 blur-sm"></div>
                            )}
                        </Card>
                    ))}
                </div>

                {/* Pagination / Load More */}
                <div className="flex justify-center pt-8">
                    <Button variant="outline" className="h-14 px-12 rounded-2xl border-border bg-card font-bold uppercase tracking-widest text-[10px] hover:bg-muted transition-all">
                        Voir plus de notifications
                    </Button>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Notifications;
