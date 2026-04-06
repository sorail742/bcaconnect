import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Loader2, Sparkles, ChevronDown, Minimize2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import aiService from '../../services/aiService';
import { useAuth } from '../../hooks/useAuth';

const SUGGESTIONS = [
    "Comment créer une boutique ?",
    "Quels sont les frais de livraison ?",
    "Comment contester une commande ?",
    "Comment recharger mon portefeuille ?",
];

const BotMessage = ({ content }) => (
    <div className="flex items-start gap-3 animate-in slide-in-from-left-2 duration-300">
        <div className="size-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
            <Bot className="size-4 text-primary" />
        </div>
        <div className="max-w-[85%] bg-muted/60 border border-border rounded-lg rounded-tl-sm px-4 py-3 text-sm font-medium text-foreground leading-relaxed">
            {content}
        </div>
    </div>
);

const UserMessage = ({ content }) => (
    <div className="flex items-end justify-end gap-3 animate-in slide-in-from-right-2 duration-300">
        <div className="max-w-[85%] bg-primary text-slate-900 dark:text-foreground rounded-lg rounded-br-sm px-4 py-3 text-sm font-medium leading-relaxed">
            {content}
        </div>
    </div>
);

const AIChat = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'bot',
            content: `Bonjour ${user?.nom_complet?.split(' ')[0] || ''} 👋 Je suis **BCA Assistant**, votre aide intelligente. Comment puis-je vous aider aujourd'hui ?`
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [hasUnread, setHasUnread] = useState(false);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (isOpen) {
            setHasUnread(false);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const sendMessage = async (text) => {
        const messageText = text || input.trim();
        if (!messageText || isLoading) return;

        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: messageText }]);
        setIsLoading(true);

        try {
            const data = await aiService.chat(messageText);
            setMessages(prev => [...prev, { role: 'bot', content: data.response }]);
            if (!isOpen) setHasUnread(true);
        } catch (err) {
            setMessages(prev => [...prev, {
                role: 'bot',
                content: "Désolé, je suis momentanément indisponible. Réessayez dans quelques instants."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <>
            {/* ── Fenêtre de Chat ────────────────────────────────────────────── */}
            {isOpen && (
                <div className={cn(
                    "fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)]",
                    "bg-card border border-border rounded-2xl shadow-2xl shadow-black/20",
                    "flex flex-col overflow-hidden transition-all duration-300 animate-in slide-in-from-bottom-4 fade-in",
                    isMinimized ? "h-[64px]" : "h-[520px]"
                )}>

                    {/* Header */}
                    <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent shrink-0">
                        <div className="size-9 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                            <Bot className="size-4.5 text-slate-900 dark:text-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-foreground tracking-tight">BCA Assistant</p>
                            <div className="flex items-center gap-1.5">
                                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                                <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Propulsé par Groq IA</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setIsMinimized(p => !p)}
                                className="size-6 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
                            >
                                {isMinimized ? <ChevronDown className="size-4" /> : <Minimize2 className="size-3.5" />}
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="size-6 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
                            >
                                <X className="size-4" />
                            </button>
                        </div>
                    </div>

                    {!isMinimized && (
                        <>
                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                                {messages.map((msg, i) =>
                                    msg.role === 'bot'
                                        ? <BotMessage key={i} content={msg.content} />
                                        : <UserMessage key={i} content={msg.content} />
                                )}
                                {isLoading && (
                                    <div className="flex items-start gap-3">
                                        <div className="size-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                                            <Bot className="size-4 text-primary" />
                                        </div>
                                        <div className="bg-muted/60 border border-border rounded-lg rounded-tl-sm px-4 py-3 flex items-center gap-2">
                                            <Loader2 className="size-3.5 text-primary animate-spin" />
                                            <span className="text-xs text-muted-foreground font-medium italic">BCA Assistant réfléchit...</span>
                                        </div>
                                    </div>
                                )}
                                <div ref={bottomRef} />
                            </div>

                            {/* Suggestions rapides */}
                            {messages.length <= 1 && (
                                <div className="px-4 pb-2 flex gap-2 flex-wrap">
                                    {SUGGESTIONS.map((s, i) => (
                                        <button
                                            key={i}
                                            onClick={() => sendMessage(s)}
                                            className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-border bg-muted hover:border-primary hover:text-primary hover:bg-primary/5 transition-all"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Zone de saisie */}
                            <div className="p-3 border-t border-border shrink-0">
                                <div className="flex items-center gap-2 bg-muted/40 border border-border rounded-lg px-4 py-2 focus-within:border-primary/50 focus-within:bg-primary/3 transition-all">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={input}
                                        onChange={e => setInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Posez votre question..."
                                        className="flex-1 bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none"
                                        disabled={isLoading}
                                    />
                                    <button
                                        onClick={() => sendMessage()}
                                        disabled={!input.trim() || isLoading}
                                        className={cn(
                                            "size-6 rounded-lg flex items-center justify-center transition-all duration-200",
                                            input.trim() && !isLoading
                                                ? "bg-primary text-slate-900 dark:text-foreground shadow-lg shadow-primary/30 hover:scale-105"
                                                : "bg-muted text-muted-foreground cursor-not-allowed"
                                        )}
                                    >
                                        <Send className="size-3.5" />
                                    </button>
                                </div>
                                <p className="text-center text-[9px] text-muted-foreground/50 font-medium mt-2 uppercase tracking-widest">Réponses générées par Groq IA (LLaMA 3.3)</p>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* ── Bouton Flottant ────────────────────────────────────────────── */}
            <button
                id="ai-chat-toggle"
                onClick={() => { setIsOpen(p => !p); setHasUnread(false); }}
                className={cn(
                    "fixed bottom-6 right-6 z-50 group",
                    "size-6 rounded-lg shadow-2xl shadow-primary/40",
                    "flex items-center justify-center",
                    "transition-all duration-300 hover:scale-110 active:scale-95",
                    isOpen
                        ? "bg-muted border border-border text-foreground"
                        : "bg-primary text-slate-900 dark:text-foreground"
                )}
            >
                {isOpen
                    ? <X className="size-5" />
                    : <Bot className="size-6" />
                }

                {/* Badge notification */}
                {hasUnread && !isOpen && (
                    <span className="absolute -top-1 -right-1 size-4 rounded-full bg-red-500 border-2 border-background animate-bounce" />
                )}

                {/* Tooltip */}
                {!isOpen && (
                    <span className="absolute right-16 whitespace-nowrap bg-foreground text-background text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none">
                        BCA Assistant IA
                    </span>
                )}

                {/* Pulse ring */}
                {!isOpen && (
                    <span className="absolute inset-0 rounded-lg bg-primary/30 animate-ping opacity-30" />
                )}
            </button>
        </>
    );
};

export default AIChat;
