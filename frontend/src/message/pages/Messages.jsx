import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../context/useLanguage';
import { useMessages, useConversationMessages } from '../hooks/useMessageData';
import useSocket from '../../hooks/useSocket';
import { useCall } from '../../call/context/CallContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
    Search, Send, Phone, Video, MoreHorizontal,
    MessageSquare, Plus, X, Check, CheckCheck,
    Loader2, Users, ArrowLeft, Paperclip, FileIcon, ImageIcon, FilmIcon, Download,
    Package, ExternalLink
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { cn, getImageUrl } from '../../lib/utils';
import messageService from '../services/messageService';
import userService from '../../user/services/userService';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { toast } from 'sonner';
import ModalOverlay from '../../components/ui/ModalOverlay';
import ConfirmDeleteModal from '../../components/ui/ConfirmDeleteModal';
import { ROLE_LABELS } from '../../constants/roles';

// ── Composant avatar ──────────────────────────────────────────────────────────
const Avatar = ({ seed, size = 'md', online = false }) => {
    const sizes = { sm: 'size-8', md: 'size-9', lg: 'size-10' };
    return (
        <div className="relative shrink-0">
            <div className={cn('rounded-lg overflow-hidden bg-muted border border-border', sizes[size])}>
                <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed || 'default'}`}
                    alt=""
                    className="w-full h-full object-cover"
                />
            </div>
            {online && (
                <div className="absolute -bottom-0.5 -right-0.5 size-2.5 bg-emerald-500 rounded-full border-2 border-background" />
            )}
        </div>
    );
};

const formatBytes = (bytes, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const MessageBubble = ({ msg, isMe, locale }) => {
    const isFile = msg.type === 'file' || msg.type === 'image' || msg.type === 'video' || msg.type === 'audio';
    const fileUrl = msg.file_url || msg.metadata?.file_url;
    const fileName = msg.file_name || msg.metadata?.file_name || 'Fichier joint';
    const fileSize = msg.file_size || msg.metadata?.file_size;
    const product = msg.type === 'product' ? msg.metadata?.product : null;

    if (product) {
        return (
            <div className={cn('flex flex-col gap-1 max-w-[78%]', isMe ? 'ml-auto items-end' : 'items-start')}>
                <Link
                    to={product.slug ? `/shop/${product.slug}` : `/product/${product.id}`}
                    className="flex items-center gap-3 p-2.5 rounded-lg border border-border bg-card hover:border-primary/40 transition-colors w-full max-w-[280px] group"
                >
                    <div className="size-14 rounded-md overflow-hidden bg-muted shrink-0 border border-border">
                        {product.image_url ? (
                            <img src={getImageUrl(product.image_url)} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                <Package className="size-5" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-1 mb-0.5">
                            <Package className="size-3" /> Produit partagé
                        </p>
                        <p className="text-xs font-semibold text-foreground truncate">{product.nom_produit}</p>
                        {product.prix_unitaire && (
                            <p className="text-xs font-bold text-primary tabular-nums">
                                {parseFloat(product.prix_unitaire).toLocaleString('fr-GN')} GNF
                            </p>
                        )}
                    </div>
                    <ExternalLink className="size-3.5 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                {msg.contenu && (
                    <div className={cn(
                        'px-3 py-2 rounded-lg text-sm leading-snug break-words max-w-full',
                        isMe ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-muted border border-border text-foreground rounded-bl-sm',
                    )}>
                        <p>{msg.contenu}</p>
                    </div>
                )}
                <span className="text-[10px] text-muted-foreground px-0.5">
                    {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true, locale })}
                </span>
            </div>
        );
    }

    return (
        <div className={cn('flex flex-col gap-1 max-w-[72%]', isMe ? 'ml-auto items-end' : 'items-start')}>
            <div className={cn(
                'px-3 py-2 rounded-lg text-sm leading-snug break-words',
                isMe
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-muted border border-border text-foreground rounded-bl-sm',
            )}>
                {msg.type === 'image' && fileUrl && (
                    <div className="mb-2">
                        <img src={fileUrl} alt={fileName} className="max-w-full h-auto rounded-md max-h-64 object-contain" />
                    </div>
                )}
                {msg.type === 'video' && fileUrl && (
                    <div className="mb-2">
                        <video src={fileUrl} controls className="max-w-full rounded-md max-h-64 bg-black/10" />
                    </div>
                )}
                {(msg.type === 'file' || msg.type === 'audio') && fileUrl && (
                    <a href={fileUrl} target="_blank" rel="noopener noreferrer" className={cn(
                        "flex items-center gap-2 p-2 rounded-md mb-2 transition-colors",
                        isMe ? "bg-primary-foreground/10 hover:bg-primary-foreground/20" : "bg-background hover:bg-background/80"
                    )}>
                        <div className="shrink-0">
                            {msg.type === 'audio' ? <FilmIcon className="size-5" /> : <FileIcon className="size-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{fileName}</p>
                            {fileSize && <p className="text-[10px] opacity-70">{formatBytes(fileSize)}</p>}
                        </div>
                        <Download className="size-4 shrink-0 opacity-70" />
                    </a>
                )}
                {msg.contenu && (msg.contenu !== fileUrl) && <p>{msg.contenu}</p>}
            </div>
            <div className="flex items-center gap-1 px-0.5">
                <span className="text-[10px] text-muted-foreground">
                    {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true, locale })}
                </span>
                {isMe && <CheckCheck className="size-3 text-primary" />}
            </div>
        </div>
    );
};

// ── Composant item conversation ───────────────────────────────────────────────
const ConvItem = ({ conv, isActive, onClick, t, locale }) => {
    const partner = conv.participants?.[0];
    const lastDate = conv.date_dernier_message ? new Date(conv.date_dernier_message) : null;
    const preview = conv.dernier_message
        ? conv.dernier_message
        : (t('msgStartPreview') || 'Commencer à écrire…');

    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md transition-colors text-left relative',
                isActive ? 'bg-primary/10' : 'hover:bg-muted/80',
            )}
        >
            {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-primary" />}
            <Avatar seed={partner?.id} size="sm" online={!!partner} />
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <p className={cn('text-sm font-medium truncate', isActive ? 'text-primary' : 'text-foreground')}>
                        {partner?.nom_complet || t('user')}
                    </p>
                    {lastDate && (
                        <span className="text-[10px] text-muted-foreground shrink-0 tabular-nums">
                            {formatDistanceToNow(lastDate, { locale, addSuffix: false })}
                        </span>
                    )}
                </div>
                <p className={cn(
                    'text-xs truncate mt-0.5',
                    conv.dernier_message ? 'text-muted-foreground' : 'text-primary/80 italic',
                )}>
                    {preview}
                </p>
            </div>
            {conv.unread_count > 0 && (
                <span className="min-w-[16px] h-4 px-1 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center shrink-0">
                    {conv.unread_count > 9 ? '9+' : conv.unread_count}
                </span>
            )}
        </button>
    );
};

// ── Page principale ───────────────────────────────────────────────────────────
const Messages = () => {
    const { user } = useAuth();
    const { emit, on, off } = useSocket();
    const { startCall, callState } = useCall();
    const location = useLocation();
    const { lang, t } = useLanguage();
    const { data: fetchedConversations = [], loading: convLoading, refetch: refetchConversations } = useMessages();
    const [conversations, setConversations] = useState([]);
    const [selectedConv, setSelectedConv] = useState(null);
    const { data: fetchedMessages = [], refetch: refetchMessages } = useConversationMessages(selectedConv?.id);
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
    const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
    const [searchParams] = useSearchParams();
    const recipientId = searchParams.get('recipient');
    const conversationIdParam = searchParams.get('id');
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const inputRef = useRef(null);

    const [selectedFile, setSelectedFile] = useState(null);
    const onDrop = useCallback(acceptedFiles => {
        if (acceptedFiles?.length > 0) {
            setSelectedFile(acceptedFiles[0]);
        }
    }, []);
    const { getRootProps, getInputProps, isDragActive, open: openFilePicker } = useDropzone({
        onDrop,
        maxSize: 10 * 1024 * 1024,
        // Sans ça, react-dropzone attache un onClick au conteneur racine entier —
        // cliquer dans le champ texte (qui est DANS ce conteneur) ouvrait donc le
        // sélecteur de fichier à chaque fois. Le glisser-déposer reste actif sur
        // toute la barre ; le clic n'ouvre le sélecteur que via le bouton trombone.
        noClick: true,
        noKeyboard: true,
        onDropRejected: (rejections) => {
            const error = rejections[0]?.errors[0];
            if (error?.code === 'file-too-large') {
                toast.error("Le fichier est trop volumineux (max 10MB).");
            } else {
                toast.error("Fichier non supporté.");
            }
        }
    });

    // Get date-fns locale based on app language
    const dateLocale = lang === 'EN' ? enUS : fr;

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    // ── Sync React Query → state local (socket garde la priorité temps réel) ──
    useEffect(() => {
        setConversations(fetchedConversations);
        setIsLoading(convLoading);
    }, [fetchedConversations, convLoading]);

    useEffect(() => {
        if (!selectedConv?.id) {
            setMessages([]);
            return;
        }
        setMessages((prev) => {
            const fetched = Array.isArray(fetchedMessages) ? fetchedMessages : [];
            if (prev.length === 0) return fetched;
            const fetchedIds = new Set(fetched.map((m) => m.id));
            const pending = prev.filter((m) => m.temp || !fetchedIds.has(m.id));
            if (pending.length === 0) return fetched;
            return [...fetched, ...pending].sort(
                (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
            );
        });
        setTimeout(scrollToBottom, 100);
        messageService.markAsRead(selectedConv.id).catch(() => {});
    }, [selectedConv?.id, fetchedMessages, scrollToBottom]);

    // ── Socket.io setup ───────────────────────────────────────────────────────
    useEffect(() => {
        refetchConversations();

        const handleNewMessage = (data) => {
            const incoming = data?.message;
            const conversationId = data?.conversation_id;
            if (!incoming?.id || !conversationId) return;

            setConversations(prev => {
                const idx = prev.findIndex(c => c.id === conversationId);
                if (idx === -1) {
                    refetchConversations();
                    return prev;
                }
                const updated = [...prev];
                updated[idx] = {
                    ...updated[idx],
                    dernier_message: incoming.contenu,
                    date_dernier_message: incoming.createdAt,
                    unread_count: (updated[idx].unread_count || 0) + (incoming.expediteur_id === user?.id ? 0 : 1)
                };
                return [updated[idx], ...updated.filter((_, i) => i !== idx)];
            });

            setSelectedConv(current => {
                if (current?.id === conversationId) {
                    setMessages(prev => {
                        if (prev.find(m => m.id === incoming.id)) return prev;
                        return [...prev, incoming];
                    });
                    setTimeout(scrollToBottom, 100);
                    if (incoming.expediteur_id !== user?.id) {
                        messageService.markAsRead(conversationId);
                        setConversations(c => c.map(conv =>
                            conv.id === conversationId ? { ...conv, unread_count: 0 } : conv
                        ));
                    }
                }
                return current;
            });
        };

        const handleTyping = ({ conversationId, userId, isTyping }) => {
            if (userId === user?.id) return;
            setTypingUsers(prev => ({ ...prev, [conversationId]: isTyping ? userId : null }));
        };

        on('new_message', handleNewMessage);
        on('user_typing', handleTyping);

        return () => {
            off('new_message', handleNewMessage);
            off('user_typing', handleTyping);
        };
    }, [refetchConversations, scrollToBottom, user?.id, on, off]);

    // ── Rejoindre room conversation ───────────────────────────────────────────
    useEffect(() => {
        if (selectedConv?.id) {
            emit('join_conversation', selectedConv.id);
        }
    }, [selectedConv?.id, emit]);

    // ── Envoyer un message ────────────────────────────────────────────────────
    const handleSend = async (e) => {
        e?.preventDefault();
        if (!messageInput.trim() || !selectedConv || isSending) return;

        const content = messageInput.trim();
        const partner = selectedConv.participants?.[0];
        if (!content && !selectedFile) return;

        setMessageInput('');
        setIsSending(true);

        const tempMsg = {
            id: `temp-${Date.now()}`,
            contenu: content || (selectedFile ? selectedFile.name : ''),
            expediteur_id: user.id,
            createdAt: new Date().toISOString(),
            temp: true,
            type: selectedFile ? (selectedFile.type.startsWith('image/') ? 'image' : 'file') : 'text',
        };
        setMessages(prev => [...prev, tempMsg]);
        setTimeout(scrollToBottom, 50);

        try {
            const newMsg = await messageService.sendMessage({
                conversation_id: selectedConv.id,
                destinataire_id: partner?.id,
                contenu: content,
                file: selectedFile
            });
            setSelectedFile(null);
            setMessages(prev => prev.map(m => m.id === tempMsg.id ? newMsg : m));
            setConversations(prev => prev.map(c =>
                c.id === selectedConv.id
                    ? { ...c, dernier_message: content, date_dernier_message: new Date().toISOString() }
                    : c
            ));
            emit('typing', { conversationId: selectedConv.id, isTyping: false });
            refetchMessages();
            refetchConversations();
        } catch (err) {
            setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
            setMessageInput(content);
            toast.error(err?.standardized?.message || err?.response?.data?.message || t('msgSendError'));
        } finally {
            setIsSending(false);
        }
    };

    // ── Indicateur de frappe ──────────────────────────────────────────────────
    const handleTypingInput = (e) => {
        setMessageInput(e.target.value);
        if (!selectedConv) return;
        emit('typing', { conversationId: selectedConv.id, isTyping: true });
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            emit('typing', { conversationId: selectedConv.id, isTyping: false });
        }, 2000);
    };

    // ── Nouvelle conversation ─────────────────────────────────────────────────
    const loadUsers = useCallback(async (search = '') => {
        setIsLoadingUsers(true);
        try {
            const data = await userService.getPublicSearch(search);
            const list = Array.isArray(data) ? data : (data?.users || []);
            setUsers(list.filter(u => u.id !== user?.id));
        } catch (err) {
            console.error("Erreur lors de la recherche d'utilisateurs:", err);
            setUsers([]);
            toast.error(t('msgLoadUsersError'));
        } finally {
            setIsLoadingUsers(false);
        }
    }, [user?.id, t]);

    useEffect(() => {
        if (!showNewConv) return undefined;
        setIsLoadingUsers(true);
        const timer = setTimeout(() => loadUsers(userSearch.trim()), userSearch.trim() ? 300 : 0);
        return () => clearTimeout(timer);
    }, [showNewConv, userSearch, loadUsers]);

    const openNewConversationModal = () => {
        setUserSearch('');
        setUsers([]);
        setIsLoadingUsers(true);
        setShowNewConv(true);
    };

    const handleStartConversation = async (targetUser) => {
        try {
            const conv = await messageService.startConversation(targetUser.id);
            setShowNewConv(false);
            setUserSearch('');
            await refetchConversations();
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

    // ── Conversation passée depuis ProductCard / ProductDetails ─────────────
    useEffect(() => {
        const openConv = location.state?.openConversation;
        if (!openConv?.id) return;
        setSelectedConv(openConv);
        setConversations((prev) => (prev.some((c) => c.id === openConv.id) ? prev : [openConv, ...prev]));
        setMobileShowChat(true);
    }, [location.state]);

    // ── Ouvrir une conversation via ?id= ─────────────────────────────────────
    useEffect(() => {
        if (!conversationIdParam || selectedConv?.id === conversationIdParam) return;
        const target = conversations.find((c) => c.id === conversationIdParam);
        if (target) {
            setSelectedConv(target);
            setMobileShowChat(true);
        } else if (!isLoading) {
            setSelectedConv({ id: conversationIdParam, participants: [] });
            setMobileShowChat(true);
            refetchConversations();
        }
    }, [conversationIdParam, conversations, isLoading, selectedConv?.id, refetchConversations]);

    // ── Gestion automatique du destinataire via URL ───────────────────────────
    useEffect(() => {
        const checkRecipient = async () => {
            if (!recipientId || !user?.id || isLoading) return;

            // Chercher dans les conversations existantes
            const existing = conversations.find(c =>
                c.participants?.some(p => p.id === recipientId)
            );

            if (existing) {
                if (selectedConv?.id !== existing.id) {
                    setSelectedConv(existing);
                    setMobileShowChat(true);
                }
            } else {
                // Créer une nouvelle conversation
                try {
                    const newConv = await messageService.startConversation(recipientId);
                    await refetchConversations();
                    setSelectedConv(newConv);
                    setMobileShowChat(true);
                } catch (err) {
                    console.error("Impossible de démarrer la conversation avec le destinataire:", err);
                    toast.error('Impossible de démarrer la conversation.');
                }
            }
        };

        checkRecipient();
    }, [recipientId, conversations, isLoading, user?.id, selectedConv?.id, refetchConversations]);

    const handleSelectConv = (conv) => {
        setSelectedConv(conv);
        setMobileShowChat(true);
        setConversations(prev => prev.map(c =>
            c.id === conv.id ? { ...c, unread_count: 0 } : c
        ));
    };

    // Sélection auto de la 1ère conversation sur grand écran
    useEffect(() => {
        if (recipientId || conversationIdParam || selectedConv || isLoading || conversations.length === 0) return;
        if (typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches) {
            setSelectedConv(conversations[0]);
        }
    }, [conversations, isLoading, recipientId, conversationIdParam, selectedConv]);

    const filteredConvs = conversations.filter(c =>
        c.participants?.[0]?.nom_complet?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const partner = selectedConv?.participants?.[0];
    const isTyping = selectedConv && typingUsers[selectedConv.id];
    const totalUnread = conversations.reduce((acc, c) => acc + (c.unread_count || 0), 0);

    const [showDeleteConvConfirm, setShowDeleteConvConfirm] = useState(false);

    const handleDeleteConversation = () => {
        if (!selectedConv) return;
        setIsActionMenuOpen(false);
        setShowDeleteConvConfirm(true);
    };

    const confirmDeleteConversation = async (confirmationText) => {
        try {
            await messageService.deleteConversation(selectedConv.id, confirmationText);
            setConversations(prev => prev.filter(c => c.id !== selectedConv.id));
            setSelectedConv(null);
            setMobileShowChat(false);
            setShowDeleteConvConfirm(false);
            toast.success('Conversation supprimée.');
        } catch {
            toast.error('Impossible de supprimer la conversation.');
        }
    };

    const handleBlockUser = async () => {
        if (!selectedConv) return;
        setIsActionMenuOpen(false);
        if (!window.confirm(`Bloquer ${partner?.nom_complet || 'cet utilisateur'} ? Vous ne pourrez plus échanger de messages.`)) return;
        try {
            await messageService.blockUser(selectedConv.id);
            toast.success('Utilisateur bloqué.');
        } catch {
            toast.error('Impossible de bloquer cet utilisateur.');
        }
    };

    return (
        <DashboardLayout title={t('msgTitle')} noFooter noPadding>
            <div className="bca-messenger-page">
                <div className="bca-messenger-shell">

                {/* ── Liste conversations ── */}
                <aside className={cn(
                    'flex flex-col border-r border-border bg-card shrink-0 min-h-0',
                    'w-full lg:w-[272px]',
                    mobileShowChat ? 'hidden lg:flex' : 'flex',
                )}>
                    <div className="h-11 px-3 border-b border-border flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2 min-w-0">
                            <MessageSquare className="size-4 text-primary shrink-0" />
                            <div className="min-w-0">
                                <h2 className="text-sm font-semibold text-foreground leading-none">{t('msgTitle')}</h2>
                                <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                                    {filteredConvs.length} conversation{filteredConvs.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={openNewConversationModal}
                            className="size-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 shrink-0"
                            title={t('msgNewMessage')}
                        >
                            <Plus className="size-4" />
                        </button>
                    </div>

                    <div className="px-2 py-2 border-b border-border shrink-0">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                            <input
                                className="w-full h-8 pl-8 pr-2 text-sm bg-muted/50 border border-border rounded-md text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50"
                                placeholder={t('msgSearchPlaceholder')}
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar">
                        {isLoading ? (
                            <div className="py-12 flex flex-col items-center gap-3">
                                <Loader2 className="size-6 text-primary animate-spin" />
                                <p className="text-xs text-muted-foreground">{t('loading')}...</p>
                            </div>
                        ) : filteredConvs.length === 0 ? (
                            <div className="py-12 flex flex-col items-center gap-3 text-center px-4">
                                <MessageSquare className="size-8 text-muted-foreground/30" />
                                <div>
                                    <p className="text-sm font-semibold text-foreground">{t('msgNoConvTitle')}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{t('msgNoConvDesc')}</p>
                                </div>
                                <button
                                    onClick={openNewConversationModal}
                                    className="h-8 px-4 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors flex items-center gap-1.5"
                                >
                                    <Plus className="size-3.5" /> {t('msgNewMessage')}
                                </button>
                            </div>
                        ) : filteredConvs.map(conv => (
                            <ConvItem
                                key={conv.id}
                                conv={conv}
                                isActive={selectedConv?.id === conv.id}
                                onClick={() => handleSelectConv(conv)}
                                t={t}
                                locale={dateLocale}
                            />
                        ))}
                    </div>
                </aside>

                {/* ── Zone de chat ── */}
                <main className={cn(
                    'flex flex-col flex-1 min-h-0 min-w-0 bg-background',
                    mobileShowChat ? 'flex' : 'hidden lg:flex',
                )}>
                    {selectedConv ? (
                        <>
                            <header className="h-11 flex items-center justify-between px-3 border-b border-border bg-card shrink-0">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <button
                                        type="button"
                                        onClick={() => setMobileShowChat(false)}
                                        className="lg:hidden size-8 rounded-md bg-muted flex items-center justify-center shrink-0"
                                    >
                                        <ArrowLeft className="size-4" />
                                    </button>
                                    <Avatar seed={partner?.id} size="sm" online />
                                    <div className="min-w-0">
                                        <h3 className="text-sm font-semibold text-foreground truncate">
                                            {partner?.nom_complet || 'Utilisateur'}
                                        </h3>
                                        <p className="text-[10px] text-muted-foreground truncate">
                                            {ROLE_LABELS[partner?.role] || t('msgOnline')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => partner?.id && startCall({ id: partner.id, name: partner.nom_complet }, selectedConv.id, 'audio')}
                                        disabled={!partner?.id || callState !== 'idle'}
                                        className="size-8 rounded-md bg-muted border border-border text-muted-foreground hover:text-foreground flex items-center justify-center disabled:opacity-40"
                                        title="Appel audio"
                                    >
                                        <Phone className="size-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => partner?.id && startCall({ id: partner.id, name: partner.nom_complet }, selectedConv.id, 'video')}
                                        disabled={!partner?.id || callState !== 'idle'}
                                        className="size-8 rounded-md bg-muted border border-border text-muted-foreground hover:text-foreground flex items-center justify-center disabled:opacity-40"
                                        title="Appel vidéo"
                                    >
                                        <Video className="size-4" />
                                    </button>
                                <div className="relative shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => setIsActionMenuOpen(p => !p)}
                                        className="size-8 rounded-md bg-muted border border-border text-muted-foreground hover:text-foreground flex items-center justify-center"
                                    >
                                        <MoreHorizontal className="size-4" />
                                    </button>
                                    {isActionMenuOpen && (
                                        <div className="absolute right-0 top-9 z-20 w-48 bg-card border border-border rounded-lg shadow-lg overflow-hidden py-1">
                                            <button
                                                type="button"
                                                onClick={handleDeleteConversation}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors text-left"
                                            >
                                                <X className="size-4" />
                                                Supprimer la conversation
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleBlockUser}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-600 hover:bg-muted transition-colors text-left"
                                            >
                                                <Users className="size-4" />
                                                Bloquer l'utilisateur
                                            </button>
                                        </div>
                                    )}
                                </div>
                                </div>
                            </header>

                            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 custom-scrollbar bg-background">
                                {messages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center gap-2 text-center px-4 py-8">
                                        <MessageSquare className="size-10 text-primary/70" />
                                        <p className="text-sm font-medium text-foreground">
                                            {t('msgStartChat') || 'Démarrez la discussion'}
                                        </p>
                                        <p className="text-xs text-muted-foreground max-w-[280px]">
                                            {t('msgStartWith', { name: partner?.nom_complet || 'ce contact' })}
                                        </p>
                                    </div>
                                ) : (
                                    messages.map(msg => (
                                        <MessageBubble
                                            key={msg.id}
                                            msg={msg}
                                            isMe={msg.expediteur_id === user?.id}
                                            locale={dateLocale}
                                        />
                                    ))
                                )}
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

                            <form onSubmit={handleSend} className="px-3 py-2.5 border-t border-border bg-card shrink-0">
                                {selectedFile && (
                                    <div className="flex items-center justify-between p-2 mb-2 bg-muted rounded-md text-sm border border-border">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            {selectedFile.type.startsWith('image/') ? (
                                                <div className="size-8 rounded overflow-hidden shrink-0">
                                                    <img src={URL.createObjectURL(selectedFile)} alt="" className="w-full h-full object-cover" />
                                                </div>
                                            ) : (
                                                <FileIcon className="size-4 shrink-0 text-muted-foreground" />
                                            )}
                                            <div className="min-w-0">
                                                <p className="truncate text-foreground font-medium text-xs">{selectedFile.name}</p>
                                                <p className="text-[10px] text-muted-foreground">{formatBytes(selectedFile.size)}</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedFile(null)}
                                            className="p-1 hover:bg-background rounded text-muted-foreground hover:text-foreground"
                                        >
                                            <X className="size-4" />
                                        </button>
                                    </div>
                                )}
                                <div 
                                    {...getRootProps()} 
                                    className={cn(
                                        "flex items-center gap-2 bg-muted/40 border rounded-md px-3 py-1.5 focus-within:border-primary/50 focus-within:bg-background transition-colors",
                                        isDragActive ? "border-primary bg-primary/5" : "border-border"
                                    )}
                                >
                                    <input {...getInputProps()} />
                                    <button
                                        type="button"
                                        onClick={openFilePicker}
                                        className="shrink-0 size-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background rounded-md transition-colors"
                                        title="Joindre un fichier"
                                    >
                                        <Paperclip className="size-4" />
                                    </button>
                                    <input
                                        ref={inputRef}
                                        className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                                        placeholder={isDragActive ? "Déposez le fichier ici..." : t('msgInputPlaceholder', { name: partner?.nom_complet || '' })}
                                        value={messageInput}
                                        onChange={handleTypingInput}
                                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) handleSend(e); }}
                                    />
                                    <button
                                        type="submit"
                                        disabled={(!messageInput.trim() && !selectedFile) || isSending}
                                        className="size-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 disabled:opacity-40 shrink-0"
                                    >
                                        {isSending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                                    </button>
                                </div>
                                <p className="text-[10px] text-muted-foreground text-center mt-1.5">{t('msgEnterToSend')}</p>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-6 bg-background">
                            <MessageSquare className="size-10 text-primary/70" />
                            <p className="text-sm font-medium text-foreground">{t('msgSelectConv')}</p>
                            <button
                                type="button"
                                onClick={openNewConversationModal}
                                className="h-9 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 flex items-center gap-2"
                            >
                                <Plus className="size-4" /> {t('msgNewMessage')}
                            </button>
                        </div>
                    )}
                </main>
                </div>
            </div>

            <ModalOverlay
                open={showNewConv}
                onClose={() => { setShowNewConv(false); setUserSearch(''); }}
                title={t('msgNewMessage')}
                maxWidth="max-w-md"
            >
                <div className="px-6 pb-6 space-y-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <input
                            autoFocus
                            className="w-full h-10 pl-9 pr-3 bg-background border border-border rounded-xl text-sm outline-none focus:border-primary/50 transition-all text-foreground placeholder:text-muted-foreground"
                            placeholder={t('msgSearchUser')}
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1 max-h-64 overflow-y-auto scrollbar-none">
                        {isLoadingUsers ? (
                            <div className="py-8 flex justify-center">
                                <Loader2 className="size-5 text-primary animate-spin" />
                            </div>
                        ) : users.length === 0 ? (
                            <div className="py-8 text-center">
                                <p className="text-sm text-muted-foreground">{t('noResults')}</p>
                            </div>
                        ) : users.map((u) => (
                            <button
                                key={u.id}
                                type="button"
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
            </ModalOverlay>

            <ConfirmDeleteModal
                open={showDeleteConvConfirm}
                onClose={() => setShowDeleteConvConfirm(false)}
                itemName={partner?.nom_complet || 'cette conversation'}
                itemLabel="cette conversation"
                description="La conversation disparaîtra de votre liste. Elle reste accessible à l'autre participant."
                onConfirm={confirmDeleteConversation}
            />
        </DashboardLayout>
    );
};

export default Messages;
