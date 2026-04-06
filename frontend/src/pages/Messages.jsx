import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import DashboardLayout from '../components/layout/DashboardLayout';
import {
    Search, Send, Phone, Video, MoreHorizontal,
    MessageSquare, Plus, X, Check, CheckCheck,
    Loader2, Users, ArrowLeft
} from 'lucide-react';
import { cn } from '../lib/utils';
import messageService from '../services/messageService';
import userService from '../services/userService';
import socketService from '../services/socketService';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

// ── Composant avatar ──────────────────────────────────────────────────────────
const Avatar = ({ seed, size = 'md', online = false }) => {
    const sizes = { sm: 'size-8', md: 'size-10', lg: 'size-12' };
    return (
        <div className="relative shrink-0">
            <div className={cn("rounded-xl overflow-hidden bg-muted border border-border", sizes[size])}>
                <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed || 'default'}`}
                    alt=""
                    className="w-full h-full object-cover"
                />
            </div>
            {online && (
                <div className="absolute -bottom-0.5 -right-0.5 size-3 bg-emerald-500 rounded-full border-2 border-background" />
            )}
        </div>
    );
};

// ── Composant bulle de message ────────────────────────────────────────────────
const MessageBubble = ({ msg, isMe }) => (
    <div className={cn("flex flex-col gap-1 max-w-[70%] animate-in fade-in slide-in-from-bottom-2 duration-300", isMe ? "ml-auto items-end" : "items-start")}>
        <div className={cn(
            "px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
            isMe
                ? "bg-primary text-primary-foreground rounded-br-sm"
                : "bg-card border border-border text-foreground rounded-bl-sm"
        )}>
            {msg.contenu}
        </div>
        <div className="flex items-center gap-1 px-1">
            <span className="text-[10px] text-muted-foreground">
                {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true, locale: fr })}
            </span>
            {isMe && <CheckCheck className="size-3 text-primary" />}
        </div>
    </div>
);

// ── Composant item conversation ───────────────────────────────────────────────
const ConvItem = ({ conv, isActive, onClick }) => {
    const partner = conv.participants?.[0];
    const lastDate = conv.date_dernier_message ? new Date(conv.date_dernier_message) : null;
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left group",
                isActive ? "bg-primary/10 border border-primary/20" : "hover:bg-muted border border-transparent"
            )}
        >
            <Avatar seed={partner?.id} online />
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <p className={cn("text-sm font-semibold truncate", isActive ? "text-primary" : "text-foreground")}>
                        {partner?.nom_complet || 'Utilisateur'}
                    </p>
                    {lastDate && (
                        <span className="text-[10px] text-muted-foreground shrink-0">
                            {formatDistanceToNow(lastDate, { locale: fr })}
                        </span>
                    )}
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {conv.dernier_message || 'Démarrer la conversation'}
                </p>
            </div>
            {conv.unread_count > 0 && (
                <span className="size-5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">
                    {conv.unread_count}
                </span>
            )}
        </button>
    );
};

// ── Page principale ───────────────────────────────────────────────────────────
const Messages = () => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [selectedConv, setSelectedConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showNewConv, setShowNewConv] = useState(false);
    const [users, setUsers] = useState([]);
    const [userSearch, setUserSearch] = useState('');
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [typingUsers, setTypingUsers] = useState({});
    const [mobileShowChat, setMobileShowChat] = useState(false);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    // ── Charger conversations ─────────────────────────────────────────────────
    const loadConversations = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await messageService.getConversations();
            setConversations(data);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // ── Charger messages d'une conversation ───────────────────────────────────
    const loadMessages = useCallback(async (convId) => {
        try {
            const data = await messageService.getMessages(convId);
            setMessages(data);
            setTimeout(scrollToBottom, 100);
            messageService.markAsRead(convId);
        } catch { /* silent */ }
    }, [scrollToBottom]);

    // ── Socket.io setup ───────────────────────────────────────────────────────
    useEffect(() => {
        loadConversations();
        socketService.connect();

        // Rejoindre la room utilisateur
        if (user?.id) {
            socketService.socket?.emit('join', user.id);
            socketService.on('connect', () => {
                socketService.socket?.emit('join', user.id);
            });
        }

        // Nouveau message reçu
        const handleNewMessage = (data) => {
            // Mettre à jour la liste des conversations
            setConversations(prev => {
                const idx = prev.findIndex(c => c.id === data.conversation_id);
                if (idx === -1) {
                    loadConversations();
                    return prev;
                }
                const updated = [...prev];
                updated[idx] = {
                    ...updated[idx],
                    dernier_message: data.message.contenu,
                    date_dernier_message: data.message.createdAt,
                    unread_count: (updated[idx].unread_count || 0) + 1
                };
                // Remonter la conversation en haut
                return [updated[idx], ...updated.filter((_, i) => i !== idx)];
            });

            // Ajouter le message si la conversation est ouverte
            setSelectedConv(current => {
                if (current?.id === data.conversation_id) {
                    setMessages(prev => {
                        if (prev.find(m => m.id === data.message.id)) return prev;
                        return [...prev, data.message];
                    });
                    setTimeout(scrollToBottom, 100);
                    messageService.markAsRead(data.conversation_id);
                    // Reset unread count
                    setConversations(c => c.map(conv =>
                        conv.id === data.conversation_id ? { ...conv, unread_count: 0 } : conv
                    ));
                }
                return current;
            });
        };

        // Indicateur de frappe
        const handleTyping = ({ conversationId, userId, isTyping }) => {
            if (userId === user?.id) return;
            setTypingUsers(prev => ({ ...prev, [conversationId]: isTyping ? userId : null }));
        };

        socketService.on('new_message', handleNewMessage);
        socketService.on('user_typing', handleTyping);

        return () => {
            socketService.off('new_message', handleNewMessage);
            socketService.off('user_typing', handleTyping);
        };
    }, [loadConversations, scrollToBottom, user?.id]);

    // ── Charger messages quand conversation change ────────────────────────────
    useEffect(() => {
        if (selectedConv) {
            loadMessages(selectedConv.id);
            // Rejoindre la room de conversation
            socketService.socket?.emit('join_conversation', selectedConv.id);
        }
    }, [selectedConv, loadMessages]);

    // ── Envoyer un message ────────────────────────────────────────────────────
    const handleSend = async (e) => {
        e?.preventDefault();
        if (!messageInput.trim() || !selectedConv || isSending) return;

        const content = messageInput.trim();
        const partner = selectedConv.participants?.[0];
        setMessageInput('');
        setIsSending(true);

        // Optimistic update
        const tempMsg = {
            id: `temp-${Date.now()}`,
            contenu: content,
            expediteur_id: user.id,
            createdAt: new Date().toISOString(),
            temp: true
        };
        setMessages(prev => [...prev, tempMsg]);
        setTimeout(scrollToBottom, 50);

        try {
            const newMsg = await messageService.sendMessage({
                destinataire_id: partner?.id,
                contenu: content,
                conversation_id: selectedConv.id
            });
            // Remplacer le message temporaire
            setMessages(prev => prev.map(m => m.id === tempMsg.id ? newMsg : m));
            setConversations(prev => prev.map(c =>
                c.id === selectedConv.id
                    ? { ...c, dernier_message: content, date_dernier_message: new Date() }
                    : c
            ));
            // Arrêter l'indicateur de frappe
            socketService.socket?.emit('typing', { conversationId: selectedConv.id, isTyping: false });
        } catch {
            setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
            setMessageInput(content);
        } finally {
            setIsSending(false);
        }
    };

    // ── Indicateur de frappe ──────────────────────────────────────────────────
    const handleTypingInput = (e) => {
        setMessageInput(e.target.value);
        if (!selectedConv) return;
        socketService.socket?.emit('typing', { conversationId: selectedConv.id, isTyping: true });
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socketService.socket?.emit('typing', { conversationId: selectedConv.id, isTyping: false });
        }, 2000);
    };

    // ── Nouvelle conversation ─────────────────────────────────────────────────
    const loadUsers = useCallback(async (search = '') => {
        setIsLoadingUsers(true);
        try {
            const data = await userService.getAll(1, 20, search);
            const list = Array.isArray(data) ? data : (data?.users || []);
            setUsers(list.filter(u => u.id !== user?.id));
        } finally {
            setIsLoadingUsers(false);
        }
    }, [user?.id]);

    useEffect(() => {
        if (showNewConv) loadUsers(userSearch);
    }, [showNewConv, userSearch, loadUsers]);

    const handleStartConversation = async (targetUser) => {
        try {
            const conv = await messageService.startConversation(targetUser.id);
            setShowNewConv(false);
            setUserSearch('');
            await loadConversations();
            setSelectedConv(conv);
            setMobileShowChat(true);
        } catch {
            // Si la conversation existe déjà, la trouver
            const existing = conversations.find(c =>
                c.participants?.some(p => p.id === targetUser.id)
            );
            if (existing) {
                setSelectedConv(existing);
                setShowNewConv(false);
                setMobileShowChat(true);
            }
        }
    };

    const handleSelectConv = (conv) => {
        setSelectedConv(conv);
        setMobileShowChat(true);
        setConversations(prev => prev.map(c =>
            c.id === conv.id ? { ...c, unread_count: 0 } : c
        ));
    };

    const filteredConvs = conversations.filter(c =>
        c.participants?.[0]?.nom_complet?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const partner = selectedConv?.participants?.[0];
    const isTyping = selectedConv && typingUsers[selectedConv.id];
    const totalUnread = conversations.reduce((acc, c) => acc + (c.unread_count || 0), 0);

    return (
        <DashboardLayout title="Messages" noPadding>
            <div className="flex h-[calc(100vh-56px)] overflow-hidden bg-background">

                {/* ── Sidebar conversations ─────────────────────────────────── */}
                <aside className={cn(
                    "flex flex-col border-r border-border bg-card shrink-0 transition-all",
                    "w-full md:w-80",
                    mobileShowChat ? "hidden md:flex" : "flex"
                )}>
                    {/* Header sidebar */}
                    <div className="p-4 border-b border-border space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <MessageSquare className="size-5 text-primary" />
                                <h2 className="text-sm font-bold text-foreground">Messages</h2>
                                {totalUnread > 0 && (
                                    <span className="size-5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                                        {totalUnread > 9 ? '9+' : totalUnread}
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={() => setShowNewConv(true)}
                                className="size-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                                title="Nouvelle conversation"
                            >
                                <Plus className="size-4" />
                            </button>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <input
                                className="w-full h-9 pl-9 pr-3 bg-background border border-border rounded-xl text-sm outline-none focus:border-primary/50 transition-all text-foreground placeholder:text-muted-foreground"
                                placeholder="Rechercher une conversation..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Liste conversations */}
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {isLoading ? (
                            <div className="py-12 flex flex-col items-center gap-3">
                                <Loader2 className="size-6 text-primary animate-spin" />
                                <p className="text-xs text-muted-foreground">Chargement...</p>
                            </div>
                        ) : filteredConvs.length === 0 ? (
                            <div className="py-12 flex flex-col items-center gap-3 text-center px-4">
                                <MessageSquare className="size-8 text-muted-foreground/30" />
                                <div>
                                    <p className="text-sm font-semibold text-foreground">Aucune conversation</p>
                                    <p className="text-xs text-muted-foreground mt-1">Démarrez une nouvelle conversation.</p>
                                </div>
                                <button
                                    onClick={() => setShowNewConv(true)}
                                    className="h-8 px-4 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors flex items-center gap-1.5"
                                >
                                    <Plus className="size-3.5" /> Nouveau message
                                </button>
                            </div>
                        ) : filteredConvs.map(conv => (
                            <ConvItem
                                key={conv.id}
                                conv={conv}
                                isActive={selectedConv?.id === conv.id}
                                onClick={() => handleSelectConv(conv)}
                            />
                        ))}
                    </div>
                </aside>

                {/* ── Zone de chat ──────────────────────────────────────────── */}
                <main className={cn(
                    "flex-1 flex flex-col h-full overflow-hidden",
                    !mobileShowChat && "hidden md:flex"
                )}>
                    {selectedConv ? (
                        <>
                            {/* Header chat */}
                            <header className="h-14 px-4 border-b border-border bg-card flex items-center justify-between shrink-0 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setMobileShowChat(false)}
                                        className="md:hidden size-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        <ArrowLeft className="size-4" />
                                    </button>
                                    <Avatar seed={partner?.id} size="md" online />
                                    <div>
                                        <p className="text-sm font-bold text-foreground">{partner?.nom_complet}</p>
                                        <div className="flex items-center gap-1.5">
                                            {isTyping ? (
                                                <span className="text-xs text-primary animate-pulse">En train d'écrire...</span>
                                            ) : (
                                                <>
                                                    <div className="size-1.5 rounded-full bg-emerald-500" />
                                                    <span className="text-xs text-muted-foreground">En ligne</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="size-8 rounded-lg bg-muted border border-border text-muted-foreground hover:text-primary hover:border-primary/40 flex items-center justify-center transition-all">
                                        <Phone className="size-4" />
                                    </button>
                                    <button className="size-8 rounded-lg bg-muted border border-border text-muted-foreground hover:text-primary hover:border-primary/40 flex items-center justify-center transition-all">
                                        <Video className="size-4" />
                                    </button>
                                    <button className="size-8 rounded-lg bg-muted border border-border text-muted-foreground hover:text-foreground flex items-center justify-center transition-all">
                                        <MoreHorizontal className="size-4" />
                                    </button>
                                </div>
                            </header>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background/50">
                                {messages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center gap-3 text-center">
                                        <div className="size-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                            <MessageSquare className="size-7 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">Démarrez la conversation</p>
                                            <p className="text-xs text-muted-foreground mt-1">Envoyez votre premier message à {partner?.nom_complet}.</p>
                                        </div>
                                    </div>
                                ) : (
                                    messages.map(msg => (
                                        <MessageBubble
                                            key={msg.id}
                                            msg={msg}
                                            isMe={msg.expediteur_id === user?.id}
                                        />
                                    ))
                                )}
                                {/* Indicateur de frappe */}
                                {isTyping && (
                                    <div className="flex items-center gap-2 animate-in fade-in duration-300">
                                        <Avatar seed={partner?.id} size="sm" />
                                        <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-2.5 flex items-center gap-1">
                                            {[0, 1, 2].map(i => (
                                                <div key={i} className="size-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <form
                                onSubmit={handleSend}
                                className="p-3 border-t border-border bg-card shrink-0"
                            >
                                <div className="flex items-center gap-2 bg-background border border-border rounded-2xl px-3 py-2 focus-within:border-primary/50 transition-all">
                                    <input
                                        ref={inputRef}
                                        className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                                        placeholder={`Message à ${partner?.nom_complet}...`}
                                        value={messageInput}
                                        onChange={handleTypingInput}
                                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) handleSend(e); }}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!messageInput.trim() || isSending}
                                        className="size-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                                    >
                                        {isSending
                                            ? <Loader2 className="size-4 animate-spin" />
                                            : <Send className="size-4" />
                                        }
                                    </button>
                                </div>
                                <p className="text-[10px] text-muted-foreground text-center mt-1.5">
                                    Entrée pour envoyer • Chiffrement de bout en bout
                                </p>
                            </form>
                        </>
                    ) : (
                        /* État vide */
                        <div className="flex-1 flex flex-col items-center justify-center gap-5 text-center p-8">
                            <div className="size-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                <MessageSquare className="size-10 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-foreground">Vos messages</h3>
                                <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                                    Sélectionnez une conversation ou démarrez-en une nouvelle.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowNewConv(true)}
                                className="h-10 px-6 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center gap-2"
                            >
                                <Plus className="size-4" /> Nouveau message
                            </button>
                        </div>
                    )}
                </main>
            </div>

            {/* ── Modal nouvelle conversation ───────────────────────────────── */}
            {showNewConv && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowNewConv(false)} />
                    <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-xl relative z-10">
                        <div className="flex items-center justify-between p-4 border-b border-border">
                            <div className="flex items-center gap-3">
                                <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                                    <Users className="size-4 text-primary" />
                                </div>
                                <h3 className="text-sm font-bold text-foreground">Nouveau message</h3>
                            </div>
                            <button onClick={() => setShowNewConv(false)}
                                className="size-7 rounded-lg bg-muted hover:bg-rose-500/10 hover:text-rose-500 flex items-center justify-center text-muted-foreground transition-colors">
                                <X className="size-4" />
                            </button>
                        </div>
                        <div className="p-4 space-y-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <input
                                    autoFocus
                                    className="w-full h-10 pl-9 pr-3 bg-background border border-border rounded-xl text-sm outline-none focus:border-primary/50 transition-all text-foreground placeholder:text-muted-foreground"
                                    placeholder="Rechercher un utilisateur..."
                                    value={userSearch}
                                    onChange={e => setUserSearch(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1 max-h-64 overflow-y-auto">
                                {isLoadingUsers ? (
                                    <div className="py-8 flex justify-center">
                                        <Loader2 className="size-5 text-primary animate-spin" />
                                    </div>
                                ) : users.length === 0 ? (
                                    <div className="py-8 text-center">
                                        <p className="text-sm text-muted-foreground">Aucun utilisateur trouvé.</p>
                                    </div>
                                ) : users.map(u => (
                                    <button
                                        key={u.id}
                                        onClick={() => handleStartConversation(u)}
                                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors text-left"
                                    >
                                        <Avatar seed={u.id} size="md" online />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-foreground truncate">{u.nom_complet}</p>
                                            <p className="text-xs text-muted-foreground capitalize">{u.role}</p>
                                        </div>
                                        <Check className="size-4 text-muted-foreground/30" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default Messages;
