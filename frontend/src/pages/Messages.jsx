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
        <DashboardLayout title="Centre de Messages" noPadding>
            <div className="flex h-[calc(100vh-64px)] overflow-hidden font-inter bg-background">
                {/* Conversations Sidebar */}
                <aside className="w-80 md:w-96 flex flex-col bg-card border-r border-border shrink-0 h-full relative z-20">
                    <div className="p-8 border-b border-border">
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-black text-foreground tracking-tighter italic">Discussions</h2>
                                <div className="px-3 py-1 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest rounded-full border border-primary/20">BCA Chat</div>
                            </div>
                            <div className="relative group/search">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground size-4 group-focus-within/search:text-primary transition-colors" />
                                <input
                                    className="w-full pl-11 pr-4 h-12 bg-muted/30 border-2 border-transparent focus:border-primary/50 focus:bg-background transition-all rounded-2xl text-xs font-bold placeholder:text-muted-foreground"
                                    placeholder="Rechercher un partenaire..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto scrollbar-hide py-4">
                        {isLoading ? (
                            <div className="p-8 text-center text-muted-foreground italic text-xs">Chargement...</div>
                        ) : filteredConversations.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground italic text-xs">Aucune conversation.</div>
                        ) : filteredConversations.map((conv) => {
                            const partner = conv.participants[0];
                            return (
                                <button
                                    key={conv.id}
                                    onClick={() => setSelectedConv(conv)}
                                    className={cn(
                                        "w-full px-8 py-6 flex items-center gap-4 transition-all relative group",
                                        selectedConv?.id === conv.id ? "bg-primary/5" : "hover:bg-muted/50"
                                    )}
                                >
                                    {selectedConv?.id === conv.id && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-primary rounded-r-full shadow-[0_0_15px_rgba(234,88,12,0.4)]"></div>
                                    )}
                                    <div className="relative shrink-0">
                                        <div className="size-14 rounded-2xl bg-card flex items-center justify-center border border-border group-hover:border-primary/30 transition-all shadow-sm overflow-hidden">
                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${partner?.id}`} alt="avatar" />
                                        </div>
                                    </div>
                                    <div className="flex-1 text-left min-w-0">
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="text-sm font-black text-foreground italic tracking-tight truncate">{partner?.nom_complet}</p>
                                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter">
                                                {formatDistanceToNow(new Date(conv.date_dernier_message), { addSuffix: false, locale: fr })}
                                            </span>
                                        </div>
                                        <p className="text-xs truncate font-medium max-w-[180px] text-muted-foreground">
                                            {conv.dernier_message}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </aside>

                {/* Chat Interface */}
                <main className="flex-1 flex flex-col h-full relative overflow-hidden">
                    {selectedConv ? (
                        <>
                            {/* Chat Header */}
                            <header className="px-10 py-6 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between z-10 shrink-0">
                                <div className="flex items-center gap-5">
                                    <div className="size-12 rounded-2xl bg-primary/10 overflow-hidden text-primary border border-primary/20 shadow-inner">
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedConv.participants[0]?.id}`} alt="avatar" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black italic tracking-tighter text-foreground leading-none mb-1">{selectedConv.participants[0]?.nom_complet}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                                            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest leading-none">Actif</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Button variant="outline" size="icon" className="size-11 rounded-xl border-border hover:border-primary hover:text-primary transition-all bg-card">
                                        <Phone className="size-4" />
                                    </Button>
                                    <Button variant="outline" size="icon" className="size-11 rounded-xl border-border hover:border-primary hover:text-primary transition-all bg-card">
                                        <Video className="size-4" />
                                    </Button>
                                    <div className="w-px h-8 bg-border mx-2"></div>
                                    <Button variant="ghost" size="icon" className="size-11 rounded-xl text-muted-foreground hover:text-foreground">
                                        <MoreVertical className="size-5" />
                                    </Button>
                                </div>
                            </header>

                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-12 space-y-10 scrollbar-hide bg-pattern dark:opacity-40">
                                {messages.map((msg) => {
                                    const isMe = msg.expediteur_id === user.id;
                                    return (
                                        <div key={msg.id} className={cn(
                                            "flex flex-col max-w-[75%] gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300",
                                            isMe ? "ml-auto items-end" : "items-start"
                                        )}>
                                            <div className={cn(
                                                "px-8 py-5 rounded-[2.5rem] text-sm font-semibold relative shadow-lg group/msg",
                                                isMe
                                                    ? "bg-primary text-white shadow-primary/20 rounded-tr-xl"
                                                    : "bg-card border-2 border-border text-foreground rounded-tl-xl"
                                            )}>
                                                {msg.contenu}
                                            </div>
                                            <div className="flex items-center gap-3 px-3">
                                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                                    {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true, locale: fr })}
                                                </span>
                                                {isMe && <CheckCheck className="size-3.5 text-primary" />}
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Chat Input Area */}
                            <form
                                onSubmit={handleSendMessage}
                                className="p-10 bg-card/80 backdrop-blur-md border-t border-border shrink-0"
                            >
                                <div className="flex items-center gap-4 p-5 rounded-[2.5rem] bg-muted/30 border-2 border-transparent focus-within:border-primary/50 focus-within:bg-background transition-all duration-300 shadow-inner">
                                    <div className="flex items-center gap-2 pr-3 border-r border-border">
                                        <Button type="button" variant="ghost" size="icon" className="size-11 rounded-2xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                                            <Paperclip className="size-5" />
                                        </Button>
                                    </div>
                                    <input
                                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
                                        placeholder="Votre message..."
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                    />
                                    <div className="flex items-center gap-3">
                                        <Button
                                            type="submit"
                                            className="size-14 rounded-[1.5rem] shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95 bg-primary hover:bg-primary/90 flex items-center justify-center p-0"
                                            disabled={!messageInput.trim()}
                                        >
                                            <Send className="size-6 text-white translate-x-0.5 -translate-y-0.5" />
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-20 animate-in fade-in zoom-in duration-1000">
                            <div className="size-32 rounded-[2.5rem] bg-card flex items-center justify-center shadow-2xl border border-border relative overflow-hidden group">
                                <Send className="relative z-10 size-12 text-primary rotate-12 group-hover:scale-110 transition-transform duration-500" />
                            </div>
                            <div className="text-center space-y-3 mt-10">
                                <h3 className="text-3xl font-black italic tracking-tighter text-foreground uppercase">Vos Messages</h3>
                                <p className="text-sm font-medium text-muted-foreground max-w-sm leading-relaxed">
                                    Sélectionnez un vendeur ou un partenaire logistique pour démarrer une discussion sécurisée sur le réseau BCA.
                                </p>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </DashboardLayout>
    );
};

export default Messages;

