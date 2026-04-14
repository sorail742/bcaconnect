import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, 
    MessageSquare, 
    Plus, 
    ChevronRight, 
    HelpCircle, 
    LifeBuoy, 
    ShieldCheck, 
    Clock,
    AlertCircle,
    CheckCircle2,
    Send,
    Truck,
    Sparkles
} from 'lucide-react';
import { useTickets } from '../hooks/useDomainData';
import useApiMutation from '../hooks/useApiMutation';
import supportService from '../services/supportService';
import { Button } from '../components/ui/Button';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/DataStates';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import { ticketSchema } from '../lib/validation';

const FAQ_CATEGORIES = [
    { title: "Commandes & Livraison", icon: Truck, q: "Comment suivre ma commande ?", a: "Vous pouvez suivre votre commande dans la section 'Mes Commandes' en cliquant sur le bouton 'Suivre'." },
    { title: "Paiements & Portefeuille", icon: ShieldCheck, q: "Mes transactions sont-elles sécurisées ?", a: "Oui, toutes les transactions sur BCA Connect sont cryptées et protégées par notre système de séquestre." },
    { title: "Compte & Sécurité", icon: LifeBuoy, q: "Comment activer la 2FA ?", a: "Allez dans votre profil, section 'Sécurité' et suivez les instructions pour activer l'authentification à deux facteurs." }
];

const HelpCenter = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [showTicketForm, setShowTicketForm] = useState(false);
    const [ticketData, setTicketData] = useState({ sujet: "", message: "", categorie: "technique", priorité: "normale" });

    const { data: tickets = [], loading: ticketsLoading, error: ticketsError } = useTickets();
    const { mutate: createTicketMutation, isPending: creatingTicket } = useApiMutation(
        (data) => supportService.createTicket(data),
        {
            invalidateKeys: [['tickets']],
            successMessage: "Ticket créé avec succès ! Notre équipe reviendra vers vous rapidement.",
            errorMessage: "Erreur lors de la création du ticket. Veuillez réessayer.",
            onSuccess: () => {
                setShowTicketForm(false);
                setTicketData({ sujet: "", message: "", categorie: "technique", priorité: "normale" });
            }
        }
    );

    const handleCreateTicket = async (e) => {
        e.preventDefault();

        // Zod Validation
        const validation = ticketSchema.safeParse(ticketData);
        if (!validation.success) {
            toast.error(validation.error.errors[0].message);
            return;
        }

        createTicketMutation(ticketData);
    };

    return (
        <div className="bg-background min-h-screen text-foreground pt-24 pb-20">
            <div className="max-w-6xl mx-auto px-6">
                
                {/* Header */}
                <div className="text-center space-y-4 mb-16">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter">BCA <span className="text-primary">Support</span> Center</h1>
                    <p className="text-muted-foreground text-lg font-medium max-w-2xl mx-auto">
                        Besoin d'aide ? Recherchez dans notre FAQ ou ouvrez un ticket d'assistance pour une réponse personnalisée.
                    </p>
                    
                    {/* Search Bar */}
                    <div className="relative max-w-xl mx-auto pt-8">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                        <input 
                            type="text"
                            placeholder="Comment pouvons-nous vous aider aujourd'hui ?"
                            className="w-full h-14 pl-12 pr-6 bg-card border border-border focus:border-primary/50 rounded-2xl outline-none shadow-xl transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    
                    {/* Left Column: FAQ & Categories */}
                    <div className="lg:col-span-2 space-y-12">
                        <section>
                            <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                                <HelpCircle className="size-6 text-primary" />
                                Questions Fréquentes
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {FAQ_CATEGORIES.map((cat, i) => (
                                    <motion.div 
                                        key={i}
                                        whileHover={{ y: -5 }}
                                        className="p-6 bg-card border border-border rounded-2xl hover:border-primary/30 transition-all cursor-pointer group"
                                    >
                                        <cat.icon className="size-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
                                        <h3 className="font-bold text-lg mb-2">{cat.title}</h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2">{cat.q}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </section>

                        <section>
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-black flex items-center gap-3">
                                    <MessageSquare className="size-6 text-primary" />
                                    Mes Tickets
                                </h2>
                                <Button 
                                    onClick={() => setShowTicketForm(true)}
                                    className="h-10 px-4 bg-primary text-primary-foreground font-black rounded-xl border-none text-[10px] uppercase tracking-widest"
                                >
                                    <Plus className="size-4 mr-2" />
                                    Nouveau Ticket
                                </Button>
                            </div>

                            {ticketsLoading ? (
                                <LoadingState message="Chargement de vos tickets..." />
                            ) : ticketsError ? (
                                <ErrorState error={ticketsError} />
                            ) : tickets.length > 0 ? (
                                <div className="space-y-4">
                                    {tickets.map((ticket) => (
                                        <div key={ticket.id} className="p-5 bg-card border border-border rounded-2xl flex items-center justify-between hover:bg-muted/30 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "size-10 rounded-full flex items-center justify-center",
                                                    ticket.status === 'resolu' ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                                                )}>
                                                    {ticket.status === 'resolu' ? <CheckCircle2 className="size-5" /> : <Clock className="size-5" />}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-sm tracking-tight">{ticket.sujet}</h4>
                                                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-1">
                                                        REF: #{ticket.id.slice(0, 8)} • {new Date(ticket.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <ChevronRight className="size-4 text-muted-foreground" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState message="Vous n'avez aucun ticket d'assistance en cours." />
                            )}
                        </section>
                    </div>

                    {/* Right Column: Dynamic Form or Contact Card */}
                    <div className="space-y-8">
                        <AnimatePresence mode="wait">
                            {showTicketForm ? (
                                <motion.div 
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="bg-card border border-border rounded-3xl p-8 shadow-2xl relative"
                                >
                                    <button 
                                        onClick={() => setShowTicketForm(false)}
                                        className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                                    >
                                        <Plus className="size-5 rotate-45" />
                                    </button>
                                    <h3 className="text-xl font-black mb-6">Ouvrir un <span className="text-primary">Ticket</span></h3>
                                    <form onSubmit={handleCreateTicket} className="space-y-5">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sujet</label>
                                            <input 
                                                required
                                                className="w-full h-11 px-4 bg-background border border-border rounded-xl text-sm outline-none focus:border-primary/50 transition-all"
                                                placeholder="Ex: Problème de paiement"
                                                value={ticketData.sujet}
                                                onChange={e => setTicketData({...ticketData, sujet: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Catégorie</label>
                                            <select 
                                                className="w-full h-11 px-4 bg-background border border-border rounded-xl text-sm outline-none font-bold"
                                                value={ticketData.categorie}
                                                onChange={e => setTicketData({...ticketData, categorie: e.target.value})}
                                            >
                                                <option value="technique">Technique</option>
                                                <option value="facturation">Facturation</option>
                                                <option value="logistique">Logistique</option>
                                                <option value="autre">Autre</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Message</label>
                                            <textarea 
                                                required
                                                rows={4}
                                                className="w-full p-4 bg-background border border-border rounded-xl text-sm outline-none focus:border-primary/50 transition-all resize-none"
                                                placeholder="Décrivez votre problème en détail..."
                                                value={ticketData.message}
                                                onChange={e => setTicketData({...ticketData, message: e.target.value})}
                                            />
                                        </div>
                                        <Button 
                                            type="submit"
                                            disabled={creatingTicket}
                                            className="w-full h-12 bg-primary text-primary-foreground font-black rounded-xl border-none shadow-lg shadow-primary/20"
                                        >
                                            {creatingTicket ? "ENVOI EN COURS..." : "SOUMETTRE LE TICKET"}
                                            <Send className="size-4 ml-2" />
                                        </Button>
                                    </form>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-primary rounded-3xl p-8 text-primary-foreground relative overflow-hidden group"
                                >
                                    <div className="relative z-10 space-y-6">
                                        <h3 className="text-2xl font-black tracking-tighter">Support Direct</h3>
                                        <p className="font-medium text-primary-foreground/80">
                                            Nos agents sont disponibles du Lundi au Samedi, de 9h à 18h.
                                        </p>
                                        <div className="space-y-4 pt-4">
                                            <div className="flex items-center gap-3">
                                                <CheckCircle2 className="size-5" />
                                                <span className="text-sm font-bold">Temps de réponse : &lt; 2h</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <ShieldCheck className="size-5" />
                                                <span className="text-sm font-bold">Assistance locale 100% Guinéenne</span>
                                            </div>
                                        </div>
                                        <Button 
                                            variant="outline" 
                                            className="w-full bg-background text-foreground border-none font-black rounded-xl h-11 mt-4"
                                        >
                                            APPELER LE 121
                                        </Button>
                                    </div>
                                    <Sparkles className="absolute -bottom-10 -right-10 size-64 opacity-10 group-hover:scale-110 transition-transform duration-1000" />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="p-6 bg-muted border border-border rounded-3xl space-y-4">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="size-5 text-amber-500" />
                                <h4 className="font-bold text-sm">Rapport de bug ?</h4>
                            </div>
                            <p className="text-xs font-medium text-muted-foreground">
                                Si vous rencontrez un problème technique majeur, merci de joindre une capture d'écran à votre ticket.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Remove local Truck mock as it's now imported

export default HelpCenter;
