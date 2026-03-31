import React, { useState, useEffect, useRef, useCallback } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
    Search, Send, MoreVertical, Phone, Video, Image,
    Paperclip, Smile, Store, Zap, CheckCheck, Info
} from 'lucide-react';
import { cn } from '../lib/utils';
import messageService from '../services/messageService';
import socketService from '../services/socketService';
import { useAuth } from '../hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const Messages = () => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [selectedConv, setSelectedConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const loadConversations = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await messageService.getConversations();
            setConversations(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const loadMessages = useCallback(async (convId) => {
        try {
            const data = await messageService.getMessages(convId);
            setMessages(data);
            setTimeout(scrollToBottom, 100);
        } catch (error) {
            console.error(error);
        }
    }, []);

    useEffect(() => {
        loadConversations();

        // ⚡ TEMPS RÉEL
        socketService.connect();
        const handleNewMessage = (data) => {
            // data: { message, conversation_id }
            setConversations(prev => {
                const index = prev.findIndex(c => c.id === data.conversation_id);
                if (index === -1) {
                    loadConversations(); // Nouvelle conv ? on refresh tout
                    return prev;
                }
                const updated = [...prev];
                updated[index] = {
                    ...updated[index],
                    dernier_message: data.message.contenu,
                    date_dernier_message: data.message.createdAt
                };
                // Remonter en haut
                return [updated[index], ...updated.filter((_, i) => i !== index)];
            });

            // Si c'est la conv active, on ajoute le message
            setSelectedConv(current => {
                if (current?.id === data.conversation_id) {
                    setMessages(prev => {
                        if (prev.find(m => m.id === data.message.id)) return prev;
                        return [...prev, data.message];
                    });
                    setTimeout(scrollToBottom, 100);
                }
                return current;
            });
        };

        socketService.on('new_message', handleNewMessage);
        return () => socketService.off('new_message', handleNewMessage);
    }, [loadConversations]);

    useEffect(() => {
        if (selectedConv) {
            loadMessages(selectedConv.id);
        }
    }, [selectedConv, loadMessages]);

    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();
        if (!messageInput.trim() || !selectedConv) return;

        const destinataire = selectedConv.participants[0]; // 1-1 simple
        try {
            const newMsg = await messageService.sendMessage({
                destinataire_id: destinataire.id,
                contenu: messageInput,
                conversation_id: selectedConv.id
            });
            setMessages(prev => [...prev, newMsg]);
            setMessageInput("");
            setTimeout(scrollToBottom, 100);

            // Update conv list last msg locally
            setConversations(prev => prev.map(c =>
                c.id === selectedConv.id ? { ...c, dernier_message: messageInput, date_dernier_message: new Date() } : c
            ));
        } catch (error) {
            console.error("Échec envoi:", error);
        }
    };

    const filteredConversations = conversations.filter(c =>
        c.participants[0]?.nom_complet?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DashboardLayout title="CENTRE DE COMMUNICATIONS" noPadding>
            <div className="flex h-[calc(100vh-64px)] overflow-hidden font-inter bg-background">
                {/* Conversations Sidebar */}
                <aside className="w-80 md:w-[480px] flex flex-col bg-card border-r-4 border-border shrink-0 h-full relative z-20">
                    <div className="p-10 border-b-4 border-border">
                        <div className="flex flex-col gap-8">
                            <div className="flex items-center justify-between">
                                <h2 className="text-3xl font-black text-foreground tracking-tighter italic uppercase">Flux Réseau</h2>
                                <div className="px-4 py-2 bg-primary/10 text-primary text-executive-label font-black uppercase tracking-widest rounded-full border-2 border-primary/20 italic">BCA ENCRYPTED</div>
                            </div>
                            <div className="relative group/search">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/40 size-5 group-focus-within/search:text-primary transition-all" />
                                <input
                                    className="w-full pl-14 pr-6 h-16 bg-accent/40 border-4 border-transparent focus:border-primary/50 focus:bg-background transition-all rounded-[1.5rem] text-sm font-black italic placeholder:text-muted-foreground/30 shadow-inner"
                                    placeholder="RECHERCHER UN PARTENAIRE..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto scrollbar-hide py-6 h-full">
                        {isLoading ? (
                            <div className="p-12 text-center text-muted-foreground/40 font-black uppercase tracking-widest italic text-executive-label animate-pulse">Synchronisation...</div>
                        ) : filteredConversations.length === 0 ? (
                            <div className="p-12 text-center text-muted-foreground/30 font-black uppercase tracking-widest italic text-executive-label">Aucun canal actif.</div>
                        ) : filteredConversations.map((conv) => {
                            const partner = conv.participants[0];
                            return (
                                <button
                                    key={conv.id}
                                    onClick={() => setSelectedConv(conv)}
                                    className={cn(
                                        "w-full px-10 py-8 flex items-center gap-6 transition-all relative group border-b-2 border-border/50",
                                        selectedConv?.id === conv.id ? "bg-accent/40" : "hover:bg-accent/20"
                                    )}
                                >
                                    {selectedConv?.id === conv.id && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-16 bg-primary rounded-r-full shadow-[0_0_20px_rgba(43,90,255,0.6)]"></div>
                                    )}
                                    <div className="relative shrink-0">
                                        <div className="size-16 rounded-[1.5rem] bg-background flex items-center justify-center border-2 border-border group-hover:border-primary/40 transition-all shadow-premium overflow-hidden">
                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${partner?.id}`} alt="avatar" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 size-5 bg-emerald-500 rounded-full border-4 border-card shadow-lg"></div>
                                    </div>
                                    <div className="flex-1 text-left min-w-0">
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="text-lg font-black text-foreground italic tracking-tighter truncate leading-none uppercase">{partner?.nom_complet}</p>
                                            <span className="text-executive-label font-black text-muted-foreground/30 uppercase tracking-widest italic shrink-0">
                                                {formatDistanceToNow(new Date(conv.date_dernier_message), { addSuffix: false, locale: fr })}
                                            </span>
                                        </div>
                                        <p className="text-sm truncate font-bold max-w-[240px] text-muted-foreground/60 italic">
                                            {conv.dernier_message}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </aside>

                {/* Chat Interface */}
                <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-background">
                    {selectedConv ? (
                        <>
                            {/* Chat Header */}
                            <header className="px-12 py-10 border-b-4 border-border bg-card/80 backdrop-blur-3xl flex items-center justify-between z-10 shrink-0 shadow-premium">
                                <div className="flex items-center gap-6">
                                    <div className="size-16 rounded-[1.5rem] bg-accent/40 overflow-hidden text-primary border-2 border-border shadow-inner relative group/avatar">
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedConv.participants[0]?.id}`} alt="avatar" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover/avatar:opacity-100 transition-opacity"></div>
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-black italic tracking-tighter text-foreground leading-none mb-2 uppercase">{selectedConv.participants[0]?.nom_complet}</h3>
                                        <div className="flex items-center gap-3">
                                            <span className="size-3 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)] animate-pulse"></span>
                                            <span className="text-executive-label font-black uppercase text-primary tracking-widest leading-none italic">SÉCURISÉ & ACTIF</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Button variant="outline" size="icon" className="size-14 rounded-[1.25rem] border-2 border-border hover:border-primary hover:text-primary transition-all bg-accent/20 shadow-premium group">
                                        <Phone className="size-5 group-hover:rotate-12 transition-transform" />
                                    </Button>
                                    <Button variant="outline" size="icon" className="size-14 rounded-[1.25rem] border-2 border-border hover:border-primary hover:text-primary transition-all bg-accent/20 shadow-premium group">
                                        <Video className="size-5 group-hover:scale-110 transition-transform" />
                                    </Button>
                                    <div className="w-px h-10 bg-border mx-3 opacity-50"></div>
                                    <Button variant="ghost" size="icon" className="size-14 rounded-[1.25rem] text-muted-foreground/40 hover:text-foreground hover:bg-accent/40 transition-all">
                                        <MoreVertical className="size-6" />
                                    </Button>
                                </div>
                            </header>

                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-16 space-y-12 scrollbar-hide bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]">
                                {messages.map((msg) => {
                                    const isMe = msg.expediteur_id === user.id;
                                    return (
                                        <div key={msg.id} className={cn(
                                            "flex flex-col max-w-[70%] gap-4 animate-in fade-in slide-in-from-bottom-8 duration-500",
                                            isMe ? "ml-auto items-end" : "items-start"
                                        )}>
                                            <div className={cn(
                                                "px-10 py-6 rounded-[2.5rem] text-lg font-bold relative shadow-premium transition-all hover:scale-[1.02]",
                                                isMe
                                                    ? "bg-foreground text-background rounded-tr-none border-4 border-foreground"
                                                    : "bg-card border-4 border-border text-foreground rounded-tl-none"
                                            )}>
                                                {msg.contenu}
                                            </div>
                                            <div className="flex items-center gap-4 px-4">
                                                <span className="text-executive-label font-black text-muted-foreground/30 uppercase tracking-widest italic">
                                                    {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true, locale: fr })}
                                                </span>
                                                {isMe && <CheckCheck className="size-4 text-primary drop-shadow-[0_0_5px_rgba(43,90,255,0.4)]" />}
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Chat Input Area */}
                            <form
                                onSubmit={handleSendMessage}
                                className="p-12 bg-card/80 backdrop-blur-3xl border-t-4 border-border shrink-0"
                            >
                                <div className="flex items-center gap-6 p-6 rounded-[3rem] bg-accent/40 border-4 border-transparent focus-within:border-primary/50 focus-within:bg-background transition-all duration-500 shadow-premium-lg">
                                    <div className="flex items-center gap-3 pr-4 border-r-2 border-border/50">
                                        <Button type="button" variant="ghost" size="icon" className="size-14 rounded-[1.5rem] text-muted-foreground/40 hover:text-primary hover:bg-primary/10 transition-all group">
                                            <Paperclip className="size-6 group-hover:rotate-12 transition-transform" />
                                        </Button>
                                    </div>
                                    <input
                                        className="flex-1 bg-transparent border-none focus:ring-0 text-lg font-black text-foreground placeholder:text-muted-foreground/20 focus:outline-none italic uppercase"
                                        placeholder="TRANSMETTRE UN MESSAGE SÉCURISÉ..."
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                    />
                                    <div className="flex items-center gap-4">
                                        <Button
                                            type="submit"
                                            className="size-16 rounded-[1.5rem] shadow-premium-lg transition-all hover:scale-110 active:scale-95 bg-primary hover:bg-primary/90 flex items-center justify-center p-0 group"
                                            disabled={!messageInput.trim()}
                                        >
                                            <Send className="size-8 text-background group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-24 animate-in fade-in zoom-in duration-1000">
                            <div className="size-40 rounded-[3.5rem] bg-card flex items-center justify-center shadow-premium-lg border-4 border-border relative overflow-hidden group rotate-3 hover:rotate-0 transition-transform duration-700">
                                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent"></div>
                                <Send className="relative z-10 size-16 text-primary group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-500 shadow-sm" />
                            </div>
                            <div className="text-center space-y-6 mt-12 max-w-lg">
                                <h3 className="text-5xl font-black italic tracking-tighter text-foreground uppercase border-b-8 border-primary/20 inline-block pb-2">Communications</h3>
                                <p className="text-lg font-bold text-muted-foreground/60 leading-relaxed italic border-l-8 border-border pl-8">
                                    Sélectionnez un canal pour démarrer une session encryptée. Le réseau BCA garantit la confidentialité totale de vos échanges stratégiques.
                                </p>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-8 mt-20 opacity-20 group-hover:opacity-40 transition-opacity">
                                <Shield className="size-8 text-muted-foreground" />
                                <Zap className="size-8 text-muted-foreground" />
                                <Info className="size-8 text-muted-foreground" />
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </DashboardLayout>
    );
};

export default Messages;

