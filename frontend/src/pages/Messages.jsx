import React, { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
    Search,
    Send,
    MoreVertical,
    Phone,
    Video,
    Image,
    Paperclip,
    Smile,
    Store,
    Zap,
    CheckCheck,
    Info,
    ChevronLeft
} from 'lucide-react';
import { cn } from '../lib/utils';

const CONVERSATIONS = [
    {
        id: 1,
        name: 'TechStore GN',
        lastMsg: 'Votre smartphone est prêt pour la livraison.',
        time: '14:30',
        unread: 2,
        online: true,
        avatar: null
    },
    {
        id: 2,
        name: 'Atelier Wood',
        lastMsg: 'Le devis pour la table est disponible.',
        time: 'Hier',
        unread: 0,
        online: false,
        avatar: null
    },
    {
        id: 3,
        name: 'Mode Africaine',
        lastMsg: 'Nous avons reçu les nouveaux tissus.',
        time: 'Mar',
        unread: 0,
        online: true,
        avatar: null
    },
    {
        id: 4,
        name: 'Logistique BCA',
        lastMsg: 'Problème d\'adresse pour ORD-552.',
        time: 'Lun',
        unread: 5,
        online: true,
        avatar: null
    },
];

const MESSAGES = [
    { id: 1, sender: 'TechStore GN', text: 'Bonjour ! Merci pour votre achat.', time: '14:20', isMe: false },
    { id: 2, sender: 'Me', text: 'Merci, quand sera-t-il expédié ?', time: '14:25', isMe: true },
    { id: 3, sender: 'TechStore GN', text: 'Votre smartphone est prêt pour la livraison. Notre coursier passera d\'ici 1h.', time: '14:30', isMe: false, status: 'read' },
];

const Messages = () => {
    const [selectedChat, setSelectedChat] = useState(CONVERSATIONS[0]);
    const [messageInput, setMessageInput] = useState("");

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
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto scrollbar-hide py-4">
                        {CONVERSATIONS.map((conv) => (
                            <button
                                key={conv.id}
                                onClick={() => setSelectedChat(conv)}
                                className={cn(
                                    "w-full px-8 py-6 flex items-center gap-4 transition-all relative group",
                                    selectedChat?.id === conv.id ? "bg-primary/5" : "hover:bg-muted/50"
                                )}
                            >
                                {selectedChat?.id === conv.id && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-primary rounded-r-full shadow-[0_0_15px_rgba(234,88,12,0.4)]"></div>
                                )}
                                <div className="relative shrink-0">
                                    <div className="size-14 rounded-2xl bg-card flex items-center justify-center border border-border group-hover:border-primary/30 transition-all shadow-sm">
                                        <Store className="size-7 text-primary" />
                                    </div>
                                    {conv.online && (
                                        <div className="absolute -bottom-1 -right-1 size-4 bg-emerald-500 rounded-full border-4 border-card shadow-sm"></div>
                                    )}
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <p className="text-sm font-black text-foreground italic tracking-tight truncate">{conv.name}</p>
                                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter">{conv.time}</span>
                                    </div>
                                    <p className={cn(
                                        "text-xs truncate font-medium max-w-[180px]",
                                        conv.unread > 0 ? "text-foreground font-black" : "text-muted-foreground"
                                    )}>
                                        {conv.lastMsg}
                                    </p>
                                </div>
                                {conv.unread > 0 && (
                                    <div className="size-5 rounded-lg bg-primary text-white text-[9px] font-black flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                                        {conv.unread}
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </aside>

                {/* Chat Interface */}
                <main className="flex-1 flex flex-col h-full relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] -mr-40 -mt-40"></div>

                    {selectedChat ? (
                        <>
                            {/* Chat Header */}
                            <header className="px-10 py-6 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between z-10 shrink-0">
                                <div className="flex items-center gap-5">
                                    <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
                                        <Store className="size-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black italic tracking-tighter text-foreground leading-none mb-1">{selectedChat.name}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className={cn(
                                                "size-2 rounded-full",
                                                selectedChat.online ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-muted-foreground"
                                            )}></span>
                                            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest leading-none">
                                                {selectedChat.online ? 'En ligne' : 'Inactif'}
                                            </span>
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
                                <div className="flex justify-center mb-10">
                                    <span className="px-5 py-2 bg-card shadow-sm border border-border text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground rounded-full">
                                        Discussion sécurisée • Aujourd'hui
                                    </span>
                                </div>

                                {MESSAGES.map((msg) => (
                                    <div key={msg.id} className={cn(
                                        "flex flex-col max-w-[70%] gap-3 animate-in fade-in slide-in-from-bottom-5 duration-700",
                                        msg.isMe ? "ml-auto items-end" : "items-start"
                                    )}>
                                        <div className={cn(
                                            "px-8 py-5 rounded-[2.5rem] text-sm font-semibold relative shadow-lg group/msg",
                                            msg.isMe
                                                ? "bg-primary text-white shadow-primary/20 rounded-tr-xl"
                                                : "bg-card border-2 border-border text-foreground rounded-tl-xl"
                                        )}>
                                            {msg.text}
                                            <button className={cn(
                                                "absolute top-1/2 -translate-y-1/2 size-9 rounded-full bg-foreground text-background flex items-center justify-center opacity-0 group-hover/msg:opacity-100 transition-all duration-300 shadow-xl",
                                                msg.isMe ? "-left-14" : "-right-14"
                                            )}>
                                                <Zap className="size-4" />
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-3 px-3">
                                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{msg.time}</span>
                                            {msg.isMe && <CheckCheck className="size-3.5 text-primary" />}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Chat Input Area */}
                            <div className="p-10 bg-card/80 backdrop-blur-md border-t border-border shrink-0">
                                <div className="flex items-center gap-4 p-5 rounded-[2.5rem] bg-muted/30 border-2 border-transparent focus-within:border-primary/50 focus-within:bg-background transition-all duration-300 shadow-inner">
                                    <div className="flex items-center gap-2 pr-3 border-r border-border">
                                        <Button variant="ghost" size="icon" className="size-11 rounded-2xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                                            <Paperclip className="size-5" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="size-11 rounded-2xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors hidden sm:flex">
                                            <Image className="size-5" />
                                        </Button>
                                    </div>
                                    <input
                                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold text-foreground placeholder:text-muted-foreground/70"
                                        placeholder="Votre message pour ce vendeur..."
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && messageInput && setMessageInput('')}
                                    />
                                    <div className="flex items-center gap-3">
                                        <Button variant="ghost" size="icon" className="size-11 rounded-2xl text-muted-foreground hover:text-yellow-500 transition-colors hidden sm:flex">
                                            <Smile className="size-5" />
                                        </Button>
                                        <Button
                                            className="size-14 rounded-[1.5rem] shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95 bg-primary hover:bg-primary/90 flex items-center justify-center p-0"
                                            onClick={() => setMessageInput('')}
                                            disabled={!messageInput.trim()}
                                        >
                                            <Send className="size-6 text-white translate-x-0.5 -translate-y-0.5" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-center gap-6 mt-6 opacity-40">
                                    <div className="flex items-center gap-2">
                                        <Info className="size-3" />
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground">Chiffrement de bout en bout</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px]">
                                        <Zap className="size-3" />
                                        <span>BCA Turbo-Chat actif</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-20 animate-in fade-in zoom-in duration-1000">
                            <div className="size-32 rounded-[2.5rem] bg-card flex items-center justify-center shadow-2xl border border-border relative overflow-hidden group">
                                <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors"></div>
                                <Send className="relative z-10 size-12 text-primary rotate-12 group-hover:scale-110 transition-transform duration-500" />
                            </div>
                            <div className="text-center space-y-3 mt-10">
                                <h3 className="text-3xl font-black italic tracking-tighter text-foreground uppercase">Vos Messages</h3>
                                <p className="text-sm font-medium text-muted-foreground max-w-sm leading-relaxed">
                                    Sélectionnez un vendeur ou un partenaire logistique pour démarrer une discussion sécurisée sur le réseau BCA.
                                </p>
                            </div>
                            <Button variant="outline" className="mt-10 rounded-2xl px-10 h-14 border-2 font-black uppercase tracking-widest text-[11px] hover:bg-primary hover:text-white hover:border-primary transition-all shadow-xl">
                                Nouvelle Discussion
                            </Button>
                        </div>
                    )}
                </main>
            </div>
        </DashboardLayout>
    );
};

export default Messages;
