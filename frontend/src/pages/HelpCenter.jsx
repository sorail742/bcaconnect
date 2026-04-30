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
    Sparkles,
    X
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
    { title: "Commandes & Livraison", icon: Truck, q: "Comment suivre ma commande ?", a: "Dans 'Mes Commandes', cliquez sur le bouton de suivi en temps réel." },
    { title: "Paiements & Wallet", icon: ShieldCheck, q: "Transactions sécurisées ?", a: "Sécurisées à 100% via notre système de séquestre (Escrow)." },
    { title: "Compte & Sécurité", icon: LifeBuoy, q: "Activer la connexion 2FA ?", a: "Options de sécurité disponibles dans vos paramètres de profil." }
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

        const validation = ticketSchema.safeParse(ticketData);
        if (!validation.success) {
            toast.error(validation.error.errors[0].message);
            return;
        }

        createTicketMutation(ticketData);
    };

    const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

    return (
        <div className="bg-background text-foreground min-h-screen font-jakarta">
            
            {/* ══ HERO SECTION ══ */}
            <section className="relative pt-32 pb-24 overflow-hidden border-b border-border bg-muted/20">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
                
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-4xl mx-auto px-6 text-center space-y-8 relative z-10"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                        <Sparkles className="size-3" /> Centre d'assistance B2B
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-foreground leading-[0.9]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Comment pouvons-nous vous <span className="text-primary">aider</span> ?
                    </h1>
                    
                    {/* Centered Search */}
                    <div className="relative max-w-2xl mx-auto group mt-8">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 size-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input 
                            type="text"
                            placeholder="Rechercher une solution (ex: mot de passe oublié...)"
                            className="w-full h-16 pl-16 pr-6 bg-card border-2 border-border focus:border-primary rounded-[2rem] text-sm font-bold outline-none shadow-2xl transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </motion.div>
            </section>

            <div className="max-w-7xl mx-auto px-6 py-16 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    
                    {/* Left Column: FAQ & My Tickets */}
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="lg:col-span-8 space-y-12"
                    >
                        {/* Quick Help Categories */}
                        <section>
                            <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3 mb-6 text-foreground">
                                <HelpCircle className="size-6 text-primary" />
                                Aide Rapide
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {FAQ_CATEGORIES.map((cat, i) => (
                                    <motion.div 
                                        key={i}
                                        variants={itemVariants}
                                        whileHover={{ y: -5 }}
                                        className="p-6 bg-card border border-border rounded-[2rem] hover:border-primary/40 hover:shadow-2xl transition-all cursor-pointer group"
                                    >
                                        <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary border border-primary/20">
                                            <cat.icon className="size-6 transition-transform group-hover:scale-110" />
                                        </div>
                                        <h3 className="font-black text-foreground mb-3 leading-tight">{cat.title}</h3>
                                        <p className="text-xs text-muted-foreground font-medium leading-relaxed">{cat.q}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </section>

                        {/* Recent Tickets Section */}
                        <section className="bg-card border border-border rounded-[2rem] p-8 shadow-2xl">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                                <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3 text-foreground">
                                    <MessageSquare className="size-6 text-primary" />
                                    Historique des Requêtes
                                </h2>
                                <Button 
                                    onClick={() => setShowTicketForm(true)}
                                    className="h-12 px-6 bg-foreground hover:opacity-90 text-background font-black uppercase tracking-widest rounded-2xl text-xs whitespace-nowrap"
                                >
                                    <Plus className="size-4 mr-2" /> Ouvrir un ticket
                                </Button>
                            </div>

                            {ticketsLoading ? (
                                <LoadingState message="Chargement en cours..." />
                            ) : ticketsError ? (
                                <ErrorState error={ticketsError} />
                            ) : tickets.length > 0 ? (
                                <div className="space-y-4">
                                    {tickets.map((ticket) => (
                                        <div key={ticket.id} className="p-5 bg-muted/40 border border-border rounded-2xl flex items-center justify-between hover:border-primary/40 hover:shadow-lg transition-all group cursor-pointer">
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "size-12 rounded-2xl flex items-center justify-center border",
                                                    ticket.status === 'resolu' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-primary/10 border-primary/20 text-primary"
                                                )}>
                                                    {ticket.status === 'resolu' ? <CheckCircle2 className="size-6" /> : <Clock className="size-6" />}
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-base text-foreground mb-1 group-hover:text-primary transition-colors uppercase tracking-tighter">{ticket.sujet}</h4>
                                                    <p className="text-xs text-muted-foreground tracking-wide font-bold uppercase">
                                                        #{ticket.id.slice(0, 8).toUpperCase()} • {new Date(ticket.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <ChevronRight className="size-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState message="Vous n'avez aucun ticket d'assistance ouvert." />
                            )}
                        </section>
                    </motion.div>

                    {/* Right Column: Interactive Actions */}
                    <div className="lg:col-span-4 space-y-6">
                        <AnimatePresence mode="wait">
                            {showTicketForm ? (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-card border border-border rounded-[2rem] p-8 shadow-2xl relative"
                                >
                                    <button 
                                        onClick={() => setShowTicketForm(false)}
                                        className="absolute top-6 right-6 p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        <X className="size-5" />
                                    </button>
                                    
                                    <div className="mb-6 pr-10">
                                        <h3 className="text-xl font-black text-foreground uppercase tracking-tighter">Créer un ticket</h3>
                                        <p className="text-sm text-muted-foreground mt-1 font-medium">Un conseiller vous répondra sous 24h.</p>
                                    </div>

                                    <form onSubmit={handleCreateTicket} className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-foreground uppercase tracking-widest">Sujet principal</label>
                                            <input 
                                                required
                                                className="w-full h-12 px-4 bg-muted border border-border rounded-2xl text-sm font-medium outline-none focus:border-primary transition-all text-foreground"
                                                placeholder="Ex: Problème de livraison"
                                                value={ticketData.sujet}
                                                onChange={e => setTicketData({...ticketData, sujet: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-foreground uppercase tracking-widest">Catégorie associée</label>
                                            <select 
                                                className="w-full h-12 px-4 bg-muted border border-border rounded-2xl text-sm font-medium outline-none focus:border-primary transition-all text-foreground"
                                                value={ticketData.categorie}
                                                onChange={e => setTicketData({...ticketData, categorie: e.target.value})}
                                            >
                                                <option value="technique">Support Technique</option>
                                                <option value="facturation">Service Facturation</option>
                                                <option value="logistique">Information Logistique</option>
                                                <option value="autre">Requête Générale</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-foreground uppercase tracking-widest">Description détaillée</label>
                                            <textarea 
                                                required
                                                rows={5}
                                                className="w-full p-4 bg-muted border border-border rounded-2xl text-sm font-medium outline-none focus:border-primary transition-all resize-none text-foreground"
                                                placeholder="Fournissez un maximum de détails..."
                                                value={ticketData.message}
                                                onChange={e => setTicketData({...ticketData, message: e.target.value})}
                                            />
                                        </div>
                                        <Button 
                                            type="submit"
                                            disabled={creatingTicket}
                                            className="w-full h-12 mt-2 bg-primary text-primary-foreground hover:bg-primary/90 font-black uppercase tracking-widest rounded-2xl shadow-xl"
                                        >
                                            {creatingTicket ? "ENVOI..." : "SOUMETTRE"}
                                            {!creatingTicket && <Send className="size-4 ml-2" />}
                                        </Button>
                                    </form>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden group shadow-xl"
                                >
                                    <div className="absolute inset-0 bg-[#FF6600]/10 mix-blend-overlay" />
                                    <div className="relative z-10 space-y-6">
                                        <div className="size-12 rounded-xl bg-[#FF6600] flex items-center justify-center mb-6">
                                            <LifeBuoy className="size-6 text-white" />
                                        </div>
                                        <h3 className="text-2xl font-bold tracking-tight">Assistance Premium</h3>
                                        <p className="text-sm font-medium text-slate-300 leading-relaxed">
                                            Profitez d'un accompagnement personnalisé avec nos experts. Temps de réponse garanti en moins de 2 heures.
                                        </p>
                                        <div className="space-y-3 pt-2">
                                            <div className="flex items-center gap-3 text-sm text-slate-200">
                                                <CheckCircle2 className="size-4 text-[#FF6600]" /> 100% basé en Guinée
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-slate-200">
                                                <CheckCircle2 className="size-4 text-[#FF6600]" /> Lundi - Samedi, 8h-18h
                                            </div>
                                        </div>
                                    </div>
                                    <Sparkles className="absolute -bottom-6 -right-6 size-48 opacity-5 group-hover:scale-110 transition-transform duration-1000 text-white" />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="p-6 bg-muted/50 border border-border rounded-[2rem] flex gap-4 mt-6">
                            <AlertCircle className="size-6 text-amber-500 shrink-0" />
                            <div>
                                <h4 className="font-black text-sm text-foreground mb-1 uppercase tracking-tighter">Rapport de Bug ?</h4>
                                <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                                    Veuillez joindre une capture d'écran claire dans votre descriptif de ticket si possible.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpCenter;
