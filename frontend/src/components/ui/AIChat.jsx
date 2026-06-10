import React, { useState, useRef, useEffect } from 'react';
import { 
    Bot, X, Send, Loader2, Sparkles, ChevronDown, Minimize2, 
    Code2, MessageSquare, Bug, Copy, Check, ChevronRight,
    AlertTriangle, Zap, Terminal
} from 'lucide-react';
import { cn } from '../../lib/utils';
import aiService from '../../services/aiService';
import { useAuth } from '../../hooks/useAuth';
import { useLocation } from 'react-router-dom';

// ── Markdown renderer minimal (sans dépendance) ───────────────────────────
const renderMarkdown = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    const elements = [];
    let inCodeBlock = false;
    let codeBuffer = [];
    let codeLang = '';
    let key = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.startsWith('```')) {
            if (!inCodeBlock) {
                inCodeBlock = true;
                codeLang = line.slice(3).trim();
                codeBuffer = [];
            } else {
                elements.push(
                    <div key={key++} className="my-2 rounded-lg overflow-hidden border border-border">
                        <div className="flex items-center justify-between px-3 py-1.5 bg-muted/80 border-b border-border">
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{codeLang || 'code'}</span>
                            <CopyButton code={codeBuffer.join('\n')} />
                        </div>
                        <pre className="p-3 overflow-x-auto text-[11px] font-mono text-emerald-400 bg-black/60 leading-5">
                            <code>{codeBuffer.join('\n')}</code>
                        </pre>
                    </div>
                );
                inCodeBlock = false;
                codeBuffer = [];
            }
            continue;
        }

        if (inCodeBlock) {
            codeBuffer.push(line);
            continue;
        }

        if (line.startsWith('## ')) {
            elements.push(<h2 key={key++} className="text-sm font-black text-foreground mt-3 mb-1">{line.slice(3)}</h2>);
        } else if (line.startsWith('### ')) {
            elements.push(<h3 key={key++} className="text-xs font-black text-primary mt-2 mb-1">{line.slice(4)}</h3>);
        } else if (line.startsWith('- **')) {
            const match = line.match(/^- \*\*(.+?)\*\* ?:?(.*)$/);
            if (match) {
                elements.push(
                    <div key={key++} className="flex items-start gap-2 ml-2 mb-1">
                        <span className="text-primary mt-0.5">•</span>
                        <p className="text-xs leading-relaxed">
                            <strong className="font-black text-foreground">{match[1]}</strong>
                            <span className="text-muted-foreground">{match[2]}</span>
                        </p>
                    </div>
                );
            } else {
                elements.push(<li key={key++} className="text-xs ml-4 list-disc text-muted-foreground mb-0.5">{line.slice(2)}</li>);
            }
        } else if (line.startsWith('- ')) {
            elements.push(<li key={key++} className="text-xs ml-4 list-disc text-muted-foreground mb-0.5">{line.slice(2)}</li>);
        } else if (line.trim() !== '') {
            const strong = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
            const code = strong.replace(/`(.+?)`/g, '<code class="px-1 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-mono">$1</code>');
            elements.push(<p key={key++} className="text-xs text-foreground/80 leading-relaxed mb-1" dangerouslySetInnerHTML={{ __html: code }} />);
        }
    }

    return <div className="space-y-0.5">{elements}</div>;
};

// ── Bouton copier ─────────────────────────────────────────────────────────
const CopyButton = ({ code }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button onClick={handleCopy} className="flex items-center gap-1 text-[9px] text-muted-foreground hover:text-primary transition-colors">
            {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
            {copied ? 'Copié !' : 'Copier'}
        </button>
    );
};

// ── Messages ──────────────────────────────────────────────────────────────
const BotMessage = ({ content, isCode }) => (
    <div className="flex items-start gap-2 animate-in slide-in-from-left-2 duration-300">
        <div className="size-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
            {isCode ? <Bug className="size-3.5 text-rose-500" /> : <Bot className="size-3.5 text-primary" />}
        </div>
        <div className="max-w-[90%] bg-muted/40 border border-border rounded-xl rounded-tl-sm px-3 py-2.5 text-sm text-foreground leading-relaxed">
            {isCode ? renderMarkdown(content) : content}
        </div>
    </div>
);

const UserMessage = ({ content, isCode }) => (
    <div className="flex items-end justify-end gap-2 animate-in slide-in-from-right-2 duration-300">
        <div className={cn(
            "max-w-[88%] rounded-xl rounded-br-sm px-3 py-2.5 text-sm font-medium leading-relaxed",
            isCode ? "bg-zinc-800 text-emerald-400 font-mono text-[11px] border border-zinc-700" : "bg-primary text-slate-900 dark:text-foreground"
        )}>
            {isCode ? <pre className="whitespace-pre-wrap">{content}</pre> : content}
        </div>
    </div>
);

// ── Suggestions dynamiques par mode ──────────────────────────────────────
const CHAT_SUGGESTIONS = [
    "Quels sont les frais de livraison ?",
    "Comment contester une commande ?",
    "Comment recharger mon portefeuille ?",
];

const CODE_QUICK_SCANS = [
    { label: "⚡ React Keys", code: "// Collez votre composant de liste ici\n// Exemple qui génère une erreur :\nconst List = ({ items }) => (\n  <ul>\n    {items.map(item => (\n      <li>{item.name}</li> // ← manque key={item.id}\n    ))}\n  </ul>\n);" },
    { label: "🔐 Auth Guard", code: "// Vérification d'une route protégée\nrouter.get('/profile', async (req, res) => {\n  const user = await User.findByPk(req.body.userId);\n  res.json(user); // ← pas d'authMiddleware !\n});" },
    { label: "🔄 useEffect", code: "// Composant avec useEffect potentiellement problématique\nconst MyComp = ({ productId }) => {\n  const [data, setData] = useState(null);\n  useEffect(() => {\n    fetchProduct(productId).then(setData);\n  }); // ← dépendances manquantes !\n  return <div>{data?.name}</div>;\n};" },
];

// ─────────────────────────────────────────────────────────────────────────
const AIChat = () => {
    const { user } = useAuth();
    const location = useLocation();
    const hideOnPage = location.pathname.startsWith('/messages');
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [mode, setMode] = useState('chat'); // 'chat' | 'code'
    const [messages, setMessages] = useState([
        {
            role: 'bot',
            content: `Bonjour ${user?.nom_complet?.split(' ')[0] || ''} 👋 Je suis **BCA Assistant**. Utilisez le mode 💬 pour me poser des questions ou le mode 🔧 pour analyser votre code et détecter des bugs.`,
            isCode: false
        }
    ]);
    const [input, setInput] = useState('');
    const [codeInput, setCodeInput] = useState('');
    const [codeContext, setCodeContext] = useState('');
    const [codeLang, setCodeLang] = useState('javascript');
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

    const sendChatMessage = async (text) => {
        const msg = text || input.trim();
        if (!msg || isLoading) return;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: msg, isCode: false }]);
        setIsLoading(true);
        try {
            const data = await aiService.chat(msg);
            setMessages(prev => [...prev, { role: 'bot', content: data.response, isCode: false }]);
            if (!isOpen) setHasUnread(true);
        } catch {
            setMessages(prev => [...prev, { role: 'bot', content: "Désolé, je suis momentanément indisponible.", isCode: false }]);
        } finally {
            setIsLoading(false);
        }
    };

    const sendCodeAnalysis = async () => {
        if (!codeInput.trim() || isLoading) return;
        const snippet = codeInput.trim();
        setMessages(prev => [...prev, { role: 'user', content: snippet, isCode: true }]);
        setCodeInput('');
        setIsLoading(true);
        try {
            const data = await aiService.analyzeCode(snippet, codeContext, codeLang);
            setMessages(prev => [...prev, { role: 'bot', content: data.analysis, isCode: true }]);
            if (!isOpen) setHasUnread(true);
        } catch {
            setMessages(prev => [...prev, { role: 'bot', content: "Erreur lors de l'analyse. Vérifiez que le backend est actif.", isCode: false }]);
        } finally {
            setIsLoading(false);
        }
    };

    const loadQuickScan = (scan) => {
        setCodeInput(scan.code);
        setMode('code');
    };

    if (hideOnPage) return null;

    return (
        <>
            {/* ── Fenêtre ────────────────────────────────────────────────── */}
            {isOpen && (
                <div className={cn(
                    "fixed bottom-24 right-6 z-50 w-[420px] max-w-[calc(100vw-2rem)]",
                    "bg-card border border-border rounded-2xl shadow-2xl shadow-black/30",
                    "flex flex-col overflow-hidden transition-all duration-300 animate-in slide-in-from-bottom-4 fade-in",
                    isMinimized ? "h-[64px]" : mode === 'code' ? "h-[600px]" : "h-[520px]"
                )}>

                    {/* Header */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent shrink-0">
                        <div className="size-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                            <Bot className="size-4 text-slate-900 dark:text-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-foreground tracking-tight">BCA Assistant</p>
                            <div className="flex items-center gap-1.5">
                                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <p className="text-[9px] text-emerald-500 font-black uppercase tracking-widest">
                                    {mode === 'code' ? 'Mode Analyse de Code · Groq IA' : 'Propulsé par Groq IA'}
                                </p>
                            </div>
                        </div>
                        {/* Mode toggle */}
                        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                            <button
                                onClick={() => setMode('chat')}
                                className={cn("px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wide transition-all flex items-center gap-1",
                                    mode === 'chat' ? "bg-primary text-slate-900" : "text-muted-foreground hover:text-foreground"
                                )}
                                title="Mode Chat"
                            >
                                <MessageSquare className="size-3" />
                            </button>
                            <button
                                onClick={() => setMode('code')}
                                className={cn("px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wide transition-all flex items-center gap-1",
                                    mode === 'code' ? "bg-rose-500 text-white" : "text-muted-foreground hover:text-foreground"
                                )}
                                title="Analyse de Code"
                            >
                                <Bug className="size-3" />
                            </button>
                        </div>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setIsMinimized(p => !p)} className="size-6 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-all">
                                {isMinimized ? <ChevronDown className="size-4" /> : <Minimize2 className="size-3.5" />}
                            </button>
                            <button onClick={() => setIsOpen(false)} className="size-6 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-all">
                                <X className="size-4" />
                            </button>
                        </div>
                    </div>

                    {!isMinimized && (
                        <>
                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin">
                                {messages.map((msg, i) =>
                                    msg.role === 'bot'
                                        ? <BotMessage key={i} content={msg.content} isCode={msg.isCode} />
                                        : <UserMessage key={i} content={msg.content} isCode={msg.isCode} />
                                )}
                                {isLoading && (
                                    <div className="flex items-start gap-2">
                                        <div className="size-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                                            {mode === 'code' ? <Bug className="size-3.5 text-rose-500 animate-pulse" /> : <Bot className="size-3.5 text-primary" />}
                                        </div>
                                        <div className="bg-muted/60 border border-border rounded-xl rounded-tl-sm px-3 py-2 flex items-center gap-2">
                                            <Loader2 className="size-3 text-primary animate-spin" />
                                            <span className="text-[10px] text-muted-foreground font-medium italic">
                                                {mode === 'code' ? 'Analyse du code en cours...' : 'BCA Assistant réfléchit...'}
                                            </span>
                                        </div>
                                    </div>
                                )}
                                <div ref={bottomRef} />
                            </div>

                            {/* ── Mode CHAT ── */}
                            {mode === 'chat' && (
                                <>
                                    {messages.length <= 1 && (
                                        <div className="px-3 pb-2 flex gap-1.5 flex-wrap">
                                            {CHAT_SUGGESTIONS.map((s, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => sendChatMessage(s)}
                                                    className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-full border border-border bg-muted hover:border-primary hover:text-primary hover:bg-primary/5 transition-all"
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    <div className="p-3 border-t border-border shrink-0">
                                        <div className="flex items-center gap-2 bg-muted/40 border border-border rounded-xl px-3 py-2 focus-within:border-primary/50 transition-all">
                                            <input
                                                ref={inputRef}
                                                type="text"
                                                value={input}
                                                onChange={e => setInput(e.target.value)}
                                                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(); } }}
                                                placeholder="Posez votre question..."
                                                className="flex-1 bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none"
                                                disabled={isLoading}
                                            />
                                            <button
                                                onClick={() => sendChatMessage()}
                                                disabled={!input.trim() || isLoading}
                                                className={cn("size-6 rounded-lg flex items-center justify-center transition-all",
                                                    input.trim() && !isLoading ? "bg-primary text-slate-900 hover:scale-105" : "bg-muted text-muted-foreground cursor-not-allowed"
                                                )}
                                            >
                                                <Send className="size-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* ── Mode CODE ANALYSER ── */}
                            {mode === 'code' && (
                                <div className="border-t border-border shrink-0 p-3 space-y-2">
                                    {/* Quick scans */}
                                    <div className="flex gap-1.5 flex-wrap">
                                        {CODE_QUICK_SCANS.map((scan, i) => (
                                            <button
                                                key={i}
                                                onClick={() => loadQuickScan(scan)}
                                                className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-rose-500/30 text-rose-500 bg-rose-500/5 hover:bg-rose-500/10 transition-all"
                                            >
                                                {scan.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Language + context */}
                                    <div className="flex gap-2">
                                        <select
                                            value={codeLang}
                                            onChange={e => setCodeLang(e.target.value)}
                                            className="text-[10px] font-black bg-muted border border-border rounded-lg px-2 py-1 text-foreground outline-none"
                                        >
                                            <option value="javascript">JavaScript</option>
                                            <option value="jsx">JSX / React</option>
                                            <option value="typescript">TypeScript</option>
                                            <option value="sql">SQL</option>
                                            <option value="json">JSON / Config</option>
                                        </select>
                                        <input
                                            type="text"
                                            value={codeContext}
                                            onChange={e => setCodeContext(e.target.value)}
                                            placeholder="Contexte (ex: CartPage.jsx...)"
                                            className="flex-1 text-[10px] bg-muted border border-border rounded-lg px-2 py-1 text-foreground placeholder:text-muted-foreground outline-none"
                                        />
                                    </div>

                                    {/* Code textarea */}
                                    <div className="relative">
                                        <div className="absolute top-2 left-2.5 flex items-center gap-1.5 pointer-events-none">
                                            <Terminal className="size-3 text-emerald-500" />
                                            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">CODE</span>
                                        </div>
                                        <textarea
                                            value={codeInput}
                                            onChange={e => setCodeInput(e.target.value)}
                                            placeholder={`// Collez votre code ${codeLang} ici...\n// L'IA analysera les bugs potentiels.`}
                                            rows={5}
                                            className="w-full bg-black/60 border border-zinc-700 text-emerald-400 rounded-xl pt-7 px-3 pb-3 font-mono text-[11px] leading-5 resize-none outline-none focus:border-primary/50 placeholder:text-zinc-600"
                                        />
                                    </div>

                                    {/* Submit */}
                                    <button
                                        onClick={sendCodeAnalysis}
                                        disabled={!codeInput.trim() || isLoading}
                                        className={cn(
                                            "w-full h-10 rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all",
                                            codeInput.trim() && !isLoading
                                                ? "bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/20"
                                                : "bg-muted text-muted-foreground cursor-not-allowed"
                                        )}
                                    >
                                        {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Bug className="size-4" />}
                                        {isLoading ? 'Analyse en cours...' : 'Analyser les Bugs'}
                                    </button>
                                </div>
                            )}

                            <p className="text-center text-[9px] text-muted-foreground/40 font-medium pb-2 uppercase tracking-widest">
                                Groq IA · LLaMA 3.3-70B
                            </p>
                        </>
                    )}
                </div>
            )}

            {/* ── Bouton Flottant ──────────────────────────────────────── */}
            <button
                id="ai-chat-toggle"
                onClick={() => { setIsOpen(p => !p); setHasUnread(false); }}
                className={cn(
                    "fixed bottom-6 right-6 z-50 group",
                    "size-14 rounded-2xl shadow-2xl shadow-primary/40",
                    "flex items-center justify-center",
                    "transition-all duration-300 hover:scale-110 active:scale-95",
                    isOpen ? "bg-muted border border-border text-foreground" : "bg-primary text-slate-900 dark:text-foreground"
                )}
            >
                {isOpen ? <X className="size-5" /> : <Bot className="size-6" />}
                {hasUnread && !isOpen && (
                    <span className="absolute -top-1 -right-1 size-4 rounded-full bg-red-500 border-2 border-background animate-bounce" />
                )}
                {!isOpen && (
                    <span className="absolute right-16 whitespace-nowrap bg-foreground text-background text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none">
                        BCA Assistant IA
                    </span>
                )}
                {!isOpen && (
                    <span className="absolute inset-0 rounded-2xl bg-primary/30 animate-ping opacity-30" />
                )}
            </button>
        </>
    );
};

export default AIChat;
