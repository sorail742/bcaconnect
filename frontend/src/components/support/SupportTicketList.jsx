import React, { useState, useEffect } from 'react';
import supportService from '../../services/supportService';
import { Clock, CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react';
import { cn } from '../../lib/utils';

const SupportTicketList = () => {
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const data = await supportService.getMyTickets();
                setTickets(data || []);
            } catch (error) {
                console.error("Erreur tickets:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTickets();
    }, []);

    const statusMap = {
        ouvert: { label: 'Ouvert', color: 'text-blue-500', bg: 'bg-blue-500/10', icon: Clock },
        en_cours: { label: 'En cours', color: 'text-amber-500', bg: 'bg-amber-500/10', icon: MessageSquare },
        resolu: { label: 'Résolu', color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: CheckCircle2 },
        ferme: { label: 'Fermé', color: 'text-slate-500', bg: 'bg-slate-500/10', icon: AlertCircle },
    };

    if (isLoading) return <div className="py-8 text-center text-[10px] font-black uppercase opacity-40">Synchronisation des flux support...</div>;

    if (tickets.length === 0) return null;

    return (
        <div className="space-y-6">
            <h3 className="text-sm font-black text-foreground uppercase tracking-tighter flex items-center gap-3">
                <div className="size-2 rounded-full bg-[#FF6600] shadow-[0_0_8px_#FF6600]" />
                Suivi de mes tickets d'assistance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tickets.map((ticket) => {
                    const status = statusMap[ticket.statut] || statusMap.ouvert;
                    const Icon = status.icon;
                    return (
                        <div key={ticket.id} className="bg-white dark:bg-[#0F1219] border-2 border-slate-100 dark:border-foreground/5 p-6 rounded-2xl hover:border-[#FF6600]/20 transition-all shadow-sm group">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">#{ticket.id.slice(0, 8).toUpperCase()}</span>
                                <div className={cn("px-3 py-1 rounded-lg flex items-center gap-2 text-[8px] font-black uppercase tracking-widest", status.bg, status.color)}>
                                    <Icon className="size-3" />
                                    {status.label}
                                </div>
                            </div>
                            <h4 className="text-[12px] font-black text-foreground uppercase truncate mb-2">{ticket.sujet}</h4>
                            <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed mb-4">{ticket.description}</p>
                            <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-foreground/5">
                                <span className="text-[8px] font-black text-muted-foreground uppercase">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                                <span className={cn("text-[8px] font-black uppercase", ticket.priorite === 'haute' ? 'text-rose-500' : 'text-blue-500')}>Priorité {ticket.priorite}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SupportTicketList;
