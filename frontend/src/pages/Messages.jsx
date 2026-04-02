import React, { useState, useEffect, useRef, useCallback } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
    Search, Send, MoreVertical, Phone, Video, Image,
    Paperclip, Smile, Store, Zap, CheckCheck, Info,
    Satellite, Activity, Shield, Sparkles, User, Fingerprint
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
            setConversations(prev => {
                const index = prev.findIndex(c => c.id === data.conversation_id);
                if (index === -1) {
                    loadConversations();
                    return prev;
                }
                const updated = [...prev];
                updated[index] = {
                    ...updated[index],
                    dernier_message: data.message.contenu,
                    date_dernier_message: data.message.createdAt
                };
                return [updated[index], ...updated.filter((_, i) => i !== index)];
            });

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

        const destinataire = selectedConv.participants[0];
        try {
            const newMsg = await messageService.sendMessage({
                destinataire_id: destinataire.id,
                contenu: messageInput,
                conversation_id: selectedConv.id
            });
            setMessages(prev => [...prev, newMsg]);
            setMessageInput("");
            setTimeout(scrollToBottom, 100);

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
        <DashboardLayout title="CENTRE DE COMMUNICATIONS EXÉCUTIF" noPadding>
            <div className="flex h-[calc(100vh-112px)] overflow-hidden bg-[#0A0D14] animate-in fade-in duration-1000">

                {/* Conversations Sidebar */}
                <aside className="w-80 md:w-[480px] flex flex-col bg-white/[0.01] border-r-4 border-white/5 shrink-0 h-full relative z-20 shadow-3xl">
                    <div className="p-12 space-y-10 border-b-4 border-white/5 bg-white/[0.02]">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="size-3 rounded-full bg-[#FF6600] animate-pulse shadow-[0_0_10px_rgba(255,102,0,0.6)]" />
                                <h2 className="text-[14px] font-black text-white tracking-[0.4em] italic uppercase pt-0.5">FLUX RÉSEAU</h2>
                            </div>
                            <div className="px-6 py-1.5 bg-[#FF6600]/10 text-[#FF6600] text-[9px] font-black uppercase tracking-[0.3em] rounded-xl border-2 border-[#FF6600]/20 italic shadow-lg">ALPHA ENCRYPTED</div>
                        </div>
                        <div className="relative group/search">
                            <div className="absolute inset-0 bg-[#FF6600]/10 blur-xl opacity-0 group-focus-within/search:opacity-100 transition-opacity duration-1000" />
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 size-6 group-focus-within/search:text-[#FF6600] transition-all relative z-10" />
                            <input
                                className="w-full pl-16 pr-8 h-16 bg-white/[0.03] border-4 border-transparent focus:border-[#FF6600]/40 focus:bg-white/[0.05] transition-all duration-700 rounded-2xl text-sm font-black italic placeholder:text-slate-800 outline-none relative z-10 text-white uppercase tracking-wider"
                                placeholder="RECHERCHER PARTENAIRE..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto scrollbar-hide py-6 h-full space-y-2 px-4">
                        {isLoading ? (
                            <div className="py-20 flex flex-col items-center gap-6 opacity-40">
                                <Satellite className="size-16 text-[#FF6600] animate-spin" />
                                <span className="text-[10px] font-black uppercase tracking-[0.6em] italic text-slate-500">SYNCHRONISATION...</span>
                            </div>
                        ) : filteredConversations.length === 0 ? (
                            <div className="py-20 text-center text-slate-700 font-black uppercase tracking-[0.5em] italic text-[10px]">AUCUN CANAL ACTIF DÉTECTÉ</div>
                        ) : filteredConversations.map((conv) => {
                            const partner = conv.participants[0];
                            const isActive = selectedConv?.id === conv.id;
                            return (
                                <button
                                    key={conv.id}
                                    onClick={() => setSelectedConv(conv)}
                                    className={cn(
                                        "w-full px-8 py-8 flex items-center gap-8 transition-all duration-700 relative group rounded-[2.5rem] border-4",
                                        isActive
                                            ? "bg-white/[0.04] border-white/5 shadow-2xl scale-105 z-10"
                                            : "bg-transparent border-transparent hover:bg-white/[0.02] hover:border-white/[0.02]"
                                    )}
                                >
                                    {isActive && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-16 bg-[#FF6600] rounded-r-full shadow-[0_0_20px_rgba(255,102,0,0.6)]"></div>
                                    )}
                                    <div className="relative shrink-0">
                                        <div className={cn(
                                            "size-18 rounded-[1.5rem] bg-black flex items-center justify-center border-4 transition-all duration-700 shadow-3xl overflow-hidden",
                                            isActive ? "border-[#FF6600]/40 rotate-3" : "border-white/5 opacity-40 group-hover:opacity-100 group-hover:border-white/10"
                                        )}>
                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${partner?.id}`} alt="avatar" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 size-6 bg-emerald-500 rounded-full border-4 border-[#0A0D14] shadow-lg shadow-emerald-500/20"></div>
                                    </div>
                                    <div className="flex-1 text-left min-w-0 space-y-2">
                                        <div className="flex justify-between items-center">
                                            <p className={cn(
                                                "text-lg font-black italic tracking-tighter truncate leading-none uppercase pt-1 transition-colors duration-700",
                                                isActive ? "text-white" : "text-slate-500 group-hover:text-white"
                                            )}>{partner?.nom_complet}</p>
                                            <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest italic shrink-0 group-hover:text-[#FF6600] transition-colors">{formatDistanceToNow(new Date(conv.date_dernier_message), { addSuffix: false, locale: fr })}</span>
                                        </div>
                                        <p className={cn(
                                            "text-xs truncate font-black max-w-[240px] italic transition-colors duration-700 uppercase tracking-tighter",
                                            isActive ? "text-[#FF6600]" : "text-slate-800"
                                        )}>
                                            {conv.dernier_message}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </aside>

                {/* Chat Interface */}
                <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-white/[0.01]">
                    {selectedConv ? (
                        <>
                            {/* Chat Header */}
                            <header className="px-16 py-12 border-b-4 border-white/5 bg-white/[0.02] backdrop-blur-3xl flex items-center justify-between z-10 shrink-0 shadow-3xl">
                                <div className="flex items-center gap-10">
                                    <div className="relative group/avatar">
                                        <div className="absolute inset-0 bg-[#FF6600]/20 blur-2xl rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-1000" />
                                        <div className="size-20 rounded-[2rem] bg-black overflow-hidden border-4 border-white/5 shadow-3xl relative z-10 group-hover/avatar:scale-110 group-hover/avatar:-rotate-3 transition-all duration-700">
                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedConv.participants[0]?.id}`} alt="avatar" className="w-full h-full object-cover" />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="text-4xl font-black italic tracking-tighter text-white leading-none uppercase pt-1">{selectedConv.participants[0]?.nom_complet}</h3>
                                        <div className="flex items-center gap-4">
                                            <span className="size-3 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)] animate-pulse"></span>
                                            <span className="text-[10px] font-black uppercase text-[#FF6600] tracking-[0.4em] leading-none italic">SESSION SÉCURISÉE ALPHA</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <button className="size-16 rounded-[1.5rem] border-4 border-white/5 hover:border-[#FF6600]/40 hover:bg-[#FF6600]/10 text-white transition-all duration-700 shadow-3xl group/action">
                                        <Phone className="size-6 mx-auto group-hover/action:scale-110 group-hover/action:rotate-12 transition-transform" />
                                    </button>
                                    <button className="size-16 rounded-[1.5rem] border-4 border-white/5 hover:border-[#FF6600]/40 hover:bg-[#FF6600]/10 text-white transition-all duration-700 shadow-3xl group/action">
                                        <Video className="size-6 mx-auto group-hover/action:scale-110 transition-transform" />
                                    </button>
                                    <div className="w-1 h-12 bg-white/5 mx-4 rounded-full"></div>
                                    <button className="size-16 rounded-[1.5rem] text-slate-700 hover:text-white hover:bg-white/5 transition-all duration-700">
                                        <MoreVertical className="size-8 mx-auto" />
                                    </button>
                                </div>
                            </header>

                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-16 space-y-16 scrollbar-hide relative bg-[#0A0D14]">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,102,0,0.03),transparent_70%)] pointer-events-none" />

                                {messages.map((msg) => {
                                    const isMe = msg.expediteur_id === user.id;
                                    return (
                                        <div key={msg.id} className={cn(
                                            "flex flex-col max-w-[80%] gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700",
                                            isMe ? "ml-auto items-end" : "items-start"
                                        )}>
                                            <div className={cn(
                                                "px-12 py-8 rounded-[3.5rem] text-lg font-black relative shadow-3xl transition-all duration-700 hover:scale-[1.02] uppercase tracking-wide italic",
                                                isMe
                                                    ? "bg-white text-black rounded-br-none border-x-[12px] border-black"
                                                    : "bg-white/[0.03] border-4 border-white/5 text-white rounded-bl-none border-x-[12px] border-[#FF6600]"
                                            )}>
                                                {msg.contenu}
                                            </div>
                                            <div className="flex items-center gap-6 px-4">
                                                {isMe && <CheckCheck className="size-5 text-[#FF6600] shadow-[0_0_10px_rgba(255,102,0,0.4)]" />}
                                                <span className="text-[10px] font-black text-slate-700 uppercase tracking-[0.3em] italic">
                                                    {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true, locale: fr })}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Chat Input Area */}
                            <form
                                onSubmit={handleSendMessage}
                                className="p-16 bg-white/[0.02] backdrop-blur-3xl border-t-4 border-white/5 shrink-0"
                            >
                                <div className="flex items-center gap-8 p-6 rounded-[3.5rem] bg-white/[0.03] border-4 border-transparent focus-within:border-[#FF6600]/40 focus-within:bg-black transition-all duration-700 shadow-3xl relative group/input">
                                    <div className="absolute inset-0 bg-[#FF6600]/5 blur-2xl opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-1000" />

                                    <div className="flex items-center gap-4 pr-6 border-r-4 border-white/5 relative z-10">
                                        <button type="button" className="size-16 rounded-[1.5rem] text-slate-700 hover:text-[#FF6600] hover:bg-[#FF6600]/10 transition-all duration-700 group/attach">
                                            <Paperclip className="size-8 mx-auto group-hover/attach:rotate-12 transition-transform" />
                                        </button>
                                    </div>
                                    <input
                                        className="flex-1 bg-transparent border-none focus:ring-0 text-xl font-black text-white placeholder:text-slate-800 focus:outline-none italic uppercase tracking-wider relative z-10 pt-1"
                                        placeholder="TRANSMETTRE FLUX SÉCURISÉ..."
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                    />
                                    <div className="flex items-center gap-6 relative z-10">
                                        <button
                                            type="submit"
                                            className="size-20 rounded-[1.5rem] shadow-3xl transition-all duration-700 hover:scale-110 active:scale-95 bg-[#FF6600] text-white flex items-center justify-center group/send disabled:opacity-20 disabled:grayscale"
                                            disabled={!messageInput.trim()}
                                        >
                                            <Send className="size-10 text-white group-hover/send:translate-x-2 group-hover/send:-translate-y-2 transition-transform duration-700" />
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-24 animate-in fade-in zoom-in-95 duration-1000 relative">
                            <div className="absolute inset-0 bg-[#FF6600]/5 rounded-full blur-[200px] pointer-events-none" />

                            <div className="size-60 rounded-[4rem] bg-white/[0.02] flex items-center justify-center shadow-3xl border-4 border-white/5 relative overflow-hidden group rotate-3 hover:rotate-0 transition-all duration-1000">
                                <div className="absolute inset-0 bg-gradient-to-tr from-[#FF6600]/10 to-transparent"></div>
                                <div className="absolute top-0 right-0 p-8">
                                    <Fingerprint className="size-10 text-[#FF6600] opacity-40 animate-pulse" />
                                </div>
                                <Send className="relative z-10 size-24 text-[#FF6600] group-hover:translate-x-4 group-hover:-translate-y-4 transition-transform duration-1000 drop-shadow-[0_0_20px_rgba(255,102,0,0.4)]" />
                            </div>
                            <div className="text-center space-y-8 mt-16 max-w-2xl relative z-10">
                                <div className="flex items-center justify-center gap-6">
                                    <div className="h-1 w-20 bg-[#FF6600]/20 rounded-full" />
                                    <h3 className="text-6xl font-black italic tracking-tighter text-white uppercase leading-none pt-2">VIRTUAL <span className="text-[#FF6600]">COMMS.</span></h3>
                                    <div className="h-1 w-20 bg-[#FF6600]/20 rounded-full" />
                                </div>
                                <p className="text-xl font-black text-slate-500 leading-relaxed italic border-l-[16px] border-[#FF6600] pl-12 uppercase tracking-widest text-left">
                                    SÉLECTIONNEZ UN CANAL POUR DÉMARRER UNE SESSION ENCRYPTÉE. <br /> LE RÉSEAU BCA GARANTIT L'INTÉGRITÉ TOTALE DE VOS ÉCHANGES STRATÉGIQUES.
                                </p>
                            </div>

                            <div className="grid grid-cols-3 gap-12 mt-32 opacity-20 filter grayscale group-hover:grayscale-0 transition-all duration-1000">
                                <Shield className="size-10 text-white" />
                                <Zap className="size-10 text-white" />
                                <Activity className="size-10 text-white" />
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </DashboardLayout>
    );
};

export default Messages;
